import {
  AwBreadcrumbs,
  AwBreadcrumbsBar,
} from "@/components/ui/AwBreadcrumbsBar"
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

export default function BreadcrumbsBarPage() {
  return (
    <>
      <PageHero title="Breadcrumbs bar">
        A trilha de navegação que ocupa uma faixa no topo das páginas de
        produto — separador em chevron, altura fixa de 44px e fundo{" "}
        <code className="mono">--bg-raised</code>. Esconde-se sozinha quando há
        um único item (o label só duplicaria o título da página).
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="rounded-md border border-(--aw-blue-200) bg-(--aw-blue-100) px-5 py-4 mb-10 text-sm text-(--aw-blue-900)">
          <strong>Breadcrumbs bar vs Breadcrumb.</strong> Esta é a{" "}
          <strong>faixa</strong> de chrome com fundo e altura próprios, usada no
          topo das telas. Para a trilha crua e configurável (separador
          customizável, página raiz), use{" "}
          <a
            href="/bombardier/styleguide/components/aw-breadcrumb"
            className="underline underline-offset-2 hover:text-(--aw-blue-700)"
          >
            o primitivo Breadcrumb
          </a>
          .
        </div>
        <div className="flex flex-col gap-16">
          <Section
            id="bar"
            title="Barra completa"
            lead="AwBreadcrumbsBar embrulha a trilha numa faixa de 44px com fundo --bg-raised e padding horizontal padrão (px-8)."
          >
            <Stage label="2+ níveis" gridClassName="block">
              <div className="rounded-lg border border-(--border-subtle) overflow-hidden">
                <AwBreadcrumbsBar
                  items={[
                    { label: "Canais", href: "/canais" },
                    { label: "WhatsApp", href: "/canais/whatsapp" },
                    { label: "Marina Cosméticos" },
                  ]}
                />
              </div>
            </Stage>
          </Section>

          <Section
            id="icons"
            title="Itens com ícone"
            lead="Cada item aceita um ReactNode em `icon`, renderizado antes do label na cor --fg-primary."
          >
            <Stage label="Raiz com ícone" gridClassName="block">
              <div className="rounded-lg border border-(--border-subtle) overflow-hidden">
                <AwBreadcrumbsBar
                  items={[
                    {
                      label: "Configurações",
                      href: "/settings",
                      icon: <Icon name="settings" size={16} />,
                    },
                    {
                      label: "Financeiro",
                      href: "/settings/financeiro",
                      icon: <Icon name="account_balance_wallet" size={16} />,
                    },
                    { label: "Métodos de pagamento" },
                  ]}
                />
              </div>
            </Stage>
          </Section>

          <Section
            id="strings"
            title="Atalho com strings"
            lead="Itens podem ser strings simples quando não há href nem ícone — o último vira sempre o item atual (--fg-tertiary)."
          >
            <Stage label='items={["...", "..."]}' gridClassName="block">
              <div className="rounded-lg border border-(--border-subtle) overflow-hidden">
                <AwBreadcrumbsBar items={["Biblioteca", "Templates", "Boas-vindas"]} />
              </div>
            </Stage>
          </Section>

          <Section
            id="bare"
            title="Só a trilha (AwBreadcrumbs)"
            lead="Para compor a trilha dentro de outro container — header inline, toolbar — use AwBreadcrumbs sem a faixa."
          >
            <Stage label="AwBreadcrumbs">
              <AwBreadcrumbs
                items={[
                  { label: "Início", href: "/" },
                  { label: "Agentes", href: "/agent-studio" },
                  { label: "Novo agente" },
                ]}
              />
            </Stage>
          </Section>

          <Section
            id="single"
            title="Item único — esconde"
            lead="Com 0 ou 1 item a barra não renderiza nada (retorna null): a trilha só faz sentido como caminho."
          >
            <Stage label='items={["Dashboard"]} → nada' gridClassName="block">
              <div className="rounded-lg border border-dashed border-(--border-subtle) p-4 text-center caption">
                <AwBreadcrumbsBar items={["Dashboard"]} />
                Sem render — apenas um item.
              </div>
            </Stage>
          </Section>

          <Section id="api" title="API">
            <ApiTable>
              <PropRow
                prop="items"
                type="(string | BreadcrumbItem)[]"
                doc="Trilha do mais raso ao mais profundo. String vira { label }. BreadcrumbItem: { label, href?, icon? }. O último item é sempre renderizado como atual."
              />
              <PropRow
                prop="innerClassName"
                type="string"
                def='"w-full px-8"'
                doc="Classe do wrapper interno da barra — sobrescreve o padding/legado de largura cheia."
              />
            </ApiTable>
            <CodeExample label="exemplo" lang="tsx">
              {`import { AwBreadcrumbsBar } from "@/components/ui/AwBreadcrumbsBar"

<AwBreadcrumbsBar
  items={[
    { label: "Canais", href: "/canais" },
    { label: "WhatsApp", href: "/canais/whatsapp" },
    { label: "Marina Cosméticos" }, // atual
  ]}
/>`}
            </CodeExample>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Tudo lido via CSS variables — nada hardcoded."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Spec k="faixa" v="h-11 · --bg-raised" d="44px de altura, fundo raised." />
              <Spec k="padding" v="px-8 (default)" d="Sobrescrevível via innerClassName." />
              <Spec
                k="link"
                v="--fg-primary + hover:underline"
                d="Itens com href; sublinha no hover/focus."
              />
              <Spec
                k="atual"
                v="--fg-tertiary"
                d="Último item, sem link, mais discreto."
              />
              <Spec
                k="separador"
                v="chevron 24px · --fg-tertiary"
                d="SVG aria-hidden entre cada par."
              />
              <Spec
                k="ícone"
                v="--fg-primary"
                d="ReactNode opcional antes do label."
              />
            </div>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Use no topo de telas de produto com 2+ níveis de hierarquia.</>,
                <>Mantenha labels curtos — o nome da seção, não a frase inteira.</>,
                <>Deixe o último item sem href (vira o atual automaticamente).</>,
              ]}
              donts={[
                <>Não force a barra com um único item — ela some de propósito.</>,
                <>Não troque o separador no meio da app — o chevron é fixo aqui.</>,
                <>Não use como navegação principal — é orientação contextual.</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
