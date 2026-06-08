import {
  AW_FILE_ICON_REGISTRY,
  AwFileIcon,
  awFileIconTypeFromExt,
} from "@/components/ui/AwFileIcon"
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

const ATTACHMENTS: Array<{
  name: string
  meta: string
  ext: string
}> = [
  { name: "bombardier-review-2026-05-11.json", meta: "Arquivo · 11 mai 2026", ext: "json" },
  { name: "Invoice-7B923C2F-0008.pdf", meta: "PDF · 11 mai 2026", ext: "pdf" },
  { name: "Screenshot 2026-05-11 at 14.37.37.png", meta: "Imagem · 11 mai 2026", ext: "png" },
  { name: "Leads-Q2-2026.xlsx", meta: "Planilha · 980 KB", ext: "xlsx" },
  { name: "playbook-discovery.docx", meta: "Documento · 1.2 MB", ext: "docx" },
  { name: "demo-call.mp4", meta: "Vídeo · 48 MB", ext: "mp4" },
]

export default function FileIconPage() {
  return (
    <>
      <PageHero title="File icon">
        Tile colorido com glifo branco que identifica o tipo de arquivo numa
        lista — mesma anatomia do{" "}
        <code className="mono">AwBrandLogo</code>, mas o registry mapeia formato
        (PDF, planilha, JSON…) em vez de marca. Visual inspirado nos chips de
        attachment do ChatGPT: vermelho = PDF, verde = planilha, slate = JSON,
        e por aí vai.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="rounded-md border border-(--aw-blue-200) bg-(--aw-blue-100) px-5 py-4 mb-10 text-sm text-(--aw-blue-900)">
          <strong>AwFileIcon vs AwBrandLogo.</strong> Use{" "}
          <code className="mono">AwFileIcon</code> para representar formato de
          arquivo (PDF, XLS, JSON…). Para meios de pagamento (Pix, boleto,
          cartão) e marcas de terceiros (Stripe, WhatsApp…), use{" "}
          <a
            href="/bombardier/styleguide/components/brand-logo"
            className="underline underline-offset-2 hover:text-(--aw-blue-700)"
          >
            AwBrandLogo
          </a>
          .
        </div>

        <div className="flex flex-col gap-16">
          <Section
            id="sizes"
            title="Tamanhos"
            lead="Três presets canônicos. O tile arredondado e o glifo interno escalam juntos — escala idêntica ao AwBrandLogo pra alinhar visualmente em listas mistas."
          >
            <Stage label="size · sm / md / lg">
              <AwFileIcon type="pdf" size="sm" />
              <AwFileIcon type="pdf" size="md" />
              <AwFileIcon type="pdf" size="lg" />
            </Stage>
          </Section>

          <Section
            id="bare"
            title="Bare (chip compacto)"
            lead="Versão menor sem outer chrome, mantém o bg colorido. Usar dentro de listas densas ou linhas de tabela."
          >
            <Stage label="bare={true}">
              <AwFileIcon type="pdf" bare />
              <AwFileIcon type="spreadsheet" bare />
              <AwFileIcon type="image" bare />
              <AwFileIcon type="json" bare />
              <AwFileIcon type="zip" bare />
              <AwFileIcon type="audio" bare />
            </Stage>
          </Section>

          <Section
            id="with-label"
            title="Com label"
            lead="Adiciona o caption do tipo abaixo do tile — formato exato dos cards de upload do ChatGPT/Claude. Use em estados vazios e zonas de drop."
          >
            <Stage label="withLabel">
              <AwFileIcon type="pdf" withLabel />
              <AwFileIcon type="spreadsheet" withLabel />
              <AwFileIcon type="image" withLabel />
              <AwFileIcon type="json" withLabel />
              <AwFileIcon type="presentation" withLabel />
              <AwFileIcon type="video" withLabel />
            </Stage>
          </Section>

          <Section
            id="attachment-list"
            title="Lista de anexos (uso real)"
            lead="Padrão de attachment chip à la ChatGPT: tile colorido + nome + meta. Encaixa em chat bubbles, knowledge base, sources de agente."
          >
            <Stage label="Lista mock" gridClassName="flex flex-col gap-2">
              {ATTACHMENTS.map((f) => (
                <div
                  key={f.name}
                  className="flex w-full max-w-[420px] items-center gap-3 rounded-md border border-(--border-subtle) bg-(--bg-surface) p-2.5"
                >
                  <AwFileIcon ext={f.ext} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-(--fg-primary)">
                      {f.name}
                    </div>
                    <div className="text-xs text-(--fg-tertiary)">
                      {f.meta}
                    </div>
                  </div>
                </div>
              ))}
            </Stage>
          </Section>

          <Section
            id="ext-resolver"
            title="Resolução por extensão"
            lead="A prop ext aceita filename ('Invoice-1.pdf') ou extensão pura ('pdf'). Cai em generic para tudo que não mapeou. Útil pra renderizar uploads dinâmicos sem switch."
          >
            <Stage
              label='ext="…"'
              gridClassName="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {[
                "report.pdf",
                "data.csv",
                "schema.json",
                "presentation.pptx",
                "logo.svg",
                "track.mp3",
                "build.sh",
                "archive.zip",
                "notes.md",
                "unknown.xyz",
              ].map((file) => (
                <div
                  key={file}
                  className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)"
                >
                  <AwFileIcon ext={file} size="md" />
                  <span className="mono">{file}</span>
                  <span className="mono opacity-70">
                    → {awFileIconTypeFromExt(file)}
                  </span>
                </div>
              ))}
            </Stage>
          </Section>

          <Section
            id="registry"
            title="Registry"
            lead={`${AW_FILE_ICON_REGISTRY.length} tipos disponíveis. Para adicionar, edite o objeto TYPES em components/ui/AwFileIcon.tsx — uma entrada (id → bg + mark inline).`}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6">
              {AW_FILE_ICON_REGISTRY.map((id) => (
                <div
                  key={id}
                  className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)"
                >
                  <AwFileIcon type={id} size="md" />
                  <span className="mono">{id}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Tile + glifo. Cor do tile usa tokens da paleta AwSales (var(--aw-red-600), var(--aw-emerald-600)…) — nada de hex hardcoded. Glifo interno sempre branco."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Spec k="tile sm" v="32 × 32 px" d="Glifo: ~55% do tile" />
              <Spec k="tile md" v="40 × 40 px" d="Default. glifo: ~22px" />
              <Spec k="tile lg" v="56 × 56 px" d="Glifo: ~31px" />
              <Spec k="radius" v="10px (tile) · 26% (bare)" />
              <Spec
                k="bg"
                v="--aw-*-600 (palette)"
                d="Vermelho=pdf, verde=xls, gray-1000=json, etc."
              />
              <Spec k="fg" v="#fff" d="Glifo branco em tudo." />
            </div>
          </Section>

          <Section
            id="api"
            title="API"
            lead={`Import: import { AwFileIcon, awFileIconTypeFromExt, AW_FILE_ICON_REGISTRY } from "@/components/ui/AwFileIcon".`}
          >
            <ApiTable>
              <PropRow
                prop="type"
                type='"pdf" | "doc" | "spreadsheet" | "csv" | "json" | "txt" | "image" | "video" | "audio" | "zip" | "code" | "presentation" | "generic"'
                def='"generic"'
                doc="Tipo no registry. Ignorado quando ext é passada."
              />
              <PropRow
                prop="ext"
                type="string"
                doc="Filename ou extensão. Resolve via awFileIconTypeFromExt. Cai em generic se não mapeou."
              />
              <PropRow
                prop="size"
                type='"sm" | "md" | "lg"'
                def='"md"'
                doc="Tamanho do tile. Tile e glifo escalam juntos."
              />
              <PropRow
                prop="bare"
                type="boolean"
                def="false"
                doc="Chip compacto sem outer chrome — bg colorido segue vivo."
              />
              <PropRow
                prop="withLabel"
                type="boolean"
                def="false"
                doc="Adiciona caption uppercase do tipo abaixo do tile (formato ChatGPT)."
              />
              <PropRow
                prop="alt"
                type="string"
                doc="Acessível. Default: label do tipo resolvido (ex: 'PDF')."
              />
              <PropRow
                prop="...rest"
                type="HTMLAttributes<HTMLDivElement>"
                doc="Atributos nativos de <div>."
              />
            </ApiTable>
            <CodeExample>{`import { AwFileIcon } from "@/components/ui/AwFileIcon"

// por tipo
<AwFileIcon type="pdf" />

// por filename (resolve a extensão)
<AwFileIcon ext="Invoice-7B923C2F.pdf" size="lg" />

// versão compacta + label (estilo ChatGPT)
<AwFileIcon type="spreadsheet" withLabel />

// chip inline em lista
<AwFileIcon type="json" bare />`}</CodeExample>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>
                  Use em listas de attachments, knowledge base, source pickers
                  de agente.
                </>,
                <>
                  Use <code className="mono">ext</code> quando o tipo vem do
                  upload — evita switch no caller.
                </>,
                <>
                  Combine com <code className="mono">AwBrandLogo</code> em
                  listas mistas (mesma escala).
                </>,
              ]}
              donts={[
                <>
                  Reaproveitar pra meios de pagamento (Pix, boleto, cartão) —
                  esses moram no AwBrandLogo.
                </>,
                <>
                  Aplicar cor custom de marca — a paleta é fixa por tipo, por
                  consistência visual.
                </>,
                <>
                  Usar pra ícones funcionais de UI (lixeira, lápis…) — pra isso
                  existe o <code className="mono">Icon</code>.
                </>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
