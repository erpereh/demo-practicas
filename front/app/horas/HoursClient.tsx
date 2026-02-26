"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Edit, Trash2, X, Clock } from "lucide-react";

type TimeEntry = {
  id: string;
  fecha: string; // YYYY-MM-DD
  empleado: { id: string; nombre: string };
  proyecto: { id: string; nombre: string };
  horas: number;
  origen: "EXCEL" | "MANUAL";
  facturada: boolean; // si está facturada => bloqueada
};

const mockEmpleados = [
  { id: "e1", nombre: "Ana García" },
  { id: "e2", nombre: "Carlos López" },
  { id: "e3", nombre: "Laura Martínez" },
];

const mockProyectos = [
  { id: "p1", nombre: "Migración Cloud AWS" },
  { id: "p2", nombre: "Auditoría de Seguridad" },
  { id: "p3", nombre: "Mantenimiento Servidores" },
];

export default function HoursClient() {
  // filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [empleadoId, setEmpleadoId] = useState("");
  const [proyectoId, setProyectoId] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // data
  const [rows, setRows] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // modales
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selected, setSelected] = useState<TimeEntry | null>(null);

  // campos edición
  const [editHoras, setEditHoras] = useState<number>(0);

  // campos “añadir manual”
  const [mEmpleado, setMEmpleado] = useState("");
  const [mProyecto, setMProyecto] = useState("");
  const [mFecha, setMFecha] = useState("");
  const [mHoras, setMHoras] = useState<number>(0);

  useEffect(() => {
    setLoading(true);

    const mock: TimeEntry[] = [
      {
        id: "t1",
        fecha: "2026-02-01",
        empleado: mockEmpleados[0],
        proyecto: mockProyectos[0],
        horas: 7.5,
        origen: "EXCEL",
        facturada: false,
      },
      {
        id: "t2",
        fecha: "2026-02-02",
        empleado: mockEmpleados[1],
        proyecto: mockProyectos[2],
        horas: 4,
        origen: "MANUAL",
        facturada: true,
      },
      {
        id: "t3",
        fecha: "2026-02-03",
        empleado: mockEmpleados[2],
        proyecto: mockProyectos[0],
        horas: 6,
        origen: "EXCEL",
        facturada: false,
      },
    ];

    const filtered = mock.filter((r) => {
      const text = `${r.empleado.nombre} ${r.proyecto.nombre}`.toLowerCase();
      if (searchTerm && !text.includes(searchTerm.toLowerCase())) return false;
      if (empleadoId && r.empleado.id !== empleadoId) return false;
      if (proyectoId && r.proyecto.id !== proyectoId) return false;
      if (desde && r.fecha < desde) return false;
      if (hasta && r.fecha > hasta) return false;
      return true;
    });

    setTimeout(() => {
      setRows(filtered);
      setLoading(false);
    }, 200);
  }, [searchTerm, empleadoId, proyectoId, desde, hasta]);

  const totalHoras = useMemo(
    () => rows.reduce((acc, r) => acc + r.horas, 0),
    [rows]
  );

  function openEdit(row: TimeEntry) {
    if (row.facturada) return;
    setSelected(row);
    setEditHoras(row.horas);
    setIsEditOpen(true);
  }

  function saveEdit() {
    if (!selected) return;

    setRows((prev) =>
      prev.map((r) => (r.id === selected.id ? { ...r, horas: editHoras } : r))
    );

    setIsEditOpen(false);
    setSelected(null);
  }

  function deleteEntry(row: TimeEntry) {
    if (row.facturada) return;
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  }

  function saveManual() {
    if (!mEmpleado || !mProyecto || !mFecha || mHoras <= 0) return;

    const empleado = mockEmpleados.find((e) => e.id === mEmpleado)!;
    const proyecto = mockProyectos.find((p) => p.id === mProyecto)!;

    const newRow: TimeEntry = {
      id: `t_${Date.now()}`,
      fecha: mFecha,
      empleado,
      proyecto,
      horas: mHoras,
      origen: "MANUAL",
      facturada: false,
    };

    setRows((prev) => [newRow, ...prev]);

    setIsAddOpen(false);
    setMEmpleado("");
    setMProyecto("");
    setMFecha("");
    setMHoras(0);
  }

  return (
    <div className="relative">
      {/* CABECERA (igual estilo que tarifas) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-quality-dark tracking-tight">Revisión de Horas</h1>
          <p className="text-gray-500 mt-1">
            Consulta, filtra y corrige horas importadas. Añade fichajes manuales si falta algún día.
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Total mostrado: <span className="font-semibold text-quality-dark">{totalHoras.toFixed(2)}</span> horas
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-quality-red hover:bg-[#C20017] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center gap-2"
        >
          <Plus size={18} />
          Añadir Fichaje Manual
        </button>
      </div>

      {/* BARRA DE FILTROS (mismo look que la búsqueda de tarifas) */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por empleado o proyecto..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="w-full md:w-auto border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red transition-all bg-white"
          value={empleadoId}
          onChange={(e) => setEmpleadoId(e.target.value)}
        >
          <option value="">Todos los empleados</option>
          {mockEmpleados.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>

        <select
          className="w-full md:w-auto border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red transition-all bg-white"
          value={proyectoId}
          onChange={(e) => setProyectoId(e.target.value)}
        >
          <option value="">Todos los proyectos</option>
          {mockProyectos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="w-full md:w-auto border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red transition-all bg-white"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
        />

        <input
          type="date"
          className="w-full md:w-auto border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red transition-all bg-white"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
        />
      </div>

      {/* TABLA (mismo estilo que tarifas: rounded-b-xl + shadow + hover) */}
      <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Empleado</th>
              <th className="px-6 py-4">Proyecto</th>
              <th className="px-6 py-4">Horas</th>
              <th className="px-6 py-4">Origen</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-gray-500" colSpan={7}>
                  Cargando...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-gray-500" colSpan={7}>
                  No hay resultados con esos filtros.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-gray-600">{r.fecha}</td>

                  <td className="px-6 py-4 font-bold text-quality-dark">{r.empleado.nombre}</td>

                  <td className="px-6 py-4 text-gray-600">{r.proyecto.nombre}</td>

                  <td className="px-6 py-4">
                    <span className="font-mono text-base font-semibold text-quality-dark bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                      {r.horas.toFixed(2)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        r.origen === "EXCEL"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {r.origen}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        r.facturada
                          ? "bg-gray-100 text-gray-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {r.facturada ? "Bloqueada (facturada)" : "Editable"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className={`p-2 rounded-lg ${
                          r.facturada
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        onClick={() => openEdit(r)}
                        disabled={r.facturada}
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        className={`p-2 rounded-lg ${
                          r.facturada
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-400 hover:text-quality-red hover:bg-red-50"
                        }`}
                        onClick={() => deleteEntry(r)}
                        disabled={r.facturada}
                        title="Borrar"
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

      {/* MODAL EDITAR (mismo estilo modal que tarifas) */}
      {isEditOpen && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-quality-dark flex items-center gap-2">
                <Clock size={20} className="text-quality-red" /> Editar horas
              </h3>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setSelected(null);
                }}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                {selected.empleado.nombre} · {selected.proyecto.nombre} · {selected.fecha}
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horas</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={editHoras}
                  onChange={(e) => setEditHoras(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none font-mono"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setSelected(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 text-sm font-medium bg-quality-dark text-white hover:bg-black rounded-lg transition-colors shadow-sm"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AÑADIR MANUAL (mismo estilo modal que tarifas) */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-quality-dark flex items-center gap-2">
                <Clock size={20} className="text-quality-red" /> Añadir fichaje manual
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none bg-white"
                    value={mEmpleado}
                    onChange={(e) => setMEmpleado(e.target.value)}
                  >
                    <option value="">Selecciona un empleado...</option>
                    {mockEmpleados.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none bg-white"
                    value={mProyecto}
                    onChange={(e) => setMProyecto(e.target.value)}
                  >
                    <option value="">Selecciona un proyecto...</option>
                    {mockProyectos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={mFecha}
                    onChange={(e) => setMFecha(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horas</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={mHoras}
                    onChange={(e) => setMHoras(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-quality-red/20 focus:border-quality-red outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveManual}
                className="px-4 py-2 text-sm font-medium bg-quality-dark text-white hover:bg-black rounded-lg transition-colors shadow-sm"
              >
                Guardar fichaje
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}