import Link from "next/link";
import type { CSSProperties } from "react";
import laninWinter from "../../lanin-invierno.jpeg";
import laninSummer from "../../lanin-verano.jpeg";
import { SiteFooter } from "@/components/site-footer";
import { listPublicRoutes } from "@/lib/booking/repository";
import { lakes } from "@/lib/travel-data";

export const revalidate = 300;

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (!hours) {
    return `${remainder} min`;
  }

  return remainder ? `${hours} h ${remainder} min` : `${hours} h`;
}

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

export default async function HomePage() {
  const routes = await listPublicRoutes();
  const featured = routes.find((route) => route.featured) ?? routes[0];
  const secondaryRoutes = featured ? routes.filter((route) => route.id !== featured.id).slice(0, 4) : [];
  const heroStyle = {
    "--hero-image": `url(${laninWinter.src})`
  } as CSSProperties;
  const crossingStyle = {
    "--crossing-image": `url(${laninSummer.src})`
  } as CSSProperties;

  return (
    <>
      <section className="hero" style={heroStyle}>
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">San Martin de los Andes · Villa La Angostura · Bariloche</p>
            <h1 className="display-title">
              El placer de viajar por <em>la cordillera.</em>
            </h1>
            <p className="lead">
              Transporte turistico regular por la Patagonia andina, salidas por
              el Camino de los 7 Lagos y cruces internacionales a Chile con
              asistencia documental.
            </p>
            <div className="hero-actions">
              <Link className="cream-button" href="/rutas">
                Ver rutas y horarios
              </Link>
              <Link className="ghost-button" href="/rutas">
                Reservar online
              </Link>
            </div>
          </div>

          <form className="booking-dock" action="/rutas">
            <label className="dock-field">
              <span>Desde</span>
              <strong>San Martin de los Andes</strong>
            </label>
            <label className="dock-field">
              <span>Hacia</span>
              <strong>Bariloche</strong>
            </label>
            <label className="dock-field">
              <span>Fecha</span>
              <strong>Mar 12 nov</strong>
            </label>
            <label className="dock-field">
              <span>Pasajeros</span>
              <strong>2 adultos</strong>
            </label>
            <button className="button" type="submit">
              Buscar
            </button>
          </form>
        </div>
      </section>

      <main>
        <section className="page-shell section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Nuestra historia</p>
              <h2 className="section-title">Somos de San Martin.</h2>
            </div>
            <p className="lead">
              Hace 16 anos conectamos la region con viajeros que vienen a
              descubrir lagos, bosques, frontera y montana.
            </p>
          </div>
          <div className="stats-grid home-stats-grid">
            <div className="stat-card">
              <strong>16</strong>
              <span>anos de operacion</span>
            </div>
            <div className="stat-card">
              <strong>{routes.length}</strong>
              <span>rutas activas</span>
            </div>
            <div className="stat-card">
              <strong>3</strong>
              <span>pasos fronterizos</span>
            </div>
          </div>
        </section>

        <section className="page-shell section" id="rutas">
          <div className="section-head">
            <div>
              <p className="eyebrow">Rutas regulares</p>
              <h2 className="section-title">Una cordillera de posibilidades.</h2>
            </div>
            <Link className="button" href="/rutas">
              Ver todas
            </Link>
          </div>

          {featured ? (
            <div className="route-grid">
              <Link className="route-card featured" href={`/rutas/${featured.slug}`}>
                <div className="route-media" />
                <div className="route-body">
                  <span className="route-kicker">Ruta signature</span>
                  <h3 className="route-title">
                    {featured.from} → {featured.to}
                  </h3>
                  <p className="muted">{featured.via}</p>
                  <div className="route-meta">
                    <span>{formatDuration(featured.durationMin)}</span>
                    <span className="price">{formatPrice(featured.priceCents, featured.currency)}</span>
                  </div>
                </div>
              </Link>

              {secondaryRoutes.map((route) => (
                <Link className="route-card" href={`/rutas/${route.slug}`} key={route.id}>
                  <div className="route-media" />
                  <div className="route-body">
                    <span className="route-kicker">{route.category}</span>
                    <h3 className="route-title">
                      {route.from} → {route.to}
                    </h3>
                    <p className="muted">{route.via}</p>
                    <div className="route-meta">
                      <span>{formatDuration(route.durationMin)}</span>
                      <span className="price">{formatPrice(route.priceCents, route.currency)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="lead">No hay rutas activas publicadas por ahora.</p>
          )}
        </section>

        <section className="page-shell section">
          <div className="feature-grid">
            <div>
              <p className="eyebrow">El itinerario</p>
              <h2 className="section-title">Siete espejos de agua, una ruta.</h2>
              <p className="lead">
                Lacar, Machonico, Falkner, Villarino, Escondido, Correntoso y
                Espejo. Paradas estrategicas, asistencia a bordo y llegada a
                Bariloche por el corredor mas buscado de la Patagonia.
              </p>
              <div className="inline-actions">
                <Link className="button" href="/rutas/sma-bariloche-7-lagos">
                  Ver detalle
                </Link>
                <Link className="ghost-button" href="/cruce-a-chile">
                  Cruce a Chile
                </Link>
              </div>
            </div>
            <div className="lake-grid">
              {lakes.map((lake, index) => (
                <div className="lake-card" key={lake.name}>
                  <small>0{index + 1} · km {lake.km}</small>
                  <strong>{lake.name}</strong>
                  <p className="muted">{lake.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dark-band crossing-band section" style={crossingStyle}>
          <div className="page-shell split">
            <div>
              <p className="eyebrow">Cruce internacional</p>
              <h2 className="section-title">Cruza los Andes con habilitacion.</h2>
              <p className="lead">
                Pasos Mamuil Malal, Hua Hum y Cardenal Samore. Te acompanamos
                en aduana y centralizamos la informacion de documentos para que
                la experiencia sea simple.
              </p>
              <Link className="cream-button" href="/cruce-a-chile">
                Ver documentacion
              </Link>
            </div>
            <div className="plain-card">
              <p className="eyebrow">Reserva web</p>
              <h3 className="route-title">Reserva y confirma tu asiento online.</h3>
              <p className="muted">
                Elegi ruta, salida y asiento desde la web para completar tu
                reserva en pocos pasos, con ticket y QR listos para embarcar.
              </p>
              <Link className="button" href="/rutas">
                Reservar online
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
