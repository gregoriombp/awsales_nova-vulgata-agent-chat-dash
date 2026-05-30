"use client";

import { useState } from "react";
import Link from "next/link";
import { AwButton } from "@/components/ui/AwButton";
import { NOTIFICATIONS } from "@/lib/notifications";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  isUnread?: boolean;
  href?: string;
};

export function AwNotificationsPopover({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"all" | "unread">("all");

  const items: NotificationItem[] = NOTIFICATIONS.map((n) => ({
    id: n.id,
    title: n.title,
    description: n.description,
    dateLabel: n.timeLabel,
    isUnread: !n.read,
    href: n.href,
  }));

  const filtered = tab === "unread" ? items.filter((i) => i.isUnread) : items;

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-[calc(100%+14px)] z-50">
      {/* caret */}
      <div className="absolute -top-2 right-10 h-4 w-4 rotate-45 bg-white shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.18),0px_1px_3px_0px_rgba(0,0,0,0.10)]" />

      <div className="w-[582px] max-w-[calc(100vw-32px)] rounded-[24px] bg-white p-6 shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.3),0px_1px_3px_0px_rgba(0,0,0,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="body-lg font-normal text-[#2f2f2f]">
            Notificações
          </div>
          <div className="flex items-center gap-4 text-[#737373]">
            <button
              type="button"
              className="p-1 hover:text-[#0d0d0d]"
              aria-label="Configurações de notificações"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1a2.4 2.4 0 0 1-1.7 4.1h-.2a2 2 0 0 0-1.9 1.4l-.1.2a2.4 2.4 0 0 1-4.6 0l-.1-.2a2 2 0 0 0-1.9-1.4h-.2A2.4 2.4 0 0 1 4.1 17.3l.1-.1a2 2 0 0 0 .4-2.2 2 2 0 0 0-1.6-1.2H2.8a2.4 2.4 0 0 1 0-4.8H3a2 2 0 0 0 1.6-1.2 2 2 0 0 0-.4-2.2l-.1-.1A2.4 2.4 0 0 1 5.8 1.4H6a2 2 0 0 0 1.9-1.4l.1-.2a2.4 2.4 0 0 1 4.6 0l.1.2A2 2 0 0 0 14.6 1.4h.2a2.4 2.4 0 0 1 1.7 4.1l-.1.1a2 2 0 0 0-.4 2.2 2 2 0 0 0 1.6 1.2h.2a2.4 2.4 0 0 1 0 4.8h-.2a2 2 0 0 0-1.6 1.2Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.0"
                />
                <path
                  d="M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.4 1a7.5 7.5 0 0 0-2.2-1.3L12 2H8l-.3 2.5a7.5 7.5 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 3 12c0 .4 0 .9.1 1.3l-2 1.5 2 3.4 2.4-1a7.5 7.5 0 0 0 2.2 1.3L8 22h4l.3-2.5a7.5 7.5 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.5c.1-.4.1-.9.1-1.3Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="p-1 hover:text-[#0d0d0d]"
              aria-label="Marcar todas como lidas"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4h16v13H7l-3 3V4Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="m8 9 2 2 6-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 border-b border-[#f2f2f2]">
          <div className="flex">
            <button
              type="button"
              onClick={() => setTab("all")}
              className={`flex-1 py-2 body-md font-normal text-[#2f2f2f] ${
                tab === "all" ? "border-b border-[#0d0d0d]" : ""
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setTab("unread")}
              className={`flex-1 py-2 body-md font-normal text-[#2f2f2f] ${
                tab === "unread" ? "border-b border-[#0d0d0d]" : ""
              }`}
            >
              Não lidas
            </button>
          </div>
        </div>

        {/* List */}
        <div className="mt-4 flex max-h-[640px] flex-col gap-4 overflow-auto pr-1">
          {filtered.length === 0 ? (
            <div className="rounded-[16px] border border-[#f2f2f2] p-4 body-sm text-[#7a7a7a]">
              Nenhuma notificação.
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                className="rounded-[16px] border border-[#f2f2f2] p-4"
              >
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#f2f7ff] text-[#3b82f6]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 1v22"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="body-sm font-medium text-[#2f2f2f]">
                      {n.title}
                    </div>
                    <div className="mt-1 body-xs font-normal text-[#5e5e5e]">
                      {n.description}
                    </div>
                    <div className="mt-1 body-xs font-normal text-[#7a7a7a]">
                      {n.dateLabel}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-6">
                  <button
                    type="button"
                    className="body-sm font-medium tracking-[-0.1px] text-[#999999] hover:text-[#0d0d0d]"
                  >
                    {n.isUnread ? "Marcar como lida" : "Ignorar"}
                  </button>

                  {n.href && (
                    <Link href={n.href} onClick={onClose}>
                      <AwButton
                        size="sm"
                        variant="primary"
                        className="w-auto"
                      >
                        Ver
                      </AwButton>
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 border-t border-[#f2f2f2] pt-3 text-center">
          <Link
            href="/notifications"
            onClick={onClose}
            className="body-sm font-medium text-[#5e5e5e] hover:text-[#0d0d0d]"
          >
            Ver todas as notificações →
          </Link>
        </div>
      </div>
    </div>
  );
}

