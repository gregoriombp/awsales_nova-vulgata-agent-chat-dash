import { AwSkeleton } from "@/components/ui/AwSkeleton"
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

export default function SkeletonPage() {
  return (
    <>
      <PageHero title="Skeleton">
        Placeholder de carregamento que imita a estrutura final — assim a
        tela não “salta” quando os dados chegam. Shimmer sutil, 1.6 s,
        sempre da esquerda pra direita. Spinner é reservado pra esperas{" "}
        {"<"} 1 s em estados de botão.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-16">
        <Section
          id="shapes"
          title="Formas"
          lead="Cinco presets. Cada um tem uma altura e radius calibrados para um tipo de conteúdo específico."
        >
          <Stage
            label="Block · line · title · avatar · card"
            gridClassName="flex flex-col gap-4 max-w-[520px]"
          >
            <AwSkeleton />
            <AwSkeleton shape="title" />
            <AwSkeleton shape="line" />
            <AwSkeleton shape="line" width="70%" />
            <div className="flex items-center gap-3">
              <AwSkeleton shape="avatar" />
              <div className="flex-1 flex flex-col gap-2">
                <AwSkeleton shape="title" width="60%" />
                <AwSkeleton shape="line" width="90%" />
              </div>
            </div>
            <AwSkeleton shape="card" />
          </Stage>

          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <Spec
              k="block"
              v="52 px · radius-md"
              d="Default — imita um row de tabela ou card pequeno."
            />
            <Spec
              k="line"
              v="12 px · radius-xs"
              d="Linha de texto — usar em várias larguras (100%, 70%, 40%)."
            />
            <Spec
              k="title"
              v="22 px · radius-xs"
              d="Cabeçalho h4/h5."
            />
            <Spec
              k="avatar"
              v="36 × 36 · círculo"
              d="Mesma unidade do AwAvatar default."
            />
            <Spec
              k="card"
              v="140 px · radius-lg"
              d="Placeholder de um card completo."
            />
            <Spec
              k="width custom"
              v='width="70%" | 180'
              d="Aceita string (%, vh) ou number (px)."
            />
          </div>
        </Section>

        <Section
          id="list"
          title="Composição: lista"
          lead="Repita o skeleton imitando a estrutura final. Aqui, uma lista de 4 conversas — altura do row = altura final."
        >
          <Stage
            label="4 rows · última com 70% de largura"
            gridClassName="flex flex-col gap-3 max-w-[480px]"
          >
            <AwSkeleton />
            <AwSkeleton />
            <AwSkeleton />
            <AwSkeleton width="70%" />
          </Stage>
        </Section>

        <Section
          id="card-grid"
          title="Composição: grid de cards"
          lead="Grid 3-up enquanto carrega. Mantém o layout da grade final."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AwSkeleton shape="card" />
            <AwSkeleton shape="card" />
            <AwSkeleton shape="card" />
          </div>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="O shimmer é horizontal, direção fixa, duração 1.6 s. Reduced-motion mata a animação — o placeholder continua marcando o espaço."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="shimmer"
              v="1.6 s · linear · infinite"
              d="Esquerda pra direita. Gradient 40% de largura."
            />
            <Spec
              k="background"
              v="--bg-muted"
              d="Cor base; contraste com --bg-raised do container."
            />
            <Spec
              k="tint do shimmer"
              v="rgba(0,0,0,.04) light · rgba(255,255,255,.05) dark"
              d="Muito sutil — percebido mais que visto."
            />
            <Spec
              k="reduced motion"
              v="animation: none"
              d="O bloco continua presente, sem shimmer."
            />
            <Spec
              k="aria"
              v="role=presentation"
              d="Leitor ignora; a UI vizinha deve ter aria-busy."
            />
            <Spec
              k="duração máxima"
              v="~3 s"
              d="Após isso, exiba mensagem explícita (erro ou demora)."
            />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwSkeleton } from "@/components/ui/AwSkeleton".`}
        >
          <ApiTable>
            <PropRow
              prop="shape"
              type='"block" | "line" | "title" | "avatar" | "card"'
              def='"block"'
              doc="Preset que define altura e radius."
            />
            <PropRow
              prop="width"
              type="number | string"
              doc='Largura; px (number) ou CSS string ("70%", "14ch").'
            />
            <PropRow
              prop="height"
              type="number | string"
              doc="Override de altura quando o preset não couber."
            />
            <PropRow
              prop="radius"
              type="string"
              doc='Override de borda. Aceita token ("--radius-lg") ou CSS puro.'
            />
            <PropRow
              prop="...rest"
              type="HTMLAttributes<HTMLSpanElement>"
              doc="Qualquer atributo de <span>; className / style merge."
            />
          </ApiTable>

          <CodeExample>{`import { AwSkeleton } from "@/components/ui/AwSkeleton"

// Linha de texto — 70% de largura
<AwSkeleton shape="line" width="70%" />

// Avatar + 2 linhas de texto (row de lista)
<div className="flex items-center gap-3">
  <AwSkeleton shape="avatar" />
  <div className="flex-1 flex flex-col gap-2">
    <AwSkeleton shape="title" width="60%" />
    <AwSkeleton shape="line" />
  </div>
</div>

// Custom — placeholder de gráfico 320 × 180
<AwSkeleton width={320} height={180} radius="--radius-lg" />`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Skeleton imita forma, não conteúdo. Altura igual ao row final.</>,
              <>Spinner só em botões com espera {"<"} 1 s (ex.: salvando inline).</>,
              <>Após 3 s sem dados, expor mensagem explícita — não seguir shimmerando pra sempre.</>,
            ]}
            donts={[
              <>Skeleton sem altura definida — vira zero e o layout “salta”.</>,
              <>Mais de uma cor de shimmer — sempre o tint neutro da variante.</>,
              <>Skeleton animado em reduced-motion — o ritmo é ruído acessível.</>,
            ]}
          />
        </Section>
      </div>
    </div>
    </>
  )
}
