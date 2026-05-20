"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwInput } from "@/components/ui/AwInput";
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
  DEFAULT_CUSTOM_ROLE_ICON,
  MEMBERS,
  ROLE_COLORS,
  ROLE_DEFINITIONS,
  SCOPES,
  getRoleColor,
  type Member,
  type RoleDefinition,
  type Scope,
  type ScopeGroup,
} from "../_components/data";
import { TeamTabs } from "../_components/TeamTabs";

/* -----------------------------------------------------------------
 * Page
 * ----------------------------------------------------------------- */

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>(ROLE_DEFINITIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [newRoleId, setNewRoleId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [memberModalRoleId, setMemberModalRoleId] = useState<string | null>(null);

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

  const handleCreateRole = useCallback(() => {
    const usedColors = new Set(roles.map((r) => r.color));
    const nextColor =
      ROLE_COLORS.find((c) => !usedColors.has(c.id))?.id ?? "blue";
    const id = `r-custom-${Date.now()}`;
    const role: RoleDefinition = {
      id,
      name: "Nova função",
      description: "Função personalizada — defina permissões à direita.",
      memberCount: 0,
      capabilities: [],
      isSystem: false,
      color: nextColor,
      icon: DEFAULT_CUSTOM_ROLE_ICON,
    };
    setRoles((prev) => [...prev, role]);
    setSelectedId(id);
    setNewRoleId(id);
  }, [roles]);

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
      setRoles((prev) => prev.filter((r) => r.id !== id));
      setSelectedId(null);
    },
    [roles]
  );

  const isExpanded = selected !== null;

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const membersByRole = useMemo(() => {
    const map = new Map<string, Member[]>();
    for (const r of ROLE_DEFINITIONS) {
      map.set(r.name, MEMBERS.filter((m) => m.role === r.name));
    }
    return map;
  }, []);

  const memberModalRole = memberModalRoleId
    ? roles.find((r) => r.id === memberModalRoleId)
    : null;

  return (
    <>
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

        {!isExpanded ? (
          <RoleTable
            roles={filteredRoles}
            search={search}
            onSearchChange={setSearch}
            expandedIds={expandedIds}
            onToggle={toggleExpand}
            onEdit={setSelectedId}
            onCreate={handleCreateRole}
            membersByRole={membersByRole}
            onOpenMembers={(id) => setMemberModalRoleId(id)}
          />
        ) : (
          <RoleDetail
            role={selected!}
            isNew={selected?.id === newRoleId}
            onBack={() => { setSelectedId(null); setNewRoleId(null); }}
            onPatch={(patch) => handlePatchRole(selected!.id, patch)}
            onDelete={() => handleDeleteRole(selected!.id)}
          />
        )}
      </div>

      <RoleMembersModal
        role={memberModalRole ?? null}
        members={
          memberModalRole ? membersByRole.get(memberModalRole.name) ?? [] : []
        }
        onClose={() => setMemberModalRoleId(null)}
      />
    </>
  );
}

