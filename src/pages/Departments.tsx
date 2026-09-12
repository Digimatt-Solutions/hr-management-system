import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useDepartments } from "@/contexts/DepartmentContext";
import { Building2, Plus, Users } from "lucide-react";
import { toast } from "sonner";

interface Row {
  id: string;
  name: string;
  code: string;
  description: string | null;
  headcount: number;
  positions: number;
}

const Departments = () => {
  const { isAdmin } = useAuth();
  const { reload } = useDepartments();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [dep, emp, pos] = await Promise.all([
      supabase.from("departments").select("id, name, code, description").order("name"),
      supabase.from("employees").select("id, department_id").neq("status", "terminated"),
      supabase.from("positions").select("id, department_id"),
    ]);
    const departments = dep.data ?? [];
    setRows(
      departments.map((d) => ({
        ...d,
        headcount: (emp.data ?? []).filter((e) => e.department_id === d.id).length,
        positions: (pos.data ?? []).filter((p) => p.department_id === d.id).length,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!name.trim() || !code.trim()) return toast.error("Name and code are required");
    setSaving(true);
    const { error } = await supabase
      .from("departments")
      .insert({ name: name.trim(), code: code.trim().toUpperCase(), description: description || null });
    setSaving(false);
    if (error) return toast.error("Could not create the department");
    toast.success("Department created");
    setName("");
    setCode("");
    setDescription("");
    setOpen(false);
    load();
    reload();
  };

  return (
    <DashboardLayout
      title="Departments"
      description="Teams across the organisation"
      actions={
        isAdmin && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New department
          </Button>
        )
      }
    >
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <Card key={row.id}>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <div className="rounded-md bg-primary/10 p-2">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{row.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{row.code}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{row.description || "No description"}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" /> {row.headcount} people
                  </span>
                  <span className="text-muted-foreground">{row.positions} roles</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground">No departments yet.</p>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dep-name">Name</Label>
              <Input id="dep-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dep-code">Code</Label>
              <Input id="dep-code" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dep-desc">Description</Label>
              <Input
                id="dep-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Departments;
