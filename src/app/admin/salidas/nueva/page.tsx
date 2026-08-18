import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { createScheduleAction } from "../actions";
import { getScheduleFormData } from "../form-data";
import { ScheduleForm } from "../schedule-form";

type NewSchedulePageProps = {
  searchParams?: Promise<{ date?: string; routeId?: string }>;
};

export default async function NewSchedulePage({ searchParams }: NewSchedulePageProps) {
  await getCurrentAdminOrRedirect();
  const params = await searchParams;
  const { routes, vehicles } = await getScheduleFormData();
  const departureAt = params?.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
    ? new Date(`${params.date}T09:00:00-03:00`)
    : undefined;

  return (
    <AdminShell title="Agregar salida">
      <section className="plain-card admin-section">
        <h2>Nueva salida</h2>
        <ScheduleForm action={createScheduleAction} routes={routes} vehicles={vehicles} schedule={{ routeId: params?.routeId, departureAt }} submitLabel="Crear salida" />
      </section>
    </AdminShell>
  );
}
