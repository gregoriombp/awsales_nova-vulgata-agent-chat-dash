"use client"

import { useState } from "react"
import { AwAddIntegrationModal } from "@/components/ui/AwAddIntegrationModal"
import { AwButton } from "@/components/ui/AwButton"
import {
  PageHero,
  Section,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
} from "../../_primitives"

const CATEGORIES = [
  { id: "channels", label: "Canais" },
  { id: "checkouts", label: "Checkouts" },
  { id: "members", label: "Área de membros" },
  { id: "forms", label: "Formulários" },
  { id: "meetings", label: "Reuniões" },
  { id: "crms", label: "CRMs" },
  { id: "marketplaces", label: "Marketplaces" },
]

const ITEMS = [
  {
    id: "whatsapp",
    brand: "whatsapp",
    name: "WhatsApp",
    description: "Atenda e recupere vendas via WhatsApp com seus agentes de IA.",
    category: "channels",
  },
  {
    id: "instagram",
    brand: "instagram",
    name: "Instagram",
    description: "Responda DMs do Instagram automaticamente com agentes.",
    category: "channels",
  },
  {
    id: "messenger",
    brand: "messenger",
    name: "Messenger",
    description: "Atendimento automatizado pelo Messenger do Facebook.",
    category: "channels",
  },
  {
    id: "hotmart",
    brand: "hotmart",
    name: "Hotmart",
    description: "Capture transações e eventos do checkout Hotmart.",
    category: "checkouts",
  },
  {
    id: "stripe",
    brand: "stripe",
    name: "Stripe",
    description: "Pagamentos globais — cartão, PIX, assinaturas.",
    category: "checkouts",
  },
  {
    id: "kiwify",
    brand: "kiwify",
    name: "Kiwify",
    description: "Sincronize vendas e abandonos do checkout Kiwify.",
    category: "checkouts",
  },
  {
    id: "calendly",
    brand: "calendly",
    name: "Calendly",
    description: "Agendamentos automáticos sincronizados com agentes.",
    category: "meetings",
  },
  {
    id: "googlecal",
    brand: "googlecal",
    name: "Google Calendar",
    description: "Reuniões e disponibilidade direto do Google Agenda.",
    category: "meetings",
  },
  {
    id: "hubspot",
    brand: "hubspot",
    name: "HubSpot",
    description: "Conecte contatos, empresas e pipelines do HubSpot.",
    category: "crms",
  },
  {
    id: "shopify",
    brand: "shopify",
    name: "Shopify",
    description: "Gerencie produtos, pedidos e clientes pela IA.",
    category: "marketplaces",
  },
  {
    id: "typeform",
    brand: "typeform",
    name: "Typeform",
    description: "Capture leads dos seus formulários conversacionais.",
    category: "forms",
  },
]

