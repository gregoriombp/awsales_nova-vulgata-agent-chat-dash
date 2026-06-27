"use client";

import * as React from "react";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwCardBrand, detectCardBrand } from "@/components/ui/AwCardBrand";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwSelect } from "@/components/ui/AwSelect";
import { Icon } from "@/components/ui/Icon";
import { BR_STATES, type CardBrand } from "./data";

const COUNTRIES = ["Brasil", "Estados Unidos", "Portugal", "Argentina", "Chile"];

/** Payload entregue pela página ao confirmar — discriminado por tipo. */
export type NewPaymentMethod =
  | { kind: "card"; brand: CardBrand; last4: string; expiresAt: string }
  | { kind: "boleto"; holder: string; taxId: string }
  | { kind: "pix"; keyType: string; key: string };

type MethodKind = "card" | "boleto" | "pix";

const KIND_OPTIONS: {
  id: MethodKind;
  label: string;
  description: string;
  brand: string;
}[] = [
  {
    id: "card",
    label: "Cartão de crédito",
    description: "Cobrança automática na bandeira do cartão.",
    brand: "card",
  },
  {
    id: "boleto",
    label: "Boleto bancário",
    description: "A cada ciclo, enviamos um boleto por e-mail. Compensa em até 3 dias úteis.",
    brand: "boleto",
  },
  {
    id: "pix",
    label: "Pix automático",
    description: "Débito recorrente autorizado via chave Pix.",
    brand: "pix",
  },
];

type Step = "type" | "details" | "address";

