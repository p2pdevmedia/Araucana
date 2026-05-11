import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { listAdminReservations } from "@/lib/booking/repository";

function formatReservationStatus(status: string) {
  const labels: Record<string, string> = {
    CONFIRMED: "Confirmada",
    PENDING_PAYMENT: "Pago pendiente",
    DOCUMENTATION_PENDING: "Docs pendientes",
    CANCELLED: "Cancelada"
  };

  return labels[status] ?? status;
}

function formatPaymentStatus(status: string | null) {
  if (!status) {
    return "-";
  }

  const labels: Record<string, string> = {
    APPROVED: "Aprobado",
    PENDING: "Pendiente",
    REJECTED: "Rechazado"
  };

  return labels[status] ?? status;
}

export default async function AdminReservationsPage() {
  await getCurrentAdminOrRedirect();
  const reservations = await listAdminReservations();

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
            <th>Pago</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.code}>
              <td>{reservation.code}</td>
              <td>{reservation.passenger}</td>
              <td>{reservation.route}</td>
              <td>{reservation.seatNumber}</td>
              <td>{formatReservationStatus(reservation.status)}</td>
              <td>{formatPaymentStatus(reservation.paymentStatus)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminShell>
  );
}
