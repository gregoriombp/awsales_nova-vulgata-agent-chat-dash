import { AwPaymentMethodRow } from "@/components/ui/AwPaymentMethodRow"
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

export default function PaymentMethodRowPage() {
  return (
    <>
      <PageHero title="Payment method row">
        Linha de um método de pagamento — bandeira do cartão, rótulo{" "}
        <code className="mono">{`{brand} •••• {last4}`}</code>, pills de estado
        (Padrão · Expira em breve · Expirado) e um menu de ações. Desacoplado de
        financeiro: os dados e callbacks vêm de quem compõe.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="basic"
            title="Uso padrão"
            lead="Cada estado de expiração rende um pill diferente. A linha de cima é o método padrão (pill 'Padrão')."
          >
            <Stage
              label="default · expiring · expired"
              gridClassName="flex flex-col divide-y divide-(--border-subtle)"
            >
              <AwPaymentMethodRow
                brand="visa"
                last4="3012"
                expiresAt="08/2028"
                isDefault
                canRemove
              />
              <AwPaymentMethodRow
                brand="mastercard"
                last4="8888"
                expiresAt="04/2027"
                expiry="expiring"
                canRemove
              />
              <AwPaymentMethodRow
                brand="amex"
                last4="1004"
                expiresAt="11/2026"
                expiry="expired"
                canRemove
              />
            </Stage>
          </Section>

          <Section
            id="states"
            title="Estados do pill"
            lead='A prop `expiry` controla o pill extra. "ok" (default) não rende pill; "expiring" pinta um warning; "expired" pinta um error.'
          >
            <Stage
              label='expiry="ok" · "expiring" · "expired"'
              gridClassName="flex flex-col divide-y divide-(--border-subtle)"
            >
              <AwPaymentMethodRow
                brand="visa"
                last4="4242"
                expiresAt="12/2030"
                expiry="ok"
                canRemove
              />
              <AwPaymentMethodRow
                brand="mastercard"
                last4="5454"
                expiresAt="02/2027"
                expiry="expiring"
                canRemove
              />
              <AwPaymentMethodRow
                brand="amex"
                last4="9001"
                expiresAt="01/2026"
                expiry="expired"
                canRemove
              />
            </Stage>
          </Section>

          <Section
            id="single"
            title="Método único"
            lead="Com um único método, 'Remover método' fica desabilitado — passe canRemove={false} para impedir a organização de ficar sem forma de cobrança."
          >
            <Stage label="isDefault + canRemove={false}">
              <AwPaymentMethodRow
                brand="visa"
                last4="3012"
                expiresAt="08/2028"
                isDefault
                canRemove={false}
              />
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Componente sem estado próprio. Os callbacks disparam as ações do menu; o consumidor mantém a lista e a confirmação de remoção."
          >
            <ApiTable>
              <PropRow
                prop="brand"
                type="AwCardBrandId"
                doc='Bandeira do cartão — registry do AwCardBrand ("visa" | "mastercard" | "amex" | …).'
              />
              <PropRow
                prop="last4"
                type="string"
                doc="Últimos 4 dígitos exibidos no rótulo."
              />
              <PropRow
                prop="expiresAt"
                type="string"
                doc='Validade exibida no subtexto "Expira em {expiresAt}". MM/AAAA.'
              />
              <PropRow
                prop="expiry"
                type='"ok" | "expiring" | "expired"'
                def='"ok"'
                doc="Controla o pill extra. ok → nenhum; expiring → warning; expired → error."
              />
              <PropRow
                prop="isDefault"
                type="boolean"
                def="false"
                doc='Rende o pill "Padrão" e desabilita "Definir como padrão" no menu.'
              />
              <PropRow
                prop="canRemove"
                type="boolean"
                def="false"
                doc='Habilita a ação destrutiva "Remover método".'
              />
              <PropRow
                prop="onSetDefault"
                type="() => void"
                doc='Callback da ação "Definir como padrão".'
              />
              <PropRow
                prop="onEdit"
                type="() => void"
                doc='Callback da ação "Editar dados".'
              />
              <PropRow
                prop="onRemoveRequest"
                type="() => void"
                doc='Callback da ação "Remover método" (abrir confirmação).'
              />
              <PropRow
                prop="className"
                type="string"
                doc="Mergeado na div raiz (flex row). Aceita ...rest também."
              />
            </ApiTable>

            <CodeExample label="exemplo" lang="tsx">
              {`<AwPaymentMethodRow
  brand="mastercard"
  last4="8888"
  expiresAt="04/2027"
  expiry="expiring"
  isDefault={false}
  canRemove
  onSetDefault={() => setDefault(id)}
  onEdit={() => openEdit(id)}
  onRemoveRequest={() => requestRemove(id)}
/>`}
            </CodeExample>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Composição de componentes do DS. Estilos vêm dos tokens via CSS variables — nada hardcoded."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Spec
                k="bandeira"
                v="<AwCardBrand size='md' />"
                d="Chip retangular com a logo oficial da brand."
              />
              <Spec
                k="rótulo"
                v="{brand} •••• {last4}"
                d="body-sm, tabular-nums, --fg-primary."
              />
              <Spec
                k="pills"
                v="AwPill live / warning / error"
                d='"Padrão" + estado de expiração (sem dot).'
              />
              <Spec
                k="menu"
                v="<AwDropdownMenu align='end' />"
                d="Trigger more_horiz; itens default/edit/separador/remove."
              />
            </div>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Componha as linhas numa lista com separadores no nível de cima.</>,
                <>Use <code className="mono">canRemove={`{false}`}</code> quando sobra um único método.</>,
                <>Confirme a remoção num modal a partir de <code className="mono">onRemoveRequest</code>.</>,
              ]}
              donts={[
                <>Não embuta lógica de fixtures de financeiro aqui — passe dados prontos.</>,
                <>Não use <code className="mono">expiry</code> e <code className="mono">isDefault</code> pra esconder o menu; eles só controlam pills.</>,
                <>Não envolva a linha num &lt;li&gt; dentro do componente — ela já é um &lt;div&gt; flex.</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
