"use client";

import * as React from "react";
import Link from "next/link";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwModal } from "@/components/ui/AwModal";
import { AwToggle } from "@/components/ui/AwToggle";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { ONBOARDING_ORG } from "@/app/primeiro-acesso/_data";
import { SectionHeading, SettingsPageHeader } from "../../_components/shared";

/* ===================================================================== *
 * Mock — política de autenticação da organização (orquestrada via WorkOS).
 * ===================================================================== */

const SSO = {
  provider: "Google Workspace",
  protocol: "SAML 2.0",
  domain: "fyntra.com",
  verified: true,
};

const SCIM = {
  directory: "Google Workspace",
  users: 23,
  groups: 4,
  lastSync: "há 12 min",
};

// Cobertura de MFA — base para a barra visual.
const MFA = {
  viaSso: 23, // gerido pelo IdP
  viaPassword: 12, // membros não-SSO
  withoutMfa: 8, // não-SSO sem TOTP
};

const ACCESS = { people: 35, connections: 48, stale: 3 };

const SESSION_IDLE = ["1h", "4h", "8h", "24h"];
const SESSION_ABSOLUTE = ["8h", "12h", "24h", "7 dias"];

const PASSWORD_RULES = [
  { ok: true, label: "10 a 64 caracteres" },
  { ok: true, label: "Bloqueia senhas vazadas (HIBP)" },
  { ok: false, label: "Sem expiração periódica" },
  { ok: false, label: "Sem perguntas de segurança" },
];

/* ===================================================================== *
 * Página
 * ===================================================================== */

