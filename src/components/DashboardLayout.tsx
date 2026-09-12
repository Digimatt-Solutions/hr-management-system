import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useShop } from "@/contexts/ShopContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const { shops, selectedShop, setSelectedShop, loading } = useShop();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-card px-4 shadow-sm">
            <SidebarTrigger className="hover:bg-accent" />
            <h1 className="text-lg font-heading font-semibold text-foreground">
              TruckLogix Inventory System
            </h1>
            <div className="ml-auto flex items-center gap-4">
              {!loading && shops.length > 0 && (
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={selectedShop?.id || ""}
                    onValueChange={(value) => {
                      const shop = shops.find((s) => s.id === value);
                      if (shop) setSelectedShop(shop);
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select shop" />
                    </SelectTrigger>
                    <SelectContent>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
