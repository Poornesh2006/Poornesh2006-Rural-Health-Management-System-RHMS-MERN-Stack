import { cn } from "../../lib/cn";

export function SectionHeader({ eyebrow, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div>
        {eyebrow ? <p className="ui-eyebrow">{eyebrow}</p> : null}
        <h2 className="ui-heading mt-3">{title}</h2>
        {description ? <p className="ui-copy mt-3 max-w-3xl text-base">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
