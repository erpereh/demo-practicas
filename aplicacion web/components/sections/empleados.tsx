"use client"

import { Search, Plus } from "lucide-react"
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
import { empleados } from "@/lib/mock-data"

export function EmpleadosSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Gestiona el equipo de trabajo y sus asignaciones
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nuevo Empleado
        </button>
      </div>

      <Card className="border border-border bg-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Lista de Empleados
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar empleado..."
              className="h-9 rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Puesto</TableHead>
                  <TableHead className="hidden lg:table-cell">Departamento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Horas/Mes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empleados.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium text-foreground">
                      {emp.nombre}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {emp.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{emp.puesto}</TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {emp.departamento}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={emp.estado === "Activo" ? "default" : "secondary"}
                        className={
                          emp.estado === "Activo"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                        }
                      >
                        {emp.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      {emp.horasMes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
