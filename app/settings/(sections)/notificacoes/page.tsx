"use client";

import { useState } from "react";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwTabs } from "@/components/ui/AwTabs";
import { NotifGroup, SettingsPageHeader } from "../_components/shared";

/* Cada notificação é entregue por um ou mais canais. O usuário escolhe quais
   ligar por linha — pode ligar todos ou nenhum. */
type ChannelKey = "responder" | "app" | "email" | "whatsapp";
type Channels = Record<ChannelKey, boolean>;

const CHANNELS: { key: ChannelKey; label: string }[] = [
  { key: "responder", label: "Responder" },
  { key: "app", label: "App" },
  { key: "email", label: "E-mail" },
  { key: "whatsapp", label: "WhatsApp" },
];

type NotifItem = {
  key: string;
  title: string;
  description?: string;
  channels: Channels;
};

type NotifSection = { label: string; items: NotifItem[] };

type Scope = "user" | "org";

const INITIAL: Record<Scope, NotifSection[]> = {
  user: [
    {
      label: "Conversas",
      items: [
        {
          key: "urgentMessage",
          title: "Mensagem urgente flagada",
          description:
            "Cliente pediu humano, mencionou cancelamento ou usou linguagem sensível.",
          channels: { responder: true, app: true, email: true, whatsapp: false },
        },
        {
          key: "conversationHandoff",
          title: "Conversa transferida para mim",
          channels: { responder: true, app: true, email: false, whatsapp: false },
        },
      ],
    },
    {
      label: "Time",
      items: [
        {
          key: "mentions",
          title: "Menções",
          description: "Quando um colega te marca em uma conversa ou aprovação.",
          channels: { responder: true, app: true, email: true, whatsapp: false },
        },
        {
          key: "weeklyDigest",
          title: "Resumo semanal por email",
          description: "Performance dos agentes, ações executadas e KPIs.",
          channels: { responder: false, app: false, email: true, whatsapp: false },
        },
      ],
    },
  ],
  org: [
    {
      label: "Agentes",
      items: [
        {
          key: "approvals",
          title: "Aprovação pendente",
          description:
            "Quando um agente solicita autorização para executar uma ação.",
          channels: { responder: true, app: true, email: true, whatsapp: false },
        },
        {
          key: "agentDisconnected",
          title: "Agente desconectado de um canal",
          description:
            "WhatsApp, Instagram ou outras integrações que pararam de responder.",
          channels: { responder: false, app: true, email: true, whatsapp: true },
        },
        {
          key: "toolFailure",
          title: "Falha em ferramenta",
          description: "Tool retornou erro mais de 3 vezes em uma hora.",
          channels: { responder: false, app: true, email: true, whatsapp: false },
        },
      ],
    },
  ],
};

function ChannelHeader() {
  return (
    <div className="flex items-center gap-6 pb-1.5">
      <div className="min-w-0 flex-1" />
      <div className="flex shrink-0 items-center">
        {CHANNELS.map((ch) => (
          <span
            key={ch.key}
            className="flex w-[72px] justify-center text-[11px] font-medium text-(--fg-tertiary)"
          >
            {ch.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function NotificationsSettingsPage() {
  const [scope, setScope] = useState<Scope>("user");
  const [data, setData] = useState<Record<Scope, NotifSection[]>>(INITIAL);

  const sections = data[scope];
  const count = (s: Scope) =>
    data[s].reduce((n, sec) => n + sec.items.length, 0);

  const toggle = (
    sectionLabel: string,
    key: string,
    channel: ChannelKey,
    next: boolean,
  ) =>
    setData((prev) => ({
      ...prev,
      [scope]: prev[scope].map((sec) =>
        sec.label === sectionLabel
          ? {
              ...sec,
              items: sec.items.map((it) =>
                it.key === key
                  ? { ...it, channels: { ...it.channels, [channel]: next } }
                  : it,
              ),
            }
          : sec,
      ),
    }));

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Notificações"
        description="Escolha quando o produto interrompe seu fluxo. Eventos críticos de agente sempre aparecem em /aprovações."
      />

      <AwTabs
        variant="underline"
        aria-label="Escopo das notificações"
        value={scope}
        onChange={(v) => setScope(v as Scope)}
        items={[
          { value: "user", label: "Usuário", count: count("user") },
          { value: "org", label: "Organização", count: count("org") },
        ]}
        className="mb-7"
      />

      <div>
        {sections.map((section) => (
          <NotifGroup key={section.label} label={section.label}>
            <ChannelHeader />
            {section.items.map((it) => (
              <div key={it.key} className="flex items-center gap-6 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="m-0 body-sm font-medium text-(--fg-primary)">
                    {it.title}
                  </p>
                  {it.description && (
                    <p className="m-0 body-xs text-(--fg-secondary)">
                      {it.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center">
                  {CHANNELS.map((ch) => (
                    <span
                      key={ch.key}
                      className="flex w-[72px] justify-center"
                    >
                      <AwCheckbox
                        checked={it.channels[ch.key]}
                        onChange={(v) =>
                          toggle(section.label, it.key, ch.key, v)
                        }
                        label={`${ch.label} — ${it.title}`}
                      />
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </NotifGroup>
        ))}
      </div>
    </div>
  );
}
