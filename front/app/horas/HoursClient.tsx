"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Trash2 } from "lucide-react";

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
  const [q, setQ] = useState("");
  const [empleadoId, setEmpleadoId] = useState("");
  const [proyectoId, setProyectoId] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // data
  const [rows, setRows] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // modales “simples”
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<TimeEntry | null>(null);

  // campos edición
  const [editHoras, setEditHoras] = useState<number>(0);

  // campos “añadir manual”
  const [mEmpleado, setMEmpleado] = useState("");
  const [mProyecto, setMProyecto] = useState("");
  const [mFecha, setMFecha] = useState("");
  const [mHoras, setMHoras] = useState<number>(0);

  // ---- (A) FETCH (aquí lo conectas con tu backend)
  // De momento meto mock para que funcione ya
  useEffect(() => {
    setLoading(true);

    // Simulación de data
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

    // Filtros en front (cuando tengas API, estos filtros van en query params)
    const filtered = mock.filter((r) => {
      const text = `${r.empleado.nombre} ${r.proyecto.nombre}`.toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (empleadoId && r.empleado.id !== empleadoId) return false;
      if (proyectoId && r.proyecto.id !== proyectoId) return false;
      if (desde && r.fecha < desde) return false;
      if (hasta && r.fecha > hasta) return false;
      return true;
    });

    setTimeout(() => {
      setRows(filtered);
      setLoading(false);
    }, 250);
  }, [q, empleadoId, proyectoId, desde, hasta]);

  const totalHoras = useMemo(
    () => rows.reduce((acc, r) => acc + r.horas, 0),
    [rows]
  );

  function openEdit(row: TimeEntry) {
    if (row.facturada) return; // bloqueada
    setSelected(row);
    setEditHoras(row.horas);
    setEditOpen(true);
  }

  function saveEdit() {
    if (!selected) return;

    // Aquí iría PUT a tu API (backend)
    setRows((prev) =>
      prev.map((r) => (r.id === selected.id ? { ...r, horas: editHoras } : r))
    );

    setEditOpen(false);
    setSelected(null);
  }

  function deleteEntry(row: TimeEntry) {
    if (row.facturada) return;
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  }

  function saveManual() {
    // Validación mínima
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

    // Aquí iría POST a tu API
    setRows((prev) => [newRow, ...prev]);

    setAddOpen(false);
    setMEmpleado("");
    setMProyecto("");
    setMFecha("");
    setMHoras(0);
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Revisión de Horas</h1>
          <p className="text-slate-600">
            Consulta, filtra y corrige horas importadas. Añade fichajes manuales si falta algún día.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Total mostrado: <span className="font-semibold">{totalHoras.toFixed(2)}</span> horas
          </p>
        </div>

        <button
          className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          onClick={() => setAddOpen(true)}
        >
          + Añadir Fichaje Manual
        </button>
      </div>

      {/* FILTROS */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Buscar por empleado o proyecto..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            className="rounded-lg border px-3 py-2"
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
            className="rounded-lg border px-3 py-2"
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
            className="rounded-lg border px-3 py-2"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />

          <input
            className="rounded-lg border px-3 py-2"
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-4 py-3 text-sm font-semibold text-slate-700">
          Horas registradas
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Empleado</th>
                <th className="px-4 py-3">Proyecto</th>
                <th className="px-4 py-3">Horas</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={7}>
                    Cargando...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={7}>
                    No hay resultados con esos filtros.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-3">{r.fecha}</td>
                    <td className="px-4 py-3 font-medium">{r.empleado.nombre}</td>
                    <td className="px-4 py-3">{r.proyecto.nombre}</td>
                    <td className="px-4 py-3">{r.horas.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                        {r.origen}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.facturada ? (
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-xs">
                          Bloqueada (facturada)
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs">
                          Editable
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
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
                              : "text-gray-400 hover:text-red-600 hover:bg-red-50"
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
      </div>

      {/* MODAL EDITAR */}
      {editOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
            <h2 className="text-lg font-semibold">Editar horas</h2>
            <p className="mt-1 text-sm text-slate-600">
              {selected.empleado.nombre} · {selected.proyecto.nombre} · {selected.fecha}
            </p>

            <div className="mt-4">
              <label className="text-sm text-slate-700">Horas</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                type="number"
                step="0.25"
                min="0"
                value={editHoras}
                onChange={(e) => setEditHoras(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-slate-500">Ej: 7.5, 4, 8…</p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                className="rounded-lg border px-4 py-2"
                onClick={() => {
                  setEditOpen(false);
                  setSelected(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                onClick={saveEdit}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AÑADIR MANUAL */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-lg">
            <h2 className="text-lg font-semibold">Añadir fichaje manual</h2>
            <p className="mt-1 text-sm text-slate-600">
              Registra horas sin volver a importar el Excel.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <select
                className="rounded-lg border px-3 py-2"
                value={mEmpleado}
                onChange={(e) => setMEmpleado(e.target.value)}
              >
                <option value="">Empleado</option>
                {mockEmpleados.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>

              <select
                className="rounded-lg border px-3 py-2"
                value={mProyecto}
                onChange={(e) => setMProyecto(e.target.value)}
              >
                <option value="">Proyecto</option>
                {mockProyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>

              <input
                className="rounded-lg border px-3 py-2"
                type="date"
                value={mFecha}
                onChange={(e) => setMFecha(e.target.value)}
              />

              <input
                className="rounded-lg border px-3 py-2"
                type="number"
                step="0.25"
                min="0"
                placeholder="Horas"
                value={mHoras}
                onChange={(e) => setMHoras(Number(e.target.value))}
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded-lg border px-4 py-2" onClick={() => setAddOpen(false)}>
                Cancelar
              </button>
              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                onClick={saveManual}
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