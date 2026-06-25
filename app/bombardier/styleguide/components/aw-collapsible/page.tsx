import { AwCollapsible } from "@/components/ui/AwCollapsible"
import { Icon } from "@/components/ui/Icon"
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
  Stage,
  Tldr,
  TokensConsumed,
} from "../../_primitives"

export default function CollapsiblePage() {
  return (
    <>
      <PageHero title="Collapsible">
        Disclosure leve: um gatilho + conteúdo que abre/fecha com transição. Wrapper
        do primitivo Radix <code className="mono">collapsible</code>, com chevron que
        gira e animação de altura por tokens. É o lar das "linhas expansíveis" e dos
        "ver mais / histórico" — mais leve que <code className="mono">AwAccordion</code>{" "}
        (multi-item, com borda) e que <code className="mono">AwListGroup</code> (grupo
        com media + título grande).
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Uma linha/seção que expande detalhes secundários (descontos de uma fatura, "ver histórico").</>,
            <>Quando o gatilho precisa de layout próprio (label + tag/valor) e densidade pequena.</>,
            <>Um único bloco aberto/fechado — sem a moldura do accordion.</>,
          ]}
          dontUse={[
            <>Várias seções num grupo com divisórias — use <code className="mono">AwAccordion</code>.</>,
            <>Grupo com media + título grande + ações — use <code className="mono">AwListGroup</code>.</>,
            <>Conteúdo crítico que precisa estar sempre visível.</>,
          ]}
        />

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Gatilho (botão) + conteúdo animado. O chevron gira com o estado; meta é um slot à direita; o conteúdo anima a altura via a var do Radix."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec k="trigger" v="botão (Radix Trigger)" d="Conteúdo à esquerda, junto do chevron." />
            <Spec k="meta" v="slot à direita" d="Tag, valor, contagem. Opcional." />
            <Spec k="chevron" v="expand_more" d="Gira 180° em data-state=open." />
            <Spec k="content" v=".aw-collapsible-content" d="Anima a altura (--radix-collapsible-content-height)." />
            <Spec k="size" v="sm / md" d="Densidade e cor do gatilho." />
            <Spec k="chevronSide" v="left / right" d="Lado do chevron. Default left." />
          </div>
        </Section>

        <Section
          id="variants"
          title="Variantes"
          lead="Densidade (sm/md), com ou sem meta, e o lado do chevron."
        >
          <Stage label="size md · com meta · chevron à esquerda" gridClassName="block">
            <div className="max-w-[420px] rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-4">
              <AwCollapsible
                size="md"
                trigger="Descontos"
                meta={
                  <span className="inline-flex items-center gap-1.5 text-(--accent-success)">
                    <Icon name="local_offer" size={15} className="shrink-0" />
                    <span className="body-sm font-medium tabular-nums">−R$ 120,00</span>
                  </span>
                }
              >
                <ul className="m-0 flex list-none flex-col p-0 pl-5 body-xs text-(--fg-secondary)">
                  <li className="flex justify-between py-1.5">
                    <span>Cupom · BLACKFRIDAY</span>
                    <span className="text-(--accent-success) tabular-nums">−R$ 80,00</span>
                  </li>
                  <li className="flex justify-between py-1.5">
                    <span>Voucher · cortesia</span>
                    <span className="text-(--accent-success) tabular-nums">−R$ 40,00</span>
                  </li>
                </ul>
              </AwCollapsible>
            </div>
          </Stage>
          <div className="h-4" />
          <Stage label="size sm · sem meta (ver mais)" gridClassName="block">
            <div className="max-w-[420px] rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-4">
              <AwCollapsible size="sm" triggerClassName="font-medium" trigger="Histórico · 3 encerrados">
                <ul className="m-0 flex list-none flex-col p-0 body-xs text-(--fg-secondary)">
                  <li className="py-1.5">Crédito de POC — esgotado</li>
                  <li className="py-1.5">Bônus de contrato — vencido</li>
                  <li className="py-1.5">Cortesia Q1 — esgotado</li>
                </ul>
              </AwCollapsible>
            </div>
          </Stage>
          <div className="h-4" />
          <Stage label="chevronSide right · aberto por padrão" gridClassName="block">
            <div className="max-w-[420px] rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-4">
              <AwCollapsible
                size="md"
                chevronSide="right"
                defaultOpen
                trigger="Detalhes técnicos"
                meta={<span className="body-xs text-(--fg-tertiary)">2 itens</span>}
              >
                <p className="m-0 pt-1 body-sm text-(--fg-secondary)">
                  Conteúdo revelado com o chevron à direita.
                </p>
              </AwCollapsible>
            </div>
          </Stage>
        </Section>

        <Section
          id="composition"
          title="Composition (uso real)"
          lead="No financeiro: a linha 'Descontos' de uma fatura e o 'Histórico' de créditos — ambos migrados de disclosures feitos na mão para este componente."
        >
          <Stage label="Detalhamento da fatura" gridClassName="block">
            <div className="max-w-[460px] rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-5">
              <h6 className="m-0 mb-2 body-lg font-medium text-(--fg-primary)">Detalhamento</h6>
              <ul className="m-0 flex list-none flex-col p-0">
                <li className="flex justify-between py-2 body-sm">
                  <span className="text-(--fg-secondary)">Plano Enterprise</span>
                  <span className="font-medium tabular-nums text-(--fg-primary)">R$ 2.400,00</span>
                </li>
                <li className="flex justify-between py-2 body-sm">
                  <span className="text-(--fg-secondary)">Consumo variável</span>
                  <span className="font-medium tabular-nums text-(--fg-primary)">R$ 870,00</span>
                </li>
                <li className="flex flex-col">
                  <AwCollapsible
                    size="md"
                    trigger="Descontos"
                    meta={
                      <span className="inline-flex items-center gap-1.5 text-(--accent-success)">
                        <Icon name="local_offer" size={15} className="shrink-0" />
                        <span className="body-sm font-medium tabular-nums">−R$ 120,00</span>
                      </span>
                    }
                  >
                    <ul className="m-0 flex list-none flex-col p-0 pl-5 body-xs">
                      <li className="flex justify-between py-1.5">
                        <span className="text-(--fg-secondary)">Cupom · BLACKFRIDAY</span>
                        <span className="text-(--accent-success) tabular-nums">−R$ 80,00</span>
                      </li>
                      <li className="flex justify-between py-1.5">
                        <span className="text-(--fg-secondary)">Voucher · cortesia</span>
                        <span className="text-(--accent-success) tabular-nums">−R$ 40,00</span>
                      </li>
                    </ul>
                  </AwCollapsible>
                </li>
              </ul>
              <div className="mt-1 flex justify-between border-t border-(--border-subtle) pt-3 body-sm font-semibold text-(--fg-primary)">
                <span>Total estimado</span>
                <span className="tabular-nums">R$ 3.150,00</span>
              </div>
            </div>
          </Stage>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwCollapsible } from "@/components/ui/AwCollapsible".`}
        >
          <ApiTable>
            <PropRow prop="trigger" type="React.ReactNode" doc="Conteúdo do gatilho, à esquerda (junto do chevron)." />
            <PropRow prop="meta" type="React.ReactNode" doc="Slot à direita do gatilho (tag, valor, contagem)." />
            <PropRow prop="chevronSide" type='"left" | "right"' def='"left"' doc="Lado do chevron." />
            <PropRow prop="size" type='"sm" | "md"' def='"md"' doc="Densidade e cor do texto do gatilho." />
            <PropRow prop="defaultOpen" type="boolean" def="false" doc="Estado inicial (uncontrolled)." />
            <PropRow prop="open / onOpenChange" type="boolean / (open) => void" doc="Controle externo do estado." />
            <PropRow prop="triggerClassName" type="string" doc="Classe extra no botão de gatilho." />
            <PropRow prop="children" type="React.ReactNode" doc="Conteúdo revelado (animado)." />
          </ApiTable>
          <CodeExample>{`import { AwCollapsible } from "@/components/ui/AwCollapsible"

