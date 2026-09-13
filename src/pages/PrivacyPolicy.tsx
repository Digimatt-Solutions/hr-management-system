import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <article className="mx-auto max-w-3xl space-y-8">
        <Button asChild variant="ghost" className="-ml-3">
          <Link to="/auth?tab=create-account"><ArrowLeft />Back to sign up</Link>
        </Button>
        <header className="space-y-3 border-b pb-6">
          <p className="text-sm font-semibold text-primary">PeopleHub HR</p>
          <h1 className="text-3xl font-semibold">Privacy Policy</h1>
          <p className="text-muted-foreground">How employee and account information is handled in this workspace.</p>
        </header>
        <section className="space-y-5 text-sm leading-7 text-muted-foreground">
          <div><h2 className="text-lg font-semibold text-foreground">Information we use</h2><p>PeopleHub HR stores account, employment, attendance, leave, payroll, performance, and workplace records required to operate your organisation’s HR processes.</p></div>
          <div><h2 className="text-lg font-semibold text-foreground">Access and security</h2><p>Access is limited by assigned role and department. Your organisation controls who may view or update records and is responsible for maintaining authorised access.</p></div>
          <div><h2 className="text-lg font-semibold text-foreground">Retention and requests</h2><p>Records are retained according to your organisation’s legal and operational obligations. Contact your HR administrator to request access, correction, or deletion where applicable.</p></div>
        </section>
      </article>
    </main>
  );
}