export default function IntegrationCatalogPage() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <PageHero title="Integration catalog">
        Modal largo para escolher uma integração do catálogo. Rail de
        categorias à esquerda, busca + grid de cards à direita. Reusa o
        scrim do AwModal e mantém Esc/clique-fora como fechamento padrão.
        Largura máxima 1080 px — maior que isso vira página.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="demo"
            title="Demo"
            lead="Clique para abrir. Filtro por categoria e busca textual; clique em qualquer card para o callback onSelect."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8 flex justify-center">
              <AwButton
                variant="primary"
                iconLeft="add"
                onClick={() => setOpen(true)}
              >
                Nova integração
              </AwButton>
              <AwAddIntegrationModal
                open={open}
                onClose={() => setOpen(false)}
                categories={CATEGORIES}
                items={ITEMS}
                onSelect={() => setOpen(false)}
                onCustomIntegration={() => setOpen(false)}
              />
            </div>
          </Section>

          <Section
            id="when-to-use"
            title="Quando usar"
            lead="Catálogo de seleção rápida — três pré-condições antes de optar por essa estrutura."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
                <h5 className="m-0 mb-1">10+ opções</h5>
                <p className="body-sm m-0">
                  Menos do que isso, um menu ou um grid simples na própria
                  página resolve.
                </p>
              </div>
              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
                <h5 className="m-0 mb-1">Categorizável</h5>
                <p className="body-sm m-0">
                  Itens agrupáveis em 4–10 categorias. Sem agrupamento, vire
                  apenas grid + busca.
                </p>
              </div>
              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
                <h5 className="m-0 mb-1">Seleção, não config</h5>
                <p className="body-sm m-0">
                  O modal escolhe — a configuração acontece no próximo passo
                  (outro modal, drawer ou página).
                </p>
              </div>
            </div>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Header bandeado, body em duas colunas. Footer só aparece se você precisar — o default é fechar pelo X ou Esc."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Spec
                k="max width"
                v="1080 px"
                d="Acima disso vira página dedicada."
              />
              <Spec
                k="altura"
                v="min(720px, 100vh - 64px)"
                d="Trava no viewport — grid sempre rola dentro do main."
              />
              <Spec k="rail esquerdo" v="240 px" d="Encolhe para 200 px abaixo de 900 px." />
              <Spec
                k="grid"
                v="3 colunas → 2 colunas"
                d="Breakpoint em 900 px — sempre quebra junto com o rail."
              />
              <Spec
                k="cards"
                v="logo md 40 px · nome 14/600 · descrição 12.5/400 (2 linhas)"
                d="Sem domain, sem pill — pertence ao catálogo, não ao painel."
              />
            </div>
          </Section>

          <Section
            id="api"
            title="API"
            lead={`Import: import { AwAddIntegrationModal } from "@/components/ui/AwAddIntegrationModal".`}
          >
            <ApiTable>
              <PropRow
                prop="open"
                type="boolean"
                doc="Controle externo — modal renderiza apenas quando true."
              />
              <PropRow
                prop="onClose"
                type="() => void"
                doc="Invocado em Esc, clique no scrim e no botão fechar."
              />
              <PropRow
                prop="categories"
                type="{ id, label }[]"
                doc='Rail esquerdo. A entrada "Todas" é prependada automaticamente.'
              />
              <PropRow
                prop="items"
                type="{ id, brand, name, description, category }[]"
                doc="Catálogo. Filtrado contra categoria ativa + busca textual."
              />
              <PropRow
                prop="onSelect"
                type="(id: string) => void"
                doc="Click em qualquer card. Geralmente fecha o modal e abre fluxo de conexão."
              />
              <PropRow
                prop="title"
                type="string"
                def='"Adicionar integração"'
                doc="Heading do modal."
              />
              <PropRow
                prop="allCategoryId"
                type="string"
                def='"all"'
                doc="Sentinela para “mostrar tudo”. Use se algum id de categoria conflitar."
              />
              <PropRow
                prop="onCustomIntegration"
                type="() => void"
                doc="Quando definido, fixa um card pontilhado “Integração personalizada” no início do grid. Aparece só quando a busca está vazia."
              />
              <PropRow
                prop="customIntegrationLabel"
                type="string"
                def={`"Integração personalizada"`}
                doc="Sobrescreve o título do card custom."
              />
              <PropRow
                prop="customIntegrationDescription"
                type="string"
                doc="Sobrescreve o subtítulo do card custom."
              />
            </ApiTable>

            <CodeExample>{`"use client"
import { useState } from "react"
import { AwAddIntegrationModal } from "@/components/ui/AwAddIntegrationModal"
import { AwButton } from "@/components/ui/AwButton"

const [open, setOpen] = useState(false)

<AwButton variant="primary" iconLeft="add" onClick={() => setOpen(true)}>
  Nova integração
</AwButton>

<AwAddIntegrationModal
  open={open}
  onClose={() => setOpen(false)}
  categories={CATEGORIES}
  items={ITEMS}
  onSelect={(id) => {
    setOpen(false)
    openConnectFlow(id)
  }}
/>`}</CodeExample>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Onclick do card encadeia o próximo passo (consent OAuth, formulário de API key).</>,
                <>Mantenha descrições com no máximo 2 linhas — clamp já está aplicado.</>,
              ]}
              donts={[
                <>Botão de "salvar" no footer — o modal é seleção, não formulário.</>,
                <>Catálogos com menos de 10 itens — o overhead de UI não compensa.</>,
                <>Mostrar instâncias/contadores nos cards — pertence à página, não ao catálogo.</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