export function AddPaymentMethodModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (method: NewPaymentMethod, asDefault: boolean) => void;
}) {
  const [step, setStep] = React.useState<Step>("type");
  const [kind, setKind] = React.useState<MethodKind>("card");

  // --- card ---
  const [number, setNumber] = React.useState("");
  const [exp, setExp] = React.useState("");
  const [cvc, setCvc] = React.useState("");
  const [cardName, setCardName] = React.useState("");

  // --- boleto ---
  const [holder, setHolder] = React.useState("");
  const [taxId, setTaxId] = React.useState("");

  // --- pix ---
  const [pixKeyType, setPixKeyType] = React.useState("CNPJ");
  const [pixKey, setPixKey] = React.useState("");

  // --- address (compartilhado) ---
  const [country, setCountry] = React.useState(COUNTRIES[0]);
  const [stateUF, setStateUF] = React.useState<string>("");
  const [addr1, setAddr1] = React.useState("");
  const [addrNumber, setAddrNumber] = React.useState("");
  const [city, setCity] = React.useState("");
  const [zip, setZip] = React.useState("");
  const [setAsDefault, setSetAsDefault] = React.useState(false);

  // Mostra os erros inline só depois que o usuário tentou avançar/submeter.
  const [showErrors, setShowErrors] = React.useState(false);

  const reset = () => {
    setStep("type");
    setKind("card");
    setNumber("");
    setExp("");
    setCvc("");
    setCardName("");
    setHolder("");
    setTaxId("");
    setPixKeyType("CNPJ");
    setPixKey("");
    setCountry(COUNTRIES[0]);
    setStateUF("");
    setAddr1("");
    setAddrNumber("");
    setCity("");
    setZip("");
    setSetAsDefault(false);
    setShowErrors(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  // ---- validações por passo ----
  const cardDigits = number.replace(/\D/g, "");
  const expDigits = exp.replace(/\D/g, "");
  const cardErrors = {
    number:
      cardDigits.length < 13 ? "Informe o número do cartão." : undefined,
    exp:
      expDigits.length < 4
        ? "Informe a validade (MM/AA)."
        : Number(expDigits.slice(0, 2)) < 1 || Number(expDigits.slice(0, 2)) > 12
          ? "Mês inválido."
          : undefined,
    cvc: cvc.length < 3 ? "Informe o CVC." : undefined,
    name: cardName.trim().length === 0 ? "Informe o nome no cartão." : undefined,
  };
  const boletoErrors = {
    holder: holder.trim().length === 0 ? "Informe o titular." : undefined,
    taxId:
      taxId.replace(/\D/g, "").length < 11
        ? "Informe um CPF ou CNPJ válido."
        : undefined,
  };
  const pixErrors = {
    key: pixKey.trim().length === 0 ? "Informe a chave Pix." : undefined,
  };
  const addressErrors = {
    addr1: addr1.trim().length === 0 ? "Informe o endereço." : undefined,
    city: city.trim().length === 0 ? "Informe a cidade." : undefined,
    zip:
      zip.replace(/\D/g, "").length < 8 ? "Informe um CEP válido." : undefined,
    state: stateUF.length === 0 ? "Selecione o estado." : undefined,
  };

  const detailsValid =
    kind === "card"
      ? Object.values(cardErrors).every((e) => !e)
      : kind === "boleto"
        ? Object.values(boletoErrors).every((e) => !e)
        : Object.values(pixErrors).every((e) => !e);

  // Endereço de cobrança só existe pro cartão (boleto/Pix não têm esse passo) —
  // sem isso, o submit de boleto/Pix travava num addressValid que checava campos
  // de endereço nunca coletados, e o botão "Adicionar método" não fazia nada.
  const addressValid =
    kind !== "card" ||
    country !== "Brasil" ||
    Object.values(addressErrors).every((e) => !e);

  const goToDetails = () => setStep("details");

  const goToAddress = () => {
    if (!detailsValid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep("address");
  };

  const submit = () => {
    if (!addressValid) {
      setShowErrors(true);
      return;
    }
    let payload: NewPaymentMethod;
    if (kind === "card") {
      payload = {
        kind: "card",
        brand: toCardBrand(detectCardBrand(number)),
        last4: cardDigits.slice(-4),
        expiresAt: `${expDigits.slice(0, 2)}/20${expDigits.slice(2, 4)}`,
      };
    } else if (kind === "boleto") {
      payload = { kind: "boleto", holder: holder.trim(), taxId: taxId.trim() };
    } else {
      payload = { kind: "pix", keyType: pixKeyType, key: pixKey.trim() };
    }
    onAdd(payload, setAsDefault);
    reset();
  };

  const steps = React.useMemo<{ id: Step; label: string }[]>(() => {
    const base: { id: Step; label: string }[] = [
      { id: "type", label: "Tipo" },
      { id: "details", label: detailsLabel(kind) },
    ];
    // Endereço de cobrança só faz sentido pra cartão.
    if (kind === "card") base.push({ id: "address", label: "Endereço" });
    return base;
  }, [kind]);

  const footer = (() => {
    if (step === "type") {
      return (
        <>
          <AwButton size="sm" variant="ghost" onClick={close}>
            Cancelar
          </AwButton>
          <AwButton
            size="sm"
            variant="primary"
            iconRight="arrow_forward"
            onClick={goToDetails}
          >
            Continuar
          </AwButton>
        </>
      );
    }
    if (step === "details") {
      const isLast = kind !== "card";
      return (
        <>
          <AwButton
            size="sm"
            variant="ghost"
            iconLeft="arrow_back"
            onClick={() => setStep("type")}
          >
            Voltar
          </AwButton>
          <AwButton
            size="sm"
            variant="primary"
            iconLeft={isLast ? "add" : undefined}
            iconRight={isLast ? undefined : "arrow_forward"}
            disabled={!detailsValid}
            onClick={isLast ? submit : goToAddress}
          >
            {isLast ? "Adicionar método" : "Continuar"}
          </AwButton>
        </>
      );
    }
    return (
      <>
        <AwButton
          size="sm"
          variant="ghost"
          iconLeft="arrow_back"
          onClick={() => setStep("details")}
        >
          Voltar
        </AwButton>
        <AwButton
          size="sm"
          variant="primary"
          iconLeft="add"
          disabled={!addressValid}
          onClick={submit}
        >
          Adicionar método
        </AwButton>
      </>
    );
  })();

  return (
    <AwModal
      open={open}
      onClose={close}
      title="Adicionar método de pagamento"
      footer={footer}
    >
      <div className="flex flex-col gap-5">
        <StepIndicator
          steps={steps}
          current={step}
          detailsValid={detailsValid}
        />

        {step === "type" ? (
          <TypeStep kind={kind} onKindChange={setKind} />
        ) : step === "details" ? (
          kind === "card" ? (
            <CardStep
              number={number}
              onNumber={setNumber}
              exp={exp}
              onExp={setExp}
              cvc={cvc}
              onCvc={setCvc}
              name={cardName}
              onName={setCardName}
              errors={showErrors ? cardErrors : {}}
            />
          ) : kind === "boleto" ? (
            <BoletoStep
              holder={holder}
              onHolder={setHolder}
              taxId={taxId}
              onTaxId={setTaxId}
              errors={showErrors ? boletoErrors : {}}
              setAsDefault={setAsDefault}
              onSetAsDefaultChange={setSetAsDefault}
            />
          ) : (
            <PixStep
              keyType={pixKeyType}
              onKeyType={setPixKeyType}
              pixKey={pixKey}
              onPixKey={setPixKey}
              errors={showErrors ? pixErrors : {}}
              setAsDefault={setAsDefault}
              onSetAsDefaultChange={setSetAsDefault}
            />
          )
        ) : (
          <AddressStep
            country={country}
            onCountryChange={setCountry}
            stateUF={stateUF}
            onStateChange={setStateUF}
            addr1={addr1}
            onAddr1={setAddr1}
            addrNumber={addrNumber}
            onAddrNumber={setAddrNumber}
            city={city}
            onCity={setCity}
            zip={zip}
            onZip={setZip}
            setAsDefault={setAsDefault}
            onSetAsDefaultChange={setSetAsDefault}
            errors={showErrors && country === "Brasil" ? addressErrors : {}}
          />
        )}
      </div>
    </AwModal>
  );
}

function detailsLabel(kind: MethodKind): string {
  if (kind === "card") return "Cartão";
  if (kind === "boleto") return "Boleto";
  return "Pix";
}

/** A lista de bandeiras salvas (data.ts) só cobre as três principais; o
 *  detector reconhece outras, então caímos em "Visa" como fallback visual. */
function toCardBrand(detected: string): CardBrand {
  if (detected === "mastercard") return "Mastercard";
  if (detected === "amex") return "Amex";
  return "Visa";
}

/* ---------- step indicator ---------- */

function StepIndicator({
  steps,
  current,
  detailsValid,
}: {
  steps: { id: Step; label: string }[];
  current: Step;
  detailsValid: boolean;
}) {
  const currentIndex = steps.findIndex((s) => s.id === current);
  return (
    <div
      className="flex w-full items-center gap-3"
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-label={`Passo ${currentIndex + 1} de ${steps.length}`}
    >
      {steps.map((s, i) => {
        const active = i === currentIndex;
        // ✓ só quando a etapa já foi passada E está realmente válida; o passo
        // "details" só recebe o check quando o conteúdo é válido.
        const done =
          i < currentIndex && (s.id !== "details" || detailsValid);
        return (
          <React.Fragment key={s.id}>
            <span className="flex shrink-0 items-center gap-1.5">
              <span
                aria-hidden="true"
                className={
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full body-xs font-semibold tabular-nums transition-colors duration-aw-fast " +
                  (done || active
                    ? "bg-(--fg-primary) text-(--bg-raised)"
                    : "bg-(--bg-muted) text-(--fg-tertiary)")
                }
              >
                {done ? <Icon name="check" size={12} /> : i + 1}
              </span>
              <span
                className={
                  "body-xs font-medium " +
                  (active ? "text-(--fg-primary)" : "text-(--fg-tertiary)")
                }
              >
                {s.label}
              </span>
            </span>
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={
                  "h-px flex-1 transition-colors duration-aw-fast " +
                  (done ? "bg-(--fg-primary)" : "bg-(--border-default)")
                }
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ---------- type step ---------- */

function TypeStep({
  kind,
  onKindChange,
}: {
  kind: MethodKind;
  onKindChange: (k: MethodKind) => void;
}) {
  return (
    <>
      <p className="m-0 body-xs text-(--fg-secondary)">
        Escolha como esta organização vai pagar. Você pode definir qualquer
        forma como padrão depois.
      </p>
      <div
        role="radiogroup"
        aria-label="Tipo de método de pagamento"
        className="flex flex-col gap-2"
      >
        {KIND_OPTIONS.map((opt) => {
          const selected = opt.id === kind;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onKindChange(opt.id)}
              className={
                "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-aw-fast " +
                (selected
                  ? "border-(--border-strong) bg-(--bg-hover)"
                  : "border-(--border-subtle) hover:border-(--border-default) hover:bg-(--bg-hover)")
              }
            >
              <AwBrandLogo brand={opt.brand} size="md" />
              <div className="min-w-0 flex-1">
                <p className="m-0 body-sm font-medium text-(--fg-primary)">
                  {opt.label}
                </p>
                <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
                  {opt.description}
                </p>
              </div>
              <span
                aria-hidden="true"
                className={
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-aw-fast " +
                  (selected
                    ? "border-(--fg-primary) bg-(--fg-primary)"
                    : "border-(--border-default)")
                }
              >
                {selected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-(--bg-raised)" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---------- card step ---------- */

function CardStep({
  number,
  onNumber,
  exp,
  onExp,
  cvc,
  onCvc,
  name,
  onName,
  errors,
}: {
  number: string;
  onNumber: (v: string) => void;
  exp: string;
  onExp: (v: string) => void;
  cvc: string;
  onCvc: (v: string) => void;
  name: string;
  onName: (v: string) => void;
  errors: Partial<Record<"number" | "exp" | "cvc" | "name", string>>;
}) {
  // Agrupa o número em blocos de 4 dígitos conforme o usuário digita.
  const formatCardNumber = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");

  // Validade: aceita os 4 dígitos (MMAA) e formata como "MM / AA".
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length <= 2 ? d : `${d.slice(0, 2)} / ${d.slice(2)}`;
  };

  // Resolve a bandeira ao vivo pelo BIN (prefixo) enquanto o usuário digita.
  const brand = detectCardBrand(number);

  return (
    <>
      <p className="m-0 body-xs text-(--fg-secondary)">
        Os dados do cartão são salvos com criptografia. Você pode remover o
        cartão a qualquer momento.
      </p>

      <section className="flex flex-col gap-3">
        <AwField
          label="Número do cartão"
          htmlFor="card-number"
          error={errors.number}
        >
          <div className="relative">
            <AwInput
              id="card-number"
              placeholder="0000 0000 0000 0000"
              iconLeft="credit_card"
              autoComplete="cc-number"
              inputMode="numeric"
              invalid={!!errors.number}
              value={number}
              onChange={(e) => onNumber(formatCardNumber(e.target.value))}
              style={{ paddingRight: 44 }}
              autoFocus
            />
            {brand !== "unknown" && (
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <AwCardBrand brand={brand} size="sm" />
              </span>
            )}
          </div>
        </AwField>
        <div className="grid grid-cols-2 gap-3">
          <AwField label="Validade" htmlFor="card-exp" error={errors.exp}>
            <AwInput
              id="card-exp"
              placeholder="MM / AA"
              autoComplete="cc-exp"
              inputMode="numeric"
              invalid={!!errors.exp}
              value={exp}
              onChange={(e) => onExp(formatExpiry(e.target.value))}
            />
          </AwField>
          <AwField label="CVC" htmlFor="card-cvc" error={errors.cvc}>
            <AwInput
              id="card-cvc"
              placeholder="•••"
              autoComplete="cc-csc"
              inputMode="numeric"
              invalid={!!errors.cvc}
              value={cvc}
              onChange={(e) => onCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
            />
          </AwField>
        </div>
        <AwField label="Nome no cartão" htmlFor="card-name" error={errors.name}>
          <AwInput
            id="card-name"
            placeholder="Como aparece no cartão"
            autoComplete="cc-name"
            invalid={!!errors.name}
            value={name}
            onChange={(e) => onName(e.target.value)}
          />
        </AwField>
      </section>
    </>
  );
}

/* ---------- boleto step ---------- */

function SetAsDefaultToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 border-t border-(--border-subtle) pt-4">
      <AwCheckbox
        checked={checked}
        onChange={onChange}
        label="Usar como método padrão"
      />
      <span className="body-xs text-(--fg-primary)">
        Usar como método padrão
      </span>
    </label>
  );
}

function BoletoStep({
  holder,
  onHolder,
  taxId,
  onTaxId,
  errors,
  setAsDefault,
  onSetAsDefaultChange,
}: {
  holder: string;
  onHolder: (v: string) => void;
  taxId: string;
  onTaxId: (v: string) => void;
  errors: Partial<Record<"holder" | "taxId", string>>;
  setAsDefault: boolean;
  onSetAsDefaultChange: (v: boolean) => void;
}) {
  // Máscara leve de CPF/CNPJ conforme a quantidade de dígitos.
  const formatTaxId = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 14);
    if (d.length <= 11) {
      return d
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return d
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  return (
    <>
      <p className="m-0 body-xs text-(--fg-secondary)">
        A cada ciclo, geramos um boleto registrado e enviamos para os e-mails de
        faturamento. O pagamento compensa em até 3 dias úteis.
      </p>

      <section className="flex flex-col gap-3">
        <AwField label="Titular" htmlFor="boleto-holder" error={errors.holder}>
          <AwInput
            id="boleto-holder"
            placeholder="Razão social ou nome completo"
            invalid={!!errors.holder}
            value={holder}
            onChange={(e) => onHolder(e.target.value)}
            autoFocus
          />
        </AwField>
        <AwField label="CPF / CNPJ" htmlFor="boleto-taxid" error={errors.taxId}>
          <AwInput
            id="boleto-taxid"
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            invalid={!!errors.taxId}
            value={taxId}
            onChange={(e) => onTaxId(formatTaxId(e.target.value))}
          />
        </AwField>
      </section>

      <SetAsDefaultToggle
        checked={setAsDefault}
        onChange={onSetAsDefaultChange}
      />
    </>
  );
}

/* ---------- pix step ---------- */

const PIX_KEY_TYPES = ["CNPJ", "CPF", "E-mail", "Telefone", "Aleatória"];

function PixStep({
  keyType,
  onKeyType,
  pixKey,
  onPixKey,
  errors,
  setAsDefault,
  onSetAsDefaultChange,
}: {
  keyType: string;
  onKeyType: (v: string) => void;
  pixKey: string;
  onPixKey: (v: string) => void;
  errors: Partial<Record<"key", string>>;
  setAsDefault: boolean;
  onSetAsDefaultChange: (v: boolean) => void;
}) {
  return (
    <>
      <p className="m-0 body-xs text-(--fg-secondary)">
        Autorizamos um débito recorrente na sua chave Pix. Você aprova a
        primeira autorização no app do banco e os ciclos seguintes são
        automáticos.
      </p>

      <section className="flex flex-col gap-3">
        <AwField label="Tipo de chave" htmlFor="pix-key-type">
          <AwDropdownMenu
            trigger={
              <AwSelect id="pix-key-type" className="w-full justify-between">
                {keyType}
              </AwSelect>
            }
            items={PIX_KEY_TYPES.map((t) => ({
              id: t,
              label: t,
              checked: t === keyType,
              onSelect: () => onKeyType(t),
            }))}
          />
        </AwField>
        <AwField label="Chave Pix" htmlFor="pix-key" error={errors.key}>
          <AwInput
            id="pix-key"
            placeholder="Cole sua chave Pix"
            iconLeft="key"
            invalid={!!errors.key}
            value={pixKey}
            onChange={(e) => onPixKey(e.target.value)}
            autoFocus
          />
        </AwField>
      </section>

      <SetAsDefaultToggle
        checked={setAsDefault}
        onChange={onSetAsDefaultChange}
      />
    </>
  );
}

/* ---------- address step ---------- */

function AddressStep({
  country,
  onCountryChange,
  stateUF,
  onStateChange,
  addr1,
  onAddr1,
  addrNumber,
  onAddrNumber,
  city,
  onCity,
  zip,
  onZip,
  setAsDefault,
  onSetAsDefaultChange,
  errors,
}: {
  country: string;
  onCountryChange: (v: string) => void;
  stateUF: string;
  onStateChange: (v: string) => void;
  addr1: string;
  onAddr1: (v: string) => void;
  addrNumber: string;
  onAddrNumber: (v: string) => void;
  city: string;
  onCity: (v: string) => void;
  zip: string;
  onZip: (v: string) => void;
  setAsDefault: boolean;
  onSetAsDefaultChange: (v: boolean) => void;
  errors: Partial<Record<"addr1" | "city" | "zip" | "state", string>>;
}) {
  const formatZip = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`;
  };

  return (
    <>
      <p className="m-0 body-xs text-(--fg-secondary)">
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
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <AwField label="Endereço" htmlFor="bill-addr1" error={errors.addr1}>
            <AwInput
              id="bill-addr1"
              placeholder="Rua / Avenida"
              invalid={!!errors.addr1}
              value={addr1}
              onChange={(e) => onAddr1(e.target.value)}
              autoFocus
            />
          </AwField>
          <AwField label="Número" htmlFor="bill-number">
            <AwInput
              id="bill-number"
              placeholder="Nº"
              value={addrNumber}
              onChange={(e) => onAddrNumber(e.target.value)}
            />
          </AwField>
        </div>
        <AwField label="Complemento" htmlFor="bill-addr2">
          <AwInput
            id="bill-addr2"
            placeholder="Apto, sala, referência (opcional)"
          />
        </AwField>
        <div className="grid grid-cols-2 gap-3">
          <AwField label="Cidade" htmlFor="bill-city" error={errors.city}>
            <AwInput
              id="bill-city"
              placeholder="Cidade"
              invalid={!!errors.city}
              value={city}
              onChange={(e) => onCity(e.target.value)}
            />
          </AwField>
          <AwField label="CEP" htmlFor="bill-zip" error={errors.zip}>
            <AwInput
              id="bill-zip"
              placeholder="00000-000"
              inputMode="numeric"
              invalid={!!errors.zip}
              value={zip}
              onChange={(e) => onZip(formatZip(e.target.value))}
            />
          </AwField>
        </div>
        <AwField label="Estado" htmlFor="bill-state" error={errors.state}>
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

      <label className="flex cursor-pointer items-center gap-2 border-t border-(--border-subtle) pt-4">
        <AwCheckbox
          checked={setAsDefault}
          onChange={onSetAsDefaultChange}
          label="Usar como método padrão"
        />
        <span className="body-xs text-(--fg-primary)">
          Usar como método padrão
        </span>
      </label>
    </>
  );
}
