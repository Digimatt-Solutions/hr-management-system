
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
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
  DialogDescription,
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
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Search,
  MessageSquareText,
  Building2,
  Clock3,
  Send,
  ChevronRight,
  Radio,
  CalendarDays,
  Users,
  CircleAlert,
  X,
  Filter,
  ArrowUpRight,
  Sparkles,
  Newspaper,
} from "lucide-react";
import { toast } from "sonner";
import SmsBroadcast from "@/components/SmsBroadcast";
import { useModules } from "@/contexts/ModuleContext";

interface Row {
  id: string;
  title: string;
  body: string;
  priority: string;
  published_at: string;
  department_id: string | null;
  departments: { name: string } | null;
}

const priorityStyles: Record<string, string> = {
  low: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  normal:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  high: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300",
  urgent:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
};

const Announcements = () => {
  const { isAdmin, isManager, user } = useAuth();
  const { enabled } = useModules();
  const { departments } = useDepartments();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("normal");
  const [departmentId, setDepartmentId] = useState("all");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [removing, setRemoving] = useState<Row | null>(null);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("announcements")
      .select(
        "id, title, body, priority, published_at, department_id, departments(name)",
      )
      .order("published_at", { ascending: false });

    if (error) {
      toast.error("Could not load announcements");
      setRows([]);
    } else {
      setRows((data as unknown as Row[]) ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !query ||
        row.title.toLowerCase().includes(query) ||
        row.body.toLowerCase().includes(query) ||
        (row.departments?.name ?? "Company-wide")
          .toLowerCase()
          .includes(query);

      const matchesPriority =
        priorityFilter === "all" || row.priority === priorityFilter;

      const matchesAudience =
        audienceFilter === "all" ||
        (audienceFilter === "company" && !row.department_id) ||
        (audienceFilter === "department" && !!row.department_id);

      return matchesSearch && matchesPriority && matchesAudience;
    });
  }, [rows, search, priorityFilter, audienceFilter]);

  const departmentCount = useMemo(
    () => new Set(rows.filter((row) => row.department_id).map((row) => row.department_id)).size,
    [rows],
  );

  const resetForm = () => {
    setTitle("");
    setBody("");
    setPriority("normal");
    setDepartmentId("all");
    setEditing(null);
  };

  const openNewAnnouncement = () => {
    resetForm();
    setOpen(true);
  };

  const save = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Add a title and a message");
      return;
    }

    if (title.length > 200 || body.length > 5000) {
      toast.error("Title or message is too long");
      return;
    }

    if (!user) {
      toast.error("Sign in required");
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      body: body.trim(),
      priority,
      author_id: user.id,
      department_id: departmentId === "all" ? null : departmentId,
    };

    const result = editing
      ? await supabase
          .from("announcements")
          .update(payload)
          .eq("id", editing.id)
          .select("id")
          .single()
      : await supabase.from("announcements").insert(payload);

    setSaving(false);

    if (result.error) {
      toast.error("Could not save the announcement");
      return;
    }

    toast.success(
      editing ? "Announcement updated" : "Announcement published",
    );

    setOpen(false);
    resetForm();
    await load();
  };

  const deleteAnnouncement = async () => {
    if (!removing) return;

    setSaving(true);

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", removing.id);

    setSaving(false);

    if (error) {
      toast.error("Could not delete the announcement");
      return;
    }

    setRemoving(null);
    toast.success("Announcement deleted");
    await load();
  };

  const clearFilters = () => {
    setSearch("");
    setPriorityFilter("all");
    setAudienceFilter("all");
  };

  const hasFilters =
    search.trim() !== "" ||
    priorityFilter !== "all" ||
    audienceFilter !== "all";

  return (
    <DashboardLayout
      title="SMS Broadcasting"
      description="Communicate with clients and keep your organisation informed."
      actions={
        (isAdmin || isManager) && (
          <Button
            onClick={openNewAnnouncement}
            className="h-10 rounded-xl shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            New announcement
          </Button>
        )
      }
    >
      <div className="space-y-8 pb-8">
        {/* Page introduction */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-primary/[0.08] to-transparent sm:block" />
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-primary/[0.08] blur-3xl" />

          <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:p-8">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1.5 text-xs font-semibold text-primary">
                <Radio className="h-3.5 w-3.5" />
                COMMUNICATION CENTRE
              </div>

              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Every message,{" "}
                <span className="text-primary">one place.</span>
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                Broadcast important updates to clients, manage your
                communication history, and keep company announcements
                organised from one workspace.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              {isAdmin && enabled("sms") && (
                <a
                  href="#sms-broadcast"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                  Open SMS broadcaster
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )}

              {(isAdmin || isManager) && (
                <Button
                  variant="outline"
                  onClick={openNewAnnouncement}
                  className="h-11 rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Announcement
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Summary cards for actual announcement records */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardContent className="flex items-start gap-3 p-4 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-11 sm:w-11">
                <Newspaper className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  Announcements
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {loading ? "—" : rows.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total published records
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardContent className="flex items-start gap-3 p-4 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 sm:h-11 sm:w-11">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  Departments
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {loading ? "—" : departmentCount}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Represented in announcements
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 rounded-2xl border-border/80 shadow-sm lg:col-span-1">
            <CardContent className="flex items-start gap-3 p-4 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 sm:h-11 sm:w-11">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  Company-wide
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {loading
                    ? "—"
                    : rows.filter((row) => !row.department_id).length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Available to the whole organisation
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SMS broadcast module */}
        {isAdmin && enabled("sms") && (
          <section id="sms-broadcast" className="scroll-mt-24 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <MessageSquareText className="h-4 w-4" />
                  CLIENT COMMUNICATION
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                  SMS broadcast
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Compose and send messages to your intended client audience.
                </p>
              </div>

              <Badge
                variant="outline"
                className="w-fit gap-1.5 rounded-full px-3 py-1.5 font-medium"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                SMS module enabled
              </Badge>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-gradient-to-r from-primary/[0.07] via-transparent to-transparent px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Broadcast workspace</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                      Your existing SMS sending workflow
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-6">
                <SmsBroadcast />
              </div>
            </div>
          </section>
        )}

        {/* Announcement history */}
        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Clock3 className="h-4 w-4" />
                COMMUNICATION ARCHIVE
              </div>
              <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                Announcement history
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Browse, search, and manage previously published announcements.
              </p>
            </div>

            <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
              {loading ? "Loading…" : `${filteredRows.length} records`}
            </Badge>
          </div>

          {/* Search and filters */}
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_190px_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search titles, messages or departments…"
                    aria-label="Search announcements"
                    className="h-11 rounded-xl pl-9"
                  />
                  {search && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    {["low", "normal", "high", "urgent"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {titleCase(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={audienceFilter}
                  onValueChange={setAudienceFilter}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="All audiences" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All audiences</SelectItem>
                    <SelectItem value="company">Company-wide</SelectItem>
                    <SelectItem value="department">Departments</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  disabled={!hasFilters}
                  className="h-11 rounded-xl"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* History entries */}
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <Card key={item} className="rounded-2xl">
                  <CardContent className="flex gap-4 p-5">
                    <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredRows.length === 0 ? (
            <Card className="rounded-2xl border-dashed shadow-none">
              <CardContent className="flex flex-col items-center px-5 py-14 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  {hasFilters ? (
                    <Search className="h-7 w-7" />
                  ) : (
                    <Megaphone className="h-7 w-7" />
                  )}
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {hasFilters
                    ? "No matching announcements"
                    : "Your history starts here"}
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  {hasFilters
                    ? "Try changing your search phrase or filters to find the announcement you need."
                    : "Published announcements will appear here, organised by date so you can revisit and manage them easily."}
                </p>

                {hasFilters ? (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-5 rounded-xl"
                  >
                    Clear filters
                  </Button>
                ) : (
                  (isAdmin || isManager) && (
                    <Button
                      onClick={openNewAnnouncement}
                      className="mt-5 rounded-xl"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create announcement
                    </Button>
                  )
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredRows.map((row) => (
                <Card
                  key={row.id}
                  className="group overflow-hidden rounded-2xl border-border/80 shadow-sm transition-all duration-200 hover:border-primary/25 hover:shadow-md"
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="hidden w-1 shrink-0 bg-primary/70 sm:block" />

                      <div className="min-w-0 flex-1 p-4 sm:p-5">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-12 sm:w-12">
                            <Megaphone className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="break-words text-base font-semibold tracking-tight sm:text-lg">
                                {row.title}
                              </h3>

                              <Badge
                                variant="outline"
                                className={`rounded-full text-[11px] font-semibold ${
                                  priorityStyles[row.priority] ??
                                  priorityStyles.normal
                                }`}
                              >
                                {titleCase(row.priority)}
                              </Badge>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatDate(row.published_at)}
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5" />
                                {row.departments?.name ?? "Company-wide"}
                              </span>
                            </div>

                            <p className="mt-4 whitespace-pre-line break-words text-sm leading-6 text-muted-foreground">
                              {row.body}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
                              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock3 className="h-3.5 w-3.5" />
                                Published {formatDate(row.published_at)}
                              </span>

                              {isAdmin && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Edit ${row.title}`}
                                    onClick={() => {
                                      setEditing(row);
                                      setTitle(row.title);
                                      setBody(row.body);
                                      setPriority(row.priority);
                                      setDepartmentId(
                                        row.department_id ?? "all",
                                      );
                                      setOpen(true);
                                    }}
                                    className="h-9 rounded-lg px-3 text-muted-foreground hover:text-foreground"
                                  >
                                    <Pencil className="mr-2 h-3.5 w-3.5" />
                                    Edit
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Delete ${row.title}`}
                                    onClick={() => setRemoving(row)}
                                    className="h-9 rounded-lg px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Delete
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create / edit announcement dialog */}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-xl">
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Megaphone className="h-5 w-5" />
            </div>

            <DialogTitle className="text-xl">
              {editing ? "Edit announcement" : "Create announcement"}
            </DialogTitle>

            <DialogDescription>
              Share a clear, useful update with your chosen audience.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="ann-title">Announcement title</Label>
              <Input
                id="ann-title"
                value={title}
                maxLength={200}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Important company update"
                className="h-11 rounded-xl"
              />
              <p className="text-right text-xs text-muted-foreground">
                {title.length}/200
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="ann-body">Message</Label>
                <span className="text-xs text-muted-foreground">
                  {body.length}/5000
                </span>
              </div>

              <Textarea
                id="ann-body"
                rows={6}
                maxLength={5000}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write your announcement here…"
                className="resize-y rounded-xl leading-6"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Choose priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {["low", "normal", "high", "urgent"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {titleCase(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Audience</Label>
                <Select
                  value={departmentId}
                  onValueChange={setDepartmentId}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Choose audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Company-wide</SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-3.5">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-5 text-muted-foreground">
                This announcement is saved to company news. It does not
                automatically send an SMS unless your existing system
                explicitly connects announcements to SMS delivery.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
              className="rounded-xl"
            >
              Cancel
            </Button>

            <Button
              onClick={save}
              disabled={saving || !title.trim() || !body.trim()}
              className="rounded-xl"
            >
              {saving ? (
                "Saving…"
              ) : editing ? (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Save changes
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Publish announcement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={!!removing}
        onOpenChange={(value) => {
          if (!value && !saving) setRemoving(null);
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <Trash2 className="h-5 w-5" />
            </div>

            <DialogTitle>Delete announcement?</DialogTitle>

            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <p className="break-words rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
            You are about to remove “{removing?.title}” from company news.
          </p>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setRemoving(null)}
              disabled={saving}
              className="rounded-xl"
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={saving}
              onClick={deleteAnnouncement}
              className="rounded-xl"
            >
              {saving ? "Deleting…" : "Delete announcement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Announcements;
