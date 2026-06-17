"use client";

import * as React from "react";
import { useMemo, useState } from "react";

import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwSheet } from "@/components/ui/AwSheet";
import { Icon } from "@/components/ui/Icon";

/* ================================================================
 * Types & options
 * ================================================================ */

export type WabaTemplateCategory = "marketing" | "utility" | "auth";
export type WabaTemplateHeader = "none" | "text" | "image" | "video" | "document";
export type WabaTemplateButtonType = "quick_reply" | "url" | "phone";

export type WabaTemplateButton = {
  id: string;
  type: WabaTemplateButtonType;
  label: string;
  value: string;
};

export type WabaTemplateDraft = {
  name: string;
  category: WabaTemplateCategory;
  language: string;
  header: WabaTemplateHeader;
  /** Object URL or remote URL of the uploaded asset (image/video/document). */
  headerMedia: string | null;
  /** Plain text content that lives above the buttons, supports {{1}} / {{name}} placeholders. */
  body: string;
  buttons: WabaTemplateButton[];
};

const CATEGORY_OPTIONS: { value: WabaTemplateCategory; label: string }[] = [
  { value: "marketing", label: "Marketing" },
  { value: "utility", label: "Utilidade" },
  { value: "auth", label: "Autenticação" },
];

const LANGUAGE_OPTIONS = [
  { value: "pt_BR", label: "Português (Brasil)" },
  { value: "en_US", label: "English (US)" },
  { value: "es_ES", label: "Español (España)" },
  { value: "es_MX", label: "Español (México)" },
];

const HEADER_OPTIONS: { value: WabaTemplateHeader; label: string }[] = [
  { value: "none", label: "Nenhum" },
  { value: "text", label: "Texto" },
  { value: "image", label: "Imagem" },
  { value: "video", label: "Vídeo" },
  { value: "document", label: "Documento" },
];

const BUTTON_TYPE_OPTIONS: { value: WabaTemplateButtonType; label: string }[] = [
  { value: "quick_reply", label: "Resposta rápida" },
  { value: "url", label: "URL" },
  { value: "phone", label: "Telefone" },
];

const MAX_BUTTONS = 3;
const MAX_BODY = 1024;

/** Stand-ins used by the preview to render runtime/fixed variables convincingly. */
const SAMPLE_VAR_VALUES: Record<string, string> = {
  "1": "Greg",
  "2": "30% off",
  "3": "hoje",
  "4": "amanhã",
  nome_empresa: "Marina Cosméticos",
  horario_atendimento: "Seg–Sáb · 8h às 22h",
  link_promo: "marina.com/promo",
};

const DEFAULT_DRAFT: WabaTemplateDraft = {
  name: "",
  category: "marketing",
  language: "pt_BR",
  header: "none",
  headerMedia: null,
  body: "",
  buttons: [],
};

/* ================================================================
 * Inline form helpers
 * ================================================================ */

function FormSelect<T extends string>({
  value,
  onChange,
  options,
  id,
  ariaLabel,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: string }[];
  id?: string;
  ariaLabel?: string;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <AwDropdownMenu
      align="start"
      aria-label={ariaLabel}
      trigger={
        <AwSelect
          id={id}
          aria-label={ariaLabel}
          className="w-full justify-between"
        >
          {current?.label ?? ""}
        </AwSelect>
      }
      items={options.map((o) => ({
        id: o.value,
        label: o.label,
        checked: o.value === value,
        onSelect: () => onChange(o.value),
      }))}
    />
  );
}

function MediaDropzone({
  header,
  media,
  onPick,
  onClear,
}: {
  header: Exclude<WabaTemplateHeader, "none" | "text">;
  media: string | null;
  onPick: (url: string) => void;
  onClear: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const accept =
    header === "image"
      ? "image/*"
      : header === "video"
        ? "video/*"
        : ".pdf,application/pdf";
  const label =
    header === "image"
      ? "imagem"
      : header === "video"
        ? "vídeo"
        : "documento";
  const helper =
    header === "image"
      ? "Recomendado 800×418 · até 5MB"
      : header === "video"
        ? "MP4 · até 16MB"
        : "PDF · até 100MB";

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    onPick(URL.createObjectURL(file));
  };

  if (media) {
    return (
      <div className="relative overflow-hidden rounded-md border border-(--border-default) bg-(--bg-surface)">
        {header === "image" ? (
          // Object URLs are local previews; <img> is fine here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media}
            alt="Pré-visualização do cabeçalho"
            className="block h-[160px] w-full object-cover"
          />
        ) : (
          <div className="flex h-[120px] items-center justify-center text-(--fg-tertiary)">
            <Icon
              name={header === "video" ? "movie" : "description"}
              size={32}
            />
          </div>
        )}
        <button
          type="button"
          onClick={onClear}
          aria-label="Remover mídia"
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[color-mix(in_srgb,var(--fg-primary)_85%,transparent)] text-(--bg-raised) transition-opacity hover:opacity-90"
        >
          <Icon name="close" size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files?.[0]);
      }}
      className="flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-(--border-default) bg-(--bg-canvas) px-4 py-8 text-center transition-colors hover:border-(--fg-primary) hover:bg-(--bg-surface)"
    >
      <Icon name="image" size={22} className="text-(--fg-tertiary)" />
      <span className="body-xs text-(--fg-secondary)">
        Arraste uma {label} ou{" "}
        <span className="font-semibold text-(--aw-blue-600,#1A73E8) underline underline-offset-2">
          selecione
        </span>
      </span>
      <span className="body-xs text-(--fg-tertiary)">{helper}</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </button>
  );
}

