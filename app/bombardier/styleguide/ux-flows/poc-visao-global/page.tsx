"use client"

/* ─────────────────────────────────────────────────────────────────────
 * POC · Visão global com lentes — MERGE REAL dos 4 flows (v2, fidelidade)
 *
 * Fusão dos 4 flows de acesso (login-auth, primeiro-acesso, convite-membro,
 * organizacao-adicional) num grafo só. v2: a autenticação do login voltou
 * INTEIRA (e-mail/HRD, Google, Microsoft, SSO empresa, magic link,
 * recuperação) — na v1 eu tinha colapsado num card só e isso quebrava a
 * informação. Pagamento e 2FA também reabertos.
 *
 * Peças:
 *   1. Dedup — telas que se repetem entre flows viram UM card, com bolinha
 *      de cada persona dona (2+ bolinhas = compartilhado).
 *   2. Lentes de foco — Todo + 4 personas. Acinzenta nós E arestas fora da
 *      persona e desenha a faixa dela.
 *   3. Click-to-open — clicar num card abre a tela real num modal grande
 *      (≥768px, então o produto desktop-only renderiza) + abrir em nova aba.
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

/* ─── Personas ──────────────────────────────────────────────────────── */

type Persona = "login" | "primeiro-acesso" | "convite" | "org-adicional"
type Focus = Persona | "all"

const PERSONA: Record<Persona, { label: string; color: string }> = {
  login: { label: "Login (recorrente)", color: "var(--aw-blue-600)" },
  "primeiro-acesso": { label: "Primeiro acesso", color: "var(--aw-emerald-600)" },
  convite: { label: "Convite de membro", color: "var(--aw-purple-600)" },
  "org-adicional": { label: "Organização adicional", color: "var(--aw-pink-600)" },
}
const ALL = Object.keys(PERSONA) as Persona[]

const FOCI: { id: Focus; label: string }[] = [
  { id: "all", label: "Todo" },
  ...ALL.map((p) => ({ id: p, label: PERSONA[p].label })),
]

/* ─── Node data ─────────────────────────────────────────────────────── */

type ScreenData = { step?: string; title: string; note?: string; href?: string; personas: Persona[]; _comments?: number }
type DecisionData = { step?: string; title: string; question?: string; personas: Persona[]; _comments?: number }
type SectionData = { title: string; persona: Persona }

/* Pin de comentário (estilo FigJam) — aparece no card quando tem nota. */
function CommentPin({ n }: { n: number }) {
  return (
    <span className="absolute -left-2 -top-2 z-20 inline-flex h-5 items-center justify-center gap-0.5 rounded-full border border-(--aw-amber-300) bg-(--aw-amber-500) px-1.5 text-[10px] font-bold text-white shadow-(--shadow-sm)">
      💬 {n}
    </span>
  )
}

/* ─── Bolinhas de persona ───────────────────────────────────────────── */

