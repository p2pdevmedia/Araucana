import type { VehicleSeat } from "./templates";

const fallbackSeat: VehicleSeat = {
  number: "01",
  row: 1,
  column: 1
};

const minimumCanvasColumns = 5;

function positionMatches(seat: VehicleSeat, row: number, column: number) {
  return seat.row === row && seat.column === column;
}

export function moveSeatToPosition(seats: VehicleSeat[], fromIndex: number, row: number, column: number): VehicleSeat[] {
  const movingSeat = seats[fromIndex];

  if (!movingSeat || row < 1 || column < 1) {
    return seats;
  }

  const targetIndex = seats.findIndex((seat, seatIndex) => seatIndex !== fromIndex && positionMatches(seat, row, column));

  return seats.map((seat, seatIndex) => {
    if (seatIndex === fromIndex) {
      return {
        ...seat,
        row,
        column
      };
    }

    if (seatIndex === targetIndex) {
      return {
        ...seat,
        row: movingSeat.row,
        column: movingSeat.column
      };
    }

    return seat;
  });
}

export function updateSeatNumber(seats: VehicleSeat[], index: number, number: string): VehicleSeat[] {
  return seats.map((seat, seatIndex) => (seatIndex === index ? { ...seat, number: number.trim() } : seat));
}

export function removeSeatAtIndex(seats: VehicleSeat[], index: number): VehicleSeat[] {
  const nextSeats = seats.filter((_, seatIndex) => seatIndex !== index);
  return nextSeats.length ? nextSeats : [fallbackSeat];
}

export function getSeatCanvasSize(seats: VehicleSeat[]) {
  const maxRow = seats.reduce((max, seat) => Math.max(max, seat.row), 1);
  const maxColumn = seats.reduce((max, seat) => Math.max(max, seat.column), 1);

  return {
    rows: maxRow + 1,
    columns: Math.max(minimumCanvasColumns, maxColumn + 1)
  };
}
