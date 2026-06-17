"use client"

/* ─────────────────────────────────────────────────────────────────────
 * Criar agente — visão compilada (golden eye)
 *
 * Funde, num grafo só, as rotas de criar um agente novo pelo Agent Studio
 * até a publicação — sobrepondo 3 cenários no mesmo board:
 *   1. Criar agente (completo) — base e integração já existem; a espinha feliz.
 *   2. Sem memory base — no passo de configurar, o usuário não tem base;
 *      sai pra criar uma (sub-jornada) e converge de volta.
 *   3. Sem integração / gaps — no passo de habilidades, falta integração;
 *      conecta (sub-jornada) e converge; e a revisão pega gaps que voltam
 *      pro editor.
 *
 * Peças (copiadas da POC poc-visao-global, adaptadas):
 *   - Dedup — telas que os 3 cenários compartilham viram UM card, com uma
 *     bolinha por cenário dono (2+ bolinhas = compartilhado).
 *   - Lentes de foco — Todo + 1 por cenário. Acinzenta nós E arestas fora do
 *     cenário e desenha a faixa dele.
 *   - Click-to-open — clicar num card abre a tela real num modal grande.
 *   - Comentar — clique num card no modo Comentar manda a nota pro canal.
 *
 * Autocontido (ReactFlow direto, sem o FlowDiagram compartilhado).
 * ──────────────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  Handle,
  Position,
  MarkerType,
  type Edge,
  type Node,
  type NodeChange,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { PageHero, Section } from "../../_primitives"
import {
  FlowUpdatesBadge,
  FlowUpdatesHistorySection,
  type FlowUpdate,
} from "../_components/flow-updates"

/* ─── Cenários ──────────────────────────────────────────────────────── */

type Scenario = "criar-agente" | "sem-base" | "sem-integracao"
type Focus = Scenario | "all"

const SCENARIO: Record<Scenario, { label: string; color: string }> = {
  "criar-agente": { label: "Criar agente (completo)", color: "var(--aw-blue-600)" },
  "sem-base": { label: "Sem memory base", color: "var(--aw-emerald-600)" },
  "sem-integracao": { label: "Sem integração / gaps", color: "var(--aw-purple-600)" },
}
const ALL = Object.keys(SCENARIO) as Scenario[]

const FOCI: { id: Focus; label: string }[] = [
  { id: "all", label: "Todo" },
  ...ALL.map((s) => ({ id: s, label: SCENARIO[s].label })),
]

/* ─── Node data ─────────────────────────────────────────────────────── */

type ScreenVariant = { label: string; href: string }
type ScreenData = { step?: string; title: string; note?: string; href?: string; variants?: ScreenVariant[]; scenarios: Scenario[]; _comments?: number }
type DecisionData = { step?: string; title: string; question?: string; scenarios: Scenario[]; _comments?: number }
type SectionData = { title: string; scenario: Scenario }

/* Pin de comentário (estilo FigJam) — aparece no card quando tem nota. */
function CommentPin({ n }: { n: number }) {
  return (
    <span className="absolute -left-2 -top-2 z-20 inline-flex h-5 items-center justify-center gap-0.5 rounded-full border border-(--aw-amber-300) bg-(--aw-amber-500) px-1.5 text-[10px] font-bold text-white shadow-(--shadow-sm)">
      💬 {n}
    </span>
  )
}

/* ─── Bolinhas de cenário ───────────────────────────────────────────── */

function ScenarioDots({ scenarios }: { scenarios: Scenario[] }) {
  return (
    <div className="absolute right-2 top-2 flex gap-1">
      {scenarios.map((s) => (
        <span key={s} className="inline-block h-2 w-2 rounded-full" style={{ background: SCENARIO[s].color }} title={SCENARIO[s].label} />
      ))}
    </div>
  )
}

/* ─── Handles ───────────────────────────────────────────────────────── */

const SIDES: { id: string; pos: Position }[] = [
  { id: "t", pos: Position.Top },
  { id: "b", pos: Position.Bottom },
  { id: "l", pos: Position.Left },
  { id: "r", pos: Position.Right },
]
function NodeHandles() {
  const cls = "border-0! w-1.5! h-1.5! bg-(--border-strong)!"
  return (
    <>
      {SIDES.map((s) => (
        <Handle key={s.id + "-t"} id={s.id + "-t"} type="target" position={s.pos} style={{ opacity: 0 }} className={cls} />
      ))}
      {SIDES.map((s) => (
        <Handle key={s.id + "-s"} id={s.id + "-s"} type="source" position={s.pos} style={{ opacity: 0 }} className={cls} />
      ))}
    </>
  )
}

