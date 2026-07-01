"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
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
  GROUPS,
  MEMBERS,
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
    href: "/settings/financeiro",
    icon: "credit_card",
    title: "Financeiro",
    description: "Plano, pagamento e faturas",
  },
];

const INITIAL_PROFILE = {
  fullName: "Gregório Pinheiro",
  email: "greg@awsales.io",
  phone: "+55 (11) 98765-4321",
  role: "Super Administrador",
  timezone: "America/Sao_Paulo",
  memberSince: "12 jan. 2026",
};

const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "(GMT−3) Brasília — São Paulo" },
  { value: "America/Fortaleza", label: "(GMT−3) Fortaleza" },
  { value: "America/Recife", label: "(GMT−3) Recife" },
  { value: "America/Manaus", label: "(GMT−4) Manaus" },
  { value: "America/Cuiaba", label: "(GMT−4) Cuiabá" },
  { value: "America/Porto_Velho", label: "(GMT−4) Porto Velho" },
  { value: "America/Rio_Branco", label: "(GMT−5) Rio Branco" },
  { value: "America/Noronha", label: "(GMT−2) Fernando de Noronha" },
  { value: "UTC", label: "(GMT+0) UTC" },
];

function tzLabel(value: string) {
  return TIMEZONES.find((t) => t.value === value)?.label ?? value;
}

export default function ProfileSettingsPage() {
  const [fullName, setFullName] = useState(INITIAL_PROFILE.fullName);
  const [email] = useState(INITIAL_PROFILE.email);
  const [phone, setPhone] = useState(INITIAL_PROFILE.phone);
  const [role] = useState(INITIAL_PROFILE.role);
  const [timezone, setTimezone] = useState(INITIAL_PROFILE.timezone);
  const [editOpen, setEditOpen] = useState(false);
  const editNameEmpty = fullName.trim() === "";
  const editDirty =
    fullName.trim() !== INITIAL_PROFILE.fullName ||
    phone !== INITIAL_PROFILE.phone ||
    timezone !== INITIAL_PROFILE.timezone;
  const editCanSave = editDirty && !editNameEmpty;
  const [cover, setCover] = useState(DEFAULT_COVER);
  const [coverPosY, setCoverPosY] = useState(50);
  const [savedPosY, setSavedPosY] = useState(50);
  const [repositioning, setRepositioning] = useState(false);
  const dragRef = useRef<{ startY: number; startPos: number } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  // Reset position when a new cover is picked
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCoverPosY(50);
      setSavedPosY(50);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [cover]);

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
    { icon: "mail", text: email },
    { iconNode: <WhatsAppIcon />, text: "+55 11 98765-4321" },
    { icon: "badge", text: role },
    { icon: "schedule", text: "Brasília · GMT−03" },
    { icon: "translate", text: "Português (Brasil)" },
  ];
  const currentMember = MEMBERS.find((member) => member.isYou);
  const profileGroups = currentMember
    ? GROUPS.filter((group) => group.members.includes(currentMember.id))
    : [];

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
                  <h3 className="m-0 display-sm font-medium text-(--fg-primary)">{fullName}</h3>
                  <a
                    href="https://wa.me/5511987654321"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-(--aw-gray-100) px-2 py-0.5 text-2xs font-medium text-(--fg-secondary) transition-colors duration-aw-fast hover:bg-(--aw-gray-150) hover:text-(--fg-primary)"
                  >
                    <WhatsAppIcon size={12} />
                    <span>+55 11 98765-4321</span>
                  </a>
                </div>
                <p className="m-0 body-xs text-(--fg-secondary)">Designer Engineer at Aswork</p>
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
            <InfoCard title="Perfil público" rows={publicRows} />
            <TeamMembershipCard groups={profileGroups} />
          </aside>

          {/* Coluna direita — atalhos + notificações */}
          <div className="flex flex-col gap-10">
            <section aria-label="Atalhos">
              <SectionHeading
                title="Atalhos"
                description="Acesse outras seções das configurações."
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
              disabled={!editCanSave}
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
          <AwButton
            size="sm"
            variant="secondary"
            iconLeft="upload"
            onClick={() => setPhotoOpen(true)}
          >
            Alterar foto
          </AwButton>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <AwField
            label="Nome completo *"
            htmlFor="profile-name"
            error={editNameEmpty ? "Informe o seu nome para salvar." : undefined}
          >
            <AwInput
              id="profile-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              invalid={editNameEmpty}
              autoComplete="name"
              aria-required="true"
            />
          </AwField>
          <AwField
            label="E-mail"
            htmlFor="profile-email"
            helper="Gerenciado pela organização."
          >
            <AwInput id="profile-email" value={email} disabled />
          </AwField>
          <AwField
            label="Telefone"
            htmlFor="profile-phone"
            helper="Usado para notificações por WhatsApp e contato de cobrança."
          >
            <AwInput
              id="profile-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              autoComplete="tel"
              placeholder="+55 (11) 00000-0000"
            />
          </AwField>
          <AwField
            label="Função"
            htmlFor="profile-role"
            helper="A função é definida pela organização. Fale com um administrador pra alterar."
          >
            <AwInput id="profile-role" value={role} disabled />
          </AwField>
          <AwField label="Fuso horário">
            <AwDropdownMenu
              trigger={
                <AwSelect className="w-full">{tzLabel(timezone)}</AwSelect>
              }
              items={TIMEZONES.map((tz) => ({
                id: tz.value,
                label: tz.label,
                onSelect: () => setTimezone(tz.value),
              }))}
            />
          </AwField>
          <AwField label="Membro desde" htmlFor="profile-member-since">
            <AwInput
              id="profile-member-since"
              value={INITIAL_PROFILE.memberSince}
              disabled
            />
          </AwField>
        </div>
        <p className="mt-5 flex items-center gap-1.5 body-xs text-(--fg-tertiary)">
          <Icon name="lock" size={14} />
          E-mail, função e data de entrada são definidos pela organização. Para
          alterá-los, fale com um administrador.
        </p>
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
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      setPreview(currentSrc);
    });
    return () => window.cancelAnimationFrame(frame);
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

