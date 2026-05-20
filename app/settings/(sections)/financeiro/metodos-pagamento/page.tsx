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

  // A cascata começa pelo método marcado como padrão e segue na ordem em
  // que os outros foram adicionados.
  const ordered = React.useMemo(() => {
    const def = methods.find((m) => m.isDefault);
    const rest = methods.filter((m) => !m.isDefault);
    return def ? [def, ...rest] : methods;
  }, [methods]);

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
      <header>
        <h6 className="m-0 mb-1 text-[var(--fg-primary)]">Cascata de cobrança</h6>
        <p className="m-0 max-w-[560px] body-xs text-[var(--fg-secondary)]">
          Faturas tentam cobrar do topo pra baixo. Quando um método falha, a
          gente vai pro próximo automaticamente.
        </p>
      </header>

      {methods.length === 0 ? (
        <EmptyState onAdd={() => setAddOpen(true)} />
      ) : (
        <Cascade
          methods={ordered}
          canRemoveAny={methods.length > 1}
          onSetDefault={setAsDefault}
          onRemoveRequest={setPendingRemoveId}
          onAdd={() => setAddOpen(true)}
        />
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

/* ---------- cascade ---------- */

function Cascade({
  methods,
  canRemoveAny,
  onSetDefault,
  onRemoveRequest,
  onAdd,
}: {
  methods: PaymentMethod[];
  canRemoveAny: boolean;
  onSetDefault: (id: string) => void;
  onRemoveRequest: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <ol className="m-0 flex list-none flex-col gap-0 p-0">
      {methods.map((m, i) => {
        const isFirst = i === 0;
        const isLast = i === methods.length - 1;
        const role = isFirst
          ? "Tenta primeiro"
          : isLast
            ? "Última tentativa"
            : `Tentativa ${i + 1}`;

        return (
          <li key={m.id} className="m-0 p-0">
            <CascadeStep
              order={i + 1}
              method={m}
              role={role}
              canDemote={!isFirst}
              canRemove={canRemoveAny}
              onSetDefault={() => onSetDefault(m.id)}
              onRemoveRequest={() => onRemoveRequest(m.id)}
            />
            {!isLast && <CascadeConnector label="se falhar" />}
          </li>
        );
      })}
      <li className="m-0 p-0">
        <CascadeConnector label="se todos falharem" />
        <button
          type="button"
          onClick={onAdd}
          className="group flex w-full items-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-transparent px-5 py-4 text-left transition-colors hover:border-[var(--fg-primary)] hover:bg-[var(--bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-brand)]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)]">
            <Icon name="add" size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block body-sm font-medium text-[var(--fg-primary)]">
              Adicionar próxima reserva
            </span>
            <span className="block body-xs text-[var(--fg-tertiary)]">
              Cartão, Pix automático ou boleto
            </span>
          </span>
        </button>
      </li>
    </ol>
  );
}

function CascadeStep({
  order,
  method,
  role,
  canDemote,
  canRemove,
  onSetDefault,
  onRemoveRequest,
}: {
  order: number;
  method: PaymentMethod;
  role: string;
  canDemote: boolean;
  canRemove: boolean;
  onSetDefault: () => void;
  onRemoveRequest: () => void;
}) {
  return (
    <AwCard className="!p-0">
      <div className="grid grid-cols-[40px_auto_1fr_auto] items-center gap-4 px-5 py-4">
        <span
          aria-label={`Posição ${order} na cascata`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-muted)] body-sm font-semibold tabular-nums text-[var(--fg-primary)]"
        >
          {order}
        </span>
        <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-muted)]">
          <CardBrandLogo brand={method.brand} size={30} />
        </span>
        <div className="min-w-0">
          <p className="m-0 body-md font-medium tabular-nums text-[var(--fg-primary)]">
            {method.brand} •••• {method.last4}
          </p>
          <p className="m-0 mt-0.5 body-xs text-[var(--fg-secondary)]">
            {role} · expira em {method.expiresAt}
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
              id: `${method.id}-promote`,
              label: "Mover pro topo da cascata",
              icon: "vertical_align_top",
              disabled: !canDemote,
              onSelect: onSetDefault,
            },
            {
              id: `${method.id}-remove`,
              label: "Excluir",
              icon: "delete",
              danger: true,
              disabled: !canRemove,
              onSelect: onRemoveRequest,
            },
          ]}
        />
      </div>
    </AwCard>
  );
}

function CascadeConnector({ label }: { label: string }) {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-2 py-2 pl-[28px]"
    >
      <span className="h-4 w-px bg-[var(--border-default)]" />
      <Icon
        name="arrow_downward"
        size={12}
        className="text-[var(--fg-tertiary)]"
      />
      <span className="body-xs italic text-[var(--fg-tertiary)]">{label}</span>
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
            da cascata.
          </>
        ) : (
          "Você vai remover este método de pagamento da cascata."
        )}
      </p>
      <p className="m-0 mt-2 body-xs text-[var(--fg-secondary)]">
        A próxima posição da cascata vira a nova tentativa anterior. Você pode
        reativar a qualquer momento adicionando o cartão de novo.
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
          A cascata está vazia — nenhum método pra cobrar.
        </p>
        <AwButton size="sm" variant="primary" iconLeft="add" onClick={onAdd}>
          Adicionar método de pagamento
        </AwButton>
      </div>
    </AwCard>
  );
}
