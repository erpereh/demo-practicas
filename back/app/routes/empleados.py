from fastapi import APIRouter, Query, Body, HTTPException
from datetime import datetime
from app.models.empleado import Empleado
from app.models.horas_trab import HorasTrab

router = APIRouter(tags=["Empleados"])


# DATOS (LOCAL)
empleados = [
    Empleado("02906525S", None, "ALBA", "GARZO SOTO", None, "2022-05-05", True),
    Empleado("12345678A", "TRK001", "CARLOS", "PEREZ LOPEZ", None, "2023-01-10", True),
    Empleado("98765432B", "TRK002", "LAURA", "MARTIN RUIZ", None, "2021-06-15", True),
]

horas_registradas = [
    HorasTrab("01", "02906525S", "2026-01-26", "CYC", "SOP_META4", 5.22, "Implantación", "MANUAL", "VALIDADA"),
    HorasTrab("01", "02906525S", "2026-01-27", "CYC", "SOP_META4", 3.50, "Consultoría", "MANUAL", "VALIDADA"),
]


# LISTAR EMPLEADOS
@router.get("/empleados", summary="Listado de empleados")
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


# CREAR EMPLEADO
@router.post("/empleados", summary="Crear empleado")
def crear_empleado(
    id_empleado: str = Body(...),
    id_empleado_tracker: str = Body(None),
    nombre: str = Body(...),
    apellidos: str = Body(...),
    matricula: str = Body(None),
    fec_alta: str = Body(...)
):
    # Normalizar DNI
    id_empleado = id_empleado.upper().strip()

    # Validar DNI
    if not validar_dni(id_empleado):
        raise HTTPException(
            status_code=400,
            detail="DNI no válido. Debe tener 8 números y letra correcta."
        )

    # Validar DNI único
    if any(emp.id_empleado == id_empleado for emp in empleados):
        raise HTTPException(
            status_code=400,
            detail="Ya existe un empleado con ese DNI"
        )

    # Validar fecha formato YYYY-MM-DD
    try:
        datetime.strptime(fec_alta, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Formato de fecha incorrecto. Use YYYY-MM-DD"
        )

    nuevo = Empleado(
        id_empleado,
        id_empleado_tracker,
        nombre.upper().strip(),
        apellidos.upper().strip(),
        matricula,
        fec_alta,
        True
    )

    empleados.append(nuevo)

    return {
        "mensaje": "Empleado creado correctamente",
        "dni": id_empleado
    }

# EDITAR EMPLEADO
@router.put("/empleados/{dni}", summary="Editar empleado")
def editar_empleado(
    dni: str,
    nombre: str = Body(None),
    apellidos: str = Body(None),
    matricula: str = Body(None)
):
    for emp in empleados:
        if emp.id_empleado == dni:

            if nombre:
                emp.nombre = nombre.upper()

            if apellidos:
                emp.apellidos = apellidos.upper()

            if matricula:
                emp.matricula = matricula

            return {"mensaje": "Empleado actualizado correctamente"}

    raise HTTPException(status_code=404, detail="Empleado no encontrado")



# ARCHIVAR EMPLEADO
@router.patch("/empleados/{dni}/archivar", summary="Archivar empleado")
def archivar_empleado(dni: str):
    for emp in empleados:
        if emp.id_empleado == dni:
            emp.activo = False
            return {"mensaje": "Empleado archivado correctamente"}

    raise HTTPException(status_code=404, detail="Empleado no encontrado")



# HORAS POR MES 
@router.get("/horas/{nombre}", summary="Horas totales por empleado y mes")
def total_horas_por_nombre(
    nombre: str,
    anio: int = Query(..., ge=2000, le=2100, description="Año en formato YYYY"),
    mes: int = Query(..., ge=1, le=12, description="Mes (1-12)")
):
    # No permitir años futuros
    if anio > datetime.now().year:
        raise HTTPException(status_code=400, detail="No se permiten años futuros")

    empleado_encontrado = next(
        (emp for emp in empleados if emp.nombre.lower() == nombre.lower()),
        None
    )

    if not empleado_encontrado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

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