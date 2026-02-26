from sqlalchemy import Column, Integer, String, Float, Date
from app.database import Base

class HorasTrab(Base):
    __tablename__ = "horas_trab"

    id = Column(Integer, primary_key=True, index=True)
    id_sociedad = Column(String(50), nullable=True)
    id_empleado = Column(String(50), index=True, nullable=False)
    fecha = Column(Date, nullable=False)
    id_cliente = Column(String(50), nullable=True)
    id_proyecto = Column(String(50), index=True, nullable=True)
    horas_dia = Column(Float, nullable=False)
    desc_tarea = Column(String(255), nullable=True)
    origen = Column(String(50), default="MANUAL")
    estado = Column(String(50), default="PENDIENTE")