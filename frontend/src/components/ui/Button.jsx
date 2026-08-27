import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

const buttonVariants = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-text-inverse)] shadow-[0_20px_48px_rgba(15,108,189,0.18)] hover:bg-[var(--color-primary-hover)]",
  secondary:
    "glass-panel text-[var(--color-foreground)] ring-1 ring-[var(--color-border)] hover:bg-[var(--color-surface-hover)]",
  outline:
    "bg-transparent text-[var(--color-foreground)] ring-1 ring-[var(--color-border)] hover:bg-[var(--color-surface-hover)]",
  ghost:
    "bg-transparent text-[var(--color-foreground-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-foreground)]",
  danger:
    "bg-[var(--color-danger)] text-[var(--color-text-inverse)] shadow-[0_18px_40px_rgba(185,28,28,0.18)] hover:brightness-95",
  success:
    "bg-[var(--color-secondary)] text-[var(--color-text-inverse)] shadow-[0_18px_40px_rgba(5,150,105,0.18)] hover:brightness-105",
};

const sizeVariants = {
  sm: "h-10 rounded-[1rem] px-4 text-sm",
  md: "h-12 rounded-[1.1rem] px-5 text-sm",
  lg: "h-14 rounded-[1.25rem] px-6 text-base",
  icon: "h-12 w-12 rounded-[1.1rem]",
};

export const Button = forwardRef(function Button(
  { className, variant = "primary", size = "md", asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? motion.span : motion.button;

  return (
    <Comp
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 border-0 font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60",
        buttonVariants[variant],
        sizeVariants[size],
        className,
      )}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      {...props}
    />
  );
});
