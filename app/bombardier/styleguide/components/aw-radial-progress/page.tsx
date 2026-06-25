import { AwRadialProgress } from "@/components/ui/AwRadialProgress"
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  RelatedLinks,
  Section,
  Spec,
  Stage,
  StatesMatrix,
  Tldr,
  TokensConsumed,
} from "../../_primitives"

export default function RadialProgressPage() {
  return (
    <>
      <PageHero title="Radial progress">
        Anel de progresso circular com o percentual no centro. Usado para
        mostrar consumo/uso, quotas e score — onde existe um teto claro e o
        formato em anel comunica progresso de forma compacta.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>
              Mostrar progresso ou uso como anel com{" "}
              <code className="mono">%</code> no centro — quota de agentes,
              consumo, score.
            </>,
            <>
              Quando há um teto definido (<code className="mono">max</code>) e o
              formato circular comunica melhor que uma barra.
            </>,
          ]}
          dontUse={[
            <>
              Barra linear simples — use{" "}
              <code className="mono">AwProgress</code>.
            </>,
            <>
              Métrica sem teto (sem <code className="mono">max</code> claro) —
              use o <code className="mono">Stat card</code>.
            </>,
          ]}
        />

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Dois círculos SVG sobrepostos: o trilho de fundo e o arco preenchido. No centro, o percentual e um caption opcional. O SVG é rotacionado -90° para o arco começar no topo."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex justify-center md:col-span-1">
              <AwRadialProgress
                value={64}
                max={100}
                size={140}
                caption="trilho · arco · centro"
              />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Spec
                k="trilho (track)"
                v="--bg-muted"
                d="Círculo de fundo, espessura = thickness."
              />
              <Spec
                k="arco (arc)"
                v="--accent-brand"
                d="Preenchimento; strokeLinecap round."
              />
              <Spec
                k="percentual central"
                v="--fg-primary"
                d="Round(value / max · 100) + %."
              />
              <Spec k="caption" v="--fg-tertiary" d="Texto opcional abaixo do %." />
              <Spec k="size" v="120 px" d="Default. Diâmetro do anel." />
              <Spec k="thickness" v="10 px" d="Default. Espessura do stroke." />
              <Spec k="raio" v="(size − thickness) / 2" d="Raio interno do círculo." />
              <Spec
                k="animação"
                v="stroke-dashoffset 500ms"
                d="ease-out ao mudar o value."
              />
            </div>
          </div>
        </Section>

        <Section
          id="variants"
          title="Variantes"
          lead="O percentual central e o caption são independentes: mostre os dois, só o percentual, ou um anel limpo sem texto."
        >
          <Stage label="showPercent · caption" gridClassName="flex flex-wrap items-center gap-10">
            <div className="flex flex-col items-center gap-2">
              <AwRadialProgress value={12} max={20} />
              <span className="caption">showPercent (default)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AwRadialProgress value={12} max={20} caption="de 20 agentes" />
              <span className="caption">com caption</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AwRadialProgress value={12} max={20} showPercent={false} />
              <span className="caption">só anel (showPercent=false)</span>
            </div>
          </Stage>
        </Section>

        <Section
          id="sizes"
          title="Tamanhos"
          lead="Diâmetro livre via size; ajuste o thickness proporcionalmente para manter o anel equilibrado em cada escala."
        >
          <Stage label="size · 72 / 120 / 160" gridClassName="flex flex-wrap items-end gap-10">
            <AwRadialProgress value={64} max={100} size={72} thickness={8} />
            <AwRadialProgress value={64} max={100} size={120} thickness={10} />
            <AwRadialProgress value={64} max={100} size={160} thickness={14} />
          </Stage>
        </Section>

        <Section
          id="colors"
          title="Cores"
          lead="arcColor e trackColor sempre por token via var(--…) — nunca hex. Use os accents semânticos para comunicar estado (sucesso, atenção, perigo)."
        >
          <Stage label="arcColor por token" gridClassName="flex flex-wrap items-center gap-10">
            <div className="flex flex-col items-center gap-2">
              <AwRadialProgress value={70} max={100} arcColor="var(--accent-brand)" />
              <span className="caption mono">--accent-brand</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AwRadialProgress value={70} max={100} arcColor="var(--accent-success)" />
              <span className="caption mono">--accent-success</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AwRadialProgress value={70} max={100} arcColor="var(--accent-warning)" />
              <span className="caption mono">--accent-warning</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AwRadialProgress value={70} max={100} arcColor="var(--accent-danger)" />
              <span className="caption mono">--accent-danger</span>
            </div>
          </Stage>
          <div className="mt-4">
            <Stage label="trackColor custom (token)" gridClassName="flex flex-wrap items-center gap-10">
              <div className="flex flex-col items-center gap-2">
                <AwRadialProgress
                  value={45}
                  max={100}
                  arcColor="var(--accent-success)"
                  trackColor="var(--aw-emerald-100)"
                />
                <span className="caption mono">track --aw-emerald-100</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AwRadialProgress
                  value={80}
                  max={100}
                  arcColor="var(--accent-danger)"
                  trackColor="var(--aw-red-100)"
                />
                <span className="caption mono">track --aw-red-100</span>
              </div>
            </Stage>
          </div>
        </Section>

        <Section
          id="states"
          title="Estados"
          lead="O value é clampado entre 0 e max. Os extremos: vazio (0%), em progresso e completo (100%)."
        >
          <StatesMatrix
            columns={3}
            states={[
              {
                name: "vazio",
                node: <AwRadialProgress max={100} value={0} size={96} />,
                note: "value = 0",
              },
              {
                name: "em progresso",
                node: <AwRadialProgress max={100} value={35} size={96} />,
                note: "value = 35",
              },
              {
                name: "completo",
                node: (
                  <AwRadialProgress
                    max={100}
                    value={100}
                    size={96}
                    arcColor="var(--accent-success)"
                  />
                ),
                note: "value = 100",
              },
            ]}
          />
        </Section>

        <Section
          id="composition"
          title="Composição"
          lead="Card de uso real: o anel com caption ao lado de um texto explicativo. Encaixa em painéis de quota, billing e overview de workspace."
        >
          <Stage label="Card de uso (quota de agentes)" gridClassName="flex">
            <div className="flex items-center gap-6 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 max-w-[460px]">
              <AwRadialProgress
                value={12}
                max={20}
                size={104}
                caption="12 de 20 agentes"
              />
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-(--fg-primary)">
                  Agentes ativos
                </div>
                <p className="body-sm text-(--fg-secondary) m-0">
                  Você usou 12 dos 20 agentes do seu plano. Faça upgrade para
                  liberar mais slots e equipes paralelas.
                </p>
              </div>
            </div>
          </Stage>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwRadialProgress } from "@/components/ui/AwRadialProgress".`}
        >
          <ApiTable>
            <PropRow
              prop="value"
              type="number"
              doc="Valor atual. Obrigatório. Clampado entre 0 e max."
            />
            <PropRow
              prop="max"
              type="number"
              doc="Valor máximo (teto). Obrigatório. Define 100% do anel."
            />
            <PropRow
              prop="size"
              type="number"
              def="120"
              doc="Diâmetro do anel em px."
            />
            <PropRow
              prop="thickness"
              type="number"
              def="10"
              doc="Espessura do stroke em px."
            />
            <PropRow
              prop="caption"
              type="ReactNode"
              doc="Texto opcional renderizado abaixo do percentual, no centro."
            />
            <PropRow
              prop="showPercent"
              type="boolean"
              def="true"
              doc="Mostra o percentual grande no centro."
            />
            <PropRow
              prop="arcColor"
              type="string"
              def='"var(--accent-brand)"'
              doc="Cor do arco preenchido. Use um token via var(--…)."
            />
            <PropRow
              prop="trackColor"
              type="string"
              def='"var(--bg-muted)"'
              doc="Cor do trilho de fundo. Use um token via var(--…)."
            />
            <PropRow
              prop="className"
              type="string"
              doc="Classes extras no wrapper (div)."
            />
            <PropRow
              prop="...rest"
              type="HTMLAttributes<HTMLDivElement>"
              doc="Atributos nativos de <div>."
            />
          </ApiTable>
        </Section>

        <Section
          id="tokens"
          title="Tokens consumidos"
          lead="Cores default lidas do contexto. arcColor e trackColor podem ser sobrescritos — sempre por token."
        >
          <TokensConsumed
            tokens={[
              {
                token: "--accent-brand",
                role: "arco preenchido (default)",
                value: "var(--accent-brand)",
              },
              {
                token: "--bg-muted",
                role: "trilho de fundo (default)",
              },
              {
                token: "--fg-primary",
                role: "percentual central",
              },
              {
                token: "--fg-tertiary",
                role: "caption",
              },
            ]}
          />
        </Section>

        <Section id="code" title="Code">
          <CodeExample>{`import { AwRadialProgress } from "@/components/ui/AwRadialProgress"

