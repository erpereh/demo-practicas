"use client"

import { useApp } from "@/lib/app-context"
import { AppSidebar } from "@/components/app-sidebar"
import { AppNavbar } from "@/components/app-navbar"
import { DashboardSection } from "@/components/sections/dashboard"
import { EmpleadosSection } from "@/components/sections/empleados"
import { ClientesSection } from "@/components/sections/clientes"
import { CuentasBancariasSection } from "@/components/sections/cuentas-bancarias"
import { ProyectosSection } from "@/components/sections/proyectos"
import { TarifasSection } from "@/components/sections/tarifas"
import { ImportacionHorasSection } from "@/components/sections/importacion-horas"
import { RevisionHorasSection } from "@/components/sections/revision-horas"
import { GeneradorFacturasSection } from "@/components/sections/generador-facturas"
import { cn } from "@/lib/utils"

const sections: Record<string, () => React.JSX.Element> = {
  dashboard: DashboardSection,
  empleados: EmpleadosSection,
  clientes: ClientesSection,
  "cuentas-bancarias": CuentasBancariasSection,
  proyectos: ProyectosSection,
  tarifas: TarifasSection,
  "importacion-horas": ImportacionHorasSection,
  "revision-horas": RevisionHorasSection,
  "generador-facturas": GeneradorFacturasSection,
}

export function AppShell() {
  const { activeSection, sidebarCollapsed } = useApp()
  const ActiveComponent = sections[activeSection] || DashboardSection

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      {/* Main content area - offset by sidebar width on desktop */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-64"
        )}
      >
        <AppNavbar />
        <main className="flex-1 p-4 lg:p-6">
          <ActiveComponent />
        </main>
      </div>
    </div>
  )
}
