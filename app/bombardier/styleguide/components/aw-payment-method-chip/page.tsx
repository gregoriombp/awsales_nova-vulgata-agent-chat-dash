import { AwPaymentMethodChip } from "@/components/ui/AwPaymentMethodChip"
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

export default function PaymentMethodChipPage() {
  return (
    <>
      <PageHero title="Payment Method Chip">
        Chip compacto que identifica um método de pagamento — bandeira via{" "}
        <code className="mono">AwCardBrand</code> + "{`{brand}`} ••••{" "}
        {`{last4}`}". Com <code className="mono">href</code> vira um link com a
        seta <code className="mono">arrow_forward</code> deslizando no hover;
        sem <code className="mono">href</code>, é um rótulo estático.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="basic"
            title="Uso padrão"
            lead="Passe brand + last4 e um href. A borda e o fundo sobem no hover, e a seta desliza levemente pra direita."
          >
            <Stage label='brand="visa" · last4="3012" · href="#"'>
              <AwPaymentMethodChip brand="visa" last4="3012" href="#" />
            </Stage>
          </Section>

          <Section
            id="brands"
            title="Bandeiras"
            lead="A bandeira é renderizada pelo AwCardBrand — todas as keys do registry valem (visa, mastercard, amex, elo, hipercard, diners, discover) + o placeholder unknown."
          >
            <Stage
              label="bandeiras suportadas"
              gridClassName="flex flex-wrap items-center gap-3"
            >
              <AwPaymentMethodChip brand="visa" last4="3012" href="#" />
              <AwPaymentMethodChip brand="mastercard" last4="4408" href="#" />
              <AwPaymentMethodChip brand="amex" last4="1007" href="#" />
              <AwPaymentMethodChip brand="elo" last4="5521" href="#" />
              <AwPaymentMethodChip brand="hipercard" last4="9920" href="#" />
              <AwPaymentMethodChip brand="diners" last4="3066" href="#" />
              <AwPaymentMethodChip brand="discover" last4="6011" href="#" />
              <AwPaymentMethodChip brand="unknown" last4="0000" href="#" />
            </Stage>
          </Section>

          <Section
            id="static"
            title="Sem href (estático)"
            lead="Sem href o chip vira um <span> sem seta — use quando só precisa exibir o método, não navegar pra ele."
          >
            <Stage
              label="estático · link · label custom"
              gridClassName="flex flex-wrap items-center gap-3"
            >
              <AwPaymentMethodChip brand="visa" last4="3012" />
              <AwPaymentMethodChip brand="mastercard" last4="4408" href="#" />
              <AwPaymentMethodChip
                brand="amex"
                last4="1007"
                label="Amex corporativo •••• 1007"
                href="#"
              />
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Componente apresentacional. Aceita className e ...rest; o tipo de brand é o AwCardBrandId do AwCardBrand."
          >
            <ApiTable>
              <PropRow
                prop="brand"
                type="AwCardBrandId"
                doc='Bandeira aceita pelo AwCardBrand: "visa" | "mastercard" | "amex" | "elo" | "hipercard" | "diners" | "discover" | "unknown".'
              />
              <PropRow
                prop="last4"
                type="string"
                doc="Últimos 4 dígitos do cartão, exibidos após os bullets."
              />
              <PropRow
                prop="href"
                type="string"
                def="—"
                doc="Quando presente, renderiza como <Link> com a seta arrow_forward animada no hover. Sem href, vira <span> sem seta."
              />
              <PropRow
                prop="label"
                type="React.ReactNode"
                def='"{brand} •••• {last4}"'
                doc="Sobrescreve o texto default do chip."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Mergeado (via cn) nas classes da raiz."
              />
            </ApiTable>

            <CodeExample label="exemplo" lang="tsx">
              {`<AwPaymentMethodChip brand="visa" last4="3012" href="/settings/financeiro/metodos-pagamento" />

// estático, sem seta:
<AwPaymentMethodChip brand="mastercard" last4="4408" />

// texto custom:
<AwPaymentMethodChip brand="amex" last4="1007" label="Amex corporativo •••• 1007" />`}
            </CodeExample>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Borda e fundo sutis em tokens; a bandeira vem do AwCardBrand (cores de marca ficam no registry dele, não aqui). Nada hardcoded."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Spec
                k="container"
                v="border --border-subtle / bg --bg-raised"
                d="Chip arredondado (rounded-md); hover sobe pra --border-default + --bg-hover."
              />
              <Spec
                k="brand mark"
                v="<AwCardBrand size='sm' />"
                d="Reusa o brand mark do DS — o mesmo chip retangular de cartão."
              />
              <Spec
                k="texto"
                v="body-xs --fg-secondary · tabular-nums"
                d="Dígitos alinhados em tabular-nums; default {brand} •••• {last4}."
              />
              <Spec
                k="seta"
                v="arrow_forward --fg-tertiary"
                d="Só quando há href; desliza 0.5 no hover (group-hover:translate-x-0.5)."
              />
            </div>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Use href quando o chip leva à tela de métodos de pagamento.</>,
                <>Deixe o AwCardBrand resolver a bandeira — não desenhe a logo à mão.</>,
                <>Use a variante sem href como rótulo quando não há pra onde navegar.</>,
              ]}
              donts={[
                <>Não hardcode cor de marca aqui — isso vive no registry do AwCardBrand.</>,
                <>Não exiba o número completo do cartão; só os last4.</>,
                <>Não use como botão de ação primária — é um chip de identificação/navegação.</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
