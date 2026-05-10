"use client";

/* ----------------------------------------------------------------
 * /tools/new — full-page builder for a custom skill.
 *
 * The user lands here from the PickIntegrationModal carrying a
 * `?conn=<scheme>:<id>` query param that pins the parent integration:
 *
 *   - `native:<instanceId>`  → tool reuses an existing OAuth/API key
 *   - `custom:<customIntegrationId>` → tool reuses a user-defined
 *     bearer/api-key/basic credential
 *
 * The page is split-pane: configuration on the left (collapsibles
 * for identity, endpoint, headers/body, response mapping), test
 * runner on the right. The "Activate" button is gated behind a
 * successful test run — same pattern Retool/Make/Zapier ship.
 *
 * In this prototype the test runner is mocked client-side and the
 * created tool is persisted to localStorage. Backend will replace
 * both surfaces when the real API lands.
 * ---------------------------------------------------------------- */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import DashboardLayout from "@/components/DashboardLayout";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";

import {
  findIntegration,
  type IntegrationCatalogItem,
} from "@/lib/integrationsCatalog";
import {
  loadInstances,
  type IntegrationInstance,
} from "@/lib/integrationsStore";
import {
  KIND_LABELS,
  KIND_PILL_VARIANT,
  type ToolKind,
} from "@/lib/toolsCatalog";
import {
  loadCustom,
  loadCustomIntegrations,
  saveCustom,
  slugify,
  type CustomIntegration,
  type CustomTool,
  type CustomToolMethod,
} from "@/lib/toolsStore";

type Parent =
  | {
      kind: "native";
      instance: IntegrationInstance;
      integration: IntegrationCatalogItem;
    }
  | {
      kind: "custom";
      custom: CustomIntegration;
    };

const METHOD_OPTIONS: CustomToolMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
];

