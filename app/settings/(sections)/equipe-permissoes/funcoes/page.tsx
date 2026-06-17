"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ALL_PERMISSION_IDS,
  CUSTOM_ROLE_DEFINITIONS,
  DEFAULT_CUSTOM_ROLE_ICON,
  MEMBERS,
  ROLE_COLORS,
  ROLE_DEFINITIONS,
  SCOPES,
  getRoleColor,
  type Member,
  type RoleColorId,
  type RoleDefinition,
  type Scope,
  type ScopeGroup,
} from "../_components/data";
import { TeamTabs } from "../_components/TeamTabs";

/* -----------------------------------------------------------------
 * Page
 * ----------------------------------------------------------------- */

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>([
    ...ROLE_DEFINITIONS,
    ...CUSTOM_ROLE_DEFINITIONS,
  ]);
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [memberModalRoleId, setMemberModalRoleId] = useState<string | null>(null);
  /** Função que o usuário tentou excluir mas ainda tem membros atribuídos. */
  const [deleteBlockedRoleId, setDeleteBlockedRoleId] = useState<string | null>(
    null
  );

  const selected = useMemo(
    () => (selectedId ? roles.find((r) => r.id === selectedId) ?? null : null),
    [roles, selectedId]
  );

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [roles, search]);

  // Cor sugerida pro wizard: primeira ainda não usada por outra função.
  const suggestedColor = useMemo<RoleColorId>(() => {
    const used = new Set(roles.map((r) => r.color));
    return ROLE_COLORS.find((c) => !used.has(c.id))?.id ?? "blue";
  }, [roles]);

  const handleCreateRole = useCallback(() => {
    setWizardOpen(true);
  }, []);

  const handleWizardCreate = useCallback(
    (data: {
      name: string;
      description: string;
      color: RoleColorId;
      icon: string;
      capabilities: string[];
    }) => {
      const id = `r-custom-${Date.now()}`;
      const role: RoleDefinition = {
        id,
        name: data.name,
        description: data.description,
        memberCount: 0,
        capabilities: data.capabilities,
        isSystem: false,
        color: data.color,
        icon: data.icon,
      };
      setRoles((prev) => [...prev, role]);
      setSelectedId(id);
      setWizardOpen(false);
    },
    []
  );

  const handlePatchRole = useCallback(
    (id: string, patch: Partial<RoleDefinition>) => {
      setRoles((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
      );
    },
    []
  );

  const handleDeleteRole = useCallback(
    (id: string) => {
      const role = roles.find((r) => r.id === id);
      if (!role || role.isSystem) return;
      // Bloqueia a exclusão enquanto houver membros usando a função — eles
      // precisam ser reatribuídos antes.
      const stillAssigned = members.some((m) => m.role === role.name);
      if (stillAssigned) {
        setDeleteBlockedRoleId(id);
        return;
      }
      setRoles((prev) => prev.filter((r) => r.id !== id));
      setSelectedId(null);
    },
    [roles, members]
  );

  const isExpanded = selected !== null;

  const membersByRole = useMemo(() => {
    const map = new Map<string, Member[]>();
    for (const r of [...ROLE_DEFINITIONS, ...CUSTOM_ROLE_DEFINITIONS]) {
      map.set(r.name, members.filter((m) => m.role === r.name));
    }
    return map;
  }, [members]);

  const handleRemoveMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const memberModalRole = memberModalRoleId
    ? roles.find((r) => r.id === memberModalRoleId)
    : null;

  return (
    <>
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
            style={{ width: isExpanded ? "300px" : "100%" }}
          >
            {!isExpanded ? (
              <RoleTable
                roles={filteredRoles}
                search={search}
                onSearchChange={setSearch}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onCreate={handleCreateRole}
                membersByRole={membersByRole}
                onOpenMembers={(id) => setMemberModalRoleId(id)}
              />
            ) : (
              <CompactRoleList
                roles={filteredRoles}
                selectedId={selected!.id}
                onSelect={setSelectedId}
                onCreate={handleCreateRole}
                membersByRole={membersByRole}
              />
            )}
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div
              className="transition-[opacity,transform] duration-300 ease-out"
              style={{
                opacity: isExpanded ? 1 : 0,
                transform: isExpanded ? "translateX(0)" : "translateX(32px)",
                pointerEvents: isExpanded ? "auto" : "none",
              }}
            >
              {selected && (
                <RoleDetail
                  role={selected}
                  members={membersByRole.get(selected.name) ?? []}
                  onBack={() => setSelectedId(null)}
                  onPatch={(patch) => handlePatchRole(selected.id, patch)}
                  onDelete={() => handleDeleteRole(selected.id)}
                  onOpenMembers={() => setMemberModalRoleId(selected.id)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <RoleMembersModal
        role={memberModalRole ?? null}
        members={
          memberModalRole ? membersByRole.get(memberModalRole.name) ?? [] : []
        }
        onRemoveMember={handleRemoveMember}
        onClose={() => setMemberModalRoleId(null)}
      />

      <CreateRoleWizard
        open={wizardOpen}
        suggestedColor={suggestedColor}
        onClose={() => setWizardOpen(false)}
        onCreate={handleWizardCreate}
      />

      <RoleDeleteBlockedModal
        role={
          deleteBlockedRoleId
            ? roles.find((r) => r.id === deleteBlockedRoleId) ?? null
            : null
        }
        members={
          deleteBlockedRoleId
            ? membersByRole.get(
                roles.find((r) => r.id === deleteBlockedRoleId)?.name ?? ""
              ) ?? []
            : []
        }
        onOpenMembers={() => {
          if (!deleteBlockedRoleId) return;
          const roleId = deleteBlockedRoleId;
          setDeleteBlockedRoleId(null);
          setMemberModalRoleId(roleId);
        }}
        onClose={() => setDeleteBlockedRoleId(null)}
      />
    </>
  );
}

function RoleMembersModal({
  role,
  members,
  onRemoveMember,
  onClose,
}: {
  role: RoleDefinition | null;
  members: Member[];
  onRemoveMember: (id: string) => void;
  onClose: () => void;
}) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<Member | null>(null);

  // Zera o estado interno toda vez que o modal fecha, pra não reabrir num
  // detalhe ou numa confirmação de uma função anterior.
  useEffect(() => {
    if (!role) {
      setDetailId(null);
      setPendingRemove(null);
    }
  }, [role]);

  const detailMember = detailId
    ? members.find((m) => m.id === detailId) ?? null
    : null;

  const handleConfirmRemove = () => {
    if (!pendingRemove) return;
    onRemoveMember(pendingRemove.id);
    if (detailId === pendingRemove.id) setDetailId(null);
    setPendingRemove(null);
  };

  return (
    <>
      <AwModal
        open={role !== null}
        onClose={onClose}
        title={
          detailMember
            ? detailMember.name
            : role
            ? `Membros · ${role.name}`
            : "Membros"
        }
      >
        {role && !detailMember && (
          <div className="flex flex-col gap-2">
            {members.length === 0 ? (
              <p className="m-0 body-xs text-(--fg-secondary)">
                Nenhum membro com essa função ainda.
              </p>
            ) : (
              members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-1 rounded-md border border-(--border-subtle) bg-(--bg-raised) pr-2"
                >
                  <button
                    type="button"
                    onClick={() => setDetailId(m.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-3 py-2 text-left outline-hidden transition-colors hover:bg-(--bg-hover) focus-visible:bg-(--bg-hover)"
                  >
                    <AwAvatar
                      size="sm"
                      src={m.avatar}
                      alt={m.name}
                      initials={m.initials}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate body-xs font-medium text-(--fg-primary)">
                        {m.name}
                      </p>
                      <p className="m-0 truncate body-xs text-(--fg-secondary)">
                        {m.email}
                      </p>
                    </div>
                    <Icon
                      name="chevron_right"
                      size={16}
                      className="shrink-0 text-(--fg-tertiary)"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingRemove(m)}
                    aria-label={`Remover ${m.name}`}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-(--fg-tertiary) outline-hidden transition-colors hover:bg-(--bg-hover) hover:text-(--accent-danger) focus-visible:bg-(--bg-hover)"
                  >
                    <Icon name="person_remove" size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {role && detailMember && (
          <MemberDetailPanel
            member={detailMember}
            onBack={() => setDetailId(null)}
            onRemove={() => setPendingRemove(detailMember)}
          />
        )}
      </AwModal>

      <AwModal
        open={pendingRemove !== null}
        onClose={() => setPendingRemove(null)}
        title="Remover membro"
        zIndex={1010}
        footer={
          <>
            <AwButton
              size="sm"
              variant="ghost"
              onClick={() => setPendingRemove(null)}
            >
              Não
            </AwButton>
            <AwButton
              size="sm"
              variant="danger"
              iconLeft="person_remove"
              onClick={handleConfirmRemove}
            >
              Sim, remover
            </AwButton>
          </>
        }
      >
        {pendingRemove && (
          <p className="m-0 body-xs text-(--fg-primary)">
            Remover{" "}
            <strong className="font-semibold">{pendingRemove.name}</strong> do
            workspace? A pessoa perde o acesso imediatamente e pode ser
            convidada novamente depois.
          </p>
        )}
      </AwModal>
    </>
  );
}

/* -----------------------------------------------------------------
 * Bloqueio de exclusão — função ainda atribuída a membros.
 * ----------------------------------------------------------------- */

function RoleDeleteBlockedModal({
  role,
  members,
  onOpenMembers,
  onClose,
}: {
  role: RoleDefinition | null;
  members: Member[];
  onOpenMembers: () => void;
  onClose: () => void;
}) {
  const count = members.length;
  return (
    <AwModal
      open={role !== null}
      onClose={onClose}
      title="Reatribua os membros antes de excluir"
      footer={
        <AwButton size="sm" variant="primary" onClick={onClose}>
          Entendi
        </AwButton>
      }
    >
      {role && (
        <div className="flex flex-col gap-4">
          <AwAlert variant="warning">
            A função &ldquo;{role.name}&rdquo; ainda está atribuída a {count}{" "}
            pessoa{count === 1 ? "" : "s"}.
          </AwAlert>
          <p className="m-0 body-xs text-(--fg-secondary) text-pretty">
            Mova {count === 1 ? "essa pessoa" : "essas pessoas"} para outra
            função e tente de novo.
          </p>

          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {members.slice(0, 6).map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-md border border-(--border-subtle) bg-(--bg-raised) px-3 py-2"
              >
                <AwAvatar
                  size="sm"
                  src={m.avatar}
                  alt={m.name}
                  initials={m.initials}
                />
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate body-xs font-medium text-(--fg-primary)">
                    {m.name}
                  </p>
                  <p className="m-0 truncate body-xs text-(--fg-secondary)">
                    {m.email}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {count > 6 && (
            <p className="m-0 body-xs text-(--fg-tertiary)">
              e mais {count - 6} pessoa{count - 6 === 1 ? "" : "s"}.
            </p>
          )}

          <button
            type="button"
            onClick={onOpenMembers}
            className="inline-flex items-center gap-1.5 self-start rounded-sm body-xs font-medium text-(--accent-brand) outline-hidden transition-colors hover:underline focus-visible:underline"
          >
            Ver todos os membros
            <Icon name="arrow_forward" size={13} />
          </button>
        </div>
      )}
    </AwModal>
  );
}

function MemberDetailPanel({
  member,
  onBack,
  onRemove,
}: {
  member: Member;
  onBack: () => void;
  onRemove: () => void;
}) {
  const rows: { label: string; value: string }[] = [
    { label: "Cargo", value: member.cargo },
    { label: "E-mail", value: member.email },
    { label: "Telefone", value: member.phone },
    { label: "Função", value: member.role },
    { label: "Último acesso", value: member.lastActive },
    { label: "Entrou em", value: member.joinedAt },
    { label: "2FA", value: member.mfaEnabled ? "Ativa" : "Não configurada" },
  ];
  const statusLabel =
    member.status === "active"
      ? "Ativo"
      : member.status === "invited"
      ? "Convidado"
      : "Inativo";

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 self-start rounded-sm px-2 py-1 body-xs font-medium text-(--fg-secondary) outline-hidden transition-colors hover:bg-(--bg-hover) hover:text-(--fg-primary) focus-visible:bg-(--bg-hover)"
      >
        <Icon name="arrow_back" size={14} />
        Membros
      </button>

      <div className="flex items-center gap-3">
        <AwAvatar
          size="md"
          src={member.avatar}
          alt={member.name}
          initials={member.initials}
        />
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate body-sm font-medium text-(--fg-primary)">
            {member.name}
          </p>
          <p className="m-0 truncate body-xs text-(--fg-secondary)">
            {member.email}
          </p>
        </div>
        <AwPill
          variant={member.status === "active" ? "live" : "neutral"}
          dot={false}
        >
          {statusLabel}
        </AwPill>
      </div>

      <dl className="m-0 grid grid-cols-[110px_1fr] gap-x-4 gap-y-2.5 rounded-md border border-(--border-subtle) bg-(--bg-muted) px-4 py-3">
        {rows.map((r) => (
          <Fragment key={r.label}>
            <dt className="m-0 body-xs text-(--fg-tertiary)">{r.label}</dt>
            <dd className="m-0 truncate body-xs text-(--fg-primary)">
              {r.value}
            </dd>
          </Fragment>
        ))}
      </dl>

      <div className="flex justify-end">
        <AwButton
          size="sm"
          variant="ghost"
          iconLeft="person_remove"
          onClick={onRemove}
        >
          Remover do workspace
        </AwButton>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
 * Create role wizard — modal sequencial em 3 etapas:
 * identidade → permissões → revisão.
 * ----------------------------------------------------------------- */

const WIZARD_STEPS = [
  { id: "identity", label: "Identidade" },
  { id: "permissions", label: "Permissões" },
  { id: "review", label: "Revisão" },
] as const;

/** Origem do preset: do zero, modelo de leitura/auditoria, ou o id de uma
 *  função existente a duplicar. */
type PresetSource = "scratch" | "read-audit" | string;

const ALL_ROLE_DEFINITIONS: RoleDefinition[] = [
  ...ROLE_DEFINITIONS,
  ...CUSTOM_ROLE_DEFINITIONS,
];

/** Modelo "leitura/auditoria": só as permissões de acesso/visualização e as de
 *  auditoria — nada que escreva. Derivado dos próprios SCOPES pra não divergir. */
const READ_AUDIT_PRESET_IDS: string[] = SCOPES.flatMap((s) =>
  s.groups.flatMap((g) =>
    g.permissions
      .filter(
        (p) =>
          // Só leitura/auditoria — e nada marcado como sensível, que deve ser
          // concedido de forma deliberada, nunca por um preset.
          !p.isSensitive &&
          (p.id.endsWith(".access") ||
            p.id.includes(".view") ||
            p.id === "workspace.audit.view" ||
            p.id === "workspace.billing.view")
      )
      .map((p) => p.id)
  )
);

function CreateRoleWizard({
  open,
  suggestedColor,
  onClose,
  onCreate,
}: {
  open: boolean;
  suggestedColor: RoleColorId;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    color: RoleColorId;
    icon: string;
    capabilities: string[];
  }) => void;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<RoleColorId>(suggestedColor);
  const icon = DEFAULT_CUSTOM_ROLE_ICON;
  const [granted, setGranted] = useState<Set<string>>(new Set());
  /** Origem das permissões pré-marcadas (modelo ou função duplicada). */
  const [presetSource, setPresetSource] = useState<PresetSource>("scratch");
  const [presetLabel, setPresetLabel] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep(0);
      setName("");
      setDescription("");
      setColor(suggestedColor);
      setGranted(new Set());
      setPresetSource("scratch");
      setPresetLabel(null);
    }
  }, [open, suggestedColor]);

  /** Aplica um preset à seleção de permissões e guarda a origem pro banner. */
  const applyPreset = (source: PresetSource) => {
    setPresetSource(source);
    if (source === "scratch") {
      setGranted(new Set());
      setPresetLabel(null);
      return;
    }
    if (source === "read-audit") {
      setGranted(new Set(READ_AUDIT_PRESET_IDS));
      setPresetLabel("Modelo leitura/auditoria");
      return;
    }
    // Duplicar de uma função existente — source é o id da função.
    const origin = ALL_ROLE_DEFINITIONS.find((r) => r.id === source);
    if (origin) {
      setGranted(new Set(origin.capabilities));
      setPresetLabel(origin.name);
    }
  };

  const togglePermission = (id: string, next: boolean) => {
    setGranted((prev) => {
      const out = new Set(prev);
      if (next) out.add(id);
      else out.delete(id);
      return out;
    });
  };

  const setScopeAll = (scope: Scope, next: boolean) => {
    const ids = scope.groups.flatMap((g) => g.permissions.map((p) => p.id));
    setGranted((prev) => {
      const out = new Set(prev);
      ids.forEach((id) => (next ? out.add(id) : out.delete(id)));
      return out;
    });
  };

  const canAdvance = step === 0 ? name.trim().length > 0 : true;
  const isLast = step === WIZARD_STEPS.length - 1;

  const handlePrimary = () => {
    if (!canAdvance) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    onCreate({
      name: name.trim(),
      description:
        description.trim() ||
        "Função personalizada — ajuste permissões quando precisar.",
      color,
      icon,
      capabilities: Array.from(granted),
    });
  };

  return (
    <AwModal
      open={open}
      onClose={onClose}
      size="cockpit"
      title="Criar função"
      footer={
        <>
          {step > 0 ? (
            <AwButton
              size="sm"
              variant="ghost"
              iconLeft="arrow_back"
              onClick={() => setStep((s) => s - 1)}
            >
              Voltar
            </AwButton>
          ) : (
            <AwButton size="sm" variant="ghost" onClick={onClose}>
              Cancelar
            </AwButton>
          )}
          <span className="flex-1" />
          <AwButton
            size="sm"
            variant="primary"
            iconLeft={isLast ? "add" : undefined}
            iconRight={isLast ? undefined : "arrow_forward"}
            disabled={!canAdvance}
            onClick={handlePrimary}
          >
            {isLast ? "Criar função" : "Continuar"}
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <WizardStepIndicator current={step} />

        {step === 0 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2.5 pt-1 text-center">
              <span
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: `color-mix(in srgb, ${getRoleColor(color).token} 16%, transparent)`,
                  color: getRoleColor(color).token,
                }}
                aria-hidden="true"
              >
                <AnimatedCustomizeIcon size={30} />
              </span>
              <div>
                <p className="m-0 body-sm font-medium text-(--fg-primary)">
                  {name.trim() || "Função personalizada"}
                </p>
                <p className="m-0 mt-0.5 max-w-[360px] body-xs text-(--fg-secondary)">
                  Comece pelo nome e uma descrição curta. As permissões vêm na
                  próxima etapa.
                </p>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-[460px] flex-col gap-4">
              <AwField label="Nome da função" htmlFor="wizard-role-name">
                <AwInput
                  id="wizard-role-name"
                  autoFocus
                  placeholder="Ex.: Analista de Qualidade"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </AwField>
              <AwField label="Descrição (opcional)" htmlFor="wizard-role-desc">
                <AwInput
                  id="wizard-role-desc"
                  placeholder="O que essa função faz no dia a dia"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </AwField>

              <AwField
                label="Começar a partir de (opcional)"
                htmlFor="wizard-role-preset"
              >
                <AwDropdownMenu
                  align="start"
                  trigger={
                    <AwSelect
                      id="wizard-role-preset"
                      className="w-full justify-between"
                    >
                      {presetSource === "scratch"
                        ? "Do zero"
                        : presetSource === "read-audit"
                        ? "Modelo leitura/auditoria"
                        : `Duplicar: ${presetLabel}`}
                    </AwSelect>
                  }
                  items={[
                    {
                      id: "preset-scratch",
                      label: "Do zero",
                      checked: presetSource === "scratch",
                      onSelect: () => applyPreset("scratch"),
                    },
                    {
                      id: "preset-read-audit",
                      label: (
                        <span className="flex flex-col gap-0.5 py-0.5">
                          <span className="body-xs font-medium text-(--fg-primary)">
                            Modelo leitura/auditoria
                          </span>
                          <span className="body-xs text-(--fg-secondary)">
                            Só leitura e auditoria, sem escrita.
                          </span>
                        </span>
                      ),
                      checked: presetSource === "read-audit",
                      onSelect: () => applyPreset("read-audit"),
                    },
                    { id: "preset-sep", separator: true as const },
                    {
                      id: "preset-dup-label",
                      isLabel: true,
                      label: "Duplicar de uma função",
                    },
                    ...ALL_ROLE_DEFINITIONS.map((r) => ({
                      id: r.id,
                      label: r.name,
                      checked: presetSource === r.id,
                      onSelect: () => applyPreset(r.id),
                    })),
                  ]}
                />
              </AwField>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-3">
            {presetLabel && (
              <AwAlert variant="info">
                Pré-marcamos as permissões de{" "}
                <strong className="font-medium">{presetLabel}</strong>. A nova
                função é independente — mudar uma não afeta a outra.
              </AwAlert>
            )}
            <div className="flex items-center justify-between gap-3">
              <p className="m-0 body-xs text-(--fg-secondary)">
                <strong className="font-medium text-(--fg-primary)">
                  {granted.size}
                </strong>{" "}
                de {ALL_PERMISSION_IDS.length} permissões selecionadas
              </p>
              <div className="flex items-center gap-2">
                <AwButton
                  size="sm"
                  variant="ghost"
                  onClick={() => setGranted(new Set(ALL_PERMISSION_IDS))}
                >
                  Marcar tudo
                </AwButton>
                <AwButton
                  size="sm"
                  variant="ghost"
                  onClick={() => setGranted(new Set())}
                >
                  Limpar
                </AwButton>
              </div>
            </div>
            <div className="max-h-[min(52vh,520px)] overflow-y-auto rounded-md border border-(--border-subtle)">
              <div className="flex flex-col divide-y divide-(--border-subtle)">
                {SCOPES.map((scope) => (
                  <ScopeBlock
                    key={scope.id}
                    scope={scope}
                    granted={granted}
                    editable
                    onToggle={togglePermission}
                    onToggleAll={(next) => setScopeAll(scope, next)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-muted) px-4 py-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-(--fg-primary) text-(--bg-canvas)"
                aria-hidden="true"
              >
                <Icon name={icon} size={24} fill={1} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate body-sm font-medium text-(--fg-primary)">
                  {name.trim()}
                </p>
                <p className="m-0 truncate body-xs text-(--fg-secondary)">
                  {description.trim() ||
                    "Função personalizada — ajuste permissões quando precisar."}
                </p>
              </div>
              <AwPill variant={granted.size > 0 ? "live" : "neutral"} dot={false}>
                {granted.size} permiss{granted.size === 1 ? "ão" : "ões"}
              </AwPill>
            </div>

            <ul className="m-0 flex list-none flex-col divide-y divide-(--border-subtle) rounded-lg border border-(--border-subtle) p-0">
              {SCOPES.map((scope) => {
                const ids = scope.groups.flatMap((g) =>
                  g.permissions.map((p) => p.id)
                );
                const count = ids.filter((id) => granted.has(id)).length;
                return (
                  <li
                    key={scope.id}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-(--bg-muted) text-(--fg-secondary)">
                      <Icon name={scope.icon} size={14} />
                    </span>
                    <span className="min-w-0 flex-1 truncate body-xs font-medium text-(--fg-primary)">
                      {scope.name}
                    </span>
                    <span
                      className={
                        "body-xs tabular-nums " +
                        (count > 0
                          ? "text-(--fg-primary)"
                          : "text-(--fg-tertiary)")
                      }
                    >
                      {count}/{ids.length}
                    </span>
                  </li>
                );
              })}
            </ul>

            <p className="m-0 body-xs text-(--fg-tertiary)">
              Você pode ajustar nome, descrição e permissões depois, abrindo a
              função na listagem.
            </p>
          </div>
        )}
      </div>
    </AwModal>
  );
}

function WizardStepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="sr-only" aria-live="polite">
        Etapa {current + 1} de {WIZARD_STEPS.length} ·{" "}
        {WIZARD_STEPS[current].label}
      </span>
      {WIZARD_STEPS.map((s, i) => (
        <span
          key={s.id}
          aria-hidden="true"
          className={
            "h-1 flex-1 rounded-full transition-colors duration-aw-fast " +
            (i <= current ? "bg-(--fg-primary)" : "bg-(--bg-muted)")
          }
        />
      ))}
    </div>
  );
}

/* -----------------------------------------------------------------
 * Ícone de customização animado — sliders estilo "tune" com knobs
 * que deslizam em loop lento. Herda a cor via currentColor; a
 * animação é desligada quando o usuário prefere movimento reduzido.
 * ----------------------------------------------------------------- */

function AnimatedCustomizeIcon({ size = 30 }: { size?: number }) {
  return (
    <span
      className="aw-tune-anim inline-flex"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <line x1="4" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity="0.4" />
        <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity="0.4" />
        <line x1="4" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity="0.4" />
        <circle className="aw-tune-knob aw-tune-knob--a" cx="8" cy="7" r="2.4" fill="currentColor" />
        <circle className="aw-tune-knob aw-tune-knob--b" cx="15" cy="12" r="2.4" fill="currentColor" />
        <circle className="aw-tune-knob aw-tune-knob--c" cx="10" cy="17" r="2.4" fill="currentColor" />
      </svg>
      <style>{`
        .aw-tune-anim .aw-tune-knob {
          animation-duration: 4.8s;
          animation-timing-function: var(--ease-in-out, ease-in-out);
          animation-iteration-count: infinite;
        }
        .aw-tune-anim .aw-tune-knob--a { animation-name: aw-tune-slide-a; }
        .aw-tune-anim .aw-tune-knob--b { animation-name: aw-tune-slide-b; animation-delay: 0.2s; }
        .aw-tune-anim .aw-tune-knob--c { animation-name: aw-tune-slide-c; animation-delay: 0.4s; }
        @keyframes aw-tune-slide-a {
          0%, 14% { transform: translateX(0); }
          38%, 60% { transform: translateX(8px); }
          84%, 100% { transform: translateX(0); }
        }
        @keyframes aw-tune-slide-b {
          0%, 18% { transform: translateX(0); }
          42%, 64% { transform: translateX(-7px); }
          88%, 100% { transform: translateX(0); }
        }
        @keyframes aw-tune-slide-c {
          0%, 10% { transform: translateX(0); }
          34%, 56% { transform: translateX(6px); }
          80%, 100% { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .aw-tune-anim .aw-tune-knob { animation: none; }
        }
      `}</style>
    </span>
  );
}

/* -----------------------------------------------------------------
 * Role table (initial state)
 * ----------------------------------------------------------------- */

function RoleTable({
  roles,
  search,
  onSearchChange,
  selectedId,
  onSelect,
  onCreate,
  membersByRole,
  onOpenMembers,
}: {
  roles: RoleDefinition[];
  search: string;
  onSearchChange: (v: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  membersByRole: Map<string, Member[]>;
  onOpenMembers: (id: string) => void;
}) {
  const total = ALL_PERMISSION_IDS.length;
  const systemRoles = roles.filter((r) => r.isSystem);
  const customRoles = roles.filter((r) => !r.isSystem);
  const searching = search.trim().length > 0;

  const renderRow = (r: RoleDefinition) => (
    <RoleTableRow
      key={r.id}
      role={r}
      total={total}
      active={selectedId === r.id}
      onSelect={() => onSelect(r.id)}
      members={membersByRole.get(r.name) ?? []}
      onOpenMembers={() => onOpenMembers(r.id)}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          <AwInput
            iconLeft="search"
            placeholder="Buscar funções…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <AwButton
          size="md"
          variant="primary"
          iconLeft="add"
          onClick={onCreate}
        >
          Criar função
        </AwButton>
      </div>

      {roles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-(--border-subtle) px-6 py-12 text-center">
          <p className="m-0 body-xs text-(--fg-secondary)">
            Nenhuma função encontrada.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Dois grupos colapsáveis — cada um é a sua própria tabela,
              expandida/recolhida pelo cabeçalho. Durante a busca os dois
              ficam abertos pra não esconder resultado. */}
          {systemRoles.length > 0 && (
            <RoleTableSection
              label="Funções padrão"
              count={systemRoles.length}
              roles={systemRoles}
              renderRow={renderRow}
              forceOpen={searching}
            />
          )}
          {customRoles.length > 0 && (
            <RoleTableSection
              label="Funções personalizadas"
              count={customRoles.length}
              roles={customRoles}
              renderRow={renderRow}
              forceOpen={searching}
            />
          )}
        </div>
      )}

      <p className="m-0 px-1 body-xs text-(--fg-tertiary)">
        Funções padrão não podem ser editadas. Crie quantas funções
        personalizadas a operação precisar.
      </p>
    </div>
  );
}

/** Grupo de funções como tabela colapsável — o cabeçalho exibe/oculta a
 *  tabela com o truque de grid 0fr→1fr (anima a altura sem clipar conteúdo). */
function RoleTableSection({
  label,
  count,
  roles,
  renderRow,
  forceOpen = false,
}: {
  label: string;
  count: number;
  roles: RoleDefinition[];
  renderRow: (r: RoleDefinition) => ReactNode;
  /** Mantém aberto independentemente do toggle — usado durante a busca. */
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const expanded = forceOpen || open;

  return (
    <section className="overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-raised)">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2.5 px-5 py-3 text-left outline-hidden transition-colors duration-aw-fast hover:bg-(--bg-hover) focus-visible:bg-(--bg-hover)"
      >
        <Icon
          name="chevron_right"
          size={16}
          className={
            "shrink-0 text-(--fg-tertiary) transition-transform " +
            (expanded ? "rotate-90" : "")
          }
          style={{
            transitionDuration: "var(--dur-base)",
            transitionTimingFunction: "var(--ease-in-out)",
          }}
        />
        <span className="body-xs font-medium text-(--fg-primary)">{label}</span>
        <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-(--bg-muted) px-1.5 text-2xs font-medium tabular-nums text-(--fg-secondary)">
          {count}
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows]"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
          transitionDuration: "var(--dur-base)",
          transitionTimingFunction: "var(--ease-in-out)",
        }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-(--border-subtle)">
            <AwTable className="aw-table--airy">
              <thead>
                <tr>
                  <th>Função</th>
                  <th>Descrição</th>
                  <th style={{ width: 180 }}>Membros</th>
                  <th style={{ width: 160 }}>Permissões</th>
                  <th aria-label="Ações" style={{ width: 56 }} />
                </tr>
              </thead>
              <tbody>{roles.map(renderRow)}</tbody>
            </AwTable>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoleTableRow({
  role,
  total,
  active,
  onSelect,
  members,
  onOpenMembers,
}: {
  role: RoleDefinition;
  total: number;
  active: boolean;
  onSelect: () => void;
  members: Member[];
  onOpenMembers: () => void;
}) {
  return (
    <tr
      className="aw-row-clickable"
      onClick={onSelect}
      aria-selected={active}
      data-active={active ? "true" : undefined}
    >
        <td>
          <div className="flex items-center gap-3">
            <RoleIconTile role={role} size="sm" />
            <div className="min-w-0">
              <span className="block truncate body-xs font-medium text-(--fg-primary)">
                {role.name}
              </span>
              {role.createdBy && (
                <span className="mt-1 block truncate body-xs text-(--fg-tertiary)">
                  Criado em {role.createdBy.date}
                </span>
              )}
            </div>
          </div>
        </td>
        <td>
          <p className="m-0 line-clamp-1 max-w-[420px] body-xs text-(--fg-secondary)">
            {role.description}
          </p>
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <RoleMemberStack
            members={members}
            memberCount={members.length}
            onOpenAll={onOpenMembers}
          />
        </td>
        <td>
          <span className="body-xs text-(--fg-primary)">
            {role.capabilities.length}
            <span className="text-(--fg-secondary)">
              {" "}
              / {total}
            </span>
          </span>
        </td>
        <td>
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-(--fg-tertiary)"
            aria-hidden="true"
          >
            <Icon name="chevron_right" size={16} />
          </span>
        </td>
    </tr>
  );
}

function RoleMemberStack({
  members,
  memberCount,
  onOpenAll,
}: {
  members: Member[];
  memberCount: number;
  onOpenAll: () => void;
}) {
  const visible = members.slice(0, 4);
  const overflow = Math.max(memberCount - visible.length, 0);

  if (memberCount === 0) {
    return (
      <span className="body-xs text-(--fg-tertiary)">Ninguém ainda</span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <TooltipProvider delayDuration={120}>
        <div className="flex items-center">
          {visible.map((m, i) => (
            <Tooltip key={m.id}>
              <TooltipTrigger asChild>
                <span
                  className={
                    "inline-block " +
                    (i > 0 ? "-ml-2" : "")
                  }
                >
                  <AwAvatar
                    size="sm"
                    src={m.avatar}
                    initials={m.initials}
                    alt={m.name}
                    className="ring-2 ring-(--bg-raised)"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span className="body-xs">{m.name}</span>
              </TooltipContent>
            </Tooltip>
          ))}
          {overflow > 0 && (
            <span
              className="aw-avatar aw-avatar--sm -ml-2 ring-2 ring-(--bg-raised) bg-(--bg-muted)! text-(--fg-secondary)!"
              aria-label={`Mais ${overflow}`}
            >
              +{overflow}
            </span>
          )}
        </div>
      </TooltipProvider>
      <button
        type="button"
        onClick={onOpenAll}
        className="body-xs font-medium text-(--fg-secondary) underline decoration-dotted underline-offset-2 transition-colors hover:text-(--fg-primary) hover:no-underline"
      >
        Ver todos
      </button>
    </div>
  );
}

function CompactRoleList({
  roles,
  selectedId,
  onSelect,
  onCreate,
  membersByRole,
}: {
  roles: RoleDefinition[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  membersByRole: Map<string, Member[]>;
}) {
  return (
    <aside className="flex flex-col self-start divide-y divide-(--border-subtle) overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-raised)">
      <div className="flex items-center justify-between gap-2 border-b border-(--border-subtle) px-4 py-2.5">
        <p className="m-0 text-sm font-semibold tracking-tight text-(--fg-primary)">
          Funções · {roles.length}
        </p>
        <AwButton size="sm" variant="primary" iconLeft="add" onClick={onCreate}>
          Criar nova função
        </AwButton>
      </div>
      <TooltipProvider delayDuration={120}>
        <ul className="flex flex-col">
          {roles.map((r) => {
            const active = selectedId === r.id;
            const memberCount = (membersByRole.get(r.name) ?? []).length;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onSelect(r.id)}
                  aria-pressed={active}
                  className={
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-aw-fast outline-hidden focus-visible:bg-(--bg-hover) " +
                    (active
                      ? "bg-(--bg-selected)"
                      : "hover:bg-(--bg-hover)")
                  }
                >
                  <RoleIconTile role={r} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate body-xs font-medium text-(--fg-primary)">
                        {r.name}
                      </span>
                      {!r.isSystem && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex shrink-0 text-(--fg-tertiary)">
                              <Icon name="info" size={14} />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <span className="body-xs">
                              Função personalizada
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </span>
                    <span className="block truncate body-xs text-(--fg-secondary)">
                      {memberCount} membro{memberCount === 1 ? "" : "s"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </TooltipProvider>
    </aside>
  );
}

/* -----------------------------------------------------------------
 * Detail view (side panel)
 * ----------------------------------------------------------------- */

function RoleDetail({
  role,
  members,
  onBack,
  onPatch,
  onDelete,
  onOpenMembers,
}: {
  role: RoleDefinition;
  members: Member[];
  onBack: () => void;
  onPatch: (patch: Partial<RoleDefinition>) => void;
  onDelete: () => void;
  onOpenMembers: () => void;
}) {
  const editable = !role.isSystem;
  const granted = useMemo(() => new Set(role.capabilities), [role.capabilities]);

  const togglePermission = (id: string, next: boolean) => {
    if (!editable) return;
    if (next) {
      onPatch({ capabilities: [...role.capabilities, id] });
    } else {
      onPatch({ capabilities: role.capabilities.filter((c) => c !== id) });
    }
  };

  const setScopeAll = (scope: Scope, next: boolean) => {
    if (!editable) return;
    const scopeIds = scope.groups.flatMap((g) =>
      g.permissions.map((p) => p.id)
    );
    const remaining = role.capabilities.filter((c) => !scopeIds.includes(c));
    onPatch({
      capabilities: next ? [...remaining, ...scopeIds] : remaining,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="flex w-full flex-col overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-raised)">
        <RoleHeader
          role={role}
          members={members}
          editable={editable}
          onPatch={onPatch}
          onDelete={onDelete}
          onOpenMembers={onOpenMembers}
          onClose={onBack}
        />

        <div className="flex items-center justify-between border-b border-(--border-subtle) px-6 py-3">
          <p className="m-0 body-xs text-(--fg-tertiary)">
            Permissões por escopo
          </p>
          {editable && (
            <div className="flex items-center gap-2">
              <AwButton
                size="sm"
                variant="ghost"
                onClick={() =>
                  onPatch({ capabilities: [...ALL_PERMISSION_IDS] })
                }
              >
                Marcar tudo
              </AwButton>
              <AwButton
                size="sm"
                variant="ghost"
                onClick={() => onPatch({ capabilities: [] })}
              >
                Limpar
              </AwButton>
            </div>
          )}
        </div>

        <div className="flex flex-col divide-y divide-(--border-subtle)">
          {SCOPES.map((scope) => (
            <ScopeBlock
              key={scope.id}
              scope={scope}
              granted={granted}
              editable={editable}
              onToggle={togglePermission}
              onToggleAll={(next) => setScopeAll(scope, next)}
            />
          ))}
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-(--border-subtle) bg-(--bg-muted) px-6 py-3">
          <AwButton size="sm" variant="ghost" onClick={onBack}>
            Cancelar
          </AwButton>
          {editable && (
            <AwButton
              size="sm"
              variant="primary"
              iconLeft="check"
              onClick={onBack}
            >
              Salvar alterações
            </AwButton>
          )}
        </footer>
      </section>
    </div>
  );
}

/* -----------------------------------------------------------------
 * Role header (name, description, actions)
 * ----------------------------------------------------------------- */

function RoleHeader({
  role,
  members,
  editable,
  onPatch,
  onDelete,
  onOpenMembers,
  onClose,
}: {
  role: RoleDefinition;
  members: Member[];
  editable: boolean;
  onPatch: (patch: Partial<RoleDefinition>) => void;
  onDelete: () => void;
  onOpenMembers: () => void;
  onClose: () => void;
}) {
  const memberCount = members.length;
  const facepile = members.slice(0, 4);
  const facepileOverflow = Math.max(memberCount - facepile.length, 0);
  return (
    <header className="flex flex-col gap-3 border-b border-(--border-subtle) p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <RoleIconTile role={role} size="lg" />
          <div className="min-w-0 flex-1">
            {editable ? (
              <EditableText
                value={role.name}
                onChange={(name) => onPatch({ name })}
                className="text-(--fg-primary)"
                placeholder="Nome da função"
              />
            ) : (
              <h6 className="m-0 text-(--fg-primary)">{role.name}</h6>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2 body-xs text-(--fg-secondary)">
              <button
                type="button"
                onClick={onOpenMembers}
                disabled={memberCount === 0}
                className="group/members flex items-center gap-1.5 rounded-sm outline-hidden transition-colors hover:text-(--fg-primary) focus-visible:text-(--fg-primary) disabled:cursor-default disabled:text-(--fg-tertiary)"
              >
                {facepile.length > 0 && (
                  <span className="flex items-center" aria-hidden="true">
                    {facepile.map((m, i) => (
                      <AwAvatar
                        key={m.id}
                        size="sm"
                        src={m.avatar}
                        initials={m.initials}
                        alt=""
                        className={
                          "h-[20px]! w-[20px]! text-3xs! ring-2 ring-(--bg-raised)" +
                          (i > 0 ? " -ml-1.5" : "")
                        }
                      />
                    ))}
                    {facepileOverflow > 0 && (
                      <span className="aw-avatar aw-avatar--sm -ml-1.5 h-[20px]! w-[20px]! bg-(--bg-muted)! text-3xs! text-(--fg-secondary)! ring-2 ring-(--bg-raised)">
                        +{facepileOverflow}
                      </span>
                    )}
                  </span>
                )}
                <span className="underline decoration-dotted underline-offset-2 group-hover/members:no-underline group-disabled/members:no-underline">
                  {memberCount} membro{memberCount === 1 ? "" : "s"}
                </span>
              </button>
              <span aria-hidden="true">·</span>
              <span>
                {role.capabilities.length} permiss
                {role.capabilities.length === 1 ? "ão" : "ões"} ativa
                {role.capabilities.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {editable && (
            <AwButton
              size="sm"
              variant="ghost"
              iconLeft="delete"
              onClick={onDelete}
            >
              Excluir
            </AwButton>
          )}
          <AwButton
            size="sm"
            variant="ghost"
            iconOnly="close"
            aria-label="Fechar painel da função"
            onClick={onClose}
          />
        </div>
      </div>

      {editable ? (
        <EditableText
          value={role.description}
          onChange={(description) => onPatch({ description })}
          className="body-xs text-(--fg-secondary)"
          placeholder="Adicione uma descrição…"
          multiline
        />
      ) : (
        <p className="m-0 max-w-[680px] body-xs text-(--fg-secondary)">
          {role.description}
        </p>
      )}
    </header>
  );
}

/* -----------------------------------------------------------------
 * Role icon tile
 * ----------------------------------------------------------------- */

function RoleIconTile({
  role,
  size,
}: {
  role: RoleDefinition;
  size: "sm" | "md" | "lg";
}) {
  const color = getRoleColor(role.color).token;
  const dim = size === "sm" ? 36 : size === "md" ? 40 : 48;
  const icon = size === "sm" ? 22 : size === "md" ? 24 : 28;
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-md"
      style={{
        width: dim,
        height: dim,
        background: `color-mix(in srgb, ${color} 24%, transparent)`,
        color,
      }}
      aria-hidden="true"
    >
      <Icon name={role.icon} size={icon} fill={1} />
    </span>
  );
}

/* -----------------------------------------------------------------
 * Editable inline text
 * ----------------------------------------------------------------- */

function EditableText({
  value,
  onChange,
  className,
  placeholder,
  multiline,
}: {
  value: string;
  onChange: (next: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  if (editing) {
    if (multiline) {
      return (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
          }}
          rows={2}
          placeholder={placeholder}
          className={
            "m-0 w-full resize-none rounded-sm bg-(--bg-canvas) px-2 py-1.5 outline-hidden ring-1 ring-(--border-default) focus:ring-(--fg-primary) " +
            (className ?? "")
          }
        />
      );
    }
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        placeholder={placeholder}
        className={
          "m-0 w-full rounded-sm bg-(--bg-canvas) px-2 py-1 outline-hidden ring-1 ring-(--border-default) focus:ring-(--fg-primary) " +
          (className ?? "")
        }
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={
        "m-0 w-full rounded-sm px-2 py-1 text-left transition-colors duration-aw-fast hover:bg-(--bg-hover) " +
        (className ?? "")
      }
    >
      {value || (
        <span className="text-(--fg-tertiary)">{placeholder}</span>
      )}
    </button>
  );
}

/* -----------------------------------------------------------------
 * Scope block
 * ----------------------------------------------------------------- */

function ScopeBlock({
  scope,
  granted,
  editable,
  onToggle,
  onToggleAll,
}: {
  scope: Scope;
  granted: Set<string>;
  editable: boolean;
  onToggle: (id: string, next: boolean) => void;
  onToggleAll: (next: boolean) => void;
}) {
  const [open, setOpen] = useState(true);
  const allIds = useMemo(
    () => scope.groups.flatMap((g) => g.permissions.map((p) => p.id)),
    [scope]
  );
  const grantedCount = allIds.filter((id) => granted.has(id)).length;
  const total = allIds.length;
  const allOn = grantedCount === total;
  const someOn = grantedCount > 0 && !allOn;
  const checkboxState: boolean | "indeterminate" = allOn
    ? true
    : someOn
    ? "indeterminate"
    : false;

  return (
    <section className="px-6 py-4">
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left outline-hidden"
          aria-expanded={open}
        >
          <Icon
            name="chevron_right"
            size={18}
            className={"transition-transform " + (open ? "rotate-90" : "")}
            style={{
              transitionDuration: "var(--dur-base)",
              transitionTimingFunction: "var(--ease-in-out)",
            }}
          />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-(--bg-muted) text-(--fg-secondary)">
            <Icon name={scope.icon} size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate body-sm font-semibold text-(--fg-primary)">
              {scope.name}
            </span>
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-3">
          <AwPill
            variant={allOn ? "live" : someOn ? "beta" : "neutral"}
            dot={false}
          >
            {grantedCount}/{total}
          </AwPill>
          {editable && (
            <AwCheckbox
              checked={checkboxState}
              onChange={(next) => onToggleAll(next)}
              label={`Ativar todas as permissões de ${scope.name}`}
            />
          )}
        </div>
      </header>

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
        <div className={open ? "flex flex-col gap-4 pl-9 pb-1 pt-4" : "flex flex-col gap-4 pl-9 pb-1"}>
          {scope.groups.map((group) => (
            <PermissionGroupBlock
              key={group.id}
              group={group}
              granted={granted}
              editable={editable}
              onToggle={onToggle}
            />
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}

function PermissionGroupBlock({
  group,
  granted,
  editable,
  onToggle,
}: {
  group: ScopeGroup;
  granted: Set<string>;
  editable: boolean;
  onToggle: (id: string, next: boolean) => void;
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-3">
      {group.permissions.map((p) => {
        const has = granted.has(p.id);
        return (
          <li
            key={p.id}
            className="flex items-start gap-3 rounded-sm px-2 py-2 hover:bg-(--bg-hover)"
            onClick={(e) => {
              if (!editable) return;
              if ((e.target as HTMLElement).closest('[role="checkbox"]')) return;
              onToggle(p.id, !has);
            }}
            style={{ cursor: editable ? "pointer" : "default" }}
          >
            {editable ? (
              <span className="mt-0.5 shrink-0">
                <AwCheckbox
                  checked={has}
                  onChange={(next) => onToggle(p.id, next)}
                  label={p.label}
                />
              </span>
            ) : (
              <span
                className={
                  "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm " +
                  (has
                    ? "bg-(--fg-primary) text-(--bg-raised)"
                    : "border border-(--border-default) text-(--fg-tertiary)")
                }
                aria-label={has ? "Permitido" : "Negado"}
              >
                <Icon name={has ? "check" : "close"} size={12} />
              </span>
            )}
            <span className="min-w-0 flex-1 body-xs">
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
            </span>
          </li>
        );
      })}
    </ul>
  );
}

