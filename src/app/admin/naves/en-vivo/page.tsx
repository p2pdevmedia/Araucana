import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { cargarFlotaEnVivo, VENTANA_SENAL_MINUTOS } from "@/lib/driver/en-vivo";
import { cargarRecorridos, VENTANA_RECORRIDO_HORAS } from "@/lib/driver/recorrido";
import { FlotaEnVivoMapa } from "./flota-en-vivo-mapa";
import "./en-vivo.css";

export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false, follow: false } };

/**
 * Mapa en vivo de la flota (issues #316 y #321). El dato ya se guardaba: `DriverVehicleLocation` (última
 * posición, la escribe el panel del chofer cada 3 s) y `DriverLocationSample` (el historial, que hasta
 * #321 no leía nadie). Lo que faltaba era quién lo mirara desde la operación.
 */
export default async function NavesEnVivoPage() {
  const sessionUser = await getCurrentAdminOrRedirect();
  const [flota, recorridos] = await Promise.all([cargarFlotaEnVivo(), cargarRecorridos()]);

  return (
    <AdminShell
      role={sessionUser.role}
      title="Naves en vivo"
      action={
        <Link className="ghost-button" href="/admin/naves">
          Volver al tablero
        </Link>
      }
    >
      <p className="lead flota-en-vivo-intro">
        Dónde está cada unidad que tiene el panel del chofer abierto y por dónde pasó en las últimas{" "}
        {VENTANA_RECORRIDO_HORAS} horas. Las posiciones se actualizan cada 30 segundos y el punto se mueve
        al llegar cada reporte nuevo, sin inventar el tramo intermedio. Una nave que deja de reportar sigue
        en su última posición, marcada como <strong>sin señal</strong> después de {VENTANA_SENAL_MINUTOS}{" "}
        minutos. La línea se corta cuando cambia la unidad o hay un hueco de más de 10 minutos: no se une
        lo que no fue un viaje continuo.
      </p>

      <FlotaEnVivoMapa inicial={flota} recorridosIniciales={recorridos} />
    </AdminShell>
  );
}
