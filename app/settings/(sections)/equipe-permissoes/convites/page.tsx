"use client";

import { useMemo, useState } from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwInput } from "@/components/ui/AwInput";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { INVITATIONS } from "../_components/data";
import { InviteModal } from "../_components/InviteModal";
import { TeamTabs } from "../_components/TeamTabs";

export default function InvitationsPage() {
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return INVITATIONS;
    return INVITATIONS.filter(
      (i) =>
        i.email.toLowerCase().includes(q) ||
        i.role.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-10 pb-20 pt-12">
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

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="w-full max-w-[320px]">
            <AwInput
              iconLeft="search"
              placeholder="Buscar convites…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <AwButton size="sm" variant="secondary" iconLeft="download">
              Exportar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              iconLeft="person_add"
              onClick={() => setInviteOpen(true)}
            >
              Adicionar membro
            </AwButton>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-12">
            <AwEmpty>
              <AwEmptyHeader>
                <AwEmptyMedia variant="icon">
                  <Icon name="mail" size={20} />
                </AwEmptyMedia>
                <AwEmptyTitle>Nenhum convite pendente</AwEmptyTitle>
                <AwEmptyDescription>
                  Quando você convidar alguém, o convite aparece aqui até ser
                  aceito.
                </AwEmptyDescription>
              </AwEmptyHeader>
            </AwEmpty>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((i) => (
              <li
                key={i.id}
                className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-4 py-3"
              >
                <AwAvatar
                  size="md"
                  alt={i.email}
                  initials={i.initials.toUpperCase()}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="m-0 truncate text-[13.5px] font-medium text-[var(--fg-primary)]">
                      {i.email}
                    </p>
                    <AwPill variant="neutral" dot={false}>
                      {i.role}
                    </AwPill>
                    <AwPill variant="draft" dot>
                      Pendente
                    </AwPill>
                  </div>
                  <p className="m-0 truncate text-[12px] text-[var(--fg-secondary)]">
                    Enviado {i.sentAt}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <AwButton size="sm" variant="secondary" iconLeft="send">
                    Reenviar
                  </AwButton>
                  <AwButton size="sm" variant="ghost" iconLeft="close">
                    Remover
                  </AwButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
