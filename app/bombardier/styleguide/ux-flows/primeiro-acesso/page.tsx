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
 * Flow data — 6 etapas
 *
 * Reta linear: autenticação acontece logo no início (etapa 02), antes de
 * aceitar o contrato e de pagar. O pagamento é uma etapa única — método e
 * parcelas são escolhidos por item, e checkout/processamento são fases
 * internas dela.
 * ──────────────────────────────────────────────────────────────────── */

const COL = 280

const Y = {
  entrada: 0,
  verificacao: 150,
  conta: 300,
  perfil: 480,
  contrato: 630,
  pagamento: 780,
  concluido: 960,
  inicio: 1110,
}

const nodes: Node[] = [
  {
    id: "entrada",
    type: "screen",
    position: { x: COL, y: Y.entrada },
    data: {
      step: "entrada",
      title: "Login",
      href: "/",
      note: "Tela de login. O link “Primeiro acesso” inicia o fluxo.",
    } satisfies ScreenData,
  },
  {
    id: "verificacao",
    type: "screen",
    position: { x: COL, y: Y.verificacao },
    data: {
      step: "01",
      title: "Verificação",
      href: "/primeiro-acesso/verificacao",
      note: "Valida o código de primeiro acesso de 6 dígitos.",
    } satisfies ScreenData,
  },
  {
    id: "conta",
    type: "decision",
    position: { x: COL - 20, y: Y.conta },
    data: {
      step: "02",
      title: "Sua conta",
      question: "Cliente cria a conta: Google, Microsoft ou senha.",
    } satisfies DecisionData,
  },
  {
    id: "perfil",
    type: "screen",
    position: { x: COL, y: Y.perfil },
    data: {
      step: "03",
      title: "Seu perfil",
      href: "/primeiro-acesso/perfil",
      note: "Nome, telefone, foto e destinatários de fatura.",
    } satisfies ScreenData,
  },
  {
    id: "contrato",
    type: "screen",
    position: { x: COL, y: Y.contrato },
    data: {
      step: "04",
      title: "Contrato",
      href: "/primeiro-acesso/contrato",
      note: "Revisa condições comerciais e aceita os termos.",
    } satisfies ScreenData,
  },
  {
    id: "pagamento",
    type: "decision",
    position: { x: COL - 20, y: Y.pagamento },
    data: {
      step: "05",
      title: "Pagamento",
      question:
        "Implementação + 1ª mensalidade. Método (Pix/Cartão/Boleto) e parcelas por item; checkout e processamento são fases internas.",
    } satisfies DecisionData,
  },
  {
    id: "concluido",
    type: "screen",
    position: { x: COL, y: Y.concluido },
    data: {
      step: "06",
      title: "Concluído",
      href: "/primeiro-acesso/concluido",
      note: "Ambiente provisionado e pronto para uso.",
    } satisfies ScreenData,
  },
  {
    id: "inicio",
    type: "screen",
    position: { x: COL, y: Y.inicio },
    data: {
      step: "fim",
      title: "Início",
      href: "/inicio",
      note: "Home logada — o cliente entra no produto.",
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
    id: "e-entrada-verificacao",
    source: "entrada",
    target: "verificacao",
    label: "Primeiro acesso",
    ...branchLabel,
  },
  { ...edgeBase, id: "e-verificacao-conta", source: "verificacao", target: "conta" },
  { ...edgeBase, id: "e-conta-perfil", source: "conta", target: "perfil" },
  { ...edgeBase, id: "e-perfil-contrato", source: "perfil", target: "contrato" },
  { ...edgeBase, id: "e-contrato-pagamento", source: "contrato", target: "pagamento" },
  { ...edgeBase, id: "e-pagamento-concluido", source: "pagamento", target: "concluido" },
  { ...edgeBase, id: "e-concluido-inicio", source: "concluido", target: "inicio" },
]

/* ─────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────── */

const screens = [
  {
    step: "01",
    title: "Verificação",
    href: "/primeiro-acesso/verificacao",
    purpose:
      "Primeira tela do produto. Valida o código de primeiro acesso de 6 dígitos enviado no e-mail de convite e confirma que aquela pessoa foi convidada.",
    decisions: "Código válido → segue para a criação da conta.",
  },
  {
    step: "02",
    title: "Sua conta",
    href: "/primeiro-acesso/conta",
    purpose:
      "Autenticação logo no início — antes de aceitar o contrato ou pagar. OAuth (Google/Microsoft) reduz fricção e é o caminho preferido; senha fica como terceira opção. O método escolhido segue no selo de sessão do brand pane.",
    decisions: "Escolher entre Google, Microsoft ou senha → perfil.",
  },
  {
    step: "03",
    title: "Seu perfil",
    href: "/primeiro-acesso/perfil",
    purpose:
      "Cliente confirma como quer ser chamado, telefone e foto, e define quem recebe as faturas — ele mesmo e/ou outros destinatários da organização.",
    decisions: "Continuar → contrato.",
  },
  {
    step: "04",
    title: "Contrato",
    href: "/primeiro-acesso/contrato",
    purpose:
      "Cliente revisa dados da empresa e condições comerciais (implementação, mensalidade cheia, 1ª mensalidade prorrata), conhece o time AwSales e aceita os termos antes de pagar.",
    decisions: "Aceitar os termos → pagamento.",
  },
  {
    step: "05",
    title: "Pagamento",
    href: "/primeiro-acesso/pagamento",
    purpose:
      "Etapa única que cobra a implementação e a 1ª mensalidade. Cada item escolhe método (Pix/Cartão/Boleto) e parcelas; a 1ª mensalidade acompanha a implementação até o cliente personalizar. Checkout (instrumentos de pagamento) e processamento são fases internas da própria etapa.",
    decisions: "Configurar → checkout → confirmar → concluído.",
  },
  {
    step: "06",
    title: "Concluído",
    href: "/primeiro-acesso/concluido",
    purpose:
      "Ambiente provisionado e pronto. Mostra o resumo do que foi pago, a próxima cobrança e o Account Manager. Acessar a plataforma leva ao Início logado.",
    decisions: "Acessar a plataforma → /inicio (home logada).",
  },
]

export default function PrimeiroAcessoFlowPage() {
  return (
    <>
      <PageHero title="Primeiro acesso">
        Fluxo completo de onboarding do novo cliente, em 6 etapas. O cliente se
        autentica logo no começo — antes de aceitar o contrato e de qualquer
        pagamento. Use este mapa quando precisar entender pra onde uma decisão
        leva, ou ao iterar em qualquer tela do fluxo.
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Reta de onboarding pós-convite — autenticação acontece na etapa 02.</>,
            <>Cliente aceita o contrato e paga já autenticado; entra logado no final.</>,
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
          lead="Clique em qualquer tela pra abrir o protótipo. Caixas tracejadas em âmbar são decisões — pontos em que o cliente faz uma escolha."
        >
          <div
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-hidden"
            style={{ height: 1040 }}
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
              <div className="aw-eyebrow mb-2">Pagamento unificado</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Implementação e 1ª mensalidade são cobradas num só passo. Cada item escolhe método e parcelas; checkout e processamento são fases internas — sem rotas separadas por método, menos espaço morto entre telas.
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
