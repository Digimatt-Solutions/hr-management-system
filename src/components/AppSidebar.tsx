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
import logoImage from "@/assets/kazini-logo.png";
import { useModules } from "@/contexts/ModuleContext";
import { moduleForPath } from "@/lib/modules";
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
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "staff"],
  },
  { title: "Clients", url: "/clients", icon: Users, roles: ["admin"] },
  {
    title: "Employees",
    url: "/employees",
    icon: Users,
    roles: ["admin", "manager", "staff"],
  },
  {
    title: "Departments",
    url: "/departments",
    icon: Building2,
    roles: ["admin", "manager", "staff"],
  },
];

const peopleItems: Item[] = [
  {
    title: "Leave",
    url: "/leave",
    icon: CalendarDays,
    roles: ["admin", "manager", "staff"],
  },
  {
    title: "Attendance",
    url: "/attendance",
    icon: Clock,
    roles: ["admin", "manager", "staff"],
  },
  {
    title: "Onboarding",
    url: "/onboarding",
    icon: ClipboardCheck,
    roles: ["admin", "manager"],
  },
  {
    title: "Performance",
    url: "/performance",
    icon: Target,
    roles: ["admin", "manager", "staff"],
  },
  { title: "Payroll", url: "/payroll", icon: Wallet, roles: ["admin"] },
];

const companyItems: Item[] = [
  {
    title: "Announcements",
    url: "/announcements",
    icon: Megaphone,
    roles: ["admin", "manager", "staff"],
  },
  {
    title: "My Profile",
    url: "/profile",
    icon: User,
    roles: ["admin", "manager", "staff"],
  },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["admin"] },
];

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { signOut, role } = useAuth();
  const { enabled } = useModules();
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
    items.filter((item) => role && item.roles.includes(role as Role) && enabled(moduleForPath(item.url)));

  const renderGroup = (label: string, items: Item[]) => {
    const list = visible(items);
    if (list.length === 0) return null;
    return (
      <SidebarGroup key={label}>
        <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
          {label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {list.map((item) => {
              const isActive =
                currentPath === item.url ||
                currentPath.startsWith(`${item.url}/`);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      onClick={() => isMobile && setOpenMobile(false)}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-sidebar-accent ${
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                          : ""
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
        <div
          className={`border-b border-sidebar-border px-4 py-2 ${collapsed ? "px-2" : ""}`}
        >
          <div
            className={
              collapsed
                ? "mx-auto h-9 w-9 overflow-hidden rounded-md"
                : "flex justify-left"
            }
          >
            <img
              src={logoImage}
              alt="Kazini Shared"
              className={
                collapsed
                  ? "h-5 max-w-none object-cover object-left"
                  : "h-auto w-full max-w-[110px] object-contain"
              }
            />
          </div>

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
