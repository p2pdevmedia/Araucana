"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, Marker, Polyline } from "leaflet";
import type { EstadoDeNaveEnVivo, FlotaEnVivo, NaveEnVivo } from "@/lib/driver/en-vivo";
import type { Recorrido } from "@/lib/driver/recorrido";
import "leaflet/dist/leaflet.css";

/** Cada cuánto se vuelven a pedir las posiciones. Criterio de Jugue en #316: el panel lee cada 30 s
 *  (no cada 3 s, que es lo que reporta el chofer) — así la nave se ve moverse sin castigar la base ni el
 *  teléfono de quien mira. El envío del chofer mantiene su ritmo propio. */
const REFRESCO_MS = 30_000;

/** Los recorridos se piden aparte, más espaciado: si falla el historial no se cae el mapa de posiciones. */
const REFRESCO_RECORRIDOS_MS = 60_000;

/** El marcador avanza de a un paso por segundo en vez de saltar: la unidad «se mueve» (#321). */
const PASO_ANIMACION_MS = 1_000;

/** Un salto más grande que esto es un GPS perdido o un cambio de unidad: ahí no se anima, se corrige. */
const SALTO_MAXIMO_ANIMADO_M = 3_000;

/** Colores de las líneas: se repiten en orden y la lista usa el mismo para identificar el recorrido. */
const COLORES = ["#1f7a5e", "#2f6fb0", "#a2562f", "#7a4fa3", "#b8860b", "#357a80", "#8c3d5e", "#4d6b2f"];

/** San Martín de los Andes: el encuadre inicial cuando todavía no hay ninguna nave reportando. */
const CENTRO_SMA: [number, number] = [-40.1579, -71.3534];

const ETIQUETA: Record<EstadoDeNaveEnVivo, string> = {
  "en-movimiento": "En movimiento",
  detenida: "Detenida",
  "sin-senal": "Sin señal"
};

const horaArgentina = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

function hace(minutos: number) {
  if (minutos <= 0) return "recién";
  return minutos === 1 ? "hace 1 min" : `hace ${minutos} min`;
}

function desdeHaceMinutos(minutos: number) {
  return horaArgentina.format(new Date(Date.now() - minutos * 60_000));
}

function haceSegundos(segundos: number) {
  const minutos = Math.floor(segundos / 60);
  return minutos < 1 ? "hace menos de un minuto" : hace(minutos);
}

function nombreDeNave(nave: NaveEnVivo) {
  return nave.internalNumber ? `Interno ${nave.internalNumber}` : nave.vehicleName;
}

function kilometros(metros: number) {
  return metros >= 1000 ? `${(metros / 1000).toFixed(1).replace(".", ",")} km` : `${metros} m`;
}

