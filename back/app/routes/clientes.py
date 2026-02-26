from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

# Importamos la configuración de BBDD y el modelo
from app.database import get_db
from app.models.cliente import Cliente

# Prefijo y Tags para que la documentación sea ordenada
router = APIRouter(prefix="/api/clientes", tags=["Clientes"])

# ==========================================
# 1. ESQUEMAS PYDANTIC (Datos que viajan Front <-> Back)
# ==========================================
class ClienteBase(BaseModel):
    nombre: str
    cif: str
    contacto: Optional[str] = None
    direccion: Optional[str] = None
    estado: str = "Activo"

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    nombre: Optional[str] = None
    cif: Optional[str] = None
    contacto: Optional[str] = None
    direccion: Optional[str] = None
    estado: Optional[str] = None

class ClienteResponse(ClienteBase):
    id: int # El ID es numérico y autoincremental en nuestra BBDD
    
    class Config:
        from_attributes = True

# ==========================================
# 2. RUTAS (ENDPOINTS)
# ==========================================

# LISTAR CLIENTES
@router.get("/", response_model=List[ClienteResponse])
def listar_clientes(db: Session = Depends(get_db)):
    # Traemos todos. El filtrado ya lo haces tú en el Frontend por Javascript.
    return db.query(Cliente).all()


# CREAR CLIENTE
@router.post("/", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def crear_cliente(payload: ClienteCreate, db: Session = Depends(get_db)):
    # Normalización de datos
    cif_limpio = payload.cif.upper().strip()
    nombre_limpio = payload.nombre.strip()

    # 1. Validar que no exista el CIF
    cliente_existente = db.query(Cliente).filter(Cliente.cif == cif_limpio).first()
    if cliente_existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail=f"Ya existe un cliente con el CIF {cif_limpio}"
        )

    # 2. Crear objeto Modelo
    nuevo_cliente = Cliente(
        nombre=nombre_limpio,
        cif=cif_limpio,
        contacto=payload.contacto,
        direccion=payload.direccion,
        estado=payload.estado
    )

    # 3. Guardar en BBDD
    db.add(nuevo_cliente)
    db.commit()
    db.refresh(nuevo_cliente)
    
    return nuevo_cliente


# EDITAR CLIENTE
@router.put("/{cliente_id}", response_model=ClienteResponse)
def editar_cliente(cliente_id: int, payload: ClienteUpdate, db: Session = Depends(get_db)):
    # Buscar cliente por ID
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Si se intenta cambiar el CIF, verificar que el nuevo no esté ocupado
    if payload.cif:
        cif_nuevo = payload.cif.upper().strip()
        if cif_nuevo != cliente.cif:
            otro_cliente = db.query(Cliente).filter(Cliente.cif == cif_nuevo).first()
            if otro_cliente:
                raise HTTPException(status_code=409, detail="El nuevo CIF ya pertenece a otro cliente")
            cliente.cif = cif_nuevo

    # Actualizar resto de campos si vienen en el payload
    if payload.nombre is not None:
        cliente.nombre = payload.nombre.strip()
    if payload.contacto is not None:
        cliente.contacto = payload.contacto
    if payload.direccion is not None:
        cliente.direccion = payload.direccion
    if payload.estado is not None:
        cliente.estado = payload.estado

    db.commit()
    db.refresh(cliente)
    return cliente


# ARCHIVAR CLIENTE (Soft Delete)
@router.patch("/{cliente_id}/archivar")
def archivar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # En lugar de borrar (db.delete), cambiamos estado a Inactivo
    cliente.estado = "Inactivo"
    db.commit()
    
    return {"mensaje": "Cliente archivado correctamente"}