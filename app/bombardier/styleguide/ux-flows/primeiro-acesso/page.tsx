"use client"

import Link from "next/link"
import type { Edge, Node } from "@xyflow/react"

import { PageHero, Section } from "../../_primitives"
import { branchEdge, edgeBase, FlowDiagram } from "../_components/flow-editor"
import {
  FlowUpdatesBadge,
  FlowUpdatesHistorySection,
  type FlowUpdate,
} from "../_components/flow-updates"

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

const EXPIRADO_X   = 560
const UTILIZADO_X  = 820
const CANCELADO_X  = 1080

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
    data: { step: "link", title: "Status do link?", question: "O link do e-mail ainda é válido? (até 10 dias, primeira utilização e não cancelado pela organização)" },
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
    data: { step: "01b", title: "Link expirado", href: "/primeiro-acesso/link-expirado", note: "Fora do fluxo demo. Passou de 10 dias — oferece reenvio." },
  },
  {
    id: "linkUtilizado",
    type: "screen",
    position: { x: UTILIZADO_X, y: Y.verificacao },
    data: { step: "01c", title: "Link já utilizado", href: "/primeiro-acesso/link-utilizado", note: "Fora do fluxo demo. Link é one-time — direciona pro suporte." },
  },
  {
    id: "linkCancelado",
    type: "screen",
    position: { x: CANCELADO_X, y: Y.verificacao },
    data: { step: "01d", title: "Link cancelado", href: "/primeiro-acesso/link-cancelado", note: "Fora do fluxo demo. Convite removido pela organização — pro suporte." },
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

const labelProps = {
  labelStyle: { fill: "var(--fg-secondary)", fontSize: 11, fontWeight: 500 },
  labelBgStyle: { fill: "var(--bg-canvas)" },
  labelBgPadding: [6, 4] as [number, number],
}

const EDGES: Edge[] = [
  { ...edgeBase, id: "e-entrada-linkValido", source: "entrada", target: "linkValido", label: "Primeiro acesso", ...labelProps },
  { ...branchEdge, id: "e-linkValido-verificacao", source: "linkValido", target: "verificacao", sourceHandle: "bottom", label: "Válido", ...labelProps },
  { ...branchEdge, id: "e-linkValido-expirado",    source: "linkValido", target: "linkExpirado",  sourceHandle: "right", label: "Expirado (10d)", ...labelProps },
  { ...branchEdge, id: "e-linkValido-utilizado",   source: "linkValido", target: "linkUtilizado", sourceHandle: "right", label: "Já utilizado",   ...labelProps },
  { ...branchEdge, id: "e-linkValido-cancelado",   source: "linkValido", target: "linkCancelado", sourceHandle: "right", label: "Cancelado",      ...labelProps },
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
    step: "01c",
    title: "Link já utilizado",
    href: "/primeiro-acesso/link-utilizado",
    purpose: "Tela condicional fora do fluxo demo. Aparece quando o link de primeiro acesso já foi consumido — links são one-time. Pode indicar que a conta já foi criada (e o usuário deveria fazer login) ou que alguém abriu o e-mail no lugar dele. Direciona pro suporte pra revogar e reemitir o acesso se necessário.",
    decisions: 'Falar com suporte → abre canal de suporte; "Voltar para o login" volta pra "/".',
  },
  {
    step: "01d",
    title: "Link cancelado",
    href: "/primeiro-acesso/link-cancelado",
    purpose: "Tela condicional fora do fluxo demo. Aparece quando o convite de primeiro acesso foi cancelado ou removido pela organização (reemissão, troca de destinatário, cadastro pausado). O usuário não consegue prosseguir sem ajuda — o suporte verifica o status do convite com a organização.",
    decisions: 'Falar com suporte → abre canal de suporte; "Voltar para o login" volta pra "/".',
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
    date: "2026-05-26",
    summary:
      "Decisão de link expandida em três estados de falha — expirado, já utilizado e cancelado. Cada um abre uma tela condicional dedicada com CTA pro suporte (exceto 'expirado', que ainda permite reenvio).",
    tags: ["new-page", "new-branch"],
  },
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
          qualquer cobrança. Logo no início há três ramos condicionais fora do fluxo
          demo, um para cada motivo de link inválido: expirado (reenvia), já utilizado
          (suporte) ou cancelado pela organização (suporte). No final, o cliente
          escolhe acessar a plataforma direto ou conversar com o consultor.
        </p>

        <Section
          id="flow"
          title="Fluxograma"
          lead="Clique em qualquer tela pra abrir o protótipo num painel lateral. Caixas tracejadas em âmbar são decisões — pontos em que o cliente faz uma escolha. Setas âmbar indicam os caminhos de bifurcação."
        >
          <FlowDiagram flow="primeiro-acesso" nodes={NODES} edges={EDGES} height={1960} />
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
              <div className="aw-eyebrow mb-2">Três motivos pra um link falhar</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Links de primeiro acesso são one-time e expiram após 10 dias. Em vez de cair numa única tela genérica de erro, cada motivo tem sua própria tela explicativa: <b className="font-medium text-[var(--fg-primary)]">expirado</b> oferece reenvio direto, <b className="font-medium text-[var(--fg-primary)]">já utilizado</b> e <b className="font-medium text-[var(--fg-primary)]">cancelado</b> direcionam pro suporte — porque exigem verificação de identidade ou contato com a organização.
              </p>
            </div>
          </div>
        </Section>

        <FlowUpdatesHistorySection updates={updates} />
      </div>
    </>
  )
}
