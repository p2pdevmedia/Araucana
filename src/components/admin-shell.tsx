import Link from "next/link";
import { AdminToast } from "@/app/admin/form-ui";
import { BrandMark } from "./brand-mark";

type AdminShellProps = {
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  notice?: string;
};

const links = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/rutas", label: "Rutas" },
  { href: "/admin/salidas", label: "Salidas" },
  { href: "/admin/naves", label: "Naves" },
  { href: "/admin/reservas", label: "Reservas" },
  { href: "/", label: "Web publica" }
];

export function AdminShell({ children, title, eyebrow = "Operacion", action, notice }: AdminShellProps) {
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
        <AdminToast message={notice} />
        {children}
      </section>
    </main>
  );
}
