import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound, UsersRound } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import heroImage from "@/assets/peoplehub-auth.jpg.asset.json";
import { cn } from "@/lib/utils";

const TAB_SIGNIN = "login";
const TAB_SIGNUP = "create-account";
type Mode = "signin" | "signup";
const modeFromTab = (tab: string | null): Mode => tab === TAB_SIGNUP ? "signup" : "signin";

const authSchema = z.object({
  email: z.string().trim().email("Enter a valid work email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});
const signupSchema = authSchema.extend({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  agreed: z.literal(true, { errorMap: () => ({ message: "Accept the terms to continue" }) }),
});

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = modeFromTab(searchParams.get("tab"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const switchMode = (next: Mode) => {
    setSearchParams({ tab: next === "signup" ? TAB_SIGNUP : TAB_SIGNIN }, { replace: true });
    setAwaitingConfirmation(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = mode === "signup"
      ? signupSchema.safeParse({ email, password, fullName, agreed })
      : authSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email.trim(), password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email.trim(), password, fullName.trim());
        if (error) throw error;
        setAwaitingConfirmation(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not complete your request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-card lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden min-h-screen overflow-hidden lg:flex lg:flex-col lg:justify-between">
        <img src={heroImage.url} alt="People working together at a workplace" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-foreground/55" />
        <div className="relative z-10 flex items-center gap-3 p-10 text-primary-foreground">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-primary"><UsersRound className="h-6 w-6" /></span>
          <span className="font-heading text-xl font-semibold">PeopleHub HR</span>
        </div>
        <div className="relative z-10 max-w-xl space-y-4 p-10 text-primary-foreground">
          <h1 className="text-4xl font-semibold leading-tight">Your people, supported from day one.</h1>
          <p className="max-w-lg text-base leading-7 text-primary-foreground/85">A secure workspace for employee records, leave, attendance, payroll, and performance.</p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground"><UsersRound className="h-5 w-5" /></span>
            <span className="font-heading text-lg font-semibold">PeopleHub HR</span>
          </div>
          <div className="mb-7 space-y-2">
            <p className="text-sm font-semibold text-primary">HR workspace</p>
            <h1 className="text-3xl font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
            <p className="text-sm text-muted-foreground">{mode === "signin" ? "Sign in to continue to your team workspace." : "Join your organisation’s PeopleHub workspace."}</p>
          </div>

          <div role="tablist" aria-label="Account access" className="mb-7 grid grid-cols-2 rounded-md bg-muted p-1">
            <Link role="tab" aria-selected={mode === "signin"} to={`?tab=${TAB_SIGNIN}`} className={cn("rounded-sm px-4 py-2 text-center text-sm font-medium transition-colors", mode === "signin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>Login</Link>
            <Link role="tab" aria-selected={mode === "signup"} to={`?tab=${TAB_SIGNUP}`} className={cn("rounded-sm px-4 py-2 text-center text-sm font-medium transition-colors", mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>Sign Up</Link>
          </div>

          {awaitingConfirmation ? (
            <div className="space-y-5">
              <Alert><Mail className="h-4 w-4" /><AlertDescription>We sent a confirmation link to <strong>{email}</strong>. Confirm your address, then return to sign in.</AlertDescription></Alert>
              <Button className="w-full" onClick={() => switchMode("signin")}>Back to Login</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {mode === "signup" && <div className="space-y-2"><Label htmlFor="full-name">Full name</Label><div className="relative"><UserRound className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="full-name" autoComplete="name" maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" className="h-11 pl-10" required /></div></div>}
              <div className="space-y-2"><Label htmlFor="email">Work email</Label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="email" type="email" inputMode="email" autoComplete="email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="h-11 pl-10" required /></div></div>
              <div className="space-y-2"><Label htmlFor="password">Password</Label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="h-11 px-10" required /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-0.5 h-10 w-10" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</Button></div></div>
              {mode === "signup" && <div className="flex items-start gap-3"><Checkbox id="terms" checked={agreed} onCheckedChange={(value) => setAgreed(value === true)} className="mt-0.5" /><Label htmlFor="terms" className="text-sm font-normal leading-5 text-muted-foreground">I agree to the <Link className="font-medium text-primary hover:underline" to="/privacy">Privacy Policy</Link> and <Link className="font-medium text-primary hover:underline" to="/terms">Terms &amp; Conditions</Link>.</Label></div>}
              <Button type="submit" size="lg" className="w-full" disabled={loading || (mode === "signup" && !agreed)}>{loading && <Loader2 className="animate-spin" />}{mode === "signin" ? "Login" : "Create Account"}</Button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
