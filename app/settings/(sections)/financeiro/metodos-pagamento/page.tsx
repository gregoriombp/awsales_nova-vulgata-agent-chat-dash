"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCardBrand, type AwCardBrandId } from "@/components/ui/AwCardBrand";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwEmpty, AwEmptyDescription, AwEmptyHeader, AwEmptyMedia, AwEmptyTitle } from "@/components/ui/AwEmpty";
import { AwField } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { AddPaymentMethodModal } from "../_components/AddPaymentMethodModal";
import {
  BILLING_PROFILE,
  PAYMENT_METHODS,
  type CardBrand,
  type PaymentMethod,
} from "../_components/data";

const BRAND_TO_AW: Record<CardBrand, AwCardBrandId> = {
  Visa: "visa",
  Mastercard: "mastercard",
  Amex: "amex",
};

function expiryYear(expiresAt: string): number {
  const [, y] = expiresAt.split("/").map(Number);
  return y;
}

function isExpiringSoon(expiresAt: string): boolean {
  const [m, y] = expiresAt.split("/").map(Number);
  if (!m || !y) return false;
  const expiry = new Date(y, m - 1, 1);
  const horizon = new Date();
  horizon.setMonth(horizon.getMonth() + 3);
  return expiry.getTime() <= horizon.getTime();
}

