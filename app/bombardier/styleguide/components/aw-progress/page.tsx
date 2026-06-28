import { AwProgress } from "@/components/ui/AwProgress"
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  Section,
  Spec,
  Stage,
  Tldr,
} from "../../_primitives"

export default function AwProgressPage() {
  return (
    <>
      <PageHero title="Progress">
        Barra horizontal pra valores <strong>determinísticos</strong> — quando
        a porcentagem é conhecida (upload, billing, treinamento). Quatro
        variantes semânticas mapeadas em status (default, success, warning,
        danger). Para estado indeterminado, use <code className="mono">AwSkeleton</code>.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Valor com porcentagem conhecida (upload, créditos, billing).</>,
            <>Pareado com label + valor numérico — sem porcentagem &ldquo;solta&rdquo;.</>,
            <>Variante semântica acompanha o estado: success = atingiu meta, danger = limite estourado.</>,
          ]}
          dontUse={[
            <>Como spinner de carregamento — use AwSkeleton.</>,
            <>Sem label/valueLabel — barra órfã não comunica.</>,
            <>Empilhar mais de 3 barras na mesma seção sem agrupar.</>,
          ]}
        />

        <Section
          id="default"
          title="Variante padrão"
          lead="Fundo neutro, preenchimento em --fg-primary. Use pra qualquer progresso sem semântica de status."
        >
          <Stage label="3 níveis · 30 / 60 / 90%" gridClassName="flex flex-col gap-3 w-full">
            <AwProgress label="Sincronizando fontes" value={30} />
            <AwProgress label="Treinando modelo" value={60} />
            <AwProgress label="Quase lá" value={90} />
          </Stage>
        </Section>

        <Section
          id="variants"
          title="Variantes semânticas"
          lead="Mude o preenchimento conforme o significado do número. Default é o caso comum; só suba pra success/warning/danger quando o estado realmente exige."
        >
          <Stage label="success · warning · danger" gridClassName="flex flex-col gap-3 w-full">
            <AwProgress
              variant="success"
              label="Cota de mensagens"
              value={42}
              max={100}
              valueLabel="42 / 100"
            />
            <AwProgress
              variant="warning"
              label="Cota de mensagens"
              value={82}
              max={100}
              valueLabel="82 / 100"
            />
            <AwProgress
              variant="danger"
              label="Cota de mensagens"
              value={99}
              max={100}
              valueLabel="99 / 100"
            />
          </Stage>
        </Section>

        <Section
          id="value-label"
          title="valueLabel customizada"
          lead="Por padrão exibe a porcentagem arredondada. Sobrescreva quando o número absoluto for mais útil."
        >
          <Stage label="% vs absoluto vs ratio" gridClassName="flex flex-col gap-3 w-full">
            <AwProgress label="Default %" value={67} />
            <AwProgress label="Absoluto" value={1284} max={2000} valueLabel="1 284 msgs" />
            <AwProgress label="Ratio" value={3} max={10} valueLabel="3 / 10 etapas" />
          </Stage>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Linha de meta (label + valueLabel) acima, barra abaixo. Altura 6px, radius full, fundo --bg-muted."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec k="altura" v="6 px" d="Constante. Track + fill compartilham." />
            <Spec k="radius" v="--radius-full" d="Pílula tonal." />
            <Spec k="track" v="--bg-muted" d="Fundo neutro." />
            <Spec k="fill default" v="--fg-primary" d="Quase-preto em light, branco em dark." />
            <Spec k="fill success" v="--aw-emerald-600" d="Verde brand." />
            <Spec k="fill warning" v="--aw-amber-500" d="Âmbar brand." />
            <Spec k="fill danger" v="--aw-red-600" d="Vermelho brand." />
            <Spec k="label tipo" v="13 / 400" d="Neue Haas Grotesk Display Regular, --fg-secondary." />
            <Spec k="value tipo" v="13 / 500" d="Neue Haas Grotesk Display Medium, --fg-primary." />
          </div>
        </Section>

        <Section id="api" title="API" lead={`Import: import { AwProgress } from "@/components/ui/AwProgress".`}>
          <ApiTable>
            <PropRow prop="value" type="number" doc="Valor atual (0 a max). Required." />
            <PropRow prop="max" type="number" def="100" doc="Limite superior do range." />
            <PropRow prop="label" type="ReactNode" doc="Texto à esquerda acima da barra." />
            <PropRow prop="valueLabel" type="ReactNode" doc='Texto à direita. Default: "{round(pct)}%".' />
            <PropRow
              prop="variant"
              type='"default" | "success" | "warning" | "danger"'
              def='"default"'
              doc="Cor do indicator — semântica de status."
            />
            <PropRow prop="className" type="string" doc="Classe extra no wrapper." />
          </ApiTable>

          <CodeExample label="básico">{`import { AwProgress } from "@/components/ui/AwProgress"

<AwProgress
  label="Sincronizando fontes"
  value={67}
/>

{/* Cota com value absoluto */}
<AwProgress
  variant="warning"
  label="Mensagens enviadas"
  value={820}
  max={1000}
  valueLabel="820 / 1 000"
/>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Sempre com <code className="mono">label</code> — barra órfã não comunica.</>,
              <>Variante semântica acompanha o estado real do valor.</>,
              <>Para indeterminado, troque por <code className="mono">AwSkeleton</code>.</>,
            ]}
            donts={[
              <>Barra animada infinita — não é spinner.</>,
              <>Cor custom fora das 4 variantes — não invente.</>,
              <>Empilhar barras sem agrupar — use <code className="mono">AwCard</code> ou tabela.</>,
            ]}
          />
        </Section>
      </div>
    </>
  )
}
