"use client";

import * as React from "react";
import { AwChatBubble } from "@/components/ui/AwChatBubble";
import { AwButton } from "@/components/ui/AwButton";
import { AwPill } from "@/components/ui/AwPill";
import { AwStatusDot } from "@/components/ui/AwStatusDot";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwChannelIcon } from "@/components/ui/AwChannelIcon";
import { AwSourceChip } from "@/components/ui/AwSourceChip";
import { AwInputMessage } from "@/components/ui/AwInputMessage";
import { Icon } from "@/components/ui/Icon";
import {
  type Conversation,
  type Message,
  STATUS_META,
  agentOrb,
} from "@/lib/conversations";
import { AgentReasoning } from "./AgentReasoning";
import type { LiveTurn } from "./useLiveTurn";

const HUMAN_AVATAR = "/assets/ui-faces/female-12.jpg";

/** Orb redondo do agente, para o slot de avatar do balão. */
function AgentBubbleAvatar({ agentId }: { agentId: string }) {
  return (
    <img
      src={agentOrb(agentId)}
      alt=""
      className="h-full w-full rounded-full object-cover"
    />
  );
}

function SourcesRow({ sources }: { sources: NonNullable<Message["sources"]> }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 pl-8">
      <span className="inline-flex items-center gap-1 text-2xs text-(--fg-tertiary)">
        <Icon name="link" size={13} />
        Fontes
      </span>
      {sources.map((s, i) => (
        <AwSourceChip key={i} label={s.label} kind={s.kind} detail={s.detail} />
      ))}
    </div>
  );
}

function AgentMessage({
  conversation,
  message,
}: {
  conversation: Conversation;
  message: Message;
}) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-2">
      {message.thinking && message.thinking.length > 0 && (
        <div className="pl-8">
          <AgentReasoning steps={message.thinking} defaultOpen={false} />
        </div>
      )}
      <AwChatBubble
        variant="agent"
        avatar={<AgentBubbleAvatar agentId={conversation.agent.id} />}
        timestamp={message.time}
        copyText={message.text}
        onFeedback={() => {}}
      >
        <p className="m-0 whitespace-pre-wrap">{message.text}</p>
      </AwChatBubble>
      {message.sources && message.sources.length > 0 && (
        <SourcesRow sources={message.sources} />
      )}
    </div>
  );
}

function HumanMessage({ message }: { message: Message }) {
  return (
    <AwChatBubble
      variant="agent"
      avatar={
        <img
          src={HUMAN_AVATAR}
          alt=""
          className="h-full w-full rounded-full object-cover"
        />
      }
      timestamp={message.time}
    >
      <span className="mb-1 flex items-center gap-1.5">
        <span className="text-xs font-semibold text-(--fg-primary)">
          {message.author ?? "Atendente"}
        </span>
        <AwPill variant="warning" dot={false}>
          assumiu
        </AwPill>
      </span>
      <p className="m-0 whitespace-pre-wrap">{message.text}</p>
    </AwChatBubble>
  );
}

function LeadMessage({ message }: { message: Message }) {
  return (
    <AwChatBubble variant="user" timestamp={message.time}>
      <p className="m-0 whitespace-pre-wrap">{message.text}</p>
    </AwChatBubble>
  );
}

/** O turno ao vivo: raciocínio progressivo + resposta digitando. */
function LiveTurnView({
  conversation,
  live,
}: {
  conversation: Conversation;
  live: LiveTurn;
}) {
  const pending = conversation.pendingTurn;
  if (!pending || live.phase === "idle") return null;

  const answering = live.phase === "answering" || live.phase === "done";

  return (
    <div className="flex w-full max-w-2xl flex-col gap-2">
      <div className="pl-8">
        <AgentReasoning
          steps={pending.thinking}
          revealed={live.revealedSteps}
          activeIndex={live.activeStepIndex}
          defaultOpen
          live={live.phase === "thinking"}
        />
      </div>
      {answering && (
        <AwChatBubble
          variant="agent"
          avatar={<AgentBubbleAvatar agentId={conversation.agent.id} />}
          streaming={live.phase === "answering"}
          timestamp={live.phase === "done" ? pending.time : undefined}
          copyText={live.phase === "done" ? pending.answer : undefined}
          onFeedback={live.phase === "done" ? () => {} : undefined}
        >
          <p className="m-0 whitespace-pre-wrap">{live.answerText}</p>
        </AwChatBubble>
      )}
      {live.phase === "done" && pending.sources && pending.sources.length > 0 && (
        <SourcesRow sources={pending.sources} />
      )}
    </div>
  );
}

