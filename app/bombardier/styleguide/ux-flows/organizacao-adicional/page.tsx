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

const Y = {
  entrada:        0,
  contrato:     180,
  pagamento:    360,
  methods:      560,
  concluido:    760,
  retorno:      940,
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
      title: "Login (já cadastrado, plano novo)",
      href: "/bombardier/styleguide/ux-flows/login-auth",
      note: "Vindo do login: decisão D7 detectou um plano comprado sem org configurada e o usuário escolheu 'Configurar agora'.",
    },
  },
  {
    id: "contrato",
    type: "screen",
    position: { x: COL, y: Y.contrato },
    data: {
      step: "01",
      title: "Contrato",
      href: "/organizacao-adicional/contrato",
      note: "Revisa condições comerciais da nova organização e aceita os termos. Perfil pessoal não aparece — já existe.",
    },
  },
  {
    id: "pagamento",
    type: "decision",
    position: { x: COL_D, y: Y.pagamento },
    data: { step: "02", title: "Pagamento", question: "Implementação + 1ª mensalidade da nova organização. Qual o método?" },
  },
  {
    id: "pix",
    type: "screen",
    position: { x: PIX_X, y: Y.methods },
    data: { step: "02a", title: "Pix", href: "/organizacao-adicional/pagamento", note: "QR Code instantâneo. Confirmação em segundos." },
  },
  {
    id: "cartao",
    type: "screen",
    position: { x: CARTAO_X, y: Y.methods },
    data: { step: "02b", title: "Cartão de crédito", href: "/organizacao-adicional/pagamento", note: "Crédito em até 12×. Confirmação imediata." },
  },
  {
    id: "boleto",
    type: "screen",
    position: { x: BOLETO_X, y: Y.methods },
    data: { step: "02c", title: "Boleto bancário", href: "/organizacao-adicional/pagamento", note: "Vencimento em 3 dias úteis. Compensação em 1 dia útil." },
  },
  {
    id: "concluido",
    type: "screen",
    position: { x: COL, y: Y.concluido },
    data: { step: "03", title: "Concluído", href: "/organizacao-adicional/concluido", note: "Nova organização provisionada. Resumo do que foi pago e próxima cobrança." },
  },
  {
    id: "retorno",
    type: "screen",
    position: { x: COL, y: Y.retorno },
    data: { step: "→ plataforma", title: "Entrou na plataforma", href: "/inicio", note: "Home logada já no contexto da nova organização." },
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
  { ...edgeBase, id: "e-entrada-contrato", source: "entrada", target: "contrato", label: "Configurar agora", ...labelProps },
  { ...edgeBase, id: "e-contrato-pagamento", source: "contrato", target: "pagamento" },
  { ...branchEdge, id: "e-pagamento-pix",    source: "pagamento", target: "pix",    sourceHandle: "left",   label: "Pix",    ...labelProps },
  { ...branchEdge, id: "e-pagamento-cartao", source: "pagamento", target: "cartao", sourceHandle: "bottom", label: "Cartão", ...labelProps },
  { ...branchEdge, id: "e-pagamento-boleto", source: "pagamento", target: "boleto", sourceHandle: "right",  label: "Boleto", ...labelProps },
  { ...edgeBase, id: "e-pix-concluido",    source: "pix",    target: "concluido" },
  { ...edgeBase, id: "e-cartao-concluido", source: "cartao", target: "concluido" },
  { ...edgeBase, id: "e-boleto-concluido", source: "boleto", target: "concluido" },
  { ...edgeBase, id: "e-concluido-retorno", source: "concluido", target: "retorno", label: "Acessar plataforma", ...labelProps },
]

/* ─────────────────────────────────────────────────────────────────────
 * Screen docs
 * ──────────────────────────────────────────────────────────────────── */

