from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from sqlalchemy import create_engine, Column, String, Float, Date, Integer, ForeignKey, DECIMAL
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session
from sqlalchemy.schema import ForeignKeyConstraint

# ---------------------
# Configuración DB MySQL
# ---------------------
DATABASE_URL = "mysql+pymysql://root:1234@localhost/gestion_empresa"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# ---------------------
# Modelos
# ---------------------
class Cliente(Base):
    __tablename__ = "CLIENTES"
    id_sociedad = Column(String(10), primary_key=True)
    id_cliente = Column(String(20), primary_key=True)
    n_cliente = Column(String(200), nullable=False)
    cif = Column(String(20))
    persona_contacto = Column(String(150))
    direccion = Column(String(255))

class Empleado(Base):
    __tablename__ = "EMPLEADOS"
    id_empleado = Column(String(20), primary_key=True)
    id_empleado_tracker = Column(String(50))
    nombre = Column(String(100), nullable=False)
    apellidos = Column(String(150), nullable=False)
    matricula = Column(String(50))
    fec_alta = Column(Date, nullable=False)

class Proyecto(Base):
    __tablename__ = "PROYECTOS"
    id_proyecto = Column(String(50), primary_key=True)
    id_sociedad = Column(String(10), nullable=False)
    id_cliente = Column(String(20), nullable=False)
    codigo_proyecto_tracker = Column(String(50))
    tipo_pago = Column(Integer, nullable=False)
    precio = Column(DECIMAL(12,2), default=0.00)
    fec_inicio = Column(Date, nullable=False)

    __table_args__ = (
        ForeignKeyConstraint(
            ['id_sociedad', 'id_cliente'],
            ['CLIENTES.id_sociedad', 'CLIENTES.id_cliente']
        ),
    )

    tarifas = relationship("HistProyecto", back_populates="proyecto")

class HistProyecto(Base):
    __tablename__ = "HIST_PROYECTOS"
    id_sociedad = Column(String(10), primary_key=True)
    id_empleado = Column(String(20), primary_key=True)
    id_cliente = Column(String(20), primary_key=True)
    id_proyecto = Column(String(50), primary_key=True)
    fec_inicio = Column(Date, primary_key=True)
    tarifa = Column(DECIMAL(10,2), nullable=False)

    __table_args__ = (
        ForeignKeyConstraint(
            ['id_empleado'],
            ['EMPLEADOS.id_empleado']
        ),
        ForeignKeyConstraint(
            ['id_sociedad', 'id_cliente'],
            ['CLIENTES.id_sociedad', 'CLIENTES.id_cliente']
        ),
        ForeignKeyConstraint(
            ['id_proyecto'],
            ['PROYECTOS.id_proyecto']
        ),
    )

    proyecto = relationship("Proyecto", back_populates="tarifas")

# ---------------------
# Schemas Pydantic
# ---------------------
class ProyectoCreate(BaseModel):
    id_proyecto: str
    id_sociedad: str
    id_cliente: str
    codigo_proyecto_tracker: Optional[str] = None
    tipo_pago: int
    precio: float
    fec_inicio: date

class ProyectoUpdate(BaseModel):
    codigo_proyecto_tracker: Optional[str] = None
    tipo_pago: Optional[int] = None
    precio: Optional[float] = None
    fec_inicio: Optional[date] = None

class HistProyectoCreate(BaseModel):
    id_sociedad: str
    id_empleado: str
    id_cliente: str
    id_proyecto: str
    fec_inicio: date
    tarifa: float

class HistProyectoUpdate(BaseModel):
    tarifa: Optional[float] = None
    fec_inicio: Optional[date] = None

# ---------------------
# FastAPI app
# ---------------------
app = FastAPI(title="Módulo Proyectos y Tarifas - Gestión Empresa")

# Dependencia DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------
# CRUD Proyectos
# ---------------------
@app.post("/proyectos", response_model=ProyectoCreate)
def crear_proyecto(proyecto: ProyectoCreate, db: Session = Depends(get_db)):
    if db.query(Proyecto).filter_by(id_proyecto=proyecto.id_proyecto).first():
        raise HTTPException(status_code=400, detail="Proyecto ya existe")
    # Validar que el cliente exista
    if not db.query(Cliente).filter_by(id_sociedad=proyecto.id_sociedad, id_cliente=proyecto.id_cliente).first():
        raise HTTPException(status_code=400, detail="Cliente no existe")
    db_proy = Proyecto(**proyecto.dict())
    db.add(db_proy)
    db.commit()
    db.refresh(db_proy)
    return db_proy

