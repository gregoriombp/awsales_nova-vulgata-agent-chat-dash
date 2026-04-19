import * as React from "react"

export type AwTableProps = React.TableHTMLAttributes<HTMLTableElement>

export function AwTable({ className, children, ...rest }: AwTableProps) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        className={["aw-table", className].filter(Boolean).join(" ")}
        {...rest}
      >
        {children}
      </table>
    </div>
  )
}
