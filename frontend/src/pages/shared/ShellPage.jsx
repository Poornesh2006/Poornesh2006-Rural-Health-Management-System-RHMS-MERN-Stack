import { PageHeader } from "../../components/ui/PageHeader";
import { SearchBar } from "../../components/ui/SearchBar";
import { FilterBar } from "../../components/ui/FilterBar";
import { EmptyState } from "../../components/ui/EmptyState";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";

export function ShellPage({
  breadcrumbs,
  eyebrow,
  title,
  description,
  actions,
  searchPlaceholder,
  filters = [],
  stats = [],
  cards = [],
  emptyTitle,
  emptyDescription,
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        actions={actions}
        breadcrumbs={breadcrumbs}
        description={description}
        eyebrow={eyebrow}
        title={title}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar className="w-full lg:max-w-md" placeholder={searchPlaceholder} />
        <FilterBar filters={filters} />
      </div>

      {stats.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <StatCard
              accent={stat.accent || "linear-gradient(135deg,#2E7D32,#7be48b)"}
              detail={stat.detail}
              key={stat.label}
              label={stat.label}
              value={stat.value}
            />
          ))}
        </section>
      ) : null}

      {cards.length ? (
        <section className="grid gap-4 xl:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.title} hover>
              <CardHeader eyebrow={card.eyebrow} title={card.title} />
              <CardContent>
                <p className="text-sm leading-6 text-[var(--color-foreground-muted)]">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      <EmptyState
        action={
          <Button size="lg" type="button">
            Prepare module workspace
          </Button>
        }
        description={emptyDescription}
        title={emptyTitle}
      />
    </div>
  );
}
