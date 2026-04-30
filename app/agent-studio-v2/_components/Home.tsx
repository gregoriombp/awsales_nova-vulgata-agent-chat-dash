"use client"

import * as React from "react"
import { Icon } from "./icons"
import { Avatar, Button, NeuralPattern } from "./primitives"
import type { AgentSeed } from "./types"

export function Home({
  agents,
  onCreate,
  onOpen,
}: {
  agents: AgentSeed[]
  onCreate: () => void
  onOpen: (agent: AgentSeed) => void
}) {
  if (agents.length === 0) return <HomeEmpty onCreate={onCreate} />
  return <HomePopulated agents={agents} onCreate={onCreate} onOpen={onOpen} />
}

function HomeEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      className="as2-center-screen"
      style={{ background: "var(--aw-gray-1200)", color: "var(--aw-white)" }}
    >
      <div
        className="as2-fadeinup"
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 48,
        }}
      >
        <div style={{ animation: "as2NeuralPulse 5s ease-in-out infinite" }}>
          <NeuralPattern size={320} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <h1
            style={{
              fontWeight: 500,
              fontSize: 40,
              letterSpacing: "-0.02em",
              color: "var(--aw-white)",
              textAlign: "center",
              lineHeight: 1,
              margin: 0,
            }}
          >
            Bem vindo ao Agent Studio
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--aw-gray-500)",
              letterSpacing: "-0.01em",
              textAlign: "center",
              margin: 0,
            }}
          >
            Crie seu primeiro agente em menos de 90 minutos.
          </p>
          <Button
            variant="primary-on-dark"
            size="lg"
            icon="add"
            onClick={onCreate}
            style={{ marginTop: 20 }}
          >
            Criar agente
          </Button>
        </div>
      </div>
    </div>
  )
}

function HomePopulated({
  agents,
  onCreate,
  onOpen,
}: {
  agents: AgentSeed[]
  onCreate: () => void
  onOpen: (agent: AgentSeed) => void
}) {
  const [query, setQuery] = React.useState("")
  const [sortBy, setSortBy] = React.useState<"recent" | "name">("recent")

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.objective.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <div className="as2-page-header" style={{ paddingBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background:
                "linear-gradient(135deg, var(--aw-gray-1100), var(--aw-gray-1200))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--aw-white)",
            }}
          >
            <Icon name="hub" size={24} />
          </div>
          <h1 className="as2-page-header-title">Agent Studio</h1>
        </div>
        <p className="as2-page-header-desc">
          A camada de controle da sua arquitetura multiagente. Crie agentes
          especializados que colaboram em milissegundos para gerar resultados
          reais.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 24,
            flexWrap: "wrap",
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
              placeholder="Buscar agentes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: 36, height: 40 }}
            />
          </div>
          <Button icon="filter_list">Filtros</Button>
          <Button
            icon="swap_vert"
            onClick={() =>
              setSortBy(sortBy === "recent" ? "name" : "recent")
            }
          >
            {sortBy === "recent" ? "Mais recentes" : "Nome A–Z"}
          </Button>
          <div style={{ flex: 1 }} />
          <Button variant="primary" icon="add" onClick={onCreate}>
            Criar agente
          </Button>
        </div>
      </div>

      <div
        className="as2-fadein"
        style={{ padding: "32px 48px 48px", overflow: "auto" }}
      >
        <div
          style={{
            borderRadius: 20,
            border: "1px solid var(--aw-gray-200)",
            background: "var(--aw-white)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(280px, 1.6fr) 1.1fr 1.1fr 1.4fr 1.2fr 1fr 1fr 44px",
              alignItems: "center",
              padding: "14px 20px",
              borderBottom: "1px solid var(--aw-gray-200)",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--aw-gray-700)",
              letterSpacing: 0.1,
              background: "var(--aw-gray-150)",
            }}
          >
            <div>Nome</div>
            <div>Objetivo</div>
            <div>Status</div>
            <div>Agente core</div>
            <div>Criado por</div>
            <div>Criado em</div>
            <div style={{ textAlign: "right" }}>Base de conhecimento</div>
            <div />
          </div>

          {filtered.map((a) => (
            <AgentRow key={a.id} agent={a} onOpen={onOpen} />
          ))}
          {filtered.length === 0 ? (
            <div
              style={{
                padding: 48,
                textAlign: "center",
                color: "var(--aw-gray-700)",
              }}
            >
              Nenhum agente encontrado para <em>&ldquo;{query}&rdquo;</em>.
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}

const STATUS_COLORS: Record<AgentSeed["status"], string> = {
  ativo: "#34C759",
  rascunho: "var(--aw-gray-500)",
  revisao: "var(--accent-alert, #E6762F)",
  pausado: "var(--aw-red-600)",
  publicado: "var(--aw-blue-600)",
}
const STATUS_LABELS: Record<AgentSeed["status"], string> = {
  ativo: "Ativo",
  rascunho: "Rascunho",
  revisao: "Em revisão",
  pausado: "Pausado",
  publicado: "Publicado",
}

function AgentRow({
  agent,
  onOpen,
}: {
  agent: AgentSeed
  onOpen: (a: AgentSeed) => void
}) {
  return (
    <div
      onClick={() => onOpen(agent)}
      style={{
        display: "grid",
        gridTemplateColumns:
          "minmax(280px, 1.6fr) 1.1fr 1.1fr 1.4fr 1.2fr 1fr 1fr 44px",
        alignItems: "center",
        padding: "18px 20px",
        borderBottom: "1px solid var(--aw-gray-200)",
        cursor: "pointer",
        transition: "background 120ms ease",
        fontSize: 13,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--aw-gray-150)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "transparent")
      }
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background:
              "linear-gradient(135deg, var(--aw-gray-1100), var(--aw-gray-1200))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--aw-white)",
            flexShrink: 0,
          }}
        >
          <Icon name={agent.icon} size={18} />
        </div>
        <span
          style={{
            fontWeight: 500,
            color: "var(--aw-gray-1200)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {agent.name}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "var(--aw-gray-800)",
        }}
      >
        <Icon name="target" size={14} style={{ color: "var(--aw-gray-700)" }} />
        <span>{agent.objective}</span>
      </div>
      <div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "var(--aw-gray-800)",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: STATUS_COLORS[agent.status],
            }}
          />
          {STATUS_LABELS[agent.status]}
        </span>
      </div>
      <div
        style={{
          color: "var(--aw-gray-800)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {agent.core}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "var(--aw-gray-800)",
        }}
      >
        <Avatar name={agent.author} size={22} tone={agent.avatarTone} />
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {agent.author}
        </span>
      </div>
      <div style={{ color: "var(--aw-gray-700)", fontSize: 12 }}>
        {agent.createdAt}
      </div>
      <div
        style={{
          textAlign: "right",
          color: "var(--aw-gray-700)",
          fontSize: 12,
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
        }}
      >
        {agent.kb} fontes
      </div>
      <div style={{ textAlign: "right" }}>
        <button
          onClick={(e) => e.stopPropagation()}
          style={{
            border: 0,
            background: "transparent",
            width: 28,
            height: 28,
            borderRadius: 6,
            cursor: "pointer",
            color: "var(--aw-gray-700)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--aw-gray-200)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          aria-label="Mais opções"
        >
          <Icon name="more_vert" size={18} />
        </button>
      </div>
    </div>
  )
}
