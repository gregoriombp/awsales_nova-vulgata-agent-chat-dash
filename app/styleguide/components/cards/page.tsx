import { AwCard } from "@/components/ui/AwCard"
import { AwPill } from "@/components/ui/AwPill"
import { AwButton } from "@/components/ui/AwButton"
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

export default function CardsPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-10 py-14">
      <PageHero title="Cards">
        Superfície primária para agrupar conteúdo. 1px de borda, radius{" "}
          <code className="mono">--radius-lg</code>, sem drop shadow por
          padrão. A variante <strong>ai</strong> insere uma gradient-mesh
          sutil sinalizando superfície ligada ao agente.
      </PageHero>

      <div className="flex flex-col gap-16">
        <Section
          id="variants"
          title="Variantes"
          lead="Duas variantes. Default é o padrão. AI é reservado a áreas vinculadas ao agente — nunca ambiente."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AwCard>
              <h4 className="m-0 mb-2">Agentes ativos</h4>
              <p className="body-sm m-0">
                12 agentes em produção. Última revisão há 3 dias.
              </p>
              <div className="flex gap-2 mt-4">
                <AwPill variant="live">ativo</AwPill>
                <AwPill variant="beta">beta</AwPill>
              </div>
            </AwCard>

            <AwCard variant="ai">
              <h4 className="m-0 mb-2">Sugestão do agente</h4>
              <p className="body-sm m-0">
                Detectei 4 conversas sem resposta em SLA. Crie um trigger de
                fallback para o time comercial.
              </p>
              <div className="flex gap-2 mt-4">
                <AwButton variant="ai" size="sm" iconLeft="auto_awesome">
                  Aplicar sugestão
                </AwButton>
                <AwButton variant="ghost" size="sm">
                  Descartar
                </AwButton>
              </div>
            </AwCard>
          </div>
        </Section>

        <Section
          id="interactive"
          title="Interativo"
          lead="Com interactive={true}, o card vira um alvo clicável — hover eleva 2px e borda escurece para --fg-primary."
        >
          <Stage label="interactive · hover para ver o lift">
            <AwCard interactive style={{ maxWidth: 280 }}>
              <h5 className="m-0 mb-1">Suporte N1</h5>
              <p className="body-sm m-0 text-[var(--fg-secondary)]">
                WhatsApp · 4 fontes · atualizado há 2h
              </p>
            </AwCard>
            <AwCard interactive style={{ maxWidth: 280 }}>
              <h5 className="m-0 mb-1">Pré-venda SDR</h5>
              <p className="body-sm m-0 text-[var(--fg-secondary)]">
                Instagram · 12 fontes · atualizado ontem
              </p>
            </AwCard>
            <AwCard interactive style={{ maxWidth: 280 }}>
              <h5 className="m-0 mb-1">Qualificação</h5>
              <p className="body-sm m-0 text-[var(--fg-secondary)]">
                Site · 2 fontes · rascunho
              </p>
            </AwCard>
          </Stage>
        </Section>

        <Section
          id="compositions"
          title="Composições"
          lead="Cards aceitam qualquer conteúdo. Padrões que aparecem no produto: KPI, lista, ação primária, empty-state."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AwCard>
              <div className="display-sm m-0">12</div>
              <p className="body-sm m-0 mt-1">Agentes em produção</p>
              <p className="caption mt-2 text-[var(--aw-emerald-700)]">
                +2 esta semana
              </p>
            </AwCard>
            <AwCard>
              <div className="display-sm m-0">74%</div>
              <p className="body-sm m-0 mt-1">Taxa de deflecção</p>
              <p className="caption mt-2 text-[var(--aw-red-700)]">
                −1.2 pts vs. 7d
              </p>
            </AwCard>
            <AwCard>
              <div className="display-sm m-0">1.4k</div>
              <p className="body-sm m-0 mt-1">Conversas resolvidas</p>
              <p className="caption mt-2 text-[var(--fg-tertiary)]">
                últimas 24h
              </p>
            </AwCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <AwCard>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h5 className="m-0">Fontes conectadas</h5>
                  <p className="caption mt-1">
                    4 bases · última sync há 3 min
                  </p>
                </div>
                <AwButton variant="ghost" size="sm" iconLeft="refresh">
                  Sync
                </AwButton>
              </div>
              <ul className="flex flex-col gap-2 list-none m-0 p-0">
                <li className="flex items-center justify-between text-sm">
                  <span>Notion · Playbook</span>
                  <AwPill variant="live" dot={false}>
                    sync
                  </AwPill>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span>Drive · FAQ</span>
                  <AwPill variant="live" dot={false}>
                    sync
                  </AwPill>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span>Intercom · Help Center</span>
                  <AwPill variant="error" dot={false}>
                    auth
                  </AwPill>
                </li>
              </ul>
            </AwCard>

            <AwCard>
              <div className="flex flex-col items-center text-center py-4">
                <div
                  className="w-12 h-12 rounded-full mb-4"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, var(--aw-blue-400), var(--aw-purple-500))",
                  }}
                />
                <h5 className="m-0 mb-1">Nenhuma conversa ainda</h5>
                <p className="body-sm m-0 text-[var(--fg-secondary)] max-w-[28ch]">
                  Conecte seu primeiro canal para receber mensagens em tempo
                  real.
                </p>
                <AwButton variant="primary" size="sm" className="mt-4">
                  Conectar canal
                </AwButton>
              </div>
            </AwCard>
          </div>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Valores vêm de tokens — mudar o token, não o componente."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec k="padding" v="20px 24px" d="Interno consistente." />
            <Spec
              k="radius"
              v="--radius-lg · 12px"
              d="Fixo para todas as variantes."
            />
            <Spec
              k="border"
              v="1px · --border-default"
              d="Hairline padrão do sistema."
            />
            <Spec
              k="background"
              v="--bg-raised"
              d="Acompanha light/dark automaticamente."
            />
            <Spec
              k="interactive hover"
              v="translateY(-2px)"
              d="+ borda --fg-primary e fundo --bg-surface."
            />
            <Spec
              k="ai mesh"
              v="blue-500 · purple-500"
              d="Radial gradient a 10% de opacidade no canto superior direito."
            />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwCard } from "@/components/ui/AwCard".`}
        >
          <ApiTable>
            <PropRow
              prop="variant"
              type='"default" | "ai"'
              def='"default"'
              doc="AI adiciona gradient-mesh sutil. Use só em áreas do agente."
            />
            <PropRow
              prop="interactive"
              type="boolean"
              def="false"
              doc="Torna o card clicável. Hover eleva 2px e escurece borda."
            />
            <PropRow
              prop="...rest"
              type="HTMLAttributes<HTMLDivElement>"
              doc="Qualquer atributo nativo de <div>."
            />
          </ApiTable>
          <CodeExample>{`import { AwCard } from "@/components/ui/AwCard"

<AwCard>
  <h4>Agentes ativos</h4>
  <p>12 agentes em produção.</p>
</AwCard>

<AwCard variant="ai">
  <p>Sugestão gerada pelo agente.</p>
</AwCard>

<AwCard interactive onClick={() => router.push("/agent/01HX")}>
  <h5>Suporte N1</h5>
</AwCard>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Use AI apenas em cards que expõem conteúdo gerado pelo agente.</>,
              <>Interactive só quando o card inteiro é clicável.</>,
              <>Um nível de elevação — não empilhar shadow-lg sobre shadow-md.</>,
            ]}
            donts={[
              <>AI em cards de KPI genéricos — polui o espectro “thinking”.</>,
              <>Nested cards com borda sobre borda.</>,
              <>Trocar o padding para “ganhar densidade” — use tokens.</>,
            ]}
          />
        </Section>
      </div>
    </div>
  )
}
