"use client"

import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { AwDropdownMenu, type AwDropdownItem } from "@/components/ui/AwDropdownMenu"
import { useReviewStore } from "@/lib/bombardier-review/store"
import { useCommentsForUrl, useCurrentUrl } from "@/lib/bombardier-review/hooks"
import { useStopDismiss } from "@/lib/bombardier-review/useStopDismiss"
import { OVERLAY_DATA_ATTR, REVIEW_Z } from "./constants"
import { ReviewAvatar } from "./ReviewAvatar"
import { ModeFamilySwitch } from "@/components/bombardier/ModeFamilySwitch"
import type { ReviewMode } from "./types"

// Espelha os tokens de motion do globals.css (--dur-slow + --ease-out) pra a
// barra alargar/encolher na largura no mesmo idioma do DS.
const EXPAND_EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)"
const EXPAND_MS = 300

type ModeButtonProps = {
  mode: ReviewMode
  icon: string
  label: string
  shortcut?: string
}

function ModeButton({ mode, icon, label, shortcut }: ModeButtonProps) {
  const current = useReviewStore((s) => s.mode)
  const setMode = useReviewStore((s) => s.setMode)
  const active = current === mode
  return (
    <button
      type="button"
      onClick={() => setMode(mode)}
      aria-label={label}
      aria-pressed={active}
      title={shortcut ? `${label} · ${shortcut}` : label}
      className={[
        "h-8 w-8 inline-flex items-center justify-center rounded-full transition-colors",
        active
          ? "bg-(--bg-inverse) text-(--fg-on-inverse)"
          : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
      ].join(" ")}
    >
      <Icon name={icon} size={16} />
    </button>
  )
}

// Ponteiro mágico: localiza elementos/divs no hover (ver ReviewMagicCursor) e
// ancora o pino ao elemento, reduzindo o drift. Estado ativo ganha um gradiente
// AI (tokens AwSales) pra se distinguir dos modos comuns.
function MagicModeButton() {
  const active = useReviewStore((s) => s.mode === "magic")
  const setMode = useReviewStore((s) => s.setMode)
  return (
    <button
      type="button"
      onClick={() => setMode("magic")}
      aria-label="Ponteiro mágico"
      aria-pressed={active}
      title="Ponteiro mágico · localiza elementos"
      className={[
        "h-8 w-8 inline-flex items-center justify-center rounded-full transition-colors",
        active
          ? "text-(--fg-on-inverse)"
          : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
      ].join(" ")}
      style={
        active
          ? {
              background:
                "linear-gradient(115deg, var(--aw-blue-600), var(--aw-purple-600), var(--aw-pink-600))",
            }
          : undefined
      }
    >
      <Icon name="auto_awesome" size={16} fill={active ? 1 : 0} />
    </button>
  )
}

// Menu da bolota (avatar): troca de conta de revisão / adiciona uma nova.
function AccountAvatarMenu() {
  const identity = useReviewStore((s) => s.identity)
  const accounts = useReviewStore((s) => s.accounts)
  const switchIdentity = useReviewStore((s) => s.switchIdentity)
  const addAccount = useReviewStore((s) => s.addAccount)
  const openIdentityModal = useReviewStore((s) => s.openIdentityModal)

  // Controlado e aberto no CLIQUE (não no pointerdown do Radix): a toolbar
  // intercepta o pointerdown (useStopDismiss) pra não dismissar diálogos, o que
  // engoliria o gatilho padrão do Radix. O clique passa normalmente.
  const [open, setOpen] = React.useState(false)

  if (!identity) return null

  const items: AwDropdownItem[] = [
    { id: "hdr", isLabel: true, label: "Conta de revisão" },
    ...accounts.map((a) => ({
      id: a.id,
      label: a.name,
      checked: a.id === identity.id,
      onSelect: () => void switchIdentity(a.id),
    })),
    { id: "sep", separator: true },
    {
      id: "edit",
      label: "Editar conta atual",
      icon: "edit",
      onSelect: () => openIdentityModal("edit"),
    },
    {
      id: "add",
      label: "Adicionar nova conta",
      icon: "person_add",
      onSelect: () => addAccount(),
    },
  ]

  return (
    <AwDropdownMenu
      side="top"
      align="center"
      sideOffset={10}
      aria-label="Conta de revisão"
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={`Conta: ${identity.name} · trocar`}
          title="Conta de revisão"
          className="mr-0.5 inline-flex rounded-full transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--border-strong)"
        >
          <ReviewAvatar
            authorId={identity.id}
            authorName={identity.name}
            colorToken={identity.colorToken}
            size={28}
          />
        </button>
      }
      items={items}
    />
  )
}

