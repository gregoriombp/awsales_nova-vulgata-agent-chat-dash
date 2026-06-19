"use client";

import * as React from "react";
import Link from "next/link";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwField, AwInput } from "@/components/ui/AwInput";
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

// "Sem expiração" é o padrão recomendado; os prazos só existem para casos
// em que um contrato ou regulação exige troca periódica.
const PASSWORD_ROTATION = [
  "Sem expiração",
  "30 dias",
  "60 dias",
  "90 dias",
  "180 dias",
];

const PASSWORD_RULES = [
  { ok: true, label: "10 a 64 caracteres" },
  { ok: true, label: "Bloqueia senhas já expostas em vazamentos conhecidos" },
  { ok: true, label: "Não reaproveita as últimas 5 senhas" },
  { ok: false, label: "Sem perguntas de segurança" },
];

/* ===================================================================== *
 * Página
 * ===================================================================== */

export default function OrgSegurancaPage() {
  const [ssoRequired, setSsoRequired] = React.useState(true);
  // Direção pretendida para o modal de confirmação de SSO: ligar/desligar/null.
  const [ssoConfirm, setSsoConfirm] = React.useState<null | boolean>(null);
  const [scimDeprovision, setScimDeprovision] = React.useState(true);
  const [mfaRequired, setMfaRequired] = React.useState(false);
  const [mfaConfirm, setMfaConfirm] = React.useState(false);
  // Gate de desativação do 2FA + aviso pessoal pós-ativação.
  const [mfaDisable, setMfaDisable] = React.useState(false);
  const [mfaSelfWarn, setMfaSelfWarn] = React.useState(false);
  // Login social por conta pessoal (Google/Microsoft). Bloqueado quando SSO é exigido.
  const [socialGoogle, setSocialGoogle] = React.useState(true);
  const [socialMicrosoft, setSocialMicrosoft] = React.useState(false);
  const [rotation, setRotation] = React.useState("Sem expiração");
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
        <PostureTile icon="password" label="Senha" value="Reforçada" tone="ok" />
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
            <AwBrandLogo brand="googleworkspace" size="md" className="shrink-0" />
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
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 body-xs font-medium text-(--fg-secondary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary)"
            >
              <Icon name="add" size={14} />
              Adicionar domínio
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
            onChange={(v) => setSsoConfirm(v)}
          />
        </AwCard>
      </section>

      {/* Login social */}
      <section className="mt-12">
        <SectionHeading
          title="Login social"
          description="Entrada por conta pessoal do Google ou da Microsoft. Não é o login único da empresa e não traz a equipe automaticamente."
        />
        <AwCard className="p-0!">
          {ssoRequired && (
            <div className="border-b border-(--border-subtle) px-6 pt-5">
              <AwAlert variant="info" icon="shield_lock">
                Enquanto o login único for exigido, o login social fica
                desativado para toda a organização.
              </AwAlert>
            </div>
          )}
          <SocialLine
            icon="g_translate"
            title="Google pessoal"
            note="Permite entrar com uma conta @gmail.com ou Google Workspace pessoal."
            checked={socialGoogle}
            onChange={setSocialGoogle}
            locked={ssoRequired}
          />
          <div className="border-t border-(--border-subtle)" />
          <SocialLine
            icon="window"
            title="Microsoft pessoal"
            note="Permite entrar com uma conta Outlook, Live ou Microsoft 365 pessoal."
            checked={socialMicrosoft}
            onChange={setSocialMicrosoft}
            locked={ssoRequired}
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
            <AwBrandLogo
              brand="googleworkspace"
              size="md"
              className="shrink-0"
              aria-label="Google Workspace"
            />
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
          {ssoRequired && (
            <div className="border-b border-(--border-subtle) px-6 pt-5">
              <AwAlert variant="info" icon="shield_lock">
                Com o login único exigido, o segundo fator de quem entra pelo
                provedor é gerido lá. Esta política alcança só as pessoas que
                entram por senha.
              </AwAlert>
            </div>
          )}
          <ToggleLine
            title="Obrigatória para toda a organização"
            note={
              mfaRequired
                ? "Quem ainda não tem precisa configurar no próximo acesso."
                : "Ainda não definida — cada pessoa decide."
            }
            checked={mfaRequired}
            onChange={(v) => (v ? setMfaConfirm(true) : setMfaDisable(true))}
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
          description="Reflete o que o login exige. Seguimos as diretrizes do NIST — sem complexidade artificial. A troca periódica fica desligada por padrão."
        />
        <AwCard className="p-0!">
          <SelectLine
            title="Trocar a senha periodicamente"
            note="O padrão NIST é não forçar troca. Ajuste só se um contrato ou regulação exigir."
            value={rotation}
            options={PASSWORD_ROTATION}
            onChange={setRotation}
          />
          {rotation !== "Sem expiração" && (
            <div className="border-t border-(--border-subtle) px-6 py-4">
              <AwAlert variant="warning">
                Forçar troca periódica costuma gerar senhas mais fracas e
                repetidas. Mantenha &ldquo;Sem expiração&rdquo; a menos que uma
                exigência externa peça o contrário.
              </AwAlert>
            </div>
          )}
          <div className="border-t border-(--border-subtle) grid grid-cols-1 gap-px bg-(--border-subtle) sm:grid-cols-2">
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
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 border-t border-(--border-subtle) px-6 py-3">
            <Icon name="schedule" size={14} className="shrink-0 text-(--fg-tertiary)" />
            <p className="m-0 body-xs text-(--fg-tertiary)">
              Vale a partir do próximo acesso — as sessões abertas continuam até
              expirar.
            </p>
            <AwButton asChild size="sm" variant="ghost" className="-my-1 h-auto px-1.5 py-0.5">
              <Link href="/settings/organizacao/seguranca/acessos">
                Encerrar agora
              </Link>
            </AwButton>
          </div>
        </AwCard>
      </section>

      {/* Acessos à organização */}
      <section className="mt-12">
        <SectionHeading
          title="Acessos à organização"
          description="Quem está com acesso ativo a esta organização. Encerrar um acesso aqui não desconecta a pessoa de outras organizações."
          action={
            <AwButton asChild size="sm" variant="secondary" iconRight="arrow_forward">
              <Link href="/settings/organizacao/seguranca/acessos">
                Gerenciar acessos
              </Link>
            </AwButton>
          }
        />
        <div className="grid grid-cols-3 gap-3">
          <AccessCard
            tone="blue"
            icon="hub"
            visual="network"
            value={ACCESS.connections}
            label="Conexões ativas"
            hint="Sessões e apps conectados agora"
          />
          <AccessCard
            tone="slate"
            icon="group"
            visual="members"
            value={ACCESS.people}
            label="Membros na organização"
            hint="Pessoas com acesso ativo"
          />
          <AccessCard
            tone="amber"
            icon="history"
            visual="idle"
            value={ACCESS.stale}
            label="Sem uso há 30+ dias"
            hint="Parados — vale revisar"
          />
        </div>
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
                setMfaSelfWarn(true);
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

      {/* Modal — confirmar mudança no "Exigir SSO" */}
      <SsoConfirmModal
        direction={ssoConfirm}
        onClose={() => setSsoConfirm(null)}
        onConfirm={() => {
          if (ssoConfirm !== null) setSsoRequired(ssoConfirm);
          setSsoConfirm(null);
        }}
      />

      {/* Gate — desativar a verificação em duas etapas */}
      <MfaDisableGate
        open={mfaDisable}
        onClose={() => setMfaDisable(false)}
        onConfirm={() => {
          setMfaRequired(false);
          setMfaDisable(false);
        }}
      />

      {/* Modal — aviso pessoal pós-ativação do 2FA */}
      <AwModal
        open={mfaSelfWarn}
        onClose={() => setMfaSelfWarn(false)}
        title="Pronto — 2 etapas agora é obrigatória"
        footer={
          <>
            <AwButton size="sm" variant="ghost" onClick={() => setMfaSelfWarn(false)}>
              Depois
            </AwButton>
            <AwButton asChild size="sm" variant="primary" iconLeft="lock_person">
              <Link href="/settings/perfil/senha">
                Configurar meu segundo fator
              </Link>
            </AwButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="m-0 body-sm text-(--fg-secondary)">
            A regra passou a valer para toda a organização — inclusive para você.
          </p>
          <div className="flex items-start gap-3 rounded-md border border-(--aw-amber-300) bg-(--aw-amber-100) px-4 py-3">
            <Icon name="lock_person" size={18} className="mt-px shrink-0 text-(--aw-amber-700)" />
            <p className="m-0 body-xs text-(--aw-amber-800)">
              Você ainda não configurou o seu segundo fator. Configure agora para
              não ser bloqueado no próximo acesso.
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
  ok: { tint: "bg-(--aw-emerald-100)", fg: "text-(--aw-emerald-700)" },
  warn: { tint: "bg-(--aw-amber-100)", fg: "text-(--aw-amber-700)" },
  info: { tint: "bg-(--aw-blue-100)", fg: "text-(--aw-blue-700)" },
  muted: { tint: "bg-(--bg-muted)", fg: "text-(--fg-secondary)" },
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
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", TONES[tone].tint, TONES[tone].fg)}>
        <Icon name={icon} size={18} fill={1} />
      </span>
      <div className="min-w-0">
        <p className="m-0 body-xs text-(--fg-tertiary)">{label}</p>
        <p className="m-0 body-sm font-medium text-(--fg-primary)">{value}</p>
      </div>
    </div>
  );
}

