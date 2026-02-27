"use client";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  X,
  Users,
  Loader2,
  AlertCircle,
  Edit,
} from "lucide-react";

type FacturaAPI = {
  id_sociedad: string;
  id_cliente: string;
  num_factura: string;
  fec_factura: Date;
  concepto: string;
  base_imponible: number;
  total: number;
};

async function parseFastApiError(res: Response) {
  try {
    const data = await res.json();
    if (Array.isArray(data.detail)) {
      return data.detail.map((d: any) => d.msg).join(" | ");
    }
    return data.detail || "Error";
  } catch {
    return "Error";
  }
}

export default function FacturasPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [facturas, setFacturas] = useState<FacturaAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // formulario
  const [idSociedad, setIdSociedad] = useState("01");
  const [idCliente, setIdCliente] = useState("");
  const [numFactura, setNumFactura] = useState("");
  const [fecFactura, setFecFactura] = useState<Date | null>(null);
  const [concepto, setConcepto] = useState("");
  const [baseImponible, setBaseImponible] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null); 
    
  // errores
  const [erroresGlobal, setErroresGlobal] = useState<{ general?: string }>({});
  const [erroresModal, setErroresModal] = useState<{ 
    id_sociedad?: string;
    id_cliente?: string;
    num_factura?: string;
    fec_factura?: Date;
    concepto?: Text;
    base_imponible?: number;
    total?: number;
  }>({}); 

  // modo edición
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const esEdicion = editandoId !== null;

  // ======================
  // 1) Cargar facturas
  // ======================
  const cargarFacturas = async () => {
    try {
      setIsLoading(true);
      setErroresGlobal({});
      const res = await fetch(`${API_URL}/api/facturas/`);
      if (!res.ok) {
        setErroresGlobal({ general: await parseFastApiError(res) });
        return;
      }
      setFacturas(await res.json());
    } catch (e) {
      setErroresGlobal({
        general: "No se pudo conectar con el servidor (¿backend encendido?).",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarFacturas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const facturasFiltradas = facturas.filter((f) => {
    const full = `${f.id_cliente} ${f.num_factura} ${f.concepto}`.toLowerCase();
    return (
      full.includes(searchTerm.toLowerCase()) ||
      f.num_factura.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // ======================
  // 2) Abrir / cerrar modal
  // ======================
  const abrirModalNuevo = () => {
    setIdSociedad("01");
    setIdCliente("");
    setNumFactura("");
    setFecFactura(null);
    setConcepto("");
    setBaseImponible(null);
    setTotal(null);
    setIsModalOpen(true);
  };

  const abrirModalEditar = (f: FacturaAPI) => {
    setEditandoId(f.num_factura);
    setErroresModal({});

    setIdSociedad(f.id_sociedad);
    setIdCliente(f.id_cliente);
    setNumFactura(f.num_factura);
    setFecFactura(f.fec_factura);
    setConcepto(f.concepto);
    setBaseImponible(f.base_imponible);
    setIsModalOpen(true);
  };

  const cerrarModalFactura = () => {
  setIsModalOpen(false);
  setErroresModal({});
  setEditandoId(null);

  setIdSociedad("");
  setIdCliente("");
  setNumFactura("");
  setFecFactura(null);
  setConcepto("");
  setBaseImponible(null);
  setTotal(null);
};
}