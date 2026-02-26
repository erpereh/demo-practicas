from sqlalchemy import Column, Integer, String
from app.database import Base

class Banco(Base):
    __tablename__ = "bancos"

    id = Column(Integer, primary_key=True, index=True)
    entidad = Column(String(100), nullable=False)
    iban = Column(String(34), unique=True, index=True, nullable=False)
    estado = Column(String(20), default="Principal")