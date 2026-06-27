"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { INVOICE_HISTORY } from "./data";

/**
 * Banner de irregularidade de pagamento — vive no canto direito do cabeçalho
 * do Financeiro (a nível do layout), então acompanha o usuário por todas as
 * subrotas, não só no histórico. Compacto e discreto quando não há pendência
 * (não renderiza). Clicar leva ao histórico, onde a regularização acontece.
 */
export function PaymentPendingBanner() {
  const pending = INVOICE_HISTORY.filter(
    (r) => r.status === "Em atraso" || r.status === "Falha no Pagamento",
  ).length;

  if (pending === 0) return null;

  return (
    <Link
      href="/settings/financeiro/historico-faturas"
      className="group flex shrink-0 items-center gap-3 rounded-xl border border-(--aw-amber-200) bg-(--aw-amber-100) px-4 py-2.5 transition-colors hover:border-(--aw-amber-300)"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--aw-amber-200) text-(--aw-amber-700)">
        <Icon name="warning" size={18} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="body-sm font-medium text-(--fg-primary)">
          Pagamento pendente
        </span>
        <span className="body-xs text-(--fg-secondary)">
          {pending === 1
            ? "1 fatura precisa ser regularizada"
            : `${pending} faturas precisam ser regularizadas`}
        </span>
      </span>
      <Icon
        name="chevron_right"
        size={18}
        className="shrink-0 text-(--fg-tertiary) transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
