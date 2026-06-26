"use client";

import * as React from "react";
import Link from "next/link";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwStatGroup } from "@/components/ui/AwStatGroup";
import { AwToggle } from "@/components/ui/AwToggle";
import { Icon } from "@/components/ui/Icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ONBOARDING_ORG } from "@/app/primeiro-acesso/_data";
import { SectionHeading, SettingsPageHeader } from "../../_components/shared";

/** Indent visual do conteúdo abaixo do SectionHeading — cria a hierarquia
 *  "título da seção é o pai, conteúdo é o filho". Mantido SUTIL e idêntico
 *  em todas as seções pra dar uma única linguagem espacial (sem indent
 *  forte que descola o conteúdo do título). */
const SECTION_CONTENT_INDENT = "pl-0 md:pl-4";

/** Linguagem dos dividers entre itens dentro de uma seção. */
const SECTION_DIVIDERS =
  "flex flex-col divide-y divide-(--border-subtle) [&>*:first-child]:pt-0";

const SSO_LOCK_TOOLTIP =
  "O login único está exigido. Para alterar essa configuração, desative o SSO acima.";

/** Wrapper que comunica visualmente "está desabilitado porque o SSO está
 *  exigido": opacidade rebaixada, sem interação, tooltip ao passar o mouse
 *  explicando o porquê. Usado em Login social, Provisionamento e 2FA. */
