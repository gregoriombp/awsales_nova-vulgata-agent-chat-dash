"use client";

import { useMemo, useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwGroupCard } from "@/components/ui/AwGroupCard";
import { AwInput } from "@/components/ui/AwInput";
import { Icon } from "@/components/ui/Icon";
import {
  GROUPS,
  MEMBERS,
  pickGroupBackground,
  type Group,
} from "../_components/data";
import { CreateGroupModal } from "../_components/CreateGroupModal";
import { ManageGroupSheet } from "../_components/ManageGroupSheet";
import { TeamTabs } from "../_components/TeamTabs";

export default function GroupsPage() {
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<Group[]>(GROUPS);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
    );
  }, [search, groups]);

  const handleCreate = (next: {
    name: string;
    description: string;
    icon: string;
    members: typeof MEMBERS;
  }) => {
    const id = `g-${next.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    setGroups((prev) => [
      ...prev,
      {
        id,
        name: next.name,
        description: next.description,
        icon: next.icon || "groups",
        memberCount: next.members.length,
        roles: [],
        members: next.members.map((m) => m.id),
        backgroundImage: pickGroupBackground(id),
      },
    ]);
  };

  const handleSave = (
    groupId: string,
    next: { name: string; description: string; memberIds: string[] }
  ) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              name: next.name,
              description: next.description,
              members: next.memberIds,
              memberCount: next.memberIds.length,
            }
          : g
      )
    );
  };

  const handleDelete = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const handleDuplicate = (source: Group) => {
    const id = `${source.id}-copy-${Date.now()}`;
    setGroups((prev) => [
      ...prev,
      {
        ...source,
        id,
        name: `${source.name} (cópia)`,
        backgroundImage: pickGroupBackground(id),
      },
    ]);
  };

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

        <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-3">
          <Icon
            name="lightbulb"
            size={16}
            className="mt-0.5 shrink-0 text-[var(--fg-secondary)]"
          />
          <p className="m-0 body-xs text-[var(--fg-secondary)]">
            Pense em cada grupo como um <strong className="font-semibold text-[var(--fg-primary)]">departamento</strong> da empresa — uma forma de
            agrupar pessoas que compartilham contexto e responsabilidades (ex.:
            Atendimento, Comercial, Operações).
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="w-full max-w-[320px]">
            <AwInput
              iconLeft="search"
              placeholder="Buscar grupos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <AwButton
            size="sm"
            variant="primary"
            iconLeft="add"
            onClick={() => setCreateOpen(true)}
          >
            Criar grupo
          </AwButton>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-12">
            <AwEmpty>
              <AwEmptyHeader>
                <AwEmptyMedia variant="icon">
                  <Icon name="groups" size={20} />
                </AwEmptyMedia>
                <AwEmptyTitle>Nenhum grupo encontrado</AwEmptyTitle>
                <AwEmptyDescription>
                  Use grupos para conceder acesso a vários membros de uma vez —
                  por exemplo, time de Atendimento ou time Comercial.
                </AwEmptyDescription>
              </AwEmptyHeader>
            </AwEmpty>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((g) => {
              const members = g.members.map((id) => {
                const m = MEMBERS.find((member) => member.id === id);
                return {
                  name: m?.name ?? id,
                  avatar: m?.avatar,
                  initials: m?.initials ?? "?",
                };
              });

              return (
                <li key={g.id}>
                  <AwGroupCard
                    name={g.name}
                    description={g.description}
                    memberCount={g.memberCount}
                    members={members}
                    icon={g.icon}
                    backgroundImage={g.backgroundImage}
                    onManage={() => setEditing(g)}
                    menu={[
                      {
                        id: "manage",
                        label: "Gerenciar equipe",
                        icon: "settings",
                        onSelect: () => setEditing(g),
                      },
                      {
                        id: "add-members",
                        label: "Adicionar membros",
                        icon: "person_add",
                        onSelect: () => setEditing(g),
                      },
                      {
                        id: "rename",
                        label: "Renomear grupo",
                        icon: "edit",
                        onSelect: () => setEditing(g),
                      },
                      {
                        id: "duplicate",
                        label: "Duplicar grupo",
                        icon: "content_copy",
                        onSelect: () => handleDuplicate(g),
                      },
                      { id: "sep", separator: true },
                      {
                        id: "delete",
                        label: "Excluir grupo",
                        icon: "delete",
                        danger: true,
                        onSelect: () => handleDelete(g.id),
                      },
                    ]}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <CreateGroupModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      <ManageGroupSheet
        group={editing}
        onClose={() => setEditing(null)}
        onSave={(next) => editing && handleSave(editing.id, next)}
        onDelete={handleDelete}
      />
    </>
  );
}
