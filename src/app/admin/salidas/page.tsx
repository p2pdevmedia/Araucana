import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { listAdminRoutes, listAdminSchedules } from "@/lib/booking/repository";
import { prisma } from "@/lib/db/prisma";
import {
  createScheduleAction,
  deleteScheduleAction,
  setScheduleStatusAction,
  updateScheduleAction
} from "./actions";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
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

function formatScheduleStatus(status: string) {
  const labels: Record<string, string> = {
    OPEN: "Abierta",
    DOCUMENTATION: "Documentacion",
    CLOSED: "Cerrada"
  };

  return labels[status] ?? status;
}

function formatDateTimeInput(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Salta"
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export default async function AdminSchedulesPage() {
  await getCurrentAdminOrRedirect();
  const [schedules, routes, vehicles] = await Promise.all([
    listAdminSchedules(),
    listAdminRoutes(),
    prisma.vehicle.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            seats: true
          }
        }
      }
    })
  ]);

  return (
    <AdminShell title="Salidas">
      <section className="plain-card admin-section">
        <h2>Nueva salida</h2>
        <form className="admin-form-grid" action={createScheduleAction}>
          <label>
            Ruta
            <select name="routeId" required>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.from} → {route.to}{route.isActive ? "" : " (inactiva)"}
                </option>
              ))}
            </select>
          </label>
          <label>
            Vehiculo
            <select name="vehicleId" required>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} · {vehicle._count.seats} asientos
                </option>
              ))}
            </select>
          </label>
          <label>
            Fecha y hora
            <input name="departureAt" type="datetime-local" required />
          </label>
          <label>
            Estado
            <select name="status" defaultValue="OPEN" required>
              <option value="OPEN">Abierta</option>
              <option value="DOCUMENTATION">Documentacion</option>
              <option value="CLOSED">Inactiva / cerrada</option>
            </select>
          </label>
          <button className="button" type="submit">Crear salida</button>
        </form>
      </section>

      <section className="admin-edit-list">
        {schedules.map((schedule) => (
          <article className="plain-card admin-edit-card" key={schedule.id}>
            <div className="admin-edit-head">
              <div>
                <span className="muted">
                  {dateFormatter.format(schedule.departureAt)} · {timeFormatter.format(schedule.departureAt)}
                </span>
                <h2>{schedule.route}</h2>
              </div>
              <span className={`status-pill ${schedule.status === "CLOSED" ? "inactive" : "active"}`}>
                {formatScheduleStatus(schedule.status)}
              </span>
            </div>

            <form className="admin-form-grid" action={updateScheduleAction}>
              <input type="hidden" name="id" value={schedule.id} />
              <label>
                Ruta
                <select name="routeId" defaultValue={schedule.routeId} required>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.from} → {route.to}{route.isActive ? "" : " (inactiva)"}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Vehiculo
                <select name="vehicleId" defaultValue={schedule.vehicleId} required>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} · {vehicle._count.seats} asientos
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Fecha y hora
                <input
                  name="departureAt"
                  type="datetime-local"
                  defaultValue={formatDateTimeInput(schedule.departureAt)}
                  required
                />
              </label>
              <label>
                Estado
                <select name="status" defaultValue={schedule.status} required>
                  <option value="OPEN">Abierta</option>
                  <option value="DOCUMENTATION">Documentacion</option>
                  <option value="CLOSED">Inactiva / cerrada</option>
                </select>
              </label>
              <button className="button" type="submit">Guardar cambios</button>
            </form>

            <div className="compact-actions">
              <span className="muted">
                {schedule.availableSeats}/{schedule.totalSeats} disponibles · llega {timeFormatter.format(schedule.arrivalAt)}
              </span>
              <form action={setScheduleStatusAction}>
                <input type="hidden" name="id" value={schedule.id} />
                <input type="hidden" name="status" value={schedule.status === "CLOSED" ? "OPEN" : "CLOSED"} />
                <button className="ghost-button" type="submit">
                  {schedule.status === "CLOSED" ? "Activar" : "Poner inactiva"}
                </button>
              </form>
              <form action={deleteScheduleAction}>
                <input type="hidden" name="id" value={schedule.id} />
                <button className="danger-button" type="submit">Borrar</button>
              </form>
            </div>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}
