import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { VEHICLE_TEMPLATES } from "@/lib/vehicles/templates";
import { deleteVehicleAction, setVehicleActiveAction } from "./actions";

export default async function AdminVehiclesPage() {
  await getCurrentAdminOrRedirect();
  const vehicles = await prisma.vehicle.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          seats: true,
          schedules: true
        }
      }
    }
  });
  const activeVehicles = vehicles.filter((vehicle) => vehicle.isActive);
  const totalSeats = vehicles.reduce((total, vehicle) => total + vehicle._count.seats, 0);

  return (
    <AdminShell title="Naves" action={<Link className="button" href="/admin/naves/nueva">Agregar nave</Link>}>
      <section className="admin-grid">
        <div className="admin-card">
          <span className="muted">Naves activas</span>
          <strong>{activeVehicles.length}</strong>
        </div>
        <div className="admin-card">
          <span className="muted">Asientos cargados</span>
          <strong>{totalSeats}</strong>
        </div>
        <div className="admin-card">
          <span className="muted">Plantillas</span>
          <strong>{VEHICLE_TEMPLATES.length}</strong>
        </div>
      </section>
      <table className="data-table">
        <thead>
          <tr>
            <th>Nave</th>
            <th>Marca / modelo</th>
            <th>Patente</th>
            <th>Capacidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td>{vehicle.name}</td>
              <td>{vehicle.brand} · {vehicle.model}</td>
              <td>{vehicle.licensePlate ?? "-"}</td>
              <td>{vehicle._count.seats} pasajeros</td>
              <td>
                <span className={`status-pill ${vehicle.isActive ? "active" : "inactive"}`}>
                  {vehicle.isActive ? "Activa" : "Inactiva"}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <Link className="ghost-button" href={`/admin/naves/${vehicle.id}`}>Editar</Link>
                  <form action={setVehicleActiveAction}>
                    <input type="hidden" name="id" value={vehicle.id} />
                    <input type="hidden" name="isActive" value={vehicle.isActive ? "false" : "true"} />
                    <button className="ghost-button" type="submit">
                      {vehicle.isActive ? "Inactivar" : "Activar"}
                    </button>
                  </form>
                  <form action={deleteVehicleAction}>
                    <input type="hidden" name="id" value={vehicle.id} />
                    <button className="danger-button" type="submit">
                      {vehicle._count.schedules > 0 ? "Archivar" : "Borrar"}
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminShell>
  );
}
