import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export interface EmployeeFormValues {
  id?: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  work_email: string;
  phone: string;
  department_id: string | null;
  position_id: string | null;
  manager_id: string | null;
  hire_date: string;
  employment_type: string;
  status: string;
  salary: string;
  city: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
}

const empty: EmployeeFormValues = {
  employee_code: "",
  first_name: "",
  last_name: "",
  work_email: "",
  phone: "",
  department_id: null,
  position_id: null,
  manager_id: null,
  hire_date: new Date().toISOString().slice(0, 10),
  employment_type: "full_time",
  status: "active",
  salary: "",
  city: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  notes: "",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Partial<EmployeeFormValues> | null;
  onSaved: () => void;
}

const EmployeeDialog = ({ open, onOpenChange, employee, onSaved }: Props) => {
  const [values, setValues] = useState<EmployeeFormValues>(empty);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [positions, setPositions] = useState<{ id: string; title: string; department_id: string | null }[]>([]);
  const [managers, setManagers] = useState<{ id: string; first_name: string; last_name: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const [d, p, m] = await Promise.all([
        supabase.from("departments").select("id, name").order("name"),
        supabase.from("positions").select("id, title, department_id").order("title"),
        supabase.from("employees").select("id, first_name, last_name").order("first_name"),
      ]);
      setDepartments(d.data ?? []);
      setPositions(p.data ?? []);
      setManagers(m.data ?? []);
    };
    load();
  }, [open]);

  useEffect(() => {
    if (open) {
      setValues({
        ...empty,
        employee_code: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        ...(employee ?? {}),
      } as EmployeeFormValues);
    }
  }, [open, employee]);

  const set = (key: keyof EmployeeFormValues, value: string | null) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        employee_code: values.employee_code,
        first_name: values.first_name,
        last_name: values.last_name,
        work_email: values.work_email || null,
        phone: values.phone || null,
        department_id: values.department_id,
        position_id: values.position_id,
        manager_id: values.manager_id,
        hire_date: values.hire_date,
        employment_type: values.employment_type as any,
        status: values.status as any,
        salary: values.salary ? Number(values.salary) : null,
        city: values.city || null,
        emergency_contact_name: values.emergency_contact_name || null,
        emergency_contact_phone: values.emergency_contact_phone || null,
        notes: values.notes || null,
      };

      if (values.id) {
        const { error } = await supabase.from("employees").update(payload).eq("id", values.id);
        if (error) throw error;
        toast.success("Employee updated");
      } else {
        const { data, error } = await supabase.from("employees").insert(payload).select("id").single();
        if (error) throw error;
        const checklist = [
          "Sign employment contract",
          "Submit ID and tax documents",
          "IT equipment and accounts setup",
          "Team introduction and orientation",
          "Complete policy handbook acknowledgement",
        ];
        await supabase.from("onboarding_tasks").insert(
          checklist.map((title, index) => ({
            employee_id: data.id,
            title,
            sort_order: index + 1,
          })),
        );
        toast.success("Employee added with an onboarding checklist");
      }
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Could not save the employee");
    } finally {
      setSaving(false);
    }
  };

  const filteredPositions = values.department_id
    ? positions.filter((p) => p.department_id === values.department_id)
    : positions;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{values.id ? "Edit employee" : "Add employee"}</DialogTitle>
          <DialogDescription>
            Employment details are visible to the employee, their manager and HR admins.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" value={values.first_name} onChange={(e) => set("first_name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" value={values.last_name} onChange={(e) => set("last_name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee_code">Staff number</Label>
              <Input id="employee_code" value={values.employee_code} onChange={(e) => set("employee_code", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="work_email">Work email</Label>
              <Input id="work_email" type="email" value={values.work_email} onChange={(e) => set("work_email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={values.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={values.department_id ?? "none"}
                onValueChange={(v) => {
                  set("department_id", v === "none" ? null : v);
                  set("position_id", null);
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={values.position_id ?? "none"}
                onValueChange={(v) => set("position_id", v === "none" ? null : v)}
              >
                <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {filteredPositions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reports to</Label>
              <Select
                value={values.manager_id ?? "none"}
                onValueChange={(v) => set("manager_id", v === "none" ? null : v)}
              >
                <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No manager</SelectItem>
                  {managers
                    .filter((m) => m.id !== values.id)
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.first_name} {m.last_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hire_date">Hire date</Label>
              <Input id="hire_date" type="date" value={values.hire_date} onChange={(e) => set("hire_date", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Employment type</Label>
              <Select value={values.employment_type} onValueChange={(v) => set("employment_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["full_time", "part_time", "contract", "intern", "temporary"].map((t) => (
                    <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={values.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["active", "probation", "on_leave", "suspended", "terminated"].map((s) => (
                    <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Monthly salary</Label>
              <Input id="salary" type="number" value={values.salary} onChange={(e) => set("salary", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ec_name">Emergency contact</Label>
              <Input id="ec_name" value={values.emergency_contact_name} onChange={(e) => set("emergency_contact_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ec_phone">Emergency phone</Label>
              <Input id="ec_phone" value={values.emergency_contact_phone} onChange={(e) => set("emergency_contact_phone", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={values.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {values.id ? "Save changes" : "Add employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDialog;
