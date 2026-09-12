import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Package } from "lucide-react";
import { toast } from "sonner";

interface StockAlert {
  id: string;
  alert_level: string;
  message: string;
  acknowledged: boolean;
  created_at: string;
  products: {
    name: string;
    sku: string;
  };
  shops: {
    name: string;
  };
}

const Alerts = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("stock_alerts")
        .select(`
          *,
          products (name, sku),
          shops (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error: any) {
      toast.error("Failed to load alerts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("stock_alerts")
        .update({
          acknowledged: true,
          acknowledged_by: user.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) throw error;

      toast.success("Alert acknowledged");
      loadAlerts();
    } catch (error: any) {
      toast.error("Failed to acknowledge alert");
      console.error(error);
    }
  };

  const getAlertVariant = (level: string) => {
    switch (level) {
      case "critical":
        return "destructive";
      case "low":
        return "default";
      case "adequate":
        return "secondary";
      default:
        return "default";
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "low":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return <Package className="h-5 w-5 text-primary" />;
    }
  };

  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter((a) => a.acknowledged);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Stock Alerts</h2>
          <p className="text-muted-foreground">
            Monitor and manage stock level notifications
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Active Alerts ({activeAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : activeAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-success mb-2" />
                  <p className="text-muted-foreground">
                    No active alerts. All stock levels are healthy!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAlerts.map((alert) => (
                    <Card key={alert.id} className="border-l-4 border-l-destructive">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            {getAlertIcon(alert.alert_level)}
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">
                                  {alert.products.name}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {alert.products.sku}
                                </Badge>
                                <Badge variant={getAlertVariant(alert.alert_level)}>
                                  {alert.alert_level.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {alert.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Shop: {alert.shops.name} •{" "}
                                {new Date(alert.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Acknowledge
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {acknowledgedAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Acknowledged Alerts ({acknowledgedAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {acknowledgedAlerts.slice(0, 10).map((alert) => (
                    <Card key={alert.id} className="opacity-60">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.alert_level)}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm">
                                {alert.products.name}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {alert.products.sku}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {alert.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Shop: {alert.shops.name} •{" "}
                              Acknowledged: {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
