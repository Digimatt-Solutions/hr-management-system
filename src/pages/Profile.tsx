import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

interface UserRole {
  role: string;
}

interface Shop {
  id: string;
  name: string;
  city: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string>("staff");
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) setProfile(profileData);

      // Load role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData) setRole(roleData.role);

      // Load accessible shops
      const { data: shopsData } = await supabase
        .from("user_shop_access")
        .select(`
          shops (id, name, city)
        `)
        .eq("user_id", user.id);

      if (shopsData) {
        setShops(shopsData.map((item: any) => item.shops));
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (roleValue: string) => {
    switch (roleValue) {
      case "admin":
        return <Badge className="bg-primary">Admin</Badge>;
      case "manager":
        return <Badge className="bg-success">Manager</Badge>;
      default:
        return <Badge variant="secondary">Staff</Badge>;
    }
  };

  if (loading || !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in max-w-4xl mx-auto">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input id="email" value={profile.email} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={profile.phone || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <Button onClick={updateProfile} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  {getRoleBadge(role)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">User ID</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {profile.id.slice(0, 8)}...
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Accessible Shops ({shops.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {shops.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No shops assigned yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {shops.map((shop) => (
                      <div
                        key={shop.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted"
                      >
                        <div>
                          <p className="font-medium">{shop.name}</p>
                          <p className="text-sm text-muted-foreground">{shop.city}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
