import { AwBreadcrumb } from "@/components/ui/AwBreadcrumb"
import { Icon } from "@/components/ui/Icon"
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

export default function BreadcrumbPage() {
  return (
    <>
      <PageHero title="Breadcrumb">
        Navegação hierárquica compacta usada no topo de páginas para indicar
        onde o usuário está. Texto pequeno, separador discreto, último item
        sempre marcado com <code className="mono">aria-current="page"</code>.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="basic"
            title="Uso padrão"
            lead="Lista de itens com label e href. O último item é renderizado como texto, não como link, mesmo que tenha href."
          >
            <Stage label="3 níveis — root → seção → página atual">
              <AwBreadcrumb
                items={[
                  { label: "Início", href: "/" },
                  { label: "Canais", href: "/canais" },
                  { label: "WhatsApp" },
                ]}
              />
            </Stage>
          </Section>

          <Section
            id="separator"
            title="Separador customizado"
            lead='Default é "/" mas qualquer ReactNode serve — chevron, dot, ícone.'
          >
            <Stage
              label='separator="/" (default) · "›" · ícone'
              gridClassName="flex flex-col gap-4"
            >
              <AwBreadcrumb
                items={[
                  { label: "Configurações", href: "/settings" },
                  { label: "Integrações", href: "/settings/integrations" },
                  { label: "Meta Business" },
                ]}
              />
              <AwBreadcrumb
                separator="›"
                items={[
                  { label: "Configurações", href: "/settings" },
                  { label: "Integrações", href: "/settings/integrations" },
                  { label: "Meta Business" },
                ]}
              />
              <AwBreadcrumb
                separator={<Icon name="chevron_right" size={14} />}
                items={[
                  { label: "Configurações", href: "/settings" },
                  { label: "Integrações", href: "/settings/integrations" },
                  { label: "Meta Business" },
                ]}
              />
            </Stage>
          </Section>

          <Section
            id="with-icons"
            title="Itens com ícone"
            lead="O label aceita qualquer ReactNode — útil pra prefixar uma raiz com ícone (Dashboard, Tools, Canais)."
          >
            <Stage label="Root com ícone + label">
              <AwBreadcrumb
                items={[
                  {
                    label: (
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="dashboard" size={14} />
                        Dashboard
                      </span>
                    ),
                    href: "/dashboard",
                  },
                  { label: "Performance", href: "/dashboard/performance" },
                  { label: "Última semana" },
                ]}
              />
            </Stage>
          </Section>

          <Section
            id="single"
            title="Página raiz"
            lead="Um único item — usado em telas top-level. O item é renderizado como current automaticamente."
          >
            <Stage label="1 item — Dashboard">
              <AwBreadcrumb
                items={[
                  {
                    label: (
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="dashboard" size={14} />
                        Dashboard
                      </span>
                    ),
                  },
                ]}
              />
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Componente puro, sem estado próprio. Cabe ao consumidor compor o array de items."
          >
            <ApiTable>
              <PropRow
                prop="items"
                type="AwBreadcrumbItem[]"
                doc='Lista ordenada do mais raso ao mais profundo. Cada item: { label, href?, current? }.'
              />
              <PropRow
                prop="separator"
                type="React.ReactNode"
                def='"/"'
                doc="Renderizado entre cada par de itens. Aceita string, ícone ou JSX."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Mergeado na classe `aw-crumbs` da raiz <nav>."
              />
            </ApiTable>

            <CodeExample label="exemplo" lang="tsx">
              {`<AwBreadcrumb
  items={[
    { label: "Início", href: "/" },
    { label: "Canais", href: "/canais" },
    { label: "WhatsApp" }, // sem href → renderizado como current
  ]}
/>`}
            </CodeExample>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Estilos vivem em globals.css sob .aw-crumbs e descendentes. Tokens são lidos via CSS variables — nada hardcoded."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Spec
                k="container"
                v="<nav aria-label='Breadcrumb'>"
                d="Semântica acessível por padrão; screen readers anunciam como breadcrumb."
              />
              <Spec
                k="link"
                v="--fg-secondary → --fg-primary"
                d="Cor sobe no hover; sem underline."
              />
              <Spec
                k="current"
                v="--fg-primary + aria-current='page'"
                d="Último item ou item com current: true."
              />
              <Spec
                k="separador"
                v="--fg-tertiary @ 0.5 opacity"
                d="Mais discreto que o link; aria-hidden."
              />
            </div>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Use no topo de páginas com hierarquia clara (3+ níveis).</>,
                <>Mantenha labels curtos — use o nome curto da seção, não a página inteira.</>,
                <>Sempre marque o último item como current (sem href).</>,
              ]}
              donts={[
                <>Não use como navegação principal — é orientação contextual.</>,
                <>Não inclua o título da página atual repetido em h1 + breadcrumb.</>,
                <>Não troque o separador no meio da app — escolha um e mantenha.</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
