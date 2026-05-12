import { AwGroupCard } from "@/components/ui/AwGroupCard"
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

const ATENDIMENTO_MEMBERS = [
  { name: "Thiago Oliveira", avatar: "/assets/ui-faces/male-7.jpg", initials: "TO" },
  { name: "Bianca Rezende", avatar: "/assets/ui-faces/female-7.jpg", initials: "BR" },
  { name: "Larissa Pinto", avatar: "/assets/ui-faces/female-1.jpg", initials: "LP" },
  { name: "Ana Souza", avatar: "/assets/ui-faces/female-3.jpg", initials: "AS" },
  { name: "Carlos Lima", avatar: "/assets/ui-faces/male-3.jpg", initials: "CL" },
  { name: "Rafael Andrade", avatar: "/assets/ui-faces/male-2.jpg", initials: "RA" },
  { name: "Camila Nogueira", avatar: "/assets/ui-faces/female-2.jpg", initials: "CN" },
  { name: "Fernanda Costa", avatar: "/assets/ui-faces/female-8.jpg", initials: "FC" },
]

const SUPORTE_MEMBERS = [
  { name: "Thiago Oliveira", avatar: "/assets/ui-faces/male-7.jpg", initials: "TO" },
  { name: "Bianca Rezende", avatar: "/assets/ui-faces/female-7.jpg", initials: "BR" },
]

const BG_LIGHT = "/assets/group-backgrounds/group-bg-04.jpg"
const BG_DARK = "/assets/group-backgrounds/group-bg-11.jpg"

const DEMO_MENU = [
  { id: "manage", label: "Gerenciar equipe", icon: "settings", onSelect: () => {} },
  { id: "add", label: "Adicionar membros", icon: "person_add", onSelect: () => {} },
  { id: "rename", label: "Renomear grupo", icon: "edit", onSelect: () => {} },
  { id: "duplicate", label: "Duplicar grupo", icon: "content_copy", onSelect: () => {} },
  { id: "sep", separator: true as const },
  { id: "delete", label: "Excluir grupo", icon: "delete", danger: true, onSelect: () => {} },
]

