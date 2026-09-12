import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useParams, useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import EmployeeDialog from "@/components/EmployeeDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, formatMoney, initials, statusVariant, titleCase } from "@/lib/hr";
import { ArrowLeft, Mail, Pencil, Phone } from "lucide-react";

export interface EmployeeFull {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  work_email: string | null;
  phone: string | null;
  department_id: string | null;
  position_id: string | null;
  manager_id: string | null;
  hire_date: string;
  employment_type: string;
  status: string;
  salary: number | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  termination_date: string | null;
  notes: string | null;
  departments: { id: string; name: string } | null;
  positions: { id: string; title: string; level: string | null } | null;
  manager: { id: string; first_name: string; last_name: string } | null;
}

export interface EmployeeContext {
  employee: EmployeeFull;
  canManage: boolean;
  reload: () => Promise<void>;
}

export function useEmployeeContext() {
  return useOutletContext<EmployeeContext>();
}

const tabs = [
  { label: "Details", path: "details" },
  { label: "Employment", path: "employment" },
  { label: "Leave", path: "leave" },
  { label: "Attendance", path: "attendance" },
  { label: "Documents", path: "documents" },
  { label: "Reviews", path: "reviews" },
];

const EmployeeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { isAdmin, isManager, employee: me } = useAuth();
  const [employee, setEmployee] = useState<EmployeeFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data } = await supabase
      .from("employees")
      .select(
        "*, departments(id, name), positions(id, title, level), manager:manager_id(id, first_name, last_name)",
      )
      .eq("id", id)
      .maybeSingle();
    setEmployee((data as unknown as EmployeeFull) ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <DashboardLayout>
        <Skeleton className="h-40 w-full" />
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout title="Employee not found">
        <Button asChild variant="outline">
          <Link to="/employees">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to employees
          </Link>
        </Button>
      </DashboardLayout>
    );
  }

  const canManage = isAdmin || (isManager && employee.manager_id === me?.id) || false;
  const name = `${employee.first_name} ${employee.last_name}`;
  const activeTab = tabs.find((tab) => location.pathname.endsWith(`/${tab.path}`))?.path ?? "details";

  return (
    <DashboardLayout>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/employees">
          <ArrowLeft className="mr-2 h-4 w-4" /> All employees
        </Link>
      </Button>

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-4 p-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-lg text-primary">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-[200px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-2xl font-semibold">{name}</h2>
              <Badge variant={statusVariant(employee.status)}>{titleCase(employee.status)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {employee.positions?.title ?? "No position"} ·{" "}
              {employee.departments?.name ?? "Unassigned"} · {employee.employee_code}
            </p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {employee.work_email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {employee.work_email}
                </span>
              )}
              {employee.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {employee.phone}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Joined</p>
            <p className="font-medium">{formatDate(employee.hire_date)}</p>
            {isAdmin && (
              <>
                <p className="mt-2 text-xs text-muted-foreground">Salary</p>
                <p className="font-medium">{formatMoney(employee.salary)}</p>
              </>
            )}
          </div>
          {isAdmin && (
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-wrap gap-2 border-b">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={`/employees/${employee.id}/${tab.path}`}
            className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
              activeTab === tab.path
                ? "border-primary font-medium text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Outlet context={{ employee, canManage, reload: load } satisfies EmployeeContext} />

      <EmployeeDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        employee={{
          id: employee.id,
          employee_code: employee.employee_code,
          first_name: employee.first_name,
          last_name: employee.last_name,
          work_email: employee.work_email ?? "",
          phone: employee.phone ?? "",
          department_id: employee.department_id,
          position_id: employee.position_id,
          manager_id: employee.manager_id,
          hire_date: employee.hire_date,
          employment_type: employee.employment_type,
          status: employee.status,
          salary: employee.salary ? String(employee.salary) : "",
          city: employee.city ?? "",
          emergency_contact_name: employee.emergency_contact_name ?? "",
          emergency_contact_phone: employee.emergency_contact_phone ?? "",
          notes: employee.notes ?? "",
        }}
        onSaved={load}
      />
    </DashboardLayout>
  );
};

export default EmployeeDetail;
