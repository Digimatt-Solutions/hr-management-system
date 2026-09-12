import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useDepartments } from "@/contexts/DepartmentContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { roleLabel } from "@/lib/hr";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

const DashboardLayout = ({ children, title, description, actions }: DashboardLayoutProps) => {
  const { user, role } = useAuth();
  const { departments, selectedDepartment, setSelectedDepartment, loading } = useDepartments();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-card px-4 shadow-sm">
            <SidebarTrigger className="hover:bg-accent" />
            <h1 className="font-heading text-lg font-semibold text-foreground">PeopleHub HR</h1>
            <div className="ml-auto flex items-center gap-3">
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
              <Badge variant="secondary">{roleLabel(role)}</Badge>
              <span className="hidden text-sm text-muted-foreground md:inline">{user?.email}</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
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
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