function ButtonRow({
  button,
  onChange,
  onRemove,
}: {
  button: WabaTemplateButton;
  onChange: (next: WabaTemplateButton) => void;
  onRemove: () => void;
}) {
  const valuePlaceholder =
    button.type === "url"
      ? "https://exemplo.com"
      : button.type === "phone"
        ? "+55 11 99999-0000"
        : "Texto da resposta";

  return (
    <div className="grid grid-cols-[160px_1fr_auto] items-center gap-2">
      <FormSelect<WabaTemplateButtonType>
        value={button.type}
        onChange={(type) => onChange({ ...button, type })}
        options={BUTTON_TYPE_OPTIONS}
        ariaLabel="Tipo de botão"
      />
      {button.type === "quick_reply" ? (
        <AwInput
          placeholder={valuePlaceholder}
          value={button.label}
          onChange={(e) =>
            onChange({ ...button, label: e.target.value, value: e.target.value })
          }
          aria-label="Texto do botão"
        />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <AwInput
            placeholder="Rótulo"
            value={button.label}
            onChange={(e) => onChange({ ...button, label: e.target.value })}
            aria-label="Rótulo do botão"
          />
          <AwInput
            placeholder={valuePlaceholder}
            value={button.value}
            onChange={(e) => onChange({ ...button, value: e.target.value })}
            aria-label="Valor do botão"
          />
        </div>
      )}
      <AwButton
        variant="ghost"
        size="sm"
        iconOnly="delete"
        aria-label="Remover botão"
        onClick={onRemove}
      />
    </div>
  );
}

/* ================================================================
 * Live preview helpers
 * ================================================================ */

function parseVariables(body: string) {
  const matches = Array.from(body.matchAll(/\{\{([^}]+)\}\}/g)).map((m) =>
    m[1].trim(),
  );
  const runtime = new Set<string>();
  const fixed = new Set<string>();
  for (const v of matches) {
    if (/^\d+$/.test(v)) runtime.add(v);
    else fixed.add(v);
  }
  return { runtime, fixed, total: runtime.size + fixed.size };
}

function renderBodyParts(body: string) {
  const out: { kind: "text" | "var"; value: string; key: string }[] = [];
  const re = /\{\{([^}]+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = re.exec(body)) !== null) {
    if (match.index > lastIndex) {
      out.push({
        kind: "text",
        value: body.slice(lastIndex, match.index),
        key: `t-${i++}`,
      });
    }
    const name = match[1].trim();
    out.push({
      kind: "var",
      value: SAMPLE_VAR_VALUES[name] ?? name,
      key: `v-${i++}`,
    });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < body.length) {
    out.push({ kind: "text", value: body.slice(lastIndex), key: `t-${i++}` });
  }
  return out;
}

