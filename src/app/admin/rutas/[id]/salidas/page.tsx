import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { listAdminSchedules } from "@/lib/booking/repository";
import { prisma } from "@/lib/db/prisma";

type RouteSchedulesPageProps = {
  params: Promise<{ id: string }>;
};

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "America/Argentina/Salta"
});

const shortDateFormatter = new Intl.DateTimeFormat("es-AR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: "America/Argentina/Salta"
});

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Argentina/Salta"
});

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Salta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function dateKey(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Salta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(value);
}

function statusLabel(status: string) {
  return { OPEN: "Abierta", DOCUMENTATION: "Documentación", CLOSED: "Cerrada" }[status] ?? status;
}

export default async function RouteSchedulesPage({ params }: RouteSchedulesPageProps) {
  await getCurrentAdminOrRedirect();
  const { id } = await params;
  const [route, schedules] = await Promise.all([
    prisma.travelRoute.findUnique({ where: { id }, select: { id: true, from: true, to: true, via: true, category: true } }),
    listAdminSchedules()
  ]);

  if (!route) {
    notFound();
  }

  const routeSchedules = schedules.filter((schedule) => schedule.routeId === route.id);
  const today = todayKey();
  const upcomingSchedules = routeSchedules.filter((schedule) => dateKey(schedule.departureAt) >= today);
  const nextSchedule = upcomingSchedules[0];
  const openSchedules = routeSchedules.filter((schedule) => schedule.status === "OPEN" || schedule.status === "DOCUMENTATION").length;
  const availableSeats = routeSchedules.reduce((total, schedule) => total + schedule.availableSeats, 0);
  const totalSeats = routeSchedules.reduce((total, schedule) => total + schedule.totalSeats, 0);

  return (
    <AdminShell
      title={`${route.from} → ${route.to}`}
      eyebrow="Salidas de la ruta"
      action={
        <div className="inline-actions">
          <Link className="ghost-button" href="/admin/rutas">Volver a rutas</Link>
          <Link className="button" href={`/admin/salidas/nueva?routeId=${route.id}`}>Agregar salida</Link>
        </div>
      }
    >
      <section className="route-schedule-hero">
        <div>
          <p className="eyebrow">{route.category} · {route.via}</p>
          <h2>Todo el movimiento de esta ruta, en un solo lugar.</h2>
          <p>Consultá el calendario completo, controlá los cupos disponibles y abrí cualquier salida para editarla.</p>
        </div>
        <div className="route-schedule-next">
          <span>Próxima salida</span>
          {nextSchedule ? (
            <>
              <strong>{shortDateFormatter.format(nextSchedule.departureAt)} · {timeFormatter.format(nextSchedule.departureAt)}</strong>
              <small>{nextSchedule.availableSeats} de {nextSchedule.totalSeats} asientos libres</small>
            </>
          ) : <strong>No hay salidas futuras</strong>}
        </div>
      </section>

      <section className="route-schedule-stats" aria-label="Resumen de salidas">
        <div><span>Total programadas</span><strong>{routeSchedules.length}</strong><small>Histórico completo</small></div>
        <div><span>Desde hoy</span><strong>{upcomingSchedules.length}</strong><small>Incluye las de hoy</small></div>
        <div><span>Disponibles</span><strong>{openSchedules}</strong><small>Abiertas o en documentación</small></div>
        <div><span>Cupos libres</span><strong>{availableSeats}/{totalSeats}</strong><small>Sumatoria de la ruta</small></div>
      </section>

      <section className="plain-card admin-section route-schedule-list">
        <div className="admin-edit-head">
          <div>
            <p className="eyebrow">Calendario operativo</p>
            <h2>Listado de salidas</h2>
          </div>
          <span className="status-pill active">{routeSchedules.length} registros</span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Fecha</th><th>Salida</th><th>Llegada</th><th>Asientos</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>
              {routeSchedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td><strong>{dateFormatter.format(schedule.departureAt)}</strong></td>
                  <td>{timeFormatter.format(schedule.departureAt)}</td>
                  <td>{timeFormatter.format(schedule.arrivalAt)}</td>
                  <td><span className="seat-availability"><b>{schedule.availableSeats}</b>/{schedule.totalSeats} libres</span></td>
                  <td><span className={`status-pill ${schedule.status === "CLOSED" ? "inactive" : "active"}`}>{statusLabel(schedule.status)}</span></td>
                  <td><Link className="ghost-button" href={`/admin/salidas/${schedule.id}`}>Editar salida</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
