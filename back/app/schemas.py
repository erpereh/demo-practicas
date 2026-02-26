from pydantic import BaseModel

class EmpleadoBase(BaseModel):
    nombre: str
    dni: str
    codigo_fichaje: str
    estado: str = "Activo"

class EmpleadoCreate(EmpleadoBase):
    pass

class EmpleadoResponse(EmpleadoBase):
    id: int
    
    class Config:
        from_attributes = True