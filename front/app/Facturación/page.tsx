"use client";
import { useState } from "react";

export default function FacturacionPage() {
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [cliente, setCliente] = useState("");
  const [preview, setPreview] = useState(false);
  const [generada, setGenerada] = useState(false);

  const horas = 120;
  const tarifa = 25;
  const base = horas * tarifa;
  const iva = base * 0.21;
  const total = base + iva;

  const calcularFactura = () => {
    if (!mes || !anio || !cliente) return;
    setPreview(true);
    setGenerada(false);
  };

  const generarFactura = () => {
    setGenerada(true);
  };

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

        {preview && !generada && (
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
            onChange={(e) => setMes(e.target.value)}
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
            onChange={(e) => setAnio(e.target.value)}
            className="border p-2 rounded w-40"
          >
            <option value="">Seleccionar Año</option>
            {Array.from({ length: 21 }, (_, i) => 2010 + i).map((y) => (
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
            <option value="CYC">CYC</option>
            <option value="ATOS">ATOS</option>
            <option value="META4">META4</option>
          </select>

          <button
            onClick={calcularFactura}
            className="bg-gray-800 text-white px-4 rounded hover:bg-gray-900"
          >
            Calcular
          </button>
        </div>

        {preview && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Previsualización</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <p><strong>Cliente:</strong> {cliente}</p>
              <p><strong>Periodo:</strong> {mes}/{anio}</p>
              <p><strong>Total Horas:</strong> {horas} h</p>
              <p><strong>Tarifa media:</strong> {tarifa} €</p>
              <p><strong>Base imponible:</strong> {base.toFixed(2)} €</p>
              <p><strong>IVA (21%):</strong> {iva.toFixed(2)} €</p>
            </div>

            <div className="mt-6 text-xl font-bold">
              Total Factura: {total.toFixed(2)} €
            </div>

            {generada && (
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