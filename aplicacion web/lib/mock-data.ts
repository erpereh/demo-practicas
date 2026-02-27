// Mock data for the SaaS dashboard

export const kpiData = {
  horasDelMes: 1248,
  facturacionEstimada: 187200,
  facturasPendientes: 12,
  empleadosActivos: 34,
}

export const facturacionMensual = [
  { mes: "Ene", facturacion: 142000 },
  { mes: "Feb", facturacion: 158000 },
  { mes: "Mar", facturacion: 135000 },
  { mes: "Abr", facturacion: 172000 },
  { mes: "May", facturacion: 168000 },
  { mes: "Jun", facturacion: 190000 },
  { mes: "Jul", facturacion: 175000 },
  { mes: "Ago", facturacion: 162000 },
  { mes: "Sep", facturacion: 195000 },
  { mes: "Oct", facturacion: 188000 },
  { mes: "Nov", facturacion: 201000 },
  { mes: "Dic", facturacion: 187200 },
]

export const horasPorProyecto = [
  { nombre: "Portal Bancario", horas: 320, fill: "var(--color-chart-1)" },
  { nombre: "App Movil CRM", horas: 280, fill: "var(--color-chart-2)" },
  { nombre: "ERP Logistics", horas: 210, fill: "var(--color-chart-3)" },
  { nombre: "Dashboard Analytics", horas: 190, fill: "var(--color-chart-4)" },
  { nombre: "Otros", horas: 248, fill: "var(--color-chart-5)" },
]

export const empleados = [
  { id: 1, nombre: "Carlos Martinez", email: "carlos@gestpro.com", puesto: "Senior Developer", departamento: "Ingenieria", estado: "Activo", horasMes: 168 },
  { id: 2, nombre: "Ana Lopez", email: "ana@gestpro.com", puesto: "Project Manager", departamento: "Gestion", estado: "Activo", horasMes: 160 },
  { id: 3, nombre: "Miguel Torres", email: "miguel@gestpro.com", puesto: "UX Designer", departamento: "Diseno", estado: "Activo", horasMes: 152 },
  { id: 4, nombre: "Laura Sanchez", email: "laura@gestpro.com", puesto: "Backend Developer", departamento: "Ingenieria", estado: "Activo", horasMes: 170 },
  { id: 5, nombre: "David Garcia", email: "david@gestpro.com", puesto: "QA Engineer", departamento: "Calidad", estado: "Vacaciones", horasMes: 0 },
  { id: 6, nombre: "Sofia Ruiz", email: "sofia@gestpro.com", puesto: "Frontend Developer", departamento: "Ingenieria", estado: "Activo", horasMes: 165 },
  { id: 7, nombre: "Javier Fernandez", email: "javier@gestpro.com", puesto: "DevOps Engineer", departamento: "Infraestructura", estado: "Activo", horasMes: 158 },
  { id: 8, nombre: "Maria Gomez", email: "maria@gestpro.com", puesto: "Data Analyst", departamento: "Analytics", estado: "Activo", horasMes: 144 },
]

export const clientes = [
  { id: 1, nombre: "Banco Nacional", contacto: "Roberto Diaz", email: "rdiaz@banconacional.com", proyectos: 3, estado: "Activo" },
  { id: 2, nombre: "TechCorp Solutions", contacto: "Elena Vega", email: "evega@techcorp.com", proyectos: 2, estado: "Activo" },
  { id: 3, nombre: "Logistica Global", contacto: "Pedro Nunez", email: "pnunez@logiglobal.com", proyectos: 1, estado: "Activo" },
  { id: 4, nombre: "Farmaceutica Plus", contacto: "Carmen Ortiz", email: "cortiz@farmaplus.com", proyectos: 2, estado: "Inactivo" },
  { id: 5, nombre: "Retail Master", contacto: "Antonio Reyes", email: "areyes@retailmaster.com", proyectos: 1, estado: "Activo" },
]

