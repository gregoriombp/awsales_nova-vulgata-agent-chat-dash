"use client"

import * as React from "react"

export type AwTransitionPreset =
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale"
  | "pop"

type Frame = { opacity: number; transform?: string }

const PRESETS: Record<AwTransitionPreset, { out: Frame; in: Frame }> = {
  "fade":        { out: { opacity: 0 },                                    "in": { opacity: 1 } },
  "slide-up":    { out: { opacity: 0, transform: "translateY(16px)" },     "in": { opacity: 1, transform: "translateY(0)" } },
  "slide-down":  { out: { opacity: 0, transform: "translateY(-16px)" },    "in": { opacity: 1, transform: "translateY(0)" } },
  "slide-left":  { out: { opacity: 0, transform: "translateX(16px)" },     "in": { opacity: 1, transform: "translateX(0)" } },
  "slide-right": { out: { opacity: 0, transform: "translateX(-16px)" },    "in": { opacity: 1, transform: "translateX(0)" } },
  "scale":       { out: { opacity: 0, transform: "scale(0.92)" },          "in": { opacity: 1, transform: "scale(1)" } },
  "pop":         { out: { opacity: 0, transform: "scale(0.7)" },           "in": { opacity: 1, transform: "scale(1)" } },
}

type Phase = "pre-enter" | "entering" | "entered" | "exiting" | "exited"

export type AwTransitionProps = {
  /** When true, the element animates in; when false, animates out. */
  mounted: boolean
  /** One of the named presets. Defaults to "fade". */
  transition?: AwTransitionPreset
  /** Enter duration in ms. Defaults to 240. */
  duration?: number
  /** Exit duration in ms. Falls back to `duration`. */
  exitDuration?: number
  /** CSS timing function. Defaults to the project ease-out token. */
  timingFunction?: string
  /** Keep the element in the DOM (with `out` styles) instead of unmounting it. */
  keepMounted?: boolean
  /** Fires after the enter animation completes. */
  onEnter?: () => void
  /** Fires after the exit animation completes. */
  onExit?: () => void
  /** Render prop that receives the computed inline styles. */
  children: (styles: React.CSSProperties) => React.ReactNode
}

const DEFAULT_TIMING = "var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1))"

export function AwTransition({
  mounted,
  transition = "fade",
  duration = 240,
  exitDuration,
  timingFunction = DEFAULT_TIMING,
  keepMounted = false,
  onEnter,
  onExit,
  children,
}: AwTransitionProps) {
  const effectiveExit = exitDuration ?? duration
  const [phase, setPhase] = React.useState<Phase>(
    mounted ? "entered" : "exited",
  )

  const onEnterRef = React.useRef(onEnter)
  const onExitRef = React.useRef(onExit)
  React.useEffect(() => {
    onEnterRef.current = onEnter
  }, [onEnter])
  React.useEffect(() => {
    onExitRef.current = onExit
  }, [onExit])

  React.useEffect(() => {
    let raf1 = 0
    let raf2 = 0
    let timer: ReturnType<typeof setTimeout> | null = null

    if (mounted) {
      setPhase("pre-enter")
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setPhase("entering")
          timer = setTimeout(() => {
            setPhase("entered")
            onEnterRef.current?.()
          }, duration)
        })
      })
    } else {
      setPhase((current) => (current === "exited" ? "exited" : "exiting"))
      timer = setTimeout(() => {
        setPhase("exited")
        onExitRef.current?.()
      }, effectiveExit)
    }

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      if (timer) clearTimeout(timer)
    }
  }, [mounted, duration, effectiveExit])

  if (phase === "exited" && !keepMounted) return null

  const preset = PRESETS[transition]
  const showingIn = phase === "entering" || phase === "entered"
  const animating = phase === "entering" || phase === "exiting"
  const activeDuration = phase === "exiting" ? effectiveExit : duration

  const styles: React.CSSProperties = {
    ...(showingIn ? preset.in : preset.out),
    transition: animating
      ? `opacity ${activeDuration}ms ${timingFunction}, transform ${activeDuration}ms ${timingFunction}`
      : "none",
    willChange: animating ? "opacity, transform" : undefined,
  }

  return <>{children(styles)}</>
}
