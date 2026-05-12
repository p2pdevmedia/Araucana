export function parseMonthlySalaryCents(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("El sueldo debe ser mayor a cero.");
  }

  return Math.round(amount * 100);
}

export function formatCurrency(cents?: number | null, currency = "ARS") {
  if (cents === null || cents === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(cents / 100);
}
