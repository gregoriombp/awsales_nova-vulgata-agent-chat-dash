"use client";

import * as React from "react";
import Link from "next/link";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwAvatar, AwAvatarGroup } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwChannelIcon } from "@/components/ui/AwChannelIcon";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwToggle } from "@/components/ui/AwToggle";
import { Icon } from "@/components/ui/Icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SectionHeading, SettingsPageHeader } from "../../_components/shared";

/* ===================================================================== *
 * Dados (mock) — trocar por dados reais da política da organização.
 * ===================================================================== */

/** Domínio do evento — ajuda o admin a escanear a lista por área. */
type EventCategory =
  | "cobranca"
  | "seguranca"
  | "canais"
  | "agentes"
  | "conversas"
  | "equipe"
  | "sistema";

type MandatoryEvent = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: EventCategory;
  /** Renderiza o glyph de marca do WhatsApp no lugar do Material Symbol. */
  channelGlyph?: "whatsapp";
};

const MANDATORY: MandatoryEvent[] = [
  {
    id: "cobranca",
    name: "Falha de cobrança",
    desc: "Fatura não paga — risco de suspender os serviços.",
    icon: "credit_card",
    category: "cobranca",
  },
  {
    id: "waba",
    name: "Número de WhatsApp caiu",
    desc: "Número desconectado ou banido pela Meta — os agentes param de responder.",
    icon: "chat",
    channelGlyph: "whatsapp",
    category: "canais",
  },
  {
    id: "acesso",
    name: "Novo acesso à conta",
    desc: "Login de um dispositivo ou local novo.",
    icon: "login",
    category: "seguranca",
  },
  {
    id: "incidente",
    name: "Incidente de segurança",
    desc: "Vazamento, acesso indevido ou falha de segurança.",
    icon: "gpp_maybe",
    category: "seguranca",
  },
];

type OptionalEvent = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: EventCategory;
  defaultOn: boolean;
};

const OPTIONAL: OptionalEvent[] = [
  {
    id: "aprovacao",
    name: "Aprovação pendente de agente",
    desc: "Um agente espera autorização para executar uma ação.",
    icon: "approval_delegation",
    category: "agentes",
    defaultOn: true,
  },
  {
    id: "desconectado",
    name: "Agente desconectado de um canal",
    desc: "WhatsApp, Instagram ou integração parou de responder.",
    icon: "link_off",
    category: "canais",
    defaultOn: true,
  },
  {
    id: "ferramenta",
    name: "Falha em ferramenta",
    desc: "Uma habilidade retornou erro repetidas vezes.",
    icon: "build",
    category: "agentes",
    defaultOn: true,
  },
  {
    id: "transferida",
    name: "Conversa transferida para você",
    desc: "Um agente ou colega passou um atendimento.",
    icon: "forward_to_inbox",
    category: "conversas",
    defaultOn: false,
  },
  {
    id: "membro",
    name: "Novo membro no workspace",
    desc: "Alguém aceitou um convite e entrou na organização.",
    icon: "person_add",
    category: "equipe",
    defaultOn: false,
  },
  {
    id: "resumo",
    name: "Resumo semanal por e-mail",
    desc: "Performance dos agentes, ações e KPIs da semana.",
    icon: "summarize",
    category: "sistema",
    defaultOn: false,
  },
];

/** Eventos que a organização nunca pode rebaixar para opcional. */
const ALWAYS_MANDATORY = new Set(["cobranca", "waba", "acesso", "incidente"]);

/** As três classes de governança que um evento pode ter. */
type PolicyChoice = "mandatory" | "optional-on" | "optional-off";

/** Metadados mínimos para migrar um evento entre as listas no modal de política. */
type PolicyEvent = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: EventCategory;
  channelGlyph?: "whatsapp";
};

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

