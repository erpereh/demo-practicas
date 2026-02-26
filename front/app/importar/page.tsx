"use client";


import { useState, useRef } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";

export default function ImportarPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const API = "http://localhost:5000";

  const handlePreview = async () => {
    if (!file) return alert("Selecciona un archivo primero");

    const formData = new FormData();
    formData.append("archivo", file);

    setLoading(true);

    try {
      const res = await fetch(`${API}/preview-horas`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      setPreview(data);
    } catch {
      alert("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
    const res = await fetch(`${API}/confirm-horas`, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error al registrar horas");
      return;
    }

    // ✅ Mostrar mensaje de éxito
    alert(data.mensaje);

    // ✅ Limpiar estados
    setPreview(null);
    setFile(null);
    setFileName("");

    // ✅ Limpiar el input file para permitir volver a subir el mismo archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

  } catch {
    alert("Error de conexión con el servidor");
  }
};

  return (
    <div className="p-10 max-w-7xl mx-auto relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-quality-dark tracking-tight">
            Importar Excel
          </h1>
          <p className="text-gray-500 mt-1">
            Sube el Excel mensual de horas trabajadas.
          </p>
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
            {fileName
              ? `Archivo: ${fileName}`
              : "Haz clic para seleccionar un Excel (.xlsx)"
            }
          </span>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            ref={fileInputRef}   // ✅ añade esto
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              setFile(selected);
              setFileName(selected?.name || "");
            }}
/>
        </label>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="bg-quality-red hover:bg-[#C20017] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md"
          >
            {loading ? "Procesando..." : "Previsualizar"}
          </button>
        </div>
      </div>

      {preview && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <p className="font-semibold text-quality-dark mb-2">
            Resumen de importación
          </p>

          <p>Total filas: {preview.total_filas}</p>
          <p>Filas válidas: {preview.filas_validas}</p>
          <p className="font-semibold text-green-600">
            Se importarán {preview.total_horas} horas
          </p>

          {preview.errores?.length > 0 && (
            <div className="mt-4 text-red-600">
              <p className="font-semibold">Errores detectados:</p>
              <ul className="list-disc ml-6">
                {preview.errores.map((e: any, i: number) => (
                  <li key={i}>
                    Fila {e.fila}: {e.mensaje}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleConfirm}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md"
            >
              Confirmar y registrar horas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}