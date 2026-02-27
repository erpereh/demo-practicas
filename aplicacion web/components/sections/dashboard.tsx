"use client"

import { useMemo } from "react"
import {
  Clock,
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  TrendingDown,
  Upload,
  ClipboardCheck,
  FolderKanban,
  Receipt,
  ArrowRight,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import {
  kpiData,
  facturacionMensual,
  horasPorProyecto,
  empleados,
  proyectos,
  revisionHoras,
  facturas,
} from "@/lib/mock-data"
import { useApp, type Section } from "@/lib/app-context"
import { cn } from "@/lib/utils"

/* ─── Derived KPI data ──────────────────────────────── */

function useKpiCards() {
  return useMemo(() => {
    const empleadosActivos = empleados.filter((e) => e.estado === "Activo").length
    const horasPendientes = revisionHoras.filter((r) => r.estado === "Pendiente").length
    const facturasPendientesTotal = facturas
      .filter((f) => f.estado === "Pendiente")
      .reduce((sum, f) => sum + f.monto, 0)

    return [
      {
        title: "Horas Reportadas",
        value: kpiData.horasDelMes.toLocaleString("es-ES") + "h",
        subtitle: "+12% vs mes anterior",
        icon: Clock,
        trend: "up" as const,
        trendValue: "+12%",
        accentClass: "bg-primary/10 text-primary",
      },
      {
        title: "Facturacion Estimada",
        value:
          new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          }).format(kpiData.facturacionEstimada),
        subtitle: "+8.2% vs mes anterior",
        icon: DollarSign,
        trend: "up" as const,
        trendValue: "+8.2%",
        accentClass: "bg-emerald-500/10 text-emerald-600",
      },
      {
        title: "Facturacion Pendiente",
        value:
          new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          }).format(facturasPendientesTotal),
        subtitle: `${facturas.filter((f) => f.estado === "Pendiente").length} facturas sin cobrar`,
        icon: FileText,
        trend: "neutral" as const,
        trendValue: `${horasPendientes} fichajes pendientes`,
        accentClass: "bg-amber-500/10 text-amber-600",
      },
      {
        title: "Empleados Activos",
        value: empleadosActivos.toString(),
        subtitle: `${empleados.filter((e) => e.estado === "Vacaciones").length} en vacaciones`,
        icon: Users,
        trend: "neutral" as const,
        trendValue: `de ${empleados.length} totales`,
        accentClass: "bg-sky-500/10 text-sky-600",
      },
    ]
  }, [])
}

/* ─── Quick-access shortcuts ────────────────────────── */

const quickActions: {
  label: string
  description: string
  section: Section
  icon: typeof Upload
  color: string
}[] = [
  {
    label: "Importar Horas",
    description: "Subir fichero de fichajes",
    section: "importacion-horas",
    icon: Upload,
    color: "text-primary",
  },
  {
    label: "Revisar Horas",
    description: "Aprobar horas pendientes",
    section: "revision-horas",
    icon: ClipboardCheck,
    color: "text-emerald-600",
  },
  {
    label: "Generar Factura",
    description: "Crear nueva factura",
    section: "generador-facturas",
    icon: Receipt,
    color: "text-amber-600",
  },
  {
    label: "Ver Proyectos",
    description: "Estado de proyectos activos",
    section: "proyectos",
    icon: FolderKanban,
    color: "text-sky-600",
  },
]

/* ─── Chart colors ──────────────────────────────────── */

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

/* ─── Activity feed (derived from mock data) ────────── */

function useRecentActivity() {
  return useMemo(() => {
    const activities: {
      id: string
      message: string
      time: string
      type: "success" | "warning" | "info"
    }[] = [
      {
        id: "a1",
        message: "Factura FAC-2026-001 marcada como Pagada",
        time: "Hace 2 horas",
        type: "success",
      },
      {
        id: "a2",
        message: `${revisionHoras.filter((r) => r.estado === "Pendiente").length} fichajes pendientes de aprobacion`,
        time: "Hoy",
        type: "warning",
      },
      {
        id: "a3",
        message: `Proyecto ERP Logistics al ${proyectos.find((p) => p.nombre === "ERP Logistics")?.progreso}% completado`,
        time: "Ayer",
        type: "info",
      },
      {
        id: "a4",
        message: "Carlos Martinez reporto 8h en Portal Bancario v2",
        time: "Ayer",
        type: "info",
      },
      {
        id: "a5",
        message: "Factura FAC-2026-003 vence en 5 dias",
        time: "Hace 3 dias",
        type: "warning",
      },
    ]
    return activities
  }, [])
}

