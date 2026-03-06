"use client";

// ------------- IMPORTS -------------
// Hooks de React para estado/ciclo de vida + iconos Lucide para la UI
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  X,
  Users,
  Loader2,
  AlertCircle,
  Edit,
} from "lucide-react";

// ------------- TIPO DE DATOS (DTO) -------------
// Tipado del objeto Empleado tal y como lo devuelve el backend (/api/empleados/).
// OJO: email y telefono están tipados como opcionales aquí para UI, pero deben existir en backend
// y en la tabla si quieres que se guarden de verdad (si no, el backend los ignorará o fallará).
type EmpleadoAPI = {
  id_empleado: string;
  id_empleado_tracker: string;
  nombre: string;
  apellidos: string;
  matricula?: string | null;
  email?: string | null;      // añadido campo opcional email
  telefono?: string | null;   // añadido campo opcional teléfono
};

// ------------- PARSEO DE ERRORES FASTAPI -------------
// Convierte la respuesta de error de FastAPI en un mensaje legible:
// - Si detail es un array (errores de validación por campo), concatena los msg.
// - Si detail es texto, lo devuelve.
// - Si no se puede parsear, devuelve "Error {status}".
const parseFastApiError = async (res: Response) => {
  try {
    const data = await res.json();
    if (Array.isArray(data.detail))
      return data.detail.map((d: any) => d.msg).join(" | ");
    return data.detail || `Error ${res.status}`;
  } catch {
    return `Error ${res.status}`;
  }
};

