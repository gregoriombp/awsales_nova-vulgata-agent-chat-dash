"use client";

import { useRef, useState } from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwShortcutTile } from "@/components/ui/AwShortcutTile";
import { AwTabs } from "@/components/ui/AwTabs";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "../_components/shared";
import {
  GROUP_BACKGROUNDS,
  pickGroupBackground,
} from "../equipe-permissoes/_components/data";

/** Capa pré-definida deste usuário — determinística, do mesmo pool de Equipe. */
const DEFAULT_COVER = pickGroupBackground("u-greg");

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
    description: "5 regras ativas · digest semanal desativado",
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

  return (
    <div className="w-full pb-32">
      <section aria-label="Resumo do perfil" className="w-full">
        <div className="relative mx-auto w-full max-w-[1440px] px-10 pt-8">
          <div className="group/cover relative h-[260px] w-full overflow-hidden rounded-t-[var(--radius-lg)]">
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
                  "linear-gradient(180deg, rgba(13,13,15,0.05) 0%, rgba(13,13,15,0.55) 100%)",
              }}
            />
            <div
              className={
                "absolute right-4 top-4 transition-opacity duration-aw-fast " +
                (pickerOpen
                  ? "opacity-100"
                  : "opacity-0 group-hover/cover:opacity-100 focus-within:opacity-100")
              }
            >
              <AwButton
                size="sm"
                variant="secondary"
                iconLeft="image"
                onClick={() => setPickerOpen((v) => !v)}
                aria-expanded={pickerOpen}
              >
                Alterar capa
              </AwButton>
            </div>
            <div className="absolute bottom-4 right-4">
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

          {pickerOpen && (
            <>
              <button
                type="button"
                aria-label="Fechar seletor de capa"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setPickerOpen(false)}
              />
              <div className="absolute right-10 top-[88px] z-50 w-[440px] max-w-[calc(100%-5rem)]">
                <CoverPicker
                  value={cover}
                  defaultCover={DEFAULT_COVER}
                  onChange={setCover}
                  onClose={() => setPickerOpen(false)}
                />
              </div>
            </>
          )}

          <div className="relative z-10 -mt-[88px] flex items-end gap-4">
            <div
              className="ml-6 rounded-full bg-[var(--bg-raised)] p-1.5 shadow-[0_6px_22px_rgba(6,22,61,0.18)]"
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
          </div>
          <div className="ml-6 mt-5 pb-10">
            <h3 className="m-0 text-[var(--fg-primary)]">
              {fullName}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 body-xs text-[var(--fg-secondary)]">
              <span>@greg</span>
              <span aria-hidden="true" className="text-[var(--fg-muted)]">
                ·
              </span>
              <span>{email}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <AwPill variant="ai" dot={false}>
                {role}
              </AwPill>
              <AwPill variant="neutral" dot={false}>
                Workspace Awsales
              </AwPill>
              <AwPill variant="neutral" dot={false}>
                Brasília · GMT−03
              </AwPill>
            </div>
            <p className="m-0 mt-3 max-w-[560px] body-xs text-[var(--fg-secondary)]">
              Suas informações pessoais e como aparecem no produto para o
              restante do time.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1440px] px-10 pt-10">
        <section aria-labelledby="settings-shortcuts-title">
          <header className="mb-4">
            <h6
              id="settings-shortcuts-title"
              className="m-0 mb-1 text-[var(--fg-primary)]"
            >
              Outras configurações
            </h6>
            <p className="m-0 body-xs text-[var(--fg-secondary)]">
              Atalhos para o restante das áreas do workspace.
            </p>
          </header>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SETTINGS_SHORTCUTS.map((item) => (
              <article
                key={item.href}
                className="flex flex-col rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 transition-colors hover:border-[var(--border-default)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-muted)] text-[var(--fg-primary)]">
                    <Icon name={item.icon} size={20} />
                  </span>
                  <AwPill variant={item.status.variant} dot={false}>
                    {item.status.label}
                  </AwPill>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-0.5 body-xs text-[var(--fg-tertiary)]">
                  <span className="font-medium text-[var(--fg-secondary)]">
                    {item.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{item.updatedAt}</span>
                </div>
                <h6 className="m-0 mt-1.5 text-[var(--fg-primary)]">
                  {item.title}
                </h6>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <AwPill key={tag} variant="neutral" dot={false}>
                      {tag}
                    </AwPill>
                  ))}
                </div>

                <div className="mt-auto pt-6">
                  <div className="flex items-end justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
                    <div className="min-w-0">
                      <p className="m-0 truncate body-sm font-medium text-[var(--fg-primary)]">
                        {item.metric}
                      </p>
                      <p className="m-0 mt-0.5 truncate body-xs text-[var(--fg-secondary)]">
                        {item.detail}
                      </p>
                    </div>
                    <AwButton
                      size="sm"
                      variant={item.ctaVariant ?? "primary"}
                      onClick={() => router.push(item.href)}
                    >
                      {item.cta}
                    </AwButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
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
            Trocar foto
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
            {GROUP_BACKGROUNDS.map((bg) => {
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
                Enviar uma imagem
              </span>
              <span className="body-xs text-[var(--fg-secondary)]">
                PNG ou JPG, recomendado 1500×400 px.
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
              Aplicar imagem
            </AwButton>
            <p className="m-0 body-xs text-[var(--fg-tertiary)]">
              Use o endereço direto de uma imagem hospedada na web.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] px-3 py-2">
        <span className="body-xs text-[var(--fg-tertiary)]">
          A capa aparece no seu perfil para todo o time.
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
