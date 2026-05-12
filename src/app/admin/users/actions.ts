"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { parseMonthlySalaryCents } from "@/lib/admin/salary";
import {
  getManagedUserConfig,
  getManagedUserPath,
  isManagedUserRole,
  type ManagedUserRole
} from "@/lib/admin/users";
import { errorState, type AdminFieldErrors, type AdminFormState } from "../form-state";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

class UserValidationError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: AdminFieldErrors
  ) {
    super(message);
  }
}

function roleFromForm(formData: FormData) {
  const role = value(formData, "role");

  if (!isManagedUserRole(role)) {
    throw new UserValidationError("La seccion de usuarios no es valida.", {
      role: "Volver a abrir la seccion desde el menu."
    });
  }

  return role;
}

function userData(formData: FormData, options: { requirePassword: boolean }) {
  const email = value(formData, "email").toLowerCase();
  const name = value(formData, "name");
  const password = value(formData, "password");
  const monthlySalary = value(formData, "monthlySalary");
  const fieldErrors: AdminFieldErrors = {};

  if (!email) {
    fieldErrors.email = "Ingresa un email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Ingresa un email valido.";
  }

  if (options.requirePassword && !password) {
    fieldErrors.password = "Ingresa una contrasena inicial.";
  }

  if (password && password.length < 8) {
    fieldErrors.password = "La contrasena debe tener al menos 8 caracteres.";
  }

  let monthlySalaryCents: number | null = null;
  try {
    monthlySalaryCents = parseMonthlySalaryCents(monthlySalary);
  } catch (error) {
    fieldErrors.monthlySalary = error instanceof Error ? error.message : "El sueldo mensual no es valido.";
  }

  if (Object.keys(fieldErrors).length) {
    throw new UserValidationError("Revisa los campos marcados para guardar el usuario.", fieldErrors);
  }

  return {
    email,
    name: name || null,
    password,
    monthlySalaryCents,
    salaryCurrency: "ARS",
    isActive: formData.get("isActive") === "on"
  };
}

function userErrorState(error: unknown) {
  if (error instanceof UserValidationError) {
    return errorState(error.message, error.fieldErrors);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return errorState("Ya existe un usuario con ese email.", {
      email: "Usa otro email o edita el usuario existente."
    });
  }

  return errorState("No pudimos guardar el usuario. Intentalo nuevamente.");
}

function revalidateUserPaths(role: ManagedUserRole) {
  revalidatePath("/admin");
  revalidatePath(getManagedUserPath(role));
}

function redirectWithNotice(role: ManagedUserRole, notice: string): never {
  redirect(`${getManagedUserPath(role)}?notice=${encodeURIComponent(notice)}`);
}

export async function createManagedUserAction(_state: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await getCurrentAdminOrRedirect();

  let role: ManagedUserRole;
  try {
    role = roleFromForm(formData);
    const data = userData(formData, { requirePassword: true });
    await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: await hashPassword(data.password),
        role,
        monthlySalaryCents: data.monthlySalaryCents,
        salaryCurrency: data.salaryCurrency,
        isActive: data.isActive
      }
    });
  } catch (error) {
    return userErrorState(error);
  }

  const config = getManagedUserConfig(role);
  revalidateUserPaths(role);
  redirectWithNotice(role, `${config.singular[0].toUpperCase()}${config.singular.slice(1)} creada con exito.`);
}

export async function updateManagedUserAction(_state: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await getCurrentAdminOrRedirect();

  const id = value(formData, "id");
  if (!id) {
    return errorState("Falta el usuario a editar. Volve a abrirlo desde el listado.");
  }

  let role: ManagedUserRole;
  try {
    role = roleFromForm(formData);
    const data = userData(formData, { requirePassword: false });

    await prisma.user.update({
      where: {
        id,
        role
      },
      data: {
        email: data.email,
        name: data.name,
        monthlySalaryCents: data.monthlySalaryCents,
        salaryCurrency: data.salaryCurrency,
        isActive: data.isActive,
        ...(data.password ? { passwordHash: await hashPassword(data.password) } : {})
      }
    });
  } catch (error) {
    return userErrorState(error);
  }

  revalidateUserPaths(role);
  redirectWithNotice(role, "Usuario guardado con exito.");
}

export async function setManagedUserActiveAction(formData: FormData) {
  await getCurrentAdminOrRedirect();

  const id = value(formData, "id");
  const role = roleFromForm(formData);
  const isActive = value(formData, "isActive") === "true";
  await prisma.user.update({
    where: {
      id,
      role
    },
    data: { isActive }
  });

  revalidateUserPaths(role);
  redirectWithNotice(role, isActive ? "Usuario activado con exito." : "Usuario desactivado con exito.");
}

export async function deleteManagedUserAction(formData: FormData) {
  await getCurrentAdminOrRedirect();

  const id = value(formData, "id");
  const role = roleFromForm(formData);
  await prisma.user.delete({
    where: {
      id,
      role
    }
  });

  revalidateUserPaths(role);
  redirectWithNotice(role, "Usuario eliminado con exito.");
}
