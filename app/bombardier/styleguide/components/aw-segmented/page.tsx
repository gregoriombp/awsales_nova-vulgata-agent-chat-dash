"use client"

import * as React from "react"
import { AwSegmented } from "@/components/ui/AwSegmented"
import { AwBrandLogo } from "@/components/ui/AwBrandLogo"
import { AwLogo } from "@/components/ui/AwLogo"
import { Icon } from "@/components/ui/Icon"
import {
  ApiTable,
  CodeExample,
  DoDont,
  KeyboardTable,
  PageHero,
  PropRow,
  Section,
  Spec,
  Stage,
  Tldr,
} from "../../_primitives"

export default function AwSegmentedPage() {
  const [basic, setBasic] = React.useState<"lista" | "quadro">("lista")
  const [sizeSm, setSizeSm] = React.useState<"dia" | "semana" | "mes">("semana")
  const [sizeMd, setSizeMd] = React.useState<"dia" | "semana" | "mes">("semana")
  const [view, setView] = React.useState<"tabela" | "grafico" | "cartoes">("grafico")
  const [origin, setOrigin] = React.useState<"meta" | "aswork" | "ambos">("aswork")
  const [plan, setPlan] = React.useState<"mensal" | "anual" | "enterprise">("mensal")

  return (
    <>
      <PageHero title="Segmented">
        Controle <strong>segmentado de seleção única</strong> — alterna entre um
        conjunto pequeno de opções mutuamente exclusivas dentro de uma trilha.
        O segmento selecionado usa o tratamento <strong>primary</strong> do DS
        (mesmo preenchimento do <code className="mono">AwButton</code> primary:{" "}
        <code className="mono">--fg-primary</code> sobre{" "}
        <code className="mono">--bg-canvas</code>). Cada segmento aceita um nó{" "}
        <em>leading</em> arbitrário — ícone do Material Symbols, logo de marca,
        ou vários lado a lado.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Trocar entre <strong>2–4 opções exclusivas</strong> com peso visual igual.</>,
            <>Quando o estado ativo precisa de contraste forte (preenchimento sólido).</>,
            <>Filtros de visualização compactos — &ldquo;Dividir por&rdquo;, &ldquo;Por destino&rdquo;.</>,
          ]}
          dontUse={[
            <>Para navegar entre rotas — use <code className="mono">AwNavList</code>.</>,
            <>Para alternar painéis na mesma tela com contadores — use <code className="mono">AwTabs</code>.</>,
            <>Com muitas opções (&gt;4) ou rótulos longos — vira um <code className="mono">AwSelect</code>.</>,
          ]}
        />

        <Section
          id="basico"
          title="Uso básico"
          lead="Rótulos simples, seleção controlada via value / onChange. O segmento ativo recebe o preenchimento primary."
        >
          <Stage label="2 opções, controlado">
            <AwSegmented
              ariaLabel="Modo de exibição"
              value={basic}
              onChange={setBasic}
              options={[
                { value: "lista", label: "Lista" },
                { value: "quadro", label: "Quadro" },
              ]}
            />
          </Stage>
        </Section>

        <Section
          id="tamanhos"
          title="Tamanhos"
          lead="Duas densidades: md (padrão, h-8 / body-sm) e sm (h-7 / body-xs) para topbars e linhas mais apertadas."
        >
          <Stage label="sm e md" gridClassName="flex flex-wrap items-center gap-6">
            <div className="flex flex-col items-start gap-2">
              <span className="aw-eyebrow">size=&quot;sm&quot;</span>
              <AwSegmented
                size="sm"
                ariaLabel="Granularidade (sm)"
                value={sizeSm}
                onChange={setSizeSm}
                options={[
                  { value: "dia", label: "Dia" },
                  { value: "semana", label: "Semana" },
                  { value: "mes", label: "Mês" },
                ]}
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <span className="aw-eyebrow">size=&quot;md&quot;</span>
              <AwSegmented
                size="md"
                ariaLabel="Granularidade (md)"
                value={sizeMd}
                onChange={setSizeMd}
                options={[
                  { value: "dia", label: "Dia" },
                  { value: "semana", label: "Semana" },
                  { value: "mes", label: "Mês" },
                ]}
              />
            </div>
          </Stage>
        </Section>

        <Section
          id="icones"
          title="Com ícones"
          lead="Passe um Material Symbol via leading. O ícone herda a cor do segmento — no ativo vira --bg-canvas junto com o rótulo."
        >
          <Stage label="leading = <Icon />">
            <AwSegmented
              ariaLabel="Visualização do relatório"
              value={view}
              onChange={setView}
              options={[
                { value: "tabela", label: "Tabela", leading: <Icon name="table_rows" size={16} /> },
                { value: "grafico", label: "Gráfico", leading: <Icon name="bar_chart" size={16} /> },
                { value: "cartoes", label: "Cartões", leading: <Icon name="grid_view" size={16} /> },
              ]}
            />
          </Stage>
        </Section>

        <Section
          id="logos"
          title="Com logos de marca"
          lead="O leading aceita qualquer nó — inclusive logos de marca, e mais de um lado a lado. Aqui: Meta, Aswork, e os dois juntos para a opção combinada."
        >
          <Stage label="leading = <AwBrandLogo /> · <AwLogo /> · dois juntos">
            <AwSegmented
              ariaLabel="Origem dos dados"
              value={origin}
              onChange={setOrigin}
              options={[
                {
                  value: "meta",
                  label: "Meta",
                  leading: <AwBrandLogo brand="meta" markOnly size={16} />,
                },
                {
                  value: "aswork",
                  label: "Aswork",
                  leading: <AwLogo variant="mark" height={13} />,
                },
                {
                  value: "ambos",
                  label: "Aswork e Meta",
                  leading: (
                    <span className="inline-flex items-center gap-1">
                      <AwLogo variant="mark" height={13} />
                      <AwBrandLogo brand="meta" markOnly size={16} />
                    </span>
                  ),
                },
              ]}
            />
          </Stage>
        </Section>

        <Section
          id="estados"
          title="Selecionado e desabilitado"
          lead="O segmento selecionado fica com o preenchimento primary; um segmento desabilitado some da navegação por teclado e cai para opacity 0.5, sem interação."
        >
          <Stage label="3ª opção desabilitada">
            <AwSegmented
              ariaLabel="Plano de cobrança"
              value={plan}
              onChange={setPlan}
              options={[
                { value: "mensal", label: "Mensal" },
                { value: "anual", label: "Anual" },
                { value: "enterprise", label: "Enterprise", disabled: true },
              ]}
            />
          </Stage>
        </Section>

        <Section
          id="anatomia"
          title="Anatomia"
          lead="Trilha em --bg-muted com hairline; cada segmento é um <button type='button'> de largura variável. Sem pílula deslizante — o ativo é um fundo por segmento."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec k="trilha" v="--bg-muted" d="Borda --border-subtle, padding 4 (md) / 2 (sm)." />
            <Spec k="altura md / sm" v="32 / 28 px" d="body-sm / body-xs, font-medium." />
            <Spec k="ativo (primary)" v="--fg-primary" d="Texto --bg-canvas. Igual ao AwButton primary." />
            <Spec k="inativo" v="--fg-secondary" d="Hover: bg --bg-hover + texto --fg-primary." />
            <Spec k="desabilitado" v="opacity 0.5" d="pointer-events-none, fora do roving." />
            <Spec k="foco" v="ring 2 · --ring-focus" d="Offset 2 sobre --bg-muted." />
            <Spec k="raio" v="trilha xl/lg · seg lg/md" d="Trilha um passo acima do segmento." />
            <Spec k="motion" v="--dur-fast · cor" d="transition-colors duration-aw-fast." />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwSegmented } from "@/components/ui/AwSegmented".`}
        >
          <ApiTable>
            <PropRow
              prop="options"
              type="AwSegmentedOption<T>[]"
              doc="Array de { value, label, leading?, disabled? }."
            />
            <PropRow prop="value" type="T" doc="Valor do segmento ativo (controlado)." />
            <PropRow prop="onChange" type="(value: T) => void" doc="Disparado ao selecionar um segmento (clique ou teclado)." />
            <PropRow prop="ariaLabel" type="string" doc="Nome acessível da tablist (obrigatório)." />
            <PropRow prop="size" type='"sm" | "md"' def='"md"' doc="Densidade do controle." />
            <PropRow prop="className" type="string" doc="Classe extra na trilha (container)." />
          </ApiTable>

          <CodeExample label="filtro de visualização">{`"use client"