// Membros com o papel "Administradores" — usados como pilha de avatares em
// "Quem recebe" das notificações obrigatórias. Reaproveita as faces reais.
const ADMINS = [
  { name: "Felipe Rezende", avatar: "/assets/ui-faces/male-2.jpg" },
  { name: "Ana Cavalcante", avatar: "/assets/ui-faces/female-2.jpg" },
  { name: "Carlos Lima", avatar: "/assets/ui-faces/male-7.jpg" },
  { name: "Mariana Castro", avatar: "/assets/ui-faces/female-3.jpg" },
];

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

/* ===================================================================== *
 * Página
 * ===================================================================== */

export default function OrgNotificacoesPage() {
  // Classe de governança de cada evento (obrigatória vs. opcional). A política
  // pode promover uma opcional a obrigatória ou rebaixar uma obrigatória — por
  // isso as listas vivem no state, não fixas em código.
  const [mandatory, setMandatory] = React.useState<MandatoryEvent[]>(MANDATORY);
  const [optional, setOptional] = React.useState<OptionalEvent[]>(OPTIONAL);
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
  // Evento em edição de política (modal "Editar política").
  const [policyEvent, setPolicyEvent] = React.useState<PolicyEvent | null>(null);

  // Estado atual da política de um evento, derivado das listas.
  const policyOf = React.useCallback(
    (id: string): PolicyChoice => {
      if (mandatory.some((e) => e.id === id)) return "mandatory";
      return optionalDefaults[id] ? "optional-on" : "optional-off";
    },
    [mandatory, optionalDefaults],
  );

  // Aplica a política escolhida no modal, migrando o evento entre as listas.
  const applyPolicy = React.useCallback(
    (meta: PolicyEvent, next: PolicyChoice) => {
      const id = meta.id;
      if (next === "mandatory") {
        setOptional((prev) => prev.filter((e) => e.id !== id));
        setMandatory((prev) =>
          prev.some((e) => e.id === id)
            ? prev
            : [
                ...prev,
                {
                  id: meta.id,
                  name: meta.name,
                  desc: meta.desc,
                  icon: meta.icon,
                  category: meta.category,
                  ...(meta.channelGlyph ? { channelGlyph: meta.channelGlyph } : {}),
                },
              ],
        );
        setRecipients((r) => (r[id] ? r : { ...r, [id]: DEFAULT_RECIPIENT }));
      } else {
        const defaultOn = next === "optional-on";
        setMandatory((prev) => prev.filter((e) => e.id !== id));
        setOptionalDefaults((d) => ({ ...d, [id]: defaultOn }));
        setOptional((prev) => {
          const optionalEvent: OptionalEvent = {
            id: meta.id,
            name: meta.name,
            desc: meta.desc,
            icon: meta.icon,
            category: meta.category,
            defaultOn,
          };
          return prev.some((e) => e.id === id)
            ? prev.map((e) => (e.id === id ? optionalEvent : e))
            : [...prev, optionalEvent];
        });
      }
      setPolicyEvent(null);
    },
    [],
  );

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Notificações da organização"
        description="Defina o que toda a organização sempre recebe e por quais canais. Cada pessoa afina o resto nas próprias preferências."
      />

      {/* Obrigatórias */}
      <section className="mt-12">
        <SectionWithIcon
          icon="lock"
          title="Sempre enviadas"
          description="Eventos críticos que a organização garante. Ninguém desliga — você só escolhe quem recebe."
        />
        <ul className="m-0 list-none divide-y divide-(--border-subtle) p-0">
          {mandatory.map((e) => (
            <MandatoryRow
              key={e.id}
              event={e}
              recipient={recipients[e.id] ?? DEFAULT_RECIPIENT}
              onEditRecipients={() => setRecipientEvent(e)}
              onEditPolicy={() => setPolicyEvent(e)}
            />
          ))}
        </ul>
      </section>

      {/* Opcionais */}
      <section className="mt-12">
        <SectionWithIcon
          icon="tune"
          title="Opcionais"
          description="A organização define o padrão; cada pessoa pode ligar ou desligar nas próprias preferências."
        />
        <p className="mb-4 inline-flex items-start gap-2 px-1 body-xs text-(--fg-tertiary)">
          <Icon name="info" size={14} className="mt-px shrink-0" />
          O padrão vale para novos membros. Quem já ajustou nas próprias
          preferências mantém a escolha.
        </p>
        <ul className="m-0 list-none divide-y divide-(--border-subtle) p-0">
          {optional.map((e) => (
            <OptionalRow
              key={e.id}
              event={e}
              on={optionalDefaults[e.id]}
              onToggle={(v) =>
                setOptionalDefaults((d) => ({ ...d, [e.id]: v }))
              }
              onEditPolicy={() => setPolicyEvent(e)}
            />
          ))}
        </ul>
      </section>

      {/* Canais permitidos */}
      <section className="mt-12">
        <SectionHeading
          title="Canais permitidos"
          description="Os canais que a organização libera. Cada pessoa escolhe entre eles."
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
            note={
              !wabaActive
                ? "Requer um número de WhatsApp conectado"
                : channels.whatsapp
                  ? "Permitido — conforme sua contratação"
                  : undefined
            }
          />
          <ChannelTile
            icon="sms"
            name="SMS"
            on={channels.sms}
            onToggle={(v) => setChannels((c) => ({ ...c, sms: v }))}
            note={channels.sms ? "Permitido — custo por SMS conforme tabela" : undefined}
          />
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          <p className="inline-flex items-center gap-1.5 px-1 body-xs text-(--fg-tertiary)">
            <Icon name="history" size={14} className="shrink-0" />
            Toda mudança de canal fica registrada na auditoria.
            <AwButton
              asChild
              size="sm"
              variant="ghost"
              iconRight="arrow_forward"
              className="-my-1"
            >
              <Link href="/settings/organizacao/auditoria">Ver auditoria</Link>
            </AwButton>
          </p>
        </div>
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

      {/* Modal — editar política (classe de governança) */}
      <EditPolicyModal
        event={policyEvent}
        current={policyEvent ? policyOf(policyEvent.id) : "optional-off"}
        onClose={() => setPolicyEvent(null)}
        onSave={(next) => {
          if (policyEvent) applyPolicy(policyEvent, next);
        }}
      />
    </div>
  );
}

