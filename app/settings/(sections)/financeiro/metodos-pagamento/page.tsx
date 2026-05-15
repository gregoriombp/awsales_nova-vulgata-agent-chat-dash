"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";
import { AddPaymentMethodModal } from "../_components/AddPaymentMethodModal";
import { CardBrandLogo } from "../_components/CardBrandLogo";
import { PAYMENT_METHODS, type PaymentMethod } from "../_components/data";

export default function MetodosPagamentoPage() {
  const [methods, setMethods] = React.useState<PaymentMethod[]>(PAYMENT_METHODS);
  const [addOpen, setAddOpen] = React.useState(false);
  const [pendingRemoveId, setPendingRemoveId] = React.useState<string | null>(
    null,
  );

  const defaultMethod = methods.find((m) => m.isDefault) ?? null;
  const reserves = methods.filter((m) => !m.isDefault);

  const pendingRemove =
    pendingRemoveId === null
      ? null
      : (methods.find((m) => m.id === pendingRemoveId) ?? null);

  const setAsDefault = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id })),
    );
  };

  const confirmRemove = () => {
    if (pendingRemoveId === null) return;
    setMethods((prev) => {
      const next = prev.filter((m) => m.id !== pendingRemoveId);
      const hadDefault = prev.find((m) => m.id === pendingRemoveId)?.isDefault;
      if (hadDefault && next.length > 0) next[0] = { ...next[0], isDefault: true };
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
      {methods.length === 0 ? (
        <EmptyState onAdd={() => setAddOpen(true)} />
      ) : (
        <>
          {defaultMethod && (
            <DefaultMethodHero
              method={defaultMethod}
              onRemoveRequest={() => setPendingRemoveId(defaultMethod.id)}
              canRemove={methods.length > 1}
            />
          )}

          {reserves.length > 0 && (
            <ReserveMethodsList
              methods={reserves}
              onSetDefault={setAsDefault}
              onRemoveRequest={setPendingRemoveId}
            />
          )}

          <AddCardAction onAdd={() => setAddOpen(true)} />
        </>
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

/* ---------- default method hero ---------- */

function DefaultMethodHero({
  method,
  onRemoveRequest,
  canRemove,
}: {
  method: PaymentMethod;
  onRemoveRequest: () => void;
  canRemove: boolean;
}) {
  return (
    <section>
      <div className="mb-4">
        <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
          Cartão padrão
        </p>
        <p className="m-0 mt-0.5 max-w-[520px] body-xs text-[var(--fg-secondary)]">
          Faturas futuras vão ser cobradas aqui primeiro. Se falhar, tenta o
          próximo método disponível.
        </p>
      </div>
      <AwCard className="!p-0">
        <div className="flex flex-wrap items-center gap-4 px-5 py-5">
          <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-muted)]">
            <CardBrandLogo brand={method.brand} size={36} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 body-md font-medium text-[var(--fg-primary)]">
              {method.brand} •••• {method.last4}
            </p>
            <p className="m-0 mt-0.5 body-xs text-[var(--fg-secondary)]">
              Expira em {method.expiresAt}
            </p>
          </div>
          <AwButton
            size="sm"
            variant="ghost"
            disabled={!canRemove}
            onClick={onRemoveRequest}
            className="!text-[var(--accent-danger)]"
          >
            Excluir
          </AwButton>
        </div>
      </AwCard>
    </section>
  );
}

/* ---------- reserves list ---------- */

function ReserveMethodsList({
  methods,
  onSetDefault,
  onRemoveRequest,
}: {
  methods: PaymentMethod[];
  onSetDefault: (id: string) => void;
  onRemoveRequest: (id: string) => void;
}) {
  return (
    <section>
      <div className="mb-4">
        <h6 className="m-0 mb-1 text-[var(--fg-primary)]">
          Métodos reservas
        </h6>
        <p className="m-0 max-w-[520px] body-xs text-[var(--fg-secondary)]">
          Acionados em ordem quando o cartão padrão falha.
        </p>
      </div>
      <AwCard className="!p-0">
        <ul className="m-0 divide-y divide-[var(--border-subtle)] p-0">
          {methods.map((m) => (
            <li key={m.id} className="m-0 p-0">
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-3">
                <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-muted)]">
                  <CardBrandLogo brand={m.brand} size={26} />
                </span>
                <div className="min-w-0">
                  <p className="m-0 body-sm font-medium tabular-nums text-[var(--fg-primary)]">
                    {m.brand} •••• {m.last4}
                  </p>
                  <p className="m-0 body-xs text-[var(--fg-secondary)]">
                    Expira em {m.expiresAt}
                  </p>
                </div>
                <AwDropdownMenu
                  align="end"
                  trigger={
                    <AwButton
                      size="sm"
                      variant="ghost"
                      iconOnly="more_horiz"
                      aria-label={`Opções de ${m.brand} •••• ${m.last4}`}
                    />
                  }
                  items={[
                    {
                      id: `${m.id}-default`,
                      label: "Definir como padrão",
                      onSelect: () => onSetDefault(m.id),
                    },
                    {
                      id: `${m.id}-remove`,
                      label: "Excluir",
                      danger: true,
                      onSelect: () => onRemoveRequest(m.id),
                    },
                  ]}
                />
              </div>
            </li>
          ))}
        </ul>
      </AwCard>
    </section>
  );
}

/* ---------- add action ---------- */

function AddCardAction({ onAdd }: { onAdd: () => void }) {
  return (
    <div>
      <AwButton
        size="md"
        variant="secondary"
        iconLeft="add"
        onClick={onAdd}
      >
        Adicionar método de pagamento
      </AwButton>
      <p className="m-0 mt-1.5 body-xs text-[var(--fg-tertiary)]">
        Cartão, Pix automático ou boleto.
      </p>
    </div>
  );
}

/* ---------- remove modal ---------- */

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
      title="Excluir método de pagamento"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AwButton variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton variant="danger" onClick={onConfirm}>
            Excluir
          </AwButton>
        </div>
      }
    >
      <p className="m-0 body-xs text-[var(--fg-primary)]">
        {method ? (
          <>
            Você vai remover{" "}
            <strong className="font-medium">
              {method.brand} •••• {method.last4}
            </strong>{" "}
            da sua conta.
          </>
        ) : (
          "Você vai remover este método de pagamento da sua conta."
        )}
      </p>
      <p className="m-0 mt-2 body-xs text-[var(--fg-secondary)]">
        Faturas futuras vão tentar cobrar no próximo método disponível. Você
        pode reativar a qualquer momento adicionando o cartão de novo.
      </p>
    </AwModal>
  );
}

/* ---------- empty state ---------- */

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <AwCard className="!p-0">
      <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
        <Icon
          name="credit_card_off"
          size={28}
          className="text-[var(--fg-tertiary)]"
        />
        <p className="m-0 body-xs text-[var(--fg-secondary)]">
          Você ainda não tem nenhum método de pagamento cadastrado.
        </p>
        <AwButton size="sm" variant="primary" iconLeft="add" onClick={onAdd}>
          Adicionar método de pagamento
        </AwButton>
      </div>
    </AwCard>
  );
}
