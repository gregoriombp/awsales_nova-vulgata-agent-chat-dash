"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwShortcutTile } from "@/components/ui/AwShortcutTile";
import { AwTabs } from "@/components/ui/AwTabs";
import { Icon } from "@/components/ui/Icon";
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
    description: "Razão social, marca e dados públicos",
  },
  {
    href: "/settings/equipe-permissoes",
    icon: "groups",
    title: "Membros & funções",
    description: "Pessoas, funções e convites",
  },
  {
    href: "/settings/notificacoes",
    icon: "notifications",
    title: "Notificações",
    description: "Canais, regras e silenciamento",
  },
  {
    href: "/settings/perfil/senha",
    icon: "shield",
    title: "Senha e acesso",
    description: "Senha, verificação em duas etapas e códigos de backup",
  },
  {
    href: "/settings/api",
    icon: "key",
    title: "API & desenvolvedores",
    description: "Chaves, webhooks e ambientes",
  },
  {
    href: "/settings/financeiro",
    icon: "credit_card",
    title: "Faturamento & uso",
    description: "Plano, pagamento e faturas",
  },
];

export default function ProfileSettingsPage() {
  const [fullName, setFullName] = useState("Gregório Pinheiro");
  const [email] = useState("greg@awsales.io");
  const [role, setRole] = useState("Super Administrador");
  const [editOpen, setEditOpen] = useState(false);
  const [cover, setCover] = useState(DEFAULT_COVER);
  const [coverPosY, setCoverPosY] = useState(50);
  const [savedPosY, setSavedPosY] = useState(50);
  const [repositioning, setRepositioning] = useState(false);
  const dragRef = useRef<{ startY: number; startPos: number } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  // Reset position when a new cover is picked
  useEffect(() => { setCoverPosY(50); setSavedPosY(50); }, [cover]);

  const handleRepoDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startPos: coverPosY };
  };
  const handleRepoDragMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const delta = e.clientY - dragRef.current.startY;
    setCoverPosY(Math.max(0, Math.min(100, dragRef.current.startPos - delta * 0.28)));
  };
  const handleRepoDragEnd = () => { dragRef.current = null; };

  const startRepositioning = () => { setSavedPosY(coverPosY); setRepositioning(true); setPickerOpen(false); };
  const saveReposition = () => { setSavedPosY(coverPosY); setRepositioning(false); };
  const cancelReposition = () => { setCoverPosY(savedPosY); setRepositioning(false); };

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
    { icon: "domain", text: "Workspace Aswork" },
    { icon: "calendar_month", text: "Membro desde 12 jan 2026" },
    { icon: "workspace_premium", text: "Plano Enterprise" },
    { icon: "devices", text: "3 sessões ativas" },
  ];

  return (
    <div className="w-full pb-32">
      <section aria-label="Resumo do perfil" className="w-full">
        <div className="relative mx-auto w-full max-w-[1440px] px-10 pt-8">
          <div
            className={[
              "group/cover relative h-[280px] w-full overflow-hidden rounded-t-lg",
              repositioning ? "cursor-ns-resize select-none" : "",
            ].join(" ")}
            onMouseDown={repositioning ? handleRepoDragStart : undefined}
            onMouseMove={repositioning ? handleRepoDragMove : undefined}
            onMouseUp={repositioning ? handleRepoDragEnd : undefined}
            onMouseLeave={repositioning ? handleRepoDragEnd : undefined}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 transition-[background-position] duration-75"
              style={{
                backgroundImage: `url(${cover})`,
                backgroundSize: "100% auto",
                backgroundRepeat: "no-repeat",
                backgroundPosition: `center ${coverPosY}%`,
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, rgba(13,13,15,0.05) 0%, rgba(13,13,15,0.45) 100%)" }}
            />

            {repositioning && (
              <div className="absolute inset-0 flex flex-col items-center justify-between py-3 pointer-events-none">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-xs">
                  <Icon name="swap_vert" size={14} aria-hidden="true" />
                  Arraste para reposicionar
                </div>
                <div className="flex items-center gap-2 pointer-events-auto">
                  <button
                    type="button"
                    onClick={cancelReposition}
                    className="rounded-md bg-black/50 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-xs hover:bg-black/70 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={saveReposition}
                    className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-(--fg-primary) hover:bg-white/90 transition-colors"
                  >
                    Salvar posição
                  </button>
                </div>
              </div>
            )}

            {!repositioning && (
              <div className="absolute right-4 top-4">
                <AwDropdownMenu
                  align="end"
                  trigger={
                    <button
                      type="button"
                      aria-label="Mais opções da capa"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:bg-white/15"
                      style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.45))" }}
                    >
                      <Icon name="more_vert" size={22} weight={600} />
                    </button>
                  }
                  items={[
                    {
                      id: "cover-change",
                      label: "Alterar capa",
                      icon: "image",
                      onSelect: () => setPickerOpen(true),
                    },
                    {
                      id: "cover-reposition",
                      label: "Reposicionar",
                      icon: "open_with",
                      onSelect: startRepositioning,
                    },
                  ]}
                />
              </div>
            )}
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

          <div className="relative z-10 mt-4 flex flex-wrap items-start justify-between gap-4 pb-2">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => setPhotoOpen(true)}
                aria-label="Editar foto de perfil"
                className="group/avatar relative -mt-24 ml-6 shrink-0 rounded-full bg-(--bg-raised) p-1 shadow-[0_6px_22px_rgba(6,22,61,0.18)] outline-hidden focus-visible:ring-2 focus-visible:ring-(--accent-brand) focus-visible:ring-offset-2"
                style={{ lineHeight: 0 }}
              >
                <AwAvatar
                  size="lg"
                  src="/assets/users/greg.jpg"
                  alt={fullName}
                  initials="GP"
                  className="h-[144px]! w-[144px]! text-[40px]!"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-1 flex items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity duration-aw-fast group-hover/avatar:opacity-100 group-focus-visible/avatar:opacity-100"
                >
                  <span className="inline-flex flex-col items-center gap-1">
                    <Icon name="photo_camera" size={22} />
                    <span className="body-xs font-medium">Editar foto</span>
                  </span>
                </span>
              </button>
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="m-0 text-(--fg-primary)">{fullName}</h3>
                  <a
                    href="https://wa.me/5511987654321"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-(--aw-gray-100) px-2 py-0.5 text-2xs font-medium text-(--fg-secondary) transition-colors duration-aw-fast hover:bg-(--aw-gray-150) hover:text-(--fg-primary)"
                  >
                    <WhatsAppIcon size={12} />
                    <span>+55 11 98765-4321</span>
                  </a>
                  <a
                    href="https://slack.com/app_redirect?channel=greg.pinheiro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-(--aw-gray-100) px-2 py-0.5 text-2xs font-medium text-(--fg-secondary) transition-colors duration-aw-fast hover:bg-(--aw-gray-150) hover:text-(--fg-primary)"
                  >
                    <SlackIcon size={12} />
                    <span>@greg.pinheiro</span>
                  </a>
                </div>
                <p className="m-0 body-xs text-(--fg-secondary)">Head of Sales · RevOps</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-1">
              {!repositioning && (
                <AwButton size="sm" variant="secondary" iconLeft="edit" onClick={() => setEditOpen(true)}>
                  Editar perfil
                </AwButton>
              )}
            </div>
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
            <section aria-label="Atalhos">
              <SectionHeading
                title="Atalhos"
                description="Acesse rapidamente as demais áreas de configuração."
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
            <p className="m-0 body-sm font-medium text-(--fg-primary)">
              Foto de perfil
            </p>
            <p className="m-0 body-xs text-(--fg-secondary)">
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

      <PhotoEditModal
        open={photoOpen}
        onClose={() => setPhotoOpen(false)}
        currentSrc="/assets/users/greg.jpg"
        fullName={fullName}
        initials="GP"
      />
    </div>
  );
}

