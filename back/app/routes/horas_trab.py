from fastapi import APIRouter, Body
from app.models.horas_trab import HorasTrab

router = APIRouter()

fichajes = [
    HorasTrab("01", "Juan Pérez", "CYC", "7.50", "EXCEL", "EDITABLE", True),
    HorasTrab("02", "Andrés Izquierdo", "ATOS", "8.05", "EXCEL", "EDITABLE", True)
]

# LISTAR FICHAJES
@router.get("/fichajes")
def listar_fichajes():
    return [
        {
            "fecha": f.fecha,
            "id_empleado": f.id_empleado,
            "id_proyecto": f.id_proyecto,
            "horas_total": f.horas_total,
            "origen": f.origen,
            "estado": f.estado
        }
        for f in fichajes
    ]


# LISTAR FICHAJES POR EMPLEADO
@router.get("/fichajes/{id_empleado}")
def listar_fichajes_emp(id_empleado: str):
    for f in fichajes:
        if f.id_empleado == id_empleado:
            return [
                {
                    "fecha": f.fecha,
                    "id_empleado": f.id_empleado,
                    "id_proyecto": f.id_proyecto,
                    "horas_total": f.horas_total,
                    "origen": f.origen,
                    "estado": f.estado
                }
            ]
        return {"error", "No existen fichajes de este empleado"}


# LISTAR FICHAJES POR PROYECTO
@router.get("/fichajes/{id_proyecto}")
def listar_fichajes_pro(id_proyecto: str):
    for f in fichajes:
        if f.id_proyecto == id_proyecto:
            return [
                {
                    "fecha": f.fecha,
                    "id_empleado": f.id_empleado,
                    "id_proyecto": f.id_proyecto,
                    "horas_total": f.horas_total,
                    "origen": f.origen,
                    "estado": f.estado
                }
            ]
        return {"error", "No existen fichajes con este proyecto"}
    

# LISTAR FICHAJES POR FECHA
@router.get("/fichajes/{fecha}")
def listar_fichajes_fecha(fecha: str):
    for f in fichajes:
        if f.fecha == fecha:
            return [
                {
                    "fecha": f.fecha,
                    "id_empleado": f.id_empleado,
                    "id_proyecto": f.id_proyecto,
                    "horas_total": f.horas_total,
                    "origen": f.origen,
                    "estado": f.estado
                }
            ]
        return {"error", "No han habido fichajes este dia"}


# LISTAR FICHAJES POR MES
@router.get("/fichajes/{fecha}")
def listar_fichajes_emp(fecha: str):
    for f in fichajes:
        if f.fecha == fecha:
            return [
                {
                    "fecha": f.fecha,
                    "id_empleado": f.id_empleado,
                    "id_proyecto": f.id_proyecto,
                    "horas_total": f.horas_total,
                    "origen": f.origen,
                    "estado": f.estado
                }
            ]
        return {"error", "No han habido fichajes este mes"}
 

# CREAR BANCO
@router.post("/fichajes")
def fichar_manual(
    id_fichaje: str = Body(...),
    fecha: str = Body(...),
    id_empleado: str = Body(...),
    id_proyecto: str = Body(...),
    horas_dia: str = Body(...),
    origen: str = Body(...),
    estado: str = Body(...)
):
    if any(f.id_fichaje == id_fichaje for f in fichajes):
        return {"error": "Ya existe un fichaje con ese código"}

    nuevo = HorasTrab(
        id_fichaje,
        fecha,
        id_empleado,
        id_proyecto,
        horas_dia,
        origen,
        estado
    )

    fichajes.append(nuevo)

    return {"mensaje": "Fichaje creado correctamente"}


# EDITAR BANCO
@router.put("/fichajes/{id_fichaje}")
def editar_fichado(
    id_fichaje: str,
    hora_inicio: str = Body(None),
    hora_fin: str = Body(None)
):
    for f in fichajes:
        if f.id_fichaje == id_fichaje:
            if hora_inicio:
                f.hora_inicio = hora_inicio
            if hora_fin:
                f.hora_fin = hora_fin
            
            f.horas_total = f.hora_fin - f.hora_inicio
            return {"mensaje": "Fichaje actualizado correctamente"}

    return {"error": "Fichaje no encontrado"}


# ARCHIVAR BANCO
@router.patch("/fichajes/{id_fichaje}/archivar")
def archivar_fichaje(id_fichaje: str):
    for f in fichajes:
        if f.id_fichaje == id_fichaje:
            f.activo = False
            return {"mensaje": "Cuenta bancaria archivada"}

    return {"error": "Banco no encontrado"}