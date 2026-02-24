from fastapi import APIRouter
from app.models.empleado import Empleado
from app.models.horas_trab import HorasTrab

router = APIRouter()

# Simulación empleados
empleados = [
    Empleado("02906525S", "ALBA", "GARZO SOTO", None, "2022-05-05"),
]

# Simulación horas trabajadas
horas_registradas = [
    HorasTrab("01", "02906525S", "2026-01-26", "CYC", "SOP_META4", 5.22, "Implantación"),
    HorasTrab("01", "02906525S", "2026-01-27", "CYC", "SOP_META4", 3.50, "Consultoría"),
]

@router.get("/horas/{nombre}")
def total_horas_por_nombre(nombre: str):

    # Buscar empleado por nombre
    empleado_encontrado = None
    for emp in empleados:
        if emp.nombre.lower() == nombre.lower():
            empleado_encontrado = emp
            break

    if not empleado_encontrado:
        return {"error": "Empleado no encontrado"}

    # Sumar horas
    total = 0
    for registro in horas_registradas:
        if registro.id_empleado == empleado_encontrado.id_empleado:
            total += registro.horas_dia

    return {
        "empleado": f"{empleado_encontrado.nombre} {empleado_encontrado.apellidos}",
        "total_horas": total
    }