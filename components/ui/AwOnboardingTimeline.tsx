"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "./Icon"

export type AwOnboardingStepStatus = "done" | "current" | "pending"

export type AwOnboardingStep = {
  id: string
  title: string
  description?: React.ReactNode
  status?: AwOnboardingStepStatus
  /** Primary call-to-action shown when the step is expanded. */
  cta?: {
    label: string
    onClick?: () => void
    href?: string
    iconLeft?: string
  }
  /** Secondary inline link (e.g. "Saiba mais sobre canais"). */
  helpLink?: {
    label: string
    href: string
  }
}

export type AwOnboardingTimelineProps = {
  /** Section heading shown above the card. */
  title: React.ReactNode
  /** Small eyebrow shown above the timeline (e.g. "Pra começar"). */
  eyebrow?: React.ReactNode
  steps: AwOnboardingStep[]
  /**
   * Step that should be expanded by default. If omitted, the first step
   * with status "current" (or the first pending step) is expanded.
   */
  defaultExpandedId?: string
  /** Optional right-rail preview (image, video, illustration). */
  preview?: React.ReactNode
  className?: string
}

function StepMarker({
  status,
  index,
}: {
  status: AwOnboardingStepStatus
  index: number
}) {
  if (status === "done") {
    return (
      <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full bg-aw-emerald-600 text-aw-white shadow-[0_0_0_4px_var(--bg-raised)]">
        <Icon name="check" size={18} weight={500} />
      </span>
    )
  }
  if (status === "current") {
    return (
      <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full bg-(--bg-inverse) text-(--fg-on-inverse) shadow-[0_0_0_4px_var(--bg-raised)]">
        <span className="text-[13px] font-semibold tabular-nums">
          {index + 1}
        </span>
      </span>
    )
  }
  return (
    <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full border border-(--border-default) bg-(--bg-raised) text-(--fg-tertiary) shadow-[0_0_0_4px_var(--bg-raised)]">
      <span className="text-[13px] font-medium tabular-nums">{index + 1}</span>
    </span>
  )
}

function StepRow({
  step,
  index,
  isExpanded,
  onToggle,
}: {
  step: AwOnboardingStep
  index: number
  isExpanded: boolean
  onToggle: () => void
}) {
  const status: AwOnboardingStepStatus = step.status ?? "pending"
  const isDone = status === "done"

  return (
    <li className="relative pl-12 pb-6 last:pb-0">
      <div className="absolute left-0 top-0">
        <StepMarker status={status} index={index} />
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "group flex w-full items-center justify-between gap-3 rounded-md text-left",
          "transition-colors",
          isDone ? "text-(--fg-tertiary)" : "text-(--fg-primary)",
        )}
        aria-expanded={isExpanded}
      >
        <span
          className={cn(
            "min-h-8 flex items-center body-md font-medium leading-tight",
            isDone && "line-through decoration-(--border-default)",
          )}
        >
          {step.title}
        </span>
        <Icon
          name="chevron_right"
          size={20}
          className={cn(
            "shrink-0 text-(--fg-tertiary) transition-all duration-200 group-hover:text-(--fg-primary)",
            isExpanded ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows]",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
        style={{
          transitionDuration: "var(--dur-slow)",
          transitionTimingFunction: "var(--ease-out)",
        }}
        aria-hidden={!isExpanded}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "space-y-4 pt-2 transition-[opacity,transform]",
              isExpanded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-1",
            )}
            style={{
              transitionDuration: "var(--dur-slow)",
              transitionTimingFunction: "var(--ease-out)",
            }}
          >
            {step.description && (
              <p className="m-0 max-w-[520px] body-sm text-(--fg-secondary)">
                {step.description}
                {step.helpLink && (
                  <>
                    {" "}
                    <a
                      href={step.helpLink.href}
                      className="text-(--fg-primary) underline decoration-(--border-default) underline-offset-2 transition-colors hover:decoration-(--fg-primary)"
                    >
                      {step.helpLink.label}
                    </a>
                  </>
                )}
              </p>
            )}
            {step.cta && (
              <div>
                {step.cta.href ? (
                  <a
                    href={step.cta.href}
                    className="aw-btn aw-btn--primary aw-btn--md"
                  >
                    {step.cta.iconLeft && (
                      <Icon name={step.cta.iconLeft} size={16} />
                    )}
                    <span className="aw-btn__label">{step.cta.label}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={step.cta.onClick}
                    className="aw-btn aw-btn--primary aw-btn--md"
                  >
                    {step.cta.iconLeft && (
                      <Icon name={step.cta.iconLeft} size={16} />
                    )}
                    <span className="aw-btn__label">{step.cta.label}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

export function AwOnboardingTimeline({
  title,
  eyebrow,
  steps,
  defaultExpandedId,
  preview,
  className,
}: AwOnboardingTimelineProps) {
  const initialExpanded = React.useMemo(() => {
    if (defaultExpandedId) return defaultExpandedId
    const current = steps.find((s) => s.status === "current")
    if (current) return current.id
    const firstPending = steps.find((s) => (s.status ?? "pending") !== "done")
    return firstPending?.id ?? steps[0]?.id
  }, [defaultExpandedId, steps])

  const [expandedId, setExpandedId] = React.useState<string | undefined>(
    initialExpanded,
  )

  return (
    <section className={cn("flex flex-col gap-6", className)}>
      <h2 className="m-0 text-(length:--h2-size) font-semibold leading-[1.15] tracking-heading-tighter text-(--fg-primary)">
        {title}
      </h2>

      {eyebrow && (
        <div className="flex items-center gap-3 text-(--fg-secondary)">
          <span className="grid h-5 w-5 place-items-center rounded-full border border-(--border-default)" />
          <span className="body-sm font-medium text-(--fg-primary)">
            {eyebrow}
          </span>
        </div>
      )}

      <div
        className={cn(
          "grid items-stretch gap-0",
          preview && "lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]",
        )}
      >
        <div className="flex min-h-[560px] flex-col rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 md:p-10">
          <ol className="relative m-0 list-none p-0">
            <span
              aria-hidden
              className="absolute left-4 top-4 bottom-4 w-px -translate-x-px bg-(--border-subtle)"
            />
            {steps.map((step, index) => (
              <StepRow
                key={step.id}
                step={step}
                index={index}
                isExpanded={expandedId === step.id}
                onToggle={() =>
                  setExpandedId((prev) =>
                    prev === step.id ? undefined : step.id,
                  )
                }
              />
            ))}
          </ol>
        </div>

        {preview && (
          <div className="hidden lg:flex lg:items-stretch lg:pl-6">
            <div className="flex w-full overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-surface)">
              <div className="flex h-full w-full flex-col">{preview}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
