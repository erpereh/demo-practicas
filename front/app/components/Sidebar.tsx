"use client"; // Le decimos a Next.js que este componente usa funciones del navegador

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Users, Building2, FileSpreadsheet, Landmark, FolderKanban, CircleDollarSign, Clock } from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();

    // Función para darle el estilo al botón si está activo
    const getLinkStyle = (path: string) => {
        const isActive = pathname === path;
        return `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all group border ${isActive
                ? "bg-quality-red/10 text-white border-quality-red/20 shadow-[0_0_15px_rgba(227,0,27,0.1)]"
                : "text-gray-300 border-transparent hover:bg-white/10 hover:text-white"
            }`;
    };

    // Función para dejar el icono rojo si está activo
    const getIconStyle = (path: string) => {
        const isActive = pathname === path;
        return `transition-colors ${isActive ? "text-quality-red" : "text-gray-400 group-hover:text-quality-red"}`;
    };

    return (
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
                            <Link href="/empleados" className={getLinkStyle("/empleados")}>
                                <Users size={18} className={getIconStyle("/empleados")} />
                                Empleados
                            </Link>
                        </li>
                        <li>
                            <Link href="/clientes" className={getLinkStyle("/clientes")}>
                                <Building2 size={18} className={getIconStyle("/clientes")} />
                                Clientes
                            </Link>
                        </li>
                        <li>
                            <Link href="/bancos" className={getLinkStyle("/bancos")}>
                                <Landmark size={18} className={getIconStyle("/bancos")} />
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
                            <Link href="/proyectos" className={getLinkStyle("/proyectos")}>
                                <FolderKanban size={18} className={getIconStyle("/proyectos")} />
                                Proyectos
                            </Link>
                        </li>
                        <li>
                            <Link href="/tarifas" className={getLinkStyle("/tarifas")}>
                                <CircleDollarSign size={18} className={getIconStyle("/tarifas")} />
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
                            <Link href="/importar" className={getLinkStyle("/importar")}>
                                <FileSpreadsheet size={18} className={getIconStyle("/importar")} />
                                Importar Excel
                            </Link>
                        </li>
                        <li>
                            <Link href="/horas" className={getLinkStyle("/horas")}>
                                <Clock size={18} className={getIconStyle("/horas")} />
                                Revisión de Horas
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
    );
}