// básico — value / max
<AwRadialProgress value={64} max={100} />

// com caption no centro
<AwRadialProgress value={12} max={20} caption="de 20 agentes" />

// cor de sucesso via token
<AwRadialProgress
  value={100}
  max={100}
  arcColor="var(--accent-success)"
/>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>
                Use para uso/quota com teto claro: agentes, consumo, créditos,
                score.
              </>,
              <>
                Defina <code className="mono">arcColor</code> por token semântico
                para comunicar estado (sucesso, atenção, perigo).
              </>,
              <>
                Ajuste <code className="mono">thickness</code> junto com{" "}
                <code className="mono">size</code> para manter o anel
                equilibrado.
              </>,
            ]}
            donts={[
              <>
                Usar para uma barra linear simples — esse é o papel do{" "}
                <code className="mono">AwProgress</code>.
              </>,
              <>
                Passar cor como hex ou valor arbitrário — sempre{" "}
                <code className="mono">var(--…)</code>.
              </>,
              <>
                Mostrar métrica sem teto (sem <code className="mono">max</code>{" "}
                real) — para isso existe o <code className="mono">Stat card</code>.
              </>,
            ]}
          />
        </Section>

        <RelatedLinks
          items={[
            {
              name: "Progress",
              href: "/bombardier/styleguide/components/aw-progress",
              description: "Barra linear determinada/indeterminada.",
            },
            {
              name: "Consumption bar",
              href: "/bombardier/styleguide/components/aw-consumption-bar",
              description: "Uso/quota em barra.",
            },
            {
              name: "Stat card",
              href: "/bombardier/styleguide/components/aw-stat-card",
              description: "Métrica única com delta.",
            },
          ]}
        />
      </div>
    </>
  )
}