export function ConversationThread({
  conversation,
  live,
  onTakeOver,
}: {
  conversation: Conversation;
  live: LiveTurn;
  onTakeOver: (text: string) => void;
}) {
  const [draft, setDraft] = React.useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const status = STATUS_META[conversation.status];
  const isLive = live.phase === "thinking" || live.phase === "answering";
  const isResolved = conversation.status === "resolved";
  const isHandoff = conversation.status === "handoff";

  // Limpa o rascunho ao trocar de conversa.
  React.useEffect(() => setDraft(""), [conversation.id]);

  // Mantém a thread rolada até o fim conforme entram mensagens e tokens.
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [
    conversation.id,
    conversation.messages.length,
    live.revealedSteps,
    live.answerText,
    live.phase,
  ]);

  const handleSend = (value: string) => {
    const text = value.trim();
    if (!text) return;
    onTakeOver(text);
    setDraft("");
  };

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-(--bg-canvas)">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-(--border-subtle) px-6 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <AwAvatar
            size="md"
            src={conversation.lead.avatar}
            initials={conversation.lead.initials}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-base font-semibold text-(--fg-primary)">
                {conversation.lead.name}
              </h2>
              <span
                className="inline-flex items-center gap-1 text-xs text-(--fg-tertiary)"
                title={conversation.channel}
              >
                <AwChannelIcon channel={conversation.channel} size={14} />
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-(--fg-tertiary)">
              {conversation.lead.company && (
                <span className="truncate">{conversation.lead.company}</span>
              )}
              <span aria-hidden>·</span>
              {isLive ? (
                <span className="inline-flex items-center gap-1 font-medium text-(--accent-brand)">
                  <AwStatusDot variant="live" size="xs" pulse />
                  {live.phase === "thinking" ? "raciocinando" : "respondendo"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <AwStatusDot variant={status.dot} size="xs" />
                  {status.label}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {!isHandoff && !isResolved && (
            <AwButton
              variant="secondary"
              size="sm"
              iconLeft="support_agent"
              onClick={() => onTakeOver("")}
            >
              Assumir
            </AwButton>
          )}
          <AwButton
            variant="ghost"
            size="sm"
            iconOnly="check_circle"
            aria-label="Marcar como resolvida"
          />
          <AwButton
            variant="ghost"
            size="sm"
            iconOnly="more_horiz"
            aria-label="Mais ações"
          />
        </div>
      </header>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
          <DayDivider label="Hoje" />
          {conversation.messages.map((m) => {
            if (m.role === "lead")
              return <LeadMessage key={m.id} message={m} />;
            if (m.role === "human")
              return <HumanMessage key={m.id} message={m} />;
            return (
              <AgentMessage
                key={m.id}
                conversation={conversation}
                message={m}
              />
            );
          })}
          <LiveTurnView conversation={conversation} live={live} />
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer */}
      <footer className="shrink-0 border-t border-(--border-subtle) px-6 py-3">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-2 flex items-center gap-2 text-xs text-(--fg-tertiary)">
            {isHandoff ? (
              <>
                <Icon
                  name="person"
                  size={14}
                  className="text-(--aw-amber-600)"
                />
                Você assumiu a conversa. O agente está em pausa.
              </>
            ) : isResolved ? (
              <>
                <Icon name="check_circle" size={14} fill={1} />
                Conversa encerrada pelo agente.
              </>
            ) : (
              <>
                <Icon name="agent" size={14} />
                O agente está conduzindo. Escreva para assumir a qualquer momento.
              </>
            )}
          </div>
          <AwInputMessage
            value={draft}
            onValueChange={setDraft}
            onSend={handleSend}
            disabled={isResolved}
            placeholder={
              isResolved
                ? "Conversa encerrada"
                : `Responder ${conversation.lead.name.split(" ")[0]} como humano…`
            }
            minRows={1}
            maxRows={6}
            sendLabel="Enviar mensagem"
            leftSlot={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-(--bg-muted) px-2.5 py-1 text-2xs font-medium text-(--fg-secondary)">
                <AwChannelIcon channel={conversation.channel} size={13} />
                {conversation.channel}
              </span>
            }
          />
        </div>
      </footer>
    </section>
  );
}

function DayDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-(--border-subtle)" />
      <span className="text-2xs font-medium uppercase tracking-wide text-(--fg-tertiary)">
        {label}
      </span>
      <span className="h-px flex-1 bg-(--border-subtle)" />
    </div>
  );
}
