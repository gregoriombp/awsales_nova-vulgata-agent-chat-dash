import { AwAvatar, AwAvatarGroup } from "@/components/ui/AwAvatar"
import { AwStatusDot } from "@/components/ui/AwStatusDot"
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  Section,
  Spec,
  Stage,
  Tldr,
} from "../../_primitives"

const PHOTO_MARINA =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=192&h=192&fit=crop&crop=faces"
const PHOTO_JOAO =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=192&h=192&fit=crop&crop=faces"
const PHOTO_LARA =
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=192&h=192&fit=crop&crop=faces"
const PHOTO_DANI =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=192&h=192&fit=crop&crop=faces"
const PHOTO_RICARDO =
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=192&h=192&fit=crop&crop=faces"
const PHOTO_CAMILA =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=192&h=192&fit=crop&crop=faces"

export default function AwAvatarPage() {
  return (
    <>
      <PageHero title="Avatar">
        Marca uma pessoa, um agente ou um grupo. Três tamanhos (sm 24,
        md 36, lg 48). Aceita imagem real, iniciais como fallback ou um glyph
        custom. A variante <strong>ai</strong> recebe contorno azul e é
        reservada a agentes — nunca pra usuários humanos. Status (online,
        ocupado, ausente, offline) entra composto via{" "}
        <code className="mono">AwStatusDot</code>{" "}
        com <code className="mono">absolute</code> +{" "}
        <code className="mono">ring</code>.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Pessoa real → imagem; fallback automático pra iniciais.</>,
            <>Agente → variante <code className="mono">ai</code> com glyph (`auto_awesome`, `psychology`, etc.).</>,
            <>Status overlay: <code className="mono">{`<AwStatusDot variant="live" ring absolute />`}</code>{" "}dentro de wrapper relative.</>,
            <>Em listas densas, agrupar com <code className="mono">AwAvatarGroup</code> — sobreposição -10px.</>,
            <>Iniciais sempre derivadas do nome: &ldquo;Marina Souza&rdquo; → MS.</>,
          ]}
          dontUse={[
            <>Avatar quadrado — sempre circular.</>,
            <>Variante AI para humano — distorce o significado.</>,
            <>Mais de 4 avatares empilhados no group sem &ldquo;+N&rdquo;.</>,
            <>Status dot sem <code className="mono">ring</code> em cima de avatar — some no fundo.</>,
          ]}
        />

        {/* ── Tamanhos ────────────────────────────────────────────── */}
        <Section
          id="sizes"
          title="Tamanhos"
          lead="Três escalas: sm 24, md 36 (padrão), lg 48. Aplica pra iniciais, imagem e AI — cresce junto. Use sm em listas densas, md em rows e cards, lg em headers e hero de perfil."
        >
          <Stage label="Iniciais · 3 tamanhos">
            <AwAvatar size="sm" initials="MS" />
            <AwAvatar size="md" initials="MS" />
            <AwAvatar size="lg" initials="MS" />
          </Stage>

          <Stage label="Imagem · 3 tamanhos" gridClassName="flex flex-wrap items-center gap-4 mt-4">
            <AwAvatar size="sm" src={PHOTO_MARINA} alt="Marina" initials="MS" />
            <AwAvatar size="md" src={PHOTO_MARINA} alt="Marina" initials="MS" />
            <AwAvatar size="lg" src={PHOTO_MARINA} alt="Marina" initials="MS" />
          </Stage>

          <Stage label="ai · 3 tamanhos" gridClassName="flex flex-wrap items-center gap-4 mt-4">
            <AwAvatar size="sm" ai>
              <span className="material-symbols-rounded" style={{ fontSize: 12 }}>
                auto_awesome
              </span>
            </AwAvatar>
            <AwAvatar size="md" ai>
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
                auto_awesome
              </span>
            </AwAvatar>
            <AwAvatar size="lg" ai>
              <span className="material-symbols-rounded" style={{ fontSize: 22 }}>
                auto_awesome
              </span>
            </AwAvatar>
          </Stage>
        </Section>

        {/* ── Com imagem ───────────────────────────────────────────── */}
        <Section
          id="images"
          title="Com imagem real"
          lead="Sempre que houver foto, prefira imagem — iniciais são fallback. A imagem ocupa 100% do container com object-fit cover; se o src falhar, cai pras iniciais automaticamente."
        >
          <Stage label="6 pessoas · md" gridClassName="flex flex-wrap items-center gap-3">
            <AwAvatar src={PHOTO_MARINA} alt="Marina Souza" initials="MS" />
            <AwAvatar src={PHOTO_JOAO} alt="João Pereira" initials="JP" />
            <AwAvatar src={PHOTO_LARA} alt="Lara Andrade" initials="LA" />
            <AwAvatar src={PHOTO_DANI} alt="Daniel Reis" initials="DR" />
            <AwAvatar src={PHOTO_RICARDO} alt="Ricardo Lima" initials="RL" />
            <AwAvatar src={PHOTO_CAMILA} alt="Camila Tavares" initials="CT" />
          </Stage>

          <Stage
            label="Hero · lg com legenda"
            hint="Pattern de header de perfil: avatar grande à esquerda, nome + role à direita."
            gridClassName="flex flex-wrap items-center gap-4 mt-4"
          >
            <div className="flex items-center gap-3">
              <AwAvatar size="lg" src={PHOTO_MARINA} alt="Marina" initials="MS" />
              <div>
                <div className="text-[15px] font-medium text-[var(--fg-primary)]">
                  Marina Souza
                </div>
                <div className="caption">Head of Support · Awsales</div>
              </div>
            </div>
          </Stage>

          <div className="rounded-[var(--radius-md)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] px-4 py-3 text-sm text-[var(--aw-blue-900)] mt-4">
            <code className="mono">initials</code> ainda é obrigatório como
            fallback — se a imagem demorar ou falhar, o usuário não fica vendo
            um círculo vazio.
          </div>
        </Section>

        {/* ── Status ──────────────────────────────────────────────── */}
        <Section
          id="status"
          title="Status (online · ocupado · ausente · offline)"
          lead="Status é composto: AwAvatar não traz prop própria. Use AwStatusDot com absolute + ring pra fazer o dot atravessar a borda do avatar com um halo da cor da superfície. Quatro variantes mapeam o estado real."
        >
          <Stage label="md · 4 estados" gridClassName="flex flex-wrap items-center gap-6">
            <AvatarStatus photo={PHOTO_MARINA} initials="MS" label="Online" variant="live" />
            <AvatarStatus photo={PHOTO_JOAO} initials="JP" label="Ocupado" variant="attention" />
            <AvatarStatus photo={PHOTO_LARA} initials="LA" label="Ausente" variant="info" />
            <AvatarStatus photo={PHOTO_DANI} initials="DR" label="Offline" variant="offline" />
          </Stage>

          <Stage label="sm · lg · status proporcional" gridClassName="flex flex-wrap items-end gap-6 mt-4">
            <div className="flex flex-col items-center gap-2">
              <span style={{ position: "relative", display: "inline-block" }}>
                <AwAvatar size="sm" src={PHOTO_RICARDO} alt="Ricardo" initials="RL" />
                <AwStatusDot variant="live" size="xs" ring absolute />
              </span>
              <span className="caption">sm</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span style={{ position: "relative", display: "inline-block" }}>
                <AwAvatar size="md" src={PHOTO_RICARDO} alt="Ricardo" initials="RL" />
                <AwStatusDot variant="live" size="sm" ring absolute />
              </span>
              <span className="caption">md</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span style={{ position: "relative", display: "inline-block" }}>
                <AwAvatar size="lg" src={PHOTO_RICARDO} alt="Ricardo" initials="RL" />
                <AwStatusDot variant="live" size="md" ring absolute />
              </span>
              <span className="caption">lg</span>
            </div>
          </Stage>

          <Stage label="ai com status · agente disponível com pulse" gridClassName="flex flex-wrap items-center gap-6 mt-4">
            <div className="flex items-center gap-3">
              <span style={{ position: "relative", display: "inline-block" }}>
                <AwAvatar size="md" ai>
                  <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
                    auto_awesome
                  </span>
                </AwAvatar>
                <AwStatusDot variant="live" size="sm" ring absolute pulse />
              </span>
              <div>
                <div className="text-[14px] font-medium text-[var(--fg-primary)]">
                  Agente Suporte N1
                </div>
                <div className="caption">Disponível · pulsa enquanto pensa</div>
              </div>
            </div>
          </Stage>

          <CodeExample label="composição padrão">{`import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwStatusDot } from "@/components/ui/AwStatusDot"

<span style={{ position: "relative", display: "inline-block" }}>
  <AwAvatar src="/marina.jpg" alt="Marina" initials="MS" />
  <AwStatusDot variant="live" size="sm" ring absolute />
</span>`}</CodeExample>
        </Section>

        {/* ── Grupos ──────────────────────────────────────────────── */}
        <Section
          id="groups"
          title="Avatar group"
          lead="Empilha avatares com sobreposição negativa (-10 px). Use pra colaboradores, participantes da conversa ou agentes responsáveis. A partir do 4º, esconda os extras num tile +N."
        >
          <Stage label="2 pessoas · pair">
            <AwAvatarGroup>
              <AwAvatar size="md" src={PHOTO_MARINA} alt="Marina" initials="MS" />
              <AwAvatar size="md" src={PHOTO_JOAO} alt="João" initials="JP" />
            </AwAvatarGroup>
          </Stage>

          <Stage label="3 pessoas" gridClassName="flex flex-wrap items-center gap-4 mt-4">
            <AwAvatarGroup>
              <AwAvatar size="md" src={PHOTO_MARINA} alt="Marina" initials="MS" />
              <AwAvatar size="md" src={PHOTO_JOAO} alt="João" initials="JP" />
              <AwAvatar size="md" src={PHOTO_LARA} alt="Lara" initials="LA" />
            </AwAvatarGroup>
          </Stage>

          <Stage label="4 + overflow · time grande com +N" gridClassName="flex flex-wrap items-center gap-4 mt-4">
            <AwAvatarGroup>
              <AwAvatar size="md" src={PHOTO_MARINA} alt="Marina" initials="MS" />
              <AwAvatar size="md" src={PHOTO_JOAO} alt="João" initials="JP" />
              <AwAvatar size="md" src={PHOTO_LARA} alt="Lara" initials="LA" />
              <AwAvatar size="md" src={PHOTO_DANI} alt="Dani" initials="DR" />
              <AwAvatar size="md" aria-label="Mais 7 pessoas">
                +7
              </AwAvatar>
            </AwAvatarGroup>
          </Stage>

          <Stage label="Híbrido · pessoas + agente AI" gridClassName="flex flex-wrap items-center gap-4 mt-4">
            <AwAvatarGroup>
              <AwAvatar size="md" src={PHOTO_MARINA} alt="Marina" initials="MS" />
              <AwAvatar size="md" src={PHOTO_RICARDO} alt="Ricardo" initials="RL" />
              <AwAvatar size="md" ai>
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
                  auto_awesome
                </span>
              </AwAvatar>
            </AwAvatarGroup>
          </Stage>

          <Stage label="sm group · em row densa de tabela" gridClassName="flex flex-wrap items-center gap-4 mt-4">
            <AwAvatarGroup>
              <AwAvatar size="sm" src={PHOTO_MARINA} alt="Marina" initials="MS" />
              <AwAvatar size="sm" src={PHOTO_JOAO} alt="João" initials="JP" />
              <AwAvatar size="sm" src={PHOTO_LARA} alt="Lara" initials="LA" />
              <AwAvatar size="sm">+2</AwAvatar>
            </AwAvatarGroup>
          </Stage>
        </Section>

        {/* ── Em listas ───────────────────────────────────────────── */}
        <Section
          id="list-rows"
          title="Como item em lista"
          lead="Pattern recorrente: avatar + nome + role + status. Use sm em listas densas (sidebar de conversas), md em listas normais (membros do time)."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
            {[
              { name: "Marina Souza", role: "Head of Support", photo: PHOTO_MARINA, initials: "MS", status: "live" as const, statusLabel: "online" },
              { name: "João Pereira", role: "SDR", photo: PHOTO_JOAO, initials: "JP", status: "attention" as const, statusLabel: "ocupado" },
              { name: "Lara Andrade", role: "Customer Success", photo: PHOTO_LARA, initials: "LA", status: "info" as const, statusLabel: "ausente · volta 14h" },
              { name: "Daniel Reis", role: "Engineering", photo: PHOTO_DANI, initials: "DR", status: "offline" as const, statusLabel: "offline" },
            ].map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border-subtle)] last:border-b-0"
              >
                <span style={{ position: "relative", display: "inline-block" }}>
                  <AwAvatar size="md" src={p.photo} alt={p.name} initials={p.initials} />
                  <AwStatusDot variant={p.status} size="sm" ring absolute />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--fg-primary)]">
                    {p.name}
                  </div>
                  <div className="caption">{p.role} · {p.statusLabel}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Anatomia ────────────────────────────────────────────── */}
        <Section
          id="anatomy"
          title="Anatomia"
          lead="Container circular, conteúdo centralizado. Iniciais em Geist medium; imagens cobrem com object-fit cover. Status entra externamente, sempre via AwStatusDot."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec k="forma" v="círculo · radius full" d="Constante em todos os tamanhos e variantes." />
            <Spec k="sm" v="24 × 24 · 11 px font" d="Listas densas, chat sidebar." />
            <Spec k="md" v="36 × 36 · 13 px font" d="Padrão. Rows, cards, headers." />
            <Spec k="lg" v="48 × 48 · 16 px font" d="Hero de perfil, modal de identidade." />
            <Spec k="fundo default" v="--bg-surface" d="Cinza neutro pra contraste com iniciais." />
            <Spec k="borda" v="1 px --border-default" d="Hairline pra recortar do fundo." />
            <Spec k="variante ai" v="--aw-blue-400 border" d="Texto --aw-blue-600. Glyph entra como children." />
            <Spec k="overlap group" v="-10 px margin-left" d="A partir do segundo avatar." />
            <Spec k="status dot ring" v="2-4 px box-shadow" d="Cor casada com --bg-raised do fundo." />
          </div>
        </Section>

        {/* ── API ─────────────────────────────────────────────────── */}
        <Section id="api" title="API" lead={`Import: import { AwAvatar, AwAvatarGroup } from "@/components/ui/AwAvatar".`}>
          <ApiTable>
            <PropRow prop="size" type='"sm" | "md" | "lg"' def='"md"' doc="24 / 36 / 48 px de lado." />
            <PropRow prop="ai" type="boolean" def="false" doc="Borda azul + texto azul. Reservado a agentes." />
            <PropRow prop="src" type="string" doc="URL da imagem. Cai pra initials/children se falhar." />
            <PropRow prop="alt" type="string" doc="Texto alternativo da imagem." />
            <PropRow prop="initials" type="string" doc="Fallback de 2 letras. Derive do nome." />
            <PropRow prop="children" type="ReactNode" doc="Substitui as iniciais — use pra glyph custom ou tile '+N'." />
            <PropRow prop="...rest" type="HTMLAttributes<HTMLSpanElement>" doc="Atributos nativos repassados." />
          </ApiTable>

          <CodeExample label="composição completa">{`import { AwAvatar, AwAvatarGroup } from "@/components/ui/AwAvatar"
import { AwStatusDot } from "@/components/ui/AwStatusDot"

{/* Pessoa com status online */}
<span style={{ position: "relative", display: "inline-block" }}>
  <AwAvatar size="md" src="/marina.jpg" alt="Marina" initials="MS" />
  <AwStatusDot variant="live" size="sm" ring absolute />
</span>

{/* Group com overflow */}
<AwAvatarGroup>
  <AwAvatar size="md" src="/m.jpg" initials="MS" />
  <AwAvatar size="md" src="/j.jpg" initials="JP" />
  <AwAvatar size="md" src="/l.jpg" initials="LA" />
  <AwAvatar size="md" aria-label="Mais 7 pessoas">+7</AwAvatar>
</AwAvatarGroup>

{/* Agente AI disponível */}
<span style={{ position: "relative", display: "inline-block" }}>
  <AwAvatar size="md" ai>
    <span className="material-symbols-rounded">auto_awesome</span>
  </AwAvatar>
  <AwStatusDot variant="live" size="sm" ring absolute pulse />
</span>`}</CodeExample>
        </Section>

        {/* ── Do / Don't ──────────────────────────────────────────── */}
        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Iniciais derivadas do nome real, sempre 2 letras.</>,
              <>AI variant só pra agentes — glyph dentro via children.</>,
              <>Status overlay sempre com <code className="mono">ring</code> + <code className="mono">absolute</code>.</>,
              <>Group com <code className="mono">+N</code> a partir do quarto.</>,
              <>Fornecer <code className="mono">alt</code> em todas as imagens.</>,
            ]}
            donts={[
              <>Hardcode de width/height via style.</>,
              <>Variante AI em pessoa real.</>,
              <>Status dot sem ring sobre avatar — some no contorno.</>,
              <>Iniciais com 3+ letras — não cabe e quebra o ritmo.</>,
              <>Mais de 4 avatares visíveis sem agrupar em +N.</>,
            ]}
          />
        </Section>
      </div>
    </>
  )
}

/* ──────────────────────────────────────────────────────────────────
 * AvatarStatus — helper só pra demo (não exportado). Compõe avatar
 * + status dot com legenda embaixo. No produto a composição vai
 * direto inline (sem wrapper custom).
 * ────────────────────────────────────────────────────────────────── */
function AvatarStatus({
  photo,
  initials,
  label,
  variant,
}: {
  photo: string
  initials: string
  label: string
  variant: "live" | "attention" | "offline" | "info"
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span style={{ position: "relative", display: "inline-block" }}>
        <AwAvatar size="md" src={photo} alt={label} initials={initials} />
        <AwStatusDot variant={variant} size="sm" ring absolute />
      </span>
      <span className="caption">{label}</span>
    </div>
  )
}
