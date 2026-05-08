"use client"

import * as React from "react"
import { Icon } from "./icons"

type NavGroup = {
  group: string | null
  items: {
    id: string
    icon: string
    label: string
    badge?: string
  }[]
}

const NAV_STRUCTURE: NavGroup[] = [
  {
    group: null,
    items: [
      { id: "inicio", icon: "home", label: "Início" },
      { id: "dashboard", icon: "space_dashboard", label: "Dashboard" },
      { id: "insights", icon: "bolt", label: "Insights", badge: "Beta" },
    ],
  },
  {
    group: "Agentes",
    items: [
      { id: "studio", icon: "hub", label: "Agent studio" },
      { id: "aprovacoes", icon: "done_all", label: "Aprovações" },
      { id: "disparos", icon: "conversion_path", label: "Disparos" },
    ],
  },
  {
    group: "Fontes",
    items: [
      { id: "memory", icon: "database", label: "Memory base" },
      { id: "aops", icon: "earthquake", label: "AOPs" },
      { id: "biblioteca", icon: "menu_book", label: "Biblioteca" },
      { id: "tools", icon: "build", label: "Habilidades" },
      { id: "integracoes", icon: "extension", label: "Integrações" },
    ],
  },
  {
    group: "Acompanhamento",
    items: [
      { id: "conversas", icon: "forum", label: "Conversas", badge: "3" },
      { id: "playground", icon: "smart_toy", label: "Playground" },
      { id: "historico", icon: "history", label: "Histórico de alterações" },
    ],
  },
  {
    group: null,
    items: [{ id: "config", icon: "tune", label: "Configurações" }],
  },
]

const IMPLEMENTED = new Set(["studio"])

export function Sidebar({
  collapsed,
  onToggle,
  activeId = "studio",
  onSelect,
}: {
  collapsed: boolean
  onToggle: () => void
  activeId?: string
  onSelect?: (id: string, implemented: boolean) => void
}) {
  return (
    <aside
      className={`as2-sidebar${collapsed ? " as2-sidebar--collapsed" : ""}`}
    >
      <div className="as2-sidebar-header">
        {!collapsed ? (
          <>
            <span className="as2-sidebar-logo">AwSales</span>
            <button
              className="as2-sidebar-toggle"
              onClick={onToggle}
              aria-label="Colapsar sidebar"
            >
              <Icon name="menu_open" size={20} />
            </button>
          </>
        ) : (
          <button
            className="as2-sidebar-toggle"
            onClick={onToggle}
            aria-label="Expandir sidebar"
          >
            <Icon name="menu" size={20} />
          </button>
        )}
      </div>

      <div className="as2-org" title="Trocar organização">
        <div className="as2-org-avatar">A</div>
        <div className="as2-org-meta">
          <span className="as2-org-name">AwSales</span>
          <span className="as2-org-role">Organização</span>
        </div>
        <Icon
          name="unfold_more"
          size={16}
          className="as2-org-chev"
          style={{ color: "var(--aw-gray-500)" }}
        />
      </div>

      <nav className="as2-nav">
        {NAV_STRUCTURE.map((grp, gi) => (
          <div className="as2-nav-group" key={gi}>
            {grp.group ? (
              <div className="as2-nav-group-title">{grp.group}</div>
            ) : null}
            {grp.items.map((item) => {
              const active = item.id === activeId
              const impl = IMPLEMENTED.has(item.id)
              return (
                <button
                  key={item.id}
                  className={`as2-nav-item${active ? " is-active" : ""}`}
                  onClick={() => onSelect?.(item.id, impl)}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon name={item.icon} size={20} fill={active} />
                  <span className="as2-nav-label">{item.label}</span>
                  {item.badge ? (
                    <span className="as2-nav-badge">{item.badge}</span>
                  ) : null}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="as2-sidebar-footer">
        <div className="as2-user-pill">
          <div className="as2-user-avatar">GF</div>
          <div className="as2-user-meta">
            <span className="as2-user-name">Germano Faccio</span>
            <span className="as2-user-email">germano@awsales.com</span>
          </div>
          <Icon
            name="unfold_more"
            size={16}
            className="as2-user-chev"
            style={{ color: "var(--aw-gray-500)" }}
          />
        </div>
      </div>
    </aside>
  )
}
