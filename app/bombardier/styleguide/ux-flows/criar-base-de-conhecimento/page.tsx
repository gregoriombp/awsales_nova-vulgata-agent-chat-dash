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

const COL = 280 // screen node (200px) → centro 380
const COL_D = 260 // decision node (240px) → centro 380

// 2 ramos simétricos em torno de 380
const LEFT_X = 80 // centro 180
const RIGHT_X = 480 // centro 580

const Y = {
  entrada: 0,
  nome: 160,
  criada: 320,
  decConfig: 480,
  branchConfig: 680, // "Depois" (terminal) + "Configurar" (objetivo) lado a lado
  segmento: 840,
  decEnvio: 1000,
  envioRow: 1200, // Padrão / Catálogo
  basePronta: 1400,
}

/* ─────────────────────────────────────────────────────────────────────
 * Nodes — espelham o /memory-base/new já construído (wizard full-screen).
 * As fases do wizard moram numa única rota, então as telas internas
 * apontam todas pra /memory-base/new (o drawer abre o wizard ao vivo).
 * ──────────────────────────────────────────────────────────────────── */

export const NODES: Node[] = [
  {
    id: "entrada",
    type: "screen",
    position: { x: COL, y: Y.entrada },
    data: {
      step: "entrada",
      title: "Bases de conhecimento",
      href: "/memory-base",
      note: 'Lista das bases. Clica em "Nova base" pra abrir o wizard full-screen.',
    },
  },
  {
    id: "nome",
    type: "screen",
    position: { x: COL, y: Y.nome },
    data: {
      step: "01",
      title: "Nome da base",
      href: "/memory-base/new",
      note: "Nomeia a base e clica Criar — a base nasce já neste passo.",
    },
  },
  {
    id: "criada",
    type: "screen",
    position: { x: COL, y: Y.criada },
    data: {
      step: "02",
      title: "Base criada",
      href: "/memory-base/new",
      note: 'Celebração: a base já existe e está salva. "Configurar" surge em fade.',
    },
  },
  {
    id: "decConfig",
    type: "decision",
    position: { x: COL_D, y: Y.decConfig },
    data: {
      step: "03",
      title: "Classificar agora?",
      question: "Configurar a base agora ou voltar pra lista e classificar depois?",
    },
  },
  {
    id: "depois",
    type: "screen",
    position: { x: LEFT_X, y: Y.branchConfig },
    data: {
      step: "→ lista",
      title: "Base na lista",
      href: "/memory-base",
      note: "Fechar (X) a qualquer momento deixa a base criada, sem classificação, esperando na lista.",
    },
  },
  {
    id: "objetivo",
    type: "screen",
    position: { x: COL, y: Y.branchConfig },
    data: {
      step: "04",
      title: "Objetivo",
      href: "/memory-base/new",
      note: "5 cards: Vendas, Onboarding, Suporte, CS / Lançamento, Captação de lead.",
    },
  },
  {
    id: "segmento",
    type: "screen",
    position: { x: COL, y: Y.segmento },
    data: {
      step: "05",
      title: "Segmento",
      href: "/memory-base/new",
      note: "3 cards: Educação, Produto físico, Serviços.",
    },
  },
  {
    id: "decEnvio",
    type: "decision",
    position: { x: COL_D, y: Y.decEnvio },
    data: {
      step: "06",
      title: "Formato de envio",
      question: "Como os dados dos produtos chegam na base?",
    },
  },
  {
    id: "padrao",
    type: "screen",
    position: { x: LEFT_X, y: Y.envioRow },
    data: {
      step: "06a",
      title: "Padrão",
      href: "/memory-base/new",
      note: "Dados produto a produto — links e documentos individuais.",
    },
  },
  {
    id: "catalogo",
    type: "screen",
    position: { x: RIGHT_X, y: Y.envioRow },
    data: {
      step: "06b",
      title: "Catálogo",
      href: "/memory-base/new",
      note: "Dados em lote — CSV ou integração, estrutura padronizada.",
    },
  },
  {
    id: "basePronta",
    type: "screen",
    position: { x: COL, y: Y.basePronta },
    data: {
      step: "→ base",
      title: "Base pronta",
      href: "/memory-base",
      note: "Vai pra /memory-base/[id]?new=1 — a base nova aberta, pronta pra receber fontes.",
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

export const EDGES: Edge[] = [
  { ...edgeBase, id: "e-entrada-nome", source: "entrada", target: "nome", label: "Nova base", ...labelProps },
  { ...edgeBase, id: "e-nome-criada", source: "nome", target: "criada", label: "Criar", ...labelProps },
  { ...edgeBase, id: "e-criada-decConfig", source: "criada", target: "decConfig" },

  { ...branchEdge, id: "e-decConfig-depois", source: "decConfig", target: "depois", sourceHandle: "left", label: "Depois", ...labelProps },
  { ...branchEdge, id: "e-decConfig-objetivo", source: "decConfig", target: "objetivo", sourceHandle: "bottom", label: "Configurar", ...labelProps },

  { ...edgeBase, id: "e-objetivo-segmento", source: "objetivo", target: "segmento" },
  { ...edgeBase, id: "e-segmento-decEnvio", source: "segmento", target: "decEnvio" },

  { ...branchEdge, id: "e-decEnvio-padrao", source: "decEnvio", target: "padrao", sourceHandle: "left", label: "Padrão", ...labelProps },
  { ...branchEdge, id: "e-decEnvio-catalogo", source: "decEnvio", target: "catalogo", sourceHandle: "right", label: "Catálogo", ...labelProps },
  { ...edgeBase, id: "e-padrao-basePronta", source: "padrao", target: "basePronta" },
  { ...edgeBase, id: "e-catalogo-basePronta", source: "catalogo", target: "basePronta" },
]

/* ─────────────────────────────────────────────────────────────────────
 * Screen docs
 * ──────────────────────────────────────────────────────────────────── */

const screens = [
  {
    step: "01",
    title: "Nome da base",
    href: "/memory-base/new",
    purpose: "Primeira tela do wizard. Foco único: o nome. Clicar Criar já cria a base — a classificação vem depois.",
    decisions: "Criar → Base criada.",
  },
  {
    step: "02",
    title: "Base criada",
    href: "/memory-base/new",
    purpose: "Celebração cinematográfica: a base já existe e está salva. Depois de ~1,3s, o botão Configurar surge em fade.",
    decisions: "Configurar → Objetivo · Fechar (X) → lista (base sem classificação).",
  },
  {
    step: "04",
    title: "Objetivo",
    href: "/memory-base/new",
    purpose: "Pra que a base serve (Vendas, Onboarding, Suporte, CS, Captação). Faz patch na base recém-criada.",
    decisions: "Avançar → Segmento.",
  },
  {
    step: "05",
    title: "Segmento",
    href: "/memory-base/new",
    purpose: "Segmento de negócio (Educação, Produto físico, Serviços).",
    decisions: "Avançar → Formato de envio.",
  },
  {
    step: "06",
    title: "Formato de envio",
    href: "/memory-base/new",
    purpose: "Como os dados dos produtos chegam: Padrão (produto a produto) ou Catálogo (lote via CSV/integração). É o único fork de conteúdo do wizard.",
    decisions: "Padrão / Catálogo → Base pronta.",
  },
  {
    step: "→ base",
    title: "Base pronta",
    href: "/memory-base",
    purpose: "Fim do wizard: cai em /memory-base/[id]?new=1 — a base nova aberta, pronta pra receber fontes (arquivos, sites, integrações).",
    decisions: "Continua dentro da base.",
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Updates log — structural changes only. Add new entries at the top.
 * Managed by the `bombardier-update-ux-flow` skill.
 * ──────────────────────────────────────────────────────────────────── */

const updates: FlowUpdate[] = [
  {
    date: "2026-06-08",
    summary:
      "Reescrito pra refletir o /memory-base/new já CONSTRUÍDO (wizard full-screen): Nome → Base criada (a base nasce aqui) → Objetivo → Segmento → Envio (Padrão/Catálogo) → base. Substitui o mapa do spec do Figma (Produto/Catálogo/Playbook), que não foi o que se implementou. Telas apontam pra rota real (previewáveis no drawer).",
    tags: ["flow-rework"],
  },
  {
    date: "2026-06-07",
    summary:
      "Flow mapeado a partir do Figma (Flow library AW) — 6 etapas com ramos novo/existente (Produto · Catálogo/XLS · Playbook). Status à época: a desenvolver (só existia modal v0).",
    tags: ["new-page"],
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────── */

export default function CriarBaseDeConhecimentoFlowPage() {
  return (
    <>
      <PageHero
        title="Criar base de conhecimento"
        trailing={<FlowUpdatesBadge updates={updates} />}
      >
        Wizard full-screen de criação de uma base de conhecimento na Memory Base
        (rota <code>/memory-base/new</code>). Mapeia o fluxo{" "}
        <b className="font-medium text-(--fg-primary)">já construído</b> — a base
        nasce cedo (no passo do nome) e a classificação vem depois, opcional.
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <p className="text-sm text-(--fg-secondary) leading-relaxed max-w-2xl -mt-8">
          São 5 telas com 2 pontos de decisão. O detalhe central: a base é{" "}
          <b className="font-medium text-(--fg-primary)">criada já no passo do nome</b>{" "}
          (botão Criar) — a celebração que segue confirma que ela existe. A
          classificação (Objetivo · Segmento · Envio) é opcional: dá pra fechar a
          qualquer momento e a base fica salva na lista. O único fork de conteúdo
          é o formato de envio (Padrão vs. Catálogo), que converge na base pronta.
        </p>

        <Section
          id="flow"
          title="Fluxograma"
          lead="Clique em qualquer tela pra abrir o protótipo num painel lateral — as telas internas abrem o /memory-base/new ao vivo. Caixas tracejadas em âmbar são decisões; setas âmbar são os ramos. Na barra embaixo dá pra comentar (vai pro review com chip UX Flow), sugerir edição ou ver em tela cheia."
        >
          <FlowDiagram flow="criar-base-de-conhecimento" nodes={NODES} edges={EDGES} height={1600} />
        </Section>

        <Section
          id="screens"
          title="Cada tela"
          lead="Propósito e pra onde leva cada etapa do wizard."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) overflow-hidden">
            <ul className="m-0 p-0 list-none flex flex-col divide-y divide-(--border-subtle)">
              {screens.map((s) => (
                <li key={s.step + s.title} className="p-5 flex flex-col gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className="aw-eyebrow text-(--aw-blue-700)">{s.step}</span>
                    <h3 className="m-0 text-base font-medium text-(--fg-primary)">{s.title}</h3>
                  </div>
                  <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">{s.purpose}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1">
                    <span className="caption">
                      <span className="font-medium text-(--fg-secondary)">Decisões: </span>
                      {s.decisions}
                    </span>
                    <Link
                      href={s.href}
                      className="text-sm font-medium text-(--aw-blue-700) hover:text-(--aw-blue-800) no-underline hover:underline"
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
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">Wizard full-screen, não modal</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
                A criação ocupa a tela inteira (<code>/memory-base/new</code>), no padrão cinematográfico do Agent Studio. Substituiu o modal de criação v0, que foi aposentado.
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">A base nasce antes da classificação</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
                Criar acontece no passo do nome — por isso a celebração "Base criada" vem <b className="font-medium text-(--fg-primary)">antes</b> de Objetivo/Segmento/Envio. Reduz o atrito: o usuário já tem a base, e classifica quando quiser.
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">Classificar é opcional</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
                O X (fechar) está em todas as etapas. Fechar deixa a base salva na lista, sem classificação — as escolhas são patch na base, não pré-requisito da criação.
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">Padrão vs. Catálogo</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
                O único fork de conteúdo: <b className="font-medium text-(--fg-primary)">Padrão</b> (dados produto a produto, individuais) ou <b className="font-medium text-(--fg-primary)">Catálogo</b> (lote via CSV/integração). Define o <code>tipoDados</code> da base; ambos convergem na base pronta.
              </p>
            </div>
          </div>
        </Section>

        <FlowUpdatesHistorySection updates={updates} />
      </div>
    </>
  )
}
