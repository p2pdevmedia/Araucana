import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { listAdminSchedules } from "@/lib/booking/repository";
import { prisma } from "@/lib/db/prisma";
import { deleteScheduleAction, setScheduleStatusAction } from "./actions";

type AdminSchedulesPageProps = {
  searchParams?: Promise<{
    from?: string;
    notice?: string;
    page?: string;
    routeId?: string;
    status?: string;
    to?: string;
    vehicleId?: string;
  }>;
};

const PAGE_SIZE = 10;
const SCHEDULE_STATUSES = ["OPEN", "DOCUMENTATION", "CLOSED"] as const;

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: "America/Argentina/Salta"
});

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Argentina/Salta"
});

function formatScheduleStatus(status: string) {
  const labels: Record<string, string> = {
    OPEN: "Abierta",
    DOCUMENTATION: "Documentacion",
    CLOSED: "Cerrada"
  };

  return labels[status] ?? status;
}

function normalizeDateParam(value?: string) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function dateStart(value: string) {
  return new Date(`${value}T00:00:00-03:00`);
}

function dateEnd(value: string) {
  return new Date(`${value}T23:59:59.999-03:00`);
}

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function paginationHref(page: number, params?: Awaited<AdminSchedulesPageProps["searchParams"]>) {
  const nextParams = new URLSearchParams();

  for (const key of ["routeId", "vehicleId", "status", "from", "to"] as const) {
    const value = params?.[key];
    if (value) {
      nextParams.set(key, value);
    }
  }

  if (page > 1) {
    nextParams.set("page", String(page));
  }

  const query = nextParams.toString();
  return query ? `/admin/salidas?${query}` : "/admin/salidas";
}

export default async function AdminSchedulesPage({ searchParams }: AdminSchedulesPageProps) {
  await getCurrentAdminOrRedirect();
  const params = await searchParams;
  const [schedules, routes, vehicles] = await Promise.all([
    listAdminSchedules(),
    prisma.travelRoute.findMany({
      orderBy: [{ from: "asc" }, { to: "asc" }],
      select: {
        id: true,
        from: true,
        to: true
      }
    }),
    prisma.vehicle.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true
      }
    })
  ]);

  const selectedStatus = SCHEDULE_STATUSES.includes(params?.status as (typeof SCHEDULE_STATUSES)[number])
    ? params?.status ?? ""
    : "";
  const selectedFrom = normalizeDateParam(params?.from);
  const selectedTo = normalizeDateParam(params?.to);
  const filteredSchedules = schedules.filter((schedule) => {
    if (params?.routeId && schedule.routeId !== params.routeId) {
      return false;
    }

    if (params?.vehicleId && schedule.vehicleId !== params.vehicleId) {
      return false;
    }

    if (selectedStatus && schedule.status !== selectedStatus) {
      return false;
    }

    if (selectedFrom && schedule.departureAt < dateStart(selectedFrom)) {
      return false;
    }

    if (selectedTo && schedule.departureAt > dateEnd(selectedTo)) {
      return false;
    }

    return true;
  });
  const totalPages = Math.max(Math.ceil(filteredSchedules.length / PAGE_SIZE), 1);
  const currentPage = Math.min(parsePage(params?.page), totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginatedSchedules = filteredSchedules.slice(pageStart, pageStart + PAGE_SIZE);
  const resultStart = filteredSchedules.length ? pageStart + 1 : 0;
  const resultEnd = Math.min(pageStart + PAGE_SIZE, filteredSchedules.length);

  return (
    <AdminShell
      title="Salidas"
      notice={params?.notice}
      action={<Link className="button" href="/admin/salidas/nueva">Agregar salida</Link>}
    >
      <form className="filter-bar" action="/admin/salidas">
        <label>
          Ruta
          <select name="routeId" defaultValue={params?.routeId ?? ""}>
            <option value="">Todas</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.from} -&gt; {route.to}
              </option>
            ))}
          </select>
        </label>
        <label>
          Nave
          <select name="vehicleId" defaultValue={params?.vehicleId ?? ""}>
            <option value="">Todas</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select name="status" defaultValue={selectedStatus}>
            <option value="">Todos</option>
            {SCHEDULE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatScheduleStatus(status)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Desde
          <input name="from" type="date" defaultValue={selectedFrom} />
        </label>
        <label>
          Hasta
          <input name="to" type="date" defaultValue={selectedTo} />
        </label>
        <button className="ghost-button" type="submit">Filtrar</button>
        <Link className="ghost-button" href="/admin/salidas">Limpiar</Link>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Ruta</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Llegada</th>
            <th>Asientos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedSchedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>{schedule.route}</td>
              <td>{dateFormatter.format(schedule.departureAt)}</td>
              <td>{timeFormatter.format(schedule.departureAt)}</td>
              <td>{timeFormatter.format(schedule.arrivalAt)}</td>
              <td>
                {schedule.availableSeats}/{schedule.totalSeats} disponibles
              </td>
              <td>
                <span className={`status-pill ${schedule.status === "CLOSED" ? "inactive" : "active"}`}>
                  {formatScheduleStatus(schedule.status)}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <Link className="ghost-button" href={`/admin/salidas/${schedule.id}`}>Editar</Link>
                  <form action={setScheduleStatusAction}>
                    <input type="hidden" name="id" value={schedule.id} />
                    <input type="hidden" name="status" value={schedule.status === "CLOSED" ? "OPEN" : "CLOSED"} />
                    <button className="ghost-button" type="submit">
                      {schedule.status === "CLOSED" ? "Activar" : "Inactivar"}
                    </button>
                  </form>
                  <form action={deleteScheduleAction}>
                    <input type="hidden" name="id" value={schedule.id} />
                    <button className="danger-button" type="submit">Borrar</button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
          {paginatedSchedules.length === 0 ? (
            <tr>
              <td colSpan={7}>No hay salidas que coincidan con el filtro.</td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <nav className="pagination-bar" aria-label="Paginacion de salidas">
        <span>
          Mostrando {resultStart}-{resultEnd} de {filteredSchedules.length} salidas
        </span>
        <div>
          <Link
            aria-disabled={currentPage === 1}
            className="ghost-button"
            href={paginationHref(Math.max(currentPage - 1, 1), params)}
          >
            Anterior
          </Link>
          <span className="pagination-page">
            Pagina {currentPage} de {totalPages}
          </span>
          <Link
            aria-disabled={currentPage === totalPages}
            className="ghost-button"
            href={paginationHref(Math.min(currentPage + 1, totalPages), params)}
          >
            Siguiente
          </Link>
        </div>
      </nav>
    </AdminShell>
  );
}
