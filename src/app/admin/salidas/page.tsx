import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { listAdminSchedules } from "@/lib/booking/repository";

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
    <AdminShell title="Salidas">
      <table className="data-table">
        <thead>
          <tr>
            <th>Ruta</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Asientos</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>{schedule.route}</td>
              <td>{dateFormatter.format(schedule.departureAt)}</td>
              <td>{timeFormatter.format(schedule.departureAt)}</td>
              <td>
                {schedule.availableSeats}/{schedule.totalSeats} disponibles
              </td>
              <td>{formatScheduleStatus(schedule.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminShell>
  );
}
