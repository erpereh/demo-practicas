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
import os

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import extract
from datetime import date

# 🔧 CAMBIO PDF: IMPORTS AÑADIDOS (NO EXISTÍAN)
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

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
from pydantic import BaseModel

from app.models.banco import Banco

#ROUTER:
router = APIRouter(
    prefix="/api",
    tags=["Facturas"]
)

#(GET/facturas) LISTAR FACTURAS
@router.get("/facturas")
def listar_facturas(db: Session = Depends(get_db)):
    facturas = db.query(Factura).all()
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
    tarifa = db.query(HistProyecto).filter(
        HistProyecto.id_empleado == id_empleado,
        HistProyecto.id_proyecto == id_proyecto,
        HistProyecto.fec_inicio <= fecha
    ).order_by(HistProyecto.fec_inicio.desc()).first()

    return float(tarifa.tarifa) if tarifa else None


# MÉTODO QUE CALCULA LA FACTURA MENSUAL DE UN CLIENTE 
def _preview_calculo(anio: int, mes: int, id_cliente: str, db: Session):
    alertas = []

    # (1) Proyectos del cliente
    proyectos = db.query(Proyecto.id_proyecto).filter(Proyecto.id_cliente == id_cliente).all()
    proyectos_ids = [p.id_proyecto for p in proyectos]
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

    # (2) Horas trabajadas del mes
    horas = db.query(HorasTrab).filter(
        HorasTrab.id_proyecto.in_(proyectos_ids),
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

    # (3) Agrupar por empleado + proyecto
    agrupado = {}
    for h in horas:
        key = (h.id_empleado, h.id_proyecto)
        if key not in agrupado:
            agrupado[key] = 0
        agrupado[key] += float(h.horas_dia)

    lineas = []
    total_importe = 0
    total_horas = 0

    # (4) Calcular subtotales y buscar tarifa
    for (empleado, proyecto), horas_totales in agrupado.items():
        ultimo_dia = monthrange(anio, mes)[1]
        fecha = date(anio, mes, ultimo_dia)
        tarifa = get_tarifa(empleado, proyecto, fecha, db)
        if not tarifa:
            # -------------------------
            # CAMBIO 1: alerta con f-string
            alertas.append(f"Falta tarifa para {empleado} en proyecto {proyecto}.")
            continue

        subtotal = round(horas_totales * tarifa, 2)

        # -------------------------
        # CAMBIO 2: mostrar nombre completo del empleado
        nombre_emp = get_empleado_nombre(empleado, db)

        lineas.append({
            "empleado_dni": empleado,
            "empleado": nombre_emp,  # nombre + apellidos
            "proyecto": proyecto,
            "horas": horas_totales,
            "tarifa_hora": tarifa,
            "subtotal": subtotal
        })

        total_importe += subtotal
        total_horas += horas_totales

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


# PASO 2: PREVISUALIZACIÓN
class PreviewRequest(BaseModel):
    anio: int
    mes: int
    id_cliente: str

@router.post("/factura/preview")
def preview_factura(request: PreviewRequest, db: Session = Depends(get_db)):
    if request.mes < 1 or request.mes > 12:
        raise HTTPException(status_code=400, detail="Mes inválido (1-12)")
    if request.anio < 2000 or request.anio > 2100:
        raise HTTPException(status_code=400, detail="Año inválido")

    preview = _preview_calculo(request.anio, request.mes, request.id_cliente, db)
    return preview


# PASO 3: GENERAR FACTURA
class GenerarFacturaRequest(BaseModel):
    id_sociedad: str
    anio: int
    mes: int
    id_cliente: str
    concepto: str

@router.post("/factura/generar")
def generar_factura(request: GenerarFacturaRequest, db: Session = Depends(get_db)):
    if request.mes < 1 or request.mes > 12:
        raise HTTPException(status_code=400, detail="Mes inválido (1-12)")
    if request.anio < 2000 or request.anio > 2100:
        raise HTTPException(status_code=400, detail="Año inválido")

    # Evitar duplicados
    existe = db.query(Factura).filter(
        Factura.id_cliente == request.id_cliente,
        extract("year", Factura.fec_factura) == request.anio,
        extract("month", Factura.fec_factura) == request.mes
    ).first()
    if existe:
        raise HTTPException(status_code=400, detail="Ya existe una factura para ese cliente/mes/año")

    # Calculamos preview
    preview = _preview_calculo(request.anio, request.mes, request.id_cliente, db)
    if not preview["lineas"]:
        raise HTTPException(status_code=400, detail="No hay líneas facturables", headers={"preview": str(preview)})
    if any("Falta tarifa" in a for a in preview["alertas"]):
        raise HTTPException(status_code=400, detail="Faltan tarifas", headers={"preview": str(preview)})

    # -------------------------
    # Generar número de factura
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
    # CAMBIO 3: BLOQUEAR HORAS PENDIENTES
    horas = db.query(HorasTrab).filter(
        HorasTrab.id_cliente == request.id_cliente,
        HorasTrab.estado == "PENDIENTE",
        extract("year", HorasTrab.fecha) == request.anio,
        extract("month", HorasTrab.fecha) == request.mes
    ).all()

    for h in horas:
        h.estado = "FACTURADA"            # marcamos como facturada
        h.id_factura = nueva.num_factura   # asociamos factura

    db.commit()  # guardamos cambios en la BBDD

    return {
        "mensaje": "Factura generada correctamente",
        "num_factura": nueva.num_factura,
        "fec_factura": nueva.fec_factura.isoformat(),
        "base_imponible": float(nueva.base_imponible),
        "total": float(nueva.total),
        "lineas": preview["lineas"],
        "alertas": []
    }


# 🔧 PDF IGUAL A LA PLANTILLA ORIGINAL
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.graphics.shapes import Drawing, Rect, String
import os
from reportlab.platypus import Image
import io

@router.get("/factura/pdf/{num_factura}")
def generar_pdf(num_factura: str, db: Session = Depends(get_db)):

    factura = db.query(Factura).filter(Factura.num_factura == num_factura).first()
    if not factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    cliente = db.query(Cliente).filter(Cliente.id_cliente == factura.id_cliente).first()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()
    normal = styles["Normal"]
    normal.fontSize = 10
    bold = styles["Heading4"]
    bold.fontSize = 12

    elements = []

    # ============================================================
    # PLACEHOLDER IMAGEN
    # ============================================================
    logo_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "static", "logo.png")
    )

    def placeholder_imagen(width=140, height=55):
        d = Drawing(width, height)
        d.add(Rect(0, 0, width, height, strokeColor=colors.grey, fillColor=None))
        d.add(String(width / 2 - 20, height / 2 - 5, "Imagen", fontSize=10))
        return d

    # Si el logo existe → usarlo
    # Si no existe → usar placeholder
    if os.path.exists(logo_path):
        logo = Image(logo_path, width=140, height=55)
    else:
        logo = placeholder_imagen()

    # ============================================================
    # LOGO + DATOS FACTURA
    # ============================================================

    
    datos_factura = [
        [Paragraph("<b>Factura</b>", normal)],
        [Paragraph(f"<b>N° Factura:</b> {factura.num_factura}", normal)],
        [Paragraph(f"<b>Fecha de impresión:</b> {factura.fec_factura.strftime('%d-%m-%Y')}", normal)],
    ]

    tabla_datos_factura = Table(datos_factura, colWidths=[200], hAlign='RIGHT')
    tabla_datos_factura.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))

    tabla_superior = Table([[logo, tabla_datos_factura]], colWidths=[200, 300])
    tabla_superior.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))

    elements.append(tabla_superior)
    elements.append(Spacer(1, 20))

    # ============================================================
    # DATOS EMPRESA + DATOS CLIENTE (EN DOS COLUMNAS)
    # ============================================================

    # PONER FONDO GRIS Y PONER ESTE BLOQUE A LA DERECHA
    # Datos fijos de la empresa
    empresa = [
        [Paragraph("QUALITY SOLUTION CONSULTING SL", normal)],
        [Paragraph("CIF/NIF: B86884707", normal)],
        [Paragraph("Calle Henri Dunant Nº 15-17 Oficina 16", normal)],
        [Paragraph("28036 Madrid", normal)],
        [Paragraph("España", normal)],
        [Paragraph("Teléfono: 91 565 42 48", normal)],
        [Paragraph("Email: facturacion@qualitysolution.es", normal)],
        [Paragraph("Web: http://www.qualitysolution.consulting/", normal)],
    ]

    tabla_empresa = Table(
        empresa,
        colWidths=[250],
        hAlign='RIGHT'
    )

    tabla_empresa.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.lightgrey),
        ('BOX', (0,0), (-1,-1), 1, colors.black),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))


    # RECUADRAR Y PONER EL BLOQUE A LA DERECHA
    # Datos dinámicos del cliente
    cliente_info = [
        [Paragraph("<b>Cliente</b>", bold)],
        [Paragraph(f"<b>{cliente.n_cliente}</b>", normal)],
    ]

    if cliente.direccion:
        cliente_info.append([Paragraph(cliente.direccion, normal)])
    if cliente.cif:
        cliente_info.append([Paragraph(f"CIF/NIF: {cliente.cif}", normal)])
    if cliente.telefono:
        cliente_info.append([Paragraph(f"ATT: {cliente.telefono}", normal)])

    tabla_cliente = Table(
        cliente_info,
        colWidths=[250],
        hAlign='LEFT'
    )

    tabla_cliente.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.black),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))


    # Crear tabla de dos columnas
    tabla_empresa_cliente = Table(
        [
            [tabla_cliente, tabla_empresa]
        ],
        colWidths=[260, 260]
    )

    tabla_empresa_cliente.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))

    elements.append(tabla_empresa_cliente)
    elements.append(Spacer(1, 20))
    
    # ============================================================
    # TABLA PRINCIPAL (DESCRIPCIÓN)
    # ============================================================

    base = float(factura.base_imponible)
    iva = round(base * 0.21, 2)
    total = base + iva

    tabla_lineas = Table([
        ["DESCRIPCIÓN", "IVA", "BASE IMPONIBLE", "TOTAL"],
        [factura.concepto, f"{iva:.2f}", f"{base:.2f}", f"{total:.2f}"],
    ], colWidths=[220, 60, 100, 100])

    tabla_lineas.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
    ]))

    elements.append(tabla_lineas)
    elements.append(Spacer(1, 20))

    # ============================================================
    # DATOS BANCARIOS (DINÁMICOS)
    # ============================================================

    banco = None

    if cliente and cliente.id_banco:
        banco = db.query(Banco).filter(
            Banco.id_banco_cobro == cliente.id_banco
        ).first()

    elements.append(Paragraph("<b>Pago mediante transferencia a la cuenta bancaria siguiente:</b>", normal))
    elements.append(Spacer(1, 5))

    if banco:
        datos_banco = [
            f"Banco: {banco.n_banco_cobro}",
            f"Número cuenta: {banco.num_cuenta or '—'}",
            f"Código IBAN: {banco.codigo_iban or '—'}",
        ]
    else:
        datos_banco = [
            "Banco: —",
            "Número cuenta: —",
            "Código IBAN: —",
        ]

    for linea in datos_banco:
        elements.append(Paragraph(linea, normal))

    elements.append(Spacer(1, 20))

    # ============================================================
    # TOTALES
    # ============================================================

    tabla_totales = Table([
        ["TOTAL IVA 21%", f"{iva:.2f}"],
        ["TOTAL BASE IMPONIBLE", f"{base:.2f}"],
        ["TOTAL FACTURA", f"{total:.2f}"],
    ], colWidths=[250, 150])

    tabla_totales.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        # Fondo gris y negrita para TOTAL
        ("BACKGROUND", (0, 2), (-1, 2), colors.lightgrey),
        ("FONTNAME", (0, 2), (-1, 2), "Helvetica-Bold"),
    ]))

    elements.append(tabla_totales)
    #espacio entre la firma y la tabla
    elements.append(Spacer(1, 40))

    # ============================================================
    # FIRMA (ALINEADA A LA DERECHA)
    # ============================================================

    firma = [
        [Paragraph("<b>QUALITY SOLUTION CONSULTING SL</b>", normal)],
        [Paragraph("C.I.F. B-86884707", normal)],
    ]

    tabla_firma = Table(
        [[firma]],
        colWidths=[450]  # empuja la firma hacia la derecha
    )

    tabla_firma.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))

    elements.append(tabla_firma)

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=factura_{num_factura}.pdf"},
    )