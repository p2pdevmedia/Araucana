import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { reservations } from "@/lib/travel-data";

export default async function AdminReservationsPage() {
  await getCurrentAdminOrRedirect();

  return (
    <AdminShell title="Reservas">
      <table className="data-table">
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Pasajero</th>
            <th>Ruta</th>
            <th>Asiento</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.code}>
              <td>{reservation.code}</td>
              <td>{reservation.passenger}</td>
              <td>{reservation.route}</td>
              <td>{reservation.seat}</td>
              <td>{reservation.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminShell>
  );
}
