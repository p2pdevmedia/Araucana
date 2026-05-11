"use client";

import { useMemo, useState } from "react";
import { getSeatCanvasSize, moveSeatToPosition, removeSeatAtIndex, updateSeatNumber } from "@/lib/vehicles/seat-layout";
import { type VehicleSeat } from "@/lib/vehicles/templates";

type SeatLayoutEditorProps = {
  initialSeats: VehicleSeat[];
};

const blankSeat: VehicleSeat = {
  number: "01",
  row: 1,
  column: 1
};

function nextSeatNumber(seats: VehicleSeat[]) {
  const max = seats.reduce((currentMax, seat) => Math.max(currentMax, Number(seat.number) || 0), 0);
  return String(max + 1).padStart(2, "0");
}

function nextSeatNumberFrom(seats: VehicleSeat[], offset: number) {
  const max = seats.reduce((currentMax, seat) => Math.max(currentMax, Number(seat.number) || 0), 0);
  return String(max + offset).padStart(2, "0");
}

function seatsToJson(seats: VehicleSeat[]) {
  return JSON.stringify(seats);
}

function maxSeatValue(seats: VehicleSeat[], key: "row" | "column") {
  return seats.reduce((max, seat) => Math.max(max, seat[key]), 1);
}

export function SeatLayoutEditor({ initialSeats }: SeatLayoutEditorProps) {
  const [seats, setSeats] = useState<VehicleSeat[]>(initialSeats.length ? initialSeats : [blankSeat]);
  const [draggedSeatIndex, setDraggedSeatIndex] = useState<number | null>(null);
  const serializedSeats = useMemo(() => seatsToJson(seats), [seats]);
  const { rows, columns } = getSeatCanvasSize(seats);

  function updateSeat(index: number, value: string) {
    setSeats((currentSeats) => updateSeatNumber(currentSeats, index, value));
  }

  function addSeat() {
    setSeats((currentSeats) => [
      ...currentSeats,
      {
        number: nextSeatNumber(currentSeats),
        row: maxSeatValue(currentSeats, "row") + 1,
        column: 1
      }
    ]);
  }

  function addRowWithLayout(rowColumns: number[]) {
    setSeats((currentSeats) => {
      const row = maxSeatValue(currentSeats, "row") + 1;
      const nextSeats = rowColumns.map((column, index) => ({
        number: nextSeatNumberFrom(currentSeats, index + 1),
        row,
        column
      }));

      return [...currentSeats, ...nextSeats];
    });
  }

  function removeSeat(index: number) {
    setSeats((currentSeats) => removeSeatAtIndex(currentSeats, index));
  }

  function moveSeat(row: number, column: number) {
    if (draggedSeatIndex === null) {
      return;
    }

    setSeats((currentSeats) => moveSeatToPosition(currentSeats, draggedSeatIndex, row, column));
    setDraggedSeatIndex(null);
  }

  function autoNumber() {
    setSeats((currentSeats) =>
      [...currentSeats]
        .sort((a, b) => a.row - b.row || a.column - b.column)
        .map((seat, index) => ({
          ...seat,
          number: String(index + 1).padStart(2, "0")
        }))
    );
  }

  return (
    <div className="seat-layout-editor span-2">
      <input type="hidden" name="seats" value={serializedSeats} />
      <div className="seat-layout-head">
        <div>
          <span>Distribucion editable</span>
          <strong>{seats.length} asientos</strong>
        </div>
        <div className="table-actions">
          <button className="ghost-button" type="button" onClick={autoNumber}>
            Autonumerar
          </button>
          <button className="ghost-button" type="button" onClick={() => addRowWithLayout([1, 2, 4])}>
            Fila 2+1 con pasillo
          </button>
          <button className="ghost-button" type="button" onClick={() => addRowWithLayout([1, 2, 4, 5])}>
            Fila 2+2 con pasillo
          </button>
          <button className="ghost-button" type="button" onClick={addSeat}>
            Agregar asiento
          </button>
        </div>
      </div>
      <div
        className="vehicle-seat-map"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(68px, 1fr))` }}
      >
        {Array.from({ length: rows * columns }, (_, index) => {
          const row = Math.floor(index / columns) + 1;
          const column = (index % columns) + 1;
          const seatIndex = seats.findIndex((item) => item.row === row && item.column === column);
          const seat = seatIndex >= 0 ? seats[seatIndex] : null;
          const hasSeatBefore = seats.some((item) => item.row === row && item.column < column);
          const hasSeatAfter = seats.some((item) => item.row === row && item.column > column);

          return seat ? (
            <div
              className="vehicle-seat-chip"
              draggable
              key={`${row}-${column}`}
              onDragEnd={() => setDraggedSeatIndex(null)}
              onDragOver={(event) => event.preventDefault()}
              onDragStart={() => setDraggedSeatIndex(seatIndex)}
              onDrop={() => moveSeat(row, column)}
            >
              <span className="vehicle-seat-drag" aria-hidden="true">Mover</span>
              <label>
                <span>Numero</span>
                <input
                  aria-label={`Numero de asiento ${seat.number}`}
                  value={seat.number}
                  onChange={(event) => updateSeat(seatIndex, event.target.value)}
                />
              </label>
              <button
                aria-label={`Borrar asiento ${seat.number}`}
                className="seat-delete-button"
                type="button"
                onClick={() => removeSeat(seatIndex)}
              >
                ×
              </button>
            </div>
          ) : (
            <button
              className="vehicle-seat-gap"
              aria-label="Mover asiento a este espacio libre"
              key={`${row}-${column}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => moveSeat(row, column)}
              type="button"
            >
              {hasSeatBefore && hasSeatAfter ? "Pasillo" : ""}
            </button>
          );
        })}
      </div>
      <p className="seat-layout-help">
        Arrastra un asiento para cambiarlo de posicion o soltarlo en el pasillo. Tambien podes editar el numero o
        borrarlo desde el mismo grafico.
      </p>
    </div>
  );
}
