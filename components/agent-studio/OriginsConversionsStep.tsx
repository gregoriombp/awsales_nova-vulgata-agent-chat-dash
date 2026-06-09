"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwModal } from "@/components/ui/AwModal";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { Icon } from "@/components/ui/Icon";

/* ───────── Origens e Conversões (Agent Studio · etapa opcional) ─────────
 * Reconstrução da Tela 05 do Figma "Origem e conversão". Três cards:
 *   1. Origem do cliente   → plataforma + objeto/subobjeto + eventos acionadores
 *   2. Template inicial     → template padrão + overrides por evento (modal)
 *   3. Evento de conversão  → mesma config de plataforma da origem
 * Estado é interno: a etapa é opcional e os valores não saem do protótipo.
 * `onValidityChange` informa ao wizard se há ao menos uma config concluída,
 * pra habilitar o "Avançar". */

type Priority = "Alta" | "Média" | "Baixa";

interface Platform {
  id: string;
  brand: string;
  name: string;
}

const PLATFORMS: Platform[] = [
  { id: "stripe", brand: "stripe", name: "Stripe" },
  { id: "calendly", brand: "calendly", name: "Calendly" },
  { id: "hotmart", brand: "hotmart", name: "Hotmart" },
  { id: "pipedrive", brand: "pipedrive", name: "Pipedrive" },
  { id: "slack", brand: "slack", name: "Slack" },
];

const OBJECTS = ["Fyntra", "Fyntra Labs"];
const SUBOBJECTS: Record<string, string[]> = {
  Fyntra: ["Fyntra Growth", "Fyntra Starter", "Fyntra Scale"],
  "Fyntra Labs": ["Labs Beta", "Labs Internal"],
};

const TRIGGER_EVENTS = [
  "Pagamento falhou",
  "Assinatura criada",
  "Assinatura cancelada",
  "Assinatura atualizada",
  "Cliente excluído",
  "Reembolso iniciado",
  "Reembolso concluído",
  "Fatura paga",
  "Fatura gerada",
  "Fatura expirada",
  "Cliente criado",
  "Cobrança bem-sucedida",
];

interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  priority: Priority;
  body: string;
}

const TEMPLATES: MessageTemplate[] = [
  {
    id: "abertura_padrao_fyntra",
    name: "abertura_padrao_fyntra",
    category: "Marketing",
    priority: "Alta",
    body: "Olá! Seja bem-vindo(a) à Fyntra.\nEstamos prontos para te ajudar no que precisar.\nComo podemos começar?",
  },
  {
    id: "followup_cliente_fyntra",
    name: "followup_cliente_fyntra",
    category: "Marketing",
    priority: "Média",
    body: "Oi {lead_name}! Passando para saber se ficou alguma dúvida sobre a Fyntra. Posso ajudar?",
  },
  {
    id: "retomada_conversa_fyntra",
    name: "retomada_conversa_fyntra",
    category: "Marketing",
    priority: "Baixa",
    body: "Olá de novo! Vi que a nossa conversa ficou pela metade. Quer retomar de onde paramos?",
  },
  {
    id: "aviso_importante_fyntra",
    name: "aviso_importante_fyntra",
    category: "Marketing",
    priority: "Alta",
    body: "Oi {lead_name}, tenho uma atualização importante sobre a sua conta na Fyntra.",
  },
  {
    id: "confirmacao_contato_fyntra",
    name: "confirmacao_contato_fyntra",
    category: "Marketing",
    priority: "Alta",
    body: "Recebemos o seu contato! Em instantes um especialista da Fyntra fala com você.",
  },
  {
    id: "carrinho_abandonado_fyntra",
    name: "carrinho_abandonado_fyntra",
    category: "Marketing",
    priority: "Alta",
    body: "Oi {lead_name}! Notamos que você iniciou um orçamento, mas não concluiu.\nSe precisar de ajuda ou tiver alguma dúvida, estou por aqui para te apoiar. Quer que eu retome para você de onde parou?",
  },
];

interface ConversionEventOption {
  id: string;
  label: string;
  brand: string;
}

const CONVERSION_EVENT_OPTIONS: ConversionEventOption[] = [
  { id: "carrinho_abandonado", label: "Carrinho abandonado", brand: "stripe" },
  { id: "pagamento_aprovado", label: "Pagamento aprovado", brand: "stripe" },
  { id: "assinatura_cancelada", label: "Assinatura cancelada", brand: "stripe" },
  { id: "reuniao_agendada", label: "Reunião agendada", brand: "calendly" },
];

let _uid = 0;
const nextUid = (prefix: string) => `${prefix}-${++_uid}`;

