"use client"

import * as React from "react"
import { Icon } from "../icons"
import { StepHeader } from "../primitives"
import type { AgentDraft } from "../types"

export const CHANNELS = [
  {
    id: "wa",
    icon: "chat",
    name: "WhatsApp",
    desc: "Mais alto engajamento no B2C brasileiro.",
    connected: true,
  },
  {
    id: "email",
    icon: "mail",
    name: "E-mail",
    desc: "Ideal para follow-up e comunicados formais.",
    connected: true,
  },
  {
    id: "webchat",
    icon: "chat_bubble",
    name: "Chat no site",
    desc: "Captura visitantes do site em tempo real.",
    connected: false,
  },
  {
    id: "voice",
    icon: "call",
    name: "Voz / telefone",
    desc: "Atendimento por telefone com voz sintetizada.",
    connected: false,
  },
  {
    id: "instagram",
    icon: "photo_camera",
    name: "Instagram DM",
    desc: "Conversas a partir de comentários e direct.",
    connected: false,
  },
  {
    id: "sms",
    icon: "sms",
    name: "SMS",
    desc: "Cobertura total, inclusive offline.",
    connected: true,
  },
]

export function CanaisStep({
  agent,
  setAgent,
}: {
  agent: AgentDraft
  setAgent: (a: AgentDraft) => void
}) {
  const selected = new Set(agent.channels || [])
  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setAgent({ ...agent, channels: [...next] })
  }

  return (
    <div
      className="as2-fadein"
      style={{ maxWidth: 980, margin: "0 auto", padding: "48px 32px 96px" }}
    >
      <StepHeader
        eyebrow="Passo 4 · Canais"
        title="Onde o agente vai atuar?"
        desc="Cada canal tem sua própria janela de engajamento e limites. Você pode ativar mais canais depois."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginTop: 32,
        }}
      >
        {CHANNELS.map((c) => {
          const picked = selected.has(c.id)
          return (
            <button
              key={c.id}
              onClick={() => c.connected && toggle(c.id)}
              disabled={!c.connected}
              style={{
                textAlign: "left",
                padding: 20,
                border: `1px solid ${picked ? "var(--aw-gray-1200)" : "var(--aw-gray-200)"}`,
                borderRadius: 14,
                background: picked ? "var(--aw-gray-1200)" : "var(--aw-white)",
                color: picked ? "var(--aw-white)" : "var(--aw-gray-1200)",
                cursor: c.connected ? "pointer" : "not-allowed",
                opacity: c.connected ? 1 : 0.55,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                transition: "all 120ms ease",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: picked
                    ? "rgba(255,255,255,0.12)"
                    : "var(--aw-gray-150)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name={c.icon} size={22} />
              </div>
              <strong style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</strong>
              <span
                style={{
                  fontSize: 12,
                  color: picked ? "var(--aw-gray-400)" : "var(--aw-gray-700)",
                  lineHeight: 1.5,
                }}
              >
                {c.desc}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  marginTop: 4,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: c.connected ? "#34C759" : "var(--aw-gray-500)",
                  }}
                />
                <span
                  style={{
                    color: picked ? "var(--aw-gray-400)" : "var(--aw-gray-700)",
                  }}
                >
                  {c.connected ? "Integração ativa" : "Requer conexão"}
                </span>
              </div>
              {picked ? (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "var(--aw-white)",
                    color: "var(--aw-gray-1200)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="check" size={14} />
                </div>
              ) : null}
            </button>
          )
        })}
      </div>

      <div
        style={{
          marginTop: 32,
          padding: 16,
          borderRadius: 12,
          background: "var(--aw-gray-150)",
          border: "1px solid var(--aw-gray-200)",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <Icon
          name="info"
          size={20}
          style={{ color: "var(--aw-blue-600)", marginTop: 2 }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <strong style={{ fontSize: 13, fontWeight: 500 }}>
            Janela de engajamento WhatsApp
          </strong>
          <span
            style={{
              fontSize: 12,
              color: "var(--aw-gray-700)",
              lineHeight: 1.5,
            }}
          >
            Depois de 24h sem resposta, o agente muda automaticamente para
            template aprovado antes de reabrir a conversa.
          </span>
        </div>
      </div>
    </div>
  )
}
