from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models.empleado import Empleado
from app.schemas.empleados import EmpleadoCreate, EmpleadoUpdate, EmpleadoOut

router = APIRouter(prefix="/api/empleados", tags=["Empleados"])

@router.get("/", response_model=list[EmpleadoOut])
def listar_empleados(db: Session = Depends(get_db)):
    return db.execute(select(Empleado)).scalars().all()

@router.post("/", response_model=EmpleadoOut, status_code=status.HTTP_201_CREATED)
def crear_empleado(payload: EmpleadoCreate, db: Session = Depends(get_db)):
    # PK duplicada
    existe = db.execute(select(Empleado).where(Empleado.id_empleado == payload.id_empleado)).scalar_one_or_none()
    if existe:
        raise HTTPException(status_code=409, detail="Ya existe un empleado con ese ID_EMPLEADO")

    # Tracker duplicado (recomendable)
    dup_tracker = db.execute(
        select(Empleado).where(Empleado.id_empleado_tracker == payload.id_empleado_tracker)
    ).scalar_one_or_none()
    if dup_tracker:
        raise HTTPException(status_code=409, detail="Ese ID_EMPLEADO_TRACKER ya está asignado")

    nuevo = Empleado(
        id_empleado=payload.id_empleado,
        id_empleado_tracker=payload.id_empleado_tracker,
        nombre=payload.nombre,
        apellidos=payload.apellidos,
        matricula=payload.matricula,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.put("/{id_empleado}", response_model=EmpleadoOut)
def editar_empleado(id_empleado: str, payload: EmpleadoUpdate, db: Session = Depends(get_db)):
    id_empleado = id_empleado.upper().strip()

    emp = db.execute(select(Empleado).where(Empleado.id_empleado == id_empleado)).scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    if payload.id_empleado_tracker is not None and payload.id_empleado_tracker != emp.id_empleado_tracker:
        dup = db.execute(select(Empleado).where(Empleado.id_empleado_tracker == payload.id_empleado_tracker)).scalar_one_or_none()
        if dup:
            raise HTTPException(status_code=409, detail="Ese ID_EMPLEADO_TRACKER ya pertenece a otro empleado")
        emp.id_empleado_tracker = payload.id_empleado_tracker

    if payload.nombre is not None:
        emp.nombre = payload.nombre
    if payload.apellidos is not None:
        emp.apellidos = payload.apellidos
    if payload.matricula is not None:
        emp.matricula = payload.matricula

    db.commit()
    db.refresh(emp)
    return emp

@router.patch("/{id_empleado}/archivar")
def archivar_empleado(id_empleado: str, db: Session = Depends(get_db)):
    id_empleado = id_empleado.upper().strip()

    emp = db.execute(select(Empleado).where(Empleado.id_empleado == id_empleado)).scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    db.delete(emp)
    db.commit()
    return {"mensaje": "Empleado archivado (eliminado) correctamente"}