/* ─── Component ──────────────────────────────────────── */

export function DashboardSection() {
  const { setActiveSection } = useApp()
  const kpis = useKpiCards()
  const activity = useRecentActivity()

  const proyectosActivos = proyectos.filter(
    (p) => p.estado === "En progreso" || p.estado === "Planificacion"
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          Panel de Control
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen general de la actividad del mes de Febrero 2026
        </p>
      </div>

      {/* ─── KPI Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.title}
            className="relative overflow-hidden border border-border bg-card"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  kpi.accentClass
                )}
              >
                <kpi.icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="mt-2 flex items-center gap-2">
                {kpi.trend === "up" && (
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-600">
                    <TrendingUp className="h-3 w-3" />
                    {kpi.trendValue}
                  </span>
                )}
                {kpi.trend === "neutral" && (
                  <span className="text-xs text-muted-foreground">
                    {kpi.trendValue}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{kpi.subtitle}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Charts Row ────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bar Chart */}
        <Card className="border border-border bg-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                Facturacion Mensual
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ingresos facturados en EUR por mes
              </p>
            </div>
            <Badge
              variant="secondary"
              className="bg-emerald-500/10 text-emerald-600"
            >
              <TrendingUp className="mr-1 h-3 w-3" />
              +5.4% YoY
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facturacionMensual} barSize={28}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="mes"
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground text-xs"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground text-xs"
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      }).format(value),
                      "Facturacion",
                    ]}
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      color: "var(--color-foreground)",
                    }}
                    cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
                  />
                  <Bar
                    dataKey="facturacion"
                    fill="var(--color-chart-1)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Horas por Proyecto
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribucion del mes actual
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={horasPorProyecto}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="horas"
                    nameKey="nombre"
                    strokeWidth={0}
                  >
                    {horasPorProyecto.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value}h`, name]}
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      color: "var(--color-foreground)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="mt-3 flex flex-col gap-2">
              {horasPorProyecto.map((p, i) => (
                <div
                  key={p.nombre}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[i] }}
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">{p.nombre}</span>
                  </div>
                  <span className="font-medium text-foreground">{p.horas}h</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Quick Actions + Activity Row ──────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="border border-border bg-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Accesos Rapidos
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Tareas frecuentes
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {quickActions.map((action) => (
              <button
                key={action.section}
                onClick={() => setActiveSection(action.section)}
                className="group flex w-full items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-accent"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted",
                    action.color
                  )}
                >
                  <action.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {action.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <ArrowRight
                  className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border border-border bg-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Actividad Reciente
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ultimas actualizaciones
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg"
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-2 w-2 shrink-0 rounded-full",
                      item.type === "success" && "bg-emerald-500",
                      item.type === "warning" && "bg-amber-500",
                      item.type === "info" && "bg-primary"
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-foreground leading-relaxed">
                      {item.message}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projects progress mini-view */}
        <Card className="border border-border bg-card lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                Proyectos Activos
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {proyectosActivos.length} en curso
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => setActiveSection("proyectos")}
            >
              Ver todos
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {proyectosActivos.slice(0, 4).map((proyecto) => (
              <div key={proyecto.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {proyecto.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {proyecto.cliente}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      proyecto.estado === "En progreso"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-sky-500/10 text-sky-600"
                    )}
                  >
                    {proyecto.estado}
                  </Badge>
                </div>
                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        proyecto.progreso >= 75
                          ? "bg-emerald-500"
                          : proyecto.progreso >= 40
                          ? "bg-primary"
                          : "bg-amber-500"
                      )}
                      style={{ width: `${proyecto.progreso}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-medium text-muted-foreground">
                    {proyecto.progreso}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ─── Pending alerts bar ────────────────────── */}
      {revisionHoras.filter((r) => r.estado === "Pendiente").length > 0 && (
        <Card className="border border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col items-start justify-between gap-3 py-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Fichajes pendientes de aprobacion
                </p>
                <p className="text-xs text-amber-700">
                  {revisionHoras.filter((r) => r.estado === "Pendiente").length} registros
                  requieren revision antes de generar facturas
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
              onClick={() => setActiveSection("revision-horas")}
            >
              Revisar ahora
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
