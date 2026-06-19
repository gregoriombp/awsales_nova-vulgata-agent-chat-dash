"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwButton } from "@/components/ui/AwButton";
import { AwModal } from "@/components/ui/AwModal";
import { AwNotificationCard } from "@/components/ui/AwNotificationCard";
import { AwPill } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwTabs } from "@/components/ui/AwTabs";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import {
  KIND_LABEL,
  NOTIFICATIONS,
  type AppNotification,
  type NotificationKind,
} from "@/lib/notifications";

type NotifTab = "all" | "unread";

/** "Tudo" + uma entrada por categoria, na ordem de relevância operacional. */
const KIND_FILTERS: { value: NotificationKind | "all"; label: string }[] = [
  { value: "all", label: "Tudo" },
  { value: "billing", label: KIND_LABEL.billing },
  { value: "agent", label: KIND_LABEL.agent },
  { value: "team", label: KIND_LABEL.team },
  { value: "security", label: KIND_LABEL.security },
  { value: "system", label: KIND_LABEL.system },
];

/** Janela de tempo dos itens. O fixture é mock, então o recorte é só por
 * rótulo — quando virar feed real, basta comparar timestamps. */
type Period = "any" | "24h" | "7d" | "30d";
const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "any", label: "Qualquer período" },
  { value: "24h", label: "Últimas 24h" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
];

/** Aproximação client-side da idade do item a partir do rótulo já formatado.
 * No feed real isso vem de um timestamp; aqui mantém o filtro funcional. */
function withinPeriod(timeLabel: string, period: Period): boolean {
  if (period === "any") return true;
  const t = timeLabel.toLowerCase();
  const isToday =
    t.includes("hora") || t.includes("minuto") || t.includes("agora");
  const isYesterday = t.includes("ontem");
  if (period === "24h") return isToday;
  if (period === "7d") return isToday || isYesterday;
  return true; // 30 dias — todo o fixture cabe.
}

const KIND_ICON: Record<NotificationKind, string> = {
  billing: "credit_card",
  agent: "agent",
  team: "group",
  security: "shield",
  system: "info",
};

