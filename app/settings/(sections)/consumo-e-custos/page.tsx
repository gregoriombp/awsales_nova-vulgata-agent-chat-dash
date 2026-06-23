"use client";

import { SettingsPageHeader } from "../_components/shared";
import { CostBreakdown } from "../financeiro/_components/CostBreakdown";

/**
 * "Consumo e custos" — seção própria na sidebar (irmã do Financeiro), fora do
 * shell de tabs do Financeiro. Mostra o mesmo detalhamento de auditoria que a
 * rota /settings/financeiro/detalhamento, via o componente compartilhado
 * <CostBreakdown>. O atalho "Ver detalhamento →" da Visão geral continua
 * apontando para a rota antiga — esta seção é um acesso paralelo, não o substitui.
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
