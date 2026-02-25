"use client";
import { useState } from "react";
import { Search, Plus, Edit, Trash2, X, FolderKanban } from "lucide-react";

// MOCK DE DATOS - Proyectos falsos
const mockProyectos = [
    { id: 1, nombre: "Migración Cloud AWS", cliente: "Tech Solutions S.L.", tipoPago: "Cerrado", codigoFichaje: "PRJ-001", estado: "Activo" },
    { id: 2, nombre: "Mantenimiento Servidores", cliente: "Innovación Industrial S.A.", tipoPago: "Abierto", codigoFichaje: "PRJ-002", estado: "Activo" },
    { id: 3, nombre: "Auditoría de Seguridad", cliente: "Servicios Globales", tipoPago: "Fraccionado", codigoFichaje: "PRJ-003", estado: "Pausado" },
];

export default function ProyectosPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const proyectosFiltrados = mockProyectos.filter(proj =>
        proj.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proj.cliente.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-10 max-w-7xl mx-auto relative">

            {/* CABECERA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-quality-dark tracking-tight">Proyectos</h1>
                    <p className="text-gray-500 mt-1">Gestiona los proyectos activos, clientes asociados y condiciones de facturación.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-quality-red hover:bg-[#C20017] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center gap-2"
                >
                    <Plus size={18} />
                    Nuevo Proyecto
                </button>
            </div>

            {/* BÚSQUEDA */}
            <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex items-center gap-3">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por proyecto o cliente..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* TABLA DE PROYECTOS */}
            <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                            <th className="px-6 py-4">Nombre del Proyecto</th>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Tipo de Pago</th>
                            <th className="px-6 py-4">Código App Fichaje</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {proyectosFiltrados.map((proyecto) => (
                            <tr key={proyecto.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4 font-bold text-quality-dark">{proyecto.nombre}</td>
                                <td className="px-6 py-4 text-gray-600">{proyecto.cliente}</td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                        {proyecto.tipoPago}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-sm bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md border border-gray-200 tracking-wider">
                                        {proyecto.codigoFichaje}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${proyecto.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {proyecto.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                                        <button className="p-2 text-gray-400 hover:text-quality-red hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL NUEVO PROYECTO */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">

                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-quality-dark flex items-center gap-2">
                                <FolderKanban size={20} className="text-quality-red" /> Crear Nuevo Proyecto
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto</label>
                                <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none" placeholder="Ej. Implementación ERP" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente Asociado</label>
                                {/* Lo ideal es que esto lo carguemos del backend, ahora es un select normal */}
                                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none bg-white">
                                    <option value="">Selecciona un cliente...</option>
                                    <option value="1">Tech Solutions S.L.</option>
                                    <option value="2">Innovación Industrial S.A.</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pago</label>
                                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none bg-white">
                                        <option value="abierto">Abierto</option>
                                        <option value="cerrado">Cerrado</option>
                                        <option value="fraccionado">Fraccionado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cód. App Fichaje</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none" placeholder="PRJ-XXX" />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium bg-quality-dark text-white hover:bg-black rounded-lg transition-colors shadow-sm">Guardar Proyecto</button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}