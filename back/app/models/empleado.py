from sqlalchemy import Column, Integer, String
# EL CAMBIO ESTÁ AQUÍ: Añadimos "app." delante de database
from app.database import Base

class Empleado(Base):
    __tablename__ = "empleados"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    dni = Column(String(20), unique=True, index=True, nullable=False)
    codigo_fichaje = Column(String(50), unique=True, nullable=False)
    estado = Column(String(20), default="Activo")