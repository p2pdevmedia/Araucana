import { normalizeSeats, type VehicleSeat } from "./templates";

type RawSeat = {
  number?: unknown;
  row?: unknown;
  column?: unknown;
};

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function parseRawSeats(raw: string): RawSeat[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new Error("La distribucion de asientos no es valida.");
  }
}

export function parseSeatLayout(raw: string): VehicleSeat[] {
  const seats = normalizeSeats(
    parseRawSeats(raw).map((seat) => {
      if (typeof seat.number !== "string" || !seat.number.trim()) {
        throw new Error("Cada asiento necesita un numero.");
      }

      if (!isPositiveInteger(seat.row) || !isPositiveInteger(seat.column)) {
        throw new Error("Fila y columna de asiento deben ser numeros positivos.");
      }

      return {
        number: seat.number,
        row: seat.row,
        column: seat.column
      };
    })
  );

  if (seats.length === 0) {
    throw new Error("La nave necesita al menos un asiento.");
  }

  const numbers = new Set<string>();
  for (const seat of seats) {
    if (numbers.has(seat.number)) {
      throw new Error("No puede haber asientos repetidos.");
    }

    numbers.add(seat.number);
  }

  return seats;
}
