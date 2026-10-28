import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, fullName, initials, roleLabel, statusVariant, titleCase } from "@/lib/hr";
import { toast } from "sonner";

const Profile = () => {
  const { user, role, employee, profile, profileImage, refreshEmployee, signOut } = useAuth();
  const [photo, setPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .maybeSingle();
      setName(data?.full_name ?? "");
      setPhone(data?.phone ?? "");
    };
    load();
  }, [user]);

  const save = async () => {
    if (!user) return;
    const parsed = z.object({full_name:z.string().trim().min(2).max(150),phone:z.string().trim().max(30)}).safeParse({full_name:name,phone});
    if (!parsed.success) return toast.error("Enter a display name of 2–150 characters and a valid phone length");
    setSaving(true);
    let path = profile?.avatar_path ?? null;
    try {
    if (photo) {
      if (!['image/png','image/jpeg','image/webp'].includes(photo.type) || photo.size > 2*1024*1024) throw new Error('Choose a PNG, JPEG or WebP image under 2 MB');
      const extension = photo.type === 'image/png' ? 'png' : photo.type === 'image/webp' ? 'webp' : 'jpg';
      path = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const {error} = await supabase.storage.from('profile-photos').upload(path,photo,{contentType:photo.type});
      if(error) throw error;
    } else if (removePhoto) path = null;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: parsed.data.full_name, phone: parsed.data.phone || null, avatar_path: path })
      .eq("id", user.id).select('id').single();
    if (error) { if(photo&&path) await supabase.storage.from('profile-photos').remove([path]);throw error; }
    if(profile?.avatar_path && profile.avatar_path!==path) await supabase.storage.from('profile-photos').remove([profile.avatar_path]);
    toast.success("Details saved");
    setPhoto(null);setRemovePhoto(false);await refreshEmployee();
    } catch(error) {toast.error(error instanceof Error?error.message:'Could not save your details');} finally {setSaving(false);}
  };

  const displayName = profile?.full_name || name || user?.email || "You";

  return (
    <DashboardLayout title="Profile Settings" description="Your account and employment details">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="items-center text-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profileImage} alt={displayName}/>
              <AvatarFallback className="text-lg">{initials(displayName)}</AvatarFallback>
            </Avatar>
            <CardTitle className="mt-3 text-lg">{displayName}</CardTitle>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge variant="secondary">{roleLabel(role)}</Badge>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={signOut}>
              Sign out
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-photo">Profile image</Label>
                <Input id="profile-photo" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{setPhoto(e.target.files?.[0]??null);setRemovePhoto(false);}}/>
                <p className="text-xs text-muted-foreground">PNG, JPEG or WebP, up to 2 MB</p>
                {profile?.avatar_path && <Button variant="outline" size="sm" onClick={()=>{setRemovePhoto(true);setPhoto(null);}}>Remove photo on save</Button>}
                {removePhoto && <p className="text-xs text-muted-foreground">Photo will be removed when you save.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-phone">Phone</Label>
                <Input
                  id="profile-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button onClick={save} disabled={saving}>
                Save changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employment</CardTitle>
            </CardHeader>
            <CardContent>
              {employee ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Staff number</p>
                    <p className="text-sm font-medium">{employee.employee_code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Work email</p>
                    <p className="text-sm font-medium">{employee.work_email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hired</p>
                    <p className="text-sm font-medium">{formatDate(employee.hire_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={statusVariant(employee.status)}>
                      {titleCase(employee.status)}
                    </Badge>
                  </div>
                  <div className="sm:col-span-2">
                    <Button asChild variant="outline">
                      <Link to={`/employees/${employee.id}`}>Open my employee record</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your account is not yet linked to an employee record.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
