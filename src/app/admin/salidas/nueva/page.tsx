import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { createScheduleAction } from "../actions";
import { getScheduleFormData } from "../form-data";
import { ScheduleForm } from "../schedule-form";

export default async function NewSchedulePage() {
  await getCurrentAdminOrRedirect();
  const { routes, vehicles } = await getScheduleFormData();

  return (
    <AdminShell title="Agregar salida">
      <section className="plain-card admin-section">
        <h2>Nueva salida</h2>
        <ScheduleForm action={createScheduleAction} routes={routes} vehicles={vehicles} submitLabel="Crear salida" />
      </section>
    </AdminShell>
  );
}
