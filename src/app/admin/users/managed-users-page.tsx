import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { getManagedUserConfig, getManagedUserPath, type ManagedUserRole } from "@/lib/admin/users";
import { formatCurrency } from "@/lib/admin/salary";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { deleteManagedUserAction, setManagedUserActiveAction } from "./actions";

type ManagedUsersPageProps = {
  role: ManagedUserRole;
  notice?: string;
};

export async function ManagedUsersPage({ role, notice }: ManagedUsersPageProps) {
  await getCurrentAdminOrRedirect();

  const config = getManagedUserConfig(role);
  const users = await prisma.user.findMany({
    where: { role },
    orderBy: [{ isActive: "desc" }, { name: "asc" }, { email: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      monthlySalaryCents: true,
      salaryCurrency: true,
      createdAt: true
    }
  });
  const activeUsers = users.filter((user) => user.isActive);
  const emptyText = role === "SECRETARY"
    ? "Todavia no hay secretarias cargadas."
    : "Todavia no hay choferes cargados.";

  return (
    <AdminShell
      title={config.title}
      notice={notice}
      action={<Link className="button" href={getManagedUserPath(role, "/nueva")}>{config.newLabel}</Link>}
    >
      <section className="admin-grid">
        <div className="admin-card">
          <span className="muted">Activos</span>
          <strong>{activeUsers.length}</strong>
        </div>
        <div className="admin-card">
          <span className="muted">Total</span>
          <strong>{users.length}</strong>
        </div>
        <div className="admin-card">
          <span className="muted">Rol</span>
          <strong>{role === "DRIVER" ? "Chofer" : "Secretaria"}</strong>
        </div>
      </section>

      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Sueldo</th>
            <th>Alta</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name ?? "-"}</td>
              <td>{user.email}</td>
              <td>{formatCurrency(user.monthlySalaryCents, user.salaryCurrency)}</td>
              <td>{user.createdAt.toLocaleDateString("es-AR")}</td>
              <td>
                <span className={`status-pill ${user.isActive ? "active" : "inactive"}`}>
                  {user.isActive ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <Link className="ghost-button" href={getManagedUserPath(role, `/${user.id}`)}>Editar</Link>
                  <form action={setManagedUserActiveAction}>
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="role" value={role} />
                    <input type="hidden" name="isActive" value={user.isActive ? "false" : "true"} />
                    <button className="ghost-button" type="submit">
                      {user.isActive ? "Desactivar" : "Activar"}
                    </button>
                  </form>
                  <form action={deleteManagedUserAction}>
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="role" value={role} />
                    <button className="danger-button" type="submit">Eliminar</button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 ? (
            <tr>
              <td colSpan={6}>{emptyText}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </AdminShell>
  );
}
