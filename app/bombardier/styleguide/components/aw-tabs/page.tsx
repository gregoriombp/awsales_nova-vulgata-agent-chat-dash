"use client"

import * as React from "react"
import { AwTabs } from "@/components/ui/AwTabs"
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

export default function AwTabsPage() {
  const [seg, setSeg] = React.useState("recentes")
  const [std, setStd] = React.useState("geral")
  const [und, setUnd] = React.useState("agente")

  return (
    <>
      <PageHero title="Tabs">
        Alterna entre painéis dentro da <strong>mesma tela</strong> — não
        confundir com navegação entre rotas (essa é da{" "}
        <code className="mono">AwBreadcrumb</code> /{" "}
        <code className="mono">AwNavList</code>). Três variantes:{" "}
        <strong>segmented</strong> (pílula tonal), <strong>standalone</strong>{" "}
        (chips soltos) e <strong>underline</strong> (linha embaixo). Suporta
        contadores ao lado do label.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Alternar entre views <strong>na mesma tela</strong> sem mudar a URL.</>,
            <>Quando todas as opções precisam de peso visual igual.</>,
            <>Use <code className="mono">count</code> pra dar densidade — &ldquo;Inbox (12)&rdquo;.</>,
          ]}
          dontUse={[
            <>Como menu de navegação entre rotas — use AwNavList.</>,
            <>Com mais de ~5 tabs — começa a perder escaneabilidade.</>,
            <>Como filtro de listagem — use AwPill (chip).</>,
          ]}
        />

        <Section
          id="segmented"
          title="Segmented"
          lead="Pílula tonal com fundo --bg-muted e tab ativa com surface branco/raised. Default — use quando precisar de peso visual forte e contraste claro do estado ativo."
        >
          <Stage label="3 abas, 1 com contador">
            <AwTabs
              variant="segmented"
              value={seg}
              onChange={setSeg}
              items={[
                { value: "recentes", label: "Recentes" },
                { value: "fixadas", label: "Fixadas", count: 3 },
                { value: "arquivadas", label: "Arquivadas" },
              ]}
            />
          </Stage>
        </Section>

        <Section
          id="standalone"
          title="Standalone"
          lead="Chips independentes. Use quando as tabs estão soltas no canto de uma toolbar e o segmented seria visualmente pesado."
        >
          <Stage label="standalone com chip ativo">
            <AwTabs
              variant="standalone"
              value={std}
              onChange={setStd}
              items={[
                { value: "geral", label: "Geral" },
                { value: "fontes", label: "Fontes", count: 4 },
                { value: "publicacao", label: "Publicação" },
                { value: "avancado", label: "Avançado" },
              ]}
            />
          </Stage>
        </Section>

        <Section
          id="underline"
          title="Underline"
          lead="Tabs com borda inferior animada. Use em headers de seção / sub-páginas onde o segmented seria visualmente pesado demais."
        >
          <Stage label="underline · header de seção">
            <AwTabs
              variant="underline"
              value={und}
              onChange={setUnd}
              items={[
                { value: "agente", label: "Agente" },
                { value: "conversas", label: "Conversas", count: 128 },
                { value: "metricas", label: "Métricas" },
                { value: "logs", label: "Logs" },
              ]}
            />
          </Stage>
        </Section>

        <Section
          id="disabled"
          title="Disabled"
          lead="Marque tabs indisponíveis com disabled — opacity 0.5, sem interação. Útil quando uma feature ainda não foi habilitada."
        >
          <Stage label="3 tabs, 1 disabled">
            <AwTabs
              variant="segmented"
              value="atual"
              onChange={() => {}}
              items={[
                { value: "atual", label: "Versão atual" },
                { value: "rascunho", label: "Rascunho" },
                { value: "historico", label: "Histórico", disabled: true },
              ]}
            />
          </Stage>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Cada tab é um botão com label + count opcional. Heights e padding variam por variant."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec k="segmented altura" v="32 px" d="Pad y 4, x 12. Track --bg-muted." />
            <Spec k="standalone altura" v="28 px" d="Chip solto, sem track." />
            <Spec k="underline altura" v="40 px" d="Linha 2px embaixo no ativo." />
            <Spec k="count badge" v="opacity 0.6 → 0.7 ativo" d="Mesmo tipo do label." />
            <Spec k="ativo segmented" v="surface + shadow xs" d="Pílula com elevação 1." />
            <Spec k="hover" v="--fg-primary" d="Inativo escurece pra primary." />
            <Spec k="focus" v="ring 3 px · blue 30%" d="Mesmo token padrão." />
            <Spec k="motion" v="--dur-base · --ease-out" d="Transição de cor / underline." />
          </div>
        </Section>

        <Section id="api" title="API" lead={`Import: import { AwTabs } from "@/components/ui/AwTabs".`}>
          <ApiTable>
            <PropRow
              prop="items"
              type="AwTabsItem[]"
              doc="Array de { value, label, count?, disabled? }."
            />
            <PropRow prop="value" type="string" doc="Tab ativa controlada." />
            <PropRow prop="onChange" type="(value: string) => void" doc="Disparado ao clicar em uma tab." />
            <PropRow
              prop="variant"
              type='"segmented" | "standalone" | "underline"'
              def='"segmented"'
              doc="Aparência. Ver seções acima."
            />
            <PropRow prop="aria-label" type="string" doc="Rótulo de acessibilidade da tablist." />
            <PropRow prop="className" type="string" doc="Classe extra na tablist." />
          </ApiTable>

          <CodeExample label="básico controlado">{`"use client"
import { useState } from "react"
import { AwTabs } from "@/components/ui/AwTabs"

const [tab, setTab] = useState("recentes")

<AwTabs
  value={tab}
  onChange={setTab}
  items={[
    { value: "recentes", label: "Recentes" },
    { value: "fixadas", label: "Fixadas", count: 3 },
    { value: "arquivadas", label: "Arquivadas" },
  ]}
  aria-label="Filtro de conversas"
/>`}</CodeExample>

          <CodeExample label="underline em header de seção">{`<header>
  <h2>Agente · Suporte N1</h2>
  <AwTabs
    variant="underline"
    value={tab}
    onChange={setTab}
    items={[
      { value: "agente", label: "Agente" },
      { value: "conversas", label: "Conversas", count: 128 },
      { value: "metricas", label: "Métricas" },
    ]}
  />
</header>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Use pra alternar painéis <strong>na mesma rota</strong>.</>,
              <>Conte com <code className="mono">count</code> quando o número faz parte do contexto.</>,
              <>Underline em header de seção; segmented em filtros densos.</>,
            ]}
            donts={[
              <>Tabs pra navegar entre rotas — use AwNavList.</>,
              <>Mais de 5 tabs visíveis sem scroll — quebra escaneabilidade.</>,
              <>Misturar variants na mesma tela.</>,
            ]}
          />
        </Section>
      </div>
    </>
  )
}
