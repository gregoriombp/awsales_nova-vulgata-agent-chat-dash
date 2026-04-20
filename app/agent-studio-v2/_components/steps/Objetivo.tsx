"use client"

import * as React from "react"
import { FieldGroup, StepHeader } from "../primitives"
import type { AgentDraft } from "../types"

const TONES = [
  "Humano e próximo",
  "Consultivo",
  "Direto",
  "Formal",
  "Divertido",
  "Técnico",
]

export function ObjetivoStep({
  agent,
  setAgent,
}: {
  agent: AgentDraft
  setAgent: (a: AgentDraft) => void
}) {
  const update = (patch: Partial<AgentDraft>) => setAgent({ ...agent, ...patch })

  return (
    <div
      className="as2-fadein"
      style={{ maxWidth: 780, margin: "0 auto", padding: "48px 32px 96px" }}
    >
      <StepHeader
        eyebrow="Passo 1 · Objetivo"
        title="Qual o propósito deste agente?"
        desc="Um bom objetivo é específico, mensurável e descreve o resultado para o cliente final. Isso guia o prompt e as respostas do agente."
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          marginTop: 32,
        }}
      >
        <FieldGroup
          label="Nome do agente"
          hint="Aparece nos logs, dashboards e no cabeçalho de conversas."
        >
          <input
            className="as2-input"
            placeholder="Ex: Agente de Recuperação de Leads"
            value={agent.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </FieldGroup>

        <FieldGroup
          label="Objetivo principal"
          hint="O que este agente deve alcançar? Use verbos de resultado."
        >
          <textarea
            className="as2-textarea"
            rows={3}
            placeholder="Ex: Recuperar leads que não responderam em 7 dias, reengajando via WhatsApp e agendando reunião com o SDR quando o lead mostrar interesse."
            value={agent.objective}
            onChange={(e) => update({ objective: e.target.value })}
          />
        </FieldGroup>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <FieldGroup label="Público-alvo">
            <input
              className="as2-input"
              placeholder="Ex: Leads B2B SaaS, decisores"
              value={agent.audience}
              onChange={(e) => update({ audience: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup label="KPI principal">
            <select
              className="as2-input"
              value={agent.kpi}
              onChange={(e) => update({ kpi: e.target.value })}
            >
              <option>Taxa de resposta</option>
              <option>Reuniões agendadas</option>
              <option>Tempo médio até conversão</option>
              <option>NPS pós-interação</option>
              <option>Ticket médio</option>
            </select>
          </FieldGroup>
        </div>

        <FieldGroup
          label="Tom de voz"
          hint="Define como o agente fala com o público. Você pode ajustar depois."
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TONES.map((tone) => {
              const picked = agent.tones?.includes(tone)
              return (
                <button
                  key={tone}
                  onClick={() => {
                    const set = new Set(agent.tones || [])
                    if (set.has(tone)) set.delete(tone)
                    else set.add(tone)
                    update({ tones: [...set] })
                  }}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 20,
                    border: `1px solid ${picked ? "var(--aw-gray-1200)" : "var(--aw-gray-300)"}`,
                    background: picked
                      ? "var(--aw-gray-1200)"
                      : "var(--aw-white)",
                    color: picked ? "var(--aw-white)" : "var(--aw-gray-1200)",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 120ms ease",
                  }}
                >
                  {tone}
                </button>
              )
            })}
          </div>
        </FieldGroup>

        <FieldGroup
          label="Limites e restrições"
          hint="O que este agente NÃO deve fazer. Use linhas separadas."
        >
          <textarea
            className="as2-textarea"
            rows={4}
            placeholder={`Ex: Nunca oferecer desconto acima de 10%\nNão tratar questões de faturamento (escalar ao time financeiro)\nNão compartilhar informações internas`}
            value={agent.constraints}
            onChange={(e) => update({ constraints: e.target.value })}
          />
        </FieldGroup>
      </div>
    </div>
  )
}
