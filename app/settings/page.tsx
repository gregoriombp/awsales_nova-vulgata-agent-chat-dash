"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwPill } from "@/components/ui/AwPill";
import { AwProgress } from "@/components/ui/AwProgress";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwStatusDot } from "@/components/ui/AwStatusDot";
import { AwToggleRow } from "@/components/ui/AwToggle";
import { Icon } from "@/components/ui/Icon";

type SectionId =
  | "profile"
  | "organization"
  | "team"
  | "notifications"
  | "appearance"
  | "security"
  | "api"
  | "billing"
  | "danger";

type Section = {
  id: SectionId;
  label: string;
  icon: string;
};

const SECTIONS: Section[] = [
  { id: "profile", label: "Perfil", icon: "person" },
  { id: "organization", label: "Organização", icon: "domain" },
  { id: "team", label: "Equipe & permissões", icon: "groups" },
  { id: "notifications", label: "Notificações", icon: "notifications" },
  { id: "appearance", label: "Aparência", icon: "palette" },
  { id: "security", label: "Segurança", icon: "shield" },
  { id: "api", label: "API & desenvolvedores", icon: "key" },
  { id: "billing", label: "Faturamento & uso", icon: "credit_card" },
  { id: "danger", label: "Zona de perigo", icon: "warning" },
];

type Theme = "system" | "light" | "dark";
type Density = "comfortable" | "compact";

type Member = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Operador" | "Viewer";
  initials: string;
  avatar?: string;
  status: "active" | "invited";
};

const MEMBERS: Member[] = [
  {
    id: "u-1",
    name: "Gregório Pinheiro",
    email: "greg@awsales.io",
    role: "Owner",
    initials: "GP",
    avatar: "/assets/users/greg.jpg",
    status: "active",
  },
  {
    id: "u-2",
    name: "Gabriel Lima",
    email: "gabriel@awsales.io",
    role: "Admin",
    initials: "GL",
    avatar: "/assets/users/gabriel_lima.jpg",
    status: "active",
  },
  {
    id: "u-3",
    name: "José Júnior",
    email: "jose@awsales.io",
    role: "Operador",
    initials: "JJ",
    avatar: "/assets/users/jose.jpg",
    status: "active",
  },
  {
    id: "u-4",
    name: "Marina Costa",
    email: "marina@cliente.com",
    role: "Viewer",
    initials: "MC",
    status: "invited",
  },
];

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string;
};

const API_KEYS: ApiKey[] = [
  {
    id: "k-prod",
    name: "Produção — backend",
    prefix: "aws_live_8f3a…",
    createdAt: "12 jan 2026",
    lastUsed: "há 4 minutos",
  },
  {
    id: "k-staging",
    name: "Staging",
    prefix: "aws_test_2c91…",
    createdAt: "08 mar 2026",
    lastUsed: "há 2 dias",
  },
];

type Session = {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current?: boolean;
};

