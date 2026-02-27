"use client"

import { useState, useMemo, useCallback } from "react"
import {
  ChevronRight,
  ChevronLeft,
  FileDown,
  Lock,
  CheckCircle2,
  Receipt,
  Building2,
  Calendar,
  Euro,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  clientes,
  revisionHoras,
  asignacionTarifas,
  proyectos,
} from "@/lib/mock-data"

// ---------- Types ----------
interface LineaFactura {
  empleado: string
  proyecto: string
  horas: number
  tarifaHora: number
  subtotal: number
}

interface FacturaGenerada {
  numero: string
  cliente: string
  mes: string
  anio: string
  lineas: LineaFactura[]
  subtotal: number
  iva: number
  total: number
}

// ---------- Constants ----------
const meses = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
]

const anios = ["2025", "2026"]

const clienteNames = clientes.map((c) => c.nombre)

const IVA_RATE = 0.21

// ---------- Helpers ----------
function getMesLabel(value: string) {
  return meses.find((m) => m.value === value)?.label ?? value
}

function formatCurrency(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

function generateInvoiceNumber() {
  const num = Math.floor(Math.random() * 900) + 100
  return `FAC-2026-${num}`
}

// ---------- Component ----------
export function GeneradorFacturasSection() {
  const [step, setStep] = useState<1 | 2>(1)
  const [mesSeleccionado, setMesSeleccionado] = useState("02")
  const [anioSeleccionado, setAnioSeleccionado] = useState("2026")
  const [clienteSeleccionado, setClienteSeleccionado] = useState("")

  const [isGenerating, setIsGenerating] = useState(false)
  const [facturaGenerada, setFacturaGenerada] = useState<FacturaGenerada | null>(null)

  // ---------- Compute invoice lines ----------
  const lineas = useMemo<LineaFactura[]>(() => {
    if (!clienteSeleccionado) return []

    const periodo = `${anioSeleccionado}-${mesSeleccionado}`

    // Get projects belonging to selected client
    const proyectosCliente = proyectos
      .filter((p) => p.cliente === clienteSeleccionado)
      .map((p) => p.nombre)

    // Get approved hours for that month + client projects
    const horasAprobadas = revisionHoras.filter(
      (r) =>
        r.mes === periodo &&
        r.estado === "Aprobado" &&
        proyectosCliente.includes(r.proyecto)
    )

    // Group by empleado + proyecto
    const grouped = new Map<string, { horas: number; proyecto: string; empleado: string }>()
    for (const h of horasAprobadas) {
      const key = `${h.empleado}||${h.proyecto}`
      const existing = grouped.get(key)
      if (existing) {
        existing.horas += h.horas
      } else {
        grouped.set(key, { horas: h.horas, proyecto: h.proyecto, empleado: h.empleado })
      }
    }

    // Get tarifa for each empleado-proyecto pair
    const result: LineaFactura[] = []
    for (const [, entry] of grouped) {
      const tarifa = asignacionTarifas.find(
        (t) => t.empleado === entry.empleado && t.proyecto === entry.proyecto
      )
      const tarifaHora = tarifa?.tarifaHora ?? 0
      result.push({
        empleado: entry.empleado,
        proyecto: entry.proyecto,
        horas: entry.horas,
        tarifaHora,
        subtotal: entry.horas * tarifaHora,
      })
    }

    return result.sort((a, b) => a.proyecto.localeCompare(b.proyecto) || a.empleado.localeCompare(b.empleado))
  }, [clienteSeleccionado, mesSeleccionado, anioSeleccionado])

  const subtotalFactura = lineas.reduce((acc, l) => acc + l.subtotal, 0)
  const ivaFactura = subtotalFactura * IVA_RATE
  const totalFactura = subtotalFactura + ivaFactura

  const canGoToStep2 = clienteSeleccionado !== ""

  // ---------- Generate invoice simulation ----------
  const handleGenerate = useCallback(() => {
    setIsGenerating(true)
    setTimeout(() => {
      setFacturaGenerada({
        numero: generateInvoiceNumber(),
        cliente: clienteSeleccionado,
        mes: mesSeleccionado,
        anio: anioSeleccionado,
        lineas,
        subtotal: subtotalFactura,
        iva: ivaFactura,
        total: totalFactura,
      })
      setIsGenerating(false)
    }, 1800)
  }, [clienteSeleccionado, mesSeleccionado, anioSeleccionado, lineas, subtotalFactura, ivaFactura, totalFactura])

  const handleNewInvoice = useCallback(() => {
    setStep(1)
    setClienteSeleccionado("")
    setFacturaGenerada(null)
  }, [])

  // ---------- Step indicator ----------
  const StepIndicator = () => (
    <div className="flex items-center gap-3">
      {/* Step 1 */}
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
            step >= 1
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
        </div>
        <span
          className={`hidden text-sm font-medium sm:inline ${
            step >= 1 ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Seleccion
        </span>
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground" />

      {/* Step 2 */}
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
            step >= 2
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          2
        </div>
        <span
          className={`hidden text-sm font-medium sm:inline ${
            step >= 2 ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Factura
        </span>
      </div>
    </div>
  )

  // ===================== RENDER =====================
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">
            Genera facturas a partir de las horas aprobadas por periodo y cliente
          </p>
        </div>
        <StepIndicator />
      </div>

      {/* =================== STEP 1 =================== */}
      {step === 1 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Selection form */}
          <Card className="border border-border bg-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Parametros de facturacion
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {/* Mes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Mes
                  </label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                      value={mesSeleccionado}
                      onChange={(e) => setMesSeleccionado(e.target.value)}
                      className="h-10 w-full appearance-none rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {meses.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Anio */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Ano
                  </label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                      value={anioSeleccionado}
                      onChange={(e) => setAnioSeleccionado(e.target.value)}
                      className="h-10 w-full appearance-none rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {anios.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cliente */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Cliente
                  </label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                      value={clienteSeleccionado}
                      onChange={(e) => setClienteSeleccionado(e.target.value)}
                      className="h-10 w-full appearance-none rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Seleccionar cliente...</option>
                      {clienteNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Preview summary when client is selected */}
              {clienteSeleccionado && (
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {clienteSeleccionado} - {getMesLabel(mesSeleccionado)} {anioSeleccionado}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lineas.length} lineas de facturacion encontradas
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-primary" />
                      <span className="text-lg font-bold text-foreground">
                        {formatCurrency(totalFactura)}
                      </span>
                      <span className="text-xs text-muted-foreground">(IVA incl.)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Next button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canGoToStep2}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continuar al desglose
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Side info panel */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Resumen rapido
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-sm text-muted-foreground">Periodo</span>
                  <span className="text-sm font-medium text-foreground">
                    {getMesLabel(mesSeleccionado)} {anioSeleccionado}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-sm text-muted-foreground">Cliente</span>
                  <span className="text-sm font-medium text-foreground">
                    {clienteSeleccionado || "Sin seleccionar"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-sm text-muted-foreground">Empleados</span>
                  <span className="text-sm font-medium text-foreground">
                    {new Set(lineas.map((l) => l.empleado)).size}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-sm text-muted-foreground">Total horas</span>
                  <span className="text-sm font-medium text-foreground">
                    {lineas.reduce((a, l) => a + l.horas, 0)}h
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Proyectos incluidos
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(new Set(lineas.map((l) => l.proyecto))).map((p) => (
                    <Badge
                      key={p}
                      className="bg-primary/10 text-primary hover:bg-primary/10"
                    >
                      {p}
                    </Badge>
                  ))}
                  {lineas.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      Selecciona un cliente para ver los proyectos
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* =================== STEP 2 =================== */}
      {step === 2 && !facturaGenerada && (
        <div className="flex flex-col gap-6">
          {/* Back button + context */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver a seleccion
            </button>
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                {clienteSeleccionado}
              </Badge>
              <Badge className="bg-muted text-muted-foreground hover:bg-muted">
                {getMesLabel(mesSeleccionado)} {anioSeleccionado}
              </Badge>
            </div>
          </div>

          {/* Invoice preview card */}
          <Card className="border border-border bg-card">
            <CardHeader className="flex flex-col gap-3 border-b border-border sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  Vista previa de factura
                </CardTitle>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Desglose de horas aprobadas por empleado y tarifa asignada
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Borrador
                </span>
              </div>
            </CardHeader>

            {/* Invoice header section */}
            <div className="border-b border-border bg-muted/30 px-6 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Emisor
                  </p>
                  <p className="text-sm font-semibold text-foreground">GestPro S.L.</p>
                  <p className="text-xs text-muted-foreground">CIF: B12345678</p>
                  <p className="text-xs text-muted-foreground">
                    Calle Innovacion 42, Madrid
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Cliente
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {clienteSeleccionado}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {clientes.find((c) => c.nombre === clienteSeleccionado)?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Contacto: {clientes.find((c) => c.nombre === clienteSeleccionado)?.contacto}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Periodo facturado
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {getMesLabel(mesSeleccionado)} {anioSeleccionado}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Fecha emision: {new Date().toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            </div>

            {/* Breakdown table */}
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead className="text-right">Horas</TableHead>
                      <TableHead className="text-right">Tarifa/h</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineas.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No hay horas aprobadas para este periodo y cliente.
                        </TableCell>
                      </TableRow>
                    ) : (
                      lineas.map((l, idx) => (
                        <TableRow key={`${l.empleado}-${l.proyecto}-${idx}`}>
                          <TableCell className="font-medium text-foreground">
                            {l.empleado}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {l.proyecto}
                          </TableCell>
                          <TableCell className="text-right font-mono text-foreground">
                            {l.horas}h
                          </TableCell>
                          <TableCell className="text-right font-mono text-foreground">
                            {formatCurrency(l.tarifaHora)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-foreground">
                            {formatCurrency(l.subtotal)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  {lineas.length > 0 && (
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium text-muted-foreground">
                          Subtotal
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          {formatCurrency(subtotalFactura)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium text-muted-foreground">
                          IVA (21%)
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          {formatCurrency(ivaFactura)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-primary/5">
                        <TableCell colSpan={4} className="text-right text-base font-bold text-foreground">
                          Total
                        </TableCell>
                        <TableCell className="text-right text-base font-bold text-primary">
                          {formatCurrency(totalFactura)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {lineas.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Al generar la factura, el mes quedara bloqueado para este cliente y no se podran modificar las horas.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Generar Factura
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================== GENERATED =================== */}
      {step === 2 && facturaGenerada && (
        <div className="flex flex-col gap-6">
          {/* Success banner */}
          <div className="flex items-center gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800">
                Factura generada correctamente
              </p>
              <p className="text-xs text-emerald-600">
                N. {facturaGenerada.numero} - El mes de {getMesLabel(facturaGenerada.mes)}{" "}
                {facturaGenerada.anio} ha sido bloqueado para {facturaGenerada.cliente}.
              </p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              Bloqueado
            </Badge>
          </div>

          {/* Final invoice card */}
          <Card className="border border-border bg-card">
            <CardHeader className="border-b border-border">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    Factura {facturaGenerada.numero}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {facturaGenerada.cliente} - {getMesLabel(facturaGenerada.mes)}{" "}
                    {facturaGenerada.anio}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Mes bloqueado</span>
                </div>
              </div>
            </CardHeader>

            {/* Invoice header */}
            <div className="border-b border-border bg-muted/30 px-6 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Emisor
                  </p>
                  <p className="text-sm font-semibold text-foreground">GestPro S.L.</p>
                  <p className="text-xs text-muted-foreground">CIF: B12345678</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Cliente
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {facturaGenerada.cliente}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Fecha emision
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date().toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead className="text-right">Horas</TableHead>
                      <TableHead className="text-right">Tarifa/h</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facturaGenerada.lineas.map((l, idx) => (
                      <TableRow key={`gen-${l.empleado}-${idx}`}>
                        <TableCell className="font-medium text-foreground">
                          {l.empleado}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {l.proyecto}
                        </TableCell>
                        <TableCell className="text-right font-mono text-foreground">
                          {l.horas}h
                        </TableCell>
                        <TableCell className="text-right font-mono text-foreground">
                          {formatCurrency(l.tarifaHora)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          {formatCurrency(l.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium text-muted-foreground">
                        Subtotal
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {formatCurrency(facturaGenerada.subtotal)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium text-muted-foreground">
                        IVA (21%)
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {formatCurrency(facturaGenerada.iva)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-primary/5">
                      <TableCell colSpan={4} className="text-right text-base font-bold text-foreground">
                        Total
                      </TableCell>
                      <TableCell className="text-right text-base font-bold text-primary">
                        {formatCurrency(facturaGenerada.total)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Bottom actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              onClick={handleNewInvoice}
              className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Nueva Factura
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <FileDown className="h-4 w-4" />
              Descargar PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
