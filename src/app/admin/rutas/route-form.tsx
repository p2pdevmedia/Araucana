"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AdminFormAlert, AdminSubmitButton, FieldError } from "../form-ui";
import { initialAdminFormState, type AdminFormState } from "../form-state";
import { StopsEditorField } from "./stops-editor-field";

type RouteFormAction = (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;

type RouteFormData = {
  id?: string;
  slug?: string;
  from?: string;
  to?: string;
  via?: string;
  durationMin?: number;
  price?: number;
  currency?: string;
  category?: string;
  description?: string;
  featured?: boolean;
  isActive?: boolean;
  stops?: unknown;
};

type RouteFormProps = {
  action: RouteFormAction;
  route?: RouteFormData;
  submitLabel: string;
};

export function RouteForm({ action, route, submitLabel }: RouteFormProps) {
  const [state, formAction] = useActionState(action, initialAdminFormState);
  const errors = state.fieldErrors;

  return (
    <form className="admin-form-grid" action={formAction}>
      <AdminFormAlert state={state} />
      {route?.id ? <input type="hidden" name="id" value={route.id} /> : null}
      <label>
        Origen
        <input
          name="from"
          defaultValue={route?.from}
          placeholder="San Martin de los Andes"
          required
          aria-invalid={Boolean(errors.from)}
          aria-describedby={errors.from ? "from-error" : undefined}
        />
        <FieldError id="from-error" message={errors.from} />
      </label>
      <label>
        Destino
        <input
          name="to"
          defaultValue={route?.to}
          placeholder="Villa Traful"
          required
          aria-invalid={Boolean(errors.to)}
          aria-describedby={errors.to ? "to-error" : undefined}
        />
        <FieldError id="to-error" message={errors.to} />
      </label>
      <label>
        Via
        <input
          name="via"
          defaultValue={route?.via}
          placeholder="Ruta 40"
          required
          aria-invalid={Boolean(errors.via)}
          aria-describedby={errors.via ? "via-error" : undefined}
        />
        <FieldError id="via-error" message={errors.via} />
      </label>
      <label>
        Slug publico
        <input
          name="slug"
          defaultValue={route?.slug}
          placeholder="sma-villa-traful-verano-2026"
          aria-invalid={Boolean(errors.slug)}
          aria-describedby={errors.slug ? "slug-error" : undefined}
        />
        <FieldError id="slug-error" message={errors.slug} />
      </label>
      <label>
        Duracion (min)
        <input
          name="durationMin"
          type="number"
          min="1"
          defaultValue={route?.durationMin}
          required
          aria-invalid={Boolean(errors.durationMin)}
          aria-describedby={errors.durationMin ? "durationMin-error" : undefined}
        />
        <FieldError id="durationMin-error" message={errors.durationMin} />
      </label>
      <label>
        Precio
        <input
          name="price"
          type="number"
          min="1"
          step="1"
          defaultValue={route?.price}
          required
          aria-invalid={Boolean(errors.price)}
          aria-describedby={errors.price ? "price-error" : undefined}
        />
        <FieldError id="price-error" message={errors.price} />
      </label>
      <label>
        Moneda
        <input
          name="currency"
          defaultValue={route?.currency ?? "ARS"}
          required
          aria-invalid={Boolean(errors.currency)}
          aria-describedby={errors.currency ? "currency-error" : undefined}
        />
        <FieldError id="currency-error" message={errors.currency} />
      </label>
      <label>
        Categoria
        <input
          name="category"
          defaultValue={route?.category ?? "Argentina"}
          required
          aria-invalid={Boolean(errors.category)}
          aria-describedby={errors.category ? "category-error" : undefined}
        />
        <FieldError id="category-error" message={errors.category} />
      </label>
      <label className="span-2">
        Descripcion
        <textarea name="description" rows={3} defaultValue={route?.description} />
      </label>
      <StopsEditorField stops={route?.stops} />
      <label className="checkbox-row">
        <input name="featured" type="checkbox" defaultChecked={route?.featured ?? false} />
        Destacada
      </label>
      <label className="checkbox-row">
        <input name="isActive" type="checkbox" defaultChecked={route?.isActive ?? true} />
        Activa
      </label>
      <div className="form-actions span-2">
        <AdminSubmitButton>{submitLabel}</AdminSubmitButton>
        <Link className="ghost-button" href="/admin/rutas">Cancelar</Link>
      </div>
    </form>
  );
}
