import { AwSourceChip } from "@/components/ui/AwSourceChip"
import { AwChatBubble } from "@/components/ui/AwChatBubble"
import {
  PageHero,
  Section,
  Stage,
  ApiTable,
  PropRow,
  CodeExample,
  DoDont,
} from "../../_primitives"

export default function SourceChipPage() {
  return (
    <>
      <PageHero title="Source chip">
        Citação/grounding: de onde o agente tirou a resposta — documento, Q&amp;A,
        Knowledge Layer da Memory Base, web ou integração. É o sinal de confiança
        que deixa a resposta auditável. Sem border stroke, ícone em fill, índice
        da citação num tile escuro. Compõe Icon + AwBrandLogo.
      </PageHero>

      <div className="max-w-3xl mx-auto px-10 pb-14 flex flex-col gap-16">
        <Section
          id="kinds"
          title="Tipos de fonte"
          lead="kind define o ícone: documento, Q&A, knowledge layer, web e integração (logo via brand=)."
        >
          <Stage label="kind" gridClassName="flex flex-wrap items-center gap-2">
            <AwSourceChip kind="document" label="sales-playbook.pdf" detail="p. 12" />
            <AwSourceChip kind="qa" label="FAQ de reembolso" detail="Q&A" />
            <AwSourceChip kind="knowledge" label="Política comercial" detail="layer" />
            <AwSourceChip kind="web" label="aswork.com/precos" />
            <AwSourceChip kind="integration" brand="pipedrive" label="Negócio #70148" />
          </Stage>
        </Section>

        <Section
          id="citacoes"
          title="Citações numeradas"
          lead="Passe index para numerar as referências ([1], [2]…) num tile escuro à esquerda — como notas de rodapé da resposta."
        >
          <Stage label="index" gridClassName="flex flex-wrap items-center gap-2">
            <AwSourceChip index={1} kind="document" label="onboarding.pdf" detail="p. 3" />
            <AwSourceChip index={2} kind="knowledge" label="Tom de voz" />
            <AwSourceChip index={3} kind="qa" label="FAQ de planos" />
          </Stage>
        </Section>

        <Section
          id="contexto"
          title="No rodapé da mensagem"
          lead="O uso canônico: agrupadas abaixo da resposta do agente, mostrando em que o agente se baseou."
        >
          <Stage label="grounding" gridClassName="flex flex-col gap-3 max-w-[560px]">
            <AwChatBubble variant="agent" avatar=".aw">
              O reembolso pode ser solicitado em até 90 dias após a compra, e o
              estorno cai em 1–2 faturas. Fora desse prazo, o caso vai para
              análise manual do financeiro.
            </AwChatBubble>
            <div className="flex flex-wrap items-center gap-2 pl-9">
              <span className="text-2xs text-(--fg-tertiary)">Fontes:</span>
              <AwSourceChip index={1} kind="knowledge" label="Política de reembolso" />
              <AwSourceChip index={2} kind="document" label="termos-de-uso.pdf" detail="§7" href="#" />
            </div>
          </Stage>
        </Section>

        <Section
          id="interativo"
          title="Clicável"
          lead="Com href (abre a fonte em nova aba) ou onClick (abre o documento no painel). Ganha hover e a seta de saída."
        >
          <Stage label="href / onClick" gridClassName="flex flex-wrap items-center gap-2">
            <AwSourceChip kind="document" label="contrato.pdf" detail="p. 1" href="#" />
            <AwSourceChip kind="web" label="status.aswork.com" href="#" />
          </Stage>
        </Section>

        <Section
          id="api"
          title="API"
          lead='Import: import { AwSourceChip } from "@/components/ui/AwSourceChip".'
        >
          <ApiTable>
            <PropRow prop="label" type="string" doc="Nome da fonte." />
            <PropRow
              prop="kind"
              type='"document" | "qa" | "knowledge" | "web" | "integration"'
              def='"document"'
              doc="Tipo da fonte; define o ícone."
            />
            <PropRow prop="detail" type="string" doc="Detalhe curto (página, trecho, layer)." />
            <PropRow prop="index" type="number" doc="Número da citação, num tile escuro." />
            <PropRow prop="brand" type="string" doc="Id de brand (AwBrandLogo) p/ integração." />
            <PropRow prop="href" type="string" doc="Torna o chip um link (nova aba)." />
            <PropRow prop="onClick" type="() => void" doc="Handler de clique (abrir no painel)." />
          </ApiTable>
          <CodeExample>{`<AwSourceChip index={1} kind="knowledge" label="Política de reembolso" />
<AwSourceChip kind="document" label="termos.pdf" detail="§7" href="/docs/termos" />
<AwSourceChip kind="integration" brand="pipedrive" label="Negócio #70148" />`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Agrupe no rodapé da resposta para mostrar o grounding.</>,
              <>Use index quando houver mais de uma fonte na mesma resposta.</>,
              <>brand= quando a fonte é uma integração de terceiro.</>,
            ]}
            donts={[
              <>Usar como tag de status (isso é AwPill).</>,
              <>Citar fonte que o agente não usou de fato — quebra a confiança.</>,
              <>Adicionar border stroke — o fundo de tinta já separa.</>,
            ]}
          />
        </Section>
      </div>
    </>
  )
}
