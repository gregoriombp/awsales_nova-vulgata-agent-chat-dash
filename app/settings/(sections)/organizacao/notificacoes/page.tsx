"use client";

import * as React from "react";
import Link from "next/link";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwChannelIcon } from "@/components/ui/AwChannelIcon";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwToggle } from "@/components/ui/AwToggle";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { SectionHeading, SettingsPageHeader } from "../../_components/shared";

/* ===================================================================== *
 * Dados (mock) — trocar por dados reais da política da organização.
 * ===================================================================== */

type MandatoryEvent = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  /** Renderiza o glyph de marca do WhatsApp no lugar do Material Symbol. */
  channelGlyph?: "whatsapp";
};

const MANDATORY: MandatoryEvent[] = [
  {
    id: "cobranca",
    name: "Falha de cobrança",
    desc: "Fatura não paga — risco de suspender os serviços.",
    icon: "credit_card",
  },
  {
    id: "waba",
    name: "Número de WhatsApp caiu",
    desc: "Número desconectado ou banido pela Meta — os agentes param de responder.",
    icon: "chat",
    channelGlyph: "whatsapp",
  },
  {
    id: "acesso",
    name: "Novo acesso à conta",
    desc: "Login de um dispositivo ou local novo.",
    icon: "login",
  },
  {
    id: "incidente",
    name: "Incidente de segurança",
    desc: "Vazamento, acesso indevido ou falha de segurança.",
    icon: "gpp_maybe",
  },
];

type OptionalEvent = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  defaultOn: boolean;
};

const OPTIONAL: OptionalEvent[] = [
  {
    id: "aprovacao",
    name: "Aprovação pendente de agente",
    desc: "Um agente espera autorização para executar uma ação.",
    icon: "approval_delegation",
    defaultOn: true,
  },
  {
    id: "desconectado",
    name: "Agente desconectado de um canal",
    desc: "WhatsApp, Instagram ou integração parou de responder.",
    icon: "link_off",
    defaultOn: true,
  },
  {
    id: "ferramenta",
    name: "Falha em ferramenta",
    desc: "Uma habilidade retornou erro repetidas vezes.",
    icon: "build",
    defaultOn: true,
  },
  {
    id: "transferida",
    name: "Conversa transferida para você",
    desc: "Um agente ou colega passou um atendimento.",
    icon: "forward_to_inbox",
    defaultOn: false,
  },
  {
    id: "membro",
    name: "Novo membro no workspace",
    desc: "Alguém aceitou um convite e entrou na organização.",
    icon: "person_add",
    defaultOn: false,
  },
  {
    id: "resumo",
    name: "Resumo semanal por e-mail",
    desc: "Performance dos agentes, ações e KPIs da semana.",
    icon: "summarize",
    defaultOn: false,
  },
];

type Recipient = { roles: string[]; members: string[] };
const DEFAULT_RECIPIENT: Recipient = { roles: ["Administradores"], members: [] };

const ROLES = [
  { label: "Administradores", perms: 24 },
  { label: "Gerente de Operações", perms: 16 },
  { label: "Editor", perms: 9 },
  { label: "Operador de atendimento", perms: 5 },
  { label: "Visualizador", perms: 2 },
];

const MEMBERS = [
  { name: "Felipe Rezende", role: "Administrador", email: "felipe.rezende@fyntra.com", avatar: "/assets/ui-faces/male-2.jpg" },
  { name: "Ana Cavalcante", role: "Gerente de Operações", email: "ana.cavalcante@fyntra.com", avatar: "/assets/ui-faces/female-2.jpg" },
  { name: "Carlos Lima", role: "Editor", email: "carlos.lima@fyntra.com", avatar: "/assets/ui-faces/male-7.jpg" },
  { name: "Mariana Castro", role: "Operadora", email: "mariana.castro@fyntra.com", avatar: "/assets/ui-faces/female-3.jpg" },
];

const INVOICE_RECIPIENTS = [
  { name: "Felipe Rezende", role: "Administrador", avatar: "/assets/ui-faces/male-2.jpg", initials: "FR" },
  { name: "Ana Cavalcante", role: "Gerente de Operações", avatar: "/assets/ui-faces/female-2.jpg", initials: "AC" },
];

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

/* ===================================================================== *
 * Página
 * ===================================================================== */