const PRIORITY_DOT: Record<Priority, string> = {
  Alta: "bg-(--aw-emerald-500)",
  Média: "bg-(--aw-amber-500)",
  Baixa: "bg-aw-gray-400",
};

/* ───────── helpers de apresentação ───────── */

function StatusDot({ className = "bg-(--aw-emerald-500)", label }: { className?: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-fg-tertiary whitespace-nowrap">
      <span className={`size-1.5 rounded-full ${className}`} />
      {label}
    </span>
  );
}

function PreviewBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-(--bg-inverse) px-4 py-3 text-sm leading-snug text-(--fg-on-inverse) whitespace-pre-line">
      {children}
    </div>
  );
}

function CardShell({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-border bg-bg-surface/40 p-5">
      <header className="flex items-start gap-3">
        <span className="mt-0.5 text-fg-tertiary">
          <Icon name={icon} size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-medium text-fg-primary">{title}</h2>
          <p className="text-sm text-fg-tertiary">{subtitle}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

/* Dropdown genérico que usa AwSelect como trigger. */
function Picker({
  placeholder,
  align = "start",
  items,
}: {
  placeholder: string;
  align?: "start" | "end" | "center";
  items: React.ComponentProps<typeof AwDropdownMenu>["items"];
}) {
  return (
    <AwDropdownMenu
      align={align}
      className="w-(--radix-dropdown-menu-trigger-width)"
      trigger={
        <AwSelect className="w-full">
          <span className="text-fg-tertiary">{placeholder}</span>
        </AwSelect>
      }
      items={items}
    />
  );
}

function PlatformRow({ platform, sub }: { platform: Platform; sub: string }) {
  return (
    <span className="flex w-full items-center gap-3">
      <AwBrandLogo brand={platform.brand} size="sm" />
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-medium text-fg-primary">{platform.name}</span>
        <span className="truncate text-xs text-fg-tertiary">{sub}</span>
      </span>
      <span className="ml-auto">
        <StatusDot label="Ativo" />
      </span>
    </span>
  );
}

/* ───────── config de plataforma (origem e conversão) ───────── */

interface PlatformConfig {
  uid: string;
  platformId: string;
  object: string | null;
  subobject: string | null;
  events: string[];
  saved: boolean;
}

const TOTAL_EVENTS = TRIGGER_EVENTS.length;

function PlatformConfigPanel({
  config,
  eventsHint,
  onChange,
  onSave,
  onDelete,
}: {
  config: PlatformConfig;
  eventsHint: string;
  onChange: (next: PlatformConfig) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const platform = PLATFORMS.find((p) => p.id === config.platformId)!;
  const canSave = !!config.object && !!config.subobject && config.events.length > 0;
  const subOptions = config.object ? SUBOBJECTS[config.object] ?? [] : [];

  const toggleEvent = (ev: string) =>
    onChange({
      ...config,
      events: config.events.includes(ev)
        ? config.events.filter((e) => e !== ev)
        : [...config.events, ev],
    });

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {/* header escuro */}
      <div className="flex items-center gap-3 bg-(--bg-inverse) px-4 py-3 text-(--fg-on-inverse)">
        <AwBrandLogo brand={platform.brand} size="sm" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            {platform.name}
            <StatusDot label="Ativo" />
          </div>
          <div className="text-xs text-(--fg-on-inverse)/60">{eventsHint}</div>
        </div>
        <button
          type="button"
          onClick={onSave}
          className="ml-auto text-(--fg-on-inverse)/70 hover:text-(--fg-on-inverse)"
          aria-label="Recolher configuração"
        >
          <Icon name="expand_less" size={18} />
        </button>
      </div>

      {/* corpo */}
      <div className="flex flex-col gap-4 px-4 py-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-fg-primary">Objeto</span>
          <AwDropdownMenu
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width)"
            trigger={
              <AwSelect className="w-full">
                <span className={config.object ? "text-fg-primary" : "text-fg-tertiary"}>
                  {config.object ?? "Selecione um objeto"}
                </span>
              </AwSelect>
            }
            items={OBJECTS.map((o) => ({
              id: o,
              label: o,
              checked: config.object === o,
              onSelect: () => onChange({ ...config, object: o, subobject: null }),
            }))}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-fg-primary">Subobjeto</span>
          <AwDropdownMenu
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width)"
            trigger={
              <AwSelect className="w-full" disabled={!config.object}>
                <span className={config.subobject ? "text-fg-primary" : "text-fg-tertiary"}>
                  {config.subobject ?? "Selecione um subobjeto"}
                </span>
              </AwSelect>
            }
            items={subOptions.map((s) => ({
              id: s,
              label: s,
              checked: config.subobject === s,
              onSelect: () => onChange({ ...config, subobject: s }),
            }))}
          />
        </label>

        <div className="flex flex-col gap-2">
          <div>
            <p className="text-sm font-medium text-fg-primary">Eventos acionadores</p>
            <p className="text-xs text-fg-tertiary">Selecione quais eventos devem ser disparados.</p>
          </div>
          <div className="grid max-h-[180px] grid-cols-2 gap-2 overflow-y-auto pr-1">
            {TRIGGER_EVENTS.map((ev) => {
              const on = config.events.includes(ev);
              return (
                <button
                  key={ev}
                  type="button"
                  onClick={() => toggleEvent(ev)}
                  className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-colors duration-aw-fast ${
                    on
                      ? "border-(--bg-inverse) bg-(--bg-inverse) text-(--fg-on-inverse)"
                      : "border-border text-fg-secondary hover:bg-bg-surface"
                  }`}
                >
                  {on && <Icon name="check" size={13} />}
                  {ev}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onDelete}
            className="text-sm font-medium text-(--aw-red-600) hover:underline"
          >
            Excluir configuração
          </button>
          <AwButton variant="primary" size="sm" disabled={!canSave} onClick={onSave}>
            Salvar
          </AwButton>
        </div>
      </div>
    </div>
  );
}

function SavedPlatformChip({
  config,
  onExpand,
}: {
  config: PlatformConfig;
  onExpand: () => void;
}) {
  const platform = PLATFORMS.find((p) => p.id === config.platformId)!;
  return (
    <button
      type="button"
      onClick={onExpand}
      className="flex w-full items-center gap-3 rounded-xl bg-(--bg-inverse) px-4 py-3 text-left text-(--fg-on-inverse)"
    >
      <AwBrandLogo brand={platform.brand} size="sm" />
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium">
          {platform.name}
          <StatusDot label="Ativo" />
        </div>
        <div className="text-xs text-(--fg-on-inverse)/60">
          {config.events.length} eventos ativos de {TOTAL_EVENTS} disponíveis.
        </div>
      </div>
      <Icon name="expand_more" size={18} className="ml-auto text-(--fg-on-inverse)/70" />
    </button>
  );
}

function PlatformConfigColumn({
  icon,
  title,
  subtitle,
  pickerPlaceholder,
  eventsHint,
  configs,
  setConfigs,
}: {
  icon: string;
  title: string;
  subtitle: string;
  pickerPlaceholder: string;
  eventsHint: (platformName: string) => string;
  configs: PlatformConfig[];
  setConfigs: (next: PlatformConfig[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const showPicker = configs.length === 0 || adding;
  const usedPlatforms = new Set(configs.map((c) => c.platformId));

  const addPlatform = (platformId: string) => {
    setConfigs([
      ...configs,
      { uid: nextUid("cfg"), platformId, object: null, subobject: null, events: [], saved: false },
    ]);
    setAdding(false);
  };

  const update = (uid: string, next: PlatformConfig) =>
    setConfigs(configs.map((c) => (c.uid === uid ? next : c)));
  const remove = (uid: string) => setConfigs(configs.filter((c) => c.uid !== uid));

  return (
    <CardShell icon={icon} title={title} subtitle={subtitle}>
      <div className="flex flex-col gap-3">
        {configs.map((config) => {
          const platform = PLATFORMS.find((p) => p.id === config.platformId)!;
          if (config.saved) {
            return (
              <SavedPlatformChip
                key={config.uid}
                config={config}
                onExpand={() => update(config.uid, { ...config, saved: false })}
              />
            );
          }
          return (
            <PlatformConfigPanel
              key={config.uid}
              config={config}
              eventsHint={eventsHint(platform.name)}
              onChange={(next) => update(config.uid, next)}
              onSave={() => update(config.uid, { ...config, saved: true })}
              onDelete={() => remove(config.uid)}
            />
          );
        })}

        {showPicker && (
          <Picker
            placeholder={pickerPlaceholder}
            items={PLATFORMS.filter((p) => !usedPlatforms.has(p.id)).map((p) => ({
              id: p.id,
              label: <PlatformRow platform={p} sub={eventsHint(p.name)} />,
              onSelect: () => addPlatform(p.id),
            }))}
          />
        )}

        {!showPicker && configs.some((c) => c.saved) && (
          <AwButton variant="secondary" size="sm" iconLeft="add" onClick={() => setAdding(true)}>
            Adicionar
          </AwButton>
        )}
      </div>
    </CardShell>
  );
}

/* ───────── template para mensagem inicial ───────── */

interface PerEventTemplate {
  uid: string;
  eventId: string | null;
  templateId: string | null;
}

function TemplateColumn({
  selectedTemplateId,
  setSelectedTemplateId,
  perEvent,
  setPerEvent,
}: {
  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string | null) => void;
  perEvent: PerEventTemplate[];
  setPerEvent: (next: PerEventTemplate[]) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<PerEventTemplate[]>([]);

  const template = TEMPLATES.find((t) => t.id === selectedTemplateId) ?? null;
  const committed = perEvent.filter((r) => r.eventId && r.templateId);

  const openModal = () => {
    setDraft(perEvent.length ? perEvent : [{ uid: nextUid("evt"), eventId: null, templateId: null }]);
    setModalOpen(true);
  };
  const saveModal = () => {
    setPerEvent(draft.filter((r) => r.eventId && r.templateId));
    setModalOpen(false);
  };

  return (
    <CardShell
      icon="chat_bubble"
      title="Template para mensagem inicial"
      subtitle="Selecione a mensagem que irá iniciar a conversa."
    >
      <div className="flex flex-col gap-4">
        {!template ? (
          <Picker
            placeholder="Selecionar template"
            items={TEMPLATES.filter((t) => t.id !== "carrinho_abandonado_fyntra").map((t) => ({
              id: t.id,
              label: (
                <span className="flex w-full items-center gap-2">
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-fg-primary">{t.name}</span>
                    <span className="text-xs text-fg-tertiary">{t.category}</span>
                  </span>
                  <span className="ml-auto">
                    <StatusDot className={PRIORITY_DOT[t.priority]} label={t.priority} />
                  </span>
                </span>
              ),
              onSelect: () => setSelectedTemplateId(t.id),
            }))}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-fg-primary">{template.name}</span>
                <StatusDot className={PRIORITY_DOT[template.priority]} label={template.priority} />
                <button
                  type="button"
                  onClick={() => setSelectedTemplateId(null)}
                  className="ml-auto text-fg-tertiary hover:text-(--aw-red-600)"
                  aria-label="Remover template"
                >
                  <Icon name="delete" size={16} />
                </button>
              </div>
              <span className="text-xs text-fg-tertiary">{template.category.toLowerCase()}</span>
              <PreviewBubble>{template.body}</PreviewBubble>
            </div>

            {/* configurar por evento */}
            <div className="flex flex-col gap-3 rounded-xl border border-border p-3">
              <button
                type="button"
                onClick={openModal}
                className="flex items-center justify-between text-sm text-fg-primary"
              >
                Configurar template por evento
                <Icon name="settings" size={16} className="text-fg-tertiary" />
              </button>

              {committed.length > 0 && (
                <>
                  <p className="text-xs text-fg-tertiary">
                    Os eventos não configurados utilizarão o template de mensagem inicial como padrão.
                  </p>
                  {committed.map((row) => {
                    const ev = CONVERSION_EVENT_OPTIONS.find((e) => e.id === row.eventId);
                    const tpl = TEMPLATES.find((t) => t.id === row.templateId);
                    if (!tpl) return null;
                    return (
                      <div key={row.uid} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-fg-primary">{tpl.name}</span>
                          <StatusDot className={PRIORITY_DOT[tpl.priority]} label={tpl.priority} />
                        </div>
                        <span className="text-xs text-fg-tertiary">Evento: {ev?.label}</span>
                        <PreviewBubble>{tpl.body}</PreviewBubble>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <PerEventModal
        open={modalOpen}
        rows={draft}
        setRows={setDraft}
        onClose={() => setModalOpen(false)}
        onSave={saveModal}
      />
    </CardShell>
  );
}

function PerEventModal({
  open,
  rows,
  setRows,
  onClose,
  onSave,
}: {
  open: boolean;
  rows: PerEventTemplate[];
  setRows: (next: PerEventTemplate[]) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const canSave = rows.length > 0 && rows.every((r) => r.eventId && r.templateId);

  const update = (uid: string, patch: Partial<PerEventTemplate>) =>
    setRows(rows.map((r) => (r.uid === uid ? { ...r, ...patch } : r)));
  const remove = (uid: string) => setRows(rows.filter((r) => r.uid !== uid));
  const add = () => setRows([...rows, { uid: nextUid("evt"), eventId: null, templateId: null }]);

  return (
    <AwModal
      open={open}
      onClose={onClose}
      size="cockpit"
      title="Configuração de template por evento"
      footer={
        <div className="flex w-full items-center justify-between">
          <AwButton variant="secondary" size="sm" iconLeft="add" onClick={add}>
            Adicionar evento
          </AwButton>
          <AwButton variant="primary" size="sm" disabled={!canSave} onClick={onSave}>
            Salvar
          </AwButton>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <p className="text-sm text-fg-tertiary">
          Selecione os eventos que deseja configurar individualmente. Os não configurados
          utilizarão o template de mensagem inicial como padrão.
        </p>

        {rows.map((row) => {
          const ev = CONVERSION_EVENT_OPTIONS.find((e) => e.id === row.eventId);
          const tpl = TEMPLATES.find((t) => t.id === row.templateId);
          return (
            <div key={row.uid} className="flex flex-col gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
              <div className="flex flex-wrap items-center gap-2 text-sm text-fg-primary">
                <span>Quando</span>
                <AwDropdownMenu
                  align="start"
                  trigger={
                    <AwSelect className="min-w-[190px]">
                      {ev ? (
                        <span className="flex items-center gap-2 text-fg-primary">
                          <AwBrandLogo brand={ev.brand} size="sm" bare />
                          {ev.label}
                        </span>
                      ) : (
                        <span className="text-fg-tertiary">Selecione um evento</span>
                      )}
                    </AwSelect>
                  }
                  items={CONVERSION_EVENT_OPTIONS.map((option) => ({
                    id: option.id,
                    label: (
                      <span className="flex items-center gap-2">
                        <AwBrandLogo brand={option.brand} size="sm" bare />
                        {option.label}
                      </span>
                    ),
                    checked: row.eventId === option.id,
                    onSelect: () => update(row.uid, { eventId: option.id }),
                  }))}
                />
                <span>utilize</span>
                <AwDropdownMenu
                  align="start"
                  trigger={
                    <AwSelect className="min-w-[210px]">
                      <span className={tpl ? "text-fg-primary" : "text-fg-tertiary"}>
                        {tpl?.name ?? "Selecione um template"}
                      </span>
                    </AwSelect>
                  }
                  items={TEMPLATES.map((t) => ({
                    id: t.id,
                    label: t.name,
                    checked: row.templateId === t.id,
                    onSelect: () => update(row.uid, { templateId: t.id }),
                  }))}
                />
                <span>como primeira mensagem.</span>
                <button
                  type="button"
                  onClick={() => remove(row.uid)}
                  className="ml-auto text-fg-tertiary hover:text-(--aw-red-600)"
                  aria-label="Remover evento"
                >
                  <Icon name="delete" size={16} />
                </button>
              </div>
              {tpl && <PreviewBubble>{tpl.body}</PreviewBubble>}
            </div>
          );
        })}
      </div>
    </AwModal>
  );
}

/* ───────── etapa ───────── */

export interface OriginsConversionsValue {
  origins: PlatformConfig[];
  conversions: PlatformConfig[];
  templateId: string | null;
  perEvent: PerEventTemplate[];
}

export function OriginsConversionsStep({
  onValidityChange,
}: {
  onValidityChange?: (hasConfig: boolean) => void;
}) {
  const [origins, setOrigins] = useState<PlatformConfig[]>([]);
  const [conversions, setConversions] = useState<PlatformConfig[]>([]);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [perEvent, setPerEvent] = useState<PerEventTemplate[]>([]);

  const hasConfig = useMemo(() => {
    const usable = (c: PlatformConfig) => c.saved && c.events.length > 0;
    return origins.some(usable) || conversions.some(usable) || !!templateId;
  }, [origins, conversions, templateId]);

  const lastReported = useRef<boolean | null>(null);
  useEffect(() => {
    if (lastReported.current !== hasConfig) {
      lastReported.current = hasConfig;
      onValidityChange?.(hasConfig);
    }
  }, [hasConfig, onValidityChange]);

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <PlatformConfigColumn
        icon="login"
        title="Qual a origem do seu cliente?"
        subtitle="Selecione a origem do seu cliente e o evento acionador."
        pickerPlaceholder="Selecione uma plataforma"
        eventsHint={() => `${TOTAL_EVENTS} eventos de acionadores disponíveis`}
        configs={origins}
        setConfigs={setOrigins}
      />

      <TemplateColumn
        selectedTemplateId={templateId}
        setSelectedTemplateId={setTemplateId}
        perEvent={perEvent}
        setPerEvent={setPerEvent}
      />

      <PlatformConfigColumn
        icon="sync_alt"
        title="Evento de conversão"
        subtitle="Selecione o evento de conversão."
        pickerPlaceholder="Selecione uma plataforma"
        eventsHint={() => `${TOTAL_EVENTS} eventos de conversão disponíveis`}
        configs={conversions}
        setConfigs={setConversions}
      />
    </div>
  );
}
