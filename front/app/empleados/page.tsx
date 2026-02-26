"use client";
import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, X, Users, Loader2, AlertCircle } from "lucide-react";

// Estructura real de la Base de Datos
interface EmpleadoDB {
  id: number;
  nombre: string;
  dni: string;
  codigo_fichaje: string;
  estado: string;
}

const parseFastApiError = async (res: Response) => {
  try {
    const data = await res.json();
    if (Array.isArray(data.detail)) {
      return data.detail.map((d: any) => d.msg).join(" | ");
    }
    return data.detail || `Error ${res.status}`;
  } catch {
    return `Error ${res.status}`;
  }
};

export default function EmpleadosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ESTADOS DE DATOS REALES
  const [empleados, setEmpleados] = useState<EmpleadoDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ESTADOS DEL FORMULARIO
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [codigoFichaje, setCodigoFichaje] = useState("");
  const [estado, setEstado] = useState("Activo");

  // ERRORES DE VALIDACIÓN Y SERVIDOR
  const [errores, setErrores] = useState<{
    nombre?: string;
    dni?: string;
    codigo?: string;
    general?: string;
  }>({});

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // 1. CARGAR EMPLEADOS DESDE MYSQL
  const cargarEmpleados = async () => {
    try {
      setIsLoading(true);
      setErrores({});

      const res = await fetch(`${API_URL}/api/empleados/`);

      if (!res.ok) {
        setErrores({ general: await parseFastApiError(res) });
        return;
      }

      const data = await res.json();
      setEmpleados(data);
    } catch (error) {
      console.error("Error conectando con el backend:", error);
      setErrores({ general: "No se pudo conectar con el servidor (¿backend encendido?)." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarEmpleados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FILTRO
  const empleadosFiltrados = empleados.filter(
    (emp) =>
      emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.dni.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. GUARDAR EMPLEADO EN MYSQL
  const handleGuardarEmpleado = async () => {
    const nuevosErrores: any = {};

    if (!nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio.";
    if (!dni.trim()) nuevosErrores.dni = "El DNI/NIE es obligatorio.";
    if (!codigoFichaje.trim()) nuevosErrores.codigo = "El código de fichaje es obligatorio.";

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    try {
      setIsSaving(true);
      setErrores({});

      const res = await fetch(`${API_URL}/api/empleados/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre,
          dni: dni,
          codigo_fichaje: codigoFichaje,
          estado: estado,
        }),
      });

      if (res.ok) {
        cerrarModal();
        await cargarEmpleados();
      } else {
        setErrores({ general: await parseFastApiError(res) });
      }
    } catch (error) {
      console.error(error);
      setErrores({ general: "No se pudo conectar con el servidor." });
    } finally {
      setIsSaving(false);
    }
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setErrores({});
    setNombre("");
    setDni("");
    setCodigoFichaje("");
    setEstado("Activo");
  };

  return (
    <div className="p-10 max-w-7xl mx-auto relative">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-quality-dark tracking-tight">Empleados</h1>
          <p className="text-gray-500 mt-1">Gestiona la plantilla y los códigos de enlace para fichajes.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-quality-red hover:bg-[#C20017] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center gap-2"
        >
          <Plus size={18} /> Nuevo Empleado
        </button>
      </div>

      {/* ERROR GENERAL (arriba de todo) */}
      {errores.general && (
        <div className="bg-red-50 border-l-4 border-quality-red p-3 rounded-r-md flex items-start gap-3 mb-4">
          <AlertCircle className="text-quality-red shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-red-800 font-medium">{errores.general}</p>
        </div>
      )}

      {/* BÚSQUEDA */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA DE DATOS */}
      <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <th className="px-6 py-4">Nombre Completo</th>
              <th className="px-6 py-4">DNI / NIE</th>
              <th className="px-6 py-4">Código App Fichaje</th>
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
                    <span>Conectando con la base de datos MySQL...</span>
                  </div>
                </td>
              </tr>
            ) : empleadosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No hay empleados registrados en la base de datos.
                </td>
              </tr>
            ) : (
              empleadosFiltrados.map((empleado) => (
                <tr key={empleado.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-quality-dark">{empleado.nombre}</td>
                  <td className="px-6 py-4 text-gray-600">{empleado.dni}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md border border-gray-200 tracking-wider">
                      {empleado.codigo_fichaje}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        empleado.estado === "Activo"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {empleado.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-quality-red hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL NUEVO EMPLEADO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-quality-dark flex items-center gap-2">
                <Users size={20} className="text-quality-red" /> Añadir Nuevo Empleado
              </h3>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    setErrores({ ...errores, nombre: undefined });
                  }}
                  className={`w-full border rounded-lg px-3 py-2 outline-none transition-colors ${
                    errores.nombre ? "border-quality-red" : "border-gray-300"
                  }`}
                  placeholder="Ej. Juan Pérez"
                />
                {errores.nombre && <p className="text-quality-red text-xs mt-1">{errores.nombre}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DNI / NIE</label>
                  <input
                    type="text"
                    value={dni}
                    onChange={(e) => {
                      setDni(e.target.value);
                      setErrores({ ...errores, dni: undefined, general: undefined });
                    }}
                    className={`w-full border rounded-lg px-3 py-2 outline-none transition-colors ${
                      errores.dni ? "border-quality-red" : "border-gray-300"
                    }`}
                    placeholder="12345678A"
                  />
                  {errores.dni && <p className="text-quality-red text-xs mt-1">{errores.dni}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cód. Fichaje</label>
                  <input
                    type="text"
                    value={codigoFichaje}
                    onChange={(e) => {
                      setCodigoFichaje(e.target.value);
                      setErrores({ ...errores, codigo: undefined });
                    }}
                    className={`w-full border rounded-lg px-3 py-2 outline-none transition-colors ${
                      errores.codigo ? "border-quality-red" : "border-gray-300"
                    }`}
                    placeholder="EMP-XXX"
                  />
                  {errores.codigo && <p className="text-quality-red text-xs mt-1">{errores.codigo}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none bg-white"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={cerrarModal}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={handleGuardarEmpleado}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium bg-quality-dark text-white hover:bg-black rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
              >
                {isSaving && <Loader2 className="animate-spin" size={16} />}
                {isSaving ? "Guardando..." : "Guardar Empleado"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}