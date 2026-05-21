"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCardBrand, type AwCardBrandId } from "@/components/ui/AwCardBrand";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwEmpty, AwEmptyDescription, AwEmptyHeader, AwEmptyMedia, AwEmptyTitle } from "@/components/ui/AwEmpty";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { AddPaymentMethodModal } from "../_components/AddPaymentMethodModal";
import {
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

type FiscalProfile = {
  legalName: string;
  taxId: string;
  email: string;
  address: string;
};

const FISCAL_PROFILE: FiscalProfile = {
  legalName: "AwSales Tecnologia Ltda.",
  taxId: "52.314.987/0001-04",
  email: "financeiro@awsales.io",
  address: "Av. Brigadeiro Faria Lima, 3477 — 14º — São Paulo / SP — 04538-133",
};

export default function MetodosPagamentoPage() {
  const [methods, setMethods] = React.useState<PaymentMethod[]>(PAYMENT_METHODS);
  const [addOpen, setAddOpen] = React.useState(false);
  const [pendingRemoveId, setPendingRemoveId] = React.useState<string | null>(
    null,
  );

  const primary = methods.find((m) => m.isDefault) ?? methods[0] ?? null;
  const alternates = methods.filter((m) => m.id !== primary?.id);

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

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h6 className="m-0 mb-1 text-[var(--fg-primary)]">
            Métodos de pagamento
          </h6>
          <p className="m-0 max-w-[560px] body-xs text-[var(--fg-secondary)]">
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <PaymentMethodsColumn
            primary={primary}
            alternates={alternates}
            canRemoveAny={methods.length > 1}
            onSetDefault={setAsDefault}
            onRemoveRequest={setPendingRemoveId}
            onAdd={() => setAddOpen(true)}
          />
          <FiscalDataCard profile={FISCAL_PROFILE} />
        </div>
      )}

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
 * Left column — primary hero + alternates + add row
 * ----------------------------------------------------------------- */

function PaymentMethodsColumn({
  primary,
  alternates,
  canRemoveAny,
  onSetDefault,
  onRemoveRequest,
  onAdd,
}: {
  primary: PaymentMethod | null;
  alternates: PaymentMethod[];
  canRemoveAny: boolean;
  onSetDefault: (id: string) => void;
  onRemoveRequest: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <section className="flex flex-col gap-5">
      {primary && (
        <PrimaryCard
          method={primary}
          canRemove={canRemoveAny}
          onRemoveRequest={() => onRemoveRequest(primary.id)}
        />
      )}

      {alternates.length > 0 && (
        <div>
          <header className="mb-2">
            <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
              Métodos alternativos
            </p>
            <p className="m-0 mt-0.5 body-xs text-[var(--fg-secondary)]">
              Usados como fallback se o método padrão falhar.
            </p>
          </header>
          <ul className="m-0 flex flex-col p-0">
            {alternates.map((m, i) => (
              <li
                key={m.id}
                className={
                  "m-0 list-none border-[var(--border-subtle)] " +
                  (i === 0 ? "border-y" : "border-b")
                }
              >
                <AlternateRow
                  method={m}
                  canRemove={canRemoveAny}
                  onSetDefault={() => onSetDefault(m.id)}
                  onRemoveRequest={() => onRemoveRequest(m.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <AwButton
        size="md"
        variant="ghost"
        iconLeft="add"
        onClick={onAdd}
        className="self-start"
      >
        Adicionar novo método
      </AwButton>
    </section>
  );
}

/* -----------------------------------------------------------------
 * Primary card — hero treatment for the default method
 * ----------------------------------------------------------------- */

function PrimaryCard({
  method,
  canRemove,
  onRemoveRequest,
}: {
  method: PaymentMethod;
  canRemove: boolean;
  onRemoveRequest: () => void;
}) {
  const expiringSoon = isExpiringSoon(method.expiresAt);
  const expired = expiryYear(method.expiresAt) < new Date().getFullYear();

  return (
    <article className="relative flex flex-col gap-6 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-3">
          <AwPill variant="live" dot={false}>
            Padrão
          </AwPill>
          <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
            Método principal
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

      <div className="flex items-center gap-4">
        <AwCardBrand brand={BRAND_TO_AW[method.brand]} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="m-0 body-md font-medium tabular-nums text-[var(--fg-primary)]">
            {method.brand} •••• {method.last4}
          </p>
          <p className="m-0 mt-1 body-xs text-[var(--fg-tertiary)]">
            Expira em {method.expiresAt}
          </p>
        </div>
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
    </article>
  );
}

/* -----------------------------------------------------------------
 * Alternate row — compact, flat list item
 * ----------------------------------------------------------------- */

function AlternateRow({
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
    <div className="flex items-center gap-4 py-3">
      <AwCardBrand brand={BRAND_TO_AW[method.brand]} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="m-0 body-sm font-medium tabular-nums text-[var(--fg-primary)]">
            {method.brand} •••• {method.last4}
          </p>
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
        <p className="m-0 mt-0.5 body-xs text-[var(--fg-tertiary)]">
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
 * Right column — fiscal billing data
 * ----------------------------------------------------------------- */

function FiscalDataCard({ profile }: { profile: FiscalProfile }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
            Dados fiscais
          </p>
          <p className="m-0 mt-1 body-sm font-medium text-[var(--fg-primary)]">
            Faturamento
          </p>
          <p className="m-0 mt-1 body-xs text-[var(--fg-secondary)]">
            Aparecem em todas as notas fiscais e recibos emitidos.
          </p>
        </div>
        <AwButton
          size="sm"
          variant="ghost"
          iconLeft="edit"
          onClick={() => {}}
        >
          Alterar
        </AwButton>
      </header>

      <dl className="m-0 flex flex-col">
        <FiscalField label="Razão social" value={profile.legalName} />
        <FiscalField label="CNPJ" value={profile.taxId} mono />
        <FiscalField label="E-mail financeiro" value={profile.email} />
        <FiscalField label="Endereço" value={profile.address} last />
      </dl>
    </section>
  );
}

function FiscalField({
  label,
  value,
  mono,
  last,
}: {
  label: string;
  value: string;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={
        "grid grid-cols-[140px_minmax(0,1fr)] gap-4 py-2.5 " +
        (last ? "" : "border-b border-[var(--border-subtle)]")
      }
    >
      <dt className="m-0 body-xs text-[var(--fg-tertiary)]">{label}</dt>
      <dd
        className={
          "m-0 body-sm text-[var(--fg-primary)] " +
          (mono ? "tabular-nums" : "")
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
    <div className="border-y border-[var(--border-subtle)] py-12">
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
          <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-3 py-2">
            <AwCardBrand brand={BRAND_TO_AW[method.brand]} size="md" />
            <div className="min-w-0 flex-1">
              <p className="m-0 body-xs font-medium tabular-nums text-[var(--fg-primary)]">
                {method.brand} •••• {method.last4}
              </p>
              <p className="m-0 body-xs text-[var(--fg-tertiary)]">
                Expira em {method.expiresAt}
              </p>
            </div>
            {method.isDefault && (
              <AwPill variant="live" dot={false}>
                Padrão
              </AwPill>
            )}
          </div>
          <p className="m-0 body-xs text-[var(--fg-primary)]">
            Você está prestes a remover este método das formas de cobrança da
            organização.
          </p>
          {method.isDefault && (
            <p className="m-0 body-xs text-[var(--accent-warning)]">
              Este é o método padrão. Depois da remoção, o próximo da lista
              vira o padrão automaticamente.
            </p>
          )}
        </div>
      )}
    </AwModal>
  );
}
