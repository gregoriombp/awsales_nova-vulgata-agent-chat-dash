"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwShortcutTile } from "@/components/ui/AwShortcutTile";
import { AwTabs } from "@/components/ui/AwTabs";
import { Icon } from "@/components/ui/Icon";
import { NotificationRow } from "@/components/NotificationRow";
import { NOTIFICATIONS } from "@/lib/notifications";
import { SectionHeading } from "../_components/shared";
import {
  COVER_BACKGROUNDS,
  pickCoverBackground,
} from "../equipe-permissoes/_components/data";

/** Capa pré-definida deste usuário — pool landscape, determinística por userId. */
const DEFAULT_COVER = pickCoverBackground("u-greg");

type SettingsShortcut = {
  href: string;
  icon: string;
  title: string;
  description: string;
};

const SETTINGS_SHORTCUTS: SettingsShortcut[] = [
  {
    href: "/settings/organizacao",
    icon: "domain",
    title: "Organização",
    description: "Verificada · slug artificial-concord",
  },
  {
    href: "/settings/equipe-permissoes",
    icon: "groups",
    title: "Equipe & permissões",
    description: "12 membros · 4 grupos · 2 convites pendentes",
  },
  {
    href: "/settings/notificacoes",
    icon: "notifications",
    title: "Notificações",
    description: "5 regras ativas · resumo semanal desativado",
  },
  {
    href: "/settings/aparencia",
    icon: "palette",
    title: "Aparência",
    description: "Tema claro · Português (Brasil)",
  },
  {
    href: "/settings/seguranca",
    icon: "shield",
    title: "Segurança",
    description: "2FA ativo · 3 sessões · senha alterada há 3 meses",
  },
  {
    href: "/settings/api",
    icon: "key",
    title: "API & desenvolvedores",
    description: "2 chaves ativas · produção aws_live_8f3a…",
  },
  {
    href: "/settings/financeiro",
    icon: "credit_card",
    title: "Faturamento & uso",
    description: "Plano Pro anual · próxima fatura R$ 1.890,00",
  },
  {
    href: "/settings/zona-de-perigo",
    icon: "warning",
    title: "Zona de perigo",
    description: "Ações destrutivas — transferir ou excluir o workspace",
  },
];

