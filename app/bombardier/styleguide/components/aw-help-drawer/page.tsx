"use client"

import { useEffect } from "react"
import { AwHelpDrawer } from "@/components/ui/AwHelpDrawer"
import { AwButton } from "@/components/ui/AwButton"
import { useHelpDrawer } from "@/lib/help/store"
import {
  ApiTable,
  CodeExample,
  DoDont,
  KeyboardTable,
  PageHero,
  PropRow,
  RelatedLinks,
  Section,
  Spec,
  Tldr,
  Toc,
  TokensConsumed,
} from "../../_primitives"

/** Semeia o store pra o preview inline sempre abrir num artigo real. */
function useSeededHelp(articleId: string) {
  const openHelp = useHelpDrawer((s) => s.openHelp)
  useEffect(() => {
    openHelp(articleId)
  }, [openHelp, articleId])
}

function EmbeddedPreview() {
  useSeededHelp("exclusao-de-dados-privacidade")
  return (
    <div className="h-[620px] flex rounded-lg overflow-hidden border border-(--border-subtle)">
      <div className="flex-1 bg-(--bg-surface) grid place-items-center text-(--fg-tertiary) body-sm">
        conteúdo da página (empurrado)
      </div>
      <AwHelpDrawer />
    </div>
  )
}

export default function HelpDrawerPage() {
  const openHelp = useHelpDrawer((s) => s.openHelp)

  return (
    <>
      <PageHero title="Help drawer">
        A Ajuda rápida — documentação in-app que abre numa calha à direita do
        shell e <strong>empurra o conteúdo pro lado</strong>, sem sobrepor. Herda
        a mecânica de push do Cortex (largura animada, in-flow) para que qualquer
        “entender” / “saiba mais” do produto vire um artigo pesquisável, com
        busca e cross-links, em vez de mandar o usuário embora da tela.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Toc
          items={[
            { id: "embedded", label: "Painel (push)" },
            { id: "trigger", label: "Abrir de qualquer lugar" },
            { id: "anatomy", label: "Anatomia" },
            { id: "api", label: "API" },
            { id: "content", label: "Modelo de conteúdo" },
            { id: "a11y", label: "Acessibilidade" },
            { id: "tokens", label: "Tokens" },
            { id: "code", label: "Código" },
            { id: "do-dont", label: "Do / Don't" },
          ]}
        />

        <Tldr
          use={[
            <>
              Para explicar “por que isto funciona assim” sem tirar o usuário da
              tela — ex.: por que a exclusão de conta não é self-service.
            </>,
            <>
              Quando o conteúdo é documentação curta e navegável (artigo + busca
              + relacionados), no espírito da ajuda do Google Ads.
            </>,
            <>
              Como calha que <strong>empurra</strong> o conteúdo (igual ao
              Cortex), preservando o contexto por baixo.
            </>,
          ]}
          dontUse={[
            <>
              Para o assistente conversacional — isso é o{" "}
              <code className="mono">AwCopilotDrawer</code> (Cortex).
            </>,
            <>
              Para um drawer neutro que sobrepõe com scrim — use{" "}
              <code className="mono">AwSheet</code>.
            </>,
            <>
              Para textos longos de política/jurídico — esses merecem página
              própria, não a calha.
            </>,
          ]}
        />

        <Section
          id="embedded"
          title="Painel (push)"
          lead="O preview canônico. O painel é in-flow: quando aberto, ocupa 420px na calha direita e empurra o conteúdo, em vez de flutuar por cima com z-index. Topo com voltar/fechar, busca e o artigo em foco."
        >
          <EmbeddedPreview />
        </Section>

        <Section
          id="trigger"
          title="Abrir de qualquer lugar"
          lead="O estado vive num store Zustand (useHelpDrawer), então qualquer botão do produto abre a ajuda já num artigo. Abrir a Ajuda fecha o Cortex — os dois dividem a mesma calha e nunca empurram juntos."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8 flex flex-wrap items-center gap-3">
            <AwButton
              variant="secondary"
              iconRight="arrow_forward"
              onClick={() => openHelp("exclusao-de-dados-privacidade")}
            >
              Entender exclusão de dados
            </AwButton>
            <AwButton
              variant="secondary"
              iconRight="arrow_forward"
              onClick={() => openHelp("exportar-seus-dados")}
            >
              Exportar seus dados
            </AwButton>
            <span className="body-sm text-(--fg-secondary)">
              Fora do styleguide, isto empurra o conteúdo do shell. Feche com o X
              ou{" "}
              <kbd className="mono text-xs px-2 py-0.5 rounded-sm border border-(--border-default) bg-(--bg-surface) text-(--fg-primary)">
                Esc
              </kbd>
              .
            </span>
          </div>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Três zonas verticais num aside de 420px, ancorado à direita. Fundo em --bg-raised; busca e callouts em --bg-surface."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec k="top bar" v="voltar + título + X" d="Voltar aparece ao buscar ou navegar entre artigos." />
            <Spec k="busca" v="filtra o catálogo" d="Casa por título, resumo e keywords do artigo." />
            <Spec k="corpo" v="artigo / resultados" d="Blocos do artigo, ou a lista de resultados da busca." />
            <Spec k="width" v="420 px" d="Largura fixa da calha (HELP_DRAWER_WIDTH)." />
            <Spec k="push" v="width 0 → 420" d="transition-[width,margin] 300ms — in-flow, não overlay." />
            <Spec k="dismiss" v="Esc / X" d="Fecha a ajuda (close())." />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`O componente é dirigido por store — sem props. Import: import { AwHelpDrawer } from "@/components/ui/AwHelpDrawer" e o store import { useHelpDrawer } from "@/lib/help/store".`}
        >
          <div className="aw-eyebrow mb-2">useHelpDrawer()</div>
          <ApiTable>
            <PropRow
              prop="openHelp"
              type="(articleId: string) => void"
              doc="Abre a ajuda já num artigo. Fecha o Cortex pra não haver dois empurrões."
            />
            <PropRow
              prop="navigate"
              type="(articleId: string) => void"
              doc="Vai pra outro artigo empilhando o atual no histórico (habilita o voltar)."
            />
            <PropRow prop="setQuery" type="(query: string) => void" doc="Atualiza a busca do topo." />
            <PropRow
              prop="back"
              type="() => void"
              doc="Volta: primeiro limpa a busca, depois desempilha o histórico."
            />
            <PropRow prop="close" type="() => void" doc="Fecha o painel." />
            <PropRow prop="open / articleId / query / history" type="estado" doc="Leitura do estado atual do painel." />
          </ApiTable>
        </Section>

        <Section
          id="content"
          title="Modelo de conteúdo"
          lead="Os artigos são declarativos, em lib/help/articles.ts. Cada artigo tem título, resumo (aparece na busca), keywords e blocos. related[] vira a seção 'Saiba mais'."
        >
          <div className="aw-eyebrow mb-2">HelpArticle</div>
          <ApiTable>
            <PropRow prop="id" type="string" doc="Chave do artigo (usada por openHelp/navigate)." />
            <PropRow prop="title" type="string" doc="Título grande no topo do artigo." />
            <PropRow prop="summary" type="string" doc="Uma linha — resultado da busca." />
            <PropRow prop="keywords" type="string[]" doc="Sinônimos pra a busca casar." />
            <PropRow prop="blocks" type='{ kind: "p" | "h" | "ul" | "callout"; ... }[]' doc="Conteúdo: parágrafo, subtítulo, lista ou callout com ícone." />
            <PropRow prop="related" type="string[]" doc="Ids de artigos relacionados (seção 'Saiba mais')." />
          </ApiTable>
        </Section>

        <Section
          id="a11y"
          title="Acessibilidade"
          lead='O painel é um role="dialog" rotulado como Ajuda rápida. Esc fecha.'
        >
          <KeyboardTable
            rows={[
              { keys: ["Esc"], action: "Fecha o painel (close())." },
            ]}
          />
        </Section>

        <Section
          id="tokens"
          title="Tokens consumidos"
          lead="O chrome não tem cor hardcoded — tudo vem do contexto."
        >
          <TokensConsumed
            tokens={[
              { token: "--bg-raised", role: "Corpo do painel." },
              { token: "--bg-surface", role: "Campo de busca, callouts e o vazio 'empurrado' do preview." },
              { token: "--border-subtle", role: "Bordas e divisórias." },
              { token: "--fg-primary", role: "Títulos e texto principal." },
              { token: "--fg-secondary", role: "Corpo dos parágrafos e listas." },
              { token: "--fg-tertiary", role: "Ícones, bullets e placeholders." },
              { token: "--bg-hover", role: "Hover dos botões (voltar, fechar, relacionados)." },
            ]}
          />
        </Section>

        <Section
          id="code"
          title="Código"
          lead="A calha vive uma vez no shell (AwDashboardLayout); as telas só disparam openHelp."
        >
          <CodeExample label="abrir de um botão">{`import { useHelpDrawer } from "@/lib/help/store"

const openHelp = useHelpDrawer((s) => s.openHelp)

<AwButton onClick={() => openHelp("exclusao-de-dados-privacidade")}>
  Entender exclusão de dados e privacidade
</AwButton>`}</CodeExample>

          <CodeExample label="a calha no shell (já montada)">{`// components/ui/AwDashboardLayout.tsx
const isHelpOpen = useHelpDrawer((s) => s.open)

<div style={{ width: isHelpOpen ? HELP_DRAWER_WIDTH : 0 }}
     className="transition-[width,margin] duration-300 ease-out shrink-0">
  <AwHelpDrawer />
</div>`}</CodeExample>

          <CodeExample label="novo artigo">{`// lib/help/articles.ts
"meu-artigo": {
  id: "meu-artigo",
  title: "Título do artigo",
  summary: "Uma linha pra busca.",
  keywords: ["sinônimo"],
  blocks: [
    { kind: "p", text: "Parágrafo." },
    { kind: "h", text: "Subtítulo" },
    { kind: "ul", items: ["Item a", "Item b"] },
    { kind: "callout", icon: "info", text: "Aviso." },
  ],
  related: ["outro-artigo"],
}`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Use pra tirar dúvidas <em>na</em> tela — o push preserva o contexto por baixo.</>,
              <>Escreva artigos curtos e navegáveis; ligue os relacionados com <code className="mono">related</code>.</>,
              <>Deixe a calha única no shell — as telas só chamam <code className="mono">openHelp</code>.</>,
            ]}
            donts={[
              <>Reimplementar como overlay com scrim — o ponto é <strong>empurrar</strong>, não cobrir.</>,
              <>Duplicar o painel por página — ele é global (store).</>,
              <>Usar pra conversa com IA — isso é o <code className="mono">AwCopilotDrawer</code>.</>,
            ]}
          />
        </Section>

        <RelatedLinks
          items={[
            {
              name: "Copilot drawer",
              href: "/bombardier/styleguide/components/aw-copilot-drawer",
              description: "O Cortex — mesma mecânica de push, propósito conversacional.",
            },
            {
              name: "Sheets e drawers",
              href: "/bombardier/styleguide/components/sheet",
              description: "Painéis laterais que sobrepõem com scrim (AwSheet).",
            },
          ]}
        />
      </div>
    </>
  )
}
