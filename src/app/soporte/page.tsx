import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

export default function SupportPage() {
  return (
    <>
      <main className="page-shell section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Soporte</p>
            <h1 className="section-title">Ayuda para pasajeros y operaciones.</h1>
          </div>
          <Link className="button" href="/rutas">
            Ver rutas
          </Link>
        </div>
        <div className="stats-grid">
          {["Cambios de fecha", "Reembolsos", "Documentos Chile", "WhatsApp 24/7"].map((item) => (
            <div className="plain-card" key={item}>
              <h2>{item}</h2>
              <p className="muted">Seccion preparada para contenido editable desde admin.</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