/* ===================================================================== *
 * Cabeçalho de seção com ícone — mesma estrutura de /settings/notificacoes.
 * ===================================================================== */

function SectionWithIcon({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  // Header da seção: tile dark com glifo fill, maior que os tiles dos
  // sub-itens (40px → 44px) pra ficar claro que é o nó pai da hierarquia.
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-(--fg-primary) text-(--bg-canvas)">
        <Icon name={icon} size={22} fill={1} />
      </span>
      <div className="min-w-0">
        <h6 className="m-0 mb-1 text-(--fg-primary)">{title}</h6>
        <p className="m-0 max-w-[520px] body-xs text-(--fg-secondary)">
          {description}
        </p>
      </div>
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
  if (channelGlyph) {
    // WhatsApp: green glyph on a white tile, ringed by the same green.
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-(--aw-emerald-600) bg-(--bg-raised)">
        <AwChannelIcon channel={channelGlyph} size={20} />
      </span>
    );
  }
  // Tile branco com stroke quase imperceptível — Greg pediu cinza bem claro,
  // então cai pra aw-gray-150 (#f9f9f9) ao invés do border-subtle (#f2f2f2)
  // que estava marcando demais.
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-(--aw-gray-150) bg-(--bg-raised) text-(--fg-secondary)">
      <Icon name={icon} size={20} />
    </span>
  );
}

/** Kebab ⋮ que abre o modal de política do evento. */
function PolicyMenu({
  eventName,
  onEditPolicy,
}: {
  eventName: string;
  onEditPolicy: () => void;
}) {
  return (
    <AwDropdownMenu
      aria-label={`Ações de ${eventName}`}
      trigger={
        <AwButton
          variant="ghost"
          size="sm"
          iconOnly="more_vert"
          aria-label={`Mais ações de ${eventName}`}
        />
      }
      items={[
        {
          id: "edit-policy",
          label: "Editar política…",
          icon: "tune",
          onSelect: onEditPolicy,
        },
      ]}
    />
  );
}

