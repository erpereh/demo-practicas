from sqlalchemy import Column, String, Text, Index
from app.database import Base

class Cliente(Base):
    __tablename__ = "CLIENTES"  # importante: mismo nombre que en MySQL

    id_sociedad = Column("ID_SOCIEDAD", String(5), nullable=False, index=True)
    id_cliente = Column("ID_CLIENTE", String(20), primary_key=True, index=True)

    n_cliente = Column("N_CLIENTE", String(255), nullable=False)
    cif = Column("CIF", String(20), nullable=False, index=True)

    persona_contacto = Column("PERSONA_CONTACTO", String(255), nullable=True)
    direccion = Column("DIRECCION", Text, nullable=True)

    __table_args__ = (
        Index("ix_clientes_sociedad_cif", "ID_SOCIEDAD", "CIF"),
    )