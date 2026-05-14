import Link from "next/link";
import type { CSSProperties } from "react";
import laninWinter from "../../lanin-invierno.jpeg";
import laninSummer from "../../lanin-verano.jpeg";
import { SiteFooter } from "@/components/site-footer";
import { listPublicRoutes, listSchedulesForRoute } from "@/lib/booking/repository";
import type { PublicRouteDto, ScheduleOptionDto } from "@/lib/booking/types";

export const revalidate = 300;

type RouteStop = {
  name: string;
  km: number;
  minutes: number;
  note: string;
};

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (!hours) {
    return `${remainder} min`;
  }

  return remainder ? `${hours} h ${remainder} min` : `${hours} h`;
}

function formatPrice(cents: number, currency: string) {
  if (cents <= 0) {
    return "Consultar";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

function normalizeStops(stops: unknown): RouteStop[] {
  if (!Array.isArray(stops)) {
    return [];
  }

  return stops
    .map((stop) => {
      if (!stop || typeof stop !== "object") {
        return null;
      }

      const item = stop as { name?: unknown; km?: unknown; minutes?: unknown; note?: unknown };
      return {
        name: String(item.name ?? ""),
        km: Number(item.km ?? 0),
        minutes: Number(item.minutes ?? 0),
        note: String(item.note ?? "")
      };
    })
    .filter((stop): stop is RouteStop => Boolean(stop?.name));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Argentina/Salta"
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Salta"
  }).format(date);
}

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Argentina/Salta"
  }).format(date);
}

function scheduleSummary(schedules: ScheduleOptionDto[]) {
  if (!schedules.length) {
    return {
      dateRange: "Sin salidas",
      dayCount: 0,
      firstTime: "Sin horario"
    };
  }

  const sorted = [...schedules].sort((left, right) => left.departureAt.getTime() - right.departureAt.getTime());
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  return {
    dateRange: `${formatDate(first.departureAt)} - ${formatDate(last.departureAt)}`,
    dayCount: new Set(sorted.map((schedule) => dateKey(schedule.departureAt))).size,
    firstTime: formatTime(first.departureAt)
  };
}

function destinationEyebrow(routes: PublicRouteDto[]) {
  const names = Array.from(new Set(routes.flatMap((route) => [route.from, route.to]))).slice(0, 3);
  return names.length ? names.join(" · ") : "Rutas publicadas";
}

