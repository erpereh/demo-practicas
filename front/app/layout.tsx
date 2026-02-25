import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
// Importamos todos los iconos de Lucide necesarios
import { Users, Building2, FileSpreadsheet, Landmark, FolderKanban, CircleDollarSign } from "lucide-react";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quality - Gestor de Horas",
  description: "Portal interno de gestión",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${montserrat.className} bg-quality-light flex h-screen overflow-hidden text-quality-dark`}>

        {/* SIDEBAR LATERAL OSCURO */}
        <aside className="w-72 bg-quality-dark text-white flex flex-col h-full shadow-2xl z-10">

          {/* ZONA DEL LOGO */}
          <div className="px-8 pt-10 pb-6">
            <Link
              href="/"
              className="inline-block transition-all duration-300 hover:scale-[1.03] hover:opacity-90 cursor-pointer"
              title="Ir al inicio"
            >
              <Image
                src="/icon.png"
                alt="Logo Quality"
                width={180}
                height={60}
                className="w-auto h-12 object-contain brightness-0 invert"
                priority
              />
            </Link>
            <p className="text-[11px] text-gray-400 mt-4 tracking-wider uppercase font-medium">
              Portal del Empleado
            </p>
          </div>

          {/* NAVEGACIÓN */}
          <nav className="flex-1 px-5 py-6 space-y-10 overflow-y-auto">

            {/* SECCIÓN 1: ADMINISTRACIÓN */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-3">
                Administración
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/empleados" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all group">
                    <Users size={18} className="text-gray-400 group-hover:text-quality-red transition-colors" />
                    Empleados
                  </Link>
                </li>
                <li>
                  <Link href="/clientes" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all group">
                    <Building2 size={18} className="text-gray-400 group-hover:text-quality-red transition-colors" />
                    Clientes
                  </Link>
                </li>
                <li>
                  <Link href="/bancos" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all group">
                    <Landmark size={18} className="text-gray-400 group-hover:text-quality-red transition-colors" />
                    Cuentas Bancarias
                  </Link>
                </li>
              </ul>
            </div>

            {/* SECCIÓN 2: PROYECTOS Y TARIFAS */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-3">
                Proyectos y Tarifas
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/proyectos" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all group">
                    <FolderKanban size={18} className="text-gray-400 group-hover:text-quality-red transition-colors" />
                    Proyectos
                  </Link>
                </li>
                <li>
                  <Link href="/tarifas" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all group">
                    <CircleDollarSign size={18} className="text-gray-400 group-hover:text-quality-red transition-colors" />
                    Asignación Tarifas
                  </Link>
                </li>
              </ul>
            </div>

            {/* SECCIÓN 3: CONTROL HORARIO */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-3">
                Control Horario
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/importar" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg bg-quality-red/10 text-white border border-quality-red/20 hover:bg-quality-red transition-all group shadow-[0_0_15px_rgba(227,0,27,0.1)]">
                    <FileSpreadsheet size={18} className="text-quality-red group-hover:text-white transition-colors" />
                    Importar Excel
                  </Link>
                </li>
              </ul>
            </div>

          </nav>

          {/* ZONA INFERIOR (Perfil Usuario) */}
          <div className="p-6 border-t border-gray-700/50">
            <div className="flex items-center gap-3 px-3">
              <div className="w-8 h-8 rounded-full bg-quality-red flex items-center justify-center text-sm font-bold shadow-md">
                JD
              </div>
              <div>
                <p className="text-sm font-medium">Jefe de Equipo</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
            </div>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL A LA DERECHA */}
        <main className="flex-1 bg-quality-light overflow-y-auto">
          {children}
        </main>

      </body>
    </html>
  );
}