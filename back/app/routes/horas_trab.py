from fastapi import APIRouter, Body
from app.models.horas_trab import HorasTrab

# AÑADIDO: Le ponemos el prefijo /api para mantener el estándar de la app
router = APIRouter(prefix="/api", tags=["Horas"])

# CAMBIO 1 INDISPENSABLE: Vaciamos la lista. 
# Los datos de prueba mal formateados ("CYC" en lugar de una fecha) eran los que hacían explotar el servidor.
fichajes =[]

# LISTAR FICHAJES
@router.get("/horas")
def listar_fichajes():
    return fichajes


# CAMBIO 2 INDISPENSABLE: Cambiamos las URLs. 
# Si todas se llaman "/horas/{variable}", FastAPI se confunde y solo ejecuta la primera. 
# Hay que especificar si es /horas/empleado/..., /horas/proyecto/..., etc.

# LISTAR FICHAJES POR EMPLEADO
@router.get("/horas/empleado/{id_empleado}")
def listar_fichajes_emp(id_empleado: str):
    # CAMBIO 3: Corregido el bucle (antes devolvía error al primer intento)
    resultados =[f for f in fichajes if getattr(f, "id_empleado", "") == id_empleado]
    if resultados:
        return resultados
    return {"error": "No existen fichajes de este empleado"} # Corregido {"error", "..."} por {"error": "..."}


# LISTAR FICHAJES POR PROYECTO
@router.get("/horas/proyecto/{id_proyecto}")
def listar_fichajes_pro(id_proyecto: str):
    resultados =[f for f in fichajes if getattr(f, "id_proyecto", "") == id_proyecto]
    if resultados:
        return resultados
    return {"error": "No existen fichajes con este proyecto"}
    

# LISTAR FICHAJES POR FECHA
@router.get("/horas/fecha/{fecha}")
def listar_fichajes_fecha(fecha: str):
    resultados =[f for f in fichajes if getattr(f, "fecha", "") == fecha]
    if resultados:
        return resultados
    return {"error": "No han habido fichajes este dia"}


# ELIMINADA la ruta "LISTAR FICHAJES POR MES" porque tenía exactamente 
# la misma URL y los mismos parámetros que la ruta de FECHA (estaba duplicada).


# CREAR FICHAJE
@router.post("/horas")
def fichar_manual(
    id_fichaje: str = Body(...),
    fecha: str = Body(...),
    id_empleado: str = Body(...),
    id_proyecto: str = Body(...),
    horas_total: str = Body(...),
    origen: str = Body(...),
    estado: str = Body(...)
):
    if any(getattr(f, "id_fichaje", "") == id_fichaje for f in fichajes):
        return {"error": "Ya existe un fichaje con ese código"}

    nuevo = HorasTrab(
        id_fichaje,
        fecha,
        id_empleado,
        id_proyecto,
        horas_total,
        origen,
        estado
    )

    fichajes.append(nuevo)

    return {"mensaje": "Fichaje creado correctamente"}


# EDITAR FICHAJE
@router.put("/horas/{id_fichaje}")
def editar_fichado(
    id_fichaje: str,
    horas_total: str = Body(None),
):
    for f in fichajes:
        if getattr(f, "id_fichaje", "") == id_fichaje:
            if horas_total:
                f.horas_total = horas_total

            return {"mensaje": "Fichaje actualizado correctamente"}

    return {"error": "Fichaje no encontrado"}


# ARCHIVAR FICHAJE
@router.patch("/horas/{id_fichaje}/archivar")
def archivar_fichaje(id_fichaje: str):
    for f in fichajes:
        if getattr(f, "id_fichaje", "") == id_fichaje:
            f.activo = False
            return {"mensaje": "Fichaje archivado correctamente"}

    return {"error": "Fichaje no encontrado"}