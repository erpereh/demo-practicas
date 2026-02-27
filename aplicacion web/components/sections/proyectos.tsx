"use client"

import { useState, useMemo } from "react"
import { Search, Plus, Filter } from "lucide-react"
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
import { proyectos, clientes } from "@/lib/mock-data"
import type { TipoPago, EstadoProyecto } from "@/lib/mock-data"

const tipoPagoStyles: Record<TipoPago, string> = {
  Abierto: "bg-sky-100 text-sky-700 hover:bg-sky-100",
  Cerrado: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Fraccionado: "bg-violet-100 text-violet-700 hover:bg-violet-100",
}

const estadoStyles: Record<EstadoProyecto, string> = {
  "En progreso": "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Planificacion: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  "En pausa": "bg-muted text-muted-foreground hover:bg-muted",
  Completado: "bg-teal-100 text-teal-700 hover:bg-teal-100",
}

const clienteNames = ["Todos", ...clientes.map((c) => c.nombre)]

export function ProyectosSection() {
  const [search, setSearch] = useState("")
  const [clienteFilter, setClienteFilter] = useState("Todos")

  const filtered = useMemo(() => {
    return proyectos.filter((p) => {
      const matchSearch =
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.codigoFichaje.toLowerCase().includes(search.toLowerCase())
      const matchCliente =
        clienteFilter === "Todos" || p.cliente === clienteFilter
      return matchSearch && matchCliente
    })
  }, [search, clienteFilter])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Seguimiento y gestion de proyectos activos
        </p>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nuevo Proyecto
        </button>
      </div>

      <Card className="border border-border bg-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Lista de Proyectos
          </CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Client filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate max-w-[140px]">
                    {clienteFilter === "Todos" ? "Todos los clientes" : clienteFilter}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {clienteNames.map((name) => (
                  <DropdownMenuItem
                    key={name}
                    onClick={() => setClienteFilter(name)}
                    className={clienteFilter === name ? "bg-accent" : ""}
                  >
                    {name === "Todos" ? "Todos los clientes" : name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar proyecto o codigo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-56"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del proyecto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo de Pago</TableHead>
                  <TableHead className="hidden md:table-cell">Codigo de fichaje</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No se encontraron proyectos con los filtros seleccionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((proy) => (
                    <TableRow key={proy.id}>
                      <TableCell className="font-medium text-foreground">
                        {proy.nombre}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {proy.cliente}
                      </TableCell>
                      <TableCell>
                        <Badge className={tipoPagoStyles[proy.tipoPago]}>
                          {proy.tipoPago}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden font-mono text-sm text-muted-foreground md:table-cell">
                        {proy.codigoFichaje}
                      </TableCell>
                      <TableCell>
                        <Badge className={estadoStyles[proy.estado]}>
                          {proy.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Results footer */}
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <p className="text-sm text-muted-foreground">
              {filtered.length} de {proyectos.length} proyectos
            </p>
            {clienteFilter !== "Todos" && (
              <button
                onClick={() => setClienteFilter("Todos")}
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