/* Cartões de acesso — número grande + um grafismo representativo (não é dado:
 * é a ideia da métrica desenhada em line-art monocromático, no idioma das
 * AwBrandIllustration). Cada tom pinta o ícone e o grafismo via currentColor. */
const ACCESS_TONES = {
  blue: { ico: "text-(--aw-blue-600)", art: "text-(--aw-blue-500)" },
  slate: { ico: "text-(--aw-slate-600)", art: "text-(--aw-slate-400)" },
  amber: { ico: "text-(--aw-amber-700)", art: "text-(--aw-amber-500)" },
} as const;

function AccessCard({
  tone,
  icon,
  label,
  value,
  hint,
  visual,
}: {
  tone: keyof typeof ACCESS_TONES;
  icon: string;
  label: string;
  value: number;
  hint: string;
  visual: AccessVisualKind;
}) {
  const t = ACCESS_TONES[tone];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-raised) p-5">
      <AccessVisual
        kind={visual}
        className={cn("pointer-events-none absolute -right-2 -top-2 size-28", t.art)}
      />
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Icon name={icon} size={16} fill={1} className={t.ico} />
          <span className="body-xs font-medium text-(--fg-secondary)">{label}</span>
        </div>
        <p className="m-0 text-3xl font-semibold leading-none tracking-tight tabular-nums text-(--fg-primary)">
          {value}
        </p>
        <p className="m-0 body-xs text-(--fg-tertiary)">{hint}</p>
      </div>
    </div>
  );
}