@app.get("/proyectos", response_model=List[ProyectoCreate])
def listar_proyectos(db: Session = Depends(get_db)):
    return db.query(Proyecto).all()

@app.get("/proyectos/{id_proyecto}", response_model=ProyectoCreate)
def obtener_proyecto(id_proyecto: str, db: Session = Depends(get_db)):
    proy = db.query(Proyecto).filter_by(id_proyecto=id_proyecto).first()
    if not proy:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return proy

@app.put("/proyectos/{id_proyecto}", response_model=ProyectoCreate)
def actualizar_proyecto(id_proyecto: str, proyecto: ProyectoUpdate, db: Session = Depends(get_db)):
    db_proy = db.query(Proyecto).filter_by(id_proyecto=id_proyecto).first()
    if not db_proy:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    for field, value in proyecto.dict(exclude_unset=True).items():
        setattr(db_proy, field, value)
    db.commit()
    db.refresh(db_proy)
    return db_proy

@app.delete("/proyectos/{id_proyecto}")
def eliminar_proyecto(id_proyecto: str, db: Session = Depends(get_db)):
    db_proy = db.query(Proyecto).filter_by(id_proyecto=id_proyecto).first()
    if not db_proy:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    db.delete(db_proy)
    db.commit()
    return {"detail": "Proyecto eliminado"}

# ---------------------
# CRUD Tarifas
# ---------------------
@app.post("/tarifas", response_model=HistProyectoCreate)
def asignar_tarifa(tarifa: HistProyectoCreate, db: Session = Depends(get_db)):
    # Validar que proyecto exista
    if not db.query(Proyecto).filter_by(id_proyecto=tarifa.id_proyecto).first():
        raise HTTPException(status_code=400, detail="Proyecto no existe")
    # Validar que empleado exista
    if not db.query(Empleado).filter_by(id_empleado=tarifa.id_empleado).first():
        raise HTTPException(status_code=400, detail="Empleado no existe")
    # Validar que cliente exista
    if not db.query(Cliente).filter_by(id_sociedad=tarifa.id_sociedad, id_cliente=tarifa.id_cliente).first():
        raise HTTPException(status_code=400, detail="Cliente no existe")
    # Validar solapamiento de tarifas
    existing = db.query(HistProyecto).filter_by(
        id_empleado=tarifa.id_empleado,
        id_proyecto=tarifa.id_proyecto,
        fec_inicio=tarifa.fec_inicio
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe una tarifa para este empleado/proyecto en la fecha indicada")
    db_tarifa = HistProyecto(**tarifa.dict())
    db.add(db_tarifa)
    db.commit()
    db.refresh(db_tarifa)
    return db_tarifa

@app.get("/tarifas", response_model=List[HistProyectoCreate])
def listar_tarifas(db: Session = Depends(get_db)):
    return db.query(HistProyecto).all()

@app.put("/tarifas/{id_sociedad}/{id_empleado}/{id_proyecto}/{fec_inicio}", response_model=HistProyectoCreate)
def actualizar_tarifa(id_sociedad: str, id_empleado: str, id_proyecto: str, fec_inicio: date, tarifa: HistProyectoUpdate, db: Session = Depends(get_db)):
    db_tarifa = db.query(HistProyecto).filter_by(
        id_sociedad=id_sociedad,
        id_empleado=id_empleado,
        id_proyecto=id_proyecto,
        fec_inicio=fec_inicio
    ).first()
    if not db_tarifa:
        raise HTTPException(status_code=404, detail="Tarifa no encontrada")
    for field, value in tarifa.dict(exclude_unset=True).items():
        setattr(db_tarifa, field, value)
    db.commit()
    db.refresh(db_tarifa)
    return db_tarifa

@app.delete("/tarifas/{id_sociedad}/{id_empleado}/{id_proyecto}/{fec_inicio}")
def eliminar_tarifa(id_sociedad: str, id_empleado: str, id_proyecto: str, fec_inicio: date, db: Session = Depends(get_db)):
    db_tarifa = db.query(HistProyecto).filter_by(
        id_sociedad=id_sociedad,
        id_empleado=id_empleado,
        id_proyecto=id_proyecto,
        fec_inicio=fec_inicio
    ).first()
    if not db_tarifa:
        raise HTTPException(status_code=404, detail="Tarifa no encontrada")
    db.delete(db_tarifa)
    db.commit()
    return {"detail": "Tarifa eliminada"}

# ---------------------
# Crear tablas automáticamente
# ---------------------
Base.metadata.create_all(bind=engine)