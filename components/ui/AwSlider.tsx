import * as React from "react"
import { cn } from "@/lib/utils"

export type AwSliderProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "className"
> & {
  label?: React.ReactNode
  valueDisplay?: React.ReactNode
  help?: React.ReactNode
  className?: string
}

export const AwSlider = React.forwardRef<HTMLInputElement, AwSliderProps>(
  function AwSlider(
    { label, valueDisplay, help, className, min = 0, max = 100, value, defaultValue, style, ...rest },
    ref
  ) {
    // Progresso da esquerda ao thumb — preenche o trilho com bg dark.
    // Lê value (controlado) ou defaultValue (uncontrolled); cai em min se nada.
    const current = Number(value ?? defaultValue ?? min)
    const lo = Number(min)
    const hi = Number(max)
    const progress = hi > lo ? Math.min(100, Math.max(0, ((current - lo) / (hi - lo)) * 100)) : 0
    return (
      <div className={cn("aw-slider", className)}>
        {(label || valueDisplay !== undefined) && (
          <div className="aw-slider__top">
            <span>{label}</span>
            {valueDisplay !== undefined && <b>{valueDisplay}</b>}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          value={value}
          defaultValue={defaultValue}
          className="aw-slider__rng"
          style={{ ["--aw-slider-progress" as string]: `${progress}%`, ...style }}
          {...rest}
        />
        {help && <div className="aw-slider__help">{help}</div>}
      </div>
    )
  }
)
