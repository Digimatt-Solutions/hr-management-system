import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatMoney, fullName, statusVariant, titleCase } from "@/lib/hr";
import { Lock } from "lucide-react";
import { toast } from "sonner";

interface Period {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  pay_date: string | null;
  status: string;
}

interface Payslip {
  id: string;
  employee_id: string;
  gross_pay: number;
  allowances: number;
  tax: number;
  deductions: number;
  net_pay: number;
  employees: { first_name: string; last_name: string } | null;
}

const Payroll = () => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPeriods = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("payroll_periods")
      .select("id, name, start_date, end_date, pay_date, status")
      .order("start_date", { ascending: false });
    const rows = (data as Period[]) ?? [];
    setPeriods(rows);
    setSelected((prev) => prev ?? rows[0]?.id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPeriods();
  }, [loadPeriods]);

  useEffect(() => {
    if (!selected) return setPayslips([]);
    supabase
      .from("payslips")
      .select(
        "id, employee_id, gross_pay, allowances, tax, deductions, net_pay, employees(first_name, last_name)",
      )
      .eq("period_id", selected)
      .then(({ data }) => setPayslips((data as unknown as Payslip[]) ?? []));
  }, [selected]);

  const finalize = async (period: Period) => {
    const { error } = await supabase
      .from("payroll_periods")
      .update({ status: "finalized", finalized_at: new Date().toISOString() })
      .eq("id", period.id);
    if (error) return toast.error("Could not finalise this period");
    toast.success("Payroll period finalised");
    loadPeriods();
  };

  const current = periods.find((p) => p.id === selected);
  const totalNet = payslips.reduce((sum, p) => sum + Number(p.net_pay), 0);

  return (
    <DashboardLayout title="Payroll" description="Pay periods and payslips">
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {periods.map((period) => (
              <Card
                key={period.id}
                className={`cursor-pointer transition-colors ${period.id === selected ? "border-primary" : ""}`}
                onClick={() => setSelected(period.id)}
              >
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{period.name}</CardTitle>
                    <Badge variant={statusVariant(period.status)}>
                      {titleCase(period.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(period.start_date)} – {formatDate(period.end_date)}
                  </p>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Pay date {formatDate(period.pay_date)}
                  </p>
                  {period.status !== "finalized" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        finalize(period);
                      }}
                    >
                      <Lock className="mr-2 h-4 w-4" /> Finalise
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            {periods.length === 0 && (
              <p className="text-sm text-muted-foreground">No pay periods yet.</p>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Payslips {current ? `· ${current.name}` : ""}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {payslips.length} payslips · {formatMoney(totalNet)} total net pay
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Gross</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.map((slip) => (
                    <TableRow key={slip.id}>
                      <TableCell>
                        <Link
                          to={`/employees/${slip.employee_id}`}
                          className="font-medium hover:underline"
                        >
                          {fullName(slip.employees)}
                        </Link>
                      </TableCell>
                      <TableCell>{formatMoney(slip.gross_pay)}</TableCell>
                      <TableCell>{formatMoney(slip.allowances)}</TableCell>
                      <TableCell>{formatMoney(slip.tax)}</TableCell>
                      <TableCell>{formatMoney(slip.deductions)}</TableCell>
                      <TableCell className="font-medium">{formatMoney(slip.net_pay)}</TableCell>
                    </TableRow>
                  ))}
                  {payslips.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        No payslips for this period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Payroll;
