import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { formatPrice, routes } from "@/lib/travel-data";

export default function RoutesPage() {
  return (
    <>
      <main className="page-shell section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Rutas y horarios</p>
            <h1 className="section-title">Elegí tu próximo tramo.</h1>
          </div>
          <Link className="button" href="/app">
            Ver flujo mobile
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

        <section className="section">
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
                    <span>{route.duration} · {route.frequency}</span>
                    <span className="price">{formatPrice(route.price)}</span>
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