export default async function HomePage() {
  const routes = await listPublicRoutes();
  const schedulePairs = await Promise.all(routes.map(async (route) => [route.id, await listSchedulesForRoute(route.id)] as const));
  const schedulesByRoute = new Map(schedulePairs);
  const allSchedules = schedulePairs.flatMap(([, schedules]) => schedules);
  const featured = routes.find((route) => route.featured) ?? routes[0];
  const secondaryRoutes = featured ? routes.filter((route) => route.id !== featured.id).slice(0, 4) : [];
  const featuredSchedules = featured ? (schedulesByRoute.get(featured.id) ?? []) : [];
  const featuredSummary = scheduleSummary(featuredSchedules);
  const globalSummary = scheduleSummary(allSchedules);
  const featuredStops = featured ? normalizeStops(featured.stops) : [];
  const secondaryCtaRoute = secondaryRoutes[0];
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
            <p className="eyebrow">{destinationEyebrow(routes)}</p>
            <h1 className="display-title">
              El placer de viajar por <em>la cordillera.</em>
            </h1>
            <p className="lead">
              Transporte turistico regular por la Patagonia andina, con salidas,
              paradas y disponibilidad publicadas desde la base de datos.
            </p>
            <div className="hero-actions">
              <Link className="cream-button" href="/rutas" prefetch={true}>
                Ver rutas y horarios
              </Link>
              <Link className="ghost-button" href="/rutas" prefetch={true}>
                Reservar online
              </Link>
            </div>
          </div>

          <form className="booking-dock" action="/rutas">
            <label className="dock-field">
              <span>Desde</span>
              <strong>{featured?.from ?? "Origen"}</strong>
            </label>
            <label className="dock-field">
              <span>Hacia</span>
              <strong>{featured?.to ?? "Destino"}</strong>
            </label>
            <label className="dock-field">
              <span>Temporada</span>
              <strong>{featuredSummary.dateRange}</strong>
            </label>
            <label className="dock-field">
              <span>Primera salida</span>
              <strong>{featuredSummary.firstTime}</strong>
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
              Conectamos la region con viajeros que vienen a
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
              <strong>{globalSummary.dayCount}</strong>
              <span>dias con salidas</span>
            </div>
          </div>
        </section>

        <section className="page-shell section" id="rutas">
          <div className="section-head">
            <div>
              <p className="eyebrow">Rutas regulares</p>
              <h2 className="section-title">Una cordillera de posibilidades.</h2>
            </div>
            <Link className="button" href="/rutas" prefetch={true}>
              Ver todas
            </Link>
          </div>

          {featured ? (
            <div className="route-grid">
              <Link className="route-card featured" href={`/rutas/${featured.slug}`} prefetch={true}>
                <div className="route-media" />
                <div className="route-body">
                  <span className="route-kicker">Ruta destacada</span>
                  <h3 className="route-title">
                    {featured.from} → {featured.to}
                  </h3>
                  <p className="muted">{featured.via}</p>
                  <div className="route-meta">
                    <span>{formatDuration(featured.durationMin)} · {featuredSchedules.length} salidas</span>
                    <span className="price">{formatPrice(featured.priceCents, featured.currency)}</span>
                  </div>
                </div>
              </Link>

              {secondaryRoutes.map((route) => {
                const routeSchedules = schedulesByRoute.get(route.id) ?? [];

                return (
                  <Link className="route-card" href={`/rutas/${route.slug}`} key={route.id} prefetch={true}>
                    <div className="route-media" />
                    <div className="route-body">
                      <span className="route-kicker">{route.category}</span>
                      <h3 className="route-title">
                        {route.from} → {route.to}
                      </h3>
                      <p className="muted">{route.via}</p>
                      <div className="route-meta">
                        <span>{formatDuration(route.durationMin)} · {routeSchedules.length} salidas</span>
                        <span className="price">{formatPrice(route.priceCents, route.currency)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="lead">No hay rutas activas publicadas por ahora.</p>
          )}
        </section>

        {featured ? (
          <section className="page-shell section">
            <div className="feature-grid">
              <div>
                <p className="eyebrow">El itinerario</p>
                <h2 className="section-title">
                  {featured.from} a {featured.to}.
                </h2>
                <p className="lead">{featured.description}</p>
                <div className="inline-actions">
                  <Link className="button" href={`/rutas/${featured.slug}`} prefetch={true}>
                    Ver detalle
                  </Link>
                  {secondaryCtaRoute ? (
                    <Link className="ghost-button" href={`/rutas/${secondaryCtaRoute.slug}`} prefetch={true}>
                      Otra ruta
                    </Link>
                  ) : null}
                </div>
              </div>
              <div className="lake-grid">
                {featuredStops.map((stop, index) => (
                  <div className="lake-card" key={`${stop.name}-${index}`}>
                    <small>0{index + 1} · +{stop.minutes}m</small>
                    <strong>{stop.name}</strong>
                    <p className="muted">{stop.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="dark-band crossing-band section" style={crossingStyle}>
          <div className="page-shell split">
            <div>
              <p className="eyebrow">Salidas publicadas</p>
              <h2 className="section-title">{globalSummary.dateRange}</h2>
              <p className="lead">
                La grilla de rutas, horarios, disponibilidad y paradas se lee
                desde la base de datos para mantener la demo alineada con el
                panel de administracion.
              </p>
              <Link className="cream-button" href="/rutas" prefetch={true}>
                Ver salidas
              </Link>
            </div>
            <div className="plain-card">
              <p className="eyebrow">Reserva web</p>
              <h3 className="route-title">Reserva y confirma tu asiento online.</h3>
              <p className="muted">
                Elegi ruta, salida y asiento desde la web para completar tu
                reserva en pocos pasos, con ticket y QR listos para embarcar.
              </p>
              <Link className="button" href="/rutas" prefetch={true}>
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
