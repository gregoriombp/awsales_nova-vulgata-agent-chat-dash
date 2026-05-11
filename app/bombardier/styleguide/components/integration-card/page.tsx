"use client"

import { AwIntegrationCard } from "@/components/ui/AwIntegrationCard"
import {
  PageHero,
  Section,
  Stage,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
} from "../../_primitives"

export default function IntegrationCardPage() {
  return (
    <>
      <PageHero title="Integration card">
        Card composto para listar integrações de terceiros — combina
        AwCard interativo, AwBrandLogo e AwStatusDot. O visual é
        controlado pelo <code className="mono">state</code> (connected,
        available, attention, disabled).
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="states"
            title="Estados"
            lead="Quatro estados canônicos. O componente decide pill, dot, meta default e CTA a partir deles."
          >
            <Stage
              label="connected / available / attention / disabled"
              gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              <AwIntegrationCard
                brand="whatsapp"
                name="WhatsApp"
                domain="whatsapp.com"
                description="Atenda e recupere vendas via WhatsApp com seus agentes de IA."
                state="connected"
                instances={2}
                onClick={() => {}}
              />
              <AwIntegrationCard
                brand="kiwify"
                name="Kiwify"
                domain="kiwify.com.br"
                description="Sincronize vendas e abandonos do checkout Kiwify."
                state="available"
                onClick={() => {}}
              />
              <AwIntegrationCard
                brand="stripe"
                name="Stripe"
                domain="stripe.com"
                description="Pagamentos globais — cartão, PIX, assinaturas."
                state="attention"
                onClick={() => {}}
              />
              <AwIntegrationCard
                brand="acme"
                name="ACME ERP"
                domain="acme.com"
                description="Em integração privada — disponível em breve."
                state="disabled"
              />
            </Stage>
          </Section>

          <Section
            id="grid"
            title="Em grid"
            lead="O card é desenhado para grids responsivos. Use auto-fill com mínimo 260px para 4–6 colunas em desktop."
          >
            <div
              className="grid gap-3.5"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
            >
              {[
                {
                  brand: "instagram",
                  name: "Instagram",
                  domain: "instagram.com",
                  description: "Responda DMs do Instagram automaticamente com agentes.",
                  state: "connected" as const,
                },
                {
                  brand: "shopify",
                  name: "Shopify",
                  domain: "shopify.com",
                  description: "Gerencie produtos, pedidos e clientes pela IA.",
                  state: "connected" as const,
                },
                {
                  brand: "typeform",
                  name: "Typeform",
                  domain: "typeform.com",
                  description: "Capture leads dos seus formulários conversacionais.",
                  state: "available" as const,
                },
                {
                  brand: "calendly",
                  name: "Calendly",
                  domain: "calendly.com",
                  description: "Agendamentos automáticos sincronizados com agentes.",
                  state: "available" as const,
                },
              ].map((it) => (
                <AwIntegrationCard
                  key={it.brand}
                  {...it}
                  onClick={() => {}}
                />
              ))}
            </div>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Anatomia rígida — alterar slots quebra o reconhecimento."
          >
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Spec k="container" v="AwCard interactive" d="Card padrão; ganha cursor/role=button quando há onClick." />
              <Spec k="header" v="logo + heading" d="Logo (lg) à esquerda; nome + domínio à direita." />
              <Spec k="logo" v="AwBrandLogo size=lg, bare" d="Sem tile/background — usa o asset bruto." />
              <Spec
                k="status dot"
                v="AwStatusDot variant=live, ring, absolute"
                d="Aparece só em connected, ancorado ao logo."
              />
              <Spec k="descrição" v="parágrafo" d="2 linhas no máximo; sem clamp forçado pelo CSS atual." />
            </div>
          </Section>

          <Section
            id="api"
            title="API"
            lead={`Import: import { AwIntegrationCard } from "@/components/ui/AwIntegrationCard".`}
          >
            <ApiTable>
              <PropRow
                prop="brand"
                type="string"
                doc="Id no AwBrandLogo registry."
              />
              <PropRow prop="name" type="string" doc="Nome de exibição (heading do card)." />
              <PropRow prop="domain" type="string" doc="Mostrado abaixo do nome em 11.5px." />
              <PropRow prop="description" type="string" doc="Clamp em 2 linhas." />
              <PropRow
                prop="state"
                type='"connected" | "available" | "attention" | "disabled"'
                doc="Drive de pill, dot, meta default e CTA."
              />
              <PropRow
                prop="instances"
                type="number"
                doc='Reservado — atualmente aceito no tipo mas o componente não renderiza nada baseado nele (dívida).'
              />
              <PropRow
                prop="onClick"
                type="() => void"
                doc='Card vira interativo (cursor + role="button" + Enter/Space).'
              />
            </ApiTable>
            <CodeExample>{`import { AwIntegrationCard } from "@/components/ui/AwIntegrationCard"

<AwIntegrationCard
  brand="whatsapp"
  name="WhatsApp"
  domain="whatsapp.com"
  description="Atenda e recupere vendas via WhatsApp."
  state="connected"
  instances={2}
  onClick={() => openManageModal("whatsapp")}
/>`}</CodeExample>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Use grid auto-fill mínimo 240–260px.</>,
                <>Confie no <code className="mono">state</code> — ele controla dot, ring e interatividade.</>,
                <>onClick abre modal/drawer de detalhe, não navega para outra página.</>,
              ]}
              donts={[
                <>Inserir CTAs múltiplos — o card inteiro é o alvo.</>,
                <>Texto de descrição com mais de 2 frases.</>,
                <>Misturar variantes de pill que não sejam live/beta.</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