import { useState } from "react"
import { AwSegmented } from "@/components/ui/AwSegmented"
import { Icon } from "@/components/ui/Icon"

const [view, setView] = useState<"tabela" | "grafico">("grafico")

<AwSegmented
  ariaLabel="Visualização do relatório"
  value={view}
  onChange={setView}
  options={[
    { value: "tabela", label: "Tabela", leading: <Icon name="table_rows" size={16} /> },
    { value: "grafico", label: "Gráfico", leading: <Icon name="bar_chart" size={16} /> },
  ]}
/>`}</CodeExample>

          <CodeExample label="leading com logos de marca">{`import { AwBrandLogo } from "@/components/ui/AwBrandLogo"
import { AwLogo } from "@/components/ui/AwLogo"

<AwSegmented
  ariaLabel="Origem dos dados"
  value={origin}
  onChange={setOrigin}
  options={[
    { value: "meta", label: "Meta", leading: <AwBrandLogo brand="meta" markOnly size={16} /> },
    { value: "aswork", label: "Aswork", leading: <AwLogo variant="mark" height={13} /> },
    {
      value: "ambos",
      label: "Aswork e Meta",
      leading: (
        <span className="inline-flex items-center gap-1">
          <AwLogo variant="mark" height={13} />
          <AwBrandLogo brand="meta" markOnly size={16} />
        </span>
      ),
    },
  ]}
/>`}</CodeExample>
        </Section>

        <Section
          id="acessibilidade"
          title="Acessibilidade"
          lead="A trilha é role=tablist com aria-label; cada segmento é role=tab com aria-selected. tabindex roving: só o segmento ativo recebe foco no Tab, as setas movem a seleção entre os habilitados."
        >
          <KeyboardTable
            rows={[
              { keys: ["Tab"], action: "Entra no controle, focando o segmento selecionado." },
              { keys: ["←", "→"], action: "Move a seleção para o segmento habilitado anterior / seguinte (com wrap)." },
              { keys: ["↑", "↓"], action: "Equivalente a ← / → (mesma trilha horizontal)." },
              { keys: ["Home"], action: "Seleciona o primeiro segmento habilitado." },
              { keys: ["End"], action: "Seleciona o último segmento habilitado." },
            ]}
          />
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Use para <strong>2–4 opções exclusivas</strong> com peso igual.</>,
              <>Passe <code className="mono">ariaLabel</code> descrevendo o que está sendo filtrado.</>,
              <>Use <code className="mono">leading</code> para ícone ou logo quando o rótulo sozinho ambíguo.</>,
            ]}
            donts={[
              <>Misturar com navegação entre rotas — isso é <code className="mono">AwNavList</code>.</>,
              <>Usar para alternar painéis com contadores — isso é <code className="mono">AwTabs</code>.</>,
              <>Reinventar o controle inline numa feature — sempre <code className="mono">AwSegmented</code>.</>,
            ]}
          />
        </Section>
      </div>
    </>
  )
}
