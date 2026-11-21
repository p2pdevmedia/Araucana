import Link from "next/link";
import type { ResumenDeServicios } from "@/lib/driver/servicios";

/**
 * Aviso arriba del mapa: mientras alguien mira las unidades, esto le dice si algún servicio del día
 * se está quedando sin cobertura. Sin este renglón, el mapa y los servicios son dos mundos y el
 * operador tiene que acordarse de cambiar de pestaña.
 */
export function AvisoDeServicios({ resumen, fecha }: { resumen: ResumenDeServicios; fecha: string }) {
  const pendientes = resumen.evaluados.filter(
    (servicio) => servicio.nivel === "sin-unidad" || servicio.nivel === "en-riesgo"
  );
  if (pendientes.length === 0) return null;

  const primeros = pendientes.slice(0, 2);
  const resto = pendientes.length - primeros.length;

  return (
    <aside className="aviso-servicios" role="status">
      <strong className="aviso-servicios-titulo">
        {pendientes.length} {pendientes.length === 1 ? "servicio pide" : "servicios piden"} atención
      </strong>
      <ul>
        {primeros.map((servicio) => (
          <li key={servicio.id}>
            {servicio.at
              ? servicio.at.toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                  timeZone: "America/Argentina/Buenos_Aires"
                })
              : "sin hora"}{" "}
            · {servicio.titulo} — {servicio.motivo}
          </li>
        ))}
      </ul>
      {resto > 0 ? <span className="aviso-servicios-resto">y {resto} más</span> : null}
      <Link className="aviso-servicios-link" href={`/admin/naves/en-vivo?vista=servicios&fecha=${fecha}`}>
        Ver servicios
      </Link>
    </aside>
  );
}
