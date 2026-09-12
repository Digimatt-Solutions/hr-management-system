import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import EmployeeDialog from "@/components/EmployeeDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useDepartments } from "@/contexts/DepartmentContext";
import { formatDate, statusVariant, titleCase } from "@/lib/hr";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

interface Row {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  work_email: string | null;
  phone: string | null;
  status: string;
  employment_type: string;
  hire_date: string;
  departments: { name: string } | null;
  positions: { title: string } | null;
}

const Employees = () => {
  const { isAdmin } = useAuth();
  const { selectedDepartment } = useDepartments();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("employees")
      .select(
        "id, employee_code, first_name, last_name, work_email, phone, status, employment_type, hire_date, departments(name), positions(title)",
      )
      .order("first_name");
    if (selectedDepartment) query = query.eq("department_id", selectedDepartment.id);
    const { data, error } = await query;
    if (error) toast.error("Could not load the staff directory");
    setRows((data as unknown as Row[]) ?? []);
    setLoading(false);
  }, [selectedDepartment]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = rows.filter((row) => {
    const haystack = `${row.first_name} ${row.last_name} ${row.employee_code} ${row.work_email ?? ""} ${row.positions?.title ?? ""}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesStatus = status === "all" || row.status === status;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout
      title="Employees"
      description={`${filtered.length} of ${rows.length} people`}
      actions={
        isAdmin && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add employee
          </Button>
        )
      }
    >
      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name, staff number, role"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {["active", "probation", "on_leave", "suspended", "terminated"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {titleCase(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Staff no.</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Hired</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Link to={`/employees/${row.id}`} className="font-medium hover:underline">
                          {row.first_name} {row.last_name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{row.work_email}</p>
                      </TableCell>
                      <TableCell>{row.employee_code}</TableCell>
                      <TableCell>{row.departments?.name ?? "—"}</TableCell>
                      <TableCell>{row.positions?.title ?? "—"}</TableCell>
                      <TableCell>{titleCase(row.employment_type)}</TableCell>
                      <TableCell>{formatDate(row.hire_date)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(row.status)}>{titleCase(row.status)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/employees/${row.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                        No employees match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EmployeeDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={load} />
    </DashboardLayout>
  );
};

export default Employees;