export default function EmpleadosPage() {
  // ------------- CONFIG API -------------
  // URL base del backend (configurable con NEXT_PUBLIC_API_URL o por defecto 127.0.0.1:8000)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // ------------- ESTADO UI (BÚSQUEDA Y MODAL) -------------
  // searchTerm: texto del input de búsqueda
  // isModalOpen: controla si está abierto el modal de crear/editar
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ------------- ESTADO DATOS (LISTADO) -------------
  // empleados: lista desde el backend
  // isLoading: loading del GET
  // isSaving: loading del POST/PUT
  const [empleados, setEmpleados] = useState<EmpleadoAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ------------- ESTADO FORMULARIO (MODAL) -------------
  // Campos alineados con tu tabla real EMPLEADOS:
  // - idEmpleado -> ID_EMPLEADO (DNI/NIE)
  // - tracker -> ID_EMPLEADO_TRACKER
  // - nombre -> NOMBRE
  // - apellidos -> APELLIDOS
  // - matricula -> MATRICULA
  // email/telefono: añadidos en el front (deben existir en backend si se quieren persistir)
  const [idEmpleado, setIdEmpleado] = useState(""); // DNI/NIE
  const [tracker, setTracker] = useState(""); // ID_EMPLEADO_TRACKER
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [matricula, setMatricula] = useState("");
  const [email, setEmail] = useState("");       // añadido input email
  const [telefono, setTelefono] = useState(""); // añadido input teléfono

  // ------------- ESTADO ERRORES -------------
  // erroresGlobal: errores de listado (se muestran fuera del modal)
  // erroresModal: errores del formulario (por campo y/o general dentro del modal)
  const [erroresGlobal, setErroresGlobal] = useState<{ general?: string }>({});
  const [erroresModal, setErroresModal] = useState<{
    id_empleado?: string;
    tracker?: string;
    nombre?: string;
    apellidos?: string;
    email?: string;       // añadido error email
    telefono?: string;    // añadido error teléfono
    general?: string;
  }>({});

  // ------------- MODO EDICIÓN -------------
  // editandoId: si tiene valor, el modal está editando ese ID_EMPLEADO
  // esEdicion: booleano derivado para simplificar condiciones
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const esEdicion = editandoId !== null;

  // ======================
  // ------------- (1) CARGAR EMPLEADOS -------------
  // ======================
  // GET /api/empleados/:
  // - activa loading
  // - limpia erroresGlobal
  // - si OK guarda lista en state
  // - si KO muestra error global
  // - desactiva loading al final
  const cargarEmpleados = async () => {
    try {
      setIsLoading(true);
      setErroresGlobal({});
      const res = await fetch(`${API_URL}/api/empleados/`);
      if (!res.ok) {
        setErroresGlobal({ general: await parseFastApiError(res) });
        return;
      }
      setEmpleados(await res.json());
    } catch (e) {
      setErroresGlobal({
        general: "No se pudo conectar con el servidor (¿backend encendido?).",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ------------- EFECTO INICIAL -------------
  // Carga el listado al entrar en la página
  useEffect(() => {
    cargarEmpleados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------- FILTRADO EN FRONT -------------
  // Filtra empleados por nombre completo o por ID (DNI/NIE)
  const empleadosFiltrados = empleados.filter((e) => {
    const full = `${e.nombre} ${e.apellidos}`.toLowerCase();
    return (
      full.includes(searchTerm.toLowerCase()) ||
      e.id_empleado.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // ======================
  // ------------- (2) MODAL HELPERS -------------
  // ======================

  // Abre el modal en modo creación:
  // - desactiva edición
  // - limpia errores del modal
  // - resetea formulario
  // - abre modal
  const abrirModalNuevo = () => {
    setEditandoId(null);
    setErroresModal({});
    setIdEmpleado("");
    setTracker("");
    setNombre("");
    setApellidos("");
    setMatricula("");
    setEmail("");      // inicializado
    setTelefono("");   // inicializado
    setIsModalOpen(true);
  };

  // Abre el modal en modo edición:
  // - guarda el ID que se edita
  // - precarga formulario con valores del empleado seleccionado
  // - abre modal
  const abrirModalEditar = (emp: EmpleadoAPI) => {
    setEditandoId(emp.id_empleado);
    setErroresModal({});
    setIdEmpleado(emp.id_empleado);
    setTracker(emp.id_empleado_tracker);
    setNombre(emp.nombre);
    setApellidos(emp.apellidos);
    setMatricula(emp.matricula || "");
    setEmail(emp.email || "");       // asignado valor existente
    setTelefono(emp.telefono || ""); // asignado valor existente
    setIsModalOpen(true);
  };

  // Cierra el modal:
  // - cierra ventana
  // - limpia errores del modal
  // - resetea edición
  // - resetea formulario
  const cerrarModal = () => {
    setIsModalOpen(false);
    setErroresModal({});
    setEditandoId(null);
    setIdEmpleado("");
    setTracker("");
    setNombre("");
    setApellidos("");
    setMatricula("");
    setEmail("");      // reiniciado
    setTelefono("");   // reiniciado
  };

  // ======================
  // ------------- (3) GUARDAR (CREAR / EDITAR) -------------
  // ======================
  // - valida campos obligatorios (id, tracker, nombre, apellidos)
  // - valida formatos (DNI/NIE simple, email, teléfono numérico)
  // - si creación -> POST /api/empleados/
  // - si edición -> PUT /api/empleados/{id_empleado}
  // - si OK -> cierra modal y recarga listado
  // - si KO -> muestra error dentro del modal
  const handleGuardarEmpleado = async () => {
    const nuevos: any = {};

    // Validación DNI/NIE (formato básico en front):
    // - exige 7 u 8 dígitos + letra
    // (la validación real de letra correcta la hace el backend)
    const dniRegex = /^[0-9]{7,8}[A-Z]$/i;
    if (!idEmpleado.trim()) {
      nuevos.id_empleado = "El ID (DNI/NIE) es obligatorio.";
    } else if (!dniRegex.test(idEmpleado.trim())) {
      nuevos.id_empleado = "Formato de DNI/NIE inválido.";
    }

    // Tracker obligatorio (enlaza con la app de fichajes)
    if (!tracker.trim()) nuevos.tracker = "El tracker es obligatorio.";

    // Nombre y apellidos obligatorios
    if (!nombre.trim()) nuevos.nombre = "El nombre es obligatorio.";
    if (!apellidos.trim()) nuevos.apellidos = "Los apellidos son obligatorios.";

    // Validación email (si se informa):
    // - comprueba patrón usuario@dominio.ext
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        nuevos.email = "Formato de email inválido.";
      }
    }

    // Validación teléfono (si se informa):
    // - solo permite números
    if (telefono.trim()) {
      const telefonoRegex = /^[0-9]+$/;
      if (!telefonoRegex.test(telefono.trim())) {
        nuevos.telefono = "El teléfono solo puede contener números.";
      }
    }

    // Si hay errores, se muestran en el modal y se corta el guardado
    if (Object.keys(nuevos).length) {
      setErroresModal(nuevos);
      return;
    }

    try {
      setIsSaving(true);
      setErroresModal({});

      if (!esEdicion) {
        // ------------- CREAR (POST) -------------
        // Construye payload para backend:
        // - opcionales se envían como null si están vacíos
        // - email/telefono se envían, pero deben existir en backend para persistir
        const payload = {
          id_empleado: idEmpleado,
          id_empleado_tracker: tracker,
          nombre,
          apellidos,
          matricula: matricula.trim() || null,
          email: email.trim() || null,       // enviado al backend
          telefono: telefono.trim() || null, // enviado al backend
        };

        const res = await fetch(`${API_URL}/api/empleados/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          setErroresModal({ general: await parseFastApiError(res) });
          return;
        }
      } else if (editandoId) {
        // ------------- EDITAR (PUT) -------------
        // En edición:
        // - el ID no se cambia (va bloqueado en el input)
        // - se actualizan tracker, nombre, apellidos y opcionales
        const payloadUpdate = {
          id_empleado_tracker: tracker,
          nombre,
          apellidos,
          matricula: matricula.trim() || null,
          email: email.trim() || null,       // enviado al backend
          telefono: telefono.trim() || null, // enviado al backend
        };

        const res = await fetch(
          `${API_URL}/api/empleados/${encodeURIComponent(editandoId)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadUpdate),
          }
        );

        if (!res.ok) {
          setErroresModal({ general: await parseFastApiError(res) });
          return;
        }
      }

      // Si todo OK:
      // - cierra modal
      // - recarga listado para reflejar cambios en tabla
      cerrarModal();
      await cargarEmpleados();
    } catch {
      setErroresModal({ general: "No se pudo conectar con el servidor." });
    } finally {
      setIsSaving(false);
    }
  };

  // ======================
  // ------------- (4) ARCHIVAR (BORRAR) -------------
  // ======================
  // Archiva/elimina un empleado:
  // - pide confirmación
  // - PATCH /api/empleados/{id}/archivar
  // - si OK recarga listado
  const handleArchivar = async (id_empleado: string) => {
    if (!confirm(`¿Archivar (eliminar) el empleado ${id_empleado}?`)) return;

    const res = await fetch(
      `${API_URL}/api/empleados/${encodeURIComponent(id_empleado)}/archivar`,
      {
        method: "PATCH",
      }
    );

    if (!res.ok) {
      alert(await parseFastApiError(res));
      return;
    }
    await cargarEmpleados();
  };

  // ======================
  // ------------- RENDER -------------
  // ======================
  // UI principal:
  // - cabecera + botón nuevo
  // - error global de listado
  // - buscador
  // - tabla con acciones en hover (editar/archivar)
  // - modal crear/editar con errores por campo y error general
  return (
    <div className="p-10 max-w-7xl mx-auto relative">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-quality-dark tracking-tight">
            Empleados
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona la plantilla y los códigos de enlace para fichajes.
          </p>
        </div>

        <button
          onClick={abrirModalNuevo}
          className="bg-quality-red hover:bg-[#C20017] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center gap-2"
        >
          <Plus size={18} /> Nuevo Empleado
        </button>
      </div>

      {/* ERROR GENERAL DE LISTADO */}
      {erroresGlobal.general && (
        <div className="bg-red-50 border-l-4 border-quality-red p-3 rounded-r-md flex items-start gap-3 mb-4">
          <AlertCircle
            className="text-quality-red shrink-0 mt-0.5"
            size={18}
          />
          <p className="text-sm text-red-800 font-medium">
            {erroresGlobal.general}
          </p>
        </div>
      )}

      {/* BÚSQUEDA */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <th className="px-6 py-4">Nombre Completo</th>
              <th className="px-6 py-4">ID Empleado (DNI/NIE)</th>
              <th className="px-6 py-4">Código App Fichaje</th>
              <th className="px-6 py-4">Matrícula</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {/* Estado: cargando */}
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2
                      className="animate-spin text-quality-red"
                      size={24}
                    />
                    <span>Conectando con la base de datos MySQL...</span>
                  </div>
                </td>
              </tr>
            ) : /* Estado: sin datos */
            empleadosFiltrados.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No hay empleados registrados en la base de datos.
                </td>
              </tr>
            ) : (
              // Estado: lista con filas
              empleadosFiltrados.map((e) => (
                <tr
                  key={e.id_empleado}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 font-bold text-quality-dark">
                    {e.nombre} {e.apellidos}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{e.id_empleado}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md border border-gray-200 tracking-wider">
                      {e.id_empleado_tracker}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {e.matricula || "-"}
                  </td>

                  {/* Acciones ocultas hasta hover de fila (group-hover) */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => abrirModalEditar(e)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleArchivar(e.id_empleado)}
                        className="p-2 text-gray-400 hover:text-quality-red hover:bg-red-50 rounded-lg"
                        title="Archivar"
                      >
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

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-quality-dark flex items-center gap-2">
                <Users size={20} className="text-quality-red" />{" "}
                {esEdicion ? "Editar Empleado" : "Añadir Nuevo Empleado"}
              </h3>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* ERROR GENERAL DEL MODAL */}
              {erroresModal.general && (
                <div className="bg-red-50 text-red-800 p-3 rounded mb-4 flex gap-2">
                  <AlertCircle size={18} /> {erroresModal.general}
                </div>
              )}

              {/* Campo ID Empleado (bloqueado en edición) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Empleado (DNI/NIE)
                </label>
                <input
                  value={idEmpleado}
                  onChange={(e) => setIdEmpleado(e.target.value)}
                  disabled={esEdicion}
                  className={`w-full border rounded-lg px-3 py-2 outline-none transition-colors ${
                    erroresModal.id_empleado
                      ? "border-quality-red"
                      : "border-gray-300"
                  } ${
                    esEdicion
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : ""
                  }`}
                  placeholder="02906525S"
                />
                {erroresModal.id_empleado && (
                  <p className="text-quality-red text-xs mt-1">
                    {erroresModal.id_empleado}
                  </p>
                )}
              </div>

              {/* Tracker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código App Fichaje (Tracker)
                </label>
                <input
                  value={tracker}
                  onChange={(e) => setTracker(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 outline-none transition-colors ${
                    erroresModal.tracker
                      ? "border-quality-red"
                      : "border-gray-300"
                  }`}
                  placeholder="689df899504a40fd9f5e2123"
                />
                {erroresModal.tracker && (
                  <p className="text-quality-red text-xs mt-1">
                    {erroresModal.tracker}
                  </p>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 outline-none transition-colors ${
                    erroresModal.nombre
                      ? "border-quality-red"
                      : "border-gray-300"
                  }`}
                  placeholder="ALBA"
                />
                {erroresModal.nombre && (
                  <p className="text-quality-red text-xs mt-1">
                    {erroresModal.nombre}
                  </p>
                )}
              </div>

              {/* Apellidos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos
                </label>
                <input
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 outline-none transition-colors ${
                    erroresModal.apellidos
                      ? "border-quality-red"
                      : "border-gray-300"
                  }`}
                  placeholder="GARZO SOTO"
                />
                {erroresModal.apellidos && (
                  <p className="text-quality-red text-xs mt-1">
                    {erroresModal.apellidos}
                  </p>
                )}
              </div>

              {/* Matrícula */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matrícula (opcional)
                </label>
                <input
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 outline-none border-gray-300"
                  placeholder="(opcional)"
                />
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
                {isSaving
                  ? esEdicion
                    ? "Guardando cambios..."
                    : "Guardando..."
                  : esEdicion
                  ? "Guardar cambios"
                  : "Guardar Empleado"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}