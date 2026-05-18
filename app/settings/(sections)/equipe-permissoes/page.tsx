"use client";

import { useCallback, useMemo, useState } from "react";
import { FaSlack, FaWhatsapp } from "react-icons/fa6";
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
  INVITATIONS,
  MEMBERS,
  ROLE_DEFINITIONS,
  ROLE_OPTIONS,
  SCOPES,
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
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-10 pb-20 pt-12">
        <header>
          <h3 className="m-0 mb-2 text-[var(--fg-primary)]">
            Equipe &amp; permissões
          </h3>
          <p className="m-0 max-w-[640px] body-xs text-[var(--fg-secondary)]">
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
  role: "Gerente de contas",
  avatarSrc: "/assets/Cortex.png",
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
  const [contactOpen, setContactOpen] = useState(false);
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
    <>
      <div className="flex flex-col gap-8">
        {manager && (
          <AwSpecialistsPair
            title="Especialistas dedicados à sua conta"
            human={{
              name: manager.name,
              role: "Gerente de contas",
              avatarSrc: manager.avatar,
              initials: manager.initials,
              ctaLabel: "Conversar",
              ctaIcon: "chat_bubble",
              onCtaClick: () => setContactOpen(true),
            }}
            ai={CORTEX}
          />
        )}
        <MemberSection
          title="Membros do workspace"
          members={others}
          invitations={INVITATIONS}
          managerAlreadyAssigned={managerAlreadyAssigned}
          onSelect={onSelect}
          onChangeRole={onChangeRole}
          emptyHint="Sem membros nessa categoria."
        />
      </div>
      <ContactChannelModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        managerName={manager?.name}
      />
    </>
  );
}

/* -----------------------------------------------------------------
 * Contact channel modal — picks WhatsApp or Slack to reach the
 * account manager. Opened from the human specialist card CTA.
 * ----------------------------------------------------------------- */

const CONTACT_CHANNELS = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    hint: "Resposta rápida no horário comercial.",
    icon: <FaWhatsapp size={22} />,
    color: "#25D366",
  },
  {
    key: "slack",
    label: "Slack",
    hint: "Converse no canal compartilhado da sua conta.",
    icon: <FaSlack size={22} />,
    color: "#4A154B",
  },
] as const;

