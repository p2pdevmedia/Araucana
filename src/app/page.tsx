import Link from "next/link";
import type { CSSProperties } from "react";
import { HistoricalMap } from "@/components/historical-map";
import { ServicesGrid } from "@/components/services-grid";
import { SiteFooter } from "@/components/site-footer";
import { listPublicRoutes } from "@/lib/booking/repository";
import laninWinter from "../../lanin-invierno.jpeg";
import laninSummer from "../../lanin-verano.jpeg";

export const revalidate = 300;

function todayDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Salta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

export default async function HomePage() {
  const routes = await listPublicRoutes();
  const heroStyle = { "--hero-image": `url(${laninWinter.src})` } as CSSProperties;
  const finalStyle = { "--final-image": `url(${laninSummer.src})` } as CSSProperties;
  const services = [
    { number: "01", title: "Servicio público", text: "Traful · Hua Hum · Yuco", href: "/rutas", tone: "service-green" },
    { number: "02", title: "Traslados de invierno", text: "Lago Hermoso Ski · Cerro Chapelco", href: "/rutas", tone: "service-snow" },
    { number: "03", title: "Traslados aeropuerto", text: "Desde y hacia el aeropuerto, puerta a puerta.", href: "#contacto", tone: "service-sky" },
    { number: "04", title: "Excursiones", text: "Experiencias para descubrir la región.", href: "#contacto", tone: "service-red" },
    { number: "05", title: "Creá tu viaje", text: "Grupales, privados y por todo el país.", href: "#contacto", tone: "service-dark" }
  ];
  return <>
    <section className="hero" style={heroStyle}><div className="hero-inner"><div className="hero-copy"><p className="eyebrow hero-eyebrow">San Martín de los Andes <span>•</span> Patagonia Argentina</p><h1 className="display-title">El placer<br />de <em>viajar.</em></h1><p className="hero-tagline">El destino lo elegís vos</p><div className="hero-actions"><Link className="cream-button" href="/rutas">Ver rutas y horarios <span>↗</span></Link><Link className="accent-button" href="/rutas">Reservar online <span>↗</span></Link></div></div><div className="hero-note"><span className="hero-note-dot" /> Agencia de viajes <strong>desde 2009</strong></div></div></section>
    <main>
      <section className="page-shell section services-section" id="servicios"><div className="section-head"><div><p className="eyebrow">Nuestros servicios</p><h2 className="section-title">Elegí tu próximo<br /><span>destino.</span></h2></div><p className="lead section-intro">Una forma más simple de descubrir la Patagonia. Elegí cómo querés viajar y nosotros nos ocupamos del resto.</p></div><ServicesGrid services={services} /></section>
      <section className="door-section compact-door-section page-shell"><div className="door-copy"><h2>Servicio<br /><em>puerta a puerta.</em></h2><p>Nosotros nos ocupamos del traslado.<br /><strong>Vos disfrutás el viaje.</strong></p><p className="door-extra">También podés guardar tu equipo o valija en nuestra oficina del centro durante el día.</p><Link className="light-link" href="#contacto">Conocé más <span>↗</span></Link></div><div className="door-visual"><p className="eyebrow eyebrow-light">Servicio gratuito</p><img src="/story-araucana.png" alt="Servicio puerta a puerta: desde tu origen hasta tu destino" /></div></section>
      <section className="booking-section page-shell" id="reservas"><div><p className="eyebrow">Tu próximo viaje empieza acá</p><h2 className="section-title">Reservá de forma<br /><span>simple y clara.</span></h2><p className="lead">Elegí tu ruta, fecha y horario. Si reservás fuera del horario de atención, recibimos tu solicitud y la confirmamos a partir de las 08:00 hs.</p></div><form className="booking-card booking-search-form" action="/rutas" method="get"><div className="booking-card-top"><span>Reserva online</span><span className="status-dot">● Disponible</span></div><div className="booking-row"><label><small>Origen</small><select name="from" defaultValue=""><option value="">Elegí un origen</option>{Array.from(new Set(routes.map((route) => route.from))).map((origin) => <option value={origin} key={origin}>{origin}</option>)}</select></label><span className="booking-arrow">→</span><label><small>Destino</small><select name="to" defaultValue=""><option value="">Elegí un destino</option>{Array.from(new Set(routes.map((route) => route.to))).map((destination) => <option value={destination} key={destination}>{destination}</option>)}</select></label></div><div className="booking-row booking-date"><label><small>Fecha de viaje</small><input type="date" name="date" defaultValue={todayDateKey()} /></label><button className="accent-button" type="submit">Buscar horarios ↗</button></div><p className="booking-help">Atención para confirmaciones: <strong>08:00 a 19:30 hs</strong></p></form></section>
      <section className="story-section page-shell" id="historia"><div className="story-mark"><img src="/logo.png" alt="La Araucana" /></div><div><p className="eyebrow">Nuestra historia</p><h2 className="section-title">Viajar nos<br /><span>conecta.</span></h2><p className="lead">Conectamos con viajeros que quieren descubrir la región.</p><p className="story-copy">Desde 2009, hacemos de cada traslado una parte importante del viaje: con experiencia local, atención humana y el compromiso de acompañarte en cada destino.</p><Link className="text-link" href="#contacto">Conocé La Araucana <span>↗</span></Link></div></section>
      <section className="map-section page-shell" id="mapa"><div className="section-head"><div><p className="eyebrow">Una historia que sigue viajando</p><h2 className="section-title">Destinos que<br /><span>nos inspiran.</span></h2></div><p className="lead section-intro">Explorá algunos de los lugares donde llegamos. Acercá el mapa para descubrirlos.</p></div><HistoricalMap /></section>
      <section className="trust-section page-shell"><div className="trust-badge">✓</div><div><p className="eyebrow">Respaldo institucional</p><h2>Empresa habilitada como<br /><span>Agencia de Turismo Estudiantil.</span></h2></div><p>Trayectoria, confianza y experiencia para que viajes con tranquilidad.</p></section>
      <section className="final-image" style={finalStyle}><div><p className="eyebrow eyebrow-light">Patagonia te espera</p><h2>El viaje<br />es <em>ahora.</em></h2><Link className="cream-button" href="/rutas">Empezá a viajar <span>↗</span></Link></div></section>
      <section className="contact-section page-shell" id="contacto"><div className="contact-copy"><p className="eyebrow">Ubicación y contacto</p><h2 className="section-title">Estamos para<br /><span>ayudarte.</span></h2><p className="lead">Nuestra oficina se encuentra en:</p><p className="address">Mariano Moreno 829<br />San Martín de los Andes<br />C.P. 8370 · Neuquén<br />Patagonia Argentina</p><a className="text-link" href="https://www.google.com/maps/search/?api=1&query=Mariano+Moreno+829+San+Martin+de+los+Andes" target="_blank" rel="noreferrer">Ver ubicación en Google Maps ↗</a></div><div className="contact-card"><div><small>Hablemos</small><a href="tel:+542972420285">02972 420285</a><a href="mailto:info@araucana.com.ar">info@araucana.com.ar</a><a href="https://araucana.tur.ar" target="_blank" rel="noreferrer">www.araucana.tur.ar</a></div><div className="socials"><a className="whatsapp" href="https://wa.me/5492944649049" target="_blank" rel="noreferrer">WhatsApp ↗</a><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://www.tiktok.com/" target="_blank" rel="noreferrer">TikTok ↗</a></div></div></section>
    </main><SiteFooter />
  </>;
}
