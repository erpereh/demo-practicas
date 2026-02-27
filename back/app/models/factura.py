from sqlalchemy import Column, String, Date, Text, ForeignKey, Numeric
from app.database import Base

class Factura(Base):
    __tablename__ = "FACTURAS" #Tabla FACTURAS del SQL:

    id_sociedad = Column("ID_SOCIEDAD", String(5), nullable=False, index=True) #Ej: 01
    #id_cliente es una clave foránea con CLIENTES
    id_cliente = Column("ID_CLIENTE", String(20), ForeignKey("CLIENTES.ID_CLIENTE"), nullable=False, index=True) #CYC

    num_factura = Column("NUM_FACTURA", String(20), primary_key=True, index=True) #QS260001
    fec_factura = Column("FEC_FACTURA", Date, nullable=False) #2026-01-31

    concepto = Column("CONCEPTO", Text, nullable=False) #CYCPR00022 RRHH - Portal empleado...

    base_imponible = Column("BASE_IMPONIBLE", Numeric(10, 2), nullable=False) #472.50
    total = Column("TOTAL", Numeric(10, 2), nullable=False) #571.73