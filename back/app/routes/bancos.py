import re
from fastapi import APIRouter, Body, HTTPException, status
from app.models.banco import Banco

router = APIRouter()

# DATOS EN MEMORIA
bancos = [
    Banco("01", "001", "Banco Bilbao Vizcaya Argentaria", "0201582733", "ES8601822737190201582733", True),
    Banco("01", "002", "Banco Santander", "1234567890", "ES1123456789012345678901", True),
]

# --- UTILIDADES DE VALIDACIÓN ---
def validar_iban_formato(iban: str):
    # Limpiar espacios y pasar a mayúsculas
    iban = iban.replace(" ", "").upper()
    # Regex: 2 letras + 2 dígitos + entre 10 y 30 alfanuméricos
    if not re.match(r"^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$", iban):
        raise HTTPException(status_code=400, detail="El formato del IBAN es inválido.")
    # Validación específica España
    if iban.startswith("ES") and len(iban) != 24:
        raise HTTPException(status_code=400, detail="Un IBAN español debe tener 24 caracteres.")
    return iban

def validar_cuenta_formato(cuenta: str):
    if not re.match(r"^\d{10}$", cuenta):
        raise HTTPException(status_code=400, detail="El número de cuenta debe tener exactamente 10 dígitos.")
    return cuenta

# --- ENDPOINTS ---

@router.get("/bancos")
def listar_bancos():
    return [
        {
            "id_banco": b.id_banco_cobro,
            "nombre": b.n_banco_cobro,
            "num_cuenta": b.num_cuenta,
            "iban": b.codigo_iban,
            "activo": b.activo
        }
        for b in bancos
    ]

@router.post("/bancos", status_code=status.HTTP_201_CREATED)
def crear_banco(
    id_sociedad: str = Body(...),
    id_banco_cobro: str = Body(...),
    n_banco_cobro: str = Body(...),
    num_cuenta: str = Body(...),
    codigo_iban: str = Body(...)
):
    # Validaciones de formato
    iban_ok = validar_iban_formato(codigo_iban)
    cuenta_ok = validar_cuenta_formato(num_cuenta)

    if any(b.id_banco_cobro == id_banco_cobro for b in bancos):
        raise HTTPException(status_code=400, detail="Ya existe un banco con ese código.")

    nuevo = Banco(
        id_sociedad,
        id_banco_cobro,
        n_banco_cobro,
        cuenta_ok,
        iban_ok,
        True
    )
    bancos.append(nuevo)
    return {"mensaje": "Cuenta bancaria creada correctamente"}

@router.put("/bancos/{id_banco}")
def editar_banco(
    id_banco: str,
    n_banco_cobro: str = Body(None),
    num_cuenta: str = Body(None),
    codigo_iban: str = Body(None)
):
    for b in bancos:
        if b.id_banco_cobro == id_banco:
            if n_banco_cobro:
                b.n_banco_cobro = n_banco_cobro
            if num_cuenta:
                b.num_cuenta = validar_cuenta_formato(num_cuenta)
            if codigo_iban:
                b.codigo_iban = validar_iban_formato(codigo_iban)

            return {"mensaje": "Cuenta bancaria actualizada"}

    raise HTTPException(status_code=404, detail="Banco no encontrado")

@router.patch("/bancos/{id_banco}/archivar")
def archivar_banco(id_banco: str):
    for b in bancos:
        if b.id_banco_cobro == id_banco:
            b.activo = False
            return {"mensaje": "Cuenta bancaria archivada"}

    raise HTTPException(status_code=404, detail="Banco no encontrado")