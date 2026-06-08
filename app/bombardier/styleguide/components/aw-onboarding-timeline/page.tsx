import { AwOnboardingTimeline } from "@/components/ui/AwOnboardingTimeline"
import { Icon } from "@/components/ui/Icon"
import {
  ApiTable,
  CodeExample,
  PageHero,
  PropRow,
  Section,
  Stage,
  Tldr,
} from "../../_primitives"

export default function AwOnboardingTimelinePage() {
  return (
    <>
      <PageHero title="Onboarding timeline">
        Lista vertical de etapas de configuração conectadas por uma{" "}
        <strong>linha contínua</strong> — não pontos soltos. A etapa atual fica
        expandida com CTA primária; as demais ficam colapsadas e abrem ao
        clicar. Usada na <code className="mono">/inicio</code> pra guiar o
        primeiro setup da workspace.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Setup inicial sequencial — &ldquo;faça isso, depois isso&rdquo;.</>,
            <>Quando o progresso entre etapas importa pro usuário.</>,
            <>Como hub de configuração na home pós-ativação.</>,
          ]}
          dontUse={[
            <>
              Como checklist sem ordem — pra isso, prefira lista simples ou
              cards lado a lado.
            </>,
            <>
              Pra mais de 8 etapas — quebre em fases (&ldquo;essencial&rdquo; vs
              &ldquo;avançado&rdquo;).
            </>,
            <>
              Como navegação principal — é guia, não menu.
            </>,
          ]}
        />

        <Section
          id="default"
          title="Estado padrão"
          lead="Etapa current expandida, demais colapsadas. Linha contínua atravessa todos os marcadores."
        >
          <Stage label="6 etapas · 1 current" gridClassName="w-full">
            <div className="w-full">
              <AwOnboardingTimeline
                title="Configure sua workspace"
                eyebrow="Pra começar"
                steps={[
                  {
                    id: "canais",
                    title: "Conecte seus canais de atendimento",
                    status: "current",
                    description: (
                      <>
                        Centralize WhatsApp, e-mail, voz e webchat numa caixa só.
                      </>
                    ),
                    helpLink: { label: "Como funcionam os canais", href: "#" },
                    cta: { label: "Conectar canais", href: "#" },
                  },
                  {
                    id: "equipe",
                    title: "Convide sua equipe pra colaborar",
                    description: <>Defina papéis, permissões e times.</>,
                    cta: { label: "Convidar membros", iconLeft: "person_add", href: "#" },
                  },
                  {
                    id: "conhecimento",
                    title: "Alimente o agente IA com sua base de conhecimento",
                    description: <>Suba documentos, FAQs e tutoriais.</>,
                    cta: { label: "Adicionar conhecimento", href: "#" },
                  },
                  {
                    id: "ativar",
                    title: "Ative o agente IA pra resolver atendimentos",
                    description: <>Coloque o agente em produção com confiança.</>,
                    cta: { label: "Configurar agente", href: "#" },
                  },
                ]}
              />
            </div>
          </Stage>
        </Section>

        <Section
          id="with-progress"
          title="Com etapas concluídas"
          lead="Etapas done ganham marcador verde + check, título com strikethrough sutil. O contador no header reflete o progresso."
        >
          <Stage label="2 done · 1 current · 2 pending" gridClassName="w-full">
            <div className="w-full">
              <AwOnboardingTimeline
                title="Configure sua workspace"
                eyebrow="Pra começar"
                steps={[
                  {
                    id: "canais",
                    title: "Conecte seus canais de atendimento",
                    status: "done",
                  },
                  {
                    id: "equipe",
                    title: "Convide sua equipe pra colaborar",
                    status: "done",
                  },
                  {
                    id: "conhecimento",
                    title: "Alimente o agente IA com sua base de conhecimento",
                    status: "current",
                    description: <>Suba documentos, FAQs e tutoriais.</>,
                    cta: { label: "Adicionar conhecimento", href: "#" },
                  },
                  {
                    id: "ativar",
                    title: "Ative o agente IA pra resolver atendimentos",
                    description: <>Coloque o agente em produção com confiança.</>,
                    cta: { label: "Configurar agente", href: "#" },
                  },
                  {
                    id: "fluxos",
                    title: "Crie fluxos automáticos pra tarefas comuns",
                    description: <>Automatize cobranças, triagem, follow-ups.</>,
                    cta: { label: "Criar fluxo", href: "#" },
                  },
                ]}
              />
            </div>
          </Stage>
        </Section>

        <Section
          id="with-preview"
          title="Com preview à direita"
          lead="Slot opcional pra imagem/vídeo do produto. Esconde no breakpoint < lg."
        >
          <Stage label="6 etapas + preview" gridClassName="w-full">
            <div className="w-full">
              <AwOnboardingTimeline
                title="Configure sua workspace"
                eyebrow="Pra começar"
                steps={[
                  {
                    id: "canais",
                    title: "Conecte seus canais de atendimento",
                    status: "current",
                    description: (
                      <>
                        Centralize WhatsApp, e-mail, voz e webchat numa caixa só.
                      </>
                    ),
                    cta: { label: "Conectar canais", href: "#" },
                  },
                  {
                    id: "equipe",
                    title: "Convide sua equipe pra colaborar",
                  },
                  {
                    id: "conhecimento",
                    title: "Alimente o agente IA com sua base de conhecimento",
                  },
                  {
                    id: "ativar",
                    title: "Ative o agente IA pra resolver atendimentos",
                  },
                ]}
                preview={
                  <div className="relative aspect-4/5 w-full">
                    <div className="absolute inset-0 aw-gradient-iridescent-soft" />
                    <div className="absolute inset-0 flex flex-col justify-end gap-2 p-6">
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-(--bg-raised) px-2.5 py-1 body-xs font-medium text-(--fg-primary) shadow-sm">
                        <Icon name="play_arrow" size={14} fill={1} />
                        Tour em 60s
                      </span>
                      <p className="m-0 max-w-[240px] body-sm text-(--fg-primary)">
                        Veja como uma conversa percorre canais, agente IA e
                        humano em menos de um minuto.
                      </p>
                    </div>
                  </div>
                }
              />
            </div>
          </Stage>
        </Section>

        <Section
          id="api"
          title="API"
          lead="Estrutura de cada step e props do componente raiz."
        >
          <ApiTable>
            <PropRow
              prop="title"
              type="ReactNode"
              doc="Título da seção, fora do card. Obrigatório."
            />
            <PropRow
              prop="eyebrow"
              type="ReactNode"
              doc='Texto curto exibido sobre o contador (ex. "Pra começar").'
            />
            <PropRow
              prop="steps"
              type="AwOnboardingStep[]"
              doc='Lista de etapas. Cada etapa tem id, title, status ("done" | "current" | "pending"), description, cta e helpLink opcionais. Obrigatório.'
            />
            <PropRow
              prop="defaultExpandedId"
              type="string"
              def="current/primeira pending"
              doc="Sobrescreve qual etapa começa expandida."
            />
            <PropRow
              prop="preview"
              type="ReactNode"
              doc="Slot de mídia à direita (imagem, vídeo, ilustração). Esconde abaixo de lg."
            />
          </ApiTable>
        </Section>

        <Section
          id="usage"
          title="Uso"
          lead="Exemplo mínimo com 3 etapas."
        >
          <CodeExample>{`<AwOnboardingTimeline
  title="Configure sua workspace"
  eyebrow="Pra começar"
  steps={[
    {
      id: "canais",
      title: "Conecte seus canais",
      status: "current",
      description: "Centralize WhatsApp, e-mail e webchat.",
      cta: { label: "Conectar canais", href: "/canais" },
    },
    {
      id: "equipe",
      title: "Convide sua equipe",
      cta: { label: "Convidar", href: "/settings/equipe-permissoes" },
    },
    {
      id: "agente",
      title: "Ative o agente IA",
      cta: { label: "Configurar", href: "/agent-studio" },
    },
  ]}
/>`}</CodeExample>
        </Section>
      </div>
    </>
  )
}
