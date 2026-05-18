"use client";

import { useState } from "react";
import { AwCard } from "@/components/ui/AwCard";
import { AwToggleRow } from "@/components/ui/AwToggle";
import { NotifGroup, SettingsPageHeader } from "../_components/shared";

export default function NotificationsSettingsPage() {
  const [notif, setNotif] = useState({
    approvalsEmail: true,
    approvalsInApp: true,
    agentDisconnected: true,
    toolFailure: true,
    urgentMessage: true,
    conversationHandoff: false,
    mentions: true,
    weeklyDigest: false,
  });

  return (
    <div className="mx-auto w-full max-w-[1440px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Notificações"
        description="Escolha quando o produto interrompe seu fluxo. Eventos críticos de agente sempre aparecem em /aprovações."
      />
      <AwCard className="!p-0">
        <NotifGroup label="Agentes">
          <AwToggleRow
            title="Aprovação pendente"
            description="Quando um agente solicita autorização para executar uma ação."
            checked={notif.approvalsEmail}
            onChange={(v) => setNotif((n) => ({ ...n, approvalsEmail: v }))}
          />
          <AwToggleRow
            title="Notificar também no app"
            description="Mostra um indicador na barra lateral em tempo real."
            checked={notif.approvalsInApp}
            onChange={(v) => setNotif((n) => ({ ...n, approvalsInApp: v }))}
          />
          <AwToggleRow
            title="Agente desconectado de um canal"
            description="WhatsApp, Instagram ou outras integrações que pararam de responder."
            checked={notif.agentDisconnected}
            onChange={(v) => setNotif((n) => ({ ...n, agentDisconnected: v }))}
          />
          <AwToggleRow
            title="Falha em ferramenta"
            description="Tool retornou erro mais de 3 vezes em uma hora."
            checked={notif.toolFailure}
            onChange={(v) => setNotif((n) => ({ ...n, toolFailure: v }))}
          />
        </NotifGroup>
        <NotifGroup label="Conversas">
          <AwToggleRow
            title="Mensagem urgente flagada"
            description="Cliente pediu humano, mencionou cancelamento ou usou linguagem sensível."
            checked={notif.urgentMessage}
            onChange={(v) => setNotif((n) => ({ ...n, urgentMessage: v }))}
          />
          <AwToggleRow
            title="Conversa transferida para mim"
            checked={notif.conversationHandoff}
            onChange={(v) =>
              setNotif((n) => ({ ...n, conversationHandoff: v }))
            }
          />
        </NotifGroup>
        <NotifGroup label="Time">
          <AwToggleRow
            title="Menções"
            description="Quando um colega te marca em uma conversa ou aprovação."
            checked={notif.mentions}
            onChange={(v) => setNotif((n) => ({ ...n, mentions: v }))}
          />
          <AwToggleRow
            title="Resumo semanal por email"
            description="Performance dos agentes, ações executadas e KPIs."
            checked={notif.weeklyDigest}
            onChange={(v) => setNotif((n) => ({ ...n, weeklyDigest: v }))}
          />
        </NotifGroup>
      </AwCard>
    </div>
  );
}
