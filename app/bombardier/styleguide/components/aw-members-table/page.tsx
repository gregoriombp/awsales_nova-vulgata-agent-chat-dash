import {
  AwMembersTable,
  AwMembersTablePersonCell,
  AwMembersTableSelectCell,
  AwMembersTableTextCell,
} from "@/components/ui/AwMembersTable"
import {
  ApiTable,
  CodeExample,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

function ApiHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="m-0 mb-3 mt-8 text-[14px] font-semibold text-[var(--fg-primary)]">
      {children}
    </h3>
  )
}

export default function MembersTablePage() {
  return (
    <>
      <PageHero title="Members table">
        Tabela tipo Mobbin com avatar + nome/e-mail à esquerda, time-stamp
        relativo, e células de seleção (permissões, licença) à direita. Wrapper
        sobre <strong>AwTable</strong> na variante airy, com helpers de célula
        que compõem <strong>AwAvatar</strong>, <strong>AwPill</strong> e{" "}
        <strong>AwSelect</strong>. Use em telas de gestão de pessoas
        (Equipe &amp; permissões, convidados de workspace, integrações com
        operadores).
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="basic"
            title="Uso padrão"
            lead="Cabeçalho com ícone à esquerda e help-icons opcionais. Linhas com avatar, nome, tag inline e e-mail abaixo. Dropdowns nas colunas configuráveis."
          >
            <Stage
              label="Equipe — visão pessoa"
              hint="Hover na linha para destacar. Permissões e Licença abrem menus."
              gridClassName="block"
            >
              <AwMembersTable
                columns={[
                  { label: "Person", icon: "person" },
                  { label: "Last viewed a map" },
                  {
                    label: "Permissions",
                    help: "Define o escopo de acesso aos workspaces.",
                  },
                  {
                    label: "License",
                    help: "Tipo de assento atribuído ao membro.",
                  },
                ]}
              >
                <tr>
                  <AwMembersTablePersonCell
                    name="Alex Smith"
                    email="alexsmith.mobbin@gmail.com"
                    avatarSrc="/assets/ui-faces/male-1.jpg"
                  />
                  <AwMembersTableTextCell muted>
                    2 days ago
                  </AwMembersTableTextCell>
                  <AwMembersTableSelectCell
                    value="Workspace"
                    selectAriaLabel="Permissions for Alex Smith"
                  />
                  <AwMembersTableSelectCell
                    value="Editor"
                    selectAriaLabel="License for Alex Smith"
                  />
                </tr>
                <tr>
                  <AwMembersTablePersonCell
                    name="Alexandra Mleux"
                    email="alexmleux.mobbin@gmail.com"
                    avatarSrc="/assets/ui-faces/female-3.jpg"
                  />
                  <AwMembersTableTextCell muted>
                    4 days ago
                  </AwMembersTableTextCell>
                  <AwMembersTableSelectCell value="Workspace" />
                  <AwMembersTableSelectCell value="Editor" />
                </tr>
                <tr>
                  <AwMembersTablePersonCell
                    name="Sam Lee"
                    email="samlee.mobbin@gmail.com"
                    initials="SL"
                    tag="ADMIN"
                  />
                  <AwMembersTableTextCell muted>
                    2 days ago
                  </AwMembersTableTextCell>
                  <AwMembersTableSelectCell value="Workspace and projects" />
                  <AwMembersTableTextCell>Editor</AwMembersTableTextCell>
                </tr>
                <tr>
                  <AwMembersTablePersonCell
                    name="Sebastian Malena"
                    email="sebmalena.mobbin@gmail.com"
                    avatarSrc="/assets/ui-faces/male-2.jpg"
                  />
                  <AwMembersTableTextCell muted>
                    4 days ago
                  </AwMembersTableTextCell>
                  <AwMembersTableSelectCell value="Workspace" />
                  <AwMembersTableSelectCell value="Viewer" />
                </tr>
                <tr>
                  <AwMembersTablePersonCell
                    name="Marina Costa"
                    email="marina@cliente.com"
                    initials="MC"
                  />
                  <AwMembersTableTextCell muted>
                    Nunca acessou
                  </AwMembersTableTextCell>
                  <AwMembersTableSelectCell value="Workspace" />
                  <AwMembersTableTextCell>Viewer</AwMembersTableTextCell>
                </tr>
              </AwMembersTable>
            </Stage>
          </Section>

          <Section
            id="cells"
            title="Variantes de célula"
            lead="As três células prontas — pessoa, dropdown e texto plano — cobrem 90% dos usos. Caso precise de algo custom, use um <td> direto e ative o estilo airy via classe na tabela."
          >
            <Stage label="Cells comparison" gridClassName="block">
              <AwMembersTable
                columns={[
                  { label: "Cell", width: 280 },
                  { label: "Sem tag" },
                  { label: "Com tag" },
                ]}
              >
                <tr>
                  <AwMembersTableTextCell>Person cell</AwMembersTableTextCell>
                  <AwMembersTablePersonCell
                    name="Gabriel Lima"
                    email="gabriel@awsales.io"
                    initials="GL"
                  />
                  <AwMembersTablePersonCell
                    name="Gregório Pinheiro"
                    email="greg@awsales.io"
                    initials="GP"
                    tag="OWNER"
                  />
                </tr>
                <tr>
                  <AwMembersTableTextCell>Select cell</AwMembersTableTextCell>
                  <AwMembersTableSelectCell value="Workspace" />
                  <AwMembersTableSelectCell value="Workspace and projects" />
                </tr>
                <tr>
                  <AwMembersTableTextCell>Text cell</AwMembersTableTextCell>
                  <AwMembersTableTextCell muted>
                    2 days ago
                  </AwMembersTableTextCell>
                  <AwMembersTableTextCell>Editor</AwMembersTableTextCell>
                </tr>
              </AwMembersTable>
            </Stage>

            <CodeExample label="exemplo" lang="tsx">{`<AwMembersTable
  columns={[
    { label: "Person", icon: "person" },
    { label: "Last viewed a map" },
    { label: "Permissions", help: "Escopo de acesso." },
    { label: "License", help: "Tipo de assento." },
  ]}
>
  <tr>
    <AwMembersTablePersonCell
      name="Sam Lee"
      email="samlee.mobbin@gmail.com"
      tag="ADMIN"
    />
    <AwMembersTableTextCell muted>2 days ago</AwMembersTableTextCell>
    <AwMembersTableSelectCell value="Workspace and projects" />
    <AwMembersTableTextCell>Editor</AwMembersTableTextCell>
  </tr>
</AwMembersTable>`}</CodeExample>
          </Section>

          <Section
            id="header-icons"
            title="Help icons no cabeçalho"
            lead="Use a prop help para anexar um ícone (?) que mostra um tooltip nativo. Útil quando o nome da coluna é ambíguo, especialmente em colunas com células interativas."
          >
            <Stage label="Headers com e sem help" gridClassName="block">
              <AwMembersTable
                columns={[
                  { label: "Sem decoração" },
                  { label: "Com ícone à esquerda", icon: "person" },
                  { label: "Com help", help: "Texto explicativo no tooltip." },
                  {
                    label: "Com ícone + help",
                    icon: "shield_person",
                    help: "Função atribuída ao membro.",
                  },
                ]}
              >
                <tr>
                  <AwMembersTableTextCell muted>—</AwMembersTableTextCell>
                  <AwMembersTableTextCell muted>—</AwMembersTableTextCell>
                  <AwMembersTableTextCell muted>—</AwMembersTableTextCell>
                  <AwMembersTableTextCell muted>—</AwMembersTableTextCell>
                </tr>
              </AwMembersTable>
            </Stage>
          </Section>

          <Section
            id="empty"
            title="Estado vazio"
            lead="Não há um empty state embutido — a recomendação é renderizar uma única <tr> com <td colSpan={N}> contendo um AwEmpty ou copy curta. Mantém a tabela responsiva e legível."
          >
            <Stage label="Sem registros" gridClassName="block">
              <AwMembersTable
                columns={[
                  { label: "Person", icon: "person" },
                  { label: "Last viewed a map" },
                  { label: "Permissions" },
                  { label: "License" },
                ]}
              >
                <tr>
                  <td
                    colSpan={4}
                    style={{ padding: "48px 20px", textAlign: "center" }}
                  >
                    <p className="m-0 text-[13px] text-[var(--fg-secondary)]">
                      Ninguém por aqui ainda. Convide alguém pelo botão acima.
                    </p>
                  </td>
                </tr>
              </AwMembersTable>
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead='Import: import { AwMembersTable, AwMembersTablePersonCell, AwMembersTableSelectCell, AwMembersTableTextCell } from "@/components/ui/AwMembersTable".'
          >
            <ApiHeading>AwMembersTable</ApiHeading>
            <ApiTable>
              <PropRow
                prop="columns"
                type="AwMembersTableColumn[]"
                doc="Definição de cabeçalho. Cada coluna aceita label, icon (Material), help (tooltip), width e align."
              />
              <PropRow
                prop="children"
                type="React.ReactNode"
                doc="Linhas <tr>. Use os helpers AwMembersTablePersonCell, AwMembersTableSelectCell e AwMembersTableTextCell — ou <td> direto pra células custom."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Aplicada na <table>. Já entra com aw-table--airy ativada — adicionar classes extras é seguro, sobrescrever a airy não é recomendado."
              />
            </ApiTable>

            <ApiHeading>AwMembersTablePersonCell</ApiHeading>
            <ApiTable>
              <PropRow
                prop="name"
                type="string"
                doc="Nome exibido em primeiro plano. Obrigatório."
              />
              <PropRow
                prop="email"
                type="string"
                doc="Subtítulo discreto. Omita pra ficar só com o nome."
              />
              <PropRow
                prop="avatarSrc"
                type="string"
                doc="URL da foto. Sem isso, AwAvatar usa as iniciais."
              />
              <PropRow
                prop="initials"
                type="string"
                doc="Iniciais customizadas. Default: derivadas do nome."
              />
              <PropRow
                prop="avatarSize"
                type='"sm" | "md" | "lg"'
                def='"md"'
                doc="Tamanho do avatar. md combina com a altura da linha airy."
              />
              <PropRow
                prop="tag"
                type="React.ReactNode"
                doc={'Conteúdo da pill inline (ex.: "ADMIN"). Usa AwPill internamente.'}
              />
              <PropRow
                prop="tagVariant"
                type="AwPillVariant"
                def='"neutral"'
                doc="Variante da AwPill. Use ai/error/live pra destacar."
              />
            </ApiTable>

            <ApiHeading>AwMembersTableSelectCell</ApiHeading>
            <ApiTable>
              <PropRow
                prop="value"
                type="React.ReactNode"
                doc="Conteúdo dentro do AwSelect (texto exibido no trigger). Obrigatório."
              />
              <PropRow
                prop="onSelectClick"
                type="React.MouseEventHandler<HTMLButtonElement>"
                doc="Handler do clique no trigger. Conecte ao seu menu (AwDropdownMenu, etc.)."
              />
              <PropRow
                prop="selectAriaLabel"
                type="string"
                doc="Texto descritivo do select pra leitores de tela."
              />
            </ApiTable>

            <ApiHeading>AwMembersTableTextCell</ApiHeading>
            <ApiTable>
              <PropRow
                prop="children"
                type="React.ReactNode"
                doc="Conteúdo da célula. Obrigatório."
              />
              <PropRow
                prop="muted"
                type="boolean"
                def="false"
                doc="Aplica fg-secondary. Padrão é fg-primary."
              />
            </ApiTable>
          </Section>

          <Section
            id="patterns"
            title="Quando usar"
            lead="Esse pattern serve pra qualquer tabela de pessoas onde os atributos da direita são editáveis ou referenciam catálogos curtos (papel, plano, status)."
          >
            <ul className="list-disc pl-6 text-[13px] leading-[1.7] text-[var(--fg-secondary)]">
              <li>Equipe &amp; permissões — membros do workspace.</li>
              <li>Convidados pendentes — emails sem conta ainda.</li>
              <li>Operadores conectados a integrações.</li>
              <li>Auditoria — quem fez o quê, com colunas read-only.</li>
            </ul>
            <p className="mt-3 text-[12.5px] text-[var(--fg-tertiary)]">
              Para tabelas densas com muitas colunas numéricas/data, prefira o{" "}
              <code className="mono">AwTable</code> sem a variante airy
              (chrome compacto, padding menor).
            </p>
          </Section>
        </div>
      </div>
    </>
  )
}