function WhatsAppIcon({ size = 16 }: { size?: number } = {}) {
  return <AwBrandLogo brand="whatsapp" markOnly size={size} className="shrink-0" aria-hidden />;
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
            <span className="min-w-0 truncate body-sm text-(--fg-secondary)">
              {row.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeamMembershipCard({ groups }: { groups: typeof GROUPS }) {
  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{ background: "var(--aw-gray-100)" }}
    >
      <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-3.5">
        <div className="min-w-0">
          <h6 className="m-0 text-(--fg-primary)">Equipes</h6>
          <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
            Times em que você aparece em Membros & funções.
          </p>
        </div>
        <Link
          href="/settings/equipe-permissoes/grupos"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
          aria-label="Abrir equipes"
        >
          <Icon name="arrow_forward" size={16} />
        </Link>
      </div>

      <div className="flex flex-col gap-1 px-2 pb-3">
        {groups.length > 0 ? (
          groups.map((group) => (
            <Link
              key={group.id}
              href="/settings/equipe-permissoes/grupos"
              className="group flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-(--bg-hover)"
            >
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-(--bg-raised) text-(--fg-secondary) group-hover:text-(--fg-primary)">
                <Icon name={group.icon} size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate body-sm font-medium text-(--fg-primary)">
                    {group.name}
                  </span>
                  <AwPill variant="neutral" dot={false} className="shrink-0">
                    {group.memberCount} membros
                  </AwPill>
                </span>
                <span className="mt-0.5 line-clamp-2 block body-xs text-(--fg-secondary)">
                  {group.description}
                </span>
                <span className="mt-1 flex flex-wrap gap-1">
                  {group.roles.map((groupRole) => (
                    <span
                      key={groupRole}
                      className="rounded-sm bg-(--bg-subtle) px-1.5 py-0.5 text-2xs font-medium text-(--fg-tertiary)"
                    >
                      {groupRole}
                    </span>
                  ))}
                </span>
              </span>
            </Link>
          ))
        ) : (
          <div className="rounded-lg px-2 py-3 body-sm text-(--fg-secondary)">
            Nenhuma equipe vinculada ao seu perfil.
          </div>
        )}
      </div>
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
              Cole o link direto de uma imagem pública.
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
