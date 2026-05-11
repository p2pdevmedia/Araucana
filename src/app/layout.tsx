import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import "./globals.css";

export const metadata: Metadata = {
  title: "Araucana Viajes",
  description: "Turismo y transporte en la Patagonia andina"
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
              <BrandMark color="#FBF6EB" size={38} />
              <span>
                <span className="brand-name">Araucana</span>
                <span className="brand-kicker">Viajes · desde 2009</span>
              </span>
            </Link>
            <div className="nav-links">
              <Link href="/rutas">Rutas</Link>
              <Link href="/rutas/sma-bariloche-7-lagos">7 Lagos</Link>
              <Link href="/cruce-a-chile">Cruce a Chile</Link>
              <Link href="/rutas">Reservas</Link>
              <Link href="/soporte">Soporte</Link>
            </div>
            <div className="nav-actions">
              <Link className="ghost-button" href="/login">
                Admin
              </Link>
              <Link className="cream-button" href="/rutas">
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
