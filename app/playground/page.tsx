"use client";

import { useState } from "react";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwButton } from "@/components/ui/AwButton";
import { AwChatBubble } from "@/components/ui/AwChatBubble";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwStatusDot } from "@/components/ui/AwStatusDot";
import { Icon } from "@/components/ui/Icon";
import { getOrbForAgent } from "@/lib/agentOrbs";

const BASE_INSTRUCTIONS = `Função: Você é um agente comercial da Aswork que apoia SDRs, AEs e CSMs ao longo do ciclo de vendas B2B. Sua missão é ajudar o time a qualificar leads, conduzir descobertas, montar propostas e identificar sinais de churn antes que virem boleto perdido.

Tom de voz:
- Direto e consultivo: prefira recomendar uma ação antes de listar opções.
- Específico antes de genérico: cite estágio do funil, segmento e ticket sempre que tiver o dado em mãos.
- Honesto sobre incerteza: se faltar contexto, peça o dado que falta em vez de chutar.

Diretrizes:
- Sempre priorize MEDDIC para leads enterprise e BANT para mid-market.
- Quando o usuário citar um lead, busque o histórico no CRM antes de responder.
- Em propostas, ancore preço em valor entregue, nunca em desconto.`;

const breadcrumbs = [
  {
    label: "Playground",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8.125" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M5.625 7.5C5.625 7.5 7.5 9.375 10 9.375C12.5 9.375 14.375 7.5 14.375 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5.625 12.5C5.625 12.5 7.5 10.625 10 10.625C12.5 10.625 14.375 12.5 14.375 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function PlaygroundPage() {
  const [instructions, setInstructions] = useState(BASE_INSTRUCTIONS);
  const [draft, setDraft] = useState("");

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs} mainClassName="p-0!">
      <div className="flex h-full min-h-0 w-full">
        <ConfigPanel
          instructions={instructions}
          onInstructionsChange={setInstructions}
          onResetInstructions={() => setInstructions(BASE_INSTRUCTIONS)}
        />
        <ChatPreview draft={draft} onDraftChange={setDraft} />
      </div>
    </AwDashboardLayout>
  );
}

function ConfigPanel({
  instructions,
  onInstructionsChange,
  onResetInstructions,
}: {
  instructions: string;
  onInstructionsChange: (next: string) => void;
  onResetInstructions: () => void;
}) {
  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-r border-(--border-subtle) bg-(--bg-raised)">
      <header className="px-6 pb-4 pt-6">
        <h1 className="m-0 text-(length:--h3-size) font-semibold tracking-[-0.02em] text-(--fg-primary)">
          Playground
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-(--fg-secondary)">
          Teste o agente antes de publicar. Mudanças aqui não afetam produção.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <div className="flex flex-col gap-5">
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-canvas) px-4 py-3">
            <div className="flex items-center gap-2 text-[13px] font-medium text-(--fg-primary)">
              <AwStatusDot variant="live" size="sm" />
              Treinado
            </div>
            <div className="mt-1 text-[12px] text-(--fg-tertiary)">
              Última sincronização há 3 dias
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-(--border-subtle) bg-(--bg-canvas) px-4 py-3">
            <div>
              <div className="text-[13px] font-medium text-(--fg-primary)">
                Comparar modelos
              </div>
              <div className="mt-0.5 text-[12px] text-(--fg-tertiary)">
                Rode o mesmo prompt em dois lados
              </div>
            </div>
            <AwButton variant="secondary" size="sm">
              Comparar
            </AwButton>
          </div>

          <FieldGroup label="Modelo">
            <AwSelect aria-label="Modelo do agente">
              <span className="flex items-center gap-2">
                <Icon name="bolt" size={16} />
                GPT-5
              </span>
            </AwSelect>
          </FieldGroup>

          <FieldGroup label="Ações">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-md border border-(--border-default) bg-(--bg-canvas) px-3 py-2.5 text-left transition-colors hover:bg-(--bg-hover)"
              aria-label="Ver ferramentas conectadas"
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-sm bg-(--aw-blue-150) text-(--aw-blue-700)"
                  aria-hidden="true"
                >
                  <Icon name="extension" size={16} />
                </span>
                <span className="text-[13px] text-(--fg-primary)">
                  1 ferramenta ativa
                </span>
              </span>
              <Icon name="chevron_right" size={18} />
            </button>
          </FieldGroup>

          <FieldGroup
            label="Instruções (System prompt)"
            action={
              <button
                type="button"
                aria-label="Restaurar persona padrão"
                onClick={onResetInstructions}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-(--border-default) bg-(--bg-canvas) text-(--fg-secondary) transition-colors hover:bg-(--bg-hover) hover:text-(--fg-primary)"
              >
                <Icon name="restart_alt" size={16} />
              </button>
            }
          >
            <div className="flex flex-col gap-2">
              <AwSelect aria-label="Persona base">
                Persona padrão · Vendedor consultivo
              </AwSelect>
              <textarea
                value={instructions}
                onChange={(e) => onInstructionsChange(e.target.value)}
                rows={9}
                className="w-full resize-none rounded-md border border-(--border-default) bg-(--bg-canvas) px-3 py-2.5 text-[13px] leading-relaxed text-(--fg-primary) outline-hidden placeholder:text-(--fg-tertiary) focus:border-(--fg-primary)"
                placeholder="Descreva o papel, tom de voz e diretrizes do agente."
              />
            </div>
          </FieldGroup>
        </div>
      </div>
    </aside>
  );
}

