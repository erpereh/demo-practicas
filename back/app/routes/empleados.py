from fastapi import APIRouter

router = APIRouter()

# Simulación de registros tipo Excel
registros = [
    {"nombre": "Juan", "departamento": "H2", "horas": 2, "dia": "12/01/2026"},
    {"nombre": "Juan", "departamento": "H3", "horas": 4, "dia": "12/01/2026"},
    {"nombre": "Juan", "departamento": "H2", "horas": 6, "dia": "13/01/2026"},
    {"nombre": "Juan", "departamento": "H1", "horas": 3, "dia": "14/01/2026"},
    {"nombre": "Juan", "departamento": "H2", "horas": 3, "dia": "14/01/2026"},
]

@router.get("/horas/{nombre}")
def total_horas_por_empleado(nombre: str):
    total = 0

    for registro in registros:
        if registro["nombre"].lower() == nombre.lower():
            total += registro["horas"]

    return {
        "empleado": nombre,
        "total_horas": total
    }