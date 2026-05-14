import {
  AwCard,
  AwCardAction,
  AwCardContent,
  AwCardDescription,
  AwCardFooter,
  AwCardHeader,
  AwCardTitle,
} from "@/components/ui/AwCard"
import { AwButton } from "@/components/ui/AwButton"
import { AwPill } from "@/components/ui/AwPill"
import { Icon } from "@/components/ui/Icon"
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

export default function CardsPage() {
  return (
    <>
      <PageHero title="Cards">
        Superfície primária para agrupar conteúdo. Anatomia espelha{" "}
        <strong>shadcn/ui Card</strong> — <code className="mono">Card</code>
        {" / "}
        <code className="mono">CardHeader</code>
        {" / "}
        <code className="mono">CardTitle</code>
        {" / "}
        <code className="mono">CardDescription</code>
        {" / "}
        <code className="mono">CardAction</code>
        {" / "}
        <code className="mono">CardContent</code>
        {" / "}
        <code className="mono">CardFooter</code>
        {" "}— sob tokens AwSales. Borda 1 px, radius{" "}
        <code className="mono">--radius-lg</code>, sem drop shadow por padrão.
        A variante <strong>ai</strong> aplica gradient-mesh sutil em superfícies
        ligadas ao agente.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          {/* ───────── Anatomia / shadcn alignment ───────── */}
          <Section
            id="anatomy-slots"
            title="Anatomia"
            lead="Sete slots, todos opcionais. Stacking idêntico ao shadcn Card — header com title/description, action no canto, content e footer."
          >
            <Stage
              label="AwCard · Header (Title + Description + Action) · Content · Footer"
              gridClassName="block"
            >
              <AwCard className="max-w-[480px]">
                <AwCardHeader>
                  <AwCardTitle>Suporte N1</AwCardTitle>
                  <AwCardDescription>
                    WhatsApp · 4 fontes · atualizado há 2 h
                  </AwCardDescription>
                  <AwCardAction>
                    <AwButton
                      variant="ghost"
                      size="sm"
                      iconOnly="more_horiz"
                      aria-label="Mais ações"
                    />
                  </AwCardAction>
                </AwCardHeader>
                <AwCardContent>
                  74% das conversas resolvidas pelo agente sem escalar para humano.
                  SLA médio em 4 min.
                </AwCardContent>
                <AwCardFooter>
                  <AwButton variant="secondary" size="sm">
                    Abrir agente
                  </AwButton>
                  <AwButton variant="ghost" size="sm">
                    Ver métricas
                  </AwButton>
                </AwCardFooter>
              </AwCard>
            </Stage>

            <CodeExample>{`import {
  AwCard,
  AwCardHeader,
  AwCardTitle,
  AwCardDescription,
  AwCardAction,
  AwCardContent,
  AwCardFooter,
} from "@/components/ui/AwCard"

<AwCard>
  <AwCardHeader>
    <AwCardTitle>Suporte N1</AwCardTitle>
    <AwCardDescription>WhatsApp · 4 fontes</AwCardDescription>
    <AwCardAction>
      <AwButton variant="ghost" size="sm" iconOnly="more_horiz" />
    </AwCardAction>
  </AwCardHeader>
  <AwCardContent>74% resolvidas pelo agente.</AwCardContent>
  <AwCardFooter>
    <AwButton variant="secondary" size="sm">Abrir agente</AwButton>
  </AwCardFooter>
</AwCard>`}</CodeExample>
          </Section>

          {/* ───────── Variants ───────── */}
          <Section
            id="variants"
            title="Variantes"
            lead="Quatro variantes. Default é o padrão. AI (azul/roxo), AI warm (peach) e AI cortex (silver) são reservados a áreas ligadas ao agente — nunca em ambiente."
          >
            <Stage
              label="default · ai · ai-warm · ai-cortex"
              gridClassName="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <AwCard>
                <AwCardHeader>
                  <AwCardTitle>Agentes ativos</AwCardTitle>
                  <AwCardDescription>
                    12 agentes em produção. Última revisão há 3 dias.
                  </AwCardDescription>
                </AwCardHeader>
                <AwCardFooter>
                  <AwPill variant="live">Ativo</AwPill>
                  <AwPill variant="beta">Beta</AwPill>
                </AwCardFooter>
              </AwCard>

              <AwCard variant="ai">
                <AwCardHeader>
                  <AwCardTitle>Sugestão do agente</AwCardTitle>
                  <AwCardDescription>
                    Detectei 4 conversas sem resposta em SLA. Crie um trigger de
                    fallback para o time comercial.
                  </AwCardDescription>
                </AwCardHeader>
                <AwCardFooter>
                  <AwButton variant="ai" size="sm" iconLeft="auto_awesome">
                    Aplicar sugestão
                  </AwButton>
                  <AwButton variant="ghost" size="sm">
                    Descartar
                  </AwButton>
                </AwCardFooter>
              </AwCard>

              <AwCard variant="ai-warm">
                <AwCardHeader>
                  <AwCardTitle>Especialista da Awsales</AwCardTitle>
                  <AwCardDescription>
                    Seu Gerente de contas dedicado está disponível pra revisar
                    estratégia.
                  </AwCardDescription>
                </AwCardHeader>
                <AwCardFooter>
                  <AwButton variant="secondary" size="sm" iconLeft="event">
                    Agendar agora
                  </AwButton>
                </AwCardFooter>
              </AwCard>

              <AwCard variant="ai-cortex">
                <AwCardHeader>
                  <AwCardTitle>Cortex · AI Account Manager</AwCardTitle>
                  <AwCardDescription>
                    Monitora o workspace 24/7 e antecipa gargalos antes que
                    eles cheguem ao seu time.
                  </AwCardDescription>
                </AwCardHeader>
                <AwCardFooter>
                  <AwButton variant="primary" size="sm" iconLeft="chat_bubble">
                    Iniciar conversa
                  </AwButton>
                </AwCardFooter>
              </AwCard>
            </Stage>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
                <div className="aw-eyebrow mb-2">default</div>
                <p className="body-sm m-0">
                  Fundo <code className="mono">--bg-raised</code>, borda{" "}
                  <code className="mono">--border-default</code>. Padrão para
                  qualquer agrupamento — KPIs, listas, formulários, conteúdo.
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
                <div className="aw-eyebrow mb-2">ai</div>
                <p className="body-sm m-0">
                  Gradient-mesh radial blue → purple a 8–10% de opacidade.
                  Sinaliza superfície gerada pelo agente — sugestões, resumos,
                  insights. Nunca em KPI estático.
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
                <div className="aw-eyebrow mb-2">ai-warm</div>
                <p className="body-sm m-0">
                  Gradient-mesh peach a ~14% sobre{" "}
                  <code className="mono">--bg-raised</code>. Reservado pro
                  lado humano em superfícies que pareiam um especialista da
                  Awsales com a IA — o calor codifica "pessoa real" sem virar
                  CTA.
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
                <div className="aw-eyebrow mb-2">ai-cortex</div>
                <p className="body-sm m-0">
                  Silver mesh inspirado no cubo de mármore da marca — base
                  slate fria com pocket claro à esquerda e sombra slate à
                  direita. Reservado pro Cortex (AI Account Manager) — não
                  use pra agentes generativos, que ficam com{" "}
                  <code className="mono">ai</code>.
                </p>
              </div>
            </div>
          </Section>

          {/* ───────── Interactive ───────── */}
          <Section
            id="interactive"
            title="Interativo"
            lead="Com interactive={true}, o card vira alvo clicável: hover eleva 2 px, borda escurece para --fg-primary, focus-visible ganha ring azul."
          >
            <Stage
              label="interactive · hover para ver o lift · Tab para focus ring"
              gridClassName="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              <AwCard interactive role="button" tabIndex={0}>
                <AwCardHeader>
                  <AwCardTitle>Suporte N1</AwCardTitle>
                  <AwCardDescription>
                    WhatsApp · 4 fontes · atualizado há 2h
                  </AwCardDescription>
                </AwCardHeader>
              </AwCard>
              <AwCard interactive role="button" tabIndex={0}>
                <AwCardHeader>
                  <AwCardTitle>Pré-venda SDR</AwCardTitle>
                  <AwCardDescription>
                    Instagram · 12 fontes · atualizado ontem
                  </AwCardDescription>
                </AwCardHeader>
              </AwCard>
              <AwCard interactive role="button" tabIndex={0}>
                <AwCardHeader>
                  <AwCardTitle>Qualificação</AwCardTitle>
                  <AwCardDescription>
                    Site · 2 fontes · rascunho
                  </AwCardDescription>
                </AwCardHeader>
              </AwCard>
            </Stage>
          </Section>

          {/* ───────── Compositions ───────── */}
          <Section
            id="compositions"
            title="Composições"
            lead="Padrões recorrentes no produto. Sempre montados com os slots do componente — nunca improvise estrutura."
          >
            <div className="aw-eyebrow mb-2">KPI</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <AwCard>
                <AwCardHeader>
                  <AwCardDescription>Agentes em produção</AwCardDescription>
                  <AwCardTitle className="display-sm">12</AwCardTitle>
                </AwCardHeader>
                <AwCardContent className="caption text-[var(--aw-emerald-700)]">
                  +2 esta semana
                </AwCardContent>
              </AwCard>
              <AwCard>
                <AwCardHeader>
                  <AwCardDescription>Taxa de deflecção</AwCardDescription>
                  <AwCardTitle className="display-sm">74%</AwCardTitle>
                </AwCardHeader>
                <AwCardContent className="caption text-[var(--aw-red-700)]">
                  −1.2 pts vs. 7d
                </AwCardContent>
              </AwCard>
              <AwCard>
                <AwCardHeader>
                  <AwCardDescription>Conversas resolvidas</AwCardDescription>
                  <AwCardTitle className="display-sm">1.4k</AwCardTitle>
                </AwCardHeader>
                <AwCardContent className="caption text-[var(--fg-tertiary)]">
                  últimas 24h
                </AwCardContent>
              </AwCard>
            </div>

            <div className="aw-eyebrow mb-2">Lista com header + ação</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <AwCard>
                <AwCardHeader>
                  <AwCardTitle>Fontes conectadas</AwCardTitle>
                  <AwCardDescription>
                    4 bases · última sync há 3 min
                  </AwCardDescription>
                  <AwCardAction>
                    <AwButton variant="ghost" size="sm" iconLeft="refresh">
                      Sync
                    </AwButton>
                  </AwCardAction>
                </AwCardHeader>
                <AwCardContent>
                  <ul className="flex flex-col gap-2 list-none m-0 p-0">
                    <li className="flex items-center justify-between text-sm">
                      <span>Notion · Playbook</span>
                      <AwPill variant="live" dot={false}>
                        Sync
                      </AwPill>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span>Drive · FAQ</span>
                      <AwPill variant="live" dot={false}>
                        Sync
                      </AwPill>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span>Intercom · Help Center</span>
                      <AwPill variant="error" dot={false}>
                        Auth
                      </AwPill>
                    </li>
                  </ul>
                </AwCardContent>
              </AwCard>

              <AwCard>
                <AwCardHeader>
                  <AwCardTitle>Próximas execuções</AwCardTitle>
                  <AwCardDescription>
                    Disparos automáticos das próximas 24 h.
                  </AwCardDescription>
                </AwCardHeader>
                <AwCardContent>
                  <ul className="flex flex-col gap-2 list-none m-0 p-0">
                    <li className="flex items-center justify-between text-sm">
                      <span>Recuperar carrinho · Hotmart</span>
                      <span className="caption">em 14 min</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span>Re-engajar lead · WhatsApp</span>
                      <span className="caption">em 2 h</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span>Resumo diário · Slack</span>
                      <span className="caption">amanhã, 09:00</span>
                    </li>
                  </ul>
                </AwCardContent>
                <AwCardFooter>
                  <AwButton variant="secondary" size="sm">
                    Ver todas
                  </AwButton>
                </AwCardFooter>
              </AwCard>
            </div>

            <div className="aw-eyebrow mb-2">Empty-state</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AwCard>
                <AwCardContent className="flex flex-col items-center text-center py-4">
                  <div
                    className="w-12 h-12 rounded-full mb-4"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, var(--aw-blue-400), var(--aw-purple-500))",
                    }}
                  />
                  <AwCardTitle>Nenhuma conversa ainda</AwCardTitle>
                  <AwCardDescription className="mt-1 max-w-[28ch]">
                    Conecte seu primeiro canal para receber mensagens em tempo
                    real.
                  </AwCardDescription>
                  <AwButton variant="primary" size="sm" className="mt-4">
                    Conectar canal
                  </AwButton>
                </AwCardContent>
              </AwCard>

              <AwCard variant="ai">
                <AwCardHeader>
                  <AwCardTitle>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="auto_awesome" size={16} />
                      Resumo do dia
                    </span>
                  </AwCardTitle>
                  <AwCardDescription>
                    13 conversas em SLA, 2 escaladas. WhatsApp lidera o volume.
                  </AwCardDescription>
                </AwCardHeader>
                <AwCardFooter>
                  <AwButton variant="ai" size="sm" iconLeft="auto_awesome">
                    Detalhar
                  </AwButton>
                  <AwButton variant="ghost" size="sm">
                    Ignorar
                  </AwButton>
                </AwCardFooter>
              </AwCard>
            </div>
          </Section>

          {/* ───────── On dark shell ───────── */}
          <Section
            id="on-dark"
            title="Sobre shell escuro"
            lead="Tokens semânticos invertem em .dark — borda, fundo e texto acompanham. AI mesh continua em blue/purple."
          >
            <div className="dark">
              <Stage
                label="Dark shell · sidebar / top-bar"
                dark
                gridClassName="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <AwCard>
                  <AwCardHeader>
                    <AwCardTitle>Suporte N1</AwCardTitle>
                    <AwCardDescription>
                      WhatsApp · 4 fontes · atualizado há 2 h
                    </AwCardDescription>
                  </AwCardHeader>
                  <AwCardFooter>
                    <AwPill variant="live">Ativo</AwPill>
                  </AwCardFooter>
                </AwCard>
                <AwCard variant="ai">
                  <AwCardHeader>
                    <AwCardTitle>Sugestão do agente</AwCardTitle>
                    <AwCardDescription>
                      Crie um trigger de fallback para o time comercial.
                    </AwCardDescription>
                  </AwCardHeader>
                  <AwCardFooter>
                    <AwButton variant="ai" size="sm" iconLeft="auto_awesome">
                      Aplicar
                    </AwButton>
                  </AwCardFooter>
                </AwCard>
              </Stage>
            </div>
          </Section>

          {/* ───────── Anatomy / Tokens ───────── */}
          <Section
            id="anatomy"
            title="Tokens"
            lead="Todos os valores saem de tokens em globals.css. Nunca hardcodar — ajuste o token, nunca o componente."
          >
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Spec
                k="padding"
                v="20 px · 24 px"
                d="Y · X. Constante para todas as variantes."
              />
              <Spec
                k="radius"
                v="--radius-lg · 12 px"
                d="Fixo. Não trocar por md ou xl."
              />
              <Spec
                k="border"
                v="1 px · --border-default"
                d="Hairline padrão. Nunca 2 px."
              />
              <Spec
                k="background"
                v="--bg-raised"
                d="Acompanha light / dark automaticamente."
              />
              <Spec
                k="interactive hover"
                v="translateY(-2 px)"
                d="+ borda --fg-primary, fundo --bg-surface."
              />
              <Spec
                k="interactive focus"
                v="ring 3 px · blue 30%"
                d="focus-visible apenas. Mesmo token do button."
              />
              <Spec
                k="ai mesh"
                v="blue-500 · purple-500"
                d="Radial gradient a 8–10%. Sem cor quente."
              />
              <Spec
                k="title"
                v="15 / 600 / -0.005em"
                d="Mesma escala de heading que modais e sheets."
              />
              <Spec
                k="description"
                v="13 / 400 · --fg-secondary"
                d="Sub-copy abaixo do title."
              />
              <Spec
                k="slot gap"
                v="14 px"
                d="Entre header → content → footer."
              />
              <Spec
                k="footer"
                v="flex · gap 8 px"
                d="Botões e pills se alinham horizontalmente."
              />
              <Spec
                k="motion"
                v="--dur-base · --ease-out"
                d="180 ms · cubic-bezier(0.22, 0.61, 0.36, 1)."
              />
            </div>
          </Section>

          {/* ───────── API ───────── */}
          <Section
            id="api"
            title="API"
            lead={`Import: import { AwCard, AwCardHeader, AwCardTitle, AwCardDescription, AwCardAction, AwCardContent, AwCardFooter } from "@/components/ui/AwCard".`}
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
                doc="Torna o card clicável. Hover eleva 2 px, focus-visible ganha ring."
              />
              <PropRow
                prop="...rest"
                type="HTMLAttributes<HTMLDivElement>"
                doc="Qualquer atributo nativo de <div> é repassado (className, onClick, role, tabIndex…)."
              />
            </ApiTable>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 mt-4 body-sm">
              <div className="aw-eyebrow mb-2">Subcomponentes</div>
              <ul className="m-0 pl-4 list-disc flex flex-col gap-1">
                <li>
                  <code className="mono">AwCardHeader</code> — grid de duas
                  colunas (título / descrição à esquerda, action à direita
                  quando presente). Slot equivalente ao{" "}
                  <code className="mono">CardHeader</code> do shadcn.
                </li>
                <li>
                  <code className="mono">AwCardTitle</code> — heading 15 / 600.
                  Equivale a <code className="mono">CardTitle</code>.
                </li>
                <li>
                  <code className="mono">AwCardDescription</code> — sub-copy 13
                  / 400 em <code className="mono">--fg-secondary</code>.
                  Equivale a <code className="mono">CardDescription</code>.
                </li>
                <li>
                  <code className="mono">AwCardAction</code> — slot
                  posicionado no canto direito do header (col 2, row span 2).
                  Equivale a <code className="mono">CardAction</code>.
                </li>
                <li>
                  <code className="mono">AwCardContent</code> — corpo. Texto em{" "}
                  <code className="mono">--fg-secondary</code> 14 / 1.55.
                  Equivale a <code className="mono">CardContent</code>.
                </li>
                <li>
                  <code className="mono">AwCardFooter</code> — flex horizontal,
                  gap 8 px. Para botões, pills ou meta inferior. Equivale a{" "}
                  <code className="mono">CardFooter</code>.
                </li>
              </ul>
            </div>

            <div className="rounded-[var(--radius-md)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] px-4 py-3 text-sm text-[var(--aw-blue-900)] mt-4">
              <code className="mono">variant</code>,{" "}
              <code className="mono">interactive</code> e os slots viram tokens
              de <code className="mono">className</code>{" "}
              (<code className="mono">card</code>,{" "}
              <code className="mono">card-header</code>,{" "}
              <code className="mono">card-title</code>, …). Esquerda é o
              formato curto usado pra rascunhar telas dentro do styleguide;
              direita é o que o dev escreve no produto.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <div className="aw-eyebrow">styleguide · HTML + className</div>
                <CodeExample label="card interativo">{`<div
  className="card interactive"
  role="button"
  tabIndex={0}
>
  <div className="card-header">
    <h3 className="card-title">Suporte N1</h3>
    <p className="card-description">
      WhatsApp · 4 fontes
    </p>
    <div className="card-action">
      <button
        className="ghost icon-only"
        data-icon="more_horiz"
      />
    </div>
  </div>
  <div className="card-content">
    74% resolvidas pelo agente.
  </div>
  <div className="card-footer">
    <button className="secondary">Abrir</button>
  </div>
</div>`}</CodeExample>
                <CodeExample label="variante ai">{`<div className="card ai">
  <div className="card-header">
    <h3 className="card-title">Sugestão</h3>
    <p className="card-description">
      Crie um trigger de fallback.
    </p>
  </div>
  <div className="card-footer">
    <button
      className="ai"
      data-icon-left="auto_awesome"
    >Aplicar</button>
  </div>
</div>`}</CodeExample>
              </div>

              <div className="flex flex-col gap-2">
                <div className="aw-eyebrow">produto · AwCard</div>
                <CodeExample label="card interativo">{`import {
  AwCard,
  AwCardHeader,
  AwCardTitle,
  AwCardDescription,
  AwCardAction,
  AwCardContent,
  AwCardFooter,
} from "@/components/ui/AwCard"

<AwCard
  interactive
  onClick={() => router.push("/agent/01HX")}
>
  <AwCardHeader>
    <AwCardTitle>Suporte N1</AwCardTitle>
    <AwCardDescription>
      WhatsApp · 4 fontes
    </AwCardDescription>
    <AwCardAction>
      <AwButton
        variant="ghost"
        size="sm"
        iconOnly="more_horiz"
      />
    </AwCardAction>
  </AwCardHeader>
  <AwCardContent>
    74% resolvidas pelo agente.
  </AwCardContent>
  <AwCardFooter>
    <AwButton variant="secondary" size="sm">
      Abrir
    </AwButton>
  </AwCardFooter>
</AwCard>`}</CodeExample>
                <CodeExample label="variante ai">{`<AwCard variant="ai">
  <AwCardHeader>
    <AwCardTitle>Sugestão</AwCardTitle>
    <AwCardDescription>
      Crie um trigger de fallback.
    </AwCardDescription>
  </AwCardHeader>
  <AwCardFooter>
    <AwButton
      variant="ai"
      size="sm"
      iconLeft="auto_awesome"
    >
      Aplicar
    </AwButton>
  </AwCardFooter>
</AwCard>`}</CodeExample>
              </div>
            </div>
          </Section>

          {/* ───────── Do / Don't ───────── */}
          <Section
            id="do-dont"
            title="Do / Don't"
            lead="Regras herdadas do Bombardier — desvios são correção, não criatividade."
          >
            <DoDont
              dos={[
                <>
                  Componha sempre via slots (Header / Content / Footer) —
                  espelha shadcn e mantém o ritmo vertical previsível.
                </>,
                <>
                  Use <strong>variant=&quot;ai&quot;</strong> apenas em
                  superfícies geradas pelo agente (sugestões, resumos,
                  insights).
                </>,
                <>
                  <strong>interactive</strong> só quando o card inteiro é
                  clicável — combine com{" "}
                  <code className="mono">role=&quot;button&quot;</code> e{" "}
                  <code className="mono">tabIndex={0}</code>.
                </>,
                <>
                  Mantenha um único nível de elevação. Para hierarquia, use
                  borda + tipografia, não shadow.
                </>,
              ]}
              donts={[
                <>
                  Variante AI em KPI genérico — polui o espectro
                  &quot;thinking&quot; reservado ao agente.
                </>,
                <>
                  Cards aninhados com borda sobre borda. Use separator interno
                  ou agrupe em sections.
                </>,
                <>
                  Trocar o padding por valores arbitrários para
                  &quot;ganhar densidade&quot;. Use os tokens.
                </>,
                <>
                  Estilizar <code className="mono">AwCardTitle</code> como{" "}
                  <code className="mono">h1</code>. O slot é semanticamente um{" "}
                  <code className="mono">div</code> — escolha o nível na sua
                  hierarquia de página.
                </>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
