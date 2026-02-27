"use client"

import { Bell, Menu, Search } from "lucide-react"
import { useApp } from "@/lib/app-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const sectionTitles: Record<string, string> = {
  dashboard: "Dashboard",
  empleados: "Empleados",
  clientes: "Clientes",
  "cuentas-bancarias": "Cuentas Bancarias",
  proyectos: "Proyectos",
  tarifas: "Tarifas",
  "importacion-horas": "Importacion de Horas",
  "revision-horas": "Revision de Horas",
  "generador-facturas": "Generador de Facturas",
}

export function AppNavbar() {
  const { activeSection, setSidebarOpen } = useApp()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">
          {sectionTitles[activeSection]}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          className="hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:flex"
          aria-label="Buscar"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="text-sm font-medium text-foreground">
                Nueva factura pendiente
              </span>
              <span className="text-xs text-muted-foreground">
                FAC-2026-003 - Logistica Global
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="text-sm font-medium text-foreground">
                Horas por aprobar
              </span>
              <span className="text-xs text-muted-foreground">
                3 registros pendientes de revision
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="text-sm font-medium text-foreground">
                Proyecto actualizado
              </span>
              <span className="text-xs text-muted-foreground">
                ERP Logistics alcanza el 88% de progreso
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  AM
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-foreground leading-tight">
                  Admin Manager
                </p>
                <p className="text-xs text-muted-foreground leading-tight">
                  admin@qualitysolution.com
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configuracion</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span className="text-destructive">Cerrar Sesion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
