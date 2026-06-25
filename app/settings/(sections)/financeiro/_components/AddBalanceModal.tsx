"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";
import { brl, PAYMENT_METHODS } from "./data";

type PayMethod = "boleto" | "pix" | "cartao";

const METHODS: {
  id: PayMethod;
  label: string;
  icon: string;
  hint: string;
  note: string;
}[] = [
  {
    id: "pix",
    label: "Pix",
    icon: "qr_code_2",
    hint: "Cai na hora",
    note: "Geramos um QR Code e o copia-e-cola. O saldo entra assim que o pagamento é confirmado.",
  },
  {
    id: "boleto",
    label: "Boleto",
    icon: "barcode",
    hint: "1–2 dias úteis",
    note: "Geramos um boleto. O saldo entra quando a compensação é confirmada (1–2 dias úteis).",
  },
  {
    id: "cartao",
    label: "Cartão de crédito",
    icon: "credit_card",
    hint: "Cai na hora",
    note: "Cobramos no cartão padrão da organização. O saldo entra na hora.",
  },
];

const SUGGESTED = [100, 250, 500, 1000];

export function AddBalanceModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [method, setMethod] = React.useState<PayMethod | null>(null);
  const [amount, setAmount] = React.useState("");
  const [done, setDone] = React.useState(false);

  const selected = METHODS.find((m) => m.id === method) ?? null;
  const amountValue = Number(amount.replace(/\D/g, "")) || 0;
  const defaultCard =
    PAYMENT_METHODS.find((m) => m.isDefault) ?? PAYMENT_METHODS[0];

  const reset = () => {
    setStep(1);
    setMethod(null);
    setAmount("");
    setDone(false);
  };
  const close = () => {
    reset();
    onClose();
  };
  const choose = (id: PayMethod) => {
    setMethod(id);
    setStep(2);
  };

  const title = done
    ? "Saldo a caminho"
    : step === 1
      ? "Adicionar saldo"
      : `Adicionar via ${selected?.label ?? ""}`;

  return (
    <AwModal
      open={open}
      onClose={close}
      title={title}
      footer={
        done ? (
          <div className="flex items-center justify-end">
            <AwButton variant="primary" onClick={close}>
              Concluir
            </AwButton>
          </div>
        ) : step === 1 ? (
          <div className="flex items-center justify-end">
            <AwButton variant="ghost" onClick={close}>
              Cancelar
            </AwButton>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <AwButton
              variant="ghost"
              iconLeft="arrow_back"
              onClick={() => setStep(1)}
            >
              Voltar
            </AwButton>
            <AwButton
              variant="primary"
              iconLeft="check"
              disabled={amountValue <= 0}
              onClick={() => setDone(true)}
            >
              {selected?.id === "cartao"
                ? "Cobrar no cartão"
                : `Gerar ${selected?.label ?? ""}`}
            </AwButton>
          </div>
        )
      }
    >
      {done ? (
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--aw-emerald-100) text-(--aw-emerald-700)">
            <Icon name="check_circle" size={18} />
          </span>
          <div className="flex flex-col gap-1">
            <p className="m-0 body-sm font-medium text-(--fg-primary)">
              {brl(amountValue)} via {selected?.label}.
            </p>
            <p className="m-0 body-xs text-(--fg-secondary)">
              {selected?.id === "cartao"
                ? "O saldo já está disponível para abater o seu uso variável."
                : "Assim que o pagamento for confirmado, o saldo entra automaticamente."}
            </p>
          </div>
        </div>
      ) : step === 1 ? (
        <div className="flex flex-col gap-3">
          <p className="m-0 body-xs text-(--fg-secondary)">
            O saldo abate o uso variável antes da cobrança do ciclo. Como
            você quer adicionar?
          </p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {METHODS.map((m) => (
              <li key={m.id} className="m-0">
                <button
                  type="button"
                  onClick={() => choose(m.id)}
                  className="group flex w-full items-center gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-3 text-left transition-colors duration-aw-fast hover:border-(--border-strong) hover:bg-(--bg-hover)"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-(--bg-muted) text-(--fg-secondary)">
                    <Icon name={m.icon} size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block body-sm font-medium text-(--fg-primary)">
                      {m.label}
                    </span>
                    <span className="block body-xs text-(--fg-tertiary)">
                      {m.hint}
                    </span>
                  </span>
                  <Icon
                    name="chevron_right"
                    size={18}
                    className="text-(--fg-tertiary) transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AwField label="Valor" htmlFor="add-balance-amount">
            <AwInput
              id="add-balance-amount"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={amount ? brl(amountValue) : ""}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </AwField>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v * 100))}
                className="rounded-full border border-(--border-subtle) bg-(--bg-surface) px-3 py-1 body-xs font-medium text-(--fg-secondary) transition-colors hover:border-(--border-strong) hover:text-(--fg-primary)"
              >
                {brl(v)}
              </button>
            ))}
          </div>
          {selected?.id === "cartao" && defaultCard && (
            <p className="m-0 body-xs text-(--fg-secondary)">
              Cobrado em{" "}
              <span className="font-medium text-(--fg-primary)">
                {defaultCard.brand} •••• {defaultCard.last4}
              </span>{" "}
              (cartão padrão).
            </p>
          )}
          <div className="rounded-md border border-(--border-subtle) bg-(--bg-muted) px-3 py-2 body-xs text-(--fg-secondary)">
            {selected?.note}
          </div>
        </div>
      )}
    </AwModal>
  );
}
