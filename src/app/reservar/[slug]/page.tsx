import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { getPublicRouteBySlug, getSeatMap, listSchedulesForRoute } from "@/lib/booking/repository";
import { CheckoutForm } from "./checkout-form";

export const dynamic = "force-dynamic";

type ReservationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (!hours) {
    return `${remainder} min`;
  }

  return remainder ? `${hours} h ${remainder} min` : `${hours} h`;
}

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

function isBookableSchedule(status: string) {
  return status === "OPEN" || status === "DOCUMENTATION";
}

export default async function ReservationPage({ params }: ReservationPageProps) {
  const { slug } = await params;
  const route = await getPublicRouteBySlug(slug);

  if (!route) {
    notFound();
  }

  const schedules = await listSchedulesForRoute(route.id);
  const bookableSchedules = schedules.filter((schedule) => isBookableSchedule(schedule.status));
  const seatMaps = await Promise.all(bookableSchedules.map((schedule) => getSeatMap(schedule.id)));

  return (
    <>
      <main className="page-shell section">
        <div className="section-head checkout-head">
          <div>
            <p className="eyebrow">Reserva web</p>
            <h1 className="section-title">
              {route.from} - {route.to}
            </h1>
          </div>
          <div className="route-summary plain-card">
            <span>{route.via}</span>
            <strong>{formatPrice(route.priceCents, route.currency)}</strong>
          </div>
        </div>

        <section className="checkout-intro">
          <div>
            <p className="eyebrow">{route.category}</p>
            <h2 className="route-title">Completa tu reserva</h2>
            <p className="lead">{route.description}</p>
          </div>
          <div className="stats-grid checkout-stats">
            <div className="stat-card">
              <strong>{formatDuration(route.durationMin)}</strong>
              <span>Duracion estimada</span>
            </div>
            <div className="stat-card">
              <strong>{bookableSchedules.length}</strong>
              <span>Salidas reservables</span>
            </div>
          </div>
        </section>

        <CheckoutForm route={route} schedules={bookableSchedules} seatMaps={seatMaps} />
      </main>
      <SiteFooter />
    </>
  );
}
