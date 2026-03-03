"""
Modelo ORM: Factura

Representa la tabla FACTURAS en la base de datos.

Gestiona la información relativa a la facturación emitida a clientes,
incluyendo datos fiscales, importes y referencias al cliente asociado.
"""

from sqlalchemy import Column, String, Date, Text, ForeignKey, Numeric
from app.database import Base


class Factura(Base):
    """
    Entidad Factura.

    Almacena los datos económicos y fiscales de una factura emitida.
    """

    __tablename__ = "FACTURAS"

    # Identificador de la sociedad emisora
    id_sociedad = Column(
        "ID_SOCIEDAD",
        String(5),
        nullable=False,
        index=True
    )

    # Cliente asociado a la factura (clave foránea)
    id_cliente = Column(
        "ID_CLIENTE",
        String(20),
        ForeignKey("CLIENTES.ID_CLIENTE"),
        nullable=False,
        index=True
    )

    # Número único de factura (clave primaria)
    num_factura = Column(
        "NUM_FACTURA",
        String(20),
        primary_key=True,
        index=True
    )

    # Fecha de emisión de la factura
    fec_factura = Column(
        "FEC_FACTURA",
        Date,
        nullable=False
    )

    # Concepto o descripción detallada
    concepto = Column(
        "CONCEPTO",
        Text,
        nullable=False
    )

    # Base imponible de la factura
    base_imponible = Column(
        "BASE_IMPONIBLE",
        Numeric(10, 2),
        nullable=False
    )

    # Importe total (incluyendo impuestos)
    total = Column(
        "TOTAL",
        Numeric(10, 2),
        nullable=False
    )