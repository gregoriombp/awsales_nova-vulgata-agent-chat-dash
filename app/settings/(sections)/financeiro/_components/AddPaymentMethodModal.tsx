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

export function AddPaymentMethodModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (asDefault: boolean) => void;
}) {
  const [country, setCountry] = React.useState(COUNTRIES[0]);
  const [stateUF, setStateUF] = React.useState<string>("");
  const [setAsDefault, setSetAsDefault] = React.useState(false);

  const reset = () => {
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

  return (
    <AwModal
      open={open}
      onClose={close}
      title="Adicionar método de pagamento"
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={close}>
            Cancelar
          </AwButton>
          <AwButton size="sm" variant="primary" iconLeft="add" onClick={submit}>
            Adicionar método
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <p className="m-0 text-[13px] leading-[1.55] text-[var(--fg-secondary)]">
          Adicione os dados do cartão abaixo. O cartão será salvo na sua conta
          e pode ser removido a qualquer momento.
        </p>

        <section className="flex flex-col gap-3">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Informações do cartão
          </p>
          <AwField label="Número do cartão" htmlFor="card-number">
            <AwInput
              id="card-number"
              placeholder="•••• •••• •••• ••••"
              iconLeft="credit_card"
              autoComplete="cc-number"
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

        <section className="flex flex-col gap-3">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Endereço de cobrança
          </p>
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
                onSelect: () => setCountry(c),
              }))}
            />
          </AwField>
          <AwField label="Endereço" htmlFor="bill-addr1">
            <AwInput id="bill-addr1" placeholder="Rua, número" />
          </AwField>
          <AwField label="Complemento" htmlFor="bill-addr2">
            <AwInput id="bill-addr2" placeholder="Apto, sala, referência (opcional)" />
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
                onSelect: () => setStateUF(uf),
              }))}
            />
          </AwField>
        </section>

        <label className="flex cursor-pointer items-center gap-2 border-t border-[var(--border-subtle)] pt-4">
          <AwCheckbox
            checked={setAsDefault}
            onChange={setSetAsDefault}
            label="Definir como método de pagamento padrão"
          />
          <span className="text-[13px] text-[var(--fg-primary)]">
            Definir como método de pagamento padrão
          </span>
        </label>
      </div>
    </AwModal>
  );
}
