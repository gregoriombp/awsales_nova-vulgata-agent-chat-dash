import { AwNavList, AwNavItem } from "@/components/ui/AwNavList"
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

export default function NavListPage() {
  return (
    <>
      <PageHero title="Nav list">
        Lista vertical de itens de navegação — usada na sidebar e em painéis
          de sub-navegação. Cada item comporta ícone, label e um{" "}
          <em>badge</em> de contagem opcional.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-16">
        <Section
          id="default"
          title="Lista padrão"
          lead="Ícone à esquerda, label no meio, contagem opcional à direita. Um item .active por lista."
        >
          <Stage label="Com ícones + contagens">
            <AwNavList style={{ maxWidth: 280 }}>
              <AwNavItem icon="dashboard" active>
                Dashboard
              </AwNavItem>
              <AwNavItem icon="smart_toy" count={12}>
                Agentes
              </AwNavItem>
              <AwNavItem icon="library_books" count={284}>
                Fontes
              </AwNavItem>
              <AwNavItem icon="chat">Conversas</AwNavItem>
              <AwNavItem icon="history">Rastros</AwNavItem>
              <AwNavItem icon="settings">Configurações</AwNavItem>
            </AwNavList>
          </Stage>
        </Section>

        <Section
          id="no-icon"
          title="Sem ícone"
          lead="Opcional — listas curtas ou sub-navegação interna costumam dispensar iconografia."
        >
          <Stage label="Sub-nav de painel">
            <AwNavList style={{ maxWidth: 220 }}>
              <AwNavItem active>Geral</AwNavItem>
              <AwNavItem>Fontes</AwNavItem>
              <AwNavItem>Tools</AwNavItem>
              <AwNavItem>Webhooks</AwNavItem>
              <AwNavItem>Rastro</AwNavItem>
            </AwNavList>
          </Stage>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Estado ativo usa --bg-surface; hover usa o mesmo fill, diferenciado apenas pelo focus ring em navegação via teclado."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="padding item"
              v="8 · 10"
              d="Vertical · horizontal."
            />
            <Spec
              k="gap"
              v="10 px"
              d="Entre ícone, label e badge."
            />
            <Spec
              k="radius item"
              v="--radius-sm · 6 px"
              d="Bordas internas do container: --radius-lg."
            />
            <Spec
              k="badge"
              v="mono 10 px · --fg-tertiary"
              d="Alinhado à direita via margin-left: auto."
            />
            <Spec
              k="ícone"
              v="16 px"
              d="Material Symbols Rounded, peso padrão."
            />
            <Spec
              k="active"
              v="--bg-surface + --fg-primary"
              d="Sem left-accent strip — a cor do texto já comunica."
            />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwNavList, AwNavItem } from "@/components/ui/AwNavList".`}
        >
          <ApiTable>
            <PropRow
              prop="AwNavItem.icon"
              type="string"
              doc="Glyph Material Symbols. Opcional."
            />
            <PropRow
              prop="AwNavItem.count"
              type="number | string"
              doc="Badge à direita (número de entidades, etc)."
            />
            <PropRow
              prop="AwNavItem.active"
              type="boolean"
              def="false"
              doc="Estado selecionado. Uma única item active por lista."
            />
            <PropRow
              prop="AwNavItem.as"
              type='"a" | "button"'
              def='"a"'
              doc='"button" para handlers JS sem href.'
            />
            <PropRow
              prop="AwNavItem.href"
              type="string"
              doc="Atributo nativo de <a>; quando as='a'."
            />
          </ApiTable>
          <CodeExample>{`import { AwNavList, AwNavItem } from "@/components/ui/AwNavList"

<AwNavList>
  <AwNavItem icon="dashboard" href="/dashboard" active>
    Dashboard
  </AwNavItem>
  <AwNavItem icon="smart_toy" href="/agents" count={12}>
    Agentes
  </AwNavItem>
  <AwNavItem as="button" icon="settings" onClick={openSettings}>
    Configurações
  </AwNavItem>
</AwNavList>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Uma única item <em>active</em> por lista.</>,
              <>Contagens apenas quando o número tem utilidade (agentes: 12 sim; configurações: 6 não).</>,
              <>Infinitivos ou substantivos curtos — nunca frases.</>,
            ]}
            donts={[
              <>Sub-níveis aninhados com indentação — crie uma nav lateral ou painel.</>,
              <>Cor custom no ícone do item — herda currentColor.</>,
              <>Badge de cor para status — use pills dedicadas na página.</>,
            ]}
          />
        </Section>
      </div>
    </div>
    </>
  )
}
