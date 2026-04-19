import { AwPill } from "@/components/ui/AwPill"
import {
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
    <div className="max-w-[1200px] mx-auto px-10 py-14">
      <header className="mb-14">
        <h1 className="m-0">Pills</h1>
        <p className="text-[var(--body-lg-size)] text-[var(--fg-secondary)] mt-4 max-w-2xl leading-relaxed">
          Marcador inline de status ou categoria. Altura 22 px, radius total,
          1px de borda. Um ponto opcional comunica estado — a variante{" "}
          <strong>ai</strong> pulsa.
        </p>
      </header>

      <div className="flex flex-col gap-16">
        <Section
          id="variants"
          title="Variantes"
          lead="Seis variantes cobrem os estados que aparecem no produto. Cada uma já vem com a cor do dot e a cor do texto combinando."
        >
          <Stage label="live · draft · beta · error · neutral · ai">
            <AwPill variant="live">live</AwPill>
            <AwPill variant="draft">draft</AwPill>
            <AwPill variant="beta">beta</AwPill>
            <AwPill variant="error">error</AwPill>
            <AwPill variant="neutral">neutral</AwPill>
            <AwPill variant="ai">ai</AwPill>
          </Stage>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <AwPill variant="live">live</AwPill>
              </div>
              <p className="body-sm m-0">
                Agente publicado e servindo tráfego. Verde emerald.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <AwPill variant="draft">draft</AwPill>
              </div>
              <p className="body-sm m-0">
                Rascunho / não publicado. Cinza neutro.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <AwPill variant="beta">beta</AwPill>
              </div>
              <p className="body-sm m-0">
                Feature em disponibilidade restrita. Amber.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <AwPill variant="error">error</AwPill>
              </div>
              <p className="body-sm m-0">
                Falha de autenticação, sync ou execução. Vermelho.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <AwPill variant="neutral">neutral</AwPill>
              </div>
              <p className="body-sm m-0">
                Categoria, tag ou filtro sem semântica de status.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <AwPill variant="ai">ai</AwPill>
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
            <AwPill variant="live">live</AwPill>
            <AwPill variant="live" dot={false}>
              live
            </AwPill>
            <AwPill variant="error">error</AwPill>
            <AwPill variant="error" dot={false}>
              error
            </AwPill>
            <AwPill variant="ai">ai</AwPill>
            <AwPill variant="ai" dot={false}>
              ai
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
              v="11px 500 Mona Sans · 0.02em"
              d="Leve tracking positivo para legibilidade em maiúsculas/minúsculas curtas."
            />
            <Spec
              k="border"
              v="1px"
              d="Cor depende da variante — sempre 1 passo acima do background."
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

          <CodeExample>{`import { AwPill } from "@/components/ui/AwPill"

<AwPill variant="live">live</AwPill>
<AwPill variant="error">falha</AwPill>
<AwPill variant="ai">ai</AwPill>

{/* chip de filtro sem dot */}
<AwPill variant="neutral" dot={false}>whatsapp</AwPill>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Labels curtos, minúsculos, uma a três palavras.</>,
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
  )
}
