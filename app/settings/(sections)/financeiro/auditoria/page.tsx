"use client";

import * as React from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import {
  AwDropdownMenu,
  type AwDropdownItem,
} from "@/components/ui/AwDropdownMenu";
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwFileIcon } from "@/components/ui/AwFileIcon";
import { AwInput } from "@/components/ui/AwInput";
import { AwLogo } from "@/components/ui/AwLogo";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
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
  "Crédito",
];

/** Subcategorias do filtro de tipo — "quebrado em subcategorias" como no
 *  protótipo do Genê (cmt-445e1f6a): eventos de billing/dinheiro ficam em
 *  "Financeiro"; o resto (instrumento de pagamento, etc.) em "Outros". */
const TYPE_GROUPS: { label: string; types: AuditEventType[] }[] = [
  { label: "Financeiro", types: ["Plano", "Fatura", "Crédito", "Cupom"] },
  { label: "Outros", types: ["Cartão"] },
];

/** Identidade visual por tipo de evento. Cupom e crédito ganham ícone e cor
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
  Crédito: {
    icon: "card_giftcard",
    badgeClass:
      "border-(--aw-purple-300) bg-(--aw-purple-150) text-(--aw-purple-800)",
    accentClass: "text-(--aw-purple-700)",
  },
};

const INV_PATTERN = /\bINV-\d{4}-\d{2}-\d{4}\b/;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  return (first + last).toUpperCase();
}

/** Avatar do ator. Quando quem executou foi a própria Aswork (org), mostra a
 *  marca da Aswork num tile escuro — a organização aparece no histórico como um
 *  ator de verdade (ex.: "Aswork atribuiu um crédito"), assim como a foto de um
 *  usuário aparece nas ações do cliente. Pedido do Greg (cmt-7437d212). */
function ActorAvatar({
  executor,
  actor,
  avatar,
  size = "md",
}: {
  executor: AuditExecutor;
  actor: string;
  avatar?: string;
  size?: "sm" | "md";
}) {
  if (executor === "Aswork") {
    return (
      <AwAvatar
        size={size}
        aria-label="Aswork"
        className="bg-(--bg-inverse)! text-(--fg-on-inverse)!"
      >
        <AwLogo
          variant="mark"
          height={size === "sm" ? 11 : 15}
          aria-label="Aswork"
        />
      </AwAvatar>
    );
  }
  return (
    <AwAvatar
      size={size}
      src={avatar}
      alt={actor}
      initials={getInitials(actor)}
      className={actor === "Cortex" ? "border-0!" : undefined}
    />
  );
}

function executorRole(executor: AuditExecutor, actor: string): string {
  switch (executor) {
    case "Aswork":
      // A própria organização como ator (ex.: "Aswork atribuiu um crédito")
      // não é um gerente de conta — é a Aswork agindo enquanto organização.
      return actor === "Aswork" ? "Organização" : "Gerente de conta";
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
          Atividade
        </h6>
        <p className="m-0 max-w-[520px] body-xs text-(--fg-secondary)">
          Eventos de plano, cartão, fatura, cupom e crédito — feitos por
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
        <ul className="m-0 flex flex-col gap-1 p-0">
          {filtered.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              onOpenInvoice={setOpenInvoiceId}
            />
          ))}
        </ul>
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
          placeholder="Buscar por nome, ação ou referência…"
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

/* ---------- exportar — escolha de formato + aviso LGPD + entrega por e-mail ---------- */

const EXPORT_RECIPIENT = "greg@awsales.io";

type ExportFormat = "pdf" | "csv";

const EXPORT_FORMAT_META: Record<
  ExportFormat,
  { label: string; ext: string }
> = {
  pdf: { label: "PDF", ext: "pdf" },
  csv: { label: "CSV", ext: "csv" },
};

/** Dispara o download de um arquivo placeholder no formato escolhido — em
 *  produção o backend serve o relatório real; aqui geramos um blob mínimo
 *  só para o navegador efetivar o download automático. */
