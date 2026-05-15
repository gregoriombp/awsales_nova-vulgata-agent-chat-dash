"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwSelect } from "@/components/ui/AwSelect";
import { BR_STATES } from "./data";

const COUNTRIES = ["Brasil", "Estados Unidos", "Portugal", "Argentina", "Chile"];

type Step = "card" | "address";

const STEPS: { id: Step; label: string }[] = [
  { id: "card", label: "Cartão" },
  { id: "address", label: "Endereço" },
];

export function AddPaymentMethodModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (asDefault: boolean) => void;
}) {
  const [step, setStep] = React.useState<Step>("card");
  const [country, setCountry] = React.useState(COUNTRIES[0]);
  const [stateUF, setStateUF] = React.useState<string>("");
  const [setAsDefault, setSetAsDefault] = React.useState(false);

  const reset = () => {
    setStep("card");
    setCountry(COUNTRIES[0]);
    setStateUF("");
    setSetAsDefault(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = () => {
    onAdd(setAsDefault);
    reset();
  };

  const isCardStep = step === "card";

  return (
    <AwModal
      open={open}
      onClose={close}
      title="Adicionar método de pagamento"
      footer={
        isCardStep ? (
          <>
            <AwButton size="sm" variant="ghost" onClick={close}>
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              iconRight="arrow_forward"
              onClick={() => setStep("address")}
            >
              Continuar
            </AwButton>
          </>
        ) : (
          <>
            <AwButton
              size="sm"
              variant="ghost"
              iconLeft="arrow_back"
              onClick={() => setStep("card")}
            >
              Voltar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              iconLeft="add"
              onClick={submit}
            >
              Adicionar método
            </AwButton>
          </>
        )
      }
    >
      <div className="flex flex-col gap-5">
        <StepIndicator step={step} />

        {isCardStep ? (
          <CardStep />
        ) : (
          <AddressStep
            country={country}
            onCountryChange={setCountry}
            stateUF={stateUF}
            onStateChange={setStateUF}
            setAsDefault={setAsDefault}
            onSetAsDefaultChange={setSetAsDefault}
          />
        )}
      </div>
    </AwModal>
  );
}

/* ---------- step indicator ---------- */

function StepIndicator({ step }: { step: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.id === step);
  return (
    <div
      className="flex items-center gap-2"
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={STEPS.length}
      aria-label={`Passo ${currentIndex + 1} de ${STEPS.length}`}
    >
      {STEPS.map((s, i) => {
        const active = i === currentIndex;
        const done = i < currentIndex;
        return (
          <React.Fragment key={s.id}>
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full body-xs font-semibold tabular-nums transition-colors duration-aw-fast " +
                  (done || active
                    ? "bg-[var(--fg-primary)] text-[var(--bg-raised)]"
                    : "bg-[var(--bg-muted)] text-[var(--fg-tertiary)]")
                }
              >
                {i + 1}
              </span>
              <span
                className={
                  "body-xs font-medium " +
                  (active
                    ? "text-[var(--fg-primary)]"
                    : "text-[var(--fg-tertiary)]")
                }
              >
                {s.label}
              </span>
            </span>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="h-px w-6 shrink-0 bg-[var(--border-default)]"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ---------- card step ---------- */

function CardStep() {
  return (
    <>
      <p className="m-0 body-xs text-[var(--fg-secondary)]">
        Os dados do cartão são salvos com criptografia. Você pode remover o
        cartão a qualquer momento.
      </p>

      <section className="flex flex-col gap-3">
        <AwField label="Número do cartão" htmlFor="card-number">
          <AwInput
            id="card-number"
            placeholder="•••• •••• •••• ••••"
            iconLeft="credit_card"
            autoComplete="cc-number"
            autoFocus
          />
        </AwField>
        <div className="grid grid-cols-2 gap-3">
          <AwField label="Validade" htmlFor="card-exp">
            <AwInput
              id="card-exp"
              placeholder="MM / AA"
              autoComplete="cc-exp"
            />
          </AwField>
          <AwField label="CVC" htmlFor="card-cvc">
            <AwInput
              id="card-cvc"
              placeholder="•••"
              autoComplete="cc-csc"
            />
          </AwField>
        </div>
        <AwField label="Nome no cartão" htmlFor="card-name">
          <AwInput
            id="card-name"
            placeholder="Como aparece no cartão"
            autoComplete="cc-name"
          />
        </AwField>
      </section>
    </>
  );
}

/* ---------- address step ---------- */

function AddressStep({
  country,
  onCountryChange,
  stateUF,
  onStateChange,
  setAsDefault,
  onSetAsDefaultChange,
}: {
  country: string;
  onCountryChange: (v: string) => void;
  stateUF: string;
  onStateChange: (v: string) => void;
  setAsDefault: boolean;
  onSetAsDefaultChange: (v: boolean) => void;
}) {
  return (
    <>
      <p className="m-0 body-xs text-[var(--fg-secondary)]">
        Endereço usado nas faturas. Não precisa ser o mesmo do cartão.
      </p>

      <section className="flex flex-col gap-3">
        <AwField label="País" htmlFor="bill-country">
          <AwDropdownMenu
            trigger={
              <AwSelect id="bill-country" className="w-full justify-between">
                {country}
              </AwSelect>
            }
            items={COUNTRIES.map((c) => ({
              id: c,
              label: c,
              checked: c === country,
              onSelect: () => onCountryChange(c),
            }))}
          />
        </AwField>
        <AwField label="Endereço" htmlFor="bill-addr1">
          <AwInput id="bill-addr1" placeholder="Rua, número" autoFocus />
        </AwField>
        <AwField label="Complemento" htmlFor="bill-addr2">
          <AwInput
            id="bill-addr2"
            placeholder="Apto, sala, referência (opcional)"
          />
        </AwField>
        <div className="grid grid-cols-2 gap-3">
          <AwField label="Cidade" htmlFor="bill-city">
            <AwInput id="bill-city" placeholder="Cidade" />
          </AwField>
          <AwField label="CEP" htmlFor="bill-zip">
            <AwInput id="bill-zip" placeholder="00000-000" />
          </AwField>
        </div>
        <AwField label="Estado" htmlFor="bill-state">
          <AwDropdownMenu
            trigger={
              <AwSelect id="bill-state" className="w-full justify-between">
                {stateUF || "Selecione o estado"}
              </AwSelect>
            }
            items={BR_STATES.map((uf) => ({
              id: uf,
              label: uf,
              checked: uf === stateUF,
              onSelect: () => onStateChange(uf),
            }))}
          />
        </AwField>
      </section>

      <label className="flex cursor-pointer items-center gap-2 border-t border-[var(--border-subtle)] pt-4">
        <AwCheckbox
          checked={setAsDefault}
          onChange={onSetAsDefaultChange}
          label="Definir como método de pagamento padrão"
        />
        <span className="body-xs text-[var(--fg-primary)]">
          Definir como método de pagamento padrão
        </span>
      </label>
    </>
  );
}
