"use client";

import { useRef, useEffect, forwardRef, type HTMLAttributes } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropdown } from "@/components/ui/fluid/dropdown";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { fontWeights } from "@/components/ui/fluid/lib/font-weight";
import { shapeMap } from "@/components/ui/fluid/lib/shape-context";

// MenuItem is only used inside Dropdown, which opts out of the global pill
// shape — see dropdown.tsx for the rationale.
const shape = shapeMap.rounded;

interface MenuItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional leading icon — a Material Symbols glyph name (e.g. "edit").
   *  When omitted, the row renders text-only with no reserved icon column. */
  icon?: string;
  label: string;
  index: number;
  checked?: boolean;
  /** Destructive action (e.g. delete): label and icon use the danger accent. */
  destructive?: boolean;
  onSelect?: () => void;
}

const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  (
    {
      icon,
      label,
      index,
      checked,
      destructive,
      onSelect,
      className,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const hasMounted = useRef(false);
    const { registerItem, activeIndex, checkedIndex } = useDropdown();

    useEffect(() => {
      registerItem(index, internalRef.current);
      return () => registerItem(index, null);
    }, [index, registerItem]);

    useEffect(() => {
      hasMounted.current = true;
    }, []);

    const isActive = activeIndex === index;
    const skipAnimation = !hasMounted.current;

    const stateColor = destructive
      ? "text-(--accent-danger)"
      : isActive || checked
        ? "text-fg-primary"
        : "text-fg-muted";

    return (
      <div
        ref={(node) => {
          (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        data-proximity-index={index}
        tabIndex={index === (checkedIndex ?? 0) ? 0 : -1}
        role="menuitemradio"
        aria-checked={!!checked}
        aria-label={label}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onSelect?.();
          }
        }}
        className={cn(
          `relative z-10 flex items-center gap-2 ${shape.item} px-2 py-2 cursor-pointer outline-none`,
          className
        )}
        {...props}
      >
        {icon && (
          <Icon
            name={icon}
            size={16}
            weight={isActive || checked ? 400 : 200}
            className={cn(
              "shrink-0 transition-[color,font-variation-settings] duration-80",
              stateColor
            )}
          />
        )}
        <span className="inline-grid flex-1 text-sm">
          <span
            className="col-start-1 row-start-1 invisible"
            style={{ fontVariationSettings: fontWeights.semibold }}
            aria-hidden="true"
          >
            {label}
          </span>
          <span
            className={cn(
              "col-start-1 row-start-1 transition-[color,font-variation-settings] duration-80",
              stateColor
            )}
            style={{
              fontVariationSettings: checked
                ? fontWeights.semibold
                : fontWeights.normal,
            }}
          >
            {label}
          </span>
        </span>
        <AnimatePresence>
          {checked && (
            <motion.svg
              key="check"
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                "shrink-0",
                destructive ? "text-(--accent-danger)" : "text-fg-primary"
              )}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1 }}
            >
              <motion.path
                d="M4 12L9 17L20 6"
                initial={{ pathLength: skipAnimation ? 1 : 0 }}
                animate={{
                  pathLength: 1,
                  transition: { duration: 0.08, ease: "easeOut" },
                }}
                exit={{
                  pathLength: 0,
                  transition: { duration: 0.04, ease: "easeIn" },
                }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

MenuItem.displayName = "MenuItem";

export { MenuItem };
export default MenuItem;
