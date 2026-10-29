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
import { Building2, Plus, Users, Pencil, Trash2 } from "lucide-react";
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
  const [editing, setEditing] = useState<Row | null>(null);
  const [removing, setRemoving] = useState<Row | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [dep, emp, pos] = await Promise.all([
      supabase
        .from("departments")
        .select("id, name, code, description")
        .order("name"),
      supabase
        .from("employees")
        .select("id, department_id")
        .neq("status", "terminated"),
      supabase.from("positions").select("id, department_id"),
    ]);
    const departments = dep.data ?? [];
    if (dep.error || emp.error || pos.error)
      toast.error("Could not load department records");
    setRows(
      departments.map((d) => ({
        ...d,
        headcount: (emp.data ?? []).filter((e) => e.department_id === d.id)
          .length,
        positions: (pos.data ?? []).filter((p) => p.department_id === d.id)
          .length,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!name.trim() || !code.trim())
      return toast.error("Name and code are required");
    setSaving(true);
    if (
      name.trim().length > 150 ||
      code.trim().length > 30 ||
      description.length > 2000
    ) {
      setSaving(false);
      return toast.error("Department details are too long");
    }
    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description || null,
    };
    const { error } = editing
      ? await supabase
          .from("departments")
          .update(payload)
          .eq("id", editing.id)
          .select("id")
          .single()
      : await supabase.from("departments").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Department updated" : "Department created");
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
          <Button
            onClick={() => {
              setEditing(null);
              setName("");
              setCode("");
              setDescription("");
              setOpen(true);
            }}
          >
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
                <p className="text-sm text-muted-foreground">
                  {row.description || "No description"}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />{" "}
                    {row.headcount} people
                  </span>
                  <span className="text-muted-foreground">
                    {row.positions} roles
                  </span>
                </div>
                {isAdmin && (
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${row.name}`}
                      title="Edit department"
                      onClick={() => {
                        setEditing(row);
                        setName(row.name);
                        setCode(row.code);
                        setDescription(row.description ?? "");
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${row.name}`}
                      title="Delete department"
                      onClick={() => setRemoving(row)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
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
            <DialogTitle>
              {editing ? "Edit department" : "New department"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dep-name">Name</Label>
              <Input
                id="dep-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dep-code">Code</Label>
              <Input
                id="dep-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
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
              {editing ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!removing}
        onOpenChange={(v) => {
          if (!v) setRemoving(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {removing?.name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Departments with employees, positions or other linked records cannot
            be deleted.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={saving}
              onClick={async () => {
                if (!removing) return;
                if (removing.headcount || removing.positions)
                  return toast.error("Reassign employees and positions first");
                setSaving(true);
                const { error } = await supabase
                  .from("departments")
                  .delete()
                  .eq("id", removing.id);
                setSaving(false);
                if (error)
                  return toast.error(
                    "Department has linked records and cannot be deleted",
                  );
                toast.success("Department deleted");
                setRemoving(null);
                load();
                reload();
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Departments;
