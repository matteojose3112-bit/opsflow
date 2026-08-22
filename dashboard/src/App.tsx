import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

type Overview = {
  total_requests: number;
  open_requests: number;
  critical_requests: number;
  resolved_requests: number;
  average_resolution_hours: number;
  sla_breach_rate: number;
  open_escalations: number;
};

type Workload = {
  team_id: number;
  team_name: string;
  department: string;
  capacity: number;
  total_requests: number;
  open_requests: number;
  critical_requests: number;
  sla_breaches: number;
};

type RequestType = {
  request_type_id: number;
  type_name: string;
  total_requests: number;
  open_requests: number;
  critical_requests: number;
  resolved_requests: number;
  average_resolution_hours: number;
  total_sla_events: number;
  sla_breaches: number;
  sla_breach_rate: number;
};

function App() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [workload, setWorkload] = useState<Workload[]>([]);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [overviewRes, workloadRes, typesRes] = await Promise.all([
          fetch(`${API}/metrics/overview`),
          fetch(`${API}/metrics/workload`),
          fetch(`${API}/metrics/request-types`),
        ]);

        if (!overviewRes.ok || !workloadRes.ok || !typesRes.ok) {
          throw new Error("Failed to load dashboard data.");
        }

        const [overviewData, workloadData, typesData] =
          await Promise.all([
            overviewRes.json(),
            workloadRes.json(),
            typesRes.json(),
          ]);

        setOverview(overviewData);
        setWorkload(workloadData);
        setRequestTypes(typesData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to OpsFlow API.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090b] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
          <p className="text-sm text-zinc-500">Loading OpsFlow...</p>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="min-h-screen bg-[#08090b] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-sm font-medium text-red-400">
            Dashboard connection error
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            {error || "Unable to load dashboard data."}
          </p>
        </div>
      </div>
    );
  }

  const resolutionRate =
    overview.total_requests > 0
      ? Math.round(
          (overview.resolved_requests / overview.total_requests) * 100,
        )
      : 0;

  const openLoadRate =
    overview.total_requests > 0
      ? Math.round(
          (overview.open_requests / overview.total_requests) * 100,
        )
      : 0;

  const criticalRate =
    overview.total_requests > 0
      ? Math.round(
          (overview.critical_requests / overview.total_requests) * 100,
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#08090b] text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#08090b]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
              <span className="text-sm font-bold">O</span>
            </div>

            <div>
              <h1 className="text-sm font-semibold tracking-tight">
                OpsFlow
              </h1>
              <p className="text-[11px] text-zinc-600">
                Operations Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
            <span className="text-[11px] text-emerald-400">
              System operational
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page heading */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
            Command Center
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Operations Overview
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Monitor operational workload, service performance, SLA compliance,
            and outstanding escalations.
          </p>
        </div>

        {/* Primary KPIs */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Requests"
            value={overview.total_requests.toLocaleString()}
            description="All requests"
          />

          <MetricCard
            label="Open Requests"
            value={overview.open_requests.toLocaleString()}
            description="Currently active"
          />

          <MetricCard
            label="Critical Requests"
            value={overview.critical_requests.toLocaleString()}
            description="High-priority attention"
            emphasis="warning"
          />

          <MetricCard
            label="Open Escalations"
            value={overview.open_escalations.toLocaleString()}
            description="Requires attention"
            emphasis="danger"
          />
        </section>

        {/* Secondary KPIs */}
        <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            label="Resolved Requests"
            value={overview.resolved_requests.toLocaleString()}
            description={`${resolutionRate}% resolution rate`}
            emphasis="success"
          />

          <MetricCard
            label="Avg. Resolution"
            value={`${overview.average_resolution_hours}h`}
            description="Average resolution time"
          />

          <MetricCard
            label="SLA Breach Rate"
            value={`${overview.sla_breach_rate}%`}
            description="Across all SLA events"
            emphasis={
              overview.sla_breach_rate >= 20 ? "warning" : "success"
            }
          />
        </section>

        {/* Main analytical panels */}
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel
            eyebrow="TEAM PERFORMANCE"
            title="Team Workload"
            description="Request volume and SLA pressure by team."
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="border-b border-white/[0.07] text-left">
                    <th className="pb-3 pr-4 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                      Team
                    </th>
                    <th className="pb-3 px-2 text-right text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                      Volume
                    </th>
                    <th className="pb-3 px-2 text-right text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                      Open
                    </th>
                    <th className="pb-3 px-2 text-right text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                      Critical
                    </th>
                    <th className="pb-3 pl-2 text-right text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                      SLA
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {workload.map((team) => (
                    <tr
                      key={team.team_id}
                      className="border-b border-white/[0.04] last:border-0"
                    >
                      <td className="py-4 pr-4">
                        <p className="text-sm font-medium text-zinc-200">
                          {team.team_name}
                        </p>
                        <p className="mt-1 text-[11px] text-zinc-600">
                          {team.department}
                        </p>
                      </td>

                      <td className="px-2 text-right text-sm text-zinc-400">
                        {team.total_requests}
                      </td>

                      <td className="px-2 text-right text-sm text-zinc-400">
                        {team.open_requests}
                      </td>

                      <td className="px-2 text-right text-sm">
                        <span
                          className={
                            team.critical_requests > 15
                              ? "text-amber-400"
                              : "text-zinc-400"
                          }
                        >
                          {team.critical_requests}
                        </span>
                      </td>

                      <td className="pl-2 text-right text-sm">
                        <span
                          className={
                            team.sla_breaches > 80
                              ? "text-amber-400"
                              : "text-zinc-400"
                          }
                        >
                          {team.sla_breaches}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            eyebrow="REQUEST ANALYSIS"
            title="Request Types"
            description="Volume, resolution, and SLA performance."
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="border-b border-white/[0.07] text-left">
                    <th className="pb-3 pr-4 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                      Type
                    </th>
                    <th className="pb-3 px-2 text-right text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                      Volume
                    </th>
                    <th className="pb-3 px-2 text-right text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                      Open
                    </th>
                    <th className="pb-3 px-2 text-right text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                      Avg.
                    </th>
                    <th className="pb-3 pl-2 text-right text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                      SLA
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {requestTypes.map((type) => (
                    <tr
                      key={type.request_type_id}
                      className="border-b border-white/[0.04] last:border-0"
                    >
                      <td className="py-4 pr-4">
                        <p className="text-sm font-medium text-zinc-200">
                          {type.type_name}
                        </p>
                      </td>

                      <td className="px-2 text-right text-sm text-zinc-400">
                        {type.total_requests}
                      </td>

                      <td className="px-2 text-right text-sm text-zinc-400">
                        {type.open_requests}
                      </td>

                      <td className="px-2 text-right text-sm text-zinc-400">
                        {type.average_resolution_hours}h
                      </td>

                      <td className="pl-2 text-right text-sm">
                        <span
                          className={
                            type.sla_breach_rate >= 24
                              ? "text-amber-400"
                              : "text-zinc-400"
                          }
                        >
                          {type.sla_breach_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </section>

        {/* Operational health */}
        <section className="mt-6">
          <Panel
            eyebrow="HEALTH"
            title="Operational Health"
            description="High-level indicators derived from current request data."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <HealthMetric
                label="Resolution Rate"
                value={`${resolutionRate}%`}
                progress={resolutionRate}
              />

              <HealthMetric
                label="Open Request Load"
                value={`${openLoadRate}%`}
                progress={openLoadRate}
              />

              <HealthMetric
                label="Critical Share"
                value={`${criticalRate}%`}
                progress={criticalRate}
              />
            </div>
          </Panel>
        </section>

        <footer className="border-t border-white/[0.05] py-8 mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-zinc-700">
              OpsFlow v0.1.0
            </p>

            <p className="text-[11px] text-zinc-700">
              Operations Intelligence Platform
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  emphasis,
}: {
  label: string;
  value: string;
  description: string;
  emphasis?: "success" | "warning" | "danger";
}) {
  const valueClass =
    emphasis === "success"
      ? "text-emerald-400"
      : emphasis === "warning"
        ? "text-amber-400"
        : emphasis === "danger"
          ? "text-red-400"
          : "text-zinc-100";

  return (
    <div className="group rounded-xl border border-white/[0.07] bg-[#0d0f12] p-5 transition duration-200 hover:border-white/[0.12] hover:bg-[#0f1115]">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
          {label}
        </p>

        <span className="h-1.5 w-1.5 rounded-full bg-zinc-700 transition group-hover:bg-zinc-500" />
      </div>

      <p className={`mt-3 text-2xl font-semibold tracking-tight ${valueClass}`}>
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {description}
      </p>
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0d0f12] p-5">
      <div className="mb-5">
        <p className="text-[10px] font-medium tracking-[0.16em] text-zinc-600">
          {eyebrow}
        </p>

        <h3 className="mt-1 text-sm font-semibold text-zinc-200">
          {title}
        </h3>

        <p className="mt-1 text-xs text-zinc-600">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

function HealthMetric({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">{label}</p>

        <p className="text-sm font-semibold text-zinc-200">
          {value}
        </p>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-zinc-500 transition-all"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default App;
