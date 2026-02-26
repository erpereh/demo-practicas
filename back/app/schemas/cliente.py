# app/schemas/cliente.py
import re

# Compatible con Pydantic v1 y v2
try:
    from pydantic import BaseModel, Field, field_validator
    V2 = True
except Exception:
    from pydantic import BaseModel, Field, validator
    V2 = False

# --- Validación CIF/NIF/NIE (España) ---
NIF_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE"
CIF_CONTROL_LETTERS = "JABCDEFGHI"

def _clean_text(s: str | None) -> str | None:
    if s is None:
        return None
    s = " ".join(s.strip().split())
    return s if s else None

def _clean_tax_id(value: str) -> str:
    if value is None:
        raise ValueError("CIF/NIF/NIE es obligatorio")
    return re.sub(r"[\s\-\.]", "", value).upper()

def validate_spanish_tax_id(value: str) -> str:
    v = _clean_tax_id(value)

    # NIF: 8 dígitos + letra
    if re.fullmatch(r"\d{8}[A-Z]", v):
        num = int(v[:8])
        if NIF_LETTERS[num % 23] != v[8]:
            raise ValueError("NIF inválido")
        return v

    # NIE: X/Y/Z + 7 dígitos + letra
    if re.fullmatch(r"[XYZ]\d{7}[A-Z]", v):
        mapped = {"X": "0", "Y": "1", "Z": "2"}[v[0]] + v[1:8]
        num = int(mapped)
        if NIF_LETTERS[num % 23] != v[8]:
            raise ValueError("NIE inválido")
        return v

    # CIF: letra + 7 dígitos + control
    if re.fullmatch(r"[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]", v):
        first = v[0]
        digits = v[1:8]
        control = v[8]

        sum_even = sum(int(digits[i]) for i in [1, 3, 5])
        sum_odd = 0
        for i in [0, 2, 4, 6]:
            x = int(digits[i]) * 2
            sum_odd += (x // 10) + (x % 10)

        total = sum_even + sum_odd
        control_digit = (10 - (total % 10)) % 10
        control_letter = CIF_CONTROL_LETTERS[control_digit]

        must_be_letter = first in "PQSW"
        must_be_digit = first in "ABEH"

        if must_be_letter and control != control_letter:
            raise ValueError("CIF inválido (control debe ser letra)")
        if must_be_digit and control != str(control_digit):
            raise ValueError("CIF inválido (control debe ser dígito)")
        if not must_be_letter and not must_be_digit:
            if control not in (str(control_digit), control_letter):
                raise ValueError("CIF inválido (control incorrecto)")

        return v

    raise ValueError("Formato de CIF/NIF/NIE no válido")

# --- Schemas ---
class ClienteCreate(BaseModel):
    id_sociedad: str = Field(..., min_length=1, max_length=5)
    id_cliente: str = Field(..., min_length=2, max_length=20)
    n_cliente: str = Field(..., min_length=2, max_length=255)
    cif: str = Field(..., min_length=8, max_length=20)
    persona_contacto: str | None = Field(default=None, max_length=255)
    direccion: str | None = Field(default=None, max_length=1000)

    # salida para frontend
    activo: bool = True

    if V2:
        @field_validator("id_sociedad")
        @classmethod
        def val_sociedad(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9]{1,5}", v):
                raise ValueError("ID_SOCIEDAD: solo letras/números, sin espacios")
            return v

        @field_validator("id_cliente")
        @classmethod
        def val_id_cliente(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9_]{2,20}", v):
                raise ValueError("ID_CLIENTE: alfanumérico (y _), 2-20 caracteres, sin espacios")
            return v

        @field_validator("n_cliente")
        @classmethod
        def val_nombre(cls, v: str) -> str:
            v = _clean_text(v) or ""
            if len(v) < 2:
                raise ValueError("N_CLIENTE demasiado corto")
            return v

        @field_validator("cif")
        @classmethod
        def val_cif(cls, v: str) -> str:
            return validate_spanish_tax_id(v)

        @field_validator("persona_contacto", "direccion")
        @classmethod
        def val_text(cls, v: str | None) -> str | None:
            return _clean_text(v)
    else:
        @validator("id_sociedad")
        def val_sociedad(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9]{1,5}", v):
                raise ValueError("ID_SOCIEDAD: solo letras/números, sin espacios")
            return v

        @validator("id_cliente")
        def val_id_cliente(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9_]{2,20}", v):
                raise ValueError("ID_CLIENTE: alfanumérico (y _), 2-20 caracteres, sin espacios")
            return v

        @validator("n_cliente")
        def val_nombre(cls, v: str) -> str:
            v = _clean_text(v) or ""
            if len(v) < 2:
                raise ValueError("N_CLIENTE demasiado corto")
            return v

        @validator("cif")
        def val_cif(cls, v: str) -> str:
            return validate_spanish_tax_id(v)

        @validator("persona_contacto", "direccion")
        def val_text(cls, v: str | None) -> str | None:
            return _clean_text(v)

class ClienteUpdate(BaseModel):
    n_cliente: str | None = Field(default=None, min_length=2, max_length=255)
    cif: str | None = Field(default=None, min_length=8, max_length=20)
    persona_contacto: str | None = Field(default=None, max_length=255)
    direccion: str | None = Field(default=None, max_length=1000)

    if V2:
        @field_validator("n_cliente")
        @classmethod
        def val_nombre(cls, v: str | None) -> str | None:
            if v is None:
                return None
            v2 = _clean_text(v) or ""
            if len(v2) < 2:
                raise ValueError("N_CLIENTE demasiado corto")
            return v2

        @field_validator("cif")
        @classmethod
        def val_cif(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return validate_spanish_tax_id(v)

        @field_validator("persona_contacto", "direccion")
        @classmethod
        def val_text(cls, v: str | None) -> str | None:
            return _clean_text(v)
    else:
        @validator("n_cliente")
        def val_nombre(cls, v: str | None) -> str | None:
            if v is None:
                return None
            v2 = _clean_text(v) or ""
            if len(v2) < 2:
                raise ValueError("N_CLIENTE demasiado corto")
            return v2

        @validator("cif")
        def val_cif(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return validate_spanish_tax_id(v)

        @validator("persona_contacto", "direccion")
        def val_text(cls, v: str | None) -> str | None:
            return _clean_text(v)

class ClienteOut(BaseModel):
    id_sociedad: str
    id_cliente: str
    n_cliente: str
    cif: str
    persona_contacto: str | None = None
    direccion: str | None = None

    # para no romper tu frontend
    activo: bool = True

    if V2:
        model_config = {"from_attributes": True}
    else:
        class Config:
            orm_mode = True