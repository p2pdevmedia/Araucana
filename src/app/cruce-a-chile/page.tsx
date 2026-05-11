import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { routes } from "@/lib/travel-data";

const chileRoutes = routes.filter((route) => route.category === "Chile");

export default function ChileCrossingPage() {
  return (
    <>
      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">Cruce internacional</p>
              <h1 className="display-title">
                Argentina y <em>Chile</em>, conectados.
              </h1>
              <p className="lead">
                Centralizamos rutas, documentacion y asistencia de frontera
                para que el pasajero sepa que necesita antes de viajar.
              </p>
              <Link className="cream-button" href="/rutas">
                Ver salidas a Chile
              </Link>
            </div>
          </div>
        </section>

        <section className="page-shell section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Documentacion</p>
              <h2 className="section-title">Lo que vamos a pedir en la app.</h2>
            </div>
          </div>
          <div className="stats-grid">
            {["DNI o pasaporte vigente", "PDI Chile pre-aviso", "Tarjeta de embarque", "Seguro de viaje recomendado"].map((item) => (
              <div className="plain-card" key={item}>
                <h3>{item}</h3>
                <p className="muted">Estado visible para pasajero y panel administrativo.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="page-shell section">
          <div className="route-grid">
            {chileRoutes.map((route) => (
              <Link className="route-card" href={`/rutas/${route.slug}`} key={route.id}>
                <div className="route-media" />
                <div className="route-body">
                  <span className="route-kicker">Chile</span>
                  <h2 className="route-title">{route.from} → {route.to}</h2>
                  <p className="muted">{route.via} · {route.frequency}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
