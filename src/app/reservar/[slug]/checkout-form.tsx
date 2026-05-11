"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { PublicRouteDto, ScheduleOptionDto, SeatMapDto } from "@/lib/booking/types";
import { createReservationAction } from "./actions";

type CheckoutFormProps = {
  route: PublicRouteDto;
  schedules: ScheduleOptionDto[];
  seatMaps: SeatMapDto[];
};

type PassengerForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string;
  documentId: string;
  nationality: string;
};

const initialPassenger: PassengerForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  documentType: "DNI",
  documentId: "",
  nationality: ""
};

const bookableScheduleStatuses = new Set(["OPEN", "DOCUMENTATION"]);

export function filterBookableSchedules(schedules: ScheduleOptionDto[], seatMaps: SeatMapDto[]) {
  const bookableSchedules = schedules.filter((schedule) => bookableScheduleStatuses.has(schedule.status));
  const bookableScheduleIds = new Set(bookableSchedules.map((schedule) => schedule.id));

  return {
    schedules: bookableSchedules,
    seatMaps: seatMaps.filter((seatMap) => bookableScheduleIds.has(seatMap.scheduleId))
  };
}

export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Argentina/Salta"
  }).format(new Date(value));
}

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

export function CheckoutForm({ route, schedules, seatMaps }: CheckoutFormProps) {
  const router = useRouter();
  const bookableOptions = useMemo(() => filterBookableSchedules(schedules, seatMaps), [schedules, seatMaps]);
  const firstScheduleId = bookableOptions.schedules[0]?.id ?? "";
  const [scheduleId, setScheduleId] = useState(firstScheduleId);
  const [seatNumber, setSeatNumber] = useState("");
  const [passenger, setPassenger] = useState<PassengerForm>(initialPassenger);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const hasBookableSchedules = bookableOptions.schedules.length > 0;

  const selectedSchedule = useMemo(
    () => bookableOptions.schedules.find((schedule) => schedule.id === scheduleId) ?? bookableOptions.schedules[0] ?? null,
    [scheduleId, bookableOptions.schedules]
  );
  const selectedSeatMap = useMemo(
    () => bookableOptions.seatMaps.find((seatMap) => seatMap.scheduleId === selectedSchedule?.id) ?? null,
    [bookableOptions.seatMaps, selectedSchedule?.id]
  );
  const selectedSeat = selectedSeatMap?.seats.find((seat) => seat.number === seatNumber) ?? null;

  function updatePassenger(field: keyof PassengerForm, value: string) {
    setPassenger((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!hasBookableSchedules || !selectedSchedule || !selectedSeat) {
      setError("Selecciona una salida y un asiento disponible.");
      return;
    }

    setIsSubmitting(true);

    const result = await createReservationAction({
      scheduleId: selectedSchedule.id,
      seatNumber: selectedSeat.number,
      passenger: {
        firstName: passenger.firstName,
        lastName: passenger.lastName,
        email: passenger.email,
        phone: passenger.phone,
        documentType: passenger.documentType,
        documentId: passenger.documentId,
        nationality: passenger.nationality || undefined
      }
    });

    if (result.ok) {
      router.push(`/reservas/${result.code}`);
      return;
    }

    setError(result.message);
    setIsSubmitting(false);
  }

  return (
    <form className="checkout-layout" onSubmit={handleSubmit}>
      <div className="checkout-main">
        <section className="form-panel checkout-panel">
          <div>
            <p className="eyebrow">Salida</p>
            <h2 className="route-title">Elegir salida</h2>
          </div>
          <label>
            Salida
            <select
              name="scheduleId"
              value={selectedSchedule?.id ?? ""}
              onChange={(event) => {
                setScheduleId(event.target.value);
                setSeatNumber("");
              }}
              disabled={!hasBookableSchedules || isSubmitting}
            >
              {!hasBookableSchedules ? (
                <option value="">Sin salidas disponibles</option>
              ) : (
                bookableOptions.schedules.map((schedule) => (
                  <option value={schedule.id} key={schedule.id}>
                    {formatDateTime(schedule.departureAt)} - {schedule.availableSeats} asientos
                  </option>
                ))
              )}
            </select>
          </label>
          {!hasBookableSchedules ? (
            <p className="muted">No hay salidas disponibles para reservar en este momento.</p>
          ) : null}
        </section>

        <section className="form-panel checkout-panel">
          <div>
            <p className="eyebrow">Asiento</p>
            <h2 className="route-title">Seleccionar asiento</h2>
          </div>
          {selectedSeatMap ? (
            <div className="seat-grid" aria-label="Asientos disponibles">
              {selectedSeatMap.seats.map((seat) => {
                const isSelected = seat.number === seatNumber;

                return (
                  <button
                    className={`seat-button ${isSelected ? "selected" : ""} ${seat.occupied ? "occupied" : ""}`}
                    type="button"
                    aria-pressed={isSelected}
                    disabled={seat.occupied || isSubmitting}
                    onClick={() => setSeatNumber(seat.number)}
                    key={seat.id}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="muted">Selecciona una salida para ver los asientos.</p>
          )}
          <div className="seat-legend">
            <span><i className="legend-box" /> Libre</span>
            <span><i className="legend-box selected" /> Seleccionado</span>
            <span><i className="legend-box occupied" /> Ocupado</span>
          </div>
        </section>

        <section className="form-panel checkout-panel">
          <div>
            <p className="eyebrow">Pasajero</p>
            <h2 className="route-title">Datos del pasajero</h2>
          </div>
          <div className="checkout-fields">
            <label>
              Nombre
              <input
                name="firstName"
                autoComplete="given-name"
                value={passenger.firstName}
                onChange={(event) => updatePassenger("firstName", event.target.value)}
                disabled={isSubmitting}
                required
              />
            </label>
            <label>
              Apellido
              <input
                name="lastName"
                autoComplete="family-name"
                value={passenger.lastName}
                onChange={(event) => updatePassenger("lastName", event.target.value)}
                disabled={isSubmitting}
                required
              />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={passenger.email}
                onChange={(event) => updatePassenger("email", event.target.value)}
                disabled={isSubmitting}
                required
              />
            </label>
            <label>
              Telefono
              <input
                name="phone"
                autoComplete="tel"
                value={passenger.phone}
                onChange={(event) => updatePassenger("phone", event.target.value)}
                disabled={isSubmitting}
                required
              />
            </label>
            <label>
              Tipo de documento
              <select
                name="documentType"
                value={passenger.documentType}
                onChange={(event) => updatePassenger("documentType", event.target.value)}
                disabled={isSubmitting}
                required
              >
                <option value="DNI">DNI</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Cedula">Cedula</option>
              </select>
            </label>
            <label>
              Documento
              <input
                name="documentId"
                autoComplete="off"
                value={passenger.documentId}
                onChange={(event) => updatePassenger("documentId", event.target.value)}
                disabled={isSubmitting}
                required
              />
            </label>
            <label>
              Nacionalidad
              <input
                name="nationality"
                autoComplete="country-name"
                value={passenger.nationality}
                onChange={(event) => updatePassenger("nationality", event.target.value)}
                disabled={isSubmitting}
              />
            </label>
          </div>
        </section>
      </div>

      <aside className="checkout-summary plain-card">
        <p className="eyebrow">Resumen</p>
        <h2 className="route-title">
          {route.from} - {route.to}
        </h2>
        <div className="summary-list">
          <div>
            <span>Ruta</span>
            <strong>{route.via}</strong>
          </div>
          <div>
            <span>Fecha</span>
            <strong>{selectedSchedule ? formatDateTime(selectedSchedule.departureAt) : "Sin salida"}</strong>
          </div>
          <div>
            <span>Asiento</span>
            <strong>{selectedSeat ? `Asiento ${selectedSeat.number}` : "Pendiente"}</strong>
          </div>
          <div>
            <span>Precio</span>
            <strong className="price">
              {selectedSchedule ? formatPrice(selectedSchedule.priceCents, selectedSchedule.currency) : formatPrice(route.priceCents, route.currency)}
            </strong>
          </div>
        </div>
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        <button
          className="button checkout-submit"
          type="submit"
          disabled={isSubmitting || !hasBookableSchedules || !selectedSchedule || !selectedSeat}
        >
          {isSubmitting ? "Confirmando..." : "Confirmar reserva"}
        </button>
      </aside>
    </form>
  );
}
