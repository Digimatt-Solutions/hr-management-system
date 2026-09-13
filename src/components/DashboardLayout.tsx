import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useDepartments } from "@/contexts/DepartmentContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { LogOut, Settings, UserRound } from "lucide-react";
import { fullName, initials, roleLabel } from "@/lib/hr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

const DashboardLayout = ({ children, title, description, actions }: DashboardLayoutProps) => {
  const { user, role, employee, isAdmin, signOut } = useAuth();
  const { departments, selectedDepartment, setSelectedDepartment, loading } = useDepartments();

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/95 px-3 backdrop-blur sm:px-5">
            <SidebarTrigger className="h-9 w-9 hover:bg-muted" />
            <h1 className="truncate font-heading text-base font-semibold text-foreground sm:text-lg">PeopleHub HR</h1>
            <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
              {!loading && departments.length > 0 && (
                <div className="hidden items-center gap-2 sm:flex">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={selectedDepartment?.id ?? "all"}
                    onValueChange={(value) => {
                      if (value === "all") return setSelectedDepartment(null);
                      const department = departments.find((d) => d.id === value);
                      if (department) setSelectedDepartment(department);
                    }}
                  >
                    <SelectTrigger className="w-[190px]">
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All departments</SelectItem>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Badge variant="secondary" className="hidden md:inline-flex">{roleLabel(role)}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 max-w-[220px] gap-2 px-2" aria-label="Open account menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={employee?.avatar_url ?? undefined} alt="" />
                      <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                        {initials(fullName(employee)) || "PH"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden min-w-0 text-left lg:block">
                      <span className="block truncate text-sm font-medium">{fullName(employee)}</span>
                      <span className="block truncate text-xs text-muted-foreground">{roleLabel(role)}</span>
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="font-normal">
                    <span className="block truncate font-medium">{fullName(employee)}</span>
                    <span className="block truncate text-xs text-muted-foreground">{user?.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/profile"><UserRound className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
                  {isAdmin && <DropdownMenuItem asChild><Link to="/settings"><Settings className="mr-2 h-4 w-4" />Profile Settings</Link></DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => void signOut()} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto px-4 pb-24 pt-5 sm:px-6 lg:pb-6">
            {(title || actions) && (
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  {title && <h2 className="font-heading text-2xl font-semibold">{title}</h2>}
                  {description && (
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                  )}
                </div>
                {actions}
              </div>
            )}
            {children}
          </main>
          <BottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
