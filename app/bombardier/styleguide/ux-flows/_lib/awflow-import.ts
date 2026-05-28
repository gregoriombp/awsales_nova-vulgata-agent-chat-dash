/* ============================================================
   awflow-import.ts — leitura/validação/mapeamento de arquivos
   .awflow.json gerados pelo repo do PG.

   Camadas:
   - schema (cópia da contraparte do PG — sincronizadas via
     AWFLOW_SCHEMA_VERSION; drift é risco aceito);
   - parseAwFlowFile() valida runtime (input vem de fora do repo);
   - mapAwFlowToLocal() converte pro shape esperado por <FlowEditor>
     (Node<ScreenData|DecisionData>[] + Edge[] + meta + proposed
     update). Função pura, sem side effects.

   Esse módulo NÃO tem UI. As skills (futuras) consomem ele:
     1. lê o arquivo anexado
     2. parse + map
     3. orquestra criar novo flow vs mesclar com existente
     4. resolve hrefs em falta perguntando ao usuário
   ============================================================ */
import type { Edge, Node } from "@xyflow/react"
import { MarkerType } from "@xyflow/react"
import type { ScreenData, DecisionData } from "../_components/flow-editor"
import type { FlowUpdate } from "../_components/flow-updates"

/* MarkerType.ArrowClosed = "arrowclosed" em runtime. Mantemos const local
   pra evitar dependência de runtime resolution (alguns contextos server-side
   importam só o `type` enum e ficam sem valor). */
const ARROW_CLOSED: MarkerType = "arrowclosed" as MarkerType

/* ============================================================
   Schema (cópia do contrato em
   app/bombardier/prototype/_lib/awflow/schema.ts no repo do PG).
   Mantenha em sincronia via schemaVersion.
   ============================================================ */

export const AWFLOW_SCHEMA_VERSION = 1 as const

export type AwFlowNodeKind = "screen" | "decision"
export type AwFlowSide = "t" | "b" | "l" | "r"
export type AwFlowSection = "studio" | "adm"
export type AwFlowChrome = "studio" | "bare"
export type AwFlowLayoutDirection = "TB" | "BT" | "LR" | "RL"

export type AwFlowNode = {
  id: string
  kind: AwFlowNodeKind
  title: string
  tag: string | null
  note: string | null
  question: string | null
  position: { x: number; y: number }
}

export type AwFlowEdge = {
  from: string
  to: string
  label: string | null
  branch: boolean
  fromSide: AwFlowSide | null
  toSide: AwFlowSide | null
}

export type AwFlowCriterionType =
  | "permissao"
  | "evento"
  | "validacao"
  | "billing"
  | "multi-tenant"
  | "audit"
  | "ux"
  | "regra"

export type AwFlowCriterion = { type: AwFlowCriterionType; text: string }

export type AwFlowScenario = {
  id: string
  title: string
  given: string
  when: string
  then: string
}

export type AwFlowScreen = {
  id: string
  name: string
  purpose: string
  scenarios: AwFlowScenario[]
  criteria: AwFlowCriterion[]
}

export type AwFlowNarrative = {
  persona: string
  context: string
  value: string
}

export type AwFlowMeta = {
  id: string
  label: string
  summary: string
  icon: string
  section: AwFlowSection
  chrome: AwFlowChrome
  layoutDirection: AwFlowLayoutDirection
  manualLayout: boolean
}

export type AwFlowFile = {
  schemaVersion: typeof AWFLOW_SCHEMA_VERSION
  exportedAt: string
  exportedFrom: { repo: string; route: string }
  flow: AwFlowMeta
  graph: { nodes: AwFlowNode[]; edges: AwFlowEdge[] }
  screens: AwFlowScreen[]
  narrative: AwFlowNarrative | null
}

/* ============================================================
   Parser — valida shape mínimo. Aceita .awflow.json vindo do
   PG ou de qualquer fonte que respeite o contrato. Não tenta
   recuperar de erros; retorna erro pra skill mostrar pro usuário.
   ============================================================ */

export type ParseResult =
  | { ok: true; file: AwFlowFile }
  | { ok: false; error: string }

export function parseAwFlowFile(input: unknown): ParseResult {
  const errs: string[] = []
  const v = input as Record<string, unknown> | null
  if (!v || typeof v !== "object") return { ok: false, error: "arquivo não é um objeto JSON" }

  if (v.schemaVersion !== AWFLOW_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `schemaVersion incompatível — esperado ${AWFLOW_SCHEMA_VERSION}, recebido ${JSON.stringify(v.schemaVersion)}`,
    }
  }

  if (typeof v.exportedAt !== "string") errs.push("exportedAt deve ser string ISO-8601")
  if (!v.flow || typeof v.flow !== "object") errs.push("flow ausente")
  if (!v.graph || typeof v.graph !== "object") errs.push("graph ausente")
  else {
    const g = v.graph as { nodes?: unknown; edges?: unknown }
    if (!Array.isArray(g.nodes)) errs.push("graph.nodes deve ser array")
    if (!Array.isArray(g.edges)) errs.push("graph.edges deve ser array")
  }
  if (!Array.isArray(v.screens)) errs.push("screens deve ser array")

  if (errs.length > 0) return { ok: false, error: errs.join("; ") }
  return { ok: true, file: v as unknown as AwFlowFile }
}

