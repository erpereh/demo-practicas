"use client"

import { useState, useCallback } from "react"
import { Plus, Pencil, Check, X, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { asignacionTarifas, empleados, proyectos } from "@/lib/mock-data"

type Asignacion = (typeof asignacionTarifas)[number]

export function TarifasSection() {
  const [data, setData] = useState<Asignacion[]>(asignacionTarifas)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<Partial<Asignacion>>({})
  const [search, setSearch] = useState("")

  const startEdit = useCallback((row: Asignacion) => {
    setEditingId(row.id)
    setEditValues({
      empleado: row.empleado,
      proyecto: row.proyecto,
      tarifaHora: row.tarifaHora,
      fechaInicio: row.fechaInicio,
      fechaFin: row.fechaFin,
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

  const filtered = data.filter(
    (row) =>
      row.empleado.toLowerCase().includes(search.toLowerCase()) ||
      row.proyecto.toLowerCase().includes(search.toLowerCase())
  )

  const empleadoNames = [...new Set(empleados.map((e) => e.nombre))]
  const proyectoNames = [...new Set(proyectos.map((p) => p.nombre))]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Asigna tarifas por hora a cada empleado en cada proyecto
        </p>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nueva Asignacion
        </button>
      </div>

      <Card className="border border-border bg-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Asignacion de Tarifas
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar empleado o proyecto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-64"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead className="text-right">Tarifa por hora</TableHead>
                  <TableHead>Fecha inicio</TableHead>
                  <TableHead>Fecha fin</TableHead>
                  <TableHead className="w-[100px] text-center">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No se encontraron asignaciones.
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

                        {/* Tarifa por hora */}
                        <TableCell className="text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              step={5}
                              value={editValues.tarifaHora ?? row.tarifaHora}
                              onChange={(e) =>
                                setEditValues((v) => ({
                                  ...v,
                                  tarifaHora: Number(e.target.value),
                                }))
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 w-24 rounded-md border border-input bg-background px-2 text-right text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          ) : (
                            <span className="font-semibold text-foreground">
                              {row.tarifaHora.toLocaleString("es-ES", {
                                style: "currency",
                                currency: "EUR",
                              })}
                            </span>
                          )}
                        </TableCell>

                        {/* Fecha inicio */}
                        <TableCell className="text-muted-foreground">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editValues.fechaInicio ?? row.fechaInicio}
                              onChange={(e) =>
                                setEditValues((v) => ({
                                  ...v,
                                  fechaInicio: e.target.value,
                                }))
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          ) : (
                            new Date(row.fechaInicio).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          )}
                        </TableCell>

                        {/* Fecha fin */}
                        <TableCell className="text-muted-foreground">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editValues.fechaFin ?? row.fechaFin}
                              onChange={(e) =>
                                setEditValues((v) => ({
                                  ...v,
                                  fechaFin: e.target.value,
                                }))
                              }
                              onKeyDown={handleKeyDown}
                              className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          ) : (
                            new Date(row.fechaFin).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          )}
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
                              aria-label={`Editar asignacion de ${row.empleado}`}
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

          {/* Results footer */}
          <div className="border-t border-border px-6 py-3">
            <p className="text-sm text-muted-foreground">
              {filtered.length} asignaciones
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