// linha expansível com tag de valor à direita
<AwCollapsible
  size="md"
  trigger="Descontos"
  meta={<span className="text-(--accent-success)">−R$ 120,00</span>}
>
  <ul>…</ul>
</AwCollapsible>

// "ver mais" leve
<AwCollapsible size="sm" trigger="Histórico · 3 encerrados">
  <ul>…</ul>
</AwCollapsible>`}</CodeExample>
        </Section>

        <Section
          id="tokens"
          title="Tokens consumidos"
          lead="A altura anima via a var do Radix; cor e densidade saem dos tokens semânticos."
        >
          <TokensConsumed
            tokens={[
              { token: "--dur-base", role: "duração do abrir/fechar", value: "180ms" },
              { token: "--ease-out", role: "curva da animação" },
              { token: "--radix-collapsible-content-height", role: "altura-alvo do conteúdo (Radix)" },
              { token: "--fg-secondary", role: "texto do gatilho (size md)" },
              { token: "--fg-tertiary", role: "chevron / gatilho (size sm)" },
            ]}
          />
        </Section>

        <Section
          id="accessibility"
          title="Acessibilidade"
          lead="O gatilho é um <button> com aria-expanded/aria-controls geridos pelo Radix Collapsible."
        >
          <KeyboardTable
            rows={[
              { keys: ["Tab"], action: "Move o foco para o gatilho." },
              { keys: ["Enter", "Espaço"], action: "Abre/fecha o conteúdo." },
            ]}
          />
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Use para linhas expansíveis e "ver mais" densos, dentro de cards e listas.</>,
              <>Passe <code className="mono">meta</code> para o valor/tag que acompanha o gatilho à direita.</>,
              <>Deixe a animação por conta do componente — vem dos tokens de motion.</>,
            ]}
            donts={[
              <>Refazer o toggle na mão (<code className="mono">{`{open && …}`}</code>) — perde a transição.</>,
              <>Usar para um grupo com várias seções — isso é <code className="mono">AwAccordion</code>.</>,
              <>Usar para um grupo com media + título grande — isso é <code className="mono">AwListGroup</code>.</>,
            ]}
          />
        </Section>

        <Section id="related" title="Veja também">
          <RelatedLinks
            items={[
              { name: "Accordion", href: "/bombardier/styleguide/components/aw-accordion", description: "Várias seções num grupo com borda." },
              { name: "List group", href: "/bombardier/styleguide/components/aw-list-group", description: "Grupo colapsável com media + título + ações." },
              { name: "Animação", href: "/bombardier/styleguide/foundation/motion", description: "Tokens de motion e a regra de overlays/disclosures." },
            ]}
          />
        </Section>
      </div>
    </>
  )
}
