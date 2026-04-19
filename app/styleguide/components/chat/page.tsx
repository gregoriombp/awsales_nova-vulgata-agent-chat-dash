import { AwChatBubble } from "@/components/ui/AwChatBubble"
import {
  Section,
  Stage,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
} from "../../_primitives"

export default function ChatPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-10 py-14">
      <header className="mb-14">
        <h1 className="m-0">Chat bubbles</h1>
        <p className="text-[var(--body-lg-size)] text-[var(--fg-secondary)] mt-4 max-w-2xl leading-relaxed">
          Bolhas de conversa do agente e do usuário. A bolha do usuário é
          preta cheia (<code className="mono">--fg-primary</code>), a do
          agente usa a superfície sutil. Streaming exibe três pontos pulsando
          a 1.2s.
        </p>
      </header>

      <div className="flex flex-col gap-16">
        <Section
          id="variants"
          title="Variantes"
          lead="Duas variantes: user e agent. O agente carrega avatar inline à esquerda; o usuário alinha à direita sem avatar."
        >
          <Stage
            label="agent · user"
            gridClassName="flex flex-col gap-4 max-w-[680px]"
          >
            <AwChatBubble variant="agent" timestamp="14:32" avatar=".aw">
              Olá Gregório. Detectei quatro conversas pendentes em SLA — quer
              que eu proponha um trigger de fallback?
            </AwChatBubble>
            <AwChatBubble variant="user" timestamp="14:33">
              Sim, mostra um exemplo.
            </AwChatBubble>
            <AwChatBubble variant="agent" timestamp="14:33" avatar=".aw">
              Criei um rascunho em <em>triggers/fallback-sla</em>. Disparo:
              tempo de resposta &gt; 15 min. Ação: notificar N2 via Slack.
            </AwChatBubble>
            <AwChatBubble variant="user" timestamp="14:34">
              Publica.
            </AwChatBubble>
          </Stage>
        </Section>

        <Section
          id="streaming"
          title="Streaming"
          lead="Durante a geração o agente mostra três dots pulsando dentro da própria bolha. Nunca usar fora dela — streaming é exclusivo de agente."
        >
          <Stage
            label="streaming · agent only"
            gridClassName="flex flex-col gap-4 max-w-[680px]"
          >
            <AwChatBubble variant="agent" streaming avatar=".aw">
              Analisando as últimas 24 horas
            </AwChatBubble>
            <AwChatBubble variant="agent" streaming avatar=".aw">
              Procurando padrões em 1.486 conversas
            </AwChatBubble>
          </Stage>
        </Section>

        <Section
          id="long-content"
          title="Conteúdo longo"
          lead="Bolhas respeitam max-width 520px — conteúdo longo quebra. Manter parágrafos curtos: o agente é direto, não prolixo."
        >
          <Stage
            label="user com pergunta longa · agent com explicação"
            gridClassName="flex flex-col gap-4 max-w-[680px]"
          >
            <AwChatBubble variant="user" timestamp="agora">
              Explica como funciona o trigger de fallback quando tem mais de
              um agente assinando o mesmo canal do WhatsApp. Já tentei
              configurar antes e só um recebe.
            </AwChatBubble>
            <AwChatBubble variant="agent" timestamp="agora" avatar=".aw">
              Canal só pode ter um agente ativo de cada vez — por isso o
              comportamento que você viu. Para multi-agente, a saída é um
              <strong> roteador </strong>: um agente triagem recebe 100%,
              classifica intenção e delega via <em>tool call</em> para os
              agentes especializados. Quer que eu gere um template?
            </AwChatBubble>
          </Stage>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Tokens vêm todos de globals.css. O único elemento com cor própria é a bolha do usuário (sempre --fg-primary)."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="max width"
              v="520 px"
              d="Conteúdo nunca ultrapassa. Row externo limita em 680."
            />
            <Spec
              k="padding"
              v="12px 16px"
              d="Interno consistente."
            />
            <Spec
              k="radius"
              v="--radius-lg · 12px"
              d="Canto do lado “de origem” vai pra 4px — tail simbólico."
            />
            <Spec
              k="user bg"
              v="--fg-primary"
              d="Preto sólido no light, branco no dark."
            />
            <Spec
              k="agent bg"
              v="--bg-surface + 1px --border-subtle"
              d="Superfície mais sutil do sistema."
            />
            <Spec
              k="streaming"
              v="3 dots · 1.2s · 0.15s stagger"
              d="Pulsa dentro da bolha, sem container próprio."
            />
            <Spec
              k="avatar"
              v="24 px redondo"
              d="Iniciais ou glyph. Só em bubble de agente."
            />
            <Spec
              k="timestamp"
              v="11px --fg-tertiary"
              d="Abaixo do conteúdo, formato livre (HH:MM · agora · 2min)."
            />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwChatBubble } from "@/components/ui/AwChatBubble".`}
        >
          <ApiTable>
            <PropRow
              prop="variant"
              type='"user" | "agent"'
              doc="Define alinhamento, cor e presença do avatar."
            />
            <PropRow
              prop="streaming"
              type="boolean"
              def="false"
              doc="Mostra três dots pulsando. Válido só em agent."
            />
            <PropRow
              prop="avatar"
              type="ReactNode"
              doc="Iniciais, emoji-monochrome ou glyph. Agent only."
            />
            <PropRow
              prop="timestamp"
              type="string"
              doc="Texto livre — normalmente HH:MM ou um “agora”/“2min”."
            />
            <PropRow
              prop="children"
              type="ReactNode"
              doc="Conteúdo da mensagem. Pode conter <strong> / <em>."
            />
          </ApiTable>

          <CodeExample>{`import { AwChatBubble } from "@/components/ui/AwChatBubble"

<AwChatBubble variant="user" timestamp="14:33">
  Me dá um resumo dos últimos 7 dias.
</AwChatBubble>

<AwChatBubble variant="agent" avatar=".aw" streaming>
  Consolidando 1.486 conversas
</AwChatBubble>

<AwChatBubble variant="agent" avatar=".aw" timestamp="14:34">
  74% deflecção, +2 pts vs. semana anterior.
</AwChatBubble>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Streaming apenas enquanto o modelo está realmente gerando.</>,
              <>Agente direto, parágrafos curtos, números explícitos.</>,
              <>Timestamp simples — 14:32, “agora”, “há 2 min”.</>,
            ]}
            donts={[
              <>Avatar no usuário — o usuário é quem escreve, não precisa se ver.</>,
              <>Bolha com shadow ou gradiente “dando vida”.</>,
              <>Agente exclamativo ou efusivo (“Claro!!! Já vou analisar 🎉”).</>,
            ]}
          />
        </Section>
      </div>
    </div>
  )
}
