import * as React from "react";
import Link from "next/link";
import { AwCard } from "@/components/ui/AwCard";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwProgress } from "@/components/ui/AwProgress";
import { AwPlanIcon, type PlanKey } from "@/components/ui/AwPlanIcon";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const defaultFormatValue = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);

export type AwPlanSummaryCardProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> & {
  /** Plano atual — controla qual marca o AwPlanIcon desenha. */
  plan: PlanKey;
  /** Nome exibido do plano (ex.: "Pro", "Enterprise"). */
  planName: string;
  /** Texto do selo de status (ex.: "Ativo"). */
  status: string;
  /** Variante visual do AwPill de status. Default `"live"`. */
  statusVariant?: AwPillVariant;
  /** Valor mensal do plano. Formatado por `formatValue`. */
  monthly: number;
  /** Data de renovação, já formatada (ex.: "19/06/2026"). */
  renewsAt: string;
  /** Consumo variável acumulado no ciclo. Formatado por `formatValue`. */
  accumulated: number;
  /** Limite de consumo variável do ciclo. Formatado por `formatValue`. */
  limit: number;
  /** Destino do botão "Comparar planos". Só renderiza o botão se passado. */
  comparePlansHref?: string;
  /**
   * Formata valores monetários. Default: Intl.NumberFormat pt-BR / BRL.
   */
  formatValue?: (n: number) => string;
};

/**
 * Card escuro de resumo do plano — eyebrow "Seu plano", ícone do plano + nome +
 * status, linha de preço/renovação e, no rodapé, o consumo variável do ciclo com
 * barra de progresso e um link opcional "Comparar planos".
 *
 * Desacoplado de qualquer feature: defina os próprios dados e passe um
 * `formatValue` se a moeda não for BRL.
 */
export function AwPlanSummaryCard({
  plan,
  planName,
  status,
  statusVariant = "live",
  monthly,
  renewsAt,
  accumulated,
  limit,
  comparePlansHref,
  formatValue = defaultFormatValue,
  className,
  ...rest
}: AwPlanSummaryCardProps) {
  return (
    <AwCard
      className={cn(
        "relative isolate overflow-hidden bg-(--bg-inverse)! p-6! text-(--fg-on-inverse)",
        className,
      )}
      {...rest}
    >
      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="aw-eyebrow text-(--fg-on-inverse) opacity-55">
            Seu plano
          </span>
          <div className="flex items-center gap-3">
            <AwPlanIcon
              plan={plan}
              variant="dark"
              size={40}
              className="shrink-0"
            />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h2 className="m-0 display-sm text-(--fg-on-inverse)">
                {planName}
              </h2>
              <AwPill variant={statusVariant}>{status}</AwPill>
            </div>
          </div>
          <p className="m-0 body-sm tabular-nums text-(--fg-on-inverse) opacity-65">
            <strong className="font-medium opacity-100">
              {formatValue(monthly)}
            </strong>{" "}
            /mês · renova em {renewsAt}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="body-sm text-(--fg-on-inverse) opacity-65">
                Consumo variável do ciclo
              </span>
              <span className="body-sm tabular-nums text-(--fg-on-inverse) opacity-55">
                <strong className="font-medium opacity-100">
                  {formatValue(accumulated)}
                </strong>{" "}
                / {formatValue(limit)}
              </span>
            </div>
            <AwProgress
              value={accumulated}
              max={limit}
              className="[&_.aw-progress]:bg-(--fg-on-inverse)/15 [&_.aw-progress__fill]:bg-(--fg-on-inverse)!"
            />
          </div>

          {comparePlansHref && (
            <Link
              href={comparePlansHref}
              className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-(--border-inverse) px-4 py-2 body-sm font-medium text-(--fg-on-inverse) transition-colors duration-aw-fast hover:bg-(--fg-on-inverse)/10"
            >
              <Icon name="compare_arrows" size={16} />
              Comparar planos
            </Link>
          )}
        </div>
      </div>
    </AwCard>
  );
}
