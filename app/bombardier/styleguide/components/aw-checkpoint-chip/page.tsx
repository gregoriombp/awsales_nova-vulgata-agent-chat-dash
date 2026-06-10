import { AwCheckpointChip } from "@/components/ui/AwCheckpointChip"
import {
  ApiTable,
  CodeExample,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

export default function AwCheckpointChipPage() {
  return (
    <>
      <PageHero title="Checkpoint chip">
        Chip inline usado no editor de checkpoints para tools, variáveis e
        rótulos estruturais como objetivo, marcação e regra. Ele é mais
        espaçado que uma pill de status e mantém radius constante no documento,
        no painel lateral e na visualização modular.
      </PageHero>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-16 px-10 pb-14">
        <Section
          id="variants"
          title="Variantes"
          lead="Os tons vêm dos grupos de skills existentes. Neutral cobre variáveis; inverse cobre rótulos de estrutura."
        >
          <Stage label="Tools, variável e estrutura">
            <AwCheckpointChip tone="teal" icon="graphic_eq">
              Pensar em voz alta
            </AwCheckpointChip>
            <AwCheckpointChip tone="purple" icon="arrow_forward">
              Ir para etapa
            </AwCheckpointChip>
            <AwCheckpointChip tone="blue" brand="googlecal">
              Criar evento
            </AwCheckpointChip>
            <AwCheckpointChip tone="neutral" icon="data_object">
              nome_do_lead
            </AwCheckpointChip>
            <AwCheckpointChip tone="inverse" icon="target">
              Objetivo
            </AwCheckpointChip>
            <AwCheckpointChip tone="amber" icon="checklist">
              Marque
            </AwCheckpointChip>
          </Stage>
        </Section>

        <Section
          id="interactive"
          title="Interação"
          lead="Quando o chip abre propriedades ou insere conteúdo, use interactive para hover e foco visível."
        >
          <Stage label="Botões de inserção">
            <AwCheckpointChip as="button" tone="neutral" icon="data_object" interactive>
              email
            </AwCheckpointChip>
            <AwCheckpointChip as="button" tone="blue" brand="googlecal" interactive>
              Consultar disponibilidade
            </AwCheckpointChip>
            <AwCheckpointChip as="button" tone="purple" icon="alt_route" interactive>
              Regra
            </AwCheckpointChip>
          </Stage>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwCheckpointChip } from "@/components/ui/AwCheckpointChip".`}
        >
          <ApiTable>
            <PropRow
              prop="as"
              type='"span" | "button"'
              def='"span"'
              doc="Elemento raiz. Use button para chips acionáveis no painel."
            />
            <PropRow
              prop="tone"
              type='"neutral" | "inverse" | "teal" | "purple" | "amber" | "pink" | "blue"'
              def='"neutral"'
              doc="Tom visual do chip, mapeado aos tokens existentes."
            />
            <PropRow
              prop="icon"
              type="string"
              doc="Material Symbol exibido antes do label."
            />
            <PropRow
              prop="brand"
              type="string"
              doc="Brand key do AwBrandLogo. Use em integrações como Google Calendar."
            />
            <PropRow
              prop="interactive"
              type="boolean"
              doc="Aplica hover, cursor e foco visível."
            />
          </ApiTable>

          <CodeExample label="uso no editor" lang="tsx">
            {`<AwCheckpointChip tone="blue" brand="googlecal">
  Criar evento
</AwCheckpointChip>

<AwCheckpointChip as="button" tone="neutral" icon="data_object" interactive>
  nome_do_lead
</AwCheckpointChip>`}
          </CodeExample>
        </Section>
      </div>
    </>
  )
}
