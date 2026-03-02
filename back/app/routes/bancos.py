"""
Router encargado de la gestión de cuentas bancarias (tabla BANCOS).

Responsabilidades:
- Listar cuentas bancarias registradas.
- Crear nuevas cuentas validando PK e IBAN por sociedad.
- Editar datos existentes con control de duplicidad.
- Archivar cuentas (eliminación física, ya que no existe campo estado).

Notas de diseño:
- Se utiliza SQLAlchemy Core (select) junto con ORM.
- Se validan conflictos antes de realizar commit.
- No existe soft-delete; archivar = delete real.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models.banco import Banco
from app.schemas.banco import BancoCreate, BancoUpdate, BancoOut

router = APIRouter(prefix="/api/bancos", tags=["Bancos"])


@router.get("/", response_model=list[BancoOut])
def listar_bancos(db: Session = Depends(get_db)):
    """
    Devuelve todas las cuentas bancarias registradas.
    """
    return db.execute(select(Banco)).scalars().all()


@router.post("/", response_model=BancoOut, status_code=status.HTTP_201_CREATED)
def crear_banco(payload: BancoCreate, db: Session = Depends(get_db)):
    """
    Crea una nueva cuenta bancaria.

    Validaciones:
    - ID_BANCO_COBRO no puede estar duplicado (PK).
    - No puede existir mismo IBAN dentro de la misma sociedad.
    """

    # Validación PK duplicada
    existe = db.execute(
        select(Banco).where(Banco.id_banco_cobro == payload.id_banco_cobro)
    ).scalar_one_or_none()

    if existe:
        raise HTTPException(
            status_code=409,
            detail="Ya existe un banco con ese ID_BANCO_COBRO"
        )

    # Validación IBAN duplicado por sociedad
    if payload.codigo_iban:
        dup = db.execute(
            select(Banco).where(
                Banco.id_sociedad == payload.id_sociedad,
                Banco.codigo_iban == payload.codigo_iban
            )
        ).scalar_one_or_none()

        if dup:
            raise HTTPException(
                status_code=409,
                detail="Ya existe una cuenta con ese IBAN en esa sociedad"
            )

    nuevo = Banco(**payload.model_dump())

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return nuevo

@router.put("/{id_banco_cobro}", response_model=BancoOut)
def editar_banco(id_banco_cobro: str, payload: BancoUpdate, db: Session = Depends(get_db)):
    id_banco_cobro = id_banco_cobro.upper().strip()

    banco = db.execute(
        select(Banco).where(Banco.id_banco_cobro == id_banco_cobro)
    ).scalar_one_or_none()

    if not banco:
        raise HTTPException(status_code=404, detail="Cuenta bancaria no encontrada")

    if payload.codigo_iban is not None and payload.codigo_iban != banco.codigo_iban:
        if payload.codigo_iban:
            dup = db.execute(
                select(Banco).where(
                    Banco.id_sociedad == banco.id_sociedad,
                    Banco.codigo_iban == payload.codigo_iban
                )
            ).scalar_one_or_none()
            if dup:
                raise HTTPException(status_code=409, detail="Ese IBAN ya existe en esa sociedad")
        banco.codigo_iban = payload.codigo_iban

    if payload.n_banco_cobro is not None:
        banco.n_banco_cobro = payload.n_banco_cobro
    if payload.num_cuenta is not None:
        banco.num_cuenta = payload.num_cuenta

    db.commit()
    db.refresh(banco)
    return banco

@router.patch("/{id_banco_cobro}/archivar")
def archivar_banco(id_banco_cobro: str, db: Session = Depends(get_db)):
    """
    La tabla BANCOS no tiene ESTADO: archivar = eliminar registro.
    """
    id_banco_cobro = id_banco_cobro.upper().strip()

    banco = db.execute(
        select(Banco).where(Banco.id_banco_cobro == id_banco_cobro)
    ).scalar_one_or_none()

    if not banco:
        raise HTTPException(status_code=404, detail="Cuenta bancaria no encontrada")

    db.delete(banco)
    db.commit()
    return {"mensaje": "Cuenta bancaria archivada (eliminada) correctamente"}