export const cuentasBancarias = [
  { id: 1, banco: "BBVA", numeroCuenta: "ES76 0182 **** **** 4523", titular: "GestPro S.L.", saldo: 245890.50, tipo: "Corriente" },
  { id: 2, banco: "Santander", numeroCuenta: "ES21 0049 **** **** 7891", titular: "GestPro S.L.", saldo: 178340.25, tipo: "Corriente" },
  { id: 3, banco: "CaixaBank", numeroCuenta: "ES45 2100 **** **** 3456", titular: "GestPro S.L.", saldo: 92500.00, tipo: "Ahorro" },
]

export type TipoPago = "Abierto" | "Cerrado" | "Fraccionado"
export type EstadoProyecto = "En progreso" | "Planificacion" | "En pausa" | "Completado"

export const proyectos = [
  { id: 1, nombre: "Portal Bancario v2", cliente: "Banco Nacional", tipoPago: "Cerrado" as TipoPago, codigoFichaje: "BN-PB2", estado: "En progreso" as EstadoProyecto, progreso: 72, horasEstimadas: 500, horasReales: 320, fechaInicio: "2025-09-01", fechaFin: "2026-04-30" },
  { id: 2, nombre: "App Movil CRM", cliente: "TechCorp Solutions", tipoPago: "Abierto" as TipoPago, codigoFichaje: "TC-CRM", estado: "En progreso" as EstadoProyecto, progreso: 45, horasEstimadas: 600, horasReales: 280, fechaInicio: "2025-11-15", fechaFin: "2026-06-30" },
  { id: 3, nombre: "ERP Logistics", cliente: "Logistica Global", tipoPago: "Fraccionado" as TipoPago, codigoFichaje: "LG-ERP", estado: "En progreso" as EstadoProyecto, progreso: 88, horasEstimadas: 250, horasReales: 210, fechaInicio: "2025-06-01", fechaFin: "2026-03-15" },
  { id: 4, nombre: "Dashboard Analytics", cliente: "Banco Nacional", tipoPago: "Abierto" as TipoPago, codigoFichaje: "BN-DA", estado: "Planificacion" as EstadoProyecto, progreso: 15, horasEstimadas: 300, horasReales: 45, fechaInicio: "2026-01-10", fechaFin: "2026-07-30" },
  { id: 5, nombre: "Sistema de Inventario", cliente: "Retail Master", tipoPago: "Cerrado" as TipoPago, codigoFichaje: "RM-INV", estado: "En pausa" as EstadoProyecto, progreso: 30, horasEstimadas: 400, horasReales: 120, fechaInicio: "2025-10-01", fechaFin: "2026-05-30" },
  { id: 6, nombre: "Plataforma E-commerce", cliente: "TechCorp Solutions", tipoPago: "Fraccionado" as TipoPago, codigoFichaje: "TC-ECO", estado: "En progreso" as EstadoProyecto, progreso: 60, horasEstimadas: 450, horasReales: 270, fechaInicio: "2025-10-15", fechaFin: "2026-05-15" },
  { id: 7, nombre: "Sistema de Facturacion", cliente: "Farmaceutica Plus", tipoPago: "Abierto" as TipoPago, codigoFichaje: "FP-FAC", estado: "Completado" as EstadoProyecto, progreso: 100, horasEstimadas: 200, horasReales: 195, fechaInicio: "2025-04-01", fechaFin: "2025-12-20" },
]

export const tarifas = [
  { id: 1, perfil: "Senior Developer", tarifaHora: 85, moneda: "EUR" },
  { id: 2, perfil: "Junior Developer", tarifaHora: 50, moneda: "EUR" },
  { id: 3, perfil: "Project Manager", tarifaHora: 95, moneda: "EUR" },
  { id: 4, perfil: "UX Designer", tarifaHora: 75, moneda: "EUR" },
  { id: 5, perfil: "QA Engineer", tarifaHora: 60, moneda: "EUR" },
  { id: 6, perfil: "DevOps Engineer", tarifaHora: 90, moneda: "EUR" },
  { id: 7, perfil: "Data Analyst", tarifaHora: 70, moneda: "EUR" },
]