function PhonePreview({
  draft,
  accountName,
}: {
  draft: WabaTemplateDraft;
  accountName: string;
}) {
  const parts = renderBodyParts(draft.body);
  const showHeader = draft.header !== "none";

  return (
    <div className="relative mx-auto w-[260px]">
      <div className="overflow-hidden rounded-lg border border-(--border-subtle) bg-[#075E54] shadow-(--shadow-md)">
        {/* Status bar */}
        <div className="flex h-[18px] items-center justify-end bg-[#075E54] px-3 body-xs font-medium text-white/90">
          9:41
        </div>
        {/* Conversation header */}
        <div className="flex items-center gap-2 bg-[#075E54] px-3 pb-2.5 pt-1 text-white">
          <Icon name="arrow_back" size={18} className="opacity-90" />
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 body-xs font-semibold">
            {accountName.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate body-xs font-semibold leading-tight">
              {accountName}
            </div>
            <div className="truncate body-xs opacity-80">
              conta empresarial
            </div>
          </div>
        </div>
        {/* Chat area */}
        <div
          className="min-h-[420px] bg-[#E5DDD5] px-3 py-3"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
        >
          {/* Message bubble */}
          <div className="ml-1 max-w-[260px] rounded-md rounded-tl-[3px] bg-white px-2 pb-1.5 pt-2 shadow-[0_1px_0_rgba(0,0,0,0.08)]">
            {/* Header preview */}
            {showHeader && (
              <div className="mb-1.5 overflow-hidden rounded-xs">
                {draft.header === "image" && draft.headerMedia ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={draft.headerMedia}
                    alt=""
                    className="block h-[120px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[100px] items-center justify-center bg-[#D9D9D9] text-[#7A7A7A]">
                    <Icon
                      name={
                        draft.header === "video"
                          ? "movie"
                          : draft.header === "document"
                            ? "description"
                            : "image"
                      }
                      size={28}
                    />
                  </div>
                )}
              </div>
            )}
            {/* Body */}
            <div className="whitespace-pre-wrap wrap-break-word body-xs text-[#111B21]">
              {parts.length === 0 ? (
                <span className="text-[#9AA0A6]">Comece a digitar o corpo…</span>
              ) : (
                parts.map((p) =>
                  p.kind === "text" ? (
                    <span key={p.key}>{p.value}</span>
                  ) : (
                    <strong key={p.key}>{p.value}</strong>
                  ),
                )
              )}
            </div>
            <div className="mt-1 flex items-center justify-end gap-1 body-xs text-[#667781]">
              14:23
              <Icon name="done_all" size={12} className="text-[#53BDEB]" />
            </div>
          </div>
          {/* Inline buttons */}
          {draft.buttons.length > 0 && (
            <div className="ml-1 mt-1 flex max-w-[260px] flex-col gap-px overflow-hidden rounded-sm bg-white body-xs">
              {draft.buttons.map((b, i) => {
                const icon =
                  b.type === "url"
                    ? "north_east"
                    : b.type === "phone"
                      ? "phone"
                      : "reply";
                return (
                  <button
                    key={b.id}
                    type="button"
                    className={
                      "flex items-center justify-center gap-1 px-3 py-2 text-[#008069] " +
                      (i > 0 ? "border-t border-[#E9EDEF]" : "")
                    }
                  >
                    <Icon name={icon} size={14} />
                    {b.label || "Sem rótulo"}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
 * Public component
 * ================================================================ */

export type AwTemplateBuilderSheetProps = {
  open: boolean;
  onClose: () => void;
  /** Account name that appears in the preview header. */
  accountName?: string;
  initialDraft?: Partial<WabaTemplateDraft>;
  onSaveDraft?: (draft: WabaTemplateDraft) => void;
  onSubmit?: (draft: WabaTemplateDraft) => void;
};

export function AwTemplateBuilderSheet({
  open,
  onClose,
  accountName = "Marina Cosméticos",
  initialDraft,
  onSaveDraft,
  onSubmit,
}: AwTemplateBuilderSheetProps) {
  const [draft, setDraft] = useState<WabaTemplateDraft>(() => ({
    ...DEFAULT_DRAFT,
    ...initialDraft,
  }));

  React.useEffect(() => {
    if (open) {
      setDraft({ ...DEFAULT_DRAFT, ...initialDraft });
    }
  }, [open, initialDraft]);

  const variables = useMemo(() => parseVariables(draft.body), [draft.body]);
  const charCount = draft.body.length;

  const setField = <K extends keyof WabaTemplateDraft>(
    key: K,
    value: WabaTemplateDraft[K],
  ) => setDraft((d) => ({ ...d, [key]: value }));

  const addButton = () => {
    if (draft.buttons.length >= MAX_BUTTONS) return;
    setDraft((d) => ({
      ...d,
      buttons: [
        ...d.buttons,
        {
          id: `btn-${Date.now()}`,
          type: "quick_reply",
          label: "",
          value: "",
        },
      ],
    }));
  };

  const updateButton = (id: string, next: WabaTemplateButton) =>
    setDraft((d) => ({
      ...d,
      buttons: d.buttons.map((b) => (b.id === id ? next : b)),
    }));

  const removeButton = (id: string) =>
    setDraft((d) => ({ ...d, buttons: d.buttons.filter((b) => b.id !== id) }));

  const nameValid = /^[a-z0-9_]*$/.test(draft.name);
  const canSubmit = draft.name.length > 0 && nameValid && draft.body.length > 0;

  const mediaCount =
    draft.header !== "none" && draft.header !== "text" ? 1 : 0;

  return (
    <AwSheet
      open={open}
      onClose={onClose}
      size="wide"
      title="Novo template"
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="body-xs text-(--fg-tertiary)">
            Tempo médio de aprovação pela Meta: 12 min
          </div>
          <div className="flex items-center gap-2">
            <AwButton variant="ghost" size="md" onClick={onClose}>
              Cancelar
            </AwButton>
            <AwButton
              variant="secondary"
              size="md"
              onClick={() => onSaveDraft?.(draft)}
            >
              Salvar rascunho
            </AwButton>
            <AwButton
              variant="primary"
              size="md"
              iconLeft="send"
              disabled={!canSubmit}
              onClick={() => onSubmit?.(draft)}
            >
              Enviar para aprovação
            </AwButton>
          </div>
        </div>
      }
    >
      <div className="grid h-full gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Form column */}
        <div className="flex min-w-0 flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <AwField
              label="Nome técnico"
              htmlFor="tpl-name"
              error={
                !nameValid
                  ? "Apenas letras minúsculas, números e _"
                  : undefined
              }
              helper={
                nameValid ? "Apenas minúsculas, números e _" : undefined
              }
            >
              <AwInput
                id="tpl-name"
                value={draft.name}
                onChange={(e) =>
                  setField(
                    "name",
                    e.target.value.toLowerCase().replace(/\s+/g, "_"),
                  )
                }
                placeholder="boas_vindas_pt_v4"
              />
            </AwField>

            <AwField label="Categoria" htmlFor="tpl-cat">
              <FormSelect<WabaTemplateCategory>
                id="tpl-cat"
                value={draft.category}
                onChange={(v) => setField("category", v)}
                options={CATEGORY_OPTIONS}
              />
            </AwField>
          </div>

          <AwField label="Idioma" htmlFor="tpl-lang">
            <FormSelect
              id="tpl-lang"
              value={draft.language}
              onChange={(v) => setField("language", v)}
              options={LANGUAGE_OPTIONS}
            />
          </AwField>

          <AwField label="Cabeçalho (opcional)" htmlFor="tpl-header">
            <FormSelect<WabaTemplateHeader>
              id="tpl-header"
              value={draft.header}
              onChange={(v) => {
                setField("header", v);
                if (v === "none" || v === "text") setField("headerMedia", null);
              }}
              options={HEADER_OPTIONS}
            />
          </AwField>

          {(draft.header === "image" ||
            draft.header === "video" ||
            draft.header === "document") && (
            <MediaDropzone
              header={draft.header}
              media={draft.headerMedia}
              onPick={(url) => setField("headerMedia", url)}
              onClear={() => setField("headerMedia", null)}
            />
          )}

          <AwField
            label="Corpo"
            htmlFor="tpl-body"
            helper={`Use {{1}} para variáveis de runtime e {{nome_var}} para variáveis fixas. Caracteres: ${charCount}/${MAX_BODY}`}
          >
            <textarea
              id="tpl-body"
              value={draft.body}
              maxLength={MAX_BODY}
              onChange={(e) => setField("body", e.target.value)}
              rows={6}
              placeholder="Olá, {{1}}! 👋 Bem-vindo(a) à {{nome_empresa}}. Estamos com {{2}} ativo até {{horario_atendimento}}."
              className="w-full resize-y rounded-md border border-(--border-default) bg-(--bg-canvas) px-3 py-2.5 body-xs text-(--fg-primary) outline-hidden transition-colors placeholder:text-(--fg-tertiary) focus:border-(--aw-blue-500)"
            />
          </AwField>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="m-0 body-xs font-semibold text-(--fg-primary)">
                Botões{" "}
                <span className="body-xs font-normal text-(--fg-tertiary)">
                  (até {MAX_BUTTONS})
                </span>
              </h3>
              <span className="body-xs text-(--fg-tertiary)">
                {draft.buttons.length}/{MAX_BUTTONS}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {draft.buttons.map((b) => (
                <ButtonRow
                  key={b.id}
                  button={b}
                  onChange={(next) => updateButton(b.id, next)}
                  onRemove={() => removeButton(b.id)}
                />
              ))}
              {draft.buttons.length < MAX_BUTTONS && (
                <AwButton
                  variant="ghost"
                  size="sm"
                  iconLeft="add"
                  onClick={addButton}
                >
                  Adicionar botão
                </AwButton>
              )}
            </div>
          </div>
        </div>

        {/* Preview column */}
        <aside className="flex flex-col gap-3 border-l border-(--border-subtle) pl-8">
          <div className="body-xs font-semibold uppercase tracking-label text-(--fg-tertiary)">
            Pré-visualização
          </div>
          <PhonePreview draft={draft} accountName={accountName} />
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 body-xs text-(--fg-tertiary)">
            <span>
              {variables.total}{" "}
              {variables.total === 1 ? "variável" : "variáveis"}
            </span>
            <span aria-hidden>·</span>
            <span>
              {draft.buttons.length}{" "}
              {draft.buttons.length === 1 ? "botão" : "botões"}
            </span>
            <span aria-hidden>·</span>
            <span>
              {mediaCount} {mediaCount === 1 ? "mídia" : "mídias"}
            </span>
          </div>
        </aside>
      </div>
    </AwSheet>
  );
}

export default AwTemplateBuilderSheet;
