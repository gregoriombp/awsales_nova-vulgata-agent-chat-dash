import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwBrandLogo } from "@/components/ui/AwBrandLogo"
import { AwButton } from "@/components/ui/AwButton"
import { AwListGroup } from "@/components/ui/AwListGroup"
import { AwPill } from "@/components/ui/AwPill"
import {
  ApiTable,
  CodeExample,
  PageHero,
  PropRow,
  Section,
  Spec,
  Stage,
} from "../../_primitives"

export default function ListGroupPage() {
  return (
    <>
      <PageHero title="List group">
        Cabeçalho com logo + título sobre uma lista colapsável. Usado pra
        agrupar contas de canais ({" "}
        <code className="mono">/canais</code>), tools por integração ({" "}
        <code className="mono">/tools</code>) e qualquer estrutura de pai →
        filhos onde os filhos precisam ficar levemente recuados, em árvore.
        Wrapper sobre <strong>shadcn/ui Collapsible</strong> (Radix) com tokens
        Aswork.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="basic"
            title="Uso padrão"
            lead="Logo da marca à esquerda, título e meta inline, ações à direita, chevron sempre visível. Conteúdo expande pra baixo com filhos recuados."
          >
            <Stage label="Canal com 2 contas — clique no header pra colapsar">
              <div className="w-full max-w-[720px]">
                <AwListGroup
                  media={<AwBrandLogo brand="whatsapp" size="md" />}
                  title="WhatsApp"
                  subtitle="Atenda e recupere vendas via WhatsApp com seus agentes de IA."
                  meta={
                    <>
                      <span>· 2 contas</span>
                      <AwPill variant="beta">1 alerta</AwPill>
                    </>
                  }
                  actions={
                    <AwButton
                      variant="secondary"
                      size="sm"
                      iconRight="arrow_forward"
                    >
                      Gerenciar
                    </AwButton>
                  }
                >
                  <ChildRow
                    name="Marina Cosméticos"
                    subtitle="Marina Costa · 2 números"
                    avatarSrc="/assets/ui-faces/female-3.jpg"
                    pill={<AwPill variant="live">Ativo</AwPill>}
                  />
                  <ChildRow
                    name="Aswork-Tech-Test"
                    subtitle="Time Eng · 1 número"
                    pill={<AwPill variant="beta">Pagamento pendente</AwPill>}
                  />
                </AwListGroup>
              </div>
            </Stage>
          </Section>

          <Section
            id="indent"
            title="Recuo dos filhos"
            lead="Quatro níveis de tree-indent — controlado pela prop indent. Default é md (32 px). Aplica padding-left no contêiner dos filhos, sem mexer no padding interno de cada linha."
          >
            <Stage
              label='indent="none" · "sm" · "md" (default) · "lg"'
              gridClassName="block"
            >
              <div className="flex flex-col gap-4 w-full max-w-[720px]">
                {(["none", "sm", "md", "lg"] as const).map((indent) => (
                  <div
                    key={indent}
                    className="rounded-md border border-(--border-subtle) bg-(--bg-raised)"
                  >
                    <AwListGroup
                      media={<AwBrandLogo brand="instagram" size="md" />}
                      title="Instagram"
                      subtitle={`indent="${indent}"`}
                      meta={<span>· 1 conta</span>}
                      indent={indent}
                    >
                      <ChildRow
                        name="@marinacosmeticos"
                        subtitle="12,4 mil seguidores · DM ativa"
                        avatarSrc="/assets/ui-faces/female-3.jpg"
                        pill={<AwPill variant="live">Ativo</AwPill>}
                      />
                    </AwListGroup>
                  </div>
                ))}
              </div>
            </Stage>
          </Section>

          <Section
            id="composition"
            title="Lista de grupos"
            lead="Vários grupos empilhados com gap-4 entre eles. Cada grupo respira; o usuário identifica fronteiras sem precisar de cards."
          >
            <Stage label="3 canais — gap entre grupos, divider interno entre filhos">
              <div className="flex flex-col gap-4 w-full max-w-[720px]">
                {[
                  {
                    brand: "whatsapp",
                    title: "WhatsApp",
                    subtitle: "Atenda e recupere vendas via WhatsApp.",
                    accounts: [
                      {
                        name: "Marina Cosméticos",
                        subtitle: "Marina Costa · 2 números",
                        avatarSrc: "/assets/ui-faces/female-3.jpg",
                        status: "Ativo",
                        variant: "live" as const,
                      },
                    ],
                  },
                  {
                    brand: "instagram",
                    title: "Instagram",
                    subtitle: "Responda DMs do Instagram automaticamente.",
                    accounts: [
                      {
                        name: "@marinacosmeticos",
                        subtitle: "12,4 mil seguidores · DM ativa",
                        avatarSrc: "/assets/ui-faces/female-3.jpg",
                        status: "Ativo",
                        variant: "live" as const,
                      },
                    ],
                  },
                  {
                    brand: "messenger",
                    title: "Messenger",
                    subtitle: "Atendimento automatizado pelo Messenger.",
                    accounts: [
                      {
                        name: "Marina Cosméticos",
                        subtitle: "Página oficial · 8,2 mil curtidas",
                        avatarSrc: "/assets/ui-faces/female-3.jpg",
                        status: "Pausado",
                        variant: "draft" as const,
                      },
                    ],
                  },
                ].map((g) => (
                  <AwListGroup
                    key={g.title}
                    media={<AwBrandLogo brand={g.brand} size="md" />}
                    title={g.title}
                    subtitle={g.subtitle}
                    meta={
                      <span>
                        · {g.accounts.length}{" "}
                        {g.accounts.length === 1 ? "conta" : "contas"}
                      </span>
                    }
                    actions={
                      <AwButton
                        variant="secondary"
                        size="sm"
                        iconRight="arrow_forward"
                      >
                        Gerenciar
                      </AwButton>
                    }
                  >
                    {g.accounts.map((a) => (
                      <ChildRow
                        key={a.name}
                        name={a.name}
                        subtitle={a.subtitle}
                        avatarSrc={a.avatarSrc}
                        pill={
                          <AwPill variant={a.variant}>{a.status}</AwPill>
                        }
                      />
                    ))}
                  </AwListGroup>
                ))}
              </div>
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Props expostas. Filhos passam pela slot children e usam padding interno próprio (px-6 py-3.5 é o padrão do projeto)."
          >
            <ApiTable>
              <PropRow
                prop="title"
                type="React.ReactNode"
                doc="Texto principal do header."
              />
              <PropRow
                prop="subtitle"
                type="React.ReactNode"
                doc="Texto secundário sob o título."
              />
              <PropRow
                prop="media"
                type="React.ReactNode"
                doc="Slot do leading visual — AwBrandLogo, AwAvatar, ícone."
              />
              <PropRow
                prop="meta"
                type="React.ReactNode"
                doc="Conteúdo inline ao lado do título — counts, AwPill de alerta."
              />
              <PropRow
                prop="actions"
                type="React.ReactNode"
                doc="Botões/links à direita. Cliques aqui não disparam o toggle."
              />
              <PropRow
                prop="defaultOpen"
                type="boolean"
                def="true"
                doc="Estado inicial quando uncontrolled."
              />
              <PropRow
                prop="open"
                type="boolean"
                doc="Controla o estado aberto/fechado externamente."
              />
              <PropRow
                prop="onOpenChange"
                type="(open: boolean) => void"
                doc="Callback de mudança de estado."
              />
              <PropRow
                prop="indent"
                type='"none" | "sm" | "md" | "lg"'
                def='"md"'
                doc="Recuo aplicado ao contêiner dos filhos."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Mergeado via cn() na raiz Collapsible."
              />
            </ApiTable>

            <CodeExample label="exemplo" lang="tsx">
              {`<AwListGroup
  media={<AwBrandLogo brand="whatsapp" size="md" />}
  title="WhatsApp"
  subtitle="Atenda e recupere vendas via WhatsApp."
  meta={<><span>· 2 contas</span><AwPill variant="beta">1 alerta</AwPill></>}
  actions={<AwButton variant="secondary" size="sm">Gerenciar</AwButton>}
  indent="md"
>
  {/* filhos com padding próprio */}
  <div className="flex items-center gap-3 px-6 py-3.5">
    <AwAvatar src="/foto.jpg" size="md" />
    <div className="flex-1">
      <div className="font-semibold">Marina Cosméticos</div>
      <div className="text-[12.5px] text-(--fg-tertiary)">
        Marina Costa · 2 números
      </div>
    </div>
    <AwPill variant="live">Ativo</AwPill>
  </div>
</AwListGroup>`}
            </CodeExample>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Construído sobre Radix Collapsible (instalado via shadcn). Tokens vêm de globals.css; nenhuma cor é hardcoded."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Spec
                k="primitive"
                v="Radix Collapsible (via @shadcn/collapsible)"
                d="Trigger duplo: área do título + chevron. Toggle compartilhado."
              />
              <Spec
                k="header padding"
                v="px-6 py-5"
                d="Mesmo ritmo do ToolPack em /tools."
              />
              <Spec
                k="indent default"
                v='pl-8 (32 px)'
                d="Aplicado no wrapper dos filhos, somado ao padding interno deles."
              />
              <Spec
                k="divider entre filhos"
                v="divide-y · border-subtle"
                d="Linha de 1px entre rows; respeita o recuo."
              />
              <Spec
                k="rotação chevron"
                v="data-[state=open]:rotate-180"
                d="Radix expõe data-state no trigger."
              />
              <Spec
                k="focus ring-3"
                v="ring-2 · aw-blue-400"
                d="Apenas em focus-visible — não aparece com mouse."
              />
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}

function ChildRow({
  name,
  subtitle,
  avatarSrc,
  pill,
}: {
  name: string
  subtitle: string
  avatarSrc?: string
  pill: React.ReactNode
}) {
  const initials = name
    .replace(/^@/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()

  return (
    <div className="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-(--bg-hover)">
      <AwAvatar size="md" src={avatarSrc} alt={name} initials={initials} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-semibold tracking-[-0.005em] text-(--fg-primary)">
          {name}
        </div>
        <div className="mt-0.5 truncate text-[12.5px] leading-[1.45] text-(--fg-tertiary)">
          {subtitle}
        </div>
      </div>
      {pill}
    </div>
  )
}
