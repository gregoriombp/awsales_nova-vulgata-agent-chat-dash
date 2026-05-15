"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { AddPaymentMethodModal } from "../_components/AddPaymentMethodModal";
import { CardBrandLogo } from "../_components/CardBrandLogo";
import { PAYMENT_METHODS, type PaymentMethod } from "../_components/data";

export default function MetodosPagamentoPage() {
  const [methods, setMethods] = React.useState<PaymentMethod[]>(PAYMENT_METHODS);
  const [addOpen, setAddOpen] = React.useState(false);
  const [pendingRemoveId, setPendingRemoveId] = React.useState<string | null>(null);

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
    <div className="flex flex-col gap-6">
      {methods.length === 0 ? (
        <EmptyState onAdd={() => setAddOpen(true)} />
      ) : (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {methods.map((m) => (
            <PaymentMethodCard
              key={m.id}
              method={m}
              onSetDefault={() => setAsDefault(m.id)}
              onRemoveRequest={() => setPendingRemoveId(m.id)}
              canRemove={!(m.isDefault && methods.length === 1)}
            />
          ))}
          <AddPaymentMethodTile onClick={() => setAddOpen(true)} />
        </section>
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

function PaymentMethodCard({
  method,
  onSetDefault,
  onRemoveRequest,
  canRemove,
}: {
  method: PaymentMethod;
  onSetDefault: () => void;
  onRemoveRequest: () => void;
  canRemove: boolean;
}) {
  const isActive = method.isDefault;

  return (
    <AwCard
      className={
        "!p-0 " +
        (isActive
          ? "!border-transparent !bg-[var(--aw-gray-1200)] text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)]"
          : "")
      }
    >
      <div className="flex h-full flex-col gap-3 px-5 py-4">
        <CardBrandLogo brand={method.brand} size={36} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={
                "m-0 body-sm font-medium " +
                (isActive ? "text-white" : "text-[var(--fg-primary)]")
              }
            >
              {method.brand} •••• {method.last4}
            </p>
            {isActive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 aw-eyebrow text-white/90 ring-1 ring-inset ring-white/20">
                Principal
              </span>
            )}
          </div>
          <p
            className={
              "m-0 mt-0.5 body-xs " +
              (isActive ? "text-white/70" : "text-[var(--fg-secondary)]")
            }
          >
            Expira em {method.expiresAt}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-1 pt-1">
          {!isActive && (
            <AwButton size="sm" variant="ghost" onClick={onSetDefault}>
              Definir como principal
            </AwButton>
          )}
          <AwButton
            size="sm"
            variant="ghost"
            disabled={!canRemove}
            onClick={onRemoveRequest}
            className={
              isActive
                ? "!text-white/85 hover:!bg-white/10"
                : "!text-[var(--accent-danger)]"
            }
          >
            Excluir
          </AwButton>
        </div>
      </div>
    </AwCard>
  );
}

function AddPaymentMethodTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full min-h-[148px] flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-canvas)] px-5 py-4 text-center text-[var(--fg-secondary)] transition-colors hover:border-[var(--fg-primary)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-brand)] focus-visible:ring-offset-2"
      aria-label="Adicionar método de pagamento"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-muted)] text-[var(--fg-secondary)] transition-colors group-hover:bg-[var(--fg-primary)] group-hover:text-[var(--bg-raised)]">
        <Icon name="add" size={20} />
      </span>
      <span className="body-xs font-medium">
        Adicionar método de pagamento
      </span>
      <span className="body-xs text-[var(--fg-tertiary)]">
        Cartão, Pix automático ou boleto
      </span>
    </button>
  );
}

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

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <AwCard className="!p-0">
      <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
        <p className="m-0 body-xs text-[var(--fg-secondary)]">
          Você ainda não tem nenhum método de pagamento cadastrado.
        </p>
        <AwButton
          size="sm"
          variant="primary"
          iconLeft="add"
          onClick={onAdd}
        >
          Adicionar método de pagamento
        </AwButton>
      </div>
    </AwCard>
  );
}
