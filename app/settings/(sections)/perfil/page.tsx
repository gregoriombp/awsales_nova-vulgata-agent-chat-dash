"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { Icon } from "@/components/ui/Icon";

type PillVariant = "ai" | "neutral" | "live" | "beta" | "error";
type ButtonVariant = "primary" | "danger";

type SettingsShortcut = {
  href: string;
  icon: string;
  category: string;
  updatedAt: string;
  title: string;
  tags: [string, string];
  metric: string;
  detail: string;
  cta: string;
  ctaVariant?: ButtonVariant;
  status: { label: string; variant: PillVariant };
};

const SETTINGS_SHORTCUTS: SettingsShortcut[] = [
  {
    href: "/settings/organizacao",
    icon: "domain",
    category: "Workspace",
    updatedAt: "atualizada há 12 dias",
    title: "Organização",
    tags: ["Verificada", "Slug público"],
    metric: "artificial-concord",
    detail: "Identidade pública do workspace",
    cta: "Configurar",
    status: { label: "Verificada", variant: "ai" },
  },
  {
    href: "/settings/equipe-permissoes",
    icon: "groups",
    category: "Workspace",
    updatedAt: "atualizada hoje",
    title: "Equipe & permissões",
    tags: ["12 membros", "4 grupos"],
    metric: "2 convites",
    detail: "pendentes de aceitação",
    cta: "Gerenciar",
    status: { label: "2 pendências", variant: "beta" },
  },
  {
    href: "/settings/notificacoes",
    icon: "notifications",
    category: "Conta",
    updatedAt: "atualizada há 2 dias",
    title: "Notificações",
    tags: ["Email", "In-app"],
    metric: "5 regras ativas",
    detail: "Digest semanal desativado",
    cta: "Editar",
    status: { label: "Ativas", variant: "live" },
  },
  {
    href: "/settings/aparencia",
    icon: "palette",
    category: "Conta",
    updatedAt: "só neste navegador",
    title: "Aparência",
    tags: ["Tema claro", "Densidade confortável"],
    metric: "Português (Brasil)",
    detail: "Tema, densidade e idioma",
    cta: "Personalizar",
    status: { label: "Pessoal", variant: "neutral" },
  },
  {
    href: "/settings/seguranca",
    icon: "shield",
    category: "Conta",
    updatedAt: "última revisão há 1 mês",
    title: "Segurança",
    tags: ["2FA ativo", "3 sessões"],
    metric: "Senha alterada",
    detail: "há 3 meses",
    cta: "Revisar",
    status: { label: "2FA ativo", variant: "live" },
  },
  {
    href: "/settings/api",
    icon: "key",
    category: "Avançado",
    updatedAt: "última uso há 4 min",
    title: "API & desenvolvedores",
    tags: ["2 chaves ativas", "Auditoria on"],
    metric: "aws_live_8f3a…",
    detail: "Chave de produção",
    cta: "Gerenciar",
    status: { label: "Ativas", variant: "ai" },
  },
  {
    href: "/settings/faturamento",
    icon: "credit_card",
    category: "Workspace",
    updatedAt: "próxima cobrança 14 mai",
    title: "Faturamento & uso",
    tags: ["Plano Pro", "Anual"],
    metric: "R$ 1.890,00",
    detail: "Próxima fatura",
    cta: "Ver fatura",
    status: { label: "Plano Pro", variant: "ai" },
  },
  {
    href: "/settings/zona-de-perigo",
    icon: "warning",
    category: "Avançado",
    updatedAt: "apenas owner do workspace",
    title: "Zona de perigo",
    tags: ["Transferir", "Excluir"],
    metric: "Ações destrutivas",
    detail: "Sem retorno após confirmação",
    cta: "Abrir",
    ctaVariant: "danger",
    status: { label: "Restrita", variant: "error" },
  },
];

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("Gregório Pinheiro");
  const [email] = useState("greg@awsales.io");
  const [role, setRole] = useState("Super Administrador");
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="w-full pb-32">
      <section
        aria-label="Resumo do perfil"
        className="relative w-full overflow-hidden border-b border-[var(--border-subtle)]"
      >
        <div
          aria-hidden="true"
          className="h-[260px] w-full"
          style={{
            background:
              "linear-gradient(180deg, var(--aw-blue-600) 0%, var(--aw-blue-400) 45%, var(--aw-blue-200) 78%, var(--aw-white) 100%)",
          }}
        />
        <div className="mx-auto w-full max-w-[1440px] px-10">
          <div className="-mt-[88px] flex items-end justify-between gap-4">
            <div
              className="rounded-full bg-[var(--bg-raised)] p-1.5 shadow-[0_6px_22px_rgba(6,22,61,0.18)]"
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
            <AwButton
              size="sm"
              variant="secondary"
              iconLeft="edit"
              onClick={() => setEditOpen(true)}
            >
              Editar perfil
            </AwButton>
          </div>
          <div className="mt-5 pb-10">
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
