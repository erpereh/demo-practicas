"""
Modelo ORM: Empleado

Representa la tabla EMPLEADOS en la base de datos.

Contiene la información básica de los empleados de la organización,
incluyendo identificadores internos y externos (por ejemplo, Tracker).
"""

from sqlalchemy import Column, String
from app.database import Base


class Empleado(Base):
    """
    Entidad Empleado.

    Gestiona la información identificativa del personal.
    """

    __tablename__ = "EMPLEADOS"

    # Identificador único del empleado (clave primaria)
    id_empleado = Column(
        "ID_EMPLEADO",
        String(20),
        primary_key=True,
        index=True
    )

    # Identificador externo del empleado (por ejemplo, sistema Tracker)
    id_empleado_tracker = Column(
        "ID_EMPLEADO_TRACKER",
        String(100),
        nullable=False,
        index=True
    )

    # Nombre del empleado
    nombre = Column(
        "NOMBRE",
        String(50),
        nullable=False
    )

    # Apellidos del empleado
    apellidos = Column(
        "APELLIDOS",
        String(100),
        nullable=False
    )

    # Matrícula o código interno adicional
    matricula = Column(
        "MATRICULA",
        String(50),
        nullable=True
    )