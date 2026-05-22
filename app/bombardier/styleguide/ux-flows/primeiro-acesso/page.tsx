"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Panel,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { PageHero, Section } from "../../_primitives"
import {
  FlowUpdatesBadge,
  FlowUpdatesHistorySection,
  type FlowUpdate,
} from "../_components/flow-updates"

/* ─────────────────────────────────────────────────────────────────────
 * Custom nodes
 * ──────────────────────────────────────────────────────────────────── */

type ScreenData = {
  step: string
  title: string
  href: string
  note?: string
}

function ScreenNode({ data }: NodeProps<Node<ScreenData>>) {
  return (
    <Link
      href={data.href}
      className="block w-[200px] rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-raised)] no-underline shadow-[var(--shadow-sm)] hover:border-[var(--aw-blue-400)] hover:shadow-[var(--shadow-md)] transition"
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--aw-blue-500)] !border-0 !w-2 !h-2" />
      <div className="px-4 py-3 flex flex-col gap-1">
        <span className="aw-eyebrow text-[var(--aw-blue-700)]">{data.step}</span>
        <span className="text-sm font-medium text-[var(--fg-primary)] leading-tight">
          {data.title}
        </span>
        {data.note && (
          <span className="caption text-[var(--fg-tertiary)]">{data.note}</span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-[var(--aw-blue-500)] !border-0 !w-2 !h-2" />
    </Link>
  )
}

type DecisionData = {
  step: string
  title: string
  question: string
}

function DecisionNode({ data }: NodeProps<Node<DecisionData>>) {
  const hCls = "!bg-[var(--aw-amber-500)] !border-0 !w-2 !h-2"
  return (
    <div className="w-[240px] rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--aw-amber-400)] bg-[var(--aw-amber-100)] px-4 py-3 flex flex-col gap-1">
      <Handle type="target" position={Position.Top} className={hCls} />
      <span className="aw-eyebrow text-[var(--aw-amber-800)]">decisão · {data.step}</span>
      <span className="text-sm font-medium text-[var(--aw-amber-900)] leading-tight">
        {data.title}
      </span>
      <span className="text-xs text-[var(--aw-amber-800)] leading-snug">{data.question}</span>
      <Handle id="left"   type="source" position={Position.Left}   className={hCls} />
      <Handle id="bottom" type="source" position={Position.Bottom} className={hCls} />
      <Handle id="right"  type="source" position={Position.Right}  className={hCls} />
    </div>
  )
}

const nodeTypes = {
  screen: ScreenNode,
  decision: DecisionNode,
}

/* ─────────────────────────────────────────────────────────────────────
 * Layout constants
 * ──────────────────────────────────────────────────────────────────── */

const COL   = 280
const COL_D = 260

const PIX_X    = 40
const CARTAO_X = 280
const BOLETO_X = 520

const ACESSAR_X   = 80
const CONSULTOR_X = 480

const EXPIRADO_X  = 560

const Y = {
  entrada:        0,
  linkValido:   160,
  verificacao:  360,
  conta:        520,
  perfil:       690,
  contrato:     840,
  pagamento:   1000,
  methods:     1200,
  concluido:   1400,
  finalDecision: 1560,
  finalOptions:  1720,
}

/* ─────────────────────────────────────────────────────────────────────
 * Nodes
 * ──────────────────────────────────────────────────────────────────── */