/* ─── Renderers ─────────────────────────────────────────────────────── */

function ScreenNode({ data }: NodeProps<Node<ScreenData>>) {
  return (
    <div className="relative w-[208px] cursor-pointer rounded-lg border border-(--border-default) bg-(--bg-raised) shadow-(--shadow-sm) transition hover:border-(--aw-blue-400) hover:shadow-(--shadow-md)">
      <NodeHandles />
      <ScenarioDots scenarios={data.scenarios} />
      {data._comments ? <CommentPin n={data._comments} /> : null}
      <div className="flex flex-col gap-1 px-4 py-3 pr-10">
        {data.step && <span className="aw-eyebrow text-(--aw-blue-700)">{data.step}</span>}
        <span className="text-sm font-medium leading-tight text-(--fg-primary)">{data.title}</span>
        {data.note && <span className="caption text-(--fg-tertiary)">{data.note}</span>}
      </div>
    </div>
  )
}

function DecisionNode({ data }: NodeProps<Node<DecisionData>>) {
  return (
    <div className="relative w-[224px] rounded-lg border-2 border-dashed border-(--aw-amber-400) bg-(--aw-amber-100) px-4 py-3 pr-10 flex flex-col gap-1">
      <NodeHandles />
      <ScenarioDots scenarios={data.scenarios} />
      {data._comments ? <CommentPin n={data._comments} /> : null}
      <span className="aw-eyebrow text-(--aw-amber-800)">decisão</span>
      <span className="text-sm font-medium leading-tight text-(--aw-amber-900)">{data.title}</span>
      {data.question && <span className="text-xs leading-snug text-(--aw-amber-800)">{data.question}</span>}
    </div>
  )
}

function SectionNode({ data }: NodeProps<Node<SectionData>>) {
  const tint = SCENARIO[data.scenario].color
  return (
    <div
      className="pointer-events-none h-full w-full rounded-2xl"
      style={{ background: `color-mix(in oklab, ${tint} 6%, transparent)`, border: `1.5px dashed color-mix(in oklab, ${tint} 30%, transparent)` }}
    >
      <span className="aw-eyebrow absolute left-3 top-2.5 rounded-sm px-1.5 py-0.5" style={{ color: tint, background: `color-mix(in oklab, ${tint} 12%, transparent)` }}>
        {data.title}
      </span>
    </div>
  )
}

const nodeTypes = { screen: ScreenNode, decision: DecisionNode, section: SectionNode }

/* ─── Edges ─────────────────────────────────────────────────────────── */

const base = {
  type: "smoothstep" as const,
  markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15 },
  style: { stroke: "var(--border-strong)", strokeWidth: 1.4 },
}
const branch = {
  ...base,
  style: { stroke: "var(--aw-amber-500)", strokeWidth: 1.4 },
  markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: "var(--aw-amber-500)" },
}
const cross = {
  ...base,
  style: { stroke: "var(--aw-pink-500)", strokeWidth: 1.4, strokeDasharray: "5 3" },
  markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: "var(--aw-pink-500)" },
}

/* ─── Grafo fundido ─────────────────────────────────────────────────── */
/* Espinha central (trunk) desce do Studio até Publicado. Duas sub-jornadas
   saem pros lados — criar base (esquerda) e conectar integração (direita) —
   e convergem de volta no próximo passo. No fim, a revisão tem um laço de
   gaps que volta pro editor. */

const TX = 600 // trunk (espinha)
const BX = 150 // sub-jornada: criar memory base (esquerda)
const IX = 1040 // sub-jornada: conectar integração (direita)

const S = (id: string, x: number, y: number, d: ScreenData): Node => ({ id, type: "screen", position: { x, y }, zIndex: 10, data: d })
const D = (id: string, x: number, y: number, d: DecisionData): Node => ({ id, type: "decision", position: { x, y }, zIndex: 10, data: d })

const SB: Scenario[] = ["sem-base"]
const SI: Scenario[] = ["sem-integracao"]

