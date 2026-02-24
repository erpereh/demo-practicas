import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="p-10 flex flex-col items-center justify-center h-full min-h-screen bg-white">

      <div className="max-w-2xl text-center flex flex-col items-center">
        {/* LOGO CENTRAL */}
        <Image
          src="/icon.png"
          alt="Logo Quality Consulting"
          width={400}
          height={150}
          className="w-auto h-20 object-contain mb-10"
          priority
        />

        <h1 className="text-4xl md:text-5xl font-bold text-quality-dark mb-6 tracking-tight">
          Gestión integral de <br />
          <span className="text-quality-red">recursos y consultoría</span>
        </h1>

        <p className="text-quality-gray text-lg mb-10 max-w-xl leading-relaxed">
          Bienvenido al portal interno. Selecciona una opción en el menú lateral o accede directamente al módulo de control horario.
        </p>

        {/* BOTÓN ESTILO CORPORATIVO (Igual al "Solicita una DEMO" de la imagen) */}
        <Link
          href="/importar"
          className="bg-quality-red hover:bg-[#C20017] text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
        >
          Ir a Importar Excel
          <ArrowRight size={20} />
        </Link>
      </div>

    </div>
  );
}