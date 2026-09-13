export const ROLE_LABELS: Record<string, string> = {
  admin: "Super Admin",
  manager: "Manager",
  staff: "Employee",
};

export function roleLabel(role?: string | null) {
  if (!role) return "Employee";
  return ROLE_LABELS[role] ?? role;
}

export function fullName(p?: { first_name?: string | null; last_name?: string | null } | null) {
  if (!p) return "—";
  return [p.first_name, p.last_name].filter(Boolean).join(" ") || "—";
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function formatMoney(value?: number | null) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
}

export function titleCase(value?: string | null) {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function statusVariant(status?: string | null): BadgeVariant {
  switch (status) {
    case "active":
    case "approved":
    case "present":
    case "finalized":
    case "acknowledged":
      return "default";
    case "rejected":
    case "terminated":
    case "absent":
    case "suspended":
      return "destructive";
    case "pending":
    case "probation":
    case "draft":
    case "late":
      return "secondary";
    default:
      return "outline";
  }
}

export function daysBetween(start: string, end: string) {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

export function currentYear() {
  return new Date().getFullYear();
}
