"use client";

import { useMemo, useState } from "react";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { NotificationRow } from "@/components/NotificationRow";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwTabs } from "@/components/ui/AwTabs";
import { Icon } from "@/components/ui/Icon";
import { NOTIFICATIONS } from "@/lib/notifications";

type NotifTab = "all" | "unread";

export default function NotificationsPage() {
  const [tab, setTab] = useState<NotifTab>("all");
  const [readIds, setReadIds] = useState<Set<string>>(
    () => new Set(NOTIFICATIONS.filter((n) => n.read).map((n) => n.id)),
  );

  const items = useMemo(
    () => NOTIFICATIONS.map((n) => ({ ...n, read: readIds.has(n.id) })),
    [readIds],
  );
  const unreadCount = items.filter((n) => !n.read).length;
  const visible = tab === "unread" ? items.filter((n) => !n.read) : items;

  const markAllRead = () =>
    setReadIds(new Set(NOTIFICATIONS.map((n) => n.id)));

  return (
    <AwDashboardLayout
      breadcrumbs={[
        { label: "Notificações", icon: <Icon name="notifications" size={18} /> },
      ]}
    >
      <div className="mx-auto w-full max-w-[880px]">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="m-0 text-[var(--fg-primary)]">Notificações</h3>
            <p className="m-0 mt-1 body-sm text-[var(--fg-secondary)]">
              Aprovações de agente, cobrança, equipe e segurança — tudo que
              pediu sua atenção no workspace.
            </p>
          </div>
          <AwButton
            size="sm"
            variant="ghost"
            iconLeft="done_all"
            disabled={unreadCount === 0}
            onClick={markAllRead}
          >
            Marcar todas como lidas
          </AwButton>
        </header>

        <div className="mb-4">
          <AwTabs
            variant="underline"
            aria-label="Filtrar notificações"
            value={tab}
            onChange={(v) => setTab(v as NotifTab)}
            items={[
              { value: "all", label: "Todas" },
              {
                value: "unread",
                label:
                  unreadCount > 0
                    ? `Não lidas (${unreadCount})`
                    : "Não lidas",
              },
            ]}
          />
        </div>

        <AwCard className="!p-0">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
              <Icon
                name="notifications_off"
                size={24}
                className="text-[var(--fg-tertiary)]"
              />
              <p className="m-0 body-sm text-[var(--fg-secondary)]">
                Você está em dia — nenhuma notificação não lida.
              </p>
            </div>
          ) : (
            <ul className="m-0 list-none divide-y divide-[var(--border-subtle)] p-0">
              {visible.map((n) => (
                <li key={n.id} className="m-0">
                  <NotificationRow notification={n} />
                </li>
              ))}
            </ul>
          )}
        </AwCard>
      </div>
    </AwDashboardLayout>
  );
}