function RoleMembersModal({
  role,
  members,
  onClose,
}: {
  role: RoleDefinition | null;
  members: Member[];
  onClose: () => void;
}) {
  return (
    <AwModal
      open={role !== null}
      onClose={onClose}
      title={role ? `Membros · ${role.name}` : "Membros"}
    >
      {role && (
        <div className="flex flex-col gap-2">
          {members.length === 0 ? (
            <p className="m-0 body-xs text-[var(--fg-secondary)]">
              Nenhum membro com essa função ainda.
            </p>
          ) : (
            members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-3 py-2"
              >
                <AwAvatar
                  size="sm"
                  src={m.avatar}
                  alt={m.name}
                  initials={m.initials}
                />
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate body-xs font-medium text-[var(--fg-primary)]">
                    {m.name}
                  </p>
                  <p className="m-0 truncate body-xs text-[var(--fg-secondary)]">
                    {m.email}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </AwModal>
  );
}

/* -----------------------------------------------------------------
 * Role table (initial state)
 * ----------------------------------------------------------------- */

function RoleTable({
  roles,
  search,
  onSearchChange,
  expandedIds,
  onToggle,
  onEdit,
  onCreate,
  membersByRole,
  onOpenMembers,
}: {
  roles: RoleDefinition[];
  search: string;
  onSearchChange: (v: string) => void;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onCreate: () => void;
  membersByRole: Map<string, Member[]>;
  onOpenMembers: (id: string) => void;
}) {
  const total = ALL_PERMISSION_IDS.length;

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
        <tbody>
          {roles.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                style={{ padding: "48px 20px", textAlign: "center" }}
              >
                <p className="m-0 body-xs text-[var(--fg-secondary)]">
                  Nenhuma função encontrada.
                </p>
              </td>
            </tr>
          ) : (
            roles.map((r) => {
              const expanded = expandedIds.has(r.id);
              const members = membersByRole.get(r.name) ?? [];
              return (
                <RoleTableRow
                  key={r.id}
                  role={r}
                  total={total}
                  expanded={expanded}
                  onToggle={() => onToggle(r.id)}
                  onEdit={() => onEdit(r.id)}
                  members={members}
                  onOpenMembers={() => onOpenMembers(r.id)}
                />
              );
            })
          )}
        </tbody>
      </AwTable>
    </div>
  );
}

function RoleTableRow({
  role,
  total,
  expanded,
  onToggle,
  onEdit,
  members,
  onOpenMembers,
}: {
  role: RoleDefinition;
  total: number;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  members: Member[];
  onOpenMembers: () => void;
}) {
  return (
    <>
      <tr className="aw-row-clickable" onClick={onToggle}>
        <td>
          <div className="flex items-center gap-3">
            <RoleIconTile role={role} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="body-xs font-medium text-[var(--fg-primary)]">
                  {role.name}
                </span>
                {role.isSystem && (
                  <AwPill variant="neutral" dot={false}>
                    Padrão
                  </AwPill>
                )}
              </div>
            </div>
          </div>
        </td>
        <td>
          <p className="m-0 line-clamp-1 max-w-[420px] body-xs text-[var(--fg-secondary)]">
            {role.description}
          </p>
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <RoleMemberStack
            members={members}
            memberCount={role.memberCount}
            onOpenAll={onOpenMembers}
          />
        </td>
        <td>
          <span className="body-xs text-[var(--fg-primary)]">
            {role.capabilities.length}
            <span className="text-[var(--fg-secondary)]">
              {" "}
              / {total}
            </span>
          </span>
        </td>
        <td>
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-tertiary)]"
            aria-hidden="true"
          >
            <Icon
              name="chevron_right"
              size={16}
              className={
                "transition-transform duration-[220ms] ease-in-out " +
                (expanded ? "rotate-90" : "")
              }
            />
          </span>
        </td>
      </tr>
      <tr className="aw-row-expanded">
        <td colSpan={5} className="!p-0">
          <div
            className="grid transition-[grid-template-rows,opacity] duration-[260ms] ease-in-out"
            style={{
              gridTemplateRows: expanded ? "1fr" : "0fr",
              opacity: expanded ? 1 : 0,
            }}
          >
            <div className="overflow-hidden">
              <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-muted)] px-6 py-5">
                <RoleInlinePreview role={role} onEdit={onEdit} />
              </div>
            </div>
          </div>
        </td>
      </tr>
    </>
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
      <span className="body-xs text-[var(--fg-tertiary)]">Ninguém ainda</span>
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
                    className="ring-2 ring-[var(--bg-raised)]"
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
              className="aw-avatar aw-avatar--sm -ml-2 ring-2 ring-[var(--bg-raised)] !bg-[var(--bg-muted)] !text-[var(--fg-secondary)]"
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
        className="body-xs font-medium text-[var(--fg-secondary)] underline decoration-dotted underline-offset-2 transition-colors hover:text-[var(--fg-primary)] hover:no-underline"
      >
        Ver todos
      </button>
    </div>
  );
}

