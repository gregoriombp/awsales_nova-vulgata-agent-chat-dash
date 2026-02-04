"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

// Parse text into segments: plain text, @logic (chip), {{interpolation}} (chip)
type Segment = { type: "text"; content: string } | { type: "at"; content: string } | { type: "mustache"; content: string };

function parseVariableSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  const re = /(@[\w.]+)|(\{\{[^}]+\}\})/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, m.index) });
    }
    if (m[1]) segments.push({ type: "at", content: m[1] });
    else if (m[2]) segments.push({ type: "mustache", content: m[2] });
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }
  return segments;
}

// Render value as HTML with chip spans (for contentEditable); data-type + title for tooltip
function renderValueWithChips(value: string): string {
  const segments = parseVariableSegments(value);
  const esc = (x: string) => x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  return segments
    .map((s) => {
      if (s.type === "text") return s.content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const meta = VARIABLE_META[s.content];
      const title = meta ? `${meta.description} (ID: ${meta.id})` : s.content;
      if (s.type === "at") return `<span class="variable-chip variable-chip-at inline-flex items-center px-1.5 py-0.5 rounded text-sm font-mono align-baseline cursor-pointer" contenteditable="false" data-variable="${esc(s.content)}" data-type="at" title="${esc(title)}">${esc(s.content)}</span>`;
      return `<span class="variable-chip variable-chip-mustache inline-flex items-center px-1.5 py-0.5 rounded text-sm font-mono align-baseline cursor-pointer" contenteditable="false" data-variable="${esc(s.content)}" data-type="mustache" title="${esc(title)}">${esc(s.content)}</span>`;
    })
    .join("");
}

function serializeDomToValue(root: Node): string {
  let out = "";
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) out += node.textContent || "";
    else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.dataset.variable) out += el.dataset.variable;
      else out += serializeDomToValue(node);
    }
  });
  return out;
}

// Variable metadata for tooltip and modal (id + description) - built from suggestion lists
const AT_SUGGESTIONS_LIST = [
  { id: "ask_to_agent", label: "@ask_to_agent", description: "Perguntar a outro agente" },
  { id: "conversation_step", label: "@conversation_step", description: "Referenciar etapa da conversa" },
  { id: "search_knowledge", label: "@search_knowledge", description: "Buscar na base de conhecimento" },
  { id: "create_deal", label: "@create_deal", description: "Criar negócio no CRM" },
  { id: "schedule_meeting", label: "@schedule_meeting", description: "Agendar reunião" },
  { id: "send_email", label: "@send_email", description: "Enviar e-mail" },
  { id: "transfer_to_human", label: "@transfer_to_human", description: "Transferir para humano" },
  { id: "if_condition", label: "@if", description: "Condição condicional" },
  { id: "foreach", label: "@foreach", description: "Loop de iteração" },
  { id: "wait", label: "@wait", description: "Aguardar tempo" },
];
const VAR_SUGGESTIONS_LIST = [
  { id: "agent_name", label: "{{agent.name}}", description: "Nome do agente" },
  { id: "user_name", label: "{{user.name}}", description: "Nome do usuário" },
  { id: "user_email", label: "{{user.email}}", description: "E-mail do usuário" },
  { id: "system_time", label: "{{system_time_utc}}", description: "Hora atual UTC" },
  { id: "conversation_id", label: "{{conversation.id}}", description: "ID da conversa" },
  { id: "lead_first_name", label: "{{lead.first_name}}", description: "Primeiro nome do lead" },
  { id: "lead_phone", label: "{{lead.phone}}", description: "Telefone do lead" },
  { id: "company_name", label: "{{company.name}}", description: "Nome da empresa" },
];
const VARIABLE_META: Record<string, { id: string; description: string }> = {};
[...AT_SUGGESTIONS_LIST, ...VAR_SUGGESTIONS_LIST].forEach((s) => {
  VARIABLE_META[s.label] = { id: s.id, description: s.description };
});

// Editable field with chips; when read-only just show chip display
function VariableChipEditor({
  value,
  onChange,
  readOnly,
  placeholder,
  className,
  minHeight,
  onTriggerAt,
  onVariableClick,
}: {
  value: string;
  onChange: (v: string) => void;
  readOnly: boolean;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  onTriggerAt?: () => void;
  onVariableClick?: (variable: string, type: "at" | "mustache") => void;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!divRef.current) return;
    if (readOnly) return;
    const current = serializeDomToValue(divRef.current);
    if (current === value && divRef.current.innerHTML) return;
    const html = value ? renderValueWithChips(value) : "";
    divRef.current.innerHTML = html || "";
    if (!html) divRef.current.setAttribute("data-placeholder", placeholder || "");
  }, [value, readOnly, placeholder]);

  const handleInput = useCallback(() => {
    if (readOnly || !divRef.current) return;
    isInternalChange.current = true;
    const newValue = serializeDomToValue(divRef.current);
    onChange(newValue);
  }, [onChange, readOnly]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (readOnly) return;
      if (e.key === "@") {
        onTriggerAt?.();
      }
      // {{ is detected in handleEditorChange when value ends with {{
    },
    [readOnly, onTriggerAt]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = (e.target as HTMLElement).closest?.(".variable-chip");
      if (target && onVariableClick) {
        const variable = (target as HTMLElement).dataset.variable;
        const type = (target as HTMLElement).dataset.type as "at" | "mustache" | undefined;
        if (variable && type) {
          e.preventDefault();
          onVariableClick(variable, type);
        }
      }
    },
    [onVariableClick]
  );

  if (readOnly) {
    if (!value) return <div className={`${className} text-[#9d9d9d]`} style={{ minHeight }}>{placeholder}</div>;
    const segments = parseVariableSegments(value);
    return (
      <div className={`${className} whitespace-pre-wrap break-words`} style={{ minHeight }}>
        {segments.map((seg, i) =>
          seg.type === "text" ? (
            <span key={i}>{seg.content}</span>
          ) : seg.type === "at" ? (
            <VariableChip key={i} content={seg.content} type="at" onClick={onVariableClick} />
          ) : (
            <VariableChip key={i} content={seg.content} type="mustache" onClick={onVariableClick} />
          )
        )}
      </div>
    );
  }

  return (
    <div
      ref={divRef}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={`${className} whitespace-pre-wrap break-words outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[#9d9d9d]`}
      style={{ minHeight }}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    />
  );
}

// Chip with tooltip and click (for read-only React-rendered chips)
function VariableChip({
  content,
  type,
  onClick,
}: {
  content: string;
  type: "at" | "mustache";
  onClick?: (variable: string, type: "at" | "mustache") => void;
}) {
  const meta = VARIABLE_META[content];
  const tooltip = meta ? `${meta.description} (ID: ${meta.id})` : content;
  return (
    <span
      role="button"
      tabIndex={0}
      className={`variable-chip variable-chip-${type} inline-flex items-center px-1.5 py-0.5 rounded text-sm font-mono align-baseline cursor-pointer`}
      title={tooltip}
      onClick={(e) => { e.preventDefault(); onClick?.(content, type); }}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(content, type); } }}
    >
      {content}
    </span>
  );
}

