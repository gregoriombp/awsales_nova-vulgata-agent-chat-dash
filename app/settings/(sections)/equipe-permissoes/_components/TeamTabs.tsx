"use client";

import { usePathname, useRouter } from "next/navigation";
import { AwTabs } from "@/components/ui/AwTabs";
import { MEMBERS } from "./data";

const BASE = "/settings/equipe-permissoes";

const TABS = [
  { value: BASE, label: "Membros", count: MEMBERS.length },
  { value: `${BASE}/grupos`, label: "Grupos" },
  { value: `${BASE}/funcoes`, label: "Funções" },
] as const;

export function TeamTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const current =
    TABS.find((t) => t.value === pathname)?.value ?? TABS[0].value;
  return (
    <AwTabs
      aria-label="Seções de equipe e permissões"
      variant="underline"
      items={TABS.map((t) => ({
        value: t.value,
        label: t.label,
        count: "count" in t ? t.count : undefined,
      }))}
      value={current}
      onChange={(v) => router.push(v)}
    />
  );
}
