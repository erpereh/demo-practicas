from sqlalchemy import Column, Integer, String
from app.database import Base

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    cif = Column(String(20), unique=True, index=True, nullable=False)
    contacto = Column(String(100), nullable=True)
    direccion = Column(String(255), nullable=True)
    estado = Column(String(20), default="Activo")