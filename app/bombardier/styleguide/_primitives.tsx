import * as React from "react"
import { CodeHighlight } from "./_highlight"

export function PageHero({
  title,
  children,
}: {
  title: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <header className="aw-hero">
      <div className="aw-hero__inner">
        <h1 className="aw-hero__title">{title}</h1>
        {children && <p className="aw-hero__lead">{children}</p>}
      </div>
    </header>
  )
}

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
  lang = "tsx",
  children,
}: {
  label?: string
  lang?: "tsx" | "ts" | "css" | "text"
  children: string
}) {
  return (
    <div className="mt-4">
      <div className="aw-eyebrow mb-2">{label}</div>
      <CodeHighlight lang={lang}>{children}</CodeHighlight>
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

/* ─────────────────────────────────────────────────────────────────────
 * Primitivos novos do padrão canônico (2026-05).
 * Documentação: docs/styleguide-page-structure.md
 * ──────────────────────────────────────────────────────────────────── */

/**
 * Tldr — bloco no topo da página, logo após PageHero, dizendo em duas
 * colunas "quando usar" vs "quando não usar". Encurta o tempo até a
 * decisão do dev. Use sempre, exceto em páginas de foundation curtas.
 */
export function Tldr({
  use,
  dontUse,
}: {
  use: React.ReactNode[]
  dontUse: React.ReactNode[]
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-[var(--radius-lg)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] p-5">
        <div className="aw-eyebrow mb-2 text-[var(--aw-blue-800)]">
          quando usar
        </div>
        <ul className="body-sm m-0 pl-4 list-disc flex flex-col gap-1 text-[var(--aw-blue-900)]">
          {use.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
        <div className="aw-eyebrow mb-2 text-[var(--fg-secondary)]">
          quando não usar
        </div>
        <ul className="body-sm m-0 pl-4 list-disc flex flex-col gap-1 text-[var(--fg-primary)]">
          {dontUse.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export type StateName =
  | "default"
  | "hover"
  | "focus"
  | "active"
  | "disabled"
  | "loading"
  | "error"
  | "selected"

/**
 * StatesMatrix — grid com label automático por estado. Cada célula recebe
 * uma demo já no estado descrito (use props/classes do componente real
 * pra forçar o estado; não invente CSS).
 */
export function StatesMatrix({
  states,
  columns = 3,
  dark,
}: {
  states: Array<{ name: StateName | string; node: React.ReactNode; note?: string }>
  columns?: 2 | 3 | 4
  dark?: boolean
}) {
  const cols =
    columns === 2
      ? "md:grid-cols-2"
      : columns === 4
        ? "md:grid-cols-2 lg:grid-cols-4"
        : "md:grid-cols-3"
  return (
    <div className={"grid grid-cols-1 gap-4 " + cols}>
      {states.map((s, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] overflow-hidden flex flex-col"
          style={{
            background: dark ? "var(--dark-bg)" : "var(--bg-raised)",
          }}
        >
          <div className="px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-raised)] flex items-center justify-between">
            <span className="aw-eyebrow">{s.name}</span>
          </div>
          <div className="flex-1 p-6 flex items-center justify-center min-h-[88px]">
            {s.node}
          </div>
          {s.note && (
            <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-raised)] caption">
              {s.note}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * TokensConsumed — lista dos design tokens (CSS vars) que o componente
 * lê do contexto. Cada linha: token, role (pra que serve dentro do
 * componente), default (o valor atual ou alias).
 */
export function TokensConsumed({
  tokens,
}: {
  tokens: Array<{ token: string; role: string; value?: string }>
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            <th className="pb-2 aw-eyebrow">token</th>
            <th className="pb-2 aw-eyebrow">role</th>
            <th className="pb-2 aw-eyebrow">value / alias</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t, i) => (
            <tr
              key={i}
              className="border-b border-[var(--border-subtle)] last:border-b-0 align-top"
            >
              <td className="py-3 pr-4 mono text-sm text-[var(--fg-primary)] whitespace-nowrap">
                {t.token}
              </td>
              <td className="py-3 pr-4 text-sm text-[var(--fg-secondary)]">
                {t.role}
              </td>
              <td className="py-3 mono text-xs text-[var(--fg-tertiary)] whitespace-nowrap">
                {t.value ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * ResponsiveStage — três viewports lado a lado (mobile · tablet · desktop)
 * pra mostrar como o componente reflua. Cada frame tem chrome com largura.
 */
export function ResponsiveStage({
  mobile,
  tablet,
  desktop,
  label,
  hint,
}: {
  mobile: React.ReactNode
  tablet?: React.ReactNode
  desktop: React.ReactNode
  label?: string
  hint?: string
}) {
  const frame = (width: number, node: React.ReactNode, name: string) => (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden flex flex-col">
      <div className="px-4 py-2 border-b border-[var(--border-subtle)] flex items-baseline justify-between">
        <span className="aw-eyebrow">{name}</span>
        <code className="mono text-[10px] text-[var(--fg-tertiary)]">
          {width}px
        </code>
      </div>
      <div className="p-4 bg-[var(--bg-surface)] flex justify-center">
        <div
          className="bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] overflow-hidden"
          style={{ width: "100%", maxWidth: width }}
        >
          {node}
        </div>
      </div>
    </div>
  )
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
      {(label || hint) && (
        <div className="px-5 py-3 border-b border-[var(--border-subtle)]">
          {label && (
            <div className="text-sm font-medium text-[var(--fg-primary)]">
              {label}
            </div>
          )}
          {hint && <div className="caption mt-0.5">{hint}</div>}
        </div>
      )}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {frame(375, mobile, "mobile")}
        {frame(768, tablet ?? mobile, "tablet")}
        {frame(1280, desktop, "desktop")}
      </div>
    </div>
  )
}

/**
 * KeyboardTable — atalhos de teclado suportados pelo componente.
 * Use na seção Accessibility. Tecla à esquerda como `kbd`, ação à direita.
 */
export function KeyboardTable({
  rows,
}: {
  rows: Array<{ keys: string[]; action: string }>
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            <th className="pb-2 aw-eyebrow w-1/3">tecla</th>
            <th className="pb-2 aw-eyebrow">ação</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="border-b border-[var(--border-subtle)] last:border-b-0 align-top"
            >
              <td className="py-3 pr-4 whitespace-nowrap">
                <span className="inline-flex flex-wrap gap-1">
                  {r.keys.map((k, j) => (
                    <kbd
                      key={j}
                      className="mono text-xs px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--fg-primary)]"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </td>
              <td className="py-3 text-sm text-[var(--fg-secondary)]">
                {r.action}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * RelatedLinks — grid de cards no fim da página linkando pra outros
 * componentes ou foundations relacionadas. Fecha a navegação contextual.
 */
export function RelatedLinks({
  items,
}: {
  items: Array<{ name: string; href: string; description: string }>
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 flex flex-col gap-2 no-underline transition-colors hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)]"
        >
          <div className="text-sm font-medium text-[var(--fg-primary)]">
            {item.name}
          </div>
          <p className="caption m-0">{item.description}</p>
          <span className="mono text-[10px] text-[var(--aw-blue-700)] mt-1">
            {item.href} →
          </span>
        </a>
      ))}
    </div>
  )
}

/**
 * Toc — sumário inline com os ids das sections. Use em páginas longas
 * (>400 linhas) logo após PageHero/Tldr. Cada item é um anchor.
 */
export function Toc({
  items,
}: {
  items: Array<{ id: string; label: string }>
}) {
  return (
    <nav
      aria-label="Sumário"
      className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5"
    >
      <div className="aw-eyebrow mb-3">nesta página</div>
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 list-decimal pl-5 text-sm text-[var(--fg-secondary)]">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              className="text-[var(--fg-primary)] no-underline hover:text-[var(--aw-blue-700)]"
            >
              {i.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