export default function AwGroupCardPage() {
  return (
    <>
      <PageHero title="Group card">
        Card de grupo (departamento) usado em <code className="mono">Equipe &amp;
        permissões → Grupos</code>. Cada card mostra a foto curada do grupo
        com os membros empilhados sobre ela, nome, contagem de membros,
        descrição curta e um CTA <code className="mono">Gerenciar equipe</code>.
        Pensado pra grids de 2 ou 3 colunas.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="default"
            title="Uso default"
            lead="Foto no topo, stack de avatares cruzando a borda, header com ícone + nome + contagem + menu, descrição e CTA pill."
          >
            <Stage
              label="Grupo cheio"
              gridClassName="block w-full bg-[var(--bg-canvas)] p-8"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AwGroupCard
                  name="Atendimento"
                  description="Equipe dedicada a monitorar conversas em tempo real, garantindo o cumprimento rigoroso dos SLAs."
                  memberCount={10}
                  members={ATENDIMENTO_MEMBERS}
                  backgroundImage={BG_LIGHT}
                  onManage={() => {}}
                  menu={DEMO_MENU}
                />
                <AwGroupCard
                  name="Suporte"
                  description="Time especializado em acompanhar conversas ao vivo, assegurando o cumprimento estrito dos SLAs."
                  memberCount={2}
                  members={SUPORTE_MEMBERS}
                  backgroundImage={BG_DARK}
                  onManage={() => {}}
                  menu={DEMO_MENU}
                />
              </div>
            </Stage>
          </Section>

          <Section
            id="overflow"
            title="Overflow de avatares"
            lead="A pilha mostra até maxAvatars (default 5). O excedente vira um chip +N que mantém o mesmo tamanho dos avatares."
          >
            <Stage
              label="memberCount > maxAvatars"
              gridClassName="block w-full bg-[var(--bg-canvas)] p-8"
            >
              <div className="max-w-[420px]">
                <AwGroupCard
                  name="Atendimento"
                  description="Equipe dedicada a monitorar conversas em tempo real, garantindo o cumprimento rigoroso dos SLAs."
                  memberCount={24}
                  members={ATENDIMENTO_MEMBERS}
                  backgroundImage={BG_LIGHT}
                  onManage={() => {}}
                  menu={DEMO_MENU}
                />
              </div>
            </Stage>
          </Section>

          <Section
            id="no-background"
            title="Sem foto de fundo"
            lead="Quando o grupo não tem imagem curada ainda, o topo cai pra --bg-muted e a stack mantém a posição."
          >
            <Stage
              label="fallback sem imagem"
              gridClassName="block w-full bg-[var(--bg-canvas)] p-8"
            >
              <div className="max-w-[420px]">
                <AwGroupCard
                  name="Operações"
                  description="Setup de agentes, integrações e moderação. Cuida da espinha dorsal do workspace."
                  memberCount={3}
                  members={SUPORTE_MEMBERS}
                  onManage={() => {}}
                  menu={DEMO_MENU}
                />
              </div>
            </Stage>
          </Section>

          <Section
            id="single-member"
            title="Grupo de 1 pessoa"
            lead='Singular: "1 Membro" em vez de "Membros". Stack mostra só um avatar.'
          >
            <Stage
              label="singular"
              gridClassName="block w-full bg-[var(--bg-canvas)] p-8"
            >
              <div className="max-w-[420px]">
                <AwGroupCard
                  name="Founder"
                  description="Acesso de owner. Controle total sobre workspace, billing e infra."
                  memberCount={1}
                  members={[ATENDIMENTO_MEMBERS[0]]}
                  backgroundImage={BG_DARK}
                  onManage={() => {}}
                  menu={DEMO_MENU}
                />
              </div>
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Todos os textos chegam via props. A foto de fundo é estática (sem efeitos) — a curadoria de imagens é responsabilidade do consumidor."
          >
            <ApiTable>
              <PropRow
                prop="name"
                type="string"
                doc="Nome do grupo — renderizado como h3 18px semibold."
              />
              <PropRow
                prop="description"
                type="string"
                doc="Descrição curta. Limitada a 2 linhas (line-clamp-2)."
              />
              <PropRow
                prop="memberCount"
                type="number"
                doc='Total de membros. Pluralização automática ("Membro" / "Membros").'
              />
              <PropRow
                prop="members"
                type="AwGroupCardMember[]"
                doc="Lista de membros usada na stack de avatares. Cada item: { name, avatar?, initials }."
              />
              <PropRow
                prop="icon"
                type="string"
                doc='Material Symbol exibido ao lado do título. Default "groups".'
              />
              <PropRow
                prop="backgroundImage"
                type="string"
                doc="URL da imagem de fundo do topo. Opcional — fallback para --bg-muted."
              />
              <PropRow
                prop="maxAvatars"
                type="number"
                doc="Quantos avatares cabem na pilha antes de virar +N. Default 5."
              />
              <PropRow
                prop="manageLabel"
                type="string"
                doc='Texto do CTA principal. Default "Gerenciar equipe".'
              />
              <PropRow
                prop="onManage"
                type="() => void"
                doc='Handler do CTA "Gerenciar equipe".'
              />
              <PropRow
                prop="menu"
                type="AwDropdownItem[]"
                doc="Itens do dropdown overflow (3-dot). Quando ausente ou vazio, o botão não é renderizado. Usa o mesmo schema de AwDropdownMenu — suporta separator, danger, icon, etc."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Mergeado no <article> raiz."
              />
            </ApiTable>

            <CodeExample label="exemplo — grupo de Atendimento" lang="tsx">
              {`import { pickGroupBackground } from "../_components/data"

<AwGroupCard
  name="Atendimento"
  description="Equipe dedicada a monitorar conversas em tempo real, garantindo o cumprimento rigoroso dos SLAs."
  memberCount={10}
  members={[
    { name: "Thiago Oliveira", avatar: "/assets/ui-faces/male-7.jpg", initials: "TO" },
    { name: "Bianca Rezende", avatar: "/assets/ui-faces/female-7.jpg", initials: "BR" },
    { name: "Larissa Pinto", avatar: "/assets/ui-faces/female-1.jpg", initials: "LP" },
  ]}
  backgroundImage={pickGroupBackground("g-atendimento")}
  onManage={openGroup}
  menu={[
    { id: "manage", label: "Gerenciar equipe", icon: "settings", onSelect: openGroup },
    { id: "add", label: "Adicionar membros", icon: "person_add", onSelect: openGroup },
    { id: "rename", label: "Renomear grupo", icon: "edit", onSelect: openGroup },
    { id: "duplicate", label: "Duplicar grupo", icon: "content_copy", onSelect: duplicateGroup },
    { id: "sep", separator: true },
    { id: "delete", label: "Excluir grupo", icon: "delete", danger: true, onSelect: deleteGroup },
  ]}
/>`}
            </CodeExample>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Use imagens curadas em escala de cinza para manter a leitura consistente do grid.</>,
                <>Mantenha a descrição em 1 ou 2 linhas — o card vive em grid e qualquer altura extra quebra o ritmo.</>,
                <>Atribua imagens diferentes pra grupos diferentes, pra a foto virar um marcador visual.</>,
                <>Suba as fotos em <code className="mono">/public/assets/group-backgrounds/</code>, sem metadata.</>,
              ]}
              donts={[
                <>Não use fotos coloridas saturadas — quebram a hierarquia com avatares e tipografia.</>,
                <>Não passe mais de 6 avatares pra <code className="mono">members</code> esperando que apareçam todos; ajuste <code className="mono">maxAvatars</code>.</>,
                <>Não renderize sem <code className="mono">memberCount</code> — o "+N" depende dele para calcular o overflow.</>,
                <>Não use o card pra entidades que não são grupos (ex.: agentes, integrações) — ele tem semântica forte de "departamento".</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
