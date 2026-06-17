import { AwCostBreakdown } from "@/components/ui/AwCostBreakdown"
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

export default function CostBreakdownPage() {
  return (
    <>
      <PageHero title="Cost Breakdown">
        Linha inline que decompõe os valores que somam um total — assinatura,
        variável, cupom. Estilo caption discreto: cada parcela vem precedida de
        um operador (<code className="mono">+</code> ou <code className="mono">−</code>),
        com o valor em destaque tabular. Descontos podem aparecer em verde,
        pois favorecem o usuário.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="basic"
            title="Uso padrão"
            lead="Primeiro item é a base (sem operador). Os demais trazem o operador conforme o kind. O valor mostrado é sempre o absoluto — o sinal vem do operador."
          >
            <Stage label="Assinatura + variável − cupom">
              <AwCostBreakdown
                items={[
                  { label: "Assinatura", value: 1290, kind: "base" },
                  { label: "variável", value: 612.4, kind: "add" },
                  { label: "cupom", value: 129, kind: "subtract" },
                ]}
              />
            </Stage>
          </Section>

          <Section
            id="two-items"
            title="Dois itens"
            lead="O caso mais enxuto — uma base e uma adição. Sem kind explícito, o primeiro item é base e os seguintes são add."
          >
            <Stage label="Plano + add-on">
              <AwCostBreakdown
                items={[
                  { label: "Plano Pro", value: 890 },
                  { label: "assentos extras", value: 240 },
                ]}
              />
            </Stage>
          </Section>

          <Section
            id="many"
            title="Vários add / subtract"
            lead="A linha quebra (flex-wrap) quando precisa. Operadores ficam discretos; descontos em verde sutil destacam o que é bom pro usuário."
          >
            <Stage
              label="Composição com múltiplas parcelas"
              gridClassName="flex flex-col gap-4"
            >
              <AwCostBreakdown
                items={[
                  { label: "Assinatura", value: 1290, kind: "base" },
                  { label: "uso de mensagens", value: 612.4, kind: "add" },
                  { label: "integrações", value: 180, kind: "add" },
                  { label: "cupom de boas-vindas", value: 129, kind: "subtract" },
                  { label: "crédito de indicação", value: 50, kind: "subtract" },
                ]}
              />
              <AwCostBreakdown
                items={[
                  { label: "Setup", value: 2500, kind: "base" },
                  { label: "treinamento", value: 800, kind: "add" },
                  { label: "desconto lançamento", value: 660, kind: "subtract" },
                ]}
              />
            </Stage>
          </Section>

          <Section
            id="format"
            title="Formatação customizada"
            lead="formatValue troca o formatador padrão (Intl pt-BR / BRL). Útil pra outras moedas, unidades ou precisão."
          >
            <Stage label="formatValue → USD">
              <AwCostBreakdown
                formatValue={(n) =>
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(n)
                }
                items={[
                  { label: "Base plan", value: 199, kind: "base" },
                  { label: "overage", value: 42.5, kind: "add" },
                  { label: "annual discount", value: 24, kind: "subtract" },
                ]}
              />
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Componente puro, sem estado próprio. O consumidor compõe o array de items e, se quiser, o formatador."
          >
            <ApiTable>
              <PropRow
                prop="items"
                type="AwCostBreakdownItem[]"
                doc="Parcelas na ordem de exibição. Cada item: { label, value, kind? }."
              />
              <PropRow
                prop="items[].kind"
                type='"base" | "add" | "subtract"'
                def='1º → "base", demais → "add"'
                doc='"base" não tem operador; "add" mostra "+"; "subtract" mostra "−" e pinta o valor de verde.'
              />
              <PropRow
                prop="formatValue"
                type="(n: number) => string"
                def="Intl pt-BR / BRL"
                doc="Formata cada valor. Recebe sempre o valor absoluto."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Mergeado (via cn) na classe da raiz <div>."
              />
            </ApiTable>

            <CodeExample label="exemplo" lang="tsx">
              {`<AwCostBreakdown
  items={[
    { label: "Assinatura", value: 1290, kind: "base" },
    { label: "variável", value: 612.4, kind: "add" },
    { label: "cupom", value: 129, kind: "subtract" }, // verde, "−" pelo operador
  ]}
/>`}
            </CodeExample>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Tudo via utilities Tailwind v4 lendo CSS variables — nada hardcoded. O sinal nunca está no valor: vem do operador."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Spec
                k="container"
                v="flex flex-wrap items-baseline · body-sm"
                d="Inline, alinhado pela baseline, quebra quando precisa. Cor base --fg-secondary."
              />
              <Spec
                k="operador"
                v="--fg-tertiary · aria-hidden"
                d='"+" ou "−" (minus real) antes da parcela. Mais discreto que o texto.'
              />
              <Spec
                k="valor"
                v="font-medium tabular-nums · --fg-primary"
                d="Números alinhados em coluna; sempre o valor absoluto formatado."
              />
              <Spec
                k="desconto"
                v="--accent-success"
                d="kind subtract pinta o valor de verde — desconto é bom pro usuário."
              />
            </div>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Use pra explicar como um total se forma, em contexto compacto (cards, resumo de fatura).</>,
                <>Deixe o primeiro item como base, sem operador.</>,
                <>Confie no operador pra carregar o sinal — passe sempre valores positivos.</>,
              ]}
              donts={[
                <>Não embuta o sinal no value (ex. -129) — o componente já usa o absoluto.</>,
                <>Não use como tabela de preços completa — é uma linha de decomposição, não um demonstrativo.</>,
                <>Não pinte adições de vermelho; o destaque de cor é só pro desconto (verde).</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
