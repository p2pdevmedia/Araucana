"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ManagedUserRole } from "@/lib/admin/users";
import { getManagedUserConfig, getManagedUserPath } from "@/lib/admin/users";
import { AdminFormAlert, AdminSubmitButton, FieldError } from "../form-ui";
import { initialAdminFormState, type AdminFormState } from "../form-state";

type UserFormAction = (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;

type ManagedUserFormData = {
  id?: string;
  email?: string;
  name?: string | null;
  isActive?: boolean;
  monthlySalaryCents?: number | null;
  salaryCurrency?: string;
};

type ManagedUserFormProps = {
  action: UserFormAction;
  role: ManagedUserRole;
  user?: ManagedUserFormData;
  submitLabel: string;
};

export function ManagedUserForm({ action, role, user, submitLabel }: ManagedUserFormProps) {
  const [state, formAction] = useActionState(action, initialAdminFormState);
  const errors = state.fieldErrors;
  const config = getManagedUserConfig(role);
  const isEditing = Boolean(user?.id);

  return (
    <form className="admin-form-grid" action={formAction}>
      <AdminFormAlert state={state} />
      <input type="hidden" name="role" value={role} />
      {user?.id ? <input type="hidden" name="id" value={user.id} /> : null}
      <label>
        Nombre
        <input
          name="name"
          defaultValue={user?.name ?? ""}
          placeholder={role === "DRIVER" ? "Nombre del chofer" : "Nombre de la secretaria"}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        <FieldError id="name-error" message={errors.name} />
      </label>
      <label>
        Email
        <input
          name="email"
          type="email"
          defaultValue={user?.email}
          placeholder={`${config.singular}@araucana.com`}
          required
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        <FieldError id="email-error" message={errors.email} />
      </label>
      <label>
        Contrasena
        <input
          name="password"
          type="password"
          minLength={8}
          placeholder={isEditing ? "Dejar vacio para mantenerla" : "Minimo 8 caracteres"}
          required={!isEditing}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        <FieldError id="password-error" message={errors.password} />
      </label>
      <label>
        Sueldo mensual
        <input
          name="monthlySalary"
          inputMode="decimal"
          defaultValue={user?.monthlySalaryCents ? String(user.monthlySalaryCents / 100) : ""}
          placeholder="Ej: 450000"
          aria-invalid={Boolean(errors.monthlySalary)}
          aria-describedby={errors.monthlySalary ? "monthlySalary-error" : undefined}
        />
        <FieldError id="monthlySalary-error" message={errors.monthlySalary} />
      </label>
      <label className="checkbox-row">
        <input name="isActive" type="checkbox" defaultChecked={user?.isActive ?? true} />
        Usuario activo
      </label>
      <div className="form-actions span-2">
        <AdminSubmitButton>{submitLabel}</AdminSubmitButton>
        <Link className="ghost-button" href={getManagedUserPath(role)}>Cancelar</Link>
      </div>
    </form>
  );
}
