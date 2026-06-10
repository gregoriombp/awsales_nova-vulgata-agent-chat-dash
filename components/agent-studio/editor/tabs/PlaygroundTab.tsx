"use client";

import { useEffect, useRef, useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwChatBubble } from "@/components/ui/AwChatBubble";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwUserAgentOrb } from "@/components/ui/AwUserAgentOrb";
import { Icon } from "@/components/ui/Icon";
import type { AgentEditorData } from "@/lib/agentStudio";

type ChatMessage = {
  id: string;
  role: "user" | "agent";
  text: string;
  time: string;
};

const NOME_LEAD_GENERICO = "Mariana";

function agora(): string {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PlaygroundTab({ data }: { data: AgentEditorData }) {
  const [mode, setMode] = useState<"inicio" | "chat">("inicio");
  const [customOpen, setCustomOpen] = useState(false);
  const [leadNome, setLeadNome] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");

  const replyIndexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  /* Respostas mock rotativas — coerentes com recuperação de leads. */
  const RESPOSTAS_MOCK = [
    "Entendi. Para retomarmos do ponto certo: o que impediu você de avançar na última etapa?",
    `Faz sentido. Vários clientes da ${data.social.empresa} passaram pelo mesmo cenário e avançaram depois de revisar as condições. Quer que eu detalhe as opções disponíveis?`,
    "Perfeito. Posso agendar uma conversa rápida com um especialista ainda esta semana. Qual horário funciona melhor para você?",
    "Combinado. Vou registrar essa informação e preparar o próximo passo. Se preferir, também envio um resumo por e-mail.",
  ];

  /* Auto-scroll quando chegam mensagens ou o agente começa a digitar. */
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, typing]);

  /* Limpa o timer pendente ao desmontar. */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const pushAgentMessage = (text: string, delay: number) => {
    setTyping(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `m-${Date.now()}-agent`, role: "agent", text, time: agora() },
      ]);
      setTyping(false);
    }, delay);
  };

  const startChat = (nome: string) => {
    replyIndexRef.current = 0;
    setMessages([]);
    setDraft("");
    setMode("chat");
    pushAgentMessage(
      `Olá, ${nome}! Tudo bem? Aqui é ${data.social.nomeSocial}, da ${data.social.empresa}. Vi que seu processo ficou parado no meio do caminho e quero ajudar você a avançar. Podemos retomar de onde paramos?`,
      800
    );
  };

  const restart = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessages([]);
    setTyping(false);
    setDraft("");
    setMode("inicio");
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: `m-${Date.now()}-user`, role: "user", text, time: agora() },
    ]);
    setDraft("");
    const resposta =
      RESPOSTAS_MOCK[replyIndexRef.current % RESPOSTAS_MOCK.length];
    replyIndexRef.current += 1;
    pushAgentMessage(resposta, 900);
  };

  const openCustomModal = () => {
    setLeadNome("");
    setLeadEmail("");
    setCustomOpen(true);
  };

  const confirmCustom = () => {
    if (!leadNome.trim()) return;
    setCustomOpen(false);
    startChat(leadNome.trim());
  };

  const orbAvatar = (
    <AwUserAgentOrb seed={data.agent.id} state="responding" size={32} />
  );

  return (
    <>
      {mode === "inicio" ? (
        /* Estado inicial — escolha do tipo de conversa */
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-8">
          <div className="text-center">
            <h2 className="m-0 font-heading text-2xl font-medium tracking-tight text-(--fg-primary)">
              Crie sua primeira conversa
            </h2>
            <p className="m-0 mt-1.5 body-sm text-(--fg-tertiary)">
              Crie uma conversa para testar o seu agente.
            </p>
          </div>

          <div className="grid w-full max-w-[820px] grid-cols-2 gap-5">
            <button
              type="button"
              onClick={() => startChat(NOME_LEAD_GENERICO)}
              className="flex items-start gap-4 rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-5 text-left transition-colors duration-aw-fast hover:border-(--border-strong)"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--bg-muted) text-(--fg-primary)">
                <Icon name="bolt" size={22} />
              </span>
              <span className="min-w-0">
                <span className="block body-sm font-medium text-(--fg-primary)">
                  Conversa instantânea
                </span>
                <span className="mt-1 block body-xs text-(--fg-tertiary)">
                  A conversa será gerada com dados genéricos, sem necessidade
                  de configuração.
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={openCustomModal}
              className="flex items-start gap-4 rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-5 text-left transition-colors duration-aw-fast hover:border-(--border-strong)"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--bg-muted) text-(--fg-primary)">
                <Icon name="tune" size={22} />
              </span>
              <span className="min-w-0">
                <span className="block body-sm font-medium text-(--fg-primary)">
                  Conversa personalizada
                </span>
                <span className="mt-1 block body-xs text-(--fg-tertiary)">
                  Antes de iniciar, informe dados como nome e e-mail do lead
                  simulado.
                </span>
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Interface de chat */
        <div className="flex flex-col overflow-hidden rounded-xl border border-(--border-subtle) bg-(--bg-surface)">
          <header className="flex items-center gap-3 border-b border-(--border-subtle) px-5 py-3.5">
            <AwUserAgentOrb
              seed={data.agent.id}
              state={typing ? "thinking" : "responding"}
              size={36}
            />
            <span className="min-w-0 truncate body-sm font-medium text-(--fg-primary)">
              {data.agent.title}
            </span>
            <AwPill variant="neutral" dot={false}>
              Simulação
            </AwPill>
            <div className="flex-1" />
            <AwButton
              variant="ghost"
              size="sm"
              iconLeft="restart_alt"
              onClick={restart}
            >
              Reiniciar
            </AwButton>
          </header>

          <div
            ref={scrollRef}
            className="flex h-[440px] flex-col gap-4 overflow-y-auto bg-(--bg-canvas) px-5 py-6"
            aria-live="polite"
          >
            {messages.map((msg) => (
              <AwChatBubble
                key={msg.id}
                variant={msg.role}
                avatar={msg.role === "agent" ? orbAvatar : undefined}
                timestamp={msg.time}
              >
                {msg.text}
              </AwChatBubble>
            ))}
            {typing && (
              <AwChatBubble variant="agent" avatar={orbAvatar} streaming>
                <span className="sr-only">O agente está digitando</span>
              </AwChatBubble>
            )}
          </div>

          <form
            className="flex items-center gap-3 border-t border-(--border-subtle) px-5 py-4"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <AwInput
              placeholder="Escreva como o lead responderia…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1"
              aria-label="Mensagem do lead simulado"
            />
            <AwButton
              type="submit"
              variant="primary"
              size="md"
              iconOnly="send"
              aria-label="Enviar mensagem"
              disabled={draft.trim().length === 0}
            />
          </form>
        </div>
      )}

      {/* Modal: conversa personalizada */}
      <AwModal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        title="Conversa personalizada"
        footer={
          <>
            <AwButton
              size="sm"
              variant="ghost"
              onClick={() => setCustomOpen(false)}
            >
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              disabled={!leadNome.trim()}
              onClick={confirmCustom}
            >
              Iniciar conversa
            </AwButton>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <p className="m-0 body-xs text-(--fg-secondary)">
            Defina os dados do lead simulado. O agente usará essas informações
            durante a conversa de teste.
          </p>
          <AwField label="Nome" htmlFor="playground-lead-nome">
            <AwInput
              id="playground-lead-nome"
              placeholder="Ex.: Mariana Duarte"
              value={leadNome}
              onChange={(e) => setLeadNome(e.target.value)}
            />
          </AwField>
          <AwField label="E-mail" htmlFor="playground-lead-email">
            <AwInput
              id="playground-lead-email"
              type="email"
              placeholder="Ex.: mariana@empresa.com"
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
            />
          </AwField>
        </div>
      </AwModal>
    </>
  );
}
