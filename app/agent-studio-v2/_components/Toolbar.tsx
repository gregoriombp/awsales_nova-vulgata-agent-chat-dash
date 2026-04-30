"use client"

import * as React from "react"
import { Icon, ToolbarBall } from "./icons"

export function Toolbar({
  breadcrumb = [],
  onDark = false,
}: {
  breadcrumb?: string[]
  onDark?: boolean
}) {
  return (
    <div className="as2-toolbar">
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
        {breadcrumb.length > 0 ? (
          breadcrumb.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 ? (
                <Icon
                  name="chevron_right"
                  size={16}
                  style={{
                    color: onDark ? "var(--aw-gray-700)" : "var(--aw-gray-500)",
                  }}
                />
              ) : null}
              <span
                style={{
                  color:
                    i === breadcrumb.length - 1
                      ? onDark
                        ? "var(--aw-white)"
                        : "var(--aw-gray-1200)"
                      : "var(--aw-gray-600)",
                  fontWeight: i === breadcrumb.length - 1 ? 500 : 400,
                }}
              >
                {crumb}
              </span>
            </React.Fragment>
          ))
        ) : (
          <span style={{ opacity: 0.6 }}>Início</span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button className="as2-toolbar-iconbtn" title="Buscar (⌘K)" aria-label="Buscar">
          <Icon name="search" size={20} />
        </button>
        <button
          className="as2-toolbar-iconbtn"
          title="Notificações"
          aria-label="Notificações"
          style={{ position: "relative" }}
        >
          <Icon name="notifications" size={20} />
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--accent-brand, #2F76E6)",
              border: "2px solid var(--aw-white)",
            }}
          />
        </button>
        <button className="as2-toolbar-iconbtn" title="Ajuda" aria-label="Ajuda">
          <Icon name="help" size={20} />
        </button>
        <ToolbarBall size={22} />
      </div>
    </div>
  )
}
