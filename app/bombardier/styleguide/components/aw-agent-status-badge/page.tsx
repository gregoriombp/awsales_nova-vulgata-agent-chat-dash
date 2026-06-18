import { AwAgentStatusBadge } from "@/components/ui/AwAgentStatusBadge"
import {
  PageHero,
  Section,
  Stage,
  ApiTable,
  PropRow,
  CodeExample,
  DoDont,
} from "../../_primitives"

export default function AgentStatusBadgePage() {
  return (
    <>
      <PageHero title="Agent status badge">
        O estado do ciclo de vida de um agente — rascunho, treinando, pronto,
        pausado, erro. Usado no Agent Studio, em listas de agentes e cabeçalhos.
        Sem border stroke, ícone em fill, tint por token; “treinando” anima. Em
        erro, o motivo aparece no tooltip.
      </PageHero>

      <div className="max-w-3xl mx-auto px-10 pb-14 flex flex-col gap-16">
        <Section
          id="status"
          title="Estados"
          lead="Cinco estados do ciclo de vida. Cada um carrega ícone e cor próprios; 'treinando' tem o ícone animado."
        >
          <Stage label="status" gridClassName="flex flex-wrap items-center gap-3">
            <AwAgentStatusBadge status="draft" />
            <AwAgentStatusBadge status="training" />
            <AwAgentStatusBadge status="ready" />
            <AwAgentStatusBadge status="paused" />
            <AwAgentStatusBadge status="error" reason="Falha ao conectar o modelo base." />
          </Stage>
        </Section>

        <Section
          id="sizes"
          title="Tamanhos"
          lead="sm para linhas de lista densas; md (default) para cabeçalhos e cards."
        >
          <Stage label="size · sm / md" gridClassName="flex flex-wrap items-center gap-3">
            <AwAgentStatusBadge status="ready" size="sm" />
            <AwAgentStatusBadge status="ready" size="md" />
            <AwAgentStatusBadge status="training" size="sm" />
            <AwAgentStatusBadge status="training" size="md" />
          </Stage>
        </Section>

        <Section
          id="contexto"
          title="Em contexto"
          lead="Ao lado do nome do agente, numa linha de lista. O label pode ser sobrescrito (ex.: 'Ativo' no lugar de 'Pronto')."
        >
          <Stage label="lista de agentes" gridClassName="flex flex-col gap-2 max-w-[460px]">
            {[
              { name: "Triagem · Suporte", status: "ready" as const, label: "Ativo" },
              { name: "Cobrança", status: "training" as const, label: undefined },
              { name: "Pós-venda", status: "draft" as const, label: undefined },
              {
                name: "Agendamento",
                status: "error" as const,
                label: undefined,
                reason: "Integração do Google Calendar expirou.",
              },
            ].map((a) => (
              <div
                key={a.name}
                className="flex items-center justify-between gap-3 rounded-lg bg-(--bg-raised) px-4 py-3"
              >
                <span className="text-sm font-medium text-(--fg-primary)">
                  {a.name}
                </span>
                <AwAgentStatusBadge
                  status={a.status}
                  label={a.label}
                  reason={a.reason}
                  size="sm"
                />
              </div>
            ))}
          </Stage>
        </Section>

        <Section
          id="api"
          title="API"
          lead='Import: import { AwAgentStatusBadge } from "@/components/ui/AwAgentStatusBadge".'
        >
          <ApiTable>
            <PropRow
              prop="status"
              type='"draft" | "training" | "ready" | "paused" | "error"'
              doc="Estado do ciclo de vida; define ícone, cor e animação."
            />
            <PropRow
              prop="label"
              type="ReactNode"
              doc="Sobrescreve o rótulo padrão (ex.: 'Ativo')."
            />
            <PropRow
              prop="reason"
              type="string"
              doc="Motivo do erro — tooltip nativo quando status='error'."
            />
            <PropRow
              prop="size"
              type='"sm" | "md"'
              def='"md"'
              doc="sm para listas densas."
            />
          </ApiTable>
          <CodeExample>{`<AwAgentStatusBadge status="training" />
<AwAgentStatusBadge status="ready" label="Ativo" />
<AwAgentStatusBadge status="error" reason="Modelo base indisponível." size="sm" />`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Use no Agent Studio, listas de agentes e cabeçalhos.</>,
              <>Passe reason em erro — o usuário precisa saber o porquê.</>,
              <>Sobrescreva o label quando o produto usar outra palavra.</>,
            ]}
            donts={[
              <>Usar para status genérico de item (isso é AwPill/AwStatusDot).</>,
              <>Adicionar border stroke — o tint de fundo já separa.</>,
              <>Inventar cores — o estado define a cor.</>,
            ]}
          />
        </Section>
      </div>
    </>
  )
}
