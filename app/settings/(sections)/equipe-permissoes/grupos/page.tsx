"use client";

import { useMemo, useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwInput } from "@/components/ui/AwInput";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { GROUPS } from "../_components/data";
import { TeamTabs } from "../_components/TeamTabs";

export default function GroupsPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-10 pb-20 pt-12">
        <header>
          <h1 className="m-0 mb-2 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--fg-primary)]">
            Equipe &amp; permissões
          </h1>
          <p className="m-0 max-w-[640px] text-[13px] leading-[1.55] text-[var(--fg-secondary)]">
            Gerencie quem tem acesso ao workspace, convide novas pessoas e
            organize permissões por função e projeto.
          </p>
        </header>

        <TeamTabs />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="w-full max-w-[320px]">
            <AwInput
              iconLeft="search"
              placeholder="Buscar grupos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <AwButton size="sm" variant="secondary" iconLeft="download">
              Exportar
            </AwButton>
            <AwButton size="sm" variant="primary" iconLeft="add">
              Criar grupo
            </AwButton>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-12">
            <AwEmpty>
              <AwEmptyHeader>
                <AwEmptyMedia variant="icon">
                  <Icon name="groups" size={20} />
                </AwEmptyMedia>
                <AwEmptyTitle>Nenhum grupo encontrado</AwEmptyTitle>
                <AwEmptyDescription>
                  Use grupos para conceder acesso a vários membros de uma vez —
                  por exemplo, time de Atendimento ou time Comercial.
                </AwEmptyDescription>
              </AwEmptyHeader>
            </AwEmpty>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((g) => (
              <li
                key={g.id}
                className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 transition-colors duration-aw-fast hover:border-[var(--border-default)]"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-muted)] text-[var(--fg-secondary)]">
                    <Icon name={g.icon} size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-[14.5px] font-semibold text-[var(--fg-primary)]">
                      {g.name}
                    </p>
                    <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
                      {g.memberCount} membro{g.memberCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <p className="m-0 line-clamp-2 text-[12.5px] leading-[1.5] text-[var(--fg-secondary)]">
                  {g.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {g.roles.map((r) => (
                    <AwPill key={r} variant="neutral" dot={false}>
                      {r}
                    </AwPill>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                  <AwButton size="sm" variant="ghost" iconLeft="visibility">
                    Ver membros
                  </AwButton>
                  <AwButton
                    size="sm"
                    variant="ghost"
                    iconOnly="more_horiz"
                    aria-label="Mais opções"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
