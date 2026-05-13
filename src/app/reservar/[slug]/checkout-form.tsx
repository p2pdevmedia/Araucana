"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import type { PublicRouteDto, ScheduleOptionDto, SeatMapDto } from "@/lib/booking/types";
import type { CreateReservationInput } from "@/lib/booking/validation";
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
  phoneCountryCode: string;
  phone: string;
  documentType: string;
  documentId: string;
  nationality: string;
};

type CheckoutFieldErrors = Partial<Record<keyof PassengerForm, string>>;

const initialPassenger: PassengerForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneCountryCode: "",
  phone: "",
  documentType: "DNI",
  documentId: "",
  nationality: ""
};

const bookableScheduleStatuses = new Set(["OPEN", "DOCUMENTATION"]);

const countryDialCodes = [
  { value: "+54", label: "Argentina +54" },
  { value: "+56", label: "Chile +56" },
  { value: "+55", label: "Brasil +55" },
  { value: "+598", label: "Uruguay +598" },
  { value: "+595", label: "Paraguay +595" },
  { value: "+591", label: "Bolivia +591" },
  { value: "+51", label: "Peru +51" },
  { value: "+1", label: "EE.UU./Canada +1" },
  { value: "+34", label: "Espana +34" }
];

const nationalityCountryCodes = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS",
  "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN",
  "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE",
  "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF",
  "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM",
  "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM",
  "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC",
  "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK",
  "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA",
  "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG",
  "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW",
  "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS",
  "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO",
  "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI",
  "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW"
];

let nationalityOptionsCache: string[] | null = null;

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
  }).format(new Date(value)).replace(/\u00a0/g, " ");
}

function formatPrice(cents: number, currency: string) {
  if (cents <= 0) {
    return "Consultar";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getNationalityOptions() {
  if (nationalityOptionsCache) {
    return nationalityOptionsCache;
  }

  const regionNames = new Intl.DisplayNames(["es-AR"], { type: "region" });
  nationalityOptionsCache = nationalityCountryCodes
    .map((code) => regionNames.of(code))
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b, "es-AR"));

  return nationalityOptionsCache;
}

export function filterNationalityOptions(query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return getNationalityOptions();
  }

  return getNationalityOptions().filter((option) => normalizeSearchValue(option).includes(normalizedQuery));
}

export function validateCheckoutPassenger(passenger: PassengerForm): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};
  const phoneDigits = onlyDigits(passenger.phone);

  if (passenger.firstName.trim().length < 2) {
    errors.firstName = "Ingresa el nombre del pasajero.";
  }

  if (passenger.lastName.trim().length < 2) {
    errors.lastName = "Ingresa el apellido del pasajero.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email.trim())) {
    errors.email = "Ingresa un email valido.";
  }

  if (!passenger.phoneCountryCode) {
    errors.phoneCountryCode = "Selecciona el codigo de pais.";
  }

  if (phoneDigits.length < 6) {
    errors.phone = "Ingresa un telefono valido sin el codigo de pais.";
  }

  if (!passenger.documentType) {
    errors.documentType = "Selecciona el tipo de documento.";
  }

  if (passenger.documentId.trim().length < 4) {
    errors.documentId = "Ingresa un documento valido.";
  }

  return errors;
}