function MandatoryRow({
  event,
  recipient,
  onEditRecipients,
  onEditPolicy,
}: {
  event: MandatoryEvent;
  recipient: Recipient;
  onEditRecipients: () => void;
  onEditPolicy: () => void;
}) {
  const showsAdminStack = recipient.roles.includes("Administradores");
  return (
    <li className="m-0 flex items-start gap-4 py-4">
      <EventIcon icon={event.icon} channelGlyph={event.channelGlyph} />
      <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
        {/* Texto descritivo — esquerda */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="m-0 body-sm font-medium text-(--fg-primary)">
              {event.name}
            </p>
            <TooltipProvider delayDuration={120}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    aria-label="Obrigatória"
                    className="inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary) outline-hidden focus-visible:ring-2 focus-visible:ring-(--accent-brand) focus-visible:ring-offset-2"
                  >
                    <Icon name="lock" size={12} />
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-[240px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
                >
                  Notificação obrigatória — a organização garante que chegue.
                  Ninguém desliga; você só escolhe quem recebe.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">{event.desc}</p>
        </div>

        {/* Quem recebe — pilha de avatares dos administradores, à direita */}
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1 body-xs text-(--fg-tertiary)">
            <Icon name="key" size={12} className="text-(--fg-tertiary)" />
            Administradores
          </span>
          <div className="flex items-center gap-1.5">
            {showsAdminStack && (
              <AwAvatarGroup aria-label="Administradores que recebem esta notificação">
                {ADMINS.map((a) => (
                  <AwAvatar
                    key={a.name}
                    size="sm"
                    src={a.avatar}
                    alt={a.name}
                    title={a.name}
                    initials={initials(a.name)}
                    className="ring-2 ring-(--bg-raised)"
                  />
                ))}
              </AwAvatarGroup>
            )}
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
      </div>
      <div className="shrink-0">
        <PolicyMenu eventName={event.name} onEditPolicy={onEditPolicy} />
      </div>
    </li>
  );
}

function OptionalRow({
  event,
  on,
  onToggle,
  onEditPolicy,
}: {
  event: OptionalEvent;
  on: boolean;
  onToggle: (v: boolean) => void;
  onEditPolicy: () => void;
}) {
  return (
    <li className="m-0 flex items-center gap-4 py-4">
      <EventIcon icon={event.icon} />
      <div className="min-w-0 flex-1">
        <p className="m-0 body-sm font-medium text-(--fg-primary)">
          {event.name}
        </p>
        <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">{event.desc}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <AwToggle
          checked={on}
          onChange={onToggle}
          label={`Padrão de ${event.name}`}
        />
        <PolicyMenu eventName={event.name} onEditPolicy={onEditPolicy} />
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
  const active = !!on;
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border px-4 py-4 transition-colors duration-aw-fast",
        // Ativo: tile escuro com texto claro.
        active
          ? "border-(--fg-primary) bg-(--fg-primary)"
          : "border-(--border-subtle) bg-(--bg-raised)",
        disabled && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            active
              ? "bg-(--bg-canvas) text-(--fg-primary)"
              : "bg-(--bg-muted) text-(--fg-secondary)",
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
          <AwCheckbox
            checked={active}
            disabled={disabled}
            onChange={(v) => onToggle?.(v)}
            label={`Canal ${name}`}
            // No tile escuro o checkbox marcado vira claro pra continuar visível.
            className={
              active
                ? "border-(--bg-canvas)! data-[state=checked]:border-(--bg-canvas)! data-[state=checked]:bg-(--bg-canvas)! data-[state=checked]:text-(--fg-primary)!"
                : undefined
            }
          />
        )}
      </div>
      <div>
        <p
          className={cn(
            "m-0 body-sm font-medium",
            active ? "text-(--bg-canvas)" : "text-(--fg-primary)",
          )}
        >
          {name}
        </p>
        <p
          className={cn(
            "m-0 mt-0.5 body-xs",
            active
              ? "text-(--bg-canvas) opacity-70"
              : locked
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
          A notificação continua obrigatória. Você muda{" "}
          <strong className="font-medium text-(--fg-primary)">quem recebe</strong>,
          não se recebe.
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
          <AwAlert variant="warning">
            <p className="m-0 body-xs text-(--fg-secondary)">
              Escolha ao menos uma função ou pessoa — uma obrigatória nunca fica
              sem destinatário.
            </p>
          </AwAlert>
        )}
      </div>
    </AwModal>
  );
}

