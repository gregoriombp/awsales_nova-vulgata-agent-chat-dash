"use client";

import * as React from "react";
import { AwChannelIcon } from "@/components/ui/AwChannelIcon";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { SettingsPageHeader } from "../_components/shared";

/* ===================================================================== *
 * Página de notificações DO USUÁRIO. A política da organização (quem
 * sempre recebe, canais permitidos) mora em /settings/organizacao/notificacoes;
 * aqui o usuário afina o que o atinge e por quais canais. Itens marcados
 * "definido pela organização" vêm travados (sempre enviados).
 * ===================================================================== */

type ChannelKey = "app" | "email" | "whatsapp";
type ChannelState = Record<ChannelKey, boolean>;

const CHANNELS: { key: ChannelKey; label: string }[] = [
  { key: "app", label: "No app" },
  { key: "email", label: "E-mail" },
  { key: "whatsapp", label: "WhatsApp" },
];

type NotifDef = {
  id: string;
  title: string;
  desc: string;
  /** Travada pela organização — sempre enviada, o usuário não desliga. */
  orgLocked?: boolean;
  on: boolean;
  channels: ChannelState;
};

type SectionDef = {
  id: string;
  icon: string;
  title: string;
  desc: string;
  items: NotifDef[];
};

const SECTIONS: SectionDef[] = [
  {
    id: "agentes",
    icon: "agent",
    title: "Agentes",
    desc: "Quando seus agentes de IA pedem atenção.",
    items: [
      {
        id: "waba",
        title: "Número de WhatsApp caiu (WABA)",
        desc: "Número desconectado ou banido pela Meta — os agentes param de responder. Sempre enviado.",
        orgLocked: true,
        on: true,
        channels: { app: true, email: true, whatsapp: true },
      },
      {
        id: "aprovacao",
        title: "Aprovação pendente",
        desc: "Quando um agente solicita autorização pra executar uma ação.",
        on: true,
        channels: { app: true, email: false, whatsapp: true },
      },
      {
        id: "desconectado",
        title: "Agente desconectado de um canal",
        desc: "WhatsApp, Instagram ou integrações que pararam de responder.",
        on: true,
        channels: { app: true, email: true, whatsapp: true },
      },
      {
        id: "ferramenta",
        title: "Falha em ferramenta",
        desc: "Uma habilidade retornou erro mais de 3 vezes em 1 hora.",
        on: true,
        channels: { app: true, email: true, whatsapp: false },
      },
      {
        id: "treinou",
        title: "Agente terminou de treinar",
        desc: "Base de conhecimento reindexada — o agente já responde com o conteúdo novo.",
        on: false,
        channels: { app: true, email: false, whatsapp: false },
      },
    ],
  },
  {
    id: "conversas",
    icon: "forum",
    title: "Conversas",
    desc: "Atividade nas conversas que te envolvem.",
    items: [
      {
        id: "urgente",
        title: "Mensagem urgente flagada",
        desc: "Cliente pediu humano, mencionou cancelamento ou usou linguagem sensível.",
        on: true,
        channels: { app: true, email: false, whatsapp: true },
      },
      {
        id: "transferida",
        title: "Conversa transferida para mim",
        desc: "Um agente ou colega passou um atendimento pra você.",
        on: false,
        channels: { app: true, email: false, whatsapp: false },
      },
    ],
  },
  {
    id: "equipe",
    icon: "groups",
    title: "Equipe",
    desc: "Movimentações de pessoas no workspace.",
    items: [
      {
        id: "mencoes",
        title: "Menções",
        desc: "Quando um colega te marca numa conversa ou aprovação.",
        on: true,
        channels: { app: true, email: true, whatsapp: false },
      },
      {
        id: "membro",
        title: "Novo membro no workspace",
        desc: "Alguém aceitou um convite e entrou na organização.",
        on: false,
        channels: { app: true, email: false, whatsapp: false },
      },
      {
        id: "convite",
        title: "Convite pendente expira",
        desc: "Um convite enviado está perto de vencer sem ser aceito.",
        on: false,
        channels: { app: true, email: false, whatsapp: false },
      },
    ],
  },
  {
    id: "cobranca",
    icon: "account_balance_wallet",
    title: "Cobrança & conta",
    desc: "Faturas, saldo e acessos à sua conta.",
    items: [
      {
        id: "falha-cobranca",
        title: "Falha de cobrança",
        desc: "Uma fatura não foi paga. Sempre enviado — não dá pra desligar.",
        orgLocked: true,
        on: true,
        channels: { app: true, email: true, whatsapp: true },
      },
      {
        id: "saldo",
        title: "Saldo / voucher baixo",
        desc: "Créditos perto de acabar ou consumo acima do previsto.",
        on: true,
        channels: { app: true, email: true, whatsapp: false },
      },
      {
        id: "acesso",
        title: "Novo acesso à sua conta",
        desc: "Login de um dispositivo ou local novo. Sempre enviado.",
        orgLocked: true,
        on: true,
        channels: { app: true, email: true, whatsapp: false },
      },
    ],
  },
  {
    id: "sistema",
    icon: "settings",
    title: "Sistema",
    desc: "Avisos da plataforma que afetam toda a operação.",
    items: [
      {
        id: "manutencao",
        title: "Manutenção programada",
        desc: "Janelas de indisponibilidade planejada de relatórios ou serviços.",
        on: true,
        channels: { app: true, email: true, whatsapp: false },
      },
      {
        id: "novidades",
        title: "Novidades do produto",
        desc: "Recursos novos e mudanças relevantes na plataforma.",
        on: false,
        channels: { app: true, email: false, whatsapp: false },
      },
    ],
  },
];

