# app/models/proyecto.py
from sqlalchemy import Column, String, Numeric, Date
from app.database import Base

class Proyecto(Base):

    __tablename__ = "PROYECTOS"

    id_sociedad = Column("ID_SOCIEDAD", String(10), index = True)
    id_proyecto = Column("ID_PROYECTO", String(50), nullable = False, primary_key = True)
    id_cliente = Column("ID_CLIENTE", String(50), index = True)

    nombre_proyecto = Column("NOMBRE_PROYECTO", String(255), nullable=False)
    codigo_proyecto_tracker = Column("CODIGO_PROYECTO_TRACKER", String(100))

    tipo_pago = Column("TIPO_PAGO", String(50))
    precio = Column("PRECIO", Numeric(15, 2), default = 0.00)
    fec_inicio = Column("FEC_INICIO", Date)