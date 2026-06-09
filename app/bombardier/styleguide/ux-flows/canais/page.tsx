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
 *
 * Centre spine: COL / COL_D (centre x = 380)
 * Left corridor:  vazio → wizard WhatsApp → painel WhatsApp
 * Right corridor: consentimento OAuth → painel do canal (gerenciar)
 *
 * Os dois terminais ficam embaixo, um em cada corredor: o WhatsApp cai
 * direto no painel (wizard de página inteira); Instagram/Messenger usam o
 * modal de consentimento e o painel é alcançado depois pelo "Gerenciar".
 * ──────────────────────────────────────────────────────────────────── */

const COL = 280 // ScreenNode  centre x
const COL_D = 260 // DecisionNode centre x

const LEFT_X = 20 // corredor esquerdo (vazio, wizard, painel WhatsApp) — centre 120
const RIGHT_X = 560 // corredor direito (consentimento OAuth, painel do canal) — centre 660

const Y = {
  entrada: 0,
  estadoDec: 180,
  stateRow: 400, // vazio (esquerda) | populated (centro)
  catalogo: 620,
  canalDec: 820,
  connectRow: 1040, // wizard WhatsApp (esquerda) | consentimento OAuth (direita)
  painelRow: 1240, // painel WhatsApp (esquerda) | painel do canal (direita)
}

/* ─────────────────────────────────────────────────────────────────────
 * Nodes
 * ──────────────────────────────────────────────────────────────────── */

