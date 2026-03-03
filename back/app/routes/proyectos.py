"""
Router de gestión de Proyectos.

Implementa operaciones CRUD completas sobre la entidad Proyecto,
incluyendo enriquecimiento con información del Cliente asociado.

Prefijo: /api/proyectos
Tag OpenAPI: Proyectos
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, func

from app.models.proyecto import Proyecto
from app.models.cliente import Cliente
from app.schemas.proyecto import ProyectoCreate, ProyectoUpdate, ProyectoOut
from app.database import get_db

router = APIRouter(
    prefix="/api/proyectos",
    tags=["Proyectos"]
)


# ============================================================
# FUNCIÓN PRIVADA: ENRIQUECER PROYECTOS
# ============================================================

def _enriquecer(proyectos: list[Proyecto], db: Session) -> list[dict]:
    """
    Enriquece la lista de proyectos con información básica del cliente.

    Estrategia:
        - Se extraen todos los id_cliente únicos.
        - Se realiza una única consulta para obtener los clientes.
        - Se construye un diccionario id_cliente → Cliente.
        - Se añade al resultado un objeto cliente reducido.

    Evita el problema N+1 queries.

    Returns:
        list[dict]
    """

    ids = {p.id_cliente for p in proyectos if p.id_cliente}
    clientes_map: dict[str, Cliente] = {}

    if ids:
        rows = db.execute(
            select(Cliente).where(Cliente.id_cliente.in_(ids))
        ).scalars().all()

        clientes_map = {c.id_cliente: c for c in rows}

    result = []

    for p in proyectos:
        d = {
            "id_sociedad": p.id_sociedad,
            "id_proyecto": p.id_proyecto,
            "id_cliente": p.id_cliente,
            "nombre_proyecto": p.nombre_proyecto,
            "codigo_proyecto_tracker": p.codigo_proyecto_tracker,
            "tipo_pago": p.tipo_pago,
            "precio": p.precio,
            "fec_inicio": p.fec_inicio,
            "cliente": None,
        }

        if p.id_cliente and p.id_cliente in clientes_map:
            c = clientes_map[p.id_cliente]
            d["cliente"] = {
                "id_cliente": c.id_cliente,
                "n_cliente": c.n_cliente
            }

        result.append(d)

    return result


# ============================================================
# LISTAR PROYECTOS
# ============================================================

@router.get("/", response_model=list[ProyectoOut])
def listar_proyectos(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None),
    id_sociedad: str | None = Query(default=None),
    id_cliente: str | None = Query(default=None),
):
    """
    Recupera proyectos con filtros opcionales.

    Filtros:
        - id_sociedad
        - id_cliente
        - q (búsqueda libre sobre id, nombre o tracker)

    Búsqueda case-insensitive mediante UPPER + LIKE.
    Ordenación alfabética por nombre_proyecto.
    """

    stmt = select(Proyecto)

    if id_sociedad:
        stmt = stmt.where(
            Proyecto.id_sociedad == id_sociedad.strip().upper()
        )

    if id_cliente:
        stmt = stmt.where(
            Proyecto.id_cliente == id_cliente.strip().upper()
        )

    if q:
        s = f"%{q.strip().upper()}%"
        stmt = stmt.where(or_(
            func.upper(Proyecto.id_proyecto).like(s),
            func.upper(Proyecto.nombre_proyecto).like(s),
            func.upper(Proyecto.codigo_proyecto_tracker).like(s),
        ))

    stmt = stmt.order_by(Proyecto.nombre_proyecto.asc())

    proyectos = db.execute(stmt).scalars().all()

    return _enriquecer(proyectos, db)


# ============================================================
# CREAR PROYECTO
# ============================================================

@router.post(
    "/",
    response_model=ProyectoOut,
    status_code=status.HTTP_201_CREATED
)
def crear_proyecto(payload: ProyectoCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo proyecto.

    Validaciones:
        - ID_PROYECTO único global.
        - codigo_proyecto_tracker único por sociedad.
    """

    existing = db.execute(
        select(Proyecto).where(
            Proyecto.id_proyecto == payload.id_proyecto
        )
    ).scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=409,
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
            status_code=409,
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

    return _enriquecer([nuevo], db)[0]


# ============================================================
# EDITAR PROYECTO
# ============================================================

@router.put("/{id_proyecto}", response_model=ProyectoOut)
def editar_proyecto(
    id_proyecto: str,
    payload: ProyectoUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualiza un proyecto existente.
    Permite actualización parcial.
    """

    id_proyecto = id_proyecto.strip().upper()

    proyecto = db.execute(
        select(Proyecto).where(
            Proyecto.id_proyecto == id_proyecto
        )
    ).scalar_one_or_none()

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado"
        )

    if payload.codigo_proyecto_tracker and \
       payload.codigo_proyecto_tracker != proyecto.codigo_proyecto_tracker:

        dup = db.execute(
            select(Proyecto).where(
                Proyecto.id_sociedad == proyecto.id_sociedad,
                Proyecto.codigo_proyecto_tracker == payload.codigo_proyecto_tracker
            )
        ).scalar_one_or_none()

        if dup:
            raise HTTPException(
                status_code=409,
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

    return _enriquecer([proyecto], db)[0]


# ============================================================
# ELIMINAR PROYECTO
# ============================================================

@router.delete("/{id_proyecto}", status_code=status.HTTP_200_OK)
def eliminar_proyecto(
    id_proyecto: str,
    db: Session = Depends(get_db)
):
    """
    Elimina un proyecto por ID.
    """

    id_proyecto = id_proyecto.strip().upper()

    proyecto = db.execute(
        select(Proyecto).where(
            Proyecto.id_proyecto == id_proyecto
        )
    ).scalar_one_or_none()

    if not proyecto:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado"
        )

    db.delete(proyecto)
    db.commit()

    return {"mensaje": "Proyecto eliminado correctamente"}