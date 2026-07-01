"use client";

import { usePathname, useRouter } from "next/navigation";
import { AwTabs } from "@/components/ui/AwTabs";

const BASE = "/settings/consumo-e-custos";

/**
 * Abas do espaço "Consumo e custos" — mesmo padrão do FinanceiroTabs: navegação
 * por rota sobre o AwTabs underline. A raiz é a própria "Visão geral", então ela
 * casa por igualdade EXATA (senão acenderia em todas as sub-rotas).
 */
export function ConsumoCustosTabs() {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { value: BASE, label: "Visão geral" },
    { value: `${BASE}/ciclos`, label: "Por ciclos" },
    { value: `${BASE}/analises`, label: "Análises" },
  ];

  const current =
    pathname === BASE
      ? BASE
      : tabs.slice(1).find((t) => pathname.startsWith(t.value))?.value ?? BASE;

  return (
    <AwTabs
      aria-label="Seções de consumo e custos"
      variant="underline"
      items={tabs.map((t) => ({ value: t.value, label: t.label }))}
      value={current}
      onChange={(v) => router.push(v)}
    />
  );
}
