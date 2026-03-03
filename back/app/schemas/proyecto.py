# ESQUEMA Pydantic para PROYECTOS
# Define las estructuras de entrada/salida para PROYECTOS y aplica validaciones fuertes:
# - normaliza textos (IDs y nombres)
# - valida TIPO_PAGO contra un conjunto permitido
# - valida y convierte fechas (ISO 8601)
# - valida y cuantiza PRECIO con Decimal (2 decimales, no negativo, límite máximo)
import re
from datetime import date
from decimal import Decimal
from typing import Optional

# ------------- COMPATIBILIDAD PYDANTIC v1 / v2 -------------
# Importa Pydantic detectando si estamos en v2 (field_validator) o v1 (validator),
# y define la bandera V2 para elegir el decorador correcto en los validadores.
try:
    from pydantic import BaseModel, Field, field_validator
    V2 = True
except Exception:
    from pydantic import BaseModel, Field, validator
    V2 = False

# ------------- LIMPIA TEXTO -------------
# - quita espacios al principio y al final
# - colapsa espacios múltiples a uno solo
# - devuelve None si el texto queda vacío
def _clean_text(s: str | None) -> str | None:
    if s is None:
        return None
    s = " ".join(s.strip().split())
    return s if s else None

# ------------- TIPOS DE PAGO VÁLIDOS -------------
# Conjunto de valores permitidos para el campo TIPO_PAGO del proyecto.
# Se usa para impedir valores fuera del catálogo (regla de negocio).
TIPOS_PAGO_VALIDOS = { "ABIERTO", "CERRADO", "FRACCIONADO" }

# ------------- VALIDA TIPO_PAGO -------------
# - normaliza el texto (strip + upper)
# - comprueba que pertenezca a TIPOS_PAGO_VALIDOS
# - si no, lanza error con el listado de opciones válidas
def _validate_tipo_pago(v: str) -> str:
    v = v.strip().upper()
    if v not in TIPOS_PAGO_VALIDOS:
        raise ValueError(f"TIPO_PAGO no válido. Opciones: {', '.join(sorted(TIPOS_PAGO_VALIDOS))}")
    return v

# ------------- VALIDA FECHA (FEC_INICIO) -------------
# - admite date ya construido o string
# - si es string, intenta parsear formato ISO (YYYY-MM-DD)
# - si falla, lanza error explicando el formato esperado
def _validate_fecha(v: date | str) -> date:
    if isinstance(v, date):
        return v
    try:
        return date.fromisoformat(str(v).strip())
    except ValueError:
        raise ValueError("FEC_INICIO debe tener formato ISO 8601: YYYY-MM-DD")


# ------------- VALIDA PRECIO -------------
# - admite Decimal/float/None
# - convierte a Decimal y fuerza 2 decimales (quantize 0.01)
# - impide valores negativos
# - impide que supere el máximo permitido (15 dígitos, 2 decimales)
# - devuelve Decimal normalizado o None si no se informa
def _validate_precio(v: Decimal | float | None) -> Decimal | None:
    if v is None:
        return None
    try:
        d = Decimal(str(v)).quantize(Decimal("0.01"))
    except Exception:
        raise ValueError("PRECIO no es un número válido")
    if d < 0:
        raise ValueError("PRECIO no puede ser negativo")
    if d > Decimal("9999999999999.99"):
        raise ValueError("PRECIO supera el límite permitido (15 dígitos, 2 decimales)")
    return d

# ------------- EMBED DE CLIENTE (ClienteEmbed) -------------
# Schema ligero para incluir datos mínimos del cliente dentro de la respuesta del proyecto,
# evitando devolver todo el objeto cliente completo cuando solo interesa id y nombre.
class ClienteEmbed(BaseModel):
    id_cliente: str
    n_cliente:  str

    if V2:
        model_config = {"from_attributes": True}
    else:
        class Config:
            orm_mode = True