export function ReviewToolbar() {
  const active = useReviewStore((s) => s.active)
  const identity = useReviewStore((s) => s.identity)
  const sheetOpen = useReviewStore((s) => s.sheetOpen)
  const toggleSheet = useReviewStore((s) => s.toggleSheet)
  const toggleActive = useReviewStore((s) => s.toggleActive)
  const setExportOpen = useReviewStore((s) => s.setExportOpen)
  const allComments = useReviewStore((s) => s.comments)

  const url = useCurrentUrl()
  const pageComments = useCommentsForUrl(url)
  const openCount = pageComments.filter((c) => c.status === "open").length
  const inReviewCount = allComments.filter((c) => c.status === "in_review").length
  const stopDismiss = useStopDismiss<HTMLDivElement>()

  // A pílula e a barra ficam ambas montadas (sobrepostas, absolutas) e a gente
  // mede a largura natural de cada uma; a casca anima só a `width` entre elas —
  // por isso "alarga/encolhe" horizontalmente, sem distorcer o conteúdo nem
  // subir de baixo. O conteúdo faz crossfade de opacidade.
  const pillRef = React.useRef<HTMLDivElement>(null)
  const barRef = React.useRef<HTMLDivElement>(null)
  const [widths, setWidths] = React.useState<{ pill: number; bar: number } | null>(
    null
  )

  React.useLayoutEffect(() => {
    if (pillRef.current && barRef.current) {
      setWidths({
        pill: pillRef.current.offsetWidth,
        bar: barRef.current.offsetWidth,
      })
    }
  }, [identity, openCount, inReviewCount])

  const target = widths ? (active ? widths.bar : widths.pill) : undefined

  return (
    <div
      {...{ [OVERLAY_DATA_ATTR]: "" }}
      ref={stopDismiss}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
      style={{ zIndex: REVIEW_Z.toolbar }}
    >
      <div
        className={[
          "pointer-events-auto relative h-11 rounded-full overflow-hidden bg-(--bg-raised) shadow-lg",
          active ? "ring-1 ring-(--border-subtle)" : "",
        ].join(" ")}
        style={{
          width: target != null ? target : "auto",
          transitionProperty: "width",
          transitionDuration: `${EXPAND_MS}ms`,
          transitionTimingFunction: EXPAND_EASE,
        }}
      >
        {/* BARRA expandida — define a largura aberta (medida via barRef). */}
        <div
          ref={barRef}
          aria-hidden={!active}
          className={[
            "absolute inset-y-0 left-0 flex items-center gap-1 px-1.5 whitespace-nowrap transition-opacity",
            active ? "opacity-100" : "opacity-0 pointer-events-none",
          ].join(" ")}
          style={{ transitionDuration: "150ms", transitionTimingFunction: EXPAND_EASE }}
        >
          <ModeFamilySwitch current="review" />

          <span className="h-5 w-px bg-(--border-subtle)" />

          <AccountAvatarMenu />

          <span className="h-5 w-px bg-(--border-subtle)" />

          <ModeButton mode="cursor" icon="arrow_selector_tool" label="Cursor" />
          <ModeButton
            mode="draw"
            icon="draw"
            label="Marcação livre"
            shortcut="⌘⇧K"
          />
          <ModeButton mode="pin" icon="location_on" label="Pino" />
          <MagicModeButton />

          <span className="h-5 w-px bg-(--border-subtle)" />

          <button
            type="button"
            onClick={toggleSheet}
            aria-label={
              inReviewCount > 0
                ? `Comentários · ${inReviewCount} em revisão`
                : "Comentários desta tela"
            }
            aria-pressed={sheetOpen}
            title={
              inReviewCount > 0
                ? `Comentários · ${inReviewCount} em revisão`
                : "Comentários desta tela"
            }
            className={[
              "relative h-8 inline-flex items-center gap-1 px-2 rounded-full transition-colors",
              sheetOpen
                ? "bg-(--bg-inverse) text-(--fg-on-inverse)"
                : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
            ].join(" ")}
          >
            <Icon name="forum" size={16} />
            {openCount > 0 && (
              <span className="body-xs font-semibold tabular-nums">
                {openCount}
              </span>
            )}
            {inReviewCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-4 h-4 px-1 inline-flex items-center justify-center rounded-full body-xs font-semibold tabular-nums bg-(--aw-amber-500) text-(--fg-on-inverse) ring-2 ring-(--bg-raised)"
                aria-hidden="true"
              >
                {inReviewCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setExportOpen(true)}
            aria-label="Exportar comentários"
            title="Exportar JSON"
            className="h-8 w-8 inline-flex items-center justify-center rounded-full text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
          >
            <Icon name="ios_share" size={16} />
          </button>

          <span className="h-5 w-px bg-(--border-subtle)" />

          <button
            type="button"
            onClick={toggleActive}
            aria-label="Fechar Review Mode"
            title="Fechar (⌘⇧Y)"
            className="h-8 w-8 inline-flex items-center justify-center rounded-full text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* PÍLULA recolhida — overlay mostrado quando inativo (medida via pillRef). */}
        <div
          ref={pillRef}
          aria-hidden={active}
          className={[
            "absolute inset-y-0 left-0 transition-opacity",
            active ? "opacity-0 pointer-events-none" : "opacity-100",
          ].join(" ")}
          style={{ transitionDuration: "150ms", transitionTimingFunction: EXPAND_EASE }}
        >
          <button
            type="button"
            onClick={toggleActive}
            aria-label="Abrir Review Mode (⌘⇧Y)"
            title="Review Mode · ⌘⇧Y"
            className="h-full inline-flex items-center gap-2 px-4 whitespace-nowrap bg-(--bg-inverse) text-(--fg-on-inverse) hover:opacity-90 body-xs font-medium"
          >
            <Icon name="rate_review" size={14} />
            Review
          </button>
        </div>
      </div>
    </div>
  )
}
