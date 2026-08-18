import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Araucana | Agencia de viajes desde 2009",
  description: "Viajes, traslados y experiencias en la Patagonia Argentina."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <nav className="site-nav">
            <Link className="brand-link" href="/">
              <img className="brand-logo" src="/logo.png" alt="La Araucana Viajes" />
              <span className="brand-kicker">Agencia de viajes desde 2009</span>
            </Link>
            <div className="nav-links">
              <Link href="/rutas" prefetch={true}>Opciones de rutas</Link>
              <Link href="#reservas">Reservá tu traslado</Link>
              <Link href="/soporte">Soporte</Link>
            </div>
            <div className="nav-actions">
              <span className="languages">ES <span>EN</span> <span>PT</span></span>
              <Link className="admin-link" href="/login">Admin</Link>
              <Link className="cream-button" href="/rutas" prefetch={true}>
                Reservar
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
