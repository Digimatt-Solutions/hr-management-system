import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, fullName } from "@/lib/hr";
import { toast } from "sonner";

interface Task {
  id: string;
  employee_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
  sort_order: number;
  employees: { first_name: string; last_name: string } | null;
}

const Onboarding = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("onboarding_tasks")
      .select(
        "id, employee_id, title, description, due_date, is_completed, sort_order, employees(first_name, last_name)",
      )
      .order("sort_order");
    setTasks((data as unknown as Task[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (task: Task) => {
    const next = !task.is_completed;
    const { error } = await supabase
      .from("onboarding_tasks")
      .update({ is_completed: next, completed_at: next ? new Date().toISOString() : null })
      .eq("id", task.id);
    if (error) return toast.error("Could not update the task");
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, is_completed: next } : t)));
  };

  const groups = Array.from(new Set(tasks.map((t) => t.employee_id)));

  return (
    <DashboardLayout title="Onboarding" description="New starter checklists">
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No onboarding checklists yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {groups.map((employeeId) => {
            const rows = tasks.filter((t) => t.employee_id === employeeId);
            const done = rows.filter((t) => t.is_completed).length;
            const percent = (done / rows.length) * 100;
            return (
              <Card key={employeeId}>
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link to={`/employees/${employeeId}`} className="hover:underline">
                      {fullName(rows[0]?.employees)}
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {done} of {rows.length} steps complete
                  </p>
                  <Progress value={percent} className="mt-2" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {rows.map((task) => (
                    <div key={task.id} className="flex items-start gap-3">
                      <Checkbox
                        checked={task.is_completed}
                        onCheckedChange={() => toggle(task)}
                        className="mt-1"
                      />
                      <div>
                        <p
                          className={
                            task.is_completed
                              ? "text-sm line-through text-muted-foreground"
                              : "text-sm font-medium"
                          }
                        >
                          {task.title}
                        </p>
                        {task.due_date && (
                          <p className="text-xs text-muted-foreground">
                            Due {formatDate(task.due_date)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Onboarding;
