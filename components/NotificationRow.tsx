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
    fg: "var(--aw-amber-600)",
  },
  agent: {
    icon: "smart_toy",
    bg: "var(--aw-emerald-100)",
    fg: "var(--aw-emerald-600)",
  },
  team: {
    icon: "group",
    bg: "var(--aw-blue-100)",
    fg: "var(--aw-blue-600)",
  },
  security: {
    icon: "shield",
    bg: "var(--aw-red-100)",
    fg: "var(--aw-red-600)",
  },
  system: {
    icon: "info",
    bg: "var(--bg-muted)",
    fg: "var(--fg-secondary)",
  },
};

export function NotificationRow({
  notification,
}: {
  notification: AppNotification;
}) {
  const meta = KIND_META[notification.kind];
  const base = "flex gap-3 px-4 py-3.5 transition-colors duration-aw-fast";

  const inner = (
    <>
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
        style={{ backgroundColor: meta.bg, color: meta.fg }}
      >
        <Icon name={meta.icon} size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={
              "min-w-0 flex-1 truncate body-sm " +
              (notification.read
                ? "font-normal text-[var(--fg-secondary)]"
                : "font-medium text-[var(--fg-primary)]")
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
      {notification.href && (
        <Icon
          name="chevron_right"
          size={18}
          className="mt-0.5 shrink-0 self-start text-[var(--fg-tertiary)]"
        />
      )}
    </>
  );

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
