import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useDepartments } from "@/contexts/DepartmentContext";
import {
  Users,
  UserPlus,
  Building2,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { formatDate } from "@/lib/hr";
import { membershipPlans } from "@/lib/clients";
import { useModules } from "@/contexts/ModuleContext";

type ClientMetric = {
  id: string;
  full_name: string;
  company_name: string;
  created_at: string;
  membership_plans: string[];
};
export default function Dashboard() {
  const { profile, employee, isAdmin, profileLoading } = useAuth();
  const { selectedDepartment } = useDepartments();
  const { enabled } = useModules();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<ClientMetric[]>([]);
  const [staff, setStaff] = useState<
    {
      id: string;
      department_id: string | null;
      departments: { name: string } | null;
    }[]
  >([]);
  const [departments, setDepartments] = useState(0);
  const [leave, setLeave] = useState(0);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
    let emp = supabase
      .from("employees")
      .select("id,department_id,departments(name)")
      .neq("status", "terminated");
    if (selectedDepartment)
      emp = emp.eq("department_id", selectedDepartment.id);
    const today = new Date().toISOString().slice(0, 10);
    const [e, d, l] = await Promise.all([
      emp,
      supabase.from("departments").select("id", { count: "exact" }).limit(1),
      supabase
        .from("leave_requests")
        .select("id", { count: "exact" }).limit(1)
        .eq("status", "approved")
        .lte("start_date", today)
        .gte("end_date", today),
    ]);
    if (e.error || d.error || l.error) {
      console.error("Dashboard metrics", { employees: e.error, departments: d.error, leave: l.error });
      throw new Error("Could not load dashboard metrics. Please retry.");
    }
    setStaff(e.data ?? []);
    setDepartments(d.count ?? 0);
    setLeave(l.count ?? 0);
    if (isAdmin && enabled("clients")) {
      let all: ClientMetric[] = [];
      let offset = 0;
      while (true) {
        const r = await supabase
          .from("clients")
          .select("id,full_name,company_name,created_at,membership_plans")
          .order("created_at", { ascending: false })
          .range(offset, offset + 999);
        if (r.error) {
          console.error("Dashboard clients", r.error);
          throw new Error("Could not load client metrics. Please retry.");
        }
        all.push(...(r.data ?? []));
        if ((r.data?.length ?? 0) < 1000) break;
        offset += 1000;
      }
      setClients(all);
    } else setClients([]);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not load dashboard metrics. Please retry.");
    } finally { setLoading(false); }
  }, [selectedDepartment?.id, isAdmin, enabled("clients")]);
  useEffect(() => {
    if (!profileLoading) void load();
  }, [load, profileLoading]);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const recent = clients.filter(
    (c) => new Date(c.created_at) >= monthStart,
  ).length;
  const stats = isAdmin
    ? [
        {
          label: "Total clients",
          value: clients.length,
          icon: Users,
          to: "/clients",
        },
        {
          label: "Registered this month",
          value: recent,
          icon: UserPlus,
          to: "/clients",
        },
        {
          label: "Employee records",
          value: staff.length,
          icon: Users,
          to: "/employees",
        },
        {
          label: "Departments",
          value: departments,
          icon: Building2,
          to: "/departments",
        },
      ]
    : [
        {
          label: "Employee records",
          value: staff.length,
          icon: Users,
          to: "/employees",
        },
        {
          label: "Departments",
          value: departments,
          icon: Building2,
          to: "/departments",
        },
        {
          label: "On leave today",
          value: leave,
          icon: CalendarDays,
          to: "/leave",
        },
      ];
  const trend = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - 11 + i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      date: date.toLocaleDateString("en", { month: "short", year: "2-digit" }),
      registrations: clients.filter((c) => c.created_at.startsWith(key)).length,
    };
  });
  const distribution = membershipPlans.map((plan) => ({
    name: plan,
    clients: clients.filter((c) => c.membership_plans.includes(plan)).length,
  }));
  const grouped = new Map<string, number>();
  staff.forEach((e) => {
    const name = e.departments?.name ?? "Unassigned";
    grouped.set(name, (grouped.get(name) ?? 0) + 1);
  });
  const employeeChart = Array.from(grouped, ([name, employees]) => ({
    name,
    employees,
  }));
  const chart = (kind: "trend" | "members" | "employees") => (
    <div className="h-72 w-full">
      {loading ? (
        <Skeleton className="h-full w-full" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {kind === "trend" ? (
            <AreaChart
              data={trend}
              margin={{ top: 10, right: 8, left: 0, bottom: 25 }}
            >
              <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                label={{
                  value: "Registration month",
                  position: "insideBottom",
                  offset: -16,
                }}
              />
              <YAxis
                allowDecimals={false}
                width={32}
                label={{
                  value: "Registrations",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="registrations"
                name="Registrations"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / .12)"
                strokeWidth={3}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={kind === "members" ? distribution : employeeChart}
              margin={{ top: 10, right: 8, left: 0, bottom: 24 }}
            >
              <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-15}
                height={60}
                tick={{ fontSize: 10 }}
                label={{
                  value: kind === "members" ? "Membership plan" : "Department",
                  position: "insideBottom",
                  offset: -15,
                }}
              />
              <YAxis
                allowDecimals={false}
                width={32}
                label={{
                  value: kind === "members" ? "Clients" : "Employees",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Bar
                dataKey={kind === "members" ? "clients" : "employees"}
                name={kind === "members" ? "Clients" : "Employees"}
                fill="hsl(var(--chart-community))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
  return (
    <DashboardLayout
      title={`Welcome back${profile?.full_name || employee?.first_name ? `, ${(profile?.full_name || employee?.first_name || "").split(" ")[0]}` : ""}`}
      description={
        selectedDepartment
          ? `${selectedDepartment.name} · People overview`
          : "Your Kazini community at a glance"
      }
      actions={
        isAdmin && enabled("clients") ? (
          <Button asChild>
            <Link to="/clients">
              Client Management <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : undefined
      }
    >
      {error && (
        <div className="mb-5 flex items-center gap-4 text-sm text-destructive">
          {error}
          <Button variant="outline" size="sm" onClick={load}>
            Retry
          </Button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.filter(s => enabled(s.to.slice(1))).map((s) => (
          <Link key={s.label} to={s.to} className="min-w-0">
            <Card className="surface-gloss h-full">
              <CardContent className="p-3 sm:p-5">
                <div className="flex min-h-10 items-start justify-between gap-2">
                  <p className="text-xs leading-5 text-muted-foreground sm:text-sm">{s.label}</p>
                  <s.icon className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
                </div>
                {loading ? (
                  <Skeleton className="mt-5 h-9 w-16" />
                ) : (
                  <p className="mt-3 text-2xl font-semibold sm:mt-5 sm:text-3xl">{error ? "—" : s.value}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        {isAdmin && enabled("clients") && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client registrations</CardTitle>
              <p className="text-sm text-muted-foreground">Last 12 months</p>
            </CardHeader>
            <CardContent className="px-2 sm:px-4">
              {chart("trend")}
              {!loading && !clients.length && (
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  No registrations yet.
                </p>
              )}
            </CardContent>
          </Card>
        )}
        {enabled("employees") && <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employees by department</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-4">
            {staff.length || loading ? (
              chart("employees")
            ) : (
              <p className="py-20 text-center text-sm text-muted-foreground">
                No employee records yet.
              </p>
            )}
          </CardContent>
        </Card>}
        {isAdmin && enabled("clients") && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Membership preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-4">{chart("members")}</CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent registrations</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/clients">
                    View all <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-48 w-full" />
                ) : clients.length ? (
                  clients.slice(0, 5).map((c) => (
                    <Link
                      to="/clients"
                      key={c.id}
                      className="flex items-center justify-between gap-4 border-b py-4 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {c.full_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.company_name}
                        </p>
                      </div>
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(c.created_at)}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="py-20 text-center text-sm text-muted-foreground">
                    No client registrations yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
