"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AwButton } from "@/components/ui/AwButton";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwInput } from "@/components/ui/AwInput";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import {
  ALL_PERMISSION_IDS,
  DEFAULT_CUSTOM_ROLE_ICON,
  ROLE_COLORS,
  ROLE_DEFINITIONS,
  SCOPES,
  getRoleColor,
  type PermissionIntent,
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
  const [search, setSearch] = useState("");

  const selected = useMemo(
    () => (selectedId ? roles.find((r) => r.id === selectedId) ?? null : null),
    [roles, selectedId]
  );

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

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [roles, search]);

  const handleCreateRole = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const usedColors = new Set(roles.map((r) => r.color));
      const nextColor =
        ROLE_COLORS.find((c) => !usedColors.has(c.id))?.id ?? "blue";
      const id = `r-custom-${Date.now()}`;
      const role: RoleDefinition = {
        id,
        name: trimmed,
        description: "Função personalizada — defina permissões à direita.",
        memberCount: 0,
        capabilities: [],
        isSystem: false,
        color: nextColor,
        icon: DEFAULT_CUSTOM_ROLE_ICON,
      };
      setRoles((prev) => [...prev, role]);
      setSelectedId(id);
    },
    [roles]
  );

  const handlePatchRole = useCallback(
    (id: string, patch: Partial<RoleDefinition>) => {
      setRoles((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
      );
    },
    []
  );

  const handleDuplicateRole = useCallback(
    (sourceId: string) => {
      const source = roles.find((r) => r.id === sourceId);
      if (!source) return;
      const id = `r-custom-${Date.now()}`;
      const role: RoleDefinition = {
        ...source,
        id,
        name: `${source.name} (cópia)`,
        memberCount: 0,
        isSystem: false,
      };
      setRoles((prev) => [...prev, role]);
      setSelectedId(id);
    },
    [roles]
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

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} mainClassName="!p-0">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-10 pb-20 pt-12">
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

        {!isExpanded ? (
          <RoleGrid
            roles={filteredRoles}
            search={search}
            onSearchChange={setSearch}
            onSelect={setSelectedId}
            onCreate={handleCreateRole}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <RoleSidebar
              roles={filteredRoles}
              search={search}
              onSearchChange={setSearch}
              selectedId={selected!.id}
              onSelect={setSelectedId}
              onCreate={handleCreateRole}
              onBackToList={() => setSelectedId(null)}
            />

            <RoleDetail
              role={selected!}
              onPatch={(patch) => handlePatchRole(selected!.id, patch)}
              onDuplicate={() => handleDuplicateRole(selected!.id)}
              onDelete={() => handleDeleteRole(selected!.id)}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

/* -----------------------------------------------------------------
 * Role grid (initial state, full-width)
 * ----------------------------------------------------------------- */

function RoleGrid({
  roles,
  search,
  onSearchChange,
  onSelect,
  onCreate,
}: {
  roles: RoleDefinition[];
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  const submit = () => {
    if (!draft.trim()) {
      setCreating(false);
      return;
    }
    onCreate(draft);
    setDraft("");
    setCreating(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-[320px]">
          <AwInput
            iconLeft="search"
            placeholder="Buscar funções…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
          Selecione uma função para ver e ajustar suas permissões.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onSelect(r.id)}
              className="group flex h-full w-full flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-4 text-left transition-colors duration-aw-fast outline-none hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)] focus-visible:border-[var(--fg-primary)]"
            >
              <header className="flex items-start gap-3">
                <RoleIconTile role={r} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="m-0 truncate text-[14.5px] font-semibold text-[var(--fg-primary)]">
                      {r.name}
                    </h3>
                    {r.isSystem && (
                      <AwPill variant="neutral" dot={false}>
                        Padrão
                      </AwPill>
                    )}
                  </div>
                  <p className="m-0 mt-1 line-clamp-2 text-[12px] leading-[1.5] text-[var(--fg-secondary)]">
                    {r.description}
                  </p>
                </div>
              </header>
              <footer className="mt-auto flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-[11.5px] text-[var(--fg-secondary)]">
                <span>
                  {r.memberCount} membro{r.memberCount === 1 ? "" : "s"}
                </span>
                <span>
                  {r.capabilities.length}/{ALL_PERMISSION_IDS.length} permiss
                  {ALL_PERMISSION_IDS.length === 1 ? "ão" : "ões"}
                </span>
              </footer>
            </button>
          </li>
        ))}

        <li>
          {creating ? (
            <div className="flex h-full w-full flex-col gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--fg-primary)] bg-[var(--bg-raised)] p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] text-[var(--fg-secondary)]">
                  <Icon name="add" size={18} />
                </span>
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={submit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submit();
                    } else if (e.key === "Escape") {
                      setDraft("");
                      setCreating(false);
                    }
                  }}
                  placeholder="Nome da nova função…"
                  className="w-full bg-transparent text-[14.5px] font-semibold text-[var(--fg-primary)] outline-none placeholder:text-[var(--fg-tertiary)]"
                />
              </div>
              <p className="m-0 text-[11.5px] text-[var(--fg-secondary)]">
                Pressione Enter para criar e abrir o editor de permissões.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex h-full w-full flex-col gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-transparent p-4 text-left transition-colors duration-aw-fast outline-none hover:border-[var(--fg-primary)] hover:bg-[var(--bg-hover)] focus-visible:border-[var(--fg-primary)]"
            >
              <header className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] text-[var(--fg-secondary)]">
                  <Icon name="add" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="m-0 text-[14.5px] font-semibold text-[var(--fg-primary)]">
                    Criar nova função
                  </h3>
                  <p className="m-0 mt-1 text-[12px] leading-[1.5] text-[var(--fg-secondary)]">
                    Defina nome, descrição e permissões customizadas.
                  </p>
                </div>
              </header>
            </button>
          )}
        </li>
      </ul>
    </div>
  );
}

