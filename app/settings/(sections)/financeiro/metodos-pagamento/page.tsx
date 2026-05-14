"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwPill } from "@/components/ui/AwPill";
import { AddPaymentMethodModal } from "../_components/AddPaymentMethodModal";
import { CardBrandLogo } from "../_components/CardBrandLogo";
import { PAYMENT_METHODS, type PaymentMethod } from "../_components/data";

export default function MetodosPagamentoPage() {
  const [methods, setMethods] = React.useState<PaymentMethod[]>(PAYMENT_METHODS);
  const [addOpen, setAddOpen] = React.useState(false);

  const setAsDefault = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id })),
    );
  };

  const remove = (id: string) => {
    setMethods((prev) => {
      const next = prev.filter((m) => m.id !== id);
      // se o cartão removido era o padrão, promove o primeiro restante
      const hadDefault = prev.find((m) => m.id === id)?.isDefault;
      if (hadDefault && next.length > 0) next[0] = { ...next[0], isDefault: true };
      return next;
    });
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
              onRemove={() => remove(m.id)}
              canRemove={!(m.isDefault && methods.length === 1)}
            />
          ))}
        </section>
      )}

      {methods.length > 0 && (
        <div>
          <AwButton
            size="sm"
            variant="secondary"
            iconLeft="add"
            onClick={() => setAddOpen(true)}
          >
            Adicionar método de pagamento
          </AwButton>
        </div>
      )}

      <AddPaymentMethodModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addCard}
      />
    </div>
  );
}

function PaymentMethodCard({
  method,
  onSetDefault,
  onRemove,
  canRemove,
}: {
  method: PaymentMethod;
  onSetDefault: () => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <AwCard className="!p-0">
      <div className="flex h-full flex-col gap-3 px-5 py-4">
        <CardBrandLogo brand={method.brand} size={36} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="m-0 text-[14px] font-medium text-[var(--fg-primary)]">
              {method.brand} •••• {method.last4}
            </p>
            {method.isDefault && (
              <AwPill variant="neutral" dot={false}>
                Principal
              </AwPill>
            )}
          </div>
          <p className="m-0 mt-0.5 text-[12px] text-[var(--fg-secondary)]">
            Expira em {method.expiresAt}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-1 pt-1">
          {!method.isDefault && (
            <AwButton size="sm" variant="ghost" onClick={onSetDefault}>
              Definir como principal
            </AwButton>
          )}
          <AwButton
            size="sm"
            variant="ghost"
            disabled={!canRemove}
            onClick={onRemove}
            className="!text-[var(--accent-danger)]"
          >
            Excluir
          </AwButton>
        </div>
      </div>
    </AwCard>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <AwCard className="!p-0">
      <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
        <p className="m-0 text-[13px] text-[var(--fg-secondary)]">
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
