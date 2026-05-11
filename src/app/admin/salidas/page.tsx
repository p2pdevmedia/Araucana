import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { schedules } from "@/lib/travel-data";

export default async function AdminSchedulesPage() {
  await getCurrentAdminOrRedirect();

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
            <tr key={`${schedule.route}-${schedule.date}-${schedule.time}`}>
              <td>{schedule.route}</td>
              <td>{schedule.date}</td>
              <td>{schedule.time}</td>
              <td>{schedule.seats}</td>
              <td>{schedule.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminShell>
  );
}
