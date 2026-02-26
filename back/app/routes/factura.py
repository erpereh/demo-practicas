from fastapi import APIRouter, Body

# CAMBIO CRÍTICO: Eliminamos el import que rompe el servidor
# from app.routes.empleados import empleados, horas_registradas

# Creamos las variables aquí vacías para que el código de abajo no explote
empleados =[]
horas_registradas =[]

# Añadimos el prefijo /api
router = APIRouter(prefix="/api", tags=["Facturas"])

# Facturas en memoria (luego irá a BBDD)
facturas_emitidas =[]
_factura_seq = 1

# Tarifa en memoria (luego irá a BBDD)
tarifas_asignadas =[
    {"id_empleado": "02906525S", "id_proyecto": "SOP_META4", "precio_hora": 45.50, "activa": True},
    {"id_empleado": "12345678A", "id_proyecto": "PROY001", "precio_hora": 35.00, "activa": True},
]

def _get_empleado_nombre(dni: str) -> str:
    emp = next((e for e in empleados if getattr(e, "id_empleado", "") == dni), None)
    if not emp:
        return dni
    return f"{getattr(emp, 'nombre', '')} {getattr(emp, 'apellidos', '')}"

def _get_tarifa(dni: str, id_proyecto: str):
    t = next(
        (x for x in tarifas_asignadas
         if x["id_empleado"] == dni and x["id_proyecto"] == id_proyecto and x.get("activa") is True),
        None
    )
    return t["precio_hora"] if t else None

def _preview_calculo(anio: int, mes: int, id_cliente: str):
    # Horas pendientes (no facturadas) del cliente/mes/año
    pendientes =[
        h for h in horas_registradas
        if getattr(h, "id_cliente", "") == id_cliente
        and getattr(h, "fecha", None) and h.fecha.year == anio
        and getattr(h, "fecha", None) and h.fecha.month == mes
        and getattr(h, "facturada", False) is False
    ]

    alertas =[]
    if not pendientes:
        alertas.append("No hay horas pendientes de facturar para ese cliente/mes/año.")

    # Agrupar por empleado + proyecto
    agrupado = {}
    for h in pendientes:
        key = (getattr(h, "id_empleado", ""), getattr(h, "id_proyecto", ""))
        if key not in agrupado:
            agrupado[key] = {"horas": 0.0}
        agrupado[key]["horas"] += float(getattr(h, "horas_dia", 0))

    lineas =[]
    total_horas = 0.0
    total_importe = 0.0

    for (dni, id_proyecto), data in agrupado.items():
        horas = round(data["horas"], 2)
        tarifa = _get_tarifa(dni, id_proyecto)

        if tarifa is None:
            alertas.append(f"Falta tarifa para {dni} en proyecto {id_proyecto}.")
            continue

        subtotal = round(horas * float(tarifa), 2)

        lineas.append({
            "empleado_dni": dni,
            "empleado": _get_empleado_nombre(dni),
            "proyecto": id_proyecto,
            "horas": horas,
            "tarifa_hora": float(tarifa),
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
@router.post("/factura/preview")
def preview_factura(
    anio: int = Body(...),
    mes: int = Body(...),
    id_cliente: str = Body(...)
):
    if mes < 1 or mes > 12:
        return {"error": "Mes inválido (1-12)"}
    if anio < 2000 or anio > 2100:
        return {"error": "Año inválido"}

    return _preview_calculo(anio, mes, id_cliente)

# BOTÓN FINAL: GENERAR FACTURA + BLOQUEAR HORAS
@router.post("/factura/generar")
def generar_factura(
    anio: int = Body(...),
    mes: int = Body(...),
    id_cliente: str = Body(...)
):
    global _factura_seq

    if mes < 1 or mes > 12:
        return {"error": "Mes inválido (1-12)"}
    if anio < 2000 or anio > 2100:
        return {"error": "Año inválido"}

    # Evitar duplicar factura emitida del mismo cliente/mes/año
    ya = next(
        (f for f in facturas_emitidas
         if f["anio"] == anio and f["mes"] == mes and f["id_cliente"] == id_cliente),
        None
    )
    if ya:
        return {"error": "Ya existe una factura para ese cliente/mes/año"}

    preview = _preview_calculo(anio, mes, id_cliente)

    # Si no hay líneas o hay alertas de tarifas faltantes, no se genera
    if len(preview["lineas"]) == 0:
        return {"error": "No se puede generar: no hay líneas facturables", "preview": preview}

    if any("Falta tarifa" in a for a in preview["alertas"]):
        return {"error": "No se puede generar: faltan tarifas", "preview": preview}

    # Crear factura
    factura = {
        "id_factura": _factura_seq,
        "anio": anio,
        "mes": mes,
        "id_cliente": id_cliente,
        "total_importe": preview["total_importe"],
        "lineas": preview["lineas"]
    }
    _factura_seq += 1
    facturas_emitidas.append(factura)

    # BLOQUEAR horas del mes/año/cliente
    for h in horas_registradas:
        if getattr(h, "id_cliente", "") == id_cliente and getattr(h, "fecha", None) and h.fecha.year == anio and h.fecha.month == mes:
            if getattr(h, "facturada", False) is False:
                h.facturada = True
                h.factura_id = factura["id_factura"]

    return {
        "mensaje": "Factura generada y horas bloqueadas",
        "factura": factura
    }