/* -----------------------------------------------------------------
 * PhotoEditModal — modal dedicado pra trocar a foto de perfil
 * ----------------------------------------------------------------- */

function PhotoEditModal({
  open,
  onClose,
  currentSrc,
  fullName,
  initials,
}: {
  open: boolean;
  onClose: () => void;
  currentSrc: string;
  fullName: string;
  initials: string;
}) {
  const [preview, setPreview] = useState<string>(currentSrc);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) setPreview(currentSrc);
  }, [open, currentSrc]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removed = preview === "";

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Editar foto de perfil"
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton size="sm" variant="primary" onClick={onClose}>
            Salvar foto
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex justify-center">
          <div
            className="rounded-full bg-(--bg-raised) p-1 shadow-[0_4px_18px_rgba(6,22,61,0.14)]"
            style={{ lineHeight: 0 }}
          >
            <AwAvatar
              size="lg"
              src={removed ? undefined : preview}
              alt={fullName}
              initials={initials}
              className="h-[120px]! w-[120px]! text-[36px]!"
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <AwButton
            size="sm"
            variant="secondary"
            iconLeft="upload"
            onClick={() => fileRef.current?.click()}
          >
            Enviar foto
          </AwButton>
          <AwButton
            size="sm"
            variant="ghost"
            iconLeft="delete"
            disabled={removed}
            onClick={() => setPreview("")}
          >
            Remover
          </AwButton>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <div className="rounded-md bg-(--bg-muted) px-3 py-2.5">
          <p className="m-0 body-xs text-(--fg-secondary)">
            PNG ou JPG, mínimo 200×200 px. A foto aparece pra todos os membros
            do workspace e na barra de navegação.
          </p>
        </div>
      </div>
    </AwModal>
  );
}

