"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import {
  AwDropdownMenu,
  type AwDropdownItem,
} from "@/components/ui/AwDropdownMenu";
import { AwSelect } from "@/components/ui/AwSelect";
import { Icon } from "@/components/ui/Icon";
import {
  AwMembersTable,
  AwMembersTablePersonCell,
  AwMembersTableTextCell,
} from "@/components/ui/AwMembersTable";
import { GROUP_BACKGROUNDS, GROUPS, MEMBERS, type Member } from "../../_components/data";
import { InviteModal } from "../../_components/InviteModal";

type ActivityKind = "join" | "leave" | "role" | "permission" | "cover" | "rename";

/** Pessoa envolvida no evento — quando presente, o timeline mostra a foto
 *  real em vez do ícone genérico do tipo. */
type ActivityActor = {
  name: string;
  avatar?: string;
  initials: string;
};

type ActivityEvent = {
  id: string;
  when: string;
  text: string;
  kind: ActivityKind;
  /** Distância em dias de hoje — alimenta o agrupamento e o filtro de período. */
  daysAgo: number;
  actor?: ActivityActor;
};

const ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: "a1",
    when: "hoje, 09:14",
    text: "Mariana Castro entrou na equipe",
    kind: "join",
    daysAgo: 0,
    actor: { name: "Mariana Castro", avatar: "/assets/ui-faces/female-10.jpg", initials: "MC" },
  },
  {
    id: "a2",
    when: "ontem, 17:02",
    text: "Função \"Editor\" herdada por novos membros",
    kind: "role",
    daysAgo: 1,
    actor: { name: "Mariana Castro", avatar: "/assets/ui-faces/female-10.jpg", initials: "MC" },
  },
  {
    id: "a3",
    when: "ontem, 11:48",
    text: "Permissão \"Acessar relatórios\" liberada para o grupo",
    kind: "permission",
    daysAgo: 1,
    actor: { name: "Larissa Pinto", avatar: "/assets/ui-faces/female-2.jpg", initials: "LP" },
  },
  {
    id: "a4",
    when: "terça, 14:31",
    text: "Capa da equipe atualizada",
    kind: "cover",
    daysAgo: 2,
    actor: { name: "Gregório Pinheiro", avatar: "/assets/ui-faces/male-1.jpg", initials: "GP" },
  },
  {
    id: "a5",
    when: "segunda, 10:05",
    text: "Tiago Alves removido da equipe",
    kind: "leave",
    daysAgo: 3,
    actor: { name: "Tiago Alves", avatar: "/assets/ui-faces/male-11.jpg", initials: "TA" },
  },
  {
    id: "a6",
    when: "7 de jun., 16:20",
    text: "Equipe renomeada de \"Atendimento Geral\" para \"Atendimento\"",
    kind: "rename",
    daysAgo: 5,
    actor: { name: "Mariana Castro", avatar: "/assets/ui-faces/female-10.jpg", initials: "MC" },
  },
  {
    id: "a7",
    when: "5 de jun., 09:48",
    text: "Função \"Gerente de Operações\" adicionada ao grupo",
    kind: "role",
    daysAgo: 7,
    actor: { name: "Carlos Lima", avatar: "/assets/ui-faces/male-3.jpg", initials: "CL" },
  },
  {
    id: "a8",
    when: "29 de mai., 14:12",
    text: "Carlos Lima entrou na equipe",
    kind: "join",
    daysAgo: 14,
    actor: { name: "Carlos Lima", avatar: "/assets/ui-faces/male-3.jpg", initials: "CL" },
  },
];

function activityIcon(kind: ActivityKind): string {
  switch (kind) {
    case "join": return "person_add";
    case "leave": return "person_remove";
    case "role": return "badge";
    case "permission": return "lock_open";
    case "cover": return "image";
    case "rename": return "edit";
  }
}

/* Agrupamento por data + filtros da linha do tempo completa — mesmo
 * padrão do histórico de faturas (seções por período + menus suspensos). */

type ActivityCategory = "membros" | "funcoes" | "permissoes" | "personalizacao";

