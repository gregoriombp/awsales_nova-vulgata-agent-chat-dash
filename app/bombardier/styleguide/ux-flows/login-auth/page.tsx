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

const GOOGLE_X  = 40
const MS_X      = 520
const MFA_X     = 480

const ERRO_X    = 740
const ERRO_D_X  = 720

const PRIMEIRO_ACESSO_X = 40

const Y = {
  entrada:           0,
  metodo:          180,
  branches:        380,
  valid:           540,
  errMfaRow:       720,
  mfaMfa:          920,
  recDec:          920,
  primeiroAcessoDec: 1100,
  platform:        1280,
  primeiroAcesso:  1280,
  recEmail:        1120,
  recSent:         1300,
  novaSenha:       1480,
  senhaRedef:      1660,
}

/* ─────────────────────────────────────────────────────────────────────
 * Nodes
 * ──────────────────────────────────────────────────────────────────── */

const NODES: Node[] = [
  {
    id: "entrada",
    type: "screen",
    position: { x: COL, y: Y.entrada },
    data: { step: "entrada", title: "Login", href: "#", note: "Tela inicial da plataforma. Escolher método de acesso ou recuperar senha." },
  },
  {
    id: "metodo",
    type: "decision",
    position: { x: COL_D, y: Y.metodo },
    data: { step: "01", title: "Método de acesso", question: "Como o usuário quer entrar na plataforma?" },
  },
  {
    id: "oauthGoogle",
    type: "screen",
    position: { x: GOOGLE_X, y: Y.branches },
    data: { step: "02a", title: "OAuth Google", href: "#", note: "Redirecionamento OAuth 2.0 para conta Google corporativa." },
  },
  {
    id: "credenciais",
    type: "screen",
    position: { x: COL, y: Y.branches },
    data: { step: "02b", title: "E-mail + senha", href: "#", note: "Inserir e-mail e senha cadastrados na plataforma." },
  },
  {
    id: "oauthMs",
    type: "screen",
    position: { x: MS_X, y: Y.branches },
    data: { step: "02c", title: "OAuth Microsoft", href: "#", note: "Redirecionamento OAuth 2.0 para conta Microsoft / Azure AD." },
  },
  {
    id: "valid",
    type: "decision",
    position: { x: COL_D, y: Y.valid },
    data: { step: "03", title: "Credenciais válidas?", question: "E-mail e senha conferem com os dados cadastrados?" },
  },
  {
    id: "mfaDec",
    type: "decision",
    position: { x: COL_D, y: Y.errMfaRow },
    data: { step: "04", title: "MFA ativo?", question: "A conta tem autenticação de dois fatores habilitada?" },
  },
  {
    id: "erro",
    type: "screen",
    position: { x: ERRO_X, y: Y.errMfaRow },
    data: { step: "→ erro", title: "Erro de login", href: "#", note: "E-mail ou senha incorretos. Máximo de tentativas pode bloquear a conta." },
  },
  {
    id: "mfa",
    type: "screen",
    position: { x: MFA_X, y: Y.mfaMfa },
    data: { step: "05", title: "Verificação MFA", href: "#", note: "Código de 6 dígitos via app autenticador ou SMS." },
  },
  {
    id: "recDec",
    type: "decision",
    position: { x: ERRO_D_X, y: Y.recDec },
    data: { step: "A", title: "O que fazer?", question: "Tentar novamente com outra senha ou recuperar o acesso?" },
  },
  {
    id: "primeiroAcessoDec",
    type: "decision",
    position: { x: COL_D, y: Y.primeiroAcessoDec },
    data: { step: "06", title: "Primeiro acesso?", question: "Backend detecta se é a primeira vez que esse usuário entra na plataforma." },
  },
  {
    id: "primeiroAcesso",
    type: "screen",
    position: { x: PRIMEIRO_ACESSO_X, y: Y.primeiroAcesso },
    data: { step: "→ onboarding", title: "Fluxo de primeiro acesso", href: "/bombardier/styleguide/ux-flows/primeiro-acesso", note: "Redireciona para o onboarding completo (perfil, contrato, pagamento)." },
  },
  {
    id: "platform",
    type: "screen",
    position: { x: COL, y: Y.platform },
    data: { step: "→ plataforma", title: "Entrou na plataforma", href: "/inicio", note: "Home logada. Sessão autenticada com acesso completo ao produto." },
  },
  {
    id: "recEmail",
    type: "screen",
    position: { x: ERRO_X, y: Y.recEmail },
    data: { step: "B1", title: "Inserir e-mail", href: "#", note: "Usuário informa o e-mail cadastrado para receber o link de redefinição." },
  },
  {
    id: "recSent",
    type: "screen",
    position: { x: ERRO_X, y: Y.recSent },
    data: { step: "B2", title: "E-mail enviado", href: "#", note: "Confirmação de envio. Usuário deve abrir o link no cliente de e-mail." },
  },
  {
    id: "novaSenha",
    type: "screen",
    position: { x: ERRO_X, y: Y.novaSenha },
    data: { step: "B3", title: "Nova senha", href: "#", note: "Tela aberta pelo link do e-mail. Usuário define e confirma a nova senha." },
  },
  {
    id: "senhaRedef",
    type: "screen",
    position: { x: ERRO_X, y: Y.senhaRedef },
    data: { step: "B4", title: "Senha redefinida", href: "#", note: "Confirmação de sucesso. Redireciona automaticamente para a tela de login." },
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
  { ...edgeBase,   id: "e-entrada-metodo",       source: "entrada",    target: "metodo",    label: "Acessar",                ...labelProps },
  { ...branchEdge, id: "e-metodo-google",         source: "metodo",     target: "oauthGoogle", sourceHandle: "left",   label: "Google",         ...labelProps },
  { ...branchEdge, id: "e-metodo-cred",           source: "metodo",     target: "credenciais", sourceHandle: "bottom", label: "E-mail + senha", ...labelProps },
  { ...branchEdge, id: "e-metodo-ms",             source: "metodo",     target: "oauthMs",     sourceHandle: "right",  label: "Microsoft",      ...labelProps },
  { ...edgeBase,   id: "e-google-primacesso",      source: "oauthGoogle",target: "primeiroAcessoDec" },
  { ...edgeBase,   id: "e-ms-primacesso",         source: "oauthMs",    target: "primeiroAcessoDec" },
  { ...edgeBase,   id: "e-cred-valid",            source: "credenciais",target: "valid" },
  { ...branchEdge, id: "e-valid-mfadec",          source: "valid",      target: "mfaDec",            sourceHandle: "bottom", label: "Corretas",  ...labelProps },
  { ...branchEdge, id: "e-valid-erro",            source: "valid",      target: "erro",              sourceHandle: "right",  label: "Inválidas", ...labelProps },
  { ...branchEdge, id: "e-mfadec-mfa",            source: "mfaDec",     target: "mfa",               sourceHandle: "right",  label: "MFA ativo", ...labelProps },
  { ...branchEdge, id: "e-mfadec-primacesso",     source: "mfaDec",     target: "primeiroAcessoDec", sourceHandle: "bottom", label: "Sem MFA",   ...labelProps },
  { ...edgeBase,   id: "e-mfa-primacesso",        source: "mfa",        target: "primeiroAcessoDec" },
  { ...branchEdge, id: "e-primacesso-onboarding", source: "primeiroAcessoDec", target: "primeiroAcesso", sourceHandle: "left",   label: "Primeiro acesso", ...labelProps },
  { ...branchEdge, id: "e-primacesso-platform",   source: "primeiroAcessoDec", target: "platform",       sourceHandle: "bottom", label: "Já cadastrado",   ...labelProps },
  { ...edgeBase,   id: "e-erro-recdec",           source: "erro",       target: "recDec" },
  { ...branchEdge, id: "e-recdec-credenciais",    source: "recDec",     target: "credenciais", sourceHandle: "left",  label: "Tentar novamente", ...labelProps },
  { ...branchEdge, id: "e-recdec-recemail",       source: "recDec",     target: "recEmail",    sourceHandle: "bottom", label: "Esqueci a senha",  ...labelProps },
  { ...edgeBase,   id: "e-recemail-recsent",      source: "recEmail",   target: "recSent" },
  { ...edgeBase,   id: "e-recsent-novasenha",     source: "recSent",    target: "novaSenha",   label: "Clica no link",   ...labelProps },
  { ...edgeBase,   id: "e-novasenha-senharedef",  source: "novaSenha",  target: "senhaRedef" },
  { ...edgeBase,   id: "e-senharedef-entrada",    source: "senhaRedef", target: "entrada",     label: "Voltar ao login", ...labelProps },
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

const STORAGE_KEY = "ux-flow-suggestions-login-auth"

/* ─────────────────────────────────────────────────────────────────────
 * Screen docs
 * ──────────────────────────────────────────────────────────────────── */

const screens = [
  {
    step: "entrada",
    title: "Login",
    href: "#",
    purpose: "Ponto de entrada da plataforma. Apresenta as opções de autenticação e o link de recuperação de senha. Nenhuma sessão existe ainda — qualquer acesso parte daqui.",
    decisions: "Escolher método: Google, Microsoft ou e-mail + senha. Ou acessar recuperação de senha.",
  },
  {
    step: "02a / 02c",
    title: "OAuth Google / Microsoft",
    href: "#",
    purpose: "Fluxo OAuth 2.0 gerenciado pelo provedor. O usuário é redirecionado, autentica no provedor e retorna com um token. Nenhuma senha é digitada na plataforma.",
    decisions: "Autenticação bem-sucedida → sessão criada → plataforma.",
  },
  {
    step: "02b",
    title: "E-mail + senha",
    href: "#",
    purpose: "Formulário de credenciais nativas. O usuário informa o e-mail e a senha cadastrados. A validação ocorre no servidor.",
    decisions: "Credenciais corretas → verificar MFA. Inválidas → tela de erro.",
  },
  {
    step: "04",
    title: "MFA — decisão",
    href: "#",
    purpose: "Verificação server-side se a conta tem autenticação de dois fatores habilitada. Acontece de forma transparente logo após a validação das credenciais.",
    decisions: "MFA ativo → tela de verificação MFA. Sem MFA → sessão criada → plataforma.",
  },
  {
    step: "05",
    title: "Verificação MFA",
    href: "#",
    purpose: "Tela de segundo fator. O usuário insere o código de 6 dígitos gerado pelo app autenticador ou recebido por SMS. Só aparece quando 2FA está ativado.",
    decisions: "Código válido → sessão criada → plataforma. Código inválido → mensagem de erro na mesma tela.",
  },
  {
    step: "→ erro",
    title: "Erro de login",
    href: "#",
    purpose: "Feedback de credenciais inválidas. Exibe mensagem genérica sem revelar se o e-mail existe. Múltiplas tentativas consecutivas podem bloquear temporariamente a conta.",
    decisions: "Tentar novamente → volta ao formulário de credenciais. Esqueci a senha → inicia recuperação.",
  },
  {
    step: "B1",
    title: "Inserir e-mail",
    href: "#",
    purpose: "Primeiro passo da recuperação. O usuário informa o e-mail cadastrado. A plataforma envia o link mesmo que o e-mail não exista, para evitar enumeração de contas.",
    decisions: "Confirmar e-mail → link de redefinição enviado.",
  },
  {
    step: "B2",
    title: "E-mail enviado",
    href: "#",
    purpose: "Tela de confirmação. Instrui o usuário a verificar a caixa de entrada e o spam. O link expira em 30 minutos.",
    decisions: "Ação externa: usuário abre o e-mail e clica no link de redefinição.",
  },
  {
    step: "B3",
    title: "Nova senha",
    href: "#",
    purpose: "Tela aberta pelo link do e-mail de recuperação. O usuário define e confirma a nova senha. O token do link é validado antes de exibir o formulário.",
    decisions: "Senha válida e confirmada → senha redefinida. Link expirado → mensagem de erro com opção de reenvio.",
  },
  {
    step: "06",
    title: "Primeiro acesso? (decisão do backend)",
    href: "#",
    purpose: "Após qualquer autenticação bem-sucedida (OAuth ou e-mail+senha), o backend verifica se aquele usuário já tem conta ativa na organização. Decisão transparente — o usuário não vê nenhuma tela extra.",
    decisions: "Primeiro acesso → redireciona para o fluxo de onboarding (perfil, contrato, pagamento). Já cadastrado → entra direto na plataforma.",
  },
  {
    step: "B4",
    title: "Senha redefinida",
    href: "#",
    purpose: "Confirmação de sucesso da redefinição. Exibe mensagem e redireciona automaticamente para a tela de login após alguns segundos.",
    decisions: "Redirecionamento automático → login (entrada).",
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────── */

export default function LoginAuthFlowPage() {
  const [editNodes, setEditNodes, onEditNodesChange] = useNodesState(NODES)
  const [editEdges, setEditEdges, onEditEdgesChange] = useEdgesState(EDGES)

  const [editMode,     setEditMode]     = useState(false)
  const [previewSugg,  setPreviewSugg]  = useState<Suggestion | null>(null)
  const [showSave,     setShowSave]     = useState(false)
  const [desc,         setDesc]         = useState("")
  const [suggestions,  setSuggestions]  = useState<Suggestion[]>([])
  const [showReview,   setShowReview]   = useState(false)

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
      <PageHero title="Login e autenticação">
        Fluxo completo de acesso à plataforma — desde a tela de login até a sessão
        autenticada — cobrindo todos os cenários: OAuth (Google e Microsoft), e-mail com
        senha, MFA e recuperação de senha. Use este mapa ao iterar em qualquer tela do
        processo de autenticação.
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed max-w-2xl -mt-8">
          O fluxo parte da tela de login e se divide em três caminhos de autenticação: OAuth
          via Google, OAuth via Microsoft e e-mail com senha. O caminho de e-mail tem dois
          sub-cenários — credenciais inválidas (com recuperação de senha) e verificação MFA
          (quando 2FA está ativo). Todos os caminhos válidos convergem numa decisão do backend:
          se for o primeiro acesso do usuário, ele é redirecionado para o fluxo de onboarding
          completo (perfil, contrato, pagamento); se já é cadastrado, entra direto na plataforma.
          Isso vale para OAuth e e-mail com senha — o comportamento é igual.
        </p>

        <Section
          id="flow"
          title="Fluxograma"
          lead="Clique em qualquer tela pra abrir o protótipo. Caixas tracejadas em âmbar são decisões — pontos em que o sistema ou o usuário faz uma escolha. Setas âmbar indicam os caminhos de bifurcação."
        >
          <div className="relative">
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
              style={{ height: 1900 }}
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

                {editMode && (
                  <Panel position="top-center">
                    <div className="flex items-center gap-3 bg-[var(--aw-amber-100)] border border-[var(--aw-amber-300)] rounded-[var(--radius-md)] px-4 py-2 text-sm shadow-[var(--shadow-md)]">
                      <span className="text-[var(--aw-amber-800)] font-medium">Modo sugestão ativo</span>
                      <span className="text-[var(--aw-amber-500)]">·</span>
                      <button onClick={openSave} className="text-[var(--aw-amber-900)] font-semibold hover:underline">
                        Salvar sugestão
                      </button>
                      <span className="text-[var(--aw-amber-500)]">·</span>
                      <button onClick={cancelEdit} className="text-[var(--aw-amber-700)] hover:text-[var(--aw-amber-900)]">
                        Cancelar
                      </button>
                    </div>
                  </Panel>
                )}

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
              <div className="aw-eyebrow mb-2">OAuth como caminho preferido</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Google e Microsoft aparecem como primeiras opções. O público-alvo (times de vendas B2B) já usa SSO corporativo no dia a dia. Menos fricção de entrada e zero reuso de senha fraca.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">MFA é verificação server-side</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                O nó de decisão MFA representa uma verificação automática do servidor, não uma escolha do usuário. A tela de código só aparece quando 2FA está configurado — o fluxo não precisa perguntar ao usuário.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Erro genérico por segurança</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                A tela de erro não diferencia "e-mail inexistente" de "senha incorreta". Mensagens genéricas impedem enumeração de contas. O mesmo princípio se aplica ao formulário de recuperação de senha.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Primeiro acesso detectado pelo backend</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Após qualquer autenticação válida — OAuth ou e-mail com senha — o backend verifica se o usuário já tem conta ativa. Se for o primeiro acesso, ele é redirecionado para o fluxo de onboarding completo (perfil, contrato, pagamento). O usuário de e-mail+senha recebe uma senha temporária no convite e a usa nessa tela.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Recuperação retorna ao login</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Após redefinir a senha, o usuário volta à tela de login — não entra direto na plataforma. O motivo é garantir que a nova credencial funciona antes de criar a sessão, e manter o fluxo auditável.
              </p>
            </div>
          </div>
        </Section>
      </div>

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
              placeholder="Ex: adicionei um nó de bloqueio de conta após 5 tentativas..."
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
