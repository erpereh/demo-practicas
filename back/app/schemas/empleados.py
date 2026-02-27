import re

# compatible pydantic v1/v2
try:
    from pydantic import BaseModel, Field, field_validator
    V2 = True
except Exception:
    from pydantic import BaseModel, Field, validator
    V2 = False

NIF_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE"

def clean(s: str | None) -> str | None:
    if s is None:
        return None
    s = " ".join(s.strip().split())
    return s if s else None

def norm_id(v: str) -> str:
    return re.sub(r"[\s\-\.]", "", v).upper().strip()

def validate_dni_nie(value: str) -> str:
    v = norm_id(value)

    # DNI: 8 dígitos + letra
    if re.fullmatch(r"\d{8}[A-Z]", v):
        num = int(v[:8])
        if NIF_LETTERS[num % 23] != v[8]:
            raise ValueError("ID_EMPLEADO inválido (DNI letra incorrecta)")
        return v

    # NIE: X/Y/Z + 7 dígitos + letra
    if re.fullmatch(r"[XYZ]\d{7}[A-Z]", v):
        mapped = {"X": "0", "Y": "1", "Z": "2"}[v[0]] + v[1:8]
        num = int(mapped)
        if NIF_LETTERS[num % 23] != v[8]:
            raise ValueError("ID_EMPLEADO inválido (NIE letra incorrecta)")
        return v

    raise ValueError("ID_EMPLEADO debe ser un DNI/NIE válido (ej: 02906525S)")

class EmpleadoCreate(BaseModel):
    id_empleado: str = Field(..., min_length=8, max_length=20)
    id_empleado_tracker: str = Field(..., min_length=1, max_length=100)
    nombre: str = Field(..., min_length=2, max_length=50)
    apellidos: str = Field(..., min_length=2, max_length=100)
    matricula: str | None = Field(default=None, max_length=50)

    if V2:
        @field_validator("id_empleado")
        @classmethod
        def v_id_empleado(cls, v: str) -> str:
            return validate_dni_nie(v)

        @field_validator("id_empleado_tracker")
        @classmethod
        def v_tracker(cls, v: str) -> str:
            v2 = clean(v) or ""
            if len(v2) < 1 or len(v2) > 100:
                raise ValueError("ID_EMPLEADO_TRACKER: 1-100 caracteres")
            return v2

        @field_validator("nombre", "apellidos")
        @classmethod
        def v_text(cls, v: str) -> str:
            v2 = clean(v) or ""
            if len(v2) < 2:
                raise ValueError("Texto demasiado corto")
            return v2

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

class EmpleadoUpdate(BaseModel):
    id_empleado_tracker: str | None = Field(default=None, min_length=1, max_length=100)
    nombre: str | None = Field(default=None, min_length=2, max_length=50)
    apellidos: str | None = Field(default=None, min_length=2, max_length=100)
    matricula: str | None = Field(default=None, max_length=50)

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