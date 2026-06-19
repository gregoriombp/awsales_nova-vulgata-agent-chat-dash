"use client";

import { useCallback, useMemo, useState } from "react";
import { useCopilotDrawer } from "@/lib/copilot/store";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwBackupCodes } from "@/components/ui/AwBackupCodes";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import {
  AwDropdownMenu,
  type AwDropdownItem,
} from "@/components/ui/AwDropdownMenu";
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwContactChannelModal } from "@/components/ui/AwContactChannelModal";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import {
  AwMembersTable,
  AwMembersTablePersonCell,
} from "@/components/ui/AwMembersTable";
import { AwPill } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwSpecialistsPair } from "@/components/ui/AwSpecialistsPair";
import { AwToggle } from "@/components/ui/AwToggle";
import { useToast } from "@/components/ui/AwToast";
import { Icon } from "@/components/ui/Icon";
import {
  ALL_PERMISSION_IDS,
  INVITATIONS,
  MEMBERS,
  ROLE_DEFINITIONS,
  ROLE_OPTIONS,
  SCOPES,
  SUPPORT_CONTACTS,
  type Invitation,
  type Member,
  type MemberStatus,
  type Role,
  type Scope,
} from "./_components/data";
import { InviteModal } from "./_components/InviteModal";
import { TeamTabs } from "./_components/TeamTabs";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "all">("all");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  /** Confirmação de inativar/reativar de um membro. */
  const [lifecycleTarget, setLifecycleTarget] = useState<{
    member: Member;
    action: "inactivate" | "reactivate";
  } | null>(null);
  /** Modal de bloqueio do guard do último Administrador. */
  const [lastAdminBlock, setLastAdminBlock] = useState<{
    memberName: string;
    reason: "role" | "inactivate";
  } | null>(null);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (roleFilter !== "all" && m.role !== roleFilter) return false;
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
      );
    });
  }, [members, search, roleFilter, statusFilter]);

  const filtersActive =
    search.trim() !== "" || roleFilter !== "all" || statusFilter !== "all";

  /** Conta de Administradores ativos — usado pelo guard do último admin. */
  const adminCount = useMemo(
    () =>
      members.filter(
        (m) => m.role === ADMIN_ROLE && m.status !== "inactive"
      ).length,
    [members]
  );

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
      // Guard do último admin: rebaixar o único Administrador ativo deixaria a
      // organização sem ninguém com acesso total. Bloqueia com um modal.
      if (
        m.role === ADMIN_ROLE &&
        role !== ADMIN_ROLE &&
        m.status !== "inactive" &&
        adminCount <= 1
      ) {
        setLastAdminBlock({ memberName: m.name, reason: "role" });
        return;
      }
      setPendingRoleChange({
        memberId: id,
        memberName: m.name,
        fromRole: m.role,
        toRole: role,
      });
    },
    [members, adminCount]
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

  /** Abre a confirmação de inativar/reativar — aplica o guard do último admin
   *  antes de deixar inativar. */
  const requestLifecycleChange = useCallback(
    (id: string, action: "inactivate" | "reactivate") => {
      const m = members.find((x) => x.id === id);
      if (!m) return;
      if (
        action === "inactivate" &&
        m.role === ADMIN_ROLE &&
        m.status !== "inactive" &&
        adminCount <= 1
      ) {
        setLastAdminBlock({ memberName: m.name, reason: "inactivate" });
        return;
      }
      setLifecycleTarget({ member: m, action });
    },
    [members, adminCount]
  );

  const handleConfirmLifecycle = useCallback(() => {
    if (!lifecycleTarget) return;
    const { member, action } = lifecycleTarget;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === member.id
          ? { ...m, status: action === "inactivate" ? "inactive" : "active" }
          : m
      )
    );
    setLifecycleTarget(null);
  }, [lifecycleTarget]);

  const handleToggleInvoices = useCallback((id: string, next: boolean) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, receivesInvoices: next } : m))
    );
  }, []);

  /** Aplica novos campos de MFA (reset ou regeneração de códigos) ao membro. */
  const handlePatchMember = useCallback(
    (id: string, patch: Partial<Member>) => {
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
      );
    },
    []
  );

  const handleTogglePermission = useCallback(
    (id: string, permissionId: string, next: boolean) => {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const has = m.permissions.includes(permissionId);
          if (next && !has) {
            return { ...m, permissions: [...m.permissions, permissionId] };
          }
          if (!next && has) {
            return {
              ...m,
              permissions: m.permissions.filter((p) => p !== permissionId),
            };
          }
          return m;
        })
      );
    },
    []
  );

  const handleToggleScope = useCallback(
    (id: string, scopeIds: string[], next: boolean) => {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const without = m.permissions.filter((p) => !scopeIds.includes(p));
          return {
            ...m,
            permissions: next ? [...without, ...scopeIds] : without,
          };
        })
      );
    },
    []
  );

  const isExpanded = selectedMember !== null;

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 0% 0%, color-mix(in srgb, var(--aw-blue-600) 7%, transparent), transparent 65%),
            radial-gradient(ellipse 60% 50% at 100% 100%, color-mix(in srgb, var(--aw-purple-500) 6%, transparent), transparent 65%)
          `,
        }}
      />
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-10 pb-20 pt-12">
        <header>
          <h3 className="m-0 mb-2 text-(--fg-primary)">
            Equipe &amp; permissões
          </h3>
          <p className="m-0 max-w-[640px] body-xs text-(--fg-secondary)">
            Quem tem acesso a esta organização, com qual função e em quais
            projetos.
          </p>
        </header>

        <TeamTabs />

        <div className="flex w-full gap-4">
          <div
            className="min-w-0 shrink-0 transition-[width] duration-300 ease-out"
            style={{ width: isExpanded ? "340px" : "100%" }}
          >
            {!isExpanded ? (
              <MembersTableState
                members={filteredMembers}
                search={search}
                onSearchChange={setSearch}
                roleFilter={roleFilter}
                onRoleFilterChange={setRoleFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                filtersActive={filtersActive}
                onClearFilters={() => {
                  setSearch("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
                onOpenInvite={() => setInviteOpen(true)}
                managerAlreadyAssigned={managerAlreadyAssigned}
                onSelect={setSelectedMemberId}
                onChangeRole={requestRoleChange}
                onChangeLifecycle={requestLifecycleChange}
                onRemove={handleRemove}
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
                  isLastActiveAdmin={
                    selectedMember.role === ADMIN_ROLE &&
                    selectedMember.status !== "inactive" &&
                    adminCount <= 1
                  }
                  onChangeRole={(role) =>
                    requestRoleChange(selectedMember.id, role)
                  }
                  onRemove={() => handleRemove(selectedMember.id)}
                  onChangeLifecycle={(action) =>
                    requestLifecycleChange(selectedMember.id, action)
                  }
                  onToggleInvoices={(next) =>
                    handleToggleInvoices(selectedMember.id, next)
                  }
                  onPatchMember={(patch) =>
                    handlePatchMember(selectedMember.id, patch)
                  }
                  onClose={() => setSelectedMemberId(null)}
                  onTogglePermission={(permissionId, next) =>
                    handleTogglePermission(
                      selectedMember.id,
                      permissionId,
                      next
                    )
                  }
                  onToggleScope={(scopeIds, next) =>
                    handleToggleScope(selectedMember.id, scopeIds, next)
                  }
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

      <LifecycleConfirmModal
        target={lifecycleTarget}
        onConfirm={handleConfirmLifecycle}
        onCancel={() => setLifecycleTarget(null)}
      />

      <LastAdminBlockModal
        block={lastAdminBlock}
        onClose={() => setLastAdminBlock(null)}
      />
    </>
  );
}

/* -----------------------------------------------------------------
 * State A — full-width members table
 * ----------------------------------------------------------------- */

const MANAGER_ROLE: Role = "Gerente da conta";
const ADMIN_ROLE: Role = "Administrador";

const CORTEX = {
  name: "Cortex",
  role: "Agente de IA Frontier",
  avatarSrc: "/assets/Cortex.png",
  ctaLabel: "Iniciar conversa",
  ctaIcon: "chat_bubble",
};

function MembersTableState({
  members,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  filtersActive,
  onClearFilters,
  onOpenInvite,
  managerAlreadyAssigned,
  onSelect,
  onChangeRole,
  onChangeLifecycle,
  onRemove,
}: {
  members: Member[];
  search: string;
  onSearchChange: (v: string) => void;
  roleFilter: Role | "all";
  onRoleFilterChange: (v: Role | "all") => void;
  statusFilter: MemberStatus | "all";
  onStatusFilterChange: (v: MemberStatus | "all") => void;
  filtersActive: boolean;
  onClearFilters: () => void;
  onOpenInvite: () => void;
  managerAlreadyAssigned: boolean;
  onSelect: (id: string) => void;
  onChangeRole: (id: string, role: Role) => void;
  onChangeLifecycle: (id: string, action: "inactivate" | "reactivate") => void;
  onRemove: (id: string) => void;
}) {
  const [contactTarget, setContactTarget] = useState<string | null>(null);
  const openCopilot = useCopilotDrawer((s) => s.setOpen);
  const managers = members.filter((m) => m.role === MANAGER_ROLE);
  const others = members.filter((m) => m.role !== MANAGER_ROLE);

  if (members.length === 0 && filtersActive) {
    return (
      <div className="flex flex-col gap-3">
        <MembersToolbar
          search={search}
          onSearchChange={onSearchChange}
          roleFilter={roleFilter}
          onRoleFilterChange={onRoleFilterChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          filtersActive={filtersActive}
          onClearFilters={onClearFilters}
          onOpenInvite={onOpenInvite}
        />
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-10">
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
      </div>
    );
  }

  const manager = managers[0];

  return (
    <>
      <div className="flex flex-col gap-8">
        {manager && (
          <AwSpecialistsPair
            title="Especialistas dedicados"
            description="Time humano e agente de IA que acompanham a sua operação. Fale com eles para tirar dúvidas, abrir solicitações ou pedir ajustes."
            humans={[
              {
                name: manager.name,
                role: "Gerente de contas",
                avatarSrc: manager.avatar,
                initials: manager.initials,
                ctaLabel: "Conversar",
                ctaIcon: "chat_bubble",
                onCtaClick: () => setContactTarget(manager.name),
              },
              ...SUPPORT_CONTACTS.map((contact) => ({
                name: contact.name,
                role: contact.role,
                avatarSrc: contact.avatar,
                initials: contact.initials,
                ctaLabel: "Conversar",
                ctaIcon: "chat_bubble",
                onCtaClick: () => setContactTarget(contact.name),
              })),
            ]}
            ai={{ ...CORTEX, onCtaClick: () => openCopilot(true) }}
          />
        )}
        <MemberSection
          title="Membros da organização"
          description="Todas as pessoas com acesso direto a esta organização. Convide, ajuste função ou abra o painel para revisar permissões."
          members={others}
          invitations={filtersActive ? [] : INVITATIONS}
          managerAlreadyAssigned={managerAlreadyAssigned}
          onSelect={onSelect}
          onChangeRole={onChangeRole}
          onChangeLifecycle={onChangeLifecycle}
          onRemove={onRemove}
          emptyHint="Sem membros nessa categoria."
          search={search}
          onSearchChange={onSearchChange}
          roleFilter={roleFilter}
          onRoleFilterChange={onRoleFilterChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          filtersActive={filtersActive}
          onClearFilters={onClearFilters}
          onOpenInvite={onOpenInvite}
        />
      </div>
      <AwContactChannelModal
        open={contactTarget !== null}
        onClose={() => setContactTarget(null)}
        managerName={contactTarget ?? undefined}
      />
    </>
  );
}

function MemberSection({
  title,
  description,
  members,
  invitations = [],
  managerAlreadyAssigned,
  onSelect,
  onChangeRole,
  onChangeLifecycle,
  onRemove,
  emptyHint,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  filtersActive,
  onClearFilters,
  onOpenInvite,
}: {
  title: string;
  description?: string;
  members: Member[];
  invitations?: Invitation[];
  managerAlreadyAssigned: boolean;
  onSelect: (id: string) => void;
  onChangeRole: (id: string, role: Role) => void;
  onChangeLifecycle?: (id: string, action: "inactivate" | "reactivate") => void;
  onRemove?: (id: string) => void;
  emptyHint: string;
  search?: string;
  onSearchChange?: (v: string) => void;
  roleFilter?: Role | "all";
  onRoleFilterChange?: (v: Role | "all") => void;
  statusFilter?: MemberStatus | "all";
  onStatusFilterChange?: (v: MemberStatus | "all") => void;
  filtersActive?: boolean;
  onClearFilters?: () => void;
  onOpenInvite?: () => void;
}) {
  const toast = useToast();
  const total = members.length + invitations.length;
  const hasToolbar = onSearchChange !== undefined || onOpenInvite !== undefined;
  return (
    <section>
      <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="m-0 body-sm font-semibold text-(--fg-primary)">
            {title}
          </h2>
          {description && (
            <p className="m-0 mt-2 max-w-[760px] body-xs text-(--fg-secondary)">
              {description}
            </p>
          )}
        </div>
      </header>

      {hasToolbar && (
        <div className="mb-3">
          <MembersToolbar
            search={search ?? ""}
            onSearchChange={onSearchChange}
            roleFilter={roleFilter ?? "all"}
            onRoleFilterChange={onRoleFilterChange}
            statusFilter={statusFilter ?? "all"}
            onStatusFilterChange={onStatusFilterChange}
            filtersActive={filtersActive ?? false}
            onClearFilters={onClearFilters}
            onOpenInvite={onOpenInvite}
          />
        </div>
      )}

      {total === 0 ? (
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) px-6 py-8 text-center">
          <p className="m-0 body-xs text-(--fg-secondary)">
            {emptyHint}
          </p>
        </div>
      ) : (
        <AwMembersTable
          columns={[
            { label: "Pessoa", icon: "person" },
            { label: "", width: 88 },
          ]}
        >
          {members.map((m) => {
            const statusTag = m.isYou
              ? { label: "Você", variant: "live" as const }
              : memberStatusTag(m.status);
            const kebabItems: AwDropdownItem[] = [
              { id: "profile", label: "Ver perfil", onSelect: () => onSelect(m.id) },
              {
                id: "copy-email",
                label: "Copiar e-mail",
                onSelect: () => navigator.clipboard.writeText(m.email),
              },
            ];
            if (onChangeLifecycle !== undefined) {
              kebabItems.push({ id: "sep-lifecycle", separator: true });
              kebabItems.push(
                m.status === "inactive"
                  ? {
                      id: "reactivate",
                      label: "Reativar acesso",
                      onSelect: () => onChangeLifecycle(m.id, "reactivate"),
                    }
                  : {
                      id: "inactivate",
                      label: "Inativar acesso",
                      danger: true,
                      onSelect: () => onChangeLifecycle(m.id, "inactivate"),
                    }
              );
            }
            kebabItems.push({ id: "sep-member", separator: true });
            kebabItems.push({
              id: "remove",
              label: m.isYou ? "Sair da organização" : "Remover da organização",
              danger: true,
              onSelect: () => onRemove?.(m.id),
            });
            return (
            <tr
              key={m.id}
              className="aw-row-clickable"
              onClick={() => onSelect(m.id)}
            >
              <AwMembersTablePersonCell
                name={m.name}
                email={m.role}
                avatarSrc={m.avatar}
                initials={m.initials}
                tag={statusTag?.label}
                tagVariant={statusTag?.variant}
                presence={m.online ? "live" : undefined}
              />
              <td>
                <div className="flex items-center justify-end gap-1">
                  <span onClick={(e) => e.stopPropagation()}>
                    <AwDropdownMenu
                      align="end"
                      trigger={
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary) transition-colors duration-aw-fast"
                          aria-label="Ações"
                        >
                          <Icon name="more_vert" size={20} weight={400} />
                        </button>
                      }
                      items={kebabItems}
                    />
                  </span>
                  <Icon
                    name="chevron_right"
                    size={18}
                    weight={400}
                    className="shrink-0 text-(--fg-secondary)"
                  />
                </div>
              </td>
            </tr>
            );
          })}
          {invitations.map((i) => (
            <tr key={i.id}>
              <AwMembersTablePersonCell
                name={i.email}
                initials={i.initials.toUpperCase()}
                tag="Convite enviado"
                tagVariant="draft"
              />
              <td>
                <div className="flex items-center justify-end gap-1">
                  <span onClick={(e) => e.stopPropagation()}>
                    <AwDropdownMenu
                      align="end"
                      trigger={
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary) transition-colors duration-aw-fast"
                          aria-label="Ações do convite"
                        >
                          <Icon name="more_vert" size={20} weight={400} />
                        </button>
                      }
                      items={[
                        {
                          id: "resend",
                          label: "Reenviar convite",
                          onSelect: () =>
                            toast.push({
                              variant: "success",
                              title: "Convite reenviado",
                              description: `Enviamos de novo para ${i.email}. O link expira em 7 dias.`,
                            }),
                        },
                        { id: "sep-invite", separator: true },
                        {
                          id: "cancel",
                          label: "Cancelar convite",
                          danger: true,
                          onSelect: () =>
                            toast.push({
                              variant: "info",
                              title: "Convite cancelado",
                              description: `${i.email} não vai mais conseguir usar o link enviado.`,
                            }),
                        },
                      ]}
                    />
                  </span>
                  <span className="inline-block h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                </div>
              </td>
            </tr>
          ))}
        </AwMembersTable>
      )}
    </section>
  );
}

/* -----------------------------------------------------------------
 * Status helpers + filter toolbar
 * ----------------------------------------------------------------- */

/** Pill mostrada ao lado do nome na tabela. Ativos não recebem pill — só os
 *  estados que merecem destaque (convidado, inativo). */
function memberStatusTag(
  status: MemberStatus
): { label: string; variant: "draft" | "neutral" } | null {
  if (status === "invited") return { label: "Convidado", variant: "draft" };
  if (status === "inactive") return { label: "Inativo", variant: "neutral" };
  return null;
}

const STATUS_FILTER_OPTIONS: { value: MemberStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativo" },
  { value: "invited", label: "Convidado" },
  { value: "inactive", label: "Inativo" },
];

function MembersToolbar({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  filtersActive,
  onClearFilters,
  onOpenInvite,
}: {
  search: string;
  onSearchChange?: (v: string) => void;
  roleFilter: Role | "all";
  onRoleFilterChange?: (v: Role | "all") => void;
  statusFilter: MemberStatus | "all";
  onStatusFilterChange?: (v: MemberStatus | "all") => void;
  filtersActive: boolean;
  onClearFilters?: () => void;
  onOpenInvite?: () => void;
}) {
  const roleLabel = roleFilter === "all" ? "Função: todas" : `Função: ${roleFilter}`;
  const statusLabel =
    statusFilter === "all"
      ? "Status: todos"
      : `Status: ${
          STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)?.label
        }`;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {onSearchChange !== undefined && (
        <div className="min-w-[180px] flex-1">
          <AwInput
            iconLeft="search"
            placeholder="Buscar membros…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}

      {onRoleFilterChange !== undefined && (
        <AwDropdownMenu
          align="start"
          trigger={
            <AwSelect aria-label="Filtrar por função">{roleLabel}</AwSelect>
          }
          items={[
            {
              id: "role-all",
              label: "Todas as funções",
              checked: roleFilter === "all",
              onSelect: () => onRoleFilterChange("all"),
            },
            { id: "role-sep", separator: true },
            ...ROLE_OPTIONS.map((r) => ({
              id: `role-${r}`,
              label: r,
              checked: roleFilter === r,
              onSelect: () => onRoleFilterChange(r),
            })),
          ]}
        />
      )}

      {onStatusFilterChange !== undefined && (
        <AwDropdownMenu
          align="start"
          trigger={
            <AwSelect aria-label="Filtrar por status">{statusLabel}</AwSelect>
          }
          items={STATUS_FILTER_OPTIONS.map((o) => ({
            id: `status-${o.value}`,
            label: o.label,
            checked: statusFilter === o.value,
            onSelect: () => onStatusFilterChange(o.value),
          }))}
        />
      )}

      {filtersActive && onClearFilters && (
        <AwButton
          size="sm"
          variant="ghost"
          iconLeft="filter_alt_off"
          onClick={onClearFilters}
        >
          Limpar filtros
        </AwButton>
      )}

      {onOpenInvite !== undefined && (
        <AwButton
          size="md"
          variant="primary"
          iconLeft="person_add"
          onClick={onOpenInvite}
        >
          Adicionar membro
        </AwButton>
      )}
    </div>
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
    <aside className="flex flex-col self-start divide-y divide-(--border-subtle) overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-raised)">
      <div className="border-b border-(--border-subtle) px-4 py-3">
        <p className="m-0 aw-eyebrow text-(--fg-tertiary)">
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
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-aw-fast outline-hidden focus-visible:bg-(--bg-hover) " +
                  (active
                    ? "bg-(--bg-selected)"
                    : "hover:bg-(--bg-hover)")
                }
              >
                <AwAvatar
                  size="sm"
                  src={m.avatar}
                  alt={m.name}
                  initials={m.initials}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate body-xs font-medium text-(--fg-primary)">
                    {m.name}
                    {m.isYou && (
                      <span className="ml-1 text-(--fg-secondary)">
                        (você)
                      </span>
                    )}
                  </span>
                  <span className="block truncate body-xs text-(--fg-secondary)">
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
  isLastActiveAdmin,
  onChangeRole,
  onRemove,
  onChangeLifecycle,
  onToggleInvoices,
  onPatchMember,
  onClose,
  onTogglePermission,
  onToggleScope,
}: {
  member: Member;
  managerAlreadyAssigned: boolean;
  isLastActiveAdmin: boolean;
  onChangeRole: (role: Role) => void;
  onRemove: () => void;
  onChangeLifecycle: (action: "inactivate" | "reactivate") => void;
  onToggleInvoices: (next: boolean) => void;
  onPatchMember: (patch: Partial<Member>) => void;
  onClose: () => void;
  onTogglePermission: (permissionId: string, next: boolean) => void;
  onToggleScope: (scopeIds: string[], next: boolean) => void;
}) {
  const memberPermissions = new Set(member.permissions);
  const hasFullAccess =
    member.permissions.length === ALL_PERMISSION_IDS.length;
  const isInactive = member.status === "inactive";
  const headerStatusTag = member.isYou
    ? { label: "Você", variant: "live" as const }
    : memberStatusTag(member.status);

  return (
    <section className="flex max-h-[calc(100vh-160px)] flex-col self-start overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-raised)">
      <header className="flex items-start gap-4 border-b border-(--border-subtle) px-6 py-5">
        <AwAvatar
          size="lg"
          src={member.avatar}
          alt={member.name}
          initials={member.initials}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="m-0 truncate body-sm font-semibold text-(--fg-primary)">
              {member.name}
            </p>
            {headerStatusTag && (
              <AwPill variant={headerStatusTag.variant} dot={false}>
                {headerStatusTag.label}
              </AwPill>
            )}
          </div>
          <p className="m-0 truncate body-xs text-(--fg-secondary)">
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
                  (r === MANAGER_ROLE &&
                    managerAlreadyAssigned &&
                    member.role !== MANAGER_ROLE) ||
                  // Bloqueia rebaixar o último Administrador ativo.
                  (isLastActiveAdmin && r !== ADMIN_ROLE),
                onSelect: () => onChangeRole(r),
              })),
            ]}
          />
          {!member.isYou && (
            <AwButton
              size="sm"
              variant="ghost"
              iconLeft={isInactive ? "restart_alt" : "block"}
              onClick={() =>
                onChangeLifecycle(isInactive ? "reactivate" : "inactivate")
              }
            >
              {isInactive ? "Reativar" : "Inativar"}
            </AwButton>
          )}
          {/* "Sair" (perfil próprio) saía aqui, redundante com o X de fechar
              ao lado e com a ação do kebab na lista. Mantemos só "Remover"
              para gerir outros membros. */}
          {!member.isYou && (
            <AwButton
              size="sm"
              variant="ghost"
              iconLeft="person_remove"
              onClick={onRemove}
            >
              Remover
            </AwButton>
          )}
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
        <div className="grid grid-cols-2 gap-4 border-b border-(--border-subtle) px-6 py-5">
          <DetailStat label="Função" value={member.role} />
          <DetailStat label="Cargo" value={member.cargo} />
          <DetailStat label="E-mail" value={member.email} />
          <DetailStat label="Telefone" value={member.phone} />
          <DetailStat label="Último acesso" value={member.lastActive} />
          <DetailStat label="Entrou em" value={member.joinedAt} />
        </div>

        <MfaSection member={member} onPatchMember={onPatchMember} />

        <BillingSection member={member} onToggleInvoices={onToggleInvoices} />

        <DetailSection title="Permissões por escopo">
          <div className="flex flex-col gap-3">
            {hasFullAccess && <FullAccessBanner />}
            <ul className="flex flex-col divide-y divide-(--border-subtle)">
              {SCOPES.map((scope) => (
                <ScopeRow
                  key={scope.id}
                  scope={scope}
                  memberPermissions={memberPermissions}
                  onTogglePermission={onTogglePermission}
                  onToggleScope={onToggleScope}
                />
              ))}
            </ul>
          </div>
        </DetailSection>

        <DetailSection title="Atividade">
          {member.activity.length === 0 ? (
            <p className="m-0 body-xs text-(--fg-secondary)">
              Sem eventos para este membro ainda.
            </p>
          ) : (
            <ol className="m-0 flex list-none flex-col p-0">
              {member.activity.map((entry, i) => (
                <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < member.activity.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-[13px] top-8 w-px bg-(--border-subtle)"
                    />
                  )}
                  <span className="z-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)">
                    <Icon name={inferActivityIcon(entry.description)} size={14} />
                  </span>
                  <span className="min-w-0 flex-1 pt-0.5">
                    <span className="block body-xs text-(--fg-primary)">
                      {entry.description}
                    </span>
                    <span className="mt-0.5 block aw-eyebrow text-(--fg-tertiary)">
                      {entry.time}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </DetailSection>
      </div>
    </section>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="m-0 mb-1 aw-eyebrow text-(--fg-tertiary)">
        {label}
      </p>
      <p className="m-0 truncate body-xs font-medium text-(--fg-primary)">
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
    <section className="border-b border-(--border-subtle) px-6 py-5 last:border-b-0">
      <h3 className="m-0 mb-3 aw-eyebrow text-(--fg-tertiary)">
        {title}
      </h3>
      {children}
    </section>
  );
}

/* -----------------------------------------------------------------
 * MFA admin section — estado do MFA + ações administrativas
 * (gerar códigos de backup, resetar MFA).
 * ----------------------------------------------------------------- */

/** Gera N códigos de backup mock no formato XXXX-XXXX. */
function generateBackupCodes(count = 10): string[] {
  const block = () =>
    Array.from({ length: 4 }, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(
        Math.floor(Math.random() * 32)
      )
    ).join("");
  return Array.from({ length: count }, () => `${block()}-${block()}`);
}

function MfaSection({
  member,
  onPatchMember,
}: {
  member: Member;
  onPatchMember: (patch: Partial<Member>) => void;
}) {
  const [codesModal, setCodesModal] = useState<string[] | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const total = member.mfaBackupCodesTotal ?? 10;
  const remaining = member.mfaBackupCodesRemaining ?? total;
  const firstName = member.name.split(" ")[0];

  const handleGenerate = () => {
    const codes = generateBackupCodes(total);
    setCodesModal(codes);
    onPatchMember({
      mfaBackupCodesRemaining: codes.length,
      mfaBackupCodesTotal: codes.length,
    });
  };

  const handleReset = () => {
    onPatchMember({
      mfaEnabled: false,
      mfaConfiguredAt: undefined,
      mfaBackupCodesRemaining: undefined,
      mfaBackupCodesTotal: undefined,
    });
    setResetOpen(false);
  };

  return (
    <DetailSection title="Autenticação (MFA)">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <AwBrandLogo
            brand="google-authenticator"
            size="sm"
            className="mt-0.5"
            aria-label="Google Authenticator"
          />
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <AwPill variant={member.mfaEnabled ? "live" : "warning"} dot={false}>
              {member.mfaEnabled ? "Ativa" : "Não configurada"}
            </AwPill>
            <span className="body-xs text-(--fg-tertiary)">
              {member.mfaEnabled
                ? `App autenticador configurado em ${member.mfaConfiguredAt ?? "—"} · ${remaining} de ${total} códigos de backup válidos.`
                : "A pessoa ainda não ativou a verificação em duas etapas na conta."}
            </span>
          </div>
        </div>

        {member.mfaEnabled && (
          <div className="flex flex-wrap items-center gap-2">
            <AwButton
              size="sm"
              variant="secondary"
              iconLeft="vpn_key"
              onClick={handleGenerate}
            >
              Gerar códigos de backup
            </AwButton>
            <AwButton
              size="sm"
              variant="ghost"
              iconLeft="lock_reset"
              onClick={() => setResetOpen(true)}
            >
              Resetar verificação
            </AwButton>
          </div>
        )}
      </div>

      {/* Modal — códigos de backup (reaproveita AwBackupCodes) */}
      <AwModal
        open={codesModal !== null}
        onClose={() => setCodesModal(null)}
        title={`Códigos de backup · ${member.name}`}
        footer={
          <AwButton size="sm" variant="primary" onClick={() => setCodesModal(null)}>
            Concluir
          </AwButton>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="m-0 body-xs text-(--fg-secondary) text-pretty">
            {total} códigos gerados. Cada um serve uma única vez e os anteriores
            foram invalidados. Repasse para {member.name.split(" ")[0]} por um
            canal seguro.
          </p>
          {codesModal && (
            <AwBackupCodes
              codes={codesModal}
              filename={`codigos-backup-${member.id}.txt`}
            />
          )}
        </div>
      </AwModal>

      {/* Modal — resetar MFA (confirmação) */}
      <AwModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title={`Resetar a verificação em duas etapas de ${firstName}?`}
        footer={
          <>
            <AwButton size="sm" variant="ghost" onClick={() => setResetOpen(false)}>
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="danger"
              iconLeft="lock_reset"
              onClick={handleReset}
            >
              Resetar verificação
            </AwButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <AwAlert variant="warning">
            {firstName} configura tudo de novo no próximo acesso — um novo app
            autenticador e novos códigos de backup. Os atuais param de funcionar
            na hora.
          </AwAlert>
          <p className="m-0 body-xs text-(--fg-secondary) text-pretty">
            Faça isso quando {firstName} perder o celular ou o acesso ao
            autenticador. Fica registrado no histórico com o seu nome.
          </p>
        </div>
      </AwModal>
    </DetailSection>
  );
}

/* -----------------------------------------------------------------
 * Billing section — recebimento de faturas/NF por membro.
 * ----------------------------------------------------------------- */

function BillingSection({
  member,
  onToggleInvoices,
}: {
  member: Member;
  onToggleInvoices: (next: boolean) => void;
}) {
  const toggleId = `invoices-${member.id}`;
  return (
    <DetailSection title="Faturamento">
      <div className="flex items-start justify-between gap-4">
        <label htmlFor={toggleId} className="min-w-0 flex-1 cursor-pointer">
          <span className="block body-xs font-medium text-(--fg-primary)">
            Recebe faturas e notas fiscais (NF)
          </span>
          <span className="mt-0.5 block body-xs text-(--fg-tertiary) text-pretty">
            As faturas e NF da organização chegam por e-mail para este membro.
            Independe da permissão de Financeiro — é por pessoa.
          </span>
        </label>
        <AwToggle
          id={toggleId}
          checked={Boolean(member.receivesInvoices)}
          onChange={(next) => onToggleInvoices(next)}
          label="Recebe faturas e notas fiscais"
        />
      </div>
    </DetailSection>
  );
}

function inferActivityIcon(description: string): string {
  const d = description.toLowerCase();
  if (d.includes("convid")) return "person_add";
  if (d.includes("aprov")) return "check_circle";
  if (d.includes("removeu") || d.includes("excluiu")) return "delete";
  if (d.includes("atualiz") || d.includes("editou")) return "edit";
  if (d.includes("encerrou") || d.includes("fechou")) return "task_alt";
  if (d.includes("adicionou") || d.includes("criou")) return "add_circle";
  if (d.includes("login") || d.includes("acesso")) return "login";
  return "schedule";
}

function FullAccessBanner() {
  return (
    <div className="flex items-center gap-3 rounded-md bg-(--bg-inverse) px-4 py-3 text-(--fg-on-inverse)">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-(--bg-raised)/15 text-(--fg-on-inverse)">
        <Icon name="verified" size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 body-xs font-medium text-(--fg-on-inverse)">
          Acesso total
        </p>
        <p className="m-0 body-xs text-(--fg-on-inverse)/80">
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
  onTogglePermission,
  onToggleScope,
}: {
  scope: Scope;
  memberPermissions: Set<string>;
  onTogglePermission: (permissionId: string, next: boolean) => void;
  onToggleScope: (scopeIds: string[], next: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const ids = scope.groups.flatMap((g) => g.permissions.map((p) => p.id));
  const granted = ids.filter((id) => memberPermissions.has(id)).length;
  const total = ids.length;
  const all = granted === total;
  const some = granted > 0 && !all;
  const variant = all ? "live" : some ? "beta" : "neutral";
  const status = all ? "Completo" : some ? "Parcial" : "Sem acesso";
  const scopeCheckState: boolean | "indeterminate" = all
    ? true
    : some
    ? "indeterminate"
    : false;

  return (
    <li>
      <div className="flex w-full items-center gap-3 rounded-sm px-2 py-3.5 transition-colors duration-aw-fast hover:bg-(--bg-hover)">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left outline-hidden rounded-sm focus-visible:bg-(--bg-hover)"
          aria-expanded={open}
        >
          <Icon
            name="chevron_right"
            size={16}
            className={"transition-transform " + (open ? "rotate-90" : "")}
            style={{
              transitionDuration: "var(--dur-base)",
              transitionTimingFunction: "var(--ease-in-out)",
            }}
          />
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-(--bg-muted) text-(--fg-secondary)">
            <Icon name={scope.icon} size={14} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate body-xs font-medium text-(--fg-primary)">
              {scope.name}
            </span>
            <span className="block body-xs text-(--fg-secondary)">
              {granted}/{total} permiss{total === 1 ? "ão" : "ões"}
            </span>
          </span>
        </button>
        <AwPill variant={variant} dot={false}>
          {status}
        </AwPill>
        <AwCheckbox
          checked={scopeCheckState}
          onChange={(next) => onToggleScope(ids, next)}
          label={`Ativar todas as permissões de ${scope.name}`}
        />
      </div>

      <div
        className="grid transition-[grid-template-rows,opacity]"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transitionDuration: "var(--dur-slow)",
          transitionTimingFunction: "var(--ease-in-out)",
        }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 px-1 pb-3 pl-10 pt-1">
            {scope.groups.map((g) => (
              <div key={g.id}>
                <p className="m-0 mb-1.5 aw-eyebrow text-(--fg-tertiary)">
                  {g.label}
                </p>
                <ul className="flex flex-col gap-1">
                  {g.permissions.map((p) => {
                    const has = memberPermissions.has(p.id);
                    return (
                      <li
                        key={p.id}
                        className="flex items-start gap-2 rounded-sm px-1 py-1 hover:bg-(--bg-hover)"
                      >
                        <span className="mt-0.5">
                          <AwCheckbox
                            checked={has}
                            onChange={(next) => onTogglePermission(p.id, next)}
                            label={p.label}
                          />
                        </span>
                        <label
                          className="min-w-0 flex-1 cursor-pointer body-xs"
                          onClick={() => onTogglePermission(p.id, !has)}
                        >
                          <span
                            className={
                              "flex items-center gap-1.5 " +
                              (has
                                ? "font-medium text-(--fg-primary)"
                                : "text-(--fg-secondary)")
                            }
                          >
                            {p.isSensitive && (
                              <Icon
                                name="lock"
                                size={13}
                                className="shrink-0 text-(--fg-tertiary)"
                              />
                            )}
                            <span className="min-w-0 truncate">{p.label}</span>
                            {p.isSensitive && (
                              <AwPill variant="warning" dot={false}>
                                Sensível
                              </AwPill>
                            )}
                          </span>
                          {p.description && (
                            <span className="mt-0.5 block body-xs text-(--fg-tertiary)">
                              {p.description}
                            </span>
                          )}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
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
          <p className="m-0 body-xs text-(--fg-primary)">
            Você vai mudar{" "}
            <strong className="font-semibold">{pending.memberName}</strong> de{" "}
            <strong className="font-semibold">{pending.fromRole}</strong> para{" "}
            <strong className="font-semibold">{pending.toRole}</strong>.
          </p>

          <div className="rounded-md border border-(--border-subtle) bg-(--bg-muted) p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="m-0 aw-eyebrow text-(--fg-tertiary)">
                  De
                </p>
                <p className="m-0 mt-1 body-xs font-medium text-(--fg-primary)">
                  {pending.fromRole}
                </p>
                <p className="m-0 body-xs text-(--fg-secondary)">
                  {fromCount} permiss{fromCount === 1 ? "ão" : "ões"}
                </p>
              </div>
              <Icon
                name="arrow_forward"
                size={18}
                className="shrink-0 text-(--fg-tertiary)"
              />
              <div className="min-w-0 text-right">
                <p className="m-0 aw-eyebrow text-(--fg-tertiary)">
                  Para
                </p>
                <p className="m-0 mt-1 body-xs font-medium text-(--fg-primary)">
                  {pending.toRole}
                </p>
                <p className="m-0 body-xs text-(--fg-secondary)">
                  {toCount} permiss{toCount === 1 ? "ão" : "ões"}
                  {diff !== 0 && (
                    <span
                      className={
                        diff > 0
                          ? "ml-1.5 text-(--accent-success)"
                          : "ml-1.5 text-(--accent-danger)"
                      }
                    >
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <p className="m-0 body-xs text-(--fg-secondary)">
            As permissões serão ajustadas automaticamente. Você pode reverter a
            qualquer momento abrindo o membro novamente.
          </p>
        </div>
      )}
    </AwModal>
  );
}

/* -----------------------------------------------------------------
 * Lifecycle (inativar / reativar) confirmation modal
 * ----------------------------------------------------------------- */

function LifecycleConfirmModal({
  target,
  onConfirm,
  onCancel,
}: {
  target: { member: Member; action: "inactivate" | "reactivate" } | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const inactivating = target?.action === "inactivate";
  const name = target?.member.name ?? "";

  return (
    <AwModal
      open={target !== null}
      onClose={onCancel}
      title={inactivating ? `Inativar ${name}?` : `Reativar ${name}?`}
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={onCancel}>
            Cancelar
          </AwButton>
          <AwButton
            size="sm"
            variant={inactivating ? "danger" : "primary"}
            iconLeft={inactivating ? "block" : "restart_alt"}
            onClick={onConfirm}
          >
            {inactivating ? "Inativar acesso" : "Reativar"}
          </AwButton>
        </>
      }
    >
      {target && (
        <div className="flex flex-col gap-4">
          {inactivating ? (
            <>
              <p className="m-0 body-xs text-(--fg-primary) text-pretty">
                <strong className="font-semibold">{name}</strong> perde o acesso
                no próximo login. A sessão atual continua até expirar, e todo o
                histórico — atividades, conversas e recursos — fica preservado.
                Você pode reativar quando quiser.
              </p>
              <AwAlert variant="info">
                Para cortar o acesso na hora, revogue a sessão em Segurança →
                Acessos.
              </AwAlert>
            </>
          ) : (
            <p className="m-0 body-xs text-(--fg-primary) text-pretty">
              <strong className="font-semibold">{name}</strong> volta para Ativo
              com a mesma função e consegue entrar no próximo acesso — com
              verificação em duas etapas, se a política exigir.
            </p>
          )}
        </div>
      )}
    </AwModal>
  );
}

/* -----------------------------------------------------------------
 * Last-admin guard — bloqueio ao tentar rebaixar/inativar o único Admin
 * ----------------------------------------------------------------- */

function LastAdminBlockModal({
  block,
  onClose,
}: {
  block: { memberName: string; reason: "role" | "inactivate" } | null;
  onClose: () => void;
}) {
  const verb = block?.reason === "inactivate" ? "inativar" : "mudar a função de";
  return (
    <AwModal
      open={block !== null}
      onClose={onClose}
      title="Você é o único Administrador"
      footer={
        <AwButton size="sm" variant="primary" onClick={onClose}>
          Voltar
        </AwButton>
      }
    >
      {block && (
        <div className="flex flex-col gap-4">
          <AwAlert variant="warning">
            A organização não pode ficar sem ninguém com acesso total.
          </AwAlert>
          <p className="m-0 body-xs text-(--fg-secondary) text-pretty">
            Promova outro membro a Administrador antes de {verb}{" "}
            <strong className="font-medium text-(--fg-primary)">
              {block.memberName}
            </strong>
            .
          </p>
        </div>
      )}
    </AwModal>
  );
}
