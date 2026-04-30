"use client"

import * as React from "react"
import { Icon } from "../icons"
import { Button, StepHeader } from "../primitives"
import type { AgentDraft } from "../types"

export const SKILL_CATALOG = [
  {
    id: "lead_qual",
    icon: "filter_alt",
    name: "Qualificação de leads",
    desc: "Faz perguntas BANT e classifica o fit do lead.",
    tags: ["Vendas", "IA"],
  },
  {
    id: "schedule",
    icon: "event_available",
    name: "Agendamento de reunião",
    desc: "Consulta agenda e agenda com o vendedor certo.",
    tags: ["Produtividade"],
  },
  {
    id: "kb_answer",
    icon: "menu_book",
    name: "Resposta via base",
    desc: "Busca na base de conhecimento antes de responder.",
    tags: ["Recomendado"],
  },
  {
    id: "crm_update",
    icon: "sync",
    name: "Atualizar CRM",
    desc: "Cria e atualiza registros em HubSpot, Pipedrive e Salesforce.",
    tags: ["CRM"],
  },
  {
    id: "escalate",
    icon: "support_agent",
    name: "Escalonar para humano",
    desc: "Detecta frustração e aciona o time humano com contexto.",
    tags: ["Suporte"],
  },
  {
    id: "summarize",
    icon: "summarize",
    name: "Resumir conversa",
    desc: "Gera resumo estruturado ao final de cada interação.",
    tags: ["IA"],
  },
  {
    id: "sentiment",
    icon: "mood",
    name: "Análise de sentimento",
    desc: "Classifica tom da conversa e ajusta a resposta.",
    tags: ["IA"],
  },
  {
    id: "payments",
    icon: "payments",
    name: "Pagamento e cobrança",
    desc: "Gera links de pagamento e acompanha parcelamentos.",
    tags: ["Financeiro"],
  },
]

export function HabilidadesStep({
  agent,
  setAgent,
}: {
  agent: AgentDraft
  setAgent: (a: AgentDraft) => void
}) {
  const selected = new Set(agent.skills || [])
  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setAgent({ ...agent, skills: [...next] })
  }

  return (
    <div
      className="as2-fadein"
      style={{ maxWidth: 980, margin: "0 auto", padding: "48px 32px 96px" }}
    >
      <StepHeader
        eyebrow="Passo 3 · Habilidades"
        title="O que este agente sabe fazer?"
        desc="Habilidades são blocos de capacidade. Cada uma traz ferramentas, integrações e regras próprias — combine-as livremente."
      />

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 24,
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1, maxWidth: 420 }}>
          <Icon
            name="search"
            size={16}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--aw-gray-600)",
            }}
          />
          <input
            className="as2-input"
            placeholder="Buscar habilidades..."
            style={{ paddingLeft: 36, height: 40 }}
          />
        </div>
        <Button icon="tune">Avançado</Button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--aw-gray-700)" }}>
          <strong style={{ color: "var(--aw-gray-1200)", fontWeight: 600 }}>
            {selected.size}
          </strong>{" "}
          de {SKILL_CATALOG.length} selecionadas
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
          marginTop: 20,
        }}
      >
        {SKILL_CATALOG.map((s) => {
          const picked = selected.has(s.id)
          return (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              style={{
                textAlign: "left",
                padding: 18,
                border: `1px solid ${picked ? "var(--aw-gray-1200)" : "var(--aw-gray-200)"}`,
                borderRadius: 14,
                background: picked ? "var(--aw-gray-1200)" : "var(--aw-white)",
                color: picked ? "var(--aw-white)" : "var(--aw-gray-1200)",
                cursor: "pointer",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                transition: "all 120ms ease",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: picked
                    ? "rgba(255,255,255,0.12)"
                    : "var(--aw-gray-150)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name={s.icon} size={20} />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  flex: 1,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <strong style={{ fontSize: 14, fontWeight: 500 }}>
                    {s.name}
                  </strong>
                  {s.tags.includes("Recomendado") ? (
                    <span
                      style={{
                        fontSize: 9,
                        letterSpacing: 0.06,
                        textTransform: "uppercase",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontWeight: 600,
                        background: picked
                          ? "rgba(255,255,255,0.15)"
                          : "var(--aw-blue-100)",
                        color: picked ? "var(--aw-white)" : "var(--aw-blue-700)",
                      }}
                    >
                      Recomendado
                    </span>
                  ) : null}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: picked ? "var(--aw-gray-400)" : "var(--aw-gray-700)",
                    lineHeight: 1.45,
                  }}
                >
                  {s.desc}
                </span>
              </div>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: `1.5px solid ${picked ? "var(--aw-white)" : "var(--aw-gray-400)"}`,
                  background: picked ? "var(--aw-white)" : "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {picked ? (
                  <Icon
                    name="check"
                    size={14}
                    style={{ color: "var(--aw-gray-1200)" }}
                  />
                ) : null}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
