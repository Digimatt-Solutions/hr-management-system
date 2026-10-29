export const modules = [
  { key: "dashboard", label: "Dashboard" },
  { key: "clients", label: "Client Management" },
  { key: "employees", label: "Employee Management" },
  { key: "departments", label: "Departments" },
  { key: "leave", label: "Leave" },
  { key: "attendance", label: "Attendance" },
  { key: "onboarding", label: "Onboarding" },
  { key: "performance", label: "Performance" },
  { key: "payroll", label: "Payroll" },
  { key: "announcements", label: "Announcements" },
  { key: "sms", label: "SMS broadcasting" },
  { key: "profile", label: "My Profile" },
] as const;
export type ModuleKey = (typeof modules)[number]["key"];
export type Visibility = Partial<Record<ModuleKey, boolean>>;
export function moduleEnabled(settings: Visibility, key: string) {
  return settings[key as ModuleKey] !== false;
}
export function moduleForPath(path: string) {
  return path.split("/")[1] || "";
}