export default function OrgSegurancaPage() {
  const [ssoRequired, setSsoRequired] = React.useState(true);
  const [scimDeprovision, setScimDeprovision] = React.useState(true);
  const [mfaRequired, setMfaRequired] = React.useState(false);
  const [mfaConfirm, setMfaConfirm] = React.useState(false);
  const [idle, setIdle] = React.useState("8h");
  const [absolute, setAbsolute] = React.useState("12h");

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Segurança & acesso"
        description={`Como as pessoas entram na ${ONBOARDING_ORG.name} e quem está com acesso. Vale só para esta organização.`}
      />

      {/* Postura — visão de status em um olhar */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <PostureTile
          icon="vpn_key"
          label="Login único"
          value={ssoRequired ? "Exigido" : "Opcional"}
          tone={ssoRequired ? "ok" : "muted"}
        />
        <PostureTile
          icon="phonelink_lock"
          label="Verificação em 2 etapas"
          value={mfaRequired ? "Obrigatória" : "Pendente"}
          tone={mfaRequired ? "ok" : "warn"}
        />
        <PostureTile icon="password" label="Senha" value="Padrão NIST" tone="ok" />
        <PostureTile
          icon="devices"
          label="Acessos ativos"
          value={`${ACCESS.people} pessoas`}
          tone="muted"
        />
      </div>

      {/* Login único (SSO) */}
      <section className="mt-12">
        <SectionHeading
          title="Login único (SSO)"
          description="A organização entra por um provedor de identidade. A AwSales orquestra o WorkOS — a configuração do IdP acontece no portal."
        />
        <AwCard className="p-0!">
          <div className="flex flex-wrap items-center gap-4 border-b border-(--border-subtle) px-6 py-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary)">
              <Icon name="badge" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 body-sm font-medium text-(--fg-primary)">
                {SSO.provider}
              </p>
              <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                {SSO.protocol} via WorkOS · conexão ativa
              </p>
            </div>
            <StatusPill tone="ok">Conectado</StatusPill>
            <AwButton size="sm" variant="secondary" iconRight="open_in_new">
              Abrir portal
            </AwButton>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-b border-(--border-subtle) px-6 py-4">
            <span className="body-xs text-(--fg-tertiary)">Domínio verificado:</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--aw-emerald-300) bg-(--aw-emerald-100) px-2.5 py-0.5 body-xs font-medium text-(--aw-emerald-800)">
              <Icon name="check_circle" size={13} />
              {SSO.domain}
            </span>
            <button
              type="button"
              className="rounded-md px-1.5 py-0.5 body-xs font-medium text-(--fg-secondary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary)"
            >
              + Adicionar domínio
            </button>
          </div>

          <ToggleLine
            title="Exigir SSO nesta organização"
            note={
              ssoRequired
                ? "Membros entram só pelo provedor. Senha, magic link e login social ficam desativados — e o MFA passa a ser do IdP."
                : "Outros métodos de login (senha, magic link, social) seguem liberados."
            }
            checked={ssoRequired}
            onChange={setSsoRequired}
          />
        </AwCard>
      </section>

      {/* Provisionamento (SCIM) */}
      <section className="mt-12">
        <SectionHeading
          title="Provisionamento automático"
          description="Pessoas e grupos do diretório viram membros e funções aqui — sem convite nem desligamento manual."
        />
        <AwCard className="p-0!">
          <div className="flex flex-wrap items-center gap-4 border-b border-(--border-subtle) px-6 py-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary)">
              <Icon name="sync_alt" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 body-sm font-medium text-(--fg-primary)">
                {SCIM.directory} · SCIM 2.0
              </p>
              <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                {SCIM.users} pessoas · {SCIM.groups} grupos · sincronizado {SCIM.lastSync}
              </p>
            </div>
            <StatusPill tone="ok">Conectado</StatusPill>
            <AwButton size="sm" variant="secondary" iconRight="open_in_new">
              Abrir portal
            </AwButton>
          </div>
          <ToggleLine
            title="Desligar ao remover do diretório"
            note={
              scimDeprovision
                ? "Tirar a pessoa do provedor a inativa aqui automaticamente."
                : "A remoção no provedor não inativa aqui — o desligamento é manual."
            }
            checked={scimDeprovision}
            onChange={setScimDeprovision}
          />
        </AwCard>
      </section>

      {/* MFA */}
      <section className="mt-12">
        <SectionHeading
          title="Verificação em duas etapas"
          description="Exija um segundo fator além da senha. Quem entra por SSO já tem o MFA do provedor — a política alcança só os outros."
        />
        <AwCard className="p-0!">
          <ToggleLine
            title="Obrigatória para toda a organização"
            note={
              mfaRequired
                ? "Quem ainda não tem precisa configurar no próximo acesso."
                : "Ainda não definida — cada pessoa decide."
            }
            checked={mfaRequired}
            onChange={(v) => (v ? setMfaConfirm(true) : setMfaRequired(false))}
          />
          <div className="border-t border-(--border-subtle) px-6 py-5">
            <p className="m-0 mb-2 body-xs text-(--fg-tertiary)">
              Cobertura atual
            </p>
            <CoverageBar
              segments={[
                { value: MFA.viaSso, label: "Pelo provedor (SSO)", tone: "ok" },
                { value: MFA.viaPassword, label: "Por senha + MFA", tone: "info" },
                { value: MFA.withoutMfa, label: "Sem 2 etapas", tone: "warn" },
              ]}
            />
          </div>
        </AwCard>
      </section>

      {/* Política de senha */}
      <section className="mt-12">
        <SectionHeading
          title="Política de senha"
          description="Reflete o que o login exige. Seguimos o NIST SP 800-63 — sem complexidade artificial nem expiração."
        />
        <AwCard className="p-0!">
          <div className="grid grid-cols-1 gap-px bg-(--border-subtle) sm:grid-cols-2">
            {PASSWORD_RULES.map((r) => (
              <div
                key={r.label}
                className="flex items-center gap-2.5 bg-(--bg-raised) px-6 py-4"
              >
                <Icon
                  name={r.ok ? "check_circle" : "block"}
                  size={18}
                  className={r.ok ? "text-(--accent-success)" : "text-(--fg-tertiary)"}
                />
                <span className="body-sm text-(--fg-primary)">{r.label}</span>
              </div>
            ))}
          </div>
        </AwCard>
      </section>

      {/* Sessão */}
      <section className="mt-12">
        <SectionHeading
          title="Sessão"
          description="Por quanto tempo uma pessoa fica conectada antes de precisar entrar de novo."
        />
        <AwCard className="p-0!">
          <SelectLine
            title="Inatividade"
            note="Encerra após esse tempo parado."
            value={idle}
            options={SESSION_IDLE}
            onChange={setIdle}
          />
          <div className="border-t border-(--border-subtle)" />
          <SelectLine
            title="Tempo máximo"
            note="Encerra mesmo em uso após esse total."
            value={absolute}
            options={SESSION_ABSOLUTE}
            onChange={setAbsolute}
          />
        </AwCard>
      </section>

      {/* Acessos à organização */}
      <section className="mt-12">
        <SectionHeading
          title="Acessos à organização"
          description="Quem está com acesso ativo a esta organização. Encerrar um acesso aqui não desconecta a pessoa de outras organizações."
        />
        <AwCard className="p-0!">
          <div className="flex flex-wrap items-center gap-6 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary)">
                <Icon name="devices" size={20} />
              </span>
              <div>
                <p className="m-0 text-xl font-medium tabular-nums text-(--fg-primary)">
                  {ACCESS.people}
                  <span className="ml-1 body-xs font-normal text-(--fg-tertiary)">
                    pessoas
                  </span>
                </p>
                <p className="m-0 body-xs text-(--fg-secondary)">
                  {ACCESS.connections} conexões ativas
                </p>
              </div>
            </div>
            {ACCESS.stale > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-(--aw-amber-300) bg-(--aw-amber-100) px-2.5 py-1 body-xs font-medium text-(--aw-amber-800)">
                <Icon name="schedule" size={13} />
                {ACCESS.stale} sem uso há 30+ dias
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <AwButton asChild size="sm" variant="secondary" iconRight="arrow_forward">
                <Link href="/settings/organizacao/seguranca/acessos">
                  Gerenciar acessos
                </Link>
              </AwButton>
            </div>
          </div>
        </AwCard>
      </section>

      {/* Atalho — Privacidade & auditoria */}
      <section className="mt-12">
        <Link
          href="/settings/organizacao/auditoria"
          className="group flex items-center gap-4 rounded-xl border border-(--border-subtle) bg-(--bg-raised) px-6 py-5 transition-colors duration-aw-fast hover:border-(--border-default) hover:bg-(--bg-hover)"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary)">
            <Icon name="policy" size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 body-sm font-medium text-(--fg-primary)">
              Privacidade & auditoria
            </p>
            <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
              Histórico de atividade, solicitações de dados e exportações.
            </p>
          </div>
          <Icon
            name="arrow_forward"
            size={18}
            className="text-(--fg-tertiary) transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </section>

      {/* Modal — confirmar MFA obrigatória */}
      <AwModal
        open={mfaConfirm}
        onClose={() => setMfaConfirm(false)}
        title="Tornar a verificação em duas etapas obrigatória?"
        footer={
          <>
            <AwButton size="sm" variant="ghost" onClick={() => setMfaConfirm(false)}>
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              onClick={() => {
                setMfaRequired(true);
                setMfaConfirm(false);
              }}
            >
              Tornar obrigatória
            </AwButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="m-0 body-sm text-(--fg-secondary)">
            As sessões abertas de quem ainda não tem o segundo fator serão
            encerradas, e essas pessoas precisarão configurá-lo no próximo
            acesso.
          </p>
          <div className="flex items-start gap-3 rounded-md bg-(--bg-muted) px-4 py-3">
            <Icon name="group" size={18} className="mt-px shrink-0 text-(--fg-secondary)" />
            <p className="m-0 body-xs text-(--fg-secondary)">
              <strong className="font-medium text-(--fg-primary)">
                {MFA.withoutMfa} pessoas
              </strong>{" "}
              ainda sem verificação em duas etapas serão afetadas. Quem entra por
              SSO não muda — o provedor cuida disso.
            </p>
          </div>
        </div>
      </AwModal>
    </div>
  );
}

