"""
Router de gestión de Tarifas (Histórico de Proyecto).

Este módulo expone endpoints para:

- Listar todas las tarifas almacenadas en base de datos.
- Asignar una nueva tarifa.
- Actualizar una tarifa existente.
- Eliminar una tarifa existente.

La entidad HistProyecto actúa como histórico de tarifas por
empleado/proyecto con fecha efectiva (fec_inicio).

Prefijo: /api
Tag OpenAPI: Tarifas
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from pydantic import BaseModel

from app.models.hist_proyecto import HistProyecto
from app.database import get_db


# ============================================================
# MODELOS Pydantic (Entrada de datos)
# ============================================================

class TarifaCreate(BaseModel):
    """
    Modelo para crear una nueva tarifa.
    FastAPI valida automáticamente:
    - Tipos
    - Campos obligatorios
    - Conversión de fecha ISO a date
    """

    id_sociedad: str
    id_empleado: str
    id_cliente: str
    id_proyecto: str
    fec_inicio: date
    tarifa: float


class TarifaUpdate(BaseModel):
    """
    Modelo para actualizar una tarifa existente.

    Se usa la clave lógica:
        (id_empleado, id_proyecto, fec_inicio)

    para localizar el registro a modificar.
    """

    id_sociedad: str
    id_empleado: str
    id_cliente: str
    id_proyecto: str
    fec_inicio: date
    tarifa: float


# ============================================================
# CONFIGURACIÓN DEL ROUTER
# ============================================================

router = APIRouter(
    prefix="/api",
    tags=["Tarifas"]
)


# ============================================================
# LISTAR TARIFAS
# ============================================================

@router.get("/tarifas")
def listar_tarifas(db: Session = Depends(get_db)):
    """
    Recupera todas las tarifas registradas en la tabla HistProyecto.

    Returns:
        list[dict]: Lista de tarifas en formato JSON.
    """

    registros = db.query(HistProyecto).all()

    return [
        {
            "id_sociedad": r.id_sociedad,
            "empleado": r.id_empleado,
            "cliente": r.id_cliente,
            "proyecto": r.id_proyecto,
            "tarifa": float(r.tarifa),
            "fecha_inicio": r.fec_inicio.isoformat()
        }
        for r in registros
    ]


# ============================================================
# CREAR TARIFA
# ============================================================

@router.post("/tarifas")
def asignar_tarifa(
    data: TarifaCreate,
    db: Session = Depends(get_db)
):
    """
    Inserta una nueva tarifa en el histórico.

    Valida que no exista ya una tarifa con la misma:
        (id_empleado, id_proyecto, fec_inicio)
    """

    # Validación de duplicidad lógica
    existe = db.query(HistProyecto).filter(
        HistProyecto.id_empleado == data.id_empleado,
        HistProyecto.id_proyecto == data.id_proyecto,
        HistProyecto.fec_inicio == data.fec_inicio
    ).first()

    if existe:
        raise HTTPException(
            status_code=400,
            detail="Ya existe una tarifa con esa fecha"
        )

    nueva = HistProyecto(
        id_sociedad=data.id_sociedad,
        id_empleado=data.id_empleado,
        id_cliente=data.id_cliente,
        id_proyecto=data.id_proyecto,
        fec_inicio=data.fec_inicio,
        tarifa=data.tarifa
    )

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return {
        "mensaje": "Tarifa asignada correctamente",
        "id_sociedad": nueva.id_sociedad,
        "id_empleado": nueva.id_empleado,
        "id_cliente": nueva.id_cliente,
        "id_proyecto": nueva.id_proyecto,
        "fecha_inicio": nueva.fec_inicio.isoformat(),
        "tarifa": float(nueva.tarifa)
    }


# ============================================================
# ACTUALIZAR TARIFA
# ============================================================

@router.put("/tarifas")
def actualizar_tarifa(
    data: TarifaUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualiza una tarifa existente.

    Se localiza mediante:
        (id_empleado, id_proyecto, fec_inicio)
    """

    registro = db.query(HistProyecto).filter(
        HistProyecto.id_empleado == data.id_empleado,
        HistProyecto.id_proyecto == data.id_proyecto,
        HistProyecto.fec_inicio == data.fec_inicio
    ).first()

    if not registro:
        raise HTTPException(
            status_code=404,
            detail="Tarifa no encontrada"
        )

    # Actualizamos campos modificables
    registro.id_sociedad = data.id_sociedad
    registro.id_cliente = data.id_cliente
    registro.tarifa = data.tarifa

    db.commit()
    db.refresh(registro)

    return {
        "mensaje": "Tarifa actualizada correctamente",
        "id_sociedad": registro.id_sociedad,
        "id_empleado": registro.id_empleado,
        "id_cliente": registro.id_cliente,
        "id_proyecto": registro.id_proyecto,
        "fecha_inicio": registro.fec_inicio.isoformat(),
        "tarifa": float(registro.tarifa)
    }


# ============================================================
# ELIMINAR TARIFA
# ============================================================

@router.delete("/tarifas")
def eliminar_tarifa(
    id_empleado: str,
    id_proyecto: str,
    fec_inicio: date,
    db: Session = Depends(get_db)
):
    """
    Elimina una tarifa existente.

    Parámetros recibidos como query params:
        - id_empleado
        - id_proyecto
        - fec_inicio
    """

    registro = db.query(HistProyecto).filter(
        HistProyecto.id_empleado == id_empleado,
        HistProyecto.id_proyecto == id_proyecto,
        HistProyecto.fec_inicio == fec_inicio
    ).first()

    if not registro:
        raise HTTPException(
            status_code=404,
            detail="Tarifa no encontrada"
        )

    db.delete(registro)
    db.commit()

    return {
        "mensaje": "Tarifa eliminada correctamente"
    }