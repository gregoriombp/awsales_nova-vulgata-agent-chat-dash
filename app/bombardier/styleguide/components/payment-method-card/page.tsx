"use client"

import * as React from "react"
import { PaymentMethodCard } from "@/components/playground/PaymentMethodCard"
import {
  ApiTable,
  CodeExample,
  PageHero,
  PropRow,
  Section,
  Spec,
  Stage,
  Tldr,
} from "../../_primitives"

export default function PaymentMethodCardPage() {
  return (
    <>
      <PageHero title="Payment method card">
        Cartão principal/default da página de métodos de pagamento. Bandeira
        em tile <code className="mono">88×88</code> à esquerda, PAN mascarado
        com os últimos quatro dígitos em destaque à direita, subtítulo{" "}
        <em>&lt;Bandeira&gt; Card</em> abaixo e linha discreta de
        ações (edit + delete). Pílula escura{" "}
        <code className="mono">Default</code> no canto superior direito quando{" "}
        <code className="mono">isDefault=true</code>. Sem sombra — fica plano
        sobre <code className="mono">bg-raised</code> com{" "}
        <code className="mono">border-subtle</code>.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Slot principal em <code className="mono">/settings/financeiro/metodos-pagamento</code>{" "}
              — pra o método de cobrança padrão da organização.</>,
            <>Quando <code className="mono">isDefault</code> for{" "}
              <code className="mono">true</code> — a pílula confirma visualmente.</>,
            <>Para qualquer bandeira suportada por{" "}
              <code className="mono">AwCardBrand</code> (visa, mastercard, amex, elo, etc.).</>,
          ]}
          dontUse={[
            <>Como linha de método alternativo — para isso usa{" "}
              <code className="mono">AlternateRow</code> (flat list).</>,
            <>Em listas com múltiplos cartões iguais — só faz sentido
              destacar 1 default por organização.</>,
            <>Quando precisar exibir validade/status (expirado, expira em
              breve) — esse padrão é silencioso, mantém só identidade e ações.</>,
          ]}
        />

        <Section id="default" title="Variante única — Default">
          <Stage
            label="isDefault=true · com edit + delete"
            hint="Pílula 'Default' no topo direito, ações ghost embaixo"
          >
            <div className="max-w-[480px] py-6">
              <PaymentMethodCard
                brand="visa"
                last4="7852"
                isDefault
                onEdit={() => {}}
                onRemove={() => {}}
              />
            </div>
          </Stage>

          <Stage
            label="isDefault=false"
            hint="Sem pílula. Use quando o cartão estiver isolado em um contexto que já implica padrão."
          >
            <div className="max-w-[480px] py-6">
              <PaymentMethodCard
                brand="visa"
                last4="7852"
                onEdit={() => {}}
                onRemove={() => {}}
              />
            </div>
          </Stage>

          <Stage
            label="Outras bandeiras"
            hint="O tile usa AwCardBrand size='xl'. Subtítulo é o nome da bandeira + 'Card'."
          >
            <div className="grid grid-cols-1 gap-4 py-6 lg:grid-cols-2">
              <PaymentMethodCard
                brand="mastercard"
                last4="4242"
                isDefault
                onEdit={() => {}}
                onRemove={() => {}}
              />
              <PaymentMethodCard
                brand="amex"
                last4="0005"
                onEdit={() => {}}
                onRemove={() => {}}
              />
            </div>
          </Stage>

          <Stage
            label="removeDisabled"
            hint="Quando é o único método cadastrado, a remoção fica indisponível."
          >
            <div className="max-w-[480px] py-6">
              <PaymentMethodCard
                brand="visa"
                last4="7852"
                isDefault
                onEdit={() => {}}
                onRemove={() => {}}
                removeDisabled
              />
            </div>
          </Stage>
        </Section>

        <Section id="specs" title="Especificações">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="Container"
              v="bg-raised + border-subtle"
              d="Sem shadow. Radius xl. Padding 24."
            />
            <Spec
              k="Brand tile"
              v="AwCardBrand size='xl'"
              d="88×88 quadrado com radius interno 14"
            />
            <Spec
              k="Default pill"
              v="bg-inverse · fg-on-inverse"
              d="Radius md, padding 12/6, ícone 'check' 14px, body-xs Medium"
            />
            <Spec
              k="PAN mascarado"
              v="body-md tracking 0.18em"
              d="Cor fg-tertiary. Tabular nums."
            />
            <Spec
              k="Últimos 4"
              v="24px Semibold"
              d="Cor fg-primary. Tabular nums."
            />
            <Spec
              k="Ações"
              v="AwButton ghost iconOnly"
              d="Edit padrão; Delete em accent-danger com hover red-100"
            />
          </div>
        </Section>

        <Section id="api" title="API">
          <ApiTable>
            <PropRow
              prop="brand"
              type="AwCardBrandId"
              doc="Bandeira do cartão. Drives o tile e o subtítulo '<Brand> Card'."
            />
            <PropRow
              prop="last4"
              type="string"
              doc="Quatro últimos dígitos do PAN — exibidos com destaque."
            />
            <PropRow
              prop="isDefault"
              type="boolean"
              def="false"
              doc="Mostra a pílula 'Default' no topo direito."
            />
            <PropRow
              prop="onEdit"
              type="() => void"
              doc="Callback do botão de editar. Quando ausente, o botão não aparece."
            />
            <PropRow
              prop="onRemove"
              type="() => void"
              doc="Callback do botão de remover. Quando ausente, o botão não aparece."
            />
            <PropRow
              prop="removeDisabled"
              type="boolean"
              def="false"
              doc="Desabilita a remoção (ex: único método cadastrado)."
            />
            <PropRow
              prop="subtitle"
              type="ReactNode"
              doc="Override do subtítulo. Default: '<Brand> Card'."
            />
          </ApiTable>
        </Section>

        <Section id="example" title="Exemplo">
          <CodeExample>{`import { PaymentMethodCard } from "@/components/playground/PaymentMethodCard"

export function PrimaryCard({ method, canRemove, onRemove }) {
  return (
    <PaymentMethodCard
      brand={method.brand}
      last4={method.last4}
      isDefault={method.isDefault}
      onEdit={() => {}}
      onRemove={onRemove}
      removeDisabled={!canRemove}
    />
  )
}`}</CodeExample>
        </Section>
      </div>
    </>
  )
}
