"use client";

import * as React from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import { InvoiceDetailsSheet } from "../_components/InvoiceDetailsSheet";
import {
  AUDIT_EVENTS,
  INVOICE_HISTORY,
  type AuditEvent,
  type AuditEventType,
  type AuditExecutor,
} from "../_components/data";

const ALL_TYPES: AuditEventType[] = [
  "Plano",
  "Cartão",
  "Fatura",
  "Cupom",
  "Voucher",
];

/** Identidade visual por tipo de evento. Cupom e voucher ganham ícone e cor
 *  próprios para saltarem aos olhos no histórico; o resto fica neutro. */
const TYPE_META: Record<
  AuditEventType,
  { icon: string; badgeClass: string; accentClass?: string }
> = {
  Plano: {
    icon: "workspace_premium",
    badgeClass:
      "border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)",
  },
  Cartão: {
    icon: "credit_card",
    badgeClass:
      "border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)",
  },
  Fatura: {
    icon: "receipt_long",
    badgeClass:
      "border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)",
  },
  Cupom: {
    icon: "local_offer",
    badgeClass:
      "border-(--aw-emerald-300) bg-(--aw-emerald-100) text-(--aw-emerald-800)",
    accentClass: "text-(--aw-emerald-700)",
  },
  Voucher: {
    icon: "card_giftcard",
    badgeClass:
      "border-(--aw-purple-300) bg-(--aw-purple-150) text-(--aw-purple-800)",
    accentClass: "text-(--aw-purple-700)",
  },
};

function TypeBadge({ type }: { type: AuditEventType }) {
  const meta = TYPE_META[type];
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 body-xs font-medium " +
        meta.badgeClass
      }
    >
      <Icon name={meta.icon} size={13} />
      {type}
    </span>
  );
}

const INV_PATTERN = /\bINV-\d{4}-\d{2}-\d{4}\b/;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  return (first + last).toUpperCase();
}

function executorRole(executor: AuditExecutor): string {
  switch (executor) {
    case "Aswork":
      return "Account Manager";
    case "Cliente":
      return "Usuário";
  }
}

type Person = {
  actor: string;
  avatar?: string;
  executor: AuditExecutor;
};

/** Unique people who appear as actors in the audit log — used to populate
 *  the executor filter as a list of real people instead of abstract
 *  category buckets. Order: Aswork first, then Cliente. */
function buildPeople(events: AuditEvent[]): Person[] {
  const seen = new Map<string, Person>();
  for (const e of events) {
    if (!seen.has(e.actor)) {
      seen.set(e.actor, { actor: e.actor, avatar: e.actorAvatar, executor: e.executor });
    }
  }
  const order: AuditExecutor[] = ["Aswork", "Cliente"];
  return Array.from(seen.values()).sort((a, b) => {
    const ai = order.indexOf(a.executor);
    const bi = order.indexOf(b.executor);
    if (ai !== bi) return ai - bi;
    return a.actor.localeCompare(b.actor, "pt-BR");
  });
}

const ALL_PEOPLE: Person[] = buildPeople(AUDIT_EVENTS);
const ALL_ACTOR_NAMES: string[] = ALL_PEOPLE.map((p) => p.actor);

