from fastapi import APIRouter, Body
from app.models.cliente import Cliente

router = APIRouter()

clientes = [
    Cliente("01", "CYC", "CYC IT SOLUTIONS", "A12345678", "Juan Pérez", "Madrid", True),
    Cliente("01", "ATOS", "ATOS IT SOLUTIONS S.L.", "A85908093", "Andrés Izquierdo", "Ronda de Europa 5", True),
]


# LISTAR CLIENTES
@router.get("/clientes")
def listar_clientes():
    return [
        {
            "id_cliente": c.id_cliente,
            "nombre": c.n_cliente,
            "cif": c.cif,
            "contacto": c.persona_contacto,
            "direccion": c.direccion,
            "activo": c.activo
        }
        for c in clientes
    ]


# CREAR CLIENTE
@router.post("/clientes")
def crear_cliente(
    id_sociedad: str = Body(...),
    id_cliente: str = Body(...),
    n_cliente: str = Body(...),
    cif: str = Body(...),
    persona_contacto: str = Body(...),
    direccion: str = Body(...)
):
    if any(c.id_cliente == id_cliente for c in clientes):
        return {"error": "Ya existe un cliente con ese código"}

    nuevo = Cliente(
        id_sociedad,
        id_cliente,
        n_cliente,
        cif,
        persona_contacto,
        direccion,
        True
    )

    clientes.append(nuevo)

    return {"mensaje": "Cliente creado correctamente"}



# EDITAR CLIENTE
@router.put("/clientes/{id_cliente}")
def editar_cliente(
    id_cliente: str,
    n_cliente: str = Body(None),
    cif: str = Body(None),
    persona_contacto: str = Body(None),
    direccion: str = Body(None)
):
    for c in clientes:
        if c.id_cliente == id_cliente:
            if n_cliente:
                c.n_cliente = n_cliente
            if cif:
                c.cif = cif
            if persona_contacto:
                c.persona_contacto = persona_contacto
            if direccion:
                c.direccion = direccion

            return {"mensaje": "Cliente actualizado"}

    return {"error": "Cliente no encontrado"}


# ARCHIVAR CLIENTE
@router.patch("/clientes/{id_cliente}/archivar")
def archivar_cliente(id_cliente: str):
    for c in clientes:
        if c.id_cliente == id_cliente:
            c.activo = False
            return {"mensaje": "Cliente archivado"}

    return {"error": "Cliente no encontrado"}