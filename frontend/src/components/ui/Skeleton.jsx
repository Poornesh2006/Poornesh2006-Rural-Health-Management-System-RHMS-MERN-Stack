import { cn } from "../../lib/cn";

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-[linear-gradient(90deg,rgba(255,255,255,0.12),rgba(255,255,255,0.38),rgba(255,255,255,0.12))] bg-[length:200%_100%]",
        className,
      )}
    />
  );
}
