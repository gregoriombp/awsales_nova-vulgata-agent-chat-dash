"use client"

import * as React from "react"
import { Icon } from "../icons"
import { Button, GradientMesh, NeuralPattern } from "../primitives"
import type { AgentDraft } from "../types"

export function PublicarStep({
  agent,
  published,
  onPublish,
}: {
  agent: AgentDraft
  published: boolean
  onPublish: () => void
}) {
  if (published) {
    return (
      <div
        className="as2-fadein"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 32px",
          minHeight: 600,
          position: "relative",
          background: "var(--aw-gray-1200)",
          color: "var(--aw-white)",
        }}
      >
        <GradientMesh style={{ opacity: 0.35 }} />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            maxWidth: 560,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "var(--aw-white)",
              color: "var(--aw-gray-1200)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation:
                "as2SuccessPop 600ms cubic-bezier(0.22, 0.61, 0.36, 1) both",
            }}
          >
            <Icon name="check" size={44} />
          </div>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            {agent.name || "Agente"} está no ar
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--aw-gray-400)",
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            Publicado em {(agent.channels || []).length}{" "}
            {(agent.channels || []).length === 1 ? "canal" : "canais"}.
            Primeiras conversas podem levar alguns minutos para aparecer no
            dashboard.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Button variant="primary-on-dark" icon="forum">
              Abrir conversas
            </Button>
            <Button
              variant="ghost"
              icon="home"
              style={{ color: "var(--aw-gray-400)" }}
            >
              Voltar ao Studio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="as2-fadein"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 32px",
        minHeight: 600,
        position: "relative",
        background: "var(--aw-gray-1200)",
        color: "var(--aw-white)",
      }}
    >
      <GradientMesh style={{ opacity: 0.4 }} />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          maxWidth: 560,
          textAlign: "center",
        }}
      >
        <div style={{ animation: "as2NeuralPulse 5s ease-in-out infinite" }}>
          <NeuralPattern size={220} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.08,
              textTransform: "uppercase",
              color: "var(--aw-gray-500)",
            }}
          >
            Passo 6 · Publicar
          </span>
          <h1
            style={{
              fontSize: 44,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            Pronto para colocar o agente no ar?
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--aw-gray-400)",
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            Ao publicar, o agente começa a atender em{" "}
            <strong style={{ color: "var(--aw-white)", fontWeight: 500 }}>
              {(agent.channels || []).length || "0"} canais
            </strong>
            , com aprovação humana nas primeiras 48 horas.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <Button variant="ghost" style={{ color: "var(--aw-gray-400)" }}>
            Agendar publicação
          </Button>
          <Button
            variant="primary-on-dark"
            size="lg"
            icon="rocket_launch"
            onClick={onPublish}
          >
            Publicar agora
          </Button>
        </div>
      </div>
    </div>
  )
}
