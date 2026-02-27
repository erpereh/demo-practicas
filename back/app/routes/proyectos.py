# app/routes/proyectos.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, func
from app.models.proyecto import Proyecto
from app.schemas.proyecto import ProyectoCreate, ProyectoUpdate, ProyectoOut
from app.database import get_db

router = APIRouter(prefix="/api/proyectos", tags=["Proyectos"])

# LISTAR PROYECTOS
@router.get("/", response_model=list[ProyectoOut])
def listar_proyectos(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None, description="Buscar por nombre, ID proyecto o código tracker (opcional)"),
    id_sociedad: str | None = Query(default=None, description="Filtrar por sociedad (opcional)"),
    id_cliente: str | None = Query(default=None, description="Filtrar por cliente (opcional)"),
):
    stmt = select(Proyecto)

    if id_sociedad:
        stmt = stmt.where(Proyecto.id_sociedad == id_sociedad.strip().upper())

    if id_cliente:
        stmt = stmt.where(Proyecto.id_cliente == id_cliente.strip().upper())

    if q:
        s = f"%{q.strip().upper()}%"
        stmt = stmt.where(
            or_(
                func.upper(Proyecto.id_proyecto).like(s),
                func.upper(Proyecto.nombre_proyecto).like(s),
                func.upper(Proyecto.codigo_proyecto_tracker).like(s),
            )
        )

    stmt = stmt.order_by(Proyecto.nombre_proyecto.asc())
    return db.execute(stmt).scalars().all()

# CREAR PROYECTO
@router.post("/", response_model=ProyectoOut, status_code=status.HTTP_201_CREATED)
def crear_proyecto(payload: ProyectoCreate, db: Session = Depends(get_db)):
    existing = db.execute(
        select(Proyecto).where(Proyecto.id_proyecto == payload.id_proyecto)
    ).scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un proyecto con ese ID_PROYECTO"
        )

    dup_tracker = db.execute(
        select(Proyecto).where(
            Proyecto.id_sociedad == payload.id_sociedad,
            Proyecto.codigo_proyecto_tracker == payload.codigo_proyecto_tracker
        )
    ).scalar_one_or_none()

    if dup_tracker:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un proyecto con ese código tracker en esa sociedad"
        )

    nuevo = Proyecto(
        id_sociedad=payload.id_sociedad,
        id_proyecto=payload.id_proyecto,
        id_cliente=payload.id_cliente,
        nombre_proyecto=payload.nombre_proyecto,
        codigo_proyecto_tracker=payload.codigo_proyecto_tracker,
        tipo_pago=payload.tipo_pago,
        precio=payload.precio,
        fec_inicio=payload.fec_inicio,
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

# EDITAR PROYECTO
@router.put("/{id_proyecto}", response_model=ProyectoOut)
def editar_proyecto(id_proyecto: str, payload: ProyectoUpdate, db: Session = Depends(get_db)):
    id_proyecto = id_proyecto.strip().upper()

    proyecto = db.execute(
        select(Proyecto).where(Proyecto.id_proyecto == id_proyecto)
    ).scalar_one_or_none()

    if not proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    if payload.codigo_proyecto_tracker and payload.codigo_proyecto_tracker != proyecto.codigo_proyecto_tracker:
        dup_tracker = db.execute(
            select(Proyecto).where(
                Proyecto.id_sociedad == proyecto.id_sociedad,
                Proyecto.codigo_proyecto_tracker == payload.codigo_proyecto_tracker
            )
        ).scalar_one_or_none()
        if dup_tracker:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ese código tracker ya existe en esa sociedad"
            )

    if payload.nombre_proyecto is not None:
        proyecto.nombre_proyecto = payload.nombre_proyecto
    if payload.codigo_proyecto_tracker is not None:
        proyecto.codigo_proyecto_tracker = payload.codigo_proyecto_tracker
    if payload.tipo_pago is not None:
        proyecto.tipo_pago = payload.tipo_pago
    if payload.precio is not None:
        proyecto.precio = payload.precio
    if payload.fec_inicio is not None:
        proyecto.fec_inicio = payload.fec_inicio

    db.commit()
    db.refresh(proyecto)
    return proyecto

# ELIMINAR PROYECTO
@router.delete("/{id_proyecto}", status_code=status.HTTP_200_OK)
def eliminar_proyecto(id_proyecto: str, db: Session = Depends(get_db)):
    id_proyecto = id_proyecto.strip().upper()

    proyecto = db.execute(
        select(Proyecto).where(Proyecto.id_proyecto == id_proyecto)
    ).scalar_one_or_none()

    if not proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    db.delete(proyecto)
    db.commit()
    return {"mensaje": "Proyecto eliminado correctamente"}