# Router de FastAPI encargado de exponer la API de CLIENTES:
# lista, crea, edita y archiva registros de la tabla CLIENTES,
# aplicando las reglas de negocio de IDs, CIF y unicidad por sociedad.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteOut

router = APIRouter(prefix="/api/clientes", tags=["Clientes"])

# Obtiene y devuelve la lista completa de clientes desde la base de datos
# usando SQLAlchemy (SELECT * FROM CLIENTES) y la mapea al schema ClienteOut.
@router.get("/", response_model=list[ClienteOut])
def listar_clientes(db: Session = Depends(get_db)):
    return db.execute(select(Cliente)).scalars().all()

# -------------------------- CREA un nuevo CLIENTE --------------------------
# 1) Comprueba que no exista ya otro registro con el mismo ID_CLIENTE (PK).
# 2) Verifica que en la misma sociedad no haya otro cliente con el mismo CIF.
# 3) Si pasa las validaciones, construye el modelo Cliente, lo guarda y devuelve el registro creado.
@router.post("/", response_model=ClienteOut, status_code=status.HTTP_201_CREATED)
def crear_cliente(payload: ClienteCreate, db: Session = Depends(get_db)):
    # 1) PK: id_cliente
    existe = db.execute(
        select(Cliente).where(Cliente.id_cliente == payload.id_cliente)
    ).scalar_one_or_none()
    if existe:
        raise HTTPException(status_code=409, detail="Ya existe un cliente con ese ID_CLIENTE")

    # 2) Evitar duplicar CIF en la misma sociedad
    dup = db.execute(
        select(Cliente).where(
            Cliente.id_sociedad == payload.id_sociedad,
            Cliente.cif == payload.cif
        )
    ).scalar_one_or_none()
    if dup:
        raise HTTPException(status_code=409, detail="Ya existe un cliente con ese CIF en esa sociedad")

    nuevo = Cliente(
        id_sociedad=payload.id_sociedad,
        id_cliente=payload.id_cliente,
        n_cliente=payload.n_cliente,
        cif=payload.cif,
        persona_contacto=payload.persona_contacto,
        direccion=payload.direccion,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

# -------------------------- EDITA los datos de un CLIENTE existente --------------------------
# 1) Normaliza el ID_CLIENTE recibido (mayúsculas/espacios) y busca el cliente.
# 2) Si cambia el CIF, comprueba que no exista ya ese CIF en la misma sociedad.
# 3) Actualiza solo los campos enviados en el payload (nombre, CIF, contacto, dirección) y guarda cambios.
@router.put("/{id_cliente}", response_model=ClienteOut)
def editar_cliente(id_cliente: str, payload: ClienteUpdate, db: Session = Depends(get_db)):
    id_cliente = id_cliente.upper()

    cliente = db.execute(
        select(Cliente).where(Cliente.id_cliente == id_cliente)
    ).scalar_one_or_none()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Si cambia CIF, comprobar duplicado en esa sociedad
    if payload.cif and payload.cif != cliente.cif:
        dup = db.execute(
            select(Cliente).where(
                Cliente.id_sociedad == cliente.id_sociedad,
                Cliente.cif == payload.cif
            )
        ).scalar_one_or_none()
        if dup:
            raise HTTPException(status_code=409, detail="Ese CIF ya existe en esa sociedad")
        cliente.cif = payload.cif

    if payload.n_cliente is not None:
        cliente.n_cliente = payload.n_cliente
    if payload.persona_contacto is not None:
        cliente.persona_contacto = payload.persona_contacto
    if payload.direccion is not None:
        cliente.direccion = payload.direccion

    db.commit()
    db.refresh(cliente)
    return cliente


# -------------------------- ELIMINA un CLIENTE --------------------------
# 1) Normaliza el ID_CLIENTE, localiza el registro en la tabla CLIENTES.
# 2) Si existe, lo borra físicamente de la base de datos (no hay columna de estado).
# 3) Devuelve un mensaje indicando que el cliente ha sido archivado/eliminado correctamente.
@router.patch("/{id_cliente}/archivar")
def archivar_cliente(id_cliente: str, db: Session = Depends(get_db)):
    """
    Como la tabla NO tiene 'estado' ni 'activo', archivar = eliminar registro.
    (si algún día te dejan añadir columna, lo cambiamos a soft delete)
    """
    id_cliente = id_cliente.upper()

    cliente = db.execute(
        select(Cliente).where(Cliente.id_cliente == id_cliente)
    ).scalar_one_or_none()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    db.delete(cliente)
    db.commit()
    return {"mensaje": "Cliente archivado (eliminado) correctamente"}