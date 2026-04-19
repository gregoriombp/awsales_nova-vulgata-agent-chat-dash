import * as React from "react"

export function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string
  title: string
  lead?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-16">
      <div className="mb-6">
        <h2 className="m-0">{title}</h2>
        {lead && (
          <p className="text-[var(--body-md-size)] text-[var(--fg-secondary)] mt-2 max-w-2xl">
            {lead}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

export function Stage({
  label,
  hint,
  children,
  dark,
  gridClassName,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  dark?: boolean
  gridClassName?: string
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-baseline justify-between">
        <div>
          <div className="text-sm font-medium text-[var(--fg-primary)]">
            {label}
          </div>
          {hint && <div className="caption mt-0.5">{hint}</div>}
        </div>
      </div>
      <div
        className={
          "p-8 " +
          (gridClassName ?? "flex flex-wrap items-center gap-3")
        }
        style={
          dark
            ? {
                backgroundColor: "var(--dark-bg)",
                color: "var(--dark-fg-primary)",
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  )
}

export function Spec({
  k,
  v,
  d,
}: {
  k: string
  v: string
  d?: string
}) {
  return (
    <div>
      <div className="aw-eyebrow mb-1">{k}</div>
      <div className="mono text-sm text-[var(--fg-primary)]">{v}</div>
      {d && <div className="caption mt-1">{d}</div>}
    </div>
  )
}

export function PropRow({
  prop,
  type,
  def,
  doc,
}: {
  prop: string
  type: string
  def?: string
  doc: string
}) {
  return (
    <tr className="border-b border-[var(--border-subtle)] last:border-b-0 align-top">
      <td className="py-3 pr-4 mono text-sm text-[var(--fg-primary)] whitespace-nowrap">
        {prop}
      </td>
      <td className="py-3 pr-4 mono text-xs text-[var(--aw-blue-700)] whitespace-normal">
        {type}
      </td>
      <td className="py-3 pr-4 mono text-xs text-[var(--fg-tertiary)] whitespace-nowrap">
        {def ?? "—"}
      </td>
      <td className="py-3 text-sm text-[var(--fg-secondary)]">{doc}</td>
    </tr>
  )
}

export function ApiTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            <th className="pb-2 aw-eyebrow">prop</th>
            <th className="pb-2 aw-eyebrow">type</th>
            <th className="pb-2 aw-eyebrow">default</th>
            <th className="pb-2 aw-eyebrow">doc</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function CodeExample({
  label = "exemplo",
  children,
}: {
  label?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 mt-4">
      <div className="aw-eyebrow mb-2">{label}</div>
      <pre className="mono text-sm text-[var(--fg-primary)] m-0 whitespace-pre-wrap">
        {children}
      </pre>
    </div>
  )
}

export function DoDont({
  dos,
  donts,
}: {
  dos: React.ReactNode[]
  donts: React.ReactNode[]
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-[var(--radius-lg)] border border-[var(--aw-emerald-300)] bg-[var(--aw-emerald-100)] p-5">
        <div className="aw-eyebrow mb-2 text-[var(--aw-emerald-800)]">do</div>
        <ul className="body-sm m-0 pl-4 list-disc flex flex-col gap-1 text-[var(--aw-emerald-900)]">
          {dos.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--aw-red-300)] bg-[var(--aw-red-100)] p-5">
        <div className="aw-eyebrow mb-2 text-[var(--aw-red-800)]">
          don&apos;t
        </div>
        <ul className="body-sm m-0 pl-4 list-disc flex flex-col gap-1 text-[var(--aw-red-900)]">
          {donts.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
