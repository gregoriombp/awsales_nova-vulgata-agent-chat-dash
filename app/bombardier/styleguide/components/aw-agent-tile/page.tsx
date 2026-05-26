import { AwAgentTile } from "@/components/ui/AwAgentTile"
import { getOrbForAgent } from "@/lib/agentOrbs"
import {
  ApiTable,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

export default function AwAgentTilePage() {
  return (
    <>
      <PageHero title="Agent tile">
        Card de listagem de agente usado em <code>/agent-studio</code>. Orb do
        agente à esquerda (resolvido por <code>getOrbForAgent(id)</code>),
        título + descrição no corpo, autor e contador de uso no rodapé. O tile
        inteiro vira link quando recebe <code>href</code>.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="default"
            title="Uso padrão (com orb)"
            lead="Padrão da listagem do Agent Studio: orb do agente em estado ativo, derivado do id pra ficar estável entre sessões."
          >
            <Stage label="Grid de agentes do usuário">
              <div className="grid w-full max-w-[960px] grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-2">
                <AwAgentTile
                  avatarSrc={getOrbForAgent("sales")}
                  title="Agente de vendas"
                  description="Conduz qualificação de lead, agenda demo e mantém o pipeline atualizado no CRM."
                  authorName="Alex Smith"
                  count={12}
                  href="#"
                />
                <AwAgentTile
                  avatarSrc={getOrbForAgent("customer-support")}
                  title="Agente de suporte"
                  description="Resolve dúvidas sensíveis com empatia e escala pro humano quando bate o limite."
                  authorName="Bea Costa"
                  count={3}
                  href="#"
                />
                <AwAgentTile
                  avatarSrc={getOrbForAgent("hr")}
                  title="Agente de RH"
                  description="Tira dúvidas de políticas, conduz onboarding e direciona pra time certo."
                  authorName="Carlos Sun"
                  count={0}
                  href="#"
                />
                <AwAgentTile
                  avatarSrc={getOrbForAgent("research")}
                  title="Agente de research"
                  description="Sintetiza briefs de mercado, concorrentes e sinais de cliente em sumários compartilháveis."
                  authorName="Dani Rocha"
                  count={8}
                  href="#"
                />
              </div>
            </Stage>
          </Section>

          <Section
            id="fallback-icon"
            title="Fallback com ícone tonal"
            lead="Quando o agente ainda não tem orb atribuído (ex.: prévia de template antes da criação), use icon + tone como fallback."
          >
            <Stage label="Tiles com ícone Material + tom da paleta">
              <div className="grid w-full max-w-[960px] grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-2">
                <AwAgentTile
                  icon="show_chart"
                  tone="lime"
                  title="Template de vendas"
                  description="Modelo padrão pra começar — substitua pelo orb quando criar."
                  authorName="Sistema"
                  href="#"
                />
                <AwAgentTile
                  icon="support_agent"
                  tone="amber"
                  title="Template de suporte"
                  description="Modelo padrão pra começar — substitua pelo orb quando criar."
                  authorName="Sistema"
                  href="#"
                />
              </div>
            </Stage>
          </Section>

          <Section
            id="tones"
            title="Tons disponíveis"
            lead="Sete tons: lime, amber, emerald, blue, purple, pink, neutral. Use o mesmo tom em todas as instâncias de um agente pra que ele seja reconhecível."
          >
            <Stage label="Paleta de tons">
              <div className="grid w-full max-w-[960px] grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-2">
                <AwAgentTile
                  icon="bolt"
                  tone="lime"
                  title="Tom lime"
                  description="Padrão pra agentes de vendas e crescimento."
                  authorName="Alex Smith"
                />
                <AwAgentTile
                  icon="warning"
                  tone="amber"
                  title="Tom amber"
                  description="Pra agentes de suporte e recuperação."
                  authorName="Bea Costa"
                />
                <AwAgentTile
                  icon="check_circle"
                  tone="emerald"
                  title="Tom emerald"
                  description="Pra agentes de RH e onboarding."
                  authorName="Carlos Sun"
                />
                <AwAgentTile
                  icon="insights"
                  tone="blue"
                  title="Tom blue"
                  description="Pra agentes de dados e BI."
                  authorName="Dani Rocha"
                />
                <AwAgentTile
                  icon="auto_awesome"
                  tone="purple"
                  title="Tom purple"
                  description="Pra agentes de pesquisa e estratégia."
                  authorName="Eva Lima"
                />
                <AwAgentTile
                  icon="favorite"
                  tone="pink"
                  title="Tom pink"
                  description="Pra agentes de marketing e comunidade."
                  authorName="Fred Tanaka"
                />
                <AwAgentTile
                  icon="settings"
                  tone="neutral"
                  title="Tom neutral"
                  description="Default quando o agente não tem identidade definida."
                  authorName="Gabi Souza"
                />
              </div>
            </Stage>
          </Section>

          <Section
            id="no-count"
            title="Sem contador"
            lead="Quando o agente não tem histórico de uso, esconda o contador omitindo a prop count."
          >
            <Stage label="Tile sem count">
              <div className="w-full max-w-[480px]">
                <AwAgentTile
                  icon="rocket_launch"
                  tone="blue"
                  title="Agente novo"
                  description="Recém-criado, ainda sem conversas registradas."
                  authorName="Alex Smith"
                />
              </div>
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Wrappa <Link> do next quando recebe href. Caso contrário, renderiza estático."
          >
            <ApiTable>
              <PropRow
                prop="avatarSrc"
                type="string"
                doc="Caminho do orb do agente (use getOrbForAgent(id) do @/lib/agentOrbs). Quando presente, substitui o ícone tonal."
              />
              <PropRow
                prop="icon"
                type="string"
                doc="Material Symbol exibido no container tonal — usado como fallback quando avatarSrc é omitido."
              />
              <PropRow
                prop="tone"
                type='"lime" | "amber" | "emerald" | "blue" | "purple" | "pink" | "neutral"'
                doc="Cor do container do ícone fallback. Ignorado quando avatarSrc está presente. Default: neutral."
              />
              <PropRow
                prop="title"
                type="string"
                doc="Nome do agente, peso medium e truncado em uma linha. Obrigatório."
              />
              <PropRow
                prop="description"
                type="string"
                doc="Resumo do agente em até duas linhas (line-clamp-2). Obrigatório."
              />
              <PropRow
                prop="authorName"
                type="string"
                doc="Nome do autor exibido no rodapé. Gera iniciais pro avatar quando não há authorAvatar. Obrigatório."
              />
              <PropRow
                prop="authorAvatar"
                type="string"
                doc="URL do avatar do autor. Quando ausente, mostra iniciais."
              />
              <PropRow
                prop="count"
                type="number"
                doc="Número de conversas/usos. Quando omitido, esconde o contador."
              />
              <PropRow
                prop="href"
                type="string"
                doc="Quando definido, o tile inteiro vira link clicável."
              />
            </ApiTable>
          </Section>
        </div>
      </div>
    </>
  )
}
