"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCardBrand, type AwCardBrandId } from "@/components/ui/AwCardBrand";
import { AwContactChannelModal } from "@/components/ui/AwContactChannelModal";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwEmpty, AwEmptyDescription, AwEmptyHeader, AwEmptyMedia, AwEmptyTitle } from "@/components/ui/AwEmpty";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { ONBOARDING_ORG } from "@/app/primeiro-acesso/_data";
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
  const defaultMethod = ordered[0];
  const secondaryMethods = ordered.slice(1);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h6 className="m-0 mb-1 text-(--fg-primary)">Métodos de pagamento</h6>
        <p className="m-0 max-w-[560px] body-xs text-(--fg-secondary)">
          Cartões e formas de cobrança aceitos por esta organização. As
          cobranças tentam primeiro o método marcado como padrão.
        </p>
      </header>

      {methods.length === 0 || !defaultMethod ? (
        <EmptyState onAdd={() => setAddOpen(true)} />
      ) : (
        <div className="flex flex-col gap-6">
          <DefaultCardHero
            method={defaultMethod}
            canRemove={canRemoveAny}
            onSetDefault={() => setAsDefault(defaultMethod.id)}
            onRemoveRequest={() => setPendingRemoveId(defaultMethod.id)}
          />
          <div className="flex flex-col gap-3">
            {secondaryMethods.length > 0 && (
              <p className="m-0 aw-eyebrow text-(--fg-tertiary)">
                Métodos alternativos
              </p>
            )}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
              {secondaryMethods.map((m) => (
                <SecondaryCard
                  key={m.id}
                  method={m}
                  canRemove={canRemoveAny}
                  onSetDefault={() => setAsDefault(m.id)}
                  onRemoveRequest={() => setPendingRemoveId(m.id)}
                />
              ))}
              <AddCardTile onClick={() => setAddOpen(true)} />
            </div>
          </div>
        </div>
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
 * Cartões — o padrão vira um "cartão" dark, em destaque; os demais
 * são cards menores, e a opção de adicionar é um tile tracejado.
 * ----------------------------------------------------------------- */

type MethodCardProps = {
  method: PaymentMethod;
  canRemove: boolean;
  onSetDefault: () => void;
  onRemoveRequest: () => void;
};

function CardActionsMenu({
  method,
  canRemove,
  onSetDefault,
  onRemoveRequest,
  onDark = false,
}: MethodCardProps & { onDark?: boolean }) {
  return (
    <AwDropdownMenu
      align="end"
      trigger={
        <AwButton
          size="sm"
          variant="ghost"
          iconOnly="more_horiz"
          aria-label={`Opções de ${method.brand} •••• ${method.last4}`}
          className={onDark ? "text-(--fg-on-inverse)" : undefined}
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
  );
}

function DefaultCardHero(props: MethodCardProps) {
  const { method } = props;
  const expired = expiryYear(method.expiresAt) < new Date().getFullYear();
  const expiringSoon = isExpiringSoon(method.expiresAt);

  return (
    <div className="relative flex aspect-[856/540] w-full max-w-sm flex-col justify-between overflow-hidden rounded-2xl bg-(--bg-inverse) p-6 text-(--fg-on-inverse) shadow-sm">
      {/* leve brilho de canto, sutil e por token */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-(--fg-on-inverse) opacity-10"
      />

      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-(--bg-raised) px-2.5 py-1 aw-eyebrow text-(--fg-primary)">
          <Icon name="check_circle" size={13} />
          Padrão
        </span>
        <CardActionsMenu {...props} onDark />
      </div>

      <div className="relative flex flex-col gap-4">
        <span className="text-2xl tabular-nums tracking-widest text-(--fg-on-inverse)">
          •••• •••• •••• {method.last4}
        </span>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <span className="block aw-eyebrow text-(--fg-on-inverse) opacity-60">
              Titular
            </span>
            <span className="block truncate body-sm font-medium text-(--fg-on-inverse)">
              {BILLING_PROFILE.legalName}
            </span>
          </div>
          <div className="shrink-0 text-right">
            <span className="block aw-eyebrow text-(--fg-on-inverse) opacity-60">
              {expired ? "Expirado" : expiringSoon ? "Expira em breve" : "Validade"}
            </span>
            <span
              className={
                "block body-sm tabular-nums " +
                (expired
                  ? "text-(--aw-red-300)"
                  : expiringSoon
                    ? "text-(--aw-amber-300)"
                    : "text-(--fg-on-inverse)")
              }
            >
              {method.expiresAt}
            </span>
          </div>
          <AwCardBrand brand={BRAND_TO_AW[method.brand]} size="md" />
        </div>
      </div>
    </div>
  );
}

function SecondaryCard(props: MethodCardProps) {
  const { method } = props;
  const expired = expiryYear(method.expiresAt) < new Date().getFullYear();
  const expiringSoon = isExpiringSoon(method.expiresAt);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-4">
      <AwCardBrand brand={BRAND_TO_AW[method.brand]} size="md" />
      <div className="min-w-0 flex-1">
        <p className="m-0 body-sm font-medium tabular-nums text-(--fg-primary)">
          {method.brand} •••• {method.last4}
        </p>
        <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
          Expira em {method.expiresAt}
          {expired ? (
            <span className="text-(--accent-danger)"> · expirado</span>
          ) : expiringSoon ? (
            <span className="text-(--accent-warning)"> · em breve</span>
          ) : null}
        </p>
      </div>
      <CardActionsMenu {...props} />
    </div>
  );
}

function AddCardTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-(--border-default) p-4 text-(--fg-tertiary) transition-colors duration-aw-fast hover:border-(--border-strong) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
    >
      <Icon name="add" size={22} />
      <span className="body-xs font-medium">Adicionar cartão</span>
    </button>
  );
}

/* -----------------------------------------------------------------
 * Billing info — dados de faturamento usados na nota fiscal.
 * Os dados fiscais vêm do contrato (somente leitura); o cliente só
 * gerencia quem recebe as faturas por e-mail. Alterações nos demais
 * campos passam pelo Account Manager — link "Dados incorretos?".
 * ----------------------------------------------------------------- */

const VISIBLE_RECIPIENTS = 5;

function BillingInfoSection() {
  const { legalName, taxId, stateRegistration, address } = BILLING_PROFILE;
  const [recipients, setRecipients] = React.useState<string[]>(
    BILLING_PROFILE.billingRecipients,
  );
  const [showAll, setShowAll] = React.useState(false);
  const [contactOpen, setContactOpen] = React.useState(false);
  const [addingEmail, setAddingEmail] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState("");

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

  const commitNewEmail = () => {
    const value = newEmail.trim();
    if (value && !recipients.includes(value)) {
      setRecipients((prev) => [...prev, value]);
    }
    setNewEmail("");
    setAddingEmail(false);
  };

  return (
    <section className="flex flex-col gap-5 border-t border-(--border-subtle) pt-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h6 className="m-0 mb-1 text-(--fg-primary)">
            Informações de faturamento
          </h6>
          <p className="m-0 max-w-[560px] body-xs text-(--fg-secondary)">
            Dados que vão na nota fiscal e nas cobranças. Vêm do contrato —
            aqui você edita só os e-mails de faturamento.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setContactOpen(true)}
          className="body-xs font-medium text-(--fg-secondary) underline decoration-dotted underline-offset-2 hover:text-(--fg-primary) hover:no-underline"
        >
          Dados incorretos? Solicitar alteração
        </button>
      </header>

      <dl className="m-0 grid grid-cols-3 gap-x-10 gap-y-5">
        <BillingField label="Razão social" value={legalName} />
        <BillingField label="CNPJ" value={taxId} tabular />
        <div className="col-start-3 row-span-2 min-w-0">
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
            {addingEmail ? (
              <input
                autoFocus
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitNewEmail();
                  } else if (e.key === "Escape") {
                    setNewEmail("");
                    setAddingEmail(false);
                  }
                }}
                onBlur={commitNewEmail}
                placeholder="nome@empresa.com.br"
                aria-label="Adicionar e-mail de faturamento"
                className="mt-1.5 h-8 w-full max-w-[280px] rounded-sm border border-(--border-default) bg-(--bg-raised) px-2.5 body-xs text-(--fg-primary) outline-hidden placeholder:text-(--fg-tertiary) focus:border-(--border-strong)"
              />
            ) : (
              <div className="mt-1 flex flex-wrap items-center gap-3">
                {(hiddenCount > 0 || showAll) && (
                  <button
                    type="button"
                    onClick={() => setShowAll((v) => !v)}
                    className="body-xs font-medium text-(--fg-secondary) underline decoration-dotted underline-offset-2 hover:text-(--fg-primary) hover:no-underline"
                  >
                    {showAll ? "Ver menos" : `Ver mais (+${hiddenCount})`}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setAddingEmail(true)}
                  className="inline-flex items-center gap-1 body-xs font-medium text-(--fg-secondary) hover:text-(--fg-primary)"
                >
                  <Icon name="add" size={14} />
                  Adicionar e-mail
                </button>
              </div>
            )}
          </dd>
        </div>
        <BillingField label="Inscrição estadual" value={stateRegistration} />
        <div className="col-span-2">
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

      <AwContactChannelModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        managerName={ONBOARDING_ORG.accountManager.name}
      />
    </section>
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
            Adicione um cartão ou outra forma de cobrança para começar.
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
            Você vai remover este método das cobranças desta organização.
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
