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
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { Icon } from "@/components/ui/Icon";
import {
  AwMembersTable,
  AwMembersTablePersonCell,
  AwMembersTableTextCell,
} from "@/components/ui/AwMembersTable";
import { GROUP_BACKGROUNDS, GROUPS, MEMBERS, type Member } from "../../_components/data";
import { TeamTabs } from "../../_components/TeamTabs";

type ActivityKind = "join" | "leave" | "role" | "permission" | "cover" | "rename";
type ActivityEvent = {
  id: string;
  when: string;
  text: string;
  kind: ActivityKind;
};

const ACTIVITY_EVENTS: ActivityEvent[] = [
  { id: "a1", when: "hoje, 09:14", text: "Mariana entrou na equipe", kind: "join" },
  { id: "a2", when: "ontem, 17:02", text: "Função \"Editor\" herdada por novos membros", kind: "role" },
  { id: "a3", when: "ontem, 11:48", text: "Permissão \"Acessar relatórios\" liberada para o grupo", kind: "permission" },
  { id: "a4", when: "2 dias atrás", text: "Capa da equipe atualizada", kind: "cover" },
  { id: "a5", when: "3 dias atrás", text: "Tiago Alves removido da equipe", kind: "leave" },
  { id: "a6", when: "5 dias atrás", text: "Equipe renomeada de \"Atendimento Geral\" para \"Atendimento\"", kind: "rename" },
  { id: "a7", when: "1 semana atrás", text: "Função \"Gerente de Operações\" adicionada ao grupo", kind: "role" },
  { id: "a8", when: "2 semanas atrás", text: "Carlos Lima entrou na equipe", kind: "join" },
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
  const [renameOpen, setRenameOpen] = useState(false);
  const [iconOpen, setIconOpen] = useState(false);
  const [activityView, setActivityView] = useState<"summary" | "all">("summary");
  const [removeMember, setRemoveMember] = useState<Member | null>(null);

  if (!group) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-10 pb-20 pt-12">
        <header>
          <h3 className="m-0 mb-2 text-[var(--fg-primary)]">
            Equipe não encontrada
          </h3>
          <p className="m-0 max-w-[640px] body-xs text-[var(--fg-secondary)]">
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

  const members = group.members
    .map((mid) => MEMBERS.find((m) => m.id === mid))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

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

        {/* Cover */}
        <div className="relative h-[220px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
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
                "linear-gradient(180deg, rgba(13,13,15,0.05) 0%, rgba(13,13,15,0.55) 100%)",
            }}
          />
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <CoverEditButton onClick={() => setPickerOpen((v) => !v)} />
            <AwDropdownMenu
              align="end"
              trigger={
                <button
                  type="button"
                  aria-label="Mais opções da equipe"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(13,13,15,0.55)] text-white backdrop-blur-sm transition-colors hover:bg-[rgba(13,13,15,0.75)]"
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
                  label: "Alterar ícone",
                  icon: "category",
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
          <div className="absolute bottom-5 left-5 flex items-end gap-4">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-raised)] text-[var(--fg-primary)] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
              <Icon name={groupIcon} size={36} />
            </span>
            <div>
              <nav
                aria-label="Navegação contextual"
                className="mb-1.5 flex items-center gap-1 body-xs text-white/70"
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
              <h2 className="m-0 text-white">{groupName}</h2>
              <p className="m-0 mt-1 max-w-[640px] body-xs text-white/80">
                {group.description}
              </p>
            </div>
          </div>
        </div>

        {pickerOpen && (
          <CoverPicker
            value={cover}
            onChange={(v) => {
              setCover(v);
              setPickerOpen(false);
            }}
          />
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
          <p className="m-0 body-xs text-[var(--fg-primary)]">
            Você está prestes a excluir a equipe{" "}
            <strong className="font-medium">{group.name}</strong>. Essa ação não pode ser desfeita.
          </p>
          <p className="m-0 mt-2 body-xs text-[var(--fg-secondary)]">
            Os membros continuam com acesso individual ao workspace — apenas a equipe será removida.
          </p>
        </AwModal>

        {activityView === "all" ? (
          <ActivityFullView
            events={ACTIVITY_EVENTS}
            onBack={() => setActivityView("summary")}
          />
        ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* Members */}
          <section>
            <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h6 className="m-0 mb-1 text-[var(--fg-primary)]">
                  Membros · {members.length}
                </h6>
                <p className="m-0 max-w-[520px] body-xs text-[var(--fg-secondary)]">
                  Pessoas que herdam as permissões dessa equipe automaticamente.
                </p>
              </div>
              <AwButton size="sm" variant="primary" iconLeft="person_add">
                Adicionar membros
              </AwButton>
            </header>

            {members.length === 0 ? (
              <AwCard className="!px-5 !py-6">
                <p className="m-0 text-center body-xs text-[var(--fg-secondary)]">
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
                            <span className="text-[var(--fg-tertiary)]">
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

          {/* Side panel */}
          <aside className="flex flex-col gap-4">
            <AwCard className="!rounded-[var(--radius-xl)]">
              <div className="flex flex-col gap-2">
                <span className="body-md font-semibold text-[var(--fg-primary)]">
                  Resumo
                </span>
                <Stat label="Membros" value={String(members.length)} />
                <Stat label="ID da equipe" value={group.id} mono />
              </div>
            </AwCard>

            <AwCard className="!rounded-[var(--radius-xl)]">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="body-md font-semibold text-[var(--fg-primary)]">
                    Atividade recente
                  </span>
                </div>
                <ActivityTimeline
                  events={ACTIVITY_EVENTS.slice(0, 6)}
                />
                <button
                  type="button"
                  onClick={() => setActivityView("all")}
                  className="self-start body-xs font-medium text-[var(--fg-secondary)] underline decoration-dotted underline-offset-2 transition-colors hover:text-[var(--fg-primary)] hover:no-underline"
                >
                  Ver todas as atividades
                </button>
              </div>
            </AwCard>

            <AwCard className="!rounded-[var(--radius-xl)] !border-[var(--accent-danger)]/30 !bg-[var(--accent-danger)]/5">
              <div className="flex flex-col gap-2">
                <span className="body-md font-semibold text-[var(--fg-primary)]">
                  Excluir equipe
                </span>
                <p className="m-0 body-xs text-[var(--fg-secondary)]">
                  Remove a equipe — os membros continuam com acesso individual.
                </p>
                <div>
                  <AwButton
                    size="sm"
                    variant="danger"
                    iconLeft="delete"
                    onClick={() => setDeleteOpen(true)}
                  >
                    Excluir
                  </AwButton>
                </div>
              </div>
            </AwCard>
          </aside>
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
        current={groupIcon}
        onSelect={(v) => {
          setGroupIcon(v);
          setIconOpen(false);
        }}
      />

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
            <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-3 py-2">
              <AwAvatar
                size="sm"
                src={removeMember.avatar}
                alt={removeMember.name}
                initials={removeMember.initials}
              />
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate body-xs font-medium text-[var(--fg-primary)]">
                  {removeMember.name}
                </p>
                <p className="m-0 truncate body-xs text-[var(--fg-secondary)]">
                  {removeMember.email}
                </p>
              </div>
            </div>
            <p className="m-0 body-xs text-[var(--fg-primary)]">
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
      className="group flex h-9 items-center gap-1.5 rounded-full bg-[rgba(13,13,15,0.55)] px-2.5 text-white backdrop-blur-sm transition-[padding,background-color] duration-aw-fast hover:bg-[rgba(13,13,15,0.75)] hover:pl-3 hover:pr-3.5"
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
    <ol className="relative m-0 flex list-none flex-col gap-3 p-0">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1 left-[11px] top-1 w-px bg-[var(--border-subtle)]"
      />
      {events.map((event) => (
        <li key={event.id} className="m-0 flex items-start gap-3">
          <span
            aria-hidden="true"
            className="relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-raised)] text-[var(--fg-secondary)]"
          >
            <Icon name={activityIcon(event.kind)} size={13} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block body-xs text-[var(--fg-primary)]">
              {event.text}
            </span>
            <span className="block aw-eyebrow text-[var(--fg-tertiary)]">
              {event.when}
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
  return (
    <section className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 self-start rounded-[var(--radius-sm)] px-2 py-1 body-xs font-medium text-[var(--fg-secondary)] transition-colors duration-aw-fast outline-none hover:bg-[var(--bg-hover)] hover:text-[var(--fg-primary)] focus-visible:bg-[var(--bg-hover)]"
      >
        <Icon name="arrow_back" size={14} />
        Voltar para a equipe
      </button>

      <header>
        <h6 className="m-0 mb-1 text-[var(--fg-primary)]">
          Atividade da equipe
        </h6>
        <p className="m-0 max-w-[640px] body-xs text-[var(--fg-secondary)]">
          Linha do tempo completa de tudo que aconteceu nessa equipe — entradas,
          saídas, mudanças de função, permissões e personalizações.
        </p>
      </header>

      <AwCard className="!rounded-[var(--radius-xl)]">
        <ActivityTimeline events={events} />
      </AwCard>
    </section>
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
          className="aw-eyebrow text-[var(--fg-tertiary)]"
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

function ChangeIconModal({
  open,
  onClose,
  current,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  current: string;
  onSelect: (icon: string) => void;
}) {
  return (
    <AwModal open={open} onClose={onClose} title="Alterar ícone">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {ICON_OPTIONS.map((iconName) => {
          const active = iconName === current;
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onSelect(iconName)}
              aria-pressed={active}
              className={
                "flex aspect-square items-center justify-center rounded-[var(--radius-md)] border transition-colors duration-aw-fast " +
                (active
                  ? "border-[var(--fg-primary)] bg-[var(--bg-muted)] text-[var(--fg-primary)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-raised)] text-[var(--fg-secondary)] hover:border-[var(--border-default)] hover:text-[var(--fg-primary)]")
              }
            >
              <Icon name={iconName} size={22} />
            </button>
          );
        })}
      </div>
    </AwModal>
  );
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 body-xs">
      <span className="text-[var(--fg-tertiary)]">{label}</span>
      <span
        className={[
          "font-medium text-[var(--fg-primary)]",
          mono ? "font-mono text-[10px]" : "",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
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
          <h6 className="m-0 mb-1 text-[var(--fg-primary)]">
            Escolha uma nova capa
          </h6>
          <p className="m-0 body-xs text-[var(--fg-secondary)]">
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
                    "relative block aspect-[3/2] w-full overflow-hidden rounded-[var(--radius-md)] transition-shadow duration-aw-fast",
                    isActive
                      ? "ring-2 ring-[var(--fg-primary)] ring-offset-2 ring-offset-[var(--bg-raised)]"
                      : "hover:ring-1 hover:ring-[var(--border-default)]",
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bg})` }}
                  />
                  {isActive && (
                    <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--fg-primary)] text-[var(--bg-raised)]">
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
