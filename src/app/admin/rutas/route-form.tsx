import Link from "next/link";
import { StopsEditorField } from "./stops-editor-field";

type RouteFormAction = (formData: FormData) => Promise<void>;

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
  return (
    <form className="admin-form-grid" action={action}>
      {route?.id ? <input type="hidden" name="id" value={route.id} /> : null}
      <label>
        Origen
        <input name="from" defaultValue={route?.from} placeholder="SMA" required />
      </label>
      <label>
        Destino
        <input name="to" defaultValue={route?.to} placeholder="Bariloche" required />
      </label>
      <label>
        Via
        <input name="via" defaultValue={route?.via} placeholder="Ruta 40" required />
      </label>
      <label>
        Slug publico
        <input name="slug" defaultValue={route?.slug} placeholder="sma-bariloche" />
      </label>
      <label>
        Duracion (min)
        <input name="durationMin" type="number" min="1" defaultValue={route?.durationMin} required />
      </label>
      <label>
        Precio
        <input name="price" type="number" min="1" step="1" defaultValue={route?.price} required />
      </label>
      <label>
        Moneda
        <input name="currency" defaultValue={route?.currency ?? "ARS"} required />
      </label>
      <label>
        Categoria
        <input name="category" defaultValue={route?.category ?? "Argentina"} required />
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
        <button className="button" type="submit">{submitLabel}</button>
        <Link className="ghost-button" href="/admin/rutas">Cancelar</Link>
      </div>
    </form>
  );
}
