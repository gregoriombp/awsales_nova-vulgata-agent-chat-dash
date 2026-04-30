"use client"

import * as React from "react"
import { Icon } from "./icons"
import { Button, GradientMesh, Kbd, SparkleGroup } from "./primitives"

type Template = {
  id: string
  icon: string
  name: string
  desc: string
}

const TEMPLATE_LIBRARY: Template[] = [
  {
    id: "sdr",
    icon: "target",
    name: "Recuperação de leads",
    desc: "SDR que reengaja oportunidades perdidas e agenda reuniões.",
  },
  {
    id: "onboard",
    icon: "rocket_launch",
    name: "Onboarding de clientes",
    desc: "Ativa novos clientes em um fluxo guiado e mensurável.",
  },
  {
    id: "support",
    icon: "support_agent",
    name: "Suporte nível 1",
    desc: "Atende dúvidas frequentes com tom humano e escalonamento.",
  },
  {
    id: "qual",
    icon: "filter_alt",
    name: "Qualificador de inbound",
    desc: "Qualifica leads com perguntas BANT e roteia ao vendedor.",
  },
  {
    id: "dun",
    icon: "payments",
    name: "Cobrança amigável",
    desc: "Negocia parcelamentos e renegociações com empatia.",
  },
  {
    id: "followup",
    icon: "mark_email_read",
    name: "Follow-up pós-venda",
    desc: "Nutre a relação e identifica oportunidades de expansão.",
  },
]

const SUGGESTIONS = [
  "Um SDR que reengaja leads que não responderam em 7 dias e agenda reuniões.",
  "Um assistente de onboarding que ativa novos clientes B2B em 14 dias.",
  "Um agente de suporte N1 para WhatsApp com escalonamento inteligente.",
]

export type WizardResult =
  | { source: "ai"; prompt: string }
  | { source: "template"; template: Template }

export function Wizard({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (result: WizardResult) => void
}) {
  const [mode, setMode] = React.useState<
    "choose" | "ai" | "template" | "generating"
  >("choose")
  const [prompt, setPrompt] = React.useState("")
  const [picked, setPicked] = React.useState<Template | null>(null)

  React.useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setMode("choose")
        setPrompt("")
        setPicked(null)
      }, 400)
      return () => clearTimeout(t)
    }
  }, [open])

  if (!open) return null

  const handleGenerate = () => {
    setMode("generating")
    setTimeout(() => onCreate({ source: "ai", prompt }), 2800)
  }
  const handlePickTemplate = (t: Template) => {
    setPicked(t)
    setTimeout(() => onCreate({ source: "template", template: t }), 320)
  }

  return (
    <div
      className="as2-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="as2-modal" role="dialog" aria-labelledby="as2-wizard-title">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 28px",
            borderBottom: "1px solid var(--aw-gray-200)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "var(--aw-gray-1200)",
                color: "var(--aw-white)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="hub" size={18} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <strong
                id="as2-wizard-title"
                style={{
                  fontWeight: 500,
                  fontSize: 18,
                  letterSpacing: "-0.01em",
                }}
              >
                Criar novo agente
              </strong>
              <span style={{ fontSize: 12, color: "var(--aw-gray-700)" }}>
                {mode === "choose" && "Por onde você prefere começar?"}
                {mode === "ai" &&
                  "Descreva em linguagem natural o que seu agente deve fazer."}
                {mode === "template" && "Escolha um template e personalize depois."}
                {mode === "generating" && "Gerando seu agente..."}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: 0,
              cursor: "pointer",
              width: 32,
              height: 32,
              borderRadius: 8,
              color: "var(--aw-gray-700)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Fechar"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: "auto" }}>
          {mode === "choose" ? (
            <Choose onPick={(m) => setMode(m)} />
          ) : null}
          {mode === "ai" ? (
            <AIPath
              prompt={prompt}
              setPrompt={setPrompt}
              onBack={() => setMode("choose")}
              onGenerate={handleGenerate}
            />
          ) : null}
          {mode === "template" ? (
            <Templates
              onBack={() => setMode("choose")}
              onPick={handlePickTemplate}
              picked={picked}
            />
          ) : null}
          {mode === "generating" ? <Generating prompt={prompt} /> : null}
        </div>
      </div>
    </div>
  )
}

