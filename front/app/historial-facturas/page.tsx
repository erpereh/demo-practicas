"use client";

import { useState, useEffect } from "react";
import { Download, Search, Filter, Eye, FileDown } from "lucide-react";

// Tipo de datos de facturas
interface Factura {
  id_sociedad: string;
  id_cliente: string;
  num_factura: string;
  fec_factura: string;
  concepto: string;
  base_imponible: number;
  total: number;
}

export default function HistorialFacturasPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // ======================
  // Estados
  // ======================
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errores, setErrores] = useState<{ general?: string }>({});

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [mesFilter, setMesFilter] = useState<number | "">("");
  const [anioFilter, setAnioFilter] = useState<number | "">("");

  // ======================
  // Cargar facturas al montar
  // ======================
  useEffect(() => {
    cargarFacturas();
  }, []);

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
      const ordenadas = data.sort(
        (a, b) =>
          new Date(b.fec_factura).getTime() -
          new Date(a.fec_factura).getTime()
      );
      setFacturas(ordenadas);
    } catch {
      setErrores({ general: "No se pudo conectar con el servidor." });
    } finally {
      setIsLoading(false);
    }
  };

  // ======================
  // Filtrar facturas
  // ======================
  const facturasFiltradas = facturas.filter((f) => {
    const fecha = new Date(f.fec_factura);
    const mes = fecha.getMonth() + 1;
    const anio = fecha.getFullYear();

    return (
      `${f.num_factura} ${f.id_cliente} ${f.concepto}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      (mesFilter === "" || mes === mesFilter) &&
      (anioFilter === "" || anio === anioFilter)
    );
  });

  // ======================
  // Exportar a CSV
  // ======================
  const exportarCSV = () => {
    if (facturasFiltradas.length === 0) {
      alert("No hay facturas para exportar");
      return;
    }

    const encabezados = ["Nº Factura", "Fecha", "Cliente", "Base", "Total"];

    const filas = facturasFiltradas.map((f) => [
      f.num_factura,
      new Date(f.fec_factura).toLocaleDateString(),
      f.id_cliente,
      f.base_imponible.toFixed(2),
      f.total.toFixed(2),
    ]);

    const contenido = [
      encabezados.join(","),
      ...filas.map((f) => f.map((c) => `"${c}"`).join(",")),
    ].join("\n");

    const blob = new Blob([contenido], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "facturas.csv";
    a.click();
  };

  // ✅ NUEVO: descarga PDF real
  const descargarPDF = async (numFactura: string) => {
  try {
    // 🔧 Arreglo: añadir prefijo QS si falta
    if (!numFactura.startsWith("QS")) {
      numFactura = "QS" + numFactura;
    }

    const res = await fetch(`${API_URL}/api/factura/pdf/${numFactura}`);

    if (!res.ok) {
      alert("Error descargando PDF");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `factura_${numFactura}.pdf`;
    a.click();

    window.URL.revokeObjectURL(url);
  } catch {
    alert("Error en descarga PDF");
  }
};

  // ✅ CAMBIO: botón superior ahora funciona
  const exportarPDF = () => {
    if (facturasFiltradas.length === 0) {
      alert("No hay facturas para exportar");
      return;
    }

    descargarPDF(facturasFiltradas[0].num_factura);
  };

  const formatearFecha = (f: string) =>
    new Date(f).toLocaleDateString("es-ES");

  const totalBase = facturasFiltradas.reduce(
    (sum, f) => sum + f.base_imponible,
    0
  );
  const totalFacturas = facturasFiltradas.reduce(
    (sum, f) => sum + f.total,
    0
  );

  //
  //  RENDER  
  //
  return (
  <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
    
    {/* HEADER */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Histórico de Facturas</h1>
        <p className="text-gray-600 mt-1">
          Consulta y gestiona el histórico de todas las facturas emitidas
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={exportarCSV}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Download size={18} />
          Descargar CSV
        </button>

        <button
          onClick={exportarPDF}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <FileDown size={18} />
          Descargar PDF
        </button>
      </div>
    </div>

    {/* ERRORES */}
    {errores.general && (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
        {errores.general}
      </div>
    )}

    {/* FILTROS */}
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
              placeholder="Nº factura o cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
          </div>

          {/* Mes */}
        <select
          value={mesFilter}
            onChange={(e) => setMesFilter(e.target.value === "" ? "" : Number(e.target.value))}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los meses</option>
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i + 1}>
              Mes {i + 1}
            </option>
          ))}
        </select>

          {/* Año */}
        <select
          value={anioFilter}
            onChange={(e) => setAnioFilter(e.target.value === "" ? "" : Number(e.target.value))}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los años</option>
          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

          {/* Botón Limpiar */}
          <button
            onClick={() => {
              setSearchTerm("");
              setMesFilter("");
              setAnioFilter("");
            }}
            className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Limpiar Filtros
          </button>
        </div>

        {/* Estadísticas de filtrado */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Mostrando <strong>{facturasFiltradas.length}</strong> de <strong>{facturas.length}</strong> facturas
          </p>
      </div>
    </div>

    {/* TABLA */}
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Cargando facturas...</p>
          </div>
      ) : facturasFiltradas.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">No se encontraron facturas con los filtros seleccionados</p>
        </div>
      ) : (
        <>
            <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Nº Factura</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Fecha</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Cliente</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700">Base Imponible</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700">Total</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {facturasFiltradas.map((f, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-blue-600">
                    {f.num_factura}
                  </td>
                  <td className="px-4 py-2">
                    {formatearFecha(f.fec_factura)}
                  </td>
                  <td className="px-4 py-2">{f.id_cliente}</td>
                  <td className="px-4 py-2 text-right">
                    {f.base_imponible.toFixed(2)} €
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {f.total.toFixed(2)} €
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => descargarPDF(f.num_factura)}
                      className="text-blue-600 hover:underline"
                    >
                      Descargar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>

          {/* TOTALES */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span>Total Base Imponible: <strong className="text-gray-900">{totalBase.toFixed(2)} €</strong></span>
                <span className="mx-4">|</span>
                <span>Total Facturas: <strong className="text-gray-900 text-lg text-blue-600">{totalFacturas.toFixed(2)} €</strong></span>
              </div>
          </div>
        </>
      )}
    </div>
  </div>
);
}