/** Distancia aproximada entre dos coordenadas, para decidir si el salto se anima o se corrige. */
function metrosEntre(a: [number, number], b: [number, number]) {
  const dLat = (b[0] - a[0]) * 111_320;
  const dLng = (b[1] - a[1]) * 111_320 * Math.cos((a[0] * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

type FilaChofer = {
  driverId: string;
  nombre: string;
  unidad: string;
  estado: EstadoDeNaveEnVivo | "sin-dato";
  detalle: string;
  minutos: number | null;
  metros: number | null;
  nave: NaveEnVivo | null;
};

const ORDEN_FILA: Record<FilaChofer["estado"], number> = {
  "en-movimiento": 0,
  detenida: 1,
  "sin-senal": 2,
  "sin-dato": 3
};

export function FlotaEnVivoMapa({
  inicial,
  recorridosIniciales
}: {
  inicial: FlotaEnVivo;
  recorridosIniciales: Recorrido[];
}) {
  const [flota, setFlota] = useState(inicial);
  const [recorridos, setRecorridos] = useState(recorridosIniciales);
  const [verRecorridos, setVerRecorridos] = useState(true);
  const [error, setError] = useState("");
  const [reloj, setReloj] = useState(() => Date.now());
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<LeafletMap | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const marcadores = useRef(new Map<string, Marker>());
  const lineas = useRef(new Map<string, Polyline>());
  const animaciones = useRef(new Map<string, number>());
  const encuadreHecho = useRef(false);
  // El dibujo de las líneas lee el estado actual sin obligar a recrear el mapa.
  const verRecorridosRef = useRef(verRecorridos);
  verRecorridosRef.current = verRecorridos;

  const globoRecorrido = useCallback((recorrido: Recorrido) => {
    const nombre = recorrido.driverName ?? "Chofer sin nombre";
    const unidad = recorrido.internalNumber ? `Interno ${recorrido.internalNumber}` : recorrido.vehicleName;
    return `${nombre} · ${unidad} · ${kilometros(recorrido.metros)}`;
  }, []);

  /** Dibuja, mueve o apaga las líneas de recorrido sin tocar los marcadores. */
  const dibujarRecorridos = useCallback(
    (datos: Recorrido[]) => {
      const L = leaflet.current;
      const map = mapa.current;
      if (!L || !map) return;

      if (!verRecorridosRef.current) {
        for (const linea of lineas.current.values()) linea.remove();
        lineas.current.clear();
        return;
      }

      const vistos = new Set<string>();
      datos.forEach((recorrido, indice) => {
        if (recorrido.puntos.length < 2) return;
        vistos.add(recorrido.driverId);
        const puntos = recorrido.puntos.map((punto) => punto.punto);
        const color = COLORES[indice % COLORES.length];
        const existente = lineas.current.get(recorrido.driverId);

        if (existente) {
          existente.setLatLngs(puntos);
          existente.setStyle({ color });
          existente.setTooltipContent(globoRecorrido(recorrido));
          return;
        }

        const linea = L.polyline(puntos, { color, weight: 4, opacity: 0.82, lineJoin: "round" }).addTo(map);
        linea.bindTooltip(globoRecorrido(recorrido), { sticky: true });
        lineas.current.set(recorrido.driverId, linea);
      });

      for (const [driverId, linea] of lineas.current) {
        if (vistos.has(driverId)) continue;
        linea.remove();
        lineas.current.delete(driverId);
      }
    },
    [globoRecorrido]
  );

  /** Mueve el marcador en pasos: la unidad avanza por el mapa en vez de aparecer teletransportada. */
  const moverConSuavidad = useCallback((vehicleId: string, marcador: Marker, hasta: [number, number]) => {
    const previa = animaciones.current.get(vehicleId);
    if (previa) window.clearInterval(previa);

    const actual = marcador.getLatLng();
    const desde: [number, number] = [actual.lat, actual.lng];
    const metros = metrosEntre(desde, hasta);
    // Quieta, o un salto imposible: se corrige de una y no se anima una mentira.
    if (metros < 3 || metros > SALTO_MAXIMO_ANIMADO_M) {
      marcador.setLatLng(hasta);
      return;
    }

    const pasos = Math.max(1, Math.round(REFRESCO_MS / PASO_ANIMACION_MS));
    let paso = 0;
    const id = window.setInterval(() => {
      paso += 1;
      const t = paso / pasos;
      marcador.setLatLng([desde[0] + (hasta[0] - desde[0]) * t, desde[1] + (hasta[1] - desde[1]) * t]);
      if (paso >= pasos) {
        window.clearInterval(id);
        animaciones.current.delete(vehicleId);
      }
    }, PASO_ANIMACION_MS);
    animaciones.current.set(vehicleId, id);
  }, []);

  const sincronizar = useCallback(
    (datos: FlotaEnVivo) => {
      const L = leaflet.current;
      const map = mapa.current;
      if (!L || !map) return;

      const vistos = new Set<string>();
      for (const nave of datos.naves) {
        vistos.add(nave.vehicleId);
        const posicion: [number, number] = [nave.latitude, nave.longitude];
        const icono = L.divIcon({
          className: `flota-pin is-${nave.estado}`,
          html: "<span></span>",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          popupAnchor: [0, -12]
        });
        const globo = () => {
          const el = document.createElement("div");
          el.className = "flota-globo";
          const titulo = document.createElement("strong");
          titulo.textContent = nombreDeNave(nave);
          const linea = document.createElement("span");
          linea.textContent = `${ETIQUETA[nave.estado]} · ${nave.driverName ?? "sin chofer"}${
            nave.estado !== "sin-senal" && nave.speedKmh != null ? ` · ${Math.round(nave.speedKmh)} km/h` : ""
          } · ${hace(nave.minutosDesdeLaSenal)}`;
          const hora = document.createElement("small");
          hora.textContent = `Última señal: ${horaArgentina.format(new Date(nave.recordedAt))}`;
          el.append(titulo, linea, hora);
          return el;
        };

        const existente = marcadores.current.get(nave.vehicleId);
        if (existente) {
          existente.setIcon(icono);
          existente.setPopupContent(globo());
          moverConSuavidad(nave.vehicleId, existente, posicion);
          continue;
        }

        const marcador = L.marker(posicion, { icon: icono, title: nombreDeNave(nave) }).addTo(map);
        marcador.bindPopup(globo);
        marcadores.current.set(nave.vehicleId, marcador);
      }

      for (const [vehicleId, marcador] of marcadores.current) {
        if (vistos.has(vehicleId)) continue;
        const animacion = animaciones.current.get(vehicleId);
        if (animacion) window.clearInterval(animacion);
        animaciones.current.delete(vehicleId);
        marcador.remove();
        marcadores.current.delete(vehicleId);
      }

      // El encuadre se hace una sola vez: si se repitiera en cada refresco, el mapa se movería solo
      // mientras el operador lo está mirando. Incluye las naves sin señal: su última posición también
      // tiene que entrar en el encuadre, si no «no desaparecen» sólo en la lista.
      if (!encuadreHecho.current && datos.naves.length > 0) {
        map.fitBounds(datos.naves.map((nave) => [nave.latitude, nave.longitude] as [number, number]), {
          padding: [48, 48],
          maxZoom: 14
        });
        encuadreHecho.current = true;
      }
    },
    [moverConSuavidad]
  );

  useEffect(() => {
    let cancelado = false;

    async function crearMapa() {
      const L = await import("leaflet");
      if (cancelado || !contenedor.current || mapa.current) return;
      const map = L.map(contenedor.current, { scrollWheelZoom: true, zoomControl: true }).setView(CENTRO_SMA, 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19
      }).addTo(map);
      leaflet.current = L;
      mapa.current = map;
      window.setTimeout(() => map.invalidateSize(), 150);
      sincronizar(flota);
      dibujarRecorridos(recorridos);
    }

    void crearMapa();

    return () => {
      cancelado = true;
      for (const id of animaciones.current.values()) window.clearInterval(id);
      animaciones.current.clear();
      mapa.current?.remove();
      mapa.current = null;
      leaflet.current = null;
      marcadores.current.clear();
      lineas.current.clear();
    };
    // `flota` y `recorridos` sólo se usan para el primer dibujo; los refrescos los manejan los efectos de abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sincronizar, dibujarRecorridos]);

  useEffect(() => {
    sincronizar(flota);
  }, [flota, sincronizar]);

  useEffect(() => {
    dibujarRecorridos(recorridos);
  }, [recorridos, verRecorridos, dibujarRecorridos]);

  useEffect(() => {
    let cancelado = false;

    async function traer() {
      try {
        const respuesta = await fetch("/api/v1/admin/driver-locations", { cache: "no-store" });
        if (!respuesta.ok) throw new Error("sin respuesta");
        const datos = (await respuesta.json()) as { flota: FlotaEnVivo };
        if (cancelado) return;
        setFlota(datos.flota);
        setReloj(Date.now());
        setError("");
      } catch {
        if (!cancelado) setError("No pudimos actualizar las posiciones. Seguimos reintentando.");
      }
    }

    const intervalo = window.setInterval(() => void traer(), REFRESCO_MS);
    const alVolver = () => {
      if (document.visibilityState === "visible") void traer();
    };
    document.addEventListener("visibilitychange", alVolver);

    return () => {
      cancelado = true;
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function traerRecorridos() {
      try {
        const respuesta = await fetch("/api/v1/admin/driver-trails", { cache: "no-store" });
        if (!respuesta.ok) return;
        const datos = (await respuesta.json()) as { recorridos: Recorrido[] };
        if (!cancelado) setRecorridos(datos.recorridos);
      } catch {
        // Si falla se sigue mostrando la línea que ya estaba: un timeout no debe borrar el recorrido.
      }
    }

    const intervalo = window.setInterval(() => void traerRecorridos(), REFRESCO_RECORRIDOS_MS);
    return () => {
      cancelado = true;
      window.clearInterval(intervalo);
    };
  }, []);

  useEffect(() => {
    const intervalo = window.setInterval(() => setReloj(Date.now()), 5000);
    return () => window.clearInterval(intervalo);
  }, []);

  const segundosDesdeLaActualizacion = Math.max(
    0,
    Math.floor((reloj - new Date(flota.actualizadoEn).getTime()) / 1000)
  );
  const vivas = flota.naves.filter((nave) => nave.estado !== "sin-senal").length;
  const sinSenal = flota.naves.length - vivas;

  const metrosPorChofer = useMemo(
    () => new Map(recorridos.map((recorrido) => [recorrido.driverId, recorrido.metros])),
    [recorridos]
  );

  /** Seguimiento por chofer: la persona primero, la unidad como dato de la ficha. */
  const filas = useMemo<FilaChofer[]>(() => {
    const lista: FilaChofer[] = flota.naves.map((nave) => ({
      driverId: nave.driverId,
      nombre: nave.driverName ?? "Chofer sin nombre",
      unidad: nombreDeNave(nave),
      estado: nave.estado,
      detalle:
        nave.estado === "detenida"
          ? `Parado ${haceSegundos(nave.stoppedDurationSeconds)}`
          : nave.estado === "sin-senal"
            ? `Última señal ${hace(nave.minutosDesdeLaSenal)}`
            : nave.speedKmh != null
              ? `${Math.round(nave.speedKmh)} km/h`
              : "Reportando",
      minutos: nave.minutosDesdeLaSenal,
      metros: metrosPorChofer.get(nave.driverId) ?? null,
      nave
    }));

    for (const chofer of flota.sinUbicacion) {
      lista.push({
        driverId: chofer.driverId,
        nombre: chofer.driverName ?? "Chofer sin nombre",
        unidad: "sin unidad",
        estado: "sin-dato",
        detalle: "No mandó posición",
        minutos: null,
        metros: null,
        nave: null
      });
    }

    return lista.sort(
      (a, b) => ORDEN_FILA[a.estado] - ORDEN_FILA[b.estado] || a.nombre.localeCompare(b.nombre, "es")
    );
  }, [flota, metrosPorChofer]);

  function enfocar(nave: NaveEnVivo) {
    const map = mapa.current;
    if (!map) return;
    map.panTo([nave.latitude, nave.longitude], { animate: true });
    marcadores.current.get(nave.vehicleId)?.openPopup();
  }

  return (
    <section className="flota-en-vivo">
      <div className="flota-en-vivo-estado" role="status">
        <span>
          <span className="flota-punto is-en-movimiento" aria-hidden="true" /> {vivas} reportando
        </span>
        <span>
          <span className="flota-punto is-sin-senal" aria-hidden="true" /> {sinSenal} sin señal
        </span>
        <span>
          <span className="flota-punto is-recorrido" aria-hidden="true" /> {recorridos.length} recorridos
        </span>
        <button
          type="button"
          className="flota-toggle"
          aria-pressed={verRecorridos}
          onClick={() => setVerRecorridos((valor) => !valor)}
        >
          {verRecorridos ? "Ocultar recorridos" : "Ver recorridos"}
        </button>
        <span className="flota-en-vivo-refresco">
          Actualizado{" "}
          {segundosDesdeLaActualizacion < 60
            ? `hace ${segundosDesdeLaActualizacion} s`
            : hace(Math.floor(segundosDesdeLaActualizacion / 60))}
        </span>
      </div>

      {error ? (
        <p className="flota-en-vivo-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flota-en-vivo-grid">
        <div ref={contenedor} className="flota-mapa" role="application" aria-label="Mapa de las naves en vivo" />

        <aside className="flota-panel">
          <h2>
            Choferes <span>{filas.length}</span>
          </h2>
          {filas.length === 0 ? (
            <p className="flota-panel-vacio">
              Todavía no hay ningún chofer reportando. La posición llega cuando el chofer abre su panel
              en el celular.
            </p>
          ) : (
            <ul>
              {filas.map((fila) => {
                const indice = recorridos.findIndex((recorrido) => recorrido.driverId === fila.driverId);
                return (
                  <li key={fila.driverId}>
                    <button
                      type="button"
                      className="flota-fila"
                      data-estado={fila.estado}
                      onClick={() => fila.nave && enfocar(fila.nave)}
                      disabled={!fila.nave}
                    >
                      <span className={`flota-punto is-${fila.estado}`} aria-hidden="true" />
                      <span className="flota-fila-texto">
                        <strong>{fila.nombre}</strong>
                        <small>
                          {fila.unidad} · {fila.detalle}
                        </small>
                        {fila.metros != null ? (
                          <small
                            className="flota-fila-recorrido"
                            style={indice >= 0 ? { color: COLORES[indice % COLORES.length] } : undefined}
                          >
                            Recorrido {kilometros(fila.metros)}
                          </small>
                        ) : null}
                      </span>
                      <span className="flota-fila-hora">
                        {fila.minutos == null ? "—" : desdeHaceMinutos(fila.minutos)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {recorridos.length === 0 ? (
            <p className="flota-panel-vacio">
              Todavía no hay recorrido para dibujar: hace falta que el chofer se mueva un rato con el panel
              abierto. Los puntos a menos de 25 m no se dibujan porque el GPS quieto tiembla.
            </p>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
