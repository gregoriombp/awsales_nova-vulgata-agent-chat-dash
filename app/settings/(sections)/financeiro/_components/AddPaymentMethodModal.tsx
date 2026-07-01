"use client";

import * as React from "react";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import {
  AwCardBrand,
  detectCardBrand,
  type AwCardBrandId,
} from "@/components/ui/AwCardBrand";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwQrPlaceholder } from "@/components/ui/AwQrPlaceholder";
import { AwSelect } from "@/components/ui/AwSelect";
import { Icon } from "@/components/ui/Icon";
import { BILLING_PROFILE, BR_STATES, type CardBrand } from "./data";

const COUNTRIES = ["Brasil", "Estados Unidos", "Portugal", "Argentina", "Chile"];

/** Payload entregue pela página ao confirmar — discriminado por tipo. */
export type NewPaymentMethod =
  | { kind: "card"; brand: CardBrand; last4: string; expiresAt: string }
  | { kind: "boleto"; holder: string; taxId: string }
  | { kind: "pix"; keyType: string; key: string };

export type MethodKind = "card" | "boleto" | "pix";

// Quais tipos aceitam apenas UM método na conta. Só cartão pode repetir; boleto
// e Pix são únicos (regra do Greg).
const SINGLE_INSTANCE_KINDS: MethodKind[] = ["boleto", "pix"];

// Boleto e Pix não são adicionados aqui — são definidos pelo administrador da
// Store e já vêm na conta como métodos alternativos (regra do Greg). O usuário
// só adiciona cartão de crédito; PayPal entra como "em breve".
const KIND_OPTIONS: {
  id: MethodKind | "paypal";
  label: string;
  description: string;
  brand: string;
  comingSoon?: boolean;
}[] = [
  {
    id: "card",
    label: "Cartão de crédito",
    description: "Cobrança automática na bandeira do cartão.",
    brand: "card",
  },
  {
    id: "paypal",
    label: "PayPal",
    description: "Em breve disponível para esta organização.",
    brand: "paypal",
    comingSoon: true,
  },
];

type Step = "type" | "details" | "address" | "success";

