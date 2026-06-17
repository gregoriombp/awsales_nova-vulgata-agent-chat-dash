"use client";

import * as React from "react";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwButton } from "@/components/ui/AwButton";
import { AwChannelIcon } from "@/components/ui/AwChannelIcon";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwToggle } from "@/components/ui/AwToggle";
import { useToast } from "@/components/ui/AwToast";
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
        title: "Número de WhatsApp desconectado",
        desc: "Número desconectado ou banido pela Meta — os agentes param de responder por WhatsApp. Sempre enviado.",
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
        title: "Mensagem urgente sinalizada",
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

/** Organização ativa — o escopo das preferências é por organização. */
const ORG_NAME = "Fyntra";

/** E-mail de destino do usuário (reflexo da conta). */
const USER_EMAIL = "guilherme@fyntra.com";

/** Estado padrão da matriz de canais, derivado de SECTIONS — itens "on"
 * herdam seus canais; os demais nascem com tudo desmarcado. É também o
 * alvo do "Restaurar padrão". */
function defaultChannels(): Record<string, ChannelState> {
  return Object.fromEntries(
    SECTIONS.flatMap((s) =>
      s.items.map((it) => [
        it.id,
        it.on ? it.channels : { app: false, email: false, whatsapp: false },
      ]),
    ),
  );
}

/* ===================================================================== *
 * Página
 * ===================================================================== */

