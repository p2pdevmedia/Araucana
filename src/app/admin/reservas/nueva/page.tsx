import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { getCurrentReservationsUserOrRedirect } from "@/lib/auth/admin";
import { listAdminSchedules } from "@/lib/booking/repository";
import { createAdminReservationAction } from "../actions";

type NewReservationPageProps = {
  searchParams?: Promise<{ notice?: string }>;
};

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Salta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

const dateFormatter = new Intl.DateTimeFormat("es-AR", { weekday: "short", day: "2-digit", month: "short", timeZone: "America/Argentina/Salta" });
const timeFormatter = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Salta" });

function scheduleDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Salta", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export default async function NewReservationPage({ searchParams }: NewReservationPageProps) {
  const user = await getCurrentReservationsUserOrRedirect();
  const params = await searchParams;
  const schedules = (await listAdminSchedules()).filter((schedule) =>
    (schedule.status === "OPEN" || schedule.status === "DOCUMENTATION") && scheduleDateKey(schedule.departureAt) >= todayKey() && schedule.availableSeats > 0
  );

  return (
    <AdminShell title="Crear reserva" eyebrow="Nueva reserva" notice={params?.notice} role={user.role}>
      <section className="plain-card admin-section create-reservation-card">
        <div>
          <p className="eyebrow">Carga manual</p>
          <h2>Reservá lugares para un pasajero</h2>
          <p className="muted">Elegí la salida y la cantidad de asientos. No se asignan números de asiento.</p>
        </div>
        {schedules.length ? (
          <form className="admin-form-grid" action={createAdminReservationAction}>
            <label className="span-2">
              Salida
              <select name="scheduleId" required>
                {schedules.map((schedule) => (
                  <option value={schedule.id} key={schedule.id}>
                    {schedule.route} · {dateFormatter.format(schedule.departureAt)} · {timeFormatter.format(schedule.departureAt)} · {schedule.availableSeats} lugares libres
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cantidad de asientos
              <input name="passengerCount" type="number" min="1" max="24" defaultValue="1" required />
            </label>
            <label>
              Nombre
              <input name="firstName" autoComplete="given-name" required />
            </label>
            <label>
              Apellido
              <input name="lastName" autoComplete="family-name" required />
            </label>
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Teléfono
              <input name="phone" type="tel" autoComplete="tel" placeholder="+54 9..." required />
            </label>
            <label>
              Tipo de documento
              <select name="documentType" defaultValue="DNI" required><option>DNI</option><option>Pasaporte</option><option>Cedula</option></select>
            </label>
            <label>
              Documento
              <input name="documentId" required />
            </label>
            <label>
              Nacionalidad
              <input name="nationality" placeholder="Opcional" />
            </label>
            <div className="form-actions span-2"><button className="button" type="submit">Crear reserva</button><Link className="ghost-button" href="/admin/reservas">Cancelar</Link></div>
          </form>
        ) : <p className="muted">No hay salidas futuras con lugares disponibles.</p>}
      </section>
    </AdminShell>
  );
}
