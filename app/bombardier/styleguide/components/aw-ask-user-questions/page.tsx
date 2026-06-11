"use client";

import * as React from "react";
import { PageHero, Section, Stage } from "../../_primitives";
import {
  AwAskUserQuestions,
  type AwAskUserQuestion,
  type AwAskUserAnswer,
} from "@/components/ui/AwAskUserQuestions";

const PERGUNTAS: AwAskUserQuestion[] = [
  {
    id: "objetivo",
    title: "Qual é o objetivo principal do agente?",
    options: [
      { id: "vendas", title: "Vendas", description: "Conduz o lead até a compra" },
      { id: "recuperacao", title: "Recuperação", description: "Reengaja quem abandonou" },
      { id: "suporte", title: "Suporte", description: "Resolve dúvidas de clientes" },
    ],
  },
  {
    id: "canais",
    title: "Em quais canais ele vai atuar?",
    multiSelect: true,
    allowOther: true,
    otherPlaceholder: "Outro canal...",
    options: [
      { id: "whatsapp", title: "WhatsApp" },
      { id: "instagram", title: "Instagram" },
      { id: "email", title: "E-mail" },
    ],
  },
  {
    id: "tom",
    title: "Qual tom de voz combina com a sua marca?",
    layout: "stacked",
    skippable: true,
    options: [
      {
        id: "consultivo",
        title: "Consultivo",
        description: "Explica com calma, orienta a decisão e nunca pressiona o cliente.",
      },
      {
        id: "direto",
        title: "Direto",
        description: "Vai ao ponto, com mensagens curtas e foco em fechar rápido.",
      },
    ],
  },
];

export default function Page() {
  const [respostas, setRespostas] = React.useState<Record<string, AwAskUserAnswer> | null>(null);
  const [reset, setReset] = React.useState(0);

  return (
    <div className="flex flex-col gap-14">
      <PageHero title="Ask user questions">
        Formulário conversacional de perguntas para wizards e fluxos guiados — uma pergunta
        por vez, com seleção única ou múltipla, opção livre e navegação animada. Motor Fluid
        adaptado aos tokens AwSales; importe somente AwAskUserQuestions.
      </PageHero>

      <Section
        id="entrevista"
        title="Entrevista do wizard"
        lead="O caso de uso de referência: a entrevista de criação de agente. Single select avança ao escolher; multi select usa o botão Continuar."
      >
        <Stage label="3 perguntas · single, multi com campo livre e stacked">
          <div className="flex flex-col items-center gap-6">
            <AwAskUserQuestions
              key={reset}
              questions={PERGUNTAS}
              skipLabel="Pular"
              backLabel="Voltar"
              continueLabel="Continuar"
              finishLabel="Concluir"
              otherPlaceholder="Escreva aqui..."
              progressLabel={(atual, total) => `Pergunta ${atual} de ${total}`}
              onComplete={(answers) => setRespostas(answers)}
              className="w-full max-w-md"
            />
            {respostas && (
              <div className="w-full max-w-md rounded-lg border border-border bg-bg-muted p-4 text-sm text-fg-secondary">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-fg-primary" style={{ fontVariationSettings: "'wght' 550" }}>
                    Respostas registradas
                  </span>
                  <button
                    type="button"
                    className="text-xs text-fg-muted underline underline-offset-2"
                    onClick={() => {
                      setRespostas(null);
                      setReset((n) => n + 1);
                    }}
                  >
                    Reiniciar demo
                  </button>
                </div>
                <pre className="mt-2 overflow-auto text-xs text-fg-muted">
                  {JSON.stringify(respostas, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Stage>
      </Section>
    </div>
  );
}