export default function NotificationsPage() {
  const [tab, setTab] = useState<NotifTab>("all");
  const [kind, setKind] = useState<NotificationKind | "all">("all");
  const [period, setPeriod] = useState<Period>("any");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(
    () => new Set(NOTIFICATIONS.filter((n) => n.read).map((n) => n.id)),
  );
  const [detail, setDetail] = useState<AppNotification | null>(null);
  /** Paginação leve: quantos itens mostrar antes do "Carregar mais". */
  const [visibleCount, setVisibleCount] = useState(6);

  const items = useMemo(
    () => NOTIFICATIONS.map((n) => ({ ...n, read: readIds.has(n.id) })),
    [readIds],
  );
  const unreadCount = items.filter((n) => !n.read).length;

  const visible = items.filter((n) => {
    if (tab === "unread" && n.read) return false;
    if (kind !== "all" && n.kind !== kind) return false;
    if (!withinPeriod(n.timeLabel, period)) return false;
    return true;
  });
  const shown = visible.slice(0, visibleCount);
  const hasMore = visible.length > visibleCount;

  const markRead = (id: string) =>
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  const markAllRead = () => setReadIds(new Set(NOTIFICATIONS.map((n) => n.id)));

  const openDetail = (n: AppNotification) => {
    markRead(n.id);
    setDetail(n);
  };

  const hasFilter = kind !== "all" || period !== "any";

  return (
    <AwDashboardLayout
      breadcrumbs={[
        { label: "Notificações", icon: <Icon name="notifications" size={18} /> },
      ]}
    >
      <div className="mx-auto w-full max-w-[880px] pt-4">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="m-0 text-(--fg-primary)">Notificações</h3>
            <p className="m-0 mt-1 body-sm text-(--fg-secondary)">
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
            aria-label="Filtrar notificações por estado"
            value={tab}
            onChange={(v) => setTab(v as NotifTab)}
            items={[
              { value: "all", label: "Todas" },
              {
                value: "unread",
                label:
                  unreadCount > 0 ? `Não lidas (${unreadCount})` : "Não lidas",
              },
            ]}
          />
        </div>

        {/* Filtros — categoria (chips) + período (select). Quando "Tudo" está
         * ativo, as categorias colapsam atrás dele e só revelam num hover
         * horizontal suave. Se uma categoria está filtrando, todos os chips
         * ficam visíveis pra trocar rápido. */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Filtrar por categoria"
            className="group/cat flex flex-wrap items-center"
          >
            {KIND_FILTERS.map((f) => {
              const active = kind === f.value;
              const isAll = f.value === "all";
              const someSelected = kind !== "all";
              const alwaysVisible = isAll || someSelected;
              return (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setKind(f.value)}
                  aria-hidden={!alwaysVisible ? true : undefined}
                  tabIndex={!alwaysVisible ? -1 : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full border body-xs font-medium transition-all duration-aw-medium ease-out",
                    active
                      ? "border-(--fg-primary) bg-(--fg-primary) text-(--bg-canvas)"
                      : "border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary) hover:bg-(--bg-muted)",
                    alwaysVisible
                      ? "ml-1.5 max-w-[200px] px-3 py-1 opacity-100 first:ml-0"
                      : "ml-0 max-w-0 px-0 py-1 opacity-0 group-hover/cat:ml-1.5 group-hover/cat:max-w-[200px] group-hover/cat:px-3 group-hover/cat:opacity-100",
                  )}
                >
                  {f.value !== "all" && (
                    <Icon name={KIND_ICON[f.value]} size={13} />
                  )}
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Select de período — popover simples sobre AwSelect. */}
          <div className="relative">
            <AwSelect
              aria-haspopup="listbox"
              aria-expanded={periodOpen}
              onClick={() => setPeriodOpen((o) => !o)}
              onBlur={() => setPeriodOpen(false)}
            >
              {PERIOD_OPTIONS.find((p) => p.value === period)?.label}
            </AwSelect>
            {periodOpen && (
              <ul
                role="listbox"
                aria-label="Período"
                className="absolute right-0 z-10 mt-1 min-w-[180px] list-none rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-1 shadow-md"
              >
                {PERIOD_OPTIONS.map((p) => (
                  <li key={p.value} className="m-0">
                    <button
                      type="button"
                      role="option"
                      aria-selected={period === p.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setPeriod(p.value);
                        setPeriodOpen(false);
                      }}
                      className={
                        "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left body-sm transition-colors duration-aw-fast hover:bg-(--bg-muted) " +
                        (period === p.value
                          ? "font-medium text-(--fg-primary)"
                          : "text-(--fg-secondary)")
                      }
                    >
                      {p.label}
                      {period === p.value && (
                        <Icon
                          name="check"
                          size={16}
                          className="text-(--fg-primary)"
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-xl border border-(--border-subtle) bg-(--bg-raised)">
            <EmptyState tab={tab} hasFilter={hasFilter} />
          </div>
        ) : (
          <>
            {/* Cards separados; os não lidos ganham fundo destacado.
             * Crítica não lida tem tom vermelho ao invés de azul. */}
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {shown.map((n, i) => (
                <li key={n.id} className="m-0">
                  <AwNotificationCard
                    notification={n}
                    index={i}
                    onActivate={openDetail}
                  />
                </li>
              ))}
            </ul>

            {hasMore && (
              <div className="mt-5 flex justify-center">
                <AwButton
                  size="sm"
                  variant="secondary"
                  iconLeft="expand_more"
                  onClick={() => setVisibleCount((c) => c + 6)}
                >
                  Carregar mais
                </AwButton>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detalhe da notificação — abrir já marca como lida. */}
      <NotificationDetailModal
        notification={detail}
        onClose={() => setDetail(null)}
      />
    </AwDashboardLayout>
  );
}

/* ===================================================================== *
 * Empty states — distintos por aba e por filtro ativo.
 * ===================================================================== */

function EmptyState({
  tab,
  hasFilter,
}: {
  tab: NotifTab;
  hasFilter: boolean;
}) {
  const { icon, text } = hasFilter
    ? {
        icon: "filter_alt_off",
        text: "Nenhuma notificação com esses filtros.",
      }
    : tab === "unread"
      ? {
          icon: "mark_email_read",
          text: "Tudo em dia. Nenhuma notificação pendente.",
        }
      : {
          icon: "notifications_off",
          text: "Nada por aqui — você está em dia.",
        };

  return (
    <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
      <Icon name={icon} size={24} className="text-(--fg-tertiary)" />
      <p className="m-0 body-sm text-(--fg-secondary)">{text}</p>
    </div>
  );
}

/* ===================================================================== *
 * Detalhe da notificação
 * ===================================================================== */

function NotificationDetailModal({
  notification,
  onClose,
}: {
  notification: AppNotification | null;
  onClose: () => void;
}) {
  const n = notification;
  return (
    <AwModal
      open={n !== null}
      onClose={onClose}
      footer={
        n?.href ? (
          <>
            <AwButton size="sm" variant="ghost" onClick={onClose}>
              Fechar
            </AwButton>
            <AwButton
              asChild
              size="sm"
              variant="primary"
              iconRight="arrow_forward"
            >
              <Link href={n.href} onClick={onClose}>
                Abrir
              </Link>
            </AwButton>
          </>
        ) : (
          <AwButton size="sm" variant="ghost" onClick={onClose}>
            Fechar
          </AwButton>
        )
      }
    >
      {n && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--fg-primary) text-(--bg-canvas)">
              <Icon name={KIND_ICON[n.kind]} size={20} fill={1} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="m-0 text-base font-semibold text-(--fg-primary)">
                  {n.title}
                </h2>
                {n.critical && (
                  <AwPill variant="error" dot={false}>
                    Crítica
                  </AwPill>
                )}
              </div>
            </div>
          </div>

          <p className="m-0 body-sm text-(--fg-secondary)">{n.description}</p>

          <p className="m-0 border-t border-(--border-subtle) pt-3 body-xs text-(--fg-tertiary)">
            {KIND_LABEL[n.kind]} · {n.timeLabel}
          </p>
        </div>
      )}
    </AwModal>
  );
}