const screens = [
  {
    step: "01",
    title: "Contrato",
    href: "/organizacao-adicional/contrato",
    purpose: "Cliente revisa dados da nova organização e condições comerciais do plano comprado (implementação, mensalidade cheia, 1ª mensalidade prorrata) antes de pagar. Não pede dados pessoais — o perfil já existe.",
    decisions: "Aceitar os termos → pagamento. Voltar / Adiar → /inicio (banner persistente segue ativo).",
  },
  {
    step: "02",
    title: "Pagamento",
    href: "/organizacao-adicional/pagamento",
    purpose: "Mesma etapa de pagamento do primeiro acesso, aplicada à nova organização. Cobra implementação e 1ª mensalidade via Pix, Cartão ou Boleto. Confirmação automática.",
    decisions: "Pix → QR Code; Cartão → crédito parcelado; Boleto → gerado na hora → concluído.",
  },
  {
    step: "03",
    title: "Concluído",
    href: "/organizacao-adicional/concluido",
    purpose: "Nova organização provisionada e pronta. Mostra resumo do que foi pago e a próxima cobrança. Banner persistente no /inicio some daqui em diante.",
    decisions: "Acessar plataforma → /inicio (home logada, agora também com acesso à nova org).",
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
      "Flow criado pra cobrir o caso 'usuário já cadastrado comprou plano novo'. Reaproveita contrato e pagamento do primeiro acesso, sem perfil — porque o perfil pessoal já existe.",
    tags: ["new-page"],
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────── */

export default function OrganizacaoAdicionalFlowPage() {
  return (
    <>
      <PageHero
        title="Configurar organização adicional"
        trailing={<FlowUpdatesBadge updates={updates} />}
      >
        Subflow disparado a partir da decisão D7 do{" "}
        <Link
          href="/bombardier/styleguide/ux-flows/login-auth"
          className="text-[var(--aw-blue-700)] hover:text-[var(--aw-blue-800)] no-underline hover:underline"
        >
          login
        </Link>
        : usuário já cadastrado que comprou um plano novo para outra organização e escolheu
        configurá-la agora. Mesmas etapas do primeiro acesso — menos perfil — porque os
        dados pessoais já existem.
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed max-w-2xl -mt-8">
          Três etapas lineares: contrato da nova organização → pagamento (Pix, Cartão ou
          Boleto) → confirmação. Quando o usuário escolhe adiar no login, ele cai direto
          em /inicio com um banner persistente lembrando da pendência — esse banner some
          assim que a configuração é concluída.
        </p>

        <Section
          id="flow"
          title="Fluxograma"
          lead="Passe o mouse em qualquer tela e clique no olho pra abrir o protótipo num painel lateral. Caixas tracejadas em âmbar são decisões. Setas âmbar indicam bifurcações."
        >
          <FlowDiagram flow="organizacao-adicional" nodes={NODES} edges={EDGES} height={1200} />
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
          lead="Por que esse subflow existe separado do primeiro acesso."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Perfil já existe — não pergunta de novo</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Nome, telefone, foto e destinatários de fatura já foram coletados no primeiro acesso. Pedir de novo é fricção sem retorno. O contrato e a cobrança são por organização, então essas duas etapas continuam.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Disparado por D7 do login</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Não existe entrada direta para esse fluxo — o usuário chega aqui sempre pela decisão D7 do{" "}
                <Link
                  href="/bombardier/styleguide/ux-flows/login-auth"
                  className="text-[var(--aw-blue-700)] hover:text-[var(--aw-blue-800)] no-underline hover:underline"
                >
                  login
                </Link>
                {" "}ou pelo banner persistente no /inicio quando adiou.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Adiar é uma opção, não uma pendência ignorada</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Quem comprou o plano correndo pode entrar na plataforma usando outra organização. O banner persistente em /inicio garante que a pendência fique visível até ser resolvida — sem bloquear o trabalho.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Mesmos componentes de pagamento</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                A etapa de pagamento reusa o seletor de método e instrumentos do primeiro acesso. Cliente já conhece a tela — menos surpresa, menos chance de erro.
              </p>
            </div>
          </div>
        </Section>

        <FlowUpdatesHistorySection updates={updates} />
      </div>
    </>
  )
}
