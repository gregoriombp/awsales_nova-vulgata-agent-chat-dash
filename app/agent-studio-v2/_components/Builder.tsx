"use client"

import * as React from "react"
import { Icon } from "./icons"
import { Button } from "./primitives"
import { BUILDER_STEPS, type AgentDraft, type StepId } from "./types"

export function BuilderShell({
  stepId,
  onStep,
  agent,
  onBack,
  onSave,
  onContinue,
  continueLabel = "Continuar",
  continueDisabled,
  children,
}: {
  stepId: StepId
  onStep: (id: StepId) => void
  agent: AgentDraft
  onBack: () => void
  onSave: () => void
  onContinue: () => void
  continueLabel?: string
  continueDisabled?: boolean
  children: React.ReactNode
}) {
  const idx = BUILDER_STEPS.findIndex((s) => s.id === stepId)
  const isLast = idx === BUILDER_STEPS.length - 1

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--aw-white)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 32px",
          borderBottom: "1px solid var(--aw-gray-200)",
          background: "var(--aw-white)",
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: 0,
            cursor: "pointer",
            color: "var(--aw-gray-700)",
            fontSize: 13,
            fontWeight: 500,
            padding: "6px 10px",
            borderRadius: 6,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--aw-gray-150)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <Icon name="arrow_back" size={16} /> Sair
        </button>
        <div style={{ width: 1, height: 20, background: "var(--aw-gray-300)" }} />
        <div style={{ fontSize: 13, color: "var(--aw-gray-700)" }}>
          Criando{" "}
          <strong style={{ color: "var(--aw-gray-1200)", fontWeight: 500 }}>
            {agent?.name || "novo agente"}
          </strong>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {BUILDER_STEPS.map((s, i) => {
            const done = i < idx
            const current = i === idx
            return (
              <React.Fragment key={s.id}>
                {i > 0 ? (
                  <div
                    style={{
                      width: 22,
                      height: 1,
                      background: done
                        ? "var(--aw-gray-1200)"
                        : "var(--aw-gray-300)",
                    }}
                  />
                ) : null}
                <button
                  onClick={() => onStep(s.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: current ? "6px 12px 6px 6px" : 6,
                    borderRadius: 20,
                    background: current ? "var(--aw-gray-1200)" : "transparent",
                    color: current
                      ? "var(--aw-white)"
                      : done
                        ? "var(--aw-gray-1200)"
                        : "var(--aw-gray-600)",
                    border: 0,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background 120ms ease, color 120ms ease",
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: current
                        ? "var(--aw-white)"
                        : done
                          ? "var(--aw-gray-1200)"
                          : "var(--aw-gray-200)",
                      color: current
                        ? "var(--aw-gray-1200)"
                        : done
                          ? "var(--aw-white)"
                          : "var(--aw-gray-700)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {done ? <Icon name="check" size={12} /> : s.num}
                  </span>
                  {current ? <span>{s.label}</span> : null}
                </button>
              </React.Fragment>
            )
          })}
        </div>

        <div style={{ flex: 1 }} />

        <Button variant="ghost" icon="save" onClick={onSave}>
          Salvar rascunho
        </Button>
        <Button
          variant="primary"
          iconRight={isLast ? "rocket_launch" : "arrow_forward"}
          disabled={continueDisabled}
          onClick={onContinue}
        >
          {continueLabel}
        </Button>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
    </div>
  )
}
