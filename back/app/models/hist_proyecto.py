"""
Modelo ORM: HistProyecto

Representa la tabla HIST_PROYECTOS en la base de datos.

Gestiona el histórico de asignaciones de empleados a proyectos,
incluyendo cliente, sociedad y tarifa aplicada.

Utiliza clave primaria compuesta.
"""

from sqlalchemy import Column, String, Date, Numeric, ForeignKey
from app.database import Base


class HistProyecto(Base):
    """
    Entidad HistProyecto.

    Registra la asignación de empleados a proyectos con su tarifa correspondiente.
    """

    __tablename__ = "HIST_PROYECTOS"

    # Sociedad
    id_sociedad = Column(
        "ID_SOCIEDAD",
        String(10),
        primary_key=True
    )

    # Empleado asignado (clave foránea)
    id_empleado = Column(
        "ID_EMPLEADO",
        String(20),
        ForeignKey("EMPLEADOS.ID_EMPLEADO"),
        primary_key=True,
        index=True
    )

    # Cliente asociado (clave foránea)
    id_cliente = Column(
        "ID_CLIENTE",
        String(50),
        ForeignKey("CLIENTES.ID_CLIENTE"),
        primary_key=True,
        index=True
    )

    # Proyecto asignado (clave foránea)
    id_proyecto = Column(
        "ID_PROYECTO",
        String(50),
        ForeignKey("PROYECTOS.ID_PROYECTO"),
        primary_key=True,
        index=True
    )

    # Fecha de inicio de la asignación
    fec_inicio = Column(
        "FEC_INICIO",
        Date,
        nullable=False
    )

    # Tarifa económica asignada al empleado en el proyecto
    tarifa = Column(
        "TARIFA",
        Numeric(10, 2),
        nullable=False
    )