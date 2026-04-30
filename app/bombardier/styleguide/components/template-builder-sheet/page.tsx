"use client";

import { useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import {
  AwTemplateBuilderSheet,
  type WabaTemplateDraft,
} from "@/components/integrations/AwTemplateBuilderSheet";
import { ApiTable, PageHero, PropRow, Section, Stage } from "../../_primitives";

export default function TemplateBuilderSheetPage() {
  const [empty, setEmpty] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [lastSaved, setLastSaved] = useState<WabaTemplateDraft | null>(null);

  return (
    <>
      <PageHero title="Template builder sheet">
        Drawer wide (1080px) para criar templates da Cloud API do WhatsApp.
        Form à esquerda, pré-visualização ao vivo no celular à direita —
        variáveis <code className="mono">{`{{1}}`}</code> /{" "}
        <code className="mono">{`{{nome}}`}</code> são detectadas no corpo e
        renderizadas com valores de amostra. Composto com AwSheet (size=wide),
        AwField, AwInput, AwButton e Icon.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="empty"
            title="Estado inicial"
            lead="Form vazio — nada digitado ainda. Mostra o placeholder no preview e o estado disabled do CTA primário."
          >
            <Stage label="empty draft">
              <AwButton
                variant="primary"
                size="md"
                iconLeft="add"
                onClick={() => setEmpty(true)}
              >
                Abrir drawer (vazio)
              </AwButton>
              <AwTemplateBuilderSheet
                open={empty}
                onClose={() => setEmpty(false)}
                onSaveDraft={(d) => {
                  setLastSaved(d);
                  setEmpty(false);
                }}
                onSubmit={(d) => {
                  setLastSaved(d);
                  setEmpty(false);
                }}
              />
            </Stage>
          </Section>

          <Section
            id="prefilled"
            title="Rascunho preenchido"
            lead="Vem pré-preenchido — header com imagem, corpo com variáveis runtime e fixas, e dois botões (URL + quick reply). É o cenário mais didático pra ver o preview reagindo."
          >
            <Stage label="prefilled draft">
              <AwButton
                variant="primary"
                size="md"
                iconLeft="edit"
                onClick={() => setPrefilled(true)}
              >
                Abrir drawer (rascunho)
              </AwButton>
              <AwTemplateBuilderSheet
                open={prefilled}
                onClose={() => setPrefilled(false)}
                initialDraft={{
                  name: "boas_vindas_pt_v4",
                  category: "marketing",
                  language: "pt_BR",
                  header: "image",
                  body:
                    "Olá, {{1}}! 👋 Bem-vindo(a) à {{nome_empresa}}.\n\nEstamos com {{2}} ativo até {{horario_atendimento}}. Quer dar uma olhada?",
                  buttons: [
                    {
                      id: "btn-1",
                      type: "quick_reply",
                      label: "Ver promoção",
                      value: "Ver promoção",
                    },
                    {
                      id: "btn-2",
                      type: "url",
                      label: "Visitar site",
                      value: "https://marina.com/promo?utm=wa",
                    },
                  ],
                }}
                onSaveDraft={(d) => {
                  setLastSaved(d);
                  setPrefilled(false);
                }}
                onSubmit={(d) => {
                  setLastSaved(d);
                  setPrefilled(false);
                }}
              />
            </Stage>
          </Section>

          {lastSaved && (
            <Section
              id="last-saved"
              title="Último rascunho devolvido"
              lead="Valor que o componente devolveu pelo onSaveDraft / onSubmit (útil pra debug do contrato)."
            >
              <Stage label="returned payload">
                <pre className="m-0 max-h-[280px] w-full overflow-auto rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 font-mono text-[12px] text-[var(--fg-secondary)]">
                  {JSON.stringify(lastSaved, null, 2)}
                </pre>
              </Stage>
            </Section>
          )}

          <Section id="api" title="API">
            <ApiTable>
              <PropRow
                prop="open"
                type="boolean"
                doc="Controla a visibilidade do drawer."
              />
              <PropRow
                prop="onClose"
                type="() => void"
                doc="Fechado por Esc, scrim, ou pelo CTA Cancelar."
              />
              <PropRow
                prop="accountName"
                type="string"
                def='"Marina Cosméticos"'
                doc="Nome exibido no header do celular preview."
              />
              <PropRow
                prop="initialDraft"
                type="Partial<WabaTemplateDraft>"
                doc="Valores iniciais do form. Re-aplicados sempre que open passa de false → true."
              />
              <PropRow
                prop="onSaveDraft"
                type="(draft) => void"
                doc='Disparado pelo CTA "Salvar rascunho". Persistência fica a cargo do consumidor.'
              />
              <PropRow
                prop="onSubmit"
                type="(draft) => void"
                doc='Disparado pelo CTA primário "Enviar para aprovação". Habilitado apenas quando nome e corpo são válidos.'
              />
            </ApiTable>
          </Section>
        </div>
      </div>
    </>
  );
}
