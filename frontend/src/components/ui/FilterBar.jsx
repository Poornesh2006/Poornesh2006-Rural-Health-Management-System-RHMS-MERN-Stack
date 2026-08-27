import { Button } from "./Button";

export function FilterBar({ filters = [] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => (
        <Button key={filter} size="sm" type="button" variant="outline">
          {filter}
        </Button>
      ))}
    </div>
  );
}
