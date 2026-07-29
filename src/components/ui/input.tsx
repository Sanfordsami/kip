import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    className={cn(
      "flex h-10 w-full rounded-md border bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus-visible:outline-none",
      className
    )}
    style={{ borderColor: "var(--color-line)" }}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";
