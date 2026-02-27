"use client";
import { useState, useEffect } from "react";
import { Search, Plus, Trash2, X, Landmark, Loader2, AlertCircle } from "lucide-react";

type BancoAPI = {
  id_sociedad: string;
  id_banco_cobro: string;
  n_banco_cobro: string;
  num_cuenta?: string | null;
  codigo_iban?: string | null;
};

const parseFastApiError = async (res: Response) => {
  try {
    const data = await res.json();
    if (Array.isArray(data.detail)) return data.detail.map((d: any) => d.msg).join(" | ");
    return data.detail || `Error ${res.status}`;
  } catch {
    return `Error ${res.status}`;
  }
};

export default function BancosPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [bancos, setBancos] = useState<BancoAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Formulario (tabla real)
  const [idSociedad, setIdSociedad] = useState("01");
  const [idBancoCobro, setIdBancoCobro] = useState("");
  const [nombreBanco, setNombreBanco] = useState("");
  const [numCuenta, setNumCuenta] = useState("");
  const [codigoIban, setCodigoIban] = useState("");

  const [errores, setErrores] = useState<{ general?: string }>({});

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

  useEffect(() => {
    cargarBancos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGuardar = async () => {
    if (!idSociedad.trim() || !idBancoCobro.trim() || !nombreBanco.trim()) {
      setErrores({ general: "Sociedad, ID Banco y Nombre del banco son obligatorios." });
      return;
    }

    try {
      setIsSaving(true);
      setErrores({});

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

      setIsModalOpen(false);
      setIdBancoCobro("");
      setNombreBanco("");
      setNumCuenta("");
      setCodigoIban("");
      await cargarBancos();
    } catch {
      setErrores({ general: "Error de conexión" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchivar = async (id_banco_cobro: string) => {
    if (!confirm(`¿Archivar (eliminar) la cuenta ${id_banco_cobro}?`)) return;

    const res = await fetch(`${API_URL}/api/bancos/${encodeURIComponent(id_banco_cobro)}/archivar`, {
      method: "PATCH",
    });

    if (!res.ok) {
      alert(await parseFastApiError(res));
      return;
    }
    await cargarBancos();
  };

  const bancosFiltrados = bancos.filter((b) => {
    const t = searchTerm.toLowerCase();
    return (
      b.n_banco_cobro.toLowerCase().includes(t) ||
      (b.codigo_iban || "").toLowerCase().includes(t) ||
      b.id_banco_cobro.toLowerCase().includes(t)
    );
  });

  return (
    <div className="p-10 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-quality-dark">Cuentas Bancarias</h1>
          <p className="text-gray-500">Gestión de cuentas e IBANs.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-quality-red text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
        >
          <Plus size={18} /> Añadir Cuenta
        </button>
      </div>

      {errores.general && (
        <div className="bg-red-50 text-red-800 p-3 rounded mb-4 flex gap-2">
          <AlertCircle size={18} /> {errores.general}
        </div>
      )}

      <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar banco, IBAN o ID..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-quality-red"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Entidad</th>
              <th className="px-6 py-4">IBAN</th>
              <th className="px-6 py-4">Nº Cuenta</th>
              <th className="px-6 py-4">ID Banco</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center">
                  <Loader2 className="animate-spin inline mr-2" /> Cargando...
                </td>
              </tr>
            ) : bancosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center">No hay cuentas.</td>
              </tr>
            ) : (
              bancosFiltrados.map((b) => (
                <tr key={b.id_banco_cobro} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-quality-dark flex items-center gap-2">
                    <Landmark size={16} className="text-gray-400" /> {b.n_banco_cobro}
                    <span className="text-xs text-gray-400">({b.id_sociedad})</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">{b.codigo_iban || "-"}</td>
                  <td className="px-6 py-4 font-mono text-sm">{b.num_cuenta || "-"}</td>
                  <td className="px-6 py-4 font-mono text-sm">{b.id_banco_cobro}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="p-2 text-gray-400 hover:text-red-600"
                      onClick={() => handleArchivar(b.id_banco_cobro)}
                      title="Archivar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-lg font-bold text-quality-dark flex gap-2 items-center">
                <Landmark className="text-quality-red" /> Nueva Cuenta
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="text-gray-400 hover:text-black" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Sociedad</label>
                  <input className="w-full border rounded-lg px-3 py-2" value={idSociedad} onChange={(e) => setIdSociedad(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium block mb-1">ID Banco Cobro</label>
                  <input className="w-full border rounded-lg px-3 py-2 font-mono" placeholder="001" value={idBancoCobro} onChange={(e) => setIdBancoCobro(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Entidad Bancaria</label>
                <input className="w-full border rounded-lg px-3 py-2" placeholder="BBVA" value={nombreBanco} onChange={(e) => setNombreBanco(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">IBAN (opcional)</label>
                <input className="w-full border rounded-lg px-3 py-2 font-mono" placeholder="ES..." value={codigoIban} onChange={(e) => setCodigoIban(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Nº Cuenta (opcional)</label>
                <input className="w-full border rounded-lg px-3 py-2 font-mono" placeholder="0201582733" value={numCuenta} onChange={(e) => setNumCuenta(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={isSaving}
                className="px-4 py-2 bg-quality-dark text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving && <Loader2 className="animate-spin" size={16} />} Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}