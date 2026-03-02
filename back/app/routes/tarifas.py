from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.hist_proyecto import HistProyecto
from app.database import get_db

router = APIRouter(
    prefix="/api",
    tags=["Tarifas"]
)

# ✅ LISTAR TARIFAS (desde BBDD real)
@router.get("/tarifas")
def listar_tarifas(db: Session = Depends(get_db)):

    registros = db.query(HistProyecto).all()

    return [
        {
            "id_sociedad": r.id_sociedad,
            "empleado": r.id_empleado,
            "cliente": r.id_cliente,
            "proyecto": r.id_proyecto,
            "tarifa": float(r.tarifa),                  # Numeric → float
            "fecha_inicio": r.fec_inicio.isoformat()   # Date → string ISO
        }
        for r in registros
    ]


# ✅ ASIGNAR TARIFA (INSERT real)
@router.post("/tarifas")
def asignar_tarifa(
    id_sociedad: str,
    id_empleado: str,
    id_cliente: str,
    id_proyecto: str,
    fec_inicio: str,
    tarifa: float,
    db: Session = Depends(get_db)
):

    fecha = datetime.strptime(fec_inicio, "%Y-%m-%d").date()

    # 🔎 Evitar duplicados exactos
    existe = db.query(HistProyecto).filter(
        HistProyecto.id_empleado == id_empleado,
        HistProyecto.id_proyecto == id_proyecto,
        HistProyecto.fec_inicio == fecha
    ).first()

    if existe:
        raise HTTPException(status_code=400, detail="Ya existe una tarifa con esa fecha")

    nueva = HistProyecto(
        id_sociedad=id_sociedad,
        id_empleado=id_empleado,
        id_cliente=id_cliente,
        id_proyecto=id_proyecto,
        fec_inicio=fecha,
        tarifa=tarifa
    )

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    # ✅ No hay campo 'id', devolvemos los campos compuestos
    return {
        "mensaje": "Tarifa asignada correctamente",
        "id_sociedad": nueva.id_sociedad,
        "id_empleado": nueva.id_empleado,
        "id_cliente": nueva.id_cliente,
        "id_proyecto": nueva.id_proyecto,
        "fecha_inicio": nueva.fec_inicio.isoformat(),
        "tarifa": float(nueva.tarifa)
    }