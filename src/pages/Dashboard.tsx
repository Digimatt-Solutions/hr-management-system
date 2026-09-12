import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, DollarSign, AlertTriangle, TrendingUp, ShoppingCart } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  criticalStockItems: number;
  todaySales: number;
  totalRevenue: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockItems: 0,
    criticalStockItems: 0,
    todaySales: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get total products
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Get low stock alerts
      const { data: alerts } = await supabase
        .from("stock_alerts")
        .select("alert_level")
        .eq("acknowledged", false);

      const lowStock = alerts?.filter((a) => a.alert_level === "low").length || 0;
      const criticalStock = alerts?.filter((a) => a.alert_level === "critical").length || 0;

      // Get today's sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todaySalesData } = await supabase
        .from("sales")
        .select("total_amount")
        .gte("created_at", today.toISOString());

      const todayCount = todaySalesData?.length || 0;
      const todayRevenue = todaySalesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

      setStats({
        totalProducts: productsCount || 0,
        lowStockItems: lowStock,
        criticalStockItems: criticalStock,
        todaySales: todayCount,
        totalRevenue: todayRevenue,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Today's Sales",
      value: stats.todaySales,
      icon: ShoppingCart,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Revenue Today",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems,
      icon: TrendingUp,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Critical Stock",
      value: stats.criticalStockItems,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to your inventory management system
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-4 bg-muted rounded w-24"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statCards.map((stat, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {stats.criticalStockItems + stats.lowStockItems === 0
                  ? "No active alerts. All stock levels are healthy!"
                  : `${stats.criticalStockItems} critical and ${stats.lowStockItems} low stock alerts require attention.`}
              </p>
              {(stats.criticalStockItems + stats.lowStockItems > 0) && (
                <div className="mt-4 flex gap-2">
                  {stats.criticalStockItems > 0 && (
                    <Badge variant="destructive">{stats.criticalStockItems} Critical</Badge>
                  )}
                  {stats.lowStockItems > 0 && (
                    <Badge className="bg-warning text-warning-foreground">
                      {stats.lowStockItems} Low Stock
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Products:</span>
                  <span className="font-medium">{stats.totalProducts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Today's Sales Count:</span>
                  <span className="font-medium">{stats.todaySales}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Sale:</span>
                  <span className="font-medium">
                    ${stats.todaySales > 0 ? (stats.totalRevenue / stats.todaySales).toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
