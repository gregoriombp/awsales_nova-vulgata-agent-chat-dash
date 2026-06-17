import { AwButton } from "@/components/ui/AwButton"
import { AwInvoiceSummaryCard } from "@/components/ui/AwInvoiceSummaryCard"
import { Icon } from "@/components/ui/Icon"
import {
  ApiTable,
  CodeExample,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

export default function InvoiceSummaryCardPage() {
  return (
    <>
      <PageHero title="Invoice Summary Card">
        Card claro que resume a fatura atual: total grande em destaque, eyebrow
        da próxima cobrança, breakdown do plano + variáveis acumuladas, linha de
        desconto opcional e slots genéricos pro canto do header e pro rodapé.
        Desacoplado do módulo de Financeiro — recebe tudo por props.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="basic"
            title="Uso padrão"
            lead="Total, próxima cobrança, breakdown do plano e uma ação no rodapé. Sem desconto, a linha de oferta não aparece."
          >
            <Stage label="Fatura atual — sem desconto" gridClassName="max-w-md">
              <AwInvoiceSummaryCard
                total={1341}
                dueAt="19/06/2026"
                daysUntil={31}
                planName="Pro"
                planMonthly={499}
                accumulated={842}
                actions={
                  <AwButton variant="secondary" size="sm">
                    Adiantar pagamento
                  </AwButton>
                }
              />
            </Stage>
          </Section>

          <Section
            id="discount-header"
            title="Com desconto e header action"
            lead="Quando discount > 0, a linha de desconto aparece em accent-success com o ícone local_offer. headerAction preenche o canto superior direito — aqui um chip simples de exemplo."
          >
            <Stage
              label="discount=120 + headerAction (chip)"
              gridClassName="max-w-md"
            >
              <AwInvoiceSummaryCard
                total={1221}
                dueAt="19/06/2026"
                daysUntil={31}
                planName="Pro"
                planMonthly={499}
                accumulated={842}
                discount={120}
                headerAction={
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-(--border-subtle) bg-(--bg-raised) px-2.5 py-1.5 body-xs tabular-nums text-(--fg-secondary)">
                    <Icon name="credit_card" size={14} />
                    Visa •••• 3012
                  </span>
                }
                actions={
                  <AwButton variant="secondary" size="sm">
                    Adiantar pagamento
                  </AwButton>
                }
              />
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Componente de apresentação puro. O consumidor fornece os valores e compõe os slots headerAction e actions."
          >
            <ApiTable>
              <PropRow
                prop="total"
                type="number"
                doc="Total da fatura atual. Renderizado grande, com prefixo R$ destacado e tabular-nums."
              />
              <PropRow
                prop="dueAt"
                type="string"
                doc='Data da próxima cobrança, já formatada (ex.: "19/06/2026").'
              />
              <PropRow
                prop="daysUntil"
                type="number"
                doc="Dias até a cobrança. A frase '· em N dias' só aparece quando > 0."
              />
              <PropRow
                prop="planName"
                type="string"
                doc="Nome do plano exibido na linha de breakdown."
              />
              <PropRow
                prop="planMonthly"
                type="number"
                doc="Mensalidade do plano, formatada via formatValue."
              />
              <PropRow
                prop="accumulated"
                type="number"
                doc="Variáveis acumuladas no ciclo, destacadas em --fg-primary."
              />
              <PropRow
                prop="discount"
                type="number"
                def="0"
                doc="Desconto do ciclo. A linha de desconto (accent-success) só aparece quando > 0."
              />
              <PropRow
                prop="headerAction"
                type="React.ReactNode"
                doc="Slot do canto superior direito do header (ex.: chip de método de pagamento)."
              />
              <PropRow
                prop="actions"
                type="React.ReactNode"
                doc="Slot do rodapé. Quando ausente, o rodapé não é renderizado."
              />
              <PropRow
                prop="formatValue"
                type="(n: number) => string"
                def="Intl pt-BR BRL"
                doc="Formata os valores monetários do card."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Mergeado nas classes do AwCard raiz. Demais props HTML são espalhadas (...rest)."
              />
            </ApiTable>

            <CodeExample label="exemplo" lang="tsx">
              {`<AwInvoiceSummaryCard
  total={1341}
  dueAt="19/06/2026"
  daysUntil={31}
  planName="Pro"
  planMonthly={499}
  accumulated={842}
  discount={120}
  headerAction={<PaymentChip brand="Visa" last4="3012" />}
  actions={
    <AwButton variant="secondary" size="sm">
      Adiantar pagamento
    </AwButton>
  }
/>`}
            </CodeExample>
          </Section>
        </div>
      </div>
    </>
  )
}
