"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  X,
  Building2,
  Loader2,
  AlertCircle,
  Edit,
} from "lucide-react";

type ClienteAPI = {
  id_sociedad: string;
  id_cliente: string;
  n_cliente: string;
  cif: string;
  persona_contacto?: string | null;
  direccion?: string | null;
};

async function parseFastApiError(res: Response) {
  try {
    const data = await res.json();
    if (Array.isArray(data.detail)) {
      return data.detail.map((d: any) => d.msg).join(" | ");
    }
    return data.detail || "Error";
  } catch {
    return "Error";
  }
}

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [clientes, setClientes] = useState<ClienteAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- FORM / MODAL ---
  const [idSociedad, setIdSociedad] = useState("01");
  const [idCliente, setIdCliente] = useState("");
  const [nombre, setNombre] = useState(""); // n_cliente
  const [cif, setCif] = useState("");
  const [contacto, setContacto] = useState(""); // persona_contacto
  const [direccion, setDireccion] = useState("");

  // errores
  const [erroresGlobal, setErroresGlobal] = useState<{ general?: string }>({});
  const [erroresModal, setErroresModal] = useState<{ general?: string }>({});

  // modo edición
  const [editandoId, setEditandoId] = useState<string | null>(null); // id_cliente en edición
  const esEdicion = editandoId !== null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // ======================
  // 1) Cargar clientes
  // ======================
  const cargarClientes = async () => {
    try {
      setIsLoading(true);
      setErroresGlobal({});
      const res = await fetch(`${API_URL}/api/clientes/`);
      if (!res.ok) throw new Error(await parseFastApiError(res));
      const data: ClienteAPI[] = await res.json();
      setClientes(data);
    } catch (e: any) {
      setErroresGlobal({ general: e?.message || "Error cargando clientes" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientesFiltrados = clientes.filter(
    (cli) =>
      cli.n_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cli.cif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ======================
  // 2) Abrir / cerrar modal
  // ======================
  const abrirModalNuevo = () => {
    setEditandoId(null);
    setErroresModal({});
    setIdSociedad("01");
    setIdCliente("");
    setNombre("");
    setCif("");
    setContacto("");
    setDireccion("");
    setIsModalOpen(true);
  };

  const abrirModalEditar = (c: ClienteAPI) => {
    setEditandoId(c.id_cliente);
    setErroresModal({});
    setIdSociedad(c.id_sociedad);
    setIdCliente(c.id_cliente);
    setNombre(c.n_cliente);
    setCif(c.cif);
    setContacto(c.persona_contacto ?? "");
    setDireccion(c.direccion ?? "");
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setErroresModal({});
    setEditandoId(null);
  };

  // ======================
  // 3) Guardar (crear / editar)
  // ======================
  const handleGuardar = async () => {
    // validaciones básicas
    if (!nombre.trim() || !cif.trim() || (!esEdicion && (!idCliente.trim() || !idSociedad.trim()))) {
      setErroresModal({
        general:
          "Sociedad, ID Cliente, Razón Social y CIF/NIF son obligatorios.",
      });
      return;
    }

    try {
      setIsSaving(true);
      setErroresModal({});

      if (!esEdicion) {
        // CREAR
        const payloadCreate = {
          id_sociedad: idSociedad.trim().toUpperCase(),
          id_cliente: idCliente.trim().toUpperCase(),
          n_cliente: nombre.trim(),
          cif: cif.trim().toUpperCase(),
          persona_contacto: contacto.trim() || null,
          direccion: direccion.trim() || null,
        };

        const res = await fetch(`${API_URL}/api/clientes/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadCreate),
        });

        if (!res.ok) {
          const msg = await parseFastApiError(res);
          setErroresModal({ general: msg });
          return;
        }
      } else if (editandoId) {
        // EDITAR
        const payloadUpdate = {
          n_cliente: nombre.trim(),
          cif: cif.trim().toUpperCase(),
          persona_contacto: contacto.trim() || null,
          direccion: direccion.trim() || null,
        };

        const res = await fetch(
          `${API_URL}/api/clientes/${encodeURIComponent(editandoId)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadUpdate),
          }
        );

        if (!res.ok) {
          const msg = await parseFastApiError(res);
          setErroresModal({ general: msg });
          return;
        }
      }

      // si llega aquí, OK
      cerrarModal();
      await cargarClientes();
    } catch {
      setErroresModal({ general: "Error de conexión con el servidor" });
    } finally {
      setIsSaving(false);
    }
  };

  // ======================
  // 4) Archivar (borrar lógico)
  // ======================
  const handleArchivar = async (id_cliente: string) => {
    if (!confirm(`¿Archivar (eliminar) el cliente ${id_cliente}?`)) return;

    try {
      const res = await fetch(
        `${API_URL}/api/clientes/${encodeURIComponent(id_cliente)}/archivar`,
        {
          method: "PATCH",
        }
      );
      if (!res.ok) {
        const msg = await parseFastApiError(res);
        alert(msg);
        return;
      }
      await cargarClientes();
    } catch {
      alert("Error de conexión");
    }
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div className="p-10 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-quality-dark">Clientes</h1>
          <p className="text-gray-500">Directorio de empresas a facturar.</p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="bg-quality-red text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
        >
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      {erroresGlobal.general && (
        <div className="bg-red-50 text-red-800 p-3 rounded mb-4 flex gap-2">
          <AlertCircle size={18} /> {erroresGlobal.general}
        </div>
      )}

      <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex gap-3">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar empresa o CIF..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-quality-red"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Empresa</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Dirección</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-10 text-center">
                  <Loader2 className="animate-spin inline mr-2" /> Cargando...
                </td>
              </tr>
            ) : clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center">
                  No hay clientes.
                </td>
              </tr>
            ) : (
              clientesFiltrados.map((c) => (
                <tr
                  key={c.id_cliente}
                  className="hover:bg-gray-50 group transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-quality-dark">
                      {c.n_cliente}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {c.id_cliente} · CIF: {c.cif}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {c.persona_contacto || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.direccion || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Editar"
                        onClick={() => abrirModalEditar(c)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        onClick={() => handleArchivar(c.id_cliente)}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-lg font-bold text-quality-dark flex gap-2 items-center">
                <Building2 className="text-quality-red" />{" "}
                {esEdicion ? "Editar Cliente" : "Nuevo Cliente"}
              </h3>
              <button onClick={cerrarModal}>
                <X className="text-gray-400 hover:text-black" />
              </button>
            </div>

            {erroresModal.general && (
              <div className="bg-red-50 text-red-800 p-3 rounded mb-4 flex gap-2">
                <AlertCircle size={18} /> {erroresModal.general}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Sociedad
                  </label>
                  <input
                    className={`w-full border rounded-lg px-3 py-2 ${
                      esEdicion
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : ""
                    }`}
                    value={idSociedad}
                    onChange={(e) => setIdSociedad(e.target.value)}
                    disabled={esEdicion}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium block mb-1">
                    ID Cliente
                  </label>
                  <input
                    className={`w-full border rounded-lg px-3 py-2 ${
                      esEdicion
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : ""
                    }`}
                    placeholder="ATOS, CYC..."
                    value={idCliente}
                    onChange={(e) => setIdCliente(e.target.value)}
                    disabled={esEdicion}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium block mb-1">
                    Razón Social
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Tech S.L."
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    CIF/NIF
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="B123..."
                    value={cif}
                    onChange={(e) => setCif(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Contacto
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Nombre persona"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Dirección
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Calle..."
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={isSaving}
                className="px-4 py-2 bg-quality-dark text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving && <Loader2 className="animate-spin" size={16} />}
                {esEdicion ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}