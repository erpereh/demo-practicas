import re

# Compatible Pydantic v1/v2
try:
    from pydantic import BaseModel, Field, field_validator
    V2 = True
except Exception:
    from pydantic import BaseModel, Field, validator
    V2 = False


def clean(s: str | None) -> str | None:
    if s is None:
        return None
    s = " ".join(s.strip().split())
    return s if s else None


def normalize_iban(v: str | None) -> str | None:
    if v is None:
        return None
    v = re.sub(r"\s+", "", v).upper()
    if not v:
        return None

    # Regex IBAN genérico
    if not re.fullmatch(r"[A-Z]{2}\d{2}[A-Z0-9]{10,46}", v):
        raise ValueError("IBAN inválido (formato)")

    # IBAN español: 24 caracteres
    if v.startswith("ES") and len(v) != 24:
        raise ValueError("Un IBAN español debe tener 24 caracteres")

    # Tu columna es varchar(50) → limitamos
    if len(v) > 50:
        raise ValueError("IBAN demasiado largo (máx 50)")

    return v


class BancoCreate(BaseModel):
    id_sociedad: str = Field(..., min_length=1, max_length=10)
    id_banco_cobro: str = Field(..., min_length=1, max_length=20)
    n_banco_cobro: str = Field(..., min_length=2, max_length=150)
    num_cuenta: str | None = Field(default=None, max_length=50)
    codigo_iban: str | None = Field(default=None, max_length=50)

    if V2:
        @field_validator("id_sociedad")
        @classmethod
        def v_sociedad(cls, v: str) -> str:
            v2 = (clean(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9]{1,10}", v2):
                raise ValueError("ID_SOCIEDAD: solo letras/números (1-10)")
            return v2

        @field_validator("id_banco_cobro")
        @classmethod
        def v_id_banco(cls, v: str) -> str:
            v2 = (clean(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9_-]{1,20}", v2):
                raise ValueError("ID_BANCO_COBRO: alfanumérico/_- (1-20)")
            return v2

        @field_validator("n_banco_cobro")
        @classmethod
        def v_nombre(cls, v: str) -> str:
            v2 = clean(v) or ""
            if len(v2) < 2:
                raise ValueError("N_BANCO_COBRO demasiado corto")
            return v2

        @field_validator("num_cuenta")
        @classmethod
        def v_num_cuenta(cls, v: str | None) -> str | None:
            return clean(v)

        @field_validator("codigo_iban")
        @classmethod
        def v_iban(cls, v: str | None) -> str | None:
            return normalize_iban(v)
    else:
        @validator("id_sociedad")
        def v_sociedad(cls, v: str) -> str:
            v2 = (clean(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9]{1,10}", v2):
                raise ValueError("ID_SOCIEDAD: solo letras/números (1-10)")
            return v2

        @validator("id_banco_cobro")
        def v_id_banco(cls, v: str) -> str:
            v2 = (clean(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9_-]{1,20}", v2):
                raise ValueError("ID_BANCO_COBRO: alfanumérico/_- (1-20)")
            return v2

        @validator("n_banco_cobro")
        def v_nombre(cls, v: str) -> str:
            v2 = clean(v) or ""
            if len(v2) < 2:
                raise ValueError("N_BANCO_COBRO demasiado corto")
            return v2

        @validator("num_cuenta")
        def v_num_cuenta(cls, v: str | None) -> str | None:
            return clean(v)

        @validator("codigo_iban")
        def v_iban(cls, v: str | None) -> str | None:
            return normalize_iban(v)


class BancoUpdate(BaseModel):
    n_banco_cobro: str | None = Field(default=None, min_length=2, max_length=150)
    num_cuenta: str | None = Field(default=None, max_length=50)
    codigo_iban: str | None = Field(default=None, max_length=50)


class BancoOut(BaseModel):
    id_sociedad: str
    id_banco_cobro: str
    n_banco_cobro: str
    num_cuenta: str | None = None
    codigo_iban: str | None = None

    if V2:
        model_config = {"from_attributes": True}
    else:
        class Config:
            orm_mode = True