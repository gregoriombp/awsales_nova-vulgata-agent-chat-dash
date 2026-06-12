"use client";

import { useCallback, useMemo, useState } from "react";
import { useCopilotDrawer } from "@/lib/copilot/store";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
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
  AwMembersTableTextCell,
} from "@/components/ui/AwMembersTable";
import { AwPill } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwSpecialistsPair } from "@/components/ui/AwSpecialistsPair";
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
            Gerencie quem tem acesso ao workspace, convide novas pessoas e
            organize permissões por função e projeto.
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
                onOpenInvite={() => setInviteOpen(true)}
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
    </>
  );
}

/* -----------------------------------------------------------------
 * State A — full-width members table
 * ----------------------------------------------------------------- */

const MANAGER_ROLE: Role = "Gerente da conta";

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
  onOpenInvite,
  managerAlreadyAssigned,
  onSelect,
  onChangeRole,
}: {
  members: Member[];
  search: string;
  onSearchChange: (v: string) => void;
  onOpenInvite: () => void;
  managerAlreadyAssigned: boolean;
  onSelect: (id: string) => void;
  onChangeRole: (id: string, role: Role) => void;
}) {
  const [contactTarget, setContactTarget] = useState<string | null>(null);
  const openCopilot = useCopilotDrawer((s) => s.setOpen);
  const managers = members.filter((m) => m.role === MANAGER_ROLE);
  const others = members.filter((m) => m.role !== MANAGER_ROLE);

  if (members.length === 0 && search.trim() !== "") {
    return (
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
    );
  }

  const manager = managers[0];

  return (
    <>
      <div className="flex flex-col gap-8">
        {manager && (
          <AwSpecialistsPair
            title="Especialistas dedicados à sua conta"
            description="O time humano e o agente de IA que acompanham sua operação dia a dia — fale com eles pra tirar dúvidas, abrir solicitações ou pedir ajustes."
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
          description="Todas as pessoas com acesso direto a este workspace. Convide novos membros, ajuste função ou abra o painel pra revisar permissões."
          members={others}
          invitations={INVITATIONS}
          managerAlreadyAssigned={managerAlreadyAssigned}
          onSelect={onSelect}
          onChangeRole={onChangeRole}
          emptyHint="Sem membros nessa categoria."
          search={search}
          onSearchChange={onSearchChange}
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
  emptyHint,
  search,
  onSearchChange,
  onOpenInvite,
}: {
  title: string;
  description?: string;
  members: Member[];
  invitations?: Invitation[];
  managerAlreadyAssigned: boolean;
  onSelect: (id: string) => void;
  onChangeRole: (id: string, role: Role) => void;
  emptyHint: string;
  search?: string;
  onSearchChange?: (v: string) => void;
  onOpenInvite?: () => void;
}) {
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
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {onSearchChange !== undefined && (
            <div className="flex-1 min-w-0">
              <AwInput
                iconLeft="search"
                placeholder="Buscar membros…"
                value={search ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
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
          {members.map((m) => (
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
                tag={m.isYou ? "Você" : undefined}
                tagVariant="live"
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
                      items={[
                        { id: "profile",    label: "Ver perfil",           onSelect: () => onSelect(m.id) },
                        { id: "copy-email", label: "Copiar e-mail",        onSelect: () => navigator.clipboard.writeText(m.email) },
                        { id: "sep-member", separator: true },
                        { id: "remove",     label: "Remover do workspace", danger: true, onSelect: () => {} },
                      ]}
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
          ))}
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
                        { id: "resend",     label: "Reenviar convite", onSelect: () => {} },
                        { id: "sep-invite", separator: true },
                        { id: "cancel",     label: "Cancelar convite", danger: true, onSelect: () => {} },
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
  onChangeRole,
  onRemove,
  onClose,
  onTogglePermission,
  onToggleScope,
}: {
  member: Member;
  managerAlreadyAssigned: boolean;
  onChangeRole: (role: Role) => void;
  onRemove: () => void;
  onClose: () => void;
  onTogglePermission: (permissionId: string, next: boolean) => void;
  onToggleScope: (scopeIds: string[], next: boolean) => void;
}) {
  const memberPermissions = new Set(member.permissions);
  const hasFullAccess =
    member.permissions.length === ALL_PERMISSION_IDS.length;

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
            {member.isYou && (
              <AwPill variant="live" dot={false}>
                Você
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
        <div className="grid grid-cols-2 gap-4 border-b border-(--border-subtle) px-6 py-5">
          <DetailStat label="Função" value={member.role} />
          <DetailStat label="Cargo" value={member.cargo} />
          <DetailStat label="E-mail" value={member.email} />
          <DetailStat label="Telefone" value={member.phone} />
          <DetailStat label="Último acesso" value={member.lastActive} />
          <div className="min-w-0">
            <p className="m-0 mb-1 aw-eyebrow text-(--fg-tertiary)">
              Autenticação MFA
            </p>
            <AwPill
              variant={member.mfaEnabled ? "live" : "warning"}
              dot={false}
            >
              {member.mfaEnabled ? "Ativa" : "Não configurada"}
            </AwPill>
          </div>
        </div>

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
              Sem eventos registrados para este membro.
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
    <div className="flex items-center gap-3 rounded-md border border-(--border-subtle) bg-(--bg-muted) px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-(--bg-raised) text-(--fg-primary)">
        <Icon name="verified" size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 body-xs font-medium text-(--fg-primary)">
          Acesso total
        </p>
        <p className="m-0 body-xs text-(--fg-secondary)">
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
                              "block " +
                              (has
                                ? "font-medium text-(--fg-primary)"
                                : "text-(--fg-secondary)")
                            }
                          >
                            {p.label}
                          </span>
                          {p.description && (
                            <span className="block body-xs text-(--fg-tertiary)">
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