const BASE_NODES: Node[] = [
  /* ═══ ESPINHA (compartilhada pelos 3 cenários) ═══ */
  S("studio", TX, 0, { step: "entrada", title: "Agent Studio (lista)", note: "clique em Criar agente · vazio na 1ª vez", href: "/agent-studio", scenarios: ALL }),
  S("step1", TX, 180, { step: "01", title: "Caso de uso", note: "escolhe o objetivo do agente (Vendas, Suporte… ou Outro)", href: "/agent-studio/new?step=1", scenarios: ALL }),
  S("step2", TX, 360, { step: "02", title: "Configure seu agente", note: "nome + escolher a memory base", href: "/agent-studio/new?step=2", scenarios: ALL }),
  D("d-base", TX - 8, 540, { title: "Tem memory base?", question: "Existe base de conhecimento na conta pra vincular?", scenarios: ALL }),
  S("step3", TX, 900, { step: "03", title: "Habilidades e AOPs", note: "dá acesso a integrações e procedimentos (opcional)", href: "/agent-studio/new?step=3", scenarios: ALL }),
  D("d-integ", TX - 8, 1080, { title: "Tem integração?", question: "As habilidades pedem uma integração que não está conectada?", scenarios: ALL }),
  S("step4", TX, 1440, { step: "04", title: "Canal de atendimento", note: "WhatsApp: número + template da 1ª mensagem", href: "/agent-studio/new?step=4", scenarios: ALL }),
  S("step5", TX, 1620, { step: "05", title: "Origens e Conversões", note: "de onde vêm as conversas e o que conta como conversão (opcional)", href: "/agent-studio/new?step=5", scenarios: ALL }),
  S("step6", TX, 1800, { step: "06", title: "Agent Core", note: "escolhe o núcleo de IA que move o agente", href: "/agent-studio/new?step=6", scenarios: ALL }),
  S("step7", TX, 1980, { step: "07", title: "Calibragem", note: "3 perguntas pra afinar o comportamento", href: "/agent-studio/new?step=7&q=1", scenarios: ALL }),
  S("step8", TX, 2160, { step: "08", title: "Gerando seu Agente", note: "tela de loading · redireciona pro editor", href: "/agent-studio/new?step=8", scenarios: ALL }),
  S("editor", TX, 2340, { step: "editor", title: "Editor do agente", note: "prompt, checkpoints, base, AOPs, playground…", href: "/agent-studio/leads-recovery?tab=prompt-checkpoint", scenarios: ALL }),
  S("review", TX, 2520, { step: "revisão", title: "Revisão", note: "resumo read-only · cards de cada config + gauge de qualidade", href: "/agent-studio/leads-recovery/review", scenarios: ALL }),
  D("d-complete", TX - 8, 2700, { title: "Configuração completa?", question: "Base vinculada, canal pronto e qualidade ok?", scenarios: ALL }),
  S("publicar", TX, 3060, { step: "publicar", title: "Publicar agente", note: "modal de sucesso · agente entra ativo na lista", href: "/agent-studio/leads-recovery/review", scenarios: ALL }),
  S("publicado", TX, 3240, { step: "fim", title: "Agente publicado", note: "aparece ativo no Agent Studio", href: "/agent-studio", scenarios: ALL }),

  /* ═══ SUB-JORNADA: criar memory base (só sem-base) ═══ */
  S("mb-new", BX, 560, { step: "base · 01", title: "Criar base de conhecimento", note: "sai do wizard pro /memory-base/new", href: "/memory-base/new", scenarios: SB }),
  S("mb-building", BX, 740, { step: "base · 02", title: "Construindo a base", note: "objetivo, segmento, fontes · indexação", href: "/memory-base/new", scenarios: SB }),
  S("mb-criada", BX, 920, { step: "base · 03", title: "Base criada", note: "volta ao wizard com a base disponível pra vincular", href: "/memory-base", scenarios: SB }),

  /* ═══ SUB-JORNADA: conectar integração (só sem-integracao) ═══ */
  S("int-catalogo", IX, 1100, { step: "integ · 01", title: "Catálogo de integração", note: "abre o catálogo pra adicionar uma habilidade", href: "/integrations", scenarios: SI }),
  S("int-conectar", IX, 1280, { step: "integ · 02", title: "Conectar integração", note: "autoriza a conta (OAuth) e habilita as ferramentas", href: "/integrations", scenarios: SI }),
  S("int-conectada", IX, 1460, { step: "integ · 03", title: "Integração conectada", note: "volta ao wizard com a habilidade disponível", href: "/integrations", scenarios: SI }),

  /* ═══ GAP da revisão (laço que volta pro editor) ═══ */
  S("gap", IX, 2700, { step: "gap", title: "Gaps na revisão", note: "base não vinculada · canal incompleto · qualidade baixa → corrigir", href: "/agent-studio/leads-recovery/review", scenarios: ALL }),
]

