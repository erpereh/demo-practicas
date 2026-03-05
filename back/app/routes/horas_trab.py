"""
Router de gestión de HORAS_TRAB.

Responsabilidades:
- Listado completo.
- Filtros por empleado y proyecto.
- Inserción manual de fichajes.

Notas:
- Validación básica de fecha.
- Persistencia directa en MySQL.
- No hay control de duplicidad aún (mejorable).
"""

from fastapi import APIRouter, Depends, HTTPException, Body
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
    registros = db.query(HorasTrab).all()

    return [
        {
            "id_sociedad": r.id_sociedad,
            "fecha": r.fecha.strftime("%Y-%m-%d"),
            "id_empleado": r.id_empleado,
            "id_cliente": r.id_cliente,
            "id_proyecto": r.id_proyecto,
            "horas_dia": float(r.horas_dia),
            "desc_tarea": r.desc_tarea,
        }
        for r in registros
    ]

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
    data: dict = Body(...),
    db: Session = Depends(get_db)
):
    fecha_convertida = datetime.strptime(data["fecha"], "%Y-%m-%d")

    nuevo = HorasTrab(
        id_sociedad=data["id_sociedad"],
        fecha=fecha_convertida,
        id_empleado=data["id_empleado"],
        id_cliente=data["id_cliente"],
        id_proyecto=data["id_proyecto"],
        horas_dia=data["horas_dia"],
        desc_tarea=data["desc_tarea"],
    )

    db.add(nuevo)
    db.commit()

    return {"mensaje": "Fichaje creado correctamente"}