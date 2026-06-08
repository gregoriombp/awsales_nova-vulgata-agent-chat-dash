"use client";

/* ----------------------------------------------------------------
 * NewCustomIntegrationModal — second step the user lands on when the
 * brand they want isn't in the catalog. Owns the credential form
 * (name, alias, base URL, auth type, token) and a mocked "Test"
 * button. On save, the modal pushes a new CustomIntegration into
 * localStorage and hands the new id back so the page can navigate
 * straight into /tools/new?conn=custom:<id>.
 *
 * The token field is purely cosmetic in the prototype — we mask it
 * to bullets and store only the masked form. Backend will encrypt.
 * ---------------------------------------------------------------- */

import { useEffect, useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";
import {
  slugify,
  type CustomAuthType,
  type CustomIntegration,
} from "@/lib/toolsStore";

const ICON_PRESETS = [
  "bolt",
  "api",
  "data_object",
  "webhook",
  "extension",
  "deployed_code",
  "send",
  "hub",
];

export function NewCustomIntegrationModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (integration: CustomIntegration) => void;
}) {
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [auth, setAuth] = useState<CustomAuthType>("bearer");
  const [token, setToken] = useState("");
  const [icon, setIcon] = useState<string>("api");
  const [testState, setTestState] = useState<"idle" | "ok" | "error">(
    "idle",
  );

  /* Reset on open so reopening after a save does not pre-fill the form
   * with the previous integration's data. */
  useEffect(() => {
    if (!open) return;
    setName("");
    setAlias("");
    setBaseUrl("");
    setAuth("bearer");
    setToken("");
    setIcon("api");
    setTestState("idle");
  }, [open]);

  const requiresToken = auth !== "none";
  const valid =
    name.trim().length >= 2 &&
    (!requiresToken || token.trim().length >= 4) &&
    (!baseUrl.trim() || /^https?:\/\//.test(baseUrl.trim()));

  /* Mocked test runner — we don't actually hit the URL in the
   * prototype, just simulate latency + success based on whether the
   * URL looks plausible. The real test will live server-side. */
  const runTest = () => {
    setTestState("idle");
    if (!baseUrl.trim() || !/^https?:\/\//.test(baseUrl.trim())) {
      setTestState("error");
      return;
    }
    setTimeout(() => {
      setTestState("ok");
    }, 400);
  };

  const submit = () => {
    if (!valid) return;
    const id = `custom-int.${slugify(name)}-${Date.now().toString(36)}`;
    onCreate({
      id,
      name: name.trim(),
      alias: alias.trim() || undefined,
      baseUrl: baseUrl.trim() || undefined,
      auth,
      tokenMasked: requiresToken
        ? "•".repeat(Math.min(token.trim().length, 16))
        : undefined,
      icon,
      addedAt: Date.now(),
    });
  };

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Nova integração personalizada"
      footer={
        <>
          <AwButton variant="secondary" size="md" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton
            variant="ghost"
            size="md"
            iconLeft="play_arrow"
            onClick={runTest}
            disabled={!baseUrl.trim()}
          >
            Testar conexão
          </AwButton>
          <AwButton
            variant="primary"
            size="md"
            iconLeft="add"
            disabled={!valid}
            onClick={submit}
          >
            Criar conexão
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="m-0 body-xs text-(--fg-secondary)">
          Conecte um serviço HTTP que ainda não está no catálogo.
          Depois de criar, você adiciona habilidades dentro dessa
          conexão e elas herdam essa credencial automaticamente.
        </p>

        <AwField label="Nome dessa conexão">
          <AwInput
            placeholder="Ex.: Gourmet API"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
        </AwField>

        <AwField
          label="Apelido"
          helper="Opcional — útil quando você tem mais de uma conexão pra mesma API."
        >
          <AwInput
            placeholder="Ex.: Produção"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            maxLength={40}
          />
        </AwField>

        <AwField
          label="Base URL"
          helper="Opcional — se preencher, as habilidades podem usar caminhos relativos."
        >
          <AwInput
            placeholder="https://api.empresa.com"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            inputMode="url"
            autoCorrect="off"
            spellCheck={false}
          />
        </AwField>

        <AwField label="Tipo de autenticação">
          <InlineSelect
            value={auth}
            onChange={(v) => setAuth(v as CustomAuthType)}
            options={[
              { value: "bearer", label: "Bearer token" },
              { value: "apiKey", label: "API key (header)" },
              { value: "basic", label: "Basic auth" },
              { value: "none", label: "Nenhuma" },
            ]}
            ariaLabel="Tipo de autenticação"
          />
        </AwField>

        {requiresToken && (
          <AwField
            label={auth === "basic" ? "Usuário:senha" : "Token"}
            helper="Não armazenamos em texto puro — o servidor criptografa."
          >
            <AwInput
              type="password"
              placeholder="••••••••••••••••••"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoCorrect="off"
              spellCheck={false}
            />
          </AwField>
        )}

        <div>
          <div className="mb-1.5 body-xs font-medium text-(--fg-secondary)">
            Ícone
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ICON_PRESETS.map((p) => {
              const active = p === icon;
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => setIcon(p)}
                  aria-pressed={active}
                  className={
                    "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors " +
                    (active
                      ? "border-(--fg-primary) bg-(--aw-blue-100) text-(--fg-primary)"
                      : "border-(--border-subtle) text-(--fg-secondary) hover:bg-(--bg-hover)")
                  }
                >
                  <Icon name={p} size={18} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Test result strip — populated by runTest. */}
        {testState !== "idle" && (
          <div
            className={
              "flex items-center gap-2 rounded-xl border px-3 py-2.5 body-xs " +
              (testState === "ok"
                ? "border-(--aw-emerald-150) bg-(--aw-emerald-100) text-(--aw-emerald-800)"
                : "border-(--aw-red-150) bg-(--aw-red-100) text-(--aw-red-700)")
            }
          >
            <Icon
              name={testState === "ok" ? "check_circle" : "error"}
              size={16}
            />
            {testState === "ok"
              ? "Conexão OK · 200"
              : "Não consegui alcançar essa URL. Confere se está completa e começa com https://."}
          </div>
        )}
      </div>
    </AwModal>
  );
}

/* Reused locally — same trick as the page's inline select wrapper. */
function InlineSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  options: { value: string; label: string }[];
  ariaLabel?: string;
}) {
  return (
    <div className="aw-input" style={{ paddingRight: 6 }}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          border: 0,
          outline: 0,
          background: "transparent",
          font: "400 14px/1.4 var(--font-sans)",
          color: "var(--fg-primary)",
          appearance: "none",
          paddingRight: 22,
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="expand_more"
        size={18}
        className="text-(--fg-tertiary)"
        style={{ marginLeft: -22, pointerEvents: "none" }}
      />
    </div>
  );
}
