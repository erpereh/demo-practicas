"use client";

// ------------- IMPORTS -------------
// Hooks de React + iconos Lucide para la UI
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  X,
  Landmark,
  Loader2,
  AlertCircle,
  Edit,
} from "lucide-react";

// ------------- TIPO DE DATOS (DTO) -------------
// Tipado del objeto Banco tal y como lo devuelve el backend (/api/bancos/)
type BancoAPI = {
  id_sociedad: string;
  id_banco_cobro: string;
  n_banco_cobro: string;
  num_cuenta?: string | null;
  codigo_iban?: string | null;
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

export default function BancosPage() {
  // ------------- CONFIG API -------------
  // URL base del backend (configurable con NEXT_PUBLIC_API_URL o por defecto 127.0.0.1:8000)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // ------------- ESTADO UI (BÚSQUEDA Y MODAL) -------------
  // searchTerm: texto del input de búsqueda
  // isModalOpen: controla si está abierto el modal de crear/editar
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ------------- ESTADO DATOS (LISTADO) -------------
  // bancos: lista de cuentas bancarias desde el backend
  // isLoading: loading del GET inicial
  // isSaving: loading del POST/PUT
  const [bancos, setBancos] = useState<BancoAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ------------- MODO EDICIÓN -------------
  // editing: si tiene un banco, el modal está en modo edición
  // si es null, el modal está en modo creación
  const [editing, setEditing] = useState<BancoAPI | null>(null);

  // ------------- ESTADO FORMULARIO (MODAL) -------------
  // Campos alineados con la tabla real BANCOS:
  // - idSociedad -> ID_SOCIEDAD
  // - idBancoCobro -> ID_BANCO_COBRO
  // - nombreBanco -> N_BANCO_COBRO
  // - numCuenta -> NUM_CUENTA
  // - codigoIban -> CODIGO_IBAN
  const [idSociedad, setIdSociedad] = useState("01");
  const [idBancoCobro, setIdBancoCobro] = useState("");
  const [nombreBanco, setNombreBanco] = useState("");
  const [numCuenta, setNumCuenta] = useState("");
  const [codigoIban, setCodigoIban] = useState("");

  // ------------- ESTADO ERRORES -------------
  // errores.general se muestra tanto en la página como dentro del modal
  const [errores, setErrores] = useState<{ general?: string }>({});

  // ======================
  // ------------- HELPERS DE FORMULARIO -------------
  // ======================

  // Resetea los campos del formulario a valores por defecto
  const resetForm = () => {
    setIdSociedad("01");
    setIdBancoCobro("");
    setNombreBanco("");
    setNumCuenta("");
    setCodigoIban("");
  };

  // Abre modal en modo creación:
  // - limpia modo edición
  // - resetea formulario
  // - limpia errores
  // - abre modal
  const openCreate = () => {
    setEditing(null);
    resetForm();
    setErrores({});
    setIsModalOpen(true);
  };

  // Abre modal en modo edición:
  // - guarda el banco a editar en editing
  // - precarga el formulario con sus datos
  // - abre modal
  const openEdit = (b: BancoAPI) => {
    setEditing(b);
    setErrores({});
    setIdSociedad(b.id_sociedad);
    setIdBancoCobro(b.id_banco_cobro);
    setNombreBanco(b.n_banco_cobro);
    setNumCuenta(b.num_cuenta || "");
    setCodigoIban(b.codigo_iban || "");
    setIsModalOpen(true);
  };

  // Cierra el modal:
  // - cierra ventana
  // - limpia modo edición
  // - limpia errores
  // - resetea formulario
  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setErrores({});
    resetForm();
  };

  // ======================
  // ------------- (1) CARGAR BANCOS -------------
  // ======================
  // GET /api/bancos/:
  // - activa loading
  // - limpia errores
  // - si OK guarda lista en state
  // - si KO muestra error
  // - desactiva loading al final
  const cargarBancos = async () => {
    try {
      setIsLoading(true);
      setErrores({});

      const res = await fetch(`${API_URL}/api/bancos/`);
      if (!res.ok) {
        setErrores({ general: await parseFastApiError(res) });
        return;
      }

      setBancos(await res.json());
    } catch (e) {
      console.error(e);
      setErrores({ general: "No se pudo conectar con el backend." });
    } finally {
      setIsLoading(false);
    }
  };

  // ------------- EFECTO INICIAL -------------
  // Carga el listado al entrar en la página
  useEffect(() => {
    cargarBancos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------- FILTRADO MEMOIZADO -------------
  // Filtra por entidad, IBAN, nº cuenta, id_banco y sociedad.
  // useMemo evita recalcular el filtro si no cambia bancos o searchTerm.
  const bancosFiltrados = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return bancos.filter((b) => {
      return (
        b.n_banco_cobro.toLowerCase().includes(t) ||
        (b.codigo_iban || "").toLowerCase().includes(t) ||
        (b.num_cuenta || "").toLowerCase().includes(t) ||
        b.id_banco_cobro.toLowerCase().includes(t) ||
        b.id_sociedad.toLowerCase().includes(t)
      );
    });
  }, [bancos, searchTerm]);

  // ======================
  // ------------- (2) GUARDAR (CREAR / EDITAR) -------------
  // ======================
  // - En creación valida sociedad + id banco + entidad.
  // - En edición valida sólo entidad (según tu schema update).
  // - Si creación -> POST /api/bancos/
  // - Si edición -> PUT /api/bancos/{id_banco_cobro}
  // - Si OK -> cierra modal y recarga listado
  // - Si KO -> muestra error en errores.general
  const handleGuardar = async () => {
    // CREATE
    if (!editing) {
      if (!idSociedad.trim() || !idBancoCobro.trim() || !nombreBanco.trim()) {
        setErrores({
          general: "Sociedad, ID Banco y Entidad bancaria son obligatorios.",
        });
        return;
      }
    } else {
      // EDIT (según tu schema: solo nombre/cuenta/iban)
      if (!nombreBanco.trim()) {
        setErrores({ general: "La entidad bancaria es obligatoria." });
        return;
      }
    }

    try {
      setIsSaving(true);
      setErrores({});

      if (!editing) {
        // ------------- CREAR (POST) -------------
        // Normaliza mayúsculas y convierte opcionales vacíos a null
        const payload = {
          id_sociedad: idSociedad.trim().toUpperCase(),
          id_banco_cobro: idBancoCobro.trim().toUpperCase(),
          n_banco_cobro: nombreBanco.trim(),
          num_cuenta: numCuenta.trim() || null,
          codigo_iban: codigoIban.trim() || null,
        };

        const res = await fetch(`${API_URL}/api/bancos/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          setErrores({ general: await parseFastApiError(res) });
          return;
        }

        // Si OK: cierra modal y recarga listado
        closeModal();
        await cargarBancos();
        return;
      }

      // ------------- EDITAR (PUT) -------------
      // Según el schema BancoUpdate: solo n_banco_cobro, num_cuenta, codigo_iban
      const updatePayload = {
        n_banco_cobro: nombreBanco.trim(),
        num_cuenta: numCuenta.trim() || null,
        codigo_iban: codigoIban.trim() || null,
      };

      const res = await fetch(
        `${API_URL}/api/bancos/${encodeURIComponent(editing.id_banco_cobro)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!res.ok) {
        setErrores({ general: await parseFastApiError(res) });
        return;
      }

      // Si OK: cierra modal y recarga listado
      closeModal();
      await cargarBancos();
    } catch (e) {
      console.error(e);
      setErrores({ general: "Error de conexión" });
    } finally {
      // Apaga el loading del botón de guardar
      setIsSaving(false);
    }
  };

  // ======================
  // ------------- (3) ARCHIVAR -------------
  // ======================
  // Archiva/elimina una cuenta:
  // - pide confirmación
  // - PATCH /api/bancos/{id}/archivar
  // - si OK recarga listado
  const handleArchivar = async (id_banco_cobro: string) => {
    if (!confirm(`¿Archivar (eliminar) la cuenta ${id_banco_cobro}?`)) return;

    const res = await fetch(
      `${API_URL}/api/bancos/${encodeURIComponent(id_banco_cobro)}/archivar`,
      { method: "PATCH" }
    );

    if (!res.ok) {
      alert(await parseFastApiError(res));
      return;
    }
    await cargarBancos();
  };

  // ======================
  // ------------- RENDER -------------
  // ======================
  // UI principal:
  // - cabecera + botón añadir cuenta
  // - error general
  // - buscador
  // - tabla con acciones en hover (editar/archivar)
  // - modal crear/editar con formulario y error dentro
  return (
    <div className="p-10 max-w-7xl mx-auto relative">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-quality-dark tracking-tight">
            Cuentas Bancarias
          </h1>
          <p className="text-gray-500 mt-1">Gestión de cuentas de cobro e IBAN.</p>
        </div>

        <button
          onClick={openCreate}
          className="bg-quality-red hover:bg-[#C20017] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center gap-2"
        >
          <Plus size={18} /> Añadir Cuenta
        </button>
      </div>

      {/* ERROR GENERAL */}
      {errores.general && (
        <div className="bg-red-50 border-l-4 border-quality-red p-3 rounded-r-md flex items-start gap-3 mb-4">
          <AlertCircle className="text-quality-red shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-red-800 font-medium">{errores.general}</p>
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
            placeholder="Buscar banco, IBAN, cuenta o ID..."
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
              <th className="px-6 py-4">Entidad</th>
              <th className="px-6 py-4">IBAN</th>
              <th className="px-6 py-4">Nº Cuenta</th>
              <th className="px-6 py-4">Sociedad</th>
              <th className="px-6 py-4">ID Banco</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="animate-spin text-quality-red" size={24} />
                    <span>Cargando cuentas bancarias...</span>
                  </div>
                </td>
              </tr>
            ) : bancosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No hay cuentas registradas.
                </td>
              </tr>
            ) : (
              bancosFiltrados.map((b) => (
                <tr
                  key={b.id_banco_cobro}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-quality-dark flex items-center gap-2">
                      <Landmark size={16} className="text-gray-400" />
                      {b.n_banco_cobro}
                    </p>
                  </td>

                  <td className="px-6 py-4 font-mono text-sm text-gray-700">
                    {b.codigo_iban || "-"}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-700">
                    {b.num_cuenta || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{b.id_sociedad}</td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-700">
                    {b.id_banco_cobro}
                  </td>

                  {/* Acciones ocultas hasta hover de fila (group-hover) */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        onClick={() => openEdit(b)}
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        className="p-2 text-gray-400 hover:text-quality-red hover:bg-red-50 rounded-lg"
                        onClick={() => handleArchivar(b.id_banco_cobro)}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-quality-dark flex items-center gap-2">
                <Landmark size={20} className="text-quality-red" />
                {editing ? "Editar Cuenta Bancaria" : "Añadir Nueva Cuenta"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Error dentro del modal */}
              {errores.general && (
                <div className="bg-red-50 border-l-4 border-quality-red p-3 rounded-r-md flex items-start gap-3">
                  <AlertCircle className="text-quality-red shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-red-800 font-medium">{errores.general}</p>
                </div>
              )}

              {/* Sociedad + ID Banco (bloqueados en edición) */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sociedad
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                    value={idSociedad}
                    onChange={(e) => setIdSociedad(e.target.value)}
                    disabled={!!editing}
                    title={editing ? "No se puede editar la sociedad" : ""}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Banco Cobro
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none font-mono"
                    placeholder="001"
                    value={idBancoCobro}
                    onChange={(e) => setIdBancoCobro(e.target.value)}
                    disabled={!!editing}
                    title={editing ? "No se puede editar el ID" : ""}
                  />
                </div>
              </div>

              {/* Entidad bancaria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entidad Bancaria
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                  placeholder="Banco Bilbao Vizcaya Argentaria"
                  value={nombreBanco}
                  onChange={(e) => setNombreBanco(e.target.value)}
                />
              </div>

              {/* IBAN + Nº cuenta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IBAN (opcional)
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none font-mono"
                    placeholder="ES8601822737190201582733"
                    value={codigoIban}
                    onChange={(e) => setCodigoIban(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nº Cuenta (opcional)
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none font-mono"
                    placeholder="0201582733"
                    value={numCuenta}
                    onChange={(e) => setNumCuenta(e.target.value)}
                  />
                </div>
              </div>

              {/* Aviso de campos bloqueados en edición */}
              {editing && (
                <p className="text-xs text-gray-500">
                  En edición no se permite cambiar{" "}
                  <span className="font-mono">ID_SOCIEDAD</span> ni{" "}
                  <span className="font-mono">ID_BANCO_COBRO</span>.
                </p>
              )}
            </div>

            {/* Botonera */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={handleGuardar}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium bg-quality-dark text-white hover:bg-black rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
              >
                {isSaving && <Loader2 className="animate-spin" size={16} />}
                {isSaving ? "Guardando..." : editing ? "Guardar cambios" : "Guardar cuenta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}