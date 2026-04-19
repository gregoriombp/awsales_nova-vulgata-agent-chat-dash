import { AwAlert } from "@/components/ui/AwAlert"
import {
  PageHero,
  Section,
  Stage,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
} from "../../_primitives"

export default function AlertsPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-10 py-14">
      <PageHero title="Alertas">
        Mensagens contextuais <strong>inline</strong>. Sempre próximas do
          conteúdo a que se referem. Nunca como toast — para toast, use o
          componente próprio.
      </PageHero>

      <div className="flex flex-col gap-16">
        <Section
          id="variants"
          title="Variantes"
          lead="Quatro variantes. Cada uma tem ícone e cor de borda semântica; o fundo é uma tinta muito sutil dessa mesma cor."
        >
          <Stage
            label="info · success · warning · danger"
            gridClassName="flex flex-col gap-3 max-w-[560px]"
          >
            <AwAlert
              variant="info"
              title="Nova versão do modelo base disponível."
            >
              Upgrade para gpt-4.1 reduz latência em 30% e não afeta o
              comportamento treinado.
            </AwAlert>
            <AwAlert
              variant="success"
              title="Agente publicado em 2 canais."
            >
              Web widget e WhatsApp já recebem conversas reais.
            </AwAlert>
            <AwAlert
              variant="warning"
              title="2 intenções sem resposta."
            >
              Publicar mesmo assim usará fallback. Revisar antes é recomendado.
            </AwAlert>
            <AwAlert
              variant="danger"
              title="Webhook do Salesforce falhou 4 vezes nas últimas 2h."
            >
              O agente está usando cache. Verifique a integração.
            </AwAlert>
          </Stage>
        </Section>

        <Section
          id="no-title"
          title="Sem título"
          lead="Para mensagens de uma linha, o título é opcional. O corpo continua com ícone."
        >
          <Stage
            label="apenas body"
            gridClassName="flex flex-col gap-3 max-w-[560px]"
          >
            <AwAlert variant="info">
              Agente pausado. Reative no painel de controle.
            </AwAlert>
            <AwAlert variant="success">
              Sincronização concluída · 284 documentos.
            </AwAlert>
            <AwAlert variant="danger">
              Erro ao carregar fontes. Tente novamente em alguns minutos.
            </AwAlert>
          </Stage>
        </Section>

        <Section
          id="custom-icon"
          title="Ícone customizado"
          lead="Qualquer glyph Material Symbols pode sobrescrever o ícone padrão via prop icon."
        >
          <Stage
            label="icon override"
            gridClassName="flex flex-col gap-3 max-w-[560px]"
          >
            <AwAlert variant="info" icon="auto_awesome" title="Agente aprendendo.">
              31% das últimas conversas foram usadas para fine-tuning.
            </AwAlert>
            <AwAlert variant="warning" icon="bolt" title="Latência elevada.">
              Resposta média em 4.2s. Verifique o modelo configurado.
            </AwAlert>
          </Stage>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Todos os valores vêm de tokens. A cor da borda intensifica a semântica sem sobrecarregar."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec k="padding" v="14 · 16" d="Vertical · horizontal." />
            <Spec
              k="radius"
              v="--radius-md · 8px"
              d="Alinhado com inputs e botões."
            />
            <Spec
              k="icon size"
              v="20 px"
              d="Nunca ajustar ad hoc — afeta alinhamento do body."
            />
            <Spec
              k="border"
              v="1px · cor semântica"
              d="info=blue · success=emerald · warning=amber · danger=red."
            />
            <Spec
              k="background"
              v="tinta 100 da variante"
              d="Sempre o tom mais sutil da escala semântica."
            />
            <Spec
              k="max-width"
              v="560 px"
              d="Alertas densos perdem escaneabilidade — quebrar, não esticar."
            />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwAlert } from "@/components/ui/AwAlert".`}
        >
          <ApiTable>
            <PropRow
              prop="variant"
              type='"info" | "success" | "warning" | "danger"'
              def='"info"'
              doc="Cor de borda, fundo e ícone padrão."
            />
            <PropRow
              prop="title"
              type="ReactNode"
              doc="Título em negrito acima do body. Opcional."
            />
            <PropRow
              prop="icon"
              type="string"
              doc="Nome de glyph Material Symbols; sobrescreve o default da variante."
            />
            <PropRow
              prop="children"
              type="ReactNode"
              doc="Corpo da mensagem. Mantenha curto — 1 a 3 frases."
            />
          </ApiTable>
          <CodeExample>{`import { AwAlert } from "@/components/ui/AwAlert"

<AwAlert variant="warning" title="2 intenções sem resposta.">
  Publicar mesmo assim usará fallback. Revisar antes é recomendado.
</AwAlert>

<AwAlert variant="danger">
  Falha ao sincronizar. Tente novamente.
</AwAlert>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Alerta inline, próximo do conteúdo que o originou.</>,
              <>Título curto, direto ao estado. Body explica a consequência.</>,
              <>Danger sempre com ação disponível abaixo para remediar.</>,
            ]}
            donts={[
              <>Alerta como toast — existe um componente próprio.</>,
              <>Parágrafos longos dentro do alerta.</>,
              <>Empilhar 3+ alerts — vira ruído; priorize o mais crítico.</>,
            ]}
          />
        </Section>
      </div>
    </div>
  )
}
