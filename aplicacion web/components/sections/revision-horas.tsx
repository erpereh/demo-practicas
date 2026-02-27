"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Search,
  Plus,
  Filter,
  Pencil,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { revisionHoras, empleados, proyectos } from "@/lib/mock-data"
import type { RevisionEstado } from "@/lib/mock-data"

type Registro = (typeof revisionHoras)[number]

const estadoStyles: Record<RevisionEstado, string> = {
  Aprobado: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Pendiente: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Rechazado: "bg-red-100 text-red-700 hover:bg-red-100",
}

const mesesDisponibles = [
  { value: "todos", label: "Todos los meses" },
  { value: "2026-02", label: "Febrero 2026" },
  { value: "2026-01", label: "Enero 2026" },
]

const empleadoOptions = [
  "Todos",
  ...Array.from(new Set(empleados.map((e) => e.nombre))),
]

const proyectoOptions = [
  "Todos",
  ...Array.from(new Set(proyectos.map((p) => p.nombre))),
]

export function RevisionHorasSection() {
  const [data, setData] = useState<Registro[]>(revisionHoras)
  const [mesFilter, setMesFilter] = useState("todos")
  const [empleadoFilter, setEmpleadoFilter] = useState("Todos")
  const [proyectoFilter, setProyectoFilter] = useState("Todos")
  const [search, setSearch] = useState("")

  // Inline editing
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<Partial<Registro>>({})

  // Add row modal
  const [showAddRow, setShowAddRow] = useState(false)
  const [newRow, setNewRow] = useState({
    empleado: empleados[0].nombre,
    proyecto: proyectos[0].nombre,
    fecha: new Date().toISOString().split("T")[0],
    horas: 8,
    descripcion: "",
  })

  const startEdit = useCallback((row: Registro) => {
    setEditingId(row.id)
    setEditValues({
      empleado: row.empleado,
      proyecto: row.proyecto,
      fecha: row.fecha,
      horas: row.horas,
      descripcion: row.descripcion,
    })
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setEditValues({})
  }, [])

  const saveEdit = useCallback(() => {
    if (editingId === null) return
    setData((prev) =>
      prev.map((row) =>
        row.id === editingId ? { ...row, ...editValues } : row
      )
    )
    setEditingId(null)
    setEditValues({})
  }, [editingId, editValues])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") saveEdit()
      if (e.key === "Escape") cancelEdit()
    },
    [saveEdit, cancelEdit]
  )

  const handleAddRow = useCallback(() => {
    const nextId = Math.max(...data.map((d) => d.id)) + 1
    const mes = newRow.fecha.substring(0, 7)
    setData((prev) => [
      {
        id: nextId,
        empleado: newRow.empleado,
        proyecto: newRow.proyecto,
        fecha: newRow.fecha,
        horas: newRow.horas,
        descripcion: newRow.descripcion,
        estado: "Pendiente" as RevisionEstado,
        mes,
      },
      ...prev,
    ])
    setShowAddRow(false)
    setNewRow({
      empleado: empleados[0].nombre,
      proyecto: proyectos[0].nombre,
      fecha: new Date().toISOString().split("T")[0],
      horas: 8,
      descripcion: "",
    })
  }, [data, newRow])

  const filtered = useMemo(() => {
    return data.filter((r) => {
      const matchMes = mesFilter === "todos" || r.mes === mesFilter
      const matchEmpleado =
        empleadoFilter === "Todos" || r.empleado === empleadoFilter
      const matchProyecto =
        proyectoFilter === "Todos" || r.proyecto === proyectoFilter
      const matchSearch =
        !search ||
        r.empleado.toLowerCase().includes(search.toLowerCase()) ||
        r.descripcion.toLowerCase().includes(search.toLowerCase())
      return matchMes && matchEmpleado && matchProyecto && matchSearch
    })
  }, [data, mesFilter, empleadoFilter, proyectoFilter, search])

  const totalHoras = filtered.reduce((acc, r) => acc + r.horas, 0)
  const pendientes = filtered.filter((r) => r.estado === "Pendiente").length
  const aprobados = filtered.filter((r) => r.estado === "Aprobado").length
  const rechazados = filtered.filter((r) => r.estado === "Rechazado").length

  const empleadoNames = Array.from(new Set(empleados.map((e) => e.nombre)))
  const proyectoNames = Array.from(new Set(proyectos.map((p) => p.nombre)))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Revisa, edita y aprueba los fichajes del equipo
        </p>
        <button
          onClick={() => setShowAddRow(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Anadir Fichaje Manual
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalHoras}h</p>
              <p className="text-xs text-muted-foreground">Total horas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{pendientes}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{aprobados}</p>
              <p className="text-xs text-muted-foreground">Aprobados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{rechazados}</p>
              <p className="text-xs text-muted-foreground">Rechazados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Manual Row Form */}
      {showAddRow && (
        <Card className="border-2 border-primary/30 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground">
              Nuevo fichaje manual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Empleado */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Empleado
                </label>
                <select
                  value={newRow.empleado}
                  onChange={(e) =>
                    setNewRow((v) => ({ ...v, empleado: e.target.value }))
                  }
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {empleadoNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Proyecto */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Proyecto
                </label>
                <select
                  value={newRow.proyecto}
                  onChange={(e) =>
                    setNewRow((v) => ({ ...v, proyecto: e.target.value }))
                  }
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {proyectoNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Fecha
                </label>
                <input
                  type="date"
                  value={newRow.fecha}
                  onChange={(e) =>
                    setNewRow((v) => ({ ...v, fecha: e.target.value }))
                  }
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Horas */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Horas
                </label>
                <input
                  type="number"
                  min={0.5}
                  max={24}
                  step={0.5}
                  value={newRow.horas}
                  onChange={(e) =>
                    setNewRow((v) => ({
                      ...v,
                      horas: Number(e.target.value),
                    }))
                  }
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Descripcion */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Descripcion
                </label>
                <input
                  type="text"
                  placeholder="Tarea realizada..."
                  value={newRow.descripcion}
                  onChange={(e) =>
                    setNewRow((v) => ({ ...v, descripcion: e.target.value }))
                  }
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddRow(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddRow}
                disabled={!newRow.descripcion.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Guardar fichaje
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main table card */}
      <Card className="border border-border bg-card">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Registros de horas
          </CardTitle>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Mes filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate max-w-[120px]">
                    {mesesDisponibles.find((m) => m.value === mesFilter)?.label}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {mesesDisponibles.map((m) => (
                  <DropdownMenuItem
                    key={m.value}
                    onClick={() => setMesFilter(m.value)}
                    className={mesFilter === m.value ? "bg-accent" : ""}
                  >
                    {m.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Empleado filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate max-w-[120px]">
                    {empleadoFilter === "Todos"
                      ? "Empleado"
                      : empleadoFilter}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {empleadoOptions.map((name) => (
                  <DropdownMenuItem
                    key={name}
                    onClick={() => setEmpleadoFilter(name)}
                    className={empleadoFilter === name ? "bg-accent" : ""}
                  >
                    {name === "Todos" ? "Todos los empleados" : name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Proyecto filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate max-w-[120px]">
                    {proyectoFilter === "Todos"
                      ? "Proyecto"
                      : proyectoFilter}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {proyectoOptions.map((name) => (
                  <DropdownMenuItem
                    key={name}
                    onClick={() => setProyectoFilter(name)}
                    className={proyectoFilter === name ? "bg-accent" : ""}
                  >
                    {name === "Todos" ? "Todos los proyectos" : name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-44"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Horas</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Descripcion
                  </TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[100px] text-center">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No se encontraron registros con los filtros seleccionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => {
                    const isEditing = editingId === row.id
                    return (
                      <TableRow key={row.id}>
                        {/* Empleado */}
                        <TableCell className="font-medium text-foreground">
                          {isEditing ? (
                            <select
                              value={editValues.empleado ?? row.empleado}
                              onChange={(e) =>
                                setEditValues((v) => ({
                                  ...v,
                                  empleado: e.target.value,
                                }))
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              {empleadoNames.map((name) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            row.empleado
                          )}
                        </TableCell>

                        {/* Proyecto */}
                        <TableCell className="text-muted-foreground">
                          {isEditing ? (
                            <select
                              value={editValues.proyecto ?? row.proyecto}
                              onChange={(e) =>
                                setEditValues((v) => ({
                                  ...v,
                                  proyecto: e.target.value,
                                }))
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              {proyectoNames.map((name) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            row.proyecto
                          )}
                        </TableCell>

                        {/* Fecha */}
                        <TableCell className="text-muted-foreground">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editValues.fecha ?? row.fecha}
                              onChange={(e) =>
                                setEditValues((v) => ({
                                  ...v,
                                  fecha: e.target.value,
                                }))
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          ) : (
                            new Date(row.fecha).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          )}
                        </TableCell>

                        {/* Horas */}
                        <TableCell className="text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0.5}
                              max={24}
                              step={0.5}
                              value={editValues.horas ?? row.horas}
                              onChange={(e) =>
                                setEditValues((v) => ({
                                  ...v,
                                  horas: Number(e.target.value),
                                }))
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 w-20 rounded-md border border-input bg-background px-2 text-right text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          ) : (
                            <span className="font-medium text-foreground">
                              {row.horas}h
                            </span>
                          )}
                        </TableCell>

                        {/* Descripcion */}
                        <TableCell className="hidden lg:table-cell">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValues.descripcion ?? row.descripcion}
                              onChange={(e) =>
                                setEditValues((v) => ({
                                  ...v,
                                  descripcion: e.target.value,
                                }))
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          ) : (
                            <span className="max-w-[200px] truncate text-muted-foreground">
                              {row.descripcion}
                            </span>
                          )}
                        </TableCell>

                        {/* Estado */}
                        <TableCell>
                          <Badge className={estadoStyles[row.estado]}>
                            {row.estado}
                          </Badge>
                        </TableCell>

                        {/* Acciones */}
                        <TableCell className="text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={saveEdit}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-emerald-600 transition-colors hover:bg-emerald-50"
                                aria-label="Guardar cambios"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                                aria-label="Cancelar edicion"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(row)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                              aria-label={`Editar fichaje de ${row.empleado}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <p className="text-sm text-muted-foreground">
              {filtered.length} de {data.length} registros
            </p>
            {(mesFilter !== "todos" ||
              empleadoFilter !== "Todos" ||
              proyectoFilter !== "Todos") && (
              <button
                onClick={() => {
                  setMesFilter("todos")
                  setEmpleadoFilter("Todos")
                  setProyectoFilter("Todos")
                  setSearch("")
                }}
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
