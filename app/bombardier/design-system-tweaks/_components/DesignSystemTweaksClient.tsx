"use client"

import Link from "next/link"
import * as React from "react"
import { AwAlert } from "@/components/ui/AwAlert"
import { AwButton } from "@/components/ui/AwButton"
import { AwCard } from "@/components/ui/AwCard"
import { AwField, AwInput } from "@/components/ui/AwInput"
import { AwPill } from "@/components/ui/AwPill"
import { AwSlider } from "@/components/ui/AwSlider"
import { AwTabs } from "@/components/ui/AwTabs"
import { AwToggleRow } from "@/components/ui/AwToggle"
import { Icon } from "@/components/ui/Icon"
import {
  buildFoundationTweaksCss,
  countFoundationTweakChanges,
  createDefaultFoundationTweakValues,
  FOUNDATION_TWEAK_CATEGORIES,
  FOUNDATION_TWEAK_CONTROLS,
  FOUNDATION_TWEAK_STORAGE_KEY,
  FOUNDATION_TWEAK_STYLE_ID,
  type FoundationTweakCategory,
  type FoundationTweakControl,
  type FoundationTweakMode,
  type FoundationTweakStore,
  type FoundationTweakValueMap,
  mergeFoundationTweakValues,
} from "@/lib/bombardier/foundation-tweaks"

const modeTabs = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]

const categoryTabs = FOUNDATION_TWEAK_CATEGORIES.map((category) => ({
  value: category.value,
  label: category.label,
  count: FOUNDATION_TWEAK_CONTROLS.filter(
    (control) => control.category === category.value,
  ).length,
}))

function readStoredTweaks(): FoundationTweakValueMap {
  try {
    const raw = window.localStorage.getItem(FOUNDATION_TWEAK_STORAGE_KEY)
    if (!raw) return createDefaultFoundationTweakValues()
    return mergeFoundationTweakValues(JSON.parse(raw))
  } catch {
    return createDefaultFoundationTweakValues()
  }
}

function applyTweaksStyle(values: FoundationTweakValueMap) {
  const css = buildFoundationTweaksCss(values)
  let tag = document.getElementById(FOUNDATION_TWEAK_STYLE_ID)

  if (!tag) {
    tag = document.createElement("style")
    tag.id = FOUNDATION_TWEAK_STYLE_ID
    document.head.appendChild(tag)
  }

  tag.textContent = css
}

function removeTweaksStyle() {
  document.getElementById(FOUNDATION_TWEAK_STYLE_ID)?.remove()
}