function triggerExportDownload(format: ExportFormat) {
  if (typeof window === "undefined") return;
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `atividade-faturamento-${stamp}.${EXPORT_FORMAT_META[format].ext}`;
  const blob = new Blob(
    [`Relatório de atividade de faturamento — ${stamp}`],
    {
      type: format === "pdf" ? "application/pdf" : "text/csv;charset=utf-8",
    },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function ExportCsvButton() {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"confirm" | "done">("confirm");
  const [format, setFormat] = React.useState<ExportFormat>("pdf");
  const [reason, setReason] = React.useState("");
  const [consent, setConsent] = React.useState(false);

  const close = () => setOpen(false);

  const pickFormat = (next: ExportFormat) => {
    setFormat(next);
    setMode("confirm");
    setReason("");
    setConsent(false);
    setOpen(true);
  };

  // Exigir uma justificativa e o aceite explícito antes de gerar o relatório
  // com dados pessoais (LGPD / trilha de auditoria).
  const canConfirm = reason.trim().length > 0 && consent;

  const confirm = () => {
    if (!canConfirm) return;
    triggerExportDownload(format);
    setMode("done");
  };

  const formatLabel = EXPORT_FORMAT_META[format].label;

  return (
    <>
      <AwDropdownMenu
        align="end"
        aria-label="Escolher formato de exportação"
        trigger={
          <AwButton size="md" variant="ghost" iconLeft="download" iconRight="expand_more">
            Exportar
          </AwButton>
        }
        items={(["pdf", "csv"] as ExportFormat[]).map((fmt) => ({
          id: fmt,
          label: (
            <span className="inline-flex items-center gap-2.5">
              <AwFileIcon type={fmt} size="sm" />
              <span>{EXPORT_FORMAT_META[fmt].label}</span>
            </span>
          ),
          onSelect: () => pickFormat(fmt),
        }))}
      />

      <AwModal
        open={open}
        onClose={close}
        title={mode === "confirm" ? `Exportar atividade em ${formatLabel}` : undefined}
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
                onClick={confirm}
                disabled={!canConfirm}
              >
                Confirmar
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
            <p className="m-0 inline-flex items-center gap-2.5 body-xs text-(--fg-secondary)">
              <AwFileIcon type={format} size="sm" />
              <span>
                O relatório reúne todos os eventos da atividade em um{" "}
                <strong className="font-medium text-(--fg-primary)">
                  {formatLabel}
                </strong>
                , respeitando os filtros aplicados.
              </span>
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
                  relatório. Ao exportar, você assume a responsabilidade pelo
                  tratamento — LGPD e a política da sua organização valem aqui.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="export-reason"
                className="body-xs font-medium text-(--fg-primary)"
              >
                Por que você precisa deste relatório?
              </label>
              <textarea
                id="export-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex.: auditoria interna, solicitação contábil, fechamento do mês…"
                className="w-full resize-none rounded-md border border-(--border-default) bg-(--bg-raised) px-3 py-2 body-xs text-(--fg-primary) outline-hidden transition-colors placeholder:text-(--fg-tertiary) focus-visible:border-(--fg-primary) focus-visible:ring-2 focus-visible:ring-(--fg-primary) focus-visible:ring-offset-1 focus-visible:ring-offset-(--bg-raised)"
              />
              <p className="m-0 body-xs text-(--fg-tertiary)">
                A justificativa fica registrada na trilha de auditoria.
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5">
              <AwCheckbox
                checked={consent}
                onChange={setConsent}
                className="mt-0.5"
              />
              <span className="body-xs text-(--fg-secondary)">
                Confirmo que tenho base legal para exportar estes dados pessoais
                e que vou tratá-los conforme a LGPD e a política da minha
                organização.
              </span>
            </label>

            <p className="m-0 inline-flex items-center gap-2 body-xs text-(--fg-secondary)">
              <Icon name="mail" size={14} className="text-(--fg-tertiary)" />
              <span>
                O {formatLabel} é preparado em segundo plano e enviado para o
                seu e-mail pessoal{" "}
                <strong className="font-medium text-(--fg-primary)">
                  {EXPORT_RECIPIENT}
                </strong>
                . O arquivo também começa a baixar automaticamente.
              </span>
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--bg-muted) text-(--accent-success)">
              <Icon name="mark_email_read" size={26} />
            </span>
            <h6 className="m-0 text-(--fg-primary)">Relatório em preparação</h6>
            <p className="m-0 max-w-[380px] body-xs text-(--fg-secondary)">
              Estamos preparando seu relatório em{" "}
              <strong className="font-medium text-(--fg-primary)">
                {formatLabel}
              </strong>
              {" "}e ele será enviado para o seu e-mail pessoal{" "}
              <strong className="font-medium text-(--fg-primary)">
                {EXPORT_RECIPIENT}
              </strong>
              . O download no formato escolhido já começou automaticamente.
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
      items={TYPE_GROUPS.flatMap((group, gi): AwDropdownItem[] => {
        const groupTypes = group.types.filter((t) => options.includes(t));
        if (groupTypes.length === 0) return [];
        const head: AwDropdownItem[] = [];
        // Separador entre grupos (não antes do primeiro).
        if (gi > 0) head.push({ id: `sep-${group.label}`, separator: true });
        head.push({ id: `hdr-${group.label}`, isLabel: true, label: group.label });
        return [
          ...head,
          ...groupTypes.map<AwDropdownItem>((t) => {
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
          }),
        ];
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
            <ActorAvatar
              size="sm"
              executor={p.executor}
              actor={p.actor}
              avatar={p.avatar}
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

/* ---------- linha de evento — mesmo padrão das linhas de "Faturas":
 *  pill do tipo, ação + referência, data e um menu suspenso de ações. ---------- */

/** Pill por tipo de evento, espelhando o uso de pills da página de Faturas. */
function typeVariant(type: AuditEventType): AwPillVariant {
  switch (type) {
    case "Cupom":
      return "live";
    case "Crédito":
      return "ai";
    case "Fatura":
      return "info";
    case "Cartão":
      return "draft";
    case "Plano":
      return "neutral";
  }
}

function EventRow({
  event,
  onOpenInvoice,
}: {
  event: AuditEvent;
  onOpenInvoice: (id: string) => void;
}) {
  const meta = TYPE_META[event.type];
  // Fatura referenciada no meta (se existir no histórico) — habilita ações.
  const invMatch = event.meta?.match(INV_PATTERN);
  const invId =
    invMatch && INVOICE_HISTORY.some((r) => r.id === invMatch[0])
      ? invMatch[0]
      : null;

  const actions: AwDropdownItem[] = [
    ...(invId
      ? [
          {
            id: `${event.id}-invoice`,
            label: "Ver fatura",
            icon: "receipt_long",
            onSelect: () => onOpenInvoice(invId),
          },
        ]
      : []),
    {
      id: `${event.id}-copy`,
      label: "Copiar referência",
      icon: "content_copy",
      onSelect: () => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(event.meta ?? event.action);
        }
      },
    },
  ];

  return (
    <li className="m-0 list-none">
      <div className="group grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 rounded-md px-3 py-3 text-left transition-colors hover:bg-(--bg-hover)">
        <div className="flex min-w-0 items-start gap-3">
          <ActorAvatar
            executor={event.executor}
            actor={event.actor}
            avatar={event.actorAvatar}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="body-sm text-(--fg-secondary)">
                <span className="font-medium text-(--fg-primary)">
                  {event.actor}
                </span>{" "}
                {event.action}
              </span>
              <AwPill variant={typeVariant(event.type)} dot={false}>
                <Icon name={meta.icon} size={12} className={meta.accentClass} />
                {event.type}
              </AwPill>
            </div>
            {event.meta && (
              <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
                <MetaWithInvoiceLink
                  meta={event.meta}
                  onOpenInvoice={onOpenInvoice}
                />
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end whitespace-nowrap">
          <span className="body-xs tabular-nums text-(--fg-secondary)">
            {event.date} · {event.time}
          </span>
          <span className="body-xs text-(--fg-tertiary)">
            {executorRole(event.executor, event.actor)}
          </span>
        </div>

        <AwDropdownMenu
          align="end"
          trigger={
            <AwButton
              size="sm"
              variant="ghost"
              iconOnly="more_horiz"
              aria-label={`Ações de ${event.actor} · ${event.action}`}
            />
          }
          items={actions}
        />
      </div>
    </li>
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
