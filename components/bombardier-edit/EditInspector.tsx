"use client"

import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { AwAlert } from "@/components/ui/AwAlert"
import {
  captureEditAnchor,
  findEditableTextLeaf,
  resolveEditElement,
} from "@/lib/bombardier-edit/anchor"
import {
  currentAxisValue,
  detectComponent,
  type VariantAxis,
} from "@/lib/bombardier-edit/variant-registry"
import {
  readIconVariation,
  type IconVariation,
} from "@/lib/bombardier-edit/icon-style"
import type { PageEditAnchor, PageEditOp } from "@/lib/bombardier-edit/types"
import { EDIT_OVERLAY_DATA_ATTR, EDIT_Z } from "./constants"
import { StyleSection } from "./StyleSection"
import { VariantControls } from "./VariantControls"
import { IconPicker } from "./IconPicker"
import { IconStyleControls } from "./IconStyleControls"

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2.5 border-t border-(--border-subtle) px-4 py-4 first:border-t-0">
      <div className="flex items-center gap-1.5">
        <Icon name={icon} size={15} className="text-(--fg-tertiary)" />
        <h3 className="text-2xs font-semibold uppercase tracking-(--tracking-label) text-(--fg-tertiary)">
          {title}
        </h3>
      </div>
      {children}
    </section>
  )
}

