"use client";
import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, X, CircleDollarSign, AlertCircle, Loader2 } from "lucide-react";

// 1. DEFINIMOS LA ESTRUCTURA DE LA BASE DE DATOS
interface TarifaDB {
    id: number;
    empleado: string;
    proyecto: string;
    precioHora: number;
    estado: string;
}

export default function TarifasPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 2. ESTADOS PARA LOS DATOS REALES DEL BACKEND
    const [tarifas, setTarifas] = useState<TarifaDB[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // ESTADOS DEL FORMULARIO
    const [empSeleccionado, setEmpSeleccionado] = useState("");
    const [projSeleccionado, setProjSeleccionado] = useState("");
    const [precio, setPrecio] = useState("");

    // ESTADO PARA ERRORES DE VALIDACIÓN
    const [errores, setErrores] = useState<{ empleado?: string; proyecto?: string; precio?: string; general?: string }>({});

    // 3. FUNCIÓN PARA CARGAR LOS DATOS (GET)
    const cargarTarifas = async () => {
        try {
            setIsLoading(true);
            // Usamos la variable de entorno, o localhost por defecto si falla
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/api/tarifas`);

            if (res.ok) {
                const data = await res.json();
                setTarifas(data);
            } else {
                console.error("Error del servidor al cargar tarifas");
            }
        } catch (error) {
            console.error("Error de conexión con el backend:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Se ejecuta automáticamente al entrar en la página
    useEffect(() => {
        cargarTarifas();
    }, []);

    // FILTRO DE BÚSQUEDA (Sobre los datos reales)
    const tarifasFiltradas = tarifas.filter(tarifa =>
        tarifa.empleado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tarifa.proyecto.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 4. FUNCIÓN PARA GUARDAR EN BASE DE DATOS (POST)
    const handleGuardarTarifa = async () => {
        const nuevosErrores: { empleado?: string; proyecto?: string; precio?: string; general?: string } = {};

        // Control de campos vacíos
        if (!empSeleccionado) nuevosErrores.empleado = "Debes seleccionar un empleado.";
        if (!projSeleccionado) nuevosErrores.proyecto = "Debes seleccionar un proyecto.";

        // Control numérico
        const precioNum = parseFloat(precio);
        if (!precio) {
            nuevosErrores.precio = "Introduce un precio.";
        } else if (isNaN(precioNum) || precioNum <= 0) {
            nuevosErrores.precio = "El precio debe ser mayor que 0.";
        }

        // Regla de Negocio (Duplicados en la BBDD)
        const existeDuplicado = tarifas.find(
            (t) => t.empleado === empSeleccionado && t.proyecto === projSeleccionado && t.estado === "Activa"
        );

        if (existeDuplicado) {
            nuevosErrores.general = "Este empleado ya tiene una tarifa ACTIVA para este proyecto.";
        }

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }

        // Si la validación pasa, enviamos los datos al backend
        try {
            setIsSaving(true);
            setErrores({});
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            const res = await fetch(`${API_URL}/api/tarifas`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    empleado: empSeleccionado,
                    proyecto: projSeleccionado,
                    precioHora: precioNum,
                    estado: "Activa"
                }),
            });

            if (res.ok) {
                alert("¡Tarifa guardada con éxito en la base de datos!");
                cerrarModal();
                cargarTarifas(); // Recargamos la tabla para ver el nuevo dato
            } else {
                const errorData = await res.json();
                setErrores({ general: errorData.detail || "Error al guardar en el servidor." });
            }
        } catch (error) {
            console.error("Error al enviar datos:", error);
            setErrores({ general: "No se pudo conectar con el servidor de Base de Datos." });
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

            {/* TABLA DE TARIFAS CON ESTADO DE CARGA */}
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
                                    No hay tarifas registradas o hubo un error de conexión.
                                </td>
                            </tr>
                        ) : (
                            tarifasFiltradas.map((tarifa) => (
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL CON CONTROL DE ERRORES Y CONEXIÓN AL BACKEND */}
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

                            {/* ALERTA DE ERROR GENERAL (Servidor o duplicados) */}
                            {errores.general && (
                                <div className="bg-red-50 border-l-4 border-quality-red p-3 rounded-r-md flex items-start gap-3">
                                    <AlertCircle className="text-quality-red shrink-0 mt-0.5" size={18} />
                                    <p className="text-sm text-red-800 font-medium">{errores.general}</p>
                                </div>
                            )}

                            {/* Nota: En el futuro, estos options deberían cargarse también desde el backend */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
                                <select
                                    value={empSeleccionado}
                                    onChange={(e) => { setEmpSeleccionado(e.target.value); setErrores({ ...errores, empleado: undefined, general: undefined }); }}
                                    className={`w-full border rounded-lg px-3 py-2 outline-none bg-white transition-colors ${errores.empleado ? 'border-quality-red focus:ring-quality-red/20' : 'border-gray-300 focus:ring-quality-dark/20 focus:border-quality-dark'
                                        }`}
                                >
                                    <option value="">Selecciona un empleado...</option>
                                    <option value="Ana García">Ana García</option>
                                    <option value="Carlos López">Carlos López</option>
                                    <option value="Laura Martínez">Laura Martínez</option>
                                </select>
                                {errores.empleado && <p className="text-quality-red text-xs mt-1.5 font-medium">{errores.empleado}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
                                <select
                                    value={projSeleccionado}
                                    onChange={(e) => { setProjSeleccionado(e.target.value); setErrores({ ...errores, proyecto: undefined, general: undefined }); }}
                                    className={`w-full border rounded-lg px-3 py-2 outline-none bg-white transition-colors ${errores.proyecto ? 'border-quality-red focus:ring-quality-red/20' : 'border-gray-300 focus:ring-quality-dark/20 focus:border-quality-dark'
                                        }`}
                                >
                                    <option value="">Selecciona un proyecto...</option>
                                    <option value="Migración Cloud AWS">Migración Cloud AWS</option>
                                    <option value="Mantenimiento Servidores">Mantenimiento Servidores</option>
                                    <option value="Auditoría de Seguridad">Auditoría de Seguridad</option>
                                </select>
                                {errores.proyecto && <p className="text-quality-red text-xs mt-1.5 font-medium">{errores.proyecto}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio por Hora (€)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className={`font-medium ${errores.precio ? 'text-quality-red' : 'text-gray-500'}`}>€</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={precio}
                                        onChange={(e) => { setPrecio(e.target.value); setErrores({ ...errores, precio: undefined }); }}
                                        className={`w-full pl-8 pr-4 py-2 border rounded-lg outline-none font-mono transition-colors ${errores.precio ? 'border-quality-red focus:ring-quality-red/20' : 'border-gray-300 focus:ring-quality-dark/20 focus:border-quality-dark'
                                            }`}
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