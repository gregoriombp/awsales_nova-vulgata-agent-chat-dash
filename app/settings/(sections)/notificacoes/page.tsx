"use client";

import * as React from "react";
import { AwChannelIcon } from "@/components/ui/AwChannelIcon";
import { AwToggle } from "@/components/ui/AwToggle";
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
    icon: "smart_toy",
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

type DeliveryDef = {
  id: string;
  icon?: string;
  channelGlyph?: "whatsapp";
  title: string;
  desc: string;
  orgLocked?: boolean;
  on: boolean;
};

const DELIVERY: DeliveryDef[] = [
  {
    id: "d-app",
    icon: "notifications",
    title: "No app",
    desc: "O sininho aqui no topo e esta página.",
    orgLocked: true,
    on: true,
  },
  {
    id: "d-email",
    icon: "mail",
    title: "E-mail",
    desc: "Enviado pra guilherme@fyntra.com.",
    on: true,
  },
  {
    id: "d-whatsapp",
    channelGlyph: "whatsapp",
    title: "WhatsApp",
    desc: "Alertas no seu número — a org liberou via WABA ativa.",
    on: false,
  },
  {
    id: "d-resumo",
    icon: "summarize",
    title: "Resumo semanal por e-mail",
    desc: "Toda segunda — performance dos agentes, ações e KPIs.",
    on: false,
  },
];

const ENTITY_EXAMPLES: { icon: string; label: string }[] = [
  { icon: "smart_toy", label: "Aria" },
  { icon: "forum", label: "Conversa #1245 — Maria Souza" },
  { icon: "groups", label: "Equipe Comercial" },
];

/* ===================================================================== *
 * Página
 * ===================================================================== */

