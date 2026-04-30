import * as React from "react"
import { Icon } from "./Icon"

export type AwInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean
  dense?: boolean
  iconLeft?: string
}

export const AwInput = React.forwardRef<HTMLInputElement, AwInputProps>(
  function AwInput(
    { invalid, dense, iconLeft, className, disabled, ...rest },
    ref
  ) {
    const isSearch = iconLeft === "search"
    const wrapperClasses = [
      "aw-input",
      invalid && "aw-input--invalid",
      dense && "aw-input--dense",
      disabled && "aw-input--disabled",
      isSearch && "aw-input--search",
      className,
    ]
      .filter(Boolean)
      .join(" ")
    return (
      <div className={wrapperClasses}>
        {iconLeft && <Icon name={iconLeft} size={16} />}
        <input ref={ref} disabled={disabled} {...rest} />
      </div>
    )
  }
)

export type AwFieldProps = {
  label: string
  error?: string
  helper?: string
  htmlFor?: string
  children: React.ReactNode
  className?: string
}

export function AwField({
  label,
  error,
  helper,
  htmlFor,
  children,
  className,
}: AwFieldProps) {
  return (
    <div className={["aw-field", className].filter(Boolean).join(" ")}>
      <label className="aw-field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <div className="aw-field__error">
          <Icon name="error" size={12} /> {error}
        </div>
      ) : helper ? (
        <div className="aw-field__helper">{helper}</div>
      ) : null}
    </div>
  )
}
