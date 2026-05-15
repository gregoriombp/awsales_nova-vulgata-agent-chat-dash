import {
  AW_BRAND_LOGO_REGISTRY,
  AwBrandLogo,
} from "@/components/ui/AwBrandLogo"
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

export default function BrandLogoPage() {
  return (
    <>
      <PageHero title="Brand logo">
        Logo de marca de terceiros (WhatsApp, Stripe, Hotmart…) renderizada
        em SVG inline a partir de um registry interno. Use em listas de
        integrações, source pickers e configurações. Fallback automático
        para monograma quando o brand id não está no registry.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="rounded-[var(--radius-md)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] px-5 py-4 mb-10 text-sm text-[var(--aw-blue-900)]">
          <strong>AwBrandLogo vs AwLogo.</strong> Use{" "}
          <code className="mono">AwBrandLogo</code> aqui para marcas de
          terceiros (canais, checkouts, CRMs). Para a logo do{" "}
          <strong>próprio AwSales</strong>, use{" "}
          <code className="mono">AwLogo</code> — documentado em{" "}
          <a
            href="/bombardier/styleguide/foundation/logos"
            className="underline underline-offset-2 hover:text-[var(--aw-blue-700)]"
          >
            Foundation → Logos
          </a>
          .
        </div>
        <div className="flex flex-col gap-16">
          <Section
            id="sizes"
            title="Tamanhos"
            lead="Três presets canônicos. O tile arredondado e o SVG interno escalam juntos."
          >
            <Stage label="size · sm / md / lg">
              <AwBrandLogo brand="whatsapp" size="sm" />
              <AwBrandLogo brand="whatsapp" size="md" />
              <AwBrandLogo brand="whatsapp" size="lg" />
            </Stage>
          </Section>

          <Section
            id="payment-methods"
            title="Meios de pagamento (BR)"
            lead="Pix, boleto e cartão moram no mesmo registry de brand — vivem ao lado de Stripe/Hotmart numa lista de checkout. Pix usa a cor oficial (#32BCAD); boleto e card são genéricos (não há brand oficial)."
          >
            <Stage label="Payment methods">
              <div className="flex flex-col items-center gap-2 text-[11px] text-[var(--fg-tertiary)]">
                <AwBrandLogo brand="pix" size="md" />
                <span className="mono">pix</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-[11px] text-[var(--fg-tertiary)]">
                <AwBrandLogo brand="boleto" size="md" />
                <span className="mono">boleto</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-[11px] text-[var(--fg-tertiary)]">
                <AwBrandLogo brand="card" size="md" />
                <span className="mono">card</span>
              </div>
            </Stage>
          </Section>

          <Section
            id="bare"
            title="Bare (sem tile)"
            lead="Para usar a logo crua dentro de outro container — chip, dropdown item, header inline."
          >
            <Stage label="bare={true}">
              <AwBrandLogo brand="stripe" bare />
              <AwBrandLogo brand="shopify" bare />
              <AwBrandLogo brand="hubspot" bare />
              <AwBrandLogo brand="instagram" bare />
              <AwBrandLogo brand="pix" bare />
            </Stage>
          </Section>

          <Section
            id="fallback"
            title="Fallback"
            lead="Brand desconhecido cai num monograma com fundo --fg-primary, sem quebrar a UI."
          >
            <Stage label="Brand não registrado">
              <AwBrandLogo brand="acme" />
              <AwBrandLogo brand="custom-erp" />
              <AwBrandLogo brand="x" />
            </Stage>
          </Section>

          <Section
            id="registry"
            title="Registry"
            lead={`${AW_BRAND_LOGO_REGISTRY.length} brands disponíveis. Para adicionar, edite o objeto BRANDS em components/ui/AwBrandLogo.tsx — uma entrada (id → função que retorna o SVG).`}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
              {AW_BRAND_LOGO_REGISTRY.map((id) => (
                <div
                  key={id}
                  className="flex flex-col items-center gap-2 text-[11px] text-[var(--fg-tertiary)]"
                >
                  <AwBrandLogo brand={id} size="md" />
                  <span className="mono">{id}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Tile + SVG. Brand colors (vendor identity) ficam no SVG; só o tile responde aos tokens."
          >
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Spec k="tile sm" v="32 × 32 px" d="Logo: 20px" />
              <Spec k="tile md" v="40 × 40 px" d="Logo: 24px (default)" />
              <Spec k="tile lg" v="56 × 56 px" d="Logo: 32px" />
              <Spec k="radius" v="10px" d="Entre --radius-md e --radius-lg." />
              <Spec k="background" v="--bg-surface" d="Hidra com light/dark." />
              <Spec
                k="border"
                v="1px · --border-subtle"
                d="Hairline padrão; some no fallback monograma."
              />
            </div>
          </Section>

          <Section
            id="api"
            title="API"
            lead={`Import: import { AwBrandLogo, AW_BRAND_LOGO_REGISTRY } from "@/components/ui/AwBrandLogo".`}
          >
            <ApiTable>
              <PropRow
                prop="brand"
                type="string"
                doc="Id do brand no registry. Desconhecido cai no fallback monograma."
              />
              <PropRow
                prop="size"
                type='"sm" | "md" | "lg"'
                def='"md"'
                doc="Tamanho do tile. Tile e SVG escalam juntos."
              />
              <PropRow
                prop="bare"
                type="boolean"
                def="false"
                doc="Renderiza só o SVG, sem tile arredondado."
              />
              <PropRow
                prop="...rest"
                type="HTMLAttributes<HTMLDivElement>"
                doc="Atributos nativos de <div>."
              />
            </ApiTable>
            <CodeExample>{`import { AwBrandLogo } from "@/components/ui/AwBrandLogo"

<AwBrandLogo brand="whatsapp" />
<AwBrandLogo brand="stripe" size="lg" />
<AwBrandLogo brand="hubspot" bare />`}</CodeExample>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Use o tile (default) em listas e cards.</>,
                <>Use bare em chips, dropdown items, breadcrumbs.</>,
                <>Cubra todos os brands referenciados no app no registry.</>,
              ]}
              donts={[
                <>Importar PNGs/JPGs de brand — só SVG inline para escalar.</>,
                <>Recolorir o tile com brand colors — quebra o sistema.</>,
                <>Usar para ícones funcionais (use Icon).</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
