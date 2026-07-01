"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OverviewDashboard } from "../_components/OverviewDashboard";

/* ----------------------------------------------------------------------------
 * Aba "Visão geral" — raiz de /settings/consumo-e-custos.
 *
 * Dashboard fixo do consumo (o chrome de abas vem do layout do route group).
 * Deep-links antigos (`?relatorio=` / `?tipo=&fatura=`) sempre foram consumidos
 * pelo snapshot do EXPLORADOR — redireciona pra lá preservando a query, em vez
 * de renderizar a raiz com um estado que ela não entende.
 * ------------------------------------------------------------------------- */

const EXPLORER_PATH = "/settings/consumo-e-custos/explorar";

function LegacyDeepLinkRedirect() {
  const sp = useSearchParams();
  const router = useRouter();
  const hasLegacy = sp.has("relatorio") || sp.has("tipo");
  React.useEffect(() => {
    if (hasLegacy) router.replace(`${EXPLORER_PATH}?${sp.toString()}`);
  }, [hasLegacy, sp, router]);
  return null;
}

export default function ConsumoVisaoGeralPage() {
  return (
    <>
      <React.Suspense fallback={null}>
        <LegacyDeepLinkRedirect />
      </React.Suspense>
      <OverviewDashboard />
    </>
  );
}
