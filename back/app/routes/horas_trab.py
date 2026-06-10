from datetime import datetime

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.horas_trab import HorasTrab


router = APIRouter(prefix="/api", tags=["Horas"])


def _serialize_hora(registro: HorasTrab) -> dict:
    return {
        "id_sociedad": registro.id_sociedad,
        "fecha": registro.fecha.strftime("%Y-%m-%d"),
        "id_empleado": registro.id_empleado,
        "id_cliente": registro.id_cliente,
        "id_proyecto": registro.id_proyecto,
        "horas_dia": float(registro.horas_dia) if registro.horas_dia is not None else 0.0,
        "desc_tarea": registro.desc_tarea,
        "estado": registro.estado,
        "id_factura": registro.id_factura,
        "origen": registro.origen,
    }


@router.get("/horas")
def listar_fichajes(db: Session = Depends(get_db)):
    return [_serialize_hora(registro) for registro in db.query(HorasTrab).all()]


@router.get("/horas/empleado/{id_empleado}")
def listar_fichajes_emp(id_empleado: str, db: Session = Depends(get_db)):
    resultados = db.query(HorasTrab).filter(HorasTrab.id_empleado == id_empleado).all()

    if not resultados:
        raise HTTPException(status_code=404, detail="No existen fichajes de este empleado")

    return [_serialize_hora(registro) for registro in resultados]


@router.get("/horas/proyecto/{id_proyecto}")
def listar_fichajes_pro(id_proyecto: str, db: Session = Depends(get_db)):
    resultados = db.query(HorasTrab).filter(HorasTrab.id_proyecto == id_proyecto).all()

    if not resultados:
        raise HTTPException(status_code=404, detail="No existen fichajes con este proyecto")

    return [_serialize_hora(registro) for registro in resultados]


@router.post("/horas")
def fichar_manual(data: dict = Body(...), db: Session = Depends(get_db)):
    try:
        fecha_convertida = datetime.strptime(data["fecha"], "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha invalido. Usa YYYY-MM-DD")

    existente = (
        db.query(HorasTrab)
        .filter(
            HorasTrab.id_empleado == data["id_empleado"],
            HorasTrab.fecha == fecha_convertida,
            HorasTrab.id_proyecto == data["id_proyecto"],
        )
        .first()
    )

    if existente:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un fichaje para ese empleado, fecha y proyecto",
        )

    nuevo = HorasTrab(
        id_sociedad=data["id_sociedad"],
        fecha=fecha_convertida,
        id_empleado=data["id_empleado"],
        id_cliente=data["id_cliente"],
        id_proyecto=data["id_proyecto"],
        horas_dia=float(data["horas_dia"]),
        desc_tarea=data.get("desc_tarea", "Fichaje manual"),
        estado=data.get("estado", "PENDIENTE"),
        origen=data.get("origen", "MANUAL"),
        id_factura=data.get("id_factura"),
    )

    db.add(nuevo)
    db.commit()

    return {"mensaje": "Fichaje creado correctamente"}


@router.put("/horas/{id_empleado}/{fecha}/{id_proyecto}")
def editar_fichaje(
    id_empleado: str,
    fecha: str,
    id_proyecto: str,
    data: dict = Body(...),
    db: Session = Depends(get_db),
):
    try:
        fecha_convertida = datetime.strptime(fecha, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha invalido. Usa YYYY-MM-DD")

    fichaje = (
        db.query(HorasTrab)
        .filter(
            HorasTrab.id_empleado == id_empleado,
            HorasTrab.fecha == fecha_convertida,
            HorasTrab.id_proyecto == id_proyecto,
        )
        .first()
    )

    if not fichaje:
        raise HTTPException(status_code=404, detail="Fichaje no encontrado")

    if "horas_dia" in data:
        fichaje.horas_dia = float(data["horas_dia"])
    if "desc_tarea" in data:
        fichaje.desc_tarea = data["desc_tarea"]
    if "estado" in data:
        fichaje.estado = data["estado"]
    if "origen" in data:
        fichaje.origen = data["origen"]

    db.commit()

    return {"mensaje": "Fichaje actualizado correctamente"}


@router.delete("/horas/{id_empleado}/{fecha}/{id_proyecto}")
def eliminar_fichaje(
    id_empleado: str,
    fecha: str,
    id_proyecto: str,
    db: Session = Depends(get_db),
):
    try:
        fecha_convertida = datetime.strptime(fecha, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha invalido. Usa YYYY-MM-DD")

    fichaje = (
        db.query(HorasTrab)
        .filter(
            HorasTrab.id_empleado == id_empleado,
            HorasTrab.fecha == fecha_convertida,
            HorasTrab.id_proyecto == id_proyecto,
        )
        .first()
    )

    if not fichaje:
        raise HTTPException(status_code=404, detail="Fichaje no encontrado")

    db.delete(fichaje)
    db.commit()

    return {"mensaje": "Fichaje eliminado correctamente"}
