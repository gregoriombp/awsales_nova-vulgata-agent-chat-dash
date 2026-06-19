"use client";

import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationKind } from "@/lib/notifications";

/** Ícone por categoria — mesmo mapa usado na topbar e na página /notifications. */
const KIND_ICON: Record<NotificationKind, string> = {
  billing: "credit_card",
  agent: "agent",
  team: "group",
  security: "shield",
  system: "info",
};

type Tone = "critical" | "fresh" | "read";

const TONE_BG: Record<Tone, string | undefined> = {
  critical: "color-mix(in srgb, var(--aw-red-500) 8%, var(--bg-raised))",
  fresh: "color-mix(in srgb, var(--aw-blue-500) 7%, var(--bg-raised))",
  read: undefined,
};

const TONE_BORDER: Record<Tone, string> = {
  critical: "border-(--aw-red-200) hover:border-(--aw-red-300)",
  fresh: "border-(--aw-blue-200) hover:border-(--aw-blue-300)",
  read: "border-(--border-subtle) bg-(--bg-raised) hover:border-(--border-default)",
};

const TONE_DOT: Record<Tone, string> = {
  critical: "var(--aw-red-500)",
  fresh: "var(--aw-blue-500)",
  read: "var(--aw-blue-500)",
};

export interface AwNotificationCardProps {
  notification: AppNotification;
  /** Atraso da animação de entrada — escalonada (40ms × index, máx 8). */
  index?: number;
  onActivate?: (n: AppNotification) => void;
  className?: string;
}

/**
 * Card individual do feed da página /notifications.
 *
 * Três tons:
 * - **critical** — crítica e não lida: fundo vermelho claro, borda red, dot red.
 * - **fresh** — não lida normal: fundo azul claro, borda blue, dot blue.
 * - **read** — já lida: superfície neutra, borda subtle, sem dot.
 *
 * Não traz chevron — todo o card é clicável; o gesto é o card inteiro virar
 * link e abrir o detalhe.
 */
export function AwNotificationCard({
  notification: n,
  index = 0,
  onActivate,
  className,
}: AwNotificationCardProps) {
  const isNew = !n.read;
  const tone: Tone =
    n.critical && isNew ? "critical" : isNew ? "fresh" : "read";
  return (
    <button
      type="button"
      onClick={() => onActivate?.(n)}
      aria-label={`Abrir notificação: ${n.title}`}
      style={{
        animationDelay: `${Math.min(index, 8) * 40}ms`,
        ...(TONE_BG[tone] ? { background: TONE_BG[tone] } : {}),
      }}
      className={cn(
        "aw-wizard-step group flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-[border-color,box-shadow] duration-aw-fast hover:shadow-(--shadow-xs)",
        TONE_BORDER[tone],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--bg-muted) text-(--fg-tertiary)"
      >
        <Icon name={KIND_ICON[n.kind]} size={22} fill={1} />
        {isNew && (
          <span
            aria-hidden="true"
            className="absolute right-0 top-0 inline-block h-2.5 w-2.5 rounded-full"
            style={{
              background: TONE_DOT[tone],
              boxShadow: "0 0 0 2px var(--bg-raised)",
            }}
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 truncate body-sm",
              isNew
                ? "font-medium text-(--fg-primary)"
                : "font-normal text-(--fg-secondary)",
            )}
          >
            {n.title}
          </span>
          {n.critical && (
            <AwPill variant="error" dot={false}>
              Crítica
            </AwPill>
          )}
          <span className="shrink-0 body-xs tabular-nums text-(--fg-tertiary)">
            {n.timeLabel}
          </span>
        </span>
        <span className="mt-0.5 line-clamp-2 block body-xs text-(--fg-secondary)">
          {n.description}
        </span>
      </span>
    </button>
  );
}
