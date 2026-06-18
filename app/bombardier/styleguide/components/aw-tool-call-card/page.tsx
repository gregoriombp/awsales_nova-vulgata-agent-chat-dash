import { AwToolCallCard } from "@/components/ui/AwToolCallCard"
import {
  PageHero,
  Section,
  Stage,
  ApiTable,
  PropRow,
  CodeExample,
  DoDont,
} from "../../_primitives"

const STACK = "flex flex-col gap-3 items-stretch"

export default function ToolCallCardPage() {
  return (
    <>
      <PageHero title="Tool call card">
        Mostra uma chamada de tool/integração feita por um agente — nome,
        status da execução e os painéis de entrada e saída colapsáveis. É o
        bloco que responde “o que o agente fez?” dentro do chat ou de um{" "}
        <a
          href="/bombardier/styleguide/components/aw-agent-run-trace"
          className="underline underline-offset-2"
        >
          Agent run trace
        </a>
        . Compõe Icon + AwPill + AwBrandLogo.
      </PageHero>

      <div className="max-w-3xl mx-auto px-10 pb-14 flex flex-col gap-16">
        <Section
          id="status"
          title="Status"
          lead="Quatro estados da execução. O badge usa AwPill (na fila / executando / concluído / erro)."
        >
          <Stage label="status" gridClassName={STACK}>
            <AwToolCallCard tool="buscar_cliente" status="pending" />
            <AwToolCallCard tool="buscar_cliente" status="running" />
            <AwToolCallCard
              tool="buscar_cliente"
              status="success"
              durationMs={840}
            />
            <AwToolCallCard tool="buscar_cliente" status="error" />
          </Stage>
        </Section>

        <Section
          id="entrada-saida"
          title="Entrada e saída"
          lead="Passe input/output como string (vira bloco de código mono) ou como nó custom. defaultOpen abre expandido."
        >
          <Stage label="success · expandido" gridClassName={STACK}>
            <AwToolCallCard
              tool="@aop.AgendarReuniao"
              icon="event"
              status="success"
              durationMs={1240}
              defaultOpen
              input={`{
  "lead": "Marina Alves",
  "janela": "2026-06-20T14:00:00-03:00"
}`}
              output={`{
  "evento_id": "evt_9af2",
  "status": "confirmado"
}`}
            />
          </Stage>
          <div className="h-3" />
          <Stage label="error · com mensagem" gridClassName={STACK}>
            <AwToolCallCard
              tool="@aop.Reembolso"
              icon="payments"
              status="error"
              durationMs={530}
              input={`{ "pedido": "#48213", "valor": 268.49 }`}
              error="Pedido fora da janela de reembolso (90 dias). Encaminhe ao financeiro."
            />
          </Stage>
        </Section>

        <Section
          id="integracao"
          title="Tool de integração (brand)"
          lead="Quando a tool é uma integração de terceiro, passe brand= para puxar a logo do AwBrandLogo no lugar do ícone."
        >
          <Stage label="brand" gridClassName={STACK}>
            <AwToolCallCard
              tool="pipedrive.criarNegocio"
              brand="pipedrive"
              status="success"
              durationMs={620}
              defaultOpen
              output={`{ "deal_id": 70148, "stage": "Proposta" }`}
            />
            <AwToolCallCard
              tool="googlecal.criarEvento"
              brand="googlecal"
              status="running"
            />
          </Stage>
        </Section>

        <Section
          id="api"
          title="API"
          lead='Import: import { AwToolCallCard } from "@/components/ui/AwToolCallCard".'
        >
          <ApiTable>
            <PropRow prop="tool" type="string" doc="Nome da tool/função chamada." />
            <PropRow
              prop="status"
              type='"pending" | "running" | "success" | "error"'
              doc="Estado da execução; define o badge AwPill."
            />
            <PropRow
              prop="icon"
              type="string"
              def='"bolt"'
              doc="Ícone Material Symbols (ignorado se brand for passado)."
            />
            <PropRow
              prop="brand"
              type="string"
              doc="Id de brand (AwBrandLogo) p/ tools de integração."
            />
            <PropRow
              prop="durationMs"
              type="number"
              doc="Latência da execução; formatada (ms / s)."
            />
            <PropRow
              prop="input / output"
              type="ReactNode"
              doc="String vira bloco de código mono; nó é renderizado cru."
            />
            <PropRow
              prop="error"
              type="string"
              doc="Mensagem exibida quando status='error'."
            />
            <PropRow
              prop="defaultOpen"
              type="boolean"
              def="erro ? true : false"
              doc="Começa expandido."
            />
          </ApiTable>
          <CodeExample>{`<AwToolCallCard
  tool="@aop.AgendarReuniao"
  icon="event"
  status="success"
  durationMs={1240}
  input={JSON.stringify(args, null, 2)}
  output={JSON.stringify(result, null, 2)}
/>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Use dentro do chat ou aninhado num Agent run trace.</>,
              <>Passe brand= quando a tool for integração de terceiro.</>,
              <>Mostre input/output para dar transparência à execução.</>,
            ]}
            donts={[
              <>Usar para o raciocínio passo a passo (isso é AwThinkingSteps).</>,
              <>Despejar payloads gigantes sem colapsar — o card já fecha por padrão.</>,
              <>Recolorir o status na mão — use o estado certo.</>,
            ]}
          />
        </Section>
      </div>
    </>
  )
}
