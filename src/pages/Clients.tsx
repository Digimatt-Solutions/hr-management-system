
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import ClientForm from "@/components/ClientForm";
import { type ClientRecord, membershipPlans } from "@/lib/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  Mail,
  Phone,
  CalendarDays,
  BriefcaseBusiness,
  UserRound,
  ArrowUpRight,
  RefreshCw,
  X,
  Filter,
  Clock3,
  ShieldCheck,
  LoaderCircle,
  Printer,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/hr";

const PAGE_SIZE = 15;

const excludedProfileFields = [
  "id",
  "owner_id",
  "privacy_agreed",
  "signature_confirmed",
  "updated_at",
];

const humanize = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const displayValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.map(String).join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const initials = (name?: string | null) => {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "CL"
  );
};

const avatarColors = [
  "bg-orange-100 text-orange-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-800",
];

const getAvatarColor = (name?: string | null) => {
  const value = name ?? "";
  const hash = Array.from(value).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return avatarColors[hash % avatarColors.length];
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const printDocument = (title: string, body: string) => {
  const printWindow = window.open("", "_blank", "width=1000,height=750");

  if (!printWindow) {
    toast.error("Printing was blocked. Allow pop-ups and try again.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4 landscape; margin: 14mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #202020;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      background: #fff;
    }
    .print-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      border-bottom: 3px solid #f37021;
      padding-bottom: 16px;
      margin-bottom: 22px;
    }
    .brand {
      color: #f37021;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    h1 { margin: 5px 0; font-size: 24px; color: #171717; }
    h2 { font-size: 15px; margin: 20px 0 10px; }
    .subtitle { color: #666; font-size: 11px; }
    .meta { text-align: right; color: #666; font-size: 10px; }
    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 0 0 18px;
    }
    .summary-item {
      flex: 1;
      min-width: 120px;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 10px;
    }
    .summary-label {
      display: block;
      color: #777;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: .5px;
    }
    .summary-value {
      display: block;
      font-size: 17px;
      font-weight: 700;
      margin-top: 3px;
    }
    table { width: 100%; border-collapse: collapse; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; }
    th {
      background: #f5f5f5;
      text-align: left;
      text-transform: uppercase;
      letter-spacing: .4px;
      font-size: 9px;
      color: #555;
    }
    th, td {
      padding: 9px 8px;
      border: 1px solid #e5e5e5;
      vertical-align: top;
      overflow-wrap: anywhere;
    }
    tbody tr:nth-child(even) { background: #fafafa; }
    .client-name { font-weight: 700; color: #222; }
    .secondary { color: #666; font-size: 10px; margin-top: 2px; }
    .membership {
      display: inline-block;
      margin: 1px 3px 2px 0;
      padding: 2px 6px;
      border: 1px solid #f4c4a8;
      border-radius: 4px;
      background: #fff7f1;
      color: #9a4315;
      font-size: 9px;
    }
    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .field {
      border: 1px solid #e5e5e5;
      border-radius: 7px;
      padding: 10px;
      break-inside: avoid;
    }
    .field-label {
      color: #777;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: .4px;
    }
    .field-value {
      margin-top: 4px;
      font-size: 11px;
      font-weight: 600;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      color: #777;
      font-size: 9px;
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    @media screen {
      body { padding: 24px; max-width: 1200px; margin: auto; }
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  ${body}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`);
  printWindow.document.close();
};

export default function Clients() {
  const [rows, setRows] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("all");
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);

  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState<ClientRecord | null>(null);
  const [view, setView] = useState<ClientRecord | null>(null);
  const [remove, setRemove] = useState<ClientRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [printing, setPrinting] = useState(false);

  const safeSearch = useMemo(
    () => search.trim().replace(/[%_,().]/g, ""),
    [search],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      let query = supabase
        .from("clients")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (safeSearch) {
        query = query.or(
          `full_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%,phone.ilike.%${safeSearch}%,company_name.ilike.%${safeSearch}%`,
        );
      }

      if (plan !== "all") {
        query = query.contains("membership_plans", [plan]);
      }

      const result = await query;
      if (result.error) throw result.error;

      setRows((result.data ?? []) as ClientRecord[]);
      setCount(result.count ?? 0);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while loading clients.";

      setError(message);
      toast.error("Could not load client records");
    } finally {
      setLoading(false);
    }
  }, [safeSearch, plan, page]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const startRecord = count === 0 ? 0 : page * PAGE_SIZE + 1;
  const endRecord = Math.min((page + 1) * PAGE_SIZE, count);

  const pageMemberships = useMemo(() => {
    const memberships = new Set<string>();
    rows.forEach((row) =>
      (row.membership_plans ?? []).forEach((membership) =>
        memberships.add(membership),
      ),
    );
    return memberships.size;
  }, [rows]);

  const newestClient = rows[0] ?? null;
  const hasFilters = Boolean(search.trim()) || plan !== "all";

  const clearFilters = () => {
    setSearch("");
    setPlan("all");
    setPage(0);
  };

  const openNewClient = () => {
    setRecord(null);
    setOpen(true);
  };

  const openEditClient = (client: ClientRecord) => {
    setRecord(client);
    setOpen(true);
  };

  const deleteClient = async () => {
    if (!remove || deleting) return;
    setDeleting(true);

    try {
      const { error: deleteError } = await supabase
        .from("clients")
        .delete()
        .eq("id", remove.id);

      if (deleteError) throw deleteError;

      toast.success("Client record deleted");
      setRemove(null);

      if (rows.length === 1 && page > 0) {
        setPage((current) => current - 1);
      } else {
        await load();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete this client.",
      );
    } finally {
      setDeleting(false);
    }
  };

  // Fetch every matching record for printing, not just the current page.
  const fetchAllMatchingClients = async (): Promise<ClientRecord[]> => {
    const allClients: ClientRecord[] = [];
    const batchSize = 500;
    let from = 0;

    while (true) {
      let query = supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + batchSize - 1);

      if (safeSearch) {
        query = query.or(
          `full_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%,phone.ilike.%${safeSearch}%,company_name.ilike.%${safeSearch}%`,
        );
      }

      if (plan !== "all") {
        query = query.contains("membership_plans", [plan]);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const batch = (data ?? []) as ClientRecord[];
      allClients.push(...batch);

      if (batch.length < batchSize) break;
      from += batchSize;
    }

    return allClients;
  };

  const printClientList = async () => {
    if (printing) return;
    setPrinting(true);

    try {
      toast.info("Preparing the client list for printing...");
      const clients = await fetchAllMatchingClients();

      if (!clients.length) {
        toast.error("There are no client records to print.");
        return;
      }

      const tableRows = clients
        .map((client, index) => {
          const memberships = (client.membership_plans ?? [])
            .map(
              (membership) =>
                `<span class="membership">${escapeHtml(membership)}</span>`,
            )
            .join("");

          return `
            <tr>
              <td>${index + 1}</td>
              <td>
                <div class="client-name">${escapeHtml(client.full_name || "Unnamed client")}</div>
                <div class="secondary">${escapeHtml(client.company_name || "Individual client")}</div>
              </td>
              <td>
                <div>${escapeHtml(client.phone || "No phone")}</div>
                <div class="secondary">${escapeHtml(client.email || "No email")}</div>
              </td>
              <td>${memberships || "—"}</td>
              <td>${escapeHtml(client.created_at ? formatDate(client.created_at) : "—")}</td>
            </tr>`;
        })
        .join("");

      const filterDescription = [
        safeSearch ? `Search: "${safeSearch}"` : "",
        plan !== "all" ? `Membership: ${plan}` : "",
      ]
        .filter(Boolean)
        .join(" · ") || "All client records";

      const now = new Date().toLocaleString();

      printDocument(
        "Kazini Admin - Client Directory",
        `
          <header class="print-header">
            <div>
              <div class="brand">Kazini Admin</div>
              <h1>Client Directory</h1>
              <div class="subtitle">Client records and membership overview</div>
            </div>
            <div class="meta">
              <div><strong>Generated:</strong> ${escapeHtml(now)}</div>
              <div><strong>Records:</strong> ${clients.length}</div>
            </div>
          </header>

          <div class="summary">
            <div class="summary-item">
              <span class="summary-label">Total matching clients</span>
              <span class="summary-value">${clients.length}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Membership filter</span>
              <span class="summary-value" style="font-size:13px">${escapeHtml(plan === "all" ? "All memberships" : plan)}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Search filter</span>
              <span class="summary-value" style="font-size:13px">${escapeHtml(safeSearch || "None")}</span>
            </div>
          </div>

          <p class="subtitle">Report criteria: ${escapeHtml(filterDescription)}</p>

          <table>
            <thead>
              <tr>
                <th style="width:35px">#</th>
                <th>Client / Company</th>
                <th>Contact details</th>
                <th>Membership plans</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>

          <footer class="footer">
            <span>Kazini Admin · Confidential client information</span>
            <span>Generated ${escapeHtml(now)}</span>
          </footer>
        `,
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to prepare the client report.",
      );
    } finally {
      setPrinting(false);
    }
  };

  const printClientProfile = (client: ClientRecord) => {
    const fields = Object.entries(client)
      .filter(
        ([key]) =>
          !excludedProfileFields.includes(key) &&
          !["full_name", "company_name", "phone", "email"].includes(key),
      )
      .map(
        ([key, value]) => `
          <div class="field">
            <div class="field-label">${escapeHtml(humanize(key))}</div>
            <div class="field-value">${escapeHtml(
              key === "created_at" && value
                ? formatDate(String(value))
                : displayValue(value),
            )}</div>
          </div>`,
      )
      .join("");

    const memberships = (client.membership_plans ?? [])
      .map(
        (membership) =>
          `<span class="membership">${escapeHtml(membership)}</span>`,
      )
      .join("");

    const now = new Date().toLocaleString();

    printDocument(
      `Client Profile - ${client.full_name || "Client"}`,
      `
        <header class="print-header">
          <div>
            <div class="brand">Kazini Admin</div>
            <h1>Client Profile</h1>
            <div class="subtitle">Registered client information</div>
          </div>
          <div class="meta">
            <div><strong>Printed:</strong> ${escapeHtml(now)}</div>
          </div>
        </header>

        <h2>${escapeHtml(client.full_name || "Unnamed client")}</h2>
        <p class="subtitle">${escapeHtml(client.company_name || "Individual client")}</p>

        <div class="profile-grid">
          <div class="field">
            <div class="field-label">Full name</div>
            <div class="field-value">${escapeHtml(client.full_name || "—")}</div>
          </div>
          <div class="field">
            <div class="field-label">Company</div>
            <div class="field-value">${escapeHtml(client.company_name || "—")}</div>
          </div>
          <div class="field">
            <div class="field-label">Phone number</div>
            <div class="field-value">${escapeHtml(client.phone || "—")}</div>
          </div>
          <div class="field">
            <div class="field-label">Email address</div>
            <div class="field-value">${escapeHtml(client.email || "—")}</div>
          </div>
          <div class="field">
            <div class="field-label">Membership plans</div>
            <div class="field-value">${memberships || "None selected"}</div>
          </div>
        </div>

        <h2>Additional information</h2>
        <div class="profile-grid">${fields}</div>

        <footer class="footer">
          <span>Kazini Admin · Confidential client information</span>
          <span>Generated ${escapeHtml(now)}</span>
        </footer>
      `,
    );
  };

  const renderMemberships = (client: ClientRecord) => {
    const memberships = client.membership_plans ?? [];

    if (!memberships.length) {
      return (
        <span className="text-sm text-muted-foreground">
          No membership selected
        </span>
      );
    }

    return (
      <div className="flex flex-wrap gap-1.5">
        {memberships.map((membership) => (
          <Badge
            key={membership}
            variant="secondary"
            className="rounded-md border border-orange-100 bg-orange-50 px-2 py-0.5 font-medium text-orange-800 hover:bg-orange-50"
          >
            {membership}
          </Badge>
        ))}
      </div>
    );
  };

  const renderClientIdentity = (client: ClientRecord) => (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${getAvatarColor(client.full_name)}`}
      >
        {initials(client.full_name)}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground">
          {client.full_name || "Unnamed client"}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {client.company_name || "Individual client"}
        </p>
      </div>
    </div>
  );

  const renderActions = (client: ClientRecord) => (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="View client profile"
        aria-label={`View ${client.full_name}`}
        className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-orange-50 hover:text-orange-700"
        onClick={() => setView(client)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="Edit client"
        aria-label={`Edit ${client.full_name}`}
        className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted"
        onClick={() => openEditClient(client)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="Delete client"
        aria-label={`Delete ${client.full_name}`}
        className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setRemove(client)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );

  return (
    <DashboardLayout
      title="Client Management"
      description="Manage client profiles, memberships and registration records."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void printClientList()}
            disabled={loading || printing || count === 0}
            className="h-10 gap-2 rounded-xl"
          >
            {printing ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            <span>{printing ? "Preparing..." : "Print list"}</span>
          </Button>

          <Button
            onClick={openNewClient}
            className="h-10 gap-2 rounded-xl bg-orange-600 px-4 font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
          >
            <Plus className="h-4 w-4" />
            <span>New client</span>
          </Button>
        </div>
      }
    >
      <div className="font-homeSans [&_h1]:font-homeHeading [&_h2]:font-homeHeading [&_h3]:font-homeHeading">
        <div className="mb-6 overflow-hidden rounded-2xl border bg-card">
          <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-700 ring-1 ring-orange-100">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight">
                    Client directory
                  </h2>
                  <Badge
                    variant="outline"
                    className="rounded-full bg-muted/40 font-medium"
                  >
                    Live records
                  </Badge>
                </div>
                <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                  A central workspace for client information, business
                  contacts and membership plans.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void load()}
              disabled={loading}
              className="h-9 gap-2 self-start rounded-xl sm:self-center"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div className="rounded-2xl border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                Matching clients
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
              {loading ? "—" : count.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {hasFilters ? "Based on current filters" : "All client records"}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                Membership types
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
              {loading ? "—" : pageMemberships}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Unique types on this page
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                Current page
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <BriefcaseBusiness className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
              {loading ? "—" : rows.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {loading
                ? "Loading records"
                : count
                  ? `Showing ${startRecord}–${endRecord}`
                  : "No records to display"}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border bg-card p-4 sm:p-5 xl:col-span-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                Latest registration
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Clock3 className="h-4 w-4" />
              </span>
            </div>
            {loading ? (
              <Skeleton className="mt-4 h-6 w-36" />
            ) : newestClient ? (
              <>
                <p className="mt-3 truncate text-base font-bold">
                  {newestClient.full_name || "Unnamed client"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {newestClient.created_at
                    ? formatDate(newestClient.created_at)
                    : "Date unavailable"}
                </p>
              </>
            ) : (
              <>
                <p className="mt-3 text-base font-bold">No registrations</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  New clients will appear here.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mb-5 rounded-2xl border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Find a client</h3>
              <p className="text-xs text-muted-foreground">
                Search client details or narrow the list by membership.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search clients"
                placeholder="Search name, company, email or phone..."
                className="h-11 rounded-xl border-muted-foreground/20 bg-background pl-10 pr-10 focus-visible:ring-orange-500"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => {
                    setSearch("");
                    setPage(0);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Select
              value={plan}
              onValueChange={(value) => {
                setPlan(value);
                setPage(0);
              }}
            >
              <SelectTrigger
                aria-label="Filter by membership"
                className="h-11 w-full rounded-xl bg-background md:w-[230px]"
              >
                <SelectValue placeholder="All memberships" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All memberships</SelectItem>
                {membershipPlans.map((membership) => (
                  <SelectItem value={membership} key={membership}>
                    {membership}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="h-11 gap-2 rounded-xl"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {hasFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Active filters:</span>
              {search.trim() && (
                <Badge
                  variant="secondary"
                  className="max-w-full gap-1 rounded-md font-normal"
                >
                  <Search className="h-3 w-3 shrink-0" />
                  <span className="max-w-[200px] truncate">{search.trim()}</span>
                </Badge>
              )}
              {plan !== "all" && (
                <Badge variant="secondary" className="rounded-md font-normal">
                  {plan}
                </Badge>
              )}
            </div>
          )}
        </div>

        <section className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h3 className="font-semibold tracking-tight">Registered clients</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                View profiles, update details or manage client records.
              </p>
            </div>
            {!loading && !error && (
              <Badge
                variant="outline"
                className="w-fit rounded-lg px-2.5 py-1 tabular-nums"
              >
                {count.toLocaleString()} record{count === 1 ? "" : "s"}
              </Badge>
            )}
          </div>

          {error ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Unable to load clients</h3>
              <p className="mx-auto mt-2 max-w-md break-words text-sm text-muted-foreground">
                {error}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void load()}
                className="mt-5 gap-2 rounded-xl"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
            </div>
          ) : loading ? (
            <div className="space-y-3 p-4 sm:p-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border p-4"
                >
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-36 max-w-full" />
                    <Skeleton className="h-3 w-52 max-w-full" />
                  </div>
                  <Skeleton className="hidden h-8 w-20 sm:block" />
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-16 text-center sm:py-20">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border bg-muted/40 text-muted-foreground">
                {hasFilters ? (
                  <Search className="h-6 w-6" />
                ) : (
                  <Users className="h-6 w-6" />
                )}
              </div>
              <h3 className="text-base font-semibold">
                {hasFilters ? "No matching clients" : "Your directory is empty"}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {hasFilters
                  ? "Try changing your search terms or membership filter to find the record."
                  : "Create your first client record to start building your client directory."}
              </p>
              {hasFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-5 gap-2 rounded-xl"
                >
                  <X className="h-4 w-4" />
                  Clear filters
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={openNewClient}
                  className="mt-5 gap-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4" />
                  Add first client
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Client
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Contact details
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Membership
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Registered
                      </th>
                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((client) => (
                      <tr
                        key={client.id}
                        className="group border-b last:border-0 transition-colors hover:bg-muted/20"
                      >
                        <td className="px-5 py-4">{renderClientIdentity(client)}</td>
                        <td className="px-5 py-4">
                          <div className="flex min-w-0 items-center gap-2">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate">{client.phone || "No phone"}</span>
                          </div>
                          <div className="mt-1.5 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{client.email || "No email"}</span>
                          </div>
                        </td>
                        <td className="max-w-[230px] px-5 py-4">
                          {renderMemberships(client)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {client.created_at ? formatDate(client.created_at) : "—"}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end">{renderActions(client)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-3 md:hidden">
                {rows.map((client) => (
                  <article
                    key={client.id}
                    className="rounded-xl border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {renderClientIdentity(client)}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`View ${client.full_name}`}
                        className="h-9 w-9 shrink-0 rounded-lg"
                        onClick={() => setView(client)}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-4 space-y-2.5 border-t pt-3">
                      <div className="flex min-w-0 items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="break-all">{client.phone || "No phone provided"}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="break-all">{client.email || "No email provided"}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>{renderMemberships(client)}</div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Registered {client.created_at ? formatDate(client.created_at) : "date unavailable"}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end border-t pt-2">
                      {renderActions(client)}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {!loading && !error && count > 0 && (
            <div className="flex flex-col gap-3 border-t bg-muted/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-muted-foreground sm:text-sm">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {startRecord}–{endRecord}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {count.toLocaleString()}
                </span>{" "}
                clients
              </p>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="text-xs text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Previous page"
                    className="h-9 w-9 rounded-lg"
                    disabled={page === 0 || loading}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Next page"
                    className="h-9 w-9 rounded-lg"
                    disabled={page + 1 >= totalPages || loading}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <ClientForm
        open={open}
        onOpenChange={setOpen}
        record={record}
        admin
        onSaved={() => void load()}
      />

      <Dialog
        open={!!view}
        onOpenChange={(isOpen) => {
          if (!isOpen) setView(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl p-0 sm:max-w-2xl">
          <div className="border-b bg-muted/20 px-5 py-5 sm:px-6">
            <DialogHeader>
              <DialogTitle className="sr-only">Client profile</DialogTitle>
              <DialogDescription>
                Review the client's registered information.
              </DialogDescription>
            </DialogHeader>

            {view && (
              <div className="mt-3 flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${getAvatarColor(view.full_name)}`}
                >
                  {initials(view.full_name)}
                </div>
                <div className="min-w-0">
                  <h2 className="break-words text-xl font-bold tracking-tight text-foreground">
                    {view.full_name || "Unnamed client"}
                  </h2>
                  <p className="mt-1 break-words text-sm text-muted-foreground">
                    {view.company_name || "Individual client"}
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline" className="rounded-md bg-background">
                      Client profile
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {view && (
            <div className="space-y-5 px-5 py-5 sm:px-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-3.5">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    Phone number
                  </div>
                  <p className="break-all text-sm font-medium">{view.phone || "Not provided"}</p>
                </div>
                <div className="rounded-xl border p-3.5">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    Email address
                  </div>
                  <p className="break-all text-sm font-medium">{view.email || "Not provided"}</p>
                </div>
                <div className="rounded-xl border p-3.5 sm:col-span-2">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Membership plans
                  </div>
                  {renderMemberships(view)}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold">Additional client information</h3>
                </div>
                <dl className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(view)
                    .filter(
                      ([key]) =>
                        !excludedProfileFields.includes(key) &&
                        ![
                          "full_name",
                          "company_name",
                          "phone",
                          "email",
                          "membership_plans",
                        ].includes(key),
                    )
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="min-w-0 rounded-xl border bg-muted/10 p-3.5"
                      >
                        <dt className="text-xs font-medium text-muted-foreground">
                          {humanize(key)}
                        </dt>
                        <dd className="mt-1.5 break-words text-sm font-medium">
                          {displayValue(value)}
                        </dd>
                      </div>
                    ))}
                </dl>
              </div>
            </div>
          )}

          <DialogFooter className="border-t px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setView(null)}
              className="rounded-xl"
            >
              Close
            </Button>

            {view && (
              <Button
                type="button"
                variant="outline"
                onClick={() => printClientProfile(view)}
                className="gap-2 rounded-xl"
              >
                <Printer className="h-4 w-4" />
                Print profile
              </Button>
            )}

            {view && (
              <Button
                type="button"
                onClick={() => {
                  const client = view;
                  setView(null);
                  openEditClient(client);
                }}
                className="gap-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700"
              >
                <Pencil className="h-4 w-4" />
                Edit client
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!remove}
        onOpenChange={(isOpen) => {
          if (!isOpen && !deleting) setRemove(null);
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg">Delete client record?</DialogTitle>
            <DialogDescription className="leading-6">
              You are about to permanently delete{" "}
              <span className="font-semibold text-foreground">
                {remove?.full_name || "this client"}
              </span>
              's client biodata record. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRemove(null)}
              disabled={deleting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void deleteClient()}
              disabled={deleting}
              className="gap-2 rounded-xl"
            >
              {deleting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete client
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
