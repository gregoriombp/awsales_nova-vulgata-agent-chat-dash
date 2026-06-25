"use client";

import * as React from "react";
import Link from "next/link";
import { AwButton } from "@/components/ui/AwButton";
import { AwChannelIcon } from "@/components/ui/AwChannelIcon";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwModal } from "@/components/ui/AwModal";
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

/* Canais mostrados na MATRIZ por linha. "No app" fica de fora: é sempre on e o
 * card "No app · Sempre ativo" no topo é a única fonte de verdade — assim a
 * linha não contradiz o cadeado do card. */
const MATRIX_CHANNELS = CHANNELS.filter((c) => c.key !== "app");

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

  /** Liga ou desliga um canal global (teto da entrega). Desligar NÃO apaga as
   *  escolhas por linha — apenas MASCARA: os checkboxes daquele canal ficam
   *  inativos, mas o estado é preservado e volta intacto ao religar. (Antes
   *  zerava channelsById e o usuário perdia toda a configuração num clique.) */
  const setGlobalChannel = (ch: ChannelKey, val: boolean) => {
    if (ch === "app") return; // No app é sempre on (locked).
    if (ch === "email") setEmailDelivery(val);
    if (ch === "whatsapp") setWhatsappDelivery(val);
    notifySaved();
  };

  /** "Marcar todos / Desmarcar todos" — só toca eventos não-locked da seção.
   *  Grava a intenção do usuário direto, sem filtrar por canal global: se um
   *  canal estiver desligado no topo, o estado fica guardado e só aparece
   *  mascarado até religar. "No app" segue sempre ligado. */
  const setAllInSection = (sectionId: string, val: boolean) => {
    const section = SECTIONS.find((s) => s.id === sectionId);
    if (!section) return;
    setChannelsById((s) => {
      const next = { ...s };
      for (const it of section.items) {
        if (it.orgLocked) continue;
        next[it.id] = { app: true, email: val, whatsapp: val };
      }
      return next;
    });
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
        description="Escolha o que te interrompe e por onde chega. A organização define o que é obrigatório; você afina o resto."
        info={
          <div className="flex flex-col gap-1.5 py-0.5">
            <p className="m-0 body-xs">
              A organização define o que é obrigatório e o padrão de cada evento.
              Aqui você ajusta o que é opcional e por quais canais recebe — itens{" "}
              <span className="font-medium text-(--fg-primary)">
                Definido pela organização
              </span>{" "}
              chegam sempre.
            </p>
            <p className="m-0 body-xs text-(--fg-tertiary)">
              Suas preferências valem em {ORG_NAME} — cada pessoa configura as
              suas, por organização.
            </p>
          </div>
        }
        trailing={
          <AwButton
            asChild
            size="sm"
            variant="secondary"
            iconLeft="notifications"
          >
            <Link href="/notifications">Ver notificações</Link>
          </AwButton>
        }
      />

      {/* Canais de entrega — 4 cards no topo. Desligar um canal aqui apenas
       *  mascara (desabilita) esse canal nas notificações abaixo; as escolhas
       *  por linha ficam guardadas e voltam ao religar. */}
      <div className="mt-8">
        <ChannelsRow
          email={emailDelivery}
          whatsapp={whatsappDelivery}
          weekly={weeklyDigest}
          userEmail={USER_EMAIL}
          onToggle={(ch, val) => {
            if (ch === "weekly") {
              setWeeklyDigest(val);
              notifySaved();
              return;
            }
            setGlobalChannel(ch, val);
          }}
        />
      </div>

      {/* Cabeçalho de colunas da matriz — nomeia os canais UMA vez (em vez de
       *  repetir o rótulo em toda linha) e carrega a ação "ligar" quando o
       *  canal está desligado no topo. */}
      <MatrixHeader
        email={emailDelivery}
        whatsapp={whatsappDelivery}
        onEnable={(ch) => setGlobalChannel(ch, true)}
      />

      {/* Divisor cinza entre cada tipo de notificação. */}
      <div className="mt-2 flex flex-col divide-y divide-(--border-subtle)">
        {SECTIONS.map((section) => (
          <CollapsibleSection
            key={section.id}
            icon={section.icon}
            title={section.title}
            desc={section.desc}
            className="py-8 first:pt-0"
            bodyClassName="divide-y divide-(--border-subtle)"
            trailing={
              <BulkMenu
                onAll={() => setAllInSection(section.id, true)}
                onNone={() => setAllInSection(section.id, false)}
              />
            }
          >
            {section.items.map((def) => (
              <NotifRow
                key={def.id}
                def={def}
                channels={channelsById[def.id]}
                onChannel={setChannel}
                emailDelivery={emailDelivery}
                whatsappDelivery={whatsappDelivery}
              />
            ))}
          </CollapsibleSection>
        ))}
      </div>

      {/* Rodapé — restaurar padrão da org. */}
      <div className="mt-10 flex items-center justify-between gap-4 border-t border-(--border-subtle) pt-6">
        <p className="m-0 max-w-[520px] body-xs text-(--fg-tertiary)">
          As mudanças salvam sozinhas.
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

/** Row de 4 canais no topo da página, em cards iguais. Coerente com o
 *  estilo de "Canais permitidos" em /organizacao/notificacoes. */
function ChannelsRow({
  email,
  whatsapp,
  weekly,
  userEmail,
  onToggle,
}: {
  email: boolean;
  whatsapp: boolean;
  weekly: boolean;
  userEmail: string;
  onToggle: (ch: "email" | "whatsapp" | "weekly", val: boolean) => void;
}) {
  return (
    <div role="group" aria-label="Canais de entrega" className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <ChannelCard
        icon="notifications"
        name="No app"
        note="Sempre ativo"
        locked
      />
      <ChannelCard
        icon="mail"
        name="E-mail"
        note={userEmail}
        on={email}
        onToggle={(v) => onToggle("email", v)}
      />
      <ChannelCard
        channelGlyph="whatsapp"
        name="WhatsApp"
        note="Liberado pela organização"
        on={whatsapp}
        onToggle={(v) => onToggle("whatsapp", v)}
      />
      <ChannelCard
        icon="summarize"
        name="Resumo semanal"
        note="Segunda · por e-mail"
        on={weekly}
        onToggle={(v) => onToggle("weekly", v)}
      />
    </div>
  );
}

function ChannelCard({
  icon,
  channelGlyph,
  name,
  note,
  on,
  locked,
  onToggle,
}: {
  icon?: string;
  channelGlyph?: "whatsapp";
  name: string;
  note: string;
  on?: boolean;
  locked?: boolean;
  onToggle?: (v: boolean) => void;
}) {
  const active = !!on;
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border px-4 py-4 transition-colors duration-aw-fast",
        active
          ? "border-(--fg-primary) bg-(--fg-primary)"
          : "border-(--border-subtle) bg-(--bg-raised)",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            active
              ? "bg-(--bg-canvas)/15 text-(--bg-canvas)"
              : "bg-(--bg-muted) text-(--fg-secondary)",
          )}
        >
          {channelGlyph ? (
            <AwChannelIcon channel={channelGlyph} size={18} />
          ) : (
            <Icon name={icon ?? "circle"} size={18} fill={active ? 1 : 0} />
          )}
        </span>
        {locked ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 body-xs font-medium",
              active ? "text-(--bg-canvas)/80" : "text-(--fg-tertiary)",
            )}
          >
            <Icon name="lock" size={12} />
            {note}
          </span>
        ) : (
          <AwToggle
            checked={active}
            onChange={onToggle}
            label={name}
            className="shrink-0"
          />
        )}
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "m-0 body-sm font-medium",
            active ? "text-(--bg-canvas)" : "text-(--fg-primary)",
          )}
        >
          {name}
        </p>
        {!locked && (
          <p
            className={cn(
              "m-0 mt-0.5 truncate body-xs",
              active ? "text-(--bg-canvas)/75" : "text-(--fg-tertiary)",
            )}
          >
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

/** Dropdown discreto ao lado do chevron — marcar/desmarcar todos os
 *  eventos opcionais da seção. Não toca em locked. */
function BulkMenu({
  onAll,
  onNone,
}: {
  onAll: () => void;
  onNone: () => void;
}) {
  return (
    <AwDropdownMenu
      aria-label="Ações em lote da seção"
      trigger={
        <AwButton
          variant="ghost"
          size="sm"
          iconOnly="more_vert"
          aria-label="Ações em lote da seção"
          onClick={(e) => e.stopPropagation()}
        />
      }
      items={[
        {
          id: "all",
          label: "Marcar todos os canais",
          icon: "done_all",
          onSelect: onAll,
        },
        {
          id: "none",
          label: "Desmarcar todos os canais",
          icon: "remove_done",
          onSelect: onNone,
        },
      ]}
    />
  );
}

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
      {/* Header: trailing fica FORA do botão (pra ações em lote não
       *  expandirem/colapsarem a seção). */}
      <div className="flex w-full items-start gap-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="group flex flex-1 items-start gap-3 text-left"
        >
          {leading ?? (
            // Tile maior + fill, mesma linguagem dos cabeçalhos de
            // /organizacao/notificacoes (h-11 w-11 com glifo fill).
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-(--fg-primary) text-(--bg-canvas)">
              <Icon name={icon ?? "circle"} size={22} fill={1} animated={false} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-base font-semibold text-(--fg-primary)">
              {title}
            </h2>
            <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">{desc}</p>
          </div>
          <span
            className={cn(
              "mt-2 shrink-0 text-(--fg-tertiary) transition-transform duration-aw-fast group-hover:text-(--fg-secondary)",
              open && "rotate-180",
            )}
          >
            <Icon name="expand_more" size={20} />
          </span>
        </button>
        {trailing && <div className="mt-1 shrink-0">{trailing}</div>}
      </div>
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

/** Ícone do canal — usado no cabeçalho e (apagado) quando o canal está off. */
function ChannelGlyph({ channel, dim }: { channel: ChannelKey; dim?: boolean }) {
  if (channel === "whatsapp") {
    return (
      <span className={cn("inline-flex", dim && "opacity-50 grayscale")}>
        <AwChannelIcon channel="whatsapp" size={13} />
      </span>
    );
  }
  return <Icon name={channel === "app" ? "notifications" : "mail"} size={13} />;
}

/** Cabeçalho de colunas da matriz: nomeia E-mail / WhatsApp uma única vez e
 *  alinha com os checkboxes das linhas (mesma grid de colunas fixas). Quando o
 *  canal está desligado no topo, vira um rótulo apagado + ação "ligar". */
function MatrixHeader({
  email,
  whatsapp,
  onEnable,
}: {
  email: boolean;
  whatsapp: boolean;
  onEnable: (ch: ChannelKey) => void;
}) {
  const on: Record<"email" | "whatsapp", boolean> = { email, whatsapp };
  return (
    <div className="mt-8 flex items-end justify-end border-b border-(--border-subtle) pb-2.5">
      <div className="grid grid-cols-2 gap-x-2">
        {MATRIX_CHANNELS.map((ch) => {
          const isOn = on[ch.key as "email" | "whatsapp"];
          return (
            <div key={ch.key} className="flex w-20 flex-col items-center gap-0.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 body-xs font-medium",
                  isOn ? "text-(--fg-secondary)" : "text-(--fg-muted)",
                )}
              >
                <ChannelGlyph channel={ch.key} dim={!isOn} />
                {ch.label}
              </span>
              {!isOn && (
                <button
                  type="button"
                  onClick={() => onEnable(ch.key)}
                  className="rounded body-xs font-medium text-(--accent-brand) hover:underline"
                >
                  ligar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Uma célula da matriz (canal × evento). Três estados:
 *  · orgLocked → check travado, sempre on (a organização força);
 *  · canal desligado no topo → traço mudo + tooltip (sem checkbox morto; a
 *    ação "ligar" mora no cabeçalho da coluna);
 *  · normal → checkbox clicável. */
function ChannelCell({
  def,
  channel,
  label,
  checked,
  globallyOff,
  onChannel,
}: {
  def: NotifDef;
  channel: ChannelKey;
  label: string;
  checked: boolean;
  globallyOff: boolean;
  onChannel: (id: string, ch: ChannelKey, val: boolean) => void;
}) {
  const id = `${def.id}-${channel}`;

  if (def.orgLocked) {
    return (
      <div
        className="flex w-20 items-center justify-center opacity-60"
        title={`${label} — definido pela organização`}
      >
        <AwCheckbox
          id={id}
          checked={checked}
          disabled
          onChange={() => {}}
          label={`${def.title} — ${label} (definido pela organização)`}
        />
      </div>
    );
  }

  if (globallyOff) {
    return (
      <div
        className="flex w-20 items-center justify-center text-(--fg-muted)"
        title={`${label} está desligado no topo da página`}
        aria-label={`${def.title} — ${label} desligado no topo da página`}
      >
        <span aria-hidden="true">—</span>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      className="flex w-20 cursor-pointer items-center justify-center select-none"
    >
      <AwCheckbox
        id={id}
        checked={checked}
        onChange={(v) => onChannel(def.id, channel, v)}
        label={`${def.title} — ${label}`}
      />
    </label>
  );
}

function NotifRow({
  def,
  channels,
  onChannel,
  emailDelivery,
  whatsappDelivery,
}: {
  def: NotifDef;
  channels: ChannelState;
  onChannel: (id: string, ch: ChannelKey, val: boolean) => void;
  emailDelivery: boolean;
  whatsappDelivery: boolean;
}) {
  // Canal global desligado no topo → a coluna daquele canal vira um traço
  // mudo (ver ChannelCell), sem checkbox morto. O estado segue guardado.
  const globallyOff: Record<ChannelKey, boolean> = {
    app: false,
    email: !emailDelivery,
    whatsapp: !whatsappDelivery,
  };
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

      {/* Canais à direita — grid de colunas fixas, alinhada ao MatrixHeader.
       *  Só checkboxes (os rótulos vivem no cabeçalho). */}
      <div className="grid shrink-0 grid-cols-2 gap-x-2 pt-0.5">
        {MATRIX_CHANNELS.map((ch) => (
          <ChannelCell
            key={ch.key}
            def={def}
            channel={ch.key}
            label={ch.label}
            checked={channels[ch.key]}
            globallyOff={globallyOff[ch.key]}
            onChannel={onChannel}
          />
        ))}
      </div>
    </div>
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
