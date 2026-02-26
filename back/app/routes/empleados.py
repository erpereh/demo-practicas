# back/app/routes/empleados.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models.empleado import Empleado
from app.schemas.empleados import EmpleadoCreate, EmpleadoUpdate, EmpleadoOut

router = APIRouter(prefix="/api/empleados", tags=["Empleados"])

@router.get("/", response_model=list[EmpleadoOut], summary="Listado de empleados")
def listar_empleados(db: Session = Depends(get_db)):
    return db.execute(select(Empleado)).scalars().all()

@router.post("/", response_model=EmpleadoOut, status_code=status.HTTP_201_CREATED, summary="Crear empleado")
def crear_empleado(payload: EmpleadoCreate, db: Session = Depends(get_db)):
    # DNI único
    if db.execute(select(Empleado).where(Empleado.dni == payload.dni)).scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya existe un empleado con ese DNI/NIE")

    # Código fichaje único
    if db.execute(select(Empleado).where(Empleado.codigo_fichaje == payload.codigo_fichaje)).scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ese código de fichaje ya está asignado")

    nuevo = Empleado(
        nombre=payload.nombre,
        dni=payload.dni,
        codigo_fichaje=payload.codigo_fichaje,
        estado=payload.estado,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.put("/{id_empleado}", response_model=EmpleadoOut, summary="Editar empleado")
def editar_empleado(id_empleado: int, payload: EmpleadoUpdate, db: Session = Depends(get_db)):
    emp = db.execute(select(Empleado).where(Empleado.id == id_empleado)).scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    # Si cambia DNI, comprobar duplicado
    if payload.dni and payload.dni != emp.dni:
        dup = db.execute(select(Empleado).where(Empleado.dni == payload.dni)).scalar_one_or_none()
        if dup:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ese DNI/NIE ya pertenece a otro empleado")
        emp.dni = payload.dni

    # Si cambia código, comprobar duplicado
    if payload.codigo_fichaje and payload.codigo_fichaje != emp.codigo_fichaje:
        dup = db.execute(select(Empleado).where(Empleado.codigo_fichaje == payload.codigo_fichaje)).scalar_one_or_none()
        if dup:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ese código de fichaje ya pertenece a otro empleado")
        emp.codigo_fichaje = payload.codigo_fichaje

    if payload.nombre is not None:
        emp.nombre = payload.nombre
    if payload.estado is not None:
        emp.estado = payload.estado

    db.commit()
    db.refresh(emp)
    return emp

@router.patch("/{id_empleado}/archivar", summary="Archivar empleado (Inactivo)")
def archivar_empleado(id_empleado: int, db: Session = Depends(get_db)):
    emp = db.execute(select(Empleado).where(Empleado.id == id_empleado)).scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    emp.estado = "Inactivo"
    db.commit()
    return {"mensaje": "Empleado archivado correctamente"}