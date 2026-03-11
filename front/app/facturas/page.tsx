"use client";
import { useState, useEffect } from "react";

// Tipos de datos de la API
interface Factura {
  id_sociedad: string;
  id_cliente: string;
  num_factura: string;
  fec_factura: string;
  concepto: string;
  base_imponible: number;
  total: number;
}

interface LineaFactura {
  empleado_dni: string;
  empleado: string;
  proyecto: string;
  horas: number;
  tarifa_hora: number;
  subtotal: number;
}

interface PreviewFactura {
  anio: number;
  mes: number;
  id_cliente: string;
  total_horas: number;
  total_importe: number;
  lineas: LineaFactura[];
  alertas: string[];
}

interface Cliente {
  id_cliente: number;
  n_cliente: string;
}
//------------------------

export default function FacturacionPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // ======================
  // Estados generales
  // ======================
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errores, setErrores] = useState<{ general?: string }>({});

  // ======================
  // Estados del formulario
  // ======================
  const [mes, setMes] = useState<number | "">("");
  const [anio, setAnio] = useState<number | "">("");
  const [cliente, setCliente] = useState<string>("");

  //Constante para la lista de clientes
  const [clientes, setClientes] = useState<Cliente[]>([])

  const [previewData, setPreviewData] = useState<PreviewFactura | null>(null);
  const [generadaData, setGeneradaData] = useState<Factura | null>(null);


  // ======================
  // 1) Cargar facturas existentes
  // ======================
  const cargarFacturas = async () => {
    try {
      setIsLoading(true);
      setErrores({});
      const res = await fetch(`${API_URL}/api/facturas`);
      if (!res.ok) {
        setErrores({ general: "Error cargando facturas" });
        return;
      }
      const data: Factura[] = await res.json();
      setFacturas(data);
    } catch (e) {
      setErrores({ general: "No se pudo conectar con el servidor." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarFacturas();
  }, []);

  //Fetch a la API -> Clientes
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/clientes")
      .then(res => res.json())
      .then(data => setClientes(data))
  }, [])


  // ======================
  // 2) Preview de factura
  // ======================
  const previewFactura = async () => {
    if (!mes || !anio || !cliente) return;
    try {
      setIsSaving(true);
      const res = await fetch(`${API_URL}/api/factura/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mes, anio, id_cliente: cliente }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrores({ general: data.detail || "Error en la previsualización" });
        return;
      }
      const data: PreviewFactura = await res.json();
      setPreviewData(data);
      setGeneradaData(null);
      setErrores({});
    } catch (e) {
      setErrores({ general: "No se pudo conectar con el servidor." });
    } finally {
      setIsSaving(false);
    }
  };


  // ======================
  // 3) Generar factura definitiva
  // ======================
  const generarFactura = async () => {
    if (!mes || !anio || !cliente || !previewData) return;
    try {
      setIsSaving(true);
      const res = await fetch(`${API_URL}/api/factura/generar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_sociedad: "01",
          mes,
          anio,
          id_cliente: cliente,
          concepto: `Factura ${cliente} ${mes}/${anio}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrores({ general: data.detail || "Error generando factura" });
        return;
      }

      const data: Factura = await res.json();
      setGeneradaData(data);
      // Actualizamos el histórico de facturas
      cargarFacturas();
    } catch (e) {
      setErrores({ general: "No se pudo conectar con el servidor." });
    } finally {
      setIsSaving(false);
    }
  };  


  // ======================
  // 4) Filtrar facturas por búsqueda (opcional)
  // ======================
  const [searchTerm, setSearchTerm] = useState("");
  const facturasFiltradas = facturas.filter((f) =>
    `${f.id_cliente} ${f.num_factura} ${f.concepto}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );  


  /*
  VISUAL DE LA PÁGINA
  */
  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Facturación</h1>
          <p className="text-gray-500">
            Genera facturas automáticamente a partir de las horas validadas.
          </p>
        </div>

        {/* Botón generar solo si hay preview cargada y no hay factura generada aún*/}
        {previewData && !generadaData && (
          <button
            onClick={generarFactura}
            className="bg-red-600 text-white px-5 py-2 rounded-lg shadow hover:bg-red-700"
          >
            + Generar Factura
          </button>
        )}
      </div>

      {/* CARD */}
      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-lg font-semibold mb-4">
          Selección de periodo
        </h2>

        <div className="flex gap-4 mb-6">

          {/* MES */}
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="border p-2 rounded w-48"
          >
            <option value="">Seleccionar Mes</option>
            {[
              "Enero", "Febrero", "Marzo", "Abril",
              "Mayo", "Junio", "Julio", "Agosto",
              "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ].map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          {/* AÑO */}
          <select
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="border p-2 rounded w-56"
          >
            <option value="">Seleccionar Año</option>
            {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* CLIENTE */}
          <select
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="border p-2 rounded w-56"
          >
            <option value="">Seleccionar Cliente</option>

            {clientes.map((c) => (
              <option key={c.id_cliente} value={c.id_cliente}>
                {c.n_cliente}
              </option>
            ))}
          </select>

          <button
            onClick={previewFactura}
            className="bg-gray-800 text-white px-4 rounded hover:bg-gray-900"
          >
            Calcular
          </button>
        </div>

        {/* PREVIEW */}
        {previewData && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Previsualización</h3>
            
            {previewData.alertas.length > 0 && (
              <div className="mb-4 text-red-600">
                {previewData.alertas.map((a, i) => (
                  <p key={i}>⚠️ {a}</p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <p><strong>Cliente:</strong> {previewData.id_cliente}</p>
              <p><strong>Periodo:</strong> {previewData.mes}/{previewData.anio}</p>
              <p><strong>Total Horas:</strong> {previewData.total_horas} h</p>
              <p><strong>Total Importe:</strong> {previewData.total_importe.toFixed(2)} €</p>
            </div>

            {/* Tabla de líneas */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Empleado</th>
                    <th className="border px-2 py-1">Proyecto</th>
                    <th className="border px-2 py-1">Horas</th>
                    <th className="border px-2 py-1">Tarifa €/h</th>
                    <th className="border px-2 py-1">Subtotal €</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.lineas.map((l, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{l.empleado}</td>
                      <td className="border px-2 py-1">{l.proyecto}</td>
                      <td className="border px-2 py-1">{l.horas}</td>
                      <td className="border px-2 py-1">{l.tarifa_hora.toFixed(2)}</td>
                      <td className="border px-2 py-1">{l.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-6 text-xl font-bold">
              Total Factura: {previewData.total_importe.toFixed(2)} €
            </div>
            
            {/* Confirmación de factura generada */}
            {generadaData && (
              <div className="mt-4 text-green-600 font-semibold">
                ✅ Factura generada correctamente
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