export function AddPaymentMethodModal({
  open,
  onClose,
  onAdd,
  takenKinds = [],
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (method: NewPaymentMethod, asDefault: boolean) => void;
  /** Tipos únicos (boleto/Pix) que a conta JÁ possui — ficam desabilitados no
   *  seletor, já que só pode haver um de cada. */
  takenKinds?: MethodKind[];
}) {
  const [step, setStep] = React.useState<Step>("type");
  const [kind, setKind] = React.useState<MethodKind>("card");

  // --- card ---
  const [number, setNumber] = React.useState("");
  const [exp, setExp] = React.useState("");
  const [cvc, setCvc] = React.useState("");
  const [cardName, setCardName] = React.useState("");

  // --- boleto ---
  // Sem coleta: o boleto usa os dados de faturamento que a organização já tem
  // (titular + CNPJ). O usuário só revisa e confirma — daí não há estado aqui.

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

  // Guarda o método recém-adicionado para a etapa de confirmação (o modal não
  // some "seco" — ele mostra o que entrou antes de fechar).
  const [added, setAdded] = React.useState<{
    method: NewPaymentMethod;
    asDefault: boolean;
  } | null>(null);

  const reset = () => {
    setStep("type");
    setKind("card");
    setNumber("");
    setExp("");
    setCvc("");
    setCardName("");
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
    setAdded(null);
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
        ? true // só revisão dos dados da organização — nada a validar
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
      // Dados de faturamento da própria organização (não coletados do usuário).
      payload = {
        kind: "boleto",
        holder: BILLING_PROFILE.legalName,
        taxId: BILLING_PROFILE.taxId,
      };
    } else {
      payload = { kind: "pix", keyType: pixKeyType, key: pixKey.trim() };
    }
    onAdd(payload, setAsDefault);
    // Não fecha: registra o método e mostra a etapa de confirmação.
    setAdded({ method: payload, asDefault: setAsDefault });
    setStep("success");
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
    if (step === "success") {
      return (
        <AwButton size="md" variant="primary" onClick={close}>
          Concluir
        </AwButton>
      );
    }
    if (step === "type") {
      return (
        <>
          <AwButton size="md" variant="ghost" onClick={close}>
            Cancelar
          </AwButton>
          <AwButton
            size="md"
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
            size="md"
            variant="ghost"
            iconLeft="arrow_back"
            onClick={() => setStep("type")}
          >
            Voltar
          </AwButton>
          <AwButton
            size="md"
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
          size="md"
          variant="ghost"
          iconLeft="arrow_back"
          onClick={() => setStep("details")}
        >
          Voltar
        </AwButton>
        <AwButton
          size="md"
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
      title={step === "success" ? "Método adicionado" : "Adicionar método de pagamento"}
      footer={footer}
    >
      <div className="flex flex-col gap-5">
        {step !== "success" && (
          <StepIndicator
            steps={steps}
            current={step}
            detailsValid={detailsValid}
          />
        )}

        {step === "success" && added ? (
          <SuccessStep method={added.method} asDefault={added.asDefault} />
        ) : step === "type" ? (
          <TypeStep
            kind={kind}
            onKindChange={setKind}
            takenKinds={takenKinds}
          />
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
  if (kind === "card") return "Detalhes do Pagamento";
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

/* ---------- success step ---------- */

function SuccessStep({
  method,
  asDefault,
}: {
  method: NewPaymentMethod;
  asDefault: boolean;
}) {
  const isPix = method.kind === "pix";
  const label =
    method.kind === "card"
      ? `${method.brand} •••• ${method.last4}`
      : isPix
        ? "Pix"
        : "Boleto bancário";
  const sub =
    method.kind === "card"
      ? `Expira em ${method.expiresAt}`
      : isPix
        ? `Chave ${method.keyType} · ${method.key}`
        : method.holder;
  const note = isPix
    ? "Escaneie o QR Code no app do seu banco para autorizar o débito recorrente. Os próximos ciclos são cobrados automaticamente."
    : method.kind === "boleto"
      ? "A cada ciclo, o boleto chega nos e-mails de faturamento."
      : "Já pode ser usado nas próximas cobranças desta organização.";

  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--bg-surface) text-(--accent-success)">
        <Icon name={isPix ? "qr_code_2" : "check_circle"} size={28} />
      </span>
      <div>
        <p className="m-0 body-md font-medium text-(--fg-primary)">
          {isPix ? "Autorize o Pix automático" : "Método adicionado"}
        </p>
        <p className="m-0 mt-1 max-w-[320px] body-xs text-(--fg-secondary)">
          {note}
        </p>
      </div>

      {isPix && method.kind === "pix" && <PixAuthorization pixKey={method.key} />}

      <div className="flex w-full items-center gap-3 rounded-xl border border-(--border-subtle) bg-(--bg-raised) p-3 text-left">
        {method.kind === "card" ? (
          <AwCardBrand
            brand={method.brand.toLowerCase() as AwCardBrandId}
            size="md"
          />
        ) : (
          <AwBrandLogo brand={isPix ? "pix" : "boleto"} size="md" />
        )}
        <div className="min-w-0 flex-1">
          <p className="m-0 body-sm font-medium tabular-nums text-(--fg-primary)">
            {label}
          </p>
          <p className="m-0 mt-0.5 truncate body-xs text-(--fg-tertiary)">
            {sub}
          </p>
        </div>
        {asDefault && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-(--bg-surface) px-2 py-0.5 aw-eyebrow text-(--fg-secondary)">
            <Icon
              name="check_circle"
              size={12}
              className="text-(--accent-success)"
            />
            Padrão
          </span>
        )}
      </div>
    </div>
  );
}

/** Autorização do Pix automático — mesmo padrão do checkout de Pix em
 *  histórico de faturas: QR + "copia e cola" pra aprovar no app do banco.
 *  O payload é um placeholder determinístico (o BR Code real vem do back). */
function PixAuthorization({ pixKey }: { pixKey: string }) {
  const copyPaste = "00020126580014br.gov.bcb.pix0136aswork-auth-" + pixKey;
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <AwQrPlaceholder px={168} ariaLabel="QR Code de autorização do Pix" />
      <CopyField label="Pix copia e cola" value={copyPaste} />
      <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-tertiary)">
        <Icon name="schedule" size={14} />
        Aguardando a autorização…
      </span>
    </div>
  );
}

