import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { updateScheduleAction } from "../actions";
import { getScheduleFormData } from "../form-data";
import { ScheduleForm } from "../schedule-form";

type EditSchedulePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditSchedulePage({ params }: EditSchedulePageProps) {
  await getCurrentAdminOrRedirect();
  const { id } = await params;
  const [schedule, formData] = await Promise.all([
    prisma.schedule.findUnique({
      where: { id },
      include: {
        route: true
      }
    }),
    getScheduleFormData()
  ]);

  if (!schedule) {
    notFound();
  }

  return (
    <AdminShell title="Editar salida">
      <section className="plain-card admin-section">
        <h2>
          {schedule.route.from} → {schedule.route.to}
        </h2>
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
