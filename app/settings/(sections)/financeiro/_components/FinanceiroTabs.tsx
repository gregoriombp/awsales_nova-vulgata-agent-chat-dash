"use client";

import { usePathname, useRouter } from "next/navigation";
import { AwTabs } from "@/components/ui/AwTabs";

const BASE = "/settings/financeiro";

const TABS = [
  { value: `${BASE}/visao-geral`, label: "Visão geral" },
  { value: `${BASE}/consumo`, label: "Consumo" },
  { value: `${BASE}/saldo-creditos`, label: "Saldo de créditos" },
  { value: `${BASE}/metodos-pagamento`, label: "Métodos de pagamento" },
  { value: `${BASE}/historico-faturas`, label: "Histórico de faturas" },
  { value: `${BASE}/auditoria`, label: "Atividade" },
] as const;

export function FinanceiroTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const current =
    TABS.find((t) => t.value === pathname)?.value ?? TABS[0].value;
  return (
    <AwTabs
      aria-label="Seções financeiras"
      variant="underline"
      items={TABS.map((t) => ({ value: t.value, label: t.label }))}
      value={current}
      onChange={(v) => router.push(v)}
    />
  );
}
