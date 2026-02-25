import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

// Importamos el nuevo componente del menú lateral
import Sidebar from "./components/Sidebar";

// Configuramos la fuente corporativa
const montserrat = Montserrat({ subsets: ["latin"] });

// Metadatos de la página (lo que sale en la pestaña del navegador)
export const metadata: Metadata = {
  title: "Quality - Gestor de Horas",
  description: "Portal interno de gestión",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${montserrat.className} bg-quality-light flex h-screen overflow-hidden text-quality-dark`}>

        {/* MENÚ LATERAL DINÁMICO */}
        <Sidebar />

        {/* CONTENIDO PRINCIPAL (Aquí se cargan las páginas al hacer clic) */}
        <main className="flex-1 bg-quality-light overflow-y-auto">
          {children}
        </main>

      </body>
    </html>
  );
}