import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { listAdminRoutes } from "@/lib/booking/repository";
import { deleteRouteAction, setRouteActiveAction } from "./actions";

type AdminRoutesPageProps = {
  searchParams?: Promise<{
    notice?: string;
  }>;
};

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (!hours) {
    return `${remainder} min`;
  }

  return remainder ? `${hours} h ${remainder} min` : `${hours} h`;
}

export default async function AdminRoutesPage({ searchParams }: AdminRoutesPageProps) {
  await getCurrentAdminOrRedirect();
  const params = await searchParams;
  const routes = await listAdminRoutes();

  return (
    <AdminShell
      title="Rutas"
      notice={params?.notice}
      action={
        <div className="inline-actions">
          <Link className="ghost-button" href="/rutas">Ver publico</Link>
          <Link className="button" href="/admin/rutas/nueva">Agregar ruta</Link>
        </div>
      }
    >
      <table className="data-table">
        <thead>
          <tr>
            <th>Ruta</th>
            <th>Via</th>
            <th>Duracion</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Salidas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => (
            <tr key={route.id}>
              <td>{route.from} → {route.to}</td>
              <td>{route.via}</td>
              <td>{formatDuration(route.durationMin)}</td>
              <td>{formatPrice(route.priceCents, route.currency)}</td>
              <td>
                <span className={`status-pill ${route.isActive ? "active" : "inactive"}`}>
                  {route.isActive ? "Activa" : "Inactiva"}
                </span>
              </td>
              <td>{route.scheduleCount}</td>
              <td>
                <div className="table-actions">
                  <Link className="ghost-button" href={`/admin/rutas/${route.id}`}>Editar</Link>
                  <form action={setRouteActiveAction}>
                    <input type="hidden" name="id" value={route.id} />
                    <input type="hidden" name="isActive" value={route.isActive ? "false" : "true"} />
                    <button className="ghost-button" type="submit">
                      {route.isActive ? "Inactivar" : "Activar"}
                    </button>
                  </form>
                  <form action={deleteRouteAction}>
                    <input type="hidden" name="id" value={route.id} />
                    <button className="danger-button" type="submit">Borrar</button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminShell>
  );
}
