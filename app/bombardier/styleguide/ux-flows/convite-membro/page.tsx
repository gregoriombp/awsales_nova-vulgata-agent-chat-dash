"use client"

import Link from "next/link"
import type { Edge, Node } from "@xyflow/react"

import { PageHero, Section } from "../../_primitives"
import { branchEdge, edgeBase, FlowDiagram } from "../_components/flow-editor"

/* ─────────────────────────────────────────────────────────────────────
 * Layout constants
 *
 * Centre spine: COL / COL_D (centered at x=380)
 * 3-branch row: GOOGLE_X (40) / MICROSOFT_X (280) / SENHA_X (520)
 * ──────────────────────────────────────────────────────────────────── */

const COL    = 280
const COL_D  = 260

const GOOGLE_X    = 40
const MICROSOFT_X = 280
const SENHA_X     = 520

const Y = {
  entrada:     0,
  landing:   160,
  decisao:   320,
  methods:   520,
  perfil:    700,
  concluido: 860,
  plataforma: 1020,
}

/* ─────────────────────────────────────────────────────────────────────
 * Nodes
 * ──────────────────────────────────────────────────────────────────── */

const NODES: Node[] = [
  {
    id: "entrada",
    type: "screen",
    position: { x: COL, y: Y.entrada },
    data: {
      step: "entrada",
      title: "E-mail de convite",
      href: "#",
      note: "Pessoa recebe o e-mail do admin e clica no magic link.",
    },
  },
  {
    id: "landing",
    type: "screen",
    position: { x: COL, y: Y.landing },
    data: {
      step: "01",
      title: "Boas-vindas",
      href: "/convite",
      note: "Mostra organização, quem convidou, função e grupos pré-atribuídos.",
    },
  },
  {
    id: "metodo",
    type: "decision",
    position: { x: COL_D, y: Y.decisao },
    data: {
      step: "02",
      title: "Sua conta",
      question: "Como você quer entrar daqui pra frente?",
    },
  },
  {
    id: "google",
    type: "screen",
    position: { x: GOOGLE_X, y: Y.methods },
    data: {
      step: "02a",
      title: "Google SSO",
      href: "/convite/conta",
      note: "OAuth com Google Workspace. Caminho preferido.",
    },
  },
  {
    id: "microsoft",
    type: "screen",
    position: { x: MICROSOFT_X, y: Y.methods },
    data: {
      step: "02b",
      title: "Microsoft SSO",
      href: "/convite/conta",
      note: "OAuth com Microsoft 365 / Entra ID.",
    },
  },
  {
    id: "senha",
    type: "screen",
    position: { x: SENHA_X, y: Y.methods },
    data: {
      step: "02c",
      title: "Senha",
      href: "/convite/conta",
      note: "Define senha forte. Caminho de exceção.",
    },
  },
  {
    id: "perfil",
    type: "screen",
    position: { x: COL, y: Y.perfil },
    data: {
      step: "03",
      title: "Seu perfil",
      href: "/convite/perfil",
      note: "Nome, cargo, foto e celular. E-mail vem travado do convite.",
    },
  },
  {
    id: "concluido",
    type: "screen",
    position: { x: COL, y: Y.concluido },
    data: {
      step: "04",
      title: "Conta criada",
      href: "/convite/concluido",
      note: "Resumo de função e grupos. Inviter avisado.",
    },
  },
  {
    id: "plataforma",
    type: "screen",
    position: { x: COL, y: Y.plataforma },
    data: {
      step: "→ plataforma",
      title: "Entrar na plataforma",
      href: "/inicio",
      note: "Home logada — o membro já está dentro da operação.",
    },
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
  { ...edgeBase, id: "e-entrada-landing", source: "entrada", target: "landing", label: "Clica no link", ...labelProps },
  { ...edgeBase, id: "e-landing-metodo", source: "landing", target: "metodo", label: "Aceitar", ...labelProps },
  { ...branchEdge, id: "e-metodo-google",    source: "metodo", target: "google",    sourceHandle: "left",   label: "Google",    ...labelProps },
  { ...branchEdge, id: "e-metodo-microsoft", source: "metodo", target: "microsoft", sourceHandle: "bottom", label: "Microsoft", ...labelProps },
  { ...branchEdge, id: "e-metodo-senha",     source: "metodo", target: "senha",     sourceHandle: "right",  label: "Senha",     ...labelProps },
  { ...edgeBase, id: "e-google-perfil",    source: "google",    target: "perfil" },
  { ...edgeBase, id: "e-microsoft-perfil", source: "microsoft", target: "perfil" },
  { ...edgeBase, id: "e-senha-perfil",     source: "senha",     target: "perfil" },
  { ...edgeBase, id: "e-perfil-concluido",   source: "perfil",    target: "concluido" },
  { ...edgeBase, id: "e-concluido-plataforma", source: "concluido", target: "plataforma" },
]

/* ─────────────────────────────────────────────────────────────────────
 * Screen docs
 * ──────────────────────────────────────────────────────────────────── */

const screens = [
  {
    step: "01",
    title: "Boas-vindas",
    href: "/convite",
    purpose:
      "Primeira tela depois do clique no magic link. Mostra a organização, quem convidou (com avatar), a função pré-atribuída e os grupos em que o membro já entra. O link já verificou o e-mail — não há código de 6 dígitos.",
    decisions: "Aceitar e continuar → criação da conta.",
  },
  {
    step: "02",
    title: "Sua conta",
    href: "/convite/conta",
    purpose:
      "Autenticação. Google e Microsoft no topo (caminho preferido — público corporativo); senha como terceira opção. Mesmo padrão do /primeiro-acesso/conta pra manter coerência entre os dois onboardings.",
    decisions: "Escolher Google, Microsoft ou senha → perfil.",
  },
  {
    step: "03",
    title: "Seu perfil",
    href: "/convite/perfil",
    purpose:
      "Nome, cargo, foto e celular. O e-mail vem travado do convite — só o admin pode trocar. Diferente do onboarding de comprador, NÃO há campos de fatura: quem convidou cuida do financeiro.",
    decisions: "Continuar → confirmação.",
  },
  {
    step: "04",
    title: "Conta criada",
    href: "/convite/concluido",
    purpose:
      "Confirma que a conta está ativa, mostra resumo da função e grupos e informa que quem convidou foi avisado. CTA primário leva direto pra plataforma.",
    decisions: "Entrar na plataforma → /inicio (home logada).",
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────── */

export default function ConviteMembroFlowPage() {
  return (
    <>
      <PageHero title="Convite de membro">
        Fluxo que um novo membro percorre depois de clicar no magic link
        recebido por e-mail. Quatro telas curtas — boas-vindas, criação de
        conta, perfil e confirmação — pra que alguém convidado pelo admin entre
        na operação sem fricção.
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed max-w-2xl -mt-8">
          Quatro etapas lineares do convite até a home logada. O magic link
          serve como verificação — não há código de 6 dígitos. A única decisão
          do fluxo é o método de autenticação (Google, Microsoft ou senha), e
          os três caminhos convergem na mesma tela de perfil. Função e grupos
          vêm pré-definidos pelo inviter; o membro não escolhe seu nível de
          acesso.
        </p>

        <Section
          id="flow"
          title="Fluxograma"
          lead="Passe o mouse em qualquer tela e clique no olho pra abrir o protótipo num painel lateral. Caixa tracejada em âmbar é decisão. Setas âmbar indicam os caminhos de bifurcação."
        >
          <FlowDiagram flow="convite-membro" nodes={NODES} edges={EDGES} height={1300} />
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
              <div className="aw-eyebrow mb-2">Magic link é a verificação</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Não há etapa de código de 6 dígitos como em /primeiro-acesso. O
                próprio link no e-mail já comprova posse da caixa de entrada —
                um clique a menos pra completar o onboarding.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Função vem pré-definida</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Quem convida escolhe a função e os grupos no momento do
                convite. O novo membro vê o que vai receber, mas não altera —
                permissão é responsabilidade do admin, não da pessoa convidada.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Sem contrato e sem pagamento</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                A organização já está com o contrato ativo. O membro não vê
                condições comerciais, não aceita termos comerciais e não
                preenche dados de fatura — entra direto na operação.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Coerência com o buyer</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Mesmo AwOnboardingShell, mesma tipografia, mesmos tokens.
                Quando o admin (que passou por /primeiro-acesso) compara o
                ambiente com o que o time vê, o visual é o mesmo — sem
                surpresas.
              </p>
            </div>
          </div>
        </Section>
      </div>
    </>
  )
}