export function buildPassengerPayload(passenger: PassengerForm): CreateReservationInput["passenger"] {
  return {
    firstName: passenger.firstName.trim(),
    lastName: passenger.lastName.trim(),
    email: passenger.email.trim(),
    phone: `${passenger.phoneCountryCode}${onlyDigits(passenger.phone)}`,
    documentType: passenger.documentType,
    documentId: passenger.documentId.trim(),
    nationality: passenger.nationality.trim() || undefined
  };
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
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
  const [nationalitySearch, setNationalitySearch] = useState("");
  const [isNationalityListOpen, setIsNationalityListOpen] = useState(false);
  const hasBookableSchedules = bookableOptions.schedules.length > 0;
  const nationalityOptions = useMemo(() => getNationalityOptions(), []);
  const filteredNationalityOptions = useMemo(
    () => filterNationalityOptions(nationalitySearch).slice(0, 12),
    [nationalitySearch]
  );

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
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function selectNationality(value: string) {
    updatePassenger("nationality", value);
    setNationalitySearch(value);
    setIsNationalityListOpen(false);
  }

  function handleNationalityChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;
    const exactMatch = nationalityOptions.find(
      (option) => normalizeSearchValue(option) === normalizeSearchValue(nextValue)
    );

    setNationalitySearch(nextValue);
    updatePassenger("nationality", exactMatch ?? "");
    setIsNationalityListOpen(true);
  }

  function handleNationalityKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsNationalityListOpen(false);
      return;
    }

    if (event.key === "Enter" && isNationalityListOpen && filteredNationalityOptions[0]) {
      event.preventDefault();
      selectNationality(filteredNationalityOptions[0]);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const passengerErrors = validateCheckoutPassenger(passenger);

    if (Object.keys(passengerErrors).length > 0) {
      setFieldErrors(passengerErrors);
      setError("Revisa los campos marcados.");
      return;
    }

    if (!hasBookableSchedules || !selectedSchedule || !selectedSeat) {
      setError("Selecciona una salida y un asiento disponible.");
      return;
    }

    setIsSubmitting(true);

    const result = await createReservationAction({
      scheduleId: selectedSchedule.id,
      seatNumber: selectedSeat.number,
      passenger: buildPassengerPayload(passenger)
    });

    if (result.ok) {
      router.push(`/reservas/${result.code}`);
      return;
    }

    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
    }

    setError(result.message);
    setIsSubmitting(false);
  }

  return (
    <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
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
                aria-invalid={Boolean(fieldErrors.firstName)}
                aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
                required
              />
              {fieldErrors.firstName ? (
                <span className="field-error" id="firstName-error">
                  {fieldErrors.firstName}
                </span>
              ) : null}
            </label>
            <label>
              Apellido
              <input
                name="lastName"
                autoComplete="family-name"
                value={passenger.lastName}
                onChange={(event) => updatePassenger("lastName", event.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.lastName)}
                aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
                required
              />
              {fieldErrors.lastName ? (
                <span className="field-error" id="lastName-error">
                  {fieldErrors.lastName}
                </span>
              ) : null}
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
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                required
              />
              {fieldErrors.email ? (
                <span className="field-error" id="email-error">
                  {fieldErrors.email}
                </span>
              ) : null}
            </label>
            <div className="phone-field-row">
              <label>
                Codigo de pais
                <select
                  name="phoneCountryCode"
                  value={passenger.phoneCountryCode}
                  onChange={(event) => updatePassenger("phoneCountryCode", event.target.value)}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.phoneCountryCode)}
                  aria-describedby={fieldErrors.phoneCountryCode ? "phoneCountryCode-error" : undefined}
                  required
                >
                  <option value="">Seleccionar</option>
                  {countryDialCodes.map((country) => (
                    <option value={country.value} key={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.phoneCountryCode ? (
                  <span className="field-error" id="phoneCountryCode-error">
                    {fieldErrors.phoneCountryCode}
                  </span>
                ) : null}
              </label>
              <label>
                Telefono
                <input
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  value={passenger.phone}
                  onChange={(event) => updatePassenger("phone", event.target.value)}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                  required
                />
                {fieldErrors.phone ? (
                  <span className="field-error" id="phone-error">
                    {fieldErrors.phone}
                  </span>
                ) : null}
              </label>
            </div>
            <label>
              Tipo de documento
              <select
                name="documentType"
                value={passenger.documentType}
                onChange={(event) => updatePassenger("documentType", event.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.documentType)}
                aria-describedby={fieldErrors.documentType ? "documentType-error" : undefined}
                required
              >
                <option value="DNI">DNI</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Cedula">Cedula</option>
              </select>
              {fieldErrors.documentType ? (
                <span className="field-error" id="documentType-error">
                  {fieldErrors.documentType}
                </span>
              ) : null}
            </label>
            <label>
              Documento
              <input
                name="documentId"
                autoComplete="off"
                value={passenger.documentId}
                onChange={(event) => updatePassenger("documentId", event.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.documentId)}
                aria-describedby={fieldErrors.documentId ? "documentId-error" : undefined}
                required
              />
              {fieldErrors.documentId ? (
                <span className="field-error" id="documentId-error">
                  {fieldErrors.documentId}
                </span>
              ) : null}
            </label>
            <label>
              Nacionalidad
              <div className="nationality-combobox">
                <input
                  name="nationality"
                  autoComplete="off"
                  value={isNationalityListOpen ? nationalitySearch : passenger.nationality}
                  onChange={handleNationalityChange}
                  onFocus={() => {
                    setNationalitySearch(passenger.nationality);
                    setIsNationalityListOpen(true);
                  }}
                  onKeyDown={handleNationalityKeyDown}
                  onBlur={() => {
                    window.setTimeout(() => {
                      setNationalitySearch(passenger.nationality);
                      setIsNationalityListOpen(false);
                    }, 120);
                  }}
                  disabled={isSubmitting}
                  placeholder="Buscar nacionalidad"
                  role="combobox"
                  aria-expanded={isNationalityListOpen}
                  aria-controls="nationality-options"
                />
                {isNationalityListOpen ? (
                  <div className="nationality-options" id="nationality-options" role="listbox">
                    {filteredNationalityOptions.length > 0 ? (
                      filteredNationalityOptions.map((option) => (
                        <button
                          className="nationality-option"
                          type="button"
                          role="option"
                          aria-selected={option === passenger.nationality}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectNationality(option)}
                          key={option}
                        >
                          {option}
                        </button>
                      ))
                    ) : (
                      <span className="nationality-empty">Sin resultados</span>
                    )}
                  </div>
                ) : null}
              </div>
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
