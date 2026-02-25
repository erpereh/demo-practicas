from fastapi import APIRouter, Body
from app.models.proyecto import Proyecto

router = APIRouter()

proyectos = [
    Proyecto("01", "CYC", "SOP_META4", "H2", "ABIERTO", 0.00, "2019-07-01", True),
    Proyecto("01", "ATOS", "PROY001", "H3", "CERRADO", 5000.00, "2024-01-01", True),
]


# LISTAR PROYECTOS
@router.get("/proyectos")
def listar_proyectos():
    return [
        {
            "id_proyecto": p.id_proyecto,
            "cliente": p.id_cliente,
            "tipo_pago": p.tipo_pago,
            "codigo_tracker": p.codigo_proyecto_tracker,
            "precio": p.precio,
            "activo": p.activo
        }
        for p in proyectos
    ]


# CREAR PROYECTO
@router.post("/proyectos")
def crear_proyecto(
    id_sociedad: str = Body(...),
    id_cliente: str = Body(...),
    id_proyecto: str = Body(...),
    codigo_proyecto_tracker: str = Body(...),
    tipo_pago: str = Body(...),
    precio: float = Body(...),
    fec_inicio: str = Body(...)
):
    if any(p.id_proyecto == id_proyecto for p in proyectos):
        return {"error": "Proyecto ya existe"}

    nuevo = Proyecto(id_sociedad, id_cliente, id_proyecto, codigo_proyecto_tracker, tipo_pago, precio, fec_inicio, True)
    proyectos.append(nuevo)

    return {"mensaje": "Proyecto creado correctamente"}