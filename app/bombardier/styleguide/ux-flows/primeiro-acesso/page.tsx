"use client"

import Link from "next/link"
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { PageHero, Section, Tldr } from "../../_primitives"

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
  return (
    <div className="w-[240px] rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--aw-amber-400)] bg-[var(--aw-amber-100)] px-4 py-3 flex flex-col gap-1">
      <Handle type="target" position={Position.Top} className="!bg-[var(--aw-amber-500)] !border-0 !w-2 !h-2" />
      <span className="aw-eyebrow text-[var(--aw-amber-800)]">decisão · {data.step}</span>
      <span className="text-sm font-medium text-[var(--aw-amber-900)] leading-tight">
        {data.title}
      </span>
      <span className="text-xs text-[var(--aw-amber-800)] leading-snug">{data.question}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-[var(--aw-amber-500)] !border-0 !w-2 !h-2" />
    </div>
  )
}

const nodeTypes = {
  screen: ScreenNode,
  decision: DecisionNode,
}

/* ─────────────────────────────────────────────────────────────────────
 * Flow data
 *
 * Ordem invertida: o cliente se autentica logo no início (etapa 02),
 * antes de aceitar termos no perfil e antes de qualquer pagamento.
 * ──────────────────────────────────────────────────────────────────── */

const COL_LEFT = 0
const COL_CENTER = 280
const COL_RIGHT = 560

const Y = {
  entrada: 0,
  convite: 150,
  acesso: 310,
  perfil: 510,
  boasVindas: 690,
  revisao: 830,
  pagamento: 980,
  checkout: 1180,
  confirmado: 1350,
  mensalidade: 1490,
  inicio: 1630,
}

const nodes: Node[] = [
  {
    id: "entrada",
    type: "screen",
    position: { x: COL_CENTER, y: Y.entrada },
    data: {
      step: "entrada",
      title: "Login",
      href: "/",
      note: "Tela de login. O link “Primeiro acesso” inicia o fluxo.",
    } satisfies ScreenData,
  },
  {
    id: "convite",
    type: "screen",
    position: { x: COL_CENTER, y: Y.convite },
    data: {
      step: "01",
      title: "Convite",
      href: "/primeiro-acesso/convite",
      note: "Valida o código de convite de 6 dígitos.",
    } satisfies ScreenData,
  },
  {
    id: "acesso",
    type: "decision",
    position: { x: COL_CENTER - 20, y: Y.acesso },
    data: {
      step: "02",
      title: "Acesso",
      question: "Cliente se autentica: Google, Microsoft ou senha.",
    } satisfies DecisionData,
  },
  {
    id: "perfil-google",
    type: "screen",
    position: { x: COL_LEFT, y: Y.perfil },
    data: {
      step: "03",
      title: "Perfil (Google)",
      href: "/primeiro-acesso/perfil?via=google",
      note: "OAuth Google · nome e foto pré-preenchidos.",
    } satisfies ScreenData,
  },
  {
    id: "perfil-ms",
    type: "screen",
    position: { x: COL_CENTER, y: Y.perfil },
    data: {
      step: "03",
      title: "Perfil (Microsoft)",
      href: "/primeiro-acesso/perfil?via=ms",
      note: "OAuth Microsoft · nome e foto pré-preenchidos.",
    } satisfies ScreenData,
  },
  {
    id: "perfil-pwd",
    type: "screen",
    position: { x: COL_RIGHT, y: Y.perfil },
    data: {
      step: "03",
      title: "Perfil (senha)",
      href: "/primeiro-acesso/perfil?via=password",
      note: "Sem OAuth · cliente preenche tudo manualmente.",
    } satisfies ScreenData,
  },
  {
    id: "boas-vindas",
    type: "screen",
    position: { x: COL_CENTER, y: Y.boasVindas },
    data: {
      step: "04",
      title: "Boas-vindas",
      href: "/primeiro-acesso/boas-vindas",
      note: "Apresenta o produto e as próximas etapas.",
    } satisfies ScreenData,
  },
  {
    id: "revisao",
    type: "screen",
    position: { x: COL_CENTER, y: Y.revisao },
    data: {
      step: "05",
      title: "Revisão",
      href: "/primeiro-acesso/revisao",
      note: "Confere dados do plano antes do pagamento.",
    } satisfies ScreenData,
  },
  {
    id: "pagamento",
    type: "decision",
    position: { x: COL_CENTER - 20, y: Y.pagamento },
    data: {
      step: "06",
      title: "Pagamento",
      question: "Cliente escolhe forma: Pix, Cartão ou Boleto.",
    } satisfies DecisionData,
  },
  {
    id: "checkout-pix",
    type: "screen",
    position: { x: COL_LEFT, y: Y.checkout },
    data: {
      step: "07",
      title: "Checkout · Pix",
      href: "/primeiro-acesso/checkout/pix",
      note: "QR + copia-cola. À vista ou em até 4x.",
    } satisfies ScreenData,
  },
  {
    id: "checkout-cartao",
    type: "screen",
    position: { x: COL_CENTER, y: Y.checkout },
    data: {
      step: "07",
      title: "Checkout · Cartão",
      href: "/primeiro-acesso/checkout/cartao",
      note: "Formulário de cartão. À vista ou em até 4x.",
    } satisfies ScreenData,
  },
  {
    id: "checkout-boleto",
    type: "screen",
    position: { x: COL_RIGHT, y: Y.checkout },
    data: {
      step: "07",
      title: "Checkout · Boleto",
      href: "/primeiro-acesso/checkout/boleto",
      note: "Gera código. À vista ou em até 4x.",
    } satisfies ScreenData,
  },
  {
    id: "confirmado",
    type: "screen",
    position: { x: COL_CENTER, y: Y.confirmado },
    data: {
      step: "08",
      title: "Confirmado",
      href: "/primeiro-acesso/confirmado",
      note: "Implementação confirmada. Falta a mensalidade.",
    } satisfies ScreenData,
  },
  {
    id: "mensalidade",
    type: "screen",
    position: { x: COL_CENTER, y: Y.mensalidade },
    data: {
      step: "09",
      title: "Mensalidade",
      href: "/primeiro-acesso/mensalidade",
      note: "Cobrança da 1ª mensalidade na prorrata.",
    } satisfies ScreenData,
  },
  {
    id: "inicio",
    type: "screen",
    position: { x: COL_CENTER, y: Y.inicio },
    data: {
      step: "fim",
      title: "Início",
      href: "/inicio?welcome=1",
      note: "Home logada, com o modal de boas-vindas.",
    } satisfies ScreenData,
  },
]

