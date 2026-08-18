import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { createScheduleAction } from "../actions";
import { getScheduleFormData } from "../form-data";
import { ScheduleForm } from "../schedule-form";

type NewSchedulePageProps = {
  searchParams?: Promise<{ routeId?: string }>;
};

export default async function NewSchedulePage({ searchParams }: NewSchedulePageProps) {
  await getCurrentAdminOrRedirect();
  const params = await searchParams;
  const { routes, vehicles } = await getScheduleFormData();

  return (
    <AdminShell title="Agregar salida">
      <section className="plain-card admin-section">
        <h2>Nueva salida</h2>
        <ScheduleForm action={createScheduleAction} routes={routes} vehicles={vehicles} schedule={{ routeId: params?.routeId }} submitLabel="Crear salida" />
      </section>
    </AdminShell>
  );
}
