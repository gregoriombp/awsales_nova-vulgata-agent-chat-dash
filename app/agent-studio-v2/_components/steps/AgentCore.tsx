"use client"

import * as React from "react"
import { Icon, SparkleStar } from "../icons"
import { Avatar, Button, Chip, StepHeader } from "../primitives"
import type { AgentDraft } from "../types"

const DEFAULT_PROMPT = `Você é o Agente de Recuperação de Leads da AwSales.

# Objetivo
Reengajar leads B2B que pararam de responder nos últimos 7 dias e agendar uma reunião com o SDR quando houver sinal real de interesse.

# Tom
- Humano, próximo e consultivo.
- Nunca genérico. Sempre referencie o contexto da última conversa.
- Mensagens curtas (máx. 3 linhas), uma ideia por vez.

# Regras
- Nunca ofereça desconto acima de 10% sem aprovação.
- Se o lead pedir suporte, escale imediatamente ao time correto.
- Não compartilhe informações internas (roadmap, finanças).

# Fluxo
1. Saudação contextual baseada na última interação.
2. Pergunta aberta sobre a dor que o lead mencionou antes.
3. Proposta concreta — sempre um próximo passo claro.
4. Se houver interesse, agendar via tool "Agendamento".`

const CHECKPOINTS = [
  {
    id: "v5",
    label: "v0.5",
    title: "Ajustes de tom pós-feedback",
    author: "Germano",
    date: "Hoje, 14:32",
    active: true,
    score: 92,
  },
  {
    id: "v4",
    label: "v0.4",
    title: "Incluído fluxo de agendamento",
    author: "Germano",
    date: "Ontem, 18:04",
    active: false,
    score: 87,
  },
  {
    id: "v3",
    label: "v0.3",
    title: "Reestruturou sessão de regras",
    author: "Marina",
    date: "14 mar 2026",
    active: false,
    score: 81,
  },
  {
    id: "v2",
    label: "v0.2",
    title: "Primeira iteração pós-wizard",
    author: "IA",
    date: "13 mar 2026",
    active: false,
    score: 74,
  },
  {
    id: "v1",
    label: "v0.1",
    title: "Rascunho gerado pelo Wizard",
    author: "IA",
    date: "13 mar 2026",
    active: false,
    score: 68,
  },
]

