"use client";

import { useEffect, useMemo, useState } from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwSheet } from "@/components/ui/AwSheet";
import { Icon } from "@/components/ui/Icon";
import { MEMBERS, type Group } from "./data";

export function ManageGroupSheet({
  group,
  onClose,
  onSave,
  onDelete,
}: {
  group: Group | null;
  onClose: () => void;
  onSave?: (next: { name: string; description: string; memberIds: string[] }) => void;
  onDelete?: (groupId: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description);
      setMemberIds(group.members);
      setSearch("");
      setConfirmingDelete(false);
    }
  }, [group]);

  const currentMembers = useMemo(
    () => MEMBERS.filter((m) => memberIds.includes(m.id)),
    [memberIds]
  );

  const availableMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = MEMBERS.filter((m) => !memberIds.includes(m.id));
    if (!q) return out;
    return out.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [memberIds, search]);

  const removeMember = (id: string) =>
    setMemberIds((prev) => prev.filter((x) => x !== id));

  const addMember = (id: string) =>
    setMemberIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

  const dirty =
    !!group &&
    (name !== group.name ||
      description !== group.description ||
      memberIds.join(",") !== group.members.join(","));

  const handleSave = () => {
    if (!group || !dirty) return;
    onSave?.({ name: name.trim(), description: description.trim(), memberIds });
    onClose();
  };

  const handleDelete = () => {
    if (!group) return;
    onDelete?.(group.id);
    onClose();
  };

  return (
    <AwSheet
      open={group !== null}
      onClose={onClose}
      size="default"
      title={
        <span className="flex items-center gap-2">
          <Icon name={group?.icon ?? "groups"} size={20} />
          {group?.name ?? ""}
        </span>
      }
      meta={
        group ? (
          <span className="body-xs text-[var(--fg-secondary)]">
            {currentMembers.length} membro{currentMembers.length === 1 ? "" : "s"}
          </span>
        ) : undefined
      }
      footer={
        <>
          <AwButton
            size="sm"
            variant="ghost"
            iconLeft="delete"
            onClick={() => setConfirmingDelete((v) => !v)}
            className="!text-[var(--accent-danger)]"
          >
            Excluir grupo
          </AwButton>
          <div className="flex flex-1 justify-end gap-2">
            <AwButton size="sm" variant="ghost" onClick={onClose}>
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              iconLeft="check"
              disabled={!dirty || name.trim().length === 0}
              onClick={handleSave}
            >
              Salvar
            </AwButton>
          </div>
        </>
      }
    >
      {group && (
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h3 className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
              Identidade
            </h3>
            <AwField label="Nome" htmlFor="manage-group-name">
              <AwInput
                id="manage-group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </AwField>
            <AwField label="Descrição" htmlFor="manage-group-description">
              <textarea
                id="manage-group-description"
                className="min-h-[68px] w-full resize-y rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-raised)] px-3 py-2 body-xs text-[var(--fg-primary)] outline-none placeholder:text-[var(--fg-tertiary)] focus:border-[var(--fg-primary)]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </AwField>
          </section>

          <section className="flex flex-col gap-3">
            <header className="flex items-baseline justify-between">
              <h3 className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
                Membros · {currentMembers.length}
              </h3>
            </header>

            {currentMembers.length === 0 ? (
              <p className="m-0 rounded-[var(--radius-md)] border border-dashed border-[var(--border-subtle)] px-3 py-4 text-center body-xs text-[var(--fg-secondary)]">
                Esse grupo ainda não tem membros. Adicione abaixo.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {currentMembers.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 hover:bg-[var(--bg-hover)]"
                  >
                    <AwAvatar
                      size="sm"
                      src={m.avatar}
                      initials={m.initials}
                      alt={m.name}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate body-xs font-medium text-[var(--fg-primary)]">
                        {m.name}
                      </p>
                      <p className="m-0 truncate body-xs text-[var(--fg-secondary)]">
                        {m.role}
                      </p>
                    </div>
                    <AwButton
                      size="sm"
                      variant="ghost"
                      iconOnly="close"
                      aria-label={`Remover ${m.name}`}
                      onClick={() => removeMember(m.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
              Adicionar pessoas
            </h3>
            <AwInput
              iconLeft="search"
              placeholder="Buscar por nome ou e-mail…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-[260px] overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
              {availableMembers.length === 0 ? (
                <p className="m-0 px-3 py-4 text-center body-xs text-[var(--fg-tertiary)]">
                  {memberIds.length === MEMBERS.length
                    ? "Todo mundo já está no grupo."
                    : "Nenhuma pessoa encontrada."}
                </p>
              ) : (
                <ul className="flex flex-col">
                  {availableMembers.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => addMember(m.id)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[var(--bg-hover)]"
                      >
                        <AwAvatar
                          size="sm"
                          src={m.avatar}
                          initials={m.initials}
                          alt={m.name}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="m-0 truncate body-xs font-medium text-[var(--fg-primary)]">
                            {m.name}
                          </p>
                          <p className="m-0 truncate body-xs text-[var(--fg-secondary)]">
                            {m.role}
                          </p>
                        </div>
                        <Icon
                          name="add"
                          size={16}
                          className="text-[var(--fg-tertiary)]"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {confirmingDelete && (
            <div className="rounded-[var(--radius-md)] border border-[var(--accent-danger)] bg-[var(--bg-muted)] p-4">
              <p className="m-0 body-xs font-semibold text-[var(--fg-primary)]">
                Excluir esse grupo?
              </p>
              <p className="m-0 mt-1 body-xs text-[var(--fg-secondary)]">
                Os membros não são removidos, mas perdem os acessos concedidos
                via grupo. Essa ação não pode ser desfeita.
              </p>
              <div className="mt-3 flex justify-end gap-2">
                <AwButton
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmingDelete(false)}
                >
                  Cancelar
                </AwButton>
                <AwButton
                  size="sm"
                  variant="danger"
                  iconLeft="delete"
                  onClick={handleDelete}
                >
                  Excluir grupo
                </AwButton>
              </div>
            </div>
          )}
        </div>
      )}
    </AwSheet>
  );
}
