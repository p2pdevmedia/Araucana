"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { appRoles, type AppRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db/prisma";

function isAppRole(role: string): role is AppRole {
  return appRoles.includes(role as AppRole);
}

export async function updateUserRoleAction(formData: FormData) {
  const currentUser = await getCurrentAdminOrRedirect();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!id || !isAppRole(role)) {
    redirect(`/admin?notice=${encodeURIComponent("No pudimos actualizar el rol.")}`);
  }

  if (id === currentUser.id) {
    redirect(`/admin?notice=${encodeURIComponent("No podes cambiar tu propio rol desde esta tabla.")}`);
  }

  await prisma.user.update({
    where: {
      id
    },
    data: {
      role
    }
  });

  revalidatePath("/admin");
  redirect(`/admin?notice=${encodeURIComponent("Rol actualizado con exito.")}`);
}
