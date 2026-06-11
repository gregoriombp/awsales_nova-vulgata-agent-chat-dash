"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useShape } from "@/components/ui/fluid/lib/shape-context";

// As 10 famílias de cor do repo, no degrau 600 da escala (--color-aw-<família>-600).
// Upstream trazia 17 hex arbitrários; os 8 nomes sem família própria foram
// absorvidos: orange/yellow→amber · green→emerald · cyan→teal · indigo→blue ·
// violet→purple · fuchsia→pink · rose→red.
const badgeColors = {
  gray: "var(--color-aw-gray-600)",
  red: "var(--color-aw-red-600)",
  amber: "var(--color-aw-amber-600)",
  lime: "var(--color-aw-lime-600)",
  emerald: "var(--color-aw-emerald-600)",
  teal: "var(--color-aw-teal-600)",
  blue: "var(--color-aw-blue-600)",
  purple: "var(--color-aw-purple-600)",
  pink: "var(--color-aw-pink-600)",
  slate: "var(--color-aw-slate-600)",
} as const;

type BadgeColor = keyof typeof badgeColors;

const badgeVariants = cva(
  "inline-flex items-center font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        solid: "",
        dot: "border border-border text-fg-primary",
      },
      size: {
        sm: "h-5 px-2 text-xs gap-1",
        md: "h-6 px-2.5 text-xs gap-1.5",
        lg: "h-7 px-3 text-sm gap-1.5",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  }
);

interface BadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof badgeVariants> {
  color?: BadgeColor;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = "solid",
      size = "md",
      color = "gray",
      children,
      style,
      ...props
    },
    ref
  ) => {
    const shape = useShape();
    const colorValue = badgeColors[color];
    const isSolid = variant === "solid";
    const dotSize = size === "sm" ? 6 : size === "lg" ? 8 : 7;

    const colorStyle = isSolid
      ? color === "gray"
        ? { backgroundColor: "var(--bg-muted)", color: "var(--fg-primary)" }
        : {
            color: "var(--fg-primary)",
            backgroundColor: `color-mix(in srgb, ${colorValue} 15%, var(--bg-surface))`,
          }
      : {};

    const dotColor = color === "gray" ? "var(--fg-muted)" : colorValue;

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), shape.item, className)}
        style={{ ...colorStyle, ...style }}
        {...props}
      >
        {!isSolid && (
          <span
            className="shrink-0 rounded-full"
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: dotColor,
            }}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants, badgeColors };
export type { BadgeProps, BadgeColor };
