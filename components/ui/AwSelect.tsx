import * as React from "react"
import { cn } from "@/lib/utils"

export type AwSelectProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> & {
  children: React.ReactNode
}

export const AwSelect = React.forwardRef<HTMLButtonElement, AwSelectProps>(
  function AwSelect({ className, children, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={cn("aw-select", className)}
        {...rest}
      >
        <span>{children}</span>
        <svg
          className="aw-select__caret"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    )
  }
)
