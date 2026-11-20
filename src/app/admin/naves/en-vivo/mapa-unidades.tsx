"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker, Polyline } from "leaflet";
import type { NaveEnVivo } from "@/lib/driver/en-vivo";
import type { Recorrido } from "@/lib/driver/recorrido";
import { colorRecorrido, distanciaVisible, horaSenal, nombreUnidad, puedeAnimar } from "@/lib/driver/mapa-vivo";
import "leaflet/dist/leaflet.css";

export const claveUnidad = (n: { driverId: string; vehicleId: string }) => `${n.driverId}/${n.vehicleId}`;
const ESTADO = { "en-movimiento": "En movimiento", detenida: "Detenida", "sin-senal": "Sin señal" };
const textoSeguro = (texto: string) => { const el = document.createElement("span"); el.textContent = texto; return el; };

export function MapaUnidades({ naves, recorridos, mostrar, seleccion, onSeleccion, encuadre }: {
  naves: NaveEnVivo[]; recorridos: Recorrido[]; mostrar: boolean; seleccion: string | null;
  onSeleccion: (clave: string) => void; encuadre: { tipo: "todas" | "recorrido"; numero: number };
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<LeafletMap | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const pins = useRef(new Map<string, { marker: Marker; dato: NaveEnVivo }>());
  const lineas = useRef<Polyline[]>([]);
  const animaciones = useRef(new Map<string, number>());
  const seleccionRef = useRef(onSeleccion);
  seleccionRef.current = onSeleccion;
  const inicial = useRef(false);
  const [listo, setListo] = useState(false);
  const [errorMapa, setErrorMapa] = useState("");
  const [errorTiles, setErrorTiles] = useState(false);

  useEffect(() => {
    let cancelado = false;
    let observer: ResizeObserver | undefined;
    void import("leaflet").then((L) => {
      if (cancelado || !contenedor.current) return;
      const map = L.map(contenedor.current, { scrollWheelZoom: false }).setView([-40.1579, -71.3534], 12);
      const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors", maxZoom: 19
      }).addTo(map);
      tiles.on("tileerror", () => { if (!cancelado) setErrorTiles(true); });
      leaflet.current = L;
      mapa.current = map;
      observer = new ResizeObserver(() => map.invalidateSize());
      observer.observe(contenedor.current);
      setListo(true);
    }).catch(() => { if (!cancelado) setErrorMapa("No se pudo cargar el mapa. La lista de unidades sigue disponible; recargá la página para reintentar."); });
    return () => {
      cancelado = true;
      observer?.disconnect();
      for (const id of animaciones.current.values()) cancelAnimationFrame(id);
      animaciones.current.clear();
      mapa.current?.remove();
      mapa.current = null;
      pins.current.clear();
      lineas.current = [];
      inicial.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapa.current;
    const L = leaflet.current;
    if (!listo || !map || !L) return;
    const vistos = new Set<string>();
    const reducir = matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const nave of naves) {
      const key = nave.vehicleId;
      vistos.add(key);
      const posicion: [number, number] = [nave.latitude, nave.longitude];
      const globo = document.createElement("div");
      globo.className = "flota-globo";
      for (const texto of [nombreUnidad(nave), nave.driverName ?? "Chofer sin nombre", ESTADO[nave.estado],
        `Última señal: ${horaSenal(nave.recordedAt)} · hace ${nave.minutosDesdeLaSenal} min`]) globo.append(textoSeguro(texto));
      const icon = L.divIcon({ className: `flota-pin is-${nave.estado}`, html: "<span></span>",
        iconSize: [22, 22], iconAnchor: [11, 11] });
      let entrada = pins.current.get(key);
      if (!entrada) {
        const marker = L.marker(posicion, { icon, title: nombreUnidad(nave) }).addTo(map).bindPopup(globo);
        marker.on("click", () => { const actual = pins.current.get(key); if (actual) seleccionRef.current(claveUnidad(actual.dato)); });
        entrada = { marker, dato: nave };
        pins.current.set(key, entrada);
        marker.bindTooltip(textoSeguro(nombreUnidad(nave)), { permanent: true, direction: "top", offset: [0, -11], className: "flota-pin-etiqueta" });
      } else {
        const { marker, dato: anterior } = entrada;
        marker.setIcon(icon).setPopupContent(globo);
        marker.setTooltipContent(textoSeguro(nombreUnidad(nave)));
        const nuevoReporte = anterior.recordedAt !== nave.recordedAt || anterior.driverId !== nave.driverId;
        if (nuevoReporte || nave.estado === "sin-senal") {
          const raf = animaciones.current.get(key);
          if (raf != null) cancelAnimationFrame(raf);
          animaciones.current.delete(key);
          if (nuevoReporte && puedeAnimar(anterior, nave, reducir)) {
            const origen = marker.getLatLng();
            const inicio = performance.now();
            const avanzar = (ahora: number) => {
              const t = Math.min(1, (ahora - inicio) / 1000);
              marker.setLatLng([origen.lat + (posicion[0] - origen.lat) * t, origen.lng + (posicion[1] - origen.lng) * t]);
              if (t < 1) animaciones.current.set(key, requestAnimationFrame(avanzar));
              else animaciones.current.delete(key);
            };
            animaciones.current.set(key, requestAnimationFrame(avanzar));
          } else marker.setLatLng(posicion);
        }
        entrada.dato = nave;
      }
      entrada.marker.setOpacity(seleccion && claveUnidad(nave) !== seleccion ? 0.45 : 1);
      entrada.marker.setZIndexOffset(claveUnidad(nave) === seleccion ? 1000 : 0);
    }
    for (const [key, entrada] of pins.current) {
      if (vistos.has(key)) continue;
      const raf = animaciones.current.get(key);
      if (raf != null) cancelAnimationFrame(raf);
      animaciones.current.delete(key);
      entrada.marker.remove(); pins.current.delete(key);
    }
    if (!inicial.current && naves.length) {
      map.fitBounds(naves.map(n => [n.latitude, n.longitude] as [number, number]), { padding: [45, 45], maxZoom: 14 });
      inicial.current = true;
    }
  }, [listo, naves, seleccion]);

  useEffect(() => {
    const map = mapa.current;
    const L = leaflet.current;
    if (!listo || !map || !L) return;
    for (const linea of lineas.current) linea.remove();
    lineas.current = [];
    if (!mostrar) return;
    for (const recorrido of recorridos) {
      if (recorrido.puntos.length < 2 || (seleccion && claveUnidad(recorrido) !== seleccion)) continue;
      const linea = L.polyline(recorrido.puntos.map(p => p.punto), {
        color: colorRecorrido(recorrido.driverId), weight: seleccion ? 5 : 3, opacity: 0.8
      }).addTo(map);
      linea.bindTooltip(textoSeguro(`${recorrido.driverName ?? "Chofer"} · ${recorrido.internalNumber ?? recorrido.vehicleName} · ≈ ${distanciaVisible(recorrido.metros)}`), { sticky: true });
      linea.on("click", () => seleccionRef.current(claveUnidad(recorrido)));
      lineas.current.push(linea);
    }
  }, [listo, recorridos, seleccion, mostrar]);

  useEffect(() => {
    if (!listo || !mapa.current || encuadre.numero === 0) return;
    const puntos: [number, number][] = encuadre.tipo === "recorrido"
      ? recorridos.filter(r => !seleccion || claveUnidad(r) === seleccion).flatMap(r => r.puntos.map(p => p.punto))
      : naves.map(n => [n.latitude, n.longitude]);
    if (puntos.length) mapa.current.fitBounds(puntos, { padding: [48, 48], maxZoom: 15, animate: false });
    // Sólo una acción del operador cambia el encuadre, nunca el polling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encuadre, listo]);

  useEffect(() => {
    if (!seleccion || !listo) return;
    const entrada = [...pins.current.values()].find(p => claveUnidad(p.dato) === seleccion);
    if (entrada && mapa.current) {
      mapa.current.panTo(entrada.marker.getLatLng(), { animate: !matchMedia("(prefers-reduced-motion: reduce)").matches });
      entrada.marker.openPopup();
    }
  }, [seleccion, listo]);

  return <div className="flota-mapa-wrap">
    <div ref={contenedor} className="flota-mapa" aria-label="Mapa de últimas posiciones y recorridos" />
    {errorMapa ? <p className="flota-en-vivo-error" role="alert">{errorMapa}</p> : !listo ? <p role="status">Cargando mapa…</p> : null}
    {errorTiles && <p className="flota-en-vivo-error" role="status">El mapa base no cargó por completo. Las posiciones y la lista siguen disponibles.</p>}
  </div>;
}
