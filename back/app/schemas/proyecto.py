# app/schemas/proyecto.py
import re 
from datetime import date

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

TIPOS_PAGO_VALIDOS = { "ABIERTO", "CERRADO", "FRACCIONADO", "MANTENIMIENTO" }

def _validate_tipo_pago(v: str) -> str:
    v = v.strip().upper()

    if v not in TIPOS_PAGO_VALIDOS:
        raise ValueError(f"TIPO_PAGO no válido. Opciones: {', '.join(sorted(TIPOS_PAGO_VALIDOS))}")
    return v

def _validate_fecha(v: str) -> str:
    v = v.strip()
    try:
        date.fromisoformat(v)
    except ValueError:
        raise ValueError("FECHA_INICIO debe tener el siguiente formato: DD/MM/YYYY")
    return v

# --- Schemas ---
class ProyectoCreate(BaseModel):
    id_sociedad: str = Field(..., min_length=1, max_length=5)
    id_proyecto: str = Field(..., min_length=2, max_length=5)
    id_cliente: str = Field(..., min_length=2, max_length=5)
    codigo_proyecto_tracker: str = Field(..., min_length=1, max_length=10)
    tipo_pago: str = Field(..., min_length=1, max_length=25)
    precio: float | None = Field(default=None, ge=0)
    fecha_inicio: str = Field(..., min_length=8, max_length=12)

    if V2:
        @field_validator("id_sociedad")
        @classmethod
        def val_sociedad(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()

            if not re.fullmatch(r"[A-Z0-9]{1,5}", v):
                raise ValueError("ID_SOCIEDAD: solo letras/números, sin espacios")
            return v

        @field_validator("id_proyecto")
        @classmethod
        def val_id_proyecto(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()

            if not re.fullmatch(r"[A-Z0-9_]{2,5}", v):
                raise ValueError("ID_PROYECTO: alfanumérico (y _), 2-5 caracteres, sin espacios")
            return v

        @field_validator("id_cliente")
        @classmethod
        def val_id_cliente(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()

            if not re.fullmatch(r"[A-Z0-9_]{2,5}", v):
                raise ValueError("ID_CLIENTE: alfanumérico (y _), 2-5 caracteres, sin espacios")
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

        @field_validator("fecha_inicio")
        @classmethod
        def val_fecha(cls, v: str) -> str:
            return _validate_fecha(v)

    else:
        @validator("id_sociedad")
        def val_sociedad(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()

            if not re.fullmatch(r"[A-Z0-9]{1,5}", v):
                raise ValueError("ID_SOCIEDAD: solo letras/números, sin espacios")
            return v

        @validator("id_proyecto")
        def val_id_proyecto(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()

            if not re.fullmatch(r"[A-Z0-9_]{2,5}", v):
                raise ValueError("ID_PROYECTO: alfanumérico (y _), 2-5 caracteres, sin espacios")
            return v

        @validator("id_cliente")
        def val_id_cliente(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()

            if not re.fullmatch(r"[A-Z0-9_]{2,5}", v):
                raise ValueError("ID_CLIENTE: alfanumérico (y _), 2-5 caracteres, sin espacios")
            return v

        @validator("codigo_proyecto_tracker")
        def val_tracker(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()

            if not v:
                raise ValueError("CODIGO_PROYECTO_TRACKER no puede estar vacío")
            return v

        @validator("tipo_pago")
        def val_tipo_pago(cls, v: str) -> str:
            return _validate_tipo_pago(v)

        @validator("fecha_inicio")
        def val_fecha(cls, v: str) -> str:
            return _validate_fecha(v)


class ProyectoUpdate(BaseModel):
    codigo_proyecto_tracker: str | None = Field(default=None, min_length=1, max_length=10)
    tipo_pago: str | None = Field(default=None, min_length=1, max_length=25)
    precio: float | None = Field(default=None, ge=0)
    fecha_inicio: str | None = Field(default=None, min_length=8, max_length=12)

    if V2:
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

        @field_validator("fecha_inicio")
        @classmethod
        def val_fecha(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return _validate_fecha(v)

    else:
        @validator("codigo_proyecto_tracker")
        def val_tracker(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return (_clean_text(v) or "").upper()

        @validator("tipo_pago")
        def val_tipo_pago(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return _validate_tipo_pago(v)

        @validator("fecha_inicio")
        def val_fecha(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return _validate_fecha(v)


class ProyectoOut(BaseModel):
    id_sociedad: str
    id_proyecto: str
    id_cliente: str
    codigo_proyecto_tracker: str
    tipo_pago: str
    precio: float | None = None
    fecha_inicio: str

    if V2:
        model_config = {"from_attributes": True}
    else:
        class Config:
            orm_mode = True