"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { AppNotification, NotificationKind } from "@/lib/notifications";

/** Ícone e tom de cor por tipo de notificação — só tokens da paleta. */
const KIND_META: Record<
  NotificationKind,
  { icon: string; bg: string; fg: string }
> = {
  billing: {
    icon: "credit_card",
    bg: "var(--aw-amber-100)",
    fg: "var(--aw-amber-500)",
  },
  agent: {
    icon: "smart_toy",
    bg: "var(--aw-emerald-100)",
    fg: "var(--aw-emerald-500)",
  },
  team: {
    icon: "group",
    bg: "var(--aw-blue-100)",
    fg: "var(--aw-blue-500)",
  },
  security: {
    icon: "shield",
    bg: "var(--aw-red-100)",
    fg: "var(--aw-red-500)",
  },
  system: {
    icon: "info",
    bg: "var(--bg-muted)",
    fg: "var(--fg-tertiary)",
  },
};

export type NotificationRowProps = {
  notification: AppNotification;
  /** Quando definido, o clique chama o handler em vez de navegar direto. */
  onActivate?: (n: AppNotification) => void;
};

export function NotificationRow({
  notification,
  onActivate,
}: NotificationRowProps) {
  const meta = KIND_META[notification.kind];
  const base =
    "flex w-full gap-3 px-4 py-3.5 text-left transition-colors duration-aw-fast";
  const isNew = !notification.read;

  const inner = (
    <>
      <span
        aria-hidden="true"
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: meta.bg, color: meta.fg }}
      >
        <Icon name={meta.icon} size={24} fill={1} />
        {isNew && (
          <span
            aria-hidden="true"
            className="absolute right-0 top-0 inline-block h-2.5 w-2.5 rounded-full"
            style={{
              background: "var(--aw-blue-500)",
              boxShadow: "0 0 0 2px var(--bg-raised)",
            }}
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={
              "min-w-0 flex-1 truncate body-sm " +
              (isNew
                ? "font-medium text-[var(--fg-primary)]"
                : "font-normal text-[var(--fg-secondary)]")
            }
          >
            {notification.title}
          </span>
          <span className="shrink-0 body-xs tabular-nums text-[var(--fg-tertiary)]">
            {notification.timeLabel}
          </span>
        </span>
        <span className="mt-0.5 line-clamp-2 block body-xs text-[var(--fg-secondary)]">
          {notification.description}
        </span>
      </span>
      <Icon
        name="chevron_right"
        size={18}
        className="mt-0.5 shrink-0 self-start text-[var(--fg-tertiary)]"
      />
    </>
  );

  // Se o pai passou onActivate, ele controla a navegação (geralmente via modal
  // de confirmação). Caso contrário, mantém o comportamento legado de Link.
  if (onActivate) {
    return (
      <button
        type="button"
        onClick={() => onActivate(notification)}
        aria-label={`Abrir notificação: ${notification.title}`}
        className={`${base} hover:bg-[var(--bg-muted)]`}
      >
        {inner}
      </button>
    );
  }

  if (notification.href) {
    return (
      <Link
        href={notification.href}
        className={`${base} hover:bg-[var(--bg-muted)]`}
      >
        {inner}
      </Link>
    );
  }
  return <div className={base}>{inner}</div>;
}
