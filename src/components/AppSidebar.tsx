import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Clock,
  Wallet,
  Target,
  Megaphone,
  ClipboardCheck,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { roleLabel } from "@/lib/hr";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

type Role = "admin" | "manager" | "staff";

interface Item {
  title: string;
  url: string;
  icon: typeof Users;
  roles: Role[];
}

const workspaceItems: Item[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "staff"] },
  { title: "Employees", url: "/employees", icon: Users, roles: ["admin", "manager", "staff"] },
  { title: "Departments", url: "/departments", icon: Building2, roles: ["admin", "manager", "staff"] },
];

const peopleItems: Item[] = [
  { title: "Leave", url: "/leave", icon: CalendarDays, roles: ["admin", "manager", "staff"] },
  { title: "Attendance", url: "/attendance", icon: Clock, roles: ["admin", "manager", "staff"] },
  { title: "Onboarding", url: "/onboarding", icon: ClipboardCheck, roles: ["admin", "manager"] },
  { title: "Performance", url: "/performance", icon: Target, roles: ["admin", "manager", "staff"] },
  { title: "Payroll", url: "/payroll", icon: Wallet, roles: ["admin"] },
];

const companyItems: Item[] = [
  { title: "Announcements", url: "/announcements", icon: Megaphone, roles: ["admin", "manager", "staff"] },
  { title: "My Profile", url: "/profile", icon: User, roles: ["admin", "manager", "staff"] },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["admin"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { signOut, role } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Signed out");
    } catch {
      toast.error("Could not sign out");
    }
  };

  const visible = (items: Item[]) =>
    items.filter((item) => !role || item.roles.includes(role as Role));

  const renderGroup = (label: string, items: Item[]) => {
    const list = visible(items);
    if (list.length === 0) return null;
    return (
      <SidebarGroup key={label}>
        <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>{label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {list.map((item) => {
              const isActive =
                currentPath === item.url || currentPath.startsWith(`${item.url}/`);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-sidebar-accent ${
                        isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : ""
                      }`}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        <div className={`px-4 py-4 ${collapsed ? "text-center px-2" : ""}`}>
          <p className="font-heading text-base font-semibold text-sidebar-foreground">
            {collapsed ? "HR" : "PeopleHub HR"}
          </p>
          {!collapsed && (
            <p className="text-xs text-sidebar-foreground/60">{roleLabel(role)}</p>
          )}
        </div>
        {renderGroup("Workspace", workspaceItems)}
        {renderGroup("People", peopleItems)}
        {renderGroup("Company", companyItems)}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