export default function OrgNotificacoesPage() {
  // Política das opcionais (padrão da org).
  const [optionalDefaults, setOptionalDefaults] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(OPTIONAL.map((e) => [e.id, e.defaultOn])),
  );
  // Destinatários das obrigatórias.
  const [recipients, setRecipients] = React.useState<Record<string, Recipient>>(
    () => Object.fromEntries(MANDATORY.map((e) => [e.id, DEFAULT_RECIPIENT])),
  );
  // Canais permitidos.
  const wabaActive = true;
  const [channels, setChannels] = React.useState({ email: true, whatsapp: true, sms: false });

  const [recipientEvent, setRecipientEvent] = React.useState<MandatoryEvent | null>(null);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Notificações da organização"
        description="Defina o que toda a organização sempre recebe e por quais canais. Cada pessoa afina o resto na própria caixa."
      />

      <GovernanceBand />

      {/* Obrigatórias */}
      <section className="mt-12">
        <SectionHeading
          title="Sempre enviadas"
          description="Eventos críticos que a organização garante. Ninguém desliga — você só escolhe quem recebe."
        />
        <AwCard className="p-0!">
          <ul className="m-0 list-none divide-y divide-(--border-subtle) p-0">
            {MANDATORY.map((e) => (
              <MandatoryRow
                key={e.id}
                event={e}
                recipient={recipients[e.id] ?? DEFAULT_RECIPIENT}
                onEditRecipients={() => setRecipientEvent(e)}
              />
            ))}
          </ul>
        </AwCard>
      </section>

      {/* Opcionais */}
      <section className="mt-12">
        <SectionHeading
          title="Opcionais"
          description="A organização define o padrão; cada pessoa pode ligar ou desligar nas próprias preferências."
        />
        <AwCard className="p-0!">
          <ul className="m-0 list-none divide-y divide-(--border-subtle) p-0">
            {OPTIONAL.map((e) => (
              <OptionalRow
                key={e.id}
                event={e}
                on={optionalDefaults[e.id]}
                onToggle={(v) =>
                  setOptionalDefaults((d) => ({ ...d, [e.id]: v }))
                }
              />
            ))}
          </ul>
        </AwCard>
      </section>

      {/* Canais permitidos */}
      <section className="mt-12">
        <SectionHeading
          title="Canais permitidos"
          description="O teto da entrega: a organização libera os caminhos, e cada pessoa escolhe entre os permitidos."
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ChannelTile
            icon="notifications"
            name="No app"
            locked
            note="Sempre ativo"
          />
          <ChannelTile
            icon="mail"
            name="E-mail"
            on={channels.email}
            onToggle={(v) => setChannels((c) => ({ ...c, email: v }))}
          />
          <ChannelTile
            channelGlyph="whatsapp"
            name="WhatsApp"
            on={wabaActive && channels.whatsapp}
            disabled={!wabaActive}
            onToggle={(v) => setChannels((c) => ({ ...c, whatsapp: v }))}
            note={!wabaActive ? "Requer WABA ativa" : undefined}
          />
          <ChannelTile
            icon="sms"
            name="SMS"
            on={channels.sms}
            onToggle={(v) => setChannels((c) => ({ ...c, sms: v }))}
          />
        </div>
        <p className="mt-3 inline-flex items-start gap-2 px-1 body-xs text-(--fg-tertiary)">
          <Icon name="info" size={14} className="mt-px shrink-0" />
          Bloquear um canal não afeta cobrança, WhatsApp e segurança — elas
          sempre chegam pelo app e e-mail.
        </p>
      </section>

      {/* Faturas & NF — reflexo read-only */}
      <section className="mt-12">
        <AwCard className="p-0!">
          <div className="flex flex-wrap items-center gap-4 px-6 py-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary)">
              <Icon name="receipt_long" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 body-sm font-medium text-(--fg-primary)">
                Faturas e notas fiscais
              </p>
              <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                Quem recebe é definido no perfil de cada pessoa. Aqui é só o
                reflexo.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {INVOICE_RECIPIENTS.map((m) => (
                  <AwAvatar
                    key={m.name}
                    size="sm"
                    src={m.avatar}
                    alt={m.name}
                    initials={m.initials}
                    className="ring-2 ring-(--bg-raised)"
                  />
                ))}
              </div>
              <span className="body-xs text-(--fg-tertiary)">
                {INVOICE_RECIPIENTS.length} recebem
              </span>
              <AwButton asChild size="sm" variant="ghost" iconRight="arrow_forward">
                <Link href="/settings/equipe-permissoes">Gerenciar</Link>
              </AwButton>
            </div>
          </div>
        </AwCard>
      </section>

      {/* Modal — quem recebe */}
      <RecipientsModal
        event={recipientEvent}
        value={recipientEvent ? recipients[recipientEvent.id] ?? DEFAULT_RECIPIENT : DEFAULT_RECIPIENT}
        onClose={() => setRecipientEvent(null)}
        onSave={(next) => {
          if (recipientEvent) {
            setRecipients((r) => ({ ...r, [recipientEvent.id]: next }));
          }
          setRecipientEvent(null);
        }}
      />
    </div>
  );
}

/* ===================================================================== *
 * Faixa-conceito — o modelo híbrido, visual em vez de parágrafo.
 * ===================================================================== */

