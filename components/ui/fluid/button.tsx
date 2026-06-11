"use client";

import { forwardRef, type ButtonHTMLAttributes, type ComponentType } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { useShape } from "@/components/ui/fluid/lib/shape-context";

/** Componente de ícone aceito nos slots leadingIcon/trailingIcon. No repo os
 *  glifos vêm de Material Symbols via <Icon/>; um wrapper fino que repassa
 *  `size`/`className` para <Icon name="..."/> cumpre este contrato. */
type IconComponent = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

const buttonVariants = cva(
  [
    "group relative isolate inline-flex items-center justify-center outline-none cursor-pointer",
    "text-box-trim-both text-box-edge-cap-alphabetic",
    "transition-colors duration-80",
    "disabled:opacity-50 disabled:pointer-events-none",
    "focus-visible:ring-1 focus-visible:ring-(--ring-focus)",
  ],
  {
    variants: {
      variant: {
        primary: "text-fg-on-inverse",
        secondary: "text-fg-primary",
        tertiary: "border border-border text-fg-primary",
        ghost: "text-fg-secondary hover:text-fg-primary",
      },
      size: {
        sm: "h-7 px-3 text-xs gap-1",
        md: "h-8 px-4 text-sm gap-1.5",
        lg: "h-9 px-5 text-sm gap-1.5",
        "icon-sm": "h-8 w-8 p-0 [&_svg]:h-3.5 [&_svg]:w-3.5",
        icon: "h-9 w-9 p-0 [&_svg]:h-4 [&_svg]:w-4",
        "icon-lg": "h-10 w-10 p-0 [&_svg]:h-5 [&_svg]:w-5",
      },
      iconLeft: { true: "" },
      iconRight: { true: "" },
    },
    compoundVariants: [
      { size: "sm", iconLeft: true, className: "pl-1.5" },
      { size: "md", iconLeft: true, className: "pl-2.5" },
      { size: "lg", iconLeft: true, className: "pl-3.5" },
      { size: "sm", iconRight: true, className: "pr-1.5" },
      { size: "md", iconRight: true, className: "pr-2.5" },
      { size: "lg", iconRight: true, className: "pr-3.5" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  /** Force the visual pressed/held state. Useful when the button drives an
   *  external open piece of UI (a popover, dropdown, etc.) so it reads as
   *  engaged while the menu is showing. */
  active?: boolean;
}

const bgVariants: Record<string, string> = {
  primary:
    "bg-bg-inverse group-hover:bg-bg-inverse/90 group-active:bg-bg-inverse/80",
  secondary:
    "bg-bg-muted group-hover:bg-bg-muted/80 group-active:bg-bg-muted",
  tertiary:
    "bg-transparent group-hover:bg-bg-hover group-active:bg-bg-selected",
  ghost: "bg-transparent group-hover:bg-bg-hover group-active:bg-bg-selected",
};

const activeBgVariants: Record<string, string> = {
  primary: "bg-bg-inverse/80",
  secondary: "bg-bg-muted",
  tertiary: "bg-bg-selected",
  ghost: "bg-bg-selected",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leadingIcon: LeadingIcon,
      trailingIcon: TrailingIcon,
      active = false,
      disabled,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isIconOnly = size === "icon" || size === "icon-sm" || size === "icon-lg";
    const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;
    const shape = useShape();
    const bgClass = active
      ? activeBgVariants[variant ?? "primary"]
      : bgVariants[variant ?? "primary"];

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({
            variant,
            size,
            iconLeft: !isIconOnly && !!LeadingIcon,
            iconRight: !isIconOnly && !!TrailingIcon,
          }),
          shape.button,
          className
        )}
        disabled={disabled || loading}
        style={style}
        {...props}
      >
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-[inherit] transition-[background-color,transform] duration-80 group-active:scale-[0.98]",
            bgClass
          )}
        />
        <span className="relative inline-flex items-center justify-center gap-[inherit]">
          {loading ? (
            <>
              <span className="flex items-center justify-center gap-[inherit] opacity-0">
                {LeadingIcon && !isIconOnly && <LeadingIcon size={iconSize} />}
                {children}
                {TrailingIcon && !isIconOnly && <TrailingIcon size={iconSize} />}
              </span>
              <span className="absolute inset-0 flex items-center justify-center">
                <Icon
                  name="progress_activity"
                  size={iconSize}
                  className="animate-spin"
                />
              </span>
            </>
          ) : isIconOnly ? (
            <span className="inline-flex items-center justify-center">
              {children}
            </span>
          ) : (
            <>
              {LeadingIcon && <LeadingIcon size={iconSize} />}
              <span>{children}</span>
              {TrailingIcon && <TrailingIcon size={iconSize} />}
            </>
          )}
        </span>
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps, IconComponent };
