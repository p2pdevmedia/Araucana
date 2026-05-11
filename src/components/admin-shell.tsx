import Link from "next/link";
import { BrandMark } from "./brand-mark";

type AdminShellProps = {
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
};

const links = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/rutas", label: "Rutas" },
  { href: "/admin/salidas", label: "Salidas" },
  { href: "/admin/reservas", label: "Reservas" },
  { href: "/", label: "Web publica" }
];

export function AdminShell({ children, title, eyebrow = "Operacion", action }: AdminShellProps) {
  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <div className="brand-lockup">
          <BrandMark color="#1F5B4F" size={36} />
          <div>
            <span className="brand-name">Araucana</span>
            <span className="brand-kicker">Admin</span>
          </div>
        </div>
        <nav aria-label="Administracion">
          {links.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="admin-main">
        <div className="admin-top">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="section-title">{title}</h1>
          </div>
          {action}
        </div>
        {children}
      </section>
    </main>
  );
}
