"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AwAvatar } from "@/components/ui/AwAvatar";
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
import {
  INTEGRATIONS,
  MEMBERS,
  SCOPES,
  type Member,
} from "./_components/data";
import { InviteModal } from "./_components/InviteModal";
import { TeamTabs } from "./_components/TeamTabs";

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    MEMBERS[0]?.id ?? null
  );
  const [inviteOpen, setInviteOpen] = useState(false);

  const breadcrumbs = useMemo(
    () => [
      {
        label: "Configurações",
        icon: <Icon name="tune" size={16} />,
        href: "/settings",
      },
      { label: "Equipe & permissões" },
    ],
    []
  );

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MEMBERS;
    return MEMBERS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
    );
  }, [search]);

  const selectedMember = useMemo(
    () => MEMBERS.find((m) => m.id === selectedMemberId) ?? null,
    [selectedMemberId]
  );

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
              placeholder="Buscar membros…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <AwButton size="sm" variant="secondary" iconLeft="download">
              Exportar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              iconLeft="person_add"
              onClick={() => setInviteOpen(true)}
            >
              Adicionar membro
            </AwButton>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
          <MemberList
            members={filteredMembers}
            selectedId={selectedMemberId}
            onSelect={setSelectedMemberId}
          />
          <aside className="self-start rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]">
            <MemberDetail member={selectedMember} />
          </aside>
        </div>
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </DashboardLayout>
  );
}

/* -----------------------------------------------------------------
 * Member list
 * ----------------------------------------------------------------- */

