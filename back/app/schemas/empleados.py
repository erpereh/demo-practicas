# back/app/schemas/empleado.py
import re

try:
    from pydantic import BaseModel, Field, field_validator
    V2 = True
except Exception:
    from pydantic import BaseModel, Field, validator
    V2 = False

NIF_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE"

def clean_text(s: str | None) -> str | None:
    if s is None:
        return None
    s = " ".join(s.strip().split())
    return s if s else None

def normalize_id(value: str) -> str:
    return re.sub(r"[\s\-\.]", "", value).upper().strip()

def validate_dni_nie(value: str) -> str:
    """
    Valida DNI: 8 dígitos + letra correcta
    Valida NIE: X/Y/Z + 7 dígitos + letra correcta
    Devuelve normalizado (sin espacios/guiones, mayúsculas)
    """
    v = normalize_id(value)

    # DNI
    if re.fullmatch(r"\d{8}[A-Z]", v):
        num = int(v[:8])
        if NIF_LETTERS[num % 23] != v[8]:
            raise ValueError("DNI inválido (letra incorrecta)")
        return v

    # NIE
    if re.fullmatch(r"[XYZ]\d{7}[A-Z]", v):
        mapped = {"X": "0", "Y": "1", "Z": "2"}[v[0]] + v[1:8]
        num = int(mapped)
        if NIF_LETTERS[num % 23] != v[8]:
            raise ValueError("NIE inválido (letra incorrecta)")
        return v

    raise ValueError("Formato DNI/NIE no válido")

def normalize_codigo_fichaje(v: str) -> str:
    v = clean_text(v) or ""
    v = v.upper()
    # Permite EMP-001, EMP001, ABC_123, etc (sin espacios)
    if not re.fullmatch(r"[A-Z0-9_-]{3,50}", v):
        raise ValueError("Código de fichaje inválido (3-50, A-Z 0-9 _ -)")
    return v

def normalize_estado(v: str) -> str:
    v = (clean_text(v) or "").capitalize()
    if v not in ("Activo", "Inactivo"):
        raise ValueError("Estado debe ser 'Activo' o 'Inactivo'")
    return v

class EmpleadoCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    dni: str = Field(..., min_length=8, max_length=20)
    codigo_fichaje: str = Field(..., min_length=3, max_length=50)
    estado: str = Field(default="Activo")

    if V2:
        @field_validator("nombre")
        @classmethod
        def val_nombre(cls, v: str) -> str:
            v2 = clean_text(v) or ""
            if len(v2) < 2:
                raise ValueError("Nombre demasiado corto")
            return v2

        @field_validator("dni")
        @classmethod
        def val_dni(cls, v: str) -> str:
            return validate_dni_nie(v)

        @field_validator("codigo_fichaje")
        @classmethod
        def val_codigo(cls, v: str) -> str:
            return normalize_codigo_fichaje(v)

        @field_validator("estado")
        @classmethod
        def val_estado(cls, v: str) -> str:
            return normalize_estado(v)
    else:
        @validator("nombre")
        def val_nombre(cls, v: str) -> str:
            v2 = clean_text(v) or ""
            if len(v2) < 2:
                raise ValueError("Nombre demasiado corto")
            return v2

        @validator("dni")
        def val_dni(cls, v: str) -> str:
            return validate_dni_nie(v)

        @validator("codigo_fichaje")
        def val_codigo(cls, v: str) -> str:
            return normalize_codigo_fichaje(v)

        @validator("estado")
        def val_estado(cls, v: str) -> str:
            return normalize_estado(v)

class EmpleadoUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    dni: str | None = Field(default=None, min_length=8, max_length=20)
    codigo_fichaje: str | None = Field(default=None, min_length=3, max_length=50)
    estado: str | None = None

    if V2:
        @field_validator("nombre")
        @classmethod
        def val_nombre(cls, v: str | None) -> str | None:
            if v is None:
                return None
            v2 = clean_text(v) or ""
            if len(v2) < 2:
                raise ValueError("Nombre demasiado corto")
            return v2

        @field_validator("dni")
        @classmethod
        def val_dni(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return validate_dni_nie(v)

        @field_validator("codigo_fichaje")
        @classmethod
        def val_codigo(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return normalize_codigo_fichaje(v)

        @field_validator("estado")
        @classmethod
        def val_estado(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return normalize_estado(v)
    else:
        @validator("nombre")
        def val_nombre(cls, v: str | None) -> str | None:
            if v is None:
                return None
            v2 = clean_text(v) or ""
            if len(v2) < 2:
                raise ValueError("Nombre demasiado corto")
            return v2

        @validator("dni")
        def val_dni(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return validate_dni_nie(v)

        @validator("codigo_fichaje")
        def val_codigo(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return normalize_codigo_fichaje(v)

        @validator("estado")
        def val_estado(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return normalize_estado(v)

class EmpleadoOut(BaseModel):
    id: int
    nombre: str
    dni: str
    codigo_fichaje: str
    estado: str

    if V2:
        model_config = {"from_attributes": True}
    else:
        class Config:
            orm_mode = True