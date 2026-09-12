import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, fullName, initials, roleLabel, statusVariant, titleCase } from "@/lib/hr";
import { toast } from "sonner";

const Profile = () => {
  const { user, role, employee, refreshEmployee, signOut } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .maybeSingle();
      setName(data?.full_name ?? "");
      setPhone(data?.phone ?? "");
    };
    load();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name, phone: phone || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error("Could not save your details");
    toast.success("Details saved");
    refreshEmployee();
  };

  const displayName = employee ? fullName(employee) : name || user?.email || "You";

  return (
    <DashboardLayout title="My profile" description="Your account and employment details">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="items-center text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">{initials(displayName)}</AvatarFallback>
            </Avatar>
            <CardTitle className="mt-3 text-lg">{displayName}</CardTitle>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge variant="secondary">{roleLabel(role)}</Badge>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={signOut}>
              Sign out
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-phone">Phone</Label>
                <Input
                  id="profile-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button onClick={save} disabled={saving}>
                Save changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employment</CardTitle>
            </CardHeader>
            <CardContent>
              {employee ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Staff number</p>
                    <p className="text-sm font-medium">{employee.employee_code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Work email</p>
                    <p className="text-sm font-medium">{employee.work_email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hired</p>
                    <p className="text-sm font-medium">{formatDate(employee.hire_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={statusVariant(employee.status)}>
                      {titleCase(employee.status)}
                    </Badge>
                  </div>
                  <div className="sm:col-span-2">
                    <Button asChild variant="outline">
                      <Link to={`/employees/${employee.id}`}>Open my employee record</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your account is not yet linked to an employee record.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