const edgeBase = {
  type: "smoothstep" as const,
  animated: false,
  markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
  style: { stroke: "var(--border-strong)", strokeWidth: 1.5 },
}

const branchLabel = {
  labelStyle: { fill: "var(--fg-secondary)", fontSize: 11, fontWeight: 500 },
  labelBgStyle: { fill: "var(--bg-canvas)" },
  labelBgPadding: [6, 4] as [number, number],
}

const edges: Edge[] = [
  {
    ...edgeBase,
    id: "e-entrada-convite",
    source: "entrada",
    target: "convite",
    label: "Primeiro acesso",
    ...branchLabel,
  },
  { ...edgeBase, id: "e-convite-acesso", source: "convite", target: "acesso" },
  {
    ...edgeBase,
    id: "e-acesso-google",
    source: "acesso",
    target: "perfil-google",
    label: "Google",
    ...branchLabel,
  },
  {
    ...edgeBase,
    id: "e-acesso-ms",
    source: "acesso",
    target: "perfil-ms",
    label: "Microsoft",
    ...branchLabel,
  },
  {
    ...edgeBase,
    id: "e-acesso-pwd",
    source: "acesso",
    target: "perfil-pwd",
    label: "Senha",
    ...branchLabel,
  },
  { ...edgeBase, id: "e-google-boas", source: "perfil-google", target: "boas-vindas" },
  { ...edgeBase, id: "e-ms-boas", source: "perfil-ms", target: "boas-vindas" },
  { ...edgeBase, id: "e-pwd-boas", source: "perfil-pwd", target: "boas-vindas" },
  { ...edgeBase, id: "e-boas-revisao", source: "boas-vindas", target: "revisao" },
  { ...edgeBase, id: "e-revisao-pagamento", source: "revisao", target: "pagamento" },
  {
    ...edgeBase,
    id: "e-pagamento-pix",
    source: "pagamento",
    target: "checkout-pix",
    label: "Pix",
    ...branchLabel,
  },
  {
    ...edgeBase,
    id: "e-pagamento-cartao",
    source: "pagamento",
    target: "checkout-cartao",
    label: "Cartão",
    ...branchLabel,
  },
  {
    ...edgeBase,
    id: "e-pagamento-boleto",
    source: "pagamento",
    target: "checkout-boleto",
    label: "Boleto",
    ...branchLabel,
  },
  { ...edgeBase, id: "e-pix-confirmado", source: "checkout-pix", target: "confirmado" },
  { ...edgeBase, id: "e-cartao-confirmado", source: "checkout-cartao", target: "confirmado" },
  { ...edgeBase, id: "e-boleto-confirmado", source: "checkout-boleto", target: "confirmado" },
  { ...edgeBase, id: "e-confirmado-mensalidade", source: "confirmado", target: "mensalidade" },
  { ...edgeBase, id: "e-mensalidade-inicio", source: "mensalidade", target: "inicio" },
]

/* ─────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────── */

