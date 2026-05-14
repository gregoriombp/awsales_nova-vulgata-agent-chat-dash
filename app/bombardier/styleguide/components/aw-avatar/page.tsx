import { AwAvatar, AwAvatarGroup } from "@/components/ui/AwAvatar"
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

export default function AwAvatarPage() {
  return (
    <>
      <PageHero title="Avatar">
        Marca uma pessoa, um agente ou um grupo. Três tamanhos (sm 24,
        md 32, lg 48). Aceita imagem, iniciais ou um glyph custom. A
        variante <strong>ai</strong> recebe a mesh radial blue → purple e
        é reservada a representação visual de agentes — nunca pra usuários
        humanos.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Pessoa real → imagem; fallback para iniciais quando a foto falha.</>,
            <>Agente → variante <code className="mono">ai</code> com glyph (`auto_awesome`, `psychology`, etc.).</>,
            <>Em listas densas, agrupar com <code className="mono">AwAvatarGroup</code> — sobreposição negativa de -10px.</>,
            <>Iniciais sempre derivadas do nome: &ldquo;Marina Souza&rdquo; → MS.</>,
          ]}
          dontUse={[
            <>Avatar quadrado — sempre circular.</>,
            <>Variante AI para usuários humanos — distorce o significado.</>,
            <>Mais de 4 avatares empilhados num group — use &ldquo;+N&rdquo; depois.</>,
            <>Hardcode de tamanho via style — use a prop <code className="mono">size</code>.</>,
          ]}
        />

        <Section
          id="sizes"
          title="Tamanhos"
          lead="Três escalas. md é o padrão — usado em rows, headers e cards."
        >
          <Stage label="sm 24 · md 32 · lg 48" hint="A altura cresce e a fonte das iniciais acompanha.">
            <AwAvatar size="sm" initials="MS" />
            <AwAvatar size="md" initials="MS" />
            <AwAvatar size="lg" initials="MS" />
          </Stage>
        </Section>

        <Section
          id="variants"
          title="Variantes"
          lead="Default (fundo neutro com iniciais), imagem real ou variante AI com mesh radial."
        >
          <Stage label="iniciais · imagem · AI" gridClassName="flex flex-wrap items-center gap-4">
            <AwAvatar size="lg" initials="MS" />
            <AwAvatar
              size="lg"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces"
              alt="Marina Souza"
              initials="MS"
            />
            <AwAvatar size="lg" ai>
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>
                auto_awesome
              </span>
            </AwAvatar>
            <AwAvatar size="lg" ai initials="AG" />
          </Stage>
        </Section>

        <Section
          id="group"
          title="Avatar group"
          lead="Empilha avatares com sobreposição negativa. Use pra colaboradores, participantes ou agentes responsáveis."
        >
          <Stage label="3 avatares empilhados">
            <AwAvatarGroup>
              <AwAvatar size="md" initials="MS" />
              <AwAvatar size="md" initials="JG" />
              <AwAvatar size="md" initials="LA" />
              <AwAvatar size="md" ai initials="AI" />
            </AwAvatarGroup>
          </Stage>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Container circular, conteúdo centralizado. Iniciais em Geist medium; imagens cobrem o container com object-fit."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec k="forma" v="círculo · radius full" d="Não muda por tamanho ou variante." />
            <Spec k="iniciais" v="Geist 500" d="11 px (sm) · 13 px (md) · 16 px (lg)." />
            <Spec k="fundo default" v="--bg-muted" d="Cinza neutro pra contraste com iniciais." />
            <Spec k="variante ai" v="radial blue → purple" d="A 8–10% de opacidade. Glyph entra como children." />
            <Spec k="group overlap" v="-10 px margin-left" d="A partir do segundo avatar." />
            <Spec k="fallback" v="children ?? initials" d="Children tem prioridade quando passado." />
          </div>
        </Section>

        <Section id="api" title="API" lead={`Import: import { AwAvatar, AwAvatarGroup } from "@/components/ui/AwAvatar".`}>
          <ApiTable>
            <PropRow prop="size" type='"sm" | "md" | "lg"' def='"md"' doc="24 / 32 / 48 px de lado." />
            <PropRow prop="ai" type="boolean" def="false" doc="Aplica a mesh radial AI. Reservado a agentes." />
            <PropRow prop="src" type="string" doc="URL da imagem. Cai pra initials/children se falhar." />
            <PropRow prop="alt" type="string" doc="Texto alternativo da imagem." />
            <PropRow prop="initials" type="string" doc="Fallback de 2 letras. Derive do nome." />
            <PropRow prop="children" type="ReactNode" doc="Substitui as iniciais — usar pra glyph custom." />
            <PropRow prop="...rest" type="HTMLAttributes<HTMLSpanElement>" doc="Atributos nativos repassados." />
          </ApiTable>

          <CodeExample label="básico">{`import { AwAvatar, AwAvatarGroup } from "@/components/ui/AwAvatar"

<AwAvatar size="md" src="/marina.jpg" alt="Marina" initials="MS" />

<AwAvatarGroup>
  <AwAvatar size="sm" initials="MS" />
  <AwAvatar size="sm" initials="JG" />
  <AwAvatar size="sm" ai initials="AI" />
</AwAvatarGroup>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Iniciais derivadas do nome real, sempre 2 letras.</>,
              <>AI variant só pra agentes — glyph dentro via children.</>,
              <>Em listas, group com <code className="mono">+N</code> a partir do quarto.</>,
            ]}
            donts={[
              <>Hardcode de width/height via style.</>,
              <>Variante AI em pessoa real.</>,
              <>Iniciais com 3+ letras — não cabe e quebra o ritmo.</>,
            ]}
          />
        </Section>
      </div>
    </>
  )
}