function Choose({ onPick }: { onPick: (m: "ai" | "template") => void }) {
  return (
    <div
      style={{
        padding: 32,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
      }}
    >
      <ChoiceCard
        icon="auto_awesome"
        title="Gerar com IA"
        desc="Descreva seu negócio e o que o agente precisa fazer — geramos prompt, habilidades e canais."
        badge="Recomendado"
        accent
        onClick={() => onPick("ai")}
      />
      <ChoiceCard
        icon="library_books"
        title="Começar de um template"
        desc="Templates prontos para SDR, Onboarding, Suporte, Qualificação, Cobrança e mais."
        onClick={() => onPick("template")}
      />
      <ChoiceCard
        icon="edit_note"
        title="Começar do zero"
        desc="Monte cada etapa manualmente. Ideal para quando você já sabe exatamente o que quer."
        onClick={() => onPick("ai")}
      />
      <ChoiceCard
        icon="cloud_upload"
        title="Importar agente"
        desc="Traga um agente exportado ou conecte via API a uma configuração existente."
        onClick={() => onPick("ai")}
        disabled
      />
    </div>
  )
}

function ChoiceCard({
  icon,
  title,
  desc,
  badge,
  accent,
  onClick,
  disabled,
}: {
  icon: string
  title: string
  desc: string
  badge?: string
  accent?: boolean
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        textAlign: "left",
        border: `1px solid ${accent ? "var(--aw-gray-1200)" : "var(--aw-gray-200)"}`,
        borderRadius: 14,
        padding: 20,
        background: accent ? "var(--aw-gray-1200)" : "var(--aw-white)",
        color: accent ? "var(--aw-white)" : "var(--aw-gray-1200)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "transform 120ms ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.transform = "translateY(-2px)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: accent ? "rgba(255,255,255,0.1)" : "var(--aw-gray-150)",
            color: accent ? "var(--aw-white)" : "var(--aw-gray-1200)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={icon} size={20} />
        </div>
        {badge ? (
          <span
            style={{
              fontSize: 10,
              letterSpacing: 0.06,
              textTransform: "uppercase",
              padding: "4px 8px",
              borderRadius: 4,
              background: accent
                ? "rgba(255,255,255,0.15)"
                : "var(--aw-gray-150)",
              color: accent ? "var(--aw-white)" : "var(--aw-gray-800)",
              fontWeight: 600,
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <strong
        style={{
          fontSize: 17,
          fontWeight: 500,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </strong>
      <span
        style={{
          fontSize: 13,
          color: accent ? "var(--aw-gray-400)" : "var(--aw-gray-700)",
          lineHeight: 1.45,
        }}
      >
        {desc}
      </span>
    </button>
  )
}

function AIPath({
  prompt,
  setPrompt,
  onBack,
  onGenerate,
}: {
  prompt: string
  setPrompt: (v: string) => void
  onBack: () => void
  onGenerate: () => void
}) {
  return (
    <div
      style={{
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div style={{ position: "relative" }}>
        <textarea
          className="as2-textarea"
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Descreva o agente que você quer criar..."
          style={{
            paddingRight: 40,
            minHeight: 150,
            fontSize: 15,
            lineHeight: 1.55,
          }}
        />
        <span
          style={{
            position: "absolute",
            bottom: 10,
            right: 12,
            fontSize: 11,
            color: "var(--aw-gray-600)",
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
          }}
        >
          {prompt.length} / 2000
        </span>
      </div>

      <div>
        <div
          style={{
            fontSize: 12,
            color: "var(--aw-gray-700)",
            marginBottom: 8,
            fontWeight: 500,
          }}
        >
          Sugestões para começar
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => setPrompt(s)}
              style={{
                textAlign: "left",
                border: "1px solid var(--aw-gray-200)",
                borderRadius: 10,
                padding: "10px 14px",
                background: "var(--aw-gray-150)",
                color: "var(--aw-gray-900)",
                cursor: "pointer",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 10,
                transition: "background 120ms ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--aw-gray-200)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--aw-gray-150)")
              }
            >
              <Icon
                name="bolt"
                size={14}
                style={{ color: "var(--aw-blue-600)" }}
              />
              <span style={{ flex: 1 }}>{s}</span>
              <Icon
                name="arrow_outward"
                size={14}
                style={{ color: "var(--aw-gray-600)" }}
              />
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Button variant="ghost" icon="arrow_back" onClick={onBack}>
          Voltar
        </Button>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--aw-gray-700)" }}>
            <Kbd>⌘</Kbd> <Kbd>↵</Kbd> para gerar
          </span>
          <Button
            variant="primary"
            icon="auto_awesome"
            disabled={prompt.trim().length < 10}
            onClick={onGenerate}
          >
            Gerar agente
          </Button>
        </div>
      </div>
    </div>
  )
}

function Templates({
  onBack,
  onPick,
  picked,
}: {
  onBack: () => void
  onPick: (t: Template) => void
  picked: Template | null
}) {
  return (
    <div
      style={{
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        {TEMPLATE_LIBRARY.map((t) => {
          const isPicked = picked?.id === t.id
          return (
            <button
              key={t.id}
              onClick={() => onPick(t)}
              style={{
                textAlign: "left",
                padding: 16,
                border: `1px solid ${isPicked ? "var(--aw-gray-1200)" : "var(--aw-gray-200)"}`,
                borderRadius: 12,
                background: isPicked ? "var(--aw-gray-1200)" : "var(--aw-white)",
                color: isPicked ? "var(--aw-white)" : "var(--aw-gray-1200)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                transition: "transform 120ms ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: isPicked
                    ? "rgba(255,255,255,0.15)"
                    : "var(--aw-gray-150)",
                  color: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name={t.icon} size={18} />
              </div>
              <strong style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</strong>
              <span
                style={{
                  fontSize: 12,
                  color: isPicked ? "var(--aw-gray-400)" : "var(--aw-gray-700)",
                  lineHeight: 1.45,
                }}
              >
                {t.desc}
              </span>
            </button>
          )
        })}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Button variant="ghost" icon="arrow_back" onClick={onBack}>
          Voltar
        </Button>
        <span style={{ fontSize: 12, color: "var(--aw-gray-700)" }}>
          Clique em um template para continuar
        </span>
      </div>
    </div>
  )
}

function Generating({ prompt }: { prompt: string }) {
  const [step, setStep] = React.useState(0)
  const steps = [
    "Entendendo o objetivo...",
    "Definindo tom e personalidade...",
    "Selecionando habilidades e ferramentas...",
    "Configurando canais...",
    "Montando rascunho do agente...",
  ]
  React.useEffect(() => {
    const t = setInterval(
      () => setStep((s) => Math.min(s + 1, steps.length - 1)),
      500
    )
    return () => clearInterval(t)
  }, [steps.length])

  return (
    <div
      style={{
        position: "relative",
        padding: "56px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
        minHeight: 380,
      }}
    >
      <GradientMesh />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <SparkleGroup />
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            maxWidth: 420,
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            Gerando seu agente
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--aw-gray-700)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            &ldquo;{prompt.slice(0, 120)}
            {prompt.length > 120 ? "…" : ""}&rdquo;
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: 360,
          }}
        >
          {steps.map((label, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color:
                  i <= step ? "var(--aw-gray-1200)" : "var(--aw-gray-500)",
                opacity: i <= step ? 1 : 0.55,
                transition: "opacity 120ms ease, color 120ms ease",
              }}
            >
              {i < step ? (
                <Icon
                  name="check_circle"
                  size={16}
                  fill
                  style={{ color: "#34C759" }}
                />
              ) : i === step ? (
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid var(--aw-gray-300)",
                    borderTopColor: "var(--aw-gray-1200)",
                    animation: "as2Spin 0.8s linear infinite",
                  }}
                />
              ) : (
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid var(--aw-gray-300)",
                  }}
                />
              )}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