function MemberList({
  members,
  selectedId,
  onSelect,
}: {
  members: Member[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (members.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-10">
        <AwEmpty>
          <AwEmptyHeader>
            <AwEmptyMedia variant="icon">
              <Icon name="search_off" size={20} />
            </AwEmptyMedia>
            <AwEmptyTitle>Nenhum membro encontrado</AwEmptyTitle>
            <AwEmptyDescription>
              Tente outro termo ou ajuste os filtros.
            </AwEmptyDescription>
          </AwEmptyHeader>
        </AwEmpty>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {members.map((m) => {
        const active = selectedId === m.id;
        return (
          <li
            key={m.id}
            role="button"
            tabIndex={0}
            aria-pressed={active}
            onClick={() => onSelect(m.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(m.id);
              }
            }}
            className={
              "flex cursor-pointer items-center gap-4 rounded-[var(--radius-lg)] border px-4 py-3 text-left transition-colors duration-aw-fast outline-none focus-visible:border-[var(--fg-primary)] " +
              (active
                ? "bg-[var(--bg-selected)] border-transparent"
                : "bg-[var(--bg-raised)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]")
            }
          >
            <AwAvatar
              size="md"
              src={m.avatar}
              alt={m.name}
              initials={m.initials}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="m-0 truncate text-[13.5px] font-medium text-[var(--fg-primary)]">
                  {m.name}
                </p>
                {m.isYou && (
                  <AwPill variant="live" dot={false}>
                    Você
                  </AwPill>
                )}
                <AwPill variant="neutral" dot={false}>
                  {m.role}
                </AwPill>
              </div>
              <p className="m-0 truncate text-[12px] text-[var(--fg-secondary)]">
                {m.email}
              </p>
            </div>
            <div
              className="flex shrink-0 items-center gap-2"
              onClick={(e) => e.stopPropagation()}
              role="presentation"
            >
              <AwButton size="sm" variant="ghost">
                {m.isYou ? "Sair" : "Remover"}
              </AwButton>
              <AwButton size="sm" variant="secondary" iconLeft="edit">
                Funções
              </AwButton>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* -----------------------------------------------------------------
 * Member detail (right rail)
 * ----------------------------------------------------------------- */

function MemberDetail({ member }: { member: Member | null }) {
  if (!member) {
    return (
      <div className="p-6">
        <AwEmpty>
          <AwEmptyHeader>
            <AwEmptyMedia variant="icon">
              <Icon name="person_search" size={20} />
            </AwEmptyMedia>
            <AwEmptyTitle>Selecione um membro</AwEmptyTitle>
            <AwEmptyDescription>
              Detalhes, permissões e histórico do membro aparecem aqui.
            </AwEmptyDescription>
          </AwEmptyHeader>
        </AwEmpty>
      </div>
    );
  }

  const memberPermissions = new Set(member.permissions);
  const memberIntegrations = new Set(member.integrations);

  return (
    <div className="flex max-h-[calc(100vh-160px)] flex-col overflow-y-auto">
      <header className="flex items-center gap-4 border-b border-[var(--border-subtle)] px-6 py-5">
        <AwAvatar
          size="lg"
          src={member.avatar}
          alt={member.name}
          initials={member.initials}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="m-0 truncate text-[15px] font-semibold text-[var(--fg-primary)]">
              {member.name}
            </p>
            {member.isYou && (
              <AwPill variant="live" dot={false}>
                Você
              </AwPill>
            )}
          </div>
          <p className="m-0 truncate text-[12px] text-[var(--fg-secondary)]">
            {member.email}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4 border-b border-[var(--border-subtle)] px-6 py-5">
        <DetailStat label="Função" value={member.role} />
        <DetailStat label="Último acesso" value={member.lastActive} />
        <DetailStat label="Membro desde" value={member.joinedAt} />
      </div>

      <DetailSection title="Permissões por escopo">
        <ul className="flex flex-col gap-2">
          {SCOPES.map((scope) => {
            const ids = scope.groups.flatMap((g) =>
              g.permissions.map((p) => p.id)
            );
            const granted = ids.filter((id) => memberPermissions.has(id))
              .length;
            const total = ids.length;
            const all = granted === total;
            const some = granted > 0 && !all;
            const variant = all ? "live" : some ? "beta" : "neutral";
            const status = all ? "Completo" : some ? "Parcial" : "Sem acesso";
            return (
              <li
                key={scope.id}
                className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-3 py-2"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[var(--fg-secondary)]">
                  <Icon name={scope.icon} size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-[13px] font-medium text-[var(--fg-primary)]">
                    {scope.name}
                  </p>
                  <p className="m-0 text-[11.5px] text-[var(--fg-secondary)]">
                    {granted}/{total} permiss
                    {total === 1 ? "ão" : "ões"}
                  </p>
                </div>
                <AwPill variant={variant} dot={false}>
                  {status}
                </AwPill>
              </li>
            );
          })}
        </ul>
      </DetailSection>

      <DetailSection title="Integrações conectadas">
        {memberIntegrations.size === 0 ? (
          <p className="m-0 text-[12.5px] text-[var(--fg-secondary)]">
            Sem integrações associadas a este membro.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {INTEGRATIONS.filter((i) => memberIntegrations.has(i.id)).map(
              (i) => (
                <li
                  key={i.id}
                  className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-3 py-2"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[var(--fg-secondary)]">
                    <Icon name={i.icon} size={14} />
                  </span>
                  <span className="flex-1 text-[13px] font-medium text-[var(--fg-primary)]">
                    {i.name}
                  </span>
                  <AwPill variant="live" dot>
                    Ativa
                  </AwPill>
                </li>
              )
            )}
          </ul>
        )}
      </DetailSection>

      <DetailSection title="Histórico recente">
        <ol className="relative ml-1 flex flex-col gap-3 border-l border-[var(--border-subtle)] pl-4">
          {member.activity.map((entry, i) => (
            <li key={i} className="relative">
              <span
                className="absolute -left-[19px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[var(--bg-raised)]"
                aria-hidden="true"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--fg-primary)]" />
              </span>
              <p className="m-0 text-[11px] uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
                {entry.time}
              </p>
              <p className="m-0 text-[13px] text-[var(--fg-primary)]">
                {entry.description}
              </p>
            </li>
          ))}
        </ol>
      </DetailSection>

      <footer className="mt-auto flex flex-col gap-2 border-t border-[var(--border-subtle)] px-6 py-5">
        <AwButton size="sm" variant="secondary" iconLeft="edit" block>
          Editar funções
        </AwButton>
        <AwButton size="sm" variant="ghost" iconLeft="logout" block>
          {member.isYou ? "Sair do workspace" : "Remover membro"}
        </AwButton>
      </footer>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="m-0 mb-1 text-[10.5px] uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
        {label}
      </p>
      <p className="m-0 truncate text-[13px] font-medium text-[var(--fg-primary)]">
        {value}
      </p>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[var(--border-subtle)] px-6 py-5 last:border-b-0">
      <h3 className="m-0 mb-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
        {title}
      </h3>
      {children}
    </section>
  );
}
