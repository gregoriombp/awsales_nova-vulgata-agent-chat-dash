import { AwInvoiceForecastCard } from "@/components/ui/AwInvoiceForecastCard";
import {
  ApiTable,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives";

export default function InvoiceForecastCardPage() {
  return (
    <>
      <PageHero title="Invoice forecast card">
        Card de previsão da próxima fatura: valor previsto com variação, a
        composição do custo (assinatura + variável − cupom), a ação principal e
        um medidor radial de quanto do teto já foi consumido. Compõe os átomos
        do DS — <code className="mono">AwTrendDelta</code>,{" "}
        <code className="mono">AwCostBreakdown</code> e{" "}
        <code className="mono">AwRadialProgress</code> — com{" "}
        <code className="mono">AwPill</code> e{" "}
        <code className="mono">AwButton</code>.
      </PageHero>

      <div className="mx-auto max-w-[1200px] px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="basic"
            title="Uso padrão"
            lead="Passe o total previsto, a variação, a composição do custo, a ação e o medidor (consumo vs. teto). O custo subindo é sinalizado com tom 'bad'."
          >
            <Stage label="Previsão com Cortex monitorando + 41% do teto">
              <AwInvoiceForecastCard
                eyebrow="Previsão da próxima fatura · 01 Jul"
                monitorLabel="Cortex monitorando custos"
                total={1773.4}
                trend={{ value: 4.8, direction: "up", tone: "bad" }}
                breakdown={[
                  { label: "Assinatura", value: 1290, kind: "base" },
                  { label: "variável", value: 612.4, kind: "add" },
                  { label: "cupom", value: 129, kind: "subtract" },
                ]}
                cta={{ label: "Ver fatura detalhada", href: "#" }}
                gauge={{
                  value: 615,
                  max: 1500,
                  caption: (
                    <>
                      do teto
                      <br />R$ 1.500
                    </>
                  ),
                }}
              />
            </Stage>
          </Section>

          <Section
            id="states"
            title="Variações"
            lead="O custo pode estar caindo (tom 'good'), sem monitoramento, estourando o teto, ou marcado como estimado — com selo + tooltip e sem medidor."
          >
            <Stage label="Custo caindo, sem pill de monitoramento">
              <AwInvoiceForecastCard
                eyebrow="Previsão da próxima fatura · 01 Ago"
                total={1402.0}
                trend={{ value: -7.2, direction: "down", tone: "good" }}
                breakdown={[
                  { label: "Assinatura", value: 1290, kind: "base" },
                  { label: "variável", value: 112, kind: "add" },
                ]}
                cta={{ label: "Ver fatura detalhada", href: "#" }}
                gauge={{ value: 980, max: 1500, caption: "do teto" }}
              />
            </Stage>

            <Stage label="Acima do teto (medidor em 100%)">
              <AwInvoiceForecastCard
                eyebrow="Previsão da próxima fatura · 01 Set"
                monitorLabel="Cortex monitorando custos"
                total={2140.5}
                trend={{ value: 21.4, direction: "up", tone: "bad" }}
                breakdown={[
                  { label: "Assinatura", value: 1290, kind: "base" },
                  { label: "variável", value: 850.5, kind: "add" },
                ]}
                cta={{ label: "Rever limite", href: "#" }}
                gauge={{ value: 1850, max: 1500, caption: "do teto" }}
              />
            </Stage>

            <Stage label="Total estimado, sem medidor (selo + tooltip)">
              <AwInvoiceForecastCard
                eyebrow="Previsão da próxima fatura · 01 Out"
                total={3257.21}
                estimateNote="Valor estimado. A cobrança é fechada na data e pode variar conforme o consumo até o fim do ciclo e o câmbio na conversão."
                breakdown={[
                  { label: "Assinatura", value: 2497.98, kind: "base" },
                  { label: "variável", value: 891.63, kind: "add" },
                  { label: "cupom", value: 132.4, kind: "subtract" },
                ]}
                cta={{ label: "Ver fatura detalhada", href: "#" }}
              />
            </Stage>
          </Section>

          <Section id="api" title="API">
            <ApiTable>
              <PropRow
                prop="eyebrow"
                type="string"
                doc="Rótulo no topo, ex.: 'Previsão da próxima fatura · 01 Jul'. (obrigatório)"
              />
              <PropRow
                prop="monitorLabel"
                type="React.ReactNode"
                doc="Texto do pill de monitoramento (AwPill 'live'). Omitido → sem pill."
              />
              <PropRow
                prop="total"
                type="number"
                doc="Valor previsto total, formatado por formatValue. (obrigatório)"
              />
              <PropRow
                prop="trend"
                type="{ value; direction?; tone? }"
                doc="Variação ao lado do total — repassada ao AwTrendDelta."
              />
              <PropRow
                prop="estimateNote"
                type="React.ReactNode"
                doc="Marca o total como estimado: troca o trend por um selo 'Estimado' com tooltip de hover. Tem precedência sobre trend."
              />
              <PropRow
                prop="breakdown"
                type="AwCostBreakdownItem[]"
                doc="Composição do total (assinatura + variável − cupom…). (obrigatório)"
              />
              <PropRow
                prop="cta"
                type="{ label; href?; onClick? }"
                doc="Ação principal. Link se href, senão botão com onClick."
              />
              <PropRow
                prop="gauge"
                type="{ value; max; caption? }"
                doc="Medidor radial à direita (consumo vs. teto). Omitido → sem medidor."
              />
              <PropRow
                prop="formatValue"
                type="(n: number) => string"
                def="Intl pt-BR / BRL"
                doc="Formatação monetária do total e da composição."
              />
            </ApiTable>
          </Section>
        </div>
      </div>
    </>
  );
}