const NODES: Node[] = [
  {
    id: "entrada",
    type: "screen",
    position: { x: COL, y: Y.entrada },
    data: { step: "entrada", title: "Login", href: "/", note: "Tela de login. Clique em Primeiro acesso para iniciar o fluxo." },
  },
  {
    id: "linkValido",
    type: "decision",
    position: { x: COL_D, y: Y.linkValido },
    data: { step: "link", title: "Link ainda válido?", question: "Usuário clicou no link do e-mail em até 10 dias?" },
  },
  {
    id: "verificacao",
    type: "screen",
    position: { x: COL, y: Y.verificacao },
    data: { step: "01", title: "Verificação", href: "/primeiro-acesso/verificacao", note: "Valida o código de primeiro acesso de 6 dígitos." },
  },
  {
    id: "linkExpirado",
    type: "screen",
    position: { x: EXPIRADO_X, y: Y.verificacao },
    data: { step: "01b", title: "Link expirado", href: "/primeiro-acesso/link-expirado", note: "Fora do fluxo demo. Mostra o aviso e oferece reenvio." },
  },
  {
    id: "conta",
    type: "decision",
    position: { x: COL_D, y: Y.conta },
    data: { step: "02", title: "Sua conta", question: "Cliente cria a conta: Google, Microsoft ou senha." },
  },
  {
    id: "perfil",
    type: "screen",
    position: { x: COL, y: Y.perfil },
    data: { step: "03", title: "Seu perfil", href: "/primeiro-acesso/perfil", note: "Nome, telefone, foto e destinatários de fatura." },
  },
  {
    id: "contrato",
    type: "screen",
    position: { x: COL, y: Y.contrato },
    data: { step: "04", title: "Contrato", href: "/primeiro-acesso/contrato", note: "Revisa condições comerciais e aceita os termos." },
  },
  {
    id: "pagamento",
    type: "decision",
    position: { x: COL_D, y: Y.pagamento },
    data: { step: "05", title: "Pagamento", question: "Implementação + 1ª mensalidade. Qual o método?" },
  },
  {
    id: "pix",
    type: "screen",
    position: { x: PIX_X, y: Y.methods },
    data: { step: "05a", title: "Pix", href: "/primeiro-acesso/pagamento", note: "QR Code instantâneo. Confirmação em segundos." },
  },
  {
    id: "cartao",
    type: "screen",
    position: { x: CARTAO_X, y: Y.methods },
    data: { step: "05b", title: "Cartão de crédito", href: "/primeiro-acesso/pagamento", note: "Crédito em até 12×. Confirmação imediata." },
  },
  {
    id: "boleto",
    type: "screen",
    position: { x: BOLETO_X, y: Y.methods },
    data: { step: "05c", title: "Boleto bancário", href: "/primeiro-acesso/pagamento", note: "Vencimento em 3 dias úteis. Compensação em 1 dia útil." },
  },
  {
    id: "concluido",
    type: "screen",
    position: { x: COL, y: Y.concluido },
    data: { step: "06", title: "Concluído", href: "/primeiro-acesso/concluido", note: "Ambiente provisionado e pronto para uso." },
  },
  {
    id: "finalDecision",
    type: "decision",
    position: { x: COL_D, y: Y.finalDecision },
    data: { step: "fim", title: "O que fazer agora?", question: "Acessar a plataforma direto ou conversar com o consultor." },
  },
  {
    id: "acessar",
    type: "screen",
    position: { x: ACESSAR_X, y: Y.finalOptions },
    data: { step: "→ plataforma", title: "Acessar plataforma", href: "/inicio", note: "Home logada — entra no produto imediatamente." },
  },
  {
    id: "consultor",
    type: "screen",
    position: { x: CONSULTOR_X, y: Y.finalOptions },
    data: { step: "→ consultor", title: "Falar com consultor", href: "/suporte", note: "Agenda uma conversa com o Account Manager." },
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Edges
 * ──────────────────────────────────────────────────────────────────── */

const edgeBase = {
  type: "smoothstep" as const,
  animated: false,
  markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
  style: { stroke: "var(--border-strong)", strokeWidth: 1.5 },
}

const branchEdge = {
  ...edgeBase,
  style: { stroke: "var(--aw-amber-500)", strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: "var(--aw-amber-500)" },
}

const labelProps = {
  labelStyle: { fill: "var(--fg-secondary)", fontSize: 11, fontWeight: 500 },
  labelBgStyle: { fill: "var(--bg-canvas)" },
  labelBgPadding: [6, 4] as [number, number],
}

const EDGES: Edge[] = [
  { ...edgeBase, id: "e-entrada-linkValido", source: "entrada", target: "linkValido", label: "Primeiro acesso", ...labelProps },
  { ...branchEdge, id: "e-linkValido-verificacao", source: "linkValido", target: "verificacao", sourceHandle: "bottom", label: "Sim · até 10 dias", ...labelProps },
  { ...branchEdge, id: "e-linkValido-expirado",   source: "linkValido", target: "linkExpirado", sourceHandle: "right",  label: "Não · expirado",   ...labelProps },
  { ...edgeBase, id: "e-verificacao-conta", source: "verificacao", target: "conta" },
  { ...edgeBase, id: "e-conta-perfil", source: "conta", target: "perfil", sourceHandle: "bottom" },
  { ...edgeBase, id: "e-perfil-contrato", source: "perfil", target: "contrato" },
  { ...edgeBase, id: "e-contrato-pagamento", source: "contrato", target: "pagamento" },
  { ...branchEdge, id: "e-pagamento-pix",    source: "pagamento", target: "pix",    sourceHandle: "left",   label: "Pix",    ...labelProps },
  { ...branchEdge, id: "e-pagamento-cartao", source: "pagamento", target: "cartao", sourceHandle: "bottom", label: "Cartão", ...labelProps },
  { ...branchEdge, id: "e-pagamento-boleto", source: "pagamento", target: "boleto", sourceHandle: "right",  label: "Boleto", ...labelProps },
  { ...edgeBase, id: "e-pix-concluido",    source: "pix",    target: "concluido" },
  { ...edgeBase, id: "e-cartao-concluido", source: "cartao", target: "concluido" },
  { ...edgeBase, id: "e-boleto-concluido", source: "boleto", target: "concluido" },
  { ...edgeBase, id: "e-concluido-final",  source: "concluido", target: "finalDecision" },
  { ...branchEdge, id: "e-final-acessar",   source: "finalDecision", target: "acessar",   sourceHandle: "left",  label: "Acessar plataforma",   ...labelProps },
  { ...branchEdge, id: "e-final-consultor", source: "finalDecision", target: "consultor", sourceHandle: "right", label: "Falar com consultor", ...labelProps },
]

/* ─────────────────────────────────────────────────────────────────────
 * Suggestion system
 * ──────────────────────────────────────────────────────────────────── */

type Suggestion = {
  id: string
  description: string
  createdAt: string
  nodes: Node[]
  edges: Edge[]
}

const STORAGE_KEY = "ux-flow-suggestions-primeiro-acesso"

/* ─────────────────────────────────────────────────────────────────────
 * Screen docs
 * ──────────────────────────────────────────────────────────────────── */

const screens = [
  {
    step: "01",
    title: "Verificação",
    href: "/primeiro-acesso/verificacao",
    purpose: "Primeira tela do produto. Valida o código de primeiro acesso de 6 dígitos enviado no e-mail de convite e confirma que aquela pessoa foi convidada.",
    decisions: "Código válido → segue para a criação da conta.",
  },
  {
    step: "01b",
    title: "Link expirado",
    href: "/primeiro-acesso/link-expirado",
    purpose: "Tela condicional fora do fluxo demo. Aparece quando o usuário clica no e-mail de primeiro acesso depois do prazo de 10 dias. Apresenta o motivo (link expirado) e a ação única de solicitar um novo link.",
    decisions: 'Solicitar novo link → novo e-mail é enviado; "Voltar para o login" volta pra "/".',
  },
  {
    step: "02",
    title: "Sua conta",
    href: "/primeiro-acesso/conta",
    purpose: "Autenticação logo no início — antes de aceitar o contrato ou pagar. OAuth (Google/Microsoft) reduz fricção e é o caminho preferido; senha fica como terceira opção.",
    decisions: "Escolher entre Google, Microsoft ou senha → perfil.",
  },
  {
    step: "03",
    title: "Seu perfil",
    href: "/primeiro-acesso/perfil",
    purpose: "Cliente confirma como quer ser chamado, telefone e foto, e define quem recebe as faturas — ele mesmo e/ou outros destinatários da organização.",
    decisions: "Continuar → contrato.",
  },
  {
    step: "04",
    title: "Contrato",
    href: "/primeiro-acesso/contrato",
    purpose: "Cliente revisa dados da empresa e condições comerciais (implementação, mensalidade cheia, 1ª mensalidade prorrata), conhece o time AwSales e aceita os termos antes de pagar.",
    decisions: "Aceitar os termos → pagamento.",
  },
  {
    step: "05",
    title: "Pagamento",
    href: "/primeiro-acesso/pagamento",
    purpose: "Etapa única que cobra a implementação e a 1ª mensalidade. Três métodos disponíveis: Pix (confirmação instantânea), Cartão de crédito (em até 12×) ou Boleto bancário (compensação em 1 dia útil).",
    decisions: "Pix → QR Code; Cartão → crédito parcelado; Boleto → gerado na hora → concluído.",
  },
  {
    step: "06",
    title: "Concluído",
    href: "/primeiro-acesso/concluido",
    purpose: "Ambiente provisionado e pronto. Mostra o resumo do que foi pago, a próxima cobrança e o Account Manager. Cliente escolhe como prosseguir.",
    decisions: "Acessar plataforma → /inicio (home logada); Falar com consultor → agenda conversa com o Account Manager.",
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Updates log — structural changes only. Add new entries at the top.
 * Managed by the `bombardier-update-ux-flow` skill.
 * ──────────────────────────────────────────────────────────────────── */

const updates: FlowUpdate[] = [
  {
    date: "2026-05-21",
    summary:
      "Branch condicional 'link expirado' adicionado quando o e-mail de primeiro acesso passa de 10 dias.",
    tags: ["new-page", "new-branch"],
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────── */

export default function PrimeiroAcessoFlowPage() {
  const [editNodes, setEditNodes, onEditNodesChange] = useNodesState(NODES)
  const [editEdges, setEditEdges, onEditEdgesChange] = useEdgesState(EDGES)

  const [editMode,    setEditMode]    = useState(false)
  const [previewSugg, setPreviewSugg] = useState<Suggestion | null>(null)
  const [showSave,    setShowSave]    = useState(false)
  const [desc,        setDesc]        = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showReview,  setShowReview]  = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { setSuggestions(JSON.parse(stored)) } catch { /* invalid JSON */ }
    }
  }, [])

  function enterEdit() {
    setEditNodes([...NODES])
    setEditEdges([...EDGES])
    setPreviewSugg(null)
    setEditMode(true)
  }

  function cancelEdit() {
    setEditNodes([...NODES])
    setEditEdges([...EDGES])
    setEditMode(false)
  }

  function openSave() { setShowSave(true) }

  function confirmSave() {
    if (!desc.trim()) return
    const s: Suggestion = {
      id: Math.random().toString(36).slice(2),
      description: desc.trim(),
      createdAt: new Date().toISOString(),
      nodes: editNodes,
      edges: editEdges,
    }
    const updated = [...suggestions, s]
    setSuggestions(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setDesc("")
    setShowSave(false)
    setEditMode(false)
    setEditNodes([...NODES])
    setEditEdges([...EDGES])
  }

  function viewSugg(s: Suggestion) {
    setPreviewSugg(s)
    setEditMode(false)
    setShowReview(false)
  }

  function discardSugg(id: string) {
    const updated = suggestions.filter((s) => s.id !== id)
    setSuggestions(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    if (previewSugg?.id === id) setPreviewSugg(null)
  }

  const displayNodes = editMode ? editNodes : previewSugg ? (previewSugg.nodes as Node[]) : NODES
  const displayEdges = editMode ? editEdges : previewSugg ? (previewSugg.edges as Edge[]) : EDGES

  return (
    <>
      <PageHero
        title="Primeiro acesso"
        trailing={<FlowUpdatesBadge updates={updates} />}
      >
        Fluxo completo de onboarding do novo cliente, em 6 etapas. O cliente se
        autentica logo no começo — antes de aceitar o contrato e de qualquer
        pagamento. Use este mapa quando precisar entender pra onde uma decisão
        leva, ou ao iterar em qualquer tela do fluxo.
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed max-w-2xl -mt-8">
          Seis etapas lineares do convite ao ambiente ativo: verificação do código,
          criação de conta, perfil, contrato, pagamento (com 3 métodos disponíveis) e
          confirmação. A autenticação acontece na etapa 02 — antes do contrato e de
          qualquer cobrança. Há um ramo condicional logo no início: se o link de e-mail
          expirar (10 dias), o usuário cai numa tela de reenvio fora do fluxo demo. No
          final, o cliente escolhe acessar a plataforma direto ou conversar com o
          consultor.
        </p>

        <Section
          id="flow"
          title="Fluxograma"
          lead="Clique em qualquer tela pra abrir o protótipo. Caixas tracejadas em âmbar são decisões — pontos em que o cliente faz uma escolha. Setas âmbar indicam os caminhos de bifurcação."
        >
          {/* Canvas wrapper — relative so we can layer the action buttons */}
          <div className="relative">
            {/* Top-right: suggest + suggestions badge */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              {suggestions.length > 0 && !editMode && (
                <button
                  onClick={() => setShowReview(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--aw-amber-100)] border border-[var(--aw-amber-300)] text-xs font-medium text-[var(--aw-amber-800)] hover:bg-[var(--aw-amber-200)] transition"
                >
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--aw-amber-500)] text-white text-[10px] font-bold">
                    {suggestions.length}
                  </span>
                  {suggestions.length === 1 ? "sugestão" : "sugestões"}
                </button>
              )}
              {!editMode && !previewSugg && (
                <button
                  onClick={enterEdit}
                  className="px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--bg-raised)] border border-[var(--border-default)] text-xs font-medium text-[var(--fg-secondary)] hover:border-[var(--aw-blue-400)] hover:text-[var(--aw-blue-700)] transition"
                >
                  Sugerir edição
                </button>
              )}
            </div>

            <div
              className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-subtle)] overflow-hidden"
              style={{ height: 1960 }}
            >
              <ReactFlow
                nodes={displayNodes}
                edges={displayEdges}
                nodeTypes={nodeTypes}
                onNodesChange={editMode ? onEditNodesChange : undefined}
                onEdgesChange={editMode ? onEditEdgesChange : undefined}
                nodesDraggable={editMode}
                nodesConnectable={editMode}
                elementsSelectable={editMode}
                fitView
                fitViewOptions={{ padding: 0.12 }}
                proOptions={{ hideAttribution: true }}
                minZoom={0.3}
                maxZoom={1.5}
                style={{ background: "var(--bg-subtle)" }}
              >
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={24}
                  size={1.5}
                  color="var(--border-default)"
                />
                <Controls showInteractive={false} />

                {/* Edit mode floating bar */}
                {editMode && (
                  <Panel position="top-center">
                    <div className="flex items-center gap-3 bg-[var(--aw-amber-100)] border border-[var(--aw-amber-300)] rounded-[var(--radius-md)] px-4 py-2 text-sm shadow-[var(--shadow-md)]">
                      <span className="text-[var(--aw-amber-800)] font-medium">Modo sugestão ativo</span>
                      <span className="text-[var(--aw-amber-500)]">·</span>
                      <button
                        onClick={openSave}
                        className="text-[var(--aw-amber-900)] font-semibold hover:underline"
                      >
                        Salvar sugestão
                      </button>
                      <span className="text-[var(--aw-amber-500)]">·</span>
                      <button
                        onClick={cancelEdit}
                        className="text-[var(--aw-amber-700)] hover:text-[var(--aw-amber-900)]"
                      >
                        Cancelar
                      </button>
                    </div>
                  </Panel>
                )}

                {/* Preview mode floating bar */}
                {previewSugg && (
                  <Panel position="top-center">
                    <div className="flex items-center gap-3 bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-2 text-sm shadow-[var(--shadow-md)]">
                      <span className="text-[var(--fg-tertiary)] text-xs uppercase tracking-wide font-medium">Sugestão</span>
                      <span className="text-[var(--fg-primary)] font-medium max-w-xs truncate">{previewSugg.description}</span>
                      <span className="text-[var(--fg-tertiary)]">·</span>
                      <button
                        onClick={() => setPreviewSugg(null)}
                        className="text-[var(--aw-blue-700)] font-medium hover:text-[var(--aw-blue-800)] hover:underline whitespace-nowrap"
                      >
                        Voltar ao fluxo oficial
                      </button>
                    </div>
                  </Panel>
                )}
              </ReactFlow>
            </div>
          </div>
        </Section>

        <Section
          id="screens"
          title="Cada tela"
          lead="Propósito, decisões e link direto pro protótipo de cada uma."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
            <ul className="m-0 p-0 list-none flex flex-col divide-y divide-[var(--border-subtle)]">
              {screens.map((s) => (
                <li key={s.step + s.title} className="p-5 flex flex-col gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className="aw-eyebrow text-[var(--aw-blue-700)]">{s.step}</span>
                    <h3 className="m-0 text-base font-medium text-[var(--fg-primary)]">{s.title}</h3>
                  </div>
                  <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">{s.purpose}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1">
                    <span className="caption">
                      <span className="font-medium text-[var(--fg-secondary)]">Decisões: </span>
                      {s.decisions}
                    </span>
                    <Link
                      href={s.href}
                      className="text-sm font-medium text-[var(--aw-blue-700)] hover:text-[var(--aw-blue-800)] no-underline hover:underline"
                    >
                      Abrir protótipo →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section
          id="design-notes"
          title="Decisões de design"
          lead="Por que o fluxo está estruturado desse jeito."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Autenticar antes de tudo</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                O cliente cria a conta na etapa 02 — antes de aceitar o contrato e antes de qualquer pagamento. Ninguém concorda com contrato ou paga sem uma identidade verificada por trás.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Verificação é a etapa 01</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                A primeira tela do produto valida o código de primeiro acesso enviado no convite. É o portão de entrada — só quem foi convidado segue para a criação da conta.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Três métodos de pagamento</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Pix para quem quer confirmar na hora, cartão de crédito para parcelamento, boleto para quem prefere o meio bancário tradicional. Todos convergem pro mesmo estado "Concluído".
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">OAuth como caminho preferido</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Google/Microsoft no topo, senha como terceira opção. Usuário corporativo (público-alvo) prefere SSO. Reduz reset de senha no longo prazo.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Link expira em 10 dias</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Links de primeiro acesso são one-time e expiram após 10 dias. Quem clica depois cai numa tela explícita com reemissão imediata — evita o silêncio frustrante de um link que simplesmente não funciona, sem explicar por quê.
              </p>
            </div>
          </div>
        </Section>

        <FlowUpdatesHistorySection updates={updates} />
      </div>

      {/* ── Save suggestion dialog ──────────────────────────────────────── */}
      {showSave && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowSave(false)}
        >
          <div
            className="bg-[var(--bg-raised)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] w-full max-w-md mx-4 p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-base font-semibold text-[var(--fg-primary)] m-0">Salvar sugestão</h2>
              <p className="text-sm text-[var(--fg-secondary)] mt-1 m-0">Descreva brevemente o que você alterou no fluxo.</p>
            </div>
            <textarea
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--aw-blue-400)] resize-none"
              placeholder="Ex: movi o nó de pagamento para antes do contrato..."
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSave(false)}
                className="px-4 py-2 rounded-[var(--radius-md)] border border-[var(--border-default)] text-sm font-medium text-[var(--fg-secondary)] hover:bg-[var(--bg-subtle)] transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSave}
                disabled={!desc.trim()}
                className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--aw-blue-600)] text-white text-sm font-medium hover:bg-[var(--aw-blue-700)] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Review suggestions panel ────────────────────────────────────── */}
      {showReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowReview(false)}
        >
          <div
            className="bg-[var(--bg-raised)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] w-full max-w-lg mx-4 p-6 flex flex-col gap-4 max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--fg-primary)] m-0">
                Sugestões
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--aw-amber-500)] text-white text-[10px] font-bold align-middle">
                  {suggestions.length}
                </span>
              </h2>
              <button
                onClick={() => setShowReview(false)}
                className="text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] text-lg leading-none"
              >
                ×
              </button>
            </div>

            <ul className="flex flex-col gap-3 overflow-y-auto m-0 p-0 list-none">
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 flex flex-col gap-2"
                >
                  <p className="m-0 text-sm font-medium text-[var(--fg-primary)] leading-snug">{s.description}</p>
                  <span className="caption text-[var(--fg-tertiary)]">
                    {new Date(s.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => viewSugg(s)}
                      className="px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--aw-blue-600)] text-white text-xs font-medium hover:bg-[var(--aw-blue-700)] transition"
                    >
                      Visualizar
                    </button>
                    <button
                      onClick={() => discardSugg(s.id)}
                      className="px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] text-xs font-medium text-[var(--fg-secondary)] hover:bg-[var(--bg-subtle)] transition"
                    >
                      Descartar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
