import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, formatTime, fullName, statusVariant, titleCase } from "@/lib/hr";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

interface Record {
  id: string;
  employee_id: string;
  work_date: string;
  clock_in: string | null;
  clock_out: string | null;
  hours_worked: number | null;
  status: string;
  employees: { first_name: string; last_name: string } | null;
}

const today = () => new Date().toISOString().slice(0, 10);

const Attendance = () => {
  const { employee, isManager } = useAuth();
  const [mine, setMine] = useState<Record[]>([]);
  const [day, setDay] = useState(today());
  const [dayRows, setDayRows] = useState<Record[]>([]);

  const load = useCallback(async () => {
    const [m, d] = await Promise.all([
      employee
        ? supabase
            .from("attendance_records")
            .select(
              "id, employee_id, work_date, clock_in, clock_out, hours_worked, status, employees(first_name, last_name)",
            )
            .eq("employee_id", employee.id)
            .order("work_date", { ascending: false })
            .limit(30)
        : Promise.resolve({ data: [] as unknown[] }),
      supabase
        .from("attendance_records")
        .select(
          "id, employee_id, work_date, clock_in, clock_out, hours_worked, status, employees(first_name, last_name)",
        )
        .eq("work_date", day)
        .order("clock_in"),
    ]);
    setMine((m.data as unknown as Record[]) ?? []);
    setDayRows((d.data as unknown as Record[]) ?? []);
  }, [employee, day]);

  useEffect(() => {
    load();
  }, [load]);

  const todayRecord = mine.find((r) => r.work_date === today());

  const clockIn = async () => {
    if (!employee) return toast.error("No employee record linked to your account");
    const { error } = await supabase.from("attendance_records").insert({
      employee_id: employee.id,
      work_date: today(),
      clock_in: new Date().toISOString(),
      status: "present",
    });
    if (error) return toast.error("Could not clock you in");
    toast.success("Clocked in");
    load();
  };

  const clockOut = async () => {
    if (!todayRecord) return;
    const { error } = await supabase
      .from("attendance_records")
      .update({ clock_out: new Date().toISOString() })
      .eq("id", todayRecord.id);
    if (error) return toast.error("Could not clock you out");
    toast.success("Clocked out");
    load();
  };

  return (
    <DashboardLayout
      title="Attendance"
      description="Clock in and out, and review timesheets"
      actions={
        todayRecord && !todayRecord.clock_out ? (
          <Button onClick={clockOut}>
            <LogOut className="mr-2 h-4 w-4" /> Clock out
          </Button>
        ) : todayRecord ? (
          <Badge variant="secondary">Day complete</Badge>
        ) : (
          <Button onClick={clockIn}>
            <LogIn className="mr-2 h-4 w-4" /> Clock in
          </Button>
        )
      }
    >
      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">My timesheet</TabsTrigger>
          {isManager && <TabsTrigger value="day">Daily register</TabsTrigger>}
        </TabsList>

        <TabsContent value="mine">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Last 30 days</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>In</TableHead>
                    <TableHead>Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mine.map((row) => (
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
                  {mine.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No attendance recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {isManager && (
          <TabsContent value="day">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Register</CardTitle>
                <Input
                  type="date"
                  className="w-[180px]"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>In</TableHead>
                      <TableHead>Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dayRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{fullName(row.employees)}</TableCell>
                        <TableCell>{formatTime(row.clock_in)}</TableCell>
                        <TableCell>{formatTime(row.clock_out)}</TableCell>
                        <TableCell>{row.hours_worked ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(row.status)}>{titleCase(row.status)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {dayRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          Nobody clocked in on this day.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </DashboardLayout>
  );
};

export default Attendance;