export const asignacionTarifas = [
  { id: 1, empleado: "Carlos Martinez", proyecto: "Portal Bancario v2", tarifaHora: 85, fechaInicio: "2025-09-01", fechaFin: "2026-04-30" },
  { id: 2, empleado: "Ana Lopez", proyecto: "App Movil CRM", tarifaHora: 95, fechaInicio: "2025-11-15", fechaFin: "2026-06-30" },
  { id: 3, empleado: "Laura Sanchez", proyecto: "Portal Bancario v2", tarifaHora: 85, fechaInicio: "2025-09-01", fechaFin: "2026-04-30" },
  { id: 4, empleado: "Sofia Ruiz", proyecto: "Dashboard Analytics", tarifaHora: 75, fechaInicio: "2026-01-10", fechaFin: "2026-07-30" },
  { id: 5, empleado: "Miguel Torres", proyecto: "App Movil CRM", tarifaHora: 75, fechaInicio: "2025-11-15", fechaFin: "2026-06-30" },
  { id: 6, empleado: "Javier Fernandez", proyecto: "ERP Logistics", tarifaHora: 90, fechaInicio: "2025-06-01", fechaFin: "2026-03-15" },
  { id: 7, empleado: "Maria Gomez", proyecto: "Dashboard Analytics", tarifaHora: 70, fechaInicio: "2026-01-10", fechaFin: "2026-07-30" },
  { id: 8, empleado: "David Garcia", proyecto: "Plataforma E-commerce", tarifaHora: 60, fechaInicio: "2025-10-15", fechaFin: "2026-05-15" },
  { id: 9, empleado: "Carlos Martinez", proyecto: "ERP Logistics", tarifaHora: 85, fechaInicio: "2025-06-01", fechaFin: "2026-03-15" },
  { id: 10, empleado: "Sofia Ruiz", proyecto: "Plataforma E-commerce", tarifaHora: 75, fechaInicio: "2025-10-15", fechaFin: "2026-05-15" },
]

export type ImportacionEstado = "ok" | "error" | "advertencia"

export const importacionHoras = [
  { id: 1, empleado: "Carlos Martinez", proyecto: "Portal Bancario v2", fecha: "2026-02-20", horas: 8, descripcion: "Desarrollo modulo de pagos", estado: "ok" as ImportacionEstado, error: null },
  { id: 2, empleado: "Ana Lopez", proyecto: "App Movil CRM", fecha: "2026-02-20", horas: 6, descripcion: "Reunion de seguimiento con cliente", estado: "ok" as ImportacionEstado, error: null },
  { id: 3, empleado: "Laura Sanchez", proyecto: "Portal Bancario v2", fecha: "2026-02-20", horas: 7.5, descripcion: "API de transferencias", estado: "ok" as ImportacionEstado, error: null },
  { id: 4, empleado: "Sofia Ruiz", proyecto: "Dashboard Analytics", fecha: "2026-02-20", horas: 12, descripcion: "Componentes de graficos", estado: "error" as ImportacionEstado, error: "Horas superan el maximo diario (10h)" },
  { id: 5, empleado: "Miguel Torres", proyecto: "App Movil CRM", fecha: "2026-02-20", horas: 5, descripcion: "Wireframes nuevas pantallas", estado: "ok" as ImportacionEstado, error: null },
  { id: 6, empleado: "", proyecto: "ERP Logistics", fecha: "2026-02-21", horas: 8, descripcion: "Configuracion servidores", estado: "error" as ImportacionEstado, error: "Empleado no especificado" },
  { id: 7, empleado: "Javier Fernandez", proyecto: "ERP Logistics", fecha: "2026-02-21", horas: 7, descripcion: "Pipeline CI/CD", estado: "ok" as ImportacionEstado, error: null },
  { id: 8, empleado: "Maria Gomez", proyecto: "Dashboard Analytics", fecha: "2026-02-21", horas: 8, descripcion: "Analisis de datos Q1", estado: "ok" as ImportacionEstado, error: null },
  { id: 9, empleado: "David Garcia", proyecto: "Plataforma E-commerce", fecha: "2026-02-21", horas: 6, descripcion: "Tests de regresion", estado: "advertencia" as ImportacionEstado, error: "Empleado en estado Vacaciones" },
  { id: 10, empleado: "Carlos Martinez", proyecto: "Portal Bancario v2", fecha: "2026-02-21", horas: 8, descripcion: "Integracion pasarela de pagos", estado: "ok" as ImportacionEstado, error: null },
]

