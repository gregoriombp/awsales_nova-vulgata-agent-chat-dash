"use client";

import * as React from "react";
import { AwCard } from "@/components/ui/AwCard";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Formatação local em BRL — mantém o componente independente do data.ts do
 *  feature de Financeiro. */
function brl(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Card de consumo variável da visão geral do Financeiro, em dois modos:
 *
 * - **prepaid** (conta com teto): mostra "Limite de uso antes da cobrança",
 *   a barra de uso (com o trecho de créditos/cupons já abatidos em destaque)
 *   e quanto resta antes da próxima cobrança automática.
 * - **postpaid** (conta com linha de crédito): não há teto — mostra "Uso
 *   pós-pago ativo / Ilimitado", a descrição do modelo e a data da próxima
 *   cobrança. Os créditos do ciclo seguem visíveis (também abatem o pós-pago).
 *
 * Pedido do Genê/Greg (cmt-669af430): variante pós-paga do card de consumo.
 */
export type AwConsumoVariavelCardProps =
  | {
      mode: "prepaid";
      /** Total de uso variável consumido no ciclo. */
      used: number;
      /** Teto de uso variável antes da cobrança automática. */
      limit: number;
      /** Créditos e cupons já abatidos no ciclo. */
      discount: number;
    }
  | {
      mode: "postpaid";
      /** Créditos e cupons do ciclo (também abatem o pós-pago). */
      discount: number;
      /** Data da próxima cobrança, ex.: "28/05/2026". */
      nextChargeAt: string;
    };

export function AwConsumoVariavelCard(props: AwConsumoVariavelCardProps) {
  if (props.mode === "postpaid") {
    return (
      <PostpagoCard discount={props.discount} nextChargeAt={props.nextChargeAt} />
    );
  }
  return (
    <PrepagoCard used={props.used} limit={props.limit} discount={props.discount} />
  );
}

function PrepagoCard({
  used,
  limit,
  discount,
}: {
  used: number;
  limit: number;
  discount: number;
}) {
  const remaining = Math.max(limit - used, 0);

  return (
    <AwCard className="flex flex-col gap-4 border-(--aw-gray-25) px-6! py-4!">
      <div className="flex items-baseline justify-between gap-3">
        <h6 className="m-0 flex items-center gap-1.5 body-lg font-medium text-(--fg-primary)">
          Limite de uso antes da cobrança
          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="O que é uso variável"
                  className="inline-flex text-(--fg-tertiary) hover:text-(--fg-primary)"
                >
                  <Icon name="info" size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[280px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
              >Quando sua conta atingir este limite de uso variável, uma nova cobrança será feita automaticamente pelo método de pagamento cadastrado. Se a cobrança não for aprovada ou confirmada — como em casos de cartão recusado, boleto vencido ou Pix expirado — seus agentes podem ser pausados por segurança até que o pagamento seja regularizado.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h6>
        <span className="body-sm tabular-nums text-(--fg-secondary)">
          <strong className="font-medium text-(--fg-primary)">
            {brl(used)}
          </strong>{" "}
          de {brl(limit)}
        </span>
      </div>

      {/* Barra de uso única: o trilho é o limite do ciclo, a parte preenchida é
          o total usado. O trecho final em verde é o desconto (créditos/cupons)
          já abatido — o desconto fica visível no próprio gráfico, sem somar
          outra barra (pedido do Greg). */}
      <UsageBar used={used} discount={discount} limit={limit} />

      {/* Embaixo da barra: "Restam..." à esquerda e o desconto como tag (ícone
          de cupom) à direita — claro e visível, sem sobrecarregar o card. */}
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 body-xs tabular-nums text-(--fg-tertiary)">
          Restam {brl(remaining)} antes da próxima cobrança.
        </p>
        <span className="inline-flex shrink-0 items-center gap-1 body-xs">
          <Icon
            name="local_offer"
            size={13}
            className="text-(--accent-success)"
          />
          <strong className="font-medium tabular-nums text-(--accent-success)">
            {brl(discount)}
          </strong>
          <span className="text-(--fg-tertiary)">em créditos</span>
        </span>
      </div>
    </AwCard>
  );
}

function PostpagoCard({
  discount,
  nextChargeAt,
}: {
  discount: number;
  nextChargeAt: string;
}) {
  return (
    <AwCard className="flex flex-col gap-4 border-(--aw-gray-25) px-6! py-4!">
      <div className="flex items-baseline justify-between gap-3">
        <h6 className="m-0 flex items-center gap-1.5 body-lg font-medium text-(--fg-primary)">
          Uso pós-pago ativo
          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Como funciona o uso pós-pago"
                  className="inline-flex text-(--fg-tertiary) hover:text-(--fg-primary)"
                >
                  <Icon name="info" size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[300px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
              >Esta conta possui uso pós-pago com linha de crédito ativa. Ao final do ciclo mensal, a cobrança é emitida na data acordada com o cliente. Se o boleto vencer ou o Pix expirar sem confirmação de pagamento, os agentes podem ser pausados por segurança até que a pendência seja regularizada.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h6>
        <AwPill variant="live">Pós-pago</AwPill>
      </div>

      <div className="flex flex-col gap-1">
        <p className="m-0 text-(length:--h5-size) font-semibold leading-none tracking-heading-tight text-(--fg-primary)">
          Ilimitado
        </p>
        <p className="m-0 body-sm text-(--fg-secondary) text-pretty">
          Sua conta opera em modelo pós-pago, com cobrança mensal na data
          acordada.
        </p>
      </div>

      {/* Mesma linha de base do card pré-pago: data da cobrança à esquerda e os
          créditos do ciclo como tag à direita. */}
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 body-xs tabular-nums text-(--fg-tertiary)">
          Próxima cobrança em {nextChargeAt}.
        </p>
        <span className="inline-flex shrink-0 items-center gap-1 body-xs">
          <Icon
            name="local_offer"
            size={13}
            className="text-(--accent-success)"
          />
          <strong className="font-medium tabular-nums text-(--accent-success)">
            {brl(discount)}
          </strong>
          <span className="text-(--fg-tertiary)">em créditos</span>
        </span>
      </div>
    </AwCard>
  );
}

/**
 * Barra de uso única. O trilho é o limite do ciclo; a parte preenchida é o
 * total usado, dividida em dois trechos contíguos: o líquido (neutro) e, logo
 * depois, o desconto já aplicado em verde — assim o abatimento de créditos e
 * cupons aparece dentro do próprio gráfico. Tudo por token.
 */
function UsageBar({
  used,
  discount,
  limit,
}: {
  used: number;
  discount: number;
  limit: number;
}) {
  const scaleMax = Math.max(limit, used);
  // O desconto é um trecho da parte usada (nunca maior que ela).
  const disc = Math.min(discount, used);
  const net = Math.max(used - disc, 0);
  const netPct = scaleMax > 0 ? (net / scaleMax) * 100 : 0;
  const discPct = scaleMax > 0 ? (disc / scaleMax) * 100 : 0;

  return (
    // Tooltip por trecho da barra (pedido do Greg): o verde sólido é o uso
    // variável consumido; o trecho hachurado é o bônus já abatido.
    <TooltipProvider delayDuration={120}>
      <div
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-(--bg-muted)"
        role="img"
        aria-label={`Usado ${brl(used)} de ${brl(limit)}, dos quais ${brl(discount)} em créditos e cupons já aplicados.`}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="h-full cursor-default bg-(--accent-success) transition-[width] duration-500 ease-out"
              style={{ width: `${netPct}%` }}
            />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-[260px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
          >
            <strong className="font-medium text-(--fg-primary)">
              Uso variável consumido
            </strong>{" "}
            · {brl(net)}. É o que conta pra próxima cobrança.
          </TooltipContent>
        </Tooltip>
        {/* Trecho do desconto: faixa clara hachurada (créditos/cupons já abatidos),
            como no mid-fi — destaca o abatimento sem competir com o uso líquido. */}
        {disc > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="h-full cursor-default transition-[width] duration-500 ease-out"
                style={{
                  width: `${discPct}%`,
                  backgroundColor: "var(--aw-emerald-150)",
                  backgroundImage:
                    "repeating-linear-gradient(45deg, var(--aw-emerald-400) 0, var(--aw-emerald-400) 1.5px, transparent 1.5px, transparent 5px)",
                }}
              />
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-[260px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
            >
              <strong className="font-medium text-(--fg-primary)">Bônus</strong>{" "}
              · {brl(disc)} em créditos e cupons já abatidos.
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