const CONCEPT = [
  {
    icon: "lock",
    title: "Obrigatórias",
    desc: "A organização garante que cheguem.",
  },
  {
    icon: "tune",
    title: "Opcionais",
    desc: "A org sugere o padrão; a pessoa ajusta.",
  },
  {
    icon: "send",
    title: "Canais",
    desc: "A org libera por onde a entrega acontece.",
  },
];

function GovernanceBand() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {CONCEPT.map((c, i) => (
        <div
          key={c.title}
          className="relative flex items-start gap-3 rounded-xl border border-(--border-subtle) bg-(--bg-raised) px-4 py-3.5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--bg-inverse) text-(--fg-on-inverse)">
            <Icon name={c.icon} size={18} />
          </span>
          <div className="min-w-0">
            <p className="m-0 body-sm font-medium text-(--fg-primary)">
              {c.title}
            </p>
            <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">{c.desc}</p>
          </div>
          {i < CONCEPT.length - 1 && (
            <Icon
              name="chevron_right"
              size={18}
              aria-hidden="true"
              className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 text-(--fg-tertiary) sm:block"
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ===================================================================== *
 * Linhas de evento
 * ===================================================================== */

function EventIcon({
  icon,
  channelGlyph,
}: {
  icon: string;
  channelGlyph?: "whatsapp";
}) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary)">
      {channelGlyph ? (
        <AwChannelIcon channel={channelGlyph} size={20} />
      ) : (
        <Icon name={icon} size={20} />
      )}
    </span>
  );
}

function MandatoryRow({
  event,
  recipient,
  onEditRecipients,
}: {
  event: MandatoryEvent;
  recipient: Recipient;
  onEditRecipients: () => void;
}) {
  return (
    <li className="m-0 flex items-start gap-4 px-6 py-4">
      <EventIcon icon={event.icon} channelGlyph={event.channelGlyph} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="m-0 body-sm font-medium text-(--fg-primary)">
            {event.name}
          </p>
          <span className="inline-flex items-center gap-1 rounded-full border border-(--border-subtle) bg-(--bg-muted) px-2 py-0.5 body-xs font-medium text-(--fg-secondary)">
            <Icon name="lock" size={12} />
            Obrigatória
          </span>
        </div>
        <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">{event.desc}</p>

        {/* Quem recebe — chips de funções + avatares de membros */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="body-xs text-(--fg-tertiary)">Quem recebe:</span>
          {recipient.roles.map((r) => (
            <span
              key={r}
              className="inline-flex items-center gap-1 rounded-full border border-(--border-subtle) bg-(--bg-raised) px-2 py-0.5 body-xs font-medium text-(--fg-secondary)"
            >
              <Icon name="key" size={12} className="text-(--fg-tertiary)" />
              {r}
            </span>
          ))}
          {recipient.members.map((m) => (
            <span
              key={m}
              className="inline-flex items-center gap-1.5 rounded-full border border-(--border-subtle) bg-(--bg-raised) py-0.5 pl-0.5 pr-2 body-xs font-medium text-(--fg-secondary)"
            >
              <AwAvatar size="sm" alt={m} initials={initials(m)} className="h-4! w-4!" />
              {m.split(" ")[0]}
            </span>
          ))}
          <button
            type="button"
            onClick={onEditRecipients}
            className="rounded-md px-1.5 py-0.5 body-xs font-medium text-(--accent-brand) underline-offset-2 transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:underline"
          >
            Editar
          </button>
        </div>
      </div>
    </li>
  );
}

function OptionalRow({
  event,
  on,
  onToggle,
}: {
  event: OptionalEvent;
  on: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <li className="m-0 flex items-center gap-4 px-6 py-4">
      <EventIcon icon={event.icon} />
      <div className="min-w-0 flex-1">
        <p className="m-0 body-sm font-medium text-(--fg-primary)">
          {event.name}
        </p>
        <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">{event.desc}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="body-xs text-(--fg-tertiary)">
          Padrão: {on ? "ligado" : "desligado"}
        </span>
        <AwToggle
          checked={on}
          onChange={onToggle}
          label={`Padrão de ${event.name}`}
        />
      </div>
    </li>
  );
}

/* ===================================================================== *
 * Tiles de canal
 * ===================================================================== */

function ChannelTile({
  icon,
  channelGlyph,
  name,
  on,
  locked,
  disabled,
  note,
  onToggle,
}: {
  icon?: string;
  channelGlyph?: "whatsapp";
  name: string;
  on?: boolean;
  locked?: boolean;
  disabled?: boolean;
  note?: string;
  onToggle?: (v: boolean) => void;
}) {
  const blocked = !locked && !disabled && on === false;
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-(--bg-raised) px-4 py-4 transition-colors duration-aw-fast",
        on || locked
          ? "border-(--border-default)"
          : "border-(--border-subtle)",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            on || locked
              ? "bg-(--bg-muted) text-(--fg-primary)"
              : "bg-(--bg-muted) text-(--fg-tertiary)",
          )}
        >
          {channelGlyph ? (
            <AwChannelIcon channel={channelGlyph} size={22} />
          ) : (
            <Icon name={icon ?? "circle"} size={22} />
          )}
        </span>
        {locked ? (
          <Icon name="lock" size={16} className="mt-1 text-(--fg-tertiary)" />
        ) : (
          <AwToggle
            checked={!!on}
            disabled={disabled}
            onChange={(v) => onToggle?.(v)}
            label={`Canal ${name}`}
          />
        )}
      </div>
      <div>
        <p className="m-0 body-sm font-medium text-(--fg-primary)">{name}</p>
        <p
          className={cn(
            "m-0 mt-0.5 body-xs",
            locked
              ? "text-(--fg-tertiary)"
              : blocked
                ? "text-(--fg-tertiary)"
                : "text-(--fg-secondary)",
          )}
        >
          {note ?? (locked ? "Sempre ativo" : on ? "Permitido" : "Bloqueado")}
        </p>
      </div>
    </div>
  );
}

