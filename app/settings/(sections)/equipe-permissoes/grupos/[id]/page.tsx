"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { Icon } from "@/components/ui/Icon";
import {
  AwMembersTable,
  AwMembersTablePersonCell,
  AwMembersTableTextCell,
} from "@/components/ui/AwMembersTable";
import { GROUP_BACKGROUNDS, GROUPS, MEMBERS } from "../../_components/data";
import { TeamTabs } from "../../_components/TeamTabs";

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const group = useMemo(() => GROUPS.find((g) => g.id === id), [id]);
  const [cover, setCover] = useState<string>(group?.backgroundImage ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);

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
          <div className="absolute right-4 top-4">
            <AwButton
              size="sm"
              variant="primary"
              iconLeft="image"
              onClick={() => setPickerOpen((v) => !v)}
            >
              Personalizar capa
            </AwButton>
          </div>
          <div className="absolute bottom-5 left-5 flex items-end gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-raised)] text-[var(--fg-primary)] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
              <Icon name={group.icon} size={26} />
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
                <span className="text-white">{group.name}</span>
              </nav>
              <h2 className="m-0 text-white">{group.name}</h2>
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
            <AwCard>
              <div className="flex flex-col gap-2">
                <span className="body-sm font-medium text-[var(--fg-primary)]">
                  Resumo
                </span>
                <Stat label="Membros" value={String(members.length)} />
                <Stat
                  label="Funções herdadas"
                  value={String(group.roles.length || "—")}
                />
                <Stat label="ID da equipe" value={group.id} mono />
              </div>
            </AwCard>

            <AwCard>
              <div className="flex flex-col gap-2">
                <span className="body-sm font-medium text-[var(--fg-primary)]">
                  Atividade recente
                </span>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  <ActivityItem
                    when="hoje, 09:14"
                    text="Mariana entrou na equipe"
                  />
                  <ActivityItem
                    when="ontem"
                    text="Função &ldquo;Editor&rdquo; herdada por novos membros"
                  />
                  <ActivityItem
                    when="2 dias atrás"
                    text="Capa da equipe atualizada"
                  />
                </ul>
              </div>
            </AwCard>

            <AwCard className="!border-[var(--accent-danger)]/30 !bg-[var(--accent-danger)]/5">
              <div className="flex flex-col gap-2">
                <span className="body-sm font-medium text-[var(--fg-primary)]">
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
                    onClick={() => {
                      router.push("/settings/equipe-permissoes/grupos");
                    }}
                  >
                    Excluir
                  </AwButton>
                </div>
              </div>
            </AwCard>
          </aside>
        </div>
      </div>
    </>
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

function ActivityItem({ when, text }: { when: string; text: string }) {
  return (
    <li className="m-0 flex items-start gap-2 body-xs">
      <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--fg-tertiary)]" />
      <div className="min-w-0">
        <div className="text-[var(--fg-primary)]">{text}</div>
        <div className="aw-eyebrow text-[var(--fg-tertiary)]">{when}</div>
      </div>
    </li>
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
