import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Importamos la conexión a la base de datos (Asegúrate de que get_db está en database.py)
from app.database import get_db
# Importamos el modelo real de la base de datos MySQL
from app.models.empleado import Empleado 

# Creamos el router con el prefijo /api/empleados para que coincida con el Front
router = APIRouter(
    prefix="/api/empleados",
    tags=["Empleados"]
)

# ==========================================
# 1. ESQUEMAS PYDANTIC (Para validar datos Front <-> Back)
# ==========================================
class EmpleadoCreate(BaseModel):
    nombre: str
    dni: str
    codigo_fichaje: str
    estado: str = "Activo"

class EmpleadoResponse(BaseModel):
    id: int
    nombre: str
    dni: str
    codigo_fichaje: str
    estado: str

    class Config:
        from_attributes = True # Permite a Pydantic leer modelos de SQLAlchemy

# ==========================================
# 2. FUNCIONES AUXILIARES
# ==========================================
def validar_dni(dni: str) -> bool:
    """Valida que el DNI tenga 8 números y la letra correcta"""
    patron = r'^\d{8}[A-Z]$'
    if not re.match(patron, dni.upper()):
        return False
    letras = "TRWAGMYFPDXBNJZSQVHLCKE"
    numero = int(dni[:-1])
    return dni[-1].upper() == letras[numero % 23]


# ==========================================
# 3. RUTAS (ENDPOINTS) CONECTADAS A MYSQL
# ==========================================

# LISTAR EMPLEADOS (GET)
@router.get("/", response_model=list[EmpleadoResponse], summary="Listado de empleados")
def listar_empleados(db: Session = Depends(get_db)):
    # Hacemos una SELECT * FROM empleados en MySQL
    empleados = db.query(Empleado).all()
    return empleados


# CREAR EMPLEADO (POST)
@router.post("/", response_model=EmpleadoResponse, summary="Crear empleado")
def crear_empleado(empleado_in: EmpleadoCreate, db: Session = Depends(get_db)):
    dni_limpio = empleado_in.dni.upper().strip()

    # 1. Validar DNI real
    if not validar_dni(dni_limpio):
        raise HTTPException(
            status_code=400,
            detail="DNI no válido. Debe tener 8 números y la letra correcta."
        )

    # 2. Validar DNI único en la Base de Datos
    if db.query(Empleado).filter(Empleado.dni == dni_limpio).first():
        raise HTTPException(
            status_code=400,
            detail="Ya existe un empleado registrado con ese DNI."
        )

    # 3. Validar Código de Fichaje único
    if db.query(Empleado).filter(Empleado.codigo_fichaje == empleado_in.codigo_fichaje.strip()).first():
        raise HTTPException(
            status_code=400,
            detail="Ese código de fichaje ya está asignado a otro empleado."
        )

    # 4. Crear el registro en MySQL
    nuevo_empleado = Empleado(
        nombre=empleado_in.nombre.strip(),
        dni=dni_limpio,
        codigo_fichaje=empleado_in.codigo_fichaje.strip(),
        estado=empleado_in.estado
    )

    db.add(nuevo_empleado)
    db.commit() # Guardamos los cambios
    db.refresh(nuevo_empleado) # Refrescamos para obtener el ID autogenerado

    return nuevo_empleado


# EDITAR EMPLEADO (PUT)
@router.put("/{id_empleado}", response_model=EmpleadoResponse, summary="Editar empleado")
def editar_empleado(id_empleado: int, empleado_in: EmpleadoCreate, db: Session = Depends(get_db)):
    
    # Buscamos al empleado en la BBDD por su ID
    emp_db = db.query(Empleado).filter(Empleado.id == id_empleado).first()
    
    if not emp_db:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    # Actualizamos los datos
    emp_db.nombre = empleado_in.nombre.strip()
    emp_db.dni = empleado_in.dni.upper().strip()
    emp_db.codigo_fichaje = empleado_in.codigo_fichaje.strip()
    emp_db.estado = empleado_in.estado

    db.commit()
    db.refresh(emp_db)
    
    return emp_db


# ARCHIVAR/ELIMINAR EMPLEADO (DELETE o PATCH)
@router.delete("/{id_empleado}", summary="Archivar empleado (Soft Delete)")
def archivar_empleado(id_empleado: int, db: Session = Depends(get_db)):
    emp_db = db.query(Empleado).filter(Empleado.id == id_empleado).first()
    
    if not emp_db:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    # En lugar de borrarlo físicamente, lo marcamos como inactivo (Soft delete)
    emp_db.estado = "Inactivo"
    db.commit()

    return {"mensaje": "Empleado archivado correctamente"}