import { chapelcoAscentSlots } from "@/lib/chapelco/constants";
import type { ChapelcoAvailabilityDto } from "@/lib/chapelco/types";
import {
  addVehicleDutyAction,
  assignReservationAction,
  createRunAction,
  upsertOperationDayAction
} from "./actions";
import { ChapelcoRouteMap } from "./route-map";

type VehicleOption = {
  id: string;
  name: string;
  _count: { seats: number };
};

type DriverOption = {
  id: string;
  name: string | null;
  email: string;
};

type ReservationOption = {
  id: string;
  code: string;
  passengerCount: number;
  status: string;
  passenger: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  payment: {
    status: string;
  } | null;
  chapelcoDetails: {
    ascentSlot: string;
    pickupName: string;
    pickupAddress: string;
  } | null;
};

type OperationDay = {
  id: string;
  routeId: string;
  status: string;
  vehicleDuties: Array<{
    id: string;
    capacity: number;
    vehicle: { name: string };
    driver: { name: string | null; email: string } | null;
    runs: Array<{
      id: string;
      direction: string;
      ascentSlot: string | null;
      sequence: number;
      stops: Array<{
        id: string;
        stopOrder: number;
        passengerCount: number;
        pickupName: string;
        pickupAddress: string;
        pickupLatitude: number;
        pickupLongitude: number;
        status: string;
        reservation: {
          code: string;
          passenger: {
            firstName: string;
            lastName: string;
            phone: string;
          };
        };
      }>;
    }>;
  }>;
  runs: OperationDay["vehicleDuties"][number]["runs"];
};

