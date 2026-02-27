from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.horas_trab import HorasTrab
from app.database import get_db

router = APIRouter(prefix="/api", tags=["Horas"])


# ============================
# LISTAR TODOS
# ============================

@router.get("/horas")
def listar_fichajes(db: Session = Depends(get_db)):
    return db.query(HorasTrab).all()


# ============================
# LISTAR POR EMPLEADO
# ============================

@router.get("/horas/empleado/{id_empleado}")
def listar_fichajes_emp(id_empleado: str, db: Session = Depends(get_db)):
    resultados = db.query(HorasTrab).filter(
        HorasTrab.id_empleado == id_empleado
    ).all()

    if not resultados:
        raise HTTPException(status_code=404, detail="No existen fichajes de este empleado")

    return resultados


# ============================
# LISTAR POR PROYECTO
# ============================

@router.get("/horas/proyecto/{id_proyecto}")
def listar_fichajes_pro(id_proyecto: str, db: Session = Depends(get_db)):
    resultados = db.query(HorasTrab).filter(
        HorasTrab.id_proyecto == id_proyecto
    ).all()

    if not resultados:
        raise HTTPException(status_code=404, detail="No existen fichajes con este proyecto")

    return resultados


# ============================
# CREAR FICHAJE
# ============================

@router.post("/horas")
def fichar_manual(
    id_sociedad: str,
    fecha: str,
    id_empleado: str,
    id_cliente: str,
    id_proyecto: str,
    horas_dia: float,
    desc_tarea: str,
    db: Session = Depends(get_db)
):

    try:
        fecha_convertida = datetime.strptime(fecha, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha incorrecto (YYYY-MM-DD)")

    nuevo = HorasTrab(
        id_sociedad=id_sociedad,
        fecha=fecha_convertida,
        id_empleado=id_empleado,
        id_cliente=id_cliente,
        id_proyecto=id_proyecto,
        horas_dia=horas_dia,
        desc_tarea=desc_tarea
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return {"mensaje": "Fichaje creado correctamente"}