function numericValue(value: string): number {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function clampValue(value: number, control: FoundationTweakControl): number {
  const min = control.min ?? value
  const max = control.max ?? value
  return Math.min(max, Math.max(min, value))
}

function formatNumberValue(value: number, control: FoundationTweakControl) {
  const unit = control.unit ?? "px"
  return `${clampValue(value, control)}${unit}`
}

function safeColorValue(value: string, fallback: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback
}

function storeTweaks(values: FoundationTweakValueMap) {
  const store: FoundationTweakStore = {
    version: 1,
    values,
  }
  window.localStorage.setItem(FOUNDATION_TWEAK_STORAGE_KEY, JSON.stringify(store))
}

export function DesignSystemTweaksClient() {
  const [hydrated, setHydrated] = React.useState(false)
  const [mode, setMode] = React.useState<FoundationTweakMode>("light")
  const [category, setCategory] =
    React.useState<FoundationTweakCategory>("color")
  const [values, setValues] = React.useState<FoundationTweakValueMap>(() =>
    createDefaultFoundationTweakValues(),
  )
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    const stored = readStoredTweaks()
    setValues(stored)
    applyTweaksStyle(stored)
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return

    const changes = countFoundationTweakChanges(values)
    if (changes === 0) {
      window.localStorage.removeItem(FOUNDATION_TWEAK_STORAGE_KEY)
      removeTweaksStyle()
      return
    }

    storeTweaks(values)
    applyTweaksStyle(values)
  }, [hydrated, values])

  const changeCount = countFoundationTweakChanges(values)
  const visibleControls = FOUNDATION_TWEAK_CONTROLS.filter(
    (control) => control.category === category,
  )
  const changedCss = buildFoundationTweaksCss(values, { changedOnly: true })

  function updateValue(control: FoundationTweakControl, next: string) {
    setCopied(false)
    setValues((current) => ({
      ...current,
      [mode]: {
        ...current[mode],
        [control.token]: next,
      },
    }))
  }

  function resetAll() {
    const defaults = createDefaultFoundationTweakValues()
    setValues(defaults)
    window.localStorage.removeItem(FOUNDATION_TWEAK_STORAGE_KEY)
    removeTweaksStyle()
    setCopied(false)
  }

  async function copyPatch() {
    const patch = changedCss || "/* Sem alterações em relação a globals.css. */"
    await window.navigator.clipboard.writeText(patch)
    setCopied(true)
  }

  return (
    <main className="min-h-screen bg-(--bg-canvas) text-(--fg-primary)">
      <div
        className="mx-auto px-8 py-10"
        style={{ maxWidth: "var(--content-wide)" }}
      >
        <header className="mb-8 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <Link href="/bombardier" className="no-underline">
              <AwButton variant="ghost" iconLeft="arrow_back" size="sm">
                Bombardier
              </AwButton>
            </Link>
            <div className="mt-6 flex items-center gap-3">
              <span
                className="inline-flex items-center justify-center rounded-md bg-(--bg-surface) text-(--fg-primary)"
                style={{
                  width: "var(--space-12)",
                  height: "var(--space-12)",
                }}
              >
                <Icon name="tune" size={26} />
              </span>
              <div>
                <p className="aw-eyebrow mb-2">Foundations Lab</p>
                <h1 className="m-0">Design System Tweaks</h1>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-(--body-lg-size) leading-relaxed text-(--fg-secondary)">
              Ajuste tokens existentes, valide o impacto em componentes reais e
              exporte um patch para consolidar no design system.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AwPill variant={changeCount > 0 ? "warning" : "neutral"}>
              {changeCount} alterações
            </AwPill>
            <AwPill variant="beta">Preview local</AwPill>
          </div>
        </header>

        <AwAlert
          variant="info"
          title="Os overrides ficam no navegador."
          className="mb-6"
        >
          Tokens novos continuam fora desta tela; o patch gerado altera apenas
          variáveis já existentes em <code className="mono">globals.css</code>.
        </AwAlert>

        <div className="grid grid-cols-3 gap-6 items-start">
          <section className="col-span-2 flex flex-col gap-6">
            <AwCard
              className="p-5 bg-(--bg-raised)"
              style={{ borderRadius: "var(--radius-2xl)" }}
            >
              <div className="flex items-start justify-between gap-6 mb-5">
                <div>
                  <p className="aw-eyebrow mb-2">Edição</p>
                  <h2 className="m-0 text-(--h4-size)">
                    Tokens por foundation
                  </h2>
                </div>
                <AwTabs
                  items={modeTabs}
                  value={mode}
                  onChange={(next) => setMode(next as FoundationTweakMode)}
                  variant="segmented"
                  aria-label="Modo"
                />
              </div>

              <AwTabs
                items={categoryTabs}
                value={category}
                onChange={(next) =>
                  setCategory(next as FoundationTweakCategory)
                }
                variant="standalone"
                aria-label="Foundation"
                className="mb-5"
              />

              <div className="grid grid-cols-2 gap-4">
                {visibleControls.map((control) => (
                  <TokenControl
                    key={`${mode}-${control.token}`}
                    control={control}
                    mode={mode}
                    value={values[mode][control.token]}
                    onChange={(next) => updateValue(control, next)}
                  />
                ))}
              </div>
            </AwCard>

            <PreviewPanel mode={mode} />
          </section>

          <aside className="col-span-1 sticky top-8 flex flex-col gap-6">
            <AwCard
              className="p-5 bg-(--bg-raised)"
              style={{ borderRadius: "var(--radius-2xl)" }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="aw-eyebrow mb-2">Patch</p>
                  <h2 className="m-0 text-(--h5-size)">CSS exportável</h2>
                </div>
                <Icon name="data_object" size={22} />
              </div>
              <pre className="mono text-xs whitespace-pre-wrap overflow-auto max-h-80 rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-4 text-(--fg-secondary)">
                {changedCss || "/* Sem alterações em relação a globals.css. */"}
              </pre>
              <div className="mt-4 flex flex-col gap-3">
                <AwButton
                  variant="primary"
                  iconLeft={copied ? "check" : "content_copy"}
                  onClick={copyPatch}
                  disabled={changeCount === 0}
                  block
                >
                  {copied ? "Patch copiado" : "Copiar patch"}
                </AwButton>
                <AwButton
                  variant="secondary"
                  iconLeft="restart_alt"
                  onClick={resetAll}
                  disabled={changeCount === 0}
                  block
                >
                  Resetar tweaks
                </AwButton>
                <Link
                  href="/bombardier/styleguide"
                  className="no-underline block"
                >
                  <AwButton variant="ghost" iconRight="arrow_forward" block>
                    Ver styleguide
                  </AwButton>
                </Link>
              </div>
            </AwCard>

            <AwCard
              className="p-5 bg-(--bg-raised)"
              style={{ borderRadius: "var(--radius-2xl)" }}
            >
              <p className="aw-eyebrow mb-3">Escopo</p>
              <div className="flex flex-col gap-3 text-sm text-(--fg-secondary)">
                <div className="flex items-start gap-3">
                  <Icon name="check_circle" size={18} />
                  <span>Preview global salvo neste navegador.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="lock" size={18} />
                  <span>Sem criação automática de novos tokens.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="terminal" size={18} />
                  <span>Patch enxuto, pronto para revisão no código.</span>
                </div>
              </div>
            </AwCard>
          </aside>
        </div>
      </div>
    </main>
  )
}