/* ===================================================================== *
 * Modal — quem recebe (destinatários da obrigatória)
 * ===================================================================== */

function RecipientsModal({
  event,
  value,
  onClose,
  onSave,
}: {
  event: MandatoryEvent | null;
  value: Recipient;
  onClose: () => void;
  onSave: (next: Recipient) => void;
}) {
  const [roles, setRoles] = React.useState<string[]>(value.roles);
  const [members, setMembers] = React.useState<string[]>(value.members);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (event) {
      setRoles(value.roles);
      setMembers(value.members);
      setQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  const toggle = (list: string[], set: (v: string[]) => void, item: string) =>
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const total = roles.length + members.length;
  const filtered = MEMBERS.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.email.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AwModal
      open={event !== null}
      onClose={onClose}
      title={event ? `Quem recebe — ${event.name}` : undefined}
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton
            size="sm"
            variant="primary"
            disabled={total === 0}
            onClick={() => onSave({ roles, members })}
          >
            Salvar destinatários
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <p className="m-0 body-xs text-(--fg-secondary)">
          A notificação continua obrigatória para quem recebe — você muda o{" "}
          <strong className="font-medium text-(--fg-primary)">para quem</strong>,
          não o se.
        </p>

        <div>
          <p className="m-0 mb-1 body-xs font-medium text-(--fg-primary)">
            Por função
          </p>
          <p className="m-0 mb-2 body-xs text-(--fg-tertiary)">
            Inclui todos os membros da função, hoje e no futuro.
          </p>
          <div className="flex flex-col gap-px">
            {ROLES.map((r) => (
              <label
                key={r.label}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors duration-aw-fast hover:bg-(--bg-hover)"
              >
                <AwCheckbox
                  checked={roles.includes(r.label)}
                  onChange={() => toggle(roles, setRoles, r.label)}
                  label={r.label}
                />
                <span className="body-sm text-(--fg-primary)">{r.label}</span>
                <span className="ml-auto body-xs text-(--fg-tertiary)">
                  {r.perms} permissões
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-(--border-subtle) pt-4">
          <p className="m-0 mb-2 body-xs font-medium text-(--fg-primary)">
            Por pessoa
          </p>
          <AwInput
            iconLeft="search"
            placeholder="Buscar por nome ou e-mail…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="mt-2 flex max-h-[220px] flex-col gap-px overflow-y-auto">
            {filtered.map((m) => (
              <label
                key={m.email}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors duration-aw-fast hover:bg-(--bg-hover)"
              >
                <AwCheckbox
                  checked={members.includes(m.name)}
                  onChange={() => toggle(members, setMembers, m.name)}
                  label={m.name}
                />
                <AwAvatar size="sm" src={m.avatar} alt={m.name} initials={initials(m.name)} />
                <span className="min-w-0">
                  <span className="block truncate body-sm text-(--fg-primary)">
                    {m.name}
                  </span>
                  <span className="block truncate body-xs text-(--fg-tertiary)">
                    {m.role} · {m.email}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {total === 0 && (
          <div className="flex items-start gap-2.5 rounded-md border border-(--aw-amber-300) bg-(--aw-amber-100) px-3 py-2.5">
            <Icon name="warning" size={15} className="mt-px shrink-0 text-(--aw-amber-700)" />
            <p className="m-0 body-xs text-(--aw-amber-800)">
              Escolha ao menos uma função ou pessoa — uma obrigatória nunca fica
              sem destinatário.
            </p>
          </div>
        )}
      </div>
    </AwModal>
  );
}