/* -----------------------------------------------------------------
 * Sidebar (collapsed mode)
 * ----------------------------------------------------------------- */

function RoleSidebar({
  roles,
  search,
  onSearchChange,
  selectedId,
  onSelect,
  onCreate,
  onBackToList,
}: {
  roles: RoleDefinition[];
  search: string;
  onSearchChange: (v: string) => void;
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onBackToList: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  const submit = () => {
    if (!draft.trim()) {
      setCreating(false);
      return;
    }
    onCreate(draft);
    setDraft("");
    setCreating(false);
  };

  return (
    <aside className="flex flex-col self-start overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-3 py-2">
        <button
          type="button"
          onClick={onBackToList}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-secondary)] transition-colors duration-aw-fast outline-none hover:bg-[var(--bg-hover)] hover:text-[var(--fg-primary)] focus-visible:bg-[var(--bg-hover)]"
          aria-label="Voltar para a lista de funções"
        >
          <Icon name="arrow_back" size={16} />
        </button>
        <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
          Funções
        </span>
      </div>

      <div className="border-b border-[var(--border-subtle)] p-3">
        <AwInput
          iconLeft="search"
          placeholder="Buscar funções…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <ul className="flex flex-col gap-px overflow-y-auto p-2">
        {roles.length === 0 ? (
          <li className="px-3 py-6 text-center text-[12.5px] text-[var(--fg-secondary)]">
            Nenhuma função encontrada.
          </li>
        ) : (
          roles.map((r) => {
            const active = selectedId === r.id;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onSelect(r.id)}
                  aria-pressed={active}
                  className={
                    "flex w-full items-start gap-3 rounded-[var(--radius-md)] px-2.5 py-2 text-left transition-colors duration-aw-fast outline-none focus-visible:bg-[var(--bg-hover)] " +
                    (active
                      ? "bg-[var(--bg-selected)]"
                      : "hover:bg-[var(--bg-hover)]")
                  }
                >
                  <RoleIconTile role={r} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13.5px] font-medium text-[var(--fg-primary)]">
                        {r.name}
                      </span>
                      {r.isSystem && (
                        <AwPill variant="neutral" dot={false}>
                          Padrão
                        </AwPill>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[11.5px] text-[var(--fg-secondary)]">
                      {r.memberCount} membro{r.memberCount === 1 ? "" : "s"} ·{" "}
                      {r.capabilities.length} permiss
                      {r.capabilities.length === 1 ? "ão" : "ões"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>

      <div className="border-t border-[var(--border-subtle)] p-2">
        {creating ? (
          <div className="flex items-center gap-2 px-1">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-secondary)]"
              aria-hidden="true"
            >
              <Icon name="add" size={16} />
            </span>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={submit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                } else if (e.key === "Escape") {
                  setDraft("");
                  setCreating(false);
                }
              }}
              placeholder="Nome da nova função…"
              className="w-full bg-transparent text-[13px] font-medium text-[var(--fg-primary)] outline-none placeholder:text-[var(--fg-tertiary)]"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-2 text-left text-[13px] font-medium text-[var(--fg-secondary)] transition-colors duration-aw-fast hover:bg-[var(--bg-hover)] hover:text-[var(--fg-primary)]"
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-[var(--border-default)] text-[var(--fg-secondary)]"
              aria-hidden="true"
            >
              <Icon name="add" size={16} />
            </span>
            Criar nova função
          </button>
        )}
      </div>
    </aside>
  );
}

/* -----------------------------------------------------------------
 * Detail panel
 * ----------------------------------------------------------------- */