function TokenControl({
  control,
  mode,
  value,
  onChange,
}: {
  control: FoundationTweakControl
  mode: FoundationTweakMode
  value: string
  onChange: (value: string) => void
}) {
  if (control.type === "color") {
    const fallback = control.defaults[mode]
    const colorValue = safeColorValue(value, fallback)

    return (
      <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="m-0 text-base">{control.label}</h3>
            <p className="m-0 mt-1 text-sm leading-relaxed text-(--fg-secondary)">
              {control.description}
            </p>
          </div>
          <code className="mono text-xs text-(--fg-tertiary)">
            {control.token}
          </code>
        </div>
        <div className="flex items-center gap-3">
          <input
            aria-label={control.label}
            type="color"
            value={colorValue}
            onChange={(event) => onChange(event.target.value)}
            className="shrink-0 cursor-pointer rounded-md border border-(--border-default) bg-transparent"
            style={{
              width: "var(--space-10)",
              height: "var(--space-10)",
            }}
          />
          <AwInput
            dense
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label={`${control.label} hex`}
          />
        </div>
      </div>
    )
  }

  const currentNumber = numericValue(value)

  return (
    <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="m-0 text-base">{control.label}</h3>
          <p className="m-0 mt-1 text-sm leading-relaxed text-(--fg-secondary)">
            {control.description}
          </p>
        </div>
        <code className="mono text-xs text-(--fg-tertiary)">
          {control.token}
        </code>
      </div>
      <AwSlider
        min={control.min}
        max={control.max}
        step={control.step}
        value={currentNumber}
        valueDisplay={value}
        onChange={(event) =>
          onChange(formatNumberValue(Number(event.target.value), control))
        }
      />
      <div className="mt-3">
        <AwField label="Valor" htmlFor={`${mode}-${control.token}`}>
          <AwInput
            id={`${mode}-${control.token}`}
            dense
            type="number"
            min={control.min}
            max={control.max}
            step={control.step}
            value={currentNumber}
            onChange={(event) =>
              onChange(formatNumberValue(Number(event.target.value), control))
            }
          />
        </AwField>
      </div>
    </div>
  )
}

function PreviewPanel({ mode }: { mode: FoundationTweakMode }) {
  return (
    <AwCard
      className="overflow-hidden bg-(--bg-raised)"
      style={{ borderRadius: "var(--radius-2xl)" }}
    >
      <div className="border-b border-(--border-subtle) px-5 py-4 flex items-center justify-between">
        <div>
          <p className="aw-eyebrow mb-2">Preview</p>
          <h2 className="m-0 text-(--h5-size)">Componentes em contexto</h2>
        </div>
        <AwPill variant={mode === "dark" ? "neutral" : "live"}>
          {mode === "dark" ? "Dark" : "Light"}
        </AwPill>
      </div>

      <div className={mode === "dark" ? "dark" : undefined}>
        <div className="bg-(--bg-canvas) text-(--fg-primary) p-6">
          <div className="grid grid-cols-2 gap-5">
            <AwCard
              className="p-5 bg-(--bg-raised)"
              style={{ borderRadius: "var(--radius-xl)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="aw-eyebrow mb-2">Agent Studio</p>
                  <h3 className="m-0">Orquestração de agentes</h3>
                </div>
                <AwPill variant="ai">Beta</AwPill>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-(--fg-secondary)">
                Simule como as foundations reagem em superfícies, texto,
                bordas, ações e estados.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <AwButton variant="primary" iconRight="arrow_forward">
                  Salvar ajuste
                </AwButton>
                <AwButton variant="secondary" iconLeft="visibility">
                  Revisar
                </AwButton>
              </div>
            </AwCard>

            <AwCard
              className="p-5 bg-(--bg-surface)"
              style={{ borderRadius: "var(--radius-xl)" }}
            >
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <p className="aw-eyebrow mb-2">Controls</p>
                  <h3 className="m-0">Estados reais</h3>
                </div>
                <Icon name="settings" size={22} />
              </div>
              <div className="flex flex-col gap-4">
                <AwField label="Nome do token">
                  <AwInput placeholder="--accent-brand" iconLeft="search" />
                </AwField>
                <AwToggleRow
                  title="Preview ativo"
                  description="Override local aplicado na sessão atual."
                  checked
                />
                <AwSlider
                  label="Densidade"
                  valueDisplay="24px"
                  value={24}
                  min={8}
                  max={48}
                  readOnly
                />
              </div>
            </AwCard>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-3">
            {[
              ["Brand", "var(--accent-brand)"],
              ["Success", "var(--accent-success)"],
              ["Warning", "var(--accent-warning)"],
              ["Danger", "var(--accent-danger)"],
            ].map(([label, token]) => (
              <div
                key={label}
                className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-4"
              >
                <div
                  className="mb-3 rounded-md"
                  style={{
                    height: "var(--space-8)",
                    background: token,
                  }}
                />
                <div className="text-sm font-medium">{label}</div>
                <div className="caption mono mt-1">{token}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AwCard>
  )
}
