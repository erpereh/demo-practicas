from sqlalchemy import Column, String
from app.database import Base

class Empleado(Base):
    __tablename__ = "EMPLEADOS"

    id_empleado = Column("ID_EMPLEADO", String(20), primary_key=True, index=True)
    id_empleado_tracker = Column("ID_EMPLEADO_TRACKER", String(100), nullable=False, index=True)

    nombre = Column("NOMBRE", String(50), nullable=False)
    apellidos = Column("APELLIDOS", String(100), nullable=False)

    matricula = Column("MATRICULA", String(50), nullable=True)