"use client"

import * as React from "react"
import { AwButton } from "@/components/ui/AwButton"
import { AwSheet, AwSheetTab, AwSheetRow } from "@/components/ui/AwSheet"
import { AwPill } from "@/components/ui/AwPill"

const CONVERSATIONS = [
  {
    id: "8410",
    title: "Conversa #8410",
    meta: "iniciada há 22m · Web",
    user: "João T.",
    intent: "rastreio-pedido",
    status: "resolvida em 3 mensagens",
    csat: "5 / 5",
    cost: "$0.008 · 1 320 tokens",
    latency: "520 ms",
  },
  {
    id: "8411",
    title: "Conversa #8411",
    meta: "iniciada há 17m · Instagram",
    user: "Camila F.",
    intent: "alteração-pagamento",
    status: "handoff humano",
    csat: "—",
    cost: "$0.015 · 2 210 tokens",
    latency: "740 ms",
  },
  {
    id: "8412",
    title: "Conversa #8412",
    meta: "iniciada há 12m · WhatsApp",
    user: "Marina S. (+55 11 9••••-3492)",
    intent: "segunda-via-boleto",
    status: "resolvida em 4 mensagens",
    csat: "4.8 / 5",
    cost: "$0.012 · 1 842 tokens",
    latency: "680 ms",
  },
]

export function SheetDemo() {
  const [open, setOpen] = React.useState(false)
  const [index, setIndex] = React.useState(2)
  const [tab, setTab] = React.useState<"resumo" | "transcricao" | "tools" | "metricas">(
    "resumo"
  )
  const c = CONVERSATIONS[index]

  const prev = () => setIndex((i) => (i === 0 ? CONVERSATIONS.length - 1 : i - 1))
  const next = () => setIndex((i) => (i === CONVERSATIONS.length - 1 ? 0 : i + 1))

  return (
    <>
      <AwButton
        variant="primary"
        iconLeft="pageview"
        onClick={() => setOpen(true)}
      >
        Inspecionar conversa
      </AwButton>

      <AwSheet
        open={open}
        onClose={() => setOpen(false)}
        title={c.title}
        meta={c.meta}
        onPrev={prev}
        onNext={next}
        tabs={
          <>
            <AwSheetTab active={tab === "resumo"} onClick={() => setTab("resumo")}>
              Resumo
            </AwSheetTab>
            <AwSheetTab
              active={tab === "transcricao"}
              onClick={() => setTab("transcricao")}
            >
              Transcrição
            </AwSheetTab>
            <AwSheetTab active={tab === "tools"} onClick={() => setTab("tools")}>
              Ferramentas
            </AwSheetTab>
            <AwSheetTab
              active={tab === "metricas"}
              onClick={() => setTab("metricas")}
            >
              Métricas
            </AwSheetTab>
          </>
        }
        footer={
          <>
            <AwButton variant="ghost" onClick={() => setOpen(false)}>
              Fechar
            </AwButton>
            <AwButton variant="primary" iconLeft="flag">
              Marcar para revisão
            </AwButton>
          </>
        }
      >
        {tab === "resumo" && (
          <>
            <AwSheetRow label="Usuário">{c.user}</AwSheetRow>
            <AwSheetRow label="Intenção">
              <code className="mono">{c.intent}</code>
            </AwSheetRow>
            <AwSheetRow label="Status">
              <AwPill
                variant={c.status.startsWith("resolv") ? "live" : "beta"}
                dot={false}
              >
                {c.status}
              </AwPill>
            </AwSheetRow>
            <AwSheetRow label="CSAT">{c.csat}</AwSheetRow>
            <AwSheetRow label="Custo">
              {c.cost}
            </AwSheetRow>
            <AwSheetRow label="Latência p95">
              {c.latency}
            </AwSheetRow>
          </>
        )}
        {tab === "transcricao" && (
          <div className="text-sm text-(--fg-secondary) leading-relaxed">
            Trecho simulado da transcrição. Em produção, renderize{" "}
            <code className="mono">AwChatBubble</code> para user/agent com
            timestamps.
          </div>
        )}
        {tab === "tools" && (
          <div className="text-sm text-(--fg-secondary)">
            <code className="mono">lookup_invoice</code> ·{" "}
            <code className="mono">send_pdf</code>
          </div>
        )}
        {tab === "metricas" && (
          <div className="text-sm text-(--fg-secondary)">
            Custo: {c.cost} · Latência p95: {c.latency}
          </div>
        )}
      </AwSheet>
    </>
  )
}
