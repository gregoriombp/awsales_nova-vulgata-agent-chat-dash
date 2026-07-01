"use client";

import * as React from "react";
import { AwModal } from "@/components/ui/AwModal";
import { AwButton } from "@/components/ui/AwButton";
import { AwPill } from "@/components/ui/AwPill";
import { AwPlanIcon, type PlanKey } from "@/components/ui/AwPlanIcon";
import { Icon } from "@/components/ui/Icon";
import { brl, CURRENT_PLAN, PLAN_PHONE_LINE } from "./data";

/**
 * PlanDetailModal — detalhes do plano atual, aberto pelo link discreto no card
 * "Plano". Mostra preço, ciclo, desde quando e o que está incluso, e oferece
 * falar com o representante da conta (reusa o AwContactChannelModal via
 * `onContact`, gerido pelo card). Sem card-dentro-de-card: linhas e divisórias.
 */
export function PlanDetailModal({
  open,
  onClose,
  onContact,
}: {
  open: boolean;
  onClose: () => void;
  /** Abre o fluxo de contato com o representante (fecha este modal antes). */
  onContact: () => void;
}) {
  const plan = CURRENT_PLAN;
  const planKey: PlanKey = plan.name.toLowerCase().includes("enterprise")
    ? "enterprise"
    : plan.name.toLowerCase().includes("pro")
      ? "pro"
      : "starter";

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Detalhes do plano"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <span className="body-xs text-(--fg-tertiary)">
            Precisa mudar de plano ou tem dúvidas?
          </span>
          <AwButton variant="secondary" size="sm" iconLeft="support_agent" onClick={onContact}>
            Falar com representante
          </AwButton>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-(--bg-inverse)"
          >
            <AwPlanIcon plan={planKey} variant="dark" size={38} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="m-0 body-lg font-medium text-(--fg-primary)">
                {plan.name}
              </p>
              <AwPill variant="live">{plan.status}</AwPill>
            </div>
            <p className="m-0 mt-0.5 body-sm tabular-nums text-(--fg-secondary)">
              <strong className="font-medium text-(--fg-primary)">
                {brl(plan.monthly)}
              </strong>
              /mês
            </p>
          </div>
        </div>

        <dl className="m-0 flex flex-col gap-0">
          <DetailRow label="Ciclo de cobrança" value={plan.billingCycle} />
          {/* Linha telefônica: custo FIXO já embutido na mensalidade do plano —
              listado aqui pra dar visibilidade ao valor. Não é uso variável, por
              isso saiu do detalhamento de gasto variável. (cmt-6fdd2425) */}
          <DetailRow
            label="Linha telefônica"
            value={`${brl(PLAN_PHONE_LINE)} / mês · inclusa`}
          />
          <DetailRow label="Renova em" value={plan.nextChargeAt} />
          <DetailRow label="Cliente desde" value={plan.since} />
        </dl>

        <div className="flex flex-col gap-2">
          <span className="aw-eyebrow text-(--fg-tertiary)">Incluso no plano</span>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {plan.highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 body-sm text-(--fg-secondary)"
              >
                <Icon
                  name="check_circle"
                  size={16}
                  className="mt-0.5 shrink-0 text-(--accent-success)"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AwModal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-(--border-subtle) py-2.5 last:border-b-0">
      <dt className="body-sm text-(--fg-secondary)">{label}</dt>
      <dd className="m-0 body-sm font-medium tabular-nums text-(--fg-primary)">
        {value}
      </dd>
    </div>
  );
}
