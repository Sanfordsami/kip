import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)]",
        destructive: "bg-[var(--color-signal-bad)] text-white hover:opacity-90",
        outline:
          "border bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-2)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, style, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      style={{ borderColor: variant === "outline" ? "var(--color-line)" : undefined, ...style }}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";
