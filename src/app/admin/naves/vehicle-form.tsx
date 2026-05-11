"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { AdminFormAlert, AdminSubmitButton, FieldError } from "../form-ui";
import { initialAdminFormState, type AdminFormState } from "../form-state";
import { VEHICLE_TEMPLATES, type VehicleSeat } from "@/lib/vehicles/templates";
import { SeatLayoutEditor } from "./seat-layout-editor";

type VehicleFormAction = (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;

type VehicleFormData = {
  id?: string;
  name?: string;
  brand?: string;
  model?: string;
  licensePlate?: string | null;
  templateKey?: string | null;
  isActive?: boolean;
  seats?: VehicleSeat[];
};

type VehicleFormProps = {
  action: VehicleFormAction;
  vehicle?: VehicleFormData;
  submitLabel: string;
};

export function VehicleForm({ action, vehicle, submitLabel }: VehicleFormProps) {
  const [state, formAction] = useActionState(action, initialAdminFormState);
  const errors = state.fieldErrors;
  const initialTemplate = vehicle?.templateKey ?? "";
  const [templateKey, setTemplateKey] = useState(initialTemplate);
  const selectedTemplate = useMemo(() => VEHICLE_TEMPLATES.find((template) => template.key === templateKey), [templateKey]);
  const brandValue = selectedTemplate?.brand ?? vehicle?.brand ?? "";
  const modelValue = selectedTemplate?.model ?? vehicle?.model ?? "";
  const seatKey = `${templateKey}-${vehicle?.id ?? "new"}`;

  return (
    <form className="admin-form-grid" action={formAction}>
      <AdminFormAlert state={state} />
      {vehicle?.id ? <input type="hidden" name="id" value={vehicle.id} /> : null}
      <label>
        Nombre interno
        <input
          name="name"
          defaultValue={vehicle?.name}
          placeholder="Araucana Norte"
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        <FieldError id="name-error" message={errors.name} />
      </label>
      <label>
        Plantilla
        <select
          name="templateKey"
          value={templateKey}
          onChange={(event) => setTemplateKey(event.target.value)}
          aria-invalid={Boolean(errors.templateKey)}
          aria-describedby={errors.templateKey ? "templateKey-error" : undefined}
        >
          <option value="">Carga manual</option>
          {VEHICLE_TEMPLATES.map((template) => (
            <option key={template.key} value={template.key}>
              {template.brand} · {template.model}
            </option>
          ))}
        </select>
        <FieldError id="templateKey-error" message={errors.templateKey} />
      </label>
      <label>
        Marca
        <input
          name="brand"
          key={`brand-${templateKey}`}
          defaultValue={brandValue}
          placeholder="Mercedes-Benz"
          required
          aria-invalid={Boolean(errors.brand)}
          aria-describedby={errors.brand ? "brand-error" : undefined}
        />
        <FieldError id="brand-error" message={errors.brand} />
      </label>
      <label>
        Modelo
        <input
          name="model"
          key={`model-${templateKey}`}
          defaultValue={modelValue}
          placeholder="Sprinter Minibus"
          required
          aria-invalid={Boolean(errors.model)}
          aria-describedby={errors.model ? "model-error" : undefined}
        />
        <FieldError id="model-error" message={errors.model} />
      </label>
      <label>
        Patente / identificador
        <input name="licensePlate" defaultValue={vehicle?.licensePlate ?? ""} placeholder="AE 123 AR" />
      </label>
      <label>
        Capacidad
        <input readOnly value={selectedTemplate?.capacity ?? vehicle?.seats?.length ?? 0} aria-label="Capacidad calculada" />
      </label>
      <label className="checkbox-row">
        <input name="isActive" type="checkbox" defaultChecked={vehicle?.isActive ?? true} />
        Activa
      </label>
      <SeatLayoutEditor
        key={seatKey}
        initialSeats={selectedTemplate?.seats ?? vehicle?.seats ?? []}
      />
      <FieldError id="seats-error" message={errors.seats} />
      <div className="form-actions span-2">
        <AdminSubmitButton>{submitLabel}</AdminSubmitButton>
        <Link className="ghost-button" href="/admin/naves">Cancelar</Link>
      </div>
    </form>
  );
}