# ------------- CREAR PROYECTOS -------------
# Modelo de entrada para crear un proyecto:
# obliga a informar identificadores (sociedad/cliente/proyecto), nombre, tracker, tipo de pago y fecha de inicio;
# permite precio opcional.
class ProyectoCreate(BaseModel):
    id_sociedad: str = Field(..., min_length = 1, max_length = 10)
    id_proyecto: str = Field(..., min_length = 1, max_length = 50)
    id_cliente: str = Field(..., min_length = 1, max_length = 50)
    nombre_proyecto: str = Field(..., min_length = 1, max_length = 255)
    codigo_proyecto_tracker: str = Field(..., min_length = 1, max_length = 100)
    tipo_pago: str = Field(..., min_length = 1, max_length = 50)
    precio: Decimal | None = Field(default = None)
    fec_inicio: date = Field(...)

    if V2:
        # Validador de ProyectoCreate.id_sociedad:
        # - limpia y pasa a mayúsculas
        # - exige patrón permitido (solo letras/números y guion, sin espacios)
        @field_validator("id_sociedad")
        @classmethod
        def val_sociedad(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9-]{1,10}", v):
                raise ValueError("ID_SOCIEDAD: solo letras/números, sin espacios")
            return v

        # Validador de ProyectoCreate.id_proyecto:
        # - limpia y pasa a mayúsculas
        # - valida que cumpla patrón permitido para IDs
        # - evita espacios y caracteres no deseados
        @field_validator("id_proyecto")
        @classmethod
        def val_id_proyecto(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9-]{1,50}", v):
                raise ValueError("ID_PROYECTO: alfanumérico (y _), 2-5 caracteres, sin espacios")
            return v

        # Validador de ProyectoCreate.id_cliente:
        # - limpia y pasa a mayúsculas
        # - valida que cumpla patrón permitido para IDs
        # - evita espacios y caracteres no deseados
        @field_validator("id_cliente")
        @classmethod
        def val_id_cliente(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9-]{1,50}", v):
                raise ValueError("ID_CLIENTE: alfanumérico (y _), 2-5 caracteres, sin espacios")
            return v
        
        # Validador de ProyectoCreate.nombre_proyecto:
        # - limpia espacios sobrantes
        # - exige longitud mínima real (evita nombres vacíos o demasiado cortos)
        @field_validator("nombre_proyecto")
        @classmethod
        def val_nombre(cls, v: str) -> str:
            v = _clean_text(v) or ""
            if len(v) < 2:
                raise ValueError("NOMBRE_PROYECTO demasiado corto")
            return v

        # Validador de ProyectoCreate.codigo_proyecto_tracker:
        # - limpia y pasa a mayúsculas
        # - obliga a que no esté vacío (necesario para enlazar con sistema tracker)
        @field_validator("codigo_proyecto_tracker")
        @classmethod
        def val_tracker(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()
            if not v:
                raise ValueError("CODIGO_PROYECTO_TRACKER no puede estar vacío")
            return v

        # Validador de ProyectoCreate.tipo_pago:
        # - normaliza y valida contra el catálogo TIPOS_PAGO_VALIDOS
        @field_validator("tipo_pago")
        @classmethod
        def val_tipo_pago(cls, v: str) -> str:
            return _validate_tipo_pago(v)

        # Validador de ProyectoCreate.fec_inicio:
        # - valida/convierte desde string (pre/before) a date
        # - exige formato ISO si viene como texto
        @field_validator("fec_inicio", mode="before")
        @classmethod
        def val_fecha(cls, v) -> date:
            return _validate_fecha(v)

        # Validador de ProyectoCreate.precio:
        # - valida/convierte desde float/string a Decimal con 2 decimales (pre/before)
        # - impide negativo y controla límite máximo
        @field_validator("precio", mode="before")
        @classmethod
        def val_precio(cls, v) -> Decimal | None:
            return _validate_precio(v)

    else:
        @validator("id_sociedad")
        def val_sociedad(cls, v):
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9-]{1,10}", v):
                raise ValueError("ID_SOCIEDAD: solo letras/números, sin espacios")
            return v

        @validator("id_proyecto")
        def val_id_proyecto(cls, v):
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9-]{1,50}", v):
                raise ValueError("ID_PROYECTO: alfanumérico (y _), 2-5 caracteres, sin espacios")
            return v

        @validator("id_cliente")
        def val_id_cliente(cls, v):
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9-]{1,50}", v):
                raise ValueError("ID_CLIENTE: alfanumérico (y _), 2-5 caracteres, sin espacios")
            return v

        @validator("nombre_proyecto")
        def val_nombre(cls, v):
            v = _clean_text(v) or ""
            if len(v) < 2:
                raise ValueError("NOMBRE_PROYECTO demasiado corto")
            return v

        @validator("codigo_proyecto_tracker")
        def val_tracker(cls, v):
            v = (_clean_text(v) or "").upper()
            if not v:
                raise ValueError("CODIGO_PROYECTO_TRACKER no puede estar vacío")
            return v

        @validator("tipo_pago")
        def val_tipo_pago(cls, v):
            return _validate_tipo_pago(v)

        @validator("fec_inicio", pre=True)
        def val_fecha(cls, v):
            return _validate_fecha(v)

        @validator("precio", pre=True, always=True)
        def val_precio(cls, v):
            return _validate_precio(v)

