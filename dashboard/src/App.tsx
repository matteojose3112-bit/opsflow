import { useEffect, useMemo, useState } from "react";

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

type Request = {
  request_id: number;
  customer_id: number;
  request_type_id: number;
  assigned_employee_id: number | null;
  priority: string;
  status: string;
  created_at: string;
};

type NavItem = {
  label: string;
  icon: string;
};

const navigation: NavItem[] = [
  { label: "Overview", icon: "◉" },
  { label: "Analytics", icon: "◫" },
  { label: "Requests", icon: "≡" },
  { label: "Teams", icon: "◌" },
  { label: "SLA", icon: "◷" },
];

function App() {
  const [activeView, setActiveView] = useState("Overview");

  const [overview, setOverview] = useState<Overview | null>(null);
  const [workload, setWorkload] = useState<Workload[]>([]);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);

  const [requests, setRequests] = useState<Request[]>([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");

  const [requestSearch, setRequestSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [requestPage, setRequestPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const REQUEST_PAGE_SIZE = 25;

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

        const [overviewData, workloadData, typesData] = await Promise.all([
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

  useEffect(() => {
    if (activeView !== "Requests") {
      return;
    }

    async function loadRequests() {
      setRequestLoading(true);
      setRequestError("");

      try {
        const params = new URLSearchParams();

        params.set("limit", String(REQUEST_PAGE_SIZE));
        params.set("offset", String(requestPage * REQUEST_PAGE_SIZE));

        if (statusFilter) {
          params.set("status", statusFilter);
        }

        if (priorityFilter) {
          params.set("priority", priorityFilter);
        }

        const response = await fetch(`${API}/requests?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to load requests.");
        }

        const data = await response.json();
        setRequests(data);
      } catch (err) {
        setRequestError(
          err instanceof Error
            ? err.message
            : "Unable to load requests.",
        );
      } finally {
        setRequestLoading(false);
      }
    }

    loadRequests();
  }, [activeView, statusFilter, priorityFilter, requestPage]);

  useEffect(() => {
    setRequestPage(0);
  }, [statusFilter, priorityFilter]);

  const filteredRequests = useMemo(() => {
    const search = requestSearch.trim().toLowerCase();

    if (!search) {
      return requests;
    }

    return requests.filter((request) => {
      return (
        String(request.request_id).includes(search) ||
        String(request.customer_id).includes(search) ||
        String(request.request_type_id).includes(search)
      );
    });
  }, [requests, requestSearch]);

  const resolutionRate =
    overview && overview.total_requests > 0
      ? Math.round(
          (overview.resolved_requests / overview.total_requests) * 100,
        )
      : 0;

  const openLoadRate =
    overview && overview.total_requests > 0
      ? Math.round(
          (overview.open_requests / overview.total_requests) * 100,
        )
      : 0;

  const criticalRate =
    overview && overview.total_requests > 0
      ? Math.round(
          (overview.critical_requests / overview.total_requests) * 100,
        )
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070809] text-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border border-white/10 border-t-zinc-300 animate-spin" />
          <p className="text-xs tracking-wide text-zinc-500">
            Initializing OpsFlow
          </p>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="min-h-screen bg-[#070809] text-zinc-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-400/10 bg-[#0d0f12] p-7 shadow-2xl">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/10 bg-red-400/5 text-red-400">
            !
          </div>

          <h1 className="text-sm font-semibold">
            Dashboard connection error
          </h1>

          <p className="mt-2 text-xs leading-5 text-zinc-600">
            {error || "Unable to load dashboard data."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070809] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/[0.015] blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-white/[0.01] blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/[0.06] bg-[#090a0c] lg:flex lg:flex-col">
          <div className="flex h-20 items-center border-b border-white/[0.06] px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035]">
                <span className="text-sm font-semibold tracking-tight">
                  O
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold tracking-tight text-zinc-100">
                  OpsFlow
                </p>

                <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-zinc-700">
                  Intelligence
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 px-3 py-6">
            <p className="px-3 pb-3 text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-700">
              Workspace
            </p>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const active = activeView === item.label;

                return (
                  <button
                    key={item.label}
                    onClick={() => setActiveView(item.label)}
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                      active
                        ? "bg-white/[0.055] text-zinc-100"
                        : "text-zinc-600 hover:bg-white/[0.025] hover:text-zinc-300"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-md text-sm ${
                        active
                          ? "bg-white/[0.07] text-zinc-200"
                          : "text-zinc-700 group-hover:text-zinc-400"
                      }`}
                    >
                      {item.icon}
                    </span>

                    <span className="text-xs font-medium">
                      {item.label}
                    </span>

                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-zinc-300" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-white/[0.06] p-4">
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="text-[10px] font-medium text-zinc-500">
                  System operational
                </span>
              </div>

              <p className="mt-3 text-[10px] leading-4 text-zinc-700">
                Connected to OpsFlow analytics services.
              </p>

              <p className="mt-3 text-[9px] text-zinc-800">
                v0.3.0
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#070809]/85 backdrop-blur-xl">
            <div className="flex h-20 items-center justify-between px-5 sm:px-8">
              <div className="flex items-center gap-3 lg:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] text-xs font-semibold">
                  O
                </div>

                <span className="text-sm font-semibold">
                  OpsFlow
                </span>
              </div>

              <div className="hidden lg:block">
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-700">
                  Workspace / {activeView}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Operations command center
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 sm:block">
                  <span className="text-[10px] text-zinc-600">
                    Data source
                  </span>

                  <span className="ml-2 text-[10px] text-zinc-400">
                    PostgreSQL
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.035] px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.65)]" />

                  <span className="text-[10px] font-medium text-emerald-400">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
            {activeView === "Overview" && (
              <OverviewView
                overview={overview}
                workload={workload}
                requestTypes={requestTypes}
                resolutionRate={resolutionRate}
                openLoadRate={openLoadRate}
                criticalRate={criticalRate}
              />
            )}

            {activeView === "Requests" && (
              <RequestsView
                requests={filteredRequests}
                loading={requestLoading}
                error={requestError}
                search={requestSearch}
                status={statusFilter}
                priority={priorityFilter}
                page={requestPage}
                pageSize={REQUEST_PAGE_SIZE}
                onSearchChange={setRequestSearch}
                onStatusChange={setStatusFilter}
                onPriorityChange={setPriorityFilter}
                onPrevious={() =>
                  setRequestPage((current) => Math.max(0, current - 1))
                }
                onNext={() => setRequestPage((current) => current + 1)}
              />
            )}

            {activeView !== "Overview" && activeView !== "Requests" && (
              <ComingSoonView title={activeView} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function OverviewView({
  overview,
  workload,
  requestTypes,
  resolutionRate,
  openLoadRate,
  criticalRate,
}: {
  overview: Overview;
  workload: Workload[];
  requestTypes: RequestType[];
  resolutionRate: number;
  openLoadRate: number;
  criticalRate: number;
}) {
  return (
    <>
      <section className="mb-8">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-700">
          Command Center
        </p>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Operations Overview
            </h1>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-600 sm:text-sm">
              Monitor workload, service performance, SLA compliance,
              and operational risk from one centralized workspace.
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-[9px] uppercase tracking-[0.16em] text-zinc-700">
              Environment
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Development / Local
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Requests"
          value={overview.total_requests.toLocaleString()}
          description="All recorded requests"
        />

        <MetricCard
          label="Open Requests"
          value={overview.open_requests.toLocaleString()}
          description="Currently active"
        />

        <MetricCard
          label="Critical Requests"
          value={overview.critical_requests.toLocaleString()}
          description="Priority attention"
          tone="warning"
        />

        <MetricCard
          label="Open Escalations"
          value={overview.open_escalations.toLocaleString()}
          description="Requires intervention"
          tone="danger"
        />
      </section>

      <section className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricCard
          label="Resolved Requests"
          value={overview.resolved_requests.toLocaleString()}
          description={`${resolutionRate}% resolution rate`}
          tone="success"
        />

        <MetricCard
          label="Average Resolution"
          value={`${overview.average_resolution_hours}h`}
          description="Average time to resolution"
        />

        <MetricCard
          label="SLA Breach Rate"
          value={`${overview.sla_breach_rate}%`}
          description="Across SLA events"
          tone={
            overview.sla_breach_rate >= 20
              ? "warning"
              : "success"
          }
        />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel
          eyebrow="TEAM PERFORMANCE"
          title="Team Workload"
          description="Request volume, active load, and SLA pressure."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <TableHead align="left">Team</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Open</TableHead>
                  <TableHead>Critical</TableHead>
                  <TableHead>SLA</TableHead>
                </tr>
              </thead>

              <tbody>
                {workload.map((team) => (
                  <tr
                    key={team.team_id}
                    className="border-b border-white/[0.035] last:border-0 hover:bg-white/[0.012]"
                  >
                    <td className="py-4 pr-4">
                      <p className="text-xs font-medium text-zinc-300">
                        {team.team_name}
                      </p>

                      <p className="mt-1 text-[10px] text-zinc-700">
                        {team.department}
                      </p>
                    </td>

                    <TableCell>{team.total_requests}</TableCell>

                    <TableCell>{team.open_requests}</TableCell>

                    <TableCell
                      tone={
                        team.critical_requests > 15
                          ? "warning"
                          : undefined
                      }
                    >
                      {team.critical_requests}
                    </TableCell>

                    <TableCell
                      tone={
                        team.sla_breaches > 80
                          ? "warning"
                          : undefined
                      }
                    >
                      {team.sla_breaches}
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel
          eyebrow="REQUEST ANALYSIS"
          title="Request Types"
          description="Volume, open load, resolution time, and SLA."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <TableHead align="left">Request Type</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Open</TableHead>
                  <TableHead>Average</TableHead>
                  <TableHead>SLA</TableHead>
                </tr>
              </thead>

              <tbody>
                {requestTypes.map((type) => (
                  <tr
                    key={type.request_type_id}
                    className="border-b border-white/[0.035] last:border-0 hover:bg-white/[0.012]"
                  >
                    <td className="py-4 pr-4">
                      <p className="text-xs font-medium text-zinc-300">
                        {type.type_name}
                      </p>
                    </td>

                    <TableCell>{type.total_requests}</TableCell>

                    <TableCell>{type.open_requests}</TableCell>

                    <TableCell>
                      {type.average_resolution_hours}h
                    </TableCell>

                    <TableCell
                      tone={
                        type.sla_breach_rate >= 24
                          ? "warning"
                          : undefined
                      }
                    >
                      {type.sla_breach_rate}%
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <section className="mt-4">
        <Panel
          eyebrow="SYSTEM HEALTH"
          title="Operational Health"
          description="High-level indicators derived from current request data."
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <HealthMetric
              label="Resolution Rate"
              value={`${resolutionRate}%`}
              progress={resolutionRate}
              positive
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

      <footer className="mt-10 border-t border-white/[0.05] py-7">
        <div className="flex flex-col gap-2 text-[10px] text-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <span>OpsFlow v0.3.0</span>
          <span>Operations Intelligence Platform</span>
        </div>
      </footer>
    </>
  );
}

function RequestsView({
  requests,
  loading,
  error,
  search,
  status,
  priority,
  page,
  pageSize,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onPrevious,
  onNext,
}: {
  requests: Request[];
  loading: boolean;
  error: string;
  search: string;
  status: string;
  priority: string;
  page: number;
  pageSize: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <section className="mb-8">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-700">
          Operations
        </p>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Requests
            </h1>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-600 sm:text-sm">
              Search and inspect operational requests currently tracked
              by OpsFlow.
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-[9px] uppercase tracking-[0.16em] text-zinc-700">
              Dataset
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              PostgreSQL / Live
            </p>
          </div>
        </div>
      </section>

      <Panel
        eyebrow="REQUEST EXPLORER"
        title="Request Queue"
        description="Filter requests by status or priority and inspect the latest records."
      >
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-700">
              Search
            </label>

            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Request, customer, or type ID"
              className="w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-xs text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-white/[0.15]"
            />
          </div>

          <div>
            <label className="mb-2 block text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-700">
              Status
            </label>

            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className="w-full rounded-lg border border-white/[0.07] bg-[#0d0f12] px-3 py-2.5 text-xs text-zinc-300 outline-none focus:border-white/[0.15]"
            >
              <option value="">All statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-700">
              Priority
            </label>

            <select
              value={priority}
              onChange={(event) => onPriorityChange(event.target.value)}
              className="w-full rounded-lg border border-white/[0.07] bg-[#0d0f12] px-3 py-2.5 text-xs text-zinc-300 outline-none focus:border-white/[0.15]"
            >
              <option value="">All priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-400/10 bg-red-400/[0.03] px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <TableHead align="left">Request</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-xs text-zinc-700"
                  >
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-xs text-zinc-700"
                  >
                    No requests match the current filters.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr
                    key={request.request_id}
                    className="border-b border-white/[0.035] last:border-0 hover:bg-white/[0.012]"
                  >
                    <td className="py-4 pr-4 text-left">
                      <span className="text-xs font-medium text-zinc-300">
                        #{request.request_id}
                      </span>
                    </td>

                    <TableCell>{request.customer_id}</TableCell>

                    <TableCell>{request.request_type_id}</TableCell>

                    <TableCell>
                      {request.assigned_employee_id ?? "Unassigned"}
                    </TableCell>

                    <TableCell>
                      <StatusBadge value={request.priority} />
                    </TableCell>

                    <TableCell>
                      <StatusBadge value={request.status} />
                    </TableCell>

                    <TableCell>
                      {formatDate(request.created_at)}
                    </TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/[0.05] pt-5">
          <p className="text-[10px] text-zinc-700">
            Page {page + 1} · Showing {requests.length} records
            {search && " · Search applied"}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrevious}
              disabled={page === 0 || loading}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[10px] text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Previous
            </button>

            <button
              onClick={onNext}
              disabled={loading || requests.length < pageSize}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[10px] text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </Panel>

      <footer className="mt-10 border-t border-white/[0.05] py-7">
        <div className="flex flex-col gap-2 text-[10px] text-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <span>OpsFlow v0.3.0</span>
          <span>Operations Intelligence Platform</span>
        </div>
      </footer>
    </>
  );
}

function ComingSoonView({ title }: { title: string }) {
  return (
    <section>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-700">
        Workspace
      </p>

      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {title}
      </h1>

      <div className="mt-8 rounded-xl border border-white/[0.065] bg-[#0c0e11] p-8">
        <p className="text-sm font-medium text-zinc-300">
          {title} workspace
        </p>

        <p className="mt-2 max-w-xl text-xs leading-5 text-zinc-600">
          This workspace is connected to the OpsFlow shell and will be
          powered by the analytics API in the next development phase.
        </p>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  tone?: "success" | "warning" | "danger";
}) {
  const valueClass =
    tone === "success"
      ? "text-emerald-400"
      : tone === "warning"
        ? "text-amber-400"
        : tone === "danger"
          ? "text-red-400"
          : "text-zinc-100";

  return (
    <div className="group rounded-xl border border-white/[0.065] bg-[#0c0e11] p-5 transition-all duration-200 hover:border-white/[0.11] hover:bg-[#0e1013]">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-700">
          {label}
        </p>

        <span
          className={`h-1.5 w-1.5 rounded-full transition ${
            tone === "success"
              ? "bg-emerald-400/70"
              : tone === "warning"
                ? "bg-amber-400/70"
                : tone === "danger"
                  ? "bg-red-400/70"
                  : "bg-zinc-700 group-hover:bg-zinc-500"
          }`}
        />
      </div>

      <p
        className={`mt-4 text-2xl font-semibold tracking-tight ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-1.5 text-[10px] text-zinc-700">
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
    <div className="rounded-xl border border-white/[0.065] bg-[#0c0e11] p-5 sm:p-6">
      <div className="mb-6">
        <p className="text-[9px] font-medium tracking-[0.18em] text-zinc-700">
          {eyebrow}
        </p>

        <h2 className="mt-1.5 text-sm font-semibold text-zinc-300">
          {title}
        </h2>

        <p className="mt-1 text-[10px] text-zinc-700">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

function TableHead({
  children,
  align = "right",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`pb-3 text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-700 ${
        align === "left"
          ? "text-left pr-4"
          : "text-right px-2"
      }`}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "warning" | "success";
}) {
  const className =
    tone === "warning"
      ? "text-amber-400"
      : tone === "success"
        ? "text-emerald-400"
        : "text-zinc-500";

  return (
    <td className={`px-2 text-right text-xs ${className}`}>
      {children}
    </td>
  );
}

function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();

  let className =
    "border-white/[0.06] bg-white/[0.025] text-zinc-500";

  if (normalized === "critical") {
    className =
      "border-red-400/10 bg-red-400/[0.04] text-red-400";
  } else if (normalized === "high") {
    className =
      "border-amber-400/10 bg-amber-400/[0.04] text-amber-400";
  } else if (
    normalized === "resolved" ||
    normalized === "closed"
  ) {
    className =
      "border-emerald-400/10 bg-emerald-400/[0.04] text-emerald-400";
  } else if (
    normalized === "open" ||
    normalized === "in progress"
  ) {
    className =
      "border-blue-400/10 bg-blue-400/[0.04] text-blue-400";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-medium ${className}`}
    >
      {value}
    </span>
  );
}

function HealthMetric({
  label,
  value,
  progress,
  positive = false,
}: {
  label: string;
  value: string;
  progress: number;
  positive?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/[0.045] bg-white/[0.012] p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] text-zinc-600">
          {label}
        </p>

        <p
          className={`text-sm font-semibold ${
            positive ? "text-emerald-400" : "text-zinc-300"
          }`}
        >
          {value}
        </p>
      </div>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            positive ? "bg-emerald-400/60" : "bg-zinc-500/60"
          }`}
          style={{
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default App;