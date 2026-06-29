"use client";

import * as React from "react";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { Icon } from "@/components/ui/Icon";
import { CONVERSATIONS, type Conversation, type Message } from "@/lib/conversations";
import { ConversationList } from "./_components/ConversationList";
import { ConversationThread } from "./_components/ConversationThread";
import { ConversationDetails } from "./_components/ConversationDetails";
import { useLiveTurn } from "./_components/useLiveTurn";

const DEFAULT_ID = CONVERSATIONS[0].id;

/** Cópia rasa editável do mock — o operador pode assumir conversas e isso
 *  precisa refletir no estado local sem mutar a fonte. */
function seed(): Conversation[] {
  return CONVERSATIONS.map((c) => ({
    ...c,
    messages: [...c.messages],
    // A conversa aberta por padrão já entra como lida.
    unread: c.id === DEFAULT_ID ? undefined : c.unread,
  }));
}

const breadcrumbs = [
  { label: "Conversas", icon: <Icon name="forum" size={20} /> },
];

export default function ConversationsPage() {
  const [conversations, setConversations] = React.useState<Conversation[]>(seed);
  const [selectedId, setSelectedId] = React.useState(DEFAULT_ID);
  const [pulseId, setPulseId] = React.useState<string | null>(null);

  const selected =
    conversations.find((c) => c.id === selectedId) ?? conversations[0];

  const live = useLiveTurn(selected);
  const liveActive = live.phase === "thinking" || live.phase === "answering";

  // Liveliness na lista: revezamento de quem está "respondendo agora" entre as
  // conversas ativas, para a inbox parecer viva mesmo fora da thread aberta.
  React.useEffect(() => {
    const activeIds = conversations
      .filter((c) => c.status === "active")
      .map((c) => c.id);
    if (activeIds.length === 0) {
      setPulseId(null);
      return;
    }
    let i = 0;
    setPulseId(activeIds[0]);
    const id = window.setInterval(() => {
      i = (i + 1) % activeIds.length;
      setPulseId(activeIds[i]);
    }, 3200);
    return () => window.clearInterval(id);
  }, [conversations]);

  const respondingIds = React.useMemo(() => {
    const set = new Set<string>();
    if (pulseId) set.add(pulseId);
    if (liveActive) set.add(selectedId);
    return set;
  }, [pulseId, liveActive, selectedId]);

  const handleSelect = React.useCallback((id: string) => {
    setSelectedId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: undefined } : c)),
    );
  }, []);

  // O operador assume a conversa (com ou sem mensagem). Pausa o agente.
  const handleTakeOver = React.useCallback((text: string) => {
    const trimmed = text.trim();
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== selectedId) return c;
        const messages: Message[] = trimmed
          ? [
              ...c.messages,
              {
                id: `human-${c.messages.length + 1}`,
                role: "human",
                author: "Você",
                text: trimmed,
                time: "agora",
              },
            ]
          : c.messages;
        return {
          ...c,
          status: "handoff",
          pendingTurn: undefined,
          checkpoint: "Transferência para humano",
          lastActivity: "agora",
          unread: undefined,
          preview: trimmed ? `Você: ${trimmed}` : c.preview,
          messages,
        };
      }),
    );
  }, [selectedId]);

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs} mainClassName="p-0!">
      <div className="flex h-full min-h-0 w-full">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={handleSelect}
          respondingIds={respondingIds}
        />
        <ConversationThread
          key={selected.id}
          conversation={selected}
          live={live}
          onTakeOver={handleTakeOver}
        />
        <ConversationDetails conversation={selected} phase={live.phase} />
      </div>
    </AwDashboardLayout>
  );
}