export default function ProfileSettingsPage() {
  const [fullName, setFullName] = useState("Gregório Pinheiro");
  const [email] = useState("greg@awsales.io");
  const [role, setRole] = useState("Super Administrador");
  const [editOpen, setEditOpen] = useState(false);

  // Capa do perfil — começa na capa pré-definida do usuário e pode ser
  // trocada pelo seletor (galeria do banco, upload ou link).
  const [cover, setCover] = useState(DEFAULT_COVER);
  const [pickerOpen, setPickerOpen] = useState(false);

  // A seção do perfil mostra só as notificações mais recentes; o feed
  // completo vive em /notifications.
  const latestNotifications = NOTIFICATIONS.slice(0, 4);

  const publicRows: { icon?: string; iconNode?: React.ReactNode; text: string }[] = [
    { icon: "person", text: fullName },
    { icon: "mail", text: email },
    { iconNode: <WhatsAppIcon />, text: "+55 11 98765-4321" },
    { iconNode: <SlackIcon />, text: "@greg.pinheiro" },
    { icon: "badge", text: role },
    { icon: "schedule", text: "Brasília · GMT−03" },
    { icon: "translate", text: "Português (Brasil)" },
  ];
  const accountRows = [
    { icon: "domain", text: "Workspace Awsales" },
    { icon: "calendar_month", text: "Membro desde 12 jan 2026" },
    { icon: "workspace_premium", text: "Plano Enterprise" },
    { icon: "devices", text: "3 sessões ativas" },
  ];

  return (
    <div className="w-full pb-32">
      <section aria-label="Resumo do perfil" className="w-full">
        <div className="relative mx-auto w-full max-w-[1440px] px-10 pt-8">
          <div className="group/cover relative h-[280px] w-full overflow-hidden rounded-t-[var(--radius-lg)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${cover})` }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(13,13,15,0.05) 0%, rgba(13,13,15,0.45) 100%)",
              }}
            />
          </div>

          {pickerOpen && (
            <>
              <button
                type="button"
                aria-label="Fechar seletor de capa"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setPickerOpen(false)}
              />
              <div className="absolute right-10 top-[196px] z-50 w-[440px] max-w-[calc(100%-5rem)]">
                <CoverPicker
                  value={cover}
                  defaultCover={DEFAULT_COVER}
                  onChange={setCover}
                  onClose={() => setPickerOpen(false)}
                />
              </div>
            </>
          )}

          <div className="relative z-10 -mt-[88px] flex items-end justify-between gap-4">
            <div
              className="ml-6 rounded-full bg-[var(--bg-raised)] p-1 shadow-[0_6px_22px_rgba(6,22,61,0.18)]"
              style={{ lineHeight: 0 }}
            >
              <AwAvatar
                size="lg"
                src="/assets/users/greg.jpg"
                alt={fullName}
                initials="GP"
                className="!h-[144px] !w-[144px] !text-[40px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <AwButton
                size="sm"
                variant="secondary"
                iconLeft="image"
                onClick={() => setPickerOpen((v) => !v)}
                aria-expanded={pickerOpen}
              >
                Alterar capa
              </AwButton>
              <AwButton
                size="sm"
                variant="secondary"
                iconLeft="edit"
                onClick={() => setEditOpen(true)}
              >
                Editar perfil
              </AwButton>
            </div>
          </div>
          <div className="ml-6 mt-5 pb-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="m-0 text-[var(--fg-primary)]">
                {fullName}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(47,118,230,0.08)] px-2.5 py-0.5 body-xs font-medium text-[var(--aw-blue-600)]">
                <Icon name="workspace_premium" size={11} />
                {role}
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <ContactChip href={`mailto:${email}`} iconName="mail" label={email} />
              <ContactChip href="https://wa.me/5511987654321" iconNode={<WhatsAppIcon />} label="+55 11 98765-4321" />
              <ContactChip href="https://slack.com/app_redirect?channel=greg.pinheiro" iconNode={<SlackIcon />} label="@greg.pinheiro" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <AwPill variant="neutral" dot={false}>
                Workspace Awsales
              </AwPill>
              <AwPill variant="neutral" dot={false}>
                Brasília · GMT−03
              </AwPill>
            </div>
            <p className="m-0 mt-3 max-w-[560px] body-xs text-[var(--fg-secondary)]">
              Como você aparece para o restante do time.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1440px] px-10 pt-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Coluna esquerda — resumo do perfil */}
          <aside className="flex flex-col gap-6 self-start">
            <InfoCard
              title="Perfil público"
              rows={publicRows}
              action={
                <AwButton
                  size="sm"
                  variant="ghost"
                  iconLeft="edit"
                  onClick={() => setEditOpen(true)}
                >
                  Editar
                </AwButton>
              }
            />
            <InfoCard title="Sua conta" rows={accountRows} />
          </aside>

          {/* Coluna direita — atalhos + notificações */}
          <div className="flex flex-col gap-10">
            <section aria-label="Outras configurações">
              <SectionHeading
                title="Outras configurações"
                description="Acesse as demais áreas do workspace."
              />
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {SETTINGS_SHORTCUTS.map((item) => (
                  <AwShortcutTile
                    key={item.href}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    href={item.href}
                  />
                ))}
              </div>
            </section>

            <section aria-label="Últimas notificações">
              <SectionHeading
                title="Últimas notificações"
                description="Atividades recentes que pediram sua atenção."
                action={
                  <Link
                    href="/notifications"
                    className="inline-flex items-center gap-1 body-xs font-medium text-[var(--fg-secondary)] transition-colors hover:text-[var(--fg-primary)]"
                  >
                    Ver todas
                    <Icon name="arrow_forward" size={14} />
                  </Link>
                }
              />
              <div className="overflow-hidden rounded-[var(--radius-md)]">
                <ul className="m-0 list-none divide-y divide-[var(--border-subtle)] p-0">
                  {latestNotifications.map((n) => (
                    <li key={n.id} className="m-0">
                      <NotificationRow notification={n} />
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>

      <AwModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar perfil"
        footer={
          <>
            <AwButton
              size="sm"
              variant="ghost"
              onClick={() => setEditOpen(false)}
            >
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              onClick={() => setEditOpen(false)}
            >
              Salvar alterações
            </AwButton>
          </>
        }
      >
        <div className="flex items-center gap-4 pb-5">
          <AwAvatar
            size="lg"
            src="/assets/users/greg.jpg"
            alt={fullName}
            initials="GP"
          />
          <div className="flex-1">
            <p className="m-0 body-sm font-medium text-[var(--fg-primary)]">
              Foto de perfil
            </p>
            <p className="m-0 body-xs text-[var(--fg-secondary)]">
              PNG ou JPG, mínimo 200×200 px.
            </p>
          </div>
          <AwButton size="sm" variant="secondary" iconLeft="upload">
            Alterar foto
          </AwButton>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AwField label="Nome completo" htmlFor="profile-name">
            <AwInput
              id="profile-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </AwField>
          <AwField label="Email" htmlFor="profile-email">
            <AwInput id="profile-email" value={email} readOnly />
          </AwField>
          <AwField label="Função" htmlFor="profile-role">
            <AwInput
              id="profile-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </AwField>
          <AwField label="Idioma da interface">
            <AwSelect>Português (Brasil)</AwSelect>
          </AwField>
          <AwField label="Fuso horário">
            <AwSelect>(GMT−03:00) Brasília · São Paulo</AwSelect>
          </AwField>
          <AwField
            label="Formato de data"
            helper="Aplicado em relatórios e exportações."
          >
            <AwSelect>DD/MM/AAAA</AwSelect>
          </AwField>
        </div>
      </AwModal>
    </div>
  );
}

/* -----------------------------------------------------------------
 * ContactChip — pill clicável para email / redes sociais no header
 * ----------------------------------------------------------------- */

function ContactChip({
  href,
  iconName,
  iconNode,
  label,
}: {
  href: string;
  iconName?: string;
  iconNode?: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto") ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-2.5 py-1 body-xs text-[var(--fg-secondary)] transition-colors duration-aw-fast hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg-primary)]"
    >
      {iconNode ?? (iconName ? <Icon name={iconName} size={13} className="shrink-0 text-[var(--fg-tertiary)]" /> : null)}
      <span>{label}</span>
    </a>
  );
}

/* -----------------------------------------------------------------
 * Brand icons for social rows
 * ----------------------------------------------------------------- */

function SlackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className="shrink-0" aria-hidden="true">
      <path d="M9.5 15.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 0V10" stroke="#E01E5A" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M14.5 8.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm0 0H10" stroke="#36C5F0" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8.5 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 0H14" stroke="#2EB67D" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M15.5 14.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 0V10" stroke="#ECB22E" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className="shrink-0" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.656 1.438 5.162L2 22l4.962-1.418A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="#25D366"/>
      <path d="M8.5 9c.167-.5.667-1.5 1.5-1.5.5 0 .833.25 1 .75L11.5 10c.083.25 0 .583-.25.875L10.5 12c.5 1 1.5 2 2.5 2.5l1.125-.75c.292-.25.625-.333.875-.25l1.75.5c.5.167.75.5.75 1 0 .833-1 1.333-1.5 1.5-2.5.5-6.5-2-7.5-5.5-.25-.833-.167-1.583 0-2z" fill="white"/>
    </svg>
  );
}

