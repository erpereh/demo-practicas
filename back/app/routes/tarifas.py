"""
Router de gestión de TARIFAS por empleado y proyecto.

Este módulo representa la tabla HIST_PROYECTOS, que define
la tarifa pactada para un empleado concreto dentro de un proyecto.

Actualmente:
- Los datos se almacenan en memoria (lista local).
- No existe persistencia en base de datos.
- No hay validación de solapamiento de fechas.
- No se controla duplicidad por empleado/proyecto/fecha.

En producción debería:
- Conectarse a la tabla HIST_PROYECTOS vía SQLAlchemy.
- Validar que no existan tarifas activas solapadas.
- Controlar vigencia (fecha fin).
- Validar existencia de empleado, cliente y proyecto.
"""

from fastapi import APIRouter, Body
from app.models.hist_proyecto import HistProyecto
from datetime import datetime

router = APIRouter()


# ============================================================
# SIMULACIÓN DE BASE DE DATOS (EN MEMORIA)
# ============================================================

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


# ============================================================
# LISTAR TARIFAS
# ============================================================

@router.get("/tarifas")
def listar_tarifas():
    """
    Devuelve todas las tarifas registradas.

    Actualmente:
    - Devuelve datos en memoria.
    - No hay filtrado por empleado o proyecto.
    - No se aplica ordenación.

    Mejora futura:
    - Añadir filtros por empleado/proyecto.
    - Ordenar por fecha de inicio descendente.
    """

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


# ============================================================
# ASIGNAR TARIFA
# ============================================================

@router.post("/tarifas")
def asignar_tarifa(
    id_sociedad: str = Body(..., description="Código de la sociedad"),
    id_empleado: str = Body(..., description="DNI del empleado"),
    id_cliente: str = Body(..., description="Código del cliente"),
    id_proyecto: str = Body(..., description="Código del proyecto"),
    fec_inicio: str = Body(..., description="Fecha inicio vigencia (YYYY-MM-DD)"),
    tarifa: float = Body(..., gt=0, description="Tarifa por hora (> 0)")
):
    """
    Asigna una nueva tarifa a un empleado dentro de un proyecto.

    Validaciones actuales:
    - Formato de fecha válido.
    - Tarifa mayor que cero.

    Limitaciones actuales:
    - No se comprueba duplicidad.
    - No se valida que el empleado exista.
    - No se valida que el proyecto exista.
    - No se controla solapamiento de fechas.
    """

    try:
        fecha_convertida = datetime.strptime(fec_inicio, "%Y-%m-%d").date()
    except ValueError:
        return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}

    nueva = HistProyecto(
        id_sociedad=id_sociedad.strip().upper(),
        id_empleado=id_empleado.strip().upper(),
        id_cliente=id_cliente.strip().upper(),
        id_proyecto=id_proyecto.strip().upper(),
        fec_inicio=fecha_convertida,
        tarifa=round(tarifa, 2)
    )

    tarifas.append(nueva)

    return {
        "mensaje": "Tarifa asignada correctamente",
        "detalle": {
            "empleado": id_empleado,
            "proyecto": id_proyecto,
            "tarifa": round(tarifa, 2),
            "fecha_inicio": fecha_convertida
        }
    }