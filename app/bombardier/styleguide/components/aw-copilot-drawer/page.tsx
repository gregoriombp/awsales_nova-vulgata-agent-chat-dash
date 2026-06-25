"use client"

import { useState } from "react"
import { AwCopilotDrawer, AwCopilotOrb } from "@/components/ui/AwCopilotDrawer"
import { AwButton } from "@/components/ui/AwButton"
import { type CortexState } from "@/lib/copilot-orb-presets"
import {
  ApiTable,
  CodeExample,
  DoDont,
  KeyboardTable,
  PageHero,
  PropRow,
  RelatedLinks,
  Section,
  Spec,
  StatesMatrix,
  Tldr,
  Toc,
  TokensConsumed,
} from "../../_primitives"

const ORB_STATES: CortexState[] = [
  "idle",
  "thinking",
  "responding",
  "listening",
  "error",
]

const STATE_NOTE: Record<CortexState, string> = {
  idle: "Repouso. Hex fixo, fluxo lento.",
  thinking: "Morfa a forma + varre o hue.",
  responding: "Cálido (âmbar), fluxo mais rápido.",
  listening: "Atento, leve viés azul.",
  error: "Vermelho, glow alto.",
}

export default function CopilotDrawerPage() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <PageHero title="Copilot drawer">
        O painel lateral do Cortex — o assistente do produto — ancorado à
        direita do shell. Reúne o orb, a área de chat e o composer num único
        aside de largura fixa (405px). O mesmo arquivo também exporta o{" "}
        <code className="mono">AwCopilotOrb</code>, o orb hexagonal do Cortex.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Toc
          items={[
            { id: "orb", label: "AwCopilotOrb" },
            { id: "embedded", label: "Painel (embedded)" },
            { id: "floating", label: "Overlay deslizante" },
            { id: "anatomy", label: "Anatomia" },
            { id: "api", label: "API" },
            { id: "a11y", label: "Acessibilidade" },
            { id: "code", label: "Código" },
            { id: "do-dont", label: "Do / Don't" },
          ]}
        />

        <Tldr
          use={[
            <>
              Como assistente Cortex contextual — o painel fixo do lado direito
              do app, com orb, chat e composer.
            </>,
            <>
              Para acompanhar o usuário enquanto ele trabalha: tirar dúvidas,
              gerar texto, explicar a tela atual.
            </>,
            <>
              O <code className="mono">AwCopilotOrb</code> isolado, quando você
              só precisa da marca viva do Cortex (header, badge, loading).
            </>,
          ]}
          dontUse={[
            <>
              Como modal genérico de confirmação ou formulário — pra isso use{" "}
              <code className="mono">AwModal</code>.
            </>,
            <>
              Como navegação lateral (menu, seções do produto) — isso é{" "}
              <code className="mono">AwSidebar</code> / <code className="mono">AwNavRail</code>.
            </>,
            <>
              Como sheet de propósito geral — drawers neutros vivem em{" "}
              <code className="mono">AwSheet</code>.
            </>,
          ]}
        />

        <Section
          id="orb"
          title="AwCopilotOrb"
          lead="O orb é a textura AwCortexSynthesis (WebGL) mascarada num hexágono de topo plano. Cada estado do Cortex é um preset de shader; em thinking o orb troca a máscara hex fixa por uma forma que morfa, e varre o hue da textura."
        >
          <StatesMatrix
            dark
            columns={3}
            states={ORB_STATES.map((s) => ({
              name: s,
              node: <AwCopilotOrb size={56} state={s} />,
              note: STATE_NOTE[s],
            }))}
          />

          <div className="mt-4">
            <div className="rounded-lg border border-(--border-subtle) overflow-hidden">
              <div className="px-5 py-3 border-b border-(--border-subtle) flex items-baseline justify-between bg-(--bg-raised)">
                <div className="text-sm font-medium text-(--fg-primary)">
                  size · 28 / 36 / 56 / 119
                </div>
                <div className="caption">
                  A densidade dos swirls abre conforme o orb encolhe — pequeno
                  fica legível, grande mantém o look completo.
                </div>
              </div>
              <div
                className="p-8 flex flex-wrap items-end gap-8"
                style={{ backgroundColor: "var(--dark-bg)" }}
              >
                {[28, 36, 56, 119].map((sz) => (
                  <div key={sz} className="flex flex-col items-center gap-2">
                    <AwCopilotOrb size={sz} />
                    <span
                      className="mono text-[11px]"
                      style={{ color: "var(--dark-fg-tertiary)" }}
                    >
                      {sz}px
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="embedded"
          title="Painel (embedded)"
          lead="O preview canônico do painel completo. Em embedded, o AwCopilotDrawer renderiza o aside inline (h-full, 405px) — top bar com orb, área de chat e composer. Aqui no empty state: orb 119 + saudação. Só chama a API do Cortex quando você envia uma mensagem; só pré-visualizar é seguro."
        >
          <div className="h-[560px] flex rounded-lg overflow-hidden border border-(--border-subtle)">
            <AwCopilotDrawer embedded isOpen onClose={() => {}} />
          </div>
        </Section>

        <Section
          id="floating"
          title="Overlay deslizante"
          lead="Fora do modo embedded, o AwCopilotDrawer é um overlay fixo na direita que desliza com translate-x. O botão abaixo abre e fecha esse overlay para você ver o comportamento de entrada/saída."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8 flex items-center gap-4">
            <AwButton onClick={() => setOpen(true)}>Abrir Cortex</AwButton>
            <span className="body-sm text-(--fg-secondary)">
              Desliza da direita. Feche pelo X, pelo backdrop ou com{" "}
              <kbd className="mono text-xs px-2 py-0.5 rounded-sm border border-(--border-default) bg-(--bg-surface) text-(--fg-primary)">
                Esc
              </kbd>
              .
            </span>
          </div>

          <div className="mt-4 rounded-md border border-(--aw-blue-200) bg-(--aw-blue-100) px-5 py-4 text-sm text-(--aw-blue-900)">
            <strong>Nota (estado atual).</strong> Nesta versão, o corpo do
            overlay flutuante está vazio por design — o conteúdo rico (orb,
            chat, composer) só é renderizado no modo{" "}
            <code className="mono">embedded</code>. Use o preview embedded acima
            como referência visual do painel; o overlay aqui demonstra apenas a
            mecânica de slide-in / dismiss.
          </div>

          <AwCopilotDrawer isOpen={open} onClose={() => setOpen(false)} />
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Três zonas verticais num aside de largura fixa, ancorado à direita. Fundo do aside em --bg-surface, corpo do painel em --bg-raised."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="top bar"
              v="orb 46 + 'Cortex'"
              d="Dot Online em --accent-success + botão fechar (X)."
            />
            <Spec
              k="área de chat"
              v="empty / bolhas"
              d="Empty: orb 119 + 'Olá! Como posso te ajudar?'. Depois: bolhas user/bot."
            />
            <Spec
              k="composer"
              v="input + ações"
              d="Campo + anexar, emoji e enviar. Enter envia."
            />
            <Spec k="width" v="405 px" d="Largura fixa do aside." />
            <Spec k="role" v='"dialog"' d='aria-label="Cortex".' />
            <Spec k="dismiss" v="Esc / X / backdrop" d="Fecha o painel (onClose)." />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwCopilotDrawer, AwCopilotOrb } from "@/components/ui/AwCopilotDrawer".`}
        >
          <div className="aw-eyebrow mb-2">AwCopilotDrawer</div>
          <ApiTable>
            <PropRow
              prop="isOpen"
              type="boolean"
              doc="Controla a abertura. No overlay flutuante anima o slide-in; em embedded define a largura do aside."
            />
            <PropRow
              prop="onClose"
              type="() => void"
              doc="Chamado ao fechar — pelo X, pelo backdrop ou pela tecla Esc. Obrigatório."
            />
            <PropRow
              prop="embedded"
              type="boolean"
              def="false"
              doc="Renderiza o painel completo inline (h-full, 405px) em vez do overlay fixo. O conteúdo rico vive aqui."
            />
          </ApiTable>

          <div className="aw-eyebrow mb-2 mt-8">AwCopilotOrb</div>
          <ApiTable>
            <PropRow
              prop="size"
              type="number"
              def="36"
              doc="Lado do orb em px. A densidade do shader se ajusta automaticamente ao tamanho."
            />
            <PropRow
              prop="state"
              type='"idle" | "thinking" | "responding" | "listening" | "error"'
              def='"idle"'
              doc="Preset de shader do Cortex. thinking também morfa a forma e varre o hue."
            />
            <PropRow
              prop="speed, scale, complexity, distortion"
              type="number"
              doc="Overrides do fluxo da textura. Vencem o preset do state. Use só pra fine-tuning."
            />
            <PropRow
              prop="glowIntensity, flowFrequency, contrast"
              type="number"
              doc="Overrides do glow / frequência / contraste da textura. Vencem o preset."
            />
            <PropRow
              prop="color1, color2, color3, bg"
              type="string"
              doc="Cores do shader (hex). Overrides do preset — fora do showcase, prefira o state."
            />
          </ApiTable>
        </Section>

        <Section
          id="a11y"
          title="Acessibilidade"
          lead='O painel é um role="dialog" rotulado como Cortex. O foco do teclado é o fechamento via Esc.'
        >
          <KeyboardTable
            rows={[
              { keys: ["Esc"], action: "Fecha o painel (dispara onClose)." },
              {
                keys: ["Enter"],
                action: "No composer, envia a mensagem digitada.",
              },
            ]}
          />
        </Section>

        <Section
          id="tokens"
          title="Tokens consumidos"
          lead="O painel lê estes tokens do contexto. Nenhuma cor é hardcoded no chrome do componente."
        >
          <TokensConsumed
            tokens={[
              { token: "--bg-surface", role: "Fundo do aside e dos campos do composer/bolha bot." },
              { token: "--bg-raised", role: "Corpo do painel (a coluna interna de 405px)." },
              { token: "--border-subtle", role: "Bordas e divisórias (top bar, composer)." },
              { token: "--fg-primary", role: "Texto principal (título, mensagens, input)." },
              { token: "--accent-success", role: "Status 'Online' e o dot ao lado do nome." },
              { token: "--bg-hover", role: "Hover do botão fechar." },
              { token: "--fg-on-inverse", role: "Ícone dentro do botão enviar (sobre --fg-primary)." },
            ]}
          />
        </Section>

        <Section
          id="code"
          title="Código"
          lead="Embedded para o painel inline; overlay flutuante controlado por estado."
        >
          <CodeExample label="embedded (preview inline)">{`import { AwCopilotDrawer } from "@/components/ui/AwCopilotDrawer"

<div className="h-[560px] flex">
  <AwCopilotDrawer embedded isOpen onClose={() => {}} />
</div>`}</CodeExample>

          <CodeExample label="overlay flutuante (controlado)">{`"use client"
import { useState } from "react"
import { AwCopilotDrawer } from "@/components/ui/AwCopilotDrawer"

const [open, setOpen] = useState(false)

<button onClick={() => setOpen(true)}>Abrir Cortex</button>
<AwCopilotDrawer isOpen={open} onClose={() => setOpen(false)} />`}</CodeExample>

          <CodeExample label="orb isolado">{`import { AwCopilotOrb } from "@/components/ui/AwCopilotDrawer"

<AwCopilotOrb size={56} state="thinking" />`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>
                Renderize o conteúdo no modo{" "}
                <code className="mono">embedded</code> — é onde o painel
                completo vive hoje.
              </>,
              <>
                Use o <code className="mono">state</code> do orb pra refletir o
                que o Cortex está fazendo (thinking ao processar, error ao
                falhar).
              </>,
              <>
                Mantenha o painel ancorado à direita do shell, com largura fixa
                de 405px.
              </>,
            ]}
            donts={[
              <>
                Esperar conteúdo no overlay flutuante nesta versão — o corpo
                dele está vazio por design.
              </>,
              <>
                Sobrescrever as cores do orb (<code className="mono">color1…</code>)
                fora de casos de fine-tuning — prefira o{" "}
                <code className="mono">state</code>.
              </>,
              <>
                Usar como modal ou menu — pra isso existem{" "}
                <code className="mono">AwModal</code> e{" "}
                <code className="mono">AwSidebar</code>.
              </>,
            ]}
          />
        </Section>

        <RelatedLinks
          items={[
            {
              name: "Cortex synthesis",
              href: "/bombardier/styleguide/components/aw-cortex-synthesis",
              description: "A textura WebGL atrás do orb.",
            },
            {
              name: "Sheets e drawers",
              href: "/bombardier/styleguide/components/sheet",
              description: "Painéis laterais genéricos (AwSheet).",
            },
            {
              name: "Input message",
              href: "/bombardier/styleguide/components/aw-input-message",
              description: "O composer de mensagens premium.",
            },
          ]}
        />
      </div>
    </>
  )
}
