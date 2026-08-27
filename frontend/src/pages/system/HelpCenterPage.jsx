import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

const helpTopics = [
  ["Getting started", "Sign in, verify your role, and confirm the online or offline status badge before starting daily work."],
  ["Patient registration", "Use the registration page for new records. Draft entries are preserved locally if the connection drops."],
  ["Appointments and queue", "Reception can book appointments and operate the live queue. Last synchronized queue state is preserved locally for continuity."],
  ["Offline mode", "Draft capture and queued synchronization support unstable connectivity. Final stock deduction and other sensitive actions still require server confirmation."],
  ["Language settings", "Switch between English and Tamil from the header or settings. Patient-entered text is not auto-translated."],
  ["Backup guidance", "Admins can create encrypted application-level backups and request guarded restore workflows from settings."],
];

export function HelpCenterPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs("/help")}
        description="Role-friendly onboarding, offline guidance, and administrator-ready operational help now live inside the app."
        eyebrow="Help"
        title="Help center"
      />

      <section className="grid gap-4 xl:grid-cols-2">
        {helpTopics.map(([title, description]) => (
          <Card key={title}>
            <CardHeader eyebrow="Guide" title={title} />
            <CardContent>
              <p className="text-sm leading-7 text-[var(--color-foreground-muted)]">{description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
