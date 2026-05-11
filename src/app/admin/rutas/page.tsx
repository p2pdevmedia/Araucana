import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { listAdminRoutes } from "@/lib/booking/repository";
import { createRouteAction, deleteRouteAction, setRouteActiveAction, updateRouteAction } from "./actions";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

function stopsToText(stops: unknown) {
  if (!Array.isArray(stops)) {
    return "";
  }

  return stops
    .map((stop) => {
      if (!stop || typeof stop !== "object") {
        return "";
      }

      const item = stop as { name?: unknown; km?: unknown; minutes?: unknown; note?: unknown };
      return [item.name, item.km, item.minutes, item.note].map((value) => String(value ?? "")).join(" | ");
    })
    .filter(Boolean)
    .join("\n");
}

export default async function AdminRoutesPage() {
  await getCurrentAdminOrRedirect();
  const routes = await listAdminRoutes();

  return (
    <AdminShell title="Rutas" action={<Link className="button" href="/rutas">Ver publico</Link>}>
      <section className="plain-card admin-section">
        <h2>Nueva ruta</h2>
        <form className="admin-form-grid" action={createRouteAction}>
          <label>
            Origen
            <input name="from" placeholder="SMA" required />
          </label>
          <label>
            Destino
            <input name="to" placeholder="Bariloche" required />
          </label>
          <label>
            Via
            <input name="via" placeholder="Ruta 40" required />
          </label>
          <label>
            Slug publico
            <input name="slug" placeholder="sma-bariloche" />
          </label>
          <label>
            Duracion (min)
            <input name="durationMin" type="number" min="1" required />
          </label>
          <label>
            Precio
            <input name="price" type="number" min="1" step="1" required />
          </label>
          <label>
            Moneda
            <input name="currency" defaultValue="ARS" required />
          </label>
          <label>
            Categoria
            <input name="category" defaultValue="Argentina" required />
          </label>
          <label className="span-2">
            Descripcion
            <textarea name="description" rows={3} />
          </label>
          <label className="span-2">
            Paradas (Nombre | km | minutos | nota)
            <textarea name="stops" rows={4} />
          </label>
          <label className="checkbox-row">
            <input name="featured" type="checkbox" />
            Destacada
          </label>
          <label className="checkbox-row">
            <input name="isActive" type="checkbox" defaultChecked />
            Activa
          </label>
          <button className="button" type="submit">Crear ruta</button>
        </form>
      </section>

      <section className="admin-edit-list">
        {routes.map((route) => (
          <article className="plain-card admin-edit-card" key={route.id}>
            <div className="admin-edit-head">
              <div>
                <span className="muted">{route.slug}</span>
                <h2>{route.from} → {route.to}</h2>
              </div>
              <span className={`status-pill ${route.isActive ? "active" : "inactive"}`}>
                {route.isActive ? "Activa" : "Inactiva"}
              </span>
            </div>

            <form className="admin-form-grid" action={updateRouteAction}>
              <input type="hidden" name="id" value={route.id} />
              <label>
                Origen
                <input name="from" defaultValue={route.from} required />
              </label>
              <label>
                Destino
                <input name="to" defaultValue={route.to} required />
              </label>
              <label>
                Via
                <input name="via" defaultValue={route.via} required />
              </label>
              <label>
                Slug publico
                <input name="slug" defaultValue={route.slug} required />
              </label>
              <label>
                Duracion (min)
                <input name="durationMin" type="number" min="1" defaultValue={route.durationMin} required />
              </label>
              <label>
                Precio
                <input name="price" type="number" min="1" step="1" defaultValue={route.price} required />
              </label>
              <label>
                Moneda
                <input name="currency" defaultValue={route.currency} required />
              </label>
              <label>
                Categoria
                <input name="category" defaultValue={route.category} required />
              </label>
              <label className="span-2">
                Descripcion
                <textarea name="description" rows={3} defaultValue={route.description} />
              </label>
              <label className="span-2">
                Paradas (Nombre | km | minutos | nota)
                <textarea name="stops" rows={4} defaultValue={stopsToText(route.stops)} />
              </label>
              <label className="checkbox-row">
                <input name="featured" type="checkbox" defaultChecked={route.featured} />
                Destacada
              </label>
              <label className="checkbox-row">
                <input name="isActive" type="checkbox" defaultChecked={route.isActive} />
                Activa
              </label>
              <button className="button" type="submit">Guardar cambios</button>
            </form>

            <div className="compact-actions">
              <span className="muted">
                {formatPrice(route.priceCents, route.currency)} · {route.scheduleCount} salidas
              </span>
              <form action={setRouteActiveAction}>
                <input type="hidden" name="id" value={route.id} />
                <input type="hidden" name="isActive" value={route.isActive ? "false" : "true"} />
                <button className="ghost-button" type="submit">
                  {route.isActive ? "Poner inactiva" : "Activar"}
                </button>
              </form>
              <form action={deleteRouteAction}>
                <input type="hidden" name="id" value={route.id} />
                <button className="danger-button" type="submit">Borrar</button>
              </form>
              {route.isActive ? <Link href={`/rutas/${route.slug}`}>Abrir publica</Link> : null}
            </div>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}