export function AgentCoreStep({
  agent,
  setAgent,
}: {
  agent: AgentDraft
  setAgent: (a: AgentDraft) => void
}) {
  const [tab, setTab] = React.useState<"prompt" | "checkpoint">("prompt")
  const prompt = agent.prompt ?? DEFAULT_PROMPT

  return (
    <div
      className="as2-fadein"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div
        style={{
          maxWidth: 1100,
          width: "100%",
          margin: "0 auto",
          padding: "40px 32px 12px",
        }}
      >
        <StepHeader
          eyebrow="Passo 2 · Agente core"
          title="Prompt e versões"
          desc="O prompt é a identidade do agente. Cada alteração gera um checkpoint — você pode comparar e voltar a qualquer versão."
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 28,
            borderBottom: "1px solid var(--aw-gray-200)",
          }}
        >
          {[
            { id: "prompt" as const, label: "Prompt", icon: "description" },
            {
              id: "checkpoint" as const,
              label: "Checkpoints",
              icon: "history",
              badge: CHECKPOINTS.length,
            },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "10px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                border: 0,
                cursor: "pointer",
                borderBottom: `2px solid ${tab === t.id ? "var(--aw-gray-1200)" : "transparent"}`,
                marginBottom: -1,
                color:
                  tab === t.id ? "var(--aw-gray-1200)" : "var(--aw-gray-700)",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
              {"badge" in t && t.badge ? (
                <span
                  style={{
                    background: "var(--aw-gray-200)",
                    color: "var(--aw-gray-800)",
                    padding: "1px 6px",
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {tab === "prompt" ? (
        <PromptTab agent={agent} prompt={prompt} setAgent={setAgent} />
      ) : (
        <CheckpointTab />
      )}
    </div>
  )
}

function PromptTab({
  agent,
  prompt,
  setAgent,
}: {
  agent: AgentDraft
  prompt: string
  setAgent: (a: AgentDraft) => void
}) {
  return (
    <div
      style={{
        maxWidth: 1100,
        width: "100%",
        margin: "0 auto",
        padding: "24px 32px 96px",
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: 24,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <Chip icon="memory">{agent.core || "Sales SDR Assistant"}</Chip>
          <Chip icon="auto_awesome">Claude Sonnet 4.5</Chip>
          <Chip icon="thermostat">Temperatura 0.4</Chip>
          <div style={{ flex: 1 }} />
          <Button size="sm" variant="ghost" icon="auto_fix">
            Sugerir melhorias
          </Button>
          <Button size="sm" variant="ghost" icon="content_copy">
            Copiar
          </Button>
        </div>

        <div
          style={{
            border: "1px solid var(--aw-gray-200)",
            borderRadius: 12,
            background: "var(--aw-white)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 520,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderBottom: "1px solid var(--aw-gray-200)",
              background: "var(--aw-gray-150)",
              fontSize: 11,
              color: "var(--aw-gray-700)",
              fontFamily: "var(--font-mono, ui-monospace, monospace)",
            }}
          >
            <Icon name="description" size={12} /> prompt.md · markdown ·{" "}
            {prompt.length} caracteres
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setAgent({ ...agent, prompt: e.target.value })}
            spellCheck={false}
            style={{
              flex: 1,
              border: 0,
              outline: "none",
              resize: "none",
              padding: 20,
              fontFamily: "var(--font-mono, ui-monospace, monospace)",
              fontSize: 13,
              lineHeight: 1.7,
              color: "var(--aw-gray-1200)",
              background: "transparent",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            border: "1px solid var(--aw-gray-1200)",
            borderRadius: 14,
            background: "var(--aw-gray-1200)",
            color: "var(--aw-white)",
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SparkleStar size={16} color="#fff" />
            <strong style={{ fontSize: 13, fontWeight: 500 }}>
              Assistente de prompt
            </strong>
          </div>
          <p
            style={{
              fontSize: 12,
              color: "var(--aw-gray-400)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Descreva o ajuste que quer. Eu rescrevo seu prompt preservando
            objetivo, tom e regras.
          </p>
          <input
            className="as2-input"
            placeholder="Ex: deixe o tom mais formal"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "var(--aw-white)",
            }}
          />
          <Button variant="primary-on-dark" size="sm" icon="auto_awesome">
            Reescrever
          </Button>
        </div>

        <div
          style={{
            border: "1px solid var(--aw-gray-200)",
            borderRadius: 14,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <strong style={{ fontSize: 13, fontWeight: 500 }}>
            Variáveis disponíveis
          </strong>
          {[
            { k: "{{lead.nome}}", v: "Nome do lead" },
            { k: "{{lead.empresa}}", v: "Empresa do lead" },
            { k: "{{last_interaction}}", v: "Última interação" },
            { k: "{{sdr.nome}}", v: "SDR responsável" },
            { k: "{{kb.buscar(x)}}", v: "Busca na base" },
          ].map((v) => (
            <div
              key={v.k}
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 12,
                gap: 2,
              }}
            >
              <code
                style={{
                  fontFamily: "var(--font-mono, ui-monospace, monospace)",
                  color: "var(--aw-blue-700)",
                  fontSize: 12,
                }}
              >
                {v.k}
              </code>
              <span style={{ color: "var(--aw-gray-700)" }}>{v.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CheckpointTab() {
  return (
    <div
      style={{
        maxWidth: 1100,
        width: "100%",
        margin: "0 auto",
        padding: "24px 32px 96px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: 13,
              color: "var(--aw-gray-700)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Cada edição do prompt cria um checkpoint. O score é calculado com
            base em testes automáticos no Playground.
          </p>
        </div>
        <Button variant="secondary" icon="compare_arrows">
          Comparar
        </Button>
        <Button variant="primary" icon="science">
          Rodar testes
        </Button>
      </div>

      <div
        style={{
          border: "1px solid var(--aw-gray-200)",
          borderRadius: 14,
          background: "var(--aw-white)",
          overflow: "hidden",
        }}
      >
        {CHECKPOINTS.map((c, i) => (
          <div
            key={c.id}
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 160px 140px 80px 120px",
              alignItems: "center",
              padding: "16px 20px",
              borderBottom:
                i === CHECKPOINTS.length - 1
                  ? "0"
                  : "1px solid var(--aw-gray-200)",
              background: c.active ? "var(--aw-gray-150)" : "var(--aw-white)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono, ui-monospace, monospace)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: c.active ? "var(--aw-gray-1200)" : "var(--aw-gray-800)",
                }}
              >
                {c.label}
              </span>
              {c.active ? (
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: 3,
                    fontSize: 9,
                    fontWeight: 600,
                    background: "var(--aw-gray-1200)",
                    color: "var(--aw-white)",
                    letterSpacing: 0.06,
                    textTransform: "uppercase",
                  }}
                >
                  Atual
                </span>
              ) : null}
            </div>
            <div
              style={{
                color: "var(--aw-gray-1200)",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {c.title}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "var(--aw-gray-700)",
              }}
            >
              <Avatar
                name={c.author}
                size={20}
                tone={c.author === "IA" ? "purple" : "blue"}
              />
              {c.author}
            </div>
            <div style={{ fontSize: 12, color: "var(--aw-gray-700)" }}>
              {c.date}
            </div>
            <ScorePill score={c.score} />
            <div style={{ textAlign: "right" }}>
              <Button variant="ghost" size="sm" icon="more_vert">
                {""}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 90
      ? "#1B7F4B"
      : score >= 80
        ? "var(--aw-blue-700)"
        : "var(--aw-gray-700)"
  const bg =
    score >= 90
      ? "#E4F7EC"
      : score >= 80
        ? "var(--aw-blue-100)"
        : "var(--aw-gray-200)"
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 8px",
        borderRadius: 6,
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "var(--font-mono, ui-monospace, monospace)",
      }}
    >
      {score}
    </div>
  )
}

export { DEFAULT_PROMPT }
