/* eslint-disable @next/next/no-img-element */
import {
  PageHero,
  Section,
  Spec,
  CodeExample,
  DoDont,
} from "../../_primitives"

type LogoFile = {
  name: string
  path: string
  dark?: boolean
  kind: "mark" | "wordmark"
}

const files: LogoFile[] = [
  {
    name: "mark — black",
    path: "/assets/brand/awsales-mark.svg",
    kind: "mark",
  },
  {
    name: "mark — brand",
    path: "/assets/brand/awsales-mark-brand.svg",
    kind: "mark",
  },
  {
    name: "mark — white",
    path: "/assets/brand/awsales-mark-white.svg",
    kind: "mark",
    dark: true,
  },
  {
    name: "wordmark — black",
    path: "/assets/brand/awsales-wordmark-black.svg",
    kind: "wordmark",
  },
  {
    name: "wordmark — brand",
    path: "/assets/brand/awsales-wordmark-brand.svg",
    kind: "wordmark",
  },
  {
    name: "wordmark — white",
    path: "/assets/brand/awsales-wordmark-white.svg",
    kind: "wordmark",
    dark: true,
  },
]

export default function LogosPage() {
  const marks = files.filter((f) => f.kind === "mark")
  const wordmarks = files.filter((f) => f.kind === "wordmark")

  return (
    <div className="max-w-[1200px] mx-auto px-10 py-14">
      <PageHero title="Logos">
        A identidade é reduzida a uma forma primitiva: um{" "}
          <strong>A triangular</strong>, sólido, sem floreio. O{" "}
          <strong>mark</strong> é a forma autônoma; o <strong>wordmark</strong>{" "}
          acompanha em cabeçalhos, documentos e assinatura.
      </PageHero>

      <div className="flex flex-col gap-16">
        <Section
          id="anatomy"
          title="Anatomia"
          lead="A altura do mark é a unidade-raiz (x). Todas as regras de espaço e tamanho derivam dela."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-10 flex items-center gap-12 flex-wrap">
            <img
              src="/assets/brand/awsales-mark.svg"
              alt="AwSales mark"
              width={120}
              height={120}
              style={{ display: "block" }}
            />
            <div className="flex flex-col gap-3">
              <Spec
                k="unidade-raiz"
                v="x = altura do mark"
                d="Todas as medidas derivam."
              />
              <Spec
                k="clear-space"
                v="≥ 0.5x ao redor"
                d="Nenhum elemento invade esse raio."
              />
              <Spec
                k="alinhamento"
                v="baseline óptica, não matemática"
                d="O centro visual do A vira o eixo."
              />
            </div>
          </div>
        </Section>

        <Section
          id="variants"
          title="Variantes oficiais"
          lead="Seis arquivos. Use a variante que resolve o contraste do fundo — nunca recolorir um SVG existente."
        >
          <div>
            <h3 className="text-[var(--h5-size)] font-medium mb-3">Mark</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {marks.map((f) => (
                <div
                  key={f.path}
                  className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] overflow-hidden"
                  style={{
                    background: f.dark
                      ? "var(--dark-bg)"
                      : "var(--bg-raised)",
                  }}
                >
                  <div className="p-8 flex items-center justify-center min-h-[180px]">
                    <img
                      src={f.path}
                      alt={f.name}
                      width={96}
                      height={96}
                      style={{ display: "block" }}
                    />
                  </div>
                  <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-raised)] flex items-center justify-between">
                    <span className="text-sm font-medium">{f.name}</span>
                    <code className="mono text-[10px] text-[var(--fg-tertiary)]">
                      {f.path.split("/").pop()}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-[var(--h5-size)] font-medium mb-3">
              Wordmark
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {wordmarks.map((f) => (
                <div
                  key={f.path}
                  className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] overflow-hidden"
                  style={{
                    background: f.dark
                      ? "var(--dark-bg)"
                      : "var(--bg-raised)",
                  }}
                >
                  <div className="p-8 flex items-center justify-center min-h-[140px]">
                    <img
                      src={f.path}
                      alt={f.name}
                      height={28}
                      style={{ display: "block", height: 28, width: "auto" }}
                    />
                  </div>
                  <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-raised)] flex items-center justify-between">
                    <span className="text-sm font-medium">{f.name}</span>
                    <code className="mono text-[10px] text-[var(--fg-tertiary)]">
                      {f.path.split("/").pop()}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section
          id="minimum"
          title="Tamanhos mínimos"
          lead="Abaixo destes, o contrapeso do A desaparece. Nunca use menor."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-10 flex flex-wrap items-end gap-10">
            <div className="flex flex-col items-center gap-3">
              <img
                src="/assets/brand/awsales-mark.svg"
                alt="mark 16"
                width={16}
                height={16}
              />
              <div className="caption text-center">
                mark min. <b className="mono">16 px</b>
                <br />
                favicon, inline UI
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <img
                src="/assets/brand/awsales-mark.svg"
                alt="mark 24"
                width={24}
                height={24}
              />
              <div className="caption text-center">
                mark uso comum <b className="mono">24 px</b>
                <br />
                sidebar, cabeçalhos
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <img
                src="/assets/brand/awsales-wordmark-black.svg"
                alt="wordmark 20"
                height={20}
                style={{ height: 20, width: "auto" }}
              />
              <div className="caption text-center">
                wordmark min. <b className="mono">20 px alto</b>
                <br />
                documentos, e-mail
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <img
                src="/assets/brand/awsales-wordmark-black.svg"
                alt="wordmark 28"
                height={28}
                style={{ height: 28, width: "auto" }}
              />
              <div className="caption text-center">
                wordmark uso comum <b className="mono">28 px alto</b>
                <br />
                cabeçalho de página
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="context"
          title="Em contexto"
          lead="Três aplicações canônicas — product-shell, hero branco e hero escuro."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="rounded-[var(--radius-lg)] overflow-hidden flex flex-col"
              style={{ background: "var(--dark-bg)" }}
            >
              <div className="flex-1 flex items-center justify-center p-10 min-h-[180px]">
                <img
                  src="/assets/brand/awsales-mark-white.svg"
                  alt="mark on dark"
                  width={48}
                  height={48}
                />
              </div>
              <div className="px-4 py-3 border-t border-[var(--dark-border)]">
                <div
                  className="text-sm font-medium"
                  style={{ color: "var(--dark-fg-primary)" }}
                >
                  product shell
                </div>
                <div
                  className="caption"
                  style={{ color: "var(--dark-fg-tertiary)" }}
                >
                  mark branco sobre #0D0D0D
                </div>
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] bg-[var(--bg-raised)] border border-[var(--border-subtle)] overflow-hidden flex flex-col">
              <div className="flex-1 flex items-center justify-center p-10 min-h-[180px]">
                <img
                  src="/assets/brand/awsales-wordmark-black.svg"
                  alt="wordmark on light"
                  height={40}
                  style={{ height: 40, width: "auto" }}
                />
              </div>
              <div className="px-4 py-3 border-t border-[var(--border-subtle)]">
                <div className="text-sm font-medium">hero light</div>
                <div className="caption">wordmark preto sobre branco</div>
              </div>
            </div>
            <div
              className="rounded-[var(--radius-lg)] overflow-hidden flex flex-col"
              style={{
                background:
                  "linear-gradient(135deg, var(--aw-blue-600) 0%, var(--aw-purple-600) 100%)",
              }}
            >
              <div className="flex-1 flex items-center justify-center p-10 min-h-[180px]">
                <img
                  src="/assets/brand/awsales-wordmark-white.svg"
                  alt="wordmark on gradient"
                  height={40}
                  style={{ height: 40, width: "auto" }}
                />
              </div>
              <div className="px-4 py-3" style={{ background: "rgba(0,0,0,.4)" }}>
                <div
                  className="text-sm font-medium"
                  style={{ color: "#fff" }}
                >
                  hero ai-gradient
                </div>
                <div
                  className="caption"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  wordmark branco sobre mesh oficial
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="code"
          title="Em código"
          lead="Sempre referencie os SVG de /public/assets/brand/. Não inline SVG inline em JSX — preserva cache e permite swap por variante."
        >
          <CodeExample>{`import Image from "next/image"

// Product shell / sidebar — dark surface, branco.
<img src="/assets/brand/awsales-mark-white.svg" alt="AwSales" width={24} height={24} />

// Cabeçalho em superfície clara.
<img src="/assets/brand/awsales-wordmark-black.svg" alt="AwSales" style={{ height: 28, width: "auto" }} />

// Next/Image para hero cacheado.
<Image src="/assets/brand/awsales-mark-brand.svg" alt="AwSales" width={96} height={96} />`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Uma variante por contexto — a cor do fundo escolhe qual usar.</>,
              <>Manter clear-space ≥ 0.5x em torno do mark.</>,
              <>Usar SVG em tudo — PNG 3x só quando o destino não aceita vetorial.</>,
            ]}
            donts={[
              <>Esticar, achatar ou escalar eixos separadamente.</>,
              <>Rotacionar, inclinar ou espelhar o A.</>,
              <>Colocar sobre fundo colorido arbitrário que não seja preto, branco ou o mesh.</>,
              <>Adicionar sombra, bevel ou glow — o A é sólido, plano, geométrico.</>,
              <>Recolorir o SVG — use o arquivo da variante correta.</>,
            ]}
          />
        </Section>
      </div>
    </div>
  )
}