export const NODES: Node[] = [
  // ── Centre spine ──────────────────────────────────────────────────
  {
    id: "entrada",
    type: "screen",
    position: { x: COL, y: Y.entrada },
    data: {
      step: "entrada",
      title: "Abrir Canais",
      href: "/canais",
      note: "Acesso pelo menu lateral. A página renderiza um de três estados conforme o histórico de conexões da conta.",
    },
  },
  {
    id: "estadoDec",
    type: "decision",
    position: { x: COL_D, y: Y.estadoDec },
    data: {
      step: "01",
      title: "Já tem canais conectados?",
      question: "A conta tem algum canal ativo agora?",
    },
  },
  {
    id: "populated",
    type: "screen",
    position: { x: COL, y: Y.stateRow },
    data: {
      step: "02",
      title: "Seus canais",
      href: "/canais",
      note: "Lista os canais conectados agrupados por tipo, cada um com suas contas e status. Busca por canal ou conta no topo; 'Novo canal' no header.",
    },
  },
  {
    id: "catalogo",
    type: "screen",
    position: { x: COL, y: Y.catalogo },
    data: {
      step: "03",
      title: "Catálogo de canais",
      href: "/canais",
      note: "Modal 'Novo canal' com os canais disponíveis (WhatsApp, Instagram, Messenger). Selecionar um inicia a conexão.",
    },
  },
  {
    id: "canalDec",
    type: "decision",
    position: { x: COL_D, y: Y.canalDec },
    data: {
      step: "04",
      title: "Qual canal foi escolhido?",
      question: "O canal usa o wizard próprio do WhatsApp ou o consentimento OAuth padrão?",
    },
  },
  // ── Corredor esquerdo — estado vazio + jornada WhatsApp ────────────
  {
    id: "vazio",
    type: "screen",
    position: { x: LEFT_X, y: Y.stateRow },
    data: {
      step: "02b",
      title: "Sem canais conectados",
      href: "/canais",
      note: "Estado vazio com dois textos: 'Conecte seu primeiro canal' (nunca conectou) ou 'Você não tem canais conectados' (removeu todos). Ambos oferecem 'Novo canal', 'Ver todos os canais' e atalhos dos mais usados.",
    },
  },
  {
    id: "wizardWhats",
    type: "screen",
    position: { x: LEFT_X, y: Y.connectRow },
    data: {
      step: "05a",
      title: "Conectar WhatsApp",
      href: "/setup/whatsapp",
      note: "Wizard de página inteira: pré-requisitos + os 4 passos do login da Meta (Business Manager, WABA, verificar número, autorizar). Abre o OAuth da Meta em nova janela.",
    },
  },
  {
    id: "painelWhats",
    type: "screen",
    position: { x: LEFT_X, y: Y.painelRow },
    data: {
      step: "→ painel",
      title: "Painel do WhatsApp",
      href: "/canais/whatsapp",
      note: "Cai direto no painel após conectar, com toast de sucesso e atalho 'Criar template' pra começar a conversar.",
    },
  },
  // ── Corredor direito — consentimento OAuth + gerenciar canal ───────
  {
    id: "consentOAuth",
    type: "screen",
    position: { x: RIGHT_X, y: Y.connectRow },
    data: {
      step: "05b",
      title: "Permitir acesso (OAuth)",
      href: "/canais",
      note: "Modal de consentimento pra Instagram e Messenger: mostra as permissões pedidas e a URL de redirecionamento. 'Permitir acesso' conecta a conta.",
    },
  },
  {
    id: "painelCanal",
    type: "screen",
    position: { x: RIGHT_X, y: Y.painelRow },
    data: {
      step: "→ painel",
      title: "Painel do canal",
      href: "/canais/instagram",
      note: "Painel de configuração da conta (Instagram/Messenger): gerenciar contas conectadas, status e ajustes. Alcançado pelo 'Gerenciar' na lista.",
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
  // ── Entrada → decisão de estado ────────────────────────────────────
  { ...edgeBase, id: "e-entrada-estado", source: "entrada", target: "estadoDec", label: "Abrir Canais", ...labelProps },

  // ── Estado da conta: tem canais vs vazio ───────────────────────────
  { ...branchEdge, id: "e-estado-vazio", source: "estadoDec", target: "vazio", sourceHandle: "left", label: "Nenhum canal", ...labelProps },
  { ...branchEdge, id: "e-estado-populated", source: "estadoDec", target: "populated", sourceHandle: "bottom", label: "Tem canais", ...labelProps },

  // ── Iniciar conexão: catálogo (convergência) ou atalho dos mais usados ──
  { ...edgeBase, id: "e-vazio-catalogo", source: "vazio", target: "catalogo", label: "Ver todos os canais", ...labelProps },
  { ...edgeBase, id: "e-populated-catalogo", source: "populated", target: "catalogo", label: "Novo canal", ...labelProps },
  { ...branchEdge, id: "e-vazio-canaldec", source: "vazio", target: "canalDec", label: "Atalho · mais usados", ...labelProps },

  // ── Gerenciar um canal já conectado (sai da lista pro painel) ───────
  { ...branchEdge, id: "e-populated-painel", source: "populated", target: "painelCanal", label: "Gerenciar conta", ...labelProps },

  // ── Catálogo → decisão de canal ────────────────────────────────────
  { ...edgeBase, id: "e-catalogo-canaldec", source: "catalogo", target: "canalDec", label: "Escolher canal", ...labelProps },

  // ── Bifurcação por canal: WhatsApp tem wizard próprio; resto usa OAuth ──
  { ...branchEdge, id: "e-canaldec-whats", source: "canalDec", target: "wizardWhats", sourceHandle: "left", label: "WhatsApp", ...labelProps },
  { ...branchEdge, id: "e-canaldec-oauth", source: "canalDec", target: "consentOAuth", sourceHandle: "right", label: "Instagram / Messenger", ...labelProps },

  // ── Terminais ──────────────────────────────────────────────────────
  { ...edgeBase, id: "e-whats-painel", source: "wizardWhats", target: "painelWhats", label: "Conectar com a Meta", ...labelProps },
  { ...edgeBase, id: "e-oauth-painel", source: "consentOAuth", target: "painelCanal", label: "Permitir acesso", ...labelProps },
]

/* ─────────────────────────────────────────────────────────────────────
 * Screen docs
 * ──────────────────────────────────────────────────────────────────── */

const screens = [
  {
    step: "entrada",
    title: "Abrir Canais",
    href: "/canais",
    purpose: "Página acessada pelo menu lateral. Reúne os canais por onde os agentes conversam com clientes (WhatsApp, Instagram, Messenger). Renderiza um de três estados conforme o histórico de conexões.",
    decisions: "Tem canais → 'Seus canais'. Nenhum canal → estado vazio.",
  },
  {
    step: "01",
    title: "Já tem canais conectados?",
    href: "/canais",
    purpose: "Decisão transparente baseada no histórico da conta. Define qual versão da página aparece. Não é uma tela.",
    decisions: "Com canais ativos → lista 'Seus canais'. Sem nenhum → estado vazio (primeira vez ou removeu todos).",
  },
  {
    step: "02",
    title: "Seus canais",
    href: "/canais",
    purpose: "Lista os canais conectados agrupados por tipo. Cada grupo mostra suas contas com avatar, nome e status (Ativo, Pausado, Requer atenção) e um contador de alertas. Busca por canal ou conta no topo; 'Novo canal' no header.",
    decisions: "Novo canal → catálogo. Gerenciar / clicar numa conta → painel do canal. Buscar → filtra a lista (estado vazio inline se nada casar).",
  },
  {
    step: "02b",
    title: "Sem canais conectados",
    href: "/canais",
    purpose: "Estado vazio com dois textos conforme o histórico: 'Conecte seu primeiro canal' (nunca conectou nada) ou 'Você não tem canais conectados' (já teve e removeu todos). O fluxo de conexão é idêntico nos dois.",
    decisions: "Novo canal / Ver todos os canais → catálogo. Atalho dos mais usados → conexão direta do canal escolhido.",
  },
  {
    step: "03",
    title: "Catálogo de canais",
    href: "/canais",
    purpose: "Modal 'Novo canal' com os canais disponíveis, cada um com nome e descrição curta. Mesmo ponto de partida pra estado vazio e lista populada.",
    decisions: "Selecionar um canal → inicia a conexão (wizard do WhatsApp ou consentimento OAuth).",
  },
  {
    step: "04",
    title: "Qual canal foi escolhido?",
    href: "/canais",
    purpose: "O WhatsApp tem um wizard próprio (WABA da Meta, multi-etapas); Instagram e Messenger usam o consentimento OAuth padrão num modal. A página direciona conforme o canal.",
    decisions: "WhatsApp → wizard de setup. Instagram / Messenger → modal de consentimento OAuth.",
  },
  {
    step: "05a",
    title: "Conectar WhatsApp",
    href: "/setup/whatsapp",
    purpose: "Wizard de página inteira pra conta oficial da Meta. Explica os 4 passos do login da Meta (entrar no Business Manager, selecionar/criar a WABA, verificar o número, autorizar a Aswork) e lista os pré-requisitos num bloco recolhível. Abre o OAuth oficial da Meta em nova janela.",
    decisions: "Conectar com a Meta → painel do WhatsApp com toast de sucesso. Sair do setup → volta pra Canais.",
  },
  {
    step: "05b",
    title: "Permitir acesso (OAuth)",
    href: "/canais",
    purpose: "Modal de consentimento pra Instagram e Messenger. Mostra a marca da organização, a do canal, as permissões solicitadas e a URL de redirecionamento. Padrão OAuth 2.0, sem digitar credencial na plataforma.",
    decisions: "Permitir acesso → conta conectada, aparece em 'Seus canais'; o painel é alcançado pelo 'Gerenciar'.",
  },
  {
    step: "→ painel",
    title: "Painel do WhatsApp",
    href: "/canais/whatsapp",
    purpose: "Terminal da jornada do WhatsApp. O wizard leva direto pro painel do canal, com um toast de sucesso e atalho 'Criar template' pra começar a conversar.",
    decisions: "Gerenciar contas, criar templates e ajustar o canal a partir daqui.",
  },
  {
    step: "→ painel",
    title: "Painel do canal",
    href: "/canais/instagram",
    purpose: "Painel de configuração de Instagram/Messenger: gerencia as contas conectadas, status e ajustes. Alcançado pelo 'Gerenciar' na lista, depois que o canal já foi conectado pelo OAuth.",
    decisions: "Adicionar conta, salvar ajustes ou voltar pra Canais.",
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Updates log — structural changes only. Add new entries at the top.
 * Managed by the `bombardier-update-ux-flow` skill.
 * ──────────────────────────────────────────────────────────────────── */

const updates: FlowUpdate[] = [
  {
    date: "2026-06-09",
    summary: "Flow mapeado no styleguide.",
    tags: ["new-page"],
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────── */

export default function CanaisFlowPage() {
  return (
    <>
      <PageHero title="Canais" trailing={<FlowUpdatesBadge updates={updates} />}>
        Fluxo de conexão e gestão dos canais de atendimento — WhatsApp, Instagram e
        Messenger. Cobre os três estados da página (lista populada, primeira vez e canais
        removidos), o catálogo de novos canais, a bifurcação entre o wizard próprio do
        WhatsApp e o consentimento OAuth dos demais, e o painel de gestão de cada canal.
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-10 pb-14 flex flex-col gap-16">
        {/* Orientação */}
        <p className="text-sm text-(--fg-secondary) leading-relaxed max-w-2xl -mt-8">
          A página abre em um de três estados conforme o histórico da conta. Sem canais,
          o usuário começa pelo estado vazio; com canais, vê a lista 'Seus canais'. Conectar
          um novo canal passa pelo catálogo (ou por um atalho dos mais usados) e bifurca por
          canal: o WhatsApp tem um wizard de página inteira que cai direto no painel, enquanto
          Instagram e Messenger usam um modal de consentimento OAuth. Gerenciar um canal já
          conectado leva ao painel daquele canal.
        </p>

        <Section
          id="flow"
          title="Fluxograma"
          lead="Clique em qualquer tela pra abrir o protótipo num painel lateral. Caixas tracejadas em âmbar são decisões — pontos em que o caminho se divide. Setas âmbar indicam as bifurcações. Na barra embaixo do diagrama dá pra comentar (vai pro review com chip UX Flow), sugerir uma edição ou ver em tela cheia."
        >
          <FlowDiagram flow="canais" nodes={NODES} edges={EDGES} height={1500} />
        </Section>

        <Section id="screens" title="Cada tela" lead="Propósito, decisões e link direto pro protótipo de cada uma.">
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
                    <Link href={s.href} className="text-sm font-medium text-(--aw-blue-700) hover:text-(--aw-blue-800) no-underline hover:underline">
                      Abrir protótipo →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section id="design-notes" title="Decisões de design" lead="Por que o fluxo está estruturado desse jeito.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">Três estados, um único caminho de conexão</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
                A página distingue 'primeira vez' de 'removeu todos' só na cópia do estado vazio — o
                fluxo de conectar é idêntico. Por isso os dois viram um nó só no diagrama, com a
                diferença de texto registrada na nota. O estado populado é o hub: dele saem tanto o
                'Novo canal' quanto o 'Gerenciar'.
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">WhatsApp tem wizard próprio</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
                Conectar uma WABA da Meta exige pré-requisitos e múltiplas etapas, então o WhatsApp
                usa um setup de página inteira em vez do modal de consentimento. Ele cai direto no
                painel ao final, com um atalho pra criar o primeiro template. Instagram e Messenger,
                que são OAuth direto, ficam num modal rápido.
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">Atalho dos mais usados</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
                No estado vazio, além do catálogo completo, os canais mais comuns aparecem como
                atalhos diretos. Quem já sabe o que quer pula a etapa de escolher no catálogo e cai
                direto na conexão do canal.
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">Conectar e gerenciar são momentos distintos</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
                Após o consentimento OAuth, o canal aparece em 'Seus canais' — o painel de
                configuração é um passo separado, alcançado pelo 'Gerenciar'. O WhatsApp é a exceção:
                por ter um wizard dedicado, ele já entrega o usuário no painel.
              </p>
            </div>
          </div>
        </Section>

        <FlowUpdatesHistorySection updates={updates} />
      </div>
    </>
  )
}