/* ============================================================
   Mapper — converte o arquivo no shape que <FlowEditor> consome.

   O que NÃO mapeia automaticamente:
   - ScreenData.href: PG não tem o conceito de href (rotas reais).
     Deixamos vazio; a skill consumidora resolve perguntando.
   - toSide nos edges: meus nodes só têm target em Position.Top.
     Preservamos em data.originalSides pra debug, mas não usamos.
   ============================================================ */

type LocalScreenNode = Node<ScreenData>
type LocalDecisionNode = Node<DecisionData>
type LocalNode = LocalScreenNode | LocalDecisionNode

type EdgeData = {
  originalSides?: { fromSide: AwFlowSide | null; toSide: AwFlowSide | null }
}

export type MapResult = {
  meta: {
    id: string
    title: string
    description: string
    section: AwFlowSection
  }
  nodes: LocalNode[]
  edges: Edge<EdgeData>[]
  screens: AwFlowScreen[]
  narrative: AwFlowNarrative | null
  /** Sugestão de entrada pra updates[] caso seja merge. A skill ajusta texto. */
  proposedUpdate: FlowUpdate
  /** IDs de screens sem href definido — a skill precisa preencher. */
  screensMissingHref: string[]
}

export function mapAwFlowToLocal(file: AwFlowFile): MapResult {
  const screensById = new Map(file.screens.map((s) => [s.id, s]))
  const nodes: LocalNode[] = file.graph.nodes.map((n) => mapNode(n, screensById.get(n.id)))
  const edges: Edge<EdgeData>[] = file.graph.edges.map((e, i) => mapEdge(e, i, file.graph.nodes))

  const screensMissingHref = nodes
    .filter((n): n is LocalScreenNode => n.type === "screen")
    .filter((n) => !n.data.href)
    .map((n) => n.id)

  return {
    meta: {
      id: file.flow.id,
      title: file.flow.label,
      description: file.flow.summary,
      section: file.flow.section,
    },
    nodes,
    edges,
    screens: file.screens,
    narrative: file.narrative,
    proposedUpdate: buildProposedUpdate(file),
    screensMissingHref,
  }
}

function mapNode(n: AwFlowNode, screen: AwFlowScreen | undefined): LocalNode {
  if (n.kind === "decision") {
    return {
      id: n.id,
      type: "decision",
      position: n.position,
      data: {
        step: n.tag ?? "",
        title: n.title,
        question: n.question ?? "",
      },
    }
  }
  /* screen — note pode vir do node OU do screen.purpose (preferimos
     o node.note quando explicitado, senão usamos o purpose do spec). */
  const note = n.note ?? screen?.purpose ?? ""
  return {
    id: n.id,
    type: "screen",
    position: n.position,
    data: {
      step: n.tag ?? "",
      title: n.title,
      href: "",
      note: note || undefined,
    },
  }
}

const HANDLE_BY_SIDE: Record<AwFlowSide, string> = {
  t: "top",
  b: "bottom",
  l: "left",
  r: "right",
}

function mapEdge(e: AwFlowEdge, i: number, nodes: AwFlowNode[]): Edge<EdgeData> {
  const sourceNode = nodes.find((n) => n.id === e.from)
  const sourceIsDecision = sourceNode?.kind === "decision"

  const sourceHandle =
    sourceIsDecision && e.fromSide && e.fromSide !== "t"
      ? HANDLE_BY_SIDE[e.fromSide]
      : undefined

  const baseStyle = e.branch
    ? { stroke: "var(--aw-amber-500)", strokeWidth: 1.5 }
    : { stroke: "var(--border-strong)", strokeWidth: 1.5 }

  const markerColor = e.branch ? "var(--aw-amber-500)" : undefined

  return {
    id: `e-${i}-${e.from}-${e.to}`,
    source: e.from,
    target: e.to,
    sourceHandle,
    label: e.label ?? undefined,
    type: "smoothstep",
    animated: false,
    markerEnd: {
      type: ARROW_CLOSED,
      width: 18,
      height: 18,
      ...(markerColor ? { color: markerColor } : {}),
    },
    style: baseStyle,
    data: { originalSides: { fromSide: e.fromSide, toSide: e.toSide } },
  }
}

function buildProposedUpdate(file: AwFlowFile): FlowUpdate {
  const today = todayISODate()
  return {
    date: today,
    summary: `Estrutura importada de ${file.exportedFrom.repo} (export de ${file.exportedAt.slice(0, 10)}).`,
    tags: ["flow-rework"],
  }
}

function todayISODate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