/* ===================================================================== *
 * Página
 * ===================================================================== */

export default function NotificationsSettingsPage() {
  // Cada notificação é controlada pelos 3 canais (No app / E-mail / WhatsApp).
  // Itens que nasciam "off" começam com todos os canais desmarcados; os
  // travados pela org mantêm os canais e ficam disabled.
  const [channelsById, setChannelsById] = React.useState<
    Record<string, ChannelState>
  >(() =>
    Object.fromEntries(
      SECTIONS.flatMap((s) =>
        s.items.map((it) => [
          it.id,
          it.on ? it.channels : { app: false, email: false, whatsapp: false },
        ]),
      ),
    ),
  );

  const setChannel = (id: string, ch: ChannelKey, val: boolean) =>
    setChannelsById((s) => ({ ...s, [id]: { ...s[id], [ch]: val } }));

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Notificações"
        description="Escolha o que te interrompe e por onde recebe. O que a organização define vem travado — você ainda afina os canais."
      />

      {/* Divisor cinza entre cada tipo de notificação. */}
      <div className="mt-10 flex flex-col divide-y divide-(--border-subtle)">
        {SECTIONS.map((section) => (
          <CollapsibleSection
            key={section.id}
            icon={section.icon}
            title={section.title}
            desc={section.desc}
            className="py-8 first:pt-0"
            bodyClassName="divide-y divide-(--border-subtle)"
          >
            {section.items.map((def) => (
              <NotifRow
                key={def.id}
                def={def}
                channels={channelsById[def.id]}
                onChannel={setChannel}
              />
            ))}
          </CollapsibleSection>
        ))}
      </div>
    </div>
  );
}

/* ===================================================================== *
 * Peças
 * ===================================================================== */

function CollapsibleSection({
  icon,
  leading,
  title,
  desc,
  trailing,
  defaultOpen = true,
  className,
  bodyClassName,
  children,
}: {
  icon?: string;
  leading?: React.ReactNode;
  title: string;
  desc: string;
  trailing?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <section className={className}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group flex w-full items-start gap-3 text-left"
      >
        {leading ?? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary)">
            <Icon name={icon ?? "circle"} size={20} animated={false} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 text-base font-semibold text-(--fg-primary)">
              {title}
            </h2>
            {trailing}
          </div>
          <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">{desc}</p>
        </div>
        <span
          className={cn(
            "mt-1 shrink-0 text-(--fg-tertiary) transition-transform duration-aw-fast group-hover:text-(--fg-secondary)",
            open && "rotate-180",
          )}
        >
          <Icon name="expand_more" size={20} />
        </span>
      </button>
      {open && (
        <div className={cn("mt-4", bodyClassName ?? "flex flex-col gap-3")}>
          {children}
        </div>
      )}
    </section>
  );
}

function OrgBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-(--aw-amber-100) px-2 py-0.5 text-[11px] font-medium text-(--aw-amber-800)">
      <Icon name="lock" size={11} />
      Definido pela organização
    </span>
  );
}

function ChannelCheckbox({
  def,
  channel,
  label,
  checked,
  onChannel,
}: {
  def: NotifDef;
  channel: ChannelKey;
  label: string;
  checked: boolean;
  onChannel: (id: string, ch: ChannelKey, val: boolean) => void;
}) {
  const id = `${def.id}-${channel}`;
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-2 select-none",
        def.orgLocked ? "cursor-not-allowed" : "cursor-pointer",
      )}
    >
      <AwCheckbox
        id={id}
        checked={checked}
        disabled={def.orgLocked}
        onChange={(v) => onChannel(def.id, channel, v)}
        label={`${def.title} — ${label}`}
      />
      <span className="inline-flex items-center gap-1.5 body-xs font-medium text-(--fg-secondary)">
        {channel === "whatsapp" ? (
          <AwChannelIcon channel="whatsapp" size={13} />
        ) : (
          <Icon name={channel === "app" ? "notifications" : "mail"} size={13} />
        )}
        {label}
      </span>
    </label>
  );
}

function NotifRow({
  def,
  channels,
  onChannel,
}: {
  def: NotifDef;
  channels: ChannelState;
  onChannel: (id: string, ch: ChannelKey, val: boolean) => void;
}) {
  return (
    // Linha plana (sem card/radius) — separada das vizinhas por divisor.
    <div className="flex items-start justify-between gap-6 py-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="m-0 body-sm font-medium text-(--fg-primary)">
            {def.title}
          </p>
          {def.orgLocked && <OrgBadge />}
        </div>
        {/* Texto explicativo: esclarece a função desta notificação. */}
        <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">{def.desc}</p>
      </div>

      {/* Canais à direita — um checkbox por canal, travados ficam disabled. */}
      <div className="flex shrink-0 items-center gap-x-5">
        {CHANNELS.map((ch) => (
          <ChannelCheckbox
            key={ch.key}
            def={def}
            channel={ch.key}
            label={ch.label}
            checked={channels[ch.key]}
            onChannel={onChannel}
          />
        ))}
      </div>
    </div>
  );
}