/* ===================================================================== *
 * Modal — editar política (classe de governança do evento)
 * ===================================================================== */

const POLICY_OPTIONS: {
  value: PolicyChoice;
  icon: string;
  label: string;
  desc: string;
}[] = [
  {
    value: "mandatory",
    icon: "lock",
    label: "Obrigatória",
    desc: "Toda a organização recebe. Ninguém desliga.",
  },
  {
    value: "optional-on",
    icon: "toggle_on",
    label: "Opcional — chega ligada",
    desc: "Cada pessoa recebe por padrão, mas pode desligar.",
  },
  {
    value: "optional-off",
    icon: "toggle_off",
    label: "Opcional — chega desligada",
    desc: "Fica desligada por padrão; quem quiser, liga.",
  },
];

function EditPolicyModal({
  event,
  current,
  onClose,
  onSave,
}: {
  event: PolicyEvent | null;
  current: PolicyChoice;
  onClose: () => void;
  onSave: (next: PolicyChoice) => void;
}) {
  const [choice, setChoice] = React.useState<PolicyChoice>(current);
  // Eventos críticos não podem deixar de ser obrigatórios.
  const locked = event ? ALWAYS_MANDATORY.has(event.id) : false;

  React.useEffect(() => {
    if (event) setChoice(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  const showsInheritance = choice !== "mandatory";

  return (
    <AwModal
      open={event !== null}
      onClose={onClose}
      title={event ? `Editar política — ${event.name}` : undefined}
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton
            size="sm"
            variant="primary"
            disabled={choice === current}
            onClick={() => onSave(choice)}
          >
            Salvar política
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {event && (
          <p className="m-0 body-xs text-(--fg-secondary)">{event.desc}</p>
        )}

        <div
          role="radiogroup"
          aria-label="Classe de governança do evento"
          className="flex flex-col gap-1.5"
        >
          {POLICY_OPTIONS.map((opt) => {
            const selected = choice === opt.value;
            const disabled = locked && opt.value !== "mandatory";
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled}
                onClick={() => setChoice(opt.value)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors duration-aw-fast",
                  selected
                    ? "border-(--accent-brand) bg-(--bg-muted)"
                    : "border-(--border-subtle) bg-(--bg-raised) hover:bg-(--bg-hover)",
                  disabled && "cursor-not-allowed opacity-55 hover:bg-(--bg-raised)",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-aw-fast",
                    selected
                      ? "border-(--accent-brand)"
                      : "border-(--border-default)",
                  )}
                >
                  {selected && (
                    <span className="h-2 w-2 rounded-full bg-(--accent-brand)" />
                  )}
                </span>
                <Icon
                  name={opt.icon}
                  size={18}
                  className="mt-px shrink-0 text-(--fg-secondary)"
                />
                <span className="min-w-0">
                  <span className="block body-sm font-medium text-(--fg-primary)">
                    {opt.label}
                  </span>
                  <span className="block body-xs text-(--fg-secondary)">
                    {opt.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {locked && (
          <p className="m-0 inline-flex items-start gap-2 px-1 body-xs text-(--fg-tertiary)">
            <Icon name="info" size={14} className="mt-px shrink-0" />
            Cobrança, WhatsApp e segurança são sempre obrigatórias.
          </p>
        )}

        {showsInheritance && (
          <AwAlert variant="info">
            <p className="m-0 body-xs text-(--fg-secondary)">
              O padrão vale para novos membros. Quem já ajustou nas próprias
              preferências mantém a escolha.
            </p>
          </AwAlert>
        )}
      </div>
    </AwModal>
  );
}
