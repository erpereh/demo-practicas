"""
Modelo ORM: HorasTrab

Representa la tabla HORAS_TRAB en la base de datos.

Gestiona el registro diario de horas trabajadas por empleados
en proyectos y clientes determinados.
"""

from sqlalchemy import Column, String, Float, Date
from app.database import Base


class HorasTrab(Base):
    """
    Entidad HorasTrab.

    Registra el detalle de horas imputadas por empleado y día.
    """

    __tablename__ = "HORAS_TRAB"

    #  Clave primaria compuesta necesaria para SQLAlchemy
    # (aunque la tabla real no tenga PK definida)
    id_empleado = Column("ID_EMPLEADO", String(20), primary_key=True)
    fecha = Column("FECHA", Date, primary_key=True)
    id_proyecto = Column("ID_PROYECTO", String(50), primary_key=True)

    # Sociedad asociada
    id_sociedad = Column("ID_SOCIEDAD", String(10))

    # Cliente asociado
    id_cliente = Column("ID_CLIENTE", String(50))

    # Número de horas trabajadas en el día
    horas_dia = Column("HORAS_DIA", Float)

    # Descripción de la tarea realizada
    desc_tarea = Column("DESC_TAREA", String(255))