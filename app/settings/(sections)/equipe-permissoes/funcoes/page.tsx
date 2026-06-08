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
                  isNew={selected.id === newRoleId}
                  onBack={() => { setSelectedId(null); setNewRoleId(null); }}
                  onPatch={(patch) => handlePatchRole(selected.id, patch)}
                  onDelete={() => handleDeleteRole(selected.id)}
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
            <p className="m-0 body-xs text-(--fg-secondary)">
              Nenhum membro com essa função ainda.
            </p>
          ) : (
            members.map((m) => (
              <div
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
                <p className="m-0 body-xs text-(--fg-secondary)">
                  Nenhuma função encontrada.
                </p>
              </td>
            </tr>
          ) : (
            roles.map((r) => {
              const members = membersByRole.get(r.name) ?? [];
              return (
                <RoleTableRow
                  key={r.id}
                  role={r}
                  total={total}
                  active={selectedId === r.id}
                  onSelect={() => onSelect(r.id)}
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
              <span className="body-xs font-medium text-(--fg-primary)">
                {role.name}
              </span>
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
            memberCount={role.memberCount}
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
}: {
  roles: RoleDefinition[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
}) {
  return (
    <aside className="flex flex-col self-start divide-y divide-(--border-subtle) overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-raised)">
      <div className="flex items-center justify-between border-b border-(--border-subtle) px-4 py-3">
        <p className="m-0 text-[13px] font-semibold tracking-tight text-(--fg-primary)">
          Funções · {roles.length}
        </p>
        <button
          type="button"
          onClick={onCreate}
          aria-label="Criar função"
          className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-(--fg-tertiary) transition-colors hover:bg-(--bg-hover) hover:text-(--fg-primary)"
        >
          <Icon name="add" size={16} />
        </button>
      </div>
      <ul className="flex flex-col">
        {roles.map((r) => {
          const active = selectedId === r.id;
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
                  <span className="block truncate body-xs font-medium text-(--fg-primary)">
                    {r.name}
                  </span>
                  <span className="block truncate body-xs text-(--fg-secondary)">
                    {r.memberCount} membro{r.memberCount === 1 ? "" : "s"}
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
 * Detail view (side panel)
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
        aria-label="Fechar"
        className="inline-flex items-center gap-1.5 self-end rounded-sm px-2 py-1 body-xs font-medium text-(--fg-secondary) transition-colors duration-aw-fast outline-hidden hover:bg-(--bg-hover) hover:text-(--fg-primary) focus-visible:bg-(--bg-hover)"
      >
        Fechar
        <Icon name="close" size={14} />
      </button>

      <section className="flex w-full flex-col overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-raised)">
        <RoleHeader
          role={role}
          editable={editable}
          onPatch={onPatch}
          onDelete={onDelete}
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
  const dim = size === "sm" ? 28 : size === "md" ? 36 : 44;
  const icon = size === "sm" ? 14 : size === "md" ? 18 : 22;
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-md"
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
            </span>
          </li>
        );
      })}
    </ul>
  );
}

