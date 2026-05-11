import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { appRoles, type AppRole } from "@/lib/auth/roles";
import { listAdminReservations, listAdminSchedules, listPublicRoutes } from "@/lib/booking/repository";
import { prisma } from "@/lib/db/prisma";
import { updateUserRoleAction } from "./actions";
import { LogoutButton } from "./logout-button";

type AdminPageProps = {
  searchParams?: Promise<{
    notice?: string;
  }>;
};

const roleLabels: Record<AppRole, string> = {
  ADMIN: "Administrador",
  SECRETARY: "Secretaria",
  DRIVER: "Chofer",
  USER: "Usuario"
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const user = await getCurrentAdminOrRedirect();
  const params = await searchParams;
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
  const [routes, schedules, reservations] = await Promise.all([
    listPublicRoutes(),
    listAdminSchedules(),
    listAdminReservations()
  ]);

  return (
    <AdminShell title="Panel de turismo y transporte" action={<LogoutButton />} notice={params?.notice}>
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
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {users.map((listedUser) => (
              <tr key={listedUser.id}>
                <td>{listedUser.email}</td>
                <td>{listedUser.name ?? "-"}</td>
                <td>{roleLabels[(listedUser.role as AppRole)] ?? listedUser.role}</td>
                <td>{listedUser.isActive ? "Activo" : "Inactivo"}</td>
                <td>
                  <form className="table-actions" action={updateUserRoleAction}>
                    <input type="hidden" name="id" value={listedUser.id} />
                    <select name="role" defaultValue={listedUser.role} aria-label={`Rol de ${listedUser.email}`}>
                      {appRoles.map((role) => (
                        <option key={role} value={role}>
                          {roleLabels[role]}
                        </option>
                      ))}
                    </select>
                    <button className="ghost-button" type="submit" disabled={listedUser.id === user.id}>
                      Guardar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