export default function MetodosPagamentoPage() {
  const [methods, setMethods] = React.useState<PaymentMethod[]>(PAYMENT_METHODS);
  const [addOpen, setAddOpen] = React.useState(false);
  const [pendingRemoveId, setPendingRemoveId] = React.useState<string | null>(
    null,
  );

  const pendingRemove =
    pendingRemoveId === null
      ? null
      : (methods.find((m) => m.id === pendingRemoveId) ?? null);

  const setAsDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const confirmRemove = () => {
    if (pendingRemoveId === null) return;
    setMethods((prev) => {
      const next = prev.filter((m) => m.id !== pendingRemoveId);
      const hadDefault = prev.find((m) => m.id === pendingRemoveId)?.isDefault;
      if (hadDefault && next.length > 0) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
    setPendingRemoveId(null);
  };

  const addCard = (asDefault: boolean) => {
    setMethods((prev) => {
      const id = `pm-${Date.now()}`;
      const fresh: PaymentMethod = {
        id,
        brand: "Visa",
        last4: String(Math.floor(1000 + Math.random() * 9000)),
        expiresAt: "12/2030",
        isDefault: asDefault || prev.length === 0,
      };
      const cleared = asDefault
        ? prev.map((m) => ({ ...m, isDefault: false }))
        : prev;
      return [...cleared, fresh];
    });
    setAddOpen(false);
  };

  // Default first, others below.
  const ordered = React.useMemo(() => {
    const def = methods.find((m) => m.isDefault);
    const rest = methods.filter((m) => !m.isDefault);
    return def ? [def, ...rest] : methods;
  }, [methods]);

  const canRemoveAny = methods.length > 1;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h6 className="m-0 mb-1 text-(--fg-primary)">
            Métodos de pagamento
          </h6>
          <p className="m-0 max-w-[560px] body-xs text-(--fg-secondary)">
            Cartões e formas de cobrança aceitos por esta organização. As
            cobranças tentam primeiro o método marcado como padrão.
          </p>
        </div>
        <AwButton
          size="md"
          variant="primary"
          iconLeft="add"
          onClick={() => setAddOpen(true)}
        >
          Adicionar método
        </AwButton>
      </header>

      {methods.length === 0 ? (
        <EmptyState onAdd={() => setAddOpen(true)} />
      ) : (
        <ul className="m-0 flex flex-col border-y border-(--border-subtle) p-0">
          {ordered.map((m, i) => (
            <li
              key={m.id}
              className={
                "m-0 list-none " +
                (i > 0 ? "border-t border-(--border-subtle)" : "")
              }
            >
              <MethodRow
                method={m}
                canRemove={canRemoveAny}
                onSetDefault={() => setAsDefault(m.id)}
                onRemoveRequest={() => setPendingRemoveId(m.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <BillingInfoSection />

      <AddPaymentMethodModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addCard}
      />

      <RemovePaymentMethodModal
        method={pendingRemove}
        onClose={() => setPendingRemoveId(null)}
        onConfirm={confirmRemove}
      />
    </div>
  );
}

/* -----------------------------------------------------------------
 * Flat list row — brand logo + label + Padrão pill + expiry + menu
 * ----------------------------------------------------------------- */

function MethodRow({
  method,
  canRemove,
  onSetDefault,
  onRemoveRequest,
}: {
  method: PaymentMethod;
  canRemove: boolean;
  onSetDefault: () => void;
  onRemoveRequest: () => void;
}) {
  const expiringSoon = isExpiringSoon(method.expiresAt);
  const expired = expiryYear(method.expiresAt) < new Date().getFullYear();

  return (
    <div className="flex items-center gap-4 py-4">
      <AwCardBrand brand={BRAND_TO_AW[method.brand]} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="m-0 body-sm font-medium tabular-nums text-(--fg-primary)">
            {method.brand} •••• {method.last4}
          </p>
          {method.isDefault && (
            <AwPill variant="live" dot={false}>
              Padrão
            </AwPill>
          )}
          {expired ? (
            <AwPill variant="error" dot={false}>
              Expirado
            </AwPill>
          ) : expiringSoon ? (
            <AwPill variant="warning" dot={false}>
              Expira em breve
            </AwPill>
          ) : null}
        </div>
        <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
          Expira em {method.expiresAt}
        </p>
      </div>

      <AwDropdownMenu
        align="end"
        trigger={
          <AwButton
            size="sm"
            variant="ghost"
            iconOnly="more_horiz"
            aria-label={`Opções de ${method.brand} •••• ${method.last4}`}
          />
        }
        items={[
          {
            id: `${method.id}-default`,
            label: "Definir como padrão",
            icon: "check_circle",
            disabled: method.isDefault,
            onSelect: onSetDefault,
          },
          {
            id: `${method.id}-edit`,
            label: "Editar dados",
            icon: "edit",
            onSelect: () => {},
          },
          { id: `${method.id}-sep`, separator: true },
          {
            id: `${method.id}-remove`,
            label: "Remover método",
            icon: "delete",
            danger: true,
            disabled: !canRemove,
            onSelect: onRemoveRequest,
          },
        ]}
      />
    </div>
  );
}

/* -----------------------------------------------------------------
 * Billing info — dados de faturamento usados na nota fiscal.
 * Os dados fiscais vêm do contrato (somente leitura); o cliente só
 * gerencia quem recebe as faturas por e-mail.
 * ----------------------------------------------------------------- */

const VISIBLE_RECIPIENTS = 5;

function BillingInfoSection() {
  const { legalName, taxId, stateRegistration, address } = BILLING_PROFILE;
  const [recipients, setRecipients] = React.useState<string[]>(
    BILLING_PROFILE.billingRecipients,
  );
  const [showAll, setShowAll] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const fullAddress = [
    address.line1,
    address.line2,
    `${address.city} · ${address.state} · ${address.zip}`,
    address.country,
  ].filter(Boolean);

  const visible = showAll
    ? recipients
    : recipients.slice(0, VISIBLE_RECIPIENTS);
  const hiddenCount = recipients.length - visible.length;

  const removeRecipient = (target: string) => {
    setRecipients((prev) =>
      prev.length > 1 ? prev.filter((e) => e !== target) : prev,
    );
  };

  return (
    <section className="flex flex-col gap-5 border-t border-(--border-subtle) pt-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h6 className="m-0 mb-1 text-(--fg-primary)">
            Informações de faturamento
          </h6>
          <p className="m-0 max-w-[560px] body-xs text-(--fg-secondary)">
            Dados usados na emissão da nota fiscal e no envio das cobranças.
          </p>
        </div>
        <AwButton
          size="sm"
          variant="secondary"
          iconLeft="edit"
          onClick={() => setEditOpen(true)}
        >
          Editar dados
        </AwButton>
      </header>

      <dl className="m-0 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
        <BillingField label="Razão social" value={legalName} />
        <BillingField label="CNPJ" value={taxId} tabular />
        <BillingField label="Inscrição estadual" value={stateRegistration} />
        <div className="min-w-0">
          <dt className="m-0 mb-1 aw-eyebrow text-(--fg-tertiary)">
            E-mails de faturamento · {recipients.length}
          </dt>
          <dd className="m-0">
            <ul className="m-0 flex list-none flex-col p-0">
              {visible.map((email) => (
                <li
                  key={email}
                  className="group -mx-1.5 flex items-center gap-2 rounded-sm px-1.5 py-1 transition-colors duration-aw-fast hover:bg-(--bg-hover)"
                >
                  <span className="min-w-0 flex-1 truncate body-sm text-(--fg-primary)">
                    {email}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remover ${email} dos destinatários`}
                    disabled={recipients.length === 1}
                    onClick={() => removeRecipient(email)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-xs text-(--fg-tertiary) opacity-0 transition-opacity duration-aw-fast hover:bg-(--bg-muted) hover:text-(--fg-primary) focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-0"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </li>
              ))}
            </ul>
            {(hiddenCount > 0 || showAll) && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="mt-1 body-xs font-medium text-(--fg-secondary) underline decoration-dotted underline-offset-2 transition-colors duration-aw-fast hover:text-(--fg-primary) hover:no-underline"
              >
                {showAll ? "Ver menos" : `Ver mais (+${hiddenCount})`}
              </button>
            )}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="m-0 mb-1 aw-eyebrow text-(--fg-tertiary)">
            Endereço
          </dt>
          <dd className="m-0 flex flex-col gap-0.5 body-sm text-(--fg-primary)">
            {fullAddress.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </dd>
        </div>
      </dl>

      <EditBillingModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        recipients={recipients}
        onSave={(next) => {
          setRecipients(next);
          setEditOpen(false);
        }}
      />
    </section>
  );
}

/* -----------------------------------------------------------------
 * Edit billing modal — dados fiscais travados em contrato; só o
 * e-mail de faturamento é editável.
 * ----------------------------------------------------------------- */

function EditBillingModal({
  open,
  onClose,
  recipients,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  recipients: string[];
  onSave: (next: string[]) => void;
}) {
  const { legalName, taxId, stateRegistration } = BILLING_PROFILE;
  const [draft, setDraft] = React.useState<string[]>(recipients);
  const [input, setInput] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setDraft(recipients);
      setInput("");
    }
  }, [open, recipients]);

  const commitInput = () => {
    const value = input.trim().replace(/,$/, "").trim();
    if (!value || draft.includes(value)) {
      setInput("");
      return;
    }
    setDraft([...draft, value]);
    setInput("");
  };

  const lockedRows = [
    { label: "Razão social", value: legalName },
    { label: "CNPJ", value: taxId },
    { label: "Inscrição estadual", value: stateRegistration },
  ];

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Editar dados de faturamento"
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton
            size="sm"
            variant="primary"
            iconLeft="check"
            disabled={draft.length === 0}
            onClick={() => onSave(draft)}
          >
            Salvar alterações
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <p className="m-0 body-xs text-(--fg-secondary)">
          Os dados fiscais são definidos em contrato — para alterar, abra um
          chamado com seu Account Manager. Por aqui, você gerencia apenas quem
          recebe as faturas.
        </p>

        <div className="overflow-hidden rounded-md border border-(--border-subtle)">
          {lockedRows.map((row, i) => (
            <div
              key={row.label}
              className={
                "flex items-center gap-3 bg-(--bg-muted) px-4 py-2.5" +
                (i > 0 ? " border-t border-(--border-subtle)" : "")
              }
            >
              <span className="w-[140px] shrink-0 body-xs text-(--fg-tertiary)">
                {row.label}
              </span>
              <span className="min-w-0 flex-1 truncate body-xs font-medium text-(--fg-primary)">
                {row.value}
              </span>
              <span
                className="text-(--fg-tertiary)"
                title="Campo somente leitura — definido em contrato"
              >
                <Icon name="lock" size={14} />
              </span>
            </div>
          ))}
        </div>

        <AwField
          label="E-mails de faturamento"
          htmlFor="billing-emails"
          helper="Digite o e-mail e aperte Enter para adicionar."
        >
          <div className="aw-input h-auto! min-h-[42px] items-start py-1">
            <Icon
              name="mail"
              size={16}
              className="mt-[7px] shrink-0 text-(--fg-tertiary)"
            />
            <div className="flex flex-1 flex-wrap items-center gap-1.5 py-1">
              {draft.map((email) => (
                <span
                  key={email}
                  className="inline-flex max-w-full items-center gap-1 rounded-sm bg-(--bg-muted) px-2 py-1 body-xs text-(--fg-primary)"
                >
                  <span className="truncate">{email}</span>
                  <button
                    type="button"
                    aria-label={`Remover ${email}`}
                    onClick={() =>
                      setDraft(draft.filter((e) => e !== email))
                    }
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-xs text-(--fg-tertiary) hover:bg-(--bg-surface) hover:text-(--fg-primary)"
                  >
                    <Icon name="close" size={12} />
                  </button>
                </span>
              ))}
              <input
                id="billing-emails"
                type="email"
                className="min-w-[180px] flex-1 border-0 bg-transparent p-0 body-xs text-(--fg-primary) outline-hidden placeholder:text-(--fg-tertiary)"
                placeholder={draft.length === 0 ? "nome@empresa.com.br" : ""}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    commitInput();
                  } else if (
                    e.key === "Backspace" &&
                    input.length === 0 &&
                    draft.length > 0
                  ) {
                    setDraft(draft.slice(0, -1));
                  }
                }}
                onBlur={commitInput}
              />
            </div>
          </div>
        </AwField>
      </div>
    </AwModal>
  );
}

function BillingField({
  label,
  value,
  tabular = false,
}: {
  label: string;
  value: string;
  tabular?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="m-0 mb-1 aw-eyebrow text-(--fg-tertiary)">{label}</dt>
      <dd
        className={
          "m-0 body-sm text-(--fg-primary) " +
          (tabular ? "tabular-nums" : "")
        }
      >
        {value}
      </dd>
    </div>
  );
}

/* -----------------------------------------------------------------
 * Empty state
 * ----------------------------------------------------------------- */

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border-y border-(--border-subtle) py-12">
      <AwEmpty>
        <AwEmptyHeader>
          <AwEmptyMedia variant="icon">
            <Icon name="credit_card_off" size={22} />
          </AwEmptyMedia>
          <AwEmptyTitle>Nenhum método cadastrado</AwEmptyTitle>
          <AwEmptyDescription>
            Adicione um cartão ou outra forma de cobrança pra começar.
          </AwEmptyDescription>
        </AwEmptyHeader>
        <div className="mt-3">
          <AwButton size="sm" variant="primary" iconLeft="add" onClick={onAdd}>
            Adicionar método
          </AwButton>
        </div>
      </AwEmpty>
    </div>
  );
}

/* -----------------------------------------------------------------
 * Remove confirmation modal
 * ----------------------------------------------------------------- */

function RemovePaymentMethodModal({
  method,
  onClose,
  onConfirm,
}: {
  method: PaymentMethod | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AwModal
      open={method !== null}
      onClose={onClose}
      title="Remover método de pagamento"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AwButton variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton variant="danger" iconLeft="delete" onClick={onConfirm}>
            Remover
          </AwButton>
        </div>
      }
    >
      {method && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-md border border-(--border-subtle) bg-(--bg-raised) px-3 py-2">
            <AwCardBrand brand={BRAND_TO_AW[method.brand]} size="md" />
            <div className="min-w-0 flex-1">
              <p className="m-0 body-xs font-medium tabular-nums text-(--fg-primary)">
                {method.brand} •••• {method.last4}
              </p>
              <p className="m-0 body-xs text-(--fg-tertiary)">
                Expira em {method.expiresAt}
              </p>
            </div>
            {method.isDefault && (
              <AwPill variant="live" dot={false}>
                Padrão
              </AwPill>
            )}
          </div>
          <p className="m-0 body-xs text-(--fg-primary)">
            Você está prestes a remover este método das formas de cobrança da
            organização.
          </p>
          {method.isDefault && (
            <p className="m-0 body-xs text-(--accent-warning)">
              Este é o método padrão. Depois da remoção, o próximo da lista
              vira o padrão automaticamente.
            </p>
          )}
        </div>
      )}
    </AwModal>
  );
}
