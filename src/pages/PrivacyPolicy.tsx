import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <article className="mx-auto max-w-3xl space-y-8">
        <Button asChild variant="ghost" className="-ml-3">
          <Link to="/">
            <ArrowLeft />
            Back to Kazini
          </Link>
        </Button>
        <header className="space-y-3 border-b pb-6">
          <p className="text-sm font-semibold text-primary">Kazini Shared</p>
          <h1 className="text-3xl font-semibold">Privacy Policy</h1>
          <p className="text-muted-foreground">
            How client, employee and account information is handled.
          </p>
        </header>
        <section className="space-y-5 text-sm leading-7 text-muted-foreground">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Information we use
            </h2>
            <p>
              Kazini stores your submitted client biodata, contact and emergency
              contact details, business information, membership preferences and
              typed signature to manage your registration and workspace
              services. Employee and account records support workplace
              administration.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Service communications
            </h2>
            <p>
              Kazini may use your phone number for registration and workspace
              service updates through Airtouch. This registration is not
              permission for promotional broadcasts. Emergency contacts are not
              included in client SMS broadcasts.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Access and security
            </h2>
            <p>
              Access is limited by assigned role and department. Your
              organisation controls who may view or update records and is
              responsible for maintaining authorised access.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Retention and requests
            </h2>
            <p>
              Contact info@kazini.co.ke to request access, correction or
              deletion where applicable, or ask about retention of your records.
              Kazini is responsible for lawful administration and retention of
              the information it collects.
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}
