from fastapi import APIRouter, Body
from app.models.banco import Banco

router = APIRouter()

# ===============================
# DATOS EN MEMORIA
# ===============================

bancos = [
    Banco("01", "001", "Banco Bilbao Vizcaya Argentaria", "0201582733", "ES8601822737190201582733", True),
    Banco("01", "002", "Banco Santander", "1234567890", "ES1123456789012345678901", True),
]

# ===============================
# LISTAR BANCOS
# ===============================

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


# ===============================
# CREAR BANCO
# ===============================

@router.post("/bancos")
def crear_banco(
    id_sociedad: str = Body(...),
    id_banco_cobro: str = Body(...),
    n_banco_cobro: str = Body(...),
    num_cuenta: str = Body(...),
    codigo_iban: str = Body(...)
):
    if any(b.id_banco_cobro == id_banco_cobro for b in bancos):
        return {"error": "Ya existe un banco con ese código"}

    nuevo = Banco(
        id_sociedad,
        id_banco_cobro,
        n_banco_cobro,
        num_cuenta,
        codigo_iban,
        True
    )

    bancos.append(nuevo)

    return {"mensaje": "Cuenta bancaria creada correctamente"}


# ===============================
# EDITAR BANCO
# ===============================

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
                b.num_cuenta = num_cuenta
            if codigo_iban:
                b.codigo_iban = codigo_iban

            return {"mensaje": "Cuenta bancaria actualizada"}

    return {"error": "Banco no encontrado"}


# ===============================
# ARCHIVAR BANCO
# ===============================

@router.patch("/bancos/{id_banco}/archivar")
def archivar_banco(id_banco: str):
    for b in bancos:
        if b.id_banco_cobro == id_banco:
            b.activo = False
            return {"mensaje": "Cuenta bancaria archivada"}

    return {"error": "Banco no encontrado"}