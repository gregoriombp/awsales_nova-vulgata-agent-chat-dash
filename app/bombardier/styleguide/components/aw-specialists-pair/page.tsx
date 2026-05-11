import { AwSpecialistsPair } from "@/components/ui/AwSpecialistsPair"
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

const HUMAN = {
  name: "Gabriel Rocha",
  role: "Gerente de contas",
  avatarSrc: "/assets/ui-faces/male-1.jpg",
  initials: "GR",
  ctaLabel: "Agendar agora",
  ctaIcon: "event",
}

const CORTEX = {
  name: "Cortex",
  role: "AI Account Manager",
  avatarSrc: "/assets/Cortex.png",
  ctaLabel: "Iniciar conversa",
  ctaIcon: "chat_bubble",
}

export default function SpecialistsPairPage() {
  return (
    <>
      <PageHero title="Specialists pair">
        Bloco usado nas configurações de equipe para apresentar os dois
        especialistas que acompanham cada workspace: o Gerente de Contas humano
        da Awsales e o Cortex, copilot de IA. Cards pill horizontais — humano
        com gradient warm (peach) e Cortex com o novo gradient{" "}
        <code className="mono">ai-cortex</code> (silver mesh inspirado no cubo
        de mármore da marca).
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="default"
            title="Uso default"
            lead="Header opcional + dois cards. O lado esquerdo é o humano (gradient warm, CTA secondary) e o direito o Cortex (gradient AI, CTA variant=ai)."
          >
            <Stage
              label="Equipe & permissões"
              gridClassName="block w-full bg-[var(--bg-canvas)] p-8"
            >
              <AwSpecialistsPair
                title="Especialistas dedicados à sua conta"
                description="Dois reforços fixos pra acelerar sua operação: um Gerente de Contas humano da Awsales pra estratégia, e o Cortex, copilot de IA que monitora seu workspace 24/7."
                human={HUMAN}
                ai={CORTEX}
              />
            </Stage>
          </Section>

          <Section
            id="no-header"
            title="Sem header"
            lead="title e description são opcionais — quando a página já apresenta o contexto acima, pode renderizar apenas os cards."
          >
            <Stage
              label="só cards"
              gridClassName="block w-full bg-[var(--bg-canvas)] p-8"
            >
              <AwSpecialistsPair human={HUMAN} ai={CORTEX} />
            </Stage>
          </Section>

          <Section
            id="custom-copy"
            title="Copy customizado"
            lead="Toda a copy (nome, role, label do CTA) chega via props — você decide o tom da página."
          >
            <Stage
              label="onboarding"
              gridClassName="block w-full bg-[var(--bg-canvas)] p-8"
            >
              <AwSpecialistsPair
                title="Bem-vindo à Awsales"
                description="Seu workspace já vem com dois especialistas conectados. Apresente-se e comece a tirar valor desde o dia um."
                human={{
                  ...HUMAN,
                  ctaLabel: "Marcar kickoff",
                  ctaIcon: "calendar_today",
                }}
                ai={{
                  ...CORTEX,
                  ctaLabel: "Falar com Cortex",
                  ctaIcon: "chat_bubble",
                }}
              />
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="human e ai compartilham o mesmo shape — name, role, avatar e CTA. title e description do bloco são opcionais."
          >
            <ApiTable>
              <PropRow
                prop="title"
                type="string"
                doc="Cabeçalho da seção. Estilo: 12px uppercase tracking-wide, --fg-tertiary."
              />
              <PropRow
                prop="description"
                type="string"
                doc="Parágrafo introdutório abaixo do título, limitado a 760px."
              />
              <PropRow
                prop="human"
                type="AwSpecialistRole"
                doc="Especialista humano (esquerda) — gradient ai-warm + CTA secondary, avatar circular."
              />
              <PropRow
                prop="ai"
                type="AwSpecialistRole"
                doc="Especialista de IA (direita) — gradient ai-cortex + CTA primary, imagem quadrada rounded-2xl."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Mergeado no <section> raiz."
              />
            </ApiTable>

            <ApiTable>
              <PropRow
                prop="name"
                type="string"
                doc="Nome do especialista — renderizado como AwCardTitle."
              />
              <PropRow
                prop="role"
                type="string"
                doc='Papel/função (ex: "Gerente de contas", "AI Account Manager").'
              />
              <PropRow
                prop="avatarSrc"
                type="string"
                doc="Imagem. Humano: /assets/ui-faces/* (renderizado circular via AwAvatar). IA: ignorado — o lado AI sempre renderiza o AstralFlow recortado em hex."
              />
              <PropRow
                prop="initials"
                type="string"
                doc="Fallback do avatar quando a imagem falha (humano)."
              />
              <PropRow
                prop="ctaLabel"
                type="string"
                doc="Texto do botão. Use verbo de ação direto."
              />
              <PropRow
                prop="ctaIcon"
                type="string"
                doc="Nome do Material Symbol no iconLeft do AwButton."
              />
              <PropRow
                prop="onCtaClick"
                type="() => void"
                doc="Handler do clique no CTA."
              />
            </ApiTable>

            <CodeExample label="exemplo — Equipe & permissões" lang="tsx">
              {`<AwSpecialistsPair
  title="Especialistas dedicados à sua conta"
  human={{
    name: "Gabriel Rocha",
    role: "Gerente de contas",
    avatarSrc: "/assets/ui-faces/male-1.jpg",
    initials: "GR",
    ctaLabel: "Agendar agora",
    ctaIcon: "event",
    onCtaClick: openScheduler,
  }}
  ai={{
    name: "Cortex",
    role: "AI Account Manager",
    ctaLabel: "Iniciar conversa",
    ctaIcon: "chat_bubble",
    onCtaClick: openCortex,
  }}
/>`}
            </CodeExample>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Use no topo das configurações de equipe pra reforçar que sua conta tem reforço dedicado.</>,
                <>Mantenha a copy curta e orientada a benefício — esse não é um card de marketing.</>,
                <>Renderize só quando há um gerente humano atribuído — sem fallback é melhor que vazio.</>,
                <>Combine com seções de membros abaixo; este bloco substitui a antiga seção "Gerente da conta".</>,
              ]}
              donts={[
                <>Não use o componente fora do contexto "equipe" — ele tem semântica forte de especialistas de conta.</>,
                <>Não troque os gradients (ai-warm × ai-cortex) entre os cards — eles codificam humano vs. máquina visualmente.</>,
                <>Não adicione mais de um CTA por card — a leitura precisa ser direta.</>,
                <>Não use <code className="mono">aw-card--ai</code> (blue/purple) aqui — esse gradient é reservado pra agentes generativos.</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