/** Campo só-leitura com botão de copiar (mesmo do checkout de faturas). */
function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(value).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      },
      () => {},
    );
  };
  return (
    <div className="flex w-full items-center gap-2 rounded-lg border border-(--border-subtle) bg-(--bg-muted) px-3 py-2">
      <div className="min-w-0 flex-1 text-left">
        <p className="m-0 body-xs text-(--fg-tertiary)">{label}</p>
        <p className="m-0 truncate body-xs font-medium tabular-nums text-(--fg-primary)">
          {value}
        </p>
      </div>
      <AwButton size="sm" variant="ghost" iconLeft={copied ? "check" : "content_copy"} onClick={copy}>
        {copied ? "Copiado" : "Copiar"}
      </AwButton>
    </div>
  );
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
  takenKinds,
}: {
  kind: MethodKind;
  onKindChange: (k: MethodKind) => void;
  takenKinds: MethodKind[];
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
          // PayPal ainda não está disponível — fica desabilitado como "em breve".
          const comingSoon = opt.comingSoon === true;
          // Boleto e Pix são únicos (se um dia voltarem ao seletor): trava se já
          // existe. Hoje o seletor só tem cartão + PayPal, então isto não dispara.
          const taken =
            !comingSoon &&
            SINGLE_INSTANCE_KINDS.includes(opt.id as MethodKind) &&
            takenKinds.includes(opt.id as MethodKind);
          const disabled = comingSoon || taken;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              aria-disabled={disabled}
              onClick={() => !disabled && onKindChange(opt.id as MethodKind)}
              className={
                "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-aw-fast " +
                (disabled
                  ? "cursor-not-allowed border-(--border-subtle) opacity-55"
                  : selected
                    ? "border-(--border-strong) bg-(--bg-hover)"
                    : "border-(--border-subtle) hover:border-(--border-default) hover:bg-(--bg-hover)")
              }
            >
              <AwBrandLogo brand={opt.brand} size="md" />
              <div className="min-w-0 flex-1">
                <p className="m-0 flex items-center gap-2 body-sm font-medium text-(--fg-primary)">
                  {opt.label}
                  {comingSoon ? (
                    <span className="rounded-full bg-(--bg-muted) px-1.5 py-0.5 body-xs font-normal text-(--fg-tertiary)">
                      Em breve
                    </span>
                  ) : taken ? (
                    <span className="rounded-full bg-(--bg-muted) px-1.5 py-0.5 body-xs font-normal text-(--fg-tertiary)">
                      Já adicionado
                    </span>
                  ) : null}
                </p>
                <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
                  {taken
                    ? "Só é possível ter um por conta. Remova o atual para trocar."
                    : opt.description}
                </p>
              </div>
              {!disabled && (
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
              )}
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
              autoComplete="cc-number"
              inputMode="numeric"
              invalid={!!errors.number}
              value={number}
              onChange={(e) => onNumber(formatCardNumber(e.target.value))}
              style={{ paddingLeft: 44 }}
              autoFocus
            />
            {/* O slot da esquerda começa com o ícone genérico e, assim que o BIN
                identifica a marca, é substituído pela bandeira — sem deslocar os
                dígitos (paddingLeft constante). */}
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              {brand === "unknown" ? (
                <Icon
                  name="credit_card"
                  size={18}
                  className="text-(--fg-tertiary)"
                />
              ) : (
                <AwCardBrand brand={brand} size="sm" />
              )}
            </span>
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
  setAsDefault,
  onSetAsDefaultChange,
}: {
  setAsDefault: boolean;
  onSetAsDefaultChange: (v: boolean) => void;
}) {
  // Boleto não coleta nada: usamos os dados de faturamento que a organização já
  // tem. O usuário só revisa (read-only) e confirma.
  return (
    <>
      <p className="m-0 body-xs text-(--fg-secondary)">
        A cada ciclo, geramos um boleto registrado e enviamos para os e-mails de
        faturamento. O pagamento compensa em até 3 dias úteis.
      </p>

      <section className="flex flex-col gap-2">
        <span className="aw-eyebrow text-(--fg-tertiary)">
          Dados de faturamento da organização
        </span>
        <dl className="m-0 flex flex-col">
          <div className="flex items-center justify-between gap-4 border-t border-(--border-subtle) py-2.5 first:border-t-0">
            <dt className="body-sm text-(--fg-tertiary)">Titular</dt>
            <dd className="m-0 body-sm font-medium text-(--fg-primary)">
              {BILLING_PROFILE.legalName}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-(--border-subtle) py-2.5">
            <dt className="body-sm text-(--fg-tertiary)">CPF / CNPJ</dt>
            <dd className="m-0 body-sm font-medium tabular-nums text-(--fg-primary)">
              {BILLING_PROFILE.taxId}
            </dd>
          </div>
        </dl>
        <p className="m-0 flex items-start gap-1.5 body-xs text-(--fg-tertiary)">
          <Icon name="info" size={13} className="mt-px shrink-0" />
          Usamos os dados de faturamento da organização. Para alterá-los, edite o
          perfil de faturamento.
        </p>
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
