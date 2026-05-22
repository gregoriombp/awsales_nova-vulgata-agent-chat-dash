"use client";

import { usePathname, useRouter } from "next/navigation";
import { AwTabs } from "@/components/ui/AwTabs";
import { INVOICE_HISTORY } from "./data";

const BASE = "/settings/financeiro";

type Tab = {
  value: string;
  label: string;
  count?: number;
};

export function FinanceiroTabs() {
  const pathname = usePathname();
  const router = useRouter();

  const hasPaymentAlerts = INVOICE_HISTORY.some(
    (r) => r.status === "Em atraso" || r.status === "Falhou",
  );

  const tabs: Tab[] = [
    { value: `${BASE}/visao-geral`, label: "Visão geral" },
    { value: `${BASE}/consumo`, label: "Consumo" },
    { value: `${BASE}/metodos-pagamento`, label: "Métodos de pagamento" },
    {
      value: `${BASE}/historico-faturas`,
      label: "Histórico de faturas",
      count: hasPaymentAlerts ? 1 : undefined,
    },
    { value: `${BASE}/auditoria`, label: "Atividade" },
  ];

  const current = tabs.find((t) => t.value === pathname)?.value ?? tabs[0].value;

  return (
    <AwTabs
      aria-label="Seções financeiras"
      variant="underline"
      items={tabs.map((t) => ({ value: t.value, label: t.label, count: t.count }))}
      value={current}
      onChange={(v) => router.push(v)}
    />
  );
}
