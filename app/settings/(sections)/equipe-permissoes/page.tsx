"use client";

import { useCallback, useMemo, useState } from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import {
  AwMembersTable,
  AwMembersTablePersonCell,
  AwMembersTableTextCell,
} from "@/components/ui/AwMembersTable";
import { AwPill } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwSpecialistsPair } from "@/components/ui/AwSpecialistsPair";
import { AwStatusDot } from "@/components/ui/AwStatusDot";
import { Icon } from "@/components/ui/Icon";
import {
  ALL_PERMISSION_IDS,
  INTEGRATIONS,
  MEMBERS,
  ROLE_DEFINITIONS,
  ROLE_OPTIONS,
  SCOPES,
  type Member,
  type Role,
  type Scope,
} from "./_components/data";
import { InviteModal } from "./_components/InviteModal";
import { TeamTabs } from "./_components/TeamTabs";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [search, setSearch] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
    );
  }, [members, search]);

  const selectedMember = useMemo(
    () =>
      selectedMemberId
        ? members.find((m) => m.id === selectedMemberId) ?? null
        : null,
    [members, selectedMemberId]
  );

  const applyRoleChange = useCallback((id: string, role: Role) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const roleDef = ROLE_DEFINITIONS.find((r) => r.name === role);
        return {
          ...m,
          role,
          permissions: roleDef?.capabilities ?? m.permissions,
        };
      })
    );
  }, []);

  const [pendingRoleChange, setPendingRoleChange] = useState<{
    memberId: string;
    memberName: string;
    fromRole: Role;
    toRole: Role;
  } | null>(null);

  const requestRoleChange = useCallback(
    (id: string, role: Role) => {
      const m = members.find((x) => x.id === id);
      if (!m || m.role === role) return;
      if (
        role === MANAGER_ROLE &&
        members.some((x) => x.id !== id && x.role === MANAGER_ROLE)
      ) {
        return;
      }
      setPendingRoleChange({
        memberId: id,
        memberName: m.name,
        fromRole: m.role,
        toRole: role,
      });
    },
    [members]
  );

  const managerAlreadyAssigned = useMemo(
    () => members.some((m) => m.role === MANAGER_ROLE),
    [members]
  );

  const handleConfirmRoleChange = useCallback(() => {
    if (!pendingRoleChange) return;
    applyRoleChange(pendingRoleChange.memberId, pendingRoleChange.toRole);
    setPendingRoleChange(null);
  }, [pendingRoleChange, applyRoleChange]);

  const handleRemove = useCallback(
    (id: string) => {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setSelectedMemberId((current) => (current === id ? null : current));
    },
    []
  );

  const isExpanded = selectedMember !== null;

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-10 pb-20 pt-12">
        <header>
          <h1 className="m-0 mb-2 flex items-center gap-3 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--fg-primary)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-muted)] text-[var(--fg-primary)]">
              <Icon name="groups" size={22} />
            </span>
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
          <AwButton
            size="md"
            variant="primary"
            iconLeft="person_add"
            onClick={() => setInviteOpen(true)}
          >
            Adicionar membro
          </AwButton>
        </div>

        <div className="flex w-full gap-4">
          <div
            className="min-w-0 shrink-0 transition-[width] duration-300 ease-out"
            style={{ width: isExpanded ? "340px" : "100%" }}
          >
            {!isExpanded ? (
              <MembersTableState
                members={filteredMembers}
                managerAlreadyAssigned={managerAlreadyAssigned}
                onSelect={setSelectedMemberId}
                onChangeRole={requestRoleChange}
              />
            ) : (
              <CompactMemberList
                members={filteredMembers}
                selectedId={selectedMember.id}
                onSelect={setSelectedMemberId}
              />
            )}
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div
              className="transition-[opacity,transform] duration-300 ease-out"
              style={{
                opacity: isExpanded ? 1 : 0,
                transform: isExpanded
                  ? "translateX(0)"
                  : "translateX(32px)",
                pointerEvents: isExpanded ? "auto" : "none",
              }}
            >
              {selectedMember && (
                <MemberDetail
                  member={selectedMember}
                  managerAlreadyAssigned={managerAlreadyAssigned}
                  onChangeRole={(role) =>
                    requestRoleChange(selectedMember.id, role)
                  }
                  onRemove={() => handleRemove(selectedMember.id)}
                  onClose={() => setSelectedMemberId(null)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />

      <RoleChangeConfirmModal
        pending={pendingRoleChange}
        onConfirm={handleConfirmRoleChange}
        onCancel={() => setPendingRoleChange(null)}
      />
    </>
  );
}

/* -----------------------------------------------------------------
 * State A — full-width members table
 * ----------------------------------------------------------------- */

const MANAGER_ROLE: Role = "Gerente da conta";

const CORTEX = {
  name: "Cortex",
  role: "AI Account Manager",
  roleIcon: "visibility",
  avatarSrc: "/assets/Cortex.png",
  description:
    "Converse com o Cortex pra explorar métricas, identificar gargalos e receber sugestões em tempo real.",
  ctaLabel: "Iniciar conversa",
  ctaIcon: "chat_bubble",
};

function MembersTableState({
  members,
  managerAlreadyAssigned,
  onSelect,
  onChangeRole,
}: {
  members: Member[];
  managerAlreadyAssigned: boolean;
  onSelect: (id: string) => void;
  onChangeRole: (id: string, role: Role) => void;
}) {
  const managers = members.filter((m) => m.role === MANAGER_ROLE);
  const others = members.filter((m) => m.role !== MANAGER_ROLE);

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

  const manager = managers[0];

  return (
    <div className="flex flex-col gap-8">
      {manager && (
        <AwSpecialistsPair
          title="Especialistas dedicados à sua conta"
          description="Dois reforços fixos pra acelerar sua operação: um Gerente de Contas humano da Awsales pra estratégia, e o Cortex, copilot de IA que monitora seu workspace 24/7."
          human={{
            name: manager.name,
            role: "Gerente de contas",
            roleIcon: "headset_mic",
            avatarSrc: manager.avatar,
            initials: manager.initials,
            description: `Agende uma consultoria com ${manager.name.split(" ")[0]}, seu especialista dedicado da AwSales.`,
            ctaLabel: "Agendar agora",
            ctaIcon: "event",
          }}
          ai={CORTEX}
        />
      )}
      <MemberSection
        title="Membros do workspace"
        members={others}
        managerAlreadyAssigned={managerAlreadyAssigned}
        onSelect={onSelect}
        onChangeRole={onChangeRole}
        emptyHint="Sem membros nessa categoria."
      />
    </div>
  );
}

function MemberSection({
  title,
  description,
  members,
  managerAlreadyAssigned,
  onSelect,
  onChangeRole,
  emptyHint,
}: {
  title: string;
  description?: string;
  members: Member[];
  managerAlreadyAssigned: boolean;
  onSelect: (id: string) => void;
  onChangeRole: (id: string, role: Role) => void;
  emptyHint: string;
}) {
  return (
    <section>
      <header className="mb-3">
        <h2 className="m-0 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
          {title}
        </h2>
        {description && (
          <p className="m-0 mt-2 max-w-[760px] text-[12.5px] leading-[1.55] text-[var(--fg-secondary)]">
            {description}
          </p>
        )}
      </header>

      {members.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-6 py-8 text-center">
          <p className="m-0 text-[12.5px] text-[var(--fg-secondary)]">
            {emptyHint}
          </p>
        </div>
      ) : (
        <AwMembersTable
          columns={[
            { label: "Pessoa", icon: "person" },
            { label: "Função", help: "Define o conjunto de permissões." },
            { label: "Última atividade" },
          ]}
        >
          {members.map((m) => (
            <tr
              key={m.id}
              className="aw-row-clickable"
              onClick={() => onSelect(m.id)}
            >
              <AwMembersTablePersonCell
                name={m.name}
                email={m.email}
                avatarSrc={m.avatar}
                initials={m.initials}
                tag={m.isYou ? "Você" : undefined}
                tagVariant="live"
              />
              <td onClick={(e) => e.stopPropagation()}>
                <AwDropdownMenu
                  trigger={<AwSelect>{m.role}</AwSelect>}
                  items={ROLE_OPTIONS.map((r) => ({
                    id: r,
                    label: r,
                    checked: r === m.role,
                    disabled:
                      r === MANAGER_ROLE &&
                      managerAlreadyAssigned &&
                      m.role !== MANAGER_ROLE,
                    onSelect: () => onChangeRole(m.id, r),
                  }))}
                />
              </td>
              <AwMembersTableTextCell muted>
                <span className="inline-flex items-center gap-2">
                  <AwStatusDot variant="live" size="xs" />
                  {m.lastActive}
                </span>
              </AwMembersTableTextCell>
            </tr>
          ))}
        </AwMembersTable>
      )}
    </section>
  );
}

