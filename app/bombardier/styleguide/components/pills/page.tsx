import { AwPill } from "@/components/ui/AwPill"
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

export default function PillsPage() {
  return (
    <>
      <PageHero title="Pills">
        Marcador inline de status ou categoria. Altura 22 px, radius total,
          sem borda. Um ponto opcional comunica estado — a variante{" "}
          <strong>ai</strong> pulsa.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-16">
        <Section
          id="variants"
          title="Variantes"
          lead="Seis variantes cobrem os estados que aparecem no produto. Cada uma já vem com a cor do dot e a cor do texto combinando."
        >
          <Stage label="Live · Draft · Beta · Error · Neutral · AI">
            <AwPill variant="live">Live</AwPill>
            <AwPill variant="draft">Draft</AwPill>
            <AwPill variant="beta">Beta</AwPill>
            <AwPill variant="error">Error</AwPill>
            <AwPill variant="neutral">Neutral</AwPill>
            <AwPill variant="ai">AI</AwPill>
          </Stage>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <AwPill variant="live">Live</AwPill>
              </div>
              <p className="body-sm m-0">
                Agente publicado e servindo tráfego. Verde emerald.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <AwPill variant="draft">Draft</AwPill>
              </div>
              <p className="body-sm m-0">
                Rascunho / não publicado. Cinza neutro.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <AwPill variant="beta">Beta</AwPill>
              </div>
              <p className="body-sm m-0">
                Feature em disponibilidade restrita. Amber.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <AwPill variant="error">Error</AwPill>
              </div>
              <p className="body-sm m-0">
                Falha de autenticação, sync ou execução. Vermelho.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <AwPill variant="neutral">Neutral</AwPill>
              </div>
              <p className="body-sm m-0">
                Categoria, tag ou filtro sem semântica de status.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <AwPill variant="ai">AI</AwPill>
              </div>
              <p className="body-sm m-0">
                Conteúdo gerado pelo agente. O dot pulsa a 2.2s — único pulse
                do sistema.
              </p>
            </div>
          </div>
        </Section>

        <Section
          id="dot"
          title="Com e sem dot"
          lead="Dot é default. Desligue via dot={false} quando a pill estiver dentro de uma superfície que já traz semântica (ex.: chip de filtro)."
        >
          <Stage label="dot · sem dot">
            <AwPill variant="live">Live</AwPill>
            <AwPill variant="live" dot={false}>
              Live
            </AwPill>
            <AwPill variant="error">Error</AwPill>
            <AwPill variant="error" dot={false}>
              Error
            </AwPill>
            <AwPill variant="ai">AI</AwPill>
            <AwPill variant="ai" dot={false}>
              AI
            </AwPill>
          </Stage>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Todos os valores vêm de tokens. Pulse é exclusividade da variante ai."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="altura"
              v="22 px"
              d="Inline com body-sm sem desalinhar baseline."
            />
            <Spec
              k="radius"
              v="--radius-full · 9999px"
              d="Sempre pill-shaped."
            />
            <Spec
              k="fonte"
              v="11px 500 Geist · 0.02em"
              d="Leve tracking positivo para legibilidade em palavras curtas."
            />
            <Spec
              k="dot"
              v="6 px redondo"
              d="Cor combina com texto da pill."
            />
            <Spec
              k="ai pulse"
              v="2.2s opacity 1 ⟷ 0.4"
              d="Único pulse do sistema — não replicar em outras variantes."
            />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwPill } from "@/components/ui/AwPill".`}
        >
          <ApiTable>
            <PropRow
              prop="variant"
              type='"live" | "draft" | "beta" | "error" | "neutral" | "ai"'
              def='"neutral"'
              doc="Cor e semântica."
            />
            <PropRow
              prop="dot"
              type="boolean"
              def="true"
              doc="Mostra o círculo colorido antes do label."
            />
            <PropRow
              prop="children"
              type="ReactNode"
              doc="Normalmente uma palavra curta — 1 a 3 palavras no máx."
            />
            <PropRow
              prop="...rest"
              type="HTMLAttributes<HTMLSpanElement>"
              doc="Herda tudo de <span>."
            />
          </ApiTable>

          <div className="rounded-[var(--radius-md)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] px-4 py-3 text-sm text-[var(--aw-blue-900)] mt-4">
            <code className="mono">variant</code> e modificadores booleanos
            (<code className="mono">dot=&#123;false&#125;</code>) viram tokens
            na <code className="mono">className</code> do exemplo. Esquerda é
            como o styleguide escreve; direita é como o dev implementa no
            produto.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <div className="aw-eyebrow">styleguide · HTML + className</div>
              <CodeExample label="status">{`<span className="live">Live</span>
<span className="error">Falha</span>
<span className="ai">AI</span>`}</CodeExample>
              <CodeExample label="chip de filtro sem dot">{`<span className="neutral no-dot">
  WhatsApp
</span>`}</CodeExample>
            </div>
            <div className="flex flex-col gap-2">
              <div className="aw-eyebrow">produto · AwPill</div>
              <CodeExample label="status">{`import { AwPill } from "@/components/ui/AwPill"

<AwPill variant="live">Live</AwPill>
<AwPill variant="error">Falha</AwPill>
<AwPill variant="ai">AI</AwPill>`}</CodeExample>
              <CodeExample label="chip de filtro sem dot">{`<AwPill variant="neutral" dot={false}>
  WhatsApp
</AwPill>`}</CodeExample>
            </div>
          </div>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Labels curtos, capitalizados, uma a três palavras.</>,
              <>AI apenas quando o item foi gerado ou inferido pelo agente.</>,
              <>Error em falhas reversíveis — não em “erro 500” de servidor.</>,
            ]}
            donts={[
              <>Pills com frase (“Aguardando revisão do time”).</>,
              <>Mais de 2 pills adjacentes no mesmo item — vira ruído.</>,
              <>Cor custom fora das 6 variantes — use neutral e deixe contexto contar.</>,
            ]}
          />
        </Section>
      </div>
    </div>
    </>
  )
}
