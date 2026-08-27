import { SectionHeader } from "./SectionHeader";
import { Breadcrumbs } from "./Breadcrumbs";

export function PageHeader({ breadcrumbs, eyebrow, title, description, actions }) {
  return (
    <div className="space-y-4 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5 shadow-[var(--shadow-quiet)] md:p-6">
      <Breadcrumbs items={breadcrumbs} />
      <SectionHeader
        action={actions}
        className="items-start"
        description={description}
        eyebrow={eyebrow}
        title={title}
      />
    </div>
  );
}
