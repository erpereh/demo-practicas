from fastapi import APIRouter, Query, Body
from app.models.empleado import Empleado
from app.models.horas_trab import HorasTrab

router = APIRouter()

# ===============================
# SIMULACIÓN DATOS EN MEMORIA
# ===============================

empleados = [
    Empleado("02906525S", None, "ALBA", "GARZO SOTO", None, "2022-05-05", True),
    Empleado("12345678A", "TRK001", "CARLOS", "PEREZ LOPEZ", None, "2023-01-10", True),
    Empleado("98765432B", "TRK002", "LAURA", "MARTIN RUIZ", None, "2021-06-15", True),
]

horas_registradas = [
    # ALBA - Enero 2026
    HorasTrab("01", "02906525S", "2026-01-26", "CYC", "SOP_META4", 5.22, "Implantación"),
    HorasTrab("01", "02906525S", "2026-01-27", "CYC", "SOP_META4", 3.50, "Consultoría"),

    # ALBA - Febrero 2026
    HorasTrab("01", "02906525S", "2026-02-03", "CYC", "SOP_META4", 4.00, "Reunión"),
    HorasTrab("01", "02906525S", "2026-02-15", "CYC", "SOP_META4", 6.00, "Análisis"),

    # ALBA - Enero 2025
    HorasTrab("01", "02906525S", "2025-01-10", "CYC", "SOP_META4", 7.00, "Testing"),

    # CARLOS - Enero 2026
    HorasTrab("01", "12345678A", "2026-01-05", "ATOS", "PROY001", 8.00, "Soporte técnico"),
]


# ===============================
# LISTADO EMPLEADOS
# ===============================

@router.get("/empleados")
def listar_empleados():
    return [
        {
            "dni": emp.id_empleado,
            "tracker": emp.id_empleado_tracker,
            "nombre": emp.nombre,
            "apellidos": emp.apellidos,
            "activo": emp.activo
        }
        for emp in empleados
    ]


# ===============================
# CREAR EMPLEADO
# ===============================

@router.post("/empleados")
def crear_empleado(
    id_empleado: str = Body(...),
    id_empleado_tracker: str = Body(None),
    nombre: str = Body(...),
    apellidos: str = Body(...),
    matricula: str = Body(None),
    fec_alta: str = Body(...)
):
    # Validar DNI único
    if any(emp.id_empleado == id_empleado for emp in empleados):
        return {"error": "Ya existe un empleado con ese DNI"}

    nuevo = Empleado(
        id_empleado,
        id_empleado_tracker,
        nombre,
        apellidos,
        matricula,
        fec_alta,
        True
    )

    empleados.append(nuevo)

    return {"mensaje": "Empleado creado correctamente"}


# ===============================
# EDITAR EMPLEADO
# ===============================

@router.put("/empleados/{dni}")
def editar_empleado(
    dni: str,
    nombre: str = Body(None),
    apellidos: str = Body(None),
    matricula: str = Body(None)
):
    for emp in empleados:
        if emp.id_empleado == dni:
            if nombre:
                emp.nombre = nombre
            if apellidos:
                emp.apellidos = apellidos
            if matricula:
                emp.matricula = matricula

            return {"mensaje": "Empleado actualizado"}

    return {"error": "Empleado no encontrado"}


# ===============================
# ARCHIVAR EMPLEADO
# ===============================

@router.patch("/empleados/{dni}/archivar")
def archivar_empleado(dni: str):
    for emp in empleados:
        if emp.id_empleado == dni:
            emp.activo = False
            return {"mensaje": "Empleado archivado"}

    return {"error": "Empleado no encontrado"}


# ===============================
# HORAS POR MES
# ===============================

@router.get("/horas/{nombre}")
def total_horas_por_nombre(
    nombre: str,
    anio: int = Query(..., ge=2000, le=2100),
    mes: int = Query(..., ge=1, le=12)
):
    empleado_encontrado = next(
        (emp for emp in empleados if emp.nombre.lower() == nombre.lower()),
        None
    )

    if not empleado_encontrado:
        return {"error": "Empleado no encontrado"}

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