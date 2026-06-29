"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AwButton } from "@/components/ui/AwButton";
import { INVOICE_HISTORY } from "./data";

/**
 * Banner de irregularidade de pagamento — vive no canto direito do cabeçalho
 * do Financeiro (a nível do layout), então acompanha o usuário por todas as
 * subrotas, não só no histórico. Compacto e discreto quando não há pendência
 * (não renderiza). O texto leva ao histórico; o botão abre direto o fluxo de
 * regularização (via `?regularizar=1`, lido na página de histórico).
 */
export function PaymentPendingBanner() {
  const pending = INVOICE_HISTORY.filter(
    (r) => r.status === "Em atraso" || r.status === "Falha no Pagamento",
  ).length;

  if (pending === 0) return null;

  return (
    <div className="flex shrink-0 items-center gap-3 rounded-xl bg-(--aw-amber-100) py-2 pr-2 pl-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--aw-amber-200) text-(--aw-amber-700)">
        <Icon name="warning" size={18} />
      </span>
      <Link href="/settings/financeiro/historico-faturas" className="flex min-w-0 flex-col">
        <span className="body-sm font-medium text-(--fg-primary)">
          Pagamento pendente
        </span>
        <span className="body-xs text-(--fg-secondary)">
          {pending === 1
            ? "1 fatura precisa ser regularizada"
            : `${pending} faturas precisam ser regularizadas`}
        </span>
      </Link>
      <AwButton
        asChild
        variant="primary"
        size="sm"
        iconLeft="payments"
        className="ml-1 shrink-0"
      >
        <Link href="/settings/financeiro/historico-faturas?regularizar=1">
          Regularizar pagamento
        </Link>
      </AwButton>
    </div>
  );
}