const EDGES: Edge[] = [
  /* Espinha */
  { id: "e1", source: "studio", target: "step1", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "e2", source: "step1", target: "step2", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "e3", source: "step2", target: "d-base", sourceHandle: "b-s", targetHandle: "t-t", ...base },

  /* Gate da memory base */
  { id: "g1", source: "d-base", target: "step3", sourceHandle: "b-s", targetHandle: "t-t", label: "Já tenho base", ...branch },
  { id: "g2", source: "d-base", target: "mb-new", sourceHandle: "l-s", targetHandle: "t-t", label: "Não tenho base", ...branch },
  { id: "g3", source: "mb-new", target: "mb-building", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "g4", source: "mb-building", target: "mb-criada", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "g5", source: "mb-criada", target: "step3", sourceHandle: "r-s", targetHandle: "l-t", label: "Base criada · volta", ...cross },

  /* Step3 → gate de integração */
  { id: "e4", source: "step3", target: "d-integ", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "h1", source: "d-integ", target: "step4", sourceHandle: "b-s", targetHandle: "t-t", label: "Tenho / pulo", ...branch },
  { id: "h2", source: "d-integ", target: "int-catalogo", sourceHandle: "r-s", targetHandle: "t-t", label: "Falta integração", ...branch },
  { id: "h3", source: "int-catalogo", target: "int-conectar", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "h4", source: "int-conectar", target: "int-conectada", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "h5", source: "int-conectada", target: "step4", sourceHandle: "l-s", targetHandle: "r-t", label: "Conectada · volta", ...cross },

  /* Espinha — wizard até a revisão */
  { id: "e5", source: "step4", target: "step5", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "e6", source: "step5", target: "step6", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "e7", source: "step6", target: "step7", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "e8", source: "step7", target: "step8", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "e9", source: "step8", target: "editor", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "e10", source: "editor", target: "review", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "e11", source: "review", target: "d-complete", sourceHandle: "b-s", targetHandle: "t-t", ...base },

  /* Gate de gaps */
  { id: "p1", source: "d-complete", target: "publicar", sourceHandle: "b-s", targetHandle: "t-t", label: "Sem gaps", ...branch },
  { id: "p2", source: "d-complete", target: "gap", sourceHandle: "r-s", targetHandle: "t-t", label: "Tem gaps", ...branch },
  { id: "p3", source: "gap", target: "editor", sourceHandle: "l-s", targetHandle: "r-t", label: "Corrigir · volta ao editor", ...cross },
  { id: "p4", source: "publicar", target: "publicado", sourceHandle: "b-s", targetHandle: "t-t", ...base },
]

const NODE_SCENARIOS: Record<string, Scenario[]> = Object.fromEntries(
  BASE_NODES.map((n) => [n.id, (n.data as ScreenData | DecisionData).scenarios]),
)

/* Faixa do cenário em foco: bounding box dos nós dele. */
const FOOTPRINT = { w: 230, h: 120 }
const PAD = 40
function focusBand(focus: Scenario): Node {
  const members = BASE_NODES.filter((n) => (n.data as ScreenData | DecisionData).scenarios.includes(focus))
  const xs = members.map((n) => n.position.x)
  const ys = members.map((n) => n.position.y)
  const minX = Math.min(...xs) - PAD
  const minY = Math.min(...ys) - PAD
  return {
    id: "band",
    type: "section",
    position: { x: minX, y: minY },
    style: { width: Math.max(...xs) + FOOTPRINT.w + PAD - minX, height: Math.max(...ys) + FOOTPRINT.h + PAD - minY },
    zIndex: 0,
    selectable: false,
    draggable: false,
    data: { title: SCENARIO[focus].label, scenario: focus },
  }
}

/* ─── Changelog ─────────────────────────────────────────────────────── */

const updates: FlowUpdate[] = [
  {
    date: "2026-06-17",
    summary: "Visão compilada criada: 3 cenários de criar agente fundidos num grafo só (completo · sem memory base · sem integração / gaps).",
    tags: ["new-page"],
  },
]

/* ─── Página ────────────────────────────────────────────────────────── */

type CardComment = { id: string; text: string; at: number }
type CommentMap = Record<string, CardComment[]>

