"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AwButton } from "@/components/ui/AwButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { INVOICE_HISTORY } from "./data";

/**
 * Banner de irregularidade de pagamento — vive no canto direito do cabeçalho
 * do Financeiro (a nível do layout), então acompanha o usuário por todas as
 * subrotas. Não renderiza quando não há pendência.
 *
 * Três versões de estado por SEVERIDADE (pedido do Greg / spec do ChatGPT): a
 * mensagem sobe de tom conforme a consequência operacional, em vez de um banner
 * genérico pra tudo.
 *  - `pending`  (aviso leve)   — há fatura a vencer, mas os agentes seguem ativos.
 *  - `failing`  (aviso crítico) — cobrança recusada; ainda dá pra resolver antes da pausa.
 *  - `paused`   (erro/bloqueio) — pagamento vencido/falhou e os agentes já foram pausados.
 */
type BannerSeverity = "pending" | "failing" | "paused";

const BANNER_STATES: Record<
  BannerSeverity,
  {
    title: string;
    description: (n: number) => string;
    tooltip: string;
    /** bg do banner + bg/cor do badge de ícone, por severidade. */
    wrap: string;
    iconWrap: string;
  }
> = {
  pending: {
    title: "Pagamento pendente",
    description: (n) =>
      n === 1
        ? "1 fatura precisa ser regularizada para evitar a pausa dos agentes."
        : `${n} faturas precisam ser regularizadas para evitar a pausa dos agentes.`,
    tooltip:
      "Se o pagamento não for confirmado até o vencimento, os agentes podem ser pausados por segurança até a regularização.",
    wrap: "bg-(--aw-amber-100)",
    iconWrap: "bg-(--aw-amber-200) text-(--aw-amber-700)",
  },
  failing: {
    title: "Falha no pagamento",
    description: () =>
      "Atualize o método de pagamento ou regularize as faturas para evitar a pausa dos agentes.",
    tooltip:
      "A cobrança não foi aprovada pelo método cadastrado. Se a pendência não for resolvida, os agentes podem ser pausados por segurança.",
    wrap: "bg-(--aw-amber-100)",
    iconWrap: "bg-(--aw-amber-200) text-(--aw-amber-700)",
  },
  paused: {
    title: "Agentes pausados por pagamento pendente",
    description: (n) =>
      n === 1
        ? "Regularize 1 fatura para reativar os agentes desta organização."
        : `Regularize ${n} faturas para reativar os agentes desta organização.`,
    tooltip:
      "Os agentes foram pausados por segurança porque há pagamentos vencidos, expirados ou não confirmados. Após a regularização, eles serão reativados conforme o processamento do pagamento.",
    wrap: "bg-(--aw-red-100)",
    iconWrap: "bg-(--aw-red-200) text-(--aw-red-700)",
  },
};

export function PaymentPendingBanner() {
  const failing = INVOICE_HISTORY.filter(
    (r) => r.status === "Falha no Pagamento",
  ).length;
  const overdue = INVOICE_HISTORY.filter((r) => r.status === "Em atraso").length;
  const pending = failing + overdue;

  if (pending === 0) return null;

  // Severidade pelo pior caso: uma cobrança que falhou já pausa os agentes por
  // segurança (estado que o Greg quer deixar explícito). Só atraso, sem falha,
  // fica no aviso leve. O estado intermediário `failing` fica disponível pra
  // quando houver sinal de cartão recusado ainda sem pausa.
  const severity: BannerSeverity = failing > 0 ? "paused" : "pending";
  const state = BANNER_STATES[severity];

  return (
    <div
      className={`flex shrink-0 items-center gap-3 rounded-xl py-2 pr-2 pl-3 ${state.wrap}`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${state.iconWrap}`}
      >
        <Icon name="warning" size={18} />
      </span>
      <Link
        href="/settings/financeiro/historico-faturas"
        className="flex min-w-0 flex-col"
      >
        <span className="flex items-center gap-1 body-sm font-medium text-(--fg-primary)">
          {state.title}
          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  role="img"
                  aria-label="Por que os agentes podem ser pausados"
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex text-(--fg-tertiary) hover:text-(--fg-secondary)"
                >
                  <Icon name="info" size={13} />
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-[300px] border-(--border-subtle) bg-(--bg-raised) font-normal text-(--fg-secondary)"
              >
                {state.tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
        <span className="body-xs text-(--fg-secondary)">
          {state.description(pending)}
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