function RoleDetail({
  role,
  onPatch,
  onDuplicate,
  onDelete,
}: {
  role: RoleDefinition;
  onPatch: (patch: Partial<RoleDefinition>) => void;
  onDuplicate: () => void;
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
    <section className="flex flex-col self-start overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]">
      <RoleHeader
        role={role}
        editable={editable}
        onPatch={onPatch}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />

      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-3">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
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

      <footer className="flex items-center gap-2 border-t border-[var(--border-subtle)] bg-[var(--bg-muted)] px-6 py-3">
        <Icon name="info" size={14} />
        <p className="m-0 text-[11.5px] text-[var(--fg-secondary)]">
          Em breve: permissões condicionais (ex.: ver apenas conversas da
          própria equipe, visualizar campanhas sem publicar).
        </p>
      </footer>
    </section>
  );
}

/* -----------------------------------------------------------------
 * Role header (name, description, actions)
 * ----------------------------------------------------------------- */

function RoleHeader({
  role,
  editable,
  onPatch,
  onDuplicate,
  onDelete,
}: {
  role: RoleDefinition;
  editable: boolean;
  onPatch: (patch: Partial<RoleDefinition>) => void;
  onDuplicate: () => void;
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
                className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]"
                placeholder="Nome da função"
              />
            ) : (
              <h2 className="m-0 flex flex-wrap items-center gap-2 text-[18px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
                {role.name}
                <AwPill variant="neutral" dot={false}>
                  Padrão
                </AwPill>
              </h2>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--fg-secondary)]">
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

        <div className="flex shrink-0 items-center gap-2">
          <AwButton
            size="sm"
            variant="ghost"
            iconLeft="content_copy"
            onClick={onDuplicate}
          >
            Duplicar
          </AwButton>
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
        </div>
      </div>

      {editable ? (
        <EditableText
          value={role.description}
          onChange={(description) => onPatch({ description })}
          className="text-[13px] leading-[1.55] text-[var(--fg-secondary)]"
          placeholder="Adicione uma descrição…"
          multiline
        />
      ) : (
        <p className="m-0 max-w-[680px] text-[13px] leading-[1.55] text-[var(--fg-secondary)]">
          {role.description}
        </p>
      )}
    </header>
  );
}

/* -----------------------------------------------------------------
 * Role icon tile (color-tinted background + material icon)
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
 * Editable inline text (click-to-edit)
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
            name={open ? "expand_more" : "chevron_right"}
            size={18}
          />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-muted)] text-[var(--fg-secondary)]">
            <Icon name={scope.icon} size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold text-[var(--fg-primary)]">
              {scope.name}
            </span>
            <span className="block truncate text-[12px] text-[var(--fg-secondary)]">
              {scope.description}
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

      {open && (
        <div className="mt-4 flex flex-col gap-4 pl-9">
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
      )}
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
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-secondary)]">
          {group.label}
        </span>
        <IntentBadge intent={group.intent} />
      </div>
      <ul className="flex flex-col">
        {group.permissions.map((p) => {
          const has = granted.has(p.id);
          return (
            <li
              key={p.id}
              className="flex items-start gap-3 rounded-[var(--radius-sm)] px-2 py-2 hover:bg-[var(--bg-hover)]"
            >
              {editable ? (
                <span className="mt-0.5">
                  <AwCheckbox
                    checked={has}
                    onChange={(next) => onToggle(p.id, next)}
                    label={p.label}
                  />
                </span>
              ) : (
                <span
                  className={
                    "mt-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-[var(--radius-sm)] " +
                    (has
                      ? "bg-[var(--fg-primary)] text-[var(--bg-raised)]"
                      : "border border-[var(--border-default)] text-[var(--fg-tertiary)]")
                  }
                  aria-label={has ? "Permitido" : "Negado"}
                >
                  <Icon name={has ? "check" : "close"} size={12} />
                </span>
              )}
              <label
                className={
                  "min-w-0 flex-1 cursor-pointer text-[13px] " +
                  (editable ? "" : "cursor-default ")
                }
                onClick={() => editable && onToggle(p.id, !has)}
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
                  <span className="block text-[11.5px] text-[var(--fg-tertiary)]">
                    {p.description}
                  </span>
                )}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function IntentBadge({ intent }: { intent: PermissionIntent }) {
  const map: Record<
    PermissionIntent,
    { label: string; variant: "neutral" | "beta" | "ai" }
  > = {
    module: { label: "Acesso", variant: "neutral" },
    operational: { label: "Operacional", variant: "beta" },
    administrative: { label: "Administrativo", variant: "ai" },
  };
  const cfg = map[intent];
  return (
    <AwPill variant={cfg.variant} dot={false}>
      {cfg.label}
    </AwPill>
  );
}