function SsoLockedSection({
  locked,
  children,
}: {
  locked: boolean;
  children: React.ReactNode;
}) {
  if (!locked) return <>{children}</>;
  return (
    <TooltipProvider delayDuration={140}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            aria-disabled="true"
            data-sso-locked="true"
            className="cursor-not-allowed select-none opacity-40 transition-opacity duration-aw-fast"
            // O wrapper bloqueia eventos do conteúdo (não dá pra clicar nem
            // arrastar), mas o próprio wrapper continua reagindo ao hover
            // (e o tooltip aparece) — daí o pointer-events-auto no wrapper
            // e none nos filhos.
            style={{ pointerEvents: "auto" }}
          >
            <div style={{ pointerEvents: "none" }}>{children}</div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="max-w-[300px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
        >
          <p className="m-0 mb-1 inline-flex items-center gap-1.5 body-xs font-medium text-(--fg-primary)">
            <Icon name="lock" size={13} />
            Bloqueado pelo SSO
          </p>
          <p className="m-0 body-xs leading-snug">{SSO_LOCK_TOOLTIP}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ===================================================================== *
 * Mock — política de autenticação da organização (orquestrada via WorkOS).
 * ===================================================================== */

const SSO = {
  provider: "Google Workspace",
  protocol: "SAML 2.0",
};

const SCIM = {
  directory: "Google Workspace",
  users: 23,
  groups: 4,
  lastSync: "há 12 min",
};

// Quantas pessoas seriam impactadas ao tornar o 2FA obrigatório — usado no modal de confirmação.
const MFA = { withoutMfa: 8 };

const ACCESS = { people: 35, connections: 48, stale: 3 };

const SESSION_IDLE = ["1h", "4h", "8h", "24h"];
const SESSION_ABSOLUTE = ["1h", "4h", "8h", "24h"];

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
  // Vínculo com o provedor de identidade (Google Workspace). Enquanto
  // conectado, o SSO pode ser exigido; ao desconectar, a organização volta
  // aos métodos de login alternativos.
  const [ssoConnected, setSsoConnected] = React.useState(true);
  const [ssoRequired, setSsoRequired] = React.useState(true);
  // Direção pretendida para o modal de confirmação de "exigir SSO":
  // ligar/desligar/null.
  const [ssoConfirm, setSsoConfirm] = React.useState<null | boolean>(null);
  // Modal de confirmação para DESCONECTAR o provedor de identidade.
  const [ssoDisconnect, setSsoDisconnect] = React.useState(false);
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
  const [absolute, setAbsolute] = React.useState("8h");

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Segurança & acesso"
        description={`Como as pessoas entram na ${ONBOARDING_ORG.name} e quem tem acesso. Aplica-se apenas a esta organização.`}
      />

      {/* Postura — visão de status em um olhar */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <PostureTile
          icon="vpn_key"
          label="Login único"
          value={
            !ssoConnected ? "Desconectado" : ssoRequired ? "Exigido" : "Opcional"
          }
          tone={!ssoConnected ? "warn" : ssoRequired ? "ok" : "muted"}
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

      {/* Login único (SSO) — único bloco que NUNCA fica disabled (é o próprio
       *  switch que desabilita os outros). */}
      <section className="mt-12">
        <SectionHeading
          title="Login único (SSO)"
          description="A organização entra por um provedor de identidade. Configuramos via WorkOS — o IdP em si fica no portal do provedor."
        />
        <div className={cn(SECTION_CONTENT_INDENT, SECTION_DIVIDERS)}>
          {ssoConnected ? (
            <>
              <div className="flex flex-wrap items-center gap-4 py-4 first:pt-0">
                <AwBrandLogo brand="googleworkspace" size="lg" className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="m-0 body-md font-semibold text-(--fg-primary)">
                      {SSO.provider}
                    </p>
                    <StatusPill tone="ok">Conectado</StatusPill>
                  </div>
                  <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                    {SSO.protocol} via WorkOS · conexão ativa
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <AwButton size="sm" variant="secondary" iconRight="open_in_new">
                    Abrir portal
                  </AwButton>
                  <AwButton
                    size="sm"
                    variant="ghost"
                    iconLeft="link_off"
                    onClick={() => setSsoDisconnect(true)}
                  >
                    Desconectar
                  </AwButton>
                </div>
              </div>

              <div className="flex items-center gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="m-0 body-sm font-medium text-(--fg-primary)">
                      Exigir SSO nesta organização
                    </p>
                    <StatusPill tone={ssoRequired ? "ok" : "warn"}>
                      {ssoRequired ? "Exigido" : "Opcional"}
                    </StatusPill>
                  </div>
                  <p className="m-0 mt-0.5 max-w-[560px] body-xs text-(--fg-secondary)">
                    {ssoRequired
                      ? "Membros entram só pelo provedor. Senha, magic link e login social ficam desativados — e o MFA passa a ser do IdP."
                      : "Outros métodos de login (senha, magic link, social) ficam liberados."}
                  </p>
                </div>
                <AwButton
                  size="sm"
                  variant={ssoRequired ? "secondary" : "primary"}
                  iconLeft={ssoRequired ? "lock_open" : "lock"}
                  onClick={() => setSsoConfirm(!ssoRequired)}
                >
                  {ssoRequired ? "Desabilitar" : "Habilitar"}
                </AwButton>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-4 py-4 first:pt-0">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-tertiary)">
                <Icon name="key_off" size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="m-0 body-md font-semibold text-(--fg-primary)">
                    Nenhum provedor conectado
                  </p>
                  <StatusPill tone="warn">Desconectado</StatusPill>
                </div>
                <p className="m-0 mt-0.5 max-w-[560px] body-xs text-(--fg-secondary)">
                  A entrada usa os métodos liberados abaixo (senha, magic link e
                  login social). Conecte um provedor para passar a exigir SSO.
                </p>
              </div>
              <AwButton
                size="sm"
                variant="primary"
                iconLeft="add_link"
                onClick={() => {
                  setSsoConnected(true);
                }}
              >
                Configurar SSO
              </AwButton>
            </div>
          )}
        </div>
      </section>

      {/* Login social — bloqueado quando SSO é exigido. */}
      <section className="mt-12">
        <SectionHeading
          title="Login social"
          description="Login pessoal do Google ou Microsoft. Não é o login único da empresa e não adiciona a equipe automaticamente."
        />
        <SsoLockedSection locked={ssoRequired}>
          <div className={cn(SECTION_CONTENT_INDENT, SECTION_DIVIDERS)}>
            <SocialLine
              brand="gmail"
              title="Google pessoal"
              note="Permite entrar com uma conta @gmail.com ou Google Workspace pessoal."
              checked={socialGoogle}
              onChange={setSocialGoogle}
            />
            <SocialLine
              brand="microsoft"
              title="Microsoft pessoal"
              note="Permite entrar com uma conta Outlook, Live ou Microsoft 365 pessoal."
              checked={socialMicrosoft}
              onChange={setSocialMicrosoft}
            />
          </div>
        </SsoLockedSection>
      </section>

      {/* Provisionamento (SCIM) — bloqueado quando SSO é exigido (a fonte
       *  da verdade passa a ser o provedor). */}
      <section className="mt-12">
        <SectionHeading
          title="Provisionamento automático"
          description="Pessoas e grupos do diretório viram membros e funções aqui — sem convite nem desligamento manual."
        />
        <SsoLockedSection locked={ssoRequired}>
          <div className={cn(SECTION_CONTENT_INDENT, SECTION_DIVIDERS)}>
            <div className="flex flex-wrap items-center gap-4 py-4 first:pt-0">
              <AwBrandLogo
                brand="googleworkspace"
                size="md"
                className="shrink-0"
                aria-label="Google Workspace"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="m-0 body-sm font-medium text-(--fg-primary)">
                    {SCIM.directory} · SCIM 2.0
                  </p>
                  <StatusPill tone="ok">Conectado</StatusPill>
                </div>
                <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                  {SCIM.users} pessoas · {SCIM.groups} grupos · sincronizado {SCIM.lastSync}
                </p>
              </div>
              <AwButton size="sm" variant="secondary" iconRight="open_in_new">
                Abrir portal
              </AwButton>
            </div>
            <ToggleLine
              title="Desligar ao remover do diretório"
              note={
                scimDeprovision
                  ? "Remover do provedor inativa aqui automaticamente."
                  : "A remoção no provedor não inativa aqui — o desligamento é manual."
              }
              checked={scimDeprovision}
              onChange={setScimDeprovision}
            />
          </div>
        </SsoLockedSection>
      </section>

      {/* MFA — bloqueada quando SSO é exigido (segundo fator passa a ser do IdP). */}
      <section className="mt-12">
        <SectionHeading
          title="Verificação em 2 etapas"
          description="Pede um segundo fator além da senha. A política vale só para quem não entra por SSO."
        />
        <SsoLockedSection locked={ssoRequired}>
          <div className={cn(SECTION_CONTENT_INDENT, SECTION_DIVIDERS)}>
            <ToggleLine
              title="Obrigatória para toda a organização"
              note="Ao habilitar, usuários ativos serão desconectados e precisarão configurar um método de autenticação em 2 etapas."
              checked={mfaRequired}
              onChange={(v) => (v ? setMfaConfirm(true) : setMfaDisable(true))}
            />
          </div>
        </SsoLockedSection>
      </section>

      {/* Política de senha */}
      <section className="mt-12">
        <SectionHeading
          title="Política de senha"
          description="Reflete o que o login exige. Seguimos as diretrizes do NIST — sem regras artificiais. Troca periódica fica desligada por padrão."
        />
        <div className={cn(SECTION_CONTENT_INDENT, SECTION_DIVIDERS)}>
          <SelectLine
            title="Trocar a senha periodicamente"
            note="O padrão NIST é não forçar troca. Ajuste só se um contrato ou regulação exigir."
            value={rotation}
            options={PASSWORD_ROTATION}
            onChange={setRotation}
          />
        </div>

        <div className={cn(SECTION_CONTENT_INDENT, "mt-10")}>
          <p className="m-0 mb-3 aw-eyebrow normal-case text-(--fg-tertiary)">
            Recomendado
          </p>
          <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-12">
            {PASSWORD_RULES.map((r) => (
              <div key={r.label} className="flex items-center gap-2">
                <Icon
                  name={r.ok ? "check_circle" : "block"}
                  size={16}
                  className={
                    r.ok ? "text-(--accent-success)" : "text-(--fg-tertiary)"
                  }
                />
                <span className="body-sm text-(--fg-secondary)">{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sessão */}
      <section className="mt-12">
        <SectionHeading
          title="Sessão"
          description="Por quanto tempo uma pessoa fica conectada antes de precisar entrar de novo."
        />
        <div className={cn(SECTION_CONTENT_INDENT, SECTION_DIVIDERS)}>
          <SelectLine
            title="Inatividade"
            note="Encerra a sessão se ficar parada por esse tempo."
            value={idle}
            options={SESSION_IDLE}
            onChange={setIdle}
          />
          <SelectLine
            title="Tempo máximo"
            note="Encerra a sessão após esse tempo, independentemente de atividade."
            value={absolute}
            options={SESSION_ABSOLUTE}
            onChange={setAbsolute}
          />
        </div>
      </section>

      {/* Acessos à organização */}
      <section className="mt-12">
        <AwStatGroup
          title="Acessos à organização"
          description="Quem tem acesso ativo a esta organização. Encerrar um acesso aqui não afeta outras organizações."
          action={
            <AwButton asChild size="sm" variant="primary">
              <Link href="/settings/organizacao/seguranca/acessos">
                Configurações
              </Link>
            </AwButton>
          }
          stats={[
            {
              tone: "neutral",
              icon: "hub",
              value: ACCESS.connections,
              label: "Conexões ativas",
              hint: "Sessões e apps conectados agora",
            },
            {
              tone: "neutral",
              icon: "group",
              value: ACCESS.people,
              label: "Membros da Organização",
              hint: "Pessoas com acesso ativo",
            },
            {
              tone: "neutral",
              icon: "warning",
              value: ACCESS.stale,
              label: "Inativos",
              hint: "Sem uso há 30+ dias",
            },
          ]}
        />
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

      {/* Modal — desconectar o provedor de identidade */}
      <SsoDisconnectModal
        open={ssoDisconnect}
        provider={SSO.provider}
        microsoftLinked={socialMicrosoft}
        googleLinked={socialGoogle}
        onClose={() => setSsoDisconnect(false)}
        onConfirm={(enableMicrosoftFallback) => {
          setSsoConnected(false);
          setSsoRequired(false);
          if (enableMicrosoftFallback) setSocialMicrosoft(true);
          setSsoDisconnect(false);
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
    <div className="flex items-center gap-4 py-4">
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
  brand,
  icon,
  title,
  note,
  checked,
  onChange,
}: {
  brand?: string;
  icon?: string;
  title: string;
  note: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      {brand ? (
        <AwBrandLogo brand={brand} size="sm" className="shrink-0" />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary)">
          <Icon name={icon ?? "language"} size={18} />
        </span>
      )}
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

function SsoDisconnectModal({
  open,
  provider,
  microsoftLinked,
  googleLinked,
  onClose,
  onConfirm,
}: {
  open: boolean;
  provider: string;
  /** Microsoft pessoal já está vinculado lá embaixo no login social? */
  microsoftLinked: boolean;
  /** Google pessoal já está vinculado lá embaixo no login social? */
  googleLinked: boolean;
  onClose: () => void;
  /** enableMicrosoftFallback = ligar o Microsoft pessoal como porta de entrada. */
  onConfirm: (enableMicrosoftFallback: boolean) => void;
}) {
  // Se a pessoa nunca vinculou nenhum login social, desconectar o provedor
  // deixa só senha/magic link de pé — então oferecemos ligar o Microsoft
  // pessoal como alternativa na hora.
  const noSocialFallback = !microsoftLinked && !googleLinked;
  const [enableMicrosoft, setEnableMicrosoft] = React.useState(false);
  React.useEffect(() => {
    if (open) setEnableMicrosoft(false);
  }, [open]);

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title={`Desconectar ${provider}?`}
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton
            size="sm"
            variant="danger"
            iconLeft="link_off"
            onClick={() => onConfirm(noSocialFallback && enableMicrosoft)}
          >
            Desconectar provedor
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="m-0 body-sm text-(--fg-secondary)">
          O login único deixa de valer nesta organização. A entrada passa a usar
          os métodos liberados abaixo — confira o que muda:
        </p>
        <ul className="m-0 flex list-none flex-col gap-2.5 rounded-md bg-(--bg-muted) p-4">
          <li className="flex items-start gap-2.5">
            <Icon
              name="login"
              size={16}
              className="mt-px shrink-0 text-(--fg-secondary)"
            />
            <span className="body-xs text-(--fg-secondary)">
              Senha e magic link voltam a ser permitidos.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Icon
              name="sync_disabled"
              size={16}
              className="mt-px shrink-0 text-(--fg-secondary)"
            />
            <span className="body-xs text-(--fg-secondary)">
              O provisionamento automático e o segundo fator do provedor param —
              a gestão volta a ser manual.
            </span>
          </li>
        </ul>

        {noSocialFallback ? (
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-(--aw-amber-300) bg-(--aw-amber-100) px-4 py-3">
            <span className="mt-0.5">
              <AwCheckbox
                checked={enableMicrosoft}
                onChange={setEnableMicrosoft}
                label="Liberar o login com Microsoft pessoal"
              />
            </span>
            <span className="body-xs text-(--aw-amber-800)">
              Nenhum login social está vinculado. Sem o provedor, só senha e
              magic link ficam de pé.{" "}
              <strong className="font-medium">
                Liberar o login com Microsoft pessoal
              </strong>{" "}
              como porta de entrada agora.
            </span>
          </label>
        ) : null}
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
    <div className="flex items-center gap-4 py-4">
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

