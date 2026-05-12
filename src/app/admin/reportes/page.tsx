import { AdminShell } from "@/components/admin-shell";
import { createMonthPeriod, createRangePeriod, getAccountingReport } from "@/lib/accounting/service";
import { formatCurrency } from "@/lib/admin/salary";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";

type ReportsPageProps = {
  searchParams?: Promise<{
    month?: string;
    from?: string;
    to?: string;
    vehicleId?: string;
    notice?: string;
  }>;
};

type ReportGroupProps = {
  title: string;
  empty: string;
  groups: Array<{
    id: string;
    label: string;
    amountCents: number;
  }>;
};

function ReportGroup({ title, empty, groups }: ReportGroupProps) {
  return (
    <section className="plain-card report-panel">
      <h2>{title}</h2>
      <div className="report-list">
        {groups.map((group) => (
          <div className="report-row" key={group.id}>
            <span>{group.label}</span>
            <strong>{formatCurrency(group.amountCents)}</strong>
          </div>
        ))}
        {groups.length === 0 ? <p className="muted">{empty}</p> : null}
      </div>
    </section>
  );
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  await getCurrentAdminOrRedirect();
  const params = await searchParams;
  const period = params?.from && params?.to ? createRangePeriod(params.from, params.to) : createMonthPeriod(params?.month);
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true
    }
  });
  const report = await getAccountingReport({
    period,
    vehicleId: params?.vehicleId || undefined
  });

  return (
    <AdminShell title="Reportes" eyebrow={period.label} notice={params?.notice}>
      <form className="filter-bar" action="/admin/reportes">
        <label>
          Mes
          <input name="month" type="month" defaultValue={params?.month ?? (!params?.from ? new Date().toISOString().slice(0, 7) : "")} />
        </label>
        <label>
          Desde
          <input name="from" type="date" defaultValue={params?.from ?? ""} />
        </label>
        <label>
          Hasta
          <input name="to" type="date" defaultValue={params?.to ?? ""} />
        </label>
        <label>
          Nave
          <select name="vehicleId" defaultValue={params?.vehicleId ?? ""}>
            <option value="">Todas</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </option>
            ))}
          </select>
        </label>
        <button className="ghost-button" type="submit">Filtrar</button>
      </form>

      <section className="admin-grid">
        <div className="admin-card">
          <span className="muted">Ingresos</span>
          <strong>{formatCurrency(report.totals.incomeCents)}</strong>
        </div>
        <div className="admin-card">
          <span className="muted">Egresos</span>
          <strong>{formatCurrency(report.totals.expenseCents)}</strong>
        </div>
        <div className="admin-card">
          <span className="muted">Saldo</span>
          <strong>{formatCurrency(report.totals.balanceCents)}</strong>
        </div>
      </section>

      <section className="report-grid">
        <ReportGroup title="Ingresos por nave" empty="Sin ingresos para el periodo." groups={report.incomeByVehicle} />
        <ReportGroup title="Gastos por nave" empty="Sin gastos asociados a naves." groups={report.expensesByVehicle} />
        <ReportGroup title="Gastos por categoria" empty="Sin egresos cargados." groups={report.expensesByCategory} />
        <ReportGroup title="Sueldos por persona" empty="Sin sueldos pagados." groups={report.salariesByPerson} />
      </section>
    </AdminShell>
  );
}