const SESSIONS: Session[] = [
  {
    id: "s-1",
    device: "MacBook Pro · Chrome",
    location: "São Paulo, BR",
    lastActive: "agora mesmo",
    current: true,
  },
  {
    id: "s-2",
    device: "iPhone 15 · Safari",
    location: "São Paulo, BR",
    lastActive: "há 2 horas",
  },
  {
    id: "s-3",
    device: "Windows · Firefox",
    location: "Curitiba, BR",
    lastActive: "há 6 dias",
  },
];

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>("profile");
  const refs = useRef<Record<SectionId, HTMLElement | null>>({
    profile: null,
    organization: null,
    team: null,
    notifications: null,
    appearance: null,
    security: null,
    api: null,
    billing: null,
    danger: null,
  });
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Profile state
  const [fullName, setFullName] = useState("Gregório Pinheiro");
  const [email] = useState("greg@awsales.io");
  const [role, setRole] = useState("Super Administrador");

  // Org state
  const [orgName, setOrgName] = useState("Nome da organização");
  const [orgSlug, setOrgSlug] = useState("artificial-concord");

  // Notifications
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

  // Appearance
  const [theme, setTheme] = useState<Theme>("light");
  const [density, setDensity] = useState<Density>("comfortable");
  const [reduceMotion, setReduceMotion] = useState(false);

  // Security
  const [twoFactor, setTwoFactor] = useState(true);

  // Track which section is in view
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const sections = SECTIONS.map((s) => refs.current[s.id]).filter(
      (n): n is HTMLElement => !!n
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = visible[0].target.getAttribute("data-section") as
            | SectionId
            | null;
          if (id) setActive(id);
        }
      },
      {
        root,
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const goTo = (id: SectionId) => {
    const node = refs.current[id];
    const root = scrollRef.current;
    if (!node || !root) return;
    setActive(id);
    const top = node.offsetTop - 24;
    root.scrollTo({ top, behavior: "smooth" });
  };

  const breadcrumbs = useMemo(
    () => [
      { label: "Configurações", icon: <Icon name="tune" size={20} /> },
      { label: SECTIONS.find((s) => s.id === active)?.label ?? "" },
    ],
    [active]
  );

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} mainClassName="!p-0 !overflow-hidden">
      <div className="flex h-full min-h-0 bg-[var(--bg-canvas)]">
        {/* Inline section nav */}
        <aside
          aria-label="Seções de configurações"
          className="hidden w-[260px] shrink-0 border-r border-[var(--border-subtle)] lg:block"
        >
          <div className="sticky top-0 px-6 pt-12 pb-8">
            <p className="m-0 mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--fg-tertiary)]">
              Configurações
            </p>
            <h2 className="m-0 mb-6 text-[18px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
              Workspace
            </h2>
            <nav className="flex flex-col gap-0.5">
              {SECTIONS.map((s) => {
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goTo(s.id)}
                    className={
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium transition-colors duration-aw-fast " +
                      (isActive
                        ? "bg-[var(--bg-muted)] text-[var(--fg-primary)]"
                        : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--fg-primary)]")
                    }
                  >
                    <Icon
                      name={s.icon}
                      size={16}
                      style={{
                        color: isActive
                          ? "var(--fg-primary)"
                          : "var(--fg-tertiary)",
                      }}
                    />
                    {s.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
          style={{ scrollBehavior: "smooth" }}
        >
          <div className="mx-auto w-full max-w-[760px] px-10 pt-14 pb-32">
            <header className="mb-10">
              <h1 className="m-0 mb-2 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--fg-primary)]">
                Configurações
              </h1>
              <p className="m-0 max-w-[520px] text-[13px] leading-[1.55] text-[var(--fg-secondary)]">
                Controle como sua conta, sua organização e seus agentes operam.
                Mudanças aqui afetam todo o workspace.
              </p>
            </header>

            {/* PROFILE */}
            <section
              data-section="profile"
              ref={(el) => {
                refs.current.profile = el;
              }}
              className="mb-14 scroll-mt-6"
            >
              <SectionHeading
                title="Perfil"
                description="Suas informações pessoais e como aparecem no produto."
              />
              <AwCard className="!p-0">
                <div className="flex items-center gap-4 border-b border-[var(--border-subtle)] px-6 py-5">
                  <AwAvatar
                    size="lg"
                    src="/assets/users/greg.jpg"
                    alt={fullName}
                    initials="GP"
                  />
                  <div className="flex-1">
                    <p className="m-0 text-[14px] font-medium text-[var(--fg-primary)]">
                      Foto de perfil
                    </p>
                    <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
                      PNG ou JPG, mínimo 200×200 px.
                    </p>
                  </div>
                  <AwButton size="sm" variant="secondary" iconLeft="upload">
                    Trocar foto
                  </AwButton>
                </div>
                <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
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
                <SaveBar />
              </AwCard>
            </section>

            {/* ORGANIZATION */}
            <section
              data-section="organization"
              ref={(el) => {
                refs.current.organization = el;
              }}
              className="mb-14 scroll-mt-6"
            >
              <SectionHeading
                title="Organização"
                description="Como sua empresa aparece nos agentes, conversas e exportações."
              />
              <AwCard className="!p-0">
                <div className="flex items-center gap-4 border-b border-[var(--border-subtle)] px-6 py-5">
                  <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-[var(--bg-muted)]">
                    <img
                      src="/assets/icon_artificial_concord_organization.png"
                      alt={orgName}
                      width={48}
                      height={48}
                      style={{ objectFit: "cover" }}
                    />
                  </span>
                  <div className="flex-1">
                    <p className="m-0 text-[14px] font-medium text-[var(--fg-primary)]">
                      Logo da organização
                    </p>
                    <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
                      Usada na navegação e nos canais conectados.
                    </p>
                  </div>
                  <AwButton size="sm" variant="secondary" iconLeft="upload">
                    Trocar logo
                  </AwButton>
                </div>
                <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
                  <AwField label="Nome da organização" htmlFor="org-name">
                    <AwInput
                      id="org-name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </AwField>
                  <AwField
                    label="Identificador (URL)"
                    htmlFor="org-slug"
                    helper={`app.awsales.io/${orgSlug}`}
                  >
                    <AwInput
                      id="org-slug"
                      value={orgSlug}
                      onChange={(e) =>
                        setOrgSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-")
                        )
                      }
                    />
                  </AwField>
                  <AwField label="Indústria">
                    <AwSelect>Educação / Infoprodutos</AwSelect>
                  </AwField>
                  <AwField label="Tamanho do time">
                    <AwSelect>11 — 50 pessoas</AwSelect>
                  </AwField>
                  <AwField label="Fuso padrão" className="md:col-span-2">
                    <AwSelect>(GMT−03:00) Brasília · São Paulo</AwSelect>
                  </AwField>
                </div>
                <SaveBar />
              </AwCard>
            </section>

            {/* TEAM */}
            <section
              data-section="team"
              ref={(el) => {
                refs.current.team = el;
              }}
              className="mb-14 scroll-mt-6"
            >
              <SectionHeading
                title="Equipe & permissões"
                description="Quem pode criar agentes, aprovar ações e acessar dados sensíveis."
                action={
                  <AwButton size="sm" variant="primary" iconLeft="person_add">
                    Convidar membro
                  </AwButton>
                }
              />
              <AwCard className="!p-0">
                <ul className="divide-y divide-[var(--border-subtle)]">
                  {MEMBERS.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center gap-4 px-6 py-4"
                    >
                      <AwAvatar
                        size="md"
                        src={m.avatar}
                        alt={m.name}
                        initials={m.initials}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="m-0 truncate text-[13.5px] font-medium text-[var(--fg-primary)]">
                            {m.name}
                          </p>
                          {m.status === "invited" && (
                            <AwPill variant="draft" dot>
                              Convite pendente
                            </AwPill>
                          )}
                        </div>
                        <p className="m-0 truncate text-[12px] text-[var(--fg-secondary)]">
                          {m.email}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <AwSelect>{m.role}</AwSelect>
                      </div>
                      <button
                        type="button"
                        aria-label={`Mais opções para ${m.name}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--fg-tertiary)] transition-colors duration-aw-fast hover:bg-[var(--bg-surface)] hover:text-[var(--fg-primary)]"
                      >
                        <Icon name="more_horiz" size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-[var(--border-subtle)] px-6 py-3">
                  <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
                    Plano atual permite até{" "}
                    <strong className="text-[var(--fg-primary)]">
                      10 membros
                    </strong>
                    . {MEMBERS.length} usados.
                  </p>
                </div>
              </AwCard>
            </section>

            {/* NOTIFICATIONS */}
            <section
              data-section="notifications"
              ref={(el) => {
                refs.current.notifications = el;
              }}
              className="mb-14 scroll-mt-6"
            >
              <SectionHeading
                title="Notificações"
                description="Escolha quando o produto interrompe seu fluxo. Eventos críticos de agente sempre aparecem em /aprovações."
              />
              <AwCard className="!p-0">
                <NotifGroup label="Agentes">
                  <AwToggleRow
                    title="Aprovação pendente"
                    description="Quando um agente solicita autorização para executar uma ação."
                    checked={notif.approvalsEmail}
                    onChange={(v) =>
                      setNotif((n) => ({ ...n, approvalsEmail: v }))
                    }
                  />
                  <AwToggleRow
                    title="Notificar também no app"
                    description="Mostra um indicador na barra lateral em tempo real."
                    checked={notif.approvalsInApp}
                    onChange={(v) =>
                      setNotif((n) => ({ ...n, approvalsInApp: v }))
                    }
                  />
                  <AwToggleRow
                    title="Agente desconectado de um canal"
                    description="WhatsApp, Instagram ou outras integrações que pararam de responder."
                    checked={notif.agentDisconnected}
                    onChange={(v) =>
                      setNotif((n) => ({ ...n, agentDisconnected: v }))
                    }
                  />
                  <AwToggleRow
                    title="Falha em ferramenta"
                    description="Tool retornou erro mais de 3 vezes em uma hora."
                    checked={notif.toolFailure}
                    onChange={(v) =>
                      setNotif((n) => ({ ...n, toolFailure: v }))
                    }
                  />
                </NotifGroup>
                <NotifGroup label="Conversas">
                  <AwToggleRow
                    title="Mensagem urgente flagada"
                    description="Cliente pediu humano, mencionou cancelamento ou usou linguagem sensível."
                    checked={notif.urgentMessage}
                    onChange={(v) =>
                      setNotif((n) => ({ ...n, urgentMessage: v }))
                    }
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
                    onChange={(v) =>
                      setNotif((n) => ({ ...n, weeklyDigest: v }))
                    }
                  />
                </NotifGroup>
              </AwCard>
            </section>

            {/* APPEARANCE */}
            <section
              data-section="appearance"
              ref={(el) => {
                refs.current.appearance = el;
              }}
              className="mb-14 scroll-mt-6"
            >
              <SectionHeading
                title="Aparência"
                description="Aplica somente para sua conta, neste navegador."
              />
              <AwCard className="!p-0">
                <div className="border-b border-[var(--border-subtle)] px-6 py-5">
                  <p className="m-0 mb-3 text-[13px] font-medium text-[var(--fg-primary)]">
                    Tema
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {(
                      [
                        {
                          id: "system",
                          label: "Sistema",
                          icon: "computer",
                        },
                        { id: "light", label: "Claro", icon: "light_mode" },
                        { id: "dark", label: "Escuro", icon: "dark_mode" },
                      ] as { id: Theme; label: string; icon: string }[]
                    ).map((t) => {
                      const isActive = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTheme(t.id)}
                          aria-pressed={isActive}
                          className={
                            "flex min-w-[120px] flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all duration-aw-fast " +
                            (isActive
                              ? "border-[var(--fg-primary)] bg-[var(--bg-raised)] shadow-xs"
                              : "border-[var(--border-default)] bg-[var(--bg-raised)] hover:border-[var(--border-strong)]")
                          }
                        >
                          <Icon name={t.icon} size={18} />
                          <span className="text-[13px] font-medium text-[var(--fg-primary)]">
                            {t.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
                  <AwField
                    label="Densidade"
                    helper="Compacta reduz o espaçamento de listas e tabelas."
                  >
                    <AwSelect>
                      {density === "comfortable" ? "Confortável" : "Compacta"}
                    </AwSelect>
                  </AwField>
                  <AwField label="Idioma da interface">
                    <AwSelect>Português (Brasil)</AwSelect>
                  </AwField>
                </div>
                <div className="border-t border-[var(--border-subtle)] px-6 py-2">
                  <AwToggleRow
                    title="Reduzir movimento"
                    description="Suaviza ou desativa transições e parallax."
                    checked={reduceMotion}
                    onChange={setReduceMotion}
                  />
                </div>
              </AwCard>
            </section>

            {/* SECURITY */}
            <section
              data-section="security"
              ref={(el) => {
                refs.current.security = el;
              }}
              className="mb-14 scroll-mt-6"
            >
              <SectionHeading
                title="Segurança"
                description="Acesso à sua conta e auditoria de sessões."
              />
              <AwCard className="!p-0">
                <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-6 py-5">
                  <div>
                    <p className="m-0 text-[14px] font-medium text-[var(--fg-primary)]">
                      Senha
                    </p>
                    <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
                      Última alteração há 3 meses.
                    </p>
                  </div>
                  <AwButton size="sm" variant="secondary">
                    Alterar senha
                  </AwButton>
                </div>
                <div className="px-6 py-2">
                  <AwToggleRow
                    title="Autenticação em 2 fatores"
                    description="Exige um código do seu app autenticador a cada login."
                    checked={twoFactor}
                    onChange={setTwoFactor}
                  />
                </div>
                <div className="border-t border-[var(--border-subtle)] px-6 py-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="m-0 text-[14px] font-medium text-[var(--fg-primary)]">
                      Sessões ativas
                    </p>
                    <button
                      type="button"
                      className="text-[12px] font-medium text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                    >
                      Encerrar todas as outras
                    </button>
                  </div>
                  <ul className="flex flex-col gap-1">
                    {SESSIONS.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-[var(--bg-surface)]"
                      >
                        <AwStatusDot
                          variant={s.current ? "live" : "neutral"}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="m-0 flex items-center gap-2 text-[13px] font-medium text-[var(--fg-primary)]">
                            {s.device}
                            {s.current && (
                              <AwPill variant="live" dot={false}>
                                Esta sessão
                              </AwPill>
                            )}
                          </p>
                          <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
                            {s.location} · {s.lastActive}
                          </p>
                        </div>
                        {!s.current && (
                          <AwButton size="sm" variant="ghost">
                            Encerrar
                          </AwButton>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </AwCard>
            </section>

            {/* API */}
            <section
              data-section="api"
              ref={(el) => {
                refs.current.api = el;
              }}
              className="mb-14 scroll-mt-6"
            >
              <SectionHeading
                title="API & desenvolvedores"
                description="Conecte seus sistemas internos aos agentes via API. Cada chave é auditada."
                action={
                  <AwButton size="sm" variant="secondary" iconLeft="add">
                    Gerar nova chave
                  </AwButton>
                }
              />
              <AwCard className="!p-0">
                <ul className="divide-y divide-[var(--border-subtle)]">
                  {API_KEYS.map((k) => (
                    <li
                      key={k.id}
                      className="flex items-center gap-4 px-6 py-4"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--bg-muted)] text-[var(--fg-secondary)]">
                        <Icon name="key" size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="m-0 text-[13.5px] font-medium text-[var(--fg-primary)]">
                          {k.name}
                        </p>
                        <p className="m-0 font-mono text-[12px] text-[var(--fg-secondary)]">
                          {k.prefix} · criada {k.createdAt} · usada{" "}
                          {k.lastUsed}
                        </p>
                      </div>
                      <AwButton size="sm" variant="ghost" iconLeft="content_copy">
                        Copiar
                      </AwButton>
                      <AwButton size="sm" variant="ghost" iconLeft="delete">
                        Revogar
                      </AwButton>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] px-6 py-4">
                  <div>
                    <p className="m-0 text-[13px] font-medium text-[var(--fg-primary)]">
                      Webhook signing secret
                    </p>
                    <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
                      Usado para validar payloads recebidos dos agentes.
                    </p>
                  </div>
                  <AwButton size="sm" variant="secondary" iconLeft="autorenew">
                    Rotacionar
                  </AwButton>
                </div>
              </AwCard>
            </section>

            {/* BILLING */}
            <section
              data-section="billing"
              ref={(el) => {
                refs.current.billing = el;
              }}
              className="mb-14 scroll-mt-6"
            >
              <SectionHeading
                title="Faturamento & uso"
                description="Acompanhe consumo dos agentes e o que você paga."
              />
              <AwCard className="!p-0">
                <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-6 py-5">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <p className="m-0 text-[14px] font-medium text-[var(--fg-primary)]">
                        Plano Pro
                      </p>
                      <AwPill variant="ai" dot>
                        Atual
                      </AwPill>
                    </div>
                    <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
                      Próxima cobrança em{" "}
                      <strong className="text-[var(--fg-primary)]">
                        14 de maio de 2026
                      </strong>{" "}
                      · R$ 1.890,00
                    </p>
                  </div>
                  <AwButton size="sm" variant="secondary">
                    Mudar plano
                  </AwButton>
                </div>
                <div className="grid grid-cols-1 gap-5 border-b border-[var(--border-subtle)] px-6 py-5 md:grid-cols-3">
                  <UsageMetric
                    label="Mensagens processadas"
                    value={42180}
                    max={75000}
                  />
                  <UsageMetric
                    label="Ações executadas"
                    value={3120}
                    max={5000}
                  />
                  <UsageMetric
                    label="Agentes ativos"
                    value={8}
                    max={15}
                    valueLabel="8 de 15"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-14 items-center justify-center rounded-md border border-[var(--border-default)] bg-[var(--bg-raised)] text-[10px] font-bold tracking-wider text-[var(--fg-primary)]">
                      VISA
                    </span>
                    <div>
                      <p className="m-0 text-[13px] font-medium text-[var(--fg-primary)]">
                        •••• •••• •••• 4242
                      </p>
                      <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
                        Expira em 09/2028
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <AwButton size="sm" variant="ghost">
                      Faturas
                    </AwButton>
                    <AwButton size="sm" variant="secondary">
                      Atualizar cartão
                    </AwButton>
                  </div>
                </div>
              </AwCard>
            </section>

            {/* DANGER */}
            <section
              data-section="danger"
              ref={(el) => {
                refs.current.danger = el;
              }}
              className="mb-6 scroll-mt-6"
            >
              <SectionHeading
                title="Zona de perigo"
                description="Ações irreversíveis. Confirmamos com você antes de aplicar."
              />
              <AwAlert
                variant="warning"
                title="Antes de excluir, exporte seus dados"
              >
                Conversas, agentes, knowledge bases e logs de execução podem
                ser baixados em JSON.
              </AwAlert>
              <AwCard className="!p-0 mt-4">
                <div className="flex items-center justify-between gap-4 px-6 py-5">
                  <div>
                    <p className="m-0 text-[14px] font-medium text-[var(--fg-primary)]">
                      Exportar todos os dados da organização
                    </p>
                    <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
                      Geramos um arquivo .zip e enviamos para seu email.
                    </p>
                  </div>
                  <AwButton size="sm" variant="secondary" iconLeft="download">
                    Exportar
                  </AwButton>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] px-6 py-5">
                  <div>
                    <p className="m-0 text-[14px] font-medium text-[var(--fg-primary)]">
                      Excluir organização
                    </p>
                    <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
                      Remove agentes, conversas e integrações. Não há como
                      reverter.
                    </p>
                  </div>
                  <AwButton size="sm" variant="danger">
                    Excluir organização
                  </AwButton>
                </div>
              </AwCard>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="m-0 mb-1 text-[18px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
          {title}
        </h2>
        {description && (
          <p className="m-0 max-w-[520px] text-[13px] leading-[1.5] text-[var(--fg-secondary)]">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function NotifGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--border-subtle)] last:border-b-0">
      <p className="m-0 px-6 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
        {label}
      </p>
      <div className="px-6 py-2">{children}</div>
    </div>
  );
}

function SaveBar() {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] px-6 py-3">
      <AwButton size="sm" variant="ghost">
        Cancelar
      </AwButton>
      <AwButton size="sm" variant="primary">
        Salvar alterações
      </AwButton>
    </div>
  );
}

function UsageMetric({
  label,
  value,
  max,
  valueLabel,
}: {
  label: string;
  value: number;
  max: number;
  valueLabel?: string;
}) {
  const pct = Math.round((value / max) * 100);
  const variant = pct >= 90 ? "danger" : pct >= 70 ? "warning" : "default";
  return (
    <AwProgress
      label={label}
      value={value}
      max={max}
      valueLabel={
        valueLabel ?? `${value.toLocaleString("pt-BR")} / ${max.toLocaleString("pt-BR")}`
      }
      variant={variant}
    />
  );
}
