"use client"

import {
  LayoutDashboard,
  Users,
  Building2,
  Landmark,
  FolderKanban,
  Receipt,
  Clock,
  ClipboardCheck,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useApp, type Section } from "@/lib/app-context"
import { cn } from "@/lib/utils"

const navItems: { label: string; icon: typeof LayoutDashboard; section: Section }[] = [
  { label: "Dashboard", icon: LayoutDashboard, section: "dashboard" },
  { label: "Empleados", icon: Users, section: "empleados" },
  { label: "Clientes", icon: Building2, section: "clientes" },
  { label: "Cuentas Bancarias", icon: Landmark, section: "cuentas-bancarias" },
  { label: "Proyectos", icon: FolderKanban, section: "proyectos" },
  { label: "Tarifas", icon: Receipt, section: "tarifas" },
  { label: "Importacion de Horas", icon: Clock, section: "importacion-horas" },
  { label: "Revision de Horas", icon: ClipboardCheck, section: "revision-horas" },
  { label: "Generador de Facturas", icon: FileText, section: "generador-facturas" },
]

export function AppSidebar() {
  const { activeSection, setActiveSection, sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useApp()
  const collapsed = sidebarCollapsed

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <span className="text-sm font-bold text-sidebar-primary-foreground">G</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">GestPro</span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <span className="text-sm font-bold text-sidebar-primary-foreground">G</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegacion principal">
          <ul className="flex flex-col gap-1" role="list">
            {navItems.map((item) => {
              const isActive = activeSection === item.section
              return (
                <li key={item.section}>
                  <button
                    onClick={() => {
                      setActiveSection(item.section)
                      setSidebarOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Collapse button (desktop only) */}
        <div className="hidden border-t border-sidebar-border p-3 lg:block">
          <button
            onClick={() => setSidebarCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