/* -----------------------------------------------------------------
 * Brand icons for social rows
 * ----------------------------------------------------------------- */

function SlackIcon({ size = 16 }: { size?: number } = {}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className="shrink-0" aria-hidden="true">
      <path d="M9.5 15.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 0V10" stroke="#E01E5A" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M14.5 8.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm0 0H10" stroke="#36C5F0" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8.5 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 0H14" stroke="#2EB67D" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M15.5 14.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 0V10" stroke="#ECB22E" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function WhatsAppIcon({ size = 16 }: { size?: number } = {}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className="shrink-0" aria-hidden="true">
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
    <div
      className="overflow-hidden rounded-xl"
      style={{ background: "var(--aw-gray-100)" }}
    >
      <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-1">
        <h6 className="m-0 text-(--fg-primary)">{title}</h6>
        {action}
      </div>
      <ul className="m-0 flex list-none flex-col px-2 pb-3 pt-1">
        {rows.map((row) => (
          <li
            key={(row.icon ?? "") + row.text}
            className="flex items-center gap-2.5 px-2 py-1.5"
          >
            {row.iconNode ?? (
              <Icon
                name={row.icon!}
                size={16}
                className="shrink-0 text-(--fg-secondary)"
              />
            )}
            <span className="min-w-0 truncate body-sm text-(--fg-primary)">
              {row.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
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
    <div className="overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-raised) shadow-[0_18px_50px_rgba(6,22,61,0.24)]">
      <div className="flex items-center justify-between gap-2 border-b border-(--border-subtle) pl-3 pr-2">
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
                      "relative block aspect-3/2 w-full overflow-hidden rounded-md transition-shadow duration-aw-fast " +
                      (isActive
                        ? "ring-2 ring-(--fg-primary) ring-offset-2 ring-offset-(--bg-raised)"
                        : "hover:ring-1 hover:ring-(--border-default)")
                    }
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${bg})` }}
                    />
                    {isActive && (
                      <span className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-(--fg-primary) text-(--bg-raised)">
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
              className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-(--border-default) bg-(--bg-muted) px-4 py-8 text-center transition-colors hover:bg-(--bg-hover)"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--bg-raised) text-(--fg-primary)">
                <Icon name="upload" size={18} />
              </span>
              <span className="body-xs font-medium text-(--fg-primary)">
                Escolha uma imagem do computador
              </span>
              <span className="body-xs text-(--fg-secondary)">
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
            <p className="m-0 body-xs text-(--fg-tertiary)">
              Insira o URL direto de uma imagem pública.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-(--border-subtle) px-3 py-2">
        <span className="body-xs text-(--fg-tertiary)">
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
