"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
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
import { CAPABILITIES, ROLE_DEFINITIONS } from "../_components/data";
import { TeamTabs } from "../_components/TeamTabs";

export default function RolesPage() {
  const [search, setSearch] = useState("");

  const breadcrumbs = useMemo(
    () => [
      {
        label: "Configurações",
        icon: <Icon name="tune" size={16} />,
        href: "/settings",
      },
      {
        label: "Equipe & permissões",
        href: "/settings/equipe-permissoes",
      },
      { label: "Funções" },
    ],
    []
  );

  const capabilityById = useMemo(
    () => Object.fromEntries(CAPABILITIES.map((c) => [c.id, c])),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ROLE_DEFINITIONS;
    return ROLE_DEFINITIONS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} mainClassName="!p-0">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-10 pb-20 pt-12">
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
              placeholder="Buscar funções…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <AwButton size="sm" variant="primary" iconLeft="add">
              Criar função
            </AwButton>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-12">
            <AwEmpty>
              <AwEmptyHeader>
                <AwEmptyMedia variant="icon">
                  <Icon name="shield_person" size={20} />
                </AwEmptyMedia>
                <AwEmptyTitle>Nenhuma função encontrada</AwEmptyTitle>
                <AwEmptyDescription>
                  Tente outro termo ou crie uma nova função customizada.
                </AwEmptyDescription>
              </AwEmptyHeader>
            </AwEmpty>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {filtered.map((role) => {
              const granted = new Set(role.capabilities);
              return (
                <li
                  key={role.id}
                  className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5"
                >
                  <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="m-0 text-[15px] font-semibold text-[var(--fg-primary)]">
                          {role.name}
                        </h2>
                        {role.isSystem && (
                          <AwPill variant="neutral" dot={false}>
                            Padrão
                          </AwPill>
                        )}
                        <AwPill variant="neutral" dot={false}>
                          {role.memberCount} membro
                          {role.memberCount === 1 ? "" : "s"}
                        </AwPill>
                      </div>
                      <p className="m-0 mt-1 max-w-[640px] text-[12.5px] leading-[1.5] text-[var(--fg-secondary)]">
                        {role.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <AwButton
                        size="sm"
                        variant="ghost"
                        iconLeft="content_copy"
                      >
                        Duplicar
                      </AwButton>
                      <AwButton
                        size="sm"
                        variant="secondary"
                        iconLeft="edit"
                        disabled={role.isSystem}
                      >
                        {role.isSystem ? "Não editável" : "Editar"}
                      </AwButton>
                    </div>
                  </header>

                  <p className="m-0 mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
                    Permissões
                  </p>
                  <ul className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
                    {CAPABILITIES.map((c) => {
                      const has = granted.has(c.id);
                      return (
                        <li key={c.id} className="flex items-start gap-3">
                          <span
                            className={
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] " +
                              (has
                                ? "bg-[var(--fg-primary)] text-[var(--bg-raised)]"
                                : "border border-[var(--border-default)] bg-[var(--bg-raised)] text-[var(--fg-tertiary)]")
                            }
                            aria-hidden="true"
                          >
                            <Icon
                              name={has ? "check" : "close"}
                              size={12}
                            />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              className={
                                "m-0 text-[13px] font-medium " +
                                (has
                                  ? "text-[var(--fg-primary)]"
                                  : "text-[var(--fg-tertiary)]")
                              }
                            >
                              {capabilityById[c.id]?.label ?? c.label}
                            </p>
                            <p className="m-0 text-[11.5px] text-[var(--fg-secondary)]">
                              {c.description}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
