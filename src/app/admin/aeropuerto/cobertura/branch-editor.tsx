"use client";

import { useActionState } from "react";
import type { AirportBranch } from "@/lib/airport/branch-settings";
import { initialAdminFormState } from "../../form-state";
import { saveBranchAction } from "./actions";

export function BranchEditor({ initialBranch }: { initialBranch: AirportBranch }) {
  const [result, save, pending] = useActionState(saveBranchAction, initialAdminFormState);
  const errors = result.fieldErrors;

  return (
    <form action={save}>
      <h2>Retiro en la sucursal</h2>
      <p className="muted">
        Es el atajo «Usar la sucursal» del checkout: en lugar de buscar la dirección, el pasajero marca
        la oficina con un toque. Se aplica a los dos sentidos (llegada y salida).
      </p>
      <div className="checkout-fields">
        <label>Nombre corto
          <input name="branchLabel" defaultValue={initialBranch.label} maxLength={60} aria-invalid={Boolean(errors.branchLabel)} />
          {errors.branchLabel ? <span className="field-error" role="alert">{errors.branchLabel}</span> : null}
        </label>
        <label>Dirección
          <input name="branchAddress" defaultValue={initialBranch.address} maxLength={160} aria-invalid={Boolean(errors.branchAddress)} />
          <small className="muted">
            Se busca la dirección al guardar para fijar el punto exacto en el mapa.
            {` Hoy: ${initialBranch.point[0].toFixed(5)}, ${initialBranch.point[1].toFixed(5)}`}
          </small>
          {errors.branchAddress ? <span className="field-error" role="alert">{errors.branchAddress}</span> : null}
        </label>
      </div>
      <div className="form-actions">
        <button className="button" type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar sucursal"}</button>
      </div>
      {result.message ? <p role="status" className={result.status === "error" ? "field-error" : "muted"}>{result.message}</p> : null}
    </form>
  );
}
