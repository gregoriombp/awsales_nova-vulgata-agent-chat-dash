"use client";

import * as React from "react";
import Link from "next/link";
import { AwButton } from "@/components/ui/AwButton";
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
 *
 * A entrega é uma MATRIZ por linha: cada notificação × cada canal (No app /
 * E-mail / WhatsApp) é um checkbox. Não há mais "canais globais" no topo —
 * o usuário controla tudo por linha, inclusive o No app.
 * ===================================================================== */

type ChannelKey = "app" | "email" | "whatsapp";
type ChannelState = Record<ChannelKey, boolean>;

/* As três colunas da matriz. Todas controláveis por linha — o "No app", que
 * antes era travado no topo, agora a pessoa liga/desliga como os outros. */
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
        title: "Saldo / crédito baixo",
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

  // Resumo semanal — único ajuste global (é um digest, não uma notificação
  // por-linha), então vive numa linha própria no rodapé.
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

  /** "Marcar todos / Desmarcar todos" — só toca eventos não-locked da seção,
   *  e agora atinge os três canais (inclusive No app). */
  const setAllInSection = (sectionId: string, val: boolean) => {
    const section = SECTIONS.find((s) => s.id === sectionId);
    if (!section) return;
    setChannelsById((s) => {
      const next = { ...s };
      for (const it of section.items) {
        if (it.orgLocked) continue;
        next[it.id] = { app: val, email: val, whatsapp: val };
      }
      return next;
    });
    notifySaved();
  };

  const restoreDefaults = () => {
    setChannelsById(defaultChannels());
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

      {/* Matriz de notificações — cada seção é uma "tabela" que repete o
       *  cabeçalho de canais (No app / E-mail / WhatsApp), pra que a coluna
       *  fique sempre legível conforme se desce a página. */}
      <div className="mt-10 flex flex-col divide-y divide-(--border-subtle)">
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
            <ChannelColumnsHeader />
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

      {/* Resumo semanal — digest global (não é uma notificação por-linha). */}
      <div className="mt-8 border-t border-(--border-subtle) pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary)">
              <Icon name="summarize" size={20} />
            </span>
            <div className="min-w-0">
              <p className="m-0 body-sm font-medium text-(--fg-primary)">
                Resumo semanal por e-mail
              </p>
              <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                Toda segunda, um apanhado da semana. Não substitui os alertas
                acima.
              </p>
            </div>
          </div>
          <AwToggle
            checked={weeklyDigest}
            onChange={(v) => {
              setWeeklyDigest(v);
              notifySaved();
            }}
            label="Resumo semanal por e-mail"
            className="shrink-0"
          />
        </div>
      </div>

      {/* Rodapé — restaurar padrão da org. */}
      <div className="mt-8 flex items-center justify-between gap-4 border-t border-(--border-subtle) pt-6">
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

/** Cabeçalho de colunas da tabela — repetido por seção (pedido do Greg):
 *  nomeia No app / E-mail / WhatsApp UMA vez por tabela, alinhado à grade dos
 *  checkboxes das linhas. Rótulos em texto limpo (sem ícone) pra não estourar
 *  a última coluna contra a borda da tabela. */
function ChannelColumnsHeader() {
  return (
    <div className="flex items-center justify-end pb-2.5">
      <div className="grid grid-cols-3 gap-x-2">
        {CHANNELS.map((ch) => (
          <span
            key={ch.key}
            className="flex w-20 items-center justify-center body-xs font-medium text-(--fg-secondary)"
          >
            {ch.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Uma célula da matriz (canal × evento). Dois estados:
 *  · orgLocked → check travado, sempre on (a organização força);
 *  · normal → checkbox clicável. */
function ChannelCell({
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

      {/* Canais à direita — grid de colunas fixas, alinhada ao cabeçalho.
       *  Só checkboxes (os rótulos vivem no cabeçalho da tabela). */}
      <div className="grid shrink-0 grid-cols-3 gap-x-2 pt-0.5">
        {CHANNELS.map((ch) => (
          <ChannelCell
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
