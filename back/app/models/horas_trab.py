from sqlalchemy import Column, Date, Float, String

from app.database import Base


class HorasTrab(Base):
    __tablename__ = "HORAS_TRAB"

    id_empleado = Column("ID_EMPLEADO", String(20), primary_key=True)
    fecha = Column("FECHA", Date, primary_key=True)
    id_proyecto = Column("ID_PROYECTO", String(50), primary_key=True)

    id_sociedad = Column("ID_SOCIEDAD", String(10))
    id_cliente = Column("ID_CLIENTE", String(50))
    horas_dia = Column("HORAS_DIA", Float)
    desc_tarea = Column("DESC_TAREA", String(255))
    estado = Column("ESTADO", String(50))
    id_factura = Column("ID_FACTURA", String(50))
    origen = Column("ORIGEN", String(50))
