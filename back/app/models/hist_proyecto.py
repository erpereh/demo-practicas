from sqlalchemy import Column, String, Date, Numeric, ForeignKey
from app.database import Base

class HistProyecto(Base):
    __tablename__ = "HIST_PROYECTOS"

    id_sociedad = Column("ID_SOCIEDAD", String(10), primary_key=True)

    id_empleado = Column("ID_EMPLEADO", String(20), ForeignKey("EMPLEADOS.ID_EMPLEADO"), primary_key=True, index=True)

    id_cliente = Column("ID_CLIENTE", String(50), ForeignKey("CLIENTES.ID_CLIENTE"), primary_key=True, index=True)

    id_proyecto = Column("ID_PROYECTO", String(50), ForeignKey("PROYECTOS.ID_PROYECTO"), primary_key=True, index=True )

    fec_inicio = Column("FEC_INICIO", Date, nullable=False)

    tarifa = Column("TARIFA", Numeric(10, 2), nullable=False)