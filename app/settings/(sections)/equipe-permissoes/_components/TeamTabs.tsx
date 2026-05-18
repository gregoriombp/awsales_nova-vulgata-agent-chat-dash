"use client";

import { usePathname, useRouter } from "next/navigation";
import { AwTabs } from "@/components/ui/AwTabs";
import { MEMBERS } from "./data";

const BASE = "/settings/equipe-permissoes";

const TABS = [
  { value: BASE, label: "Membros", count: MEMBERS.length },
  { value: `${BASE}/grupos`, label: "Equipes" },
  { value: `${BASE}/funcoes`, label: "Funções" },
] as const;

export function TeamTabs() {
  const pathname = usePathname();
  const router = useRouter();
  // Membros é a aba-base; Equipes e Funções cobrem também as suas sub-rotas
  // (ex.: /grupos/[id]) — sem isso o detalhe de uma equipe acende "Membros".
  const current = pathname.startsWith(`${BASE}/grupos`)
    ? `${BASE}/grupos`
    : pathname.startsWith(`${BASE}/funcoes`)
      ? `${BASE}/funcoes`
      : BASE;
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
