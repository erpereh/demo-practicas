# Esquemas Pydantic para BANCOS:
# definen los formatos de entrada/salida entre Front <-> Back,
# normalizan textos y validan IBAN (formato general + regla específica para ES).

import re

# Importa Pydantic de forma compatible con v1 y v2:
# si existe field_validator (v2) lo usa; si no, usa validator (v1).
try:
    from pydantic import BaseModel, Field, field_validator
    V2 = True
except Exception:
    from pydantic import BaseModel, Field, validator
    V2 = False

# ------------- Función LIMPIA TEXTOS -------------
# - quita espacios al principio y al final
# - colapsa múltiples espacios en uno solo
# - devuelve None si queda vacío.
def clean(s: str | None) -> str | None:
    if s is None:
        return None
    s = " ".join(s.strip().split())
    return s if s else None


# ------------- NORMALIZA y VALIDA un IBAN: -------------
# - elimina espacios y pasa a mayúsculas
# - valida el patrón general del IBAN (2 letras + 2 dígitos + alfanumérico restante)
# - si empieza por "ES", exige longitud exacta de 24 caracteres (IBAN español)
# - limita longitud total a 50 (por el varchar(50) de la columna)
# - devuelve el IBAN ya limpio o None si no se informó.
def normalize_iban(v: str | None) -> str | None:
    if v is None:
        return None
    v = re.sub(r"\s+", "", v).upper()
    if not v:
        return None

    if not re.fullmatch(r"[A-Z]{2}\d{2}[A-Z0-9]{10,46}", v):
        raise ValueError("IBAN inválido (formato)")

    if v.startswith("ES") and len(v) != 24:
        raise ValueError("Un IBAN español debe tener 24 caracteres")

    if len(v) > 50:
        raise ValueError("IBAN demasiado largo (máx 50)")

    return v

# ------------- CREAR BANCOS -------------
# incluye los campos necesarios para insertar en la tabla BANCOS,
# con límites de longitud acordes a MySQL y campos opcionales (cuenta/IBAN).
class BancoCreate(BaseModel):
    id_sociedad: str = Field(..., min_length=1, max_length=10)
    id_banco_cobro: str = Field(..., min_length=1, max_length=20)
    n_banco_cobro: str = Field(..., min_length=2, max_length=150)
    num_cuenta: str | None = Field(default=None, max_length=50)
    codigo_iban: str | None = Field(default=None, max_length=50)

    if V2:
        # Validador de BancoCreate.id_sociedad:
        # - limpia espacios, convierte a mayúsculas
        # - exige solo letras/números entre 1 y 10 caracteres.
        @field_validator("id_sociedad")
        @classmethod
        def v_sociedad(cls, v: str) -> str:
            v2 = (clean(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9]{1,10}", v2):
                raise ValueError("ID_SOCIEDAD: solo letras/números (1-10)")
            return v2

        # Validador de BancoCreate.id_banco_cobro:
        # - limpia espacios, convierte a mayúsculas
        # - permite letras/números y _ o - (sin espacios) entre 1 y 20 caracteres
        # - pensado para códigos tipo "001", "BANCO_01", etc.
        @field_validator("id_banco_cobro")
        @classmethod
        def v_id_banco(cls, v: str) -> str:
            v2 = (clean(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9_-]{1,20}", v2):
                raise ValueError("ID_BANCO_COBRO: alfanumérico/_- (1-20)")
            return v2

        # Validador de BancoCreate.n_banco_cobro:
        # - limpia espacios sobrantes
        # - exige al menos 2 caracteres reales para el nombre del banco.
        @field_validator("n_banco_cobro")
        @classmethod
        def v_nombre(cls, v: str) -> str:
            v2 = clean(v) or ""
            if len(v2) < 2:
                raise ValueError("N_BANCO_COBRO demasiado corto")
            return v2

        # Validador de BancoCreate.num_cuenta:
        # - normaliza el texto (quita espacios extra)
        # - convierte cadenas vacías en None para guardar NULL en la base de datos.
        @field_validator("num_cuenta")
        @classmethod
        def v_num_cuenta(cls, v: str | None) -> str | None:
            return clean(v)

        # Validador de BancoCreate.codigo_iban:
        # - aplica normalize_iban para dejar el IBAN en formato limpio
        # - y asegurar que cumple formato general + regla ES(24) si corresponde.
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

# ------------- ACTUALIZAR BANCOS -------------
# todos los campos son opcionales para permitir actualizaciones parciales.
class BancoUpdate(BaseModel):
    n_banco_cobro: str | None = Field(default=None, min_length=2, max_length=150)
    num_cuenta: str | None = Field(default=None, max_length=50)
    codigo_iban: str | None = Field(default=None, max_length=50)

# ------------- Modelo de SALIDA BancoOut -------------
# define los campos que el backend devuelve al frontend al listar o consultar bancos.
# Configuración para Pydantic v2:
# permite construir el schema desde instancias ORM con from_attributes.
# Configuración alternativa para Pydantic v1:
# activa orm_mode para permitir crear BancoOut desde objetos SQLAlchemy.
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