/* ===================================================================== *
 * Peças visuais
 * ===================================================================== */

const TONES = {
  ok: "text-(--accent-success)",
  warn: "text-(--aw-amber-700)",
  info: "text-(--accent-brand)",
  muted: "text-(--fg-secondary)",
} as const;

function PostureTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  tone: keyof typeof TONES;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-(--border-subtle) bg-(--bg-raised) px-4 py-3.5">
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted)", TONES[tone])}>
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0">
        <p className="m-0 body-xs text-(--fg-tertiary)">{label}</p>
        <p className="m-0 body-sm font-medium text-(--fg-primary)">{value}</p>
      </div>
    </div>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: "ok" | "warn";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 body-xs font-medium",
        tone === "ok"
          ? "border-(--aw-emerald-300) bg-(--aw-emerald-100) text-(--aw-emerald-800)"
          : "border-(--aw-amber-300) bg-(--aw-amber-100) text-(--aw-amber-800)",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "ok" ? "bg-(--accent-success)" : "bg-(--aw-amber-600)",
        )}
      />
      {children}
    </span>
  );
}

function ToggleLine({
  title,
  note,
  checked,
  onChange,
}: {
  title: string;
  note: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="min-w-0 flex-1">
        <p className="m-0 body-sm font-medium text-(--fg-primary)">{title}</p>
        <p className="m-0 mt-0.5 max-w-[560px] body-xs text-(--fg-secondary)">
          {note}
        </p>
      </div>
      <AwToggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

function SelectLine({
  title,
  note,
  value,
  options,
  onChange,
}: {
  title: string;
  note: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="min-w-0 flex-1">
        <p className="m-0 body-sm font-medium text-(--fg-primary)">{title}</p>
        <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">{note}</p>
      </div>
      <div className="inline-flex items-center gap-1 rounded-md border border-(--border-subtle) bg-(--bg-muted) p-1">
        {options.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              aria-pressed={active}
              className={cn(
                "rounded-sm px-2.5 py-1 body-xs font-medium tabular-nums transition-colors duration-aw-fast",
                active
                  ? "bg-(--bg-raised) text-(--fg-primary) shadow-(--shadow-xs)"
                  : "text-(--fg-secondary) hover:text-(--fg-primary)",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const SEGMENT_TONES = {
  ok: { bar: "bg-(--accent-success)", dot: "bg-(--accent-success)" },
  info: { bar: "bg-(--accent-brand)", dot: "bg-(--accent-brand)" },
  warn: { bar: "bg-(--aw-amber-500)", dot: "bg-(--aw-amber-500)" },
} as const;

function CoverageBar({
  segments,
}: {
  segments: { value: number; label: string; tone: keyof typeof SEGMENT_TONES }[];
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-(--bg-muted)">
        {segments.map((seg) => (
          <span
            key={seg.label}
            className={SEGMENT_TONES[seg.tone].bar}
            style={{ width: `${(seg.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {segments.map((seg) => (
          <span key={seg.label} className="inline-flex items-center gap-1.5 body-xs text-(--fg-secondary)">
            <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", SEGMENT_TONES[seg.tone].dot)} />
            <strong className="font-medium tabular-nums text-(--fg-primary)">
              {seg.value}
            </strong>
            {seg.label}
          </span>
        ))}
      </div>
    </div>
  );
}
