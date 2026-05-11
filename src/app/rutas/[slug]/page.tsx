import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { formatPrice, getRouteBySlug } from "@/lib/travel-data";

type RouteDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function RouteDetailPage({ params }: RouteDetailPageProps) {
  const { slug } = await params;
  const route = getRouteBySlug(slug);

  if (!route) {
    notFound();
  }

  return (
    <>
      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">{route.category} · {route.duration}</p>
              <h1 className="display-title">
                {route.from} → <em>{route.to}</em>
              </h1>
              <p className="lead">{route.description}</p>
              <div className="hero-actions">
                <Link className="cream-button" href={`/reservar/${route.slug}`}>
                  Reservar asiento
                </Link>
                <Link className="ghost-button" href="/rutas">
                  Volver a rutas
                </Link>
              </div>
            </div>
            <div className="booking-dock">
              <div className="dock-field">
                <span>Via</span>
                <strong>{route.via}</strong>
              </div>
              <div className="dock-field">
                <span>Duracion</span>
                <strong>{route.duration}</strong>
              </div>
              <div className="dock-field">
                <span>Frecuencia</span>
                <strong>{route.frequency}</strong>
              </div>
              <div className="dock-field">
                <span>Desde</span>
                <strong>{formatPrice(route.price)}</strong>
              </div>
              <Link className="button" href={`/reservar/${route.slug}`}>
                Continuar
              </Link>
            </div>
          </div>
        </section>

        <section className="page-shell section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Itinerario</p>
              <h2 className="section-title">Paradas del recorrido.</h2>
            </div>
            <p className="lead">Este detalle será la base del flujo mobile y web de reservas.</p>
          </div>
          <div className="lake-grid">
            {route.stops.map((stop, index) => (
              <div className="lake-card" key={`${stop.name}-${index}`}>
                <small>0{index + 1} · km {stop.km}</small>
                <strong>{stop.name}</strong>
                <p className="muted">{stop.note} · +{stop.minutes}m</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
