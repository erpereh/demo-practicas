from sqlalchemy import Column, String
from app.database import Base

class Banco(Base):
    __tablename__ = "BANCOS"

    id_sociedad = Column("ID_SOCIEDAD", String(10), nullable=False, index=True)
    id_banco_cobro = Column("ID_BANCO_COBRO", String(20), primary_key=True, index=True)

    n_banco_cobro = Column("N_BANCO_COBRO", String(150), nullable=False)
    num_cuenta = Column("NUM_CUENTA", String(50), nullable=True)
    codigo_iban = Column("CODIGO_IBAN", String(50), nullable=True)