/* -----------------------------------------------------------------
 * InfoCard — cartão da coluna esquerda: cabeçalho com ação opcional
 * e uma lista de linhas ícone + valor.
 * ----------------------------------------------------------------- */

function InfoCard({
  title,
  rows,
  action,
}: {
  title: string;
  rows: { icon?: string; iconNode?: React.ReactNode; text: string }[];
  action?: React.ReactNode;
}) {
  return (
    <AwCard className="!p-0">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-4 py-2.5">
        <h6 className="m-0 text-[var(--fg-primary)]">{title}</h6>
        {action}
      </div>
      <ul className="m-0 flex list-none flex-col p-2">
        {rows.map((row) => (
          <li
            key={(row.icon ?? "") + row.text}
            className="flex items-center gap-2.5 px-2 py-1.5"
          >
            {row.iconNode ?? (
              <Icon
                name={row.icon!}
                size={16}
                className="shrink-0 text-[var(--fg-tertiary)]"
              />
            )}
            <span className="min-w-0 truncate body-sm text-[var(--fg-primary)]">
              {row.text}
            </span>
          </li>
        ))}
      </ul>
    </AwCard>
  );
}

/* -----------------------------------------------------------------
 * Cover picker — popover estilo Notion: galeria do banco de imagens,
 * upload de arquivo local ou link de uma imagem personalizada.
 * ----------------------------------------------------------------- */

