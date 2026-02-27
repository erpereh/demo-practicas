"use client"

import { useState, useCallback, useRef } from "react"
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  X,
  Loader2,
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
import { importacionHoras } from "@/lib/mock-data"
import type { ImportacionEstado } from "@/lib/mock-data"

const estadoIcon: Record<ImportacionEstado, React.ReactNode> = {
  ok: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  error: <XCircle className="h-4 w-4 text-red-600" />,
  advertencia: <AlertTriangle className="h-4 w-4 text-amber-600" />,
}

const estadoBadgeStyles: Record<ImportacionEstado, string> = {
  ok: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  error: "bg-red-100 text-red-700 hover:bg-red-100",
  advertencia: "bg-amber-100 text-amber-700 hover:bg-amber-100",
}

const estadoLabel: Record<ImportacionEstado, string> = {
  ok: "Valido",
  error: "Error",
  advertencia: "Advertencia",
}

export function ImportacionHorasSection() {
  const [fileLoaded, setFileLoaded] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const errors = importacionHoras.filter((r) => r.estado === "error")
  const warnings = importacionHoras.filter((r) => r.estado === "advertencia")
  const valid = importacionHoras.filter((r) => r.estado === "ok")

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setFileName(file.name)
      setFileLoaded(true)
      setImported(false)
    }
  }, [])

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setFileName(file.name)
        setFileLoaded(true)
        setImported(false)
      }
    },
    []
  )

  const handleRemoveFile = useCallback(() => {
    setFileLoaded(false)
    setFileName(null)
    setImported(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const handleSimulateUpload = useCallback(() => {
    setFileName("fichaje_febrero_2026.csv")
    setFileLoaded(true)
    setImported(false)
  }, [])

  const handleConfirm = useCallback(() => {
    setImporting(true)
    setTimeout(() => {
      setImporting(false)
      setImported(true)
    }, 1500)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Importa registros de horas desde archivos CSV o Excel
        </p>
        {!fileLoaded && (
          <button
            onClick={handleSimulateUpload}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Upload className="h-4 w-4" />
            Simular carga
          </button>
        )}
      </div>

      {/* Drag & Drop Zone */}
      {!fileLoaded ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleFileSelect}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleFileSelect()
          }}
          className={`group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed py-16 transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
          }`}
        >
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${
              isDragging ? "bg-primary/15" : "bg-primary/10 group-hover:bg-primary/15"
            }`}
          >
            <Upload
              className={`h-8 w-8 transition-colors ${
                isDragging ? "text-primary" : "text-primary/70 group-hover:text-primary"
              }`}
            />
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-foreground">
              Arrastra tu archivo aqui
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              o haz clic para seleccionar un archivo CSV o XLSX
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Formatos aceptados: .csv, .xlsx
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Seleccionar archivo de horas"
          />
        </div>
      ) : (
        <>
          {/* File loaded bar */}
          <Card className="border border-border bg-card">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {importacionHoras.length} registros detectados
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Eliminar archivo"
              >
                <X className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>

          {/* Alert summary cards */}
          {(errors.length > 0 || warnings.length > 0) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="border border-emerald-200 bg-emerald-50">
                <CardContent className="flex items-center gap-3 p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      {valid.length} Validos
                    </p>
                    <p className="text-xs text-emerald-600">Listos para importar</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-amber-200 bg-amber-50">
                <CardContent className="flex items-center gap-3 p-4">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      {warnings.length} Advertencias
                    </p>
                    <p className="text-xs text-amber-600">Revisar antes de importar</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-red-200 bg-red-50">
                <CardContent className="flex items-center gap-3 p-4">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      {errors.length} Errores
                    </p>
                    <p className="text-xs text-red-600">No se importaran</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Preview table */}
          <Card className="border border-border bg-card">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base font-semibold text-foreground">
                Vista previa de registros
              </CardTitle>
              <div className="flex items-center gap-3">
                {imported ? (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Importacion completada
                  </span>
                ) : (
                  <button
                    onClick={handleConfirm}
                    disabled={importing || valid.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Confirmar importacion ({valid.length + warnings.length})
                      </>
                    )}
                  </button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <span className="sr-only">Estado</span>
                      </TableHead>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead className="hidden md:table-cell">Fecha</TableHead>
                      <TableHead className="text-right">Horas</TableHead>
                      <TableHead className="hidden lg:table-cell">Descripcion</TableHead>
                      <TableHead>Validacion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importacionHoras.map((reg) => (
                      <TableRow
                        key={reg.id}
                        className={
                          reg.estado === "error"
                            ? "bg-red-50/50"
                            : reg.estado === "advertencia"
                              ? "bg-amber-50/50"
                              : ""
                        }
                      >
                        <TableCell className="w-10">
                          {estadoIcon[reg.estado]}
                        </TableCell>
                        <TableCell
                          className={`font-medium ${
                            reg.estado === "error" && !reg.empleado
                              ? "italic text-red-500"
                              : "text-foreground"
                          }`}
                        >
                          {reg.empleado || "Sin asignar"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {reg.proyecto}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {new Date(reg.fecha).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            reg.estado === "error" ? "text-red-600" : "text-foreground"
                          }`}
                        >
                          {reg.horas}h
                        </TableCell>
                        <TableCell className="hidden max-w-[200px] truncate text-muted-foreground lg:table-cell">
                          {reg.descripcion}
                        </TableCell>
                        <TableCell>
                          {reg.estado === "ok" ? (
                            <Badge className={estadoBadgeStyles.ok}>
                              {estadoLabel.ok}
                            </Badge>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <Badge className={estadoBadgeStyles[reg.estado]}>
                                {estadoLabel[reg.estado]}
                              </Badge>
                              {reg.error && (
                                <span className="text-xs text-muted-foreground">
                                  {reg.error}
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border px-6 py-3">
                <p className="text-sm text-muted-foreground">
                  {importacionHoras.length} registros totales
                </p>
                <p className="text-sm text-muted-foreground">
                  {valid.length} validos &middot; {warnings.length} advertencias &middot;{" "}
                  {errors.length} errores
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
