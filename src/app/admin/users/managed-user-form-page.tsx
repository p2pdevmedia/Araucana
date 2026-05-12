import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { getManagedUserConfig, type ManagedUserRole } from "@/lib/admin/users";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { createManagedUserAction, updateManagedUserAction } from "./actions";
import { ManagedUserForm } from "./user-form";

type NewManagedUserPageProps = {
  role: ManagedUserRole;
};

type EditManagedUserPageProps = {
  role: ManagedUserRole;
  id: string;
};

export async function NewManagedUserPage({ role }: NewManagedUserPageProps) {
  await getCurrentAdminOrRedirect();
  const config = getManagedUserConfig(role);

  return (
    <AdminShell title={config.newLabel}>
      <section className="plain-card admin-section">
        <h2>Crear {config.singular}</h2>
        <ManagedUserForm action={createManagedUserAction} role={role} submitLabel="Crear usuario" />
      </section>
    </AdminShell>
  );
}

export async function EditManagedUserPage({ role, id }: EditManagedUserPageProps) {
  await getCurrentAdminOrRedirect();
  const config = getManagedUserConfig(role);
  const user = await prisma.user.findFirst({
    where: {
      id,
      role
    },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true
    }
  });

  if (!user) {
    notFound();
  }

  return (
    <AdminShell title={`Editar ${config.singular}`}>
      <section className="plain-card admin-section">
        <h2>{user.name ?? user.email}</h2>
        <ManagedUserForm action={updateManagedUserAction} role={role} user={user} submitLabel="Guardar cambios" />
      </section>
    </AdminShell>
  );
}
