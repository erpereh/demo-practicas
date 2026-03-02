"use client";
import { 
    useState, 
    useEffect, 
    useCallback 
} from "react";
import { 
    Search, 
    Plus, 
    Edit, 
    Trash2, 
    X, 
    FolderKanban, 
    Loader2, 
    AlertCircle 
} from "lucide-react";

const API_BASE = "http://localhost:8000/api/proyectos";

// Tipos
interface Proyecto {
    id_proyecto: string;
    id_sociedad: string;
    id_cliente: string;
    nombre_proyecto: string;
    codigo_proyecto_tracker: string;
    tipo_pago: string;
    precio: number | null;
    fec_inicio: string | null;
}

interface ProyectoForm {
    id_proyecto: string;
    id_sociedad: string;
    id_cliente: string;
    nombre_proyecto: string;
    codigo_proyecto_tracker: string;
    tipo_pago: string;
    precio: string;
    fec_inicio: string;
}

const FORM_EMPTY: ProyectoForm = {
    id_proyecto: "",
    id_sociedad: "",
    id_cliente: "",
    nombre_proyecto: "",
    codigo_proyecto_tracker: "",
    tipo_pago: "abierto",
    precio: "",
    fec_inicio: "",
};

export default function ProyectosPage() {

    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProyecto, setEditingProyecto] = useState<Proyecto | null>(null);
    const [form, setForm] = useState<ProyectoForm>(FORM_EMPTY);

    // Confirmación eliminar
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // --- FETCH proyectos ---
    const fetchProyectos = useCallback(async (q?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            const res = await fetch(`${API_BASE}/?${params.toString()}`);
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const data: Proyecto[] = await res.json();
            setProyectos(data);
        } catch (e: any) {
            setError(e.message || "Error al cargar proyectos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProyectos();
    }, [fetchProyectos]);

    // Búsqueda con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProyectos(searchTerm || undefined);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, fetchProyectos]);

    // --- ABRIR MODAL CREAR ---
    const openCreate = () => {
        setEditingProyecto(null);
        setForm(FORM_EMPTY);
        setApiError(null);
        setIsModalOpen(true);
    };

    // --- ABRIR MODAL EDITAR ---
    const openEdit = (proyecto: Proyecto) => {
        setEditingProyecto(proyecto);
        setForm({
            id_proyecto: proyecto.id_proyecto,
            id_sociedad: proyecto.id_sociedad,
            id_cliente: proyecto.id_cliente,
            nombre_proyecto: proyecto.nombre_proyecto,
            codigo_proyecto_tracker: proyecto.codigo_proyecto_tracker,
            tipo_pago: proyecto.tipo_pago,
            precio: proyecto.precio !== null ? String(proyecto.precio) : "",
            fec_inicio: proyecto.fec_inicio ?? "",
        });
        setApiError(null);
        setIsModalOpen(true);
    };

    // --- GUARDAR (crear o editar) ---
    const handleSave = async () => {
        setSaving(true);
        setApiError(null);
        try {
            let res: Response;
            if (editingProyecto) {
                // PUT - editar
                const body: Record<string, any> = {};
                if (form.nombre_proyecto) body.nombre_proyecto = form.nombre_proyecto;
                if (form.codigo_proyecto_tracker) body.codigo_proyecto_tracker = form.codigo_proyecto_tracker;
                if (form.tipo_pago) body.tipo_pago = form.tipo_pago;
                if (form.precio !== "") body.precio = parseFloat(form.precio);
                if (form.fec_inicio) body.fec_inicio = form.fec_inicio;

                res = await fetch(`${API_BASE}/${editingProyecto.id_proyecto}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
            } else {
                // POST - crear
                const body: Record<string, any> = {
                    id_proyecto: form.id_proyecto,
                    id_sociedad: form.id_sociedad,
                    id_cliente: form.id_cliente,
                    nombre_proyecto: form.nombre_proyecto,
                    codigo_proyecto_tracker: form.codigo_proyecto_tracker,
                    tipo_pago: form.tipo_pago,
                };
                if (form.precio !== "") body.precio = parseFloat(form.precio);
                if (form.fec_inicio) body.fec_inicio = form.fec_inicio;

                res = await fetch(`${API_BASE}/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
            }

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || `Error ${res.status}`);
            }

            setIsModalOpen(false);
            fetchProyectos(searchTerm || undefined);
        } catch (e: any) {
            setApiError(e.message || "Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    // --- ELIMINAR ---
    const handleDelete = async (id_proyecto: string) => {
        try {
            const res = await fetch(`${API_BASE}/${id_proyecto}`, { method: "DELETE" });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || `Error ${res.status}`);
            }
            setDeleteId(null);
            fetchProyectos(searchTerm || undefined);
        } catch (e: any) {
            alert(e.message || "Error al eliminar");
        }
    };

    const updateForm = (field: keyof ProyectoForm, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="p-10 max-w-7xl mx-auto relative">

            {/* CABECERA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-quality-dark tracking-tight">Proyectos</h1>
                    <p className="text-gray-500 mt-1">Gestiona los proyectos activos, clientes asociados y condiciones de facturación.</p>
                </div>

                <button
                    onClick={openCreate}
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
                        placeholder="Buscar por proyecto, ID o código tracker..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* TABLA */}
            <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
                        <Loader2 size={20} className="animate-spin" /> Cargando proyectos...
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-20 text-red-500 gap-2">
                        <AlertCircle size={20} /> {error}
                    </div>
                ) : proyectos.length === 0 ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                        No se encontraron proyectos.
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="px-6 py-4">ID Proyecto</th>
                                <th className="px-6 py-4">Nombre del Proyecto</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Tipo de Pago</th>
                                <th className="px-6 py-4">Cód. Tracker</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {proyectos.map((proyecto) => (
                                <tr key={proyecto.id_proyecto} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200">
                                            {proyecto.id_proyecto}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-quality-dark">{proyecto.nombre_proyecto}</td>
                                    <td className="px-6 py-4 text-gray-600">{proyecto.id_cliente}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full capitalize">
                                            {proyecto.tipo_pago}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md border border-gray-200 tracking-wider">
                                            {proyecto.codigo_proyecto_tracker}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEdit(proyecto)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(proyecto.id_proyecto)}
                                                className="p-2 text-gray-400 hover:text-quality-red hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL CREAR / EDITAR */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">

                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-quality-dark flex items-center gap-2">
                                <FolderKanban size={20} className="text-quality-red" />
                                {editingProyecto ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {apiError && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                                    <AlertCircle size={16} /> {apiError}
                                </div>
                            )}

                            {!editingProyecto && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Proyecto *</label>
                                        <input
                                            type="text"
                                            value={form.id_proyecto}
                                            onChange={e => updateForm("id_proyecto", e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none"
                                            placeholder="PRJ-001"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Sociedad *</label>
                                        <input
                                            type="text"
                                            value={form.id_sociedad}
                                            onChange={e => updateForm("id_sociedad", e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none"
                                            placeholder="SOC-001"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto *</label>
                                <input
                                    type="text"
                                    value={form.nombre_proyecto}
                                    onChange={e => updateForm("nombre_proyecto", e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none"
                                    placeholder="Ej. Implementación ERP"
                                />
                            </div>

                            {!editingProyecto && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Cliente *</label>
                                    <input
                                        type="text"
                                        value={form.id_cliente}
                                        onChange={e => updateForm("id_cliente", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none"
                                        placeholder="CLI-001"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pago</label>
                                    <select
                                        value={form.tipo_pago}
                                        onChange={e => updateForm("tipo_pago", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none bg-white"
                                    >
                                        <option value="abierto">Abierto</option>
                                        <option value="cerrado">Cerrado</option>
                                        <option value="fraccionado">Fraccionado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cód. Tracker *</label>
                                    <input
                                        type="text"
                                        value={form.codigo_proyecto_tracker}
                                        onChange={e => updateForm("codigo_proyecto_tracker", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none"
                                        placeholder="PRJ-XXX"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                                    <input
                                        type="number"
                                        value={form.precio}
                                        onChange={e => updateForm("precio", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                                    <input
                                        type="date"
                                        value={form.fec_inicio}
                                        onChange={e => updateForm("fec_inicio", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium bg-quality-dark text-white hover:bg-black rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60"
                            >
                                {saving && <Loader2 size={14} className="animate-spin" />}
                                {editingProyecto ? "Guardar Cambios" : "Crear Proyecto"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CONFIRMAR ELIMINACIÓN */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold text-quality-dark mb-2">¿Eliminar proyecto?</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Esta acción eliminará el proyecto <span className="font-mono font-semibold text-gray-700">{deleteId}</span> permanentemente.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(deleteId)}
                                className="px-4 py-2 text-sm font-medium bg-quality-red text-white hover:bg-[#C20017] rounded-lg transition-colors shadow-sm"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}