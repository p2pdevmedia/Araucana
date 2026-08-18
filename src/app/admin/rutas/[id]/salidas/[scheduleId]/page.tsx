import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { updateScheduleAction } from "../../../../salidas/actions";
import { getScheduleFormData } from "../../../../salidas/form-data";
import { ScheduleForm } from "../../../../salidas/schedule-form";

type EditRouteSchedulePageProps = {
  params: Promise<{ id: string; scheduleId: string }>;
};

export default async function EditRouteSchedulePage({ params }: EditRouteSchedulePageProps) {
  await getCurrentAdminOrRedirect();
  const { scheduleId } = await params;
  const [schedule, formData] = await Promise.all([
    prisma.schedule.findUnique({ where: { id: scheduleId }, include: { route: true } }),
    getScheduleFormData()
  ]);

  if (!schedule) {
    notFound();
  }

  return (
    <AdminShell title="Modificar salida" eyebrow="Salidas de la ruta">
      <section className="plain-card admin-section">
        <h2>{schedule.route.from} → {schedule.route.to}</h2>
        <ScheduleForm
          action={updateScheduleAction}
          routes={formData.routes}
          vehicles={formData.vehicles}
          schedule={schedule}
          submitLabel="Guardar cambios"
        />
      </section>
    </AdminShell>
  );
}
