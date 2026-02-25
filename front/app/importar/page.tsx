"use client";

import { useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";

export default function ImportarPage() {
  const [fileName, setFileName] = useState("");

  return (
    <div className="p-10 max-w-7xl mx-auto relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-quality-dark tracking-tight">Importar Excel</h1>
          <p className="text-gray-500 mt-1">Sube el Excel mensual de horas trabajadas.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileSpreadsheet className="text-quality-red" size={22} />
          <p className="font-semibold text-quality-dark">Subir archivo</p>
        </div>

        <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:bg-gray-50 transition-colors">
          <Upload size={18} className="text-gray-500" />
          <span className="text-gray-600">
            {fileName ? `Archivo: ${fileName}` : "Haz clic para seleccionar un Excel (.xlsx)"}
          </span>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
          />
        </label>

        <div className="mt-6 flex justify-end">
          <button className="bg-quality-red hover:bg-[#C20017] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md">
            Previsualizar
          </button>
        </div>
      </div>
    </div>
  );
}