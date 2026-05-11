import Link from "next/link";

type ScheduleFormAction = (formData: FormData) => Promise<void>;

type RouteOption = {
  id: string;
  from: string;
  to: string;
  isActive: boolean;
};

type VehicleOption = {
  id: string;
  name: string;
  _count: {
    seats: number;
  };
};

type ScheduleFormData = {
  id?: string;
  routeId?: string;
  vehicleId?: string;
  departureAt?: Date;
  status?: string;
};

function formatDateTimeInput(date?: Date) {
  if (!date) {
    return undefined;
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Salta"
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

type ScheduleFormProps = {
  action: ScheduleFormAction;
  routes: RouteOption[];
  vehicles: VehicleOption[];
  schedule?: ScheduleFormData;
  submitLabel: string;
};

export function ScheduleForm({ action, routes, vehicles, schedule, submitLabel }: ScheduleFormProps) {
  return (
    <form className="admin-form-grid" action={action}>
      {schedule?.id ? <input type="hidden" name="id" value={schedule.id} /> : null}
      <label>
        Ruta
        <select name="routeId" defaultValue={schedule?.routeId} required>
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.from} → {route.to}{route.isActive ? "" : " (inactiva)"}
            </option>
          ))}
        </select>
      </label>
      <label>
        Vehiculo
        <select name="vehicleId" defaultValue={schedule?.vehicleId} required>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.name} · {vehicle._count.seats} asientos
            </option>
          ))}
        </select>
      </label>
      <label>
        Fecha y hora
        <input name="departureAt" type="datetime-local" defaultValue={formatDateTimeInput(schedule?.departureAt)} required />
      </label>
      <label>
        Estado
        <select name="status" defaultValue={schedule?.status ?? "OPEN"} required>
          <option value="OPEN">Abierta</option>
          <option value="DOCUMENTATION">Documentacion</option>
          <option value="CLOSED">Inactiva / cerrada</option>
        </select>
      </label>
      <div className="form-actions span-2">
        <button className="button" type="submit">{submitLabel}</button>
        <Link className="ghost-button" href="/admin/salidas">Cancelar</Link>
      </div>
    </form>
  );
}