export type RevisionEstado = "Aprobado" | "Pendiente" | "Rechazado"

export const revisionHoras = [
  { id: 1, empleado: "Carlos Martinez", proyecto: "Portal Bancario v2", fecha: "2026-02-20", horas: 8, descripcion: "Desarrollo modulo de pagos", estado: "Aprobado" as RevisionEstado, mes: "2026-02" },
  { id: 2, empleado: "Ana Lopez", proyecto: "App Movil CRM", fecha: "2026-02-20", horas: 6, descripcion: "Reunion de seguimiento", estado: "Pendiente" as RevisionEstado, mes: "2026-02" },
  { id: 3, empleado: "Laura Sanchez", proyecto: "Portal Bancario v2", fecha: "2026-02-20", horas: 7.5, descripcion: "API de transferencias", estado: "Pendiente" as RevisionEstado, mes: "2026-02" },
  { id: 4, empleado: "Sofia Ruiz", proyecto: "Dashboard Analytics", fecha: "2026-02-19", horas: 8, descripcion: "Componentes de graficos", estado: "Rechazado" as RevisionEstado, mes: "2026-02" },
  { id: 5, empleado: "Javier Fernandez", proyecto: "ERP Logistics", fecha: "2026-02-19", horas: 7, descripcion: "Pipeline CI/CD", estado: "Aprobado" as RevisionEstado, mes: "2026-02" },
  { id: 6, empleado: "Maria Gomez", proyecto: "Dashboard Analytics", fecha: "2026-02-18", horas: 8, descripcion: "Analisis de datos Q1", estado: "Pendiente" as RevisionEstado, mes: "2026-02" },
  { id: 7, empleado: "Miguel Torres", proyecto: "App Movil CRM", fecha: "2026-02-18", horas: 5, descripcion: "Wireframes pantallas", estado: "Aprobado" as RevisionEstado, mes: "2026-02" },
  { id: 8, empleado: "Carlos Martinez", proyecto: "ERP Logistics", fecha: "2026-02-17", horas: 6, descripcion: "Code review sprint 4", estado: "Pendiente" as RevisionEstado, mes: "2026-02" },
  { id: 9, empleado: "David Garcia", proyecto: "Plataforma E-commerce", fecha: "2026-02-17", horas: 8, descripcion: "Tests de regresion", estado: "Aprobado" as RevisionEstado, mes: "2026-02" },
  { id: 10, empleado: "Sofia Ruiz", proyecto: "Plataforma E-commerce", fecha: "2026-01-28", horas: 7, descripcion: "Maquetacion carrito", estado: "Aprobado" as RevisionEstado, mes: "2026-01" },
  { id: 11, empleado: "Carlos Martinez", proyecto: "Portal Bancario v2", fecha: "2026-01-27", horas: 8, descripcion: "Autenticacion 2FA", estado: "Aprobado" as RevisionEstado, mes: "2026-01" },
  { id: 12, empleado: "Ana Lopez", proyecto: "App Movil CRM", fecha: "2026-01-27", horas: 6, descripcion: "Sprint planning Q1", estado: "Aprobado" as RevisionEstado, mes: "2026-01" },
]

export const facturas = [
  { id: "FAC-2026-001", cliente: "Banco Nacional", proyecto: "Portal Bancario v2", monto: 45200, fecha: "2026-02-01", estado: "Pagada" },
  { id: "FAC-2026-002", cliente: "TechCorp Solutions", proyecto: "App Movil CRM", monto: 32800, fecha: "2026-02-01", estado: "Pendiente" },
  { id: "FAC-2026-003", cliente: "Logistica Global", proyecto: "ERP Logistics", monto: 18900, fecha: "2026-02-15", estado: "Pendiente" },
  { id: "FAC-2026-004", cliente: "Banco Nacional", proyecto: "Dashboard Analytics", monto: 12500, fecha: "2026-02-15", estado: "Borrador" },
]
