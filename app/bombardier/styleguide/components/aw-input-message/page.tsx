"use client";

import * as React from "react";
import { PageHero, Section, Stage } from "../../_primitives";
import { AwInputMessage } from "@/components/ui/AwInputMessage";
import { Icon } from "@/components/ui/Icon";

export default function Page() {
  const [valor, setValor] = React.useState("");
  const [arquivos, setArquivos] = React.useState<File[]>([]);
  const [enviadas, setEnviadas] = React.useState<string[]>([]);

  const [valorSimples, setValorSimples] = React.useState("");

  return (
    <div className="flex flex-col gap-14">
      <PageHero title="Input message">
        Composer de mensagem para chats e copilotos: cresce com o texto, aceita anexos por
        arrastar ou pelo seletor, enfileira envios e anima cada interação. Motor Fluid
        adaptado aos tokens AwSales; importe somente AwInputMessage.
      </PageHero>

      <Section
        id="completo"
        title="Composer completo"
        lead="Com slot de anexo, envio por Enter e lista das mensagens enviadas na demo."
      >
        <Stage label="Anexos + envio">
          <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
            <AwInputMessage
              value={valor}
              onValueChange={setValor}
              files={arquivos}
              onFilesChange={setArquivos}
              placeholder="Escreva para o agente..."
              dropPlaceholder="Solte os arquivos para anexar"
              sendLabel="Enviar"
              removeLabel="Remover"
              attachmentsLabel={(n) => `${n} anexo${n === 1 ? "" : "s"}`}
              onSend={(texto, files) => {
                const sufixo = files.length > 0 ? ` (+${files.length} anexo${files.length === 1 ? "" : "s"})` : "";
                setEnviadas((prev) => [...prev, `${texto}${sufixo}`]);
              }}
              leftSlot={({ openFilePicker }) => (
                <button
                  type="button"
                  onClick={() => openFilePicker()}
                  aria-label="Anexar arquivo"
                  className="flex size-8 items-center justify-center rounded-md text-fg-muted hover:bg-bg-hover hover:text-fg-primary"
                >
                  <Icon name="attach_file" size={18} />
                </button>
              )}
            />
            {enviadas.length > 0 && (
              <div className="rounded-lg border border-border bg-bg-muted p-4 text-sm text-fg-secondary">
                <span className="text-fg-primary" style={{ fontVariationSettings: "'wght' 550" }}>
                  Enviadas na demo
                </span>
                <ul className="mt-2 flex flex-col gap-1 text-xs text-fg-muted">
                  {enviadas.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Stage>
      </Section>

      <Section
        id="estados"
        title="Estados"
        lead="Sem slot de anexo e desabilitado durante processamento."
      >
        <Stage label="Mínimo e desabilitado">
          <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
            <AwInputMessage
              value={valorSimples}
              onValueChange={setValorSimples}
              placeholder="Pergunte qualquer coisa..."
              sendLabel="Enviar"
            />
            <AwInputMessage
              value=""
              onValueChange={() => {}}
              disabled
              placeholder="Aguarde o agente terminar a resposta..."
              sendLabel="Enviar"
            />
          </div>
        </Stage>
      </Section>
    </div>
  );
}
