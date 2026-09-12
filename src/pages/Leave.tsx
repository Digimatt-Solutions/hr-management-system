import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { currentYear, daysBetween, formatDate, fullName, statusVariant, titleCase } from "@/lib/hr";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface LeaveType {
  id: string;
  name: string;
  days_per_year: number;
}

interface Balance {
  id: string;
  entitled_days: number;
  used_days: number;
  leave_types: { name: string } | null;
}

interface Request {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  reason: string | null;
  employees: { first_name: string; last_name: string } | null;
  leave_types: { name: string } | null;
}

const Leave = () => {
  const { employee, isManager } = useAuth();
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [mine, setMine] = useState<Request[]>([]);
  const [team, setTeam] = useState<Request[]>([]);
  const [open, setOpen] = useState(false);
  const [typeId, setTypeId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [t, b, m, all] = await Promise.all([
      supabase.from("leave_types").select("id, name, days_per_year").order("name"),
      employee
        ? supabase
            .from("leave_balances")
            .select("id, entitled_days, used_days, leave_types(name)")
            .eq("employee_id", employee.id)
            .eq("year", currentYear())
        : Promise.resolve({ data: [] as unknown[] }),
      employee
        ? supabase
            .from("leave_requests")
            .select(
              "id, employee_id, start_date, end_date, days, status, reason, employees(first_name, last_name), leave_types(name)",
            )
            .eq("employee_id", employee.id)
            .order("start_date", { ascending: false })
        : Promise.resolve({ data: [] as unknown[] }),
      supabase
        .from("leave_requests")
        .select(
          "id, employee_id, start_date, end_date, days, status, reason, employees(first_name, last_name), leave_types(name)",
        )
        .order("created_at", { ascending: false }),
    ]);
    setTypes((t.data as LeaveType[]) ?? []);
    setBalances((b.data as unknown as Balance[]) ?? []);
    setMine((m.data as unknown as Request[]) ?? []);
    setTeam(
      ((all.data as unknown as Request[]) ?? []).filter((r) => r.employee_id !== employee?.id),
    );
  }, [employee]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!employee) return toast.error("No employee record linked to your account");
    if (!typeId || !start || !end) return toast.error("Fill in the type and the dates");
    if (new Date(end) < new Date(start)) return toast.error("The end date is before the start date");
    setSaving(true);
    const { error } = await supabase.from("leave_requests").insert({
      employee_id: employee.id,
      leave_type_id: typeId,
      start_date: start,
      end_date: end,
      days: daysBetween(start, end),
      reason: reason || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Leave request submitted");
    setStart("");
    setEnd("");
    setReason("");
    setOpen(false);
    load();
  };

  const review = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("leave_requests")
      .update({
        status,
        reviewed_by: employee?.id ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return toast.error("Could not update the request");
    toast.success(status === "approved" ? "Leave approved" : "Leave rejected");
    load();
  };

  const renderTable = (rows: Request[], withNames: boolean, withActions = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          {withNames && <TableHead>Employee</TableHead>}
          <TableHead>Type</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead>Days</TableHead>
          <TableHead>Status</TableHead>
          {withActions && <TableHead />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            {withNames && <TableCell>{fullName(row.employees)}</TableCell>}
            <TableCell>{row.leave_types?.name}</TableCell>
            <TableCell>{formatDate(row.start_date)}</TableCell>
            <TableCell>{formatDate(row.end_date)}</TableCell>
            <TableCell>{row.days}</TableCell>
            <TableCell>
              <Badge variant={statusVariant(row.status)}>{titleCase(row.status)}</Badge>
            </TableCell>
            {withActions && (
              <TableCell className="space-x-2 text-right">
                <Button size="sm" onClick={() => review(row.id, "approved")}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => review(row.id, "rejected")}>
                  Reject
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={withNames ? (withActions ? 7 : 6) : 5}
              className="py-8 text-center text-muted-foreground"
            >
              Nothing to show.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const pending = team.filter((r) => r.status === "pending");

  return (
    <DashboardLayout
      title="Leave"
      description="Request time off and review your team's requests"
      actions={
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Request leave
        </Button>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My balances ({currentYear()})</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {balances.length === 0 && (
              <p className="text-sm text-muted-foreground">No balances allocated yet.</p>
            )}
            {balances.map((balance) => {
              const remaining = Number(balance.entitled_days) - Number(balance.used_days);
              const percent = balance.entitled_days
                ? (Number(balance.used_days) / Number(balance.entitled_days)) * 100
                : 0;
              return (
                <div key={balance.id} className="rounded-md border p-4">
                  <p className="font-medium">{balance.leave_types?.name}</p>
                  <p className="text-sm text-muted-foreground">{remaining} days left</p>
                  <Progress value={percent} className="mt-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Tabs defaultValue="mine">
          <TabsList>
            <TabsTrigger value="mine">My requests</TabsTrigger>
            {isManager && <TabsTrigger value="pending">Awaiting approval ({pending.length})</TabsTrigger>}
            {isManager && <TabsTrigger value="team">Team history</TabsTrigger>}
          </TabsList>
          <TabsContent value="mine">
            <Card>
              <CardContent className="p-4">{renderTable(mine, false)}</CardContent>
            </Card>
          </TabsContent>
          {isManager && (
            <TabsContent value="pending">
              <Card>
                <CardContent className="p-4">{renderTable(pending, true, true)}</CardContent>
              </Card>
            </TabsContent>
          )}
          {isManager && (
            <TabsContent value="team">
              <Card>
                <CardContent className="p-4">{renderTable(team, true)}</CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request leave</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeId} onValueChange={setTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a leave type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="leave-start">From</Label>
                <Input
                  id="leave-start"
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leave-end">To</Label>
                <Input
                  id="leave-end"
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-reason">Reason</Label>
              <Textarea
                id="leave-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={submit} disabled={saving}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Leave;
