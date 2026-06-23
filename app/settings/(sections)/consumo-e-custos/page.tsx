"use client";

import { SettingsPageHeader } from "../_components/shared";
import { CostBreakdown } from "../financeiro/_components/CostBreakdown";

/**
 * "Consumo e custos" — seção própria na sidebar (irmã do Financeiro), fora do
 * shell de tabs do Financeiro. É a casa única do detalhamento de auditoria
 * financeira (a antiga rota /settings/financeiro/detalhamento foi removida); o
 * corpo vem do componente compartilhado <CostBreakdown>. O atalho da Visão
 * geral ("Consumo e custos →") aponta para cá.
 */
export default function ConsumoECustosPage() {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pb-32 pt-14">
      <SettingsPageHeader
        title="Consumo e custos"
        description="Concilie o que foi usado com o que foi cobrado, item a item. Cobre o uso variável do período — o plano fixo aparece no Financeiro e na fatura."
      />
      <CostBreakdown />
    </div>
  );
}
