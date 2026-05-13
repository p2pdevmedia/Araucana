import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

export default function AppFlowPage() {
  return (
    <>
      <main className="page-shell section">
        <div className="split">
          <div>
            <p className="eyebrow">Flujo mobile-compatible</p>
            <h1 className="section-title">Buscar → detalle → asiento → reserva.</h1>
            <p className="lead">
              Esta pantalla deja conectado el recorrido que despues vamos a
              convertir en SwiftUI y Android usando la misma API.
            </p>
            <div className="inline-actions">
              <Link className="button" href="/rutas">
                Buscar viaje
              </Link>
              <Link className="ghost-button" href="/login">
                Entrar admin
              </Link>
            </div>
          </div>
          <div className="mobile-preview">
            <div className="phone-card">
              <div className="ticket-preview">
                <p className="eyebrow">Paso 2 de 4</p>
                <h2>Elegí tu asiento</h2>
                <p>SMA → Villa Traful · 02 ene · 10:00</p>
                <p className="price">Consultar</p>
              </div>
            </div>
          </div>
        </div>

        <section className="section">
          <div className="stats-grid">
            {[
              ["1", "Buscar", "Origen, destino, fecha y pasajeros"],
              ["2", "Detalle", "Ruta, paradas, duracion y precio"],
              ["3", "Asiento", "Mapa del coche y disponibilidad"],
              ["4", "Reserva", "Ticket QR y seguimiento"]
            ].map(([num, title, text]) => (
              <div className="stat-card" key={title}>
                <strong>{num}</strong>
                <span>{title}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
