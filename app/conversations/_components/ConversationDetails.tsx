"use client";

import * as React from "react";
import { AwAgentAvatar } from "@/components/ui/AwAgentAvatar";
import { AwStatusDot } from "@/components/ui/AwStatusDot";
import { AwSourceChip } from "@/components/ui/AwSourceChip";
import { AwChannelIcon } from "@/components/ui/AwChannelIcon";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { UserAgentState } from "@/lib/user-agent-presets";
import { type Conversation, CHANNEL_LABEL } from "@/lib/conversations";
import type { LivePhase } from "./useLiveTurn";

const SENTIMENT_META = {
  positive: { label: "Positivo", color: "text-(--accent-success)", dot: "live" as const },
  neutral: { label: "Neutro", color: "text-(--fg-secondary)", dot: "neutral" as const },
  negative: { label: "Negativo", color: "text-(--accent-danger)", dot: "attention" as const },
};

export const ConversationDetails = React.memo(function ConversationDetails({
  conversation,
  phase,
}: {
  conversation: Conversation;
  phase: LivePhase;
}) {
  const { agent } = conversation;

  const agentState: UserAgentState =
    phase === "thinking"
      ? "thinking"
      : phase === "answering"
        ? "responding"
        : conversation.status === "handoff"
          ? "paused"
          : "idle";

  const liveLabel =
    phase === "thinking"
      ? "Raciocinando"
      : phase === "answering"
        ? "Respondendo"
        : conversation.status === "handoff"
          ? "Em pausa"
          : conversation.status === "resolved"
            ? "Encerrado"
            : conversation.status === "waiting"
              ? "Aguardando"
              : "Ativo";

  const isLive = phase === "thinking" || phase === "answering";

  // Fontes consultadas ao longo da conversa (dedupe por rótulo).
  const sources = React.useMemo(() => {
    const all = [
      ...conversation.messages.flatMap((m) => m.sources ?? []),
      ...(conversation.pendingTurn?.sources ?? []),
    ];
    const seen = new Set<string>();
    return all.filter((s) => {
      if (seen.has(s.label)) return false;
      seen.add(s.label);
      return true;
    });
  }, [conversation]);

  const sentiment = conversation.sentiment
    ? SENTIMENT_META[conversation.sentiment]
    : null;

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col overflow-y-auto border-l border-(--border-subtle) bg-(--bg-raised)">
      {/* Agente conduzindo */}
      <div className="flex items-center gap-3 border-b border-(--border-subtle) px-5 py-5">
        <AwAgentAvatar
          agentSeed={agent.id}
          coreSrc={agent.coreSrc}
          state={agentState}
          size={52}
          renderer="css"
        />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-(--fg-primary)">
            {agent.name}
          </div>
          <div className="truncate text-xs text-(--fg-tertiary)">
            Core · {agent.coreName}
          </div>
          <div
            className={cn(
              "mt-1 inline-flex items-center gap-1 text-2xs font-medium",
              isLive ? "text-(--accent-brand)" : "text-(--fg-secondary)",
            )}
          >
            <AwStatusDot
              variant={isLive ? "live" : "neutral"}
              size="xs"
              pulse={isLive}
            />
            {liveLabel}
          </div>
        </div>
      </div>

      {/* Objetivo */}
      <Section title="Objetivo do agente">
        <p className="text-xs leading-relaxed text-(--fg-secondary)">
          {agent.objective}
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-(--bg-canvas) px-3 py-2">
          <Icon name="conversion_path" size={16} className="text-(--fg-tertiary)" />
          <div className="min-w-0">
            <div className="text-3xs uppercase tracking-wide text-(--fg-tertiary)">
              Checkpoint atual
            </div>
            <div className="truncate text-xs font-medium text-(--fg-primary)">
              {conversation.checkpoint}
            </div>
          </div>
        </div>
      </Section>

      {/* Qualidade + latências */}
      {(conversation.quality || conversation.latency) && (
        <Section title="Desempenho do agente">
          {conversation.quality && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-(--fg-tertiary)">Qualidade</span>
                <span
                  className={cn("font-semibold", qualityColor(conversation.quality.value))}
                >
                  {conversation.quality.label} · {conversation.quality.value}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-(--bg-muted)">
                <div
                  className={cn("h-full rounded-full", qualityBar(conversation.quality.value))}
                  style={{ width: `${conversation.quality.value}%` }}
                />
              </div>
            </div>
          )}
          {conversation.latency && (
            <div className="flex flex-col gap-1.5">
              <LatencyRow label="Raciocínio" ms={conversation.latency.reasoning} />
              <LatencyRow label="Ações" ms={conversation.latency.actions} />
              <LatencyRow label="Decisão" ms={conversation.latency.decision} />
            </div>
          )}
        </Section>
      )}

      {/* Dados do lead */}
      <Section title="Dados do lead">
        <Row label="Nome">{conversation.lead.name}</Row>
        {conversation.lead.company && <Row label="Empresa">{conversation.lead.company}</Row>}
        {conversation.lead.location && <Row label="Local">{conversation.lead.location}</Row>}
        {conversation.lead.email && <Row label="E-mail">{conversation.lead.email}</Row>}
        {conversation.lead.phone && <Row label="Telefone">{conversation.lead.phone}</Row>}
      </Section>

      {/* Atributos da conversa */}
      <Section title="Atributos da conversa">
        <Row label="ID">{conversation.id}</Row>
        <Row label="Canal">
          <span className="inline-flex items-center gap-1.5">
            <AwChannelIcon channel={conversation.channel} size={14} />
            {CHANNEL_LABEL[conversation.channel] ?? conversation.channel}
          </span>
        </Row>
        <Row label="Assunto">{conversation.topic}</Row>
        <Row label="Última atividade">{conversation.lastActivity}</Row>
        {sentiment && (
          <Row label="Sentimento">
            <span className={cn("inline-flex items-center gap-1.5", sentiment.color)}>
              <AwStatusDot variant={sentiment.dot} size="xs" />
              {sentiment.label}
            </span>
          </Row>
        )}
      </Section>

      {/* Fontes consultadas */}
      {sources.length > 0 && (
        <Section title="Fontes consultadas" last>
          <p className="mb-2.5 text-xs leading-relaxed text-(--fg-tertiary)">
            Conhecimento que o agente usou para fundamentar as respostas.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((s, i) => (
              <AwSourceChip key={i} label={s.label} kind={s.kind} detail={s.detail} />
            ))}
          </div>
        </Section>
      )}
    </aside>
  );
});

function Section({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={cn("px-5 py-4", !last && "border-b border-(--border-subtle)")}>
      <h3 className="mb-2.5 text-3xs font-semibold uppercase tracking-wide text-(--fg-tertiary)">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="shrink-0 text-xs text-(--fg-tertiary)">{label}</span>
      <span className="min-w-0 truncate text-right text-xs font-medium text-(--fg-primary)">
        {children}
      </span>
    </div>
  );
}

function LatencyRow({ label, ms }: { label: string; ms: number }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-(--fg-tertiary)">{label}</span>
      <span className="font-medium tabular-nums text-(--fg-secondary)">{ms}ms</span>
    </div>
  );
}

function qualityColor(value: number) {
  if (value >= 85) return "text-(--accent-success)";
  if (value >= 60) return "text-(--aw-amber-600)";
  return "text-(--accent-danger)";
}

function qualityBar(value: number) {
  if (value >= 85) return "bg-(--accent-success)";
  if (value >= 60) return "bg-(--aw-amber-500)";
  return "bg-(--accent-danger)";
}
