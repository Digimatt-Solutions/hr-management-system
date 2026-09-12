import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmployeeContext } from "@/pages/EmployeeDetail";
import { formatDate, titleCase } from "@/lib/hr";

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-0.5 font-medium">{value || "—"}</p>
  </div>
);

const DetailsTab = () => {
  const { employee } = useEmployeeContext();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" value={employee.first_name} />
          <Field label="Last name" value={employee.last_name} />
          <Field label="Date of birth" value={employee.date_of_birth ? formatDate(employee.date_of_birth) : null} />
          <Field label="Gender" value={employee.gender ? titleCase(employee.gender) : null} />
          <Field label="Phone" value={employee.phone} />
          <Field label="Work email" value={employee.work_email} />
          <Field label="City" value={employee.city} />
          <Field label="Country" value={employee.country} />
          <div className="sm:col-span-2">
            <Field label="Address" value={employee.address} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emergency contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" value={employee.emergency_contact_name} />
            <Field label="Phone" value={employee.emergency_contact_phone} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">HR notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {employee.notes || "No notes recorded for this employee."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DetailsTab;