const screens = [
  {
    step: "01",
    title: "Convite",
    href: "/primeiro-acesso/convite",
    purpose: "Primeira tela do produto. Valida o código de 6 dígitos do convite (ou o magic link do e-mail) e confirma que aquela pessoa foi convidada.",
    decisions: "Código válido → segue para a autenticação.",
  },
  {
    step: "02",
    title: "Acesso",
    href: "/primeiro-acesso/acesso",
    purpose: "Autenticação logo no início — antes de aceitar termos ou pagar. OAuth (Google/Microsoft) reduz fricção e é o caminho preferido; senha fica como terceira opção.",
    decisions: "Escolher entre Google, Microsoft ou senha. Cada via leva ao perfil correspondente.",
  },
  {
    step: "03",
    title: "Perfil (Google / Microsoft / senha)",
    href: "/primeiro-acesso/perfil?via=google",
    purpose: "Com OAuth, nome e foto vêm pré-preenchidos do provedor. Sem OAuth, o cliente preenche tudo. É aqui que ele revisa os dados pessoais, dados de fatura e aceita os Termos.",
    decisions: "Continuar → boas-vindas.",
  },
  {
    step: "04",
    title: "Boas-vindas",
    href: "/primeiro-acesso/boas-vindas",
    purpose: "Já autenticado, o cliente vê o que vem a seguir: revisar o plano, pagar a implementação e a primeira mensalidade. Cria contrato implícito de tempo.",
    decisions: "Nenhuma. Botão único de Continuar.",
  },
  {
    step: "05",
    title: "Revisão",
    href: "/primeiro-acesso/revisao",
    purpose: "Cliente vê o plano contratado (preço, ciclo, itens) antes de pagar. Reduz fricção pós-pagamento e disputas.",
    decisions: "Voltar / Continuar para pagamento.",
  },
  {
    step: "06",
    title: "Pagamento",
    href: "/primeiro-acesso/pagamento",
    purpose: "Decisão sobre forma de pagamento. Pix é padrão (default Brasil). Cartão pra quem precisa de comprovante imediato. Boleto pra quem prefere mais tempo.",
    decisions: "Escolher entre Pix, Cartão ou Boleto. Cada escolha leva a checkout próprio.",
  },
  {
    step: "07",
    title: "Checkout · Pix / Cartão / Boleto",
    href: "/primeiro-acesso/checkout/pix",
    purpose: "Telas dedicadas por método. Pix mostra QR + copia-cola; cartão coleta dados; boleto gera código. Em todos, a implementação pode ser paga à vista ou parcelada em até 4x.",
    decisions: "Sucesso → 08 Confirmado. Falha → manter na mesma tela com mensagem clara.",
  },
  {
    step: "08",
    title: "Confirmado",
    href: "/primeiro-acesso/confirmado",
    purpose: "Implementação confirmada e conta provisionada. Sinaliza que a primeira metade do pagamento foi concluída e que falta configurar a mensalidade.",
    decisions: "Continuar para a etapa de mensalidade.",
  },
  {
    step: "09",
    title: "Mensalidade",
    href: "/primeiro-acesso/mensalidade",
    purpose: "Última etapa. Cobrança da primeira mensalidade na prorrata (proporcional aos dias restantes do mês) e define o método recorrente. Concluir leva pro Início logado.",
    decisions: "Escolher método e pagar → /inicio (home logada).",
  },
]

export default function PrimeiroAcessoFlowPage() {
  return (
    <>
      <PageHero title="Primeiro acesso">
        Fluxo completo de onboarding do novo cliente. A ordem foi invertida: o cliente se autentica logo no começo — antes de aceitar termos e de qualquer pagamento. Use este mapa quando precisar entender pra onde uma decisão leva, ou ao iterar em qualquer tela do fluxo.
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Reta de onboarding pós-convite — autenticação acontece no início (etapa 02).</>,
            <>Cliente aceita termos e paga já autenticado; entra logado no final.</>,
            <>Cada etapa tem rota dedicada — links abrem o protótipo.</>,
          ]}
          dontUse={[
            <>Fluxos pós-onboarding (assistente de criação de agente, etc.).</>,
            <>Reativação de conta expirada — esse fluxo é outro.</>,
            <>Login recorrente — a tela <code>/</code> leva direto ao dashboard.</>,
          ]}
        />

        <Section
          id="flow"
          title="Fluxograma"
          lead="Clique em qualquer tela pra abrir o protótipo. Caixas tracejadas em âmbar são decisões — bifurcam pra rotas diferentes."
        >
          <div
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-hidden"
            style={{ height: 1320 }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              proOptions={{ hideAttribution: true }}
              minZoom={0.4}
              maxZoom={1.5}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border-subtle)" />
              <Controls showInteractive={false} />
            </ReactFlow>
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
                  <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                    {s.purpose}
                  </p>
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
                O cliente se autentica na etapa 02 — antes de aceitar termos (no perfil) e antes de qualquer pagamento. Ninguém concorda com contrato ou paga sem uma identidade verificada por trás.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Convite é a etapa 01</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                A primeira tela do produto valida o código de convite (ou o magic link do e-mail). É o portão de entrada — só quem foi convidado segue para a autenticação.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">3 telas de checkout, não 1</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Cada método de pagamento tem affordances diferentes (QR no Pix, formulário longo no cartão, código no boleto). Uma tela só com tabs cria espaço morto e empurra erro pra runtime.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">OAuth como caminho preferido</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Google/Microsoft no topo, senha como terceira opção. Usuário corporativo (público-alvo) prefere SSO. Reduz reset de senha no longo prazo.
              </p>
            </div>
          </div>
        </Section>
      </div>
    </>
  )
}
