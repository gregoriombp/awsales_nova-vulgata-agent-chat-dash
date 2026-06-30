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
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import {
  AddPaymentMethodModal,
  type NewPaymentMethod,
} from "../_components/AddPaymentMethodModal";
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

/** Rótulo curto de identificação de um método, independente do tipo. */
function methodTitle(m: PaymentMethod): string {
  switch (m.kind) {
    case "card":
      return `${m.brand} •••• ${m.last4}`;
    case "boleto":
      return "Boleto bancário";
    case "pix":
      return "Pix automático";
  }
}

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
  // Trocar o método padrão muda pra onde a cobrança vai primeiro — pede
  // confirmação antes (pedido do Greg), igual ao fluxo de remover.
  const [pendingDefaultId, setPendingDefaultId] = React.useState<string | null>(
    null,
  );
  // Ao remover o método PADRÃO (havendo outros), não promovemos ninguém
  // automaticamente: abrimos um 2º modal pra o usuário escolher o novo
  // principal — um já existente ou um novo método.
  const [choosingPrincipal, setChoosingPrincipal] = React.useState(false);
  // Quando o usuário escolhe "adicionar novo método" como novo principal,
  // forçamos o recém-criado a virar o padrão.
  const [addForcesPrincipal, setAddForcesPrincipal] = React.useState(false);

  const pendingRemove =
    pendingRemoveId === null
      ? null
      : (methods.find((m) => m.id === pendingRemoveId) ?? null);

  const pendingDefault =
    pendingDefaultId === null
      ? null
      : (methods.find((m) => m.id === pendingDefaultId) ?? null);

  const setAsDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const confirmDefault = () => {
    if (pendingDefaultId !== null) setAsDefault(pendingDefaultId);
    setPendingDefaultId(null);
  };

  const confirmRemove = () => {
    if (pendingRemoveId === null) return;
    const removed = methods.find((m) => m.id === pendingRemoveId);
    const remaining = methods.filter((m) => m.id !== pendingRemoveId);
    setMethods(remaining);
    setPendingRemoveId(null);
    // Removeu o padrão e ainda há outros → pergunta quem vira o principal.
    // (Caso contrário, segue sem novo padrão — a rede de segurança abaixo
    // promove o primeiro se ninguém ficar marcado.)
    if (removed?.isDefault && remaining.length > 0) {
      setChoosingPrincipal(true);
    }
  };

  const choosePrincipal = (id: string) => {
    setAsDefault(id);
    setChoosingPrincipal(false);
  };

  const addNewPrincipal = () => {
    setChoosingPrincipal(false);
    setAddForcesPrincipal(true);
    setAddOpen(true);
  };

  // Rede de segurança: fora do fluxo de escolha (modal fechado) e do de
  // adicionar, nunca deixamos a lista sem um padrão.
  React.useEffect(() => {
    if (
      !choosingPrincipal &&
      !addOpen &&
      methods.length > 0 &&
      !methods.some((m) => m.isDefault)
    ) {
      setMethods((prev) =>
        prev.length > 0 && !prev.some((m) => m.isDefault)
          ? [{ ...prev[0], isDefault: true }, ...prev.slice(1)]
          : prev,
      );
    }
  }, [choosingPrincipal, addOpen, methods]);

  const addMethod = (draft: NewPaymentMethod, asDefault: boolean) => {
    setMethods((prev) => {
      const id = `pm-${Date.now()}`;
      const isDefault = asDefault || addForcesPrincipal || prev.length === 0;
      let fresh: PaymentMethod;
      if (draft.kind === "card") {
        fresh = {
          kind: "card",
          id,
          brand: draft.brand,
          last4: draft.last4,
          expiresAt: draft.expiresAt,
          isDefault,
        };
      } else if (draft.kind === "boleto") {
        fresh = {
          kind: "boleto",
          id,
          holder: draft.holder,
          taxId: draft.taxId,
          isDefault,
        };
      } else {
        fresh = {
          kind: "pix",
          id,
          keyType: draft.keyType,
          key: draft.key,
          isDefault,
        };
      }
      const cleared = isDefault
        ? prev.map((m) => ({ ...m, isDefault: false }))
        : prev;
      return [...cleared, fresh];
    });
    // Não fecha aqui: o modal mostra a etapa de confirmação e fecha pelo
    // botão "Concluir" (onClose).
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
                  onSetDefault={() => setPendingDefaultId(m.id)}
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
        onClose={() => {
          setAddOpen(false);
          setAddForcesPrincipal(false);
        }}
        onAdd={addMethod}
      />

      <RemovePaymentMethodModal
        method={pendingRemove}
        onClose={() => setPendingRemoveId(null)}
        onConfirm={confirmRemove}
      />

      <ChoosePrincipalModal
        open={choosingPrincipal}
        methods={methods}
        onClose={() => setChoosingPrincipal(false)}
        onChoose={choosePrincipal}
        onAddNew={addNewPrincipal}
      />

      <AwModal
        open={!!pendingDefault}
        onClose={() => setPendingDefaultId(null)}
        size="md"
        title="Alterar a forma principal de pagamento?"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <AwButton variant="ghost" onClick={() => setPendingDefaultId(null)}>
              Cancelar
            </AwButton>
            <AwButton variant="primary" onClick={confirmDefault}>
              Definir como principal
            </AwButton>
          </div>
        }
      >
        <p className="m-0 body-sm text-(--fg-secondary)">
          {pendingDefault && (
            <>
              <strong className="font-medium text-(--fg-primary)">
                {methodTitle(pendingDefault)}
              </strong>{" "}
              passa a ser a forma principal — as próximas cobranças tentam este
              método primeiro. Você pode trocar de volta quando quiser.
            </>
          )}
        </p>
      </AwModal>
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
          aria-label={`Opções de ${methodTitle(method)}`}
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

  // Selo de método principal — destaca o card sem precisar do desenho de cartão.
  const padraoBadge = (
    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-(--bg-surface) px-2 py-0.5 aw-eyebrow text-(--fg-secondary)">
      <Icon name="check_circle" size={12} className="text-(--accent-success)" />
      Padrão
    </span>
  );

  // Boleto/Pix: marca + rótulo, sem validade.
  if (method.kind !== "card") {
    const isPix = method.kind === "pix";
    const subtitle = isPix
      ? `Chave ${method.keyType} · ${method.key}`
      : `${method.holder} · ${method.taxId}`;
    return (
      <div className="flex max-w-md items-center gap-4 rounded-2xl border border-(--border-default) bg-(--bg-raised) p-5 shadow-sm">
        <AwBrandLogo brand={isPix ? "pix" : "boleto"} size="md" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {padraoBadge}
          <p className="m-0 body-lg font-medium text-(--fg-primary)">
            {isPix ? "Pix automático" : "Boleto bancário"}
          </p>
          <p className="m-0 truncate body-sm text-(--fg-tertiary)">{subtitle}</p>
        </div>
        <CardActionsMenu {...props} />
      </div>
    );
  }

  const expired = expiryYear(method.expiresAt) < new Date().getFullYear();
  const expiringSoon = isExpiringSoon(method.expiresAt);

  return (
    <div className="flex max-w-md items-center gap-4 rounded-2xl border border-(--border-default) bg-(--bg-raised) p-5 shadow-sm">
      <AwCardBrand brand={BRAND_TO_AW[method.brand]} size="md" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {padraoBadge}
        <p className="m-0 body-lg font-medium tabular-nums text-(--fg-primary)">
          {method.brand} •••• {method.last4}
        </p>
        <p className="m-0 body-sm text-(--fg-tertiary)">
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

function SecondaryCard(props: MethodCardProps) {
  const { method } = props;

  // Boleto/Pix: logo da marca + rótulo, sem validade.
  if (method.kind !== "card") {
    const isPix = method.kind === "pix";
    const subtitle = isPix
      ? `Chave ${method.keyType} · ${method.key}`
      : `${method.holder}`;
    return (
      <div className="flex items-center gap-3 rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-4">
        <AwBrandLogo brand={isPix ? "pix" : "boleto"} size="md" />
        <div className="min-w-0 flex-1">
          <p className="m-0 body-sm font-medium text-(--fg-primary)">
            {isPix ? "Pix automático" : "Boleto bancário"}
          </p>
          <p className="m-0 mt-0.5 truncate body-xs text-(--fg-tertiary)">
            {subtitle}
          </p>
        </div>
        <CardActionsMenu {...props} />
      </div>
    );
  }

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
      <span className="body-xs font-medium">Adicionar método</span>
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
        managerPhoto={ONBOARDING_ORG.accountManager.photo}
        managerInitials={ONBOARDING_ORG.accountManager.initials}
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
          {/* Flat: sem caixa nem sombra (pedido do Greg / direção do Germano) —
              só uma divisória abaixo do bloco do método. Bandeira sm + título
              body-sm pra equilibrar a hierarquia com a imagem. */}
          <div className="flex items-center gap-3 border-b border-(--border-subtle) pb-3">
            {method.kind === "card" ? (
              <AwCardBrand brand={BRAND_TO_AW[method.brand]} size="sm" />
            ) : (
              <AwBrandLogo
                brand={method.kind === "pix" ? "pix" : "boleto"}
                size="sm"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="m-0 body-sm font-medium tabular-nums text-(--fg-primary)">
                {methodTitle(method)}
              </p>
              <p className="m-0 body-xs text-(--fg-tertiary)">
                {method.kind === "card"
                  ? `Expira em ${method.expiresAt}`
                  : method.kind === "pix"
                    ? `Chave ${method.keyType} · ${method.key}`
                    : `${method.holder} · ${method.taxId}`}
              </p>
            </div>
            {method.isDefault && (
              <AwPill variant="live" dot={false}>
                Padrão
              </AwPill>
            )}
          </div>
          <p className="m-0 body-sm text-(--fg-primary)">
            Você vai remover este método das cobranças desta organização.
          </p>
          {method.isDefault && (
            <p className="m-0 body-xs text-(--accent-warning)">
              Este é o método padrão. Depois de remover, você escolhe qual
              método vira o principal.
            </p>
          )}
        </div>
      )}
    </AwModal>
  );
}

