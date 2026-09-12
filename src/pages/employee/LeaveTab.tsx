import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEmployeeContext } from "@/pages/EmployeeDetail";
import { currentYear, formatDate, statusVariant, titleCase } from "@/lib/hr";

interface Balance {
  id: string;
  entitled_days: number;
  used_days: number;
  leave_types: { name: string } | null;
}

interface Request {
  id: string;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  reason: string | null;
  leave_types: { name: string } | null;
}

const LeaveTab = () => {
  const { employee } = useEmployeeContext();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const load = async () => {
      const [b, r] = await Promise.all([
        supabase
          .from("leave_balances")
          .select("id, entitled_days, used_days, leave_types(name)")
          .eq("employee_id", employee.id)
          .eq("year", currentYear()),
        supabase
          .from("leave_requests")
          .select("id, start_date, end_date, days, status, reason, leave_types(name)")
          .eq("employee_id", employee.id)
          .order("start_date", { ascending: false }),
      ]);
      setBalances((b.data as unknown as Balance[]) ?? []);
      setRequests((r.data as unknown as Request[]) ?? []);
    };
    load();
  }, [employee.id]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leave balances ({currentYear()})</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <p className="text-sm text-muted-foreground">
                  {remaining} of {balance.entitled_days} days remaining
                </p>
                <Progress value={percent} className="mt-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leave history</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.leave_types?.name}</TableCell>
                  <TableCell>{formatDate(request.start_date)}</TableCell>
                  <TableCell>{formatDate(request.end_date)}</TableCell>
                  <TableCell>{request.days}</TableCell>
                  <TableCell className="max-w-[240px] truncate">{request.reason || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(request.status)}>{titleCase(request.status)}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No leave requests recorded.
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

export default LeaveTab;