# ------------- ACTUALIZAR PROYECTOS -------------
# Modelo de entrada para actualizar un proyecto:
# todos los campos son opcionales para permitir cambios parciales,
# aplicando las mismas validaciones que en create cuando el campo viene informado.
class ProyectoUpdate(BaseModel):
    nombre_proyecto: str | None = Field(default = None, min_length = 1, max_length = 255)
    codigo_proyecto_tracker: str | None = Field(default = None, min_length = 1, max_length = 100)
    tipo_pago: str | None = Field(default = None, min_length = 1, max_length = 50)
    precio: Decimal | None = Field(default = None)
    fec_inicio: date | None = Field(default = None)

    if V2:
        # Validador de ProyectoUpdate.nombre_proyecto:
        # - si viene None, no se modifica
        # - si viene texto, se limpia y exige longitud mínima
        @field_validator("nombre_proyecto")
        @classmethod
        def val_nombre(cls, v: str | None) -> str | None:
            if v is None:
                return None
            v2 = _clean_text(v) or ""
            if len(v2) < 2:
                raise ValueError("NOMBRE_PROYECTO demasiado corto")
            return v2

        # Validador de ProyectoUpdate.codigo_proyecto_tracker:
        # - si viene, se limpia y pasa a mayúsculas
        # - evita guardar valores con espacios basura
        @field_validator("codigo_proyecto_tracker")
        @classmethod
        def val_tracker(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return (_clean_text(v) or "").upper()

        # Validador de ProyectoUpdate.tipo_pago:
        # - si viene, se valida contra TIPOS_PAGO_VALIDOS
        @field_validator("tipo_pago")
        @classmethod
        def val_tipo_pago(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return _validate_tipo_pago(v)

        # Validador de ProyectoUpdate.fec_inicio:
        # - si viene, se parsea/valida a date (ISO YYYY-MM-DD)
        @field_validator("fec_inicio", mode="before")
        @classmethod
        def val_fecha(cls, v) -> date | None:
            if v is None:
                return None
            return _validate_fecha(v)

        # Validador de ProyectoUpdate.precio:
        # - si viene, se normaliza a Decimal con 2 decimales
        # - valida límites y no negatividad
        @field_validator("precio", mode="before")
        @classmethod
        def val_precio(cls, v) -> Decimal | None:
            return _validate_precio(v)

    else:
        @validator("nombre_proyecto")
        def val_nombre(cls, v):
            if v is None:
                return None
            v2 = _clean_text(v) or ""
            if len(v2) < 2:
                raise ValueError("NOMBRE_PROYECTO demasiado corto")
            return v2

        @validator("codigo_proyecto_tracker")
        def val_tracker(cls, v):
            if v is None:
                return None
            return (_clean_text(v) or "").upper()

        @validator("tipo_pago")
        def val_tipo_pago(cls, v):
            if v is None:
                return None
            return _validate_tipo_pago(v)

        @validator("fec_inicio", pre=True, always=True)
        def val_fecha(cls, v):
            if v is None:
                return None
            return _validate_fecha(v)

        @validator("precio", pre=True, always=True)
        def val_precio(cls, v):
            return _validate_precio(v)

# ------------- SALIDA (ProyectoOut) -------------
# Define el formato de respuesta al frontend:
# incluye los campos principales del proyecto y un embed opcional de cliente (ClienteEmbed),
# para mostrar información relacionada sin hacer otra llamada.
# Configuración Pydantic v2:
# permite crear ProyectoOut desde instancias ORM usando from_attributes.
# Configuración alternativa Pydantic v1:
# permite crear ProyectoOut desde instancias ORM usando orm_mode.
class ProyectoOut(BaseModel):
    id_sociedad: str
    id_proyecto: str
    id_cliente: str
    nombre_proyecto: str
    codigo_proyecto_tracker: str
    tipo_pago: str
    precio: Decimal | None = None
    fec_inicio: date
    cliente: Optional[ClienteEmbed] = None

    if V2:
        model_config = {"from_attributes": True}
    else:
        class Config:
            orm_mode = True