function FieldGroup({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-[12px] font-medium text-(--fg-secondary)">
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  );
}

function ChatPreview({
  draft,
  onDraftChange,
}: {
  draft: string;
  onDraftChange: (next: string) => void;
}) {
  return (
    <section
      className="flex h-full min-w-0 flex-1 flex-col items-stretch bg-(--dark-bg)"
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--dark-border) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
        backgroundPosition: "8px 8px",
      }}
    >
      <div className="mx-auto flex h-full w-full max-w-[560px] flex-col px-6 py-8">
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-(--border-subtle) bg-(--bg-raised) shadow-(--shadow-sm)">
          <header className="flex items-center justify-between border-b border-(--border-subtle) px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span
                className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full"
                aria-hidden="true"
              >
                <img
                  src={getOrbForAgent("sales")}
                  alt=""
                  width={28}
                  height={28}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="text-[14px] font-semibold text-(--fg-primary)">
                Agente Vendas · Aswork
              </span>
            </div>
            <button
              type="button"
              aria-label="Reiniciar conversa"
              className="flex h-8 w-8 items-center justify-center rounded-full text-(--fg-tertiary) transition-colors hover:bg-(--bg-hover) hover:text-(--fg-primary)"
            >
              <Icon name="restart_alt" size={18} />
            </button>
          </header>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
            <AwChatBubble
              variant="agent"
              avatar={
                <img
                  src={getOrbForAgent("sales")}
                  alt=""
                  className="h-full w-full object-cover"
                />
              }
            >
              <p className="m-0">
                Oi, Marina! Aqui é o agente da Aswork. Vi que você baixou
                nosso guia de prospecção na semana passada — separa 10
                minutinhos hoje à tarde pra te mostrar como o time da Vivante
                dobrou o pipeline em 60 dias?
              </p>
            </AwChatBubble>

            <AwChatBubble variant="user">
              Olha, baixei pra ler mesmo. Não tô buscando ferramenta agora —
              ano que vem talvez.
            </AwChatBubble>

            <AwChatBubble
              variant="agent"
              avatar={
                <img
                  src={getOrbForAgent("sales")}
                  alt=""
                  className="h-full w-full object-cover"
                />
              }
            >
              <p className="m-0">
                Faz sentido — a maioria que baixa esse guia também tá só
                explorando. Posso te mandar um vídeo de 3 minutos com o que
                a Vivante fez de diferente? Sem reunião, sem compromisso.
              </p>
              <p className="m-0 mt-3 font-medium">O que o vídeo cobre</p>
              <ul className="m-0 mt-2 list-disc space-y-1.5 pl-5">
                <li>
                  <strong>Cadência híbrida:</strong> como combinaram e-mail,
                  LinkedIn e WhatsApp sem queimar o lead.
                </li>
                <li>
                  <strong>Trigger por intenção:</strong> agente puxa o lead
                  no momento que ele engaja com conteúdo (como você agora).
                </li>
                <li>
                  <strong>Roteiro de discovery:</strong> 4 perguntas que
                  destravam orçamento sem soar invasivo.
                </li>
                <li>
                  <strong>Resultado em 60 dias:</strong> de 22 reuniões/mês
                  pra 47, mantendo o mesmo time de SDRs.
                </li>
              </ul>
              <p className="m-0 mt-3">
                Se fizer sentido depois, você me chama. Te mando no e-mail
                cadastrado?
              </p>
            </AwChatBubble>
          </div>

          <footer className="border-t border-(--border-subtle) px-4 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onDraftChange("");
              }}
              className="flex items-center gap-2 rounded-full border border-(--border-default) bg-(--bg-canvas) px-4 py-2"
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => onDraftChange(e.target.value)}
                placeholder="Pergunte ao agente…"
                className="flex-1 border-0 bg-transparent text-[14px] text-(--fg-primary) outline-hidden placeholder:text-(--fg-tertiary)"
                aria-label="Mensagem para o agente"
              />
              <button
                type="button"
                aria-label="Gravar áudio"
                className="flex h-8 w-8 items-center justify-center rounded-full text-(--fg-tertiary) transition-colors hover:bg-(--bg-hover) hover:text-(--fg-primary)"
              >
                <Icon name="mic" size={18} />
              </button>
              <button
                type="submit"
                aria-label="Enviar mensagem"
                disabled={!draft.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-(--fg-primary) text-(--fg-on-inverse) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="arrow_upward" size={18} />
              </button>
            </form>
          </footer>
        </div>

        <div className="mt-3 flex justify-center">
          <AwButton variant="secondary" size="sm" iconLeft="library_books">
            Ver fontes consultadas
          </AwButton>
        </div>
      </div>
    </section>
  );
}