export default function NewToolPage() {
  const router = useRouter();
  const params = useSearchParams();
  const conn = params.get("conn") ?? "";

  const [hydrated, setHydrated] = useState(false);
  const [parent, setParent] = useState<Parent | null>(null);

  /* Form state */
  const [name, setName] = useState("");
  const [actionKey, setActionKey] = useState("");
  /* Tracks whether the user has hand-edited the action key. As long as
   * they haven't, we keep deriving it from the display name. The
   * moment they type into the slug field, we stop. */
  const [actionKeyTouched, setActionKeyTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<ToolKind>("read");
  const [method, setMethod] = useState<CustomToolMethod>("POST");
  const [url, setUrl] = useState("");
  const [testInput, setTestInput] = useState(
    '{\n  "lead_id": "lead_abc123"\n}',
  );

  /* Test runner state — drives the Activate gate. */
  const [testStatus, setTestStatus] = useState<
    "idle" | "running" | "ok" | "error"
  >("idle");
  const [testResult, setTestResult] = useState<string>("");

  /* Hydrate from localStorage and resolve parent integration. If the
   * conn param is missing or stale, kick the user back to /tools — we
   * can't render the builder without a parent. */
  useEffect(() => {
    if (!conn) {
      router.replace("/tools");
      return;
    }
    const [scheme, ...rest] = conn.split(":");
    const id = rest.join(":");
    if (scheme === "native") {
      const instance = loadInstances().find((i) => i.instanceId === id);
      if (instance) {
        const integration = findIntegration(instance.integrationId);
        if (integration) {
          setParent({ kind: "native", instance, integration });
          setHydrated(true);
          return;
        }
      }
    } else if (scheme === "custom") {
      const c = loadCustomIntegrations().find((x) => x.id === id);
      if (c) {
        setParent({ kind: "custom", custom: c });
        setHydrated(true);
        return;
      }
    }
    /* Unknown / stale conn — bail. */
    router.replace("/tools");
  }, [conn, router]);

  /* Auto-derive the action key from the display name until the user
   * starts editing the slug field by hand. */
  useEffect(() => {
    if (actionKeyTouched) return;
    setActionKey(slugify(name));
  }, [name, actionKeyTouched]);

  const valid =
    name.trim().length >= 2 &&
    actionKey.trim().length >= 2 &&
    description.trim().length >= 5 &&
    /^https?:\/\//.test(url.trim());

  const canActivate = valid && testStatus === "ok";

  const runTest = () => {
    if (!url.trim()) {
      setTestStatus("error");
      setTestResult("Preencha o endpoint antes de testar.");
      return;
    }
    setTestStatus("running");
    setTestResult("");
    /* Mocked — fakes a 400 ms request and pretends the response is the
     * test input wrapped in a `data` envelope. Good enough for the
     * prototype to demonstrate the gating. */
    setTimeout(() => {
      try {
        const parsed = JSON.parse(testInput || "{}");
        setTestResult(
          JSON.stringify(
            {
              ok: true,
              data: parsed,
              latency_ms: 142,
            },
            null,
            2,
          ),
        );
        setTestStatus("ok");
      } catch {
        setTestStatus("error");
        setTestResult("Input simulado não é JSON válido.");
      }
    }, 400);
  };

  const persist = (active: boolean) => {
    if (!parent) return;
    const id = `custom-tool.${actionKey}-${Date.now().toString(36)}`;
    const tool: CustomTool = {
      id,
      customIntegrationId:
        parent.kind === "custom" ? parent.custom.id : `native:${parent.instance.instanceId}`,
      name: name.trim(),
      actionKey: actionKey.trim(),
      description: description.trim(),
      method,
      url: url.trim(),
      kind,
      icon: "bolt",
      testInput,
      active,
      addedAt: Date.now(),
    };
    const list = loadCustom();
    saveCustom([tool, ...list]);
    router.push("/tools");
  };

  /* ---- Render ---- */

  const breadcrumbs = [
    {
      label: "Habilidades",
      href: "/tools",
      icon: <Icon name="handyman" size={20} />,
    },
    { label: "Nova habilidade" },
  ];

  if (!hydrated || !parent) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="-m-8 min-h-full bg-[var(--bg-canvas)]" />
      </DashboardLayout>
    );
  }

  const parentLogo =
    parent.kind === "native" ? (
      <AwBrandLogo brand={parent.integration.id} size="sm" />
    ) : (
      <div
        className="flex flex-shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-aw-blue-500 via-aw-purple-500 to-aw-teal-500 text-white"
        style={{ width: 32, height: 32 }}
      >
        <Icon name={parent.custom.icon} size={16} />
      </div>
    );
  const parentLabel =
    parent.kind === "native"
      ? parent.instance.name === parent.integration.name
        ? parent.integration.name
        : `${parent.integration.name} · ${parent.instance.name}`
      : parent.custom.alias
        ? `${parent.custom.name} · ${parent.custom.alias}`
        : parent.custom.name;

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8 min-h-full bg-[var(--bg-canvas)]">
        <div className="mx-auto w-full max-w-[1280px] px-10 pt-12 pb-32">
          {/* ---------------- Header ---------------- */}
          <header className="mb-8 border-b border-[var(--border-subtle)] pb-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="m-0 mb-1.5 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--fg-primary)]">
                  Nova habilidade
                </h1>
                <p className="m-0 max-w-[600px] text-sm leading-[1.5] text-[var(--fg-secondary)]">
                  Configure a ação, descreva pra IA quando usar, e
                  rode um teste antes de ativar.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] py-1.5 pl-1.5 pr-3">
                {parentLogo}
                <span className="text-[12px] text-[var(--fg-secondary)]">
                  Herda da conexão{" "}
                  <span className="font-semibold text-[var(--fg-primary)]">
                    {parentLabel}
                  </span>
                </span>
              </div>
            </div>
          </header>

          {/* ---------------- Split-pane ---------------- */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            {/* ----- Config (left) ----- */}
            <section className="flex flex-col gap-4">
              <Collapsible title="Identificação" defaultOpen>
                <div className="flex flex-col gap-4">
                  <AwField label="Nome (display)">
                    <AwInput
                      placeholder="Ex.: agendar-especialista"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={60}
                    />
                  </AwField>

                  <AwField
                    label="Action key (slug imutável)"
                    helper="É como o agente chama essa ação. Não muda mesmo se você renomear."
                  >
                    <AwInput
                      placeholder="agendar-especialista"
                      value={actionKey}
                      onChange={(e) => {
                        setActionKey(e.target.value);
                        setActionKeyTouched(true);
                      }}
                      onBlur={() => {
                        if (!actionKey.trim()) setActionKeyTouched(false);
                      }}
                      maxLength={60}
                    />
                  </AwField>

                  <AwField label="Conexão a que pertence">
                    <div className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2.5">
                      {parentLogo}
                      <span className="text-[13px] text-[var(--fg-primary)]">
                        {parentLabel}
                      </span>
                      <span className="ml-auto text-[11px] uppercase tracking-wider text-[var(--fg-tertiary)]">
                        {parent.kind === "native"
                          ? "Nativa"
                          : "Personalizada"}
                      </span>
                    </div>
                  </AwField>

                  <AwField
                    label="Descrição (pra IA)"
                    helper="Escreva do ponto de vista do agente: quando ele deve chamar essa ação?"
                  >
                    <textarea
                      rows={5}
                      placeholder="Use esta tool quando o lead pedir agendamento. Recebe lead_id e topic, retorna especialista disponível com slots."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="aw-input w-full resize-y px-3 py-2.5 text-[14px] leading-[1.5]"
                      maxLength={500}
                    />
                  </AwField>

                  <AwField label="Categoria">
                    <KindPicker value={kind} onChange={setKind} />
                  </AwField>
                </div>
              </Collapsible>

              <Collapsible title="Endpoint" defaultOpen>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                    <div className="aw-input sm:w-[120px]">
                      <select
                        aria-label="Método HTTP"
                        value={method}
                        onChange={(e) =>
                          setMethod(e.target.value as CustomToolMethod)
                        }
                        className="flex-1 cursor-pointer appearance-none border-0 bg-transparent text-[14px] text-[var(--fg-primary)] outline-none"
                        style={{ paddingRight: 22 }}
                      >
                        {METHOD_OPTIONS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <Icon
                        name="expand_more"
                        size={18}
                        className="text-[var(--fg-tertiary)]"
                        style={{
                          marginLeft: -22,
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <AwInput
                        placeholder={
                          parent.kind === "custom" && parent.custom.baseUrl
                            ? `${parent.custom.baseUrl}/...`
                            : "https://api.empresa.com/agenda"
                        }
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        inputMode="url"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                  {parent.kind === "custom" && parent.custom.baseUrl && (
                    <span className="text-[12px] text-[var(--fg-tertiary)]">
                      Pode usar caminhos relativos —{" "}
                      <span className="font-mono">
                        {parent.custom.baseUrl}
                      </span>{" "}
                      é prefixado automaticamente.
                    </span>
                  )}
                </div>
              </Collapsible>

              <Collapsible title="Headers, query e body">
                <p className="m-0 text-[13px] leading-[1.55] text-[var(--fg-tertiary)]">
                  Headers customizados, query params e schema do body
                  (JSON) — virão depois. Por enquanto a habilidade usa
                  só a credencial da conexão pai e o input do teste.
                </p>
              </Collapsible>

              <Collapsible title="Mapeamento de resposta">
                <p className="m-0 text-[13px] leading-[1.55] text-[var(--fg-tertiary)]">
                  Configure de quais campos da resposta o agente
                  extrai cada variável (ex.{" "}
                  <span className="font-mono">especialista_nome</span>{" "}
                  ←{" "}
                  <span className="font-mono">$.data[0].name</span>).
                </p>
              </Collapsible>
            </section>

            {/* ----- Test (right) ----- */}
            <aside className="flex flex-col gap-4">
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-5">
                <h3 className="m-0 mb-3 text-[15px] font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
                  Teste
                </h3>

                <AwField
                  label="Input simulado"
                  helper="JSON que o agente passaria pra essa habilidade."
                >
                  <textarea
                    rows={6}
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="aw-input w-full resize-y px-3 py-2.5 font-mono text-[12.5px] leading-[1.55]"
                    spellCheck={false}
                  />
                </AwField>

                <div className="mt-3">
                  <AwButton
                    variant="primary"
                    size="md"
                    iconLeft="play_arrow"
                    onClick={runTest}
                    disabled={!url.trim() || testStatus === "running"}
                  >
                    {testStatus === "running"
                      ? "Rodando…"
                      : "Run test"}
                  </AwButton>
                </div>

                {testStatus !== "idle" && (
                  <div
                    className={
                      "mt-4 rounded-xl border px-3 py-2.5 text-[12px] " +
                      (testStatus === "ok"
                        ? "border-[var(--aw-emerald-150)] bg-[var(--aw-emerald-100)] text-[var(--aw-emerald-800)]"
                        : testStatus === "error"
                          ? "border-[var(--aw-red-150)] bg-[var(--aw-red-100)] text-[var(--aw-red-700)]"
                          : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--fg-secondary)]")
                    }
                  >
                    <div className="mb-1 inline-flex items-center gap-1.5 font-medium">
                      <Icon
                        name={
                          testStatus === "ok"
                            ? "check_circle"
                            : testStatus === "error"
                              ? "error"
                              : "schedule"
                        }
                        size={14}
                      />
                      {testStatus === "ok"
                        ? "Teste passou · 200"
                        : testStatus === "error"
                          ? "Teste falhou"
                          : "Rodando…"}
                    </div>
                    {testResult && (
                      <pre className="m-0 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[11.5px] leading-[1.5]">
                        {testResult}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-[12.5px] text-[var(--fg-tertiary)]">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="info" size={14} />
                  Pra ativar a habilidade, o teste precisa passar pelo
                  menos uma vez. Você pode salvar como rascunho a
                  qualquer momento.
                </span>
              </div>
            </aside>
          </div>

          {/* ---------------- Footer ---------------- */}
          <footer className="mt-8 flex flex-wrap justify-end gap-2">
            <AwButton
              variant="ghost"
              size="md"
              onClick={() => router.push("/tools")}
            >
              Cancelar
            </AwButton>
            <AwButton
              variant="secondary"
              size="md"
              iconLeft="save"
              disabled={!valid}
              onClick={() => persist(false)}
            >
              Salvar rascunho
            </AwButton>
            <AwButton
              variant="primary"
              size="md"
              iconLeft="check"
              disabled={!canActivate}
              title={
                !canActivate
                  ? "Preencha os campos obrigatórios e rode o teste com sucesso."
                  : undefined
              }
              onClick={() => persist(true)}
            >
              Ativar habilidade
            </AwButton>
          </footer>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ----------------------------------------------------------------
 * Collapsible — local accordion section. Same grid-rows trick as
 * the packs on /tools so the open/close animation matches.
 * ---------------------------------------------------------------- */

function Collapsible({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--bg-hover)]"
      >
        <span className="flex-1 text-[15px] font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
          {title}
        </span>
        <Icon
          name="expand_more"
          size={18}
          className={`text-[var(--fg-secondary)] transition-transform duration-200 ease-out motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[var(--border-subtle)] px-5 py-5">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
 * KindPicker — radio-style chooser for read / write / action. The
 * lo-fi calls the third one "destrutivo" but the underlying enum is
 * `action`, which the rest of the app already uses.
 * ---------------------------------------------------------------- */

function KindPicker({
  value,
  onChange,
}: {
  value: ToolKind;
  onChange: (next: ToolKind) => void;
}) {
  const items: { id: ToolKind; label: string; helper: string }[] = [
    {
      id: "read",
      label: "Leitura",
      helper: "Consulta dados sem mutar nada.",
    },
    {
      id: "write",
      label: "Escrita",
      helper: "Cria ou altera um recurso.",
    },
    {
      id: "action",
      label: "Ação",
      helper: "Tem efeito visível (envia mensagem, cobra, etc.).",
    },
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {items.map((it) => {
        const active = value === it.id;
        return (
          <button
            type="button"
            key={it.id}
            aria-pressed={active}
            onClick={() => onChange(it.id)}
            className={
              "flex flex-col items-start gap-1.5 rounded-xl border px-3 py-2.5 text-left transition-colors " +
              (active
                ? "border-[var(--fg-primary)] bg-[var(--aw-blue-100)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-hover)]")
            }
          >
            <AwPill variant={KIND_PILL_VARIANT[it.id]} dot={false}>
              {KIND_LABELS[it.id]}
            </AwPill>
            <span className="text-[12px] leading-[1.4] text-[var(--fg-tertiary)]">
              {it.helper}
            </span>
          </button>
        );
      })}
    </div>
  );
}
