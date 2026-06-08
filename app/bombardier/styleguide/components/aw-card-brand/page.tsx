"use client"

import * as React from "react"
import {
  AW_CARD_BRAND_REGISTRY,
  AwCardBrand,
  detectCardBrand,
} from "@/components/ui/AwCardBrand"
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  Section,
  Spec,
  Stage,
} from "../../_primitives"

const fmtCard = (v: string) =>
  v.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ")

const SAMPLES: Array<{ pan: string; label: string }> = [
  { pan: "4111 1111 1111 1111", label: "Visa" },
  { pan: "5500 0000 0000 0004", label: "Mastercard" },
  { pan: "2221 0000 0000 0009", label: "Mastercard (BIN 2)" },
  { pan: "3782 822463 10005",   label: "American Express" },
  { pan: "6011 1111 1111 1117", label: "Discover" },
  { pan: "3056 9309 0259 04",   label: "Diners Club" },
  { pan: "6062 8210 0000 0000", label: "Hipercard" },
  { pan: "5067 7000 0000 0000", label: "Elo" },
]

export default function CardBrandPage() {
  const [pan, setPan] = React.useState("4111 1111")
  const detected = detectCardBrand(pan)

  return (
    <>
      <PageHero title="Card brand">
        Chip retangular (proporção cartão 1.5:1) que identifica a bandeira do
        cartão de crédito — Visa, Mastercard, Amex, Elo, Hipercard, Diners,
        Discover. Acompanha um detector de bandeira por BIN (prefixo) pra
        renderizar a logo automaticamente enquanto o usuário digita o número.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="rounded-md border border-(--aw-blue-200) bg-(--aw-blue-100) px-5 py-4 mb-10 text-sm text-(--aw-blue-900)">
          <strong>AwCardBrand vs AwBrandLogo.</strong> Use{" "}
          <code className="mono">AwCardBrand</code> exclusivamente pra
          bandeiras de cartão (Visa/Master/Amex…). Pra meios de pagamento mais
          amplos (Pix, boleto, cartão como categoria) e pra brands de terceiros
          (Stripe, Hotmart), use{" "}
          <a
            href="/bombardier/styleguide/components/brand-logo"
            className="underline underline-offset-2 hover:text-(--aw-blue-700)"
          >
            AwBrandLogo
          </a>
          .
        </div>

        <div className="flex flex-col gap-16">
          <Section
            id="live"
            title="Detecção live"
            lead="Digite um número de cartão. O componente resolve a bandeira via BIN match e troca a logo conforme você digita. Ideal pra colocar dentro do input de cartão num checkout."
          >
            <Stage label="prop pan resolve a brand automaticamente" gridClassName="flex flex-col items-start gap-4">
              <div className="flex w-full max-w-[480px] items-center gap-2.5 rounded-md border border-(--border-default) bg-(--bg-raised) pl-2.5 pr-3.5 h-11 focus-within:border-(--fg-primary)">
                <AwCardBrand pan={pan} size="md" />
                <input
                  value={pan}
                  onChange={(e) => setPan(fmtCard(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  inputMode="numeric"
                  className="flex-1 border-0 bg-transparent font-sans outline-0"
                  style={{
                    fontSize: 14,
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "0.02em",
                  }}
                />
                <span
                  className="text-(--fg-tertiary)"
                  style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}
                >
                  {detected === "unknown" ? "—" : detected}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SAMPLES.map((s) => (
                  <button
                    key={s.pan}
                    type="button"
                    onClick={() => setPan(s.pan)}
                    className="rounded-sm border border-(--border-subtle) bg-(--bg-surface) px-2.5 py-1 text-(--fg-secondary) hover:border-(--fg-primary)"
                    style={{ fontSize: 11 }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Stage>
          </Section>

          <Section
            id="sizes"
            title="Tamanhos"
            lead="Três presets retangulares (proporção 1.5:1 — formato cartão). Diferente do AwBrandLogo, aqui o tile NÃO é quadrado."
          >
            <Stage label="size · sm / md / lg">
              <AwCardBrand brand="visa" size="sm" />
              <AwCardBrand brand="visa" size="md" />
              <AwCardBrand brand="visa" size="lg" />
            </Stage>
          </Section>

          <Section
            id="registry"
            title="Registry"
            lead={`${AW_CARD_BRAND_REGISTRY.length} bandeiras + estado "unknown" (placeholder dashed). Cores oficiais por brand. Pra adicionar bandeira, edite components/ui/AwCardBrand.tsx.`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6">
              {AW_CARD_BRAND_REGISTRY.map((id) => (
                <div
                  key={id}
                  className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)"
                >
                  <AwCardBrand brand={id} size="lg" />
                  <span className="mono">{id}</span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)">
                <AwCardBrand brand="unknown" size="lg" />
                <span className="mono">unknown</span>
              </div>
            </div>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Chip retangular com proporção 1.5:1 (igual ao aspect físico de um cartão). Bg = cor oficial da brand. Visa, Master e Discover usam tile branco com hairline border (logos coloridas dentro)."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Spec k="chip sm" v="28 × 18 px" d="Logo: ~78%" />
              <Spec k="chip md" v="36 × 24 px" d="Default · logo: ~78%" />
              <Spec k="chip lg" v="48 × 32 px" d="Logo: ~78%" />
              <Spec k="radius" v="3 / 4 / 5 px" d="Cresce com o size." />
              <Spec
                k="bg branco bordered"
                v="visa · master · discover"
                d="Usa hairline --border-subtle inset."
              />
              <Spec k="bg cor brand" v="amex · elo · hipercard · diners" />
            </div>
          </Section>

          <Section
            id="api"
            title="API"
            lead={`Import: import { AwCardBrand, detectCardBrand, AW_CARD_BRAND_REGISTRY } from "@/components/ui/AwCardBrand".`}
          >
            <ApiTable>
              <PropRow
                prop="brand"
                type='"visa" | "mastercard" | "amex" | "elo" | "hipercard" | "diners" | "discover" | "unknown"'
                def='"unknown"'
                doc="Brand fixa do registry. Ignorado quando pan é passado."
              />
              <PropRow
                prop="pan"
                type="string"
                doc="PAN/BIN. detectCardBrand resolve a brand automaticamente. Strips non-digits."
              />
              <PropRow
                prop="size"
                type='"sm" | "md" | "lg"'
                def='"md"'
                doc="Tamanho do chip retangular."
              />
              <PropRow
                prop="...rest"
                type="HTMLAttributes<HTMLDivElement>"
                doc="Atributos nativos de <div>."
              />
            </ApiTable>
            <CodeExample>{`import { AwCardBrand, detectCardBrand } from "@/components/ui/AwCardBrand"

// brand fixa
<AwCardBrand brand="visa" />

// detecção live num input
const [pan, setPan] = useState("")
const brand = detectCardBrand(pan) // "visa" | "mastercard" | ... | "unknown"

<input value={pan} onChange={(e) => setPan(e.target.value)} />
<AwCardBrand pan={pan} />`}</CodeExample>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>
                  Use dentro do input de número de cartão num checkout — slot
                  esquerdo, troca live conforme o usuário digita.
                </>,
                <>
                  Use <code className="mono">detectCardBrand</code> também pra
                  validar/rotular (ex: bloquear bandeira não aceita).
                </>,
                <>
                  Cubra o estado <code className="mono">unknown</code> — ele
                  evita layout shift enquanto o usuário ainda não digitou o
                  bastante.
                </>,
              ]}
              donts={[
                <>
                  Usar pra bandeiras genéricas/categorias (ex: "cartão de
                  crédito" abstrato) — pra isso existe{" "}
                  <code className="mono">AwBrandLogo brand="card"</code>.
                </>,
                <>
                  Trocar as cores oficiais — quebra reconhecimento. Vendor
                  colors são identidade.
                </>,
                <>
                  Mostrar lado a lado em formato quadrado — o aspect 1.5:1 é
                  identidade do componente.
                </>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
