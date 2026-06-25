import {
  AW_BROWSER_ICON_KEYS,
  AwBrowserIcon,
  getBrowserKey,
} from "@/components/ui/AwBrowserIcon"
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  RelatedLinks,
  Section,
  Stage,
  TokensConsumed,
} from "../../_primitives"

const CATALOG: Record<string, string> = {
  chrome: "Chrome 124",
  firefox: "Firefox",
  safari: "Safari 17",
  edge: "Edge",
}

const RESOLVE_SAMPLES = [
  "Chrome 124",
  "Google Chrome",
  "Mozilla Firefox",
  "Safari",
  "Microsoft Edge",
  "Brave",
  "Opera",
]

const SESSION_ROWS: Array<{ browser: string; meta: string; note: string }> = [
  {
    browser: "Chrome 124",
    meta: "Chrome · macOS · São Paulo, BR",
    note: "Ativo agora",
  },
  {
    browser: "Safari 17",
    meta: "Safari · iPhone · São Paulo, BR",
    note: "Há 2 horas",
  },
]

export default function BrowserIconPage() {
  return (
    <>
      <PageHero title="Browser icon">
        Marca oficial do navegador para listas de sessões, acessos e auditoria —
        renderiza o logo real do Chrome, Firefox, Safari ou Edge. Mesma curadoria
        do <code className="mono">AwBrandLogo</code>, então a sessão mostra a
        identidade verdadeira do vendor em vez de uma aproximação desenhada à mão.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="rounded-md border border-(--aw-blue-200) bg-(--aw-blue-100) px-5 py-4 mb-10 text-sm text-(--aw-blue-900)">
          <strong>AwBrowserIcon = marca de NAVEGADOR (sessões).</strong> Para
          tipo de arquivo (PDF, planilha…) use{" "}
          <a
            href="/bombardier/styleguide/components/aw-file-icon"
            className="underline underline-offset-2 hover:text-(--aw-blue-700)"
          >
            AwFileIcon
          </a>
          ; para canais (WhatsApp, IG…) use{" "}
          <a
            href="/bombardier/styleguide/components/aw-channel-icon"
            className="underline underline-offset-2 hover:text-(--aw-blue-700)"
          >
            AwChannelIcon
          </a>
          ; para apps e integrações de terceiros use{" "}
          <a
            href="/bombardier/styleguide/components/brand-logo"
            className="underline underline-offset-2 hover:text-(--aw-blue-700)"
          >
            AwBrandLogo
          </a>
          . Cada lane tem seu registry — não cruze.
        </div>

        <div className="flex flex-col gap-16">
          <Section
            id="catalog"
            title="Catálogo"
            lead="Os quatro navegadores com marca dedicada (AW_BROWSER_ICON_KEYS, congelado) mais o globo neutro que cobre qualquer string desconhecida. Os logos são SVGs oficiais do Iconify servidos de /assets/integrations/iconify/<key>.svg."
          >
            <Stage
              label="AW_BROWSER_ICON_KEYS + fallback"
              gridClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
            >
              {AW_BROWSER_ICON_KEYS.map((key) => (
                <div
                  key={key}
                  className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)"
                >
                  <AwBrowserIcon browser={CATALOG[key]} size={28} />
                  <span className="mono">{key}</span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)">
                <AwBrowserIcon browser="Brave" size={28} />
                <span className="mono">globe (fallback)</span>
              </div>
            </Stage>
          </Section>

          <Section
            id="sizes"
            title="Tamanhos"
            lead="size é o lado do quadrado em px (default 20). O mesmo navegador escalando — use 16 em linhas densas e 28/40 em destaques ou cabeçalhos de sessão."
          >
            <Stage
              label="size · 16 / 20 / 28 / 40"
              gridClassName="flex items-end gap-6"
            >
              {[16, 20, 28, 40].map((s) => (
                <div
                  key={s}
                  className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)"
                >
                  <AwBrowserIcon browser="Chrome 124" size={s} />
                  <span className="mono">{s}px</span>
                </div>
              ))}
            </Stage>
          </Section>

          <Section
            id="resolve"
            title="Resolução por string"
            lead="getBrowserKey normaliza a string crua por substring case-insensitive ('Google Chrome' → chrome). Tudo que não bate em chrome/firefox/safari/edge cai no globo neutro — a linha nunca renderiza vazia."
          >
            <Stage
              label='getBrowserKey("…")'
              gridClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            >
              {RESOLVE_SAMPLES.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-3 rounded-md border border-(--border-subtle) bg-(--bg-surface) p-2.5"
                >
                  <AwBrowserIcon browser={s} size={24} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-(--fg-primary)">
                      {s}
                    </div>
                    <div className="mono text-[11px] text-(--fg-tertiary)">
                      → {getBrowserKey(s)}
                    </div>
                  </div>
                </div>
              ))}
            </Stage>
          </Section>

          <Section
            id="composition"
            title="Composição"
            lead="Uso real: a marca abre a linha de sessão, seguida de navegador · sistema · localização e um caption de status. Mesma escala do AwBrandLogo pra alinhar em listas mistas."
          >
            <Stage label="Linhas de sessão (mock)" gridClassName="flex flex-col gap-2">
              {SESSION_ROWS.map((row) => (
                <div
                  key={row.meta}
                  className="flex w-full max-w-[420px] items-center gap-3 rounded-md border border-(--border-subtle) bg-(--bg-surface) p-2.5"
                >
                  <AwBrowserIcon browser={row.browser} size={20} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-(--fg-primary)">
                      {row.meta}
                    </div>
                    <div className="caption text-(--fg-tertiary)">
                      {row.note}
                    </div>
                  </div>
                </div>
              ))}
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead={`Import: import { AwBrowserIcon, AW_BROWSER_ICON_KEYS, getBrowserKey } from "@/components/ui/AwBrowserIcon".`}
          >
            <ApiTable>
              <PropRow
                prop="browser"
                type="string"
                doc="String crua do navegador vinda da data ('Chrome 124', 'Safari'). Normalizada por substring via getBrowserKey. Obrigatória."
              />
              <PropRow
                prop="size"
                type="number"
                def="20"
                doc="Lado do quadrado em px. Marca e globo escalam juntos."
              />
              <PropRow
                prop="...rest"
                type="HTMLAttributes<HTMLSpanElement>"
                doc="Atributos nativos do <span> wrapper (className, style, data-*…)."
              />
            </ApiTable>
            <CodeExample>{`import { AwBrowserIcon } from "@/components/ui/AwBrowserIcon"

// string crua da sessão
<AwBrowserIcon browser="Chrome 124" />

// tamanho custom
<AwBrowserIcon browser="Safari 17" size={28} />

// navegador desconhecido → globo neutro
<AwBrowserIcon browser="Brave" />`}</CodeExample>
          </Section>

          <Section
            id="tokens"
            title="Tokens consumidos"
            lead="As marcas são SVGs oficiais multicoloridos dos vendors — intencionalmente NÃO tokenizadas, na mesma lane do AwBrandLogo. Só o globo de fallback segue currentColor e herda a cor de texto do contexto."
          >
            <TokensConsumed
              tokens={[
                {
                  token: "currentColor",
                  role: "fallback globo segue a cor de texto do contexto",
                  value: "—",
                },
              ]}
            />
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>
                  Use para identificar o navegador em listas de sessões, acessos
                  e auditoria de segurança.
                </>,
                <>
                  Passe a string crua da data (
                  <code className="mono">browser="Chrome 124"</code>) — o
                  componente normaliza sozinho.
                </>,
                <>
                  Combine com <code className="mono">AwBrandLogo</code> na mesma
                  escala em listas mistas.
                </>,
              ]}
              donts={[
                <>
                  Usar para apps ou integrações de terceiros — isso é{" "}
                  <code className="mono">AwBrandLogo</code>.
                </>,
                <>
                  Recolorir as marcas oficiais — os logos são os SVGs reais dos
                  vendors, por design.
                </>,
                <>
                  Esperar tile colorido ou label — esse é o padrão do{" "}
                  <code className="mono">AwFileIcon</code>, não daqui.
                </>,
              ]}
            />
          </Section>

          <RelatedLinks
            items={[
              {
                name: "File icon",
                href: "/bombardier/styleguide/components/aw-file-icon",
                description: "Tipo de arquivo (PDF, planilha...).",
              },
              {
                name: "Channel icon",
                href: "/bombardier/styleguide/components/aw-channel-icon",
                description: "Ícone de canal (WhatsApp, IG...).",
              },
              {
                name: "Brand logo",
                href: "/bombardier/styleguide/components/brand-logo",
                description: "Marcas de terceiros e meios de pagamento.",
              },
            ]}
          />
        </div>
      </div>
    </>
  )
}
