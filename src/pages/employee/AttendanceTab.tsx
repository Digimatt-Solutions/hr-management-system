import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEmployeeContext } from "@/pages/EmployeeDetail";
import { formatDate, formatTime, statusVariant, titleCase } from "@/lib/hr";

interface Record {
  id: string;
  work_date: string;
  clock_in: string | null;
  clock_out: string | null;
  hours_worked: number | null;
  status: string;
  notes: string | null;
}

const AttendanceTab = () => {
  const { employee } = useEmployeeContext();
  const [records, setRecords] = useState<Record[]>([]);

  useEffect(() => {
    supabase
      .from("attendance_records")
      .select("id, work_date, clock_in, clock_out, hours_worked, status, notes")
      .eq("employee_id", employee.id)
      .order("work_date", { ascending: false })
      .limit(60)
      .then(({ data }) => setRecords((data as Record[]) ?? []));
  }, [employee.id]);

  const totalHours = records.reduce((sum, row) => sum + Number(row.hours_worked ?? 0), 0);
  const presentDays = records.filter((row) => row.status === "present").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Days recorded</p>
            <p className="font-heading text-2xl font-semibold">{records.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Days present</p>
            <p className="font-heading text-2xl font-semibold">{presentDays}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Hours logged</p>
            <p className="font-heading text-2xl font-semibold">{totalHours.toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timesheet</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Clock in</TableHead>
                <TableHead>Clock out</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{formatDate(row.work_date)}</TableCell>
                  <TableCell>{formatTime(row.clock_in)}</TableCell>
                  <TableCell>{formatTime(row.clock_out)}</TableCell>
                  <TableCell>{row.hours_worked ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(row.status)}>{titleCase(row.status)}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No attendance recorded.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTab;
