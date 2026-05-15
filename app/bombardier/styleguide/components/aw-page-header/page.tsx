import { AwBreadcrumb } from "@/components/ui/AwBreadcrumb"
import { AwButton } from "@/components/ui/AwButton"
import { AwInput } from "@/components/ui/AwInput"
import { AwPageHeader } from "@/components/ui/AwPageHeader"
import { AwPill } from "@/components/ui/AwPill"
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

export default function PageHeaderPage() {
  return (
    <>
      <PageHero title="Page header">
        Cabeçalho padrão das páginas de produto. Slot inteligente: aceita
        eyebrow, ícone, título, descrição, ações à direita e um toolbar
        opcional embaixo. É a forma canônica de abrir uma página — substitui o
        bloco <code className="mono">{`<header><h1/><p/></header>`}</code>{" "}
        artesanal que existia espalhado pelo app.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="hero"
            title="Hero (padrão)"
            lead="Tamanho usado em top-level pages — Canais, Integrações, Dashboard. Ícone grande (48px / weight 300) ao lado do título h1 (40px, weight 500 do design system)."
          >
            <Stage
              label="Canais"
              gridClassName="block w-full bg-[var(--bg-canvas)] p-8"
            >
              <AwPageHeader
                icon="forum"
                title="Canais"
                description="Conecte os canais por onde seus agentes vão conversar com clientes — WhatsApp, Instagram, Messenger e mais."
                actions={
                  <AwButton variant="primary" size="md" iconLeft="add">
                    Novo canal
                  </AwButton>
                }
              />
            </Stage>
          </Section>

          <Section
            id="sizes"
            title="Tamanhos"
            lead="Três tiers — hero (default), default e compact. Hero é para landings de seção; default e compact servem para subpáginas ou views embutidas."
          >
            <Stage
              label="hero · default · compact"
              gridClassName="flex flex-col gap-10 bg-[var(--bg-canvas)] p-8"
            >
              <AwPageHeader
                size="hero"
                icon="extension"
                title="Integrações"
                description="Conecte plataformas e ferramentas para que seus agentes coletem contexto e executem ações."
                actions={
                  <AwButton variant="primary" size="md" iconLeft="add">
                    Nova integração
                  </AwButton>
                }
              />
              <AwPageHeader
                size="default"
                icon="extension"
                title="Integrações"
                description="Conecte plataformas e ferramentas para que seus agentes coletem contexto e executem ações."
                actions={
                  <AwButton variant="primary" size="md" iconLeft="add">
                    Nova integração
                  </AwButton>
                }
              />
              <AwPageHeader
                size="compact"
                icon="extension"
                title="Integrações"
                description="Conecte plataformas e ferramentas para que seus agentes coletem contexto e executem ações."
                actions={
                  <AwButton variant="primary" size="sm" iconLeft="add">
                    Nova
                  </AwButton>
                }
              />
            </Stage>
          </Section>

          <Section
            id="eyebrow"
            title="Eyebrow"
            lead="Slot acima do título para breadcrumb, status, badge ou label de seção. Aceita qualquer ReactNode — não é só texto."
          >
            <Stage
              label="Breadcrumb · pill · label simples"
              gridClassName="flex flex-col gap-10 bg-[var(--bg-canvas)] p-8"
            >
              <AwPageHeader
                size="default"
                eyebrow={
                  <AwBreadcrumb
                    items={[
                      { label: "Canais", href: "/canais" },
                      { label: "WhatsApp" },
                    ]}
                  />
                }
                icon="chat"
                title="WhatsApp"
                description="Configure suas contas conectadas, templates e fluxos."
                actions={
                  <AwButton variant="secondary" size="md" iconLeft="settings">
                    Configurações
                  </AwButton>
                }
              />
              <AwPageHeader
                size="default"
                eyebrow={
                  <>
                    <AwPill variant="beta">Beta</AwPill>
                    <span>Disponível para early access</span>
                  </>
                }
                icon="auto_awesome"
                title="Agent Studio"
                description="Crie e edite agentes com prompts visuais e ferramentas plugáveis."
                actions={
                  <AwButton variant="primary" size="md" iconLeft="add">
                    Novo agente
                  </AwButton>
                }
              />
            </Stage>
          </Section>

          <Section
            id="toolbar"
            title="Toolbar embaixo"
            lead="Quando o cabeçalho precisa de tabs, busca ou filtros logo abaixo, use o slot toolbar. Ele renderiza dentro do mesmo header — divisor inferior continua valendo."
          >
            <Stage
              label="Busca + filtro inline"
              gridClassName="block w-full bg-[var(--bg-canvas)] p-8"
            >
              <AwPageHeader
                size="hero"
                icon="forum"
                title="Canais"
                description="Conecte os canais por onde seus agentes vão conversar com clientes."
                actions={
                  <AwButton variant="primary" size="md" iconLeft="add">
                    Novo canal
                  </AwButton>
                }
                toolbar={
                  <>
                    <div className="w-full max-w-[320px]">
                      <AwInput
                        iconLeft="search"
                        placeholder="Buscar por canal ou conta…"
                      />
                    </div>
                    <AwButton
                      variant="ghost"
                      size="md"
                      iconLeft="filter_list"
                    >
                      Filtros
                    </AwButton>
                  </>
                }
              />
            </Stage>
          </Section>

          <Section
            id="actions"
            title="Múltiplas ações"
            lead="actions aceita N nodes. Use ghost para terciária, secondary para suporte, primary para a CTA principal — e respeite essa ordem (terciária → secundária → primária da esquerda pra direita)."
          >
            <Stage
              label="Três ações"
              gridClassName="block w-full bg-[var(--bg-canvas)] p-8"
            >
              <AwPageHeader
                size="default"
                icon="extension"
                title="Integrações"
                description="Gerencie integrações ativas e descubra novas."
                actions={
                  <>
                    <AwButton variant="ghost" size="md" iconLeft="download">
                      Exportar
                    </AwButton>
                    <AwButton variant="secondary" size="md" iconLeft="settings">
                      Configurar
                    </AwButton>
                    <AwButton variant="primary" size="md" iconLeft="add">
                      Nova integração
                    </AwButton>
                  </>
                }
              />
            </Stage>
          </Section>

          <Section
            id="no-icon"
            title="Sem ícone"
            lead="Páginas mais densas ou subviews podem dispensar o ícone — basta omitir o prop."
          >
            <Stage
              label="Title-only"
              gridClassName="block w-full bg-[var(--bg-canvas)] p-8"
            >
              <AwPageHeader
                size="default"
                title="Equipe e permissões"
                description="Convide membros, gerencie funções e configure permissões de acesso."
                actions={
                  <AwButton variant="primary" size="md" iconLeft="person_add">
                    Convidar
                  </AwButton>
                }
              />
            </Stage>
          </Section>

          <Section
            id="custom-icon"
            title="Ícone customizado"
            lead="Além do nome do Material Symbol, icon aceita um objeto de config (size, weight, fill) ou qualquer ReactNode — útil para logos, avatars ou marcas."
          >
            <Stage
              label="Config object · ReactNode"
              gridClassName="flex flex-col gap-10 bg-[var(--bg-canvas)] p-8"
            >
              <AwPageHeader
                size="hero"
                icon={{ name: "bolt", weight: 400, fill: 1 }}
                title="Triggers"
                description="Ações automáticas disparadas por eventos do seu produto."
                actions={
                  <AwButton variant="primary" size="md" iconLeft="add">
                    Novo trigger
                  </AwButton>
                }
              />
              <AwPageHeader
                size="default"
                icon={
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--aw-blue-100)] text-[var(--aw-blue-800)]">
                    <Icon name="rocket_launch" size={22} weight={400} />
                  </span>
                }
                title="Setup inicial"
                description="Configure sua conta e conecte seus primeiros canais."
                actions={
                  <AwButton variant="primary" size="md">
                    Começar
                  </AwButton>
                }
              />
            </Stage>
          </Section>

          <Section
            id="no-divider"
            title="Sem divisor"
            lead="Por padrão o header termina com uma linha sutil. Em layouts onde o cabeçalho fica dentro de uma card ou painel próprio, defina divider={false}."
          >
            <Stage
              label="divider={false}"
              gridClassName="block w-full bg-[var(--bg-canvas)] p-8"
            >
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
                <AwPageHeader
                  size="compact"
                  icon="folder"
                  title="Knowledge base"
                  description="Documentos e fontes que alimentam seus agentes."
                  divider={false}
                  actions={
                    <AwButton variant="secondary" size="sm" iconLeft="upload">
                      Importar
                    </AwButton>
                  }
                />
              </div>
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Tudo opcional menos title. icon aceita 3 formas: string (nome do material symbol), config { name, size?, weight?, fill? }, ou qualquer ReactNode."
          >
            <ApiTable>
              <PropRow
                prop="title"
                type="ReactNode"
                doc="Título da página. Renderizado como <h1>."
              />
              <PropRow
                prop="size"
                type='"hero" | "default" | "compact"'
                def='"hero"'
                doc="Hero = 40px + ícone 48px (top-level). Default = 28px + ícone 28px. Compact = 20px + ícone 22px."
              />
              <PropRow
                prop="icon"
                type='string | { name, size?, weight?, fill? } | ReactNode'
                doc="Material symbol pelo nome, config detalhado, ou nó custom (logo, avatar)."
              />
              <PropRow
                prop="eyebrow"
                type="ReactNode"
                doc="Slot acima do título — breadcrumb, pill, label."
              />
              <PropRow
                prop="description"
                type="ReactNode"
                doc="Parágrafo abaixo do título. Limitado a 560px de largura."
              />
              <PropRow
                prop="actions"
                type="ReactNode"
                doc="Conteúdo à direita do título. Botões, dropdowns, splits — qualquer composição."
              />
              <PropRow
                prop="toolbar"
                type="ReactNode"
                doc="Row full-width abaixo do header — tabs, busca, filtros."
              />
              <PropRow
                prop="divider"
                type="boolean"
                def="true"
                doc="Linha inferior + margem. Desligue quando o header está dentro de outro container."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Mergeado no <header> raiz."
              />
            </ApiTable>

            <CodeExample label="exemplo — Canais" lang="tsx">
              {`<AwPageHeader
  icon="forum"
  title="Canais"
  description="Conecte os canais por onde seus agentes vão conversar com clientes."
  actions={
    <AwButton variant="primary" size="md" iconLeft="add">
      Novo canal
    </AwButton>
  }
/>`}
            </CodeExample>

            <CodeExample label="com toolbar + eyebrow" lang="tsx">
              {`<AwPageHeader
  size="default"
  eyebrow={<AwBreadcrumb items={breadcrumbs} />}
  icon="chat"
  title="WhatsApp"
  description="Suas contas conectadas e templates aprovados."
  actions={<AwButton variant="primary" iconLeft="add">Nova conta</AwButton>}
  toolbar={
    <AwInput iconLeft="search" placeholder="Buscar…" />
  }
/>`}
            </CodeExample>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Estrutura: opcional eyebrow → linha do título (ícone + h1 + ações) → opcional descrição → opcional toolbar → opcional divisor."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Spec
                k="container"
                v="<header> · flex-col"
                d="Elemento semântico header — um por página."
              />
              <Spec
                k="title row"
                v="flex items-end justify-between"
                d="Ícone + h1 à esquerda, ações alinhadas pelo baseline à direita."
              />
              <Spec
                k="title font"
                v="herda h1 do globals (40px / weight 500)"
                d="Hero apenas reaperta o tracking para -0.04em. Default/compact reduzem a escala."
              />
              <Spec
                k="description"
                v="text-sm · max-w-[560px] · --fg-secondary"
                d="Largura limitada para manter legibilidade em telas grandes."
              />
              <Spec
                k="actions"
                v="flex-shrink-0 · gap-2"
                d="Não quebra linha — usa scroll ou ellipsis nos botões se faltar espaço."
              />
              <Spec
                k="divider"
                v="border-b --border-subtle · pb-6 · mb-10"
                d="Default ligado. Desligável quando o header já está em um container com borda."
              />
            </div>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Use uma vez por página, no topo do conteúdo principal.</>,
                <>Prefira hero para landings de seção (Canais, Integrações, Dashboard).</>,
                <>Use a CTA principal à direita; ações secundárias à esquerda dela.</>,
                <>Use toolbar quando busca/filtros pertencem visualmente ao cabeçalho.</>,
              ]}
              donts={[
                <>Não duplique o título no breadcrumb e no h1 — escolha um.</>,
                <>Não empilhe múltiplas linhas de actions; use um dropdown se passar de 3 botões.</>,
                <>Não substitua o ícone semântico por um logo de marca aleatório — use eyebrow ou ReactNode customizado.</>,
                <>Não desligue o divider só por estética — desligue quando o container ao redor já delimita.</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
