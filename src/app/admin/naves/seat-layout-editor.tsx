"use client";

import { useMemo, useState } from "react";
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

function seatsToJson(seats: VehicleSeat[]) {
  return JSON.stringify(seats);
}

function maxSeatValue(seats: VehicleSeat[], key: "row" | "column") {
  return seats.reduce((max, seat) => Math.max(max, seat[key]), 1);
}

export function SeatLayoutEditor({ initialSeats }: SeatLayoutEditorProps) {
  const [seats, setSeats] = useState<VehicleSeat[]>(initialSeats.length ? initialSeats : [blankSeat]);
  const serializedSeats = useMemo(() => seatsToJson(seats), [seats]);
  const rows = maxSeatValue(seats, "row");
  const columns = maxSeatValue(seats, "column");

  function updateSeat(index: number, field: keyof VehicleSeat, value: string) {
    setSeats((currentSeats) =>
      currentSeats.map((seat, seatIndex) => {
        if (seatIndex !== index) {
          return seat;
        }

        return {
          ...seat,
          [field]: field === "number" ? value : Number(value)
        };
      })
    );
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

  function removeSeat(index: number) {
    setSeats((currentSeats) => {
      const nextSeats = currentSeats.filter((_, seatIndex) => seatIndex !== index);
      return nextSeats.length ? nextSeats : [blankSeat];
    });
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
          <button className="ghost-button" type="button" onClick={addSeat}>
            Agregar asiento
          </button>
        </div>
      </div>
      <div className="vehicle-seat-map" style={{ gridTemplateColumns: `repeat(${columns}, minmax(52px, 1fr))` }}>
        {Array.from({ length: rows * columns }, (_, index) => {
          const row = Math.floor(index / columns) + 1;
          const column = (index % columns) + 1;
          const seat = seats.find((item) => item.row === row && item.column === column);

          return seat ? (
            <span className="vehicle-seat-chip" key={`${row}-${column}`}>
              {seat.number}
            </span>
          ) : (
            <span className="vehicle-seat-gap" aria-label="Pasillo o espacio libre" key={`${row}-${column}`} />
          );
        })}
      </div>
      <div className="seat-editor-list">
        {seats.map((seat, index) => (
          <div className="seat-editor-row" key={`${seat.row}-${seat.column}-${index}`}>
            <label>
              Asiento
              <input value={seat.number} onChange={(event) => updateSeat(index, "number", event.target.value)} />
            </label>
            <label>
              Fila
              <input
                min="1"
                type="number"
                value={seat.row}
                onChange={(event) => updateSeat(index, "row", event.target.value)}
              />
            </label>
            <label>
              Columna
              <input
                min="1"
                type="number"
                value={seat.column}
                onChange={(event) => updateSeat(index, "column", event.target.value)}
              />
            </label>
            <button className="danger-button" type="button" onClick={() => removeSeat(index)}>
              Quitar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
