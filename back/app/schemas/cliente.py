# Esquema Pydantic para la entidad CLIENTES:
# define las estructuras de entrada/salida de la API,
# normaliza textos y valida que los identificadores fiscales españoles
# (CIF, NIF, NIE) tengan un formato y letra de control correctos.
import re

# Importa Pydantic de forma compatible con v1 y v2:
# intenta usar field_validator (v2) y, si no existe, cae a validator (v1).
try:
    from pydantic import BaseModel, Field, field_validator
    V2 = True
except Exception:
    from pydantic import BaseModel, Field, validator
    V2 = False

# Tabla de letras de control usadas en el cálculo del NIF/NIE (personas físicas).
NIF_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE"

# Tabla de letras de control usadas en el cálculo del CIF (personas jurídicas).
CIF_CONTROL_LETTERS = "JABCDEFGHI"

# Función auxiliar: limpia un texto:
# - quita espacios al principio y al final
# - colapsa espacios múltiples en uno solo
# - devuelve None si el resultado queda vacío.
def _clean_text(s: str | None) -> str | None:
    if s is None:
        return None
    s = " ".join(s.strip().split())
    return s if s else None

# Función auxiliar: normaliza un identificador fiscal:
# - lanza error si viene None
# - elimina espacios, guiones y puntos
# - lo convierte a mayúsculas para trabajar siempre con un formato homogéneo.
def _clean_tax_id(value: str) -> str:
    if value is None:
        raise ValueError("CIF/NIF/NIE es obligatorio")
    return re.sub(r"[\s\-\.]", "", value).upper()


# Valida un identificador fiscal español (CIF/NIF/NIE):
# - Normaliza el valor con _clean_tax_id.
# - Si encaja con patrón de NIF (8 dígitos + letra), calcula la letra esperada
#   con NIF_LETTERS y comprueba que coincida.
# - Si encaja con NIE (X/Y/Z + 7 dígitos + letra), convierte la letra inicial
#   en un dígito, calcula la letra de control y la compara.
# - Si encaja con CIF (letra + 7 dígitos + dígito/letra de control), aplica
#   el algoritmo oficial:
#   · suma posiciones pares e impares por separado,
#   · obtiene el dígito de control,
#   · determina si el control debe ser letra, dígito o cualquiera de los dos
#     según la letra inicial del CIF,
#   · valida que el carácter de control sea correcto.
# - Si no cumple ninguno de los formatos anteriores, lanza ValueError.
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

# Modelo de entrada para CREAR clientes:
# incluye todos los campos de la tabla CLIENTES y un flag 'activo' para el front.
# Pone límites de longitud y deja contacto/dirección como opcionales.
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

        # Modelo de entrada para CREAR clientes:
        # incluye todos los campos de la tabla CLIENTES y un flag 'activo' para el front.
        # Pone límites de longitud y deja contacto/dirección como opcionales.
        @field_validator("id_sociedad")
        @classmethod
        def val_sociedad(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9]{1,5}", v):
                raise ValueError("ID_SOCIEDAD: solo letras/números, sin espacios")
            return v


        # Validador de id_cliente (ClienteCreate):
        # - limpia el texto, lo pasa a mayúsculas
        # - permite letras, números y guiones bajos, sin espacios (regex [A-Z0-9_]{2,20})
        # - fuerza una longitud entre 2 y 20 caracteres.
        @field_validator("id_cliente")
        @classmethod
        def val_id_cliente(cls, v: str) -> str:
            v = (_clean_text(v) or "").upper()
            if not re.fullmatch(r"[A-Z0-9_]{2,20}", v):
                raise ValueError("ID_CLIENTE: alfanumérico (y _), 2-20 caracteres, sin espacios")
            return v


        # Validador de n_cliente (ClienteCreate):
        # - limpia espacios sobrantes
        # - comprueba que el nombre comercial tenga al menos 2 caracteres reales.
        @field_validator("n_cliente")
        @classmethod
        def val_nombre(cls, v: str) -> str:
            v = _clean_text(v) or ""
            if len(v) < 2:
                raise ValueError("N_CLIENTE demasiado corto")
            return v


        # Validador de n_cliente (ClienteCreate):
        # - limpia espacios sobrantes
        # - comprueba que el nombre comercial tenga al menos 2 caracteres reales.
        @field_validator("cif")
        @classmethod
        def val_cif(cls, v: str) -> str:
            return validate_spanish_tax_id(v)


        # Validador de persona_contacto y direccion (ClienteCreate):
        # - aplica _clean_text para eliminar espacios basura
        # - convierte cadenas en blanco en None, para no guardar "vacío" en la BBDD.
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


# Modelo de entrada para ACTUALIZAR clientes:
# todos los campos son opcionales, porque en un PUT de edición
# sólo se envían los datos que se quieren modificar.
class ClienteUpdate(BaseModel):
    n_cliente: str | None = Field(default=None, min_length=2, max_length=255)
    cif: str | None = Field(default=None, min_length=8, max_length=20)
    persona_contacto: str | None = Field(default=None, max_length=255)
    direccion: str | None = Field(default=None, max_length=1000)

    if V2:

        # Modelo de entrada para ACTUALIZAR clientes:
        # todos los campos son opcionales, porque en un PUT de edición
        # sólo se envían los datos que se quieren modificar.
        @field_validator("n_cliente")
        @classmethod
        def val_nombre(cls, v: str | None) -> str | None:
            if v is None:
                return None
            v2 = _clean_text(v) or ""
            if len(v2) < 2:
                raise ValueError("N_CLIENTE demasiado corto")
            return v2


        # Validador de n_cliente (ClienteUpdate):
        # - si viene None, se deja tal cual (no se modifica ese campo)
        # - si viene texto, se limpia y se exige longitud mínima de 2 caracteres.
        @field_validator("cif")
        @classmethod
        def val_cif(cls, v: str | None) -> str | None:
            if v is None:
                return None
            return validate_spanish_tax_id(v)

        # Validador de persona_contacto y direccion (ClienteUpdate):
        # - normaliza textos opcionales con _clean_text, convirtiendo
        #   cadenas vacías en None.
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


# Modelo de salida ClienteOut:
# define exactamente los campos que el backend devuelve al frontend
# cuando se listan o se consultan clientes (incluye el flag 'activo' para la UI).

# Configuración de ClienteOut para Pydantic v2:
# permite construir el schema directamente a partir de objetos ORM (SQLAlchemy)
# usando la opción from_attributes.

# Configuración alternativa para Pydantic v1:
# activa orm_mode para poder crear ClienteOut desde instancias de modelo ORM.
class ClienteOut(BaseModel):
    id_sociedad: str
    id_cliente: str
    n_cliente: str
    cif: str
    persona_contacto: str | None = None
    direccion: str | None = None


    activo: bool = True

    if V2:
        model_config = {"from_attributes": True}
    else:
        class Config:
            orm_mode = True