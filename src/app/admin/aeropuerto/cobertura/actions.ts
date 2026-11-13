"use server";

import { revalidatePath } from "next/cache";
import { AirportBranch, saveAirportBranch } from "@/lib/airport/branch-settings";
import { lookupAirportAddress } from "@/lib/airport/address-lookup";
import { saveAirportExtras } from "@/lib/airport/extras-settings";
import { airportCoverageSchema, saveAirportCoverage } from "@/lib/airport/pickup-zone-settings";
import { parseReservationPrice, reservationPriceError } from "@/lib/booking/admin-price";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { errorState, successState, type AdminFormState } from "../../form-state";

export async function saveCoverageAction(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await getCurrentAdminOrRedirect();
  const raw = formData.get("coverage");
  if (typeof raw !== "string") return errorState("No se recibió el mapa.");

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return errorState("No pudimos leer el mapa.");
  }
  const parsed = airportCoverageSchema.safeParse(value);
  if (!parsed.success) return errorState("Cada sector necesita un contorno de al menos tres puntos que encierre un área.");
  await saveAirportCoverage(parsed.data, user.id);
  revalidatePath("/admin/aeropuerto/cobertura");
  revalidatePath("/admin/aeropuerto/reservar");
  revalidatePath("/reservar/[slug]", "page");
  return successState(parsed.data.enabled ? "Cobertura guardada y activa." : "Mapa guardado. La validación está desactivada.");
}

function revalidateAirport() {
  revalidatePath("/admin/aeropuerto/cobertura");
  revalidatePath("/admin/aeropuerto/reservar");
  revalidatePath("/reservar/[slug]", "page");
}

/** Sucursal del checkout: se geocodifica la dirección al guardar para no geocodificar en el cliente. */
export async function saveBranchAction(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await getCurrentAdminOrRedirect();
  const label = String(formData.get("branchLabel") ?? "").trim();
  const address = String(formData.get("branchAddress") ?? "").trim();

  const fieldErrors: Record<string, string> = {};
  if (label.length < 2) fieldErrors.branchLabel = "Poné un nombre corto para la sucursal.";
  if (address.length < 5) fieldErrors.branchAddress = "Ingresá la dirección de la sucursal.";
  if (Object.keys(fieldErrors).length > 0) return errorState("Revisá los campos marcados.", fieldErrors);

  let branch: AirportBranch;
  try {
    const found = await lookupAirportAddress(address);
    if (!found?.point) return errorState("No encontramos esa dirección. Probá con calle y altura, o con el nombre del lugar.");
    branch = { label, address, point: found.point };
  } catch {
    return errorState("El buscador de direcciones no está disponible en este momento. Probá de nuevo en un rato.");
  }

  await saveAirportBranch(branch, user.id);
  revalidateAirport();
  return successState(`Sucursal guardada en ${branch.label}: ${address}`);
}

export async function saveExtrasAction(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await getCurrentAdminOrRedirect();
  const text = (name: string) => String(formData.get(name) ?? "").trim() || "0";
  const zoneExtraCents = parseReservationPrice(text("zoneExtra"));
  const sportsLuggageCents = parseReservationPrice(text("sportsLuggage"));
  const cutoff = text("arrivalCutoff");
  const arrivalCutoffMinutes = /^\d{1,3}$/.test(cutoff) && Number(cutoff) <= 180 ? Number(cutoff) : null;

  const fieldErrors: Record<string, string> = {};
  if (zoneExtraCents === null) fieldErrors.zoneExtra = reservationPriceError;
  if (sportsLuggageCents === null) fieldErrors.sportsLuggage = reservationPriceError;
  if (arrivalCutoffMinutes === null) fieldErrors.arrivalCutoff = "Ingresá minutos enteros entre 0 y 180.";
  if (zoneExtraCents === null || sportsLuggageCents === null || arrivalCutoffMinutes === null) {
    return errorState("Revisá los campos marcados.", fieldErrors);
  }

  await saveAirportExtras({ zoneExtraCents, sportsLuggageCents, arrivalCutoffMinutes }, user.id);
  revalidateAirport();
  return successState("Extras guardados.");
}
