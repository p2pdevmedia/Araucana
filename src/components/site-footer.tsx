import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="brand-lockup"><img className="footer-logo" src="/logo.png" alt="La Araucana Viajes" /><span className="brand-kicker">Agencia de viajes desde 2009</span></div>
        <div className="split">
          <p className="lead">San Martín de los Andes, Neuquén, Patagonia Argentina<br />Mariano Moreno 829 — C.P. 8370<br /><a href="tel:+542972420285">02972 420285</a> · <a href="mailto:info@araucana.com.ar">info@araucana.com.ar</a></p>
          <div className="footer-links"><Link href="/rutas">Rutas</Link><Link href="/soporte">Soporte</Link><a href="https://wa.me/5492944649049">WhatsApp</a><a href="https://www.instagram.com/">Instagram</a><a href="https://www.tiktok.com/">TikTok</a></div>
        </div>
        <p className="muted">Empresa habilitada como Agencia de Turismo Estudiantil · Leg. 14241 · Disp. 924/05</p>
      </div>
    </footer>
  );
}