function PersonaDots({ personas }: { personas: Persona[] }) {
  return (
    <div className="absolute right-2 top-2 flex gap-1">
      {personas.map((p) => (
        <span key={p} className="inline-block h-2 w-2 rounded-full" style={{ background: PERSONA[p].color }} title={PERSONA[p].label} />
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
      <PersonaDots personas={data.personas} />
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
      <PersonaDots personas={data.personas} />
      {data._comments ? <CommentPin n={data._comments} /> : null}
      <span className="aw-eyebrow text-(--aw-amber-800)">decisão</span>
      <span className="text-sm font-medium leading-tight text-(--aw-amber-900)">{data.title}</span>
      {data.question && <span className="text-xs leading-snug text-(--aw-amber-800)">{data.question}</span>}
    </div>
  )
}

function SectionNode({ data }: NodeProps<Node<SectionData>>) {
  const tint = PERSONA[data.persona].color
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
/* Dois streams descem em paralelo e se encontram no gate de 2FA:
   LOGIN (esquerda, auth completa) · ONBOARDING (direita).
   Trunk compartilhado embaixo (2FA → conclusão → sucesso). */

// Login band
const GX = 60, MX = 320, SX = 600
// Onboarding band
const OL = 1060, OM = 1320, OR = 1600
// Shared trunk
const TX = 720, TL = 520, TR = 880

const S = (id: string, x: number, y: number, d: ScreenData): Node => ({ id, type: "screen", position: { x, y }, zIndex: 10, data: d })
const D = (id: string, x: number, y: number, d: DecisionData): Node => ({ id, type: "decision", position: { x, y }, zIndex: 10, data: d })

const L: Persona[] = ["login"]
const PA: Persona[] = ["primeiro-acesso"]
const CV: Persona[] = ["convite"]
const OA: Persona[] = ["org-adicional"]

const BASE_NODES: Node[] = [
  /* ═══ LOGIN (auth completa) ═══ */
  S("l-entrada", MX, 0, { step: "entrada", title: "Login", note: "input e-mail + Continuar · Google · Microsoft", href: "/awsales/login?screen=login", personas: L }),
  D("l-metodo", MX, 175, { title: "Como o usuário entra?", question: "E-mail + Continuar, Google ou Microsoft?", personas: L }),
  S("l-google", GX, 350, { step: "social", title: "Continuar com Google", note: "OAuth Google", href: "/awsales/login?screen=login", personas: L }),
  D("l-discover", MX, 350, { title: "E-mail de empresa com SSO?", question: "Domínio exige login corporativo? (HRD por domínio)", personas: L }),
  S("l-ms", SX, 350, { step: "social", title: "Continuar com Microsoft", note: "OAuth Microsoft", href: "/awsales/login?screen=login", personas: L }),
  S("l-sso", SX, 525, { step: "SSO", title: "Conectando à empresa", note: "SAML/OIDC · IdP autentica e devolve a sessão", href: "/awsales/login?screen=ssoConnecting", personas: L }),
  S("l-senha", MX, 525, { step: "01", title: "E-mail + senha", note: "e-mail pré-preenchido · 'manter conectado'", href: "/awsales/login?screen=email", personas: L }),
  D("l-valid", MX, 700, { title: "Credenciais válidas?", question: "A senha confere?", personas: L }),
  S("l-erro", GX, 700, { step: "inline", title: "Senha incorreta", note: "estado inline da tela de senha", href: "/awsales/login?screen=email", personas: L }),
  S("l-verify", MX, 875, { step: "02", title: "Verificação por e-mail", note: "código de 6 dígitos", href: "/awsales/login?screen=verify", personas: L }),
  S("l-magic", SX, 700, { step: "alt", title: "Magic link enviado", note: "link de acesso por e-mail (15 min)", href: "/awsales/login?screen=magicSent", personas: L }),
  S("l-forgot", GX, 875, { step: "rec", title: "Esqueci a senha", note: "envia código → define nova senha", href: "/awsales/login?screen=forgot", personas: L }),
  D("l-workspaceDec", MX, 1060, { title: "Pertence a mais de uma org?", question: "O usuário tem acesso a mais de uma organização?", personas: L }),
  S("l-workspace", MX, 1235, { step: "03", title: "Seletor de organização", note: "lista as orgs do usuário", href: "/awsales/login?screen=workspace", personas: L }),

  /* ═══ ONBOARDING (PA + convite) ═══ */
  S("pa-entrada", OL, 0, { step: "entrada", title: "E-mail de primeiro acesso", note: "magic link da Aswork", href: "/primeiro-acesso/verificacao", personas: PA }),
  S("cv-entrada", OR, 0, { step: "entrada", title: "E-mail de convite", note: "magic link do admin", href: "/convite", personas: CV }),
  D("dec-link", OM, 180, { title: "O link ainda funciona?", question: "Dentro do prazo, não usado e não cancelado? (PA 10 dias · convite 7)", personas: ["primeiro-acesso", "convite"] }),
  S("link-erros", OR + 40, 200, { step: "erro", title: "Link expirado / usado / cancelado", note: "3 telas terminais → reenvio ou suporte", href: "/primeiro-acesso/link-expirado", personas: ["primeiro-acesso", "convite"] }),
  S("boas-vindas", OM, 360, { step: "01", title: "Boas-vindas", note: "org, quem convidou, função", href: "/primeiro-acesso/verificacao", personas: ["primeiro-acesso", "convite"] }),
  S("conta", OM, 540, { step: "02", title: "Sua conta", note: "cria a conta: Google · Microsoft · senha", href: "/primeiro-acesso/conta", personas: ["primeiro-acesso", "convite"] }),
  S("perfil", OM, 720, { step: "03", title: "Seu perfil", note: "nome, foto, telefone · campos condicionais: fatura (quem paga) · e-mail travado (convidado)", href: "/primeiro-acesso/perfil", personas: ["primeiro-acesso", "convite"] }),

  /* ═══ CONTRATO + PAGAMENTO (PA + org-adicional) ═══ */
  S("e-orgadic", OR + 40, 740, { step: "← do Login", title: "Organização adicional", note: "plano novo comprado, org não configurada", href: "/inicio", personas: OA }),
  S("contrato", OM, 900, { step: "04", title: "Contrato", note: "revisa condições e aceita os termos", href: "/primeiro-acesso/contrato", personas: ["primeiro-acesso", "org-adicional"] }),
  D("pagamento", OM, 1080, { title: "Pagamento", question: "Implementação + 1ª mensalidade — qual método?", personas: ["primeiro-acesso", "org-adicional"] }),
  S("pay-pix", OL, 1260, { step: "05a", title: "Pix", note: "QR Code instantâneo", href: "/primeiro-acesso/pagamento", personas: ["primeiro-acesso", "org-adicional"] }),
  S("pay-cartao", OM, 1260, { step: "05b", title: "Cartão de crédito", note: "em até 4× · recusa abre retry inline", href: "/primeiro-acesso/pagamento", personas: ["primeiro-acesso", "org-adicional"] }),
  S("pay-boleto", OR, 1260, { step: "05c", title: "Boleto", note: "vence em 3 dias úteis", href: "/primeiro-acesso/pagamento", personas: ["primeiro-acesso", "org-adicional"] }),

  /* ═══ GATE DE 2FA + conclusão (compartilhado) ═══ */
  D("dec-policy", TX, 1480, { title: "A organização exige verificação extra?", question: "Cada org tem suas regras. Ponto onde os 4 flows convergem.", personas: ALL }),
  S("twofa-setup", TL, 1680, { step: "2FA", title: "Configurar app + backup", note: "QR + TOTP · 10 códigos de backup", href: "/awsales/login?screen=mfaSetupApp", personas: ALL }),
  S("twofa-verify", TR, 1680, { step: "2FA", title: "Confirmar código", note: "6 dígitos do app de verificação", href: "/awsales/login?screen=mfaVerify", personas: ALL }),
  S("twofa-recovery", TR, 1860, { step: "2FA", title: "Usar código de backup", note: "fallback de quem perdeu o app", href: "/awsales/login?screen=mfaRecovery", personas: ALL }),
  S("concluido", TX, 2080, { step: "fim", title: "Tudo pronto / Conta criada", note: "copy adapta: 'Conta criada' (membro) · 'Tudo pronto' (ativação)", href: "/primeiro-acesso/concluido", personas: ["primeiro-acesso", "convite", "org-adicional"] }),
  D("dec-final", TX, 2260, { title: "O que fazer agora?", question: "Só no primeiro acesso: acessar direto ou falar com consultor.", personas: PA }),
  S("consultor", TX + 320, 2270, { step: "→ consultor", title: "Falar com consultor", note: "agenda com o Account Manager", href: "/suporte", personas: PA }),
  S("sucesso", TX, 2440, { step: "→ plataforma", title: "Entrou na plataforma", note: "home logada · /inicio", href: "/inicio", personas: ALL }),
]

const EDGES: Edge[] = [
  /* Login — método de entrada */
  { id: "a1", source: "l-entrada", target: "l-metodo", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "a2", source: "l-metodo", target: "l-google", sourceHandle: "l-s", targetHandle: "t-t", label: "Google", ...branch },
  { id: "a3", source: "l-metodo", target: "l-discover", sourceHandle: "b-s", targetHandle: "t-t", label: "Continuar", ...branch },
  { id: "a4", source: "l-metodo", target: "l-ms", sourceHandle: "r-s", targetHandle: "t-t", label: "Microsoft", ...branch },
  /* HRD: empresa SSO vs e-mail comum */
  { id: "a5", source: "l-discover", target: "l-sso", sourceHandle: "r-s", targetHandle: "t-t", label: "E-mail de empresa", ...branch },
  { id: "a6", source: "l-discover", target: "l-senha", sourceHandle: "b-s", targetHandle: "t-t", label: "E-mail comum", ...branch },
  /* Senha → validação */
  { id: "a7", source: "l-senha", target: "l-valid", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "a8", source: "l-senha", target: "l-magic", sourceHandle: "r-s", targetHandle: "l-t", label: "Receber link", ...branch },
  { id: "a9", source: "l-valid", target: "l-verify", sourceHandle: "b-s", targetHandle: "t-t", label: "Corretas", ...branch },
  { id: "a10", source: "l-valid", target: "l-erro", sourceHandle: "l-s", targetHandle: "t-t", label: "Inválidas", ...branch },
  { id: "a11", source: "l-erro", target: "l-forgot", sourceHandle: "b-s", targetHandle: "t-t", label: "Esqueci a senha", ...branch },
  /* Convergência da auth → seletor de org */
  { id: "a12", source: "l-verify", target: "l-workspaceDec", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "a13", source: "l-google", target: "l-workspaceDec", sourceHandle: "b-s", targetHandle: "l-t", ...base },
  { id: "a14", source: "l-ms", target: "l-workspaceDec", sourceHandle: "b-s", targetHandle: "r-t", ...base },
  { id: "a15", source: "l-magic", target: "l-workspaceDec", sourceHandle: "b-s", targetHandle: "r-t", ...base },
  { id: "a16", source: "l-forgot", target: "l-workspaceDec", sourceHandle: "b-s", targetHandle: "l-t", ...base },
  { id: "a17", source: "l-workspaceDec", target: "l-workspace", sourceHandle: "b-s", targetHandle: "t-t", label: "Mais de 1 org", ...branch },
  /* SSO fast-lane pula o seletor; login entra no gate de 2FA */
  { id: "a18", source: "l-sso", target: "dec-policy", sourceHandle: "b-s", targetHandle: "t-t", label: "IdP autenticou", ...base },
  { id: "a19", source: "l-workspaceDec", target: "dec-policy", sourceHandle: "r-s", targetHandle: "l-t", label: "Só 1 org", ...branch },
  { id: "a20", source: "l-workspace", target: "dec-policy", sourceHandle: "b-s", targetHandle: "l-t", ...base },

  /* Onboarding (PA + convite) */
  { id: "b1", source: "pa-entrada", target: "dec-link", sourceHandle: "b-s", targetHandle: "l-t", ...base },
  { id: "b2", source: "cv-entrada", target: "dec-link", sourceHandle: "b-s", targetHandle: "r-t", ...base },
  { id: "b3", source: "dec-link", target: "boas-vindas", sourceHandle: "b-s", targetHandle: "t-t", label: "Válido", ...branch },
  { id: "b4", source: "dec-link", target: "link-erros", sourceHandle: "r-s", targetHandle: "l-t", label: "Expirado / usado / cancelado", ...branch },
  { id: "b5", source: "boas-vindas", target: "conta", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "b6", source: "conta", target: "perfil", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  /* Fork no perfil: PA paga, convite vai direto pro 2FA */
  { id: "b7", source: "perfil", target: "contrato", sourceHandle: "b-s", targetHandle: "t-t", label: "Cliente novo · paga", ...branch },
  { id: "b8", source: "perfil", target: "dec-policy", sourceHandle: "l-s", targetHandle: "r-t", label: "Membro · sem pagamento", ...branch },

  /* Org adicional entra no contrato */
  { id: "o1", source: "e-orgadic", target: "contrato", sourceHandle: "l-s", targetHandle: "r-t", label: "Configurar agora", ...cross },

  /* Contrato → pagamento → métodos → gate */
  { id: "c1", source: "contrato", target: "pagamento", sourceHandle: "b-s", targetHandle: "t-t", ...base },
  { id: "c2", source: "pagamento", target: "pay-pix", sourceHandle: "l-s", targetHandle: "t-t", label: "Pix", ...branch },
  { id: "c3", source: "pagamento", target: "pay-cartao", sourceHandle: "b-s", targetHandle: "t-t", label: "Cartão", ...branch },
  { id: "c4", source: "pagamento", target: "pay-boleto", sourceHandle: "r-s", targetHandle: "t-t", label: "Boleto", ...branch },
  { id: "c5", source: "pay-pix", target: "dec-policy", sourceHandle: "b-s", targetHandle: "r-t", ...base },
  { id: "c6", source: "pay-cartao", target: "dec-policy", sourceHandle: "b-s", targetHandle: "r-t", ...base },
  { id: "c7", source: "pay-boleto", target: "dec-policy", sourceHandle: "b-s", targetHandle: "r-t", ...base },

  /* Gate de 2FA */
  { id: "m1", source: "dec-policy", target: "twofa-setup", sourceHandle: "l-s", targetHandle: "t-t", label: "Exige 2FA · sem app", ...branch },
  { id: "m2", source: "dec-policy", target: "twofa-verify", sourceHandle: "r-s", targetHandle: "t-t", label: "Exige 2FA · já tem app", ...branch },
  { id: "m3", source: "dec-policy", target: "concluido", sourceHandle: "b-s", targetHandle: "t-t", label: "Sem 2FA · onboarding", ...branch },
  { id: "m4", source: "dec-policy", target: "sucesso", sourceHandle: "l-s", targetHandle: "l-t", label: "Sem 2FA · login", ...branch },
  { id: "m5", source: "twofa-verify", target: "twofa-recovery", sourceHandle: "b-s", targetHandle: "t-t", label: "Perdi o app", ...branch },
  /* 2FA → conclusão (onboarding) e sucesso (login) */
  { id: "m6", source: "twofa-setup", target: "concluido", sourceHandle: "b-s", targetHandle: "l-t", label: "onboarding", ...base },
  { id: "m7", source: "twofa-verify", target: "concluido", sourceHandle: "b-s", targetHandle: "r-t", label: "onboarding", ...base },
  { id: "m8", source: "twofa-setup", target: "sucesso", sourceHandle: "b-s", targetHandle: "l-t", label: "login", ...base },
  { id: "m9", source: "twofa-recovery", target: "sucesso", sourceHandle: "b-s", targetHandle: "r-t", label: "login", ...base },

  /* Conclusão */
  { id: "f1", source: "concluido", target: "dec-final", sourceHandle: "b-s", targetHandle: "t-t", label: "Primeiro acesso", ...branch },
  { id: "f2", source: "concluido", target: "sucesso", sourceHandle: "l-s", targetHandle: "l-t", label: "Convite / org adicional", ...branch },
  { id: "f3", source: "dec-final", target: "sucesso", sourceHandle: "b-s", targetHandle: "t-t", label: "Acessar", ...branch },
  { id: "f4", source: "dec-final", target: "consultor", sourceHandle: "r-s", targetHandle: "t-t", label: "Falar com consultor", ...branch },
]

const NODE_PERSONAS: Record<string, Persona[]> = Object.fromEntries(
  BASE_NODES.map((n) => [n.id, (n.data as ScreenData | DecisionData).personas]),
)

/* Faixa da persona em foco: bounding box dos nós dela. */
const FOOTPRINT = { w: 230, h: 120 }
const PAD = 40
function focusBand(focus: Persona): Node {
  const members = BASE_NODES.filter((n) => (n.data as ScreenData | DecisionData).personas.includes(focus))
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
    data: { title: PERSONA[focus].label, persona: focus },
  }
}

/* ─── Página ────────────────────────────────────────────────────────── */

type CardComment = { id: string; text: string; at: number }
type CommentMap = Record<string, CardComment[]>

export default function PocVisaoGlobalPage() {
  const [focus, setFocus] = useState<Focus>("all")
  const [openScreen, setOpenScreen] = useState<{ title: string; href: string } | null>(null)
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
      const personas = (n.data as ScreenData | DecisionData).personas
      const dim = focus !== "all" && !personas.includes(focus as Persona)
      return {
        ...n,
        position: positions[n.id] ?? n.position,
        data: { ...n.data, _comments: comments[n.id]?.length },
        className: dim ? "opacity-15 saturate-0 transition-all duration-300" : "opacity-100 transition-all duration-300",
      }
    })
    return focus === "all" ? dimmed : [focusBand(focus as Persona), ...dimmed]
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
      const on = NODE_PERSONAS[e.source]?.includes(focus as Persona) && NODE_PERSONAS[e.target]?.includes(focus as Persona)
      return on ? e : { ...e, label: undefined, style: { ...(e.style as object), opacity: 0.1 } }
    })
  }, [focus])

  /* Carrega comentários já deixados (suggestions.json, flow=poc-visao-global).
     Cada comentário é uma "suggestion" com description `[poc:<id>] (<título>) <texto>`. */
  useEffect(() => {
    let alive = true
    fetch("/api/flow-suggestions?flow=poc-visao-global")
      .then((r) => (r.ok ? r.json() : { suggestions: [] }))
      .then((d: { suggestions?: { id: string; description: string; createdAt: number; status: string }[] }) => {
        if (!alive) return
        const map: CommentMap = {}
        for (const s of d.suggestions ?? []) {
          if (s.status === "discarded") continue
          const m = /^\[poc:([^\]]+)\]\s*(?:\([^)]*\))?\s*([\s\S]*)$/.exec(s.description)
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
        body: JSON.stringify({ flow: "poc-visao-global", authorName: "Greg", description: `[poc:${id}] (${title}) ${text}` }),
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
        const color = f.id === "all" ? "var(--aw-blue-600)" : PERSONA[f.id as Persona].color
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
        title="POC · Visão global com lentes"
        trailing={
          <span className="inline-flex items-center rounded-full border border-(--aw-amber-300) bg-(--aw-amber-100) px-2 py-0.5 text-[11px] font-medium text-(--aw-amber-800)">
            experimento · v2
          </span>
        }
      >
        Os 4 flows de acesso fundidos num grafo só, com a autenticação do login
        inteira (e-mail/HRD, Google, Microsoft, SSO empresa, magic link,
        recuperação). Telas repetidas viram um card com bolinhas das personas
        donas. Troque a lente pra focar; clique num card pra abrir a tela.
      </PageHero>

      {/* Canvas full-width (fora da coluna de texto) */}
      <div className="w-full px-10 pb-10">
        <Section
          id="flow"
          title="Fluxograma fundido"
          lead="2+ bolinhas num card = compartilhado (não foi repetido). A lente acinzenta nós e arestas fora da persona. No modo Mover: arraste os cards e clique pra abrir a tela real. No modo Comentar: clique num card pra deixar uma nota (vai pro canal que o Claude lê). Botão de tela cheia no canto."
        >
          {/* Tabs de foco */}
          <div className="mb-3">{focusTabs}</div>

          {/* Legenda */}
          <div className="caption mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-(--fg-tertiary)">
            {ALL.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: PERSONA[p].color }} />
                {PERSONA[p].label}
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
                if (node.type === "screen" && d.href) setOpenScreen({ title: d.title, href: d.href })
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

              {/* Toolbar Mover / Comentar (centro embaixo, igual o flow real) */}
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

      {/* Conflitos — coluna de texto normal */}
      <div className="mx-auto max-w-[1100px] px-10 pb-14">
        <Section
          id="conflitos"
          title="Conflitos resolvidos"
          lead="Os 7 conflitos da merjada, com a decisão de cada um já aplicada no grafo acima (2026-06-08)."
        >
          <ol className="flex max-w-3xl list-decimal flex-col gap-3 pl-5 text-(--body-md-size) text-(--fg-secondary)">
            <li>
              <strong className="text-(--fg-primary)">Janela do link diverge.</strong> PA = 10 dias; convite = 7 dias.{" "}
              <span className="text-(--aw-emerald-700)">→ Manter por contexto: contextos diferentes (cliente novo × membro), prazos diferentes.</span>
            </li>
            <li>
              <strong className="text-(--fg-primary)">"Concluído" vs "Conta criada".</strong>{" "}
              <span className="text-(--aw-emerald-700)">→ Adaptar por persona: "Conta criada" pro membro, "Tudo pronto" pra quem ativou a org. Um card só.</span>
            </li>
            <li>
              <strong className="text-(--fg-primary)">Sign-in ≠ sign-up.</strong> Login autentica quem já tem conta; "Sua conta" CRIA conta.{" "}
              <span className="text-(--aw-emerald-700)">→ Telas separadas (não fundir).</span>
            </li>
            <li>
              <strong className="text-(--fg-primary)">2FA aponta pra rotas diferentes.</strong> Convite ia pra <code>/convite/seguranca</code>.{" "}
              <span className="text-(--aw-emerald-700)">→ Rota canônica <code>/awsales/login?screen=mfa*</code> pros 4; a do convite vira alias (dedup no dev).</span>
            </li>
            <li>
              <strong className="text-(--fg-primary)">Perfil diverge.</strong> PA tem destinatários de fatura; convite trava o e-mail.{" "}
              <span className="text-(--aw-emerald-700)">→ Um card "Seu perfil" com campos condicionais por persona.</span>
            </li>
            <li>
              <strong className="text-(--fg-primary)">Parcelamento diverge.</strong> PA dizia "parcelado"; org-adicional "em até 4×".{" "}
              <span className="text-(--aw-emerald-700)">→ Unificado em "em até 4×" pros dois.</span>
            </li>
            <li>
              <strong className="text-(--fg-primary)">Org adicional não tem entrada própria.</strong>{" "}
              <span className="text-(--aw-emerald-700)">→ Entrada "← do Login" representa que é continuação do login (plano novo comprado).</span>
            </li>
          </ol>
        </Section>
      </div>

      {/* Modal de tela (≥768px → o produto desktop-only renderiza normal) */}
      {openScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={() => setOpenScreen(null)}>
          <div className="flex h-[84vh] w-full max-w-[1040px] flex-col overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-raised) shadow-(--shadow-lg)" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2 border-b border-(--border-default) px-4 py-2.5">
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-medium text-(--fg-primary)">{openScreen.title}</span>
                <span className="caption truncate text-(--fg-tertiary)">{openScreen.href}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a href={openScreen.href} target="_blank" rel="noreferrer" className="rounded-md border border-(--border-default) bg-(--bg-canvas) px-2.5 py-1 text-xs font-medium text-(--fg-secondary) transition hover:border-(--aw-blue-300) hover:text-(--aw-blue-700)">
                  Abrir em nova aba ↗
                </a>
                <button type="button" onClick={() => setOpenScreen(null)} className="rounded-md border border-(--border-default) bg-(--bg-canvas) px-2.5 py-1 text-xs font-medium text-(--fg-secondary) transition hover:border-(--aw-blue-300) hover:text-(--aw-blue-700)">
                  Fechar ✕
                </button>
              </div>
            </div>
            <iframe key={openScreen.href} src={openScreen.href} title={openScreen.title} className="min-h-0 w-full flex-1 bg-white" />
          </div>
        </div>
      )}

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
                placeholder="O que falta aqui? Ex: 'faltou a tela de erro quando o SSO falha'…"
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
