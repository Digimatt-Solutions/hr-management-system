import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useAuth } from "@/contexts/AuthContext";
import { useDepartments } from "@/contexts/DepartmentContext";
import { formatDate, titleCase } from "@/lib/hr";
import { Megaphone, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import SmsBroadcast from '@/components/SmsBroadcast';

interface Row {
  id: string;
  title: string;
  body: string;
  priority: string;
  published_at: string;
  department_id: string | null;
  departments: { name: string } | null;
}

const Announcements = () => {
  const { isAdmin, isManager, user } = useAuth();
  const { departments } = useDepartments();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("normal");
  const [departmentId, setDepartmentId] = useState("all");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Row|null>(null);
  const [removing, setRemoving] = useState<Row|null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("id, title, body, priority, published_at, department_id, departments(name)")
      .order("published_at", { ascending: false });
    setRows((data as unknown as Row[]) ?? []);
    if(error)toast.error('Could not load announcements');
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!title.trim() || !body.trim()) return toast.error("Add a title and a message");
    if(title.length>200||body.length>5000)return toast.error('Title or message is too long');
    if(!user)return toast.error('Sign in required');
    setSaving(true);
    const payload={
      title: title.trim(),
      body: body.trim(),
      priority,
      author_id: user?.id ?? null,
      department_id: departmentId === "all" ? null : departmentId,
    };
    const {error}=editing?await supabase.from('announcements').update(payload).eq('id',editing.id).select('id').single():await supabase.from('announcements').insert(payload);
    setSaving(false);
    if (error) return toast.error("Could not publish the announcement");
    toast.success(editing?'Announcement updated':"Announcement published");
    setTitle("");
    setBody("");
    setOpen(false);
    load();
  };

  return (
    <DashboardLayout
      title="Announcements"
      description="Company and department news"
      actions={
        (isAdmin || isManager) && (
          <Button onClick={() => {setEditing(null);setTitle('');setBody('');setPriority('normal');setDepartmentId('all');setOpen(true);}}>
            <Plus className="mr-2 h-4 w-4" /> New announcement
          </Button>
        )
      }
    >
      {isAdmin&&<SmsBroadcast/>}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No announcements yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <Card key={row.id}>
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <div className="rounded-md bg-primary/10 p-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">{row.title}</CardTitle>
                    {row.priority !== "normal" && (
                      <Badge variant={row.priority === "urgent" ? "destructive" : "secondary"}>
                        {titleCase(row.priority)}
                      </Badge>
                    )}
                    <Badge variant="outline">{row.departments?.name ?? "Company-wide"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(row.published_at)}</p>
                </div>
                {isAdmin&&<div className="flex gap-1"><Button variant="ghost" size="icon" aria-label={`Edit ${row.title}`} title="Edit announcement" onClick={()=>{setEditing(row);setTitle(row.title);setBody(row.body);setPriority(row.priority);setDepartmentId(row.department_id??'all');setOpen(true);}}><Pencil className="h-4 w-4"/></Button><Button variant="ghost" size="icon" aria-label={`Delete ${row.title}`} title="Delete announcement" onClick={()=>setRemoving(row)}><Trash2 className="h-4 w-4 text-destructive"/></Button></div>}
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm text-muted-foreground">{row.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?'Edit announcement':'New announcement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ann-title">Title</Label>
              <Input id="ann-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-body">Message</Label>
              <Textarea
                id="ann-body"
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["low", "normal", "high", "urgent"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {titleCase(p)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Company-wide</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving}>
              {editing?'Save changes':'Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!removing} onOpenChange={v=>{if(!v)setRemoving(null);}}><DialogContent><DialogHeader><DialogTitle>Delete announcement?</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">This removes “{removing?.title}” from company news.</p><DialogFooter><Button variant="outline" onClick={()=>setRemoving(null)}>Cancel</Button><Button variant="destructive" disabled={saving} onClick={async()=>{if(!removing)return;setSaving(true);const {error}=await supabase.from('announcements').delete().eq('id',removing.id);setSaving(false);if(error)return toast.error(error.message);setRemoving(null);toast.success('Announcement deleted');load();}}>Delete</Button></DialogFooter></DialogContent></Dialog>
    </DashboardLayout>
  );
};

export default Announcements;
