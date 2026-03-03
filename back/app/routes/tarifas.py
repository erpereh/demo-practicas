"""
Router de gestión de Tarifas (Histórico de Proyecto).

Este módulo expone endpoints para:

- Listar todas las tarifas almacenadas en base de datos.
- Asignar una nueva tarifa a un empleado en un proyecto con fecha de inicio.

La entidad HistProyecto actúa como histórico de tarifas por
empleado/proyecto con fecha efectiva (fec_inicio).

Prefijo: /api
Tag OpenAPI: Tarifas
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.hist_proyecto import HistProyecto
from app.database import get_db

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
        list[dict]: Lista de tarifas con los siguientes campos:
            - id_sociedad
            - empleado
            - cliente
            - proyecto
            - tarifa (float)
            - fecha_inicio (string ISO 8601)

    Notas técnicas:
        - Se transforma el campo Numeric 'tarifa' a float para compatibilidad JSON.
        - Se convierte el campo Date 'fec_inicio' a formato ISO.
        - Actualmente no se aplican filtros ni paginación.
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
# ASIGNAR TARIFA
# ============================================================

@router.post("/tarifas")
def asignar_tarifa(
    id_sociedad: str,
    id_empleado: str,
    id_cliente: str,
    id_proyecto: str,
    fec_inicio: str,
    tarifa: float,
    db: Session = Depends(get_db)
):
    """
    Inserta una nueva tarifa en el histórico (HistProyecto).

    Parámetros:
        id_sociedad (str): Identificador de la sociedad.
        id_empleado (str): Identificador del empleado.
        id_cliente (str): Identificador del cliente.
        id_proyecto (str): Identificador del proyecto.
        fec_inicio (str): Fecha en formato YYYY-MM-DD.
        tarifa (float): Importe de la tarifa.

    Validaciones:
        - Conversión de fecha string a objeto date.
        - Se evita duplicidad exacta por:
            (id_empleado, id_proyecto, fec_inicio)

    Raises:
        HTTPException 400:
            Si ya existe una tarifa con esa clave lógica.

    Returns:
        dict: Confirmación con los datos insertados.
    """

    # Conversión de fecha a objeto date
    fecha = datetime.strptime(fec_inicio, "%Y-%m-%d").date()

    # Validación de duplicado lógico
    existe = db.query(HistProyecto).filter(
        HistProyecto.id_empleado == id_empleado,
        HistProyecto.id_proyecto == id_proyecto,
        HistProyecto.fec_inicio == fecha
    ).first()

    if existe:
        raise HTTPException(
            status_code=400,
            detail="Ya existe una tarifa con esa fecha"
        )

    # Creación del nuevo registro
    nueva = HistProyecto(
        id_sociedad=id_sociedad,
        id_empleado=id_empleado,
        id_cliente=id_cliente,
        id_proyecto=id_proyecto,
        fec_inicio=fecha,
        tarifa=tarifa
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