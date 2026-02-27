"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Section =
  | "dashboard"
  | "empleados"
  | "clientes"
  | "cuentas-bancarias"
  | "proyectos"
  | "tarifas"
  | "importacion-horas"
  | "revision-horas"
  | "generador-facturas"

interface AppContextType {
  activeSection: Section
  setActiveSection: (section: Section) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<Section>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <AppContext.Provider
      value={{
        activeSection,
        setActiveSection,
        sidebarOpen,
        setSidebarOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export type { Section }
