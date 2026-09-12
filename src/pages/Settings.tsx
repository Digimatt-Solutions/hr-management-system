import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { formatDate, roleLabel } from "@/lib/hr";
import { toast } from "sonner";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface LeaveType {
  id: string;
  name: string;
  days_per_year: number;
  is_paid: boolean;
  requires_approval: boolean;
}

interface Holiday {
  id: string;
  name: string;
  holiday_date: string;
  is_recurring: boolean;
}

const Settings = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, r, lt, h] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name").order("full_name"),
      supabase.from("user_roles").select("user_id, role"),
      supabase
        .from("leave_types")
        .select("id, name, days_per_year, is_paid, requires_approval")
        .order("name"),
      supabase
        .from("holidays")
        .select("id, name, holiday_date, is_recurring")
        .order("holiday_date"),
    ]);
    const roles = r.data ?? [];
    setUsers(
      (p.data ?? []).map((profile) => ({
        ...profile,
        role: roles.find((row) => row.user_id === profile.id)?.role ?? "staff",
      })),
    );
    setLeaveTypes((lt.data as LeaveType[]) ?? []);
    setHolidays((h.data as Holiday[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeRole = async (userId: string, role: "admin" | "manager" | "staff") => {
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role }, { onConflict: "user_id" });
    if (error) return toast.error("Could not change this person's access level");
    toast.success("Access level updated");
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  };

  if (loading) {
    return (
      <DashboardLayout title="Settings" description="People access and HR configuration">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings" description="People access and HR configuration">
      <Tabs defaultValue="access">
        <TabsList>
          <TabsTrigger value="access">Access</TabsTrigger>
          <TabsTrigger value="leave">Leave types</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
        </TabsList>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Who can do what</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[200px]">Access level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.full_name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>
                        <Select
                          value={row.role}
                          onValueChange={(value) =>
                            changeRole(row.id, value as "admin" | "manager" | "staff")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["admin", "manager", "staff"].map((role) => (
                              <SelectItem key={role} value={role}>
                                {roleLabel(role)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leave types</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Days per year</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Needs approval</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>{type.days_per_year}</TableCell>
                      <TableCell>
                        <Badge variant={type.is_paid ? "default" : "outline"}>
                          {type.is_paid ? "Paid" : "Unpaid"}
                        </Badge>
                      </TableCell>
                      <TableCell>{type.requires_approval ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holidays">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Public holidays</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Repeats yearly</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-medium">{holiday.name}</TableCell>
                      <TableCell>{formatDate(holiday.holiday_date)}</TableCell>
                      <TableCell>{holiday.is_recurring ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;
