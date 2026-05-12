import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { listAdminReservations, listAdminSchedules, listPublicRoutes } from "@/lib/booking/repository";
import { LogoutButton } from "./logout-button";

type AdminPageProps = {
  searchParams?: Promise<{
    notice?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const user = await getCurrentAdminOrRedirect();
  const params = await searchParams;
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

      <section className="admin-grid">
        <Link className="admin-card admin-link-card" href="/admin/secretarias">
          <span className="muted">Usuarios de reservas</span>
          <strong>Secretarias</strong>
        </Link>
        <Link className="admin-card admin-link-card" href="/admin/choferes">
          <span className="muted">Usuarios de app chofer</span>
          <strong>Choferes</strong>
        </Link>
      </section>
    </AdminShell>
  );
}
