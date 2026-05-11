export type VehicleSeat = {
  number: string;
  row: number;
  column: number;
};

export type VehicleTemplate = {
  key: string;
  brand: string;
  model: string;
  capacity: number;
  columns: number;
  seats: VehicleSeat[];
};

const twoOneLayouts = new Set(["mercedes-sprinter-19", "fiat-ducato-16", "renault-master-15", "hyundai-h350-15"]);

function seat(number: number, row: number, column: number): VehicleSeat {
  return {
    number: String(number).padStart(2, "0"),
    row,
    column
  };
}

function createLayout(capacity: number, templateKey: string): VehicleSeat[] {
  const seats: VehicleSeat[] = [];
  let row = 1;
  let nextSeat = 1;

  while (nextSeat <= capacity) {
    const columns = twoOneLayouts.has(templateKey) && row < 6 ? [1, 2, 4] : [1, 2, 4, 5];

    for (const column of columns) {
      if (nextSeat > capacity) {
        break;
      }

      seats.push(seat(nextSeat, row, column));
      nextSeat += 1;
    }

    row += 1;
  }

  return seats;
}

function template(key: string, brand: string, model: string, capacity: number, columns = 4): VehicleTemplate {
  return {
    key,
    brand,
    model,
    capacity,
    columns,
    seats: createLayout(capacity, key)
  };
}

export const VEHICLE_TEMPLATES: VehicleTemplate[] = [
  template("mercedes-sprinter-19", "Mercedes-Benz", "Sprinter Minibus 19+1", 19),
  template("fiat-ducato-16", "Fiat", "Ducato Minibus 16 plazas", 16),
  template("iveco-daily-15", "Iveco", "Daily Minibus 15+1", 15),
  template("iveco-daily-18", "Iveco", "Daily Minibus 18+1", 18),
  template("toyota-hiace-15", "Toyota", "Hiace Commuter 15 plazas", 15),
  template("toyota-hiace-17", "Toyota", "Hiace Commuter largo 17 plazas", 17),
  template("renault-master-15", "Renault", "Master Minibus 15 plazas", 15),
  template("hyundai-h350-15", "Hyundai", "H350 Bus 15 plazas", 15)
];

export function normalizeSeats(seats: VehicleSeat[]): VehicleSeat[] {
  return [...seats]
    .map((seatItem) => ({
      number: seatItem.number.trim(),
      row: seatItem.row,
      column: seatItem.column
    }))
    .sort((a, b) => a.row - b.row || a.column - b.column || a.number.localeCompare(b.number));
}

export function getVehicleTemplate(key: string) {
  return VEHICLE_TEMPLATES.find((templateItem) => templateItem.key === key);
}
