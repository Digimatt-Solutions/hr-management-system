import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useDepartments } from "@/contexts/DepartmentContext";
import { formatDate, fullName, statusVariant, titleCase } from "@/lib/hr";
import { Users, CalendarDays, ClipboardCheck, UserPlus, Building2, Megaphone } from "lucide-react";

interface PendingLeave {
  id: string;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  employees: { first_name: string; last_name: string } | null;
  leave_types: { name: string } | null;
}

const Dashboard = () => {
  const { employee, isManager } = useAuth();
  const { selectedDepartment } = useDepartments();
  const [loading, setLoading] = useState(true);
  const [headcount, setHeadcount] = useState(0);
  const [onLeaveToday, setOnLeaveToday] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [newHires, setNewHires] = useState(0);
  const [departmentCounts, setDepartmentCounts] = useState<{ name: string; count: number }[]>([]);
  const [pendingLeave, setPendingLeave] = useState<PendingLeave[]>([]);
  const [announcement, setAnnouncement] = useState<{ title: string; body: string; published_at: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

      let employeesQuery = supabase
        .from("employees")
        .select("id, hire_date, status, department_id, departments(name)");
      if (selectedDepartment) employeesQuery = employeesQuery.eq("department_id", selectedDepartment.id);

      const [employeesRes, leaveTodayRes, pendingRes, announcementRes] = await Promise.all([
        employeesQuery,
        supabase
          .from("leave_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved")
          .lte("start_date", today)
          .gte("end_date", today),
        supabase
          .from("leave_requests")
          .select("id, start_date, end_date, days, status, employees(first_name, last_name), leave_types(name)")
          .eq("status", "pending")
          .order("start_date", { ascending: true })
          .limit(5),
        supabase
          .from("announcements")
          .select("title, body, published_at")
          .order("published_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const employees = employeesRes.data ?? [];
      setHeadcount(employees.filter((e: any) => e.status !== "terminated").length);
      setNewHires(employees.filter((e: any) => e.hire_date >= monthAgo).length);
      setOnLeaveToday(leaveTodayRes.count ?? 0);
      setPendingLeave((pendingRes.data as unknown as PendingLeave[]) ?? []);
      setPendingCount(pendingRes.data?.length ?? 0);
      setAnnouncement(announcementRes.data ?? null);

      const grouped = new Map<string, number>();
      employees.forEach((e: any) => {
        const name = e.departments?.name ?? "Unassigned";
        grouped.set(name, (grouped.get(name) ?? 0) + 1);
      });
      setDepartmentCounts(
        Array.from(grouped.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
      );
      setLoading(false);
    };
    load();
  }, [selectedDepartment]);

  const stats = [
    { label: "Headcount", value: headcount, icon: Users, to: "/employees" },
    { label: "On leave today", value: onLeaveToday, icon: CalendarDays, to: "/leave" },
    { label: "Leave awaiting approval", value: pendingCount, icon: ClipboardCheck, to: "/leave" },
    { label: "New hires (30 days)", value: newHires, icon: UserPlus, to: "/employees" },
  ];

  return (
    <DashboardLayout
      title={`Welcome${employee ? `, ${employee.first_name}` : ""}`}
      description={
        selectedDepartment
          ? `Showing ${selectedDepartment.name}`
          : "Company-wide people overview"
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  {loading ? (
                    <Skeleton className="mt-2 h-7 w-12" />
                  ) : (
                    <p className="font-heading text-2xl font-semibold">{stat.value}</p>
                  )}
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Leave awaiting approval</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/leave">Open leave</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <Skeleton className="h-20 w-full" />}
            {!loading && pendingLeave.length === 0 && (
              <p className="text-sm text-muted-foreground">No requests waiting on a decision.</p>
            )}
            {pendingLeave.map((request) => (
              <div
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
              >
                <div>
                  <p className="font-medium">{fullName(request.employees)}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.leave_types?.name} · {formatDate(request.start_date)} –{" "}
                    {formatDate(request.end_date)} · {request.days} day(s)
                  </p>
                </div>
                <Badge variant={statusVariant(request.status)}>{titleCase(request.status)}</Badge>
              </div>
            ))}
            {!isManager && !loading && pendingLeave.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Only managers and HR admins can approve requests.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-primary" /> Headcount by department
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading && <Skeleton className="h-24 w-full" />}
              {!loading &&
                departmentCounts.map((row) => (
                  <div key={row.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{row.name}</span>
                      <span className="text-muted-foreground">{row.count}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${headcount ? (row.count / headcount) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              {!loading && departmentCounts.length === 0 && (
                <p className="text-sm text-muted-foreground">No staff recorded yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Megaphone className="h-4 w-4 text-primary" /> Latest announcement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && <Skeleton className="h-16 w-full" />}
              {!loading && announcement ? (
                <div>
                  <p className="font-medium">{announcement.title}</p>
                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                    {announcement.body}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(announcement.published_at)}
                  </p>
                </div>
              ) : (
                !loading && <p className="text-sm text-muted-foreground">Nothing posted yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
