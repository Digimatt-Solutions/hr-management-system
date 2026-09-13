import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

const Setup = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("admin_exists");
      setAdminExists(error ? true : Boolean(data));
      setChecking(false);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("The two passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;

      if (data.session) {
        toast.success("Administrator account created");
        navigate("/dashboard", { replace: true });
      } else {
        setAwaitingConfirmation(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Could not create the administrator account");
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (adminExists) return <Navigate to="/auth" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-3 flex justify-center">
            <div className="rounded-md bg-primary/10 p-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="font-heading text-2xl">Create Super Admin</CardTitle>
          <CardDescription>
            This secure, one-time step creates the account that manages the entire HR workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {awaitingConfirmation ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  The administrator account for <strong>{email}</strong> has been saved. Confirm the
                  address using the email we just sent, then sign in.
                </AlertDescription>
              </Alert>
              <Button className="w-full" onClick={() => navigate("/auth")}>
                Go to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                  </>
                ) : (
                  "Create Super Admin"
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                 Setup closes automatically when the Super Admin account is created.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;
