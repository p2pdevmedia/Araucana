"use client";

import { useActionState, useMemo, useState } from "react";
import { AdminFormAlert, AdminSubmitButton } from "../form-ui";
import { initialAdminFormState, type AdminFormState } from "../form-state";

type SalaryPaymentFormAction = (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;

type SalaryUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  monthlySalaryCents: number | null;
};

type SalaryPaymentFormProps = {
  action: SalaryPaymentFormAction;
  users: SalaryUser[];
};

function userLabel(user: SalaryUser) {
  const role = user.role === "DRIVER" ? "Chofer" : "Secretaria";
  return `${user.name || user.email} · ${role}`;
}

function centsToAmount(cents: number | null) {
  return cents ? String(cents / 100) : "";
}

export function SalaryPaymentForm({ action, users }: SalaryPaymentFormProps) {
  const [state, formAction] = useActionState(action, initialAdminFormState);
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? "");
  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId),
    [selectedUserId, users]
  );
  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <form className="admin-form-grid" action={formAction}>
      <AdminFormAlert state={state} />
      <label className="span-2">
        Persona
        <select name="userId" required value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {userLabel(user)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Periodo
        <input name="salaryPeriod" type="month" defaultValue={currentMonth} required />
      </label>
      <label>
        Fecha de pago
        <input name="occurredAt" type="date" defaultValue={today} required />
      </label>
      <label>
        Monto
        <input
          key={selectedUserId}
          name="amount"
          inputMode="decimal"
          defaultValue={centsToAmount(selectedUser?.monthlySalaryCents ?? null)}
          placeholder="Ej: 450000"
          required
        />
      </label>
      <label className="span-2">
        Nota
        <input name="notes" placeholder="Detalle opcional" />
      </label>
      <div className="form-actions span-2">
        <AdminSubmitButton>Registrar pago</AdminSubmitButton>
      </div>
    </form>
  );
}