export function OperationBoard({
  routeId,
  serviceDate,
  operationDay,
  vehicles,
  drivers,
  reservations,
  availability
}: {
  routeId: string;
  serviceDate: string;
  operationDay: OperationDay | null;
  vehicles: VehicleOption[];
  drivers: DriverOption[];
  reservations: ReservationOption[];
  availability: ChapelcoAvailabilityDto;
}) {
  const assignedReservationIds = new Set(
    operationDay?.vehicleDuties.flatMap((duty) =>
      duty.runs.flatMap((run) => run.stops.map((stop) => stop.reservation.code))
    ) ?? []
  );

  return (
    <div className="admin-section-grid">
      <section className="plain-card admin-section">
        <h2>Operativo diario</h2>
        <form className="admin-form-grid" action={upsertOperationDayAction}>
          <input type="hidden" name="routeId" value={routeId} />
          <label>
            Fecha
            <input name="serviceDate" type="date" defaultValue={serviceDate} required />
          </label>
          <label>
            Estado
            <select name="status" defaultValue={operationDay?.status ?? "OPEN"}>
              <option value="OPEN">Abierto</option>
              <option value="CLOSED">Cerrado</option>
            </select>
          </label>
          <div className="form-actions span-2">
            <button className="button" type="submit">
              Guardar operativo
            </button>
          </div>
        </form>
      </section>

      <section className="stats-grid admin-section">
        {availability.slots.map((slot) => (
          <div className="stat-card" key={slot.slot}>
            <strong>{slot.availablePeople}</strong>
            <span>{slot.slot} libres de {slot.totalCapacity}</span>
          </div>
        ))}
      </section>

      <section className="plain-card admin-section">
        <h2>Naves disponibles para Chapelco</h2>
        <p className="muted">
          Chapelco toma automaticamente todas las naves activas cargadas en la seccion Naves. No hace falta cargarlas por
          temporada.
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nave</th>
              <th>Cupos</th>
              <th>Estado Chapelco</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>{vehicle.name}</td>
                <td>{vehicle._count.seats}</td>
                <td>Disponible automaticamente</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {operationDay ? (
        <section className="plain-card admin-section">
          <h2>Ajustar nave para este dia</h2>
          <p className="muted">Usa esto solo si queres cambiar chofer, capacidad o notas para la fecha seleccionada.</p>
          <form className="admin-form-grid" action={addVehicleDutyAction}>
            <input type="hidden" name="operationDayId" value={operationDay.id} />
            <input type="hidden" name="serviceDate" value={serviceDate} />
            <label>
              Nave
              <select name="vehicleId">
                {vehicles.map((vehicle) => (
                  <option value={vehicle.id} key={vehicle.id}>
                    {vehicle.name} · {vehicle._count.seats} cupos sugeridos
                  </option>
                ))}
              </select>
            </label>
            <label>
              Chofer
              <select name="driverId">
                <option value="">Sin asignar</option>
                {drivers.map((driver) => (
                  <option value={driver.id} key={driver.id}>
                    {driver.name ?? driver.email}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Capacidad Chapelco
              <input name="capacity" type="number" min={1} defaultValue={vehicles[0]?._count.seats ?? 1} />
            </label>
            <label>
              Notas
              <input name="notes" />
            </label>
            <div className="form-actions span-2">
              <button className="button" type="submit">
                Agregar nave
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {operationDay?.vehicleDuties.map((duty) => (
        <section className="plain-card admin-section" key={duty.id}>
          <div className="admin-edit-head">
            <div>
              <p className="eyebrow">{duty.driver?.name ?? duty.driver?.email ?? "Sin chofer"}</p>
              <h2>{duty.vehicle.name} · {duty.capacity} cupos</h2>
            </div>
          </div>
          <form className="admin-form-grid" action={createRunAction}>
            <input type="hidden" name="operationDayId" value={operationDay.id} />
            <input type="hidden" name="vehicleDutyId" value={duty.id} />
            <input type="hidden" name="serviceDate" value={serviceDate} />
            <label>
              Tipo
              <select name="direction">
                <option value="UP">Subida</option>
                <option value="DOWN">Bajada</option>
              </select>
            </label>
            <label>
              Horario subida
              <select name="ascentSlot">
                {chapelcoAscentSlots.map((slot) => (
                  <option value={slot} key={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-actions span-2">
              <button className="ghost-button" type="submit">
                Crear recorrido
              </button>
            </div>
          </form>

          {duty.runs.map((run) => (
            <div className="manifest-block" key={run.id}>
              <h3>{run.direction === "UP" ? `Subida ${run.ascentSlot}` : `Bajada ${run.sequence}`}</h3>
              <ChapelcoRouteMap stops={run.stops} />
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Reserva</th>
                    <th>Busqueda</th>
                    <th>Personas</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {run.stops.map((stop) => (
                    <tr key={stop.id}>
                      <td>{stop.stopOrder}</td>
                      <td>{stop.reservation.code}</td>
                      <td>{stop.pickupName} · {stop.pickupAddress}</td>
                      <td>{stop.passengerCount}</td>
                      <td>{stop.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <form className="admin-form-grid" action={assignReservationAction}>
                <input type="hidden" name="runId" value={run.id} />
                <input type="hidden" name="serviceDate" value={serviceDate} />
                <label>
                  Asignar reserva
                  <select name="reservationId">
                    {reservations
                      .filter((reservation) => run.direction === "DOWN" || reservation.chapelcoDetails?.ascentSlot === run.ascentSlot)
                      .map((reservation) => (
                        <option value={reservation.id} key={reservation.id} disabled={assignedReservationIds.has(reservation.code)}>
                          {reservation.code} · {reservation.passenger.firstName} {reservation.passenger.lastName} · {reservation.passengerCount} pax ·{" "}
                          {reservation.payment?.status ?? "sin pago"}
                        </option>
                      ))}
                  </select>
                </label>
                <div className="form-actions">
                  <button className="ghost-button" type="submit">
                    Asignar
                  </button>
                </div>
              </form>
            </div>
          ))}
        </section>
      ))}

      <section className="plain-card admin-section">
        <h2>Reservas Chapelco del dia</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Responsable</th>
              <th>Horario</th>
              <th>Busqueda</th>
              <th>Personas</th>
              <th>Pago</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td>{reservation.code}</td>
                <td>{reservation.passenger.firstName} {reservation.passenger.lastName}</td>
                <td>{reservation.chapelcoDetails?.ascentSlot}</td>
                <td>{reservation.chapelcoDetails?.pickupName}</td>
                <td>{reservation.passengerCount}</td>
                <td>{reservation.payment?.status ?? "Pendiente"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