export default function NotificationsSettingsPage() {
  const { push } = useToast();

  // Cada notificação é controlada pelos 3 canais (No app / E-mail / WhatsApp).
  // Itens que nasciam "off" começam com todos os canais desmarcados; os
  // travados pela org mantêm os canais e ficam disabled.
  const [channelsById, setChannelsById] =
    React.useState<Record<string, ChannelState>>(defaultChannels);

  // Preferências globais de canal (teto da entrega, abaixo da matriz).
  const [emailDelivery, setEmailDelivery] = React.useState(true);
  const [whatsappDelivery, setWhatsappDelivery] = React.useState(true);
  const [weeklyDigest, setWeeklyDigest] = React.useState(false);

  const [resetOpen, setResetOpen] = React.useState(false);

  // Toast de "salvo" com coalescing — marcar vários canais em sequência não
  // empilha toasts; um único aviso aparece quando a rajada termina.
  const saveTimer = React.useRef<number | null>(null);
  const notifySaved = React.useCallback(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      push({
        variant: "success",
        icon: "check_circle",
        title: "Preferência salva.",
        duration: 2200,
      });
    }, 450);
  }, [push]);

  React.useEffect(
    () => () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    },
    [],
  );

  const setChannel = (id: string, ch: ChannelKey, val: boolean) => {
    setChannelsById((s) => ({ ...s, [id]: { ...s[id], [ch]: val } }));
    notifySaved();
  };

  const restoreDefaults = () => {
    setChannelsById(defaultChannels());
    setEmailDelivery(true);
    setWhatsappDelivery(true);
    setWeeklyDigest(false);
    setResetOpen(false);
    push({
      variant: "success",
      icon: "restart_alt",
      title: `Preferências restauradas ao padrão de ${ORG_NAME}.`,
      duration: 2600,
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Notificações"
        description="Escolha o que te interrompe e por onde recebe. A organização define o que é obrigatório e o padrão de cada evento — aqui você afina o que é opcional e os canais."
      />

      {/* Banner do modelo híbrido — eco enxuto do conceito da página de org,
       * fechando também o escopo por organização (Fyntra). */}
      <AwAlert variant="info" icon="info" className="mt-1">
        <p className="m-0 body-sm text-(--fg-secondary)">
          A{" "}
          <strong className="font-medium text-(--fg-primary)">
            organização
          </strong>{" "}
          define o que é obrigatório e o padrão de cada evento. Aqui você ajusta
          o que é{" "}
          <strong className="font-medium text-(--fg-primary)">opcional</strong>{" "}
          e por quais canais recebe — itens{" "}
          <strong className="font-medium text-(--fg-primary)">
            Definido pela organização
          </strong>{" "}
          chegam sempre.
        </p>
        <p className="m-0 mt-1.5 body-xs text-(--fg-tertiary)">
          Suas preferências em {ORG_NAME} — cada pessoa configura as suas, por
          organização.
        </p>
      </AwAlert>

      {/* Divisor cinza entre cada tipo de notificação. */}
      <div className="mt-8 flex flex-col divide-y divide-(--border-subtle)">
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

        {/* Canais de entrega — o teto global, abaixo da matriz por evento. */}
        <CollapsibleSection
          icon="send"
          title="Canais de entrega"
          desc="Por onde a plataforma te alcança, no geral. Cada evento acima ainda escolhe entre os canais ligados aqui."
          className="py-8"
          bodyClassName="divide-y divide-(--border-subtle)"
        >
          <DeliveryChannel
            icon="notifications"
            name="No app"
            desc="O sininho no topo e esta página. Sempre ativo."
            locked
          />
          <DeliveryChannel
            icon="mail"
            name="E-mail"
            desc={`Enviado para ${USER_EMAIL}.`}
            on={emailDelivery}
            onToggle={(v) => {
              setEmailDelivery(v);
              notifySaved();
            }}
          />
          <DeliveryChannel
            channelGlyph="whatsapp"
            name="WhatsApp"
            desc="Alertas no seu número, liberado pela organização."
            on={whatsappDelivery}
            onToggle={(v) => {
              setWhatsappDelivery(v);
              notifySaved();
            }}
          />
          <DeliveryChannel
            icon="summarize"
            name="Resumo semanal por e-mail"
            desc="Toda segunda, com o desempenho dos agentes, as ações executadas e os números da semana."
            on={weeklyDigest}
            onToggle={(v) => {
              setWeeklyDigest(v);
              notifySaved();
            }}
          />
        </CollapsibleSection>

        {/* Alertas personalizados por entidade — teaser de v2, inerte. */}
        <EntityAlertsTeaser />
      </div>

      {/* Rodapé — restaurar padrão da org. */}
      <div className="mt-10 flex items-center justify-between gap-4 border-t border-(--border-subtle) pt-6">
        <p className="m-0 max-w-[520px] body-xs text-(--fg-tertiary)">
          Suas escolhas são salvas automaticamente a cada alteração.
        </p>
        <AwButton
          size="sm"
          variant="ghost"
          iconLeft="restart_alt"
          onClick={() => setResetOpen(true)}
        >
          Restaurar padrão
        </AwButton>
      </div>

      {/* Modal — confirmação do reset (ação destrutiva). */}
      <RestoreDefaultsModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={restoreDefaults}
      />
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
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--fg-primary) text-(--bg-canvas)">
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
      {/* Transição suave de altura ao expandir/encolher (grid-rows 0fr↔1fr). */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-aw-fast ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className={cn("mt-4", bodyClassName ?? "flex flex-col gap-3")}>
            {children}
          </div>
        </div>
      </div>
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

/* ===================================================================== *
 * Canais de entrega — teto global da entrega (abaixo da matriz)
 * ===================================================================== */

function DeliveryChannel({
  icon,
  channelGlyph,
  name,
  desc,
  on,
  locked,
  onToggle,
}: {
  icon?: string;
  channelGlyph?: "whatsapp";
  name: string;
  desc: string;
  on?: boolean;
  locked?: boolean;
  onToggle?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary)">
        {channelGlyph ? (
          <AwChannelIcon channel={channelGlyph} size={20} />
        ) : (
          <Icon name={icon ?? "circle"} size={20} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 body-sm font-medium text-(--fg-primary)">{name}</p>
        <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">{desc}</p>
      </div>
      {locked ? (
        <span className="inline-flex shrink-0 items-center gap-1 body-xs font-medium text-(--fg-tertiary)">
          <Icon name="lock" size={13} />
          Sempre ativo
        </span>
      ) : (
        <AwToggle
          checked={!!on}
          onChange={onToggle}
          label={name}
          className="shrink-0"
        />
      )}
    </div>
  );
}

/* ===================================================================== *
 * Alertas personalizados por entidade — teaser de v2 (inerte)
 * ===================================================================== */

const ENTITY_EXAMPLES = [
  { icon: "groups", label: "Equipe Atendimento" },
  { icon: "agent", label: "Agente Aria" },
  { icon: "forum", label: "Conversa #4821" },
  { icon: "apartment", label: "Organização Fyntra" },
];

function EntityAlertsTeaser() {
  return (
    <section className="py-8" aria-label="Alertas personalizados por entidade">
      <div className="flex items-start gap-3 opacity-70">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--fg-primary) text-(--bg-canvas)">
          <Icon name="notifications_active" size={20} animated={false} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 text-base font-semibold text-(--fg-primary)">
              Alertas personalizados por entidade
            </h2>
            <AwPill variant="beta" dot={false}>
              Em breve
            </AwPill>
          </div>
          <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
            Acompanhe uma entidade específica — equipe, agente, conversa ou
            organização — além do que sua função já recebe.
          </p>

          <div className="mt-4 max-w-[460px]">
            <AwInput
              iconLeft="search"
              placeholder="Buscar equipe, agente, conversa ou organização…"
              disabled
              aria-label="Buscar entidade para acompanhar (em breve)"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {ENTITY_EXAMPLES.map((e) => (
              <span
                key={e.label}
                aria-hidden="true"
                className="inline-flex items-center gap-1.5 rounded-full border border-(--border-subtle) bg-(--bg-muted) px-2.5 py-1 body-xs font-medium text-(--fg-tertiary)"
              >
                <Icon name={e.icon} size={13} />
                {e.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================================================================== *
 * Modal — restaurar preferências ao padrão da organização
 * ===================================================================== */

function RestoreDefaultsModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AwModal
      open={open}
      onClose={onClose}
      title={`Restaurar ao padrão de ${ORG_NAME}?`}
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton
            size="sm"
            variant="danger"
            iconLeft="restart_alt"
            onClick={onConfirm}
          >
            Restaurar padrão
          </AwButton>
        </>
      }
    >
      <p className="m-0 body-sm text-(--fg-secondary)">
        Isso devolve todas as suas escolhas opcionais — eventos e canais — ao
        padrão da organização. Os itens obrigatórios não mudam. Essa ação não
        pode ser desfeita.
      </p>
    </AwModal>
  );
}
