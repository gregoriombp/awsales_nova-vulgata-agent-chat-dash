"use client";

import * as React from "react";
import { FaSlack, FaWhatsapp } from "react-icons/fa6";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";
import { BRAND_COLORS } from "@/lib/brandColors";

/**
 * AwContactChannelModal — escolhe por onde falar com o gerente de contas
 * (WhatsApp ou Slack). Aberto pelo CTA do card do especialista humano.
 *
 * Consolidação: este modal vivia duplicado, copiado em
 * settings/equipe-permissoes e no passo de conclusão do onboarding. Agora
 * mora aqui; as cores de marca vêm de `lib/brandColors.ts`.
 */

type ContactChannel = {
  key: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  color: string;
};

const CONTACT_CHANNELS: readonly ContactChannel[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    hint: "Resposta rápida no horário comercial.",
    icon: <FaWhatsapp size={22} />,
    color: BRAND_COLORS.whatsapp,
  },
  {
    key: "slack",
    label: "Slack",
    hint: "Converse no canal compartilhado da sua conta.",
    icon: <FaSlack size={22} />,
    color: BRAND_COLORS.slack,
  },
];

export type AwContactChannelModalProps = {
  open: boolean;
  onClose: () => void;
  /** Nome do gerente exibido no corpo; cai num genérico quando ausente. */
  managerName?: string;
  /** Disparado ao escolher um canal; recebe a key (whatsapp|slack). Por
   *  padrão apenas fecha o modal. */
  onSelect?: (key: string) => void;
};

export function AwContactChannelModal({
  open,
  onClose,
  managerName,
  onSelect,
}: AwContactChannelModalProps) {
  return (
    <AwModal open={open} onClose={onClose} title="Conversar com seu gerente">
      <div className="flex flex-col gap-4">
        <p className="m-0 body-xs text-(--fg-secondary)">
          Escolha por onde falar com{" "}
          {managerName ?? "seu gerente de contas"}.
        </p>
        <div className="flex flex-col gap-2">
          {CONTACT_CHANNELS.map((channel) => (
            <button
              key={channel.key}
              type="button"
              onClick={() => {
                onSelect?.(channel.key);
                onClose();
              }}
              className="aw-card flex items-center gap-3 px-4! py-3! text-left transition-colors hover:bg-(--bg-surface)"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: channel.color }}
              >
                {channel.icon}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[14px] font-semibold text-(--fg-primary)">
                  {channel.label}
                </span>
                <span className="body-xs text-(--fg-secondary)">
                  {channel.hint}
                </span>
              </span>
              <Icon
                name="chevron_right"
                size={18}
                className="ml-auto text-(--fg-tertiary)"
              />
            </button>
          ))}
        </div>
      </div>
    </AwModal>
  );
}
