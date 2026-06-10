"use client"

import * as React from "react"
import { AwMentionMenu } from "@/components/ui/AwMentionMenu"
import {
  ApiTable,
  CodeExample,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

/* Amostras estáticas — o estado (activeKey, drill-in) é controlado pelo
 * dono no produto (o editor de checkpoints). Aqui cada estágio congela um
 * momento do menu. */

const NATIVAS = [
  { key: "agent.loadUserData", label: "Identificar Usuário", icon: "person_search" },
  { key: "agent.thinkOutLoud", label: "Pensar em Voz Alta", icon: "graphic_eq" },
  { key: "agent.handoffToHuman", label: "Transferir para Humano", icon: "support_agent" },
  { key: "custom", label: "Personalizado", icon: "auto_awesome", accent: "purple" as const },
]

const INTEGRACOES = [
  { key: "int-google-calendar", label: "Google Calendar", brand: "googlecal", chevron: true },
  { key: "int-hubspot", label: "Hubspot", brand: "hubspot", chevron: true },
  { key: "int-stripe", label: "Stripe", brand: "stripe", chevron: true },
]

function BrowseDemo() {
  const [active, setActive] = React.useState("agent.handoffToHuman")
  return (
    <AwMentionMenu
      aria-label="Demo do menu de menções"
      activeKey={active}
      onHover={setActive}
      onPick={() => {}}
      sections={[
        { entries: NATIVAS },
        { label: "Integrações", entries: INTEGRACOES },
      ]}
      footer={{ key: "new-integration", label: "Nova Integração" }}
    />
  )
}

function DrillInDemo() {
  const [active, setActive] = React.useState("googlecal.createEvent")
  return (
    <AwMentionMenu
      aria-label="Demo do drill-in de integração"
      activeKey={active}
      onHover={setActive}
      onPick={() => {}}
      header={{ label: "Google Calendar", onBack: () => {} }}
      sections={[
        {
          entries: [
            { key: "googlecal.createEvent", label: "Criar evento", brand: "googlecal" },
            { key: "googlecal.checkAvailability", label: "Consultar disponibilidade", brand: "googlecal" },
          ],
        },
      ]}
    />
  )
}

export default function AwMentionMenuPage() {
  return (
    <>
      <PageHero title="Mention menu">
        O menu que abre ao digitar @ no editor de checkpoints: tools nativas no
        topo, integrações com drill-in (logo + chevron) e o atalho de conectar
        uma nova plataforma no rodapé. O item ativo vira uma pill invertida —
        navegável por teclado sem tirar o caret do texto.
      </PageHero>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-16 px-10 pb-14">
        <Section
          id="browse"
          title="Navegação"
          lead="Estado inicial do @: nativas em lista corrida, Integrações em seção própria, ação fixa no rodapé. Setas movem a pill; Enter insere (ou entra na integração)."
        >
          <Stage label="Menu @ · item ativo invertido">
            <BrowseDemo />
          </Stage>
        </Section>

        <Section
          id="drill-in"
          title="Drill-in de integração"
          lead="Enter (ou →) numa integração abre as habilidades dela, com a volta no header (← também volta). Digitar qualquer busca sai do drill-in — a query varre o catálogo inteiro."
        >
          <Stage label="Dentro do Google Calendar">
            <DrillInDemo />
          </Stage>
        </Section>

        <Section
          id="api"
          title="API"
          lead="Componente presentacional: o dono controla activeKey, decide o que cada pick faz e posiciona o card (no editor, ancorado no caret)."
        >
          <ApiTable>
            <PropRow
              prop="sections"
              type="AwMentionMenuSection[]"
              def="—"
              doc="Listas de entries com label de seção opcional (ex.: Integrações)."
            />
            <PropRow
              prop="activeKey"
              type="string"
              def="—"
              doc="Item realçado com a pill invertida (teclado/hover)."
            />
            <PropRow
              prop="onPick"
              type="(key) => void"
              def="—"
              doc="Clique/Enter. O mousedown já previne blur — o caret fica no editor."
            />
            <PropRow
              prop="onHover"
              type="(key) => void"
              def="—"
              doc="Hover em um item — sincronize com o activeKey."
            />
            <PropRow
              prop="header"
              type="{ label, onBack }"
              def="—"
              doc="Header de drill-in com seta de voltar."
            />
            <PropRow
              prop="footer"
              type="{ key, label }"
              def="—"
              doc="Ação fixa no rodapé (ex.: Nova Integração)."
            />
          </ApiTable>

          <CodeExample label="entry de integração" lang="tsx">
            {`<AwMentionMenu
  sections={[
    { entries: nativas },
    { label: "Integrações", entries: [
      { key: "int-googlecal", label: "Google Calendar", brand: "googlecal", chevron: true },
    ]},
  ]}
  footer={{ key: "new-integration", label: "Nova Integração" }}
  activeKey={activeKey}
  onPick={handlePick}
/>`}
          </CodeExample>
        </Section>
      </div>
    </>
  )
}