function ContactChannelModal({
  open,
  onClose,
  managerName,
}: {
  open: boolean;
  onClose: () => void;
  managerName?: string;
}) {
  return (
    <AwModal open={open} onClose={onClose} title="Conversar com seu gerente">
      <div className="flex flex-col gap-4">
        <p className="m-0 body-xs text-[var(--fg-secondary)]">
          Escolha por onde falar com{" "}
          {managerName ?? "seu gerente de contas"}.
        </p>
        <div className="flex flex-col gap-2">
          {CONTACT_CHANNELS.map((channel) => (
            <button
              key={channel.key}
              type="button"
              onClick={onClose}
              className="aw-card flex items-center gap-3 !px-4 !py-3 text-left transition-colors hover:bg-[var(--bg-surface)]"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: channel.color }}
              >
                {channel.icon}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[14px] font-semibold text-[var(--fg-primary)]">
                  {channel.label}
                </span>
                <span className="body-xs text-[var(--fg-secondary)]">
                  {channel.hint}
                </span>
              </span>
              <Icon
                name="chevron_right"
                size={18}
                className="ml-auto text-[var(--fg-tertiary)]"
              />
            </button>
          ))}
        </div>
      </div>
    </AwModal>
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
}: {
  title: string;
  description?: string;
  members: Member[];
  invitations?: Invitation[];
  managerAlreadyAssigned: boolean;
  onSelect: (id: string) => void;
  onChangeRole: (id: string, role: Role) => void;
  emptyHint: string;
}) {
  const total = members.length + invitations.length;
  return (
    <section>
      <header className="mb-3">
        <h2 className="m-0 body-sm font-semibold text-[var(--fg-primary)]">
          {title}
        </h2>
        {description && (
          <p className="m-0 mt-2 max-w-[760px] body-xs text-[var(--fg-secondary)]">
            {description}
          </p>
        )}
      </header>

      {total === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-6 py-8 text-center">
          <p className="m-0 body-xs text-[var(--fg-secondary)]">
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
          {invitations.map((i) => (
            <tr key={i.id}>
              <AwMembersTablePersonCell
                name={i.email}
                initials={i.initials.toUpperCase()}
                tag="Convite enviado"
                tagVariant="draft"
              />
              <AwMembersTableTextCell muted>{i.role}</AwMembersTableTextCell>
              <td>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 body-xs text-[var(--fg-secondary)]">
                    <Icon
                      name="mail"
                      size={14}
                      className="text-[var(--fg-tertiary)]"
                    />
                    Aguardando aceite · enviado {i.sentAt}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <AwButton size="sm" variant="ghost" iconLeft="send">
                      Reenviar
                    </AwButton>
                    <AwButton size="sm" variant="ghost" iconLeft="close">
                      Remover
                    </AwButton>
                  </div>
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
    <aside className="flex flex-col self-start divide-y divide-[var(--border-subtle)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]">
      <div className="border-b border-[var(--border-subtle)] px-4 py-3">
        <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
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
                  <span className="block truncate body-xs font-medium text-[var(--fg-primary)]">
                    {m.name}
                    {m.isYou && (
                      <span className="ml-1 text-[var(--fg-secondary)]">
                        (você)
                      </span>
                    )}
                  </span>
                  <span className="block truncate body-xs text-[var(--fg-secondary)]">
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
            <p className="m-0 truncate body-sm font-semibold text-[var(--fg-primary)]">
              {member.name}
            </p>
            {member.isYou && (
              <AwPill variant="live" dot={false}>
                Você
              </AwPill>
            )}
          </div>
          <p className="m-0 truncate body-xs text-[var(--fg-secondary)]">
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
        <div className="grid grid-cols-2 gap-4 border-b border-[var(--border-subtle)] px-6 py-5">
          <DetailStat label="Função" value={member.role} />
          <DetailStat label="Último acesso" value={member.lastActive} />
        </div>

        <DetailSection title="Permissões por escopo">
          <div className="flex flex-col gap-3">
            {hasFullAccess && <FullAccessBanner />}
            <ul className="flex flex-col divide-y divide-[var(--border-subtle)]">
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

        <DetailSection title="Logs de atividade">
          {member.activity.length === 0 ? (
            <p className="m-0 body-xs text-[var(--fg-secondary)]">
              Sem eventos registrados para este membro.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {member.activity.map((entry, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-3 py-2"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[var(--fg-secondary)]">
                    <Icon name={inferActivityIcon(entry.description)} size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block body-xs text-[var(--fg-primary)]">
                      {entry.description}
                    </span>
                    <span className="block aw-eyebrow text-[var(--fg-tertiary)]">
                      {entry.time}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DetailSection>

        <DetailSection title="Histórico recente">
          <div className="-mx-6 overflow-x-auto px-6">
            <ol className="relative flex min-w-min items-start gap-0">
              <span
                className="pointer-events-none absolute left-3 right-3 top-[6px] h-px bg-[var(--border-subtle)]"
                aria-hidden="true"
              />
              {member.activity.map((entry, i) => (
                <li
                  key={i}
                  className="relative flex w-[220px] shrink-0 flex-col gap-1.5 pr-4"
                >
                  <span
                    className="relative z-[1] flex h-3 w-3 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-raised)]"
                    aria-hidden="true"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--fg-primary)]" />
                  </span>
                  <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
                    {entry.time}
                  </p>
                  <p className="m-0 body-xs text-[var(--fg-primary)]">
                    {entry.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </DetailSection>
      </div>
    </section>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="m-0 mb-1 aw-eyebrow text-[var(--fg-tertiary)]">
        {label}
      </p>
      <p className="m-0 truncate body-xs font-medium text-[var(--fg-primary)]">
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
      <h3 className="m-0 mb-3 aw-eyebrow text-[var(--fg-tertiary)]">
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
    <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-raised)] text-[var(--fg-primary)]">
        <Icon name="verified" size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 body-xs font-medium text-[var(--fg-primary)]">
          Acesso total
        </p>
        <p className="m-0 body-xs text-[var(--fg-secondary)]">
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
      <div className="flex w-full items-center gap-3 px-1 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left transition-colors duration-aw-fast outline-none rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)] focus-visible:bg-[var(--bg-hover)]"
          aria-expanded={open}
        >
          <Icon name={open ? "expand_more" : "chevron_right"} size={16} />
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[var(--fg-secondary)]">
            <Icon name={scope.icon} size={14} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate body-xs font-medium text-[var(--fg-primary)]">
              {scope.name}
            </span>
            <span className="block body-xs text-[var(--fg-secondary)]">
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

      {open && (
        <div className="flex flex-col gap-3 px-1 pb-3 pl-10">
          {scope.groups.map((g) => (
            <div key={g.id}>
              <p className="m-0 mb-1.5 aw-eyebrow text-[var(--fg-tertiary)]">
                {g.label}
              </p>
              <ul className="flex flex-col gap-1">
                {g.permissions.map((p) => {
                  const has = memberPermissions.has(p.id);
                  return (
                    <li
                      key={p.id}
                      className="flex items-start gap-2 rounded-[var(--radius-sm)] px-1 py-1 hover:bg-[var(--bg-hover)]"
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
                              ? "font-medium text-[var(--fg-primary)]"
                              : "text-[var(--fg-secondary)]")
                          }
                        >
                          {p.label}
                        </span>
                        {p.description && (
                          <span className="block body-xs text-[var(--fg-tertiary)]">
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
          <p className="m-0 body-xs text-[var(--fg-primary)]">
            Você vai mudar{" "}
            <strong className="font-semibold">{pending.memberName}</strong> de{" "}
            <strong className="font-semibold">{pending.fromRole}</strong> para{" "}
            <strong className="font-semibold">{pending.toRole}</strong>.
          </p>

          <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
                  De
                </p>
                <p className="m-0 mt-1 body-xs font-medium text-[var(--fg-primary)]">
                  {pending.fromRole}
                </p>
                <p className="m-0 body-xs text-[var(--fg-secondary)]">
                  {fromCount} permiss{fromCount === 1 ? "ão" : "ões"}
                </p>
              </div>
              <Icon
                name="arrow_forward"
                size={18}
                className="shrink-0 text-[var(--fg-tertiary)]"
              />
              <div className="min-w-0 text-right">
                <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
                  Para
                </p>
                <p className="m-0 mt-1 body-xs font-medium text-[var(--fg-primary)]">
                  {pending.toRole}
                </p>
                <p className="m-0 body-xs text-[var(--fg-secondary)]">
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

          <p className="m-0 body-xs text-[var(--fg-secondary)]">
            As permissões serão ajustadas automaticamente. Você pode reverter a
            qualquer momento abrindo o membro novamente.
          </p>
        </div>
      )}
    </AwModal>
  );
}
