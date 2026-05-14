import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { getCurrentReservationsUserOrRedirect } from "@/lib/auth/admin";
import { listAdminReservations } from "@/lib/booking/repository";
import { approveManualPaymentAction } from "./actions";

type AdminReservationsPageProps = {
  searchParams?: Promise<{
    notice?: string;
  }>;
};

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

function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

export default async function AdminReservationsPage({ searchParams }: AdminReservationsPageProps) {
  const user = await getCurrentReservationsUserOrRedirect();
  const params = await searchParams;
  const reservations = await listAdminReservations();

  return (
    <AdminShell title="Reservas" notice={params?.notice} role={user.role}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Pasajero</th>
            <th>WhatsApp</th>
            <th>Ruta</th>
            <th>Asiento</th>
            <th>Estado</th>
            <th>Pago</th>
            <th>Comprobante</th>
            <th>Accion</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => {
            const whatsappUrl = whatsappHref(reservation.passengerPhone);

            return (
              <tr key={reservation.code}>
                <td>{reservation.code}</td>
                <td>
                  <Link className="table-link" href={`/admin/reservas/${reservation.code}`}>
                    {reservation.passenger}
                  </Link>
                </td>
                <td>
                  {whatsappUrl ? (
                    <a
                      aria-label={`Enviar WhatsApp a ${reservation.passenger}`}
                      className="whatsapp-link"
                      href={whatsappUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                      title={`Enviar WhatsApp a ${reservation.passenger}`}
                    >
                      W
                    </a>
                  ) : (
                    <span className="muted">-</span>
                  )}
                </td>
                <td>{reservation.route}</td>
                <td>
                  {reservation.bookingMode === "CHAPELCO"
                    ? `${reservation.passengerCount} personas${reservation.chapelcoAscentSlot ? ` · ${reservation.chapelcoAscentSlot}` : ""}`
                    : reservation.seatNumber}
                </td>
                <td>{formatReservationStatus(reservation.status)}</td>
                <td>{formatPaymentStatus(reservation.paymentStatus)}</td>
                <td>
                  {reservation.hasReceipt ? (
                    <Link className="table-link" href={`/admin/reservas/${reservation.code}/comprobante`} target="_blank">
                      {reservation.receiptFileName ?? "Ver comprobante"}
                    </Link>
                  ) : (
                    <span className="muted">Pendiente</span>
                  )}
                </td>
                <td>
                  {reservation.hasReceipt && reservation.paymentStatus !== "APPROVED" ? (
                    <form action={approveManualPaymentAction}>
                      <input type="hidden" name="code" value={reservation.code} />
                      <button className="button table-action" type="submit">
                        Validar pago
                      </button>
                    </form>
                  ) : (
                    <span className="muted">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </AdminShell>
  );
}
