"""
Módulo de generación de FACTURAS (conectado a bbdd)

Responsabilidades:
- Previsualizar cálculo de factura (preview).
- Agrupar horas por empleado + proyecto.
- Aplicar tarifa por hora.
- Generar factura definitiva.
- Bloquear horas como facturadas.

Notas críticas:
- Actualmente NO usa base de datos.
- Toda la lógica está en memoria.
- Falta migrar a modelo ORM real.
- El control de estado de horas es manual.

------------------------------------------------
Se ha realizado la conexión con la Base de Datos
------------------------------------------------

Este módulo representa lógica de negocio pura.
"""


from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import extract
from datetime import date

#Importa la clase factura de 'models'
from app.models.factura import Factura
from app.database import get_db

#Importa modelos necesarios
from app.models.empleado import Empleado
from app.models.hist_proyecto import HistProyecto
from app.models.horas_trab import HorasTrab

#BaseModel necesario para los endpoint POST
from pydantic import BaseModel


#ROUTER:
router = APIRouter(
    prefix="/api",
    tags=["Facturas"]
)

#(GET/facturas) LISTAR FACTURAS
@router.get("/facturas")
def listar_facturas(db: Session = Depends(get_db)):
    #Consigue las facturas de la tabla
    facturas = db.query(Factura).all()
    #Lista los datos de cada factura 
    return [
        {
            "id_sociedad": f.id_sociedad,
            "id_cliente": f.id_cliente,
            "num_factura": f.num_factura,
            "fec_factura": f.fec_factura.isoformat(),
            "concepto": f.concepto,
            "base_imponible": float(f.base_imponible),
            "total": float(f.total)
        }
        for f in facturas
    ]

#(POST/facturas) GENERAR FACTURA
@router.post("/facturas")
def generar_factura(
    id_sociedad: str,
    id_cliente: str,
    concepto: str,
    base_imponible: float,
    db: Session = Depends(get_db)  
):
    # IVA fijo 
    IVA = 0.21
    total = round(base_imponible * (1 + IVA), 2)

    # Generar número de factura simple
    hoy = date.today()
    prefijo = hoy.strftime("%y%m")

    ultima = db.query(Factura).filter(
        Factura.num_factura.like(f"{prefijo}%")
    ).order_by(Factura.num_factura.desc()).first()

    secuencia = 1
    if ultima:
        secuencia = int(ultima.num_factura[-4:]) + 1

    num_factura = f"QS{prefijo}{secuencia:04d}"

    # Evitar duplicados
    existe = db.query(Factura).filter(
        Factura.num_factura == num_factura
    ).first()

    if existe:
        raise HTTPException(status_code=400, detail="Factura duplicada")

    #Se construye la NUEVA FACTURA GENERADA
    nueva = Factura(
        id_sociedad=id_sociedad,
        id_cliente=id_cliente,
        num_factura=num_factura,
        fec_factura=hoy,
        concepto=concepto,
        base_imponible=base_imponible,
        total=total
    )
    #Se añade a la bbdd la nueva factura
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return {
        "mensaje": "Factura generada correctamente",
        "num_factura": nueva.num_factura,
        "fec_factura": nueva.fec_factura.isoformat(),
        "base_imponible": float(nueva.base_imponible),
        "total": float(nueva.total)
    }



#Consigue el empleado por su ID (Utiliza Empleado)
def get_empleado_nombre(dni: str, db: Session) -> str:
    emp = db.query(Empleado).filter(
        Empleado.id_empleado == dni
    ).first()

    if not emp:
        return dni

    return f"{emp.nombre} {emp.apellidos}"

#Consigue la tarifa para devolver precio/hora (Utiliza HistProyecto)
def get_tarifa(dni: str, id_proyecto: str, db: Session):
    tarifa = db.query(HistProyecto).filter(
        HistProyecto.id_empleado == dni,
        HistProyecto.id_proyecto == id_proyecto
    ).order_by(HistProyecto.fec_inicio.desc()).first()

    return float(tarifa.tarifa) if tarifa else None

