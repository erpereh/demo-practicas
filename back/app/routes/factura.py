"""
Módulo de generación de FACTURAS (conectado a bbdd)

Responsabilidades:
- Previsualizar cálculo de factura (preview).
- Agrupar horas por empleado + proyecto.
- Aplicar tarifa por hora.
- Generar factura definitiva.
- Bloquear horas como facturadas.

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
from app.models.cliente import Cliente
from app.models.hist_proyecto import HistProyecto

from app.models.proyecto import Proyecto
from app.models.horas_trab import HorasTrab

from calendar import monthrange

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




#Consigue el empleado por su ID (Utiliza Empleado)
def get_empleado_nombre(dni: str, db: Session) -> str:
    emp = db.query(Empleado).filter(
        Empleado.id_empleado == dni
    ).first()

    if not emp:
        return dni

    return f"{emp.nombre} {emp.apellidos}"

#Consigue la tarifa para devolver precio/hora (Utiliza HistProyecto)
def get_tarifa(id_empleado: str, id_proyecto: str, fecha: date, db: Session):
    print("BUSCANDO TARIFA: ", id_empleado, id_proyecto)
    tarifa = db.query(HistProyecto).filter(
        HistProyecto.id_empleado == id_empleado,
        HistProyecto.id_proyecto == id_proyecto,
        HistProyecto.fec_inicio <= fecha
    ).order_by(HistProyecto.fec_inicio.desc()).first()

    print("RESULTADO TARIFA:", tarifa)
    return float(tarifa.tarifa) if tarifa else None


# MÉTODO QUE CALCULA LA FACTURA MENSUAL DE UN CLIENTE 
#Previsualiza las horas pendientes (Usa HorasTrab)
def _preview_calculo(anio: int, mes: int, id_cliente: str, db: Session):
    alertas = []
    #(1) ENCONTRAR LOS PROYECTOS DEL CLIENTE
    #Consulta a los proyectos cuyos id_cliente sean el pedido
    proyectos = db.query(Proyecto.id_proyecto).filter(Proyecto.id_cliente == id_cliente).all()
    proyectos_ids = [p.id_proyecto for p in proyectos] #proyectos_ids son los proyectos que tiene el cliente
    if not proyectos_ids:
        return {
            "anio": anio,
            "mes": mes,
            "id_cliente": id_cliente,
            "total_horas": 0,
            "total_importe": 0,
            "lineas": [],
            "alertas": ["El cliente no tiene proyectos"]
        }
    
    #(2) SACAR LAS HORAS TRABAJADAS DEL MES DE ESOS PROYECTOS
    #Consulta las horas trabajadas en los proyectos que figuren en proyectos_ids
    #Y que estén dentro del mismo MES y AÑO que se pide 
    horas = db.query(HorasTrab).filter(HorasTrab.id_proyecto.in_(proyectos_ids),
    extract("year", HorasTrab.fecha) == anio,
    extract("month", HorasTrab.fecha) == mes                                   
    ).all()
    if not horas:
        return {
            "anio": anio,
            "mes": mes,
            "id_cliente": id_cliente,
            "total_horas": 0,
            "total_importe": 0,
            "lineas": [],
            "alertas": ["No hay horas trabajadas en los proyectos del cliente"]
        }
    
    #(3) AGRUPAR EMPLEADO + PROYECTO EN HORAS
    agrupado = {}
    for h in horas:
        key = (h.id_empleado, h.id_proyecto)
        if key not in agrupado:
            agrupado[key] = 0
        agrupado[key] += float(h.horas_dia)
    
    lineas = []
    total_importe = 0
    total_horas = 0

    #(4) BUSCAR LA TARIFA ASOCIADA AL EMPLEADO/PROYECTO Y CALCULAR SUBTOTALES
    for (empleado, proyecto), horas_totales in agrupado.items():
        #Se consigue la tarifa
        ultimo_dia = monthrange(anio, mes)[1]
        fecha = date(anio, mes, ultimo_dia) #(Se necesita la fecha para sacar la tarifa)
        tarifa = get_tarifa(empleado, proyecto, fecha, db)
        if not tarifa:
            alertas.append("Falta tarifa para {empleado} en proyecto {proyecto}.")
            continue
        #Subtotal: Total de horas trabajadas por un empleado, * su tarifa en ese proyecto
        subtotal = round(horas_totales * tarifa, 2)

        #SE ESCRIBE LA SALIDA DE TODOS LOS SUBTOTALES
        lineas.append({
            "empleado_dni": empleado,
            "empleado": empleado,
            "proyecto": proyecto,
            "horas": horas_totales,
            "tarifa_hora": tarifa,
            "subtotal": subtotal
        })
        #SE CALCULAN LOS TOTALES
        total_importe += subtotal
        total_horas += horas_totales
    
    #(5) DEVUELVE LAS LINEAS DE SUBTOTALES Y EL TOTAL DE LA FACTURA
    return {
        "anio": anio,
        "mes": mes,
        "id_cliente": id_cliente,
        "total_horas": round(total_horas, 2),
        "total_importe": round(total_importe, 2),
        "lineas": lineas,
        "alertas": alertas
    }


#(GET/clientes) LISTAR CLIENTES
@router.get("/clientes")
def obtener_clientes(db: Session = Depends(get_db)):
    clientes = db.query(Cliente).all()
    return clientes


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
    preview = _preview_calculo(request.anio, request.mes, request.id_cliente, db)
    return preview



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
        extract("year", Factura.fec_factura) == request.anio,
        extract("month", Factura.fec_factura) == request.mes
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
    #horas = db.query(HorasTrab).filter(
    #    HorasTrab.id_cliente == request.id_cliente,
    #    HorasTrab.estado == "PENDIENTE",
    #    extract("year", HorasTrab.fecha) == request.anio,
    #    extract("month", HorasTrab.fecha) == request.mes
    #).all()

    #for h in horas:
    #    h.estado = "FACTURADA"
    #    h.id_factura = nueva.num_factura

    #db.commit()

    return {
        "mensaje": "Factura generada correctamente",
        "num_factura": nueva.num_factura,
        "fec_factura": nueva.fec_factura.isoformat(),
        "base_imponible": float(nueva.base_imponible),
        "total": float(nueva.total),
        "lineas": preview["lineas"],
        "alertas": []
    }