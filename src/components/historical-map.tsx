"use client";

import { useState } from "react";

const routes = [
  { name: "Circuito de los Siete Lagos", from: "San Martín de los Andes", to: "Villa La Angostura", color: "route-blue" },
  { name: "Cruce cordillerano", from: "San Martín de los Andes", to: "Hua Hum", color: "route-red" },
  { name: "Ruta del sur", from: "Bariloche", to: "Puerto Varas", color: "route-green" },
  { name: "Viajes por Argentina", from: "San Martín de los Andes", to: "Buenos Aires", color: "route-gold" }
];

function mapsDirections(from: string, to: string) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=driving`;
}

export function HistoricalMap() {
  const [selectedRoute, setSelectedRoute] = useState(routes[0]);

  return (
    <div className="historical-map google-map-card">
      <div className="map-heading">
        <div><span className="map-live-dot" /> Mapa de recorridos</div>
        <span>Histórico La Araucana</span>
      </div>
      <div className="google-map-layout">
        <div className="google-map-frame">
          <iframe
            title="Mapa de destinos y recorridos de La Araucana"
            src="https://www.google.com/maps?q=San+Mart%C3%ADn+de+los+Andes,+Neuqu%C3%A9n,+Argentina&z=4&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="map-location-badge"><span>●</span><div><strong>Patagonia Argentina</strong><small>Base La Araucana</small></div></div>
        </div>
        <aside className="route-panel">
          <p className="eyebrow">Destinos recorridos</p>
          <h3>Recorridos que<br /><span>nos inspiran.</span></h3>
          <p className="route-panel-copy">Seleccioná un recorrido para conocer el trayecto y abrirlo en Google Maps.</p>
          <div className="route-list">
            {routes.map((route) => <button className={`route-item ${selectedRoute.name === route.name ? "is-active" : ""}`} key={route.name} onClick={() => setSelectedRoute(route)}><span className={`route-marker ${route.color}`} /><span><strong>{route.name}</strong><small>{route.from} → {route.to}</small></span><span className="route-item-arrow">↗</span></button>)}
          </div>
          <a className="map-open-link" href={mapsDirections(selectedRoute.from, selectedRoute.to)} target="_blank" rel="noreferrer">Abrir recorrido en Google Maps <span>↗</span></a>
        </aside>
      </div>
      <div className="map-footer"><span className="route-line-sample" /> <strong>{selectedRoute.name}</strong><span>{selectedRoute.from} → {selectedRoute.to}</span></div>
    </div>
  );
}