export default function NotificationsSettingsPage() {
  const [items, setItems] = React.useState<
    Record<string, { on: boolean; channels: ChannelState }>
  >(() =>
    Object.fromEntries(
      SECTIONS.flatMap((s) =>
        s.items.map((it) => [it.id, { on: it.on, channels: it.channels }]),
      ),
    ),
  );
  const [delivery, setDelivery] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(DELIVERY.map((d) => [d.id, d.on])),
  );

  const toggleItem = (id: string, on: boolean) =>
    setItems((s) => ({ ...s, [id]: { ...s[id], on } }));
  const toggleChannel = (id: string, ch: ChannelKey, val: boolean) =>
    setItems((s) => ({
      ...s,
      [id]: { ...s[id], channels: { ...s[id].channels, [ch]: val } },
    }));
  const toggleDelivery = (id: string, on: boolean) =>
    setDelivery((d) => ({ ...d, [id]: on }));

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Notificações"
        description="Escolha o que te interrompe e por onde recebe. O que a organização define vem travado — você ainda afina os canais."
      />

      <div className="mt-10 flex flex-col gap-12">
        {SECTIONS.map((section) => (
          <section key={section.id}>
            <SectionHeader
              icon={section.icon}
              title={section.title}
              desc={section.desc}
            />
            <div className="flex flex-col gap-3">
              {section.items.map((def) => (
                <NotifRow
                  key={def.id}
                  def={def}
                  state={items[def.id]}
                  onToggle={toggleItem}
                  onChannel={toggleChannel}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Canais de entrega — o teto pessoal de por onde recebe */}
        <section className="border-t border-(--border-subtle) pt-10">
          <SectionHeader
            icon="outbox"
            title="Canais de entrega"
            desc="Por onde você quer receber."
          />
          <div className="flex flex-col gap-3">
            {DELIVERY.map((def) => (
              <DeliveryRow
                key={def.id}
                def={def}
                on={delivery[def.id]}
                onToggle={toggleDelivery}
              />
            ))}
          </div>
        </section>

        {/* Alertas por entidade — preview de v2 */}
        <section className="border-t border-(--border-subtle) pt-10">
          <SectionHeader
            icon="track_changes"
            title="Alertas personalizados por entidade"
            desc="Siga uma entidade específica — equipe, agente, conversa ou organização (ex.: me avisa quando o agente converter a 1ª vez), até 20 alvos além do que sua função recebe. Chega na v2."
            trailing={
              <span className="inline-flex items-center rounded-full border border-(--aw-blue-200) bg-(--aw-blue-100) px-2 py-0.5 text-[11px] font-medium text-(--aw-blue-800)">
                Em breve
              </span>
            }
          />
          <div className="flex flex-wrap items-center gap-2 opacity-70">
            {ENTITY_EXAMPLES.map((e) => (
              <span
                key={e.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-(--border-default) bg-(--bg-raised) px-3 py-1.5 body-xs font-medium text-(--fg-tertiary)"
              >
                <Icon name={e.icon} size={14} />
                {e.label}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-(--border-default) px-3 py-1.5 body-xs font-medium text-(--fg-tertiary)">
              <Icon name="add" size={14} />
              Adicionar alvo
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ===================================================================== *
 * Peças
 * ===================================================================== */

function SectionHeader({
  icon,
  title,
  desc,
  trailing,
}: {
  icon: string;
  title: string;
  desc: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary)">
        <Icon name={icon} size={20} />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="m-0 text-base font-semibold text-(--fg-primary)">
            {title}
          </h2>
          {trailing}
        </div>
        <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">{desc}</p>
      </div>
    </div>
  );
}

function OrgBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-(--aw-amber-300) bg-(--aw-amber-100) px-2 py-0.5 text-[11px] font-medium text-(--aw-amber-800)">
      <Icon name="lock" size={11} />
      definido pela organização
    </span>
  );
}

function ChannelChip({
  channel,
  label,
  active,
  onToggle,
}: {
  channel: ChannelKey;
  label: string;
  active: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!active)}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 body-xs font-medium transition-colors duration-aw-fast",
        active
          ? "border-(--aw-emerald-300) bg-(--aw-emerald-100) text-(--aw-emerald-800)"
          : "border-dashed border-(--border-default) bg-transparent text-(--fg-tertiary) hover:border-(--border-strong) hover:text-(--fg-secondary)",
      )}
    >
      {channel === "whatsapp" ? (
        <AwChannelIcon channel="whatsapp" size={13} />
      ) : (
        <Icon name={channel === "app" ? "notifications" : "mail"} size={13} />
      )}
      {label}
    </button>
  );
}

function NotifRow({
  def,
  state,
  onToggle,
  onChannel,
}: {
  def: NotifDef;
  state: { on: boolean; channels: ChannelState };
  onToggle: (id: string, on: boolean) => void;
  onChannel: (id: string, ch: ChannelKey, val: boolean) => void;
}) {
  return (
    <div>
      <div className="rounded-xl border border-(--border-subtle) bg-(--bg-raised) px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="m-0 body-sm font-medium text-(--fg-primary)">
                {def.title}
              </p>
              {def.orgLocked && <OrgBadge />}
            </div>
            <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
              {def.desc}
            </p>
          </div>
          <AwToggle
            checked={state.on}
            disabled={def.orgLocked}
            onChange={(v) => onToggle(def.id, v)}
            label={def.title}
          />
        </div>
      </div>
      {state.on && (
        <div className="mt-2 flex flex-wrap items-center gap-2 pl-1">
          {CHANNELS.map((ch) => (
            <ChannelChip
              key={ch.key}
              channel={ch.key}
              label={ch.label}
              active={state.channels[ch.key]}
              onToggle={(v) => onChannel(def.id, ch.key, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DeliveryRow({
  def,
  on,
  onToggle,
}: {
  def: DeliveryDef;
  on: boolean;
  onToggle: (id: string, on: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-(--border-subtle) bg-(--bg-raised) px-5 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary)">
          {def.channelGlyph ? (
            <AwChannelIcon channel="whatsapp" size={18} />
          ) : (
            <Icon name={def.icon ?? "circle"} size={18} />
          )}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="m-0 body-sm font-medium text-(--fg-primary)">
              {def.title}
            </p>
            {def.orgLocked && <OrgBadge />}
          </div>
          <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">{def.desc}</p>
        </div>
      </div>
      <AwToggle
        checked={on}
        disabled={def.orgLocked}
        onChange={(v) => onToggle(def.id, v)}
        label={def.title}
      />
    </div>
  );
}
