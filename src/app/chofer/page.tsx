import { BrandMark } from "@/components/brand-mark";
import { getCurrentDriverOrRedirect } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { LogoutButton } from "../admin/logout-button";
import { DriverLocationPanel } from "./driver-location-panel";
import { ChapelcoDriverPanel } from "./chapelco-driver-panel";
import { getDriverChapelcoManifest, todayServiceDateKey } from "@/lib/chapelco/repository";

export default async function DriverPage() {
  const user = await getCurrentDriverOrRedirect();
  const [vehicles, currentLocation, chapelcoRuns] = await Promise.all([
    prisma.vehicle.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: "asc"
      },
      select: {
        id: true,
        name: true,
        brand: true,
        model: true,
        licensePlate: true
      }
    }),
    prisma.driverVehicleLocation.findUnique({
      where: {
        driverId: user.id
      },
      select: {
        vehicleId: true
      }
    }),
    getDriverChapelcoManifest(user.id, todayServiceDateKey())
  ]);

  return (
    <main className="page-shell section">
      <div className="admin-top" style={{ marginBottom: 24 }}>
        <div className="brand-lockup">
          <BrandMark color="#1F5B4F" size={36} />
          <div>
            <span className="brand-name">Araucana</span>
            <span className="brand-kicker">Chofer</span>
          </div>
        </div>
        <LogoutButton />
      </div>

      <div className="admin-edit-head">
        <div>
          <p className="eyebrow">Operacion</p>
          <h1 className="section-title">Ubicacion de nave</h1>
          <p className="lead">Ingresaste como {user.email}.</p>
        </div>
      </div>

      <DriverLocationPanel vehicles={vehicles} initialVehicleId={currentLocation?.vehicleId} />
      <ChapelcoDriverPanel runs={chapelcoRuns} />
    </main>
  );
}