/* -----------------------------------------------------------------
 * Escolher novo principal — abre ao remover o método padrão. Lista os
 * métodos restantes como radio-cards (mesma anatomia do TypeStep do
 * "Adicionar método") e oferece adicionar um novo no mesmo fluxo.
 * ----------------------------------------------------------------- */

function ChoosePrincipalModal({
  open,
  methods,
  onClose,
  onChoose,
  onAddNew,
}: {
  open: boolean;
  methods: PaymentMethod[];
  onClose: () => void;
  onChoose: (id: string) => void;
  onAddNew: () => void;
}) {
  const [selected, setSelected] = React.useState<string | null>(null);

  // Zera a seleção a cada abertura.
  React.useEffect(() => {
    if (open) setSelected(null);
  }, [open]);

  const confirm = () => {
    if (selected) onChoose(selected);
  };

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Qual método vira o principal?"
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <AwButton variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton variant="primary" disabled={!selected} onClick={confirm}>
            Confirmar
          </AwButton>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="m-0 body-sm text-(--fg-secondary)">
          Escolha qual forma de pagamento assume como principal — as próximas
          cobranças tentam este método primeiro.
        </p>
        <div
          role="radiogroup"
          aria-label="Novo método principal"
          className="flex flex-col gap-2"
        >
          {methods.map((m) => {
            const isSel = m.id === selected;
            const subtitle =
              m.kind === "card"
                ? `Expira em ${m.expiresAt}`
                : m.kind === "pix"
                  ? `Chave ${m.keyType} · ${m.key}`
                  : m.holder;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={isSel}
                onClick={() => setSelected(m.id)}
                className={
                  "flex items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors duration-aw-fast " +
                  (isSel
                    ? "border-(--border-strong) bg-(--bg-hover)"
                    : "border-(--border-subtle) hover:border-(--border-default) hover:bg-(--bg-hover)")
                }
              >
                {m.kind === "card" ? (
                  <AwCardBrand brand={BRAND_TO_AW[m.brand]} size="sm" />
                ) : (
                  <AwBrandLogo
                    brand={m.kind === "pix" ? "pix" : "boleto"}
                    size="sm"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="m-0 body-sm font-medium tabular-nums text-(--fg-primary)">
                    {methodTitle(m)}
                  </p>
                  <p className="m-0 mt-0.5 truncate body-xs text-(--fg-tertiary)">
                    {subtitle}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className={
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-aw-fast " +
                    (isSel
                      ? "border-(--fg-primary) bg-(--fg-primary)"
                      : "border-(--border-default)")
                  }
                >
                  {isSel && (
                    <span className="h-1.5 w-1.5 rounded-full bg-(--bg-raised)" />
                  )}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={onAddNew}
            className="mt-1 flex items-center gap-2 rounded-md border border-dashed border-(--border-subtle) px-3 py-2.5 text-left text-(--fg-secondary) transition-colors duration-aw-fast hover:border-(--border-strong) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
          >
            <Icon name="add" size={18} />
            <span className="body-sm font-medium">Adicionar novo método</span>
          </button>
        </div>
      </div>
    </AwModal>
  );
}
