"use client";
import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, X, Landmark, Loader2, AlertCircle } from "lucide-react";

interface BancoDB {
    id: number;
    entidad: string;
    iban: string;
    estado: string;
}

export default function BancosPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bancos, setBancos] = useState<BancoDB[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Formulario
    const [entidad, setEntidad] = useState("");
    const [iban, setIban] = useState("");
    const [estado, setEstado] = useState("Principal");
    const [errores, setErrores] = useState<{ general?: string }>({});

    const cargarBancos = async () => {
        try {
            setIsLoading(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/api/bancos/`);
            if (res.ok) setBancos(await res.json());
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    useEffect(() => { cargarBancos(); }, []);

    const handleGuardar = async () => {
        if (!entidad || !iban) return alert("Rellena todos los campos");

        try {
            setIsSaving(true);
            setErrores({});
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/api/bancos/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entidad, iban, estado }),
            });

            if (res.ok) {
                alert("Cuenta guardada");
                setIsModalOpen(false);
                setEntidad(""); setIban("");
                cargarBancos();
            } else {
                const err = await res.json();
                setErrores({ general: err.detail || "Error al guardar" });
            }
        } catch (e) { setErrores({ general: "Error de conexión" }); } finally { setIsSaving(false); }
    };

    const bancosFiltrados = bancos.filter(b => b.entidad.toLowerCase().includes(searchTerm.toLowerCase()) || b.iban.includes(searchTerm));

    return (
        <div className="p-10 max-w-7xl mx-auto relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-quality-dark">Cuentas Bancarias</h1>
                    <p className="text-gray-500">Gestión de cuentas e IBANs.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-quality-red text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-red-700 transition">
                    <Plus size={18} /> Añadir Cuenta
                </button>
            </div>

            <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex gap-3">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Buscar banco o IBAN..." className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-quality-red" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Entidad</th>
                            <th className="px-6 py-4">IBAN</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? <tr><td colSpan={4} className="p-10 text-center"><Loader2 className="animate-spin inline mr-2" /> Cargando...</td></tr> :
                            bancosFiltrados.length === 0 ? <tr><td colSpan={4} className="p-10 text-center">No hay cuentas.</td></tr> :
                                bancosFiltrados.map(b => (
                                    <tr key={b.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-bold text-quality-dark flex items-center gap-2"><Landmark size={16} className="text-gray-400" /> {b.entidad}</td>
                                        <td className="px-6 py-4 font-mono bg-gray-50 rounded text-sm">{b.iban}</td>
                                        <td className="px-6 py-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{b.estado}</span></td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-600"><Edit size={16} /></button>
                                            <button className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-lg font-bold text-quality-dark flex gap-2 items-center"><Landmark className="text-quality-red" /> Nueva Cuenta</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-black" /></button>
                        </div>

                        {errores.general && <div className="bg-red-50 text-red-800 p-3 rounded mb-4 flex gap-2"><AlertCircle size={18} /> {errores.general}</div>}

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium block mb-1">Entidad Bancaria</label>
                                <input className="w-full border rounded-lg px-3 py-2" placeholder="Santander" value={entidad} onChange={e => setEntidad(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">IBAN</label>
                                <input className="w-full border rounded-lg px-3 py-2 font-mono" placeholder="ES91..." value={iban} onChange={e => setIban(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">Tipo</label>
                                <select className="w-full border rounded-lg px-3 py-2 bg-white" value={estado} onChange={e => setEstado(e.target.value)}>
                                    <option value="Principal">Principal</option>
                                    <option value="Secundaria">Secundaria</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
                            <button onClick={handleGuardar} disabled={isSaving} className="px-4 py-2 bg-quality-dark text-white rounded-lg flex items-center gap-2 disabled:opacity-50">
                                {isSaving && <Loader2 className="animate-spin" size={16} />} Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}