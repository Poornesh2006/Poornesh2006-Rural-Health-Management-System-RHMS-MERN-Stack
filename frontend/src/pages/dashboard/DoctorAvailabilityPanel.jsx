import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export function DoctorAvailabilityPanel({ doctors = [] }) {
  return (
    <Card>
      <CardHeader
        action={
          <Link to="/doctors">
            <Button size="sm" type="button" variant="secondary">
              Doctor dashboard
            </Button>
          </Link>
        }
        eyebrow="Clinician Coverage"
        title="Doctor availability and room allocation"
      />
      <CardContent className="space-y-3">
        {doctors.length ? doctors.map((doctor) => (
          <div key={doctor.id} className="rounded-[1.5rem] border border-[var(--color-border)] p-4">
            <h4 className="font-semibold text-[var(--color-foreground)]">{doctor.name}</h4>
            <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{doctor.specialty}</p>
            <p className="mt-2 text-sm font-medium text-[var(--color-brand)]">{doctor.availability}</p>
          </div>
        )) : (
          <p className="text-sm text-[var(--color-foreground-muted)]">No active doctors available for this summary.</p>
        )}
      </CardContent>
    </Card>
  );
}