type AccessVisualKind = "network" | "members" | "idle";

/* Grafismos representativos — monocromáticos (currentColor + opacidade pra
 * profundidade), o disco interno usa --bg-raised pra recortar limpo. */
function AccessVisual({
  kind,
  className,
}: {
  kind: AccessVisualKind;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className={className}>
      {kind === "network" && (
        <>
          <g stroke="currentColor" strokeLinecap="round" opacity={0.3} strokeWidth={1.5}>
            <line x1={26} y1={30} x2={56} y2={20} />
            <line x1={56} y1={20} x2={78} y2={42} />
            <line x1={78} y1={42} x2={52} y2={56} />
            <line x1={56} y1={20} x2={52} y2={56} />
            <line x1={26} y1={30} x2={52} y2={56} />
            <line x1={52} y1={56} x2={26} y2={68} />
            <line x1={52} y1={56} x2={72} y2={74} />
          </g>
          <g stroke="currentColor" opacity={0.25} strokeWidth={1.5}>
            <circle cx={56} cy={20} r={8} />
            <circle cx={52} cy={56} r={9} />
          </g>
          <g fill="currentColor">
            <circle cx={26} cy={30} r={3.5} opacity={0.55} />
            <circle cx={78} cy={42} r={3.5} opacity={0.55} />
            <circle cx={26} cy={68} r={3.5} opacity={0.55} />
            <circle cx={72} cy={74} r={3.5} opacity={0.55} />
            <circle cx={56} cy={20} r={4.5} />
            <circle cx={52} cy={56} r={5} />
          </g>
        </>
      )}

      {kind === "members" && (
        <>
          <g fill="currentColor">
            <circle cx={72} cy={46} r={13} opacity={0.25} />
            <circle cx={34} cy={50} r={13} opacity={0.25} />
          </g>
          <circle cx={53} cy={50} r={19} fill="var(--bg-raised)" />
          <g fill="currentColor">
            <circle cx={53} cy={45} r={6.5} />
            <path d="M40 66 a13 13 0 0 1 26 0 Z" />
          </g>
        </>
      )}

      {kind === "idle" && (
        <>
          <g fill="currentColor">
            <circle cx={80} cy={26} r={2.6} opacity={0.4} />
            <circle cx={90} cy={18} r={1.9} opacity={0.25} />
            <circle cx={97} cy={12} r={1.3} opacity={0.15} />
          </g>
          <circle
            cx={48}
            cy={52}
            r={22}
            fill="var(--bg-raised)"
            stroke="currentColor"
            strokeWidth={2}
          />
          <g stroke="currentColor" strokeLinecap="round" opacity={0.45} strokeWidth={2}>
            <line x1={48} y1={32} x2={48} y2={36} />
            <line x1={68} y1={52} x2={64} y2={52} />
            <line x1={48} y1={72} x2={48} y2={68} />
            <line x1={28} y1={52} x2={32} y2={52} />
          </g>
          <g stroke="currentColor" strokeLinecap="round" strokeWidth={2.4}>
            <line x1={48} y1={52} x2={48} y2={38} />
            <line x1={48} y1={52} x2={59} y2={56} />
          </g>
          <circle cx={48} cy={52} r={2.2} fill="currentColor" />
        </>
      )}
    </svg>
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

function SocialLine({
  icon,
  title,
  note,
  checked,
  onChange,
  locked,
}: {
  icon: string;
  title: string;
  note: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  locked?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary)">
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 body-sm font-medium text-(--fg-primary)">{title}</p>
        <p className="m-0 mt-0.5 max-w-[560px] body-xs text-(--fg-secondary)">
          {note}
        </p>
      </div>
      {locked ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-(--aw-amber-300) bg-(--aw-amber-100) px-2.5 py-0.5 body-xs font-medium text-(--aw-amber-800)">
          <Icon name="lock" size={13} />
          Desativado pelo login único
        </span>
      ) : (
        <AwToggle checked={checked} onChange={onChange} label={title} />
      )}
    </div>
  );
}

