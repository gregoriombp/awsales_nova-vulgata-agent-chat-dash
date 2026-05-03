"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { addInstance, loadInstances } from "@/lib/integrationsStore";

/* ----------------------------------------------------------------
 * Static content — flow copy lives next to the page so reviewers can
 * iterate without chasing types.
 * ---------------------------------------------------------------- */

const STEPS = [
  { id: 1, label: "Pré-requisitos" },
  { id: 2, label: "Conexão Meta" },
  { id: 3, label: "Perfil do número" },
  { id: 4, label: "Pronto" },
] as const;

const PREREQUISITES = [
  {
    id: "business",
    title: "Conta Business no Facebook (Meta)",
    description:
      "Você precisa ter uma conta empresarial no Facebook. Se ainda não tiver, criamos junto durante a conexão.",
    helpLabel: "O que é uma conta Business?",
  },
  {
    id: "phone",
    title: "Número de telefone disponível",
    description:
      "Um número que possa receber SMS ou ligação para verificação. Não pode estar em uso em outro WhatsApp Business.",
    helpLabel: "Que tipos de número são aceitos?",
  },
  {
    id: "admin",
    title: "Acesso de administrador da empresa",
    description:
      "Você precisa ser admin do Business Manager da Meta. Outros usuários da AwSales podem assumir depois.",
    helpLabel: "Como verifico minhas permissões?",
  },
  {
    id: "popups",
    title: "Pop-ups habilitados neste navegador",
    description:
      "A Meta abre uma janela de login. Se o navegador bloquear pop-ups, vamos te avisar antes.",
    helpLabel: "Como permitir pop-ups?",
  },
] as const;

const META_LOGIN_STEPS: { num: number; head: string; tail: string }[] = [
  { num: 1, head: "Entrar com seu Facebook", tail: " ligado ao Business Manager" },
  { num: 2, head: "Selecionar ou criar a Conta WhatsApp Business", tail: " (WABA)" },
  { num: 3, head: "Verificar o número", tail: " por SMS ou ligação" },
  { num: 4, head: "Autorizar a AwSales", tail: " a enviar mensagens em seu nome" },
];

const NEXT_STEPS = [
  {
    id: "template",
    icon: "stacks",
    title: "Crie seu primeiro template",
    desc: "Mensagem de boas-vindas, recuperação de carrinho ou disparo em massa.",
  },
  {
    id: "checkout",
    icon: "power",
    title: "Conecte um checkout",
    desc: "Hotmart, Stripe, Eduzz — leads aprovados caem direto no agente.",
  },
  {
    id: "agent",
    icon: "auto_awesome",
    title: "Configure o agente de IA",
    desc: "Personalidade, conhecimento e gatilhos de transferência.",
  },
] as const;

const CATEGORY_OPTIONS = [
  "Educação",
  "Varejo",
  "Saúde",
  "Serviços profissionais",
  "Beleza e bem-estar",
  "Tecnologia",
  "Outro",
];

const LANGUAGE_OPTIONS = [
  "Português (Brasil)",
  "English (US)",
  "Español (LatAm)",
];

/* ----------------------------------------------------------------
 * Step indicator — 4 numbered dots with dashed connectors.
 * ---------------------------------------------------------------- */

