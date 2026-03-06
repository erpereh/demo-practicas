from pydantic import BaseModel
from datetime import date
from typing import Optional


class HoraCreate(BaseModel):
    id_sociedad: str
    fecha: date
    id_empleado: str
    id_cliente: str
    id_proyecto: str
    horas_dia: float
    desc_tarea: Optional[str] = "Fichaje manual"


class HoraUpdate(BaseModel):
    horas_dia: Optional[float] = None
    desc_tarea: Optional[str] = None


class HoraOut(BaseModel):
    id_sociedad: str
    fecha: date
    id_empleado: str
    id_cliente: str
    id_proyecto: str
    horas_dia: float
    desc_tarea: Optional[str] = None