"""
Modelo ORM: Proyecto

Representa la tabla PROYECTOS en la base de datos.

Gestiona la información de proyectos asociados a clientes,
incluyendo datos económicos y referencias externas (Tracker).
"""

from sqlalchemy import Column, String, Numeric, Date
from app.database import Base


class Proyecto(Base):
    """
    Entidad Proyecto.

    Define los proyectos activos o históricos de la organización.
    """

    __tablename__ = "PROYECTOS"

    # Sociedad a la que pertenece el proyecto
    id_sociedad = Column(
        "ID_SOCIEDAD",
        String(10),
        index=True
    )

    # Identificador único del proyecto (clave primaria)
    id_proyecto = Column(
        "ID_PROYECTO",
        String(50),
        primary_key=True,
        nullable=False
    )

    # Cliente asociado al proyecto
    id_cliente = Column(
        "ID_CLIENTE",
        String(50),
        index=True
    )

    # Nombre descriptivo del proyecto
    nombre_proyecto = Column(
        "NOMBRE_PROYECTO",
        String(255),
        nullable=False
    )

    # Código del proyecto en sistema externo (Tracker)
    codigo_proyecto_tracker = Column(
        "CODIGO_PROYECTO_TRACKER",
        String(100)
    )

    # Tipo de pago (Bolsa, Cerrado, Horas, etc.)
    tipo_pago = Column(
        "TIPO_PAGO",
        String(50)
    )

    # Precio acordado del proyecto
    precio = Column(
        "PRECIO",
        Numeric(15, 2),
        default=0.00
    )

    # Fecha de inicio del proyecto
    fec_inicio = Column(
        "FEC_INICIO",
        Date
    )