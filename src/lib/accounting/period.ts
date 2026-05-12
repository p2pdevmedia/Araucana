import type { AccountingPeriod } from "./types";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

export function createMonthPeriod(monthValue?: string): AccountingPeriod {
  const fallback = new Date();
  const match = monthValue?.match(/^(\d{4})-(\d{2})$/);
  const year = match ? Number(match[1]) : fallback.getUTCFullYear();
  const monthIndex = match ? Number(match[2]) - 1 : fallback.getUTCMonth();

  const from = new Date(Date.UTC(year, monthIndex, 1));
  const to = new Date(Date.UTC(year, monthIndex + 1, 1));

  return {
    from,
    to,
    label: `${MONTH_NAMES[monthIndex] ?? MONTH_NAMES[0]} ${year}`
  };
}

export function createRangePeriod(fromValue?: string, toValue?: string): AccountingPeriod {
  if (!fromValue || !toValue) {
    return createMonthPeriod();
  }

  const from = new Date(`${fromValue}T00:00:00.000Z`);
  const rawTo = new Date(`${toValue}T00:00:00.000Z`);
  const to = new Date(rawTo.getTime() + 24 * 60 * 60 * 1000);

  if (Number.isNaN(from.getTime()) || Number.isNaN(rawTo.getTime()) || from > rawTo) {
    return createMonthPeriod();
  }

  return {
    from,
    to,
    label: `${fromValue} a ${toValue}`
  };
}

export function isWithinPeriod(date: Date, period: AccountingPeriod) {
  return date >= period.from && date < period.to;
}
