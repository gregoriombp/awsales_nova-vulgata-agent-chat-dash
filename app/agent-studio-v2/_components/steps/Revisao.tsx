"use client"

import * as React from "react"
import { Icon } from "../icons"
import { Button, StepHeader } from "../primitives"
import type { AgentDraft } from "../types"
import { CHANNELS } from "./Canais"
import { SKILL_CATALOG } from "./Habilidades"

export function RevisaoStep({
  agent,
  setAgent,
}: {
  agent: AgentDraft
  setAgent: (a: AgentDraft) => void
}) {
  const skillNames = (agent.skills || [])
    .map((id) => SKILL_CATALOG.find((s) => s.id === id)?.name)
    .filter((s): s is string => Boolean(s))
  const channelObjs = (agent.channels || [])
    .map((id) => CHANNELS.find((c) => c.id === id))
    .filter((c): c is (typeof CHANNELS)[number] => Boolean(c))

  return (
    <div
      className="as2-fadein"
      style={{ maxWidth: 980, margin: "0 auto", padding: "48px 32px 96px" }}
    >
      <StepHeader
        eyebrow="Passo 5 · Revisão"
        title="Tudo certo antes de publicar?"
        desc="Revise cada bloco do agente. Clique em editar para voltar ao passo correspondente."
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginTop: 32,
        }}
      >
        <SummaryBlock
          icon="target"
          step="1"
          title="Objetivo"
          onEdit={() => setAgent({ ...agent, _jumpTo: "objetivo" })}
          rows={[
            { k: "Nome", v: agent.name || "—" },
            { k: "Objetivo", v: agent.objective || "—" },
            { k: "Público", v: agent.audience || "—" },
            { k: "KPI", v: agent.kpi || "—" },
            { k: "Tom", v: (agent.tones || []).join(", ") || "—" },
          ]}
        />
        <SummaryBlock
          icon="memory"
          step="2"
          title="Agente core & prompt"
          onEdit={() => setAgent({ ...agent, _jumpTo: "core" })}
          rows={[
            { k: "Core", v: agent.core || "Sales SDR Assistant" },
            { k: "Modelo", v: agent.model || "Claude Sonnet 4.5" },
            { k: "Checkpoint", v: agent.checkpoint || "v0.1 — rascunho" },
            { k: "Prompt", v: `${(agent.prompt || "").length} caracteres` },
          ]}
        />
        <SummaryBlock
          icon="extension"
          step="3"
          title="Habilidades"
          onEdit={() => setAgent({ ...agent, _jumpTo: "habilidades" })}
          rows={
            skillNames.length
              ? [
                  {
                    k: `${skillNames.length} habilidades`,
                    v: skillNames.join(" · "),
                  },
                ]
              : [{ k: "Nenhuma selecionada", v: "—" }]
          }
        />
        <SummaryBlock
          icon="hub"
          step="4"
          title="Canais"
          onEdit={() => setAgent({ ...agent, _jumpTo: "canais" })}
          rows={
            channelObjs.length
              ? [
                  {
                    k: `${channelObjs.length} canais`,
                    v: channelObjs.map((c) => c.name).join(" · "),
                  },
                ]
              : [{ k: "Nenhum canal", v: "—" }]
          }
        />
      </div>

      <div
        style={{
          marginTop: 32,
          padding: 20,
          borderRadius: 14,
          background: "var(--aw-gray-1200)",
          color: "var(--aw-white)",
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            flexShrink: 0,
            background: "rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="shield" size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 14, fontWeight: 500 }}>
            Agente vai operar em modo &ldquo;Revisão humana&rdquo; nas primeiras
            48h
          </strong>
          <p
            style={{
              fontSize: 13,
              color: "var(--aw-gray-400)",
              lineHeight: 1.5,
              margin: "6px 0 0",
            }}
          >
            Toda resposta gerada precisará de aprovação antes de ser enviada ao
            cliente. Você pode desativar isso a qualquer momento nas
            configurações.
          </p>
        </div>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            defaultChecked
            style={{ width: 16, height: 16, accentColor: "var(--aw-white)" }}
          />
          <span style={{ fontSize: 12, color: "var(--aw-gray-400)" }}>
            Ativar
          </span>
        </label>
      </div>
    </div>
  )
}

function SummaryBlock({
  icon,
  step,
  title,
  rows,
  onEdit,
}: {
  icon: string
  step: string
  title: string
  rows: { k: string; v: string }[]
  onEdit: () => void
}) {
  return (
    <div
      style={{
        border: "1px solid var(--aw-gray-200)",
        borderRadius: 14,
        background: "var(--aw-white)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 20px",
          borderBottom: "1px solid var(--aw-gray-200)",
          background: "var(--aw-gray-150)",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: "var(--aw-gray-1200)",
            color: "var(--aw-white)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={icon} size={18} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 0.06,
              textTransform: "uppercase",
              color: "var(--aw-gray-700)",
            }}
          >
            Passo {step}
          </span>
          <strong style={{ fontSize: 15, fontWeight: 500 }}>{title}</strong>
        </div>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" size="sm" icon="edit" onClick={onEdit}>
          Editar
        </Button>
      </div>
      <div style={{ padding: "4px 20px" }}>
        {rows.map((r, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              padding: "12px 0",
              borderBottom:
                i === rows.length - 1 ? "0" : "1px solid var(--aw-gray-200)",
              alignItems: "baseline",
              gap: 16,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "var(--aw-gray-700)",
                fontWeight: 500,
              }}
            >
              {r.k}
            </span>
            <span
              style={{
                fontSize: 13,
                color: "var(--aw-gray-1200)",
                lineHeight: 1.5,
              }}
            >
              {r.v}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
