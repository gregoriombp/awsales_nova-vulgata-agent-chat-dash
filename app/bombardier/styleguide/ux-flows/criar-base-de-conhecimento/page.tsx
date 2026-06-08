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

const COL = 280
const COL_D = 260

// 2-branch (novo · existente) simétrico em torno de 380
const LEFT_X = 80
const RIGHT_X = 480

const Y = {
  entrada: 0,
  nome: 160,
  objetivo: 320,
  segmento: 480,
  envio: 640,
  decProduto: 800,
  produtoRow: 1000,
  decCatalogo: 1180,
  catalogoRow: 1380,
  decPlaybook: 1560,
  playbookRow: 1760,
  baseCriada: 1940,
}

/* ─────────────────────────────────────────────────────────────────────
 * Nodes
 * ──────────────────────────────────────────────────────────────────── */

export const NODES: Node[] = [
  {
    id: "entrada",
    type: "screen",
    position: { x: COL, y: Y.entrada },
    data: { step: "entrada", title: "Memory Base (lista)", href: "/memory-base", note: 'Clica em "Criar base" pra começar o wizard.' },
  },
  {
    id: "nome",
    type: "screen",
    position: { x: COL, y: Y.nome },
    data: { step: "01", title: "Nome", href: "#", note: "Nome da base de conhecimento." },
  },
  {
    id: "objetivo",
    type: "screen",
    position: { x: COL, y: Y.objetivo },
    data: { step: "02", title: "Objetivo", href: "#", note: "Pra que serve a base (Vendas, Suporte…)." },
  },
  {
    id: "segmento",
    type: "screen",
    position: { x: COL, y: Y.segmento },
    data: { step: "03", title: "Tipo de segmento", href: "#", note: "Segmento de negócio da base." },
  },
  {
    id: "envio",
    type: "screen",
    position: { x: COL, y: Y.envio },
    data: { step: "04", title: "Tipo de envio de dados", href: "#", note: "Como os dados entram na base." },
  },
  {
    id: "decProduto",
    type: "decision",
    position: { x: COL_D, y: Y.decProduto },
    data: { step: "05", title: "Produto", question: "Cadastrar um produto novo ou usar um existente?" },
  },
  {
    id: "novoProduto",
    type: "screen",
    position: { x: LEFT_X, y: Y.produtoRow },
    data: { step: "05a", title: "Novo produto", href: "#", note: "Cadastra o produto do zero." },
  },
  {
    id: "produtoExistente",
    type: "screen",
    position: { x: RIGHT_X, y: Y.produtoRow },
    data: { step: "05b", title: "Produto existente", href: "#", note: "Seleciona um produto já cadastrado." },
  },
  {
    id: "decCatalogo",
    type: "decision",
    position: { x: COL_D, y: Y.decCatalogo },
    data: { step: "05c", title: "Catálogo", question: "Subir uma base de produtos (XLS) nova ou usar um catálogo existente?" },
  },
  {
    id: "novoCatalogo",
    type: "screen",
    position: { x: LEFT_X, y: Y.catalogoRow },
    data: { step: "05d", title: "Novo catálogo (XLS)", href: "#", note: "Upload da planilha de produtos (.xlsx/.csv)." },
  },
  {
    id: "catalogoExistente",
    type: "screen",
    position: { x: RIGHT_X, y: Y.catalogoRow },
    data: { step: "05e", title: "Catálogo existente", href: "#", note: "Reusa um catálogo já importado." },
  },
  {
    id: "decPlaybook",
    type: "decision",
    position: { x: COL_D, y: Y.decPlaybook },
    data: { step: "06", title: "Playbook", question: "Criar um playbook novo ou usar um existente?" },
  },
  {
    id: "novoPlaybook",
    type: "screen",
    position: { x: LEFT_X, y: Y.playbookRow },
    data: { step: "06a", title: "Novo playbook", href: "#", note: "Cria o playbook do zero." },
  },
  {
    id: "playbookExistente",
    type: "screen",
    position: { x: RIGHT_X, y: Y.playbookRow },
    data: { step: "06b", title: "Playbook existente", href: "#", note: "Reusa um playbook já criado." },
  },
  {
    id: "baseCriada",
    type: "screen",
    position: { x: COL, y: Y.baseCriada },
    data: { step: "→ base", title: "Base criada", href: "/memory-base", note: "Vai pra /memory-base/[id] — base nova com tour + Adicione Fontes." },
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
  { ...edgeBase, id: "e-entrada-nome", source: "entrada", target: "nome", label: "Criar base", ...labelProps },
  { ...edgeBase, id: "e-nome-objetivo", source: "nome", target: "objetivo" },
  { ...edgeBase, id: "e-objetivo-segmento", source: "objetivo", target: "segmento" },
  { ...edgeBase, id: "e-segmento-envio", source: "segmento", target: "envio" },
  { ...edgeBase, id: "e-envio-decProduto", source: "envio", target: "decProduto" },

  { ...branchEdge, id: "e-decProduto-novo", source: "decProduto", target: "novoProduto", sourceHandle: "left", label: "Novo", ...labelProps },
  { ...branchEdge, id: "e-decProduto-existente", source: "decProduto", target: "produtoExistente", sourceHandle: "right", label: "Existente", ...labelProps },
  { ...edgeBase, id: "e-novoProduto-decCatalogo", source: "novoProduto", target: "decCatalogo" },
  { ...edgeBase, id: "e-produtoExistente-decCatalogo", source: "produtoExistente", target: "decCatalogo" },

  { ...branchEdge, id: "e-decCatalogo-novo", source: "decCatalogo", target: "novoCatalogo", sourceHandle: "left", label: "Novo · XLS", ...labelProps },
  { ...branchEdge, id: "e-decCatalogo-existente", source: "decCatalogo", target: "catalogoExistente", sourceHandle: "right", label: "Existente", ...labelProps },
  { ...edgeBase, id: "e-novoCatalogo-decPlaybook", source: "novoCatalogo", target: "decPlaybook" },
  { ...edgeBase, id: "e-catalogoExistente-decPlaybook", source: "catalogoExistente", target: "decPlaybook" },

  { ...branchEdge, id: "e-decPlaybook-novo", source: "decPlaybook", target: "novoPlaybook", sourceHandle: "left", label: "Novo", ...labelProps },
  { ...branchEdge, id: "e-decPlaybook-existente", source: "decPlaybook", target: "playbookExistente", sourceHandle: "right", label: "Existente", ...labelProps },
  { ...edgeBase, id: "e-novoPlaybook-baseCriada", source: "novoPlaybook", target: "baseCriada" },
  { ...edgeBase, id: "e-playbookExistente-baseCriada", source: "playbookExistente", target: "baseCriada" },
]

/* ─────────────────────────────────────────────────────────────────────
 * Screen docs
 * ──────────────────────────────────────────────────────────────────── */

const screens = [
  {
    step: "01",
    title: "Nome",
    href: "#",
    purpose: "Primeira etapa do wizard de criação. O usuário dá um nome à base de conhecimento. Foco único — só o nome.",
    decisions: "Avançar → Objetivo.",
  },
  {
    step: "02",
    title: "Objetivo",
    href: "#",
    purpose: "Pra que a base serve (Vendas, Suporte, RH…). Classifica a base pra organização e filtro na lista.",
    decisions: "Avançar → Tipo de segmento.",
  },
  {
    step: "03",
    title: "Tipo de segmento",
    href: "#",
    purpose: "Segmento de negócio da base (Produto físico, SaaS, Serviços…).",
    decisions: "Avançar → Tipo de envio de dados.",
  },
  {
    step: "04",
    title: "Tipo de envio de dados",
    href: "#",
    purpose: "Define como os dados entram na base (catálogo, documentação, scripts…).",
    decisions: "Avançar → Produto (etapa 5).",
  },
  {
    step: "05",
    title: "Produto",
    href: "#",
    purpose: "Vincula um produto à base. Ramo novo/existente: cadastra do zero ou reusa um já cadastrado.",
    decisions: "Novo produto / Produto existente → Catálogo.",
  },
  {
    step: "05c",
    title: "Catálogo (base de produtos XLS)",
    href: "#",
    purpose: "Sobe a base de produtos. Novo catálogo = upload da planilha (.xlsx/.csv) que vira o catálogo da base — é a tela de upload de produtos que faltava no produto hoje.",
    decisions: "Novo catálogo (XLS) / Catálogo existente → Playbook.",
  },
  {
    step: "06",
    title: "Playbook",
    href: "#",
    purpose: "Vincula um playbook à base. Ramo novo/existente: cria do zero ou reusa um já criado.",
    decisions: "Novo playbook / Playbook existente → base criada.",
  },
  {
    step: "→ base",
    title: "Base criada",
    href: "/memory-base",
    purpose: "Fim do wizard: a base nasce e o usuário cai em /memory-base/[id] — com tour de onboarding e o painel Adicione Fontes pra continuar enriquecendo.",
    decisions: "Continua dentro da base (Adicione Fontes).",
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Updates log — structural changes only. Add new entries at the top.
 * Managed by the `bombardier-update-ux-flow` skill.
 * ──────────────────────────────────────────────────────────────────── */

const updates: FlowUpdate[] = [
  {
    date: "2026-06-07",
    summary:
      "Flow mapeado no styleguide a partir do Figma (Flow library AW) — 6 etapas (Nome · Objetivo · Tipo de segmento · Tipo de envio · Produto · Catálogo/XLS · Playbook) com ramos novo/existente. Status: a desenvolver (hoje só existe um modal v0).",
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
        Wizard de criação de uma base de conhecimento dentro da Memory Base.
        Mapeado a partir do Figma — <b className="font-medium text-(--fg-primary)">a desenvolver</b>:
        hoje o produto só tem um modal v0 de criação. O alvo é um wizard
        full-screen (rota <code>/memory-base/new</code>), não modal.
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <p className="text-sm text-(--fg-secondary) leading-relaxed max-w-2xl -mt-8">
          São 6 etapas sequenciais no Figma: as quatro primeiras classificam a base
          (Nome, Objetivo, Tipo de segmento, Tipo de envio de dados) e as duas
          últimas vinculam as fontes-âncora (Produto, Catálogo/XLS e Playbook),
          cada uma com um ramo <b className="font-medium text-(--fg-primary)">novo vs. existente</b>.
          O fluxo converge na base recém-criada. Veja em "Decisões de design" a
          proposta de enxugar isso pra 3 telas.
        </p>

        <Section
          id="flow"
          title="Fluxograma"
          lead="Clique em qualquer tela pra abrir o protótipo num painel lateral (as telas do wizard ainda não têm protótipo — abrem um placeholder). Caixas tracejadas em âmbar são decisões — onde o usuário escolhe entre novo e existente. Setas âmbar são os ramos. Na barra embaixo dá pra comentar (vai pro review com chip UX Flow), sugerir edição ou ver em tela cheia."
        >
          <FlowDiagram flow="criar-base-de-conhecimento" nodes={NODES} edges={EDGES} height={2200} />
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
          lead="Como simplificar o fluxo do Figma sem perder o essencial."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">Wizard full-screen, não modal</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
                A criação ocupa a tela inteira (rota <code>/memory-base/new</code>), no padrão do Agent Studio — etapas com progresso. O wizard (enxuto: 3 telas + loading) substitui o modal de criação v0, que foi aposentado.
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">Alvo: 6 telas → 3</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
                Enxugar pra <b className="font-medium text-(--fg-primary)">(1) Identidade &amp; objetivo</b> (funde Nome + Objetivo + Tipo de segmento + Tipo de envio), <b className="font-medium text-(--fg-primary)">(2) Fontes-âncora</b> (produto + catálogo/XLS + playbook numa tela só) e <b className="font-medium text-(--fg-primary)">(3) Revisão &amp; criar</b>.
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">Novo/existente vira toggle</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
                Os ramos "novo vs. existente" de produto, catálogo e playbook não precisam de tela própria cada — viram um toggle (segmented) dentro do bloco correspondente na tela de Fontes-âncora.
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">A base de produtos (XLS) é o catálogo</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
                A tela de upload de uma planilha de produtos que faltava no produto é o ramo <b className="font-medium text-(--fg-primary)">Novo catálogo</b> da etapa 5 — sobe um <code>.xlsx/.csv</code> que vira o catálogo da base. Fontes extras (URL, snippet, integrações) ficam fora do wizard, dentro da base.
              </p>
            </div>
          </div>
        </Section>

        <FlowUpdatesHistorySection updates={updates} />
      </div>
    </>
  )
}
