# Esquemas Pydantic para EMPLEADOS:
# definen los formatos de entrada/salida entre Front <-> Back,
# e incluyen validación fuerte de DNI/NIE y normalización de textos.

import re

try:
    from pydantic import BaseModel, Field, field_validator
    V2 = True
except Exception:
    from pydantic import BaseModel, Field, validator
    V2 = False

# -------------- TABLA letras de CONTROL para DNI/NIE --------------
# se usa para calcular la letra correcta a partir del número.
NIF_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE"

# -------------- Función LIMPIA TEXTOS libres --------------
# - quita espacios al principio y al final
# - colapsa múltiples espacios en uno solo
# - devuelve None si queda vacío.
def clean(s: str | None) -> str | None:
    if s is None:
        return None
    s = " ".join(s.strip().split())
    return s if s else None

# -------------- Función NORMALIZA un IDENTIFICADOR --------------
# - elimina espacios, guiones y puntos
# - convierte a mayúsculas
# - garantiza un formato consistente para validar y comparar.
def norm_id(v: str) -> str:
    return re.sub(r"[\s\-\.]", "", v).upper().strip()


# -------------- Valida ID del EMPLEADO --------------
# - normaliza el valor con norm_id
# - si es DNI (8 dígitos + letra), calcula la letra esperada con NIF_LETTERS
#   y comprueba que coincida.
# - si es NIE (X/Y/Z + 7 dígitos + letra), convierte X/Y/Z a 0/1/2,
#   calcula el control como si fuera un DNI y compara la letra.
# - si no encaja en ninguno de los formatos o el control no coincide,
#   lanza ValueError con un mensaje claro.
def validate_dni_nie(value: str) -> str:
    v = norm_id(value)

    if re.fullmatch(r"\d{8}[A-Z]", v):
        num = int(v[:8])
        if NIF_LETTERS[num % 23] != v[8]:
            raise ValueError("ID_EMPLEADO inválido (DNI letra incorrecta)")
        return v

    if re.fullmatch(r"[XYZ]\d{7}[A-Z]", v):
        mapped = {"X": "0", "Y": "1", "Z": "2"}[v[0]] + v[1:8]
        num = int(mapped)
        if NIF_LETTERS[num % 23] != v[8]:
            raise ValueError("ID_EMPLEADO inválido (NIE letra incorrecta)")
        return v

    raise ValueError("ID_EMPLEADO debe ser un DNI/NIE válido (ej: 02906525S)")


# -------------- CREAR EMPLEADOS --------------
# incluye todos los campos necesarios para insertar en la tabla EMPLEADOS,
# con límites de longitud acordes a MySQL y matrícula como opcional.
class EmpleadoCreate(BaseModel):
    id_empleado: str = Field(..., min_length=8, max_length=20)
    id_empleado_tracker: str = Field(..., min_length=1, max_length=100)
    nombre: str = Field(..., min_length=2, max_length=50)
    apellidos: str = Field(..., min_length=2, max_length=100)
    matricula: str | None = Field(default=None, max_length=50)

    if V2:
        # Validador de EmpleadoCreate.id_empleado:
        # asegura que el ID tenga un DNI/NIE válido (formato + letra de control).
        @field_validator("id_empleado")
        @classmethod
        def v_id_empleado(cls, v: str) -> str:
            return validate_dni_nie(v)

        # Validador de EmpleadoCreate.id_empleado_tracker:
        # limpia el texto y comprueba que esté en rango 1-100 caracteres,
        # evitando trackers vacíos o demasiado largos.
        @field_validator("id_empleado_tracker")
        @classmethod
        def v_tracker(cls, v: str) -> str:
            v2 = clean(v) or ""
            if len(v2) < 1 or len(v2) > 100:
                raise ValueError("ID_EMPLEADO_TRACKER: 1-100 caracteres")
            return v2

        # Validador de EmpleadoCreate.nombre y EmpleadoCreate.apellidos:
        # limpia espacios y exige longitud mínima real, evitando valores vacíos o de 1 carácter.
        @field_validator("nombre", "apellidos")
        @classmethod
        def v_text(cls, v: str) -> str:
            v2 = clean(v) or ""
            if len(v2) < 2:
                raise ValueError("Texto demasiado corto")
            return v2

        # Validador de EmpleadoCreate.matricula:
        # normaliza el texto y convierte valores vacíos en None para guardar NULL en la BBDD.
        @field_validator("matricula")
        @classmethod
        def v_matricula(cls, v: str | None) -> str | None:
            return clean(v)
    else:
        @validator("id_empleado")
        def v_id_empleado(cls, v: str) -> str:
            return validate_dni_nie(v)

        @validator("id_empleado_tracker")
        def v_tracker(cls, v: str) -> str:
            v2 = clean(v) or ""
            if len(v2) < 1 or len(v2) > 100:
                raise ValueError("ID_EMPLEADO_TRACKER: 1-100 caracteres")
            return v2

        @validator("nombre", "apellidos")
        def v_text(cls, v: str) -> str:
            v2 = clean(v) or ""
            if len(v2) < 2:
                raise ValueError("Texto demasiado corto")
            return v2

        @validator("matricula")
        def v_matricula(cls, v: str | None) -> str | None:
            return clean(v)

# -------------- ACTUALIZAR EMPLEADOS --------------
# todos los campos son opcionales para permitir actualizaciones parciales
# (solo se envía lo que se quiera cambiar).
class EmpleadoUpdate(BaseModel):
    id_empleado_tracker: str | None = Field(default=None, min_length=1, max_length=100)
    nombre: str | None = Field(default=None, min_length=2, max_length=50)
    apellidos: str | None = Field(default=None, min_length=2, max_length=100)
    matricula: str | None = Field(default=None, max_length=50)


# -------------- Modelo de SALIDA EmpleadoOut --------------
# define los campos que el backend devuelve al frontend al listar o consultar empleados.
# Configuración para Pydantic v2:
# permite construir el schema desde instancias ORM con from_attributes.
# Configuración alternativa para Pydantic v1:
# activa orm_mode para permitir crear EmpleadoOut desde objetos SQLAlchemy.
class EmpleadoOut(BaseModel):
    id_empleado: str
    id_empleado_tracker: str
    nombre: str
    apellidos: str
    matricula: str | None = None

    if V2:
        model_config = {"from_attributes": True}
    else:
        class Config:
            orm_mode = True