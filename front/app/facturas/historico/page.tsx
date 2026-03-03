"use client";

import { useState } from "react";

interface Factura {
  id: number;
  cliente: string;
  mes: string;
  año: number;
  total: number;
}

export default function HistoricoFacturas() {
  const [facturas] = useState<Factura[]>([
    { id: 1, cliente: "Cliente A", mes: "Enero", año: 2025, total: 3200 },
    { id: 2, cliente: "Cliente B", mes: "Febrero", año: 2025, total: 4100 },
  ]);

  return (
    <div style={{ padding: "30px" }}>
      <h1>Histórico de Facturas Emitidas</h1>

      <table border={1} cellPadding={10} style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Mes</th>
            <th>Año</th>
            <th>Total (€)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map((factura) => (
            <tr key={factura.id}>
              <td>{factura.id}</td>
              <td>{factura.cliente}</td>
              <td>{factura.mes}</td>
              <td>{factura.año}</td>
              <td>{factura.total}</td>
              <td>
                <button>Ver detalle</button>
                <button style={{ marginLeft: "10px" }}>Exportar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}