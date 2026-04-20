import {
  PageHero,
  Section,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
} from "../../_primitives"
import { SheetDemo } from "./SheetDemo"

export default function SheetPage() {
  return (
    <>
      <PageHero title="Sheet">
        Alternativa preferida ao modal quando a tela de trás ajuda a dar
        contexto — ex.: lista de conversas. Desliza da direita em 220 ms,
        suporta navegação <code className="mono">↑/↓</code> entre itens e
        mantém scrim a 40% (vs. 55% do modal) para preservar orientação.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-16">
        <Section
          id="demo"
          title="Demo"
          lead="Abra o sheet, use ↑/↓ para navegar entre conversas, e Esc para fechar."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-8">
            <SheetDemo />
          </div>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Top com título + meta + close. Tabs opcionais. Body com rows de key/value padronizadas. Footer opcional com ações."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="largura"
              v="520 px"
              d="Full-height à direita. Mobile: 100%."
            />
            <Spec
              k="scrim"
              v="rgba(0,0,0,.40)"
              d="Mais leve que modal — a tela atrás continua legível."
            />
            <Spec
              k="motion"
              v="translateX(100% → 0) · 220 ms"
              d="Ease-out. Exit: mesma curva, reversa."
            />
            <Spec
              k="atalhos"
              v="Esc · ↑ · ↓"
              d="Esc fecha; setas navegam entre itens (via onPrev/onNext)."
            />
            <Spec
              k="row"
              v="grid 120 · 1fr"
              d="Label em --fg-tertiary; valor em --fg-primary."
            />
            <Spec
              k="divisor de row"
              v="1px dashed"
              d="Distingue do divisor sólido do top/tabs."
            />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwSheet, AwSheetTab, AwSheetRow } from "@/components/ui/AwSheet".`}
        >
          <h3 className="text-[var(--h5-size)] font-medium mt-4 mb-3">
            AwSheet
          </h3>
          <ApiTable>
            <PropRow
              prop="open"
              type="boolean"
              doc="Controle externo do estado."
            />
            <PropRow
              prop="onClose"
              type="() => void"
              doc="Esc, clique no scrim, botão fechar, botão footer."
            />
            <PropRow
              prop="title"
              type="ReactNode"
              doc="Título do painel."
            />
            <PropRow
              prop="meta"
              type="ReactNode"
              doc="Linha secundária em mono (id, timestamp, fonte)."
            />
            <PropRow
              prop="tabs"
              type="ReactNode"
              doc="Render props para <AwSheetTab> inline."
            />
            <PropRow
              prop="footer"
              type="ReactNode"
              doc="Ações no rodapé; alinhadas à direita."
            />
            <PropRow
              prop="dismissible"
              type="boolean"
              def="true"
              doc="Se false, clique fora não fecha (Esc continua ativo)."
            />
            <PropRow
              prop="onPrev"
              type="() => void"
              doc="Handler de ↑ — navegar para item anterior."
            />
            <PropRow
              prop="onNext"
              type="() => void"
              doc="Handler de ↓ — próximo item."
            />
          </ApiTable>

          <h3 className="text-[var(--h5-size)] font-medium mt-8 mb-3">
            AwSheetTab
          </h3>
          <ApiTable>
            <PropRow
              prop="active"
              type="boolean"
              def="false"
              doc="Sublinha o tab e muda texto pra --fg-primary."
            />
            <PropRow
              prop="onClick"
              type="() => void"
              doc="Handler para trocar o conteúdo do body."
            />
          </ApiTable>

          <h3 className="text-[var(--h5-size)] font-medium mt-8 mb-3">
            AwSheetRow
          </h3>
          <ApiTable>
            <PropRow
              prop="label"
              type="ReactNode"
              doc='Coluna esquerda, 120 px, --fg-tertiary.'
            />
            <PropRow
              prop="mono"
              type="boolean"
              def="false"
              doc="Aplica JetBrains Mono no valor (pra IDs, custos, latências)."
            />
            <PropRow
              prop="children"
              type="ReactNode"
              doc="Valor da coluna direita."
            />
          </ApiTable>

          <CodeExample>{`"use client"
import { useState } from "react"
import { AwSheet, AwSheetTab, AwSheetRow } from "@/components/ui/AwSheet"

const [open, setOpen] = useState(false)
const [tab, setTab] = useState("resumo")

<AwSheet
  open={open}
  onClose={() => setOpen(false)}
  title="Conversa #8412"
  meta="iniciada há 12m · WhatsApp"
  onPrev={() => select(prev)}
  onNext={() => select(next)}
  tabs={
    <>
      <AwSheetTab active={tab === "resumo"} onClick={() => setTab("resumo")}>
        Resumo
      </AwSheetTab>
      <AwSheetTab active={tab === "trans"} onClick={() => setTab("trans")}>
        Transcrição
      </AwSheetTab>
    </>
  }
  footer={
    <>
      <AwButton variant="ghost" onClick={() => setOpen(false)}>Fechar</AwButton>
      <AwButton variant="primary">Marcar revisão</AwButton>
    </>
  }
>
  <AwSheetRow label="Usuário">Marina S.</AwSheetRow>
  <AwSheetRow label="Status">resolvida em 4 mensagens</AwSheetRow>
  <AwSheetRow label="Custo" mono>$0.012 · 1 842 tokens</AwSheetRow>
</AwSheet>`}</CodeExample>
        </Section>

        <Section
          id="modal-vs-sheet"
          title="Sheet ou Modal?"
          lead="Heurística para não errar a escolha."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <h4 className="m-0 mb-2">Use Sheet quando…</h4>
              <ul className="body-sm m-0 pl-4 list-disc flex flex-col gap-1 text-[var(--fg-secondary)]">
                <li>O contexto da tela de trás ajuda a entender o item.</li>
                <li>O usuário vai navegar entre itens de uma lista.</li>
                <li>
                  Há muitos dados de leitura (conversa, log, transcrição).
                </li>
              </ul>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <h4 className="m-0 mb-2">Use Modal quando…</h4>
              <ul className="body-sm m-0 pl-4 list-disc flex flex-col gap-1 text-[var(--fg-secondary)]">
                <li>É um fluxo transacional isolado (publicar, confirmar).</li>
                <li>Precisa do foco total do usuário.</li>
                <li>O trás não adiciona contexto (tela de lista).</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Sheet pra inspecionar item de uma lista.</>,
              <>↑/↓ para navegar — reduz o custo de ver 10 itens.</>,
              <>Row grid padronizado — label 120, valor 1fr.</>,
            ]}
            donts={[
              <>Sheet com formulário denso — vira modal.</>,
              <>Dois sheets abertos simultaneamente.</>,
              <>Sheet no mobile sem ocupar 100% da largura.</>,
            ]}
          />
        </Section>
      </div>
    </div>
    </>
  )
}
