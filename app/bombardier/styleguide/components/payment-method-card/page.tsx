"use client"

import * as React from "react"
import { PaymentMethodCard } from "@/components/playground/PaymentMethodCard"
import { pickCoverBackground } from "@/app/settings/(sections)/equipe-permissoes/_components/data"
import { AwButton } from "@/components/ui/AwButton"
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

const COVER_A = pickCoverBackground("u-greg")
const COVER_B = pickCoverBackground("u-bia")
const COVER_C = pickCoverBackground("u-luca")

export default function PaymentMethodCardPage() {
  return (
    <>
      <PageHero title="Payment method card">
        Cartão de método de pagamento com tratamento de cartão real:
        proporção <code className="mono">1.586:1</code>, fundo cover (capa
        do perfil) com glassmorphism translúcido, PAN mascarado no centro
        e bandeira <code className="mono">AwCardBrand</code> no topo
        direito. Badge discreta{" "}
        <code className="mono">Pagamento principal</code> quando{" "}
        <code className="mono">isDefault=true</code>. Ações
        (alterar / excluir) vivem <strong>fora</strong> do card —
        compõem ao lado dele na página.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Slot principal em <code className="mono">/settings/financeiro/metodos-pagamento</code>{" "}
              — pro método de cobrança padrão da organização.</>,
            <>Quando quiser que o cartão pareça <em>um cartão</em>:
              proporção real, cover por trás, badges minimalistas.</>,
            <>Em qualquer bandeira suportada por{" "}
              <code className="mono">AwCardBrand</code> (visa, mastercard, amex, etc.).</>,
          ]}
          dontUse={[
            <>Como linha de método alternativo — para isso usa um row flat
              com <code className="mono">AwCardBrand size=&quot;md&quot;</code>.</>,
            <>Como container de ações dentro do card — ações ficam
              <em> fora</em>, alinhadas embaixo ou ao lado.</>,
            <>Sem cover quando puder evitar — o gradient de fallback
              funciona, mas a capa do perfil dá personalidade.</>,
          ]}
        />

        <Section id="default" title="Variantes">
          <Stage
            label="Com cover · isDefault=true · holder + validade"
            hint="O caso real do /metodos-pagamento. Capa do perfil por trás, badge 'Pagamento principal' no canto, ações abaixo do card."
          >
            <div className="flex flex-col gap-3 py-6">
              <PaymentMethodCard
                brand="visa"
                last4="7852"
                isDefault
                coverImage={COVER_A}
                holderName="Greg Matuzalem"
                expiresAt="08/2028"
              />
              <div className="flex max-w-[360px] flex-wrap items-center gap-2">
                <AwButton size="sm" variant="secondary" iconLeft="edit">
                  Alterar método de pagamento
                </AwButton>
                <AwButton
                  size="sm"
                  variant="ghost"
                  iconLeft="delete"
                  className="text-[var(--accent-danger)] hover:!bg-[var(--aw-red-100)]"
                >
                  Excluir
                </AwButton>
              </div>
            </div>
          </Stage>

          <Stage
            label="Sem cover · gradient fallback"
            hint="Quando não houver imagem disponível, o card cai num gradient blue → purple → blue-1100."
          >
            <div className="max-w-[360px] py-6">
              <PaymentMethodCard
                brand="mastercard"
                last4="4242"
                isDefault
                holderName="Beatriz Andrade"
                expiresAt="04/2027"
              />
            </div>
          </Stage>

          <Stage
            label="Outras bandeiras"
            hint="A bandeira é renderizada em size='md' no canto superior direito."
          >
            <div className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-2">
              <PaymentMethodCard
                brand="amex"
                last4="0005"
                coverImage={COVER_B}
                holderName="Lucas Vieira"
                expiresAt="11/2026"
              />
              <PaymentMethodCard
                brand="elo"
                last4="1234"
                coverImage={COVER_C}
                isDefault
                holderName="Ana Carolina"
                expiresAt="06/2029"
              />
            </div>
          </Stage>

          <Stage
            label="Mínimo · só brand + last4"
            hint="Holder e validade são opcionais — o card colapsa o rodapé quando ambos faltam."
          >
            <div className="max-w-[360px] py-6">
              <PaymentMethodCard brand="visa" last4="7852" coverImage={COVER_A} />
            </div>
          </Stage>
        </Section>

        <Section id="specs" title="Especificações">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="Container"
              v="aspect 1.586:1 · max-w 360"
              d="Radius xl. Shadow sutil. text-white em todos os textos."
            />
            <Spec
              k="Background"
              v="coverImage + dark wash"
              d="from-black/45 via-black/30 to-black/55 + backdrop-blur 2px."
            />
            <Spec
              k="Fallback bg"
              v="blue-700 → purple-700 → blue-1100"
              d="Diagonal gradient quando coverImage não é passado."
            />
            <Spec
              k="Ring interno"
              v="ring-1 ring-inset ring-white/20"
              d="Hairline branco translúcido pra dar borda de cartão."
            />
            <Spec
              k="Badge default"
              v="bg-white/15 + blur"
              d="10px uppercase tracking 0.08em, ícone check 11px."
            />
            <Spec
              k="PAN"
              v="tracking 0.16em"
              d="•••• •••• •••• em white/55; last4 em 18px white."
            />
          </div>
        </Section>

        <Section id="api" title="API">
          <ApiTable>
            <PropRow
              prop="brand"
              type="AwCardBrandId"
              doc="Bandeira do cartão. Aparece no canto superior direito em size='md'."
            />
            <PropRow
              prop="last4"
              type="string"
              doc="Quatro últimos dígitos do PAN — exibidos com destaque depois da máscara."
            />
            <PropRow
              prop="isDefault"
              type="boolean"
              def="false"
              doc="Mostra a badge 'Pagamento principal' no topo esquerdo."
            />
            <PropRow
              prop="coverImage"
              type="string"
              doc="URL da imagem de fundo. Sem ela, o card usa o gradient fallback."
            />
            <PropRow
              prop="holderName"
              type="string"
              doc="Nome do titular impresso no rodapé esquerdo. Opcional."
            />
            <PropRow
              prop="expiresAt"
              type="string"
              doc="Validade MM/YYYY (ou MM/YY) no rodapé direito. Opcional."
            />
          </ApiTable>
        </Section>

        <Section id="example" title="Exemplo">
          <CodeExample>{`import { PaymentMethodCard } from "@/components/playground/PaymentMethodCard"
import { AwButton } from "@/components/ui/AwButton"

export function PrimaryCard({ method, cover, holderName, onRemove }) {
  return (
    <div className="flex flex-col gap-3">
      <PaymentMethodCard
        brand={method.brand}
        last4={method.last4}
        isDefault={method.isDefault}
        coverImage={cover}
        holderName={holderName}
        expiresAt={method.expiresAt}
      />
      <div className="flex max-w-[360px] flex-wrap items-center gap-2">
        <AwButton size="sm" variant="secondary" iconLeft="edit">
          Alterar método de pagamento
        </AwButton>
        <AwButton
          size="sm"
          variant="ghost"
          iconLeft="delete"
          onClick={onRemove}
          className="text-[var(--accent-danger)]"
        >
          Excluir
        </AwButton>
      </div>
    </div>
  )
}`}</CodeExample>
        </Section>
      </div>
    </>
  )
}
