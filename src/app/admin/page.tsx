import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { reservations, routes, schedules } from "@/lib/travel-data";
import { LogoutButton } from "./logout-button";

export default async function AdminPage() {
  const user = await getCurrentAdminOrRedirect();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true
    }
  });

  return (
    <AdminShell title="Panel de turismo y transporte" action={<LogoutButton />}>
      <div className="plain-card" style={{ marginBottom: 24 }}>
        <p className="eyebrow">Sesion activa</p>
        <p className="lead">Ingresaste como {user.email}. Este panel ya queda orientado a rutas, salidas y reservas.</p>
      </div>

      <section className="admin-grid">
        <div className="admin-card">
          <span className="muted">Rutas publicadas</span>
          <strong>{routes.length}</strong>
        </div>
        <div className="admin-card">
          <span className="muted">Salidas próximas</span>
          <strong>{schedules.length}</strong>
        </div>
        <div className="admin-card">
          <span className="muted">Reservas ejemplo</span>
          <strong>{reservations.length}</strong>
        </div>
      </section>

      <section className="plain-card">
        <h2>Usuarios</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((listedUser) => (
              <tr key={listedUser.id}>
                <td>{listedUser.email}</td>
                <td>{listedUser.name ?? "-"}</td>
                <td>{listedUser.role}</td>
                <td>{listedUser.isActive ? "Activo" : "Inactivo"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
