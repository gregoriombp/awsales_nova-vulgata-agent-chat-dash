import { AwInvoiceRow } from "@/components/ui/AwInvoiceRow"
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

export default function InvoiceRowPage() {
  return (
    <>
      <PageHero title="Invoice Row">
        Linha clicável de fatura para listas de histórico e cobrança. Descrição
        com pill de status, subtexto <code className="mono">id · forma · data</code>,
        valor em <code className="mono">tabular-nums</code> e chevron. Renderiza
        um <code className="mono">&lt;button&gt;</code> puro — o consumidor
        coloca numa lista.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="basic"
            title="Uso padrão"
            lead="Cada status tem um variant de pill e um rótulo de data próprios. Empilhe as linhas num <ul> com divisores — o componente não impõe contêiner."
          >
            <Stage
              label="Lista de faturas — uma de cada status"
              gridClassName="block w-full"
            >
              <ul className="m-0 flex w-full flex-col divide-y divide-(--border-subtle) p-0">
                <li className="list-none">
                  <AwInvoiceRow
                    description="Plano Pro — Junho 2026"
                    status="Paga"
                    id="INV-2026-0612"
                    paymentMethod="Visa •• 4242"
                    dueAt="12/06/2026"
                    paidAt="10/06/2026"
                    net={349.9}
                  />
                </li>
                <li className="list-none">
                  <AwInvoiceRow
                    description="Plano Pro — Maio 2026"
                    status="Em aberto"
                    id="INV-2026-0512"
                    paymentMethod="Boleto bancário"
                    dueAt="20/06/2026"
                    net={349.9}
                  />
                </li>
                <li className="list-none">
                  <AwInvoiceRow
                    description="Add-on WhatsApp — Maio 2026"
                    status="Em atraso"
                    id="INV-2026-0508"
                    paymentMethod="Pix"
                    dueAt="05/06/2026"
                    net={89.0}
                  />
                </li>
                <li className="list-none">
                  <AwInvoiceRow
                    description="Plano Pro — Abril 2026"
                    status="Falha no Pagamento"
                    id="INV-2026-0412"
                    paymentMethod="Mastercard •• 1881"
                    dueAt="12/04/2026"
                    net={349.9}
                  />
                </li>
                <li className="list-none">
                  <AwInvoiceRow
                    description="Créditos extras — Março 2026"
                    status="Disputada"
                    id="INV-2026-0331"
                    paymentMethod="Visa •• 4242"
                    dueAt="31/03/2026"
                    net={120.0}
                  />
                </li>
              </ul>
            </Stage>
          </Section>

          <Section
            id="date-label"
            title="Rótulo de data"
            lead='O subtexto deriva a data sozinho: "Paga em {paidAt}" quando há pagamento; "Venceu em {dueAt}" para Em atraso/Falha no Pagamento; senão "Vence em {dueAt}".'
          >
            <Stage
              label="paidAt presente · vencida · a vencer"
              gridClassName="block w-full"
            >
              <ul className="m-0 flex w-full flex-col divide-y divide-(--border-subtle) p-0">
                <li className="list-none">
                  <AwInvoiceRow
                    description="Paga — usa paidAt"
                    status="Paga"
                    id="INV-2026-0612"
                    paymentMethod="Visa •• 4242"
                    dueAt="12/06/2026"
                    paidAt="10/06/2026"
                    net={349.9}
                  />
                </li>
                <li className="list-none">
                  <AwInvoiceRow
                    description="Em atraso — usa dueAt como vencido"
                    status="Em atraso"
                    id="INV-2026-0508"
                    paymentMethod="Pix"
                    dueAt="05/06/2026"
                    net={89.0}
                  />
                </li>
                <li className="list-none">
                  <AwInvoiceRow
                    description="Em aberto — usa dueAt a vencer"
                    status="Em aberto"
                    id="INV-2026-0512"
                    paymentMethod="Boleto bancário"
                    dueAt="20/06/2026"
                    net={349.9}
                  />
                </li>
              </ul>
            </Stage>
          </Section>

          <Section
            id="format-value"
            title="Moeda customizada"
            lead="Por padrão o valor sai em Intl pt-BR / BRL. Passe formatValue para outra moeda, locale ou formatação."
          >
            <Stage
              label="default (BRL) · formatValue → USD"
              gridClassName="block w-full"
            >
              <ul className="m-0 flex w-full flex-col divide-y divide-(--border-subtle) p-0">
                <li className="list-none">
                  <AwInvoiceRow
                    description="Default — Intl pt-BR / BRL"
                    status="Paga"
                    id="INV-2026-0612"
                    paymentMethod="Visa •• 4242"
                    dueAt="12/06/2026"
                    paidAt="10/06/2026"
                    net={349.9}
                  />
                </li>
                <li className="list-none">
                  <AwInvoiceRow
                    description="formatValue — en-US / USD"
                    status="Paga"
                    id="INV-2026-0612-US"
                    paymentMethod="Visa •• 4242"
                    dueAt="12/06/2026"
                    paidAt="10/06/2026"
                    net={69.0}
                    formatValue={(v) =>
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(v)
                    }
                  />
                </li>
              </ul>
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Componente desacoplado de Financeiro. Aceita className e ...rest (mergeados no <button>). onOpen dispara no click/Enter/Espaço."
          >
            <ApiTable>
              <PropRow
                prop="description"
                type="string"
                doc="Descrição principal da fatura, à esquerda, antes do pill."
              />
              <PropRow
                prop="status"
                type="AwInvoiceStatus"
                doc='"Paga" | "Em aberto" | "Em atraso" | "Falha no Pagamento" | "Disputada". Define o variant do pill e o rótulo de data.'
              />
              <PropRow
                prop="id"
                type="string"
                doc="Identificador da fatura, primeiro segmento do subtexto."
              />
              <PropRow
                prop="paymentMethod"
                type="string"
                doc="Forma de pagamento, segundo segmento do subtexto."
              />
              <PropRow
                prop="dueAt"
                type="string"
                doc="Data de vencimento já formatada. Usada quando não há paidAt."
              />
              <PropRow
                prop="paidAt"
                type="string"
                def="—"
                doc='Data de pagamento já formatada. Presente → rótulo vira "Paga em {paidAt}".'
              />
              <PropRow
                prop="net"
                type="number"
                doc="Valor líquido, à direita. Formatado por formatValue."
              />
              <PropRow
                prop="onOpen"
                type="() => void"
                def="—"
                doc="Disparado ao acionar a linha (click ou teclado)."
              />
              <PropRow
                prop="formatValue"
                type="(value: number) => string"
                def="Intl pt-BR / BRL"
                doc="Formata o valor exibido. Sobrescreva para outra moeda/locale."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Mergeado via cn() nas classes do <button> raiz."
              />
              <PropRow
                prop="...rest"
                type="ButtonHTMLAttributes"
                doc="Demais atributos do <button> (aria-*, disabled, etc.)."
              />
            </ApiTable>

            <CodeExample label="exemplo" lang="tsx">
              {`<ul className="divide-y divide-(--border-subtle)">
  <li className="list-none">
    <AwInvoiceRow
      description="Plano Pro — Junho 2026"
      status="Paga"
      id="INV-2026-0612"
      paymentMethod="Visa •• 4242"
      dueAt="12/06/2026"
      paidAt="10/06/2026"
      net={349.9}
      onOpen={() => openInvoice("INV-2026-0612")}
    />
  </li>
</ul>`}
            </CodeExample>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Grid de três colunas [1fr_auto_auto]. Tokens lidos via CSS variables — nada hardcoded."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Spec
                k="container"
                v="<button type='button'>"
                d="Linha inteira clicável; sem <li> embutido — o consumidor compõe a lista."
              />
              <Spec
                k="grid"
                v="grid-cols-[1fr_auto_auto]"
                d="Descrição (flex) · valor (auto) · chevron (auto)."
              />
              <Spec
                k="status"
                v="AwPillVariant"
                d="Paga→live · Em aberto→draft · Em atraso→warning · Falha no Pagamento→warning · Disputada→beta."
              />
              <Spec
                k="hover"
                v="--bg-hover"
                d="Fundo no hover; chevron desliza 0.5 via group-hover."
              />
              <Spec
                k="focus"
                v="ring-2 · --accent-brand"
                d="Anel focus-visible para navegação por teclado."
              />
              <Spec
                k="valor"
                v="--fg-primary · tabular-nums"
                d="Dígitos alinhados verticalmente em listas de faturas."
              />
            </div>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Empilhe as linhas num <code className="mono">&lt;ul&gt;</code> com divisores entre elas.</>,
                <>Passe datas já formatadas em <code className="mono">dueAt</code>/<code className="mono">paidAt</code> — o componente só monta o rótulo.</>,
                <>Use <code className="mono">formatValue</code> para moedas fora do BRL.</>,
              ]}
              donts={[
                <>Não embrulhe em outro <code className="mono">&lt;button&gt;</code> ou link — a linha já é clicável.</>,
                <>Não derive o status de strings cruas — use o union <code className="mono">AwInvoiceStatus</code>.</>,
                <>Não recrie o pill de status fora do componente; ele já mapeia status→variant.</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
