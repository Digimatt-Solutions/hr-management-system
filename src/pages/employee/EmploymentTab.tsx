import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEmployeeContext } from "@/pages/EmployeeDetail";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, formatMoney, statusVariant, titleCase } from "@/lib/hr";

interface HistoryRow {
  id: string;
  change_type: string;
  previous_value: string | null;
  new_value: string | null;
  effective_date: string;
  notes: string | null;
}

const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-0.5 font-medium">{value || "—"}</p>
  </div>
);

const EmploymentTab = () => {
  const { employee } = useEmployeeContext();
  const { isAdmin } = useAuth();
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [reports, setReports] = useState<{ id: string; first_name: string; last_name: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      const [h, r] = await Promise.all([
        supabase
          .from("employment_history")
          .select("id, change_type, previous_value, new_value, effective_date, notes")
          .eq("employee_id", employee.id)
          .order("effective_date", { ascending: false }),
        supabase
          .from("employees")
          .select("id, first_name, last_name")
          .eq("manager_id", employee.id)
          .order("first_name"),
      ]);
      setHistory((h.data as HistoryRow[]) ?? []);
      setReports(r.data ?? []);
    };
    load();
  }, [employee.id]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employment</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Staff number" value={employee.employee_code} />
          <Field label="Status" value={<Badge variant={statusVariant(employee.status)}>{titleCase(employee.status)}</Badge>} />
          <Field label="Department" value={employee.departments?.name} />
          <Field label="Position" value={employee.positions?.title} />
          <Field label="Level" value={employee.positions?.level ? titleCase(employee.positions.level) : null} />
          <Field label="Employment type" value={titleCase(employee.employment_type)} />
          <Field label="Hire date" value={formatDate(employee.hire_date)} />
          <Field
            label="Reports to"
            value={
              employee.manager ? (
                <Link className="hover:underline" to={`/employees/${employee.manager.id}/details`}>
                  {employee.manager.first_name} {employee.manager.last_name}
                </Link>
              ) : null
            }
          />
          {isAdmin && <Field label="Monthly salary" value={formatMoney(employee.salary)} />}
          {employee.termination_date && (
            <Field label="Exit date" value={formatDate(employee.termination_date)} />
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Direct reports ({reports.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reports.length === 0 && (
              <p className="text-sm text-muted-foreground">No direct reports.</p>
            )}
            {reports.map((person) => (
              <Link
                key={person.id}
                to={`/employees/${person.id}/details`}
                className="block rounded-md border p-2 text-sm hover:bg-accent/40"
              >
                {person.first_name} {person.last_name}
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employment changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.length === 0 && (
              <p className="text-sm text-muted-foreground">No recorded changes.</p>
            )}
            {history.map((row) => (
              <div key={row.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{titleCase(row.change_type)}</p>
                <p className="text-muted-foreground">
                  {row.previous_value ? `${row.previous_value} → ` : ""}
                  {row.new_value} · {formatDate(row.effective_date)}
                </p>
                {row.notes && <p className="mt-1 text-muted-foreground">{row.notes}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmploymentTab;