#Previsualiza las horas pendientes (Usa HorasTrab)
def _preview_calculo(anio: int, mes: int, id_cliente: str, db: Session):

    # 1️⃣ Horas pendientes desde BBDD
    pendientes = db.query(HorasTrab).filter(
        HorasTrab.id_cliente == id_cliente,
        HorasTrab.estado == "PENDIENTE",
        extract("year", HorasTrab.fecha) == anio,
        extract("month", HorasTrab.fecha) == mes
    ).all()

    alertas = []
    if not pendientes:
        alertas.append("No hay horas pendientes de facturar para ese cliente/mes/año.")

    # 2️⃣ Agrupar por empleado + proyecto
    agrupado = {}

    for h in pendientes:
        key = (h.id_empleado, h.id_proyecto)
        if key not in agrupado:
            agrupado[key] = {"horas": 0.0}
        agrupado[key]["horas"] += float(h.horas_dia)

    lineas = []
    total_horas = 0.0
    total_importe = 0.0

    # 3️⃣ Calcular importes
    for (dni, proyecto), horas in agrupado.items():

        tarifa = get_tarifa(dni, proyecto, db)

        if tarifa is None:
            alertas.append(f"Falta tarifa para {dni} en proyecto {proyecto}.")
            continue

        subtotal = round(horas * tarifa, 2)

        lineas.append({
            "empleado_dni": dni,
            "empleado": get_empleado_nombre(dni, db),
            "proyecto": proyecto,
            "horas": round(horas, 2),
            "tarifa_hora": tarifa,
            "subtotal": subtotal
        })

        total_horas += horas
        total_importe += subtotal

    return {
        "anio": anio,
        "mes": mes,
        "id_cliente": id_cliente,
        "total_horas": round(total_horas, 2),
        "total_importe": round(total_importe, 2),
        "lineas": lineas,
        "alertas": alertas
    }




# PASO 2: PREVISUALIZACIÓN (BORRADOR, NO GUARDA)

#Esta request ya contiene los campos necesarios para preview_factura
#-> Con BaseModel no se tiene que utilizar Body en cada argumento de Post.
class PreviewRequest(BaseModel):
    anio: int
    mes: int
    id_cliente: str

#El método de previsualización solo necesita la Request (con los campos) y la Sesión
@router.post("/factura/preview")
def preview_factura(request: PreviewRequest, db: Session = Depends(get_db)):
    #Validaciones básicas
    if request.mes < 1 or request.mes > 12:
        raise HTTPException(status_code=400, detail="Mes inválido (1-12)")
    if request.anio < 2000 or request.anio > 2100:
        raise HTTPException(status_code=400, detail="Año inválido")
    #Preview (no guarda nada)
    return _preview_calculo(request.anio, request.mes, request.id_cliente)



# ---------------------
# POST /factura/generar
# ---------------------

#Request con los campos de generar_factura
class GenerarFacturaRequest(BaseModel):
    id_sociedad: str
    anio: int
    mes: int
    id_cliente: str
    concepto: str

#Método de generación de factura
@router.post("/factura/generar")
def generar_factura(request: GenerarFacturaRequest, db: Session = Depends(get_db)):
    # Validaciones básicas
    if request.mes < 1 or request.mes > 12:
        raise HTTPException(status_code=400, detail="Mes inválido (1-12)")
    if request.anio < 2000 or request.anio > 2100:
        raise HTTPException(status_code=400, detail="Año inválido")

    # Evitar duplicados por cliente/mes/año
    existe = db.query(Factura).filter(
        Factura.id_cliente == request.id_cliente,
        Factura.anio == request.anio,
        Factura.mes == request.mes
    ).first()
    if existe:
        raise HTTPException(status_code=400, detail="Ya existe una factura para ese cliente/mes/año")

    # 🔍 Calculamos preview (precios automáticos)
    preview = _preview_calculo(request.anio, request.mes, request.id_cliente, db)

    if not preview["lineas"]:
        raise HTTPException(status_code=400, detail="No hay líneas facturables", headers={"preview": str(preview)})
    if any("Falta tarifa" in a for a in preview["alertas"]):
        raise HTTPException(status_code=400, detail="Faltan tarifas", headers={"preview": str(preview)})

    # -------------------------
    # Generar número de factura tipo QSYYMM0001
    hoy = date.today()
    prefijo = hoy.strftime("%y%m")
    ultima = db.query(Factura).filter(Factura.num_factura.like(f"QS{prefijo}%"))\
        .order_by(Factura.num_factura.desc()).first()
    secuencia = 1
    if ultima:
        secuencia = int(ultima.num_factura[-4:]) + 1
    num_factura = f"QS{prefijo}{secuencia:04d}"

    # -------------------------
    # Crear factura
    nueva = Factura(
        id_sociedad=request.id_sociedad,
        id_cliente=request.id_cliente,
        num_factura=num_factura,
        fec_factura=hoy,
        concepto=request.concepto,
        base_imponible=preview["total_importe"],
        total=preview["total_importe"]
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    # -------------------------
    # Bloquear horas
    horas = db.query(HorasTrab).filter(
        HorasTrab.id_cliente == request.id_cliente,
        HorasTrab.estado == "PENDIENTE",
        extract("year", HorasTrab.fecha) == request.anio,
        extract("month", HorasTrab.fecha) == request.mes
    ).all()

    for h in horas:
        h.estado = "FACTURADA"
        h.id_factura = nueva.num_factura

    db.commit()

    return {
        "mensaje": "Factura generada correctamente",
        "num_factura": nueva.num_factura,
        "fec_factura": nueva.fec_factura.isoformat(),
        "base_imponible": float(nueva.base_imponible),
        "total": float(nueva.total),
        "lineas": preview["lineas"]
    }