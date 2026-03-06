"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Edit, Trash2, X, Clock } from "lucide-react";

type TimeEntry = {
  id: string;
  fecha: string;
  empleado: { id: string; nombre: string };
  proyecto: { id: string; nombre: string };
  horas: number;
  desc_tarea: string;
  origen: "EXCEL" | "MANUAL";
  facturada: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function HoursClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [empleadoId, setEmpleadoId] = useState("");
  const [proyectoId, setProyectoId] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const [rows, setRows] = useState<TimeEntry[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selected, setSelected] = useState<TimeEntry | null>(null);

  const [editHoras, setEditHoras] = useState<number>(0);

  const [mEmpleado, setMEmpleado] = useState("");
  const [mProyecto, setMProyecto] = useState("");
  const [mFecha, setMFecha] = useState("");
  const [mHoras, setMHoras] = useState<number>(0);

  async function fetchData() {
    setLoading(true);

    try {
      const [resHoras, resEmp, resPro] = await Promise.all([
        fetch(`${API_URL}/api/horas`),
        fetch(`${API_URL}/api/empleados`),
        fetch(`${API_URL}/api/proyectos`)
      ]);

      const horasData = await resHoras.json();
      const empleadosData = await resEmp.json();
      const proyectosData = await resPro.json();

      setEmpleados(empleadosData);
      setProyectos(proyectosData);

      const mapped: TimeEntry[] = horasData.map((item: any) => {
        const emp = empleadosData.find(
          (e: any) => e.id_empleado === item.id_empleado
        );

        const pro = proyectosData.find(
          (p: any) => p.id_proyecto === item.id_proyecto
        );

        return {
          id: `${item.id_empleado}_${item.fecha}_${item.id_proyecto}`,
          fecha: item.fecha,
          empleado: {
            id: item.id_empleado,
            nombre: emp ? `${emp.nombre} ${emp.apellidos}` : item.id_empleado,
          },
          proyecto: {
            id: item.id_proyecto,
            nombre: pro ? pro.id_proyecto : item.id_proyecto,
          },
          horas: Number(item.horas_dia),
          desc_tarea: item.desc_tarea ?? "",
          origen: item.origen ?? "MANUAL",
          facturada: item.estado === "FACTURADA",
        };
      });

      setRows(mapped);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const text = `${r.empleado.nombre} ${r.proyecto.nombre} ${r.desc_tarea}`.toLowerCase();

      if (searchTerm && !text.includes(searchTerm.toLowerCase())) return false;
      if (empleadoId && r.empleado.id !== empleadoId) return false;
      if (proyectoId && r.proyecto.id !== proyectoId) return false;
      if (desde && r.fecha < desde) return false;
      if (hasta && r.fecha > hasta) return false;

      return true;
    });
  }, [rows, searchTerm, empleadoId, proyectoId, desde, hasta]);

  const totalHoras = useMemo(
    () => filteredRows.reduce((acc, r) => acc + r.horas, 0),
    [filteredRows]
  );

  function openEdit(row: TimeEntry) {
    if (row.facturada) return;
    setSelected(row);
    setEditHoras(row.horas);
    setIsEditOpen(true);
  }

  async function saveEdit() {
    if (!selected) return;

    try {
      const res = await fetch(
        `${API_URL}/api/horas/${selected.empleado.id}/${selected.fecha}/${selected.proyecto.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            horas_dia: Number(editHoras),
            desc_tarea: selected.desc_tarea || "Fichaje editado manualmente",
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        console.error("Error actualizando fichaje:", err);
        return;
      }

      await fetchData();
      setIsEditOpen(false);
      setSelected(null);
    } catch (error) {
      console.error("Error editando:", error);
    }
  }

  async function deleteEntry(row: TimeEntry) {
    if (row.facturada) return;

    try {
      const res = await fetch(
        `${API_URL}/api/horas/${row.empleado.id}/${row.fecha}/${row.proyecto.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const err = await res.text();
        console.error("Error eliminando fichaje:", err);
        return;
      }

      await fetchData();
    } catch (error) {
      console.error("Error eliminando:", error);
    }
  }

  async function saveManual() {
    if (!mEmpleado || !mProyecto || !mFecha || mHoras <= 0) {
      console.log("Faltan campos");
      return;
    }

    const proyectoSeleccionado = proyectos.find(
      (p: any) => p.id_proyecto === mProyecto
    );

    try {
      const res = await fetch(`${API_URL}/api/horas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_sociedad: proyectoSeleccionado?.id_sociedad ?? "01",
          fecha: mFecha,
          id_empleado: mEmpleado,
          id_cliente: proyectoSeleccionado?.id_cliente ?? "CYC",
          id_proyecto: mProyecto,
          horas_dia: Number(mHoras),
          desc_tarea: "Fichaje manual",
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Error backend:", err);
        return;
      }

      setIsAddOpen(false);
      setMEmpleado("");
      setMProyecto("");
      setMFecha("");
      setMHoras(0);

      await fetchData();
    } catch (error) {
      console.error("Error guardando:", error);
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-quality-dark tracking-tight">
            Revisión de Horas
          </h1>
          <p className="text-gray-500 mt-1">
            Consulta, filtra y corrige horas importadas.
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Total mostrado:{" "}
            <span className="font-semibold text-quality-dark">
              {totalHoras.toFixed(2)}
            </span>{" "}
            horas
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-quality-red text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          Añadir Fichaje Manual
        </button>
      </div>

      <div className="bg-white p-4 rounded-t-xl border border-gray-200 flex flex-wrap gap-3">
  <div className="relative">
    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
    <input
      type="text"
      placeholder="Buscar por empleado, proyecto o descripción..."
      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  <select
    value={empleadoId}
    onChange={(e) => setEmpleadoId(e.target.value)}
    className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700"
  >
    <option value="">Todos los empleados</option>
    {empleados.map((e) => (
      <option key={e.id_empleado} value={e.id_empleado}>
        {e.nombre} {e.apellidos}
      </option>
    ))}
  </select>

  <select
    value={proyectoId}
    onChange={(e) => setProyectoId(e.target.value)}
    className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700"
  >
    <option value="">Todos los proyectos</option>
    {proyectos.map((p) => (
      <option key={p.id_proyecto} value={p.id_proyecto}>
        {p.id_proyecto}
      </option>
    ))}
  </select>

  <input
    type="date"
    value={desde}
    onChange={(e) => setDesde(e.target.value)}
    className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700"
  />

  <input
    type="date"
    value={hasta}
    onChange={(e) => setHasta(e.target.value)}
    className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700"
  />
</div>

      <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-[#E5E7EB] text-xs uppercase text-gray-500">
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Empleado</th>
              <th className="px-6 py-4">Proyecto</th>
              <th className="px-6 py-4">Horas</th>
              <th className="px-6 py-4">Descripción</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="border-b border-[#E5E7EB]">
                <td colSpan={6} className="px-6 py-6">
                  Cargando...
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr className="border-b border-[#E5E7EB]">
                <td colSpan={6} className="px-6 py-6">
                  No hay resultados.
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[#E5E7EB] group hover:bg-gray-50"
                >
                  <td className="px-6 py-4">{r.fecha}</td>
                  <td className="px-6 py-4 font-bold">{r.empleado.nombre}</td>
                  <td className="px-6 py-4">{r.proyecto.nombre}</td>
                  <td className="px-6 py-4">{r.horas.toFixed(2)}</td>
                  <td className="px-6 py-4">{r.desc_tarea || "-"}</td>
                  <td className="px-6 py-4">
                    {!r.facturada && (
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEdit(r)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteEntry(r)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Clock size={20} /> Añadir fichaje manual
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  className="border rounded-lg px-3 py-2"
                  value={mEmpleado}
                  onChange={(e) => setMEmpleado(e.target.value)}
                >
                  <option value="">Selecciona empleado...</option>
                  {empleados.map((e) => (
                    <option key={e.id_empleado} value={e.id_empleado}>
                      {e.nombre} {e.apellidos}
                    </option>
                  ))}
                </select>

                <select
                  className="border rounded-lg px-3 py-2"
                  value={mProyecto}
                  onChange={(e) => setMProyecto(e.target.value)}
                >
                  <option value="">Selecciona proyecto...</option>
                  {proyectos.map((p) => (
                    <option key={p.id_proyecto} value={p.id_proyecto}>
                      {p.id_proyecto}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={mFecha}
                  onChange={(e) => setMFecha(e.target.value)}
                  className="border rounded-lg px-3 py-2"
                />

                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={mHoras}
                  onChange={(e) => setMHoras(Number(e.target.value))}
                  className="border rounded-lg px-3 py-2"
                  placeholder="Horas"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={saveManual}
                className="px-4 py-2 text-sm bg-quality-dark text-white rounded-lg"
              >
                Guardar fichaje
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold">Editar horas</h3>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setSelected(null);
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <input
                type="number"
                step="0.25"
                min="0"
                value={editHoras}
                onChange={(e) => setEditHoras(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setSelected(null);
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 text-sm bg-quality-dark text-white rounded-lg"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}