import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { formatPrice, routes } from "@/lib/travel-data";

export default async function AdminRoutesPage() {
  await getCurrentAdminOrRedirect();

  return (
    <AdminShell title="Rutas" action={<Link className="button" href="/rutas">Ver publico</Link>}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Ruta</th>
            <th>Via</th>
            <th>Frecuencia</th>
            <th>Precio</th>
            <th>Publica</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => (
            <tr key={route.id}>
              <td>{route.from} → {route.to}</td>
              <td>{route.via}</td>
              <td>{route.frequency}</td>
              <td>{formatPrice(route.price)}</td>
              <td><Link href={`/rutas/${route.slug}`}>Abrir</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminShell>
  );
}
