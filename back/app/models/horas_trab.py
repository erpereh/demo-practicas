"""
Modelo ORM: HorasTrab

Representa la tabla horas_trab en la base de datos.

Gestiona el registro diario de horas trabajadas por empleados
en proyectos y clientes determinados.
"""

from sqlalchemy import Column, Integer, String, Float, Date
from app.database import Base


class HorasTrab(Base):
    """
    Entidad HorasTrab.

    Registra el detalle de horas imputadas por empleado y día.
    """

    __tablename__ = "HORAS_TRAB"

    # Identificador único del registro
    id = Column(Integer, primary_key=True, index=True)

    # Sociedad asociada
    id_sociedad = Column(String(50), nullable=True)

    # Empleado que imputa las horas
    id_empleado = Column(String(50), index=True, nullable=False)

    # Fecha del trabajo realizado
    fecha = Column(Date, nullable=False)

    # Cliente asociado
    id_cliente = Column(String(50), nullable=True)

    # Proyecto asociado
    id_proyecto = Column(String(50), index=True, nullable=True)

    # Número de horas trabajadas en el día
    horas_dia = Column(Float, nullable=False)

    # Descripción de la tarea realizada
    desc_tarea = Column(String(255), nullable=True)

    # Origen del registro (MANUAL, IMPORTADO, etc.)
    origen = Column(String(50), default="MANUAL")

    # Estado del registro (PENDIENTE, VALIDADO, etc.)
    estado = Column(String(50), default="PENDIENTE")