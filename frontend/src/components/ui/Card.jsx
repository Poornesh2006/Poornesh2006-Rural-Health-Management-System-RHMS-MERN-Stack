import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

export function Card({ children, className, hover = false }) {
  return (
    <motion.article
      className={cn(
        "surface-card rounded-[2rem] border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)]",
        className,
      )}
      whileHover={hover ? { y: -4, boxShadow: "var(--shadow-float)" } : undefined}
    >
      {children}
    </motion.article>
  );
}

export function CardHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        {eyebrow ? <p className="ui-eyebrow">{eyebrow}</p> : null}
        {title ? <h3 className="ui-heading-sm mt-3">{title}</h3> : null}
        {description ? <p className="ui-copy mt-2 max-w-2xl">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function CardContent({ children, className }) {
  return <div className={cn("mt-6", className)}>{children}</div>;
}
