import Link from "next/link";
import type { NaveEnVivo } from "@/lib/driver/en-vivo";
import { AVISO_PREVIO_MINUTOS, type ServicioEvaluado, type ResumenDeServicios } from "@/lib/driver/servicios";

/**
 * Servicios del día cruzados con la unidad asignada.
 *
 * El tablero de salidas dice qué hay que cubrir; esto dice si la unidad que lo cubre está viva. Se
 * ordena por urgencia, no por hora: lo primero que se ve es lo que hay que resolver ahora.
 */

const AREA = { RUTA: "Ruta", AEROPUERTO: "Aeropuerto", CHAPELCO: "Chapelco", ESPECIAL: "Especial" } as const;

const NIVEL = {
  "sin-unidad": { clase: "es-riesgo", etiqueta: "Sin unidad" },
  "en-riesgo": { clase: "es-riesgo", etiqueta: "En riesgo" },
  atencion: { clase: "es-atencion", etiqueta: "Atención" },
  listo: { clase: "es-listo", etiqueta: "Listo" },
  futuro: { clase: "es-futuro", etiqueta: "Más tarde" },
  pasado: { clase: "es-pasado", etiqueta: "Ya salió" }
} as const;

function hora(fecha: Date | null) {
  if (!fecha) return "—";
  return fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" });
}

function faltan(minutos: number | null) {
  if (minutos == null) return "";
  if (minutos < -1) return `hace ${Math.abs(minutos)} min`;
  if (minutos <= 1) return "ahora";
  if (minutos < 60) return `en ${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `en ${h} h` : `en ${h} h ${m} min`;
}

function Punto({ estado }: { estado: NaveEnVivo["estado"] | "sin-posicion" }) {
  const clase = estado === "sin-posicion" ? "sin-posicion" : estado;
  return <span className={`srv-punto is-${clase}`} aria-hidden="true" />;
}

export function ServiciosDelDia({ resumen, fecha }: { resumen: ResumenDeServicios; fecha: string }) {
  const pendientes = resumen.evaluados.filter((servicio) => servicio.nivel !== "pasado");
  const pasados = resumen.evaluados.filter((servicio) => servicio.nivel === "pasado");
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const fechaLinda = new Date(Date.UTC(anio, mes - 1, dia)).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC"
  });

  return (
    <section className="srv" aria-labelledby="srv-titulo">
      <div className="srv-barra">
        <div>
          <h2 id="srv-titulo">Servicios del día</h2>
          <p className="srv-fecha">{fechaLinda.charAt(0).toUpperCase() + fechaLinda.slice(1)}</p>
        </div>
        <p className="srv-resumen">
          <strong>{resumen.total}</strong> servicios ·{" "}
          <span className={resumen.enRiesgo > 0 ? "srv-num-alerta" : "srv-num-ok"}>
            {resumen.enRiesgo} {resumen.enRiesgo === 1 ? "pide atención" : "piden atención"}
          </span>{" "}
          · <span className="srv-num-ok">{resumen.listos} listos</span>
        </p>
      </div>

      <p className="srv-nota">
        Se marca «en riesgo» cuando al servicio le faltan {AVISO_PREVIO_MINUTOS} minutos o menos y su unidad no
        reporta, está detenida o no tiene posición. Una unidad con señal de hace rato pero servicio lejano queda
        en «atención», para no llenar la pantalla de rojo a la mañana.
      </p>

      {pendientes.length === 0 ? (
        <p className="srv-vacio">
          {resumen.total === 0
            ? "No hay servicios cargados para ese día."
            : `Los ${resumen.total} servicios de ese día ya salieron. Abajo están con su unidad asignada.`}
        </p>
      ) : (
        <ul className="srv-lista">
          {pendientes.map((servicio) => (
            <li key={servicio.id} className={`srv-fila ${NIVEL[servicio.nivel].clase}`}>
              <div className="srv-hora">
                <strong>{hora(servicio.at)}</strong>
                <span>{faltan(servicio.minutosParaSalir)}</span>
              </div>

              <div className="srv-servicio">
                <p className="srv-tags">
                  <span className="srv-area">{AREA[servicio.area]}</span>
                  <span className="srv-nivel">{NIVEL[servicio.nivel].etiqueta}</span>
                  {servicio.pasajeros > 0 ? <span className="srv-pax">{servicio.pasajeros} pas.</span> : null}
                </p>
                <Link href={servicio.href} className="srv-titulo">{servicio.titulo}</Link>
                {servicio.detalle ? <span className="srv-detalle"> · {servicio.detalle}</span> : null}
              </div>

              <div className="srv-unidades">
                {servicio.unidades.length === 0 ? (
                  <Link className="srv-asignar" href={servicio.href}>Asignar nave</Link>
                ) : (
                  servicio.unidades.map((unidad) => {
                    const estado = servicio.estados.find((item) => item.vehicleId === unidad.vehicleId);
                    return (
                      <span key={unidad.vehicleId} className="srv-unidad">
                        <Punto estado={estado?.estado ?? "sin-posicion"} />
                        <span className="srv-unidad-nombre">{unidad.internalNumber ?? unidad.vehicleName}</span>
                        {unidad.driverName ? <span className="srv-chofer">{unidad.driverName}</span> : null}
                      </span>
                    );
                  })
                )}
              </div>

              <p className="srv-motivo">{servicio.motivo}</p>
            </li>
          ))}
        </ul>
      )}

      {pasados.length > 0 ? (
        <details className="srv-pasados">
          <summary>{pasados.length} servicio{pasados.length === 1 ? "" : "s"} que ya salió{pasados.length === 1 ? "" : "n"}</summary>
          <ul className="srv-lista">
            {pasados.map((servicio) => (
              <li key={servicio.id} className="srv-fila es-pasado">
                <div className="srv-hora"><strong>{hora(servicio.at)}</strong><span>{faltan(servicio.minutosParaSalir)}</span></div>
                <div className="srv-servicio">
                  <p className="srv-tags"><span className="srv-area">{AREA[servicio.area]}</span></p>
                  <Link href={servicio.href} className="srv-titulo">{servicio.titulo}</Link>
                </div>
                <div className="srv-unidades">
                  {servicio.unidades.map((unidad) => (
                    <span key={unidad.vehicleId} className="srv-unidad">
                      <span className="srv-unidad-nombre">{unidad.internalNumber ?? unidad.vehicleName}</span>
                    </span>
                  ))}
                </div>
                <p className="srv-motivo">{servicio.motivo}</p>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