function SsoConfirmModal({
  direction,
  onClose,
  onConfirm,
}: {
  /** true = passar a exigir SSO · false = parar de exigir · null = fechado. */
  direction: null | boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const turningOn = direction === true;
  const impacts = turningOn
    ? [
        {
          icon: "block",
          text: "Senha, magic link e login social ficam desativados nesta organização.",
        },
        {
          icon: "shield_lock",
          text: "O segundo fator passa a ser o do provedor de identidade.",
        },
        {
          icon: "person_off",
          text: "Quem ainda não tem conta no provedor perde acesso até ser provisionado.",
        },
      ]
    : [
        {
          icon: "login",
          text: "Senha, magic link e login social voltam a ser permitidos.",
        },
        {
          icon: "groups",
          text: "A entrada deixa de passar só pelo provedor — avalie o impacto na sua política de acesso.",
        },
      ];

  return (
    <AwModal
      open={direction !== null}
      onClose={onClose}
      title={
        turningOn
          ? "Exigir login único nesta organização?"
          : "Parar de exigir login único?"
      }
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton
            size="sm"
            variant={turningOn ? "primary" : "danger"}
            onClick={onConfirm}
          >
            {turningOn ? "Exigir login único" : "Parar de exigir"}
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="m-0 body-sm text-(--fg-secondary)">
          {turningOn
            ? "A partir de agora, todo mundo entra só pelo provedor de identidade. Confira o que muda:"
            : "Outros métodos de login voltam a ficar disponíveis. Confira o que muda:"}
        </p>
        <ul className="m-0 flex list-none flex-col gap-2.5 rounded-md bg-(--bg-muted) p-4">
          {impacts.map((item) => (
            <li key={item.text} className="flex items-start gap-2.5">
              <Icon
                name={item.icon}
                size={16}
                className="mt-px shrink-0 text-(--fg-secondary)"
              />
              <span className="body-xs text-(--fg-secondary)">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </AwModal>
  );
}

const MFA_DISABLE_PHRASE = "DESATIVAR";

function MfaDisableGate({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [ack, setAck] = React.useState(false);
  const [phrase, setPhrase] = React.useState("");
  React.useEffect(() => {
    if (open) {
      setAck(false);
      setPhrase("");
    }
  }, [open]);
  const valid = ack && phrase.trim().toUpperCase() === MFA_DISABLE_PHRASE;

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Desativar a verificação em duas etapas?"
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton size="sm" variant="danger" disabled={!valid} onClick={onConfirm}>
            Desativar 2 etapas
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-md border border-(--aw-red-300) bg-(--aw-red-100) px-4 py-3">
          <Icon name="gpp_bad" size={18} className="mt-px shrink-0 text-(--accent-danger)" />
          <p className="m-0 body-xs text-(--aw-red-800)">
            Sem o segundo fator, quem entra por senha fica só com a senha — e a
            segurança da organização cai. Isso pode contrariar exigências de
            compliance e fica registrado no histórico.
          </p>
        </div>
        <label className="flex cursor-pointer items-start gap-2.5">
          <span className="mt-0.5">
            <AwCheckbox
              checked={ack}
              onChange={setAck}
              label="Entendo que isso reduz a segurança da organização"
            />
          </span>
          <span className="body-sm text-(--fg-secondary)">
            Entendo que isso reduz a segurança da organização e fica no
            histórico.
          </span>
        </label>
        <AwField
          label={`Digite "${MFA_DISABLE_PHRASE}" para confirmar`}
          htmlFor="mfa-disable-confirm"
        >
          <AwInput
            id="mfa-disable-confirm"
            autoComplete="off"
            placeholder={MFA_DISABLE_PHRASE}
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
          />
        </AwField>
      </div>
    </AwModal>
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
