# app/routes/clientes.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, func

from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteOut

from app.database import Base
from app.database import get_db

router = APIRouter()

@router.get("/clientes", response_model=list[ClienteOut])
def listar_clientes(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None, description="Buscar por nombre o CIF (opcional)"),
    id_sociedad: str | None = Query(default=None, description="Filtrar por sociedad (opcional)"),
):
    stmt = select(Cliente)

    if id_sociedad:
        stmt = stmt.where(Cliente.id_sociedad == id_sociedad.upper())

    if q:
        s = f"%{q.strip().upper()}%"
        stmt = stmt.where(
            or_(
                func.upper(Cliente.n_cliente).like(s),
                func.upper(Cliente.cif).like(s),
                func.upper(Cliente.id_cliente).like(s),
            )
        )

    stmt = stmt.order_by(Cliente.n_cliente.asc())
    return db.execute(stmt).scalars().all()


@router.post("/clientes", response_model=ClienteOut, status_code=status.HTTP_201_CREATED)
def crear_cliente(payload: ClienteCreate, db: Session = Depends(get_db)):
    # PK: ID_CLIENTE (según enunciado)
    existing = db.execute(
        select(Cliente).where(Cliente.id_cliente == payload.id_cliente)
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya existe un cliente con ese código (ID_CLIENTE)")

    # Extra útil sin tocar BBDD: evitar duplicar CIF dentro de la sociedad
    dup_cif = db.execute(
        select(Cliente).where(
            Cliente.id_sociedad == payload.id_sociedad,
            Cliente.cif == payload.cif
        )
    ).scalar_one_or_none()
    if dup_cif:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya existe un cliente con ese CIF en esa sociedad")

    nuevo = Cliente(
        id_sociedad=payload.id_sociedad,
        id_cliente=payload.id_cliente,
        n_cliente=payload.n_cliente,
        cif=payload.cif,
        persona_contacto=payload.persona_contacto,
        direccion=payload.direccion
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/clientes/{id_cliente}", response_model=ClienteOut)
def editar_cliente(id_cliente: str, payload: ClienteUpdate, db: Session = Depends(get_db)):
    id_cliente = id_cliente.upper()

    cliente = db.execute(
        select(Cliente).where(Cliente.id_cliente == id_cliente)
    ).scalar_one_or_none()

    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado")

    # Si cambia CIF, evitar duplicado en misma sociedad
    if payload.cif and payload.cif != cliente.cif:
        dup_cif = db.execute(
            select(Cliente).where(
                Cliente.id_sociedad == cliente.id_sociedad,
                Cliente.cif == payload.cif
            )
        ).scalar_one_or_none()
        if dup_cif:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ese CIF ya existe en esa sociedad")

    if payload.n_cliente is not None:
        cliente.n_cliente = payload.n_cliente
    if payload.cif is not None:
        cliente.cif = payload.cif
    if payload.persona_contacto is not None:
        cliente.persona_contacto = payload.persona_contacto
    if payload.direccion is not None:
        cliente.direccion = payload.direccion

    db.commit()
    db.refresh(cliente)
    return cliente


@router.patch("/clientes/{id_cliente}/archivar")
def archivar_cliente(id_cliente: str, db: Session = Depends(get_db)):
    """
    Enunciado pide "archivar". Como la BBDD NO tiene columna ACTIVO/ESTADO y no quieres modificarla,
    aquí "archivar" se implementa como eliminar el registro (desaparece del listado).
    """
    id_cliente = id_cliente.upper()

    cliente = db.execute(
        select(Cliente).where(Cliente.id_cliente == id_cliente)
    ).scalar_one_or_none()

    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado")

    db.delete(cliente)
    db.commit()
    return {"mensaje": "Cliente archivado (eliminado de la base de datos)"}