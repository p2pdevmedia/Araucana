"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Service = { number: string; title: string; text: string; href: string; tone: string };
type Destination = { title: string; detail: string; to: string; accent: string };

const destinationGroups: Record<string, Destination[]> = {
  "01": [
    { title: "Villa Traful", detail: "Lagos, bosque y caminos de montaña", to: "Villa Traful", accent: "#33594e" },
    { title: "Hua Hum", detail: "Lago Lácar, frontera y naturaleza", to: "Hua Hum", accent: "#315e87" },
    { title: "Yuco", detail: "Una parada junto al lago Lácar", to: "Hua Hum", accent: "#a2281b" }
  ],
  "02": [
    { title: "Lago Hermoso Ski", detail: "Nieve, montaña y aventura", to: "Chapelco", accent: "#315e87" },
    { title: "Cerro Chapelco", detail: "Tu traslado a la nieve", to: "Chapelco", accent: "#33594e" },
    { title: "Invierno en la Patagonia", detail: "Armá tu día en la montaña", to: "Chapelco", accent: "#a2281b" }
  ]
};

export function ServicesGrid({ services }: { services: Service[] }) {
  const router = useRouter();
  const [openService, setOpenService] = useState<Service | null>(null);

  useEffect(() => {
    if (!openService) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpenService(null); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openService]);

  function chooseDestination(destination: Destination) {
    const params = new URLSearchParams({ from: "San Martin de los Andes", to: destination.to });
    router.push(`/rutas?${params.toString()}`);
  }

  return <>
    <div className="services-grid">{services.map((service) => {
      const destinations = destinationGroups[service.number];
      const content = <><span className="service-number">{service.number}</span><span className="service-arrow">↗</span><div className="service-icon">{service.number === "01" ? "⌁" : service.number === "02" ? "✦" : service.number === "03" ? "⌁" : service.number === "04" ? "◌" : "＋"}</div><h3>{service.title}</h3><p>{service.text}</p></>;
      return destinations ? <button className={`service-card ${service.tone} service-card-button`} key={service.number} onClick={() => setOpenService(service)} aria-haspopup="dialog">{content}</button> : <Link className={`service-card ${service.tone}`} href={service.href} key={service.number}>{content}</Link>;
    })}</div>
    {openService && <div className="destination-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpenService(null); }}><section className="destination-modal" role="dialog" aria-modal="true" aria-labelledby="destination-modal-title"><button className="destination-modal-close" onClick={() => setOpenService(null)} aria-label="Cerrar">×</button><p className="eyebrow">{openService.title}</p><h2 id="destination-modal-title">Elegí tu<br /><span>destino.</span></h2><p className="destination-modal-intro">Seleccioná una opción y cargamos automáticamente la búsqueda de rutas.</p><div className="destination-options">{destinationGroups[openService.number].map((destination, index) => <button className="destination-option" key={destination.title} onClick={() => chooseDestination(destination)}><span className="destination-option-number">0{index + 1}</span><span className="destination-option-art" style={{ background: `linear-gradient(135deg, ${destination.accent}, #183b32)` }} /><span className="destination-option-copy"><strong>{destination.title}</strong><small>{destination.detail}</small></span><span className="destination-option-arrow">↗</span></button>)}</div></section></div>}
  </>;
}
