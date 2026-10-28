import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <article className="mx-auto max-w-3xl space-y-8">
        <Button asChild variant="ghost" className="-ml-3">
          <Link to="/"><ArrowLeft />Back to Kazini</Link>
        </Button>
        <header className="space-y-3 border-b pb-6">
          <p className="text-sm font-semibold text-primary">Kazini Shared</p>
          <h1 className="text-3xl font-semibold">Terms &amp; Conditions</h1>
          <p className="text-muted-foreground">Responsible use of Kazini registration and administration services.</p>
        </header>
        <section className="space-y-5 text-sm leading-7 text-muted-foreground">
          <div><h2 className="text-lg font-semibold text-foreground">Registration</h2><p>Provide accurate biodata and contact information. Submitting the form records your interest and preferences; it does not confirm a booking, price, or membership agreement. A typed signature records your confirmation of the submitted details.</p></div>
          <div><h2 className="text-lg font-semibold text-foreground">Authorised use</h2><p>Use this service only for legitimate workplace purposes and only access information required for your assigned responsibilities.</p></div>
          <div><h2 className="text-lg font-semibold text-foreground">Account responsibility</h2><p>Keep your password confidential, provide accurate account details, and report suspected unauthorised access to your administrator promptly.</p></div>
          <div><h2 className="text-lg font-semibold text-foreground">Workplace records</h2><p>Your organisation remains responsible for the accuracy, lawful use, retention, and administration of employee information stored in the service.</p></div>
        </section>
      </article>
    </main>
  );
}
