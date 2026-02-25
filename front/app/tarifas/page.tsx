"use client";
import { useState } from "react";
import { Search, Plus, Edit, Trash2, X, CircleDollarSign } from "lucide-react";

// MOCK DE DATOS - Cruce de Empleado + Proyecto + Precio/Hora
const mockTarifas = [
    { id: 1, empleado: "Ana García", proyecto: "Migración Cloud AWS", precioHora: 45.50, estado: "Activa" },
    { id: 2, empleado: "Ana García", proyecto: "Auditoría de Seguridad", precioHora: 55.00, estado: "Activa" },
    { id: 3, empleado: "Carlos López", proyecto: "Mantenimiento Servidores", precioHora: 35.00, estado: "Activa" },
    { id: 4, empleado: "Laura Martínez", proyecto: "Migración Cloud AWS", precioHora: 40.00, estado: "Inactiva" },
];

export default function TarifasPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const tarifasFiltradas = mockTarifas.filter(tarifa =>
        tarifa.empleado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tarifa.proyecto.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-10 max-w-7xl mx-auto relative">

            {/* CABECERA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-quality-dark tracking-tight">Asignación de Tarifas</h1>
                    <p className="text-gray-500 mt-1">Define el precio por hora de cada empleado según el proyecto.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-quality-red hover:bg-[#C20017] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center gap-2"
                >
                    <Plus size={18} />
                    Asignar Tarifa
                </button>
            </div>

            {/* BÚSQUEDA */}
            <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex items-center gap-3">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por empleado o proyecto..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* TABLA DE TARIFAS */}
            <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                            <th className="px-6 py-4">Empleado</th>
                            <th className="px-6 py-4">Proyecto Asignado</th>
                            <th className="px-6 py-4">Tarifa (€/Hora)</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tarifasFiltradas.map((tarifa) => (
                            <tr key={tarifa.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4 font-bold text-quality-dark">{tarifa.empleado}</td>
                                <td className="px-6 py-4 text-gray-600">{tarifa.proyecto}</td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-base font-semibold text-quality-dark bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                                        {tarifa.precioHora.toFixed(2)} €
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${tarifa.estado === 'Activa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {tarifa.estado}
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

            {/* MODAL ASIGNAR TARIFA */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">

                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-quality-dark flex items-center gap-2">
                                <CircleDollarSign size={20} className="text-quality-red" /> Asignar Nueva Tarifa
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
                                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none bg-white">
                                    <option value="">Selecciona un empleado...</option>
                                    <option value="1">Ana García</option>
                                    <option value="2">Carlos López</option>
                                    <option value="3">Laura Martínez</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
                                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none bg-white">
                                    <option value="">Selecciona un proyecto...</option>
                                    <option value="1">Migración Cloud AWS</option>
                                    <option value="2">Mantenimiento Servidores</option>
                                    <option value="3">Auditoría de Seguridad</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio por Hora (€)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 font-medium">€</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none font-mono"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium bg-quality-dark text-white hover:bg-black rounded-lg transition-colors shadow-sm">Guardar Tarifa</button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}