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
    { label, valueDisplay, help, className, min = 0, max = 100, ...rest },
    ref
  ) {
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
          className="aw-slider__rng"
          {...rest}
        />
        {help && <div className="aw-slider__help">{help}</div>}
      </div>
    )
  }
)