function StepIndicator({ current }: { current: number }) {
  return (
    <ol
      aria-label="Etapas do setup"
      className="flex flex-1 items-center justify-center gap-3 sm:gap-5"
    >
      {STEPS.map((s, i) => {
        const completed = current > s.id;
        const active = current === s.id;
        const last = i === STEPS.length - 1;
        return (
          <li key={s.id} className="flex items-center gap-3 sm:gap-5">
            <span className="flex items-center gap-2.5">
              <span
                aria-current={active ? "step" : undefined}
                className={
                  "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[12.5px] font-semibold " +
                  (completed
                    ? "bg-[var(--aw-emerald-700)] text-white"
                    : active
                      ? "bg-[var(--fg-primary)] text-white"
                      : "bg-[var(--bg-surface)] text-[var(--fg-tertiary)] ring-1 ring-inset ring-[var(--border-subtle)]")
                }
              >
                {completed ? (
                  <Icon name="check" size={16} />
                ) : (
                  s.id
                )}
              </span>
              <span
                className={
                  "text-[13px] " +
                  (active || completed
                    ? "font-medium text-[var(--fg-primary)]"
                    : "text-[var(--fg-tertiary)]")
                }
              >
                {s.label}
              </span>
            </span>
            {!last && (
              <span
                aria-hidden="true"
                className={
                  "hidden h-px w-12 sm:block lg:w-24 " +
                  (completed
                    ? "bg-[var(--aw-emerald-700)]"
                    : "bg-[var(--border-subtle)]")
                }
                style={completed ? undefined : { backgroundImage: "linear-gradient(to right, var(--border-strong) 50%, transparent 0%)", backgroundSize: "6px 1px", backgroundRepeat: "repeat-x", backgroundColor: "transparent" }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ----------------------------------------------------------------
 * Prerequisite checkbox row — a click anywhere on the row toggles.
 * ---------------------------------------------------------------- */

function PrereqRow({
  title,
  description,
  helpLabel,
  checked,
  onToggle,
}: {
  title: string;
  description: string;
  helpLabel: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={
        "flex cursor-pointer items-start gap-3.5 rounded-[var(--radius-md)] border px-4 py-3.5 transition-colors " +
        (checked
          ? "border-[var(--fg-primary)] bg-[var(--bg-surface)]"
          : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface)]")
      }
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-[var(--fg-primary)]"
      />
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold leading-tight text-[var(--fg-primary)]">
          {title}
        </div>
        <p className="m-0 mt-1 text-[13px] leading-[1.5] text-[var(--fg-secondary)]">
          {description}
        </p>
      </div>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="mt-0.5 inline-flex flex-shrink-0 items-center gap-1 text-[12.5px] font-medium text-[var(--accent-fg)] hover:underline"
      >
        {helpLabel}
        <Icon name="north_east" size={14} />
      </a>
    </label>
  );
}

/* ----------------------------------------------------------------
 * Numbered list item used in step 2.
 * ---------------------------------------------------------------- */

function NumberedItem({
  num,
  head,
  tail,
}: {
  num: number;
  head: string;
  tail: string;
}) {
  return (
    <li className="flex items-start gap-3.5">
      <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--fg-primary)] text-[12.5px] font-semibold text-white">
        {num}
      </span>
      <p className="m-0 text-[14.5px] leading-[1.55] text-[var(--fg-primary)]">
        <strong className="font-semibold">{head}</strong>
        <span className="font-normal text-[var(--fg-secondary)]">{tail}</span>
      </p>
    </li>
  );
}

/* ----------------------------------------------------------------
 * Phone preview used in step 3 — purely decorative mock.
 * ---------------------------------------------------------------- */

function PhonePreview({
  displayName,
  description,
}: {
  displayName: string;
  description: string;
}) {
  const name = displayName.trim() || "Sua empresa";
  const monogram = name.charAt(0).toUpperCase();
  const message =
    description.trim() ||
    "Olá! 👋 Sou a Marina, sua atendente virtual. Em que posso ajudar hoje?";
  return (
    <div className="flex w-full max-w-[320px] flex-col items-stretch">
      <p className="mb-3 text-center text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--fg-tertiary)]">
        Como aparece no celular do seu cliente
      </p>
      <div className="rounded-[28px] border-[6px] border-[var(--fg-primary)] bg-white p-0 shadow-sm">
        {/* Top status row */}
        <div className="flex items-center justify-between rounded-t-[22px] bg-[#075E54] px-3 pt-2 text-[10px] text-white/90">
          <span>9:41</span>
          <span className="flex items-center gap-1.5">
            <Icon name="signal_cellular_4_bar" size={12} />
            <Icon name="wifi" size={12} />
            <Icon name="battery_full" size={12} />
          </span>
        </div>
        {/* Header */}
        <div className="flex items-center gap-2.5 bg-[#075E54] px-3 pb-2.5 pt-1.5">
          <Icon name="chevron_left" size={18} className="text-white" />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[13px] font-semibold text-[#075E54]">
            {monogram}
          </div>
          <div className="min-w-0 flex-1 text-white">
            <div className="truncate text-[13px] font-semibold">{name}</div>
            <div className="text-[10.5px] opacity-80">conta empresarial</div>
          </div>
        </div>
        {/* Chat */}
        <div
          className="min-h-[200px] px-3 py-4"
          style={{
            backgroundColor: "#ECE5DD",
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 60% 80%, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
        >
          <div className="max-w-[80%] rounded-[14px] rounded-tl-sm bg-white px-3 py-2 text-[12.5px] leading-[1.45] text-[var(--fg-primary)] shadow-sm">
            {message}
            <div className="mt-1 text-right text-[10px] text-[var(--fg-tertiary)]">
              14:23
            </div>
          </div>
        </div>
      </div>
      {/* Status footer */}
      <div className="mt-3 flex items-center justify-between text-[11.5px]">
        <AwPill variant="live">Conectado</AwPill>
        <span className="text-[var(--fg-tertiary)]">
          Limite inicial:{" "}
          <strong className="text-[var(--fg-primary)]">250 conversas / 24h</strong>
        </span>
      </div>
    </div>
  );
}

/* ================================================================
 * Page
 * ================================================================ */

export default function WhatsAppSetupPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = use(params);
  const router = useRouter();

  const rawStep = Number(step);
  const stepNum =
    Number.isFinite(rawStep) && rawStep >= 1 && rawStep <= 4 ? rawStep : 1;

  const [checkedPrereqs, setCheckedPrereqs] = useState<Record<string, boolean>>(
    {},
  );
  const allPrereqsChecked = PREREQUISITES.every((p) => checkedPrereqs[p.id]);

  const [profile, setProfile] = useState({
    displayName: "",
    category: CATEGORY_OPTIONS[0],
    language: LANGUAGE_OPTIONS[0],
    description: "",
  });

  const userFirstName = "Marina";

  const goTo = (n: number) => router.push(`/setup/whatsapp/${n}`);
  const exitSetup = () => router.push("/integrations");

  /** Persist the new WhatsApp WABA before leaving the success step,
   *  then land the user on the integration's own page (not the global
   *  /integrations grid) so they immediately see the canal they just
   *  configured. We name it "WhatsApp N" where N is the next sequence
   *  so multiple WABAs don't collide. */
  const finishSetup = () => {
    const existing = loadInstances().filter(
      (i) => i.integrationId === "whatsapp",
    );
    const name = existing.length === 0 ? "WhatsApp" : `WhatsApp ${existing.length + 1}`;
    addInstance("whatsapp", name);
    router.push("/integrations/whatsapp");
  };

  const breadcrumbs = [
    { label: "Integrações", href: "/integrations", icon: <Icon name="extension" size={20} /> },
    { label: "WhatsApp", href: "/integrations/whatsapp" },
    { label: "Conectar nova conta" },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8 flex min-h-full flex-col bg-[var(--bg-canvas)]">
        {/* Setup header strip */}
        <header className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-10 py-6">
          <div className="flex items-center gap-3.5">
            <AwBrandLogo brand="whatsapp" size="lg" />
            <div>
              <h1 className="m-0 text-[20px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
                Conectar WhatsApp
              </h1>
              <p className="m-0 mt-0.5 text-[13px] text-[var(--fg-secondary)]">
                Configure seu canal oficial em até 5 minutos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={exitSetup}
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-[13px] text-[var(--fg-secondary)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--fg-primary)]"
          >
            <Icon name="close" size={16} />
            Sair do setup
          </button>
        </header>

        {/* Step indicator strip */}
        <nav
          aria-label="Progresso do setup"
          className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-10 py-4"
        >
          <StepIndicator current={stepNum} />
        </nav>

        {/* Body */}
        <main className="flex-1 px-10 py-10 pb-32">
          {stepNum === 1 && (
            <section className="mx-auto w-full max-w-[820px]">
              <div className="mb-8 flex items-start justify-between gap-6">
                <div>
                  <h2 className="m-0 text-[26px] font-semibold tracking-[-0.015em] text-[var(--fg-primary)]">
                    Antes de começar
                  </h2>
                  <p className="m-0 mt-2 max-w-[480px] text-[14px] leading-[1.55] text-[var(--fg-secondary)]">
                    A integração com WhatsApp é feita pela API oficial da
                    Meta. Vamos verificar 4 itens rápidos para que tudo
                    funcione na primeira tentativa.
                  </p>
                </div>
                <div
                  aria-hidden="true"
                  className="flex h-[88px] w-[88px] flex-shrink-0 items-center justify-center rounded-full bg-[#E8EAFB]"
                >
                  <Icon
                    name="forum"
                    size={40}
                    className="text-[#3D4DC4]"
                    fill={1}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {PREREQUISITES.map((p) => (
                  <PrereqRow
                    key={p.id}
                    title={p.title}
                    description={p.description}
                    helpLabel={p.helpLabel}
                    checked={!!checkedPrereqs[p.id]}
                    onToggle={() =>
                      setCheckedPrereqs((m) => ({ ...m, [p.id]: !m[p.id] }))
                    }
                  />
                ))}
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-md)] border border-[#BFD4FB] bg-[#EAF1FE] px-4 py-3.5 text-[13px] leading-[1.5] text-[var(--fg-primary)]">
                <Icon
                  name="info"
                  size={18}
                  className="mt-0.5 flex-shrink-0 text-[#1F4DC0]"
                />
                <div>
                  <strong>Sem pressa.</strong> Suas tentativas ficam salvas.
                  Se algo der errado durante a conexão com a Meta, você
                  pode retomar daqui.
                </div>
              </div>
            </section>
          )}

          {stepNum === 2 && (
            <section className="mx-auto w-full max-w-[640px] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-10 py-12">
              <div className="flex justify-center">
                <div
                  aria-hidden="true"
                  className="flex h-[112px] w-[112px] items-center justify-center rounded-full bg-[#E8EAFB]"
                >
                  <Icon
                    name="hub"
                    size={52}
                    className="text-[#3D4DC4]"
                    fill={1}
                  />
                </div>
              </div>

              <h2 className="m-0 mt-6 text-center text-[24px] font-semibold tracking-[-0.015em] text-[var(--fg-primary)]">
                Conectar com a Meta Business
              </h2>
              <p className="m-0 mx-auto mt-2 max-w-[460px] text-center text-[14px] leading-[1.55] text-[var(--fg-secondary)]">
                Vamos abrir o login oficial da Meta em uma nova janela. Lá
                você vai:
              </p>

              <ol className="m-0 mt-7 flex list-none flex-col gap-4 p-0">
                {META_LOGIN_STEPS.map((s) => (
                  <NumberedItem
                    key={s.num}
                    num={s.num}
                    head={s.head}
                    tail={s.tail}
                  />
                ))}
              </ol>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t border-[var(--border-subtle)] pt-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--aw-emerald-50,#E6F9EE)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--aw-emerald-700)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--aw-emerald-700)]" />
                  Conexão criptografada · OAuth 2.0
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--fg-secondary)]">
                  <Icon name="lock" size={12} />
                  Token guardado em cofre
                </span>
              </div>
            </section>
          )}

          {stepNum === 3 && (
            <section className="mx-auto grid w-full max-w-[1080px] gap-12 lg:grid-cols-[1fr,minmax(0,360px)]">
              <div>
                <h2 className="m-0 text-[26px] font-semibold tracking-[-0.015em] text-[var(--fg-primary)]">
                  Perfil do seu número
                </h2>
                <p className="m-0 mt-2 max-w-[520px] text-[14px] leading-[1.55] text-[var(--fg-secondary)]">
                  Esses dados aparecem para o seu cliente quando ele recebe
                  a primeira mensagem. Você pode editar depois.
                </p>

                <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[12.5px] text-[var(--fg-secondary)]">
                      <Icon name="call" size={16} />
                      Número conectado
                    </div>
                    <AwPill variant="live">Verificado</AwPill>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[18px] font-semibold tracking-[0.04em] text-[var(--fg-primary)]">
                        +55 31 93618-4119
                      </div>
                      <div className="mt-0.5 text-[12px] text-[var(--fg-tertiary)]">
                        WABA: AwSales · Marina · Cosméticos
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-[13px] font-medium text-[var(--accent-fg)] hover:underline"
                    >
                      Trocar número
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <AwField
                    label="Nome de exibição"
                    htmlFor="display-name"
                    helper="É como aparece no contato dos seus clientes. Pode ser alterado direto na Meta."
                  >
                    <AwInput
                      id="display-name"
                      placeholder="Ex.: Marina Cosméticos"
                      value={profile.displayName}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          displayName: e.target.value,
                        }))
                      }
                    />
                  </AwField>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <AwField label="Categoria" htmlFor="category">
                    <select
                      id="category"
                      value={profile.category}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, category: e.target.value }))
                      }
                      className="aw-input"
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </AwField>
                  <AwField label="Idioma principal" htmlFor="language">
                    <select
                      id="language"
                      value={profile.language}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, language: e.target.value }))
                      }
                      className="aw-input"
                    >
                      {LANGUAGE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </AwField>
                </div>

                <div className="mt-4">
                  <AwField
                    label="Descrição curta (opcional)"
                    htmlFor="description"
                  >
                    <textarea
                      id="description"
                      placeholder="Ex.: Atendimento humano + IA para tirar dúvidas e fechar vendas. Atendemos das 8h às 22h."
                      rows={4}
                      value={profile.description}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      className="aw-input"
                      style={{ minHeight: 96, resize: "vertical" }}
                    />
                  </AwField>
                </div>
              </div>

              <div className="lg:sticky lg:top-6 lg:self-start">
                <PhonePreview
                  displayName={profile.displayName}
                  description={profile.description}
                />
              </div>
            </section>
          )}

          {stepNum === 4 && (
            <section className="mx-auto w-full max-w-[760px]">
              <div className="flex justify-center">
                <div
                  aria-hidden="true"
                  className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#E8EAFB]"
                >
                  <Icon
                    name="rocket_launch"
                    size={56}
                    className="text-[#3D4DC4]"
                    fill={1}
                  />
                </div>
              </div>

              <h2 className="m-0 mt-6 text-center text-[26px] font-semibold tracking-[-0.015em] text-[var(--fg-primary)]">
                Tudo pronto, {userFirstName} 🎉
              </h2>
              <p className="m-0 mx-auto mt-2 max-w-[520px] text-center text-[14px] leading-[1.55] text-[var(--fg-secondary)]">
                Seu canal WhatsApp está conectado e pronto para receber
                leads. Aqui está o que vem agora:
              </p>

              <div className="mx-auto mt-8 flex max-w-[640px] flex-col gap-3">
                {NEXT_STEPS.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className="group flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-4 py-3.5 text-left transition-colors hover:bg-[var(--bg-surface)]"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-surface)] text-[var(--fg-primary)] group-hover:bg-[var(--bg-canvas)]">
                      <Icon name={n.icon} size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14.5px] font-semibold text-[var(--fg-primary)]">
                        {n.title}
                      </div>
                      <p className="m-0 mt-0.5 text-[12.5px] leading-[1.5] text-[var(--fg-secondary)]">
                        {n.desc}
                      </p>
                    </div>
                    <Icon
                      name="chevron_right"
                      size={18}
                      className="text-[var(--fg-tertiary)]"
                    />
                  </button>
                ))}
              </div>

              <div className="mx-auto mt-10 grid max-w-[640px] grid-cols-3 gap-6 border-t border-[var(--border-subtle)] pt-8 text-center">
                <div>
                  <div className="text-[26px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
                    250
                  </div>
                  <div className="mt-1 text-[10.5px] uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
                    Conversas/24h iniciais
                  </div>
                </div>
                <div className="border-x border-[var(--border-subtle)]">
                  <div className="text-[26px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
                    1
                  </div>
                  <div className="mt-1 text-[10.5px] uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
                    Número conectado
                  </div>
                </div>
                <div>
                  <div className="text-[26px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
                    OAuth 2.0
                  </div>
                  <div className="mt-1 text-[10.5px] uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
                    Autenticado
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

        {/* Sticky footer */}
        <footer className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-10 py-4">
          <div className="text-[13px] text-[var(--fg-secondary)]">
            Precisa de ajuda?{" "}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="font-medium text-[var(--accent-fg)] hover:underline"
            >
              Falar com suporte
            </a>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            {stepNum === 1 && (
              <AwButton
                variant="primary"
                size="md"
                iconRight="chevron_right"
                disabled={!allPrereqsChecked}
                onClick={() => goTo(2)}
              >
                Continuar
              </AwButton>
            )}
            {stepNum === 2 && (
              <>
                <AwButton
                  variant="secondary"
                  size="md"
                  iconLeft="chevron_left"
                  onClick={() => goTo(1)}
                >
                  Voltar
                </AwButton>
                <AwButton
                  variant="ghost"
                  size="md"
                  onClick={() => goTo(3)}
                >
                  Pular por enquanto
                </AwButton>
                <AwButton
                  variant="primary"
                  size="md"
                  iconRight="open_in_new"
                  onClick={() => goTo(3)}
                >
                  Conectar com a Meta
                </AwButton>
              </>
            )}
            {stepNum === 3 && (
              <>
                <AwButton
                  variant="secondary"
                  size="md"
                  iconLeft="chevron_left"
                  onClick={() => goTo(2)}
                >
                  Voltar
                </AwButton>
                <AwButton
                  variant="primary"
                  size="md"
                  iconRight="check"
                  onClick={() => goTo(4)}
                >
                  Salvar e finalizar
                </AwButton>
              </>
            )}
            {stepNum === 4 && (
              <AwButton
                variant="primary"
                size="md"
                iconRight="chevron_right"
                onClick={finishSetup}
              >
                Ir para o painel do WhatsApp
              </AwButton>
            )}
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
}
