"use client";
import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, X, CircleDollarSign, AlertCircle, Loader2 } from "lucide-react";

// Estructura de la tabla de tarifas
interface TarifaDB {
    id_sociedad: string;
    empleado: string; // id del empleado
    cliente: string;
    proyecto: string; // id del proyecto
    tarifa: number;
    fecha_inicio: string;
}

// Estructura de empleados
interface Empleado {
    id_empleado: string;
    nombre: string;
    apellidos: string;
}

// Estructura de proyectos
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

export default function TarifasPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estados para datos reales
    const [tarifas, setTarifas] = useState<TarifaDB[]>([]);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Estados del formulario
    const [empSeleccionado, setEmpSeleccionado] = useState("");
    const [projSeleccionado, setProjSeleccionado] = useState("");
    const [precio, setPrecio] = useState("");

    // Errores de validacion
    const [errores, setErrores] = useState<{ empleado?: string; proyecto?: string; precio?: string; general?: string }>({});

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // Cargar tarifas
    const cargarTarifas = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API_URL}/api/tarifas`);
            if (res.ok) {
                const data = await res.json();
                setTarifas(data);
            }
        } catch (error) {
            console.error("Error cargando tarifas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar empleados
    const cargarEmpleados = async () => {
        try {
            const res = await fetch(`${API_URL}/api/empleados`);
            if (res.ok) {
                const data = await res.json();
                setEmpleados(data);
            }
        } catch (error) {
            console.error("Error cargando empleados:", error);
        }
    };

    // Cargar proyectos
    const cargarProyectos = async () => {
        try {
            const res = await fetch(`${API_URL}/api/proyectos`);
            if (res.ok) {
                const data = await res.json();
                setProyectos(data);
            }
        } catch (error) {
            console.error("Error cargando proyectos:", error);
        }
    };

    // Cargar datos al iniciar
    useEffect(() => {
        cargarTarifas();
        cargarEmpleados();
        cargarProyectos();
    }, []);

    // Filtrar tarifas por busqueda
    const tarifasFiltradas = tarifas.filter(tarifa => {
        const empleadoObj = empleados.find(e => e.id_empleado === tarifa.empleado);
        const nombreEmpleado = empleadoObj ? `${empleadoObj.nombre} ${empleadoObj.apellidos}` : tarifa.empleado;

        const proyectoObj = proyectos.find(p => p.id_proyecto === tarifa.proyecto);
        const nombreProyecto = proyectoObj ? proyectoObj.nombre_proyecto : tarifa.proyecto;

        return nombreEmpleado.toLowerCase().includes(searchTerm.toLowerCase()) ||
               nombreProyecto.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Guardar tarifa
    const handleGuardarTarifa = async () => {
        const nuevosErrores: { empleado?: string; proyecto?: string; precio?: string; general?: string } = {};

        if (!empSeleccionado) nuevosErrores.empleado = "Debes seleccionar un empleado.";
        if (!projSeleccionado) nuevosErrores.proyecto = "Debes seleccionar un proyecto.";

        const precioNum = parseFloat(precio);
        if (!precio) nuevosErrores.precio = "Introduce un precio.";
        else if (isNaN(precioNum) || precioNum <= 0) nuevosErrores.precio = "El precio debe ser mayor que 0.";

        // Evitar duplicados
        const existeDuplicado = tarifas.find(t => t.empleado === empSeleccionado && t.proyecto === projSeleccionado);
        if (existeDuplicado) nuevosErrores.general = "Este empleado ya tiene una tarifa para este proyecto.";

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }

        try {
            setIsSaving(true);
            setErrores({});
            const res = await fetch(`${API_URL}/api/tarifas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_sociedad: "01",
                    id_empleado: empSeleccionado,
                    id_cliente: "CYC",
                    id_proyecto: projSeleccionado,
                    fec_inicio: new Date().toISOString().split("T")[0],
                    tarifa: precioNum
                }),
            });

            if (res.ok) {
                alert("Tarifa guardada con exito");
                cerrarModal();
                cargarTarifas();
            } else {
                const errorData = await res.json();
                setErrores({ general: errorData.detail || "Error al guardar en el servidor." });
            }
        } catch (error) {
            console.error("Error guardando tarifa:", error);
            setErrores({ general: "No se pudo conectar con el servidor." });
        } finally {
            setIsSaving(false);
        }
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setErrores({});
        setEmpSeleccionado("");
        setProjSeleccionado("");
        setPrecio("");
    };

    return (
        <div className="p-10 max-w-7xl mx-auto relative">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-quality-dark tracking-tight">Asignacion de Tarifas</h1>
                    <p className="text-gray-500 mt-1">Define el precio por hora de cada empleado segun el proyecto.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-quality-red hover:bg-[#C20017] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center gap-2"
                >
                    <Plus size={18} />
                    Asignar Tarifa
                </button>
            </div>

            {/* Busqueda */}
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

            {/* Tabla */}
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
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="animate-spin text-quality-red" size={24} />
                                        <span>Conectando con la base de datos...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : tarifasFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No hay tarifas registradas o hubo un error de conexion.
                                </td>
                            </tr>
                        ) : (
                            tarifasFiltradas.map(tarifa => {
                                const empleadoObj = empleados.find(e => e.id_empleado === tarifa.empleado);
                                const nombreEmpleado = empleadoObj ? `${empleadoObj.nombre} ${empleadoObj.apellidos}` : tarifa.empleado;

                                const proyectoObj = proyectos.find(p => p.id_proyecto === tarifa.proyecto);
                                const nombreProyecto = proyectoObj ? proyectoObj.nombre_proyecto : tarifa.proyecto;

                                return (
                                    <tr key={`${tarifa.id_sociedad}-${tarifa.empleado}-${tarifa.proyecto}`} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-quality-dark">{nombreEmpleado}</td>
                                        <td className="px-6 py-4 text-gray-600">{nombreProyecto}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-base font-semibold text-quality-dark bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                                                {tarifa.tarifa.toFixed(2)} €
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Activa</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                                                <button className="p-2 text-gray-400 hover:text-quality-red hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-quality-dark flex items-center gap-2">
                                <CircleDollarSign size={20} className="text-quality-red" /> Asignar Nueva Tarifa
                            </h3>
                            <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {errores.general && (
                                <div className="bg-red-50 border-l-4 border-quality-red p-3 rounded-r-md flex items-start gap-3">
                                    <AlertCircle className="text-quality-red shrink-0 mt-0.5" size={18} />
                                    <p className="text-sm text-red-800 font-medium">{errores.general}</p>
                                </div>
                            )}

                            {/* Seleccion de empleado */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
                                <select
                                    value={empSeleccionado}
                                    onChange={(e) => { setEmpSeleccionado(e.target.value); setErrores({ ...errores, empleado: undefined, general: undefined }); }}
                                    className={`w-full border rounded-lg px-3 py-2 outline-none bg-white transition-colors ${errores.empleado ? 'border-quality-red focus:ring-quality-red/20' : 'border-gray-300 focus:ring-quality-dark/20 focus:border-quality-dark'}`}
                                >
                                    <option value="">Selecciona un empleado...</option>
                                    {empleados.map(e => (
                                        <option key={e.id_empleado} value={e.id_empleado}>{`${e.nombre} ${e.apellidos}`}</option>
                                    ))}
                                </select>
                                {errores.empleado && <p className="text-quality-red text-xs mt-1.5 font-medium">{errores.empleado}</p>}
                            </div>

                            {/* Seleccion de proyecto */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
                                <select
                                    value={projSeleccionado}
                                    onChange={(e) => { setProjSeleccionado(e.target.value); setErrores({ ...errores, proyecto: undefined, general: undefined }); }}
                                    className={`w-full border rounded-lg px-3 py-2 outline-none bg-white transition-colors ${errores.proyecto ? 'border-quality-red focus:ring-quality-red/20' : 'border-gray-300 focus:ring-quality-dark/20 focus:border-quality-dark'}`}
                                >
                                    <option value="">Selecciona un proyecto...</option>
                                    {proyectos.map(p => (
                                        <option key={p.id_proyecto} value={p.id_proyecto}>{p.nombre_proyecto}</option>
                                    ))}
                                </select>
                                {errores.proyecto && <p className="text-quality-red text-xs mt-1.5 font-medium">{errores.proyecto}</p>}
                            </div>

                            {/* Precio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio por Hora</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className={`font-medium ${errores.precio ? 'text-quality-red' : 'text-gray-500'}`}>€</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={precio}
                                        onChange={(e) => { setPrecio(e.target.value); setErrores({ ...errores, precio: undefined }); }}
                                        className={`w-full pl-8 pr-4 py-2 border rounded-lg outline-none font-mono transition-colors ${errores.precio ? 'border-quality-red focus:ring-quality-red/20' : 'border-gray-300 focus:ring-quality-dark/20 focus:border-quality-dark'}`}
                                        placeholder="0.00"
                                    />
                                </div>
                                {errores.precio && <p className="text-quality-red text-xs mt-1.5 font-medium">{errores.precio}</p>}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button onClick={cerrarModal} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors" disabled={isSaving}>Cancelar</button>
                            <button
                                onClick={handleGuardarTarifa}
                                disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium bg-quality-dark text-white hover:bg-black rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
                            >
                                {isSaving && <Loader2 className="animate-spin" size={16} />}
                                {isSaving ? "Guardando..." : "Guardar Tarifa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}