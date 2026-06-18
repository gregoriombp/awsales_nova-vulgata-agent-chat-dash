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
        <div className="rounded-md border border-(--aw-blue-200) bg-(--aw-blue-100) px-5 py-4 mb-10 text-sm text-(--aw-blue-900)">
          <strong>AwBrandLogo vs AwLogo.</strong> Use{" "}
          <code className="mono">AwBrandLogo</code> aqui para marcas de
          terceiros (canais, checkouts, CRMs). Para a logo do{" "}
          <strong>próprio Aswork</strong>, use{" "}
          <code className="mono">AwLogo</code> — documentado em{" "}
          <a
            href="/bombardier/styleguide/foundation/logos"
            className="underline underline-offset-2 hover:text-(--aw-blue-700)"
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
            id="apps-integracoes"
            title="Apps & integrações"
            lead="Marcas de apps de terceiros usam os logos oficiais da coleção Iconify (logos para coloridas, simple-icons em branco sobre o tile da marca quando só há monocromático), curados um a um em /public/assets/integrations/iconify — nunca a biblioteca inteira, nunca dependência em runtime. Catálogo por categoria abaixo; passo-a-passo de como adicionar na seção Registry."
          >
            <div className="flex flex-col gap-6">
              {[
                { label: "Plataforma & login", ids: ["google", "microsoft", "apple", "okta", "chrome", "safari"] },
                { label: "2FA / autenticadores", ids: ["google-authenticator", "authy", "1password", "bitwarden"] },
                { label: "IA", ids: ["chatgpt", "claude", "gemini", "deepseek", "mistral", "perplexity", "huggingface"] },
                { label: "Canais & reuniões", ids: ["whatsapp", "instagram", "messenger", "telegram", "discord", "slack", "teams", "googlemeet", "zoom"] },
                { label: "E-mail, storage & produtividade", ids: ["gmail", "outlook", "googledrive", "onedrive", "dropbox", "notion", "airtable", "trello", "linear", "asana", "jira", "monday"] },
                { label: "CRM, suporte & automação", ids: ["pipedrive", "hubspot", "rdstation", "kommo", "salesforce", "zendesk", "intercom", "zapier", "twilio"] },
                { label: "Social & ads", ids: ["facebook", "linkedin", "youtube", "tiktok", "x", "meta", "googleads", "googleanalytics"] },
                { label: "Dev & fontes", ids: ["github", "bitbucket"] },
                { label: "Pagamentos", ids: ["stripe", "paypal", "mercadopago", "pagseguro", "picpay", "nubank", "pix"] },
              ].map((cat) => (
                <div key={cat.label}>
                  <div className="aw-eyebrow mb-2">{cat.label}</div>
                  <div className="flex flex-wrap gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
                    {cat.ids.map((id) => (
                      <div
                        key={id}
                        className="flex w-20 flex-col items-center gap-1.5 text-3xs text-(--fg-tertiary)"
                      >
                        <AwBrandLogo brand={id} size="md" />
                        <span className="mono max-w-full truncate">{id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section
            id="payment-methods"
            title="Meios de pagamento (BR)"
            lead="Pix, boleto e cartão moram no mesmo registry de brand — vivem ao lado de Stripe/Hotmart numa lista de checkout. Pix usa a cor oficial (#32BCAD); boleto e card são genéricos (não há brand oficial)."
          >
            <Stage label="Payment methods">
              <div className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)">
                <AwBrandLogo brand="pix" size="md" />
                <span className="mono">pix</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)">
                <AwBrandLogo brand="boleto" size="md" />
                <span className="mono">boleto</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)">
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
            lead={`${AW_BRAND_LOGO_REGISTRY.length} brands disponíveis. Para adicionar uma marca de app/integração: curar o SVG oficial do Iconify (curl https://api.iconify.design/logos/<nome>.svg, variante quadrada/icon-only), salvar em /public/assets/integrations/iconify/<nome>.svg e registrar uma entrada { bg, bordered, markSrc } no objeto BRANDS em components/ui/AwBrandLogo.tsx. Marcas hand-drawn ou tiles full-bleed continuam usando mark/iconSrc. Detalhe da convenção em AGENTS.md §4 (Icons).`}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6">
              {AW_BRAND_LOGO_REGISTRY.map((id) => (
                <div
                  key={id}
                  className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)"
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
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <>Curar logos de apps do Iconify logos, um a um.</>,
              ]}
              donts={[
                <>Importar PNGs/JPGs de brand — só SVG para escalar.</>,
                <>Bundlar a coleção Iconify inteira ou usar @iconify/react em runtime.</>,
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
