"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { CostBreakdown } from "../_components/CostBreakdown";

/**
 * Detalhamento de custos (Analytics financeiro) — a carga pesada de auditoria
 * que sai da Visão geral. Chega-se aqui pelo botão "Ver detalhamento →" da
 * Visão geral; o mesmo conteúdo também vive como seção própria em
 * /settings/consumo-e-custos (item da sidebar). O corpo é compartilhado pelo
 * componente <CostBreakdown>; aqui só muda o cabeçalho, que volta à Visão geral.
 */
export default function DetalhamentoPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader />
      <CostBreakdown />
    </div>
  );
}

/* ---------- cabeçalho com volta pra Visão geral ---------- */

function PageHeader() {
  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/settings/financeiro/visao-geral"
        className="inline-flex w-fit items-center gap-1 body-xs font-medium text-(--fg-tertiary) transition-colors hover:text-(--fg-primary)"
      >
        <Icon name="arrow_back" size={15} />
        Voltar para a Visão geral
      </Link>
      <div className="flex flex-col gap-1">
        <h4 className="m-0 text-(--fg-primary)">Detalhamento de custos</h4>
        <p className="m-0 max-w-[680px] body-xs text-(--fg-secondary)">
          Concilie o que foi usado com o que foi cobrado, item a item. Este
          detalhamento cobre só o uso variável do período — o plano fixo aparece
          na Visão geral e na fatura.
        </p>
      </div>
    </div>
  );
}