type CoverTab = "gallery" | "upload" | "link";

function CoverPicker({
  value,
  defaultCover,
  onChange,
  onClose,
}: {
  value: string;
  defaultCover: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<CoverTab>("gallery");
  const [linkValue, setLinkValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] shadow-[0_18px_50px_rgba(6,22,61,0.24)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pl-3 pr-2">
        <AwTabs
          variant="underline"
          aria-label="Origem da capa"
          value={tab}
          onChange={(v) => setTab(v as CoverTab)}
          items={[
            { value: "gallery", label: "Galeria" },
            { value: "upload", label: "Upload" },
            { value: "link", label: "Link" },
          ]}
        />
        <AwButton
          size="sm"
          variant="ghost"
          iconOnly="close"
          aria-label="Fechar"
          onClick={onClose}
        />
      </div>

      <div className="p-3">
        {tab === "gallery" && (
          <ul className="m-0 grid max-h-[244px] grid-cols-3 gap-2 overflow-y-auto p-0">
            {COVER_BACKGROUNDS.map((bg) => {
              const isActive = bg === value;
              return (
                <li key={bg} className="m-0 list-none">
                  <button
                    type="button"
                    onClick={() => onChange(bg)}
                    aria-pressed={isActive}
                    className={
                      "relative block aspect-[3/2] w-full overflow-hidden rounded-[var(--radius-md)] transition-shadow duration-aw-fast " +
                      (isActive
                        ? "ring-2 ring-[var(--fg-primary)] ring-offset-2 ring-offset-[var(--bg-raised)]"
                        : "hover:ring-1 hover:ring-[var(--border-default)]")
                    }
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${bg})` }}
                    />
                    {isActive && (
                      <span className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--fg-primary)] text-[var(--bg-raised)]">
                        <Icon name="check" size={12} weight={700} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {tab === "upload" && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-8 text-center transition-colors hover:bg-[var(--bg-hover)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-raised)] text-[var(--fg-primary)]">
                <Icon name="upload" size={18} />
              </span>
              <span className="body-xs font-medium text-[var(--fg-primary)]">
                Escolha uma imagem do computador
              </span>
              <span className="body-xs text-[var(--fg-secondary)]">
                PNG ou JPG · recomendado 1500×400 px
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        )}

        {tab === "link" && (
          <div className="flex flex-col gap-3">
            <AwInput
              placeholder="Cole o link da imagem…"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
            />
            <AwButton
              size="sm"
              variant="primary"
              disabled={!linkValue.trim()}
              onClick={() => onChange(linkValue.trim())}
            >
              Aplicar
            </AwButton>
            <p className="m-0 body-xs text-[var(--fg-tertiary)]">
              Insira o URL direto de uma imagem pública.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] px-3 py-2">
        <span className="body-xs text-[var(--fg-tertiary)]">
          Visível para todos os membros do workspace.
        </span>
        <AwButton
          size="sm"
          variant="ghost"
          iconLeft="restart_alt"
          disabled={value === defaultCover}
          onClick={() => onChange(defaultCover)}
        >
          Restaurar padrão
        </AwButton>
      </div>
    </div>
  );
}
