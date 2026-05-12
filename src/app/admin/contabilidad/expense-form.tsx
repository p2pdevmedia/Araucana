"use client";

import { useActionState } from "react";
import { ACCOUNTING_CATEGORY_LABELS, EXPENSE_CATEGORIES } from "@/lib/accounting/types";
import { AdminFormAlert, AdminSubmitButton } from "../form-ui";
import { initialAdminFormState, type AdminFormState } from "../form-state";

type ExpenseFormAction = (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;

type ExpenseFormProps = {
  action: ExpenseFormAction;
  vehicles: Array<{
    id: string;
    name: string;
  }>;
};

export function ExpenseForm({ action, vehicles }: ExpenseFormProps) {
  const [state, formAction] = useActionState(action, initialAdminFormState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form className="admin-form-grid" action={formAction}>
      <AdminFormAlert state={state} />
      <label>
        Categoria
        <select name="category" required>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {ACCOUNTING_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Monto
        <input name="amount" inputMode="decimal" placeholder="Ej: 85000" required />
      </label>
      <label>
        Fecha
        <input name="occurredAt" type="date" defaultValue={today} required />
      </label>
      <label>
        Nave
        <select name="vehicleId">
          <option value="">Sin nave</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.name}
            </option>
          ))}
        </select>
      </label>
      <label className="span-2">
        Nota
        <input name="notes" placeholder="Detalle opcional" />
      </label>
      <div className="form-actions span-2">
        <AdminSubmitButton>Guardar egreso</AdminSubmitButton>
      </div>
    </form>
  );
}