const CATEGORY_OF: Record<ActivityKind, ActivityCategory> = {
  join: "membros",
  leave: "membros",
  role: "funcoes",
  permission: "permissoes",
  cover: "personalizacao",
  rename: "personalizacao",
};

const CATEGORY_OPTIONS: { id: ActivityCategory; label: string }[] = [
  { id: "membros", label: "Membros" },
  { id: "funcoes", label: "Funções" },
  { id: "permissoes", label: "Permissões" },
  { id: "personalizacao", label: "Personalização" },
];

const ALL_CATEGORIES: ActivityCategory[] = CATEGORY_OPTIONS.map((c) => c.id);

const PERIOD_OPTIONS = [
  { id: "all", label: "Todo o período", maxDays: Infinity },
  { id: "today", label: "Hoje", maxDays: 0 },
  { id: "7d", label: "Últimos 7 dias", maxDays: 7 },
  { id: "30d", label: "Últimos 30 dias", maxDays: 30 },
] as const;

type PeriodId = (typeof PERIOD_OPTIONS)[number]["id"];

type DayBucket = { id: string; label: string; events: ActivityEvent[] };

function groupByDay(events: ActivityEvent[]): DayBucket[] {
  const defs: { id: string; label: string; match: (d: number) => boolean }[] = [
    { id: "today", label: "Hoje", match: (d) => d === 0 },
    { id: "yesterday", label: "Ontem", match: (d) => d === 1 },
    { id: "week", label: "Esta semana", match: (d) => d >= 2 && d <= 6 },
    { id: "earlier", label: "Anteriores", match: (d) => d >= 7 },
  ];
  return defs
    .map((def) => ({
      id: def.id,
      label: def.label,
      events: events.filter((e) => def.match(e.daysAgo)),
    }))
    .filter((bucket) => bucket.events.length > 0);
}

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const group = useMemo(() => GROUPS.find((g) => g.id === id), [id]);
  const [cover, setCover] = useState<string>(group?.backgroundImage ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [groupName, setGroupName] = useState<string>(group?.name ?? "");
  const [groupIcon, setGroupIcon] = useState<string>(group?.icon ?? "groups");
  const [groupIconColor, setGroupIconColor] = useState<string>("var(--bg-raised)");
  const [renameOpen, setRenameOpen] = useState(false);
  const [iconOpen, setIconOpen] = useState(false);
  const [activityView, setActivityView] = useState<"summary" | "all">("summary");
  const [removeMember, setRemoveMember] = useState<Member | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [groupMemberIds, setGroupMemberIds] = useState<string[]>([]);
  React.useEffect(() => {
    if (group) setGroupMemberIds(group.members);
  }, [group]);

  // A capa imersiva é uma faixa de altura fixa no topo da área de conteúdo;
  // o conteúdo (membros, atividade) rola logo abaixo.
  const HERO_HEIGHT = 384;

  if (!group) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-10 pb-20 pt-12">
        <header>
          <h3 className="m-0 mb-2 text-(--fg-primary)">
            Equipe não encontrada
          </h3>
          <p className="m-0 max-w-[640px] body-xs text-(--fg-secondary)">
            A equipe que você tentou abrir não existe mais.
          </p>
        </header>
        <div>
          <AwButton asChild size="md" variant="secondary" iconLeft="arrow_back">
            <Link href="/settings/equipe-permissoes/grupos">
              Voltar pra equipes
            </Link>
          </AwButton>
        </div>
      </div>
    );
  }

  const members = groupMemberIds
    .map((mid) => MEMBERS.find((m) => m.id === mid))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  const candidateMembers = MEMBERS.filter(
    (m) => !groupMemberIds.includes(m.id),
  );

  const addMembers = (ids: string[]) => {
    setGroupMemberIds((current) => [
      ...current,
      ...ids.filter((id) => !current.includes(id)),
    ]);
    setAddOpen(false);
  };

  return (
    <>
      {/* Hero imersivo — sem header nem abas: a rota de detalhe da equipe é
          um layout próprio. A capa preenche toda a altura visível e o
          conteúdo (membros, atividade) rola abaixo. */}
      <section
        className="relative w-full overflow-hidden bg-(--bg-muted)"
        style={{ height: HERO_HEIGHT }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${cover})` }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,13,15,0.42) 0%, rgba(13,13,15,0.04) 24%, rgba(13,13,15,0.10) 52%, rgba(13,13,15,0.80) 100%)",
          }}
        />
        <div className="absolute right-5 top-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/settings/equipe-permissoes/grupos")}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[rgba(13,13,15,0.55)] pl-2.5 pr-3.5 text-white backdrop-blur-xs transition-colors duration-aw-fast hover:bg-[rgba(13,13,15,0.75)]"
          >
            <Icon name="arrow_back" size={18} />
            <span className="text-[12.5px] font-medium">Voltar</span>
          </button>
          <CoverEditButton onClick={() => setPickerOpen((v) => !v)} />
          <AwDropdownMenu
            align="end"
            trigger={
              <button
                type="button"
                aria-label="Mais opções da equipe"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(13,13,15,0.55)] text-white backdrop-blur-xs transition-colors hover:bg-[rgba(13,13,15,0.75)]"
              >
                <Icon name="more_vert" size={18} />
              </button>
            }
            items={[
              {
                id: "rename",
                label: "Renomear equipe",
                icon: "edit",
                onSelect: () => setRenameOpen(true),
              },
              {
                id: "icon",
                label: "Alterar ícone e cor",
                icon: "palette",
                onSelect: () => setIconOpen(true),
              },
              {
                id: "cover",
                label: "Personalizar capa",
                icon: "image",
                onSelect: () => setPickerOpen(true),
              },
              { id: "sep", separator: true },
              {
                id: "delete",
                label: "Excluir equipe",
                icon: "delete",
                danger: true,
                onSelect: () => setDeleteOpen(true),
              },
            ]}
          />
        </div>
        <div className="absolute bottom-8 left-8 right-8 flex items-end gap-5">
          <span
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-(--fg-primary) shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
            style={{ background: groupIconColor }}
          >
            <Icon name={groupIcon} size={44} />
          </span>
          <div className="min-w-0">
            <nav
              aria-label="Navegação contextual"
              className="mb-2 flex items-center gap-1 body-xs text-white/70"
            >
              <Link
                href="/settings/equipe-permissoes/grupos"
                className="hover:text-white hover:underline"
              >
                Equipes
              </Link>
              <Icon name="chevron_right" size={14} />
              <span className="text-white">{groupName}</span>
            </nav>
            <h1 className="m-0 text-white">{groupName}</h1>
            <p className="m-0 mt-2 max-w-[640px] body-sm text-white/85">
              {group.description}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-10 pb-20 pt-10">

        {pickerOpen && (
          <div
            ref={(el) =>
              el?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          >
            <CoverPicker
              value={cover}
              onChange={(v) => {
                setCover(v);
                setPickerOpen(false);
              }}
            />
          </div>
        )}

        <AwModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          title="Excluir equipe"
          footer={
            <div className="flex items-center justify-end gap-2">
              <AwButton variant="ghost" onClick={() => setDeleteOpen(false)}>
                Cancelar
              </AwButton>
              <AwButton
                variant="danger"
                iconLeft="delete"
                onClick={() => router.push("/settings/equipe-permissoes/grupos")}
              >
                Excluir equipe
              </AwButton>
            </div>
          }
        >
          <p className="m-0 body-xs text-(--fg-primary)">
            Você está prestes a excluir a equipe{" "}
            <strong className="font-medium">{group.name}</strong>. Essa ação não pode ser desfeita.
          </p>
          <p className="m-0 mt-2 body-xs text-(--fg-secondary)">
            Os membros continuam com acesso individual ao workspace — apenas a equipe será removida.
          </p>
        </AwModal>

        {activityView === "all" ? (
          <ActivityFullView
            events={ACTIVITY_EVENTS}
            onBack={() => setActivityView("summary")}
          />
        ) : (
        <div className="flex flex-col gap-8">
          {/* Members */}
          <section>
            <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h6 className="m-0 mb-1 text-(--fg-primary)">
                  Membros · {members.length}
                </h6>
                <p className="m-0 max-w-[520px] body-xs text-(--fg-secondary)">
                  Pessoas que herdam as permissões dessa equipe automaticamente.
                </p>
              </div>
              <AwButton
                size="sm"
                variant="primary"
                iconLeft="person_add"
                onClick={() => setAddOpen(true)}
              >
                Adicionar membros
              </AwButton>
            </header>

            {members.length === 0 ? (
              <AwCard className="px-5! py-6!">
                <p className="m-0 text-center body-xs text-(--fg-secondary)">
                  Nenhum membro nessa equipe ainda.
                </p>
              </AwCard>
            ) : (
              <AwMembersTable
                columns={[
                  { label: "Pessoa", icon: "person" },
                  { label: "Função" },
                  { label: "", width: 56, align: "right" },
                ]}
              >
                {members.map((m) => (
                  <tr key={m.id}>
                    <AwMembersTablePersonCell
                      name={
                        m.isYou ? (
                          <>
                            {m.name}{" "}
                            <span className="text-(--fg-tertiary)">
                              (você)
                            </span>
                          </>
                        ) : (
                          m.name
                        )
                      }
                      email={m.email}
                      avatarSrc={m.avatar}
                      initials={m.initials}
                    />
                    <AwMembersTableTextCell muted>
                      {m.role}
                    </AwMembersTableTextCell>
                    <td className="text-right">
                      <AwDropdownMenu
                        align="end"
                        trigger={
                          <AwButton
                            size="sm"
                            variant="ghost"
                            iconOnly="more_vert"
                            aria-label={`Ações para ${m.name}`}
                          />
                        }
                        items={[
                          { id: "profile", label: "Ver perfil", icon: "person" },
                          { id: "role", label: "Alterar função", icon: "badge" },
                          { id: "sep", separator: true },
                          {
                            id: "remove",
                            label: "Remover da equipe",
                            icon: "person_remove",
                            danger: true,
                            onSelect: () => setRemoveMember(m),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </AwMembersTable>
            )}
          </section>

          {/* Activity — full width, no card chrome */}
          <section>
            <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h6 className="m-0 mb-1 text-(--fg-primary)">
                  Atividade recente
                </h6>
                <p className="m-0 max-w-[520px] body-xs text-(--fg-secondary)">
                  Eventos mais recentes da equipe — entradas, saídas, mudanças
                  de função e personalizações.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivityView("all")}
                className="body-xs font-medium text-(--fg-secondary) underline decoration-dotted underline-offset-2 transition-colors hover:text-(--fg-primary) hover:no-underline"
              >
                Ver todas as atividades
              </button>
            </header>
            <ActivityTimeline events={ACTIVITY_EVENTS.slice(0, 6)} />
          </section>

          {/* Footer meta — resumo + danger inline */}
          <section className="flex flex-wrap items-center justify-between gap-6 border-t border-(--border-subtle) pt-6">
            <dl className="m-0 flex flex-wrap items-center gap-x-8 gap-y-2 body-xs">
              <div className="flex items-center gap-2">
                <dt className="m-0 text-(--fg-tertiary)">Membros</dt>
                <dd className="m-0 font-medium text-(--fg-primary)">
                  {members.length}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="m-0 text-(--fg-tertiary)">ID</dt>
                <dd className="m-0 mono text-2xs text-(--fg-primary)">
                  {group.id}
                </dd>
              </div>
            </dl>
            <AwButton
              size="sm"
              variant="ghost"
              iconLeft="delete"
              onClick={() => setDeleteOpen(true)}
              className="text-(--accent-danger) hover:bg-(--aw-red-100)!"
            >
              Excluir equipe
            </AwButton>
          </section>
        </div>
        )}
      </div>

      <RenameGroupModal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        initialValue={groupName}
        onSave={(v) => {
          setGroupName(v);
          setRenameOpen(false);
        }}
      />

      <ChangeIconModal
        open={iconOpen}
        onClose={() => setIconOpen(false)}
        currentIcon={groupIcon}
        currentColor={groupIconColor}
        onSelect={(icon, color) => {
          setGroupIcon(icon);
          setGroupIconColor(color);
          setIconOpen(false);
        }}
      />

      <AddMembersToGroupModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        candidates={candidateMembers}
        groupName={groupName}
        onAddExisting={addMembers}
        onInviteNew={() => {
          setAddOpen(false);
          setInviteOpen(true);
        }}
      />

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />

      <AwModal
        open={removeMember !== null}
        onClose={() => setRemoveMember(null)}
        title="Remover da equipe"
        footer={
          <div className="flex items-center justify-end gap-2">
            <AwButton variant="ghost" onClick={() => setRemoveMember(null)}>
              Cancelar
            </AwButton>
            <AwButton
              variant="danger"
              iconLeft="person_remove"
              onClick={() => setRemoveMember(null)}
            >
              Remover
            </AwButton>
          </div>
        }
      >
        {removeMember && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-md border border-(--border-subtle) bg-(--bg-raised) px-3 py-2">
              <AwAvatar
                size="sm"
                src={removeMember.avatar}
                alt={removeMember.name}
                initials={removeMember.initials}
              />
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate body-xs font-medium text-(--fg-primary)">
                  {removeMember.name}
                </p>
                <p className="m-0 truncate body-xs text-(--fg-secondary)">
                  {removeMember.email}
                </p>
              </div>
            </div>
            <p className="m-0 body-xs text-(--fg-primary)">
              Você está prestes a remover{" "}
              <strong className="font-medium">{removeMember.name}</strong> da
              equipe <strong className="font-medium">{groupName}</strong>. O
              acesso individual ao workspace continua intacto — só as
              permissões herdadas via equipe vão embora.
            </p>
          </div>
        )}
      </AwModal>
    </>
  );
}

function CoverEditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Personalizar capa"
      className="group flex h-9 items-center gap-1.5 rounded-full bg-[rgba(13,13,15,0.55)] px-2.5 text-white backdrop-blur-xs transition-[padding,background-color] duration-aw-fast hover:bg-[rgba(13,13,15,0.75)] hover:pl-3 hover:pr-3.5"
    >
      <Icon name="edit" size={18} />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[12.5px] font-medium transition-[max-width,margin] duration-aw-fast group-hover:ml-0.5 group-hover:max-w-[140px]">
        Personalizar capa
      </span>
    </button>
  );
}

function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  return (
    <ol className="relative m-0 flex list-none flex-col gap-4 p-0">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2 left-[15px] top-2 w-px bg-(--border-subtle)"
      />
      {events.map((event) => (
        <li key={event.id} className="m-0 flex items-start gap-4">
          {event.actor ? (
            <AwAvatar
              size="sm"
              src={event.actor.avatar}
              initials={event.actor.initials}
              alt={event.actor.name}
              className="relative z-1 h-8! w-8! shrink-0 ring-2 ring-(--bg-canvas)"
            />
          ) : (
            <span
              aria-hidden="true"
              className="relative z-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--bg-muted) text-(--fg-secondary)"
            >
              <Icon name={activityIcon(event.kind)} size={16} />
            </span>
          )}
          <span className="min-w-0 flex-1 pt-0.5">
            <span className="block body-sm text-(--fg-primary)">
              {event.text}
            </span>
            <span className="mt-0.5 block body-xs text-(--fg-tertiary)">
              {event.actor ? `${event.actor.name} · ${event.when}` : event.when}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function ActivityFullView({
  events,
  onBack,
}: {
  events: ActivityEvent[];
  onBack: () => void;
}) {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<ActivityCategory[]>(ALL_CATEGORIES);
  const [period, setPeriod] = useState<PeriodId>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const maxDays =
      PERIOD_OPTIONS.find((p) => p.id === period)?.maxDays ?? Infinity;
    return events.filter((e) => {
      if (!categories.includes(CATEGORY_OF[e.kind])) return false;
      if (e.daysAgo > maxDays) return false;
      if (!q) return true;
      return (
        e.text.toLowerCase().includes(q) ||
        (e.actor?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [events, query, categories, period]);

  const buckets = useMemo(() => groupByDay(filtered), [filtered]);

  return (
    <section className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 self-start rounded-sm px-2 py-1 body-xs font-medium text-(--fg-secondary) transition-colors duration-aw-fast outline-hidden hover:bg-(--bg-hover) hover:text-(--fg-primary) focus-visible:bg-(--bg-hover)"
      >
        <Icon name="arrow_back" size={14} />
        Voltar para a equipe
      </button>

      <header>
        <h6 className="m-0 mb-1 text-(--fg-primary)">
          Atividade da equipe
        </h6>
        <p className="m-0 max-w-[640px] body-xs text-(--fg-secondary)">
          Linha do tempo completa de tudo que aconteceu nessa equipe — entradas,
          saídas, mudanças de função, permissões e personalizações.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[240px] flex-1">
          <AwInput
            iconLeft="search"
            placeholder="Buscar por pessoa ou evento…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <ActivityCategoryFilter selected={categories} onChange={setCategories} />
        <ActivityPeriodFilter value={period} onChange={setPeriod} />
      </div>

      {buckets.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-(--border-subtle) px-6 py-12 text-center">
          <Icon name="search_off" size={24} className="text-(--fg-tertiary)" />
          <p className="m-0 body-sm font-medium text-(--fg-primary)">
            Nenhum evento corresponde aos filtros
          </p>
          <p className="m-0 body-xs text-(--fg-secondary)">
            Tente outro termo ou amplie o período.
          </p>
        </div>
      ) : (
        <div className="mt-2 flex flex-col gap-8">
          {buckets.map((bucket) => (
            <section key={bucket.id}>
              <header className="mb-4 flex items-baseline justify-between gap-4 border-b border-(--border-subtle) pb-2">
                <h6 className="m-0 text-(--fg-primary)">{bucket.label}</h6>
                <span className="body-xs text-(--fg-tertiary)">
                  {bucket.events.length} evento
                  {bucket.events.length === 1 ? "" : "s"}
                </span>
              </header>
              <ActivityTimeline events={bucket.events} />
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

function ActivityCategoryFilter({
  selected,
  onChange,
}: {
  selected: ActivityCategory[];
  onChange: (v: ActivityCategory[]) => void;
}) {
  const toggle = (c: ActivityCategory) => {
    onChange(
      selected.includes(c)
        ? selected.filter((x) => x !== c)
        : [...selected, c],
    );
  };

  const allSelected = selected.length === ALL_CATEGORIES.length;
  const triggerLabel = allSelected
    ? "Todos os tipos"
    : selected.length === 1
      ? CATEGORY_OPTIONS.find((c) => c.id === selected[0])?.label ?? "Tipos"
      : selected.length === 0
        ? "Nenhum tipo"
        : `Tipos · ${selected.length}`;

  const items: AwDropdownItem[] = [
    {
      id: "all",
      label: "Selecionar todos",
      icon: "done_all",
      closeOnSelect: false,
      onSelect: () => onChange(ALL_CATEGORIES),
      disabled: allSelected,
    },
    { id: "sep", separator: true },
    ...CATEGORY_OPTIONS.map((c) => ({
      id: c.id,
      label: c.label,
      checked: selected.includes(c.id),
      closeOnSelect: false,
      onSelect: () => toggle(c.id),
    })),
  ];

  return (
    <AwDropdownMenu
      align="start"
      aria-label="Filtrar por tipo de evento"
      trigger={<AwSelect>{triggerLabel}</AwSelect>}
      items={items}
    />
  );
}

function ActivityPeriodFilter({
  value,
  onChange,
}: {
  value: PeriodId;
  onChange: (v: PeriodId) => void;
}) {
  const items: AwDropdownItem[] = PERIOD_OPTIONS.map((opt) => ({
    id: opt.id,
    label: opt.label,
    checked: opt.id === value,
    onSelect: () => onChange(opt.id),
  }));

  return (
    <AwDropdownMenu
      align="end"
      aria-label="Selecionar período"
      trigger={
        <AwSelect>
          {PERIOD_OPTIONS.find((p) => p.id === value)?.label ?? "Período"}
        </AwSelect>
      }
      items={items}
    />
  );
}

function RenameGroupModal({
  open,
  onClose,
  initialValue,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initialValue: string;
  onSave: (v: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  React.useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);
  const trimmed = value.trim();
  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Renomear equipe"
      footer={
        <div className="flex items-center justify-end gap-2">
          <AwButton variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton
            variant="primary"
            iconLeft="check"
            disabled={!trimmed}
            onClick={() => onSave(trimmed)}
          >
            Salvar
          </AwButton>
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="rename-group"
          className="aw-eyebrow text-(--fg-tertiary)"
        >
          Nome da equipe
        </label>
        <AwInput
          id="rename-group"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
      </div>
    </AwModal>
  );
}

const ICON_OPTIONS = [
  "groups",
  "support_agent",
  "engineering",
  "diversity_3",
  "handshake",
  "rocket_launch",
  "psychology",
  "campaign",
  "design_services",
  "verified",
  "shield",
  "school",
] as const;

const COLOR_OPTIONS: { id: string; label: string; value: string }[] = [
  { id: "neutral", label: "Neutro", value: "var(--bg-raised)" },
  { id: "blue", label: "Azul", value: "var(--aw-blue-100)" },
  { id: "emerald", label: "Verde", value: "var(--aw-emerald-100)" },
  { id: "amber", label: "Âmbar", value: "var(--aw-amber-100)" },
  { id: "red", label: "Vermelho", value: "var(--aw-red-100)" },
  { id: "purple", label: "Roxo", value: "var(--aw-purple-100)" },
  { id: "pink", label: "Rosa", value: "var(--aw-pink-100)" },
  { id: "teal", label: "Teal", value: "var(--aw-teal-100)" },
  { id: "lime", label: "Lima", value: "var(--aw-lime-100)" },
];

function ChangeIconModal({
  open,
  onClose,
  currentIcon,
  currentColor,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  currentIcon: string;
  currentColor: string;
  onSelect: (icon: string, color: string) => void;
}) {
  const [icon, setIcon] = useState(currentIcon);
  const [color, setColor] = useState(currentColor);

  React.useEffect(() => {
    if (open) {
      setIcon(currentIcon);
      setColor(currentColor);
    }
  }, [open, currentIcon, currentColor]);

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Alterar ícone e cor"
      footer={
        <div className="flex items-center justify-end gap-2">
          <AwButton size="sm" variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton
            size="sm"
            variant="primary"
            iconLeft="check"
            onClick={() => onSelect(icon, color)}
          >
            Aplicar
          </AwButton>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Live preview */}
        <div className="flex items-center justify-center rounded-md border border-(--border-subtle) bg-(--bg-muted) py-6">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full text-(--fg-primary) shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
            style={{ background: color }}
          >
            <Icon name={icon} size={28} />
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <p className="m-0 body-xs font-medium text-(--fg-secondary)">
            Ícone
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {ICON_OPTIONS.map((iconName) => {
              const active = iconName === icon;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  aria-pressed={active}
                  className={
                    "flex aspect-square items-center justify-center rounded-md border transition-colors duration-aw-fast " +
                    (active
                      ? "border-(--fg-primary) bg-(--bg-muted) text-(--fg-primary)"
                      : "border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary) hover:border-(--border-default) hover:text-(--fg-primary)")
                  }
                >
                  <Icon name={iconName} size={22} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="m-0 body-xs font-medium text-(--fg-secondary)">
            Cor
          </p>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => {
              const active = c.value === color;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.value)}
                  aria-pressed={active}
                  title={c.label}
                  className={
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors duration-aw-fast " +
                    (active
                      ? "border-(--fg-primary)"
                      : "border-transparent hover:border-(--border-default)")
                  }
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-(--border-subtle)"
                    style={{ background: c.value }}
                  >
                    {active && <Icon name="check" size={14} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AwModal>
  );
}

function AddMembersToGroupModal({
  open,
  onClose,
  candidates,
  groupName,
  onAddExisting,
  onInviteNew,
}: {
  open: boolean;
  onClose: () => void;
  candidates: Member[];
  groupName: string;
  onAddExisting: (ids: string[]) => void;
  onInviteNew: () => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    if (open) {
      setPicked([]);
      setSearch("");
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q),
    );
  }, [candidates, search]);

  const toggle = (id: string) =>
    setPicked((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title={`Adicionar membros a ${groupName}`}
      footer={
        <div className="flex items-center justify-between gap-2">
          <AwButton
            size="sm"
            variant="ghost"
            iconLeft="mail"
            onClick={onInviteNew}
          >
            Convidar novo membro
          </AwButton>
          <div className="flex items-center gap-2">
            <AwButton size="sm" variant="ghost" onClick={onClose}>
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              iconLeft="person_add"
              disabled={picked.length === 0}
              onClick={() => onAddExisting(picked)}
            >
              Adicionar {picked.length > 0 ? `(${picked.length})` : ""}
            </AwButton>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="m-0 body-xs text-(--fg-secondary)">
          Escolha pessoas da organização ou convide alguém novo. Membros já
          parte da equipe não aparecem na lista.
        </p>
        <AwInput
          iconLeft="search"
          placeholder="Buscar pelo nome ou e-mail…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {candidates.length === 0 ? (
          <p className="m-0 rounded-md border border-(--border-subtle) bg-(--bg-muted) px-3 py-4 text-center body-xs text-(--fg-secondary)">
            Todas as pessoas da organização já estão nessa equipe. Convide
            alguém novo pra adicionar.
          </p>
        ) : (
          <ul className="m-0 max-h-[320px] overflow-y-auto p-0">
            {filtered.length === 0 && (
              <li className="m-0 list-none px-3 py-4 text-center body-xs text-(--fg-tertiary)">
                Nenhuma pessoa encontrada.
              </li>
            )}
            {filtered.map((m) => {
              const on = picked.includes(m.id);
              return (
                <li
                  key={m.id}
                  className="m-0 list-none border-b border-(--border-subtle) last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => toggle(m.id)}
                    aria-pressed={on}
                    className="flex w-full items-center gap-3 px-1 py-2.5 text-left outline-hidden transition-colors duration-aw-fast hover:bg-(--bg-hover) focus-visible:bg-(--bg-hover)"
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
                      </span>
                      <span className="block truncate body-xs text-(--fg-tertiary)">
                        {m.email} · {m.role}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={
                        "flex h-5 w-5 items-center justify-center rounded-sm border transition-colors duration-aw-fast " +
                        (on
                          ? "border-(--fg-primary) bg-(--fg-primary) text-(--bg-raised)"
                          : "border-(--border-default) bg-(--bg-raised)")
                      }
                    >
                      {on && <Icon name="check" size={12} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AwModal>
  );
}

function CoverPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <AwCard>
      <div className="flex flex-col gap-3">
        <div>
          <h6 className="m-0 mb-1 text-(--fg-primary)">
            Escolha uma nova capa
          </h6>
          <p className="m-0 body-xs text-(--fg-secondary)">
            Selecione uma das opções abaixo. A imagem aparece pra todos os
            membros da equipe.
          </p>
        </div>
        <ul className="m-0 grid grid-cols-2 gap-3 p-0 sm:grid-cols-4 md:grid-cols-6">
          {GROUP_BACKGROUNDS.map((bg) => {
            const isActive = bg === value;
            return (
              <li key={bg} className="m-0 list-none">
                <button
                  type="button"
                  onClick={() => onChange(bg)}
                  aria-pressed={isActive}
                  className={[
                    "relative block aspect-3/2 w-full overflow-hidden rounded-md transition-shadow duration-aw-fast",
                    isActive
                      ? "ring-2 ring-(--fg-primary) ring-offset-2 ring-offset-(--bg-raised)"
                      : "hover:ring-1 hover:ring-(--border-default)",
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bg})` }}
                  />
                  {isActive && (
                    <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-(--fg-primary) text-(--bg-raised)">
                      <Icon name="check" size={12} weight={700} />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </AwCard>
  );
}