function RoleInlinePreview({
  role,
  onEdit,
}: {
  role: RoleDefinition;
  onEdit: () => void;
}) {
  const granted = useMemo(() => new Set(role.capabilities), [role.capabilities]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 max-w-[680px] body-xs text-[var(--fg-secondary)]">
          {role.description}
        </p>
        <AwButton size="sm" variant="secondary" iconLeft="edit" onClick={onEdit}>
          Abrir e editar
        </AwButton>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {SCOPES.map((scope) => {
          const ids = scope.groups.flatMap((g) =>
            g.permissions.map((p) => p.id)
          );
          const grantedCount = ids.filter((id) => granted.has(id)).length;
          const totalScope = ids.length;
          const allOn = grantedCount === totalScope;
          const someOn = grantedCount > 0 && !allOn;
          return (
            <div
              key={scope.id}
              className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-3 py-2"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-muted)] text-[var(--fg-secondary)]">
                <Icon name={scope.icon} size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate body-xs font-medium text-[var(--fg-primary)]">
                  {scope.name}
                </span>
                <span className="block body-xs text-[var(--fg-tertiary)]">
                  {grantedCount}/{totalScope} permiss{totalScope === 1 ? "ão" : "ões"}
                </span>
              </span>
              <AwPill
                variant={allOn ? "live" : someOn ? "beta" : "neutral"}
                dot={false}
              >
                {allOn ? "Completo" : someOn ? "Parcial" : "Sem"}
              </AwPill>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
 * Detail view (full-width, no sidebar)
 * ----------------------------------------------------------------- */

function RoleDetail({
  role,
  isNew,
  onBack,
  onPatch,
  onDelete,
}: {
  role: RoleDefinition;
  isNew?: boolean;
  onBack: () => void;
  onPatch: (patch: Partial<RoleDefinition>) => void;
  onDelete: () => void;
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
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 self-start rounded-[var(--radius-sm)] px-2 py-1 body-xs font-medium text-[var(--fg-secondary)] transition-colors duration-aw-fast outline-none hover:bg-[var(--bg-hover)] hover:text-[var(--fg-primary)] focus-visible:bg-[var(--bg-hover)]"
      >
        <Icon name="arrow_back" size={14} />
        Voltar para todas as funções
      </button>

      <section className="flex w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]">
        <RoleHeader
          role={role}
          editable={editable}
          onPatch={onPatch}
          onDelete={onDelete}
        />

        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-3">
          <p className="m-0 body-xs text-[var(--fg-tertiary)]">
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

        <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
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

        <footer className="flex items-center justify-end gap-3 border-t border-[var(--border-subtle)] bg-[var(--bg-muted)] px-6 py-3">
          <AwButton size="sm" variant="ghost" onClick={onBack}>
            Cancelar
          </AwButton>
          {editable && (
            <AwButton
              size="sm"
              variant="primary"
              iconLeft={isNew ? "add" : "check"}
              onClick={onBack}
            >
              {isNew ? "Criar função" : "Salvar alterações"}
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
  editable,
  onPatch,
  onDelete,
}: {
  role: RoleDefinition;
  editable: boolean;
  onPatch: (patch: Partial<RoleDefinition>) => void;
  onDelete: () => void;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-[var(--border-subtle)] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <RoleIconTile role={role} size="lg" />
          <div className="min-w-0 flex-1">
            {editable ? (
              <EditableText
                value={role.name}
                onChange={(name) => onPatch({ name })}
                className="text-[var(--fg-primary)]"
                placeholder="Nome da função"
              />
            ) : (
              <h6 className="m-0 flex flex-wrap items-center gap-2 text-[var(--fg-primary)]">
                {role.name}
                <AwPill variant="neutral" dot={false}>
                  Padrão
                </AwPill>
              </h6>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2 body-xs text-[var(--fg-secondary)]">
              <span>
                {role.memberCount} membro{role.memberCount === 1 ? "" : "s"}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {role.capabilities.length} permiss
                {role.capabilities.length === 1 ? "ão" : "ões"} ativa
                {role.capabilities.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        {editable && (
          <div className="flex shrink-0 items-center gap-2">
            <AwButton
              size="sm"
              variant="ghost"
              iconLeft="delete"
              onClick={onDelete}
            >
              Excluir
            </AwButton>
          </div>
        )}
      </div>

      {editable ? (
        <EditableText
          value={role.description}
          onChange={(description) => onPatch({ description })}
          className="body-xs text-[var(--fg-secondary)]"
          placeholder="Adicione uma descrição…"
          multiline
        />
      ) : (
        <p className="m-0 max-w-[680px] body-xs text-[var(--fg-secondary)]">
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
  const dim = size === "sm" ? 28 : size === "md" ? 36 : 44;
  const icon = size === "sm" ? 14 : size === "md" ? 18 : 22;
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-[var(--radius-md)]"
      style={{
        width: dim,
        height: dim,
        background: `color-mix(in srgb, ${color} 18%, transparent)`,
        color,
      }}
      aria-hidden="true"
    >
      <Icon name={role.icon} size={icon} />
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
            "m-0 w-full resize-none rounded-[var(--radius-sm)] bg-[var(--bg-input)] px-2 py-1.5 outline-none ring-1 ring-[var(--border-default)] focus:ring-[var(--fg-primary)] " +
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
          "m-0 w-full rounded-[var(--radius-sm)] bg-[var(--bg-input)] px-2 py-1 outline-none ring-1 ring-[var(--border-default)] focus:ring-[var(--fg-primary)] " +
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
        "m-0 w-full rounded-[var(--radius-sm)] px-2 py-1 text-left transition-colors duration-aw-fast hover:bg-[var(--bg-hover)] " +
        (className ?? "")
      }
    >
      {value || (
        <span className="text-[var(--fg-tertiary)]">{placeholder}</span>
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
          className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none"
          aria-expanded={open}
        >
          <Icon
            name="chevron_right"
            size={18}
            className={
              "transition-transform duration-[220ms] ease-in-out " +
              (open ? "rotate-90" : "")
            }
          />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-muted)] text-[var(--fg-secondary)]">
            <Icon name={scope.icon} size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate body-sm font-semibold text-[var(--fg-primary)]">
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
        className="grid transition-[grid-template-rows,opacity] duration-[220ms] ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
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
            className="flex items-start gap-3 rounded-[var(--radius-sm)] px-2 py-2 hover:bg-[var(--bg-hover)]"
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
                  "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[var(--radius-sm)] " +
                  (has
                    ? "bg-[var(--fg-primary)] text-[var(--bg-raised)]"
                    : "border border-[var(--border-default)] text-[var(--fg-tertiary)]")
                }
                aria-label={has ? "Permitido" : "Negado"}
              >
                <Icon name={has ? "check" : "close"} size={12} />
              </span>
            )}
            <span className="min-w-0 flex-1 body-xs">
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
            </span>
          </li>
        );
      })}
    </ul>
  );
}

