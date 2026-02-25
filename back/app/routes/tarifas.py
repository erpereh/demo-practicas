from fastapi import APIRouter, Body
from app.models.hist_proyecto import HistProyecto

router = APIRouter()

tarifas = [
    HistProyecto("01", "02906525S", "CYC", "SOP_META4", "2025-06-01", 25.00, True),
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
            "fecha_inicio": t.fec_inicio,
            "activo": t.activo
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
    nueva = HistProyecto(id_sociedad, id_empleado, id_cliente, id_proyecto, fec_inicio, tarifa, True)

    tarifas.append(nueva)

    return {"mensaje": "Tarifa asignada correctamente"}