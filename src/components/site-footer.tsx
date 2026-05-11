import Link from "next/link";
import { BrandMark } from "./brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="brand-lockup">
          <BrandMark color="#FBF6EB" size={44} />
          <div>
            <span className="brand-name">Araucana</span>
            <span className="brand-kicker">Viajes · desde 2009</span>
          </div>
        </div>
        <div className="split">
          <p className="lead">
            San Martin de los Andes, Neuquen. Transporte turistico regular,
            salidas a los 7 Lagos y cruces internacionales a Chile.
          </p>
          <div className="inline-actions">
            <Link className="ghost-button" href="/rutas">
              Rutas
            </Link>
            <Link className="ghost-button" href="/soporte">
              Soporte
            </Link>
            <Link className="ghost-button" href="/login">
              Administracion
            </Link>
          </div>
        </div>
        <p className="muted">Leg. 14241 · Disp. 924/05 · ES · EN · DE</p>
      </div>
    </footer>
  );
}
