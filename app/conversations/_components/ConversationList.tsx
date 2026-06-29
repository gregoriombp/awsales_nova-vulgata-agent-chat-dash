"use client";

import * as React from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwChannelIcon } from "@/components/ui/AwChannelIcon";
import { AwStatusDot } from "@/components/ui/AwStatusDot";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import {
  type Conversation,
  type ConversationStatus,
  STATUS_META,
  agentOrb,
} from "@/lib/conversations";

type Filter = "all" | "active" | "handoff";

const FILTERS: { id: Filter; label: string; match: (s: ConversationStatus) => boolean }[] = [
  { id: "all", label: "Todas", match: () => true },
  { id: "active", label: "Ativas", match: (s) => s === "active" || s === "waiting" },
  { id: "handoff", label: "Com humano", match: (s) => s === "handoff" },
];

export const ConversationList = React.memo(function ConversationList({
  conversations,
  selectedId,
  onSelect,
  respondingIds,
}: {
  conversations: Conversation[];
  selectedId: string;
  onSelect: (id: string) => void;
  respondingIds: Set<string>;
}) {
  const [filter, setFilter] = React.useState<Filter>("all");
  const active = FILTERS.find((f) => f.id === filter)!;
  const visible = conversations.filter((c) => active.match(c.status));
  const liveCount = conversations.filter((c) => c.status === "active").length;

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-r border-(--border-subtle) bg-(--bg-raised)">
      {/* Header */}
      <header className="shrink-0 px-4 pb-3 pt-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-heading-tighter text-(--fg-primary)">
            Conversas
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-(--bg-muted) px-2.5 py-1 text-2xs font-medium text-(--fg-secondary)">
            <AwStatusDot variant="live" size="xs" pulse />
            {liveCount} ao vivo
          </span>
        </div>
        <p className="mt-0.5 text-xs text-(--fg-tertiary)">
          Acompanhe os agentes atendendo em tempo real.
        </p>

        {/* Filtro */}
        <div className="mt-3 flex items-center gap-1 rounded-lg bg-(--bg-muted) p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                filter === f.id
                  ? "bg-(--bg-raised) text-(--fg-primary) shadow-xs"
                  : "text-(--fg-tertiary) hover:text-(--fg-secondary)",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {visible.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-(--fg-tertiary)">
            Nenhuma conversa neste filtro.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {visible.map((conv) => (
              <li key={conv.id}>
                <ConversationRow
                  conversation={conv}
                  selected={conv.id === selectedId}
                  responding={respondingIds.has(conv.id)}
                  onSelect={() => onSelect(conv.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
});

function ConversationRow({
  conversation,
  selected,
  responding,
  onSelect,
}: {
  conversation: Conversation;
  selected: boolean;
  responding: boolean;
  onSelect: () => void;
}) {
  const status = STATUS_META[conversation.status];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
        selected
          ? "bg-(--bg-selected)"
          : "hover:bg-(--bg-hover)",
      )}
    >
      {/* Avatar do lead + selo do canal */}
      <div className="relative shrink-0">
        <AwAvatar
          size="md"
          src={conversation.lead.avatar}
          initials={conversation.lead.initials}
        />
        <span
          className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-(--bg-raised) ring-2 ring-(--bg-raised)"
          aria-hidden
        >
          <AwChannelIcon channel={conversation.channel} size={12} />
        </span>
      </div>

      {/* Texto */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm",
              conversation.unread
                ? "font-semibold text-(--fg-primary)"
                : "font-medium text-(--fg-primary)",
            )}
          >
            {conversation.lead.name}
          </span>
          <span className="shrink-0 text-2xs text-(--fg-tertiary)">
            {conversation.lastActivity}
          </span>
        </div>

        <p className="mt-0.5 truncate text-xs text-(--fg-secondary)">
          {conversation.preview}
        </p>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          {responding ? (
            <span className="inline-flex min-w-0 items-center gap-1 text-2xs font-medium text-(--accent-brand)">
              <Icon name="agent" size={13} className="text-(--accent-brand)" />
              <span className="truncate">Agente respondendo…</span>
            </span>
          ) : (
            <span className="inline-flex min-w-0 items-center gap-1.5 text-2xs text-(--fg-tertiary)">
              <img
                src={agentOrb(conversation.agent.id)}
                alt=""
                className="size-3.5 rounded-full object-cover"
              />
              <span className="truncate">{conversation.agent.name}</span>
            </span>
          )}

          {conversation.unread ? (
            <span className="grid h-4 min-w-4 shrink-0 place-items-center rounded-full bg-(--accent-brand) px-1 text-3xs font-semibold text-(--fg-on-inverse)">
              {conversation.unread}
            </span>
          ) : (
            <AwStatusDot
              variant={status.dot}
              size="xs"
              pulse={responding}
              className="shrink-0"
            />
          )}
        </div>
      </div>
    </button>
  );
}
