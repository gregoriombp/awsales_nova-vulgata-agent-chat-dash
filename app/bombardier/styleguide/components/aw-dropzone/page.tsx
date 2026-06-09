"use client"

import { AwDropzone } from "@/components/ui/AwDropzone"
import {
  PageHero,
  Tldr,
  Section,
  Stage,
  ApiTable,
  PropRow,
  TokensConsumed,
  CodeExample,
  RelatedLinks,
} from "../../_primitives"

export default function AwDropzonePage() {
  return (
    <div className="flex flex-col gap-12 pb-24">
      <PageHero title="Dropzone">
        Área de upload arrasta-e-solta. Estados de drag, lista de arquivos com
        progresso por item, validação de tamanho e <code>accept</code>. Extraído
        do upload polido do <code>SendFileModal</code> e reusado em qualquer
        fluxo que receba arquivos.
      </PageHero>

      <Tldr
        use={[
          "Receber arquivos do usuário (PDF, CSV, imagens) num modal ou formulário.",
          "Mostrar progresso de upload e a lista do que já foi adicionado.",
          "Anexar fontes a uma Memory Base, catálogo CSV, ou Knowledge Layer.",
        ]}
        dontUse={[
          "Selecionar um único valor de uma lista — use Select.",
          "Importar dados estruturados sem arquivo — use uma integração.",
          "Ações destrutivas/confirmações — use Modal.",
        ]}
      />

      <Section
        id="default"
        title="Variante default"
        lead="Caixa cheia: vazia mostra o CTA; ao adicionar arquivos vira a lista com barra de progresso por item (e botão 'adicionar mais')."
      >
        <Stage label="default" hint="arraste arquivos ou clique em Adicionar arquivos">
          <div className="w-full max-w-xl">
            <AwDropzone accept=".pdf,.doc,.docx,.csv,.xlsx,.jpg,.png" maxSizeMb={10} />
          </div>
        </Stage>
        <CodeExample>{`<AwDropzone
  accept=".pdf,.doc,.docx,.csv,.xlsx,.jpg,.png"
  maxSizeMb={10}
  onComplete={(files) => console.log("prontos:", files)}
/>`}</CodeExample>
      </Section>

      <Section
        id="compact"
        title="Variante compact"
        lead="Caixa menor sempre visível + lista enxuta abaixo. Para colunas de formulário — ex. anexos na edição de Knowledge Layer ou upload de CSV num modal."
      >
        <Stage label="compact" hint="CTA fixo + lista abaixo">
          <div className="w-full max-w-md">
            <AwDropzone
              variant="compact"
              accept=".csv"
              multiple={false}
              maxSizeMb={5}
              icon="dataset"
              title="Envie o arquivo CSV"
              hint="um arquivo .csv de até 5 MB"
              ctaLabel="Escolher arquivo CSV"
            />
          </div>
        </Stage>
        <CodeExample>{`<AwDropzone
  variant="compact"
  accept=".csv"
  multiple={false}
  maxSizeMb={5}
  icon="dataset"
  title="Envie o arquivo CSV"
  ctaLabel="Escolher arquivo CSV"
/>`}</CodeExample>
      </Section>

      <Section
        id="tokens"
        title="Tokens consumidos"
        lead="Nenhum valor hardcoded — só tokens do design system."
      >
        <TokensConsumed
          tokens={[
            { token: "--border-default / --fg-primary", role: "borda da caixa (repouso vs. arrastando)" },
            { token: "--bg-canvas / --bg-hover", role: "fundo da caixa (repouso vs. arrastando)" },
            { token: "--bg-surface / --bg-muted", role: "tile do ícone / trilho do progresso" },
            { token: "--fg-primary", role: "preenchimento da barra de progresso + título" },
            { token: "--fg-tertiary / --fg-secondary", role: "hint e metadados" },
            { token: "--accent-danger", role: "ação de excluir arquivo concluído" },
          ]}
        />
      </Section>

      <Section id="props" title="Props">
        <ApiTable>
          <PropRow prop="variant" type='"default" | "compact"' def='"default"' doc="Layout: caixa cheia (lista substitui o CTA) vs. caixa menor sempre visível + lista abaixo." />
          <PropRow prop="accept" type="string" doc="Atributo accept do input (ex. '.pdf,.csv')." />
          <PropRow prop="multiple" type="boolean" def="true" doc="Permite múltiplos arquivos." />
          <PropRow prop="maxSizeMb" type="number" def="10" doc="Tamanho máximo por arquivo; acima disso o arquivo é ignorado." />
          <PropRow prop="icon" type="string" def='"upload_file"' doc="Material Symbol da caixa vazia." />
          <PropRow prop="title / hint / ctaLabel" type="string" doc="Textos da caixa vazia." />
          <PropRow prop="simulateProgress" type="boolean" def="true" doc="Simula progresso no cliente (sem backend)." />
          <PropRow prop="onChange" type="(files) => void" doc="Dispara a cada mudança na lista." />
          <PropRow prop="onComplete" type="(files) => void" doc="Dispara uma vez quando todos terminam o upload." />
        </ApiTable>
      </Section>

      <Section id="relacionados" title="Relacionados">
        <RelatedLinks
          items={[
            { name: "Modais", href: "/bombardier/styleguide/components/modals", description: "O dropzone normalmente vive dentro de um modal de envio." },
            { name: "Sheet", href: "/bombardier/styleguide/components/sheet", description: "Painel lateral — usado junto, ex. instruções de CSV." },
            { name: "File icon", href: "/bombardier/styleguide/components/aw-file-icon", description: "Ícone por tipo de arquivo." },
          ]}
        />
      </Section>
    </div>
  )
}
