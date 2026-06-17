import {
  AwAuditTypeBadge,
  type AwAuditType,
} from "@/components/ui/AwAuditTypeBadge"
import {
  ApiTable,
  CodeExample,
  PageHero,
  PropRow,
  Section,
  Spec,
  Stage,
} from "../../_primitives"

const ALL_TYPES: AwAuditType[] = [
  "Plano",
  "Cartão",
  "Fatura",
  "Cupom",
  "Voucher",
]

export default function AuditTypeBadgePage() {
  return (
    <>
      <PageHero title="Audit Type Badge">
        Badge pill que rotula o tipo de um evento de auditoria — borda, fundo,
        ícone e label mapeados por <code className="mono">type</code>. Plano,
        cartão e fatura ficam neutros; cupom e voucher ganham cor própria para
        saltarem aos olhos no histórico.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="basic"
            title="Os 5 tipos"
            lead="Cada tipo carrega seu ícone e sua identidade de cor. O componente recebe apenas o type — toda a aparência é interna."
          >
            <Stage label="Plano · Cartão · Fatura · Cupom · Voucher">
              {ALL_TYPES.map((type) => (
                <AwAuditTypeBadge key={type} type={type} />
              ))}
            </Stage>
          </Section>

          <Section
            id="neutral"
            title="Tipos neutros"
            lead="Plano, cartão e fatura compartilham a paleta neutra — não competem por atenção no fluxo de eventos."
          >
            <Stage label="border-subtle · bg-muted · fg-secondary">
              <AwAuditTypeBadge type="Plano" />
              <AwAuditTypeBadge type="Cartão" />
              <AwAuditTypeBadge type="Fatura" />
            </Stage>
          </Section>

          <Section
            id="accent"
            title="Tipos com destaque"
            lead="Cupom (emerald) e voucher (purple) recebem cor própria — são eventos que o usuário quer encontrar rápido."
          >
            <Stage label="emerald · purple">
              <AwAuditTypeBadge type="Cupom" />
              <AwAuditTypeBadge type="Voucher" />
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Componente puro, sem estado próprio. O mapeamento de ícone e cor por tipo é interno."
          >
            <ApiTable>
              <PropRow
                prop="type"
                type='"Plano" | "Cartão" | "Fatura" | "Cupom" | "Voucher"'
                doc="Tipo do evento. Define ícone, borda, fundo e cor do texto. Exportado como AwAuditType."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Mergeado (via cn) nas classes do pill — útil pra spacing ou alinhamento no contexto."
              />
              <PropRow
                prop="...rest"
                type="React.HTMLAttributes<HTMLSpanElement>"
                doc="Repassado ao <span> raiz (title, data-*, aria-*, handlers)."
              />
            </ApiTable>

            <CodeExample label="exemplo" lang="tsx">
              {`import {
  AwAuditTypeBadge,
  type AwAuditType,
} from "@/components/ui/AwAuditTypeBadge"

<AwAuditTypeBadge type="Cupom" />

// type exportado pra reuso
const t: AwAuditType = "Voucher"`}
            </CodeExample>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Pill inline-flex com ícone + label. Cores lidas via CSS variables — nada hardcoded."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Spec
                k="container"
                v="inline-flex · rounded-full · border · px-2.5 py-0.5"
                d="Pill compacto que acompanha o baseline do texto ao redor."
              />
              <Spec
                k="ícone"
                v="<Icon size={13} />"
                d="Glyph do Material Symbols por tipo (workspace_premium, credit_card, …)."
              />
              <Spec
                k="neutro"
                v="--border-subtle · --bg-muted · --fg-secondary"
                d="Plano, cartão e fatura."
              />
              <Spec
                k="destaque"
                v="--aw-emerald-* · --aw-purple-*"
                d="Cupom em emerald, voucher em purple."
              />
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}
