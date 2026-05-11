import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { listAdminSchedules } from "@/lib/booking/repository";
import { deleteScheduleAction, setScheduleStatusAction } from "./actions";

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

export default async function AdminSchedulesPage() {
  await getCurrentAdminOrRedirect();
  const schedules = await listAdminSchedules();

  return (
    <AdminShell title="Salidas" action={<Link className="button" href="/admin/salidas/nueva">Agregar salida</Link>}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Ruta</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Llegada</th>
            <th>Asientos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>{schedule.route}</td>
              <td>{dateFormatter.format(schedule.departureAt)}</td>
              <td>{timeFormatter.format(schedule.departureAt)}</td>
              <td>{timeFormatter.format(schedule.arrivalAt)}</td>
              <td>
                {schedule.availableSeats}/{schedule.totalSeats} disponibles
              </td>
              <td>
                <span className={`status-pill ${schedule.status === "CLOSED" ? "inactive" : "active"}`}>
                  {formatScheduleStatus(schedule.status)}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <Link className="ghost-button" href={`/admin/salidas/${schedule.id}`}>Editar</Link>
                  <form action={setScheduleStatusAction}>
                    <input type="hidden" name="id" value={schedule.id} />
                    <input type="hidden" name="status" value={schedule.status === "CLOSED" ? "OPEN" : "CLOSED"} />
                    <button className="ghost-button" type="submit">
                      {schedule.status === "CLOSED" ? "Activar" : "Inactivar"}
                    </button>
                  </form>
                  <form action={deleteScheduleAction}>
                    <input type="hidden" name="id" value={schedule.id} />
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
