from fastapi import APIRouter, Query
from app.models.empleado import Empleado
from app.models.horas_trab import HorasTrab

router = APIRouter()

# Simulación empleados
empleados = [
    Empleado("02906525S", None, "ALBA", "GARZO SOTO", None, "2022-05-05"),
]

# Simulación horas trabajadas
horas_registradas = [
    # Enero 2026 (deben contarse si mes=1 anio=2026)
    HorasTrab("01", "02906525S", "2026-01-26", "CYC", "SOP_META4", 5.22, "Implantación"),
    HorasTrab("01", "02906525S", "2026-01-27", "CYC", "SOP_META4", 3.50, "Consultoría"),

    # Febrero 2026 (NO deben contarse en enero)
    HorasTrab("01", "02906525S", "2026-02-03", "CYC", "SOP_META4", 4.00, "Reunión"),
    HorasTrab("01", "02906525S", "2026-02-15", "CYC", "SOP_META4", 6.00, "Análisis"),

    # Enero 2025 (NO deben contarse en 2026)
    HorasTrab("01", "02906525S", "2025-01-10", "CYC", "SOP_META4", 7.00, "Testing"),

    # Marzo 2026 (NO deben contarse en enero)
    HorasTrab("01", "02906525S", "2026-03-01", "CYC", "SOP_META4", 2.75, "Soporte"),
]


@router.get("/horas/{nombre}")
def total_horas_por_nombre(
    nombre: str,
    anio: int = Query(..., ge=2000, le=2100),
    mes: int = Query(..., ge=1, le=12)
):
    # Buscar empleado
    empleado_encontrado = next(
        (emp for emp in empleados if emp.nombre.lower() == nombre.lower()),
        None
    )

    if not empleado_encontrado:
        return {"error": "Empleado no encontrado"}

    # Sumar horas del mes
    total = sum(
        registro.horas_dia
        for registro in horas_registradas
        if registro.id_empleado == empleado_encontrado.id_empleado
        and registro.fecha.year == anio
        and registro.fecha.month == mes
    )

    return {
        "empleado": f"{empleado_encontrado.nombre} {empleado_encontrado.apellidos}",
        "anio": anio,
        "mes": mes,
        "total_horas": round(total, 2)
    }