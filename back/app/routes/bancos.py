import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.database import get_db
from app.models.banco import Banco

router = APIRouter(prefix="/api/bancos", tags=["Bancos"])

# ==========================================
# 1. UTILIDADES DE VALIDACIÓN (Adaptadas)
# ==========================================
def validar_y_limpiar_iban(iban: str) -> str:
    # Limpiar espacios y pasar a mayúsculas
    iban_limpio = iban.replace(" ", "").upper()
    
    # Validación básica de formato (Regex genérico para IBAN)
    if not re.match(r"^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$", iban_limpio):
        raise HTTPException(
            status_code=400, 
            detail="El formato del IBAN es inválido. Debe empezar por 2 letras y seguir con dígitos."
        )
    
    # Validación específica España (24 caracteres)
    if iban_limpio.startswith("ES") and len(iban_limpio) != 24:
        raise HTTPException(
            status_code=400, 
            detail="Un IBAN español debe tener exactamente 24 caracteres."
        )
        
    return iban_limpio

# ==========================================
# 2. ESQUEMAS PYDANTIC
# ==========================================
class BancoBase(BaseModel):
    entidad: str
    iban: str
    estado: str = "Principal"

class BancoCreate(BancoBase):
    pass

class BancoUpdate(BaseModel):
    entidad: Optional[str] = None
    iban: Optional[str] = None
    estado: Optional[str] = None

class BancoResponse(BancoBase):
    id: int
    
    class Config:
        from_attributes = True

# ==========================================
# 3. ENDPOINTS
# ==========================================

# LISTAR BANCOS
@router.get("/", response_model=List[BancoResponse])
def listar_bancos(db: Session = Depends(get_db)):
    return db.query(Banco).all()


# CREAR BANCO
@router.post("/", response_model=BancoResponse, status_code=status.HTTP_201_CREATED)
def crear_banco(payload: BancoCreate, db: Session = Depends(get_db)):
    # 1. Validar formato IBAN
    iban_limpio = validar_y_limpiar_iban(payload.iban)

    # 2. Validar que no exista ya en BBDD
    banco_existente = db.query(Banco).filter(Banco.iban == iban_limpio).first()
    if banco_existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="Ya existe una cuenta bancaria registrada con ese IBAN."
        )

    # 3. Guardar
    nuevo_banco = Banco(
        entidad=payload.entidad.strip(),
        iban=iban_limpio,
        estado=payload.estado
    )
    
    db.add(nuevo_banco)
    db.commit()
    db.refresh(nuevo_banco)
    
    return nuevo_banco


# EDITAR BANCO
@router.put("/{banco_id}", response_model=BancoResponse)
def editar_banco(banco_id: int, payload: BancoUpdate, db: Session = Depends(get_db)):
    banco = db.query(Banco).filter(Banco.id == banco_id).first()

    if not banco:
        raise HTTPException(status_code=404, detail="Cuenta bancaria no encontrada")

    # Si cambia el IBAN, validamos formato y duplicados
    if payload.iban:
        iban_nuevo = validar_y_limpiar_iban(payload.iban)
        if iban_nuevo != banco.iban:
            otro = db.query(Banco).filter(Banco.iban == iban_nuevo).first()
            if otro:
                raise HTTPException(status_code=409, detail="El nuevo IBAN ya está registrado en otra cuenta.")
            banco.iban = iban_nuevo

    if payload.entidad is not None:
        banco.entidad = payload.entidad.strip()
    
    if payload.estado is not None:
        banco.estado = payload.estado

    db.commit()
    db.refresh(banco)
    return banco


# ARCHIVAR BANCO (Soft Delete)
@router.patch("/{banco_id}/archivar")
def archivar_banco(banco_id: int, db: Session = Depends(get_db)):
    banco = db.query(Banco).filter(Banco.id == banco_id).first()

    if not banco:
        raise HTTPException(status_code=404, detail="Cuenta bancaria no encontrada")

    # Cambiamos estado a "Inactiva" o "Archivada"
    banco.estado = "Archivada"
    db.commit()

    return {"mensaje": "Cuenta bancaria archivada correctamente"}