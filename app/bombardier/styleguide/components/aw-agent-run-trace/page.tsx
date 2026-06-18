import { AwAgentRunTrace } from "@/components/ui/AwAgentRunTrace"
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

const STACK = "flex flex-col gap-0 items-stretch"

export default function AgentRunTracePage() {
  return (
    <>
      <PageHero title="Agent run trace">
        Linha do tempo de alto nível de uma execução de agente — checkpoints,
        chamadas de tool, decisões e handoffs num único trilho. Onde o{" "}
        <a
          href="/bombardier/styleguide/components/aw-thinking-steps"
          className="underline underline-offset-2"
        >
          Thinking steps
        </a>{" "}
        mostra o raciocínio, este mostra o <em>arco</em> da run. Cada passo pode
        embutir um{" "}
        <a
          href="/bombardier/styleguide/components/aw-tool-call-card"
          className="underline underline-offset-2"
        >
          Tool call card
        </a>
        .
      </PageHero>

      <div className="max-w-3xl mx-auto px-10 pb-14 flex flex-col gap-16">
        <Section
          id="run"
          title="Run completa"
          lead="Um atendimento ponta a ponta: recebe a mensagem, busca o cliente (tool aninhada), decide e responde."
        >
          <Stage label="trace + tool call aninhado" gridClassName={STACK}>
            <AwAgentRunTrace
              steps={[
                {
                  kind: "message",
                  title: "Mensagem recebida",
                  detail: "“Quero remarcar minha reunião de amanhã.”",
                  durationMs: 120,
                },
                {
                  kind: "tool",
                  title: "Consultou a agenda",
                  durationMs: 840,
                  children: (
                    <AwToolCallCard
                      tool="googlecal.listarEventos"
                      brand="googlecal"
                      status="success"
                      durationMs={840}
                      output={`[{ "id": "evt_9af2", "inicio": "2026-06-18T14:00" }]`}
                    />
                  ),
                },
                {
                  kind: "decision",
                  title: "Decidiu remarcar",
                  detail: "Evento encontrado e dentro da política de remarcação.",
                },
                {
                  kind: "tool",
                  title: "Remarcou o evento",
                  durationMs: 1240,
                  children: (
                    <AwToolCallCard
                      tool="@aop.AgendarReuniao"
                      icon="event"
                      status="success"
                      durationMs={1240}
                      output={`{ "evento_id": "evt_9af2", "status": "confirmado" }`}
                    />
                  ),
                },
                {
                  kind: "end",
                  title: "Respondeu ao cliente",
                  detail: "Confirmação enviada por WhatsApp.",
                },
              ]}
            />
          </Stage>
        </Section>

        <Section
          id="estados"
          title="Tipos de passo e estados"
          lead="kind define o ícone (checkpoint, tool, decision, handoff, message, end); status define a cor do nó (done, active, error, pending). active anima."
        >
          <Stage label="kinds + status" gridClassName={STACK}>
            <AwAgentRunTrace
              steps={[
                { kind: "checkpoint", title: "Checkpoint atingido", status: "done", durationMs: 60 },
                {
                  kind: "handoff",
                  title: "Handoff para humano",
                  detail: "Confiança baixa — escalou para a equipe.",
                  status: "done",
                },
                {
                  kind: "tool",
                  title: "Executando integração…",
                  status: "active",
                },
                {
                  kind: "decision",
                  title: "Falha na decisão",
                  detail: "Dados insuficientes para concluir.",
                  status: "error",
                },
                { kind: "end", title: "Encerrar", status: "pending" },
              ]}
            />
          </Stage>
        </Section>

        <Section
          id="api"
          title="API"
          lead='Import: import { AwAgentRunTrace, type AwAgentRunStep } from "@/components/ui/AwAgentRunTrace".'
        >
          <ApiTable>
            <PropRow
              prop="steps"
              type="AwAgentRunStep[]"
              doc="Os passos da run, em ordem."
            />
            <PropRow
              prop="step.kind"
              type='"checkpoint" | "tool" | "decision" | "handoff" | "message" | "end"'
              doc="Define o ícone do nó."
            />
            <PropRow
              prop="step.status"
              type='"done" | "active" | "error" | "pending"'
              def='"done"'
              doc="Cor do nó; active vira spinner."
            />
            <PropRow prop="step.title" type="string" doc="Título do passo." />
            <PropRow prop="step.detail" type="string" doc="Linha de apoio, opcional." />
            <PropRow
              prop="step.durationMs"
              type="number"
              doc="Latência do passo, formatada."
            />
            <PropRow
              prop="step.children"
              type="ReactNode"
              doc="Conteúdo aninhado — ex.: um AwToolCallCard."
            />
          </ApiTable>
          <CodeExample>{`<AwAgentRunTrace
  steps={[
    { kind: "message", title: "Mensagem recebida" },
    { kind: "tool", title: "Consultou a agenda",
      children: <AwToolCallCard tool="googlecal.listarEventos" brand="googlecal" status="success" /> },
    { kind: "end", title: "Respondeu", status: "active" },
  ]}
/>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Use para o arco da run (passos de alto nível).</>,
              <>Aninhe um AwToolCallCard num passo do tipo tool.</>,
              <>Marque o passo corrente com status="active".</>,
            ]}
            donts={[
              <>Detalhar token-a-token o raciocínio — isso é AwThinkingSteps.</>,
              <>Misturar com AwThinkingSteps no mesmo bloco.</>,
              <>Inventar cores de nó — use o status.</>,
            ]}
          />
        </Section>
      </div>
    </>
  )
}
