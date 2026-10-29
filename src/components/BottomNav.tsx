import { CalendarDays, LayoutDashboard, UserRound, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useModules } from "@/contexts/ModuleContext";
import { moduleForPath } from "@/lib/modules";

const items = [
  { label: "Home", to: "/dashboard", icon: LayoutDashboard },
  { label: "People", to: "/employees", icon: Users },
  { label: "Leave", to: "/leave", icon: CalendarDays },
  { label: "Profile", to: "/profile", icon: UserRound },
];

export function BottomNav() {
  const { enabled } = useModules();
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 px-2 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-16 max-w-md justify-around">
        {items.filter(item => enabled(moduleForPath(item.to))).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors",
                isActive && "text-primary",
              )
            }
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
