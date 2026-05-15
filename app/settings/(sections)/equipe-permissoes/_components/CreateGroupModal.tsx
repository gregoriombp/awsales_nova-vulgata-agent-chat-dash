"use client";

import { useEffect, useMemo, useState } from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";
import { MEMBERS, type Member } from "./data";

export function CreateGroupModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate?: (group: {
    name: string;
    description: string;
    icon: string;
    members: Member[];
  }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("groups");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"form" | "success">("form");

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setIcon("groups");
      setMemberIds([]);
      setSearch("");
      setMode("form");
    }
  }, [open]);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MEMBERS;
    return MEMBERS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [search]);

  const toggleMember = (id: string) => {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const canSubmit = name.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const picked = MEMBERS.filter((m) => memberIds.includes(m.id));
    onCreate?.({
      name: name.trim(),
      description: description.trim(),
      icon,
      members: picked,
    });
    setMode("success");
  };

  const memberCount = memberIds.length;

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title={mode === "form" ? "Criar grupo" : undefined}
      footer={
        mode === "form" ? (
          <>
            <AwButton size="sm" variant="ghost" onClick={onClose}>
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              iconLeft="add"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Criar grupo
            </AwButton>
          </>
        ) : (
          <AwButton size="sm" variant="primary" onClick={onClose}>
            Fechar
          </AwButton>
        )
      }
    >
      {mode === "form" ? (
        <div className="flex flex-col gap-5">
          <p className="m-0 body-xs text-[var(--fg-secondary)]">
            Grupos funcionam como departamentos: agrupam pessoas que
            compartilham contexto e responsabilidades. Você pode editar tudo
            depois.
          </p>

          <AwField label="Nome do grupo" htmlFor="group-name">
            <AwInput
              id="group-name"
              iconLeft={icon}
              placeholder="Ex.: Atendimento, Comercial, Operações"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </AwField>

          <AwField label="Descrição" htmlFor="group-description">
            <textarea
              id="group-description"
              className="min-h-[68px] w-full resize-y rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-raised)] px-3 py-2 body-xs text-[var(--fg-primary)] outline-none placeholder:text-[var(--fg-tertiary)] focus:border-[var(--fg-primary)]"
              placeholder="Para que esse grupo existe? (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </AwField>

          <AwField
            label={`Membros${memberCount > 0 ? ` (${memberCount} selecionado${memberCount === 1 ? "" : "s"})` : ""}`}
            htmlFor="group-members-search"
          >
            <AwInput
              id="group-members-search"
              iconLeft="search"
              placeholder="Buscar pessoas pra adicionar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="mt-2 max-h-[220px] overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
              {filteredMembers.length === 0 ? (
                <p className="m-0 px-3 py-4 text-center body-xs text-[var(--fg-tertiary)]">
                  Nenhuma pessoa encontrada.
                </p>
              ) : (
                <ul className="flex flex-col">
                  {filteredMembers.map((m) => {
                    const checked = memberIds.includes(m.id);
                    return (
                      <li key={m.id}>
                        <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-[var(--bg-hover)]">
                          <AwCheckbox
                            checked={checked}
                            onChange={() => toggleMember(m.id)}
                            label={m.name}
                          />
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
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </AwField>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-muted)] text-[var(--accent-success)]">
            <Icon name="check" size={28} />
          </span>
          <h6 className="m-0 text-[var(--fg-primary)]">
            Grupo criado!
          </h6>
          <p className="m-0 max-w-[360px] body-xs text-[var(--fg-secondary)]">
            {memberCount > 0
              ? `O grupo "${name}" foi criado com ${memberCount} membro${memberCount === 1 ? "" : "s"}.`
              : `O grupo "${name}" foi criado. Você pode adicionar membros a qualquer momento.`}
          </p>
        </div>
      )}
    </AwModal>
  );
}
