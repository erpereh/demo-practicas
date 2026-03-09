"""
Modelo ORM: Cliente

Representa la tabla CLIENTES en la base de datos.

Esta entidad almacena la información de los clientes de la empresa,
permitiendo su gestión dentro del sistema (facturación, proyectos, etc.).

Incluye índices para optimizar búsquedas por sociedad y CIF.
"""

from sqlalchemy import Column, String, Text, Index
from app.database import Base


class Cliente(Base):
    """
    Entidad Cliente.

    Gestiona la información fiscal y de contacto de los clientes.
    """

    __tablename__ = "CLIENTES"

    # Identificador de la sociedad a la que pertenece el cliente
    id_sociedad = Column(
        "ID_SOCIEDAD",
        String(5),
        nullable=False,
        index=True
    )

    # Identificador único del cliente (clave primaria)
    id_cliente = Column(
        "ID_CLIENTE",
        String(20),
        primary_key=True,
        index=True
    )

    # Nombre o razón social del cliente
    n_cliente = Column(
        "N_CLIENTE",
        String(255),
        nullable=False
    )

    # CIF o NIF del cliente (indexado para búsquedas rápidas)
    cif = Column(
        "CIF",
        String(20),
        nullable=False,
        index=True
    )

    # Persona de contacto principal
    persona_contacto = Column(
        "PERSONA_CONTACTO",
        String(255),
        nullable=True
    )

    # Dirección completa del cliente
    direccion = Column(
        "DIRECCION",
        Text,
        nullable=True
    )

    # Email de contacto del cliente
    email = Column(
        "EMAIL",
        String(255),
        nullable=True
    )

    # Teléfono de contacto del cliente
    telefono = Column(
        "TELEFONO",
        String(50),
        nullable=True
    )

    # Índice compuesto para búsquedas eficientes por sociedad y CIF
    __table_args__ = (
        Index("ix_clientes_sociedad_cif", "ID_SOCIEDAD", "CIF"),
    )