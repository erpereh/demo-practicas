"use client";
import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, X, Building2, Loader2, AlertCircle } from "lucide-react";

interface ClienteDB {
  id: number;
  nombre: string;
  cif: string;
  contacto: string;
  direccion: string;
  estado: string;
}

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados de datos
  const [clientes, setClientes] = useState<ClienteDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Formulario
  const [nombre, setNombre] = useState("");
  const [cif, setCif] = useState("");
  const [contacto, setContacto] = useState("");
  const [direccion, setDireccion] = useState("");
  const [errores, setErrores] = useState<{ general?: string }>({});

  // 1. CARGAR CLIENTES
  const cargarClientes = async () => {
    try {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/clientes/`); // Ojo a la barra final
      if (res.ok) {
        setClientes(await res.json());
      }
    } catch (error) {
      console.error("Error backend:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  const clientesFiltrados = clientes.filter(cli => 
    cli.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cli.cif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. GUARDAR CLIENTE
  const handleGuardar = async () => {
    if (!nombre.trim() || !cif.trim()) {
      alert("Nombre y CIF son obligatorios");
      return;
    }

    try {
      setIsSaving(true);
      setErrores({});
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const res = await fetch(`${API_URL}/api/clientes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, cif, contacto, direccion, estado: "Activo" }),
      });

      if (res.ok) {
        alert("Cliente guardado correctamente");
        setIsModalOpen(false);
        setNombre(""); setCif(""); setContacto(""); setDireccion("");
        cargarClientes();
      } else {
        const err = await res.json();
        setErrores({ general: err.detail || "Error al guardar" });
      }
    } catch (e) {
      setErrores({ general: "Error de conexión con el servidor" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-quality-dark">Clientes</h1>
          <p className="text-gray-500">Directorio de empresas a facturar.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-quality-red text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-red-700 transition">
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Buscar empresa o CIF..." className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-quality-red" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Empresa</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Dirección</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={4} className="p-10 text-center"><Loader2 className="animate-spin inline mr-2"/> Cargando...</td></tr> : 
             clientesFiltrados.length === 0 ? <tr><td colSpan={4} className="p-10 text-center">No hay clientes.</td></tr> :
             clientesFiltrados.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-bold text-quality-dark">{c.nombre}</p>
                  <p className="text-xs text-gray-500">CIF: {c.cif}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">{c.contacto}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{c.direccion}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600"><Edit size={16}/></button>
                  <button className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-lg font-bold text-quality-dark flex gap-2 items-center"><Building2 className="text-quality-red"/> Nuevo Cliente</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-black"/></button>
            </div>
            
            {errores.general && <div className="bg-red-50 text-red-800 p-3 rounded mb-4 flex gap-2"><AlertCircle size={18}/> {errores.general}</div>}

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium block mb-1">Razón Social</label>
                  <input className="w-full border rounded-lg px-3 py-2" placeholder="Tech S.L." value={nombre} onChange={e => setNombre(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">CIF</label>
                  <input className="w-full border rounded-lg px-3 py-2" placeholder="B123..." value={cif} onChange={e => setCif(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Contacto</label>
                <input className="w-full border rounded-lg px-3 py-2" placeholder="Nombre persona" value={contacto} onChange={e => setContacto(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Dirección</label>
                <input className="w-full border rounded-lg px-3 py-2" placeholder="Calle..." value={direccion} onChange={e => setDireccion(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={handleGuardar} disabled={isSaving} className="px-4 py-2 bg-quality-dark text-white rounded-lg flex items-center gap-2 disabled:opacity-50">
                {isSaving && <Loader2 className="animate-spin" size={16}/>} Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}