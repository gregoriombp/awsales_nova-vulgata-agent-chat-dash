"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AwAvatar } from "@/components/ui/AwAvatar";
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
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";
import {
  GROUPS,
  MEMBERS,
  pickGroupBackground,
  type Group,
} from "../_components/data";
import { CreateGroupModal } from "../_components/CreateGroupModal";
import { TeamTabs } from "../_components/TeamTabs";

export default function GroupsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<Group[]>(GROUPS);
  const [createOpen, setCreateOpen] = useState(false);
  const [membersGroupId, setMembersGroupId] = useState<string | null>(null);
  /** Equipe pendente de confirmação de exclusão (ação destrutiva, sem desfazer). */
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);
  const openGroup = (id: string) => router.push(`/settings/equipe-permissoes/grupos/${id}`);

  const membersGroup = membersGroupId
    ? groups.find((g) => g.id === membersGroupId)
    : null;
  const membersGroupMembers = membersGroup
    ? membersGroup.members
        .map((id) => MEMBERS.find((m) => m.id === id))
        .filter((m): m is NonNullable<typeof m> => Boolean(m))
    : [];

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

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setGroups((prev) => prev.filter((g) => g.id !== id));
    setDeleteTarget(null);
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

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0">
            <AwInput
              iconLeft="search"
              placeholder="Buscar equipes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <AwButton
            size="md"
            variant="primary"
            iconLeft="add"
            onClick={() => setCreateOpen(true)}
          >
            Criar equipe
          </AwButton>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-12">
            <AwEmpty>
              <AwEmptyHeader>
                <AwEmptyMedia variant="icon">
                  <Icon name="groups" size={20} />
                </AwEmptyMedia>
                <AwEmptyTitle>Nenhuma equipe encontrada</AwEmptyTitle>
                <AwEmptyDescription>
                  Equipes dão acesso a várias pessoas de uma vez — Atendimento,
                  Comercial, etc.
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
                    onManage={() => openGroup(g.id)}
                    onOpenMembers={() => setMembersGroupId(g.id)}
                    openMembersThreshold={3}
                    menu={[
                      {
                        id: "manage",
                        label: "Abrir equipe",
                        icon: "open_in_new",
                        onSelect: () => openGroup(g.id),
                      },
                      {
                        id: "add-members",
                        label: "Adicionar membros",
                        icon: "person_add",
                        onSelect: () => openGroup(g.id),
                      },
                      {
                        id: "duplicate",
                        label: "Duplicar equipe",
                        icon: "content_copy",
                        onSelect: () => handleDuplicate(g),
                      },
                      { id: "sep", separator: true },
                      {
                        id: "delete",
                        label: "Excluir equipe",
                        icon: "delete",
                        danger: true,
                        onSelect: () => setDeleteTarget(g),
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

      <AwModal
        open={membersGroup !== null}
        onClose={() => setMembersGroupId(null)}
        title={membersGroup ? `Membros · ${membersGroup.name}` : "Membros"}
      >
        {membersGroup && (
          <div className="flex flex-col gap-2">
            {membersGroupMembers.length === 0 ? (
              <p className="m-0 body-xs text-(--fg-secondary)">
                Nenhum membro nessa equipe ainda.
              </p>
            ) : (
              membersGroupMembers.map((m) => (
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
                  <span className="body-xs text-(--fg-tertiary)">
                    {m.role}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </AwModal>

      <AwModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={deleteTarget ? `Excluir ${deleteTarget.name}?` : "Excluir equipe"}
        footer={
          <>
            <AwButton size="sm" variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="danger"
              iconLeft="delete"
              onClick={handleConfirmDelete}
            >
              Excluir equipe
            </AwButton>
          </>
        }
      >
        {deleteTarget && (
          <p className="m-0 body-xs text-(--fg-primary) text-pretty">
            A equipe{" "}
            <strong className="font-semibold">{deleteTarget.name}</strong>{" "}
            ({deleteTarget.memberCount}{" "}
            {deleteTarget.memberCount === 1 ? "membro" : "membros"}) será
            excluída. Os membros continuam na organização — só perdem este
            agrupamento. Esta ação{" "}
            <strong className="font-semibold">não pode ser desfeita</strong>.
          </p>
        )}
      </AwModal>
    </>
  );
}
