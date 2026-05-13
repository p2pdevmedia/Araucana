import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { listPublicRoutes, listSchedulesForRoute } from "@/lib/booking/repository";

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

async function getRoutesWithScheduleCount() {
  const routes = await listPublicRoutes();
  const schedules = await Promise.all(routes.map((route) => listSchedulesForRoute(route.id)));

  return routes.map((route, index) => ({
    ...route,
    scheduleCount: schedules[index]?.length ?? 0
  }));
}

export default async function RoutesPage() {
  const routes = await getRoutesWithScheduleCount();

  return (
    <>
      <main className="page-shell section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Rutas y horarios</p>
            <h1 className="section-title">Elegí tu próximo tramo.</h1>
          </div>
          <Link className="button" href="#salidas">
            Buscar salidas
          </Link>
        </div>

        <form className="form-panel" action="/rutas">
          <label>
            Origen
            <select name="from" defaultValue="SMA">
              <option value="SMA">San Martin de los Andes</option>
              <option value="Bariloche">Bariloche</option>
              <option value="Villa La Angostura">Villa La Angostura</option>
            </select>
          </label>
          <label>
            Destino
            <select name="to" defaultValue="Bariloche">
              <option value="Bariloche">Bariloche</option>
              <option value="Villa La Angostura">Villa La Angostura</option>
              <option value="Pucon">Pucon (Chile)</option>
            </select>
          </label>
          <button className="button" type="submit">
            Buscar salidas
          </button>
        </form>

        <section className="section" id="salidas">
          <div className="route-grid">
            {routes.map((route) => (
              <Link className={`route-card ${route.featured ? "featured" : ""}`} href={`/rutas/${route.slug}`} key={route.id}>
                <div className="route-media" />
                <div className="route-body">
                  <span className="route-kicker">{route.category}</span>
                  <h2 className="route-title">
                    {route.from} → {route.to}
                  </h2>
                  <p className="muted">{route.via}</p>
                  <p>{route.description}</p>
                  <div className="route-meta">
                    <span>{formatDuration(route.durationMin)} · {route.scheduleCount} salidas disponibles</span>
                    <span className="price">{formatPrice(route.priceCents, route.currency)}</span>
                  </div>
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
