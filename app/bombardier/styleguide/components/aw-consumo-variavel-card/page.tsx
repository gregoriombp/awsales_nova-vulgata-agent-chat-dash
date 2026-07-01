import { AwConsumoVariavelCard } from "@/components/ui/AwConsumoVariavelCard"
import {
  ApiTable,
  CodeExample,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

export default function ConsumoVariavelCardPage() {
  return (
    <>
      <PageHero title="Consumo Variável Card">
        Card de consumo variável da visão geral do Financeiro, em dois modos. Na
        conta <strong>pré-paga</strong> mostra o limite antes da cobrança, a
        barra de uso (com o trecho de créditos/cupons já abatidos em destaque) e
        quanto resta. Na conta <strong>pós-paga</strong> — linha de crédito, sem
        teto — mostra “Uso pós-pago ativo / Ilimitado”, a descrição do modelo e a
        data da próxima cobrança.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="prepaid"
            title="Pré-pago — conta com teto"
            lead="Passe o uso acumulado, o limite do ciclo e o desconto já abatido. A barra divide o uso líquido (verde) do bônus de créditos/cupons (faixa hachurada), e o rodapé mostra quanto resta antes da próxima cobrança automática."
          >
            <Stage
              label="Uso variável dentro do limite"
              gridClassName="grid grid-cols-1 max-w-[560px]"
            >
              <AwConsumoVariavelCard
                mode="prepaid"
                used={891.63}
                limit={1500}
                discount={132.4}
              />
            </Stage>
          </Section>

          <Section
            id="postpaid"
            title="Pós-pago — conta com linha de crédito"
            lead="Sem teto de uso variável: no lugar do limite + barra, a conta aparece como “Ilimitado”, com a descrição do modelo pós-pago e a data da próxima cobrança. Os créditos do ciclo seguem visíveis, porque também abatem o pós-pago."
          >
            <Stage
              label="Uso pós-pago ativo"
              gridClassName="grid grid-cols-1 max-w-[560px]"
            >
              <AwConsumoVariavelCard
                mode="postpaid"
                discount={132.4}
                nextChargeAt="28/05/2026"
              />
            </Stage>
          </Section>

          <Section
            id="side-by-side"
            title="Os dois modos lado a lado"
            lead="O mesmo componente cobre os dois cenários de cobrança — a prop mode decide qual variante renderiza."
          >
            <Stage
              label="prepaid · postpaid"
              gridClassName="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch"
            >
              <AwConsumoVariavelCard
                mode="prepaid"
                used={891.63}
                limit={1500}
                discount={132.4}
              />
              <AwConsumoVariavelCard
                mode="postpaid"
                discount={132.4}
                nextChargeAt="28/05/2026"
              />
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="União discriminada por mode. Valores monetários são formatados internamente em BRL (pt-BR)."
          >
            <ApiTable>
              <PropRow
                prop="mode"
                type='"prepaid" | "postpaid"'
                doc="Modelo de cobrança da conta — decide qual variante renderiza."
              />
              <PropRow
                prop="used"
                type="number"
                doc="(prepaid) Total de uso variável consumido no ciclo."
              />
              <PropRow
                prop="limit"
                type="number"
                doc="(prepaid) Teto de uso variável antes da cobrança automática."
              />
              <PropRow
                prop="discount"
                type="number"
                doc="Créditos e cupons já abatidos no ciclo — também abatem o pós-pago."
              />
              <PropRow
                prop="nextChargeAt"
                type="string"
                doc='(postpaid) Data da próxima cobrança já formatada (ex.: "28/05/2026").'
              />
            </ApiTable>

            <CodeExample label="pré-pago" lang="tsx">
              {`<AwConsumoVariavelCard
  mode="prepaid"
  used={891.63}
  limit={1500}
  discount={132.4}
/>`}
            </CodeExample>

            <CodeExample label="pós-pago" lang="tsx">
              {`<AwConsumoVariavelCard
  mode="postpaid"
  discount={132.4}
  nextChargeAt="28/05/2026"
/>`}
            </CodeExample>
          </Section>
        </div>
      </div>
    </>
  )
}
