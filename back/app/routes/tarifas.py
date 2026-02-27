from fastapi import APIRouter, Body
from app.models.hist_proyecto import HistProyecto
from datetime import datetime

router = APIRouter()

# Lista temporal para simular la base de datos
tarifas = [
    HistProyecto(
        id_sociedad="01",
        id_empleado="02906525S",
        id_cliente="CYC",
        id_proyecto="SOP_META4",
        fec_inicio=datetime.strptime("2025-06-01", "%Y-%m-%d").date(),
        tarifa=25.00
    ),
]

# LISTAR TARIFAS
@router.get("/tarifas")
def listar_tarifas():
    return [
        {
            "empleado": t.id_empleado,
            "cliente": t.id_cliente,
            "proyecto": t.id_proyecto,
            "tarifa": t.tarifa,
            "fecha_inicio": t.fec_inicio
        }
        for t in tarifas
    ]

# ASIGNAR TARIFA
@router.post("/tarifas")
def asignar_tarifa(
    id_sociedad: str = Body(...),
    id_empleado: str = Body(...),
    id_cliente: str = Body(...),
    id_proyecto: str = Body(...),
    fec_inicio: str = Body(...),
    tarifa: float = Body(...)
):
    nueva = HistProyecto(
        id_sociedad=id_sociedad,
        id_empleado=id_empleado,
        id_cliente=id_cliente,
        id_proyecto=id_proyecto,
        fec_inicio=datetime.strptime(fec_inicio, "%Y-%m-%d").date(),
        tarifa=tarifa
    )

    tarifas.append(nueva)

    return {"mensaje": "Tarifa asignada correctamente"}