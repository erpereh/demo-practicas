# app/schemas/proyecto.py
import re
from datetime import date
from decimal import Decimal

# Compatible con Pydantic v1 y v2
try:
    from pydantic import BaseModel, Field, field_validator
    V2 = True
except Exception:
    from pydantic import BaseModel, Field, validator
    V2 = False


def _clean_text(s: str | None) -> str | None:
    if s is None:
        return None
    s = " ".join(s.strip().split())
    return s if s else None

TIPOS_PAGO_VALIDOS = { "ABIERTO", "CERRADO", "FRACCIONADO" }

def _validate_tipo_pago(v: str) -> str:
    v = v.strip().upper()
    if v not in TIPOS_PAGO_VALIDOS:
        raise ValueError(f"TIPO_PAGO no válido. Opciones: {', '.join(sorted(TIPOS_PAGO_VALIDOS))}")
    return v

def _validate_fecha(v: date | str) -> date:
    if isinstance(v, date):
        return v
    try:
        return date.fromisoformat(str(v).strip())
    except ValueError:
        raise ValueError("FEC_INICIO debe tener formato ISO 8601: YYYY-MM-DD")

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


# --- Schemas ---
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
        @field_validator("id_sociedad")
        @classmethod
        def val_sociedad(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9]{1,10}", v):
                raise ValueError("ID_SOCIEDAD: solo letras/números, sin espacios")
            return v

        @field_validator("id_proyecto")
        @classmethod
        def val_id_proyecto(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9_]{1,50}", v):
                raise ValueError("ID_PROYECTO: alfanumérico (y _), 2-5 caracteres, sin espacios")
            return v

        @field_validator("id_cliente")
        @classmethod
        def val_id_cliente(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9_]{1,50}", v):
                raise ValueError("ID_CLIENTE: alfanumérico (y _), 2-5 caracteres, sin espacios")
            return v

        @field_validator("nombre_proyecto")
        @classmethod
        def val_nombre(cls, v: str) -> str:
            v = _clean_text(v) or ""
            if len(v) < 2:
                raise ValueError("NOMBRE_PROYECTO demasiado corto")
            return v

        @field_validator("codigo_proyecto_tracker")
        @classmethod
        def val_tracker(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()
            if not v:
                raise ValueError("CODIGO_PROYECTO_TRACKER no puede estar vacío")
            return v

        @field_validator("tipo_pago")
        @classmethod
        def val_tipo_pago(cls, v: str) -> str:
            return _validate_tipo_pago(v)

        @field_validator("fec_inicio", mode="before")
        @classmethod
        def val_fecha(cls, v) -> date:
            return _validate_fecha(v)

        @field_validator("precio", mode="before")
        @classmethod
        def val_precio(cls, v) -> Decimal | None:
            return _validate_precio(v)

    else:
        @validator("id_sociedad")
        def val_sociedad(cls, v):
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9]{1,10}", v):
                raise ValueError("ID_SOCIEDAD: solo letras/números, sin espacios")
            return v

        @validator("id_proyecto")
        def val_id_proyecto(cls, v):
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9_]{1,50}", v):
                raise ValueError("ID_PROYECTO: alfanumérico (y _), 2-5 caracteres, sin espacios")
            return v

        @validator("id_cliente")
        def val_id_cliente(cls, v):
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9_]{1,50}", v):
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


class ProyectoUpdate(BaseModel):
    nombre_proyecto: str | None = Field(default = None, min_length = 1, max_length = 255)
    codigo_proyecto_tracker: str | None = Field(default = None, min_length = 1, max_length = 100)
    tipo_pago: str | None = Field(default = None, min_length = 1, max_length = 50)
    precio: Decimal | None = Field(default = None)
    fec_inicio: date | None = Field(default = None)

    if V2:
        @field_validator("nombre_proyecto")
        @classmethod
        def val_nombre(cls, v: str | None) -> str | None:
            if v is None:
                return None
            v2 = _clean_text(v) or ""
            if len(v2) < 2:
                raise ValueError("NOMBRE_PROYECTO demasiado corto")
            return v2

        @field_validator("codigo_proyecto_tracker")
        @classmethod
        def val_tracker(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return (_clean_text(v) or "").upper()

        @field_validator("tipo_pago")
        @classmethod
        def val_tipo_pago(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return _validate_tipo_pago(v)

        @field_validator("fec_inicio", mode="before")
        @classmethod
        def val_fecha(cls, v) -> date | None:
            if v is None:
                return None
            return _validate_fecha(v)

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


class ProyectoOut(BaseModel):
    id_sociedad: str
    id_proyecto: str
    id_cliente: str
    nombre_proyecto: str
    codigo_proyecto_tracker: str
    tipo_pago: str
    precio: Decimal | None = None
    fec_inicio: date

    if V2:
        model_config = {"from_attributes": True}
    else:
        class Config:
            orm_mode = True