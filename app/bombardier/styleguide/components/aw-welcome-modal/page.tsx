import {
  ApiTable,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"
import { WelcomeModalDemo } from "./WelcomeModalDemo"

export default function AwWelcomeModalPage() {
  return (
    <>
      <PageHero title="AwWelcomeModal">
        Modal celebratório de boas-vindas. Usado no final do fluxo de Primeiro
        Acesso, logo após o usuário cair em <code className="font-mono text-[13px]">/inicio</code>,
        pra oferecer 1–3 caminhos de início (convidar equipe, tour guiado,
        explorar por conta). Hero image no topo + tile-actions stacked com
        ícone, label e helper.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="preview"
            title="Preview ao vivo"
            lead="Cada botão abre uma variação. O hero usa group-bg-17 — a mesma capa que aparece no brand pane do onboarding — pra continuidade visual."
          >
            <Stage label="Demos" hint="Abra cada modal e teste teclado + scrim">
              <WelcomeModalDemo />
            </Stage>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="O modal é image-led: a capa ocupa o topo inteiro, fadeia pro fundo do card e dá lugar ao bloco de conteúdo. Cada ação é uma tile com slot de ícone, label e helper."
          >
            <div className="rounded-xl border border-border-subtle bg-bg-raised p-6 text-sm text-fg-secondary leading-relaxed">
              <ul className="m-0 flex flex-col gap-2 p-0 list-disc pl-5">
                <li>
                  <b className="text-fg-primary">Hero image</b> — 200px de altura,
                  bleed nos cantos superiores, fade pro <code className="font-mono text-xs">--bg-raised</code> no rodapé.
                </li>
                <li>
                  <b className="text-fg-primary">Close button</b> — opcional
                  (some quando <code className="font-mono text-xs">dismissible=false</code>),
                  flutua sobre a capa com leve blur.
                </li>
                <li>
                  <b className="text-fg-primary">Eyebrow + título + descrição</b>
                  {" "}— eyebrow opcional acima do <code className="font-mono text-xs">h4</code> (ex. "Bem-vindo à Aswork").
                </li>
                <li>
                  <b className="text-fg-primary">Tile actions</b> — lista de 1
                  a N botões empilhados. Cada um tem ícone (Material Symbol),
                  label, helper opcional e chevron à direita. Marque{" "}
                  <code className="font-mono text-xs">primary: true</code> pra
                  destacar (surface invertida) e <code className="font-mono text-xs">comingSoon: true</code> pra mostrar a chip "em breve".
                </li>
                <li>
                  <b className="text-fg-primary">Footnote</b> — texto pequeno
                  centralizado abaixo das ações, opcional.
                </li>
              </ul>
            </div>
          </Section>

          <Section
            id="usage"
            title="Quando usar"
            lead="Reserve pra momentos one-shot — não pra notificações recorrentes."
          >
            <div className="rounded-xl border border-border-subtle bg-bg-raised p-6 text-sm text-fg-secondary leading-relaxed">
              <ul className="m-0 flex flex-col gap-2 p-0 list-disc pl-5">
                <li>
                  Final do <b className="text-fg-primary">Primeiro Acesso</b>{" "}
                  (ativação concluída → chegou na plataforma).
                </li>
                <li>
                  Conclusão de um <b className="text-fg-primary">milestone</b>{" "}
                  importante (primeiro agente publicado, integração crítica
                  conectada).
                </li>
                <li>
                  <b className="text-fg-primary">Não</b> usar pra confirmação
                  de ação destrutiva (use AwModal com destinos claros) nem pra
                  toast/notification (use AwToast).
                </li>
              </ul>
            </div>
          </Section>

          <Section
            id="props"
            title="Props"
            lead="API enxuta — o foco é declarar conteúdo + ações."
          >
            <ApiTable>
              <PropRow
                prop="open"
                type="boolean"
                doc="Controla a visibilidade do modal."
              />
              <PropRow
                prop="onClose"
                type="() => void"
                doc="Disparado ao dismissar via scrim, Esc ou botão de fechar."
              />
              <PropRow
                prop="imageSrc"
                type="string"
                doc="Hero image. Tipicamente uma capa de /assets/group-backgrounds/."
              />
              <PropRow
                prop="imageAlt"
                type="string"
                def='""'
                doc="Alt text da imagem (acessibilidade)."
              />
              <PropRow
                prop="eyebrow"
                type="ReactNode"
                doc="Pequena label maiúscula acima do título. Opcional."
              />
              <PropRow
                prop="title"
                type="ReactNode"
                doc="Headline principal — h4 tokenizado."
              />
              <PropRow
                prop="description"
                type="ReactNode"
                doc="Texto curto sob o título. Suporta JSX inline."
              />
              <PropRow
                prop="actions"
                type="AwWelcomeModalAction[]"
                doc="Lista de tile-buttons (icon + label + helper + chevron)."
              />
              <PropRow
                prop="footnote"
                type="ReactNode"
                doc="Linha pequena centralizada abaixo das ações."
              />
              <PropRow
                prop="dismissible"
                type="boolean"
                def="true"
                doc="Permite fechar via Esc ou clique fora. Desligue só pra forçar decisão."
              />
            </ApiTable>
          </Section>

          <Section
            id="action-shape"
            title="AwWelcomeModalAction"
            lead="Cada ação é um tile clicável. Use no máximo 3 — mais que isso vira menu, não boas-vindas."
          >
            <ApiTable>
              <PropRow
                prop="id"
                type="string"
                doc="Chave única (usada como key na lista)."
              />
              <PropRow
                prop="label"
                type="string"
                doc="Texto principal do tile."
              />
              <PropRow
                prop="description"
                type="ReactNode"
                doc="Helper opcional em uma linha sob o label."
              />
              <PropRow
                prop="icon"
                type="string"
                doc="Nome de Material Symbol (ex: person_add, play_arrow)."
              />
              <PropRow
                prop="primary"
                type="boolean"
                def="false"
                doc="Destaca o tile como ação recomendada (surface invertida)."
              />
              <PropRow
                prop="comingSoon"
                type="boolean"
                def="false"
                doc='Mostra chip "em breve" ao lado do label. Tile continua clicável.'
              />
              <PropRow
                prop="onClick"
                type="() => void"
                doc="Handler do tile."
              />
            </ApiTable>
          </Section>

          <Section
            id="tokens"
            title="Tokens consumidos"
            lead="Tudo vem do foundation — nada hardcoded."
          >
            <div className="rounded-xl border border-border-subtle bg-bg-raised p-6 text-sm text-fg-secondary leading-relaxed">
              <ul className="m-0 flex flex-col gap-2 p-0 list-disc pl-5">
                <li>
                  <code className="font-mono text-xs">--bg-raised</code> e{" "}
                  <code className="font-mono text-xs">--bg-surface</code> —
                  superfícies do card e dos tiles em hover.
                </li>
                <li>
                  <code className="font-mono text-xs">--fg-primary</code>,{" "}
                  <code className="font-mono text-xs">--fg-secondary</code>,{" "}
                  <code className="font-mono text-xs">--fg-tertiary</code> —
                  hierarquia tipográfica.
                </li>
                <li>
                  <code className="font-mono text-xs">--border-subtle</code> e{" "}
                  <code className="font-mono text-xs">--border</code> — bordas
                  default/hover das tiles.
                </li>
                <li>
                  <code className="font-mono text-xs">--radius-xl</code> no
                  card,{" "}
                  <code className="font-mono text-xs">--radius-lg</code> nas
                  tiles.
                </li>
                <li>
                  <code className="font-mono text-xs">--shadow-overlay</code>{" "}
                  pra elevação do modal.
                </li>
                <li>
                  <code className="font-mono text-xs">--accent-brand</code> no
                  ring de focus-visible.
                </li>
              </ul>
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}