export default function AuditoriaPage() {
  const [selectedTypes, setSelectedTypes] = React.useState<AuditEventType[]>(
    ALL_TYPES,
  );
  const [selectedActors, setSelectedActors] =
    React.useState<string[]>(ALL_ACTOR_NAMES);
  const [query, setQuery] = React.useState("");
  const [openInvoiceId, setOpenInvoiceId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return AUDIT_EVENTS.filter((e) => {
      if (!selectedTypes.includes(e.type)) return false;
      if (!selectedActors.includes(e.actor)) return false;
      if (
        q &&
        !`${e.actor} ${e.action} ${e.meta ?? ""}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [selectedTypes, selectedActors, query]);

  const openInvoice = React.useMemo(
    () =>
      openInvoiceId
        ? (INVOICE_HISTORY.find((r) => r.id === openInvoiceId) ?? null)
        : null,
    [openInvoiceId],
  );

  const clearAll = () => {
    setSelectedTypes(ALL_TYPES);
    setSelectedActors(ALL_ACTOR_NAMES);
    setQuery("");
  };

  const hasFilters =
    selectedTypes.length !== ALL_TYPES.length ||
    selectedActors.length !== ALL_ACTOR_NAMES.length ||
    query.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h6 className="m-0 mb-1 text-(--fg-primary)">
          Histórico de atividades
        </h6>
        <p className="m-0 max-w-[520px] body-xs text-(--fg-secondary)">
          Eventos de plano, cartão, fatura, cupom e voucher — feitos por
          Aswork ou cliente.
        </p>
      </section>

      <Toolbar
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        selectedActors={selectedActors}
        onActorsChange={setSelectedActors}
        query={query}
        onQueryChange={setQuery}
        onClearAll={clearAll}
        hasFilters={hasFilters}
      />

      {filtered.length === 0 ? (
        <AwCard className="p-0!">
          <div className="px-6 py-10">
            <AwEmpty>
              <AwEmptyHeader>
                <AwEmptyMedia variant="icon">
                  <Icon name="search_off" size={20} />
                </AwEmptyMedia>
                <AwEmptyTitle>Nenhum evento encontrado</AwEmptyTitle>
                <AwEmptyDescription>
                  Ajuste os filtros ou tente outro termo.
                </AwEmptyDescription>
              </AwEmptyHeader>
            </AwEmpty>
          </div>
        </AwCard>
      ) : (
        <AwCard className="p-0!">
          <AwTable>
            <tbody>
              {filtered.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  onOpenInvoice={setOpenInvoiceId}
                />
              ))}
            </tbody>
          </AwTable>
        </AwCard>
      )}

      <InvoiceDetailsSheet
        invoice={openInvoice}
        open={openInvoice !== null}
        onClose={() => setOpenInvoiceId(null)}
      />
    </div>
  );
}

/* ---------- toolbar ---------- */

function Toolbar({
  selectedTypes,
  onTypesChange,
  selectedActors,
  onActorsChange,
  query,
  onQueryChange,
  onClearAll,
  hasFilters,
}: {
  selectedTypes: AuditEventType[];
  onTypesChange: (v: AuditEventType[]) => void;
  selectedActors: string[];
  onActorsChange: (v: string[]) => void;
  query: string;
  onQueryChange: (v: string) => void;
  onClearAll: () => void;
  hasFilters: boolean;
}) {
  const toggleType = (t: AuditEventType) => {
    onTypesChange(
      selectedTypes.includes(t)
        ? selectedTypes.filter((x) => x !== t)
        : [...selectedTypes, t],
    );
  };

  const toggleActor = (a: string) => {
    onActorsChange(
      selectedActors.includes(a)
        ? selectedActors.filter((x) => x !== a)
        : [...selectedActors, a],
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-[240px] flex-1">
        <AwInput
          iconLeft="search"
          placeholder="Buscar ator, ação ou referência…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
      <ActorFilterMenu
        people={ALL_PEOPLE}
        selected={selectedActors}
        onToggle={toggleActor}
      />
      <TypeFilterMenu
        options={ALL_TYPES}
        selected={selectedTypes}
        onToggle={toggleType}
      />
      {hasFilters && (
        <AwButton
          size="sm"
          variant="ghost"
          iconLeft="close"
          onClick={onClearAll}
        >
          Limpar
        </AwButton>
      )}
      <ExportCsvButton />
    </div>
  );
}

/* ---------- exportar CSV — aviso LGPD + entrega por e-mail ---------- */

const EXPORT_RECIPIENT = "greg@awsales.io";

function ExportCsvButton() {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"confirm" | "done">("confirm");

  const close = () => setOpen(false);

  return (
    <>
      <AwButton
        size="md"
        variant="ghost"
        iconLeft="download"
        onClick={() => {
          setMode("confirm");
          setOpen(true);
        }}
      >
        Exportar CSV
      </AwButton>

      <AwModal
        open={open}
        onClose={close}
        title={mode === "confirm" ? "Exportar histórico" : undefined}
        footer={
          mode === "confirm" ? (
            <>
              <AwButton size="sm" variant="ghost" onClick={close}>
                Cancelar
              </AwButton>
              <AwButton
                size="sm"
                variant="primary"
                iconLeft="outgoing_mail"
                onClick={() => setMode("done")}
              >
                Gerar relatório
              </AwButton>
            </>
          ) : (
            <AwButton size="sm" variant="primary" onClick={close}>
              Fechar
            </AwButton>
          )
        }
      >
        {mode === "confirm" ? (
          <div className="flex flex-col gap-4">
            <p className="m-0 body-xs text-(--fg-secondary)">
              O relatório reúne todos os eventos do histórico em um CSV,
              respeitando os filtros aplicados.
            </p>

            <div className="flex items-start gap-3 rounded-md border border-(--border-subtle) bg-(--bg-muted) px-4 py-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-(--bg-raised) text-(--fg-primary)">
                <Icon name="shield_lock" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 body-xs font-medium text-(--fg-primary)">
                  Este arquivo contém dados pessoais
                </p>
                <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                  Nomes e ações de quem mexeu no faturamento aparecem no
                  relatório. Ao exportar, você se responsabiliza por tratar
                  esses dados conforme a LGPD e a política de privacidade da
                  sua organização.
                </p>
              </div>
            </div>

            <p className="m-0 inline-flex items-center gap-2 body-xs text-(--fg-secondary)">
              <Icon name="mail" size={14} className="text-(--fg-tertiary)" />
              <span>
                O CSV é gerado em segundo plano e enviado para{" "}
                <strong className="font-medium text-(--fg-primary)">
                  {EXPORT_RECIPIENT}
                </strong>
                {" "}— nada é baixado agora.
              </span>
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--bg-muted) text-(--accent-success)">
              <Icon name="mark_email_read" size={26} />
            </span>
            <h6 className="m-0 text-(--fg-primary)">Relatório em geração</h6>
            <p className="m-0 max-w-[360px] body-xs text-(--fg-secondary)">
              Em alguns minutos você recebe o CSV em{" "}
              <strong className="font-medium text-(--fg-primary)">
                {EXPORT_RECIPIENT}
              </strong>
              . Pode fechar esta janela — o processo segue sozinho.
            </p>
          </div>
        )}
      </AwModal>
    </>
  );
}

function TypeFilterMenu({
  options,
  selected,
  onToggle,
}: {
  options: AuditEventType[];
  selected: AuditEventType[];
  onToggle: (t: AuditEventType) => void;
}) {
  const count = selected.length;
  return (
    <AwDropdownMenu
      align="start"
      trigger={
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-(--border-subtle) bg-(--bg-raised) px-3 body-xs font-medium text-(--fg-secondary) transition-colors duration-aw-fast hover:border-(--border-default) hover:text-(--fg-primary)"
        >
          <Icon name="sell" size={16} />
          <span>Tipo{count > 0 ? ` · ${count}` : ""}</span>
          <Icon name="expand_more" size={16} />
        </button>
      }
      items={options.map((t) => {
        const meta = TYPE_META[t];
        return {
          id: t,
          label: (
            <span className="inline-flex items-center gap-2">
              <Icon name={meta.icon} size={15} className={meta.accentClass} />
              <span>{t}</span>
            </span>
          ),
          checked: selected.includes(t),
          closeOnSelect: false,
          onSelect: () => onToggle(t),
        };
      })}
    />
  );
}

function ActorFilterMenu({
  people,
  selected,
  onToggle,
}: {
  people: Person[];
  selected: string[];
  onToggle: (a: string) => void;
}) {
  const count = selected.length;
  return (
    <AwDropdownMenu
      align="start"
      trigger={
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-(--border-subtle) bg-(--bg-raised) px-3 body-xs font-medium text-(--fg-secondary) transition-colors duration-aw-fast hover:border-(--border-default) hover:text-(--fg-primary)"
        >
          <Icon name="person" size={16} />
          <span>Executor{count > 0 ? ` · ${count}` : ""}</span>
          <Icon name="expand_more" size={16} />
        </button>
      }
      items={people.map((p) => ({
        id: p.actor,
        label: (
          <span className="inline-flex items-center gap-2">
            <AwAvatar
              size="sm"
              src={p.avatar}
              alt={p.actor}
              initials={getInitials(p.actor)}
              className={p.actor === "Cortex" ? "border-0!" : undefined}
            />
            <span>{p.actor}</span>
          </span>
        ),
        checked: selected.includes(p.actor),
        closeOnSelect: false,
        onSelect: () => onToggle(p.actor),
      }))}
    />
  );
}

/* ---------- table row ---------- */

function EventRow({
  event,
  onOpenInvoice,
}: {
  event: AuditEvent;
  onOpenInvoice: (id: string) => void;
}) {
  const isCortex = event.actor === "Cortex";
  return (
    <tr>
      <td>
        <span className="inline-flex items-start gap-3">
          <AwAvatar
            size="md"
            src={event.actorAvatar}
            alt={event.actor}
            initials={getInitials(event.actor)}
            className={isCortex ? "border-0!" : undefined}
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="body-sm text-(--fg-secondary)">
              <span className="font-medium text-(--fg-primary)">
                {event.actor}
              </span>{" "}
              {event.action}
            </span>
            {event.meta && (
              <p className="m-0 body-xs text-(--fg-tertiary)">
                <MetaWithInvoiceLink
                  meta={event.meta}
                  onOpenInvoice={onOpenInvoice}
                />
              </p>
            )}
          </span>
        </span>
      </td>
      <td className="align-top">
        <TypeBadge type={event.type} />
      </td>
      <td className="text-right align-top">
        <div className="flex flex-col items-end">
          <span className="body-xs tabular-nums text-(--fg-secondary)">
            {event.date} · {event.time}
          </span>
          <span className="body-xs text-(--fg-tertiary)">
            {executorRole(event.executor)}
          </span>
        </div>
      </td>
    </tr>
  );
}

/** Renders the event meta string with any "INV-YYYY-MM-NNNN" reference
 *  upgraded to a clickable link that opens the invoice details sheet —
 *  but only when the invoice id exists in INVOICE_HISTORY. Unknown ids
 *  fall back to plain text so we never offer a dead link. */
function MetaWithInvoiceLink({
  meta,
  onOpenInvoice,
}: {
  meta: string;
  onOpenInvoice: (id: string) => void;
}) {
  const match = meta.match(INV_PATTERN);
  if (!match) return <>{meta}</>;
  const invId = match[0];
  const exists = INVOICE_HISTORY.some((r) => r.id === invId);
  if (!exists) return <>{meta}</>;
  const [before, after] = meta.split(invId);
  return (
    <>
      {before}
      <button
        type="button"
        onClick={() => onOpenInvoice(invId)}
        className="font-medium text-(--fg-primary) underline decoration-dotted underline-offset-2 transition-colors duration-aw-fast hover:text-(--accent-brand) hover:no-underline"
      >
        {invId}
      </button>
      {after}
    </>
  );
}
