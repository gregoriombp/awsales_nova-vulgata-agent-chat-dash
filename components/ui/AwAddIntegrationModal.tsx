"use client"

import * as React from "react"
import { AwBrandLogo } from "./AwBrandLogo"
import { AwInput } from "./AwInput"
import { Icon } from "./Icon"

export type AwAddIntegrationCategory = {
  id: string
  label: string
}

export type AwAddIntegrationItem = {
  id: string
  brand: string
  name: string
  description: string
  category: string
}

export type AwAddIntegrationModalProps = {
  open: boolean
  onClose: () => void
  /** Sentinel category id that means "show everything". Defaults to "all". */
  allCategoryId?: string
  /** Sidebar category list, in display order. The "all" entry is prepended automatically. */
  categories: AwAddIntegrationCategory[]
  /** Catalog items. Filtered against the active category and the search term. */
  items: AwAddIntegrationItem[]
  /** Click on a catalog card. */
  onSelect: (id: string) => void
  /** When provided, renders a pinned "Integração personalizada" card. */
  onCustomIntegration?: () => void
  /** Override the custom-card title. */
  customIntegrationLabel?: string
  /** Override the custom-card description. */
  customIntegrationDescription?: string
  title?: string
  /** Sidebar header copy + main heading (defaults to active category label). */
  allCategoryLabel?: string
  searchPlaceholder?: string
  emptyTitle?: string
  emptyDescription?: string
}

export function AwAddIntegrationModal({
  open,
  onClose,
  allCategoryId = "all",
  categories,
  items,
  onSelect,
  onCustomIntegration,
  customIntegrationLabel = "Integração personalizada",
  customIntegrationDescription = "Conecte qualquer API: defina endpoint, autenticação e mapeamento.",
  title = "Adicionar integração",
  allCategoryLabel = "Todas as integrações",
  searchPlaceholder = "Buscar integrações…",
  emptyTitle = "Nenhuma integração encontrada",
  emptyDescription = "Tente outro termo ou troque a categoria.",
}: AwAddIntegrationModalProps) {
  const [activeCat, setActiveCat] = React.useState<string>(allCategoryId)
  const [q, setQ] = React.useState("")

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  React.useEffect(() => {
    if (open) {
      setActiveCat(allCategoryId)
      setQ("")
    }
  }, [open, allCategoryId])

  if (!open) return null

  const activeLabel =
    activeCat === allCategoryId
      ? allCategoryLabel
      : categories.find((c) => c.id === activeCat)?.label ?? allCategoryLabel

  const filtered = items.filter((it) => {
    if (activeCat !== allCategoryId && it.category !== activeCat) return false
    if (!q) return true
    const t = q.toLowerCase()
    return (
      it.name.toLowerCase().includes(t) ||
      it.description.toLowerCase().includes(t)
    )
  })

  const navItems: AwAddIntegrationCategory[] = [
    { id: allCategoryId, label: allCategoryLabel },
    ...categories,
  ]

  return (
    <div
      className="aw-modal-scrim"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="aw-modal aw-add-int-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="aw-add-int-modal__head">
          <div className="aw-add-int-modal__title-row">
            <span className="aw-add-int-modal__title-icon" aria-hidden="true">
              <Icon name="extension" size={20} />
            </span>
            <h2 className="aw-add-int-modal__title">{title}</h2>
          </div>
          <button
            type="button"
            className="aw-modal__close"
            aria-label="Fechar"
            onClick={onClose}
          >
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="aw-add-int-modal__body">
          <nav
            className="aw-add-int-modal__nav"
            aria-label="Categorias de integração"
          >
            <ul className="aw-add-int-modal__nav-list">
              {navItems.map((c) => {
                const active = c.id === activeCat
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={
                        "aw-add-int-modal__nav-item" +
                        (active ? " aw-add-int-modal__nav-item--active" : "")
                      }
                      onClick={() => setActiveCat(c.id)}
                    >
                      {c.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <section className="aw-add-int-modal__main">
            <div className="aw-add-int-modal__main-head">
              <h3 className="aw-add-int-modal__main-title">{activeLabel}</h3>
              <AwInput
                dense
                iconLeft="search"
                placeholder={searchPlaceholder}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Buscar integração"
                className="aw-add-int-modal__search"
              />
            </div>

            {filtered.length === 0 && !(onCustomIntegration && !q) ? (
              <div className="aw-add-int-modal__empty">
                <Icon name="search_off" size={24} />
                <div className="aw-add-int-modal__empty-title">{emptyTitle}</div>
                <div className="aw-add-int-modal__empty-desc">
                  {emptyDescription}
                </div>
              </div>
            ) : (
              <div className="aw-add-int-modal__grid">
                {filtered.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    className="aw-add-int-modal__card"
                    onClick={() => onSelect(it.id)}
                  >
                    <span className="aw-add-int-modal__card-logo">
                      <AwBrandLogo brand={it.brand} size="md" />
                    </span>
                    <span className="aw-add-int-modal__card-name">
                      {it.name}
                    </span>
                    <span className="aw-add-int-modal__card-desc">
                      {it.description}
                    </span>
                  </button>
                ))}
                {onCustomIntegration && !q && (
                  <button
                    type="button"
                    className="aw-add-int-modal__card aw-add-int-modal__card--custom"
                    onClick={onCustomIntegration}
                  >
                    <span className="aw-add-int-modal__card-logo aw-add-int-modal__card-logo--custom">
                      <Icon name="dashboard_customize" size={22} />
                    </span>
                    <span className="aw-add-int-modal__card-name">
                      {customIntegrationLabel}
                    </span>
                    <span className="aw-add-int-modal__card-desc">
                      {customIntegrationDescription}
                    </span>
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