// Icon components for each goal
const SalesIcon = ({ color = "#0d1013" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M12 8V12L15 15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="1.5"/>
  </svg>
);

const RecoveryIcon = ({ color = "#0d1013" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12C3 7.02944 7.02944 3 12 3C14.8273 3 17.35 4.30367 19 6.34267V4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12C21 16.9706 16.9706 21 12 21C9.17273 21 6.65 19.6963 5 17.6573V20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5" cy="4" r="1" fill={color}/>
    <circle cx="19" cy="20" r="1" fill={color}/>
  </svg>
);

const OnboardingIcon = ({ color = "#0d1013" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H20M4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6M4 6L6 4H18L20 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 14L11 17L16 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LeadCaptureIcon = ({ color = "#0d1013" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L12 22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2 12L22 12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="5" cy="8" r="1.5" fill={color}/>
    <circle cx="12" cy="5" r="1.5" fill={color}/>
    <circle cx="19" cy="12" r="1.5" fill={color}/>
    <circle cx="12" cy="19" r="1.5" fill={color}/>
  </svg>
);

const CSLaunchIcon = ({ color = "#0d1013" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="16" cy="6" r="1.5" fill={color}/>
    <circle cx="18" cy="16" r="1.5" fill={color}/>
  </svg>
);

const SchedulingIcon = ({ color = "#0d1013" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2V6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 2V6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3 9H21" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" fill="none"/>
    <circle cx="8" cy="14" r="1" fill={color}/>
    <circle cx="12" cy="14" r="1" fill={color}/>
    <circle cx="16" cy="14" r="1" fill={color}/>
    <circle cx="8" cy="18" r="1" fill={color}/>
    <circle cx="12" cy="18" r="1" fill={color}/>
  </svg>
);

const SupportIcon = ({ color = "#0d1013" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M22 22L18 18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M11.5 7V12L15 14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const OtherIcon = ({ color = "#0d1013" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.3062 14.1652 11.4174 13 11.8293V13" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1" fill={color}/>
  </svg>
);

// Animated sparkle icon for loading
const SparkleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
    <path d="M24 4L27.5 16.5L40 20L27.5 23.5L24 36L20.5 23.5L8 20L20.5 16.5L24 4Z" fill="#0d1013"/>
    <path d="M36 28L38 33L43 35L38 37L36 42L34 37L29 35L34 33L36 28Z" fill="#0d1013" className="animate-ping"/>
    <path d="M12 28L14 33L19 35L14 37L12 42L10 37L5 35L10 33L12 28Z" fill="#0d1013" className="animate-ping" style={{ animationDelay: "0.5s" }}/>
  </svg>
);

interface GoalOption {
  id: string;
  title: string;
  icon: React.FC<{ color?: string }>;
}

const GOAL_OPTIONS: GoalOption[] = [
  { id: "vendas", title: "Vendas", icon: SalesIcon },
  { id: "recuperacao", title: "Recuperação de Vendas", icon: RecoveryIcon },
  { id: "onboarding", title: "Onboarding", icon: OnboardingIcon },
  { id: "captacao", title: "Captação de Lead", icon: LeadCaptureIcon },
  { id: "cs-lancamento", title: "CS / Lançamento", icon: CSLaunchIcon },
  { id: "agendamento", title: "Agendamento", icon: SchedulingIcon },
  { id: "suporte", title: "Suporte e Atendimento", icon: SupportIcon },
];

interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  documentCount?: number;
  knowledgeLayersCount?: number;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  configured: boolean;
  enabled: boolean;
}

// Module types for the prompt editor
interface PromptModule {
  id: string;
  type: "text" | "variable" | "action" | "condition" | "loop";
  content: string;
  reference?: string;
  color?: string;
}

// Mock integrations data
const MOCK_INTEGRATIONS: Integration[] = [
  { id: "whatsapp", name: "WhatsApp", description: "Conecte seu WhatsApp Business", icon: "whatsapp", configured: true, enabled: true },
  { id: "instagram", name: "Instagram", description: "Integre com Instagram Direct", icon: "instagram", configured: true, enabled: false },
  { id: "messenger", name: "Messenger", description: "Facebook Messenger", icon: "messenger", configured: false, enabled: false },
  { id: "telegram", name: "Telegram", description: "Bot do Telegram", icon: "telegram", configured: false, enabled: false },
  { id: "email", name: "E-mail", description: "Integração com e-mail", icon: "email", configured: false, enabled: false },
  { id: "slack", name: "Slack", description: "Workspace do Slack", icon: "slack", configured: false, enabled: false },
];

const MEMORY_BASES_STORAGE_KEY = "memory-bases-list";
const MAX_VISIBLE_BASES = 4;

const LOADING_MESSAGES = [
  "Analisando base de conhecimento...",
  "Configurando integrações...",
  "Pensando na melhor estratégia...",
  "Gerando prompt otimizado...",
  "Finalizando configuração...",
];

function loadBasesFromStorage(): KnowledgeBase[] {
  if (typeof window === "undefined") return [];
  try {
    const s = window.localStorage.getItem(MEMORY_BASES_STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

// Integration icon component
const IntegrationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "whatsapp":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/>
        </svg>
      );
    case "instagram":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="url(#instagram-gradient)"/>
          <defs>
            <linearGradient id="instagram-gradient" x1="0" y1="24" x2="24" y2="0">
              <stop stopColor="#FFDC80"/>
              <stop offset="0.5" stopColor="#F77737"/>
              <stop offset="1" stopColor="#C13584"/>
            </linearGradient>
          </defs>
        </svg>
      );
    case "messenger":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" fill="#0084FF"/>
        </svg>
      );
    case "telegram":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.1.154.234.17.331.015.098.034.321.019.495z" fill="#0088CC"/>
        </svg>
      );
    case "email":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#EA4335"/>
        </svg>
      );
    case "slack":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.123 2.521a2.528 2.528 0 0 1 2.521-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.521V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.166 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.123a2.528 2.528 0 0 1 2.523 2.521A2.528 2.528 0 0 1 15.166 24a2.527 2.527 0 0 1-2.52-2.522v-2.521h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#E01E5A"/>
        </svg>
      );
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="#9d9d9d" strokeWidth="1.5"/>
          <path d="M8 12h8M12 8v8" stroke="#9d9d9d" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
  }
};

// Module tag component for the editor
const ModuleTag = ({ module }: { module: PromptModule }) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    variable: { bg: "bg-[#f3f3f3]", text: "text-[#0d1013]", border: "border-[#e5e5e5]" },
    action: { bg: "bg-[#e8f5e9]", text: "text-[#1b5e20]", border: "border-[#c8e6c9]" },
    condition: { bg: "bg-[#fff3e0]", text: "text-[#e65100]", border: "border-[#ffe0b2]" },
    loop: { bg: "bg-[#e3f2fd]", text: "text-[#0d47a1]", border: "border-[#bbdefb]" },
  };

  const style = colors[module.type] || colors.variable;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${style.bg} ${style.text} border ${style.border} font-mono text-xs`}>
      {module.type === "action" && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#1b5e20]">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {module.content}
      {module.reference && <span className="opacity-50 text-[10px]">{module.reference}</span>}
    </span>
  );
};

export default function AgentStudioNewPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1 state
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // Step 2 state
  const [agentName, setAgentName] = useState("");
  const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [showAllBases, setShowAllBases] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Step 3 state
  const [integrations, setIntegrations] = useState<Integration[]>(MOCK_INTEGRATIONS);

  // Step 4 (Loading) state
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Step 5 (Editor) state
  const [generatedPrompt, setGeneratedPrompt] = useState<PromptModule[]>([]);
  const [checkpointEditorExpanded, setCheckpointEditorExpanded] = useState(false);
  const [promptEditorExpanded, setPromptEditorExpanded] = useState(false);
  
  // Separated fields: Agent Prompt (personality) and Checkpoint (execution guide)
  const [agentPrompt, setAgentPrompt] = useState("");
  const [checkpointContent, setCheckpointContent] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [interruptible, setInterruptible] = useState(true);
  const [isPromptEditing, setIsPromptEditing] = useState(false);
  const [isCheckpointEditing, setIsCheckpointEditing] = useState(false);
  const [isFirstMessageEditing, setIsFirstMessageEditing] = useState(false);
  
  // Refs for latest values (so insertSuggestion always has current text)
  const agentPromptRef = useRef("");
  const checkpointContentRef = useRef("");
  const firstMessageRef = useRef("");
  useEffect(() => { agentPromptRef.current = agentPrompt; }, [agentPrompt]);
  useEffect(() => { checkpointContentRef.current = checkpointContent; }, [checkpointContent]);
  useEffect(() => { firstMessageRef.current = firstMessage; }, [firstMessage]);

  // Autocomplete state
  const [showAtSuggestions, setShowAtSuggestions] = useState(false);
  const [showVarSuggestions, setShowVarSuggestions] = useState(false);
  const [suggestionFilter, setSuggestionFilter] = useState("");
  const [activeEditor, setActiveEditor] = useState<"prompt" | "checkpoint" | "firstMessage" | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });

  // Variable config modal (click on chip)
  const [variableModalOpen, setVariableModalOpen] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState<{ variable: string; type: "at" | "mustache" } | null>(null);

  // @ Resources suggestions
  const atSuggestions = AT_SUGGESTIONS_LIST;
  const varSuggestions = VAR_SUGGESTIONS_LIST;

  // Load knowledge bases on mount
  useEffect(() => {
    setKnowledgeBases(loadBasesFromStorage());
  }, []);

  // Loading message rotation
  useEffect(() => {
    if (currentStep === 4) {
      const interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 1500);

      // Auto-advance to step 5 after 4 seconds
      const timeout = setTimeout(() => {
        generatePrompt();
        setCurrentStep(5);
      }, 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [currentStep]);

  // Generate the prompt based on selections
  const generatePrompt = () => {
    const goalTitle = GOAL_OPTIONS.find(g => g.id === selectedGoal)?.title || customGoal;
    const baseName = knowledgeBases.find(b => b.id === selectedBaseId)?.name || "Base de Conhecimento";
    const enabledIntegrations = integrations.filter(i => i.enabled);

    const modules: PromptModule[] = [
      { id: "1", type: "text", content: `Você é um agente de ${goalTitle} chamado ` },
      { id: "2", type: "variable", content: "{agent.name}", reference: agentName },
      { id: "3", type: "text", content: `. Seu objetivo principal é auxiliar os usuários com questões relacionadas a ${goalTitle.toLowerCase()}.` },
      { id: "4", type: "text", content: "\n\n**REGRA DE OURO:** Use seu julgamento para avaliar e filtrar. Se a lead demonstrar alto interesse/urgência, encaminhe para atendimento prioritário. Seja proativo e atencioso, não robótico. Evite repetir e escute atentamente.\n\n" },
      { id: "5", type: "text", content: "**Etapa 1:** Saudação inicial\n\n" },
      { id: "6", type: "text", content: "Objetivo: Estabelecer conexão calorosa e contextualizar o motivo do contato\n\n" },
      { id: "7", type: "text", content: "Exemplos para cliente demonstrando interesse:\n" },
      { id: "8", type: "condition", content: "@if.lead.interested" },
      { id: "9", type: "text", content: "\n  - Resposta inicial: Seja pessoa! Olá {lead.first_name}, tudo bem?\n  " },
      { id: "10", type: "variable", content: "{lead.first_name}" },
      { id: "11", type: "text", content: "\n  - Motivo do contato: \"Estou entrando em contato pois vi que você demonstrou interesse em...\"\n  - Agendamento: \"Posso agendar uma demonstração para você?\"\n" },
      { id: "12", type: "text", content: "\n\n**Etapa 2:** Qualificação\n\n" },
      { id: "13", type: "text", content: "Objetivo: Entender as necessidades do cliente e qualificar a oportunidade\n\n" },
      { id: "14", type: "action", content: "@search.knowledge.base", reference: baseName },
      { id: "15", type: "text", content: "\n\nPerguntas de qualificação:\n" },
      { id: "16", type: "loop", content: "@foreach.qualification.questions" },
      { id: "17", type: "text", content: "\n  - Qual é o principal desafio que você enfrenta hoje?\n  - Qual é o tamanho da sua equipe?\n  - Você já utiliza alguma solução similar?\n" },
    ];

    // Add integration-specific modules
    if (enabledIntegrations.length > 0) {
      modules.push({ id: "18", type: "text", content: "\n\n**Integrações Ativas:**\n" });
      enabledIntegrations.forEach((integration, idx) => {
        modules.push({
          id: `int-${idx}`,
          type: "action",
          content: `@integration.${integration.id}`,
          reference: integration.name
        });
      });
    }

    modules.push({ id: "19", type: "text", content: "\n\n**Etapa 3:** Fechamento\n\n" });
    modules.push({ id: "20", type: "text", content: "Objetivo: Converter a oportunidade ou agendar próximo passo\n\n" });
    modules.push({ id: "21", type: "action", content: "@create.deal", reference: "Criar negócio" });
    modules.push({ id: "22", type: "text", content: "\n" });
    modules.push({ id: "23", type: "action", content: "@schedule.meeting", reference: "Agendar reunião" });

    setGeneratedPrompt(modules);

    // Set initial content for Agent Prompt (personality/identity)
    const initialAgentPrompt = `Você é "${agentName}", um assistente de ${goalTitle} amigável e eficiente.

Você é especialista em ajudar clientes a descobrir e adquirir produtos de uma loja.
Você é conhecedor sobre diferentes gêneros, produtos e condições.
Você é entusiasmado em ajudar e ansioso para auxiliar os clientes a encontrar os itens perfeitos para suas necessidades.

Você está interagindo com clientes através de um sistema de IA conversacional baseado em voz.
O cliente provavelmente está navegando ou perguntando sobre produtos disponíveis.
Você tem acesso ao inventário da loja, preços e detalhes dos produtos.

Seu tom é acolhedor, profissional e consultivo. Evite ser robótico ou repetitivo.`;

    // Set initial content for Checkpoint (execution guide/flow)
    const initialCheckpoint = `# Etapa 1: Saudação e Conexão
Objetivo: Estabelecer conexão calorosa e contextualizar o motivo do contato.

Exemplo de abordagem:
- "Olá {{lead.first_name}}, tudo bem? Vi que você demonstrou interesse em..."
- Seja pessoal e acolhedor

Critério de avanço: Cliente respondeu positivamente

# Etapa 2: Qualificação
Objetivo: Entender as necessidades do cliente e qualificar a oportunidade.

Perguntas sugeridas:
- "Qual é o principal desafio que você enfrenta hoje?"
- "Qual é o tamanho da sua equipe?"
- "Você já utiliza alguma solução similar?"

Utilize: @search_knowledge para buscar informações relevantes

Critério de avanço: Necessidades identificadas

# Etapa 3: Apresentação e Fechamento
Objetivo: Apresentar solução e converter a oportunidade.

Ações disponíveis:
- @create_deal - quando cliente demonstrar interesse
- @schedule_meeting - para agendar demonstração
- @transfer_to_human - se necessário suporte especializado

Regra de ouro: Adapte o ritmo, pule etapas quando fizer sentido, priorize naturalidade.`;

    setAgentPrompt(initialAgentPrompt);
    setCheckpointContent(initialCheckpoint);
    setFirstMessage("Olá! Tudo bem? Estou aqui para te ajudar a encontrar aquele produto perfeito para sua necessidade.");
  };

  // Handle change from VariableChipEditor or textarea; detect @ and {{ for suggestions
  const handleEditorChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    editor: "prompt" | "checkpoint" | "firstMessage",
    event?: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setter(value);
    setActiveEditor(editor);

    // Cursor position for suggestion box (from textarea if available)
    if (event?.target) {
      const textarea = event.target as HTMLTextAreaElement;
      const cursorPos = textarea.selectionStart;
      const textBeforeCursor = value.substring(0, cursorPos);
      const atMatch = textBeforeCursor.match(/@([\w.]*)$/);
      if (atMatch) {
        setSuggestionFilter(atMatch[1] || "");
        setShowAtSuggestions(true);
        setShowVarSuggestions(false);
        const rect = textarea.getBoundingClientRect();
        const lineHeight = 20;
        const lines = textBeforeCursor.split("\n");
        const currentLineIndex = lines.length - 1;
        setCursorPosition({
          top: rect.top + (currentLineIndex * lineHeight) + 24,
          left: rect.left + (lines[currentLineIndex].length * 7),
        });
        return;
      }
      const varMatch = textBeforeCursor.match(/\{\{([^}]*)$/);
      if (varMatch) {
        setSuggestionFilter(varMatch[1] || "");
        setShowVarSuggestions(true);
        setShowAtSuggestions(false);
        return;
      }
    } else {
      // From contentEditable: detect trigger from end of value
      const atMatch = value.match(/@([\w.]*)$/);
      if (atMatch) {
        setSuggestionFilter(atMatch[1] || "");
        setShowAtSuggestions(true);
        setShowVarSuggestions(false);
        setCursorPosition({ top: 200, left: 200 });
        return;
      }
      const varMatch = value.match(/\{\{([^}]*)$/);
      if (varMatch) {
        setSuggestionFilter(varMatch[1] || "");
        setShowVarSuggestions(true);
        setShowAtSuggestions(false);
        setCursorPosition({ top: 200, left: 200 });
        return;
      }
    }
    setShowAtSuggestions(false);
    setShowVarSuggestions(false);
  };

  // Insert suggestion into text (use refs for latest value; fix regex for @ and {{ }})
  const insertSuggestion = (suggestion: string) => {
    let setter: React.Dispatch<React.SetStateAction<string>>;
    let value: string;
    switch (activeEditor) {
      case "prompt":
        setter = setAgentPrompt;
        value = agentPromptRef.current;
        break;
      case "checkpoint":
        setter = setCheckpointContent;
        value = checkpointContentRef.current;
        break;
      case "firstMessage":
        setter = setFirstMessage;
        value = firstMessageRef.current;
        break;
      default:
        setShowAtSuggestions(false);
        setShowVarSuggestions(false);
        return;
    }

    // Replace from last trigger to end: @logic allows dots; {{ }} allows anything until }}
    let newValue: string;
    if (showAtSuggestions) {
      newValue = value.replace(/@[\w.]*$/, suggestion + " ");
    } else if (showVarSuggestions) {
      newValue = value.replace(/\{\{[^}]*\}\}?$/, suggestion + " ");
    } else {
      setShowAtSuggestions(false);
      setShowVarSuggestions(false);
      return;
    }

    setter(newValue);
    setShowAtSuggestions(false);
    setShowVarSuggestions(false);
    setSuggestionFilter("");
  };

  // Filter suggestions based on input
  const filteredAtSuggestions = atSuggestions.filter(s => 
    s.label.toLowerCase().includes(suggestionFilter.toLowerCase()) ||
    s.description.toLowerCase().includes(suggestionFilter.toLowerCase())
  );

  const filteredVarSuggestions = varSuggestions.filter(s => 
    s.label.toLowerCase().includes(suggestionFilter.toLowerCase()) ||
    s.description.toLowerCase().includes(suggestionFilter.toLowerCase())
  );

  // Position suggestion box under caret when contentEditable is focused
  useEffect(() => {
    if (!showAtSuggestions && !showVarSuggestions) return;
    const raf = requestAnimationFrame(() => {
      const sel = document.getSelection();
      if (sel && sel.rangeCount > 0) {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        setCursorPosition({ top: rect.bottom, left: rect.left });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [showAtSuggestions, showVarSuggestions]);

  const handleTriggerAt = useCallback((editor: "prompt" | "checkpoint" | "firstMessage") => {
    setActiveEditor(editor);
    setSuggestionFilter("");
    setShowAtSuggestions(true);
    setShowVarSuggestions(false);
  }, []);

  const handleVariableClick = useCallback((variable: string, type: "at" | "mustache") => {
    setSelectedVariable({ variable, type });
    setVariableModalOpen(true);
  }, []);

  const breadcrumbs = currentStep === 5 ? [
    {
      label: "Agent Studio",
      href: "/agent-studio",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.75 15.625C3.75 16.3125 4.0625 16.5625 4.6875 16.875L10 18.75L15.3125 16.875C15.9375 16.5625 16.25 16.3125 16.25 15.625V7.1875C16.25 6.5 15.9375 6.25 15.3125 5.9375L10 4.0625L4.6875 5.9375C4.0625 6.25 3.75 6.5 3.75 7.1875V15.625Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M10 4.0625V18.75" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16.25 7.1875L10 10L3.75 7.1875" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
    },
    agentName || "Agente",
  ] : [
    {
      label: "Agent Studio",
      href: "/agent-studio",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.75 15.625C3.75 16.3125 4.0625 16.5625 4.6875 16.875L10 18.75L15.3125 16.875C15.9375 16.5625 16.25 16.3125 16.25 15.625V7.1875C16.25 6.5 15.9375 6.25 15.3125 5.9375L10 4.0625L4.6875 5.9375C4.0625 6.25 3.75 6.5 3.75 7.1875V15.625Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M10 4.0625V18.75" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16.25 7.1875L10 10L3.75 7.1875" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
    },
    "Configurar",
  ];

  // Validation
  const canAdvanceStep1 = selectedGoal && (selectedGoal !== "outro" || customGoal.trim());
  const canAdvanceStep2 = agentName.trim() && selectedBaseId;

  // Visible bases
  const visibleBases = showAllBases ? knowledgeBases : knowledgeBases.slice(0, MAX_VISIBLE_BASES);
  const hasMoreBases = knowledgeBases.length > MAX_VISIBLE_BASES;

  // Configured and unconfigured integrations
  const configuredIntegrations = integrations.filter(i => i.configured);
  const unconfiguredIntegrations = integrations.filter(i => !i.configured);

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    setShowCustomInput(false);
    setCustomGoal("");
  };

  const handleOtherSelect = () => {
    setSelectedGoal("outro");
    setShowCustomInput(true);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      router.push("/agent-studio");
    } else if (currentStep === 5) {
      setCurrentStep(3);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAdvance = () => {
    if (currentStep === 1 && canAdvanceStep1) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canAdvanceStep2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Start loading animation
      setCurrentStep(4);
    }
  };

  const handleCreateAgent = () => {
    // Save agent and redirect
    const goal = selectedGoal === "outro" ? customGoal : selectedGoal;
    const enabledIntegrations = integrations.filter(i => i.enabled).map(i => i.id);
    console.log("Creating agent:", { goal, agentName, selectedBaseId, enabledIntegrations, prompt: generatedPrompt });
    router.push("/agent-studio");
  };

  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations(prev => 
      prev.map(i => 
        i.id === integrationId ? { ...i, enabled: !i.enabled } : i
      )
    );
  };

  const handleCreateNewBase = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    router.push("/knowledge-os");
  };

  const isOtherSelected = selectedGoal === "outro";

  // Step 4: Loading Screen
  if (currentStep === 4) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs} mainClassName="!p-0 !overflow-hidden">
        <div className="flex min-h-full w-full items-center justify-center bg-white relative overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-[#fdf4ff] to-[#faf5ff] opacity-50" />
          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "1s" }} />
          
          <div className="relative z-10 flex flex-col items-center gap-8">
            <SparkleIcon />
            <div className="text-center">
              <h1 className="font-heading text-2xl md:text-3xl font-medium text-[#0d1013] tracking-[-0.5px] mb-3">
                Gerando seu Agente
              </h1>
              <p className="text-base text-[#9d9d9d] font-sans animate-pulse">
                {LOADING_MESSAGES[loadingMessageIndex]}
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Step 5: Editor Screen
  if (currentStep === 5) {
    const selectedBase = knowledgeBases.find(b => b.id === selectedBaseId);
    const enabledIntegrations = integrations.filter(i => i.enabled);
    const goalTitle = GOAL_OPTIONS.find(g => g.id === selectedGoal)?.title || customGoal;

    return (
      <DashboardLayout breadcrumbs={breadcrumbs} mainClassName="!p-0">
        <div className="min-h-full w-full bg-white overflow-y-auto">
          {/* Page Header */}
          <div className="border-b border-[#e5e5e5] px-4 py-6">
            <div className="max-w-[1280px] mx-auto">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-heading text-2xl font-medium text-[#0d1013] tracking-[-0.5px]">
                  Agente
                </h1>
                <span className="px-2 py-0.5 bg-[#18181b] text-white text-xs font-medium rounded">Novo</span>
                <button className="flex items-center gap-1 text-sm text-[#0d1013] hover:underline">
                  Ver novas funcionalidades
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Autocomplete Suggestion Box - positioned under caret */}
          {(showAtSuggestions || showVarSuggestions) && (
            <div 
              className="fixed z-50 bg-white rounded-lg border border-[#e5e5e5] shadow-lg py-2 min-w-[280px] max-h-[300px] overflow-y-auto"
              style={{ 
                top: cursorPosition.top + 4, 
                left: Math.min(cursorPosition.left, typeof window !== "undefined" ? window.innerWidth - 300 : 980) 
              }}
            >
              <div className="px-3 py-1.5 text-xs font-medium text-[#9d9d9d] uppercase tracking-wider border-b border-[#e5e5e5] mb-1">
                {showAtSuggestions ? "Recursos e Ações" : "Variáveis"}
              </div>
              {(showAtSuggestions ? filteredAtSuggestions : filteredVarSuggestions).map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => insertSuggestion(suggestion.label)}
                  className="w-full px-3 py-2 text-left hover:bg-[#f5f5f5] transition-colors flex items-center gap-3"
                >
                  <span className="font-mono text-sm text-[#0d1013] bg-[#f0f0f0] px-1.5 py-0.5 rounded">
                    {suggestion.label}
                  </span>
                  <span className="text-xs text-[#9d9d9d]">{suggestion.description}</span>
                </button>
              ))}
              {(showAtSuggestions ? filteredAtSuggestions : filteredVarSuggestions).length === 0 && (
                <div className="px-3 py-2 text-sm text-[#9d9d9d]">Nenhum resultado encontrado</div>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="px-4 py-8">
            <div className="max-w-[1280px] mx-auto flex gap-8">
              {/* Left Panel - Editors */}
              <div className="flex-1 space-y-6">
                
                {/* 1️⃣ Prompt do Agente - Personalidade fixa */}
                <div className="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5e5]">
                    <div className="flex items-center gap-2">
                      <a href="#" className="flex items-center gap-1.5 text-sm font-medium text-[#0d1013] underline decoration-dotted underline-offset-4 hover:no-underline">
                        Prompt do Agente
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                      <span className="text-xs text-[#9d9d9d] bg-[#f5f5f5] px-2 py-0.5 rounded">Personalidade</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPromptEditing(!isPromptEditing)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                          isPromptEditing
                            ? "bg-[#0d1013] text-white border-[#0d1013]"
                            : "text-[#6b7280] border-[#e5e5e5] hover:border-[#d1d5db] hover:text-[#0d1013]"
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {isPromptEditing ? "Editando" : "Editar"}
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#6b7280] rounded-lg border border-[#e5e5e5] hover:border-[#d1d5db] hover:text-[#0d1013] transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Otimizar com IA
                      </button>
                    </div>
                  </div>

                  {/* Editor area */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPromptEditorExpanded(!promptEditorExpanded)}
                      className="absolute top-3 right-3 p-1.5 rounded text-[#c4c4c4] hover:text-[#9d9d9d] hover:bg-white/80 transition-colors z-10"
                      title={promptEditorExpanded ? "Reduzir" : "Expandir"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M4 14H10V20M20 10H14V4M14 10L21 3M3 21L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <VariableChipEditor
                      value={agentPrompt}
                      onChange={(v) => handleEditorChange(v, setAgentPrompt, "prompt")}
                      readOnly={!isPromptEditing}
                      placeholder="Defina a personalidade do agente: quem ele é, como fala, tom de voz..."
                      className={`w-full p-5 pr-10 text-sm leading-relaxed font-sans border-0 outline-none transition-colors ${
                        promptEditorExpanded ? "min-h-[300px]" : "min-h-[160px]"
                      } ${
                        isPromptEditing
                          ? "bg-white text-[#0d1013] cursor-text"
                          : "bg-[#f5f5f5] text-[#6b7280] cursor-default"
                      }`}
                      minHeight={promptEditorExpanded ? "300px" : "160px"}
                      onTriggerAt={() => handleTriggerAt("prompt")}
                      onVariableClick={handleVariableClick}
                    />
                  </div>

                  {/* Bottom bar */}
                  <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-t border-[#e5e5e5] bg-white">
                    <span className="text-xs text-[#9d9d9d]">
                      Digite <span className="font-mono text-[#0d1013] bg-[#f5f5f5] px-1 py-0.5 rounded text-[10px]">{"{{"}</span> para variáveis
                    </span>
                    <div className="flex-1" />
                    <span className="text-xs text-[#9d9d9d]">Define: identidade, tom, postura</span>
                  </div>
                </div>

                {/* 2️⃣ Checkpoint do Agente - Guia de execução */}
                <div className="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5e5]">
                    <div className="flex items-center gap-2">
                      <a href="#" className="flex items-center gap-1.5 text-sm font-medium text-[#0d1013] underline decoration-dotted underline-offset-4 hover:no-underline">
                        Checkpoint do Agente
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                      <span className="text-xs text-[#9d9d9d] bg-[#f5f5f5] px-2 py-0.5 rounded">Fluxo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCheckpointEditing(!isCheckpointEditing)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                          isCheckpointEditing
                            ? "bg-[#0d1013] text-white border-[#0d1013]"
                            : "text-[#6b7280] border-[#e5e5e5] hover:border-[#d1d5db] hover:text-[#0d1013]"
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {isCheckpointEditing ? "Editando" : "Editar"}
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#6b7280] rounded-lg border border-[#e5e5e5] hover:border-[#d1d5db] hover:text-[#0d1013] transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Otimizar com IA
                      </button>
                    </div>
                  </div>

                  {/* Editor area */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCheckpointEditorExpanded(!checkpointEditorExpanded)}
                      className="absolute top-3 right-3 p-1.5 rounded text-[#c4c4c4] hover:text-[#9d9d9d] hover:bg-white/80 transition-colors z-10"
                      title={checkpointEditorExpanded ? "Reduzir" : "Expandir"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M4 14H10V20M20 10H14V4M14 10L21 3M3 21L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <VariableChipEditor
                      value={checkpointContent}
                      onChange={(v) => handleEditorChange(v, setCheckpointContent, "checkpoint")}
                      readOnly={!isCheckpointEditing}
                      placeholder="Defina as etapas de execução: # Etapa 1, objetivos, critérios de avanço, @ações..."
                      className={`w-full p-5 pr-10 text-sm leading-relaxed font-sans border-0 outline-none transition-colors ${
                        checkpointEditorExpanded ? "min-h-[500px]" : "min-h-[280px]"
                      } ${
                        isCheckpointEditing
                          ? "bg-white text-[#0d1013] cursor-text"
                          : "bg-[#f5f5f5] text-[#6b7280] cursor-default"
                      }`}
                      minHeight={checkpointEditorExpanded ? "500px" : "280px"}
                      onTriggerAt={() => handleTriggerAt("checkpoint")}
                      onVariableClick={handleVariableClick}
                    />
                  </div>

                  {/* Bottom bar */}
                  <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-t border-[#e5e5e5] bg-white">
                    <span className="text-xs text-[#9d9d9d]">
                      Digite <span className="font-mono text-[#0d1013] bg-[#f5f5f5] px-1 py-0.5 rounded text-[10px]">@</span> para ações ou <span className="font-mono text-[#0d1013] bg-[#f5f5f5] px-1 py-0.5 rounded text-[10px]">{"{{"}</span> para variáveis
                    </span>
                    <div className="flex-1" />
                    <span className="text-xs text-[#9d9d9d]">Define: etapas, objetivos, ações</span>
                  </div>
                </div>

                {/* 3️⃣ Primeira mensagem */}
                <div className="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5e5]">
                    <div>
                      <a href="#" className="flex items-center gap-1.5 text-sm font-medium text-[#0d1013] underline decoration-dotted underline-offset-4 hover:no-underline mb-0.5">
                        Primeira mensagem
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                      <p className="text-xs text-[#9d9d9d]">
                        A primeira mensagem que o agente dirá. Se estiver vazia, aguardará o usuário iniciar.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFirstMessageEditing(!isFirstMessageEditing)}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                        isFirstMessageEditing
                          ? "bg-[#0d1013] text-white border-[#0d1013]"
                          : "text-[#6b7280] border-[#e5e5e5] hover:border-[#d1d5db] hover:text-[#0d1013]"
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {isFirstMessageEditing ? "Editando" : "Editar"}
                    </button>
                  </div>

                  {/* Editor area */}
                  <div className="relative">
                    <button
                      type="button"
                      className="absolute top-3 right-3 p-1.5 rounded text-[#c4c4c4] hover:text-[#9d9d9d] hover:bg-white/80 transition-colors z-10"
                      title="Expandir"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M4 14H10V20M20 10H14V4M14 10L21 3M3 21L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <VariableChipEditor
                      value={firstMessage}
                      onChange={(v) => handleEditorChange(v, setFirstMessage, "firstMessage")}
                      readOnly={!isFirstMessageEditing}
                      placeholder="Digite a primeira mensagem do agente..."
                      className={`w-full p-5 pr-10 text-sm leading-relaxed font-sans border-0 outline-none min-h-[80px] transition-colors ${
                        isFirstMessageEditing
                          ? "bg-white text-[#0d1013] cursor-text"
                          : "bg-[#f5f5f5] text-[#6b7280] cursor-default"
                      }`}
                      minHeight="80px"
                      onTriggerAt={() => handleTriggerAt("firstMessage")}
                      onVariableClick={handleVariableClick}
                    />
                  </div>

                  {/* Bottom bar */}
                  <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-t border-[#e5e5e5] bg-white">
                    <span className="text-xs text-[#9d9d9d]">
                      Digite <span className="font-mono text-[#0d1013] bg-[#f5f5f5] px-1 py-0.5 rounded text-[10px]">{"{{"}</span> para variáveis
                    </span>
                    <div className="flex-1" />
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={interruptible}
                        onClick={() => setInterruptible(!interruptible)}
                        className={`relative w-9 h-5 rounded-full transition-colors ${interruptible ? "bg-[#0d1013]" : "bg-[#e5e5e5]"}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${interruptible ? "left-[18px]" : "left-0.5"}`} />
                      </button>
                      <span className="text-xs text-[#0d1013]">Interrompível</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Sidebar (estilo referência: Vozes, Idioma, LLM) */}
              <div className="w-[280px] flex-shrink-0 space-y-6">
                {/* Vozes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-[#0d1013]">Vozes</h3>
                    <button className="p-1 rounded text-[#9d9d9d] hover:text-[#0d1013] hover:bg-[#f5f5f5] transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-[#9d9d9d] mb-3">Selecione as vozes da ElevenLabs que você deseja usar para o agente.</p>
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border border-[#e5e5e5] hover:border-[#d1d5db] transition-colors bg-white">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <div className="text-left">
                        <p className="text-sm font-medium text-[#0d1013]">Eric - Smooth, Trustworthy</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#9d9d9d] bg-[#f5f5f5] px-2 py-0.5 rounded">Primário</span>
                  </button>
                  <button className="mt-2 flex items-center gap-2 text-sm text-[#9d9d9d] hover:text-[#0d1013] transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Adicionar voz adicional
                  </button>
                </div>

                {/* Idioma */}
                <div>
                  <h3 className="text-sm font-semibold text-[#0d1013] mb-2">Idioma</h3>
                  <p className="text-xs text-[#9d9d9d] mb-3">Escolha os idiomas padrão e adicionais em que o agente se comunicará.</p>
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border border-[#e5e5e5] hover:border-[#d1d5db] transition-colors bg-white">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🇧🇷</span>
                      <p className="text-sm font-medium text-[#0d1013]">Português</p>
                    </div>
                    <span className="text-xs text-[#9d9d9d] bg-[#f5f5f5] px-2 py-0.5 rounded">Padrão</span>
                  </button>
                  <button className="mt-2 flex items-center gap-2 text-sm text-[#9d9d9d] hover:text-[#0d1013] transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Adicionar idiomas adicionais
                  </button>
                </div>

                {/* LLM */}
                <div>
                  <h3 className="text-sm font-semibold text-[#0d1013] mb-2">LLM</h3>
                  <p className="text-xs text-[#9d9d9d] mb-3">Selecione qual provedor e modelo usar para o LLM.</p>
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border border-[#e5e5e5] hover:border-[#d1d5db] transition-colors bg-white">
                    <p className="text-sm font-medium text-[#0d1013]">Gemini 2.5 Flash</p>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#9d9d9d]">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Variable config modal (full screen, card) */}
        {variableModalOpen && selectedVariable && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5]">
                <h3 className="font-heading text-lg font-medium text-[#0d1013]">
                  Configurar variável
                </h3>
                <button
                  type="button"
                  onClick={() => { setVariableModalOpen(false); setSelectedVariable(null); }}
                  className="p-2 rounded-lg text-[#9d9d9d] hover:text-[#0d1013] hover:bg-[#f5f5f5] transition-colors"
                  aria-label="Fechar"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-[#9d9d9d] uppercase tracking-wider mb-1">Variável</p>
                    <p className="font-mono text-sm text-[#0d1013] bg-[#f5f5f5] px-3 py-2 rounded-lg">
                      {selectedVariable.variable}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#9d9d9d] uppercase tracking-wider mb-1">Tipo</p>
                    <p className="text-sm text-[#0d1013]">
                      {selectedVariable.type === "at" ? "Lógica / Ação" : "Interpolação (mensagem)"}
                    </p>
                  </div>
                  {VARIABLE_META[selectedVariable.variable] && (
                    <div>
                      <p className="text-xs font-medium text-[#9d9d9d] uppercase tracking-wider mb-1">Descrição</p>
                      <p className="text-sm text-[#0d1013]">
                        {VARIABLE_META[selectedVariable.variable].description}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-[#9d9d9d] uppercase tracking-wider mb-1">ID</p>
                    <p className="font-mono text-xs text-[#0d1013] bg-[#f5f5f5] px-3 py-2 rounded-lg">
                      {VARIABLE_META[selectedVariable.variable]?.id ?? selectedVariable.variable}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#e5e5e5]">
                    <p className="text-xs text-[#9d9d9d] mb-2">
                      Opções de configuração e ajustes desta variável serão definidas aqui.
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#e5e5e5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setVariableModalOpen(false); setSelectedVariable(null); }}
                  className="px-4 py-2 text-sm font-medium text-[#0d1013] border border-[#e5e5e5] rounded-lg hover:bg-[#f5f5f5] transition-colors"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0d1013] rounded-lg hover:bg-[#1a1a1a] transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} mainClassName="!p-0 !overflow-hidden">
      <div className="flex min-h-full w-full items-center justify-center bg-white p-6">
        <div className="w-full max-w-[900px] bg-white rounded-[18px] px-8 py-10 md:px-14 md:py-11 flex flex-col gap-8">
          
          {/* Step 1: Goal Selection */}
          {currentStep === 1 && (
            <>
              <div className="text-left">
                <h1 className="font-heading text-2xl md:text-3xl font-medium text-[#0d1013] tracking-[-0.5px] mb-2">
                  Caso de uso
                </h1>
                <p className="text-base text-[#9d9d9d] font-sans">
                  Com o que o seu agente vai ajudar?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {GOAL_OPTIONS.map((goal) => {
                  const isSelected = selectedGoal === goal.id;
                  const IconComponent = goal.icon;
                  
                  return (
                    <button
                      key={goal.id}
                      onClick={() => handleGoalSelect(goal.id)}
                      className={`flex flex-col items-center justify-center gap-3 px-4 py-6 rounded-2xl border transition-all duration-200 text-center min-h-[120px] ${
                        isSelected
                          ? "bg-[#0d1013] border-[#0d1013]"
                          : "bg-white border-[#e5e5e5] hover:border-[#d1d5db] hover:bg-[#fafafa]"
                      }`}
                    >
                      <IconComponent color={isSelected ? "#ffffff" : "#9d9d9d"} />
                      <h3 className={`font-heading font-medium text-sm leading-5 ${
                        isSelected ? "text-white" : "text-[#0d1013]"
                      }`}>
                        {goal.title}
                      </h3>
                    </button>
                  );
                })}

                <button
                  onClick={handleOtherSelect}
                  className={`flex flex-col items-center justify-center gap-3 px-4 py-6 rounded-2xl border-2 transition-all duration-200 text-center min-h-[120px] ${
                    isOtherSelected
                      ? "bg-white border-[#0d1013]"
                      : "bg-white border-dashed border-[#d1d5db] hover:border-[#9d9d9d]"
                  }`}
                >
                  <OtherIcon color={isOtherSelected ? "#0d1013" : "#9d9d9d"} />
                  <h3 className="font-heading font-medium text-sm leading-5 text-[#0d1013]">
                    Outro
                  </h3>
                </button>
              </div>

              {showCustomInput && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex-1 flex items-center h-12 px-4 bg-white border border-[#e5e5e5] rounded-xl">
                    <input
                      type="text"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      placeholder="ex.: Qualificação de leads, Onboarding de clientes..."
                      className="flex-1 text-base text-[#0d1013] bg-transparent outline-none font-sans placeholder:text-[#9d9d9d]"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={handleBack}
                  className="h-10 px-4 flex items-center justify-center gap-1 border border-[#e5e5e5] rounded-xl font-heading font-medium text-sm text-[#0d1013] hover:bg-[#f5f5f5] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Voltar
                </button>
                <button
                  onClick={handleAdvance}
                  disabled={!canAdvanceStep1}
                  className={`h-10 px-6 flex items-center justify-center rounded-xl font-heading font-medium text-sm transition-colors ${
                    canAdvanceStep1
                      ? "bg-[#0d0d0d] text-white hover:bg-[#1a1a1a]"
                      : "bg-[#e5e5e5] text-[#9d9d9d] cursor-not-allowed"
                  }`}
                >
                  Avançar
                </button>
              </div>
            </>
          )}

          {/* Step 2: Agent Name & Knowledge Base Selection */}
          {currentStep === 2 && (
            <>
              <div className="text-left">
                <h1 className="font-heading text-2xl md:text-3xl font-medium text-[#0d1013] tracking-[-0.5px] mb-2">
                  Configure seu agente
                </h1>
                <p className="text-base text-[#9d9d9d] font-sans">
                  Defina o nome e a base de conhecimento do seu agente
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#0d1013]">
                  Nome do agente
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Ex: Assistente de Vendas"
                  className="w-full h-12 px-4 bg-white border border-[#e5e5e5] rounded-xl text-base text-[#0d1013] outline-none font-sans placeholder:text-[#9d9d9d] focus:border-[#0d1013] transition-colors"
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#0d1013]">
                    Base de conhecimento
                  </label>
                  <button
                    onClick={handleCreateNewBase}
                    className="text-sm font-medium text-[#0d1013] hover:underline flex items-center gap-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Criar nova base
                  </button>
                </div>
                <p className="text-sm text-[#9d9d9d]">
                  Selecione qual base de conhecimento o agente vai utilizar
                </p>
                
                {knowledgeBases.length === 0 ? (
                  <div className="p-6 border border-dashed border-[#e5e5e5] rounded-xl text-center">
                    <p className="text-sm text-[#9d9d9d] mb-3">
                      Nenhuma base de conhecimento encontrada
                    </p>
                    <button
                      onClick={handleCreateNewBase}
                      className="text-sm font-medium text-[#0d1013] underline hover:no-underline"
                    >
                      Criar uma base de conhecimento
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {visibleBases.map((base) => {
                        const isSelected = selectedBaseId === base.id;
                        const layers = base.knowledgeLayersCount ?? 0;
                        const sources = base.documentCount ?? 0;
                        
                        return (
                          <button
                            key={base.id}
                            onClick={() => setSelectedBaseId(base.id)}
                            className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                              isSelected
                                ? "bg-[#0d1013] border-[#0d1013]"
                                : "bg-white border-[#e5e5e5] hover:border-[#d1d5db]"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "bg-white/10" : "bg-[#f5f5f5]"
                            }`}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path 
                                  d="M3 7C3 5.89543 3.89543 5 5 5H9L11 7H19C20.1046 7 21 7.89543 21 9V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" 
                                  stroke={isSelected ? "#ffffff" : "#9d9d9d"} 
                                  strokeWidth="1.5" 
                                  fill="none"
                                />
                              </svg>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-heading font-medium text-sm truncate ${
                                isSelected ? "text-white" : "text-[#0d1013]"
                              }`}>
                                {base.name}
                              </h4>
                              <div className={`flex items-center gap-3 mt-1 text-xs ${
                                isSelected ? "text-white/70" : "text-[#9d9d9d]"
                              }`}>
                                <span>{layers} Knowledge Layer{layers !== 1 ? "s" : ""}</span>
                                <span>{sources} Fonte{sources !== 1 ? "s" : ""}</span>
                              </div>
                            </div>

                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "bg-white" : "border-2 border-[#d1d5db]"
                            }`}>
                              {isSelected && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6L5 9L10 3" stroke="#0d1013" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {hasMoreBases && (
                      <button
                        onClick={() => setShowAllBases(!showAllBases)}
                        className="text-sm font-medium text-[#0d1013] hover:underline mt-2"
                      >
                        {showAllBases ? "Ver menos" : `Ver mais (${knowledgeBases.length - MAX_VISIBLE_BASES})`}
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={handleBack}
                  className="h-10 px-4 flex items-center justify-center gap-1 border border-[#e5e5e5] rounded-xl font-heading font-medium text-sm text-[#0d1013] hover:bg-[#f5f5f5] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Voltar
                </button>
                <button
                  onClick={handleAdvance}
                  disabled={!canAdvanceStep2}
                  className={`h-10 px-6 flex items-center justify-center rounded-xl font-heading font-medium text-sm transition-colors ${
                    canAdvanceStep2
                      ? "bg-[#0d0d0d] text-white hover:bg-[#1a1a1a]"
                      : "bg-[#e5e5e5] text-[#9d9d9d] cursor-not-allowed"
                  }`}
                >
                  Avançar
                </button>
              </div>
            </>
          )}

          {/* Step 3: Integrations */}
          {currentStep === 3 && (
            <>
              <div className="text-left">
                <h1 className="font-heading text-2xl md:text-3xl font-medium text-[#0d1013] tracking-[-0.5px] mb-2">
                  Integrações
                </h1>
                <p className="text-base text-[#9d9d9d] font-sans">
                  Selecione quais canais o agente deve utilizar
                </p>
              </div>

              {/* Configured Integrations */}
              {configuredIntegrations.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[#0d1013]">
                    Integrações configuradas
                  </label>
                  <div className="space-y-2">
                    {configuredIntegrations.map((integration) => (
                      <div
                        key={integration.id}
                        className="flex items-center justify-between p-4 bg-white border border-[#e5e5e5] rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] flex items-center justify-center">
                            <IntegrationIcon type={integration.icon} />
                          </div>
                          <div>
                            <h4 className="font-heading font-medium text-sm text-[#0d1013]">
                              {integration.name}
                            </h4>
                            <p className="text-xs text-[#9d9d9d]">
                              {integration.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Toggle */}
                        <button
                          onClick={() => handleToggleIntegration(integration.id)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            integration.enabled ? "bg-[#0d1013]" : "bg-[#e5e5e5]"
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              integration.enabled ? "left-7" : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unconfigured Integrations */}
              {unconfiguredIntegrations.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[#0d1013]">
                    Adicionar nova integração
                  </label>
                  <p className="text-sm text-[#9d9d9d]">
                    Configure integrações com aplicações de terceiros
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {unconfiguredIntegrations.map((integration) => (
                      <button
                        key={integration.id}
                        onClick={() => router.push("/integrations")}
                        className="flex items-center gap-3 p-4 bg-white border border-dashed border-[#d1d5db] rounded-xl hover:border-[#9d9d9d] transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] flex items-center justify-center opacity-50">
                          <IntegrationIcon type={integration.icon} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading font-medium text-sm text-[#0d1013]">
                            {integration.name}
                          </h4>
                          <p className="text-xs text-[#9d9d9d]">
                            {integration.description}
                          </p>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#9d9d9d]">
                          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={handleBack}
                  className="h-10 px-4 flex items-center justify-center gap-1 border border-[#e5e5e5] rounded-xl font-heading font-medium text-sm text-[#0d1013] hover:bg-[#f5f5f5] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Voltar
                </button>
                <button
                  onClick={handleAdvance}
                  className="h-10 px-6 flex items-center justify-center rounded-xl font-heading font-medium text-sm bg-[#0d0d0d] text-white hover:bg-[#1a1a1a] transition-colors"
                >
                  Criar agente
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowExitModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="font-heading text-xl font-medium text-[#0d1013] mb-2">
              Você está prestes a sair
            </h2>
            <p className="text-sm text-[#9d9d9d] mb-6">
              Você será redirecionado para o Knowledge OS para criar uma nova base de conhecimento. O progresso atual não será perdido.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="h-10 px-4 flex items-center justify-center border border-[#e5e5e5] rounded-xl font-heading font-medium text-sm text-[#0d1013] hover:bg-[#f5f5f5] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmExit}
                className="h-10 px-4 flex items-center justify-center rounded-xl font-heading font-medium text-sm bg-[#0d0d0d] text-white hover:bg-[#1a1a1a] transition-colors"
              >
                Ir para Knowledge OS
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