export default function CriarAgenteVisaoGlobalPage() {
  const [focus, setFocus] = useState<Focus>("all")
  const [openScreen, setOpenScreen] = useState<{ title: string; variants: ScreenVariant[] } | null>(null)
  const [screenVariant, setScreenVariant] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [commentMode, setCommentMode] = useState(false)
  const [comments, setComments] = useState<CommentMap>({})
  const [composer, setComposer] = useState<{ id: string; title: string } | null>(null)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  /* Posições arrastadas pelo usuário (sobrescrevem o layout base). */
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({})
  const rfRef = useRef<ReactFlowInstance | null>(null)

  const nodes = useMemo<Node[]>(() => {
    const dimmed = BASE_NODES.map((n) => {
      const scenarios = (n.data as ScreenData | DecisionData).scenarios
      const dim = focus !== "all" && !scenarios.includes(focus as Scenario)
      return {
        ...n,
        position: positions[n.id] ?? n.position,
        data: { ...n.data, _comments: comments[n.id]?.length },
        className: dim ? "opacity-15 saturate-0 transition-all duration-300" : "opacity-100 transition-all duration-300",
      }
    })
    return focus === "all" ? dimmed : [focusBand(focus as Scenario), ...dimmed]
  }, [focus, comments, positions])

  /* Persiste o arraste: sem isto o ReactFlow controlado faz o card voltar ao lugar. */
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setPositions((prev) => {
      let next = prev
      for (const ch of changes) {
        if (ch.type === "position" && ch.position && ch.id !== "band") {
          next = { ...next, [ch.id]: ch.position }
        }
      }
      return next
    })
  }, [])

  const edges = useMemo<Edge[]>(() => {
    if (focus === "all") return EDGES
    return EDGES.map((e) => {
      const on = NODE_SCENARIOS[e.source]?.includes(focus as Scenario) && NODE_SCENARIOS[e.target]?.includes(focus as Scenario)
      return on ? e : { ...e, label: undefined, style: { ...(e.style as object), opacity: 0.1 } }
    })
  }, [focus])

  /* Carrega comentários já deixados (suggestions.json, flow=criar-agente-visao-global).
     Cada comentário é uma "suggestion" com description `[ge:<id>] (<título>) <texto>`. */
  useEffect(() => {
    let alive = true
    fetch("/api/flow-suggestions?flow=criar-agente-visao-global")
      .then((r) => (r.ok ? r.json() : { suggestions: [] }))
      .then((d: { suggestions?: { id: string; description: string; createdAt: number; status: string }[] }) => {
        if (!alive) return
        const map: CommentMap = {}
        for (const s of d.suggestions ?? []) {
          if (s.status === "discarded") continue
          const m = /^\[ge:([^\]]+)\]\s*(?:\([^)]*\))?\s*([\s\S]*)$/.exec(s.description)
          if (!m) continue
          ;(map[m[1]] ??= []).push({ id: s.id, text: m[2].trim(), at: s.createdAt })
        }
        setComments(map)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  /* Tela cheia: re-fit ao entrar/sair + ESC pra sair. */
  useEffect(() => {
    const t = setTimeout(() => rfRef.current?.fitView({ padding: 0.08, duration: 200 }), 60)
    return () => clearTimeout(t)
  }, [isFullscreen])
  useEffect(() => {
    if (!isFullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isFullscreen])

  const sendComment = useCallback(async () => {
    if (!composer || !draft.trim()) return
    const text = draft.trim()
    const { id, title } = composer
    setSending(true)
    try {
      const res = await fetch("/api/flow-suggestions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ flow: "criar-agente-visao-global", authorName: "Greg", description: `[ge:${id}] (${title}) ${text}` }),
      })
      const out = await res.json().catch(() => null)
      const sid = out?.suggestion?.id ?? String(Date.now())
      setComments((c) => ({ ...c, [id]: [...(c[id] ?? []), { id: sid, text, at: Date.now() }] }))
    } catch {
      setComments((c) => ({ ...c, [id]: [...(c[id] ?? []), { id: String(Date.now()), text, at: Date.now() }] }))
    } finally {
      setDraft("")
      setSending(false)
    }
  }, [composer, draft])

  /* Chips de foco — reusadas acima do canvas e dentro do fullscreen. */
  const focusTabs = (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="caption mr-1 text-(--fg-tertiary)">Foco:</span>
      {FOCI.map((f) => {
        const on = focus === f.id
        const color = f.id === "all" ? "var(--aw-blue-600)" : SCENARIO[f.id as Scenario].color
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => setFocus(f.id)}
            className={
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition " +
              (on
                ? "border-(--aw-blue-300) bg-(--aw-blue-100) text-(--aw-blue-800)"
                : "border-(--border-default) bg-(--bg-raised) text-(--fg-secondary) hover:border-(--aw-blue-300) hover:text-(--aw-blue-700)")
            }
          >
            {f.id !== "all" && <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />}
            {f.label}
          </button>
        )
      })}
    </div>
  )

  return (
    <>
      <PageHero
        title="Criar agente — visão compilada"
        trailing={
          <>
            <span className="inline-flex items-center rounded-full border border-(--aw-amber-300) bg-(--aw-amber-100) px-2 py-0.5 text-[11px] font-medium text-(--aw-amber-800)">
              visão compilada
            </span>
            <FlowUpdatesBadge updates={updates} />
          </>
        }
      >
        As rotas de criar um agente pelo Agent Studio até a publicação, com os
        cenários alternativos sobrepostos: o caminho completo, o de quem não tem
        memory base (sai pra criar e volta) e o de quem não tem integração ou
        cai em gaps na revisão. Telas que os cenários compartilham viram um card
        com bolinha de cada um. Troque a lente pra focar; clique num card pra
        abrir a tela.
      </PageHero>

      {/* Canvas full-width (fora da coluna de texto) */}
      <div className="w-full px-10 pb-10">
        <Section
          id="flow"
          title="Fluxograma compilado"
          lead="2+ bolinhas num card = tela compartilhada entre cenários. A lente acinzenta o que está fora do cenário em foco e desenha a faixa dele. No modo Mover: arraste os cards e clique pra abrir a tela real. No modo Comentar: clique num card pra deixar uma nota. Botão de tela cheia no canto."
        >
          {/* Tabs de foco */}
          <div className="mb-3">{focusTabs}</div>

          {/* Legenda */}
          <div className="caption mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-(--fg-tertiary)">
            {ALL.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: SCENARIO[s].color }} />
                {SCENARIO[s].label}
              </span>
            ))}
            <span className="text-(--fg-tertiary)">·</span>
            <span>2+ bolinhas = card compartilhado · clique abre a tela</span>
          </div>

          <div
            className={
              isFullscreen
                ? "fixed inset-0 z-40 bg-(--bg-canvas) p-3"
                : "overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-canvas)"
            }
            style={isFullscreen ? undefined : { height: 880 }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.08 }}
              minZoom={0.15}
              maxZoom={1.75}
              nodesConnectable={false}
              nodesDraggable={!commentMode}
              proOptions={{ hideAttribution: true }}
              onInit={(inst) => {
                rfRef.current = inst as ReactFlowInstance
              }}
              onNodeClick={(_, node) => {
                const d = node.data as ScreenData
                if (commentMode) {
                  setComposer({ id: node.id, title: d.title })
                  return
                }
                if (node.type === "screen" && (d.variants?.length || d.href)) {
                  const variants = d.variants?.length ? d.variants : [{ label: d.title, href: d.href! }]
                  setScreenVariant(0)
                  setOpenScreen({ title: d.title, variants })
                }
              }}
            >
              <Background color="var(--border-default)" gap={24} size={1.5} />
              <Controls showInteractive={false} />

              {/* Foco — só no fullscreen (fora dele já existem chips acima do canvas) */}
              {isFullscreen && (
                <Panel position="top-left">
                  <div className="rounded-xl border border-(--border-default) bg-(--bg-raised)/95 px-3 py-2 shadow-(--shadow-md) backdrop-blur">
                    {focusTabs}
                  </div>
                </Panel>
              )}

              {/* Tela cheia (canto superior direito) */}
              <Panel position="top-right">
                <button
                  type="button"
                  onClick={() => setIsFullscreen((v) => !v)}
                  title={isFullscreen ? "Sair da tela cheia (Esc)" : "Tela cheia"}
                  className="inline-flex items-center gap-1.5 rounded-md border border-(--border-default) bg-(--bg-raised) px-2.5 py-1.5 text-xs font-medium text-(--fg-secondary) shadow-(--shadow-sm) transition hover:border-(--aw-blue-300) hover:text-(--aw-blue-700)"
                >
                  {isFullscreen ? "Sair da tela cheia ✕" : "⛶ Tela cheia"}
                </button>
              </Panel>

              {/* Toolbar Mover / Comentar (centro embaixo) */}
              <Panel position="bottom-center">
                <div className="mb-2 flex items-center gap-1 rounded-full border border-(--border-default) bg-(--bg-raised) p-1 shadow-(--shadow-md)">
                  <button
                    type="button"
                    onClick={() => setCommentMode(false)}
                    aria-pressed={!commentMode}
                    className={
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition " +
                      (!commentMode ? "bg-(--aw-blue-100) text-(--aw-blue-800)" : "text-(--fg-secondary) hover:bg-(--bg-muted)")
                    }
                  >
                    Mover
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentMode(true)}
                    aria-pressed={commentMode}
                    title="Comentar — vai pro canal que o Claude lê"
                    className={
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition " +
                      (commentMode ? "bg-(--aw-amber-100) text-(--aw-amber-800)" : "text-(--fg-secondary) hover:bg-(--bg-muted)")
                    }
                  >
                    Comentar
                  </button>
                  {commentMode && <span className="px-2 text-[11px] text-(--fg-tertiary)">clique num card pra deixar uma nota</span>}
                </div>
              </Panel>
            </ReactFlow>
          </div>
        </Section>
      </div>

      {/* Doc — coluna de texto normal */}
      <div className="mx-auto max-w-[1100px] px-10 pb-14 flex flex-col gap-16">
        {/* Cenários compilados */}
        <Section id="cenarios" title="Cenários compilados" lead="Cada jornada sobreposta neste mapa: o que é, onde entra, onde converge.">
          <ul className="flex max-w-3xl flex-col gap-4">
            <li className="flex gap-3">
              <span className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SCENARIO["criar-agente"].color }} />
              <div className="text-(--body-md-size) text-(--fg-secondary)">
                <strong className="text-(--fg-primary)">Criar agente (completo).</strong> A espinha feliz: base e integração já
                existem, então os dois gates passam direto. Studio → passos 01–08 → editor → revisão → publicar → publicado.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SCENARIO["sem-base"].color }} />
              <div className="text-(--body-md-size) text-(--fg-secondary)">
                <strong className="text-(--fg-primary)">Sem memory base.</strong> No passo 02 não há base na conta. A decisão
                <em> Tem memory base?</em> manda o usuário pra sub-jornada de criar base (/memory-base/new → construindo → base
                criada) que <strong>converge de volta no passo 03</strong>. Daí segue a espinha até publicar.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SCENARIO["sem-integracao"].color }} />
              <div className="text-(--body-md-size) text-(--fg-secondary)">
                <strong className="text-(--fg-primary)">Sem integração / gaps.</strong> No passo 03 a habilidade pede uma
                integração que não está conectada. A decisão <em>Tem integração?</em> abre a sub-jornada de conectar
                (catálogo → conectar → conectada) que <strong>converge no passo 04</strong>. Mais adiante, a revisão pega gaps
                (base não vinculada, canal incompleto, qualidade baixa) que <strong>voltam pro editor</strong> antes de publicar.
              </div>
            </li>
          </ul>
        </Section>

        {/* Telas compartilhadas e convergências */}
        <Section id="compartilhadas" title="Telas compartilhadas e convergências" lead="Por que estas telas viraram um card só — e onde os cenários se reencontram.">
          <ol className="flex max-w-3xl list-decimal flex-col gap-3 pl-5 text-(--body-md-size) text-(--fg-secondary)">
            <li>
              <strong className="text-(--fg-primary)">Toda a espinha do wizard é compartilhada.</strong> Studio, passos 01–08,
              editor, revisão, publicar e publicado têm <span className="text-(--aw-emerald-700)">3 bolinhas</span> — os 3
              cenários atravessam exatamente as mesmas telas; o que muda é só o desvio de cada gap.
            </li>
            <li>
              <strong className="text-(--fg-primary)">Convergência no passo 03 (base).</strong> Tanto o ramo <em>Já tenho base</em>
              quanto a sub-jornada de criar base reentram no passo <em>Habilidades e AOPs</em>. Um card só recebe os dois.
            </li>
            <li>
              <strong className="text-(--fg-primary)">Convergência no passo 04 (integração).</strong> O ramo <em>Tenho / pulo</em>
              e a sub-jornada de conectar integração reentram no passo <em>Canal de atendimento</em>.
            </li>
            <li>
              <strong className="text-(--fg-primary)">Editor é ponto de re-entrada.</strong> O laço de gaps da revisão volta pro
              <em> Editor do agente</em> — a mesma tela do fluxo principal, não um card novo. Corrige e volta pra revisão.
            </li>
            <li>
              <strong className="text-(--fg-primary)">Dois gates de estado e um de qualidade.</strong> <em>Tem memory base?</em> e
              <em> Tem integração?</em> são os gates que fazem os cenários divergirem; <em>Configuração completa?</em> é o
              portão final antes de publicar.
            </li>
          </ol>
        </Section>

        {/* Changelog */}
        <FlowUpdatesHistorySection updates={updates} />
      </div>

      {/* Modal de tela (≥768px → o produto desktop-only renderiza normal) */}
      {openScreen && (() => {
        const active = openScreen.variants[screenVariant] ?? openScreen.variants[0]
        const multi = openScreen.variants.length > 1
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={() => setOpenScreen(null)}>
          <div className="flex h-[84vh] w-full max-w-[1040px] flex-col overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-raised) shadow-(--shadow-lg)" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 border-b border-(--border-default) px-4 py-2.5">
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="text-sm font-medium text-(--fg-primary)">{openScreen.title}</span>
                {multi ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {openScreen.variants.map((v, i) => {
                      const on = i === screenVariant
                      return (
                        <button
                          key={v.href}
                          type="button"
                          onClick={() => setScreenVariant(i)}
                          title={v.href}
                          className={
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition " +
                            (on
                              ? "border-(--aw-blue-300) bg-(--aw-blue-100) text-(--aw-blue-800)"
                              : "border-(--border-default) bg-(--bg-canvas) text-(--fg-secondary) hover:border-(--aw-blue-300) hover:text-(--aw-blue-700)")
                          }
                        >
                          {v.label}
                          <span className="text-(--fg-tertiary)">{v.href}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <span className="caption truncate text-(--fg-tertiary)">{active.href}</span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a href={active.href} target="_blank" rel="noreferrer" className="rounded-md border border-(--border-default) bg-(--bg-canvas) px-2.5 py-1 text-xs font-medium text-(--fg-secondary) transition hover:border-(--aw-blue-300) hover:text-(--aw-blue-700)">
                  Abrir em nova aba ↗
                </a>
                <button type="button" onClick={() => setOpenScreen(null)} className="rounded-md border border-(--border-default) bg-(--bg-canvas) px-2.5 py-1 text-xs font-medium text-(--fg-secondary) transition hover:border-(--aw-blue-300) hover:text-(--aw-blue-700)">
                  Fechar ✕
                </button>
              </div>
            </div>
            <iframe key={active.href} src={active.href} title={`${openScreen.title} · ${active.label}`} className="min-h-0 w-full flex-1 bg-white" />
          </div>
        </div>
        )
      })()}

      {/* Composer de comentário — a nota vai pro /api/flow-suggestions, que o Claude lê. */}
      {composer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={() => setComposer(null)}>
          <div className="flex w-full max-w-md flex-col rounded-xl border border-(--border-default) bg-(--bg-raised) shadow-(--shadow-lg)" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2 border-b border-(--border-default) px-4 py-2.5">
              <div className="flex min-w-0 flex-col">
                <span className="aw-eyebrow text-(--aw-amber-700)">comentar no card</span>
                <span className="truncate text-sm font-medium text-(--fg-primary)">{composer.title}</span>
              </div>
              <button type="button" onClick={() => setComposer(null)} className="shrink-0 rounded-md border border-(--border-default) bg-(--bg-canvas) px-2.5 py-1 text-xs font-medium text-(--fg-secondary) transition hover:border-(--aw-blue-300) hover:text-(--aw-blue-700)">
                Fechar ✕
              </button>
            </div>

            {/* Comentários já deixados nesse card */}
            {(comments[composer.id]?.length ?? 0) > 0 && (
              <div className="flex max-h-48 flex-col gap-2 overflow-auto border-b border-(--border-default) bg-(--bg-canvas) px-4 py-3">
                {comments[composer.id].map((c) => (
                  <div key={c.id} className="rounded-md border border-(--border-default) bg-(--bg-raised) px-3 py-2 text-xs text-(--fg-secondary)">
                    {c.text}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 p-4">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="O que falta aqui? Ex: 'faltou a tela de erro quando a integração recusa o OAuth'…"
                rows={3}
                className="w-full resize-none rounded-md border border-(--border-default) bg-(--bg-canvas) px-3 py-2 text-sm outline-hidden focus:border-(--aw-blue-400)"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="caption text-(--fg-tertiary)">vai pro canal que o Claude lê</span>
                <button
                  type="button"
                  disabled={sending || !draft.trim()}
                  onClick={sendComment}
                  className="rounded-md border border-(--aw-blue-300) bg-(--aw-blue-100) px-3 py-1.5 text-xs font-medium text-(--aw-blue-800) transition hover:bg-(--aw-blue-200) disabled:opacity-40"
                >
                  {sending ? "Enviando…" : "Enviar comentário"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
