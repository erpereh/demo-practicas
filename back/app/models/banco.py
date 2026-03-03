"""
Modelo ORM: Banco

Representa la tabla BANCOS en la base de datos.

Esta entidad almacena la información de los bancos asociados a una sociedad,
incluyendo datos identificativos y cuentas bancarias para gestión de cobros.

Se utiliza dentro del ORM de SQLAlchemy para permitir la manipulación de
registros bancarios como objetos Python.
"""

from sqlalchemy import Column, String
from app.database import Base


class Banco(Base):
    """
    Entidad Banco.

    Contiene la información de bancos utilizados para la gestión de cobros
    dentro de una sociedad.
    """

    __tablename__ = "BANCOS"

    # Identificador de la sociedad a la que pertenece el banco
    id_sociedad = Column(
        "ID_SOCIEDAD",
        String(10),
        nullable=False,
        index=True
    )

    # Identificador único del banco de cobro (clave primaria)
    id_banco_cobro = Column(
        "ID_BANCO_COBRO",
        String(20),
        primary_key=True,
        index=True
    )

    # Nombre descriptivo del banco
    n_banco_cobro = Column(
        "N_BANCO_COBRO",
        String(150),
        nullable=False
    )

    # Número de cuenta bancaria
    num_cuenta = Column(
        "NUM_CUENTA",
        String(50),
        nullable=True
    )

    # Código IBAN asociado a la cuenta bancaria
    codigo_iban = Column(
        "CODIGO_IBAN",
        String(50),
        nullable=True
    )