/* -----------------------------------------------------------------
 * State B left — compact list (no actions, name + email only)
 * ----------------------------------------------------------------- */

function CompactMemberList({
  members,
  selectedId,
  onSelect,
}: {
  members: Member[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="flex flex-col self-start divide-y divide-[var(--border-subtle)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]">
      <div className="border-b border-[var(--border-subtle)] px-4 py-3">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
          Pessoas · {members.length}
        </p>
      </div>
      <ul className="flex flex-col">
        {members.map((m) => {
          const active = selectedId === m.id;
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onSelect(m.id)}
                aria-pressed={active}
                className={
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-aw-fast outline-none focus-visible:bg-[var(--bg-hover)] " +
                  (active
                    ? "bg-[var(--bg-selected)]"
                    : "hover:bg-[var(--bg-hover)]")
                }
              >
                <AwAvatar
                  size="sm"
                  src={m.avatar}
                  alt={m.name}
                  initials={m.initials}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-[var(--fg-primary)]">
                    {m.name}
                    {m.isYou && (
                      <span className="ml-1 text-[var(--fg-secondary)]">
                        (você)
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-[11.5px] text-[var(--fg-secondary)]">
                    {m.email}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

/* -----------------------------------------------------------------
 * State B right — detail panel
 * ----------------------------------------------------------------- */

function MemberDetail({
  member,
  managerAlreadyAssigned,
  onChangeRole,
  onRemove,
  onClose,
}: {
  member: Member;
  managerAlreadyAssigned: boolean;
  onChangeRole: (role: Role) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const memberPermissions = new Set(member.permissions);
  const memberIntegrations = new Set(member.integrations);
  const hasFullAccess =
    member.permissions.length === ALL_PERMISSION_IDS.length;

  return (
    <section className="flex max-h-[calc(100vh-160px)] flex-col self-start overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]">
      <header className="flex items-start gap-4 border-b border-[var(--border-subtle)] px-6 py-5">
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
        <div className="flex shrink-0 items-center gap-1">
          <AwDropdownMenu
            trigger={
              <AwButton size="sm" variant="secondary" iconLeft="edit">
                {member.role}
              </AwButton>
            }
            items={[
              { id: "label", isLabel: true, label: "Mudar função" },
              ...ROLE_OPTIONS.map((r) => ({
                id: r,
                label: r,
                checked: r === member.role,
                disabled:
                  r === MANAGER_ROLE &&
                  managerAlreadyAssigned &&
                  member.role !== MANAGER_ROLE,
                onSelect: () => onChangeRole(r),
              })),
            ]}
          />
          <AwButton
            size="sm"
            variant="ghost"
            iconLeft="logout"
            onClick={onRemove}
          >
            {member.isYou ? "Sair" : "Remover"}
          </AwButton>
          <AwButton
            size="sm"
            variant="ghost"
            iconOnly="close"
            aria-label="Fechar painel"
            onClick={onClose}
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-4 border-b border-[var(--border-subtle)] px-6 py-5">
          <DetailStat label="Função" value={member.role} />
          <DetailStat label="Último acesso" value={member.lastActive} />
          <DetailStat
            label="Tickets essa semana"
            value={`${member.ticketsThisWeek}`}
          />
        </div>

        <DetailSection title="Permissões por escopo">
          {hasFullAccess ? (
            <FullAccessBanner />
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--border-subtle)]">
              {SCOPES.map((scope) => (
                <ScopeRow
                  key={scope.id}
                  scope={scope}
                  memberPermissions={memberPermissions}
                />
              ))}
            </ul>
          )}
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
      </div>
    </section>
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

function FullAccessBanner() {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-raised)] text-[var(--fg-primary)]">
        <Icon name="verified" size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[13.5px] font-medium text-[var(--fg-primary)]">
          Acesso total
        </p>
        <p className="m-0 text-[11.5px] text-[var(--fg-secondary)]">
          Todos os {SCOPES.length} escopos liberados, incluindo ações
          irreversíveis (faturamento, exclusão).
        </p>
      </div>
    </div>
  );
}

function ScopeRow({
  scope,
  memberPermissions,
}: {
  scope: Scope;
  memberPermissions: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  const ids = scope.groups.flatMap((g) => g.permissions.map((p) => p.id));
  const granted = ids.filter((id) => memberPermissions.has(id)).length;
  const total = ids.length;
  const all = granted === total;
  const some = granted > 0 && !all;
  const variant = all ? "live" : some ? "beta" : "neutral";
  const status = all ? "Completo" : some ? "Parcial" : "Sem acesso";

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-1 py-2.5 text-left transition-colors duration-aw-fast outline-none hover:bg-[var(--bg-hover)] focus-visible:bg-[var(--bg-hover)]"
        aria-expanded={open}
      >
        <Icon name={open ? "expand_more" : "chevron_right"} size={16} />
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[var(--fg-secondary)]">
          <Icon name={scope.icon} size={14} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-[var(--fg-primary)]">
            {scope.name}
          </span>
          <span className="block text-[11.5px] text-[var(--fg-secondary)]">
            {granted}/{total} permiss{total === 1 ? "ão" : "ões"}
          </span>
        </span>
        <AwPill variant={variant} dot={false}>
          {status}
        </AwPill>
      </button>

      {open && (
        <div className="px-1 pb-3 pl-10">
          {granted === 0 ? (
            <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
              Sem permissões neste escopo.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {scope.groups.flatMap((g) =>
                g.permissions
                  .filter((p) => memberPermissions.has(p.id))
                  .map((p) => (
                    <li key={p.id} className="flex items-start gap-2">
                      <Icon
                        name="check"
                        size={14}
                        className="mt-0.5 text-[var(--accent-success)]"
                      />
                      <span className="text-[12.5px] text-[var(--fg-primary)]">
                        {p.label}
                      </span>
                    </li>
                  ))
              )}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

/* -----------------------------------------------------------------
 * Role change confirmation modal
 * ----------------------------------------------------------------- */

function RoleChangeConfirmModal({
  pending,
  onConfirm,
  onCancel,
}: {
  pending: {
    memberId: string;
    memberName: string;
    fromRole: Role;
    toRole: Role;
  } | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const fromDef = pending
    ? ROLE_DEFINITIONS.find((r) => r.name === pending.fromRole)
    : null;
  const toDef = pending
    ? ROLE_DEFINITIONS.find((r) => r.name === pending.toRole)
    : null;

  const fromCount = fromDef?.capabilities.length ?? 0;
  const toCount = toDef?.capabilities.length ?? 0;
  const diff = toCount - fromCount;

  return (
    <AwModal
      open={pending !== null}
      onClose={onCancel}
      title="Mudar função"
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={onCancel}>
            Cancelar
          </AwButton>
          <AwButton
            size="sm"
            variant="primary"
            iconLeft="check"
            onClick={onConfirm}
          >
            Confirmar mudança
          </AwButton>
        </>
      }
    >
      {pending && (
        <div className="flex flex-col gap-4">
          <p className="m-0 text-[13.5px] leading-[1.55] text-[var(--fg-primary)]">
            Você vai mudar{" "}
            <strong className="font-semibold">{pending.memberName}</strong> de{" "}
            <strong className="font-semibold">{pending.fromRole}</strong> para{" "}
            <strong className="font-semibold">{pending.toRole}</strong>.
          </p>

          <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
                  De
                </p>
                <p className="m-0 mt-1 text-[13px] font-medium text-[var(--fg-primary)]">
                  {pending.fromRole}
                </p>
                <p className="m-0 text-[11.5px] text-[var(--fg-secondary)]">
                  {fromCount} permiss{fromCount === 1 ? "ão" : "ões"}
                </p>
              </div>
              <Icon
                name="arrow_forward"
                size={18}
                className="shrink-0 text-[var(--fg-tertiary)]"
              />
              <div className="min-w-0 text-right">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
                  Para
                </p>
                <p className="m-0 mt-1 text-[13px] font-medium text-[var(--fg-primary)]">
                  {pending.toRole}
                </p>
                <p className="m-0 text-[11.5px] text-[var(--fg-secondary)]">
                  {toCount} permiss{toCount === 1 ? "ão" : "ões"}
                  {diff !== 0 && (
                    <span
                      className={
                        diff > 0
                          ? "ml-1.5 text-[var(--accent-success)]"
                          : "ml-1.5 text-[var(--accent-danger)]"
                      }
                    >
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
            As permissões serão ajustadas automaticamente. Você pode reverter a
            qualquer momento abrindo o membro novamente.
          </p>
        </div>
      )}
    </AwModal>
  );
}