export function EditInspector({
  anchor,
  ops,
  onRequestText,
  onPickStyle,
  onClearStyle,
  onHide,
  onPickVariant,
  onPickIcon,
  onPickIconStyle,
  onClose,
}: {
  anchor: PageEditAnchor
  ops: PageEditOp[]
  onRequestText: (anchor: PageEditAnchor) => void
  onPickStyle: (anchor: PageEditAnchor, prop: string, cssValue: string) => void
  onClearStyle: (anchor: PageEditAnchor, prop: string) => void
  onHide: (anchor: PageEditAnchor, mode: "hide" | "remove") => void
  onPickVariant: (
    rootAnchor: PageEditAnchor,
    axis: VariantAxis,
    value: string,
  ) => void
  onPickIcon: (anchor: PageEditAnchor, name: string, prevName?: string) => void
  onPickIconStyle: (anchor: PageEditAnchor, variation: IconVariation) => void
  onClose: () => void
}) {
  const info = React.useMemo(() => {
    const el = resolveEditElement(anchor)
    if (!el) {
      return {
        label: anchor.component ?? "Elemento",
        canEditText: false,
        isIcon: false,
        currentIcon: "",
        comp: null as ReturnType<typeof detectComponent>,
        rootAnchor: null as PageEditAnchor | null,
        isComponentRoot: false,
      }
    }
    const isIcon = el.classList.contains("material-symbols-rounded")
    const comp = detectComponent(el)
    return {
      label: comp?.spec.label ?? el.tagName.toLowerCase(),
      canEditText: !isIcon && !!findEditableTextLeaf(el),
      isIcon,
      currentIcon: isIcon ? (el.textContent ?? "").trim() : "",
      comp,
      rootAnchor: comp ? captureEditAnchor(comp.rootEl) : null,
      // The selected element IS the component's root → a direct style override
      // here fights the variant system (off-spec). Inner content isn't flagged.
      isComponentRoot: !!comp && comp.rootEl === el,
    }
    // anchor identity drives re-resolution; ops drive the active highlights.
  }, [anchor])

  const activeStyle = React.useMemo(() => {
    const map: Record<string, string> = {}
    for (const op of ops) {
      if (op.payload.kind === "style" && op.anchor.selector === anchor.selector) {
        map[op.payload.prop] = op.payload.token
      }
    }
    return map
  }, [ops, anchor.selector])

  const variantCurrent = React.useMemo(() => {
    const map: Record<string, string | null> = {}
    if (!info.comp || !info.rootAnchor) return map
    for (const axis of info.comp.spec.axes) {
      const override = ops.find(
        (o) =>
          o.payload.kind === "variant" &&
          o.anchor.selector === info.rootAnchor!.selector &&
          o.payload.axis === axis.key,
      )
      map[axis.key] =
        override && override.payload.kind === "variant"
          ? override.payload.value
          : currentAxisValue(info.comp!.rootEl, axis)
    }
    return map
  }, [ops, info])

  const iconVariation = React.useMemo<IconVariation | null>(() => {
    if (!info.isIcon) return null
    const op = ops.find(
      (o) =>
        o.payload.kind === "iconStyle" && o.anchor.selector === anchor.selector,
    )
    if (op && op.payload.kind === "iconStyle") {
      const { fill, weight, grade, opticalSize } = op.payload
      return { fill, weight, grade, opticalSize }
    }
    const el = resolveEditElement(anchor)
    return el ? readIconVariation(el) : null
  }, [info.isIcon, ops, anchor])

  // Divergence: a direct style override on a component ROOT fights its variants.
  const offSpecActive =
    info.isComponentRoot && Object.keys(activeStyle).length > 0

  return (
    <aside
      {...{ [EDIT_OVERLAY_DATA_ATTR]: "inspector" }}
      className="fixed right-4 top-4 bottom-4 flex w-[320px] flex-col overflow-hidden rounded-(--radius-xl) border border-(--border-subtle) bg-(--bg-raised) shadow-lg"
      style={{ zIndex: EDIT_Z.inspector }}
    >
      <header className="flex items-center justify-between gap-2 border-b border-(--border-subtle) px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-(--radius-md) bg-(--bg-inverse) text-(--fg-on-inverse)">
            <Icon
              name={info.isIcon ? "category" : info.comp ? "widgets" : "edit"}
              size={15}
              fill={1}
            />
            {offSpecActive && (
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-(--accent-warning) ring-2 ring-(--bg-raised)"
              />
            )}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate body-sm font-semibold text-(--fg-primary)">
              {info.label}
            </span>
            <span className="truncate text-2xs text-(--fg-tertiary)">
              {info.comp ? "Componente" : info.isIcon ? "Ícone" : "Elemento"}
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar inspetor"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-(--fg-tertiary) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
        >
          <Icon name="close" size={16} />
        </button>
      </header>

      {offSpecActive && (
        <div className="border-b border-(--border-subtle) px-4 py-3">
          <AwAlert variant="warning">
            <span className="body-xs text-(--fg-secondary)">
              Você está estilizando direto o{" "}
              <strong className="font-semibold text-(--fg-primary)">
                {info.label}
              </strong>{" "}
              — isso foge da variante do componente e vai destoar do padrão.
              Quando der, prefira uma variante.
            </span>
          </AwAlert>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Conteúdo / texto */}
        {!info.isIcon && (
          <Section title="Conteúdo" icon="text_fields">
            <button
              type="button"
              disabled={!info.canEditText}
              onClick={() => onRequestText(anchor)}
              className="flex items-center gap-2 rounded-(--radius-md) border border-(--border-default) px-3 py-2 text-left body-sm text-(--fg-primary) transition-colors hover:bg-(--bg-hover) disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="edit" size={16} className="text-(--fg-secondary)" />
              {info.canEditText ? "Editar texto" : "Sem texto editável aqui"}
            </button>
          </Section>
        )}

        {/* Variantes */}
        {info.comp && info.rootAnchor && (
          <Section title={`Variantes · ${info.comp.spec.label}`} icon="tune">
            <VariantControls
              spec={info.comp.spec}
              current={variantCurrent}
              onPick={(axis, value) => onPickVariant(info.rootAnchor!, axis, value)}
            />
          </Section>
        )}

        {/* Ícone */}
        {info.isIcon && (
          <Section title="Ícone" icon="emoji_symbols">
            <IconPicker
              current={info.currentIcon}
              onPick={(name) => onPickIcon(anchor, name, info.currentIcon)}
            />
            {iconVariation && (
              <IconStyleControls
                current={iconVariation}
                onPick={(v) => onPickIconStyle(anchor, v)}
              />
            )}
            <p className="text-2xs text-(--fg-tertiary)">
              A cor do ícone fica na seção{" "}
              <strong className="font-medium text-(--fg-secondary)">Cor</strong>.
            </p>
          </Section>
        )}

        {/* Estilo (tokens) — Cor / Forma / Espaçamento, cada um flat na sua seção */}
        <Section title="Cor" icon="palette">
          <StyleSection
            only={["color"]}
            activeStyle={activeStyle}
            onPick={(prop, cssValue) => onPickStyle(anchor, prop, cssValue)}
            onClear={(prop) => onClearStyle(anchor, prop)}
          />
        </Section>

        <Section title="Forma" icon="rounded_corner">
          <StyleSection
            only={["radius", "shadow"]}
            activeStyle={activeStyle}
            onPick={(prop, cssValue) => onPickStyle(anchor, prop, cssValue)}
            onClear={(prop) => onClearStyle(anchor, prop)}
          />
        </Section>

        <Section title="Espaçamento" icon="padding">
          <StyleSection
            only={["spacing"]}
            activeStyle={activeStyle}
            onPick={(prop, cssValue) => onPickStyle(anchor, prop, cssValue)}
            onClear={(prop) => onClearStyle(anchor, prop)}
          />
        </Section>

        {/* Visibilidade */}
        <Section title="Visibilidade" icon="visibility">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onHide(anchor, "hide")}
              className="flex flex-1 items-center justify-center gap-2 rounded-(--radius-md) border border-(--border-default) px-3 py-2 body-sm text-(--fg-primary) transition-colors hover:bg-(--bg-hover)"
            >
              <Icon name="visibility_off" size={16} className="text-(--fg-secondary)" />
              Ocultar
            </button>
            <button
              type="button"
              onClick={() => onHide(anchor, "remove")}
              className="flex flex-1 items-center justify-center gap-2 rounded-(--radius-md) border border-(--border-default) px-3 py-2 body-sm text-(--accent-danger) transition-colors hover:bg-(--bg-hover)"
            >
              <Icon name="delete" size={16} />
              Deletar
            </button>
          </div>
        </Section>
      </div>
    </aside>
  )
}
