"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwButton } from "@/components/ui/AwButton";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwAddIntegrationModal } from "@/components/ui/AwAddIntegrationModal";
import { AwModal } from "@/components/ui/AwModal";
import { AwCapabilityTile } from "@/components/ui/AwCapabilityTile";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { Icon } from "@/components/ui/Icon";
import { AGENT_ORBS, getOrbForAgent } from "@/lib/agentOrbs";

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

// Sidebar (Figma wireframe): Variáveis + Tools
const SIDEBAR_VARIABLES = [
  { id: "agent_name", name: "{{agent_name}}" },
  { id: "user_email", name: "{{user_email}}" },
  { id: "company_city", name: "{{company_city}}" },
  { id: "company_name", name: "{{company_name}}" },
  { id: "user_name", name: "{{user_name}}" },
] as const;

const SIDEBAR_TOOLS = [
  {
    id: "system",
    title: "System",
    description: "Ferramentas internas do sistema que adicionam capacidades especiais ao agente de IA, como pensar em voz alta para melhorar o raciocínio, adicionar contatos à lista negra para proteção.",
    activeCount: 3,
    availableCount: 9,
    icon: "system",
  },
  {
    id: "pipedrive",
    title: "PipeDrive",
    description: "Integração com o CRM PipeDrive para gerenciar leads, negócios, pipelines e atividades comerciais.",
    activeCount: 0,
    availableCount: 19,
    icon: "pipedrive",
  },
  {
    id: "google-calendar",
    title: "Google Calendar",
    description: "Integração com Google Calendar para gerenciar agendas, criar e atualizar eventos, verificar disponibilidade de horários e agendar reuniões automaticamente.",
    activeCount: 2,
    availableCount: 16,
    icon: "calendar",
  },
  {
    id: "google-sheets",
    title: "Google Sheets",
    description: "Integração com o Google Sheets para registrar, consultar e atualizar dados em planilhas.",
    activeCount: 0,
    availableCount: 12,
    icon: "sheets",
  },
] as const;

// Left sidebar tabs (only on agent editor page)
type AgentStudioTabId =
  | "agente"
  | "visualizacao-modular"
  | "bases-conhecimento"
  | "aop"
  | "analise"
  | "playground"
  | "historico"
  | "configuracoes";

const AGENT_STUDIO_SIDEBAR_ITEMS: { id: AgentStudioTabId; label: string; description: string }[] = [
  { id: "agente", label: "Agente", description: "Configure personalidade, checkpoint e primeira mensagem do agente." },
  { id: "visualizacao-modular", label: "Visualização Modular", description: "Veja o checkpoint do agente em formato de workflow modular." },
  { id: "bases-conhecimento", label: "Bases de Conhecimento", description: "Gerencie fontes e knowledge layers usados pelo agente." },
  { id: "aop", label: "AOP", description: "Protocolos específicos que o agente pode utilizar." },
  { id: "analise", label: "Análise", description: "Informações e métricas relevantes do agente." },
  { id: "playground", label: "Playground", description: "Converse e teste o agente em tempo real." },
  { id: "historico", label: "Histórico de alterações", description: "Registro de todas as alterações feitas no agente." },
  { id: "configuracoes", label: "Configurações", description: "Ajustes gerais e preferências do agente." },
];

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
      if (e.key === "@" && onTriggerAt) {
        e.preventDefault();
        const sel = document.getSelection();
        if (sel && divRef.current?.contains(sel.anchorNode)) {
          const range = sel.getRangeAt(0);
          const textNode = document.createTextNode("@");
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          sel.removeAllRanges();
          sel.addRange(range);
          // Sync value and show suggestions after DOM update
          if (divRef.current) {
            const newValue = serializeDomToValue(divRef.current);
            onChange(newValue);
          }
          onTriggerAt();
        } else {
          setTimeout(() => onTriggerAt(), 0);
        }
      }
      // {{ is detected in handleEditorChange when value ends with {{
    },
    [readOnly, onTriggerAt, onChange]
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
    if (!value) return <div className={`${className} text-fg-tertiary`} style={{ minHeight }}>{placeholder}</div>;
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
      className={`${className} whitespace-pre-wrap break-words outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-fg-tertiary`}
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
const SalesIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M12 8V12L15 15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="1.5"/>
  </svg>
);

const RecoveryIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12C3 7.02944 7.02944 3 12 3C14.8273 3 17.35 4.30367 19 6.34267V4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12C21 16.9706 16.9706 21 12 21C9.17273 21 6.65 19.6963 5 17.6573V20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5" cy="4" r="1" fill={color}/>
    <circle cx="19" cy="20" r="1" fill={color}/>
  </svg>
);

const OnboardingIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H20M4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6M4 6L6 4H18L20 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 14L11 17L16 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LeadCaptureIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L12 22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2 12L22 12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="5" cy="8" r="1.5" fill={color}/>
    <circle cx="12" cy="5" r="1.5" fill={color}/>
    <circle cx="19" cy="12" r="1.5" fill={color}/>
    <circle cx="12" cy="19" r="1.5" fill={color}/>
  </svg>
);

const CSLaunchIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="16" cy="6" r="1.5" fill={color}/>
    <circle cx="18" cy="16" r="1.5" fill={color}/>
  </svg>
);

const SchedulingIcon = ({ color = "currentColor" }: { color?: string }) => (
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

const SupportIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M22 22L18 18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M11.5 7V12L15 14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const OtherIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.3062 14.1652 11.4174 13 11.8293V13" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1" fill={color}/>
  </svg>
);

// Animated sparkle icon for loading
const SparkleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
    <path d="M24 4L27.5 16.5L40 20L27.5 23.5L24 36L20.5 23.5L8 20L20.5 16.5L24 4Z" fill="var(--aw-gray-1200)"/>
    <path d="M36 28L38 33L43 35L38 37L36 42L34 37L29 35L34 33L36 28Z" fill="var(--aw-gray-1200)" className="animate-ping"/>
    <path d="M12 28L14 33L19 35L14 37L12 42L10 37L5 35L10 33L12 28Z" fill="var(--aw-gray-1200)" className="animate-ping" style={{ animationDelay: "0.5s" }}/>
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
  { id: "messenger", name: "Messenger", description: "Facebook Messenger", icon: "messenger", configured: true, enabled: false },
  { id: "telegram", name: "Telegram", description: "Bot do Telegram", icon: "telegram", configured: false, enabled: false },
  { id: "email", name: "E-mail", description: "Integração com e-mail", icon: "email", configured: false, enabled: false },
  { id: "slack", name: "Slack", description: "Workspace do Slack", icon: "slack", configured: false, enabled: false },
];

/* ───────── Habilidades e AOPs (step 3) ─────────
 * Habilidades = integrações de terceiro que o agente usa como ferramenta.
 * AOPs = processos operacionais padrão. Ambos já existem a nível de conta/org;
 * aqui o usuário só concede permissão de acesso ao agente que está criando. */

interface Habilidade {
  id: string;
  name: string;
  domain: string;
  /** Inicial + cor da marca pro badge (logo real entra depois). */
  letter: string;
  color: string;
  summary: string;
}

const HABILIDADES: Habilidade[] = [
  { id: "stripe", name: "Stripe", domain: "stripe.com", letter: "S", color: "#635BFF", summary: "Pagamentos, assinaturas e reembolsos. O agente consulta o status de uma cobrança e pode iniciar estornos quando autorizado." },
  { id: "calendly", name: "Calendly", domain: "calendly.com", letter: "C", color: "#006BFF", summary: "Agendamento. O agente oferece horários livres e confirma reuniões direto na agenda conectada." },
  { id: "pipedrive", name: "Pipedrive", domain: "pipedrive.com", letter: "P", color: "#1A7F4B", summary: "CRM de vendas. O agente lê e atualiza negócios, contatos e etapas do funil." },
  { id: "slack", name: "Slack", domain: "slack.com", letter: "S", color: "#4A154B", summary: "Mensageria do time. O agente notifica canais e escala conversas pra um humano." },
  { id: "hotmart", name: "Hotmart", domain: "hotmart.com", letter: "H", color: "#F04E23", summary: "Produtos digitais. O agente consulta compras, acessos e status de assinatura do aluno." },
  { id: "onprofit", name: "OnProfit", domain: "onprofit.com.br", letter: "O", color: "#2E9E7B", summary: "Gestão financeira. O agente puxa indicadores de receita e despesas pra responder dúvidas comerciais." },
  { id: "tally", name: "Tally", domain: "tally.so", letter: "T", color: "#7C7C7C", summary: "Formulários. O agente lê respostas de formulários pra qualificar e enriquecer o lead." },
];

interface Aop {
  id: string;
  name: string;
  /** Material Symbol semântico. */
  icon: string;
  summary: string;
}

const AOPS: Aop[] = [
  { id: "reembolso-cartao", name: "Reembolso de cartão", icon: "payments", summary: "Estorna uma cobrança aprovada seguindo a política de reembolso da organização." },
  { id: "agendar-reuniao", name: "Agendar reunião", icon: "event", summary: "Encontra um horário livre e marca a reunião na agenda conectada do responsável." },
  { id: "qualificar-lead", name: "Qualificar lead", icon: "filter_alt", summary: "Aplica o roteiro de qualificação (BANT/ICP) e classifica o lead antes de seguir." },
  { id: "atualizar-crm", name: "Atualizar CRM", icon: "sync_alt", summary: "Registra a conversa e atualiza a etapa do negócio no CRM automaticamente." },
  { id: "emitir-nota", name: "Emitir nota fiscal", icon: "receipt_long", summary: "Dispara a emissão da nota fiscal após a confirmação do pagamento." },
  { id: "escalar-humano", name: "Escalar para humano", icon: "support_agent", summary: "Transfere a conversa para um atendente quando o assunto sai do escopo do agente." },
];

/** Tile fantasma que leva pra lista completa de Habilidades/AOPs. */
function VerTodasTile({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm font-medium text-fg-secondary transition-colors duration-aw-fast hover:border-aw-gray-400 hover:bg-bg-surface"
    >
      <Icon name="open_in_new" size={16} />
      {label}
    </button>
  );
}

/* ───────── Seleção de Canal (step 4) ─────────
 * Onde o agente vai atender. No protótipo, WhatsApp tem o sub-fluxo completo
 * (número da conta → template de 1ª mensagem); os outros canais são selecionáveis
 * mas seguem direto. Espelha o modelo do Figma: Telefone + Primeira mensagem. */

const CANAIS = [
  { id: "whatsapp", name: "WhatsApp", description: "Atendimento e disparos no WhatsApp Business", icon: "whatsapp" },
  { id: "instagram", name: "Instagram", description: "Conversas no Instagram Direct", icon: "instagram" },
  { id: "messenger", name: "Messenger", description: "Facebook Messenger", icon: "messenger" },
  { id: "telegram", name: "Telegram", description: "Bot do Telegram", icon: "telegram" },
];

interface WhatsNumber {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

const WHATS_NUMBERS: WhatsNumber[] = [
  { id: "germano", name: "Germano Faccio", phone: "+55 (31) 99949-6803", avatar: "/assets/ui-faces/male-7.jpg" },
  { id: "comercial", name: "Comercial Fyntra", phone: "+55 (11) 98123-4501" },
  { id: "suporte", name: "Suporte Fyntra", phone: "+55 (11) 3003-9012" },
];

interface WhatsTemplate {
  id: string;
  name: string;
  preview: string;
  status: "aprovado" | "pendente";
}

const WHATS_TEMPLATES: WhatsTemplate[] = [
  { id: "fyntra_produtos", name: "fyntra_produtos", preview: "Oi {{1}}! Vi que você se interessou pelos nossos produtos. Posso te ajudar a escolher o ideal?", status: "aprovado" },
  { id: "recuperacao_carrinho", name: "recuperacao_carrinho", preview: "Olá {{1}}, notamos que você deixou itens no carrinho. Quer finalizar com 10% de desconto?", status: "aprovado" },
  { id: "agendamento_demo", name: "agendamento_demo", preview: "Oi {{1}}! Que tal agendar uma demonstração rápida? Tenho horários essa semana.", status: "pendente" },
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
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--aw-gray-600)" strokeWidth="1.5"/>
          <path d="M8 12h8M12 8v8" stroke="var(--aw-gray-600)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
  }
};

// Module tag component for the editor
const ModuleTag = ({ module }: { module: PromptModule }) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    variable: { bg: "bg-bg-surface", text: "text-fg-primary", border: "border-border" },
    action: {
      bg: "bg-[var(--aw-emerald-150)]",
      text: "text-[var(--aw-emerald-900)]",
      border: "border-[var(--aw-emerald-300)]",
    },
    condition: {
      bg: "bg-[var(--aw-amber-150)]",
      text: "text-[var(--aw-amber-900)]",
      border: "border-[var(--aw-amber-300)]",
    },
    loop: {
      bg: "bg-[var(--aw-blue-150)]",
      text: "text-[var(--aw-blue-900)]",
      border: "border-[var(--aw-blue-300)]",
    },
  };

  const style = colors[module.type] || colors.variable;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${style.bg} ${style.text} border ${style.border} font-mono text-xs`}>
      {module.type === "action" && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[var(--aw-emerald-900)]">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {module.content}
      {module.reference && <span className="opacity-50 text-[10px]">{module.reference}</span>}
    </span>
  );
};

// ========================================
// Modular Flow Visualization Component
// ========================================

type FlowNodeType = "trigger" | "greeting" | "action" | "condition" | "message" | "decision" | "loop" | "end";

interface FlowNode {
  id: string;
  type: FlowNodeType;
  label: string;
  description?: string;
  config?: Record<string, any>;
  position: { x: number; y: number };
}

interface FlowConnection {
  from: string;
  to: string;
  label?: string;
}

const SAMPLE_FLOW_NODES: FlowNode[] = [
  {
    id: "1",
    type: "trigger",
    label: "Início da Conversa",
    description: "Quando o usuário inicia contato",
    position: { x: 400, y: 80 },
  },
  {
    id: "2",
    type: "greeting",
    label: "Saudação Inicial",
    description: "Apresentar o agente e dar boas-vindas",
    config: {
      message: "Olá! Sou o assistente de vendas da {{company.name}}. Como posso ajudar?",
    },
    position: { x: 400, y: 200 },
  },
  {
    id: "3",
    type: "action",
    label: "Qualificar Lead",
    description: "Coletar informações básicas do lead",
    config: {
      action: "@ask_to_agent",
      fields: ["nome", "empresa", "interesse"],
    },
    position: { x: 400, y: 340 },
  },
  {
    id: "4",
    type: "condition",
    label: "Lead Qualificado?",
    description: "Verificar se o lead atende aos critérios",
    config: {
      condition: "{{lead.score}} > 7",
    },
    position: { x: 400, y: 480 },
  },
  {
    id: "5",
    type: "action",
    label: "Criar Oportunidade",
    description: "Criar deal no CRM",
    config: {
      action: "@create_deal",
      pipeline: "vendas",
    },
    position: { x: 280, y: 620 },
  },
  {
    id: "6",
    type: "message",
    label: "Mensagem de Follow-up",
    description: "Enviar próximos passos",
    config: {
      message: "Ótimo! Vou encaminhar sua solicitação para nosso time comercial.",
    },
    position: { x: 520, y: 620 },
  },
];

const SAMPLE_CONNECTIONS: FlowConnection[] = [
  { from: "1", to: "2" },
  { from: "2", to: "3" },
  { from: "3", to: "4" },
  { from: "4", to: "5", label: "Sim" },
  { from: "4", to: "6", label: "Não" },
];

const FlowNodeComponent = ({
  node,
  isSelected,
  onClick
}: {
  node: FlowNode;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const getNodeStyle = (type: FlowNodeType) => {
    switch (type) {
      case "trigger":
        return {
          bg: "bg-[var(--bg-inverse)]",
          border: "border-[var(--bg-inverse)]",
          text: "text-[var(--fg-on-inverse)]",
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          ),
        };
      case "greeting":
      case "message":
        return {
          bg: "bg-[var(--bg-raised)]",
          border: "border-[var(--border-default)]",
          text: "text-[var(--fg-primary)]",
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          ),
        };
      case "action":
        return {
          bg: "bg-[var(--bg-raised)]",
          border: "border-[var(--border-default)]",
          text: "text-[var(--fg-primary)]",
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          ),
        };
      case "condition":
      case "decision":
        return {
          bg: "bg-[var(--aw-amber-100)]",
          border: "border-[var(--aw-amber-300)]",
          text: "text-[var(--aw-amber-900)]",
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 12l10 10 10-10L12 2z"/>
            </svg>
          ),
        };
      case "loop":
        return {
          bg: "bg-[var(--aw-blue-100)]",
          border: "border-[var(--aw-blue-300)]",
          text: "text-[var(--aw-blue-900)]",
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
          ),
        };
      default:
        return {
          bg: "bg-[var(--bg-raised)]",
          border: "border-[var(--border-default)]",
          text: "text-[var(--fg-primary)]",
          icon: null,
        };
    }
  };

  const style = getNodeStyle(node.type);

  return (
    <div
      style={{
        position: "absolute",
        left: node.position.x,
        top: node.position.y,
        transform: "translate(-50%, -50%)",
      }}
      onClick={onClick}
      className={`
        cursor-pointer transition-all duration-200
        ${isSelected ? "scale-105" : "hover:scale-102"}
      `}
    >
      <div
        className={`
          ${style.bg} ${style.text}
          border-2 ${isSelected ? "border-aw-gray-1200 shadow-lg" : style.border}
          rounded-xl px-4 py-3
          min-w-[200px] max-w-[240px]
          transition-all duration-200
        `}
      >
        <div className="flex items-start gap-2">
          <div className={`shrink-0 mt-0.5 ${node.type === "trigger" ? "text-[var(--fg-on-inverse)]" : "text-fg-tertiary"}`}>
            {style.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm leading-tight mb-0.5">
              {node.label}
            </div>
            {node.description && (
              <div className={`text-xs leading-snug ${node.type === "trigger" ? "text-[var(--aw-gray-400)]" : "text-fg-tertiary"}`}>
                {node.description}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connection point (bottom) */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-3 h-3 bg-aw-gray-300 rounded-full border-2 border-[var(--bg-raised)]" />
    </div>
  );
};

const FlowConnectionComponent = ({
  from,
  to,
  label,
  nodes
}: {
  from: string;
  to: string;
  label?: string;
  nodes: FlowNode[];
}) => {
  const fromNode = nodes.find(n => n.id === from);
  const toNode = nodes.find(n => n.id === to);

  if (!fromNode || !toNode) return null;

  const x1 = fromNode.position.x;
  const y1 = fromNode.position.y + 40;
  const x2 = toNode.position.x;
  const y2 = toNode.position.y - 40;

  const midY = (y1 + y2) / 2;

  return (
    <g>
      <path
        d={`M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`}
        stroke="var(--aw-gray-300)"
        strokeWidth="2"
        fill="none"
      />
      {label && (
        <g>
          <rect
            x={x2 + 8}
            y={midY - 10}
            width={label.length * 6 + 12}
            height="20"
            fill="white"
            stroke="var(--aw-gray-300)"
            strokeWidth="1"
            rx="4"
          />
          <text
            x={x2 + 14}
            y={midY + 4}
            fontSize="11"
            fill="var(--aw-gray-600)"
            fontWeight="500"
          >
            {label}
          </text>
        </g>
      )}
      {/* Arrow */}
      <path
        d={`M ${x2} ${y2} l -4 -8 l 4 2 l 4 -2 Z`}
        fill="var(--aw-gray-300)"
      />
    </g>
  );
};

// ========================================
// Knowledge Base Management Types & Data
// ========================================

type SourceType = "file" | "url" | "snippet" | "integration";

interface KnowledgeLayer {
  id: string;
  question: string;
  answer: string;
  enabled: boolean;
}

interface KnowledgeSource {
  id: string;
  name: string;
  type: SourceType;
  enabled: boolean;
  layersCount: number;
  layers: KnowledgeLayer[];
  createdAt: string;
  status: "active" | "processing" | "error";
}

interface AgentKnowledgeBase {
  id: string;
  name: string;
  description: string;
  sourcesCount: number;
  layersCount: number;
  sources: KnowledgeSource[];
  enabled: boolean;
}

const MOCK_AGENT_KNOWLEDGE_BASES: AgentKnowledgeBase[] = [
  {
    id: "kb-1",
    name: "Base Produtos e Serviços",
    description: "Informações sobre produtos, preços e especificações",
    sourcesCount: 4,
    layersCount: 156,
    enabled: true,
    sources: [
      {
        id: "src-1",
        name: "catalogo-produtos-2024.pdf",
        type: "file",
        enabled: true,
        layersCount: 5,
        status: "active",
        createdAt: "2024-01-15",
        layers: [
          {
            id: "l1",
            question: "Quais são os produtos disponíveis no catálogo 2024?",
            answer: "O catálogo 2024 inclui três linhas principais: Solução Enterprise, Solução Pro e Solução Starter, cada uma com diferentes níveis de recursos e suporte.",
            enabled: true
          },
          {
            id: "l2",
            question: "Qual é a política de preços para clientes corporativos?",
            answer: "Clientes corporativos com mais de 50 usuários têm direito a descontos progressivos de 15% a 30%, além de suporte prioritário e onboarding dedicado.",
            enabled: true
          },
          {
            id: "l3",
            question: "Quais integrações estão incluídas no plano Enterprise?",
            answer: "O plano Enterprise inclui integrações com HubSpot, Salesforce, Pipedrive, Slack, Microsoft Teams e API customizada para integrações proprietárias.",
            enabled: false
          },
          {
            id: "l4",
            question: "Como funciona o período de trial?",
            answer: "Oferecemos 14 dias de trial gratuito com acesso completo a todos os recursos do plano escolhido, sem necessidade de cartão de crédito.",
            enabled: true
          },
          {
            id: "l5",
            question: "Qual é o SLA garantido para o plano Enterprise?",
            answer: "O plano Enterprise garante 99.9% de uptime, com compensação de créditos caso o SLA não seja atingido, e suporte 24/7 com resposta em até 1 hora.",
            enabled: true
          },
        ],
      },
      {
        id: "src-2",
        name: "https://empresa.com/produtos",
        type: "url",
        enabled: true,
        layersCount: 3,
        status: "active",
        createdAt: "2024-01-20",
        layers: [
          {
            id: "l6",
            question: "Como funciona a automação de vendas?",
            answer: "A automação de vendas utiliza IA para qualificar leads, agendar follow-ups e priorizar oportunidades com maior probabilidade de conversão.",
            enabled: true
          },
          {
            id: "l7",
            question: "Quais métricas podem ser acompanhadas no dashboard?",
            answer: "O dashboard permite acompanhar taxa de conversão, tempo médio de ciclo de vendas, pipeline value, forecast de receita e performance individual dos vendedores.",
            enabled: true
          },
          {
            id: "l8",
            question: "É possível personalizar os workflows?",
            answer: "Sim, todos os workflows podem ser personalizados através de um editor visual drag-and-drop, sem necessidade de código.",
            enabled: true
          },
        ],
      },
      {
        id: "src-3",
        name: "Política de Descontos 2024",
        type: "snippet",
        enabled: false,
        layersCount: 2,
        status: "active",
        createdAt: "2024-02-01",
        layers: [
          {
            id: "l9",
            question: "Como solicitar desconto para contratos anuais?",
            answer: "Contratos anuais pagos antecipadamente têm desconto de 20%. Entre em contato com o time comercial através do e-mail vendas@empresa.com.",
            enabled: true
          },
          {
            id: "l10",
            question: "Existe desconto para ONGs e instituições educacionais?",
            answer: "Sim, oferecemos 40% de desconto para organizações sem fins lucrativos e 50% para instituições educacionais reconhecidas pelo MEC.",
            enabled: true
          },
        ],
      },
      {
        id: "src-4",
        name: "HubSpot CRM",
        type: "integration",
        enabled: true,
        layersCount: 3,
        status: "active",
        createdAt: "2024-01-10",
        layers: [
          {
            id: "l11",
            question: "Como sincronizar contatos do HubSpot?",
            answer: "A sincronização é automática e bidirecional. Após conectar sua conta HubSpot, todos os contatos, deals e atividades são sincronizados em tempo real.",
            enabled: true
          },
          {
            id: "l12",
            question: "Quais campos do HubSpot são suportados?",
            answer: "Suportamos todos os campos padrão do HubSpot e até 50 campos customizados por objeto (contatos, empresas e deals).",
            enabled: true
          },
          {
            id: "l13",
            question: "É possível criar automações que atualizem o HubSpot?",
            answer: "Sim, você pode configurar automações para criar, atualizar e deletar registros no HubSpot baseado em triggers e condições específicas.",
            enabled: false
          },
        ],
      },
    ],
  },
  {
    id: "kb-2",
    name: "Base FAQ e Suporte",
    description: "Perguntas frequentes e procedimentos de atendimento",
    sourcesCount: 2,
    layersCount: 64,
    enabled: true,
    sources: [
      {
        id: "src-5",
        name: "faq-completo.md",
        type: "file",
        enabled: true,
        layersCount: 4,
        status: "active",
        createdAt: "2024-01-25",
        layers: [
          {
            id: "l14",
            question: "Como redefinir minha senha?",
            answer: "Clique em 'Esqueci minha senha' na tela de login, digite seu e-mail e siga as instruções enviadas para sua caixa de entrada.",
            enabled: true
          },
          {
            id: "l15",
            question: "Posso ter múltiplos usuários na mesma conta?",
            answer: "Sim, você pode adicionar usuários ilimitados em todos os planos. Cada usuário terá seu próprio login e permissões configuráveis.",
            enabled: true
          },
          {
            id: "l16",
            question: "Como cancelar minha assinatura?",
            answer: "Acesse Configurações > Assinatura > Cancelar. Você terá acesso até o fim do período pago e seus dados ficarão disponíveis por 90 dias.",
            enabled: true
          },
          {
            id: "l17",
            question: "Existe limite de armazenamento?",
            answer: "O plano Starter tem 10GB, Pro tem 100GB e Enterprise tem armazenamento ilimitado. É possível adicionar armazenamento extra por R$ 20/mês por 10GB.",
            enabled: true
          },
        ],
      },
      {
        id: "src-6",
        name: "https://help.empresa.com",
        type: "url",
        enabled: true,
        layersCount: 2,
        status: "processing",
        createdAt: "2024-02-02",
        layers: [
          {
            id: "l18",
            question: "Como importar dados de outras plataformas?",
            answer: "Use a ferramenta de importação em Configurações > Importar Dados. Aceitamos arquivos CSV, Excel e conexões diretas com Salesforce, Pipedrive e HubSpot.",
            enabled: true
          },
          {
            id: "l19",
            question: "Existe aplicativo mobile?",
            answer: "Sim, temos aplicativos nativos para iOS e Android com sincronização em tempo real e acesso offline aos dados mais recentes.",
            enabled: true
          },
        ],
      },
    ],
  },
];

const KnowledgeBaseManagement = () => {
  const [knowledgeBases, setKnowledgeBases] = useState<AgentKnowledgeBase[]>(MOCK_AGENT_KNOWLEDGE_BASES);
  const [expandedBases, setExpandedBases] = useState<Set<string>>(new Set(["kb-1"]));
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());

  const toggleBase = (baseId: string) => {
    setExpandedBases(prev => {
      const next = new Set(prev);
      if (next.has(baseId)) {
        next.delete(baseId);
      } else {
        next.add(baseId);
      }
      return next;
    });
  };

  const toggleSource = (sourceId: string) => {
    setExpandedSources(prev => {
      const next = new Set(prev);
      if (next.has(sourceId)) {
        next.delete(sourceId);
      } else {
        next.add(sourceId);
      }
      return next;
    });
  };

  const toggleBaseEnabled = (baseId: string) => {
    setKnowledgeBases(prev =>
      prev.map(base =>
        base.id === baseId ? { ...base, enabled: !base.enabled } : base
      )
    );
  };

  const toggleSourceEnabled = (baseId: string, sourceId: string) => {
    setKnowledgeBases(prev =>
      prev.map(base =>
        base.id === baseId
          ? {
              ...base,
              sources: base.sources.map(src =>
                src.id === sourceId ? { ...src, enabled: !src.enabled } : src
              ),
            }
          : base
      )
    );
  };

  const toggleLayerEnabled = (baseId: string, sourceId: string, layerId: string) => {
    setKnowledgeBases(prev =>
      prev.map(base =>
        base.id === baseId
          ? {
              ...base,
              sources: base.sources.map(src =>
                src.id === sourceId
                  ? {
                      ...src,
                      layers: src.layers.map(layer =>
                        layer.id === layerId ? { ...layer, enabled: !layer.enabled } : layer
                      ),
                    }
                  : src
              ),
            }
          : base
      )
    );
  };

  const getSourceIcon = (type: SourceType) => {
    switch (type) {
      case "file":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <path d="M13 2v7h7" />
          </svg>
        );
      case "url":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
        );
      case "snippet":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        );
      case "integration":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v6M12 18v4M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M18 12h4M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" />
          </svg>
        );
    }
  };

  const KnowledgeLayerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.3335 8.00089C1.33318 8.1284 1.36944 8.25333 1.43798 8.36086C1.50651 8.46838 1.60444 8.554 1.72016 8.60756L7.4535 11.2142C7.6263 11.2925 7.81381 11.3329 8.0035 11.3329C8.19319 11.3329 8.3807 11.2925 8.5535 11.2142L14.2735 8.61422C14.3915 8.56118 14.4915 8.47495 14.5614 8.36604C14.6312 8.25714 14.6679 8.13026 14.6668 8.00089M1.3335 11.3342C1.33318 11.4617 1.36944 11.5867 1.43798 11.6942C1.50651 11.8017 1.60444 11.8873 1.72016 11.9409L7.4535 14.5476C7.6263 14.6258 7.81381 14.6663 8.0035 14.6663C8.19319 14.6663 8.3807 14.6258 8.5535 14.5476L14.2735 11.9476C14.3915 11.8945 14.4915 11.8083 14.5614 11.6994C14.6312 11.5905 14.6679 11.4636 14.6668 11.3342M8.5535 1.45422C8.37979 1.37499 8.19109 1.33398 8.00016 1.33398C7.80924 1.33398 7.62054 1.37499 7.44683 1.45422L1.7335 4.05422C1.6152 4.10639 1.51462 4.19182 1.44401 4.30013C1.3734 4.40843 1.3358 4.53493 1.3358 4.66422C1.3358 4.79351 1.3734 4.92001 1.44401 5.02832C1.51462 5.13662 1.6152 5.22206 1.7335 5.27422L7.4535 7.88089C7.62721 7.96012 7.81591 8.00113 8.00683 8.00113C8.19776 8.00113 8.38646 7.96012 8.56016 7.88089L14.2802 5.28089C14.3985 5.22873 14.499 5.14329 14.5697 5.03499C14.6403 4.92668 14.6779 4.80018 14.6779 4.67089C14.6779 4.5416 14.6403 4.4151 14.5697 4.30679C14.499 4.19849 14.3985 4.11305 14.2802 4.06089L8.5535 1.45422Z" stroke="var(--aw-gray-800)" strokeWidth="0.666667" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="flex-1 flex flex-col bg-bg-surface overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-medium text-fg-primary">
              Bases de Conhecimento
            </h2>
            <p className="text-sm text-fg-tertiary mt-0.5">
              Gerencie as fontes e knowledge layers usadas pelo agente
            </p>
          </div>
          <AwButton variant="primary" size="md" iconLeft="add">
            Adicionar Base
          </AwButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-5xl space-y-4">
          {knowledgeBases.map(base => {
            const isExpanded = expandedBases.has(base.id);
            const enabledSourcesCount = base.sources.filter(s => s.enabled).length;
            const totalLayersEnabled = base.sources.reduce(
              (sum, src) => sum + src.layers.filter(l => l.enabled).length,
              0
            );

            return (
              <div
                key={base.id}
                className="bg-white border border-border rounded-xl overflow-hidden"
              >
                {/* Base header */}
                <div className="px-5 py-4 flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => toggleBase(base.id)}
                    className="shrink-0 mt-1 p-1 rounded hover:bg-bg-muted transition-colors text-fg-tertiary"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-heading text-base font-medium text-fg-primary mb-1">
                          {base.name}
                        </h3>
                        <p className="text-sm text-fg-tertiary mb-3">
                          {base.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-fg-tertiary">
                          <span>
                            {enabledSourcesCount} de {base.sourcesCount} fontes ativas
                          </span>
                          <span>•</span>
                          <span>
                            {totalLayersEnabled} de {base.layersCount} layers ativos
                          </span>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 shrink-0 cursor-pointer group">
                        <span className="text-sm text-fg-tertiary group-hover:text-fg-primary transition-colors">
                          {base.enabled ? "Ativa" : "Inativa"}
                        </span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={base.enabled}
                            onChange={() => toggleBaseEnabled(base.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-aw-gray-300 rounded-full peer peer-checked:bg-aw-gray-1200 transition-colors" />
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Sources list */}
                {isExpanded && (
                  <div className="border-t border-border bg-bg-surface">
                    {base.sources.map(source => {
                      const isSourceExpanded = expandedSources.has(source.id);
                      const enabledLayersCount = source.layers.filter(l => l.enabled).length;

                      return (
                        <div
                          key={source.id}
                          className="border-b border-border last:border-b-0"
                        >
                          {/* Source header */}
                          <div className="px-5 py-3 flex items-center gap-3 hover:bg-white/50 transition-colors">
                            <button
                              type="button"
                              onClick={() => toggleSource(source.id)}
                              className="shrink-0 p-1 rounded hover:bg-white transition-colors text-fg-tertiary"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={`transition-transform ${isSourceExpanded ? "rotate-90" : ""}`}
                              >
                                <path d="M9 18l6-6-6-6" />
                              </svg>
                            </button>

                            <div className="shrink-0 text-fg-tertiary">
                              {getSourceIcon(source.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-fg-primary truncate">
                                  {source.name}
                                </span>
                                {source.status === "processing" && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    Processando
                                  </span>
                                )}
                                {source.status === "error" && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                    Erro
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-fg-tertiary">
                                {enabledLayersCount} de {source.layersCount} layers ativos
                              </div>
                            </div>

                            <label className="flex items-center shrink-0 cursor-pointer">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={source.enabled}
                                  onChange={() => toggleSourceEnabled(base.id, source.id)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-aw-gray-300 rounded-full peer peer-checked:bg-aw-gray-1200 transition-colors" />
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                              </div>
                            </label>
                          </div>

                          {/* Layers list */}
                          {isSourceExpanded && (
                            <div className="px-5 pl-12 pb-3 space-y-2">
                              {source.layers.map(layer => (
                                <div
                                  key={layer.id}
                                  className="flex items-start gap-3 py-3 px-4 bg-white rounded-lg border border-border hover:border-aw-gray-400 transition-colors"
                                >
                                  <div className="shrink-0 mt-0.5">
                                    <KnowledgeLayerIcon />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-fg-primary mb-1 leading-tight">
                                      {layer.question}
                                    </div>
                                    <div className="text-xs text-fg-tertiary leading-relaxed">
                                      {layer.answer}
                                    </div>
                                  </div>
                                  <label className="flex items-center shrink-0 cursor-pointer ml-2">
                                    <div className="relative">
                                      <input
                                        type="checkbox"
                                        checked={layer.enabled}
                                        onChange={() =>
                                          toggleLayerEnabled(base.id, source.id, layer.id)
                                        }
                                        className="sr-only peer"
                                      />
                                      <div className="w-9 h-5 bg-aw-gray-300 rounded-full peer peer-checked:bg-aw-gray-1200 transition-colors" />
                                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                                    </div>
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ModularFlowVisualization = () => {
  const [nodes] = useState<FlowNode[]>(SAMPLE_FLOW_NODES);
  const [connections] = useState<FlowConnection[]>(SAMPLE_CONNECTIONS);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("2");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex-1 flex relative bg-bg-surface">
      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {/* Toolbar */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
          <div className="bg-white border border-border rounded-lg px-1 py-0.5 flex items-center gap-1">
            <AwButton
              variant="ghost"
              size="sm"
              iconOnly="zoom_in"
              aria-label="Zoom in"
              title="Zoom in"
              onClick={() => setZoom(z => Math.min(z + 0.1, 2))}
            />
            <span className="text-xs font-medium text-fg-tertiary tabular-nums px-1">
              {Math.round(zoom * 100)}%
            </span>
            <AwButton
              variant="ghost"
              size="sm"
              iconOnly="zoom_out"
              aria-label="Zoom out"
              title="Zoom out"
              onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
            />
          </div>
          <AwButton
            variant="secondary"
            size="sm"
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          >
            Reset
          </AwButton>
        </div>

        {/* Flow canvas */}
        <div
          className="absolute inset-0 overflow-auto"
          style={{
            backgroundImage: "radial-gradient(circle, var(--aw-gray-300) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <div
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: "center center",
              minWidth: "100%",
              minHeight: "100%",
              position: "relative",
            }}
          >
            {/* SVG for connections */}
            <svg
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            >
              {connections.map((conn, idx) => (
                <FlowConnectionComponent
                  key={idx}
                  from={conn.from}
                  to={conn.to}
                  label={conn.label}
                  nodes={nodes}
                />
              ))}
            </svg>

            {/* Nodes */}
            {nodes.map(node => (
              <FlowNodeComponent
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                onClick={() => setSelectedNodeId(node.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Inspector Panel */}
      {selectedNode && (
        <div className="w-[360px] bg-white border-l border-border flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-heading text-base font-medium text-fg-primary mb-1">
                  {selectedNode.label}
                </h3>
                <p className="text-xs text-fg-tertiary">
                  {selectedNode.description}
                </p>
              </div>
              <AwButton
                variant="ghost"
                size="sm"
                iconOnly="close"
                aria-label="Fechar inspetor"
                className="-mr-1.5"
                onClick={() => setSelectedNodeId(null)}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-fg-tertiary uppercase tracking-wider mb-2">
                  Tipo de Módulo
                </label>
                <div className="px-3 py-2 bg-bg-muted rounded-lg text-sm text-fg-primary font-medium">
                  {selectedNode.type === "trigger" && "Gatilho"}
                  {selectedNode.type === "greeting" && "Saudação"}
                  {selectedNode.type === "message" && "Mensagem"}
                  {selectedNode.type === "action" && "Ação"}
                  {selectedNode.type === "condition" && "Condição"}
                  {selectedNode.type === "decision" && "Decisão"}
                  {selectedNode.type === "loop" && "Loop"}
                </div>
              </div>

              {/* Configuration fields based on type */}
              {selectedNode.config?.message && (
                <div>
                  <label className="block text-xs font-medium text-fg-tertiary uppercase tracking-wider mb-2">
                    Mensagem
                  </label>
                  <textarea
                    value={selectedNode.config.message}
                    readOnly
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm text-fg-primary focus:outline-none focus:border-aw-gray-1200 resize-none"
                    rows={3}
                  />
                  <p className="mt-2 text-xs text-fg-tertiary">
                    Use {"{"}{"{"} variáveis {"}"}{"}"}  e @ações para tornar a mensagem dinâmica.
                  </p>
                </div>
              )}

              {selectedNode.config?.action && (
                <div>
                  <label className="block text-xs font-medium text-fg-tertiary uppercase tracking-wider mb-2">
                    Ação
                  </label>
                  <div className="px-3 py-2 bg-bg-muted rounded-lg text-sm font-mono text-fg-primary">
                    {selectedNode.config.action}
                  </div>
                </div>
              )}

              {selectedNode.config?.condition && (
                <AwField
                  label="Condição"
                  helper="Condição avaliada para decidir o próximo passo."
                  htmlFor="node-condition"
                >
                  <AwInput
                    id="node-condition"
                    type="text"
                    value={selectedNode.config.condition}
                    readOnly
                    className="font-mono"
                  />
                </AwField>
              )}

              {selectedNode.config?.fields && (
                <div>
                  <label className="block text-xs font-medium text-fg-tertiary uppercase tracking-wider mb-2">
                    Campos a coletar
                  </label>
                  <div className="space-y-2">
                    {selectedNode.config.fields.map((field: string, idx: number) => (
                      <div key={idx} className="px-3 py-2 bg-bg-muted rounded-lg text-sm text-fg-primary">
                        {field}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add button */}
              <div className="pt-4 border-t border-border">
                <AwButton variant="primary" size="md" block>
                  Editar Módulo
                </AwButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AgentStudioNewPage() {
  const router = useRouter();
  // A URL é a fonte de verdade do passo (?step=N). O wizard inteiro vive em
  // /agent-studio/new, mas cada etapa vira um endereço próprio — deep-link
  // funciona, o browser back anda entre passos, e o Review Mode (escopado por
  // URL) separa os comentários por etapa. Sem ?step válido, começa no 1.
  const searchParams = useSearchParams();
  const stepParam = Number(searchParams.get("step"));
  const currentStep = stepParam >= 1 && stepParam <= 6 ? stepParam : 1;

  // Navega entre passos escrevendo na URL. User-driven = push (browser back
  // volta um passo); auto-advance do loader (passo 4) = replace, pra não virar
  // entrada de histórico (senão o back cairia no loader e re-avançaria).
  const goToStep = useCallback(
    (n: number, opts?: { replace?: boolean }) => {
      const url = `/agent-studio/new?step=${n}`;
      if (opts?.replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [router]
  );

  // Step 1 state
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // Step 2 state
  const [agentName, setAgentName] = useState("");
  const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [showAllBases, setShowAllBases] = useState(false);
  const [basesModalOpen, setBasesModalOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Step 3 state (Habilidades e AOPs) — permissões que o agente recebe
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedAops, setSelectedAops] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<
    { kind: "skill"; item: Habilidade } | { kind: "aop"; item: Aop } | null
  >(null);

  // Step 4 state (Seleção de Canal) — sub-fluxo canal → número → 1ª mensagem
  const [channelStep, setChannelStep] = useState<"canal" | "numero" | "mensagem">("canal");
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>(MOCK_INTEGRATIONS);
  const [addIntegrationOpen, setAddIntegrationOpen] = useState(false);

  // Step 5 (Loading) state
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Step 6 (Editor) state
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

  // Sidebar (Figma wireframe: Variáveis + Tools)
  const [variáveisVerMaisExpanded, setVariáveisVerMaisExpanded] = useState(false);
  const [variáveisSectionExpanded, setVariáveisSectionExpanded] = useState(true);
  const [toolsSectionExpanded, setToolsSectionExpanded] = useState(true);
  const [sidebarVariableValues, setSidebarVariableValues] = useState<Record<string, string>>({
    agent_name: "Andrea Faccio",
    user_email: "joao@gmail.com",
    company_city: "Belo Horizonte",
    company_name: "Artificial Concord",
    user_name: "João",
  });
  const [editingSidebarVariableId, setEditingSidebarVariableId] = useState<string | null>(null);
  const [selectedSidebarToolId, setSelectedSidebarToolId] = useState<string | null>(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [agentStudioTab, setAgentStudioTab] = useState<AgentStudioTabId>("agente");

  // Publish modals state
  const [showPublishOptionsModal, setShowPublishOptionsModal] = useState(false);
  const [showPublishConfirmModal, setShowPublishConfirmModal] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) setHeaderMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // @ Resources suggestions
  const atSuggestions = AT_SUGGESTIONS_LIST;
  const varSuggestions = VAR_SUGGESTIONS_LIST;

  // Load knowledge bases on mount
  useEffect(() => {
    setKnowledgeBases(loadBasesFromStorage());
  }, []);

  // Loading message rotation
  useEffect(() => {
    if (currentStep === 5) {
      const interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 1500);

      // Auto-advance to the editor after 4 seconds
      const timeout = setTimeout(() => {
        generatePrompt();
        goToStep(6, { replace: true });
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

  const breadcrumbs = currentStep === 6 ? [
    { label: "Agent Studio", href: "/agent-studio" },
    agentName || "Agente",
    "Configuração geral",
  ] : [
    { label: "Agent Studio", href: "/agent-studio" },
    "Novo agente",
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
  const integrationCategories = [
    { id: "channels", label: "Canais de mensageria" },
    { id: "crms", label: "CRMs" },
    { id: "meetings", label: "Reuniões" },
  ];
  const integrationItems = unconfiguredIntegrations.map(i => ({
    id: i.id,
    brand: i.id,
    name: i.name,
    description: i.description,
    category: "channels",
  }));

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
    } else if (currentStep === 6) {
      goToStep(4);
    } else {
      goToStep(currentStep - 1);
    }
  };

  const handleAdvance = () => {
    if (currentStep === 1 && canAdvanceStep1) {
      goToStep(2);
    } else if (currentStep === 2 && canAdvanceStep2) {
      goToStep(3);
    } else if (currentStep === 3) {
      // Habilidades e AOPs são opcionais → sempre pode avançar
      goToStep(4);
    } else if (currentStep === 4) {
      // Canais → tela de loading
      goToStep(5);
    }
  };

  // Sub-navegação dentro da Seleção de Canal (step 4)
  const canAdvanceChannel =
    channelStep === "canal"
      ? !!selectedChannel
      : channelStep === "numero"
        ? !!selectedNumber
        : !!selectedTemplate;

  const channelBack = () => {
    if (channelStep === "mensagem") setChannelStep("numero");
    else if (channelStep === "numero") setChannelStep("canal");
    else handleBack();
  };

  const channelAdvance = () => {
    if (channelStep === "canal") {
      // Só WhatsApp tem o sub-fluxo número → template no protótipo.
      if (selectedChannel === "whatsapp") setChannelStep("numero");
      else handleAdvance();
    } else if (channelStep === "numero") {
      setChannelStep("mensagem");
    } else {
      handleAdvance();
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
    router.push("/memory-base");
  };

  // Publish handlers
  const handlePublishClick = () => {
    setShowPublishOptionsModal(true);
  };

  const handleTestAgent = () => {
    setShowPublishOptionsModal(false);
    // TODO: Navigate to test/chat screen (will be implemented later)
    console.log("Test agent clicked");
  };

  const handlePublishAgent = () => {
    setShowPublishOptionsModal(false);
    setShowPublishConfirmModal(true);
  };

  const handleConfirmPublish = () => {
    setShowPublishConfirmModal(false);
    // TODO: Save agent data
    router.push("/agent-studio");
  };

  const isOtherSelected = selectedGoal === "outro";

  // Step 5: Loading Screen
  if (currentStep === 5) {
    return (
      <AwDashboardLayout breadcrumbs={breadcrumbs} mainClassName="!p-0 !overflow-hidden">
        <div className="flex min-h-full w-full items-center justify-center bg-white relative overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-fuchsia-50 to-purple-50 opacity-50" />
          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "1s" }} />
          
          <div className="relative z-10 flex flex-col items-center gap-8">
            <SparkleIcon />
            <div className="text-center">
              <h1 className="font-heading text-2xl md:text-3xl font-medium text-fg-primary tracking-[-0.5px] mb-3">
                Gerando seu Agente
              </h1>
              <p className="text-base text-fg-tertiary font-sans animate-pulse">
                {LOADING_MESSAGES[loadingMessageIndex]}
              </p>
            </div>
          </div>
        </div>
      </AwDashboardLayout>
    );
  }

  // Step 6: Editor Screen
  if (currentStep === 6) {
    const selectedBase = knowledgeBases.find(b => b.id === selectedBaseId);
    const enabledIntegrations = integrations.filter(i => i.enabled);
    const goalTitle = GOAL_OPTIONS.find(g => g.id === selectedGoal)?.title || customGoal;

    return (
      <AwDashboardLayout breadcrumbs={breadcrumbs} mainClassName="!p-0">
        <div className="min-h-full w-full flex">
          {/* Left sidebar - light card style (Insert a Simple Poll style) */}
          <aside className="w-[260px] flex-shrink-0 bg-bg-surface rounded-l-2xl flex flex-col min-h-0">
            {/* Header: title + description */}
            <div className="p-4 pb-3 border-b border-border-subtle">
              <div className="flex items-start gap-2">
                <h2 className="text-sm font-semibold text-fg-secondary leading-tight">
                  {AGENT_STUDIO_SIDEBAR_ITEMS.find((i) => i.id === agentStudioTab)?.label ?? "Agente"}
                </h2>
                <button type="button" className="shrink-0 p-0.5 rounded text-fg-tertiary hover:text-fg-secondary hover:bg-bg-muted transition-colors" aria-label="Informação">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                </button>
              </div>
              <p className="mt-1.5 text-xs text-aw-gray-700 leading-snug">
                {AGENT_STUDIO_SIDEBAR_ITEMS.find((i) => i.id === agentStudioTab)?.description ?? "Configure personalidade, checkpoint e primeira mensagem do agente."}
              </p>
            </div>
            {/* Navigation list */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Navegação do agente">
              {AGENT_STUDIO_SIDEBAR_ITEMS.map((item) => {
                const isActive = agentStudioTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAgentStudioTab(item.id)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-colors ${
                      isActive
                        ? "bg-bg-surface text-fg-secondary font-medium"
                        : "text-fg-secondary hover:bg-bg-muted hover:text-fg-secondary"
                    }`}
                  >
                    <span className={`shrink-0 w-5 h-5 flex items-center justify-center ${isActive ? "text-fg-secondary" : "text-aw-gray-700"}`}>
                      {item.id === "agente" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}
                      {item.id === "visualizacao-modular" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}
                      {item.id === "bases-conhecimento" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8"/><path d="M8 11h8"/></svg>}
                      {item.id === "aop" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>}
                      {item.id === "analise" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
                      {item.id === "playground" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                      {item.id === "historico" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
                      {item.id === "configuracoes" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>}
                    </span>
                    <span className="min-w-0 truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            {/* Footer: step indicator */}
            <div className="p-3 pt-2 border-t border-border-subtle">
              <p className="text-xs text-fg-tertiary">
                Etapa {AGENT_STUDIO_SIDEBAR_ITEMS.findIndex((i) => i.id === agentStudioTab) + 1} de {AGENT_STUDIO_SIDEBAR_ITEMS.length}
              </p>
              <div className="mt-1.5 h-1 bg-aw-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-aw-gray-400 rounded-full transition-all duration-300"
                  style={{ width: `${((AGENT_STUDIO_SIDEBAR_ITEMS.findIndex((i) => i.id === agentStudioTab) + 1) / AGENT_STUDIO_SIDEBAR_ITEMS.length) * 100}%` }}
                />
              </div>
            </div>
          </aside>
          <div className="flex-1 min-h-full bg-white overflow-y-auto flex flex-col">
            {agentStudioTab === "agente" ? (
              <div className="flex flex-col min-h-full">
          {/* Page Header */}
          <div className="border-b border-border px-4 py-[38px]">
            <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-aw-gray-1200/20 blur-xl scale-150 border" aria-hidden />
                  <img
                    src={agentName ? getOrbForAgent(agentName) : AGENT_ORBS[0]}
                    alt=""
                    className="relative w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-heading text-[32px] font-medium text-fg-primary tracking-[-0.5px]">
                      {agentName || "Agente"}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--aw-amber-300)] bg-[var(--aw-amber-150)] px-2.5 py-0.5 text-xs font-medium text-[var(--aw-amber-900)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--aw-amber-600)]" />
                      Rascunho · não publicado
                    </span>
                  </div>
                  <p className="text-sm text-fg-tertiary">
                    Configuração geral do agente
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AwButton variant="secondary" size="md">
                  Pré-visualizar
                </AwButton>
                <AwButton variant="primary" size="md" onClick={handlePublishClick}>
                  Publicar
                </AwButton>
                <div className="relative" ref={headerMenuRef}>
                  <AwButton
                    variant="ghost"
                    size="md"
                    iconOnly="more_vert"
                    aria-label="Mais opções"
                    onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                  />
                  {headerMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 py-1 min-w-[180px] bg-white rounded-lg border border-border shadow-lg z-50">
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm text-fg-primary hover:bg-bg-muted transition-colors"
                        onClick={() => { setHeaderMenuOpen(false); /* Arquivar */ }}
                      >
                        Arquivar agente
                      </button>
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm text-fg-primary hover:bg-bg-muted transition-colors"
                        onClick={() => { setHeaderMenuOpen(false); /* Duplicar */ }}
                      >
                        Duplicar agente
                      </button>
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm text-aw-red-600 hover:bg-[var(--aw-red-100)] transition-colors"
                        onClick={() => { setHeaderMenuOpen(false); /* Excluir */ }}
                      >
                        Excluir agente
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Autocomplete Suggestion Box - positioned under caret */}
          {(showAtSuggestions || showVarSuggestions) && (
            <div 
              className="fixed z-50 bg-white rounded-lg border border-border shadow-lg py-2 min-w-[280px] max-h-[300px] overflow-y-auto"
              style={{ 
                top: cursorPosition.top + 4, 
                left: Math.min(cursorPosition.left, typeof window !== "undefined" ? window.innerWidth - 300 : 980) 
              }}
            >
              <div className="px-3 py-1.5 text-xs font-medium text-fg-tertiary uppercase tracking-wider border-b border-border mb-1">
                {showAtSuggestions ? "Recursos e Ações" : "Variáveis"}
              </div>
              {(showAtSuggestions ? filteredAtSuggestions : filteredVarSuggestions).map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => insertSuggestion(suggestion.label)}
                  className="w-full px-3 py-2 text-left hover:bg-bg-muted transition-colors flex items-center gap-3"
                >
                  <span className="font-mono text-sm text-fg-primary bg-bg-muted px-1.5 py-0.5 rounded">
                    {suggestion.label}
                  </span>
                  <span className="text-xs text-fg-tertiary">{suggestion.description}</span>
                </button>
              ))}
              {(showAtSuggestions ? filteredAtSuggestions : filteredVarSuggestions).length === 0 && (
                <div className="px-3 py-2 text-sm text-fg-tertiary">Nenhum resultado encontrado</div>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="px-4 py-8">
            <div className="max-w-[1280px] mx-auto flex gap-5">
              {/* Left Panel - Editors */}
              <div className="flex-1 min-w-0 max-w-[900px] space-y-6 pr-2">
                {/* 1️⃣ Prompt do Agente - Personalidade fixa */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <a href="#" className="flex items-center gap-1.5 text-sm font-medium text-fg-primary underline decoration-dotted underline-offset-4 hover:no-underline">
                        Prompt do Agente
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                      <span className="text-xs text-fg-tertiary bg-bg-muted px-2 py-0.5 rounded">Personalidade</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AwButton
                        variant={isPromptEditing ? "primary" : "secondary"}
                        size="sm"
                        iconLeft="edit"
                        onClick={() => setIsPromptEditing(!isPromptEditing)}
                      >
                        {isPromptEditing ? "Salvar" : "Editar"}
                      </AwButton>
                      <AwButton variant="secondary" size="sm" iconLeft="auto_awesome">
                        Otimizar com IA
                      </AwButton>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-white overflow-hidden">
                  {/* Editor area */}
                  <div className="relative">
                    <AwButton
                      variant="ghost"
                      size="sm"
                      iconOnly={promptEditorExpanded ? "close_fullscreen" : "open_in_full"}
                      title={promptEditorExpanded ? "Reduzir" : "Expandir"}
                      aria-label={promptEditorExpanded ? "Reduzir" : "Expandir"}
                      className="absolute top-2 right-2 z-10"
                      onClick={() => setPromptEditorExpanded(!promptEditorExpanded)}
                    />
                    <VariableChipEditor
                      value={agentPrompt}
                      onChange={(v) => handleEditorChange(v, setAgentPrompt, "prompt")}
                      readOnly={!isPromptEditing}
                      placeholder="Defina a personalidade do agente: quem ele é, como fala, tom de voz..."
                      className={`w-full p-5 pr-10 text-sm leading-relaxed font-sans border-0 outline-none transition-colors ${
                        promptEditorExpanded ? "min-h-[300px]" : "min-h-[160px]"
                      } ${
                        isPromptEditing
                          ? "bg-white text-fg-primary cursor-text"
                          : "bg-bg-muted text-aw-gray-700 cursor-default"
                      }`}
                      minHeight={promptEditorExpanded ? "300px" : "160px"}
                      onTriggerAt={() => handleTriggerAt("prompt")}
                      onVariableClick={handleVariableClick}
                    />
                  </div>

                  {/* Bottom bar */}
                  <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-t border-border bg-white">
                    <span className="text-xs text-fg-tertiary">
                      Digite <span className="font-mono text-fg-primary bg-bg-muted px-1 py-0.5 rounded text-[10px]">@</span> ou <span className="font-mono text-fg-primary bg-bg-muted px-1 py-0.5 rounded text-[10px]">{"{{"}</span> para variáveis
                    </span>
                  </div>
                  </div>
                </div>

                {/* 2️⃣ Checkpoint do Agente - Guia de execução */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <a href="#" className="flex items-center gap-1.5 text-sm font-medium text-fg-primary underline decoration-dotted underline-offset-4 hover:no-underline">
                        Checkpoint do Agente
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                      <span className="text-xs text-fg-tertiary bg-bg-muted px-2 py-0.5 rounded">Fluxo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AwButton
                        variant={isCheckpointEditing ? "primary" : "secondary"}
                        size="sm"
                        iconLeft="edit"
                        onClick={() => setIsCheckpointEditing(!isCheckpointEditing)}
                      >
                        {isCheckpointEditing ? "Salvar" : "Editar"}
                      </AwButton>
                      <AwButton variant="secondary" size="sm" iconLeft="auto_awesome">
                        Otimizar com IA
                      </AwButton>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-white overflow-hidden">
                  {/* Editor area */}
                  <div className="relative">
                    <AwButton
                      variant="ghost"
                      size="sm"
                      iconOnly={checkpointEditorExpanded ? "close_fullscreen" : "open_in_full"}
                      title={checkpointEditorExpanded ? "Reduzir" : "Expandir"}
                      aria-label={checkpointEditorExpanded ? "Reduzir" : "Expandir"}
                      className="absolute top-2 right-2 z-10"
                      onClick={() => setCheckpointEditorExpanded(!checkpointEditorExpanded)}
                    />
                    <VariableChipEditor
                      value={checkpointContent}
                      onChange={(v) => handleEditorChange(v, setCheckpointContent, "checkpoint")}
                      readOnly={!isCheckpointEditing}
                      placeholder="Defina as etapas de execução: # Etapa 1, objetivos, critérios de avanço, @ações..."
                      className={`w-full p-5 pr-10 text-sm leading-relaxed font-sans border-0 outline-none transition-colors ${
                        checkpointEditorExpanded ? "min-h-[500px]" : "min-h-[280px]"
                      } ${
                        isCheckpointEditing
                          ? "bg-white text-fg-primary cursor-text"
                          : "bg-bg-muted text-aw-gray-700 cursor-default"
                      }`}
                      minHeight={checkpointEditorExpanded ? "500px" : "280px"}
                      onTriggerAt={() => handleTriggerAt("checkpoint")}
                      onVariableClick={handleVariableClick}
                    />
                  </div>

                  {/* Bottom bar */}
                  <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-t border-border bg-white">
                    <span className="text-xs text-fg-tertiary">
                      Digite <span className="font-mono text-fg-primary bg-bg-muted px-1 py-0.5 rounded text-[10px]">@</span> ou <span className="font-mono text-fg-primary bg-bg-muted px-1 py-0.5 rounded text-[10px]">{"{{"}</span> para variáveis
                    </span>
                  </div>
                  </div>
                </div>

           
              </div>

              {/* Right Sidebar (Figma wireframe: Variáveis + Tools) */}
              <div className="w-[360px] flex-shrink-0 space-y-6">
                {/* Variáveis */}
                <div>
                  <button
                    type="button"
                    onClick={() => setVariáveisSectionExpanded(!variáveisSectionExpanded)}
                    className="w-full flex items-center justify-between text-left hover:opacity-80 transition-opacity"
                  >
                    <h3 className="text-sm font-semibold text-fg-primary">Variáveis</h3>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`text-aw-gray-700 transition-transform ${variáveisSectionExpanded ? "rotate-180" : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {variáveisSectionExpanded && (
                    <div className="pt-2">
                      <p className="text-xs text-fg-tertiary mb-3">
                        Selecione variáveis disponíveis das integrações selecionadas.
                      </p>
                      <ul className="space-y-2">
                        {(variáveisVerMaisExpanded ? SIDEBAR_VARIABLES : SIDEBAR_VARIABLES.slice(0, 3)).map((v) => (
                          <li key={v.id} className="flex items-center gap-2 text-sm">
                            <span className="shrink-0 rounded bg-bg-muted px-1.5 py-0.5 font-mono text-aw-gray-700 text-xs">
                              {v.name}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-fg-primary">
                              {editingSidebarVariableId === v.id ? (
                                <input
                                  type="text"
                                  value={sidebarVariableValues[v.id] ?? ""}
                                  onChange={(e) => setSidebarVariableValues((prev) => ({ ...prev, [v.id]: e.target.value }))}
                                  onBlur={() => setEditingSidebarVariableId(null)}
                                  onKeyDown={(e) => { if (e.key === "Enter") setEditingSidebarVariableId(null); }}
                                  className="w-full rounded border border-border px-2 py-0.5 text-sm outline-none focus:border-aw-gray-1200"
                                  autoFocus
                                />
                              ) : (
                                sidebarVariableValues[v.id] ?? "—"
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingSidebarVariableId(editingSidebarVariableId === v.id ? null : v.id)}
                              className="shrink-0 p-1 rounded text-fg-tertiary hover:text-fg-primary hover:bg-bg-muted transition-colors"
                              aria-label="Editar valor"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => setVariáveisVerMaisExpanded(!variáveisVerMaisExpanded)}
                        className="mt-2 flex items-center gap-1.5 text-xs text-aw-gray-700 hover:text-fg-primary transition-colors"
                      >
                        {variáveisVerMaisExpanded ? "Ver menos" : "Ver mais"}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          className={variáveisVerMaisExpanded ? "rotate-180" : ""}
                        >
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Tools */}
                <div>
                  <button
                    type="button"
                    onClick={() => setToolsSectionExpanded(!toolsSectionExpanded)}
                    className="w-full flex items-center justify-between text-left hover:opacity-80 transition-opacity"
                  >
                    <h3 className="text-sm font-semibold text-fg-primary">Habilidades</h3>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`text-aw-gray-700 transition-transform ${toolsSectionExpanded ? "rotate-180" : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {toolsSectionExpanded && (
                    <div className="pt-2">
                      <p className="text-xs text-fg-tertiary mb-3">
                        Selecione variáveis disponíveis das integrações selecionadas.
                      </p>
                      <ul className="space-y-3">
                        {SIDEBAR_TOOLS.map((tool) => (
                          <li key={tool.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedSidebarToolId(tool.id)}
                              className="w-full text-left p-3 rounded-[14px] border border-border hover:border-aw-gray-400 hover:bg-bg-surface transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <span className="shrink-0 w-9 h-9 rounded-lg bg-bg-muted flex items-center justify-center">
                                  {tool.icon === "system" && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-aw-gray-700">
                                      <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                                      <rect x="14" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                                      <rect x="4" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                                      <rect x="14" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                                    </svg>
                                  )}
                                  {tool.icon === "pipedrive" && (
                                    <span className="text-sm font-bold text-[#00a86b]">P</span>
                                  )}
                                  {tool.icon === "calendar" && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#4285F4]">
                                      <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                      <path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                  )}
                                  {tool.icon === "sheets" && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#0F9D58]">
                                      <path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="1.5"/>
                                      <path d="M4 8h16M4 12h16M4 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                  )}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-fg-primary">{tool.title}</p>
                                  <p className="text-xs text-fg-tertiary mt-0.5 line-clamp-2">{tool.description}</p>
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {tool.activeCount > 0 && (
                                      <span className="inline-flex items-center gap-1 text-xs bg-[var(--aw-emerald-150)] text-[var(--aw-emerald-900)] px-1.5 py-0.5 rounded">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--aw-emerald-600)]" />
                                        {tool.activeCount} Ativas
                                      </span>
                                    )}
                                    <span className="text-xs text-aw-gray-700 bg-bg-muted px-1.5 py-0.5 rounded">
                                      {tool.availableCount} Disponíveis
                                    </span>
                                  </div>
                                </div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-fg-tertiary mt-1">
                                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
            ) : null}
            {agentStudioTab === "visualizacao-modular" && <ModularFlowVisualization />}
            {agentStudioTab === "bases-conhecimento" && <KnowledgeBaseManagement />}
            {agentStudioTab !== "agente" && agentStudioTab !== "visualizacao-modular" && agentStudioTab !== "bases-conhecimento" && (
              <div className="flex-1 px-4 py-8 flex items-center justify-center min-h-[200px]">
                <div className="text-center max-w-md">
                  <p className="text-sm text-fg-tertiary mb-2">
                    {agentStudioTab === "aop" && "Protocolos específicos (AOP) do agente em breve."}
                    {agentStudioTab === "analise" && "Análises e informações relevantes do agente em breve."}
                    {agentStudioTab === "playground" && "Playground para conversar e testar o agente em breve."}
                    {agentStudioTab === "historico" && "Histórico de alterações em breve."}
                    {agentStudioTab === "configuracoes" && "Configurações do agente em breve."}
                  </p>
                  <p className="text-xs text-fg-muted">Esta seção será implementada em breve.</p>
                </div>
              </div>
            )}
          </div>

          {/* Variable config modal (full screen, card) */}
        {variableModalOpen && selectedVariable && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-heading text-lg font-medium text-fg-primary">
                  Configurar variável
                </h3>
                <AwButton
                  variant="ghost"
                  size="md"
                  iconOnly="close"
                  aria-label="Fechar"
                  onClick={() => { setVariableModalOpen(false); setSelectedVariable(null); }}
                />
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-fg-tertiary uppercase tracking-wider mb-1">Variável</p>
                    <p className="font-mono text-sm text-fg-primary bg-bg-muted px-3 py-2 rounded-lg">
                      {selectedVariable.variable}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-fg-tertiary uppercase tracking-wider mb-1">Tipo</p>
                    <p className="text-sm text-fg-primary">
                      {selectedVariable.type === "at" ? "Lógica / Ação" : "Interpolação (mensagem)"}
                    </p>
                  </div>
                  {VARIABLE_META[selectedVariable.variable] && (
                    <div>
                      <p className="text-xs font-medium text-fg-tertiary uppercase tracking-wider mb-1">Descrição</p>
                      <p className="text-sm text-fg-primary">
                        {VARIABLE_META[selectedVariable.variable].description}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-fg-tertiary uppercase tracking-wider mb-1">ID</p>
                    <p className="font-mono text-xs text-fg-primary bg-bg-muted px-3 py-2 rounded-lg">
                      {VARIABLE_META[selectedVariable.variable]?.id ?? selectedVariable.variable}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-fg-tertiary mb-2">
                      Opções de configuração e ajustes desta variável serão definidas aqui.
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
                <AwButton
                  variant="secondary"
                  size="md"
                  onClick={() => { setVariableModalOpen(false); setSelectedVariable(null); }}
                >
                  Fechar
                </AwButton>
                <AwButton variant="primary" size="md">
                  Salvar
                </AwButton>
              </div>
            </div>
          </div>
        )}

        {/* Publish Options Modal */}
        {showPublishOptionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowPublishOptionsModal(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h2 className="font-heading text-xl font-medium text-fg-primary mb-2">
                Próximos passos
              </h2>
              <p className="text-sm text-fg-tertiary mb-6">
                Escolha como deseja prosseguir com seu agente
              </p>
              <div className="flex flex-col gap-3">
                <AwButton variant="primary" size="lg" block onClick={handlePublishAgent}>
                  Publicar agente
                </AwButton>
                <AwButton variant="secondary" size="lg" block onClick={handleTestAgent}>
                  Testar agente
                </AwButton>
                <AwButton variant="ghost" size="lg" block onClick={() => setShowPublishOptionsModal(false)}>
                  Cancelar
                </AwButton>
              </div>
            </div>
          </div>
        )}

        {/* Publish Confirmation Modal */}
        {showPublishConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowPublishConfirmModal(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="font-heading text-xl font-medium text-fg-primary mb-2">
                Publicar agente?
              </h2>
              <p className="text-sm text-fg-tertiary mb-6">
                Seu agente <span className="font-medium text-fg-primary">{agentName || "Agente"}</span> será publicado e ficará disponível para uso. Você poderá editá-lo a qualquer momento.
              </p>
              <div className="flex items-center justify-end gap-3">
                <AwButton
                  variant="secondary"
                  size="md"
                  onClick={() => setShowPublishConfirmModal(false)}
                >
                  Cancelar
                </AwButton>
                <AwButton
                  variant="primary"
                  size="md"
                  onClick={handleConfirmPublish}
                >
                  Confirmar publicação
                </AwButton>
              </div>
            </div>
          </div>
        )}
        </div>
        <AwAddIntegrationModal
          open={addIntegrationOpen}
          onClose={() => setAddIntegrationOpen(false)}
          categories={integrationCategories}
          items={integrationItems}
          onSelect={(id) => {
            setAddIntegrationOpen(false);
            handleToggleIntegration(id);
            setIntegrations((prev) =>
              prev.map((i) => (i.id === id ? { ...i, configured: true, enabled: true } : i)),
            );
          }}
        />
      </AwDashboardLayout>
    );
  }

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs} mainClassName="!p-0 !overflow-hidden">
      <div className="flex min-h-full w-full items-center justify-center bg-white p-6">
        <div className="w-full max-w-[900px] bg-white rounded-[18px] px-8 py-10 md:px-14 md:py-11 flex flex-col gap-8">
          
          {/* Step 1: Goal Selection */}
          {currentStep === 1 && (
            <>
              <div className="text-left">
                <h1 className="font-heading text-2xl md:text-3xl font-medium text-fg-primary tracking-[-0.5px] mb-2">
                  Caso de uso
                </h1>
                <p className="text-base text-fg-tertiary font-sans">
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
                          ? "bg-aw-gray-1200 border-aw-gray-1200"
                          : "bg-white border-border hover:border-aw-gray-400 hover:bg-bg-surface"
                      }`}
                    >
                      <IconComponent color={isSelected ? "var(--aw-white)" : "var(--aw-gray-600)"} />
                      <h3 className={`font-heading font-medium text-sm leading-5 ${
                        isSelected ? "text-white" : "text-fg-primary"
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
                      ? "bg-white border-aw-gray-1200"
                      : "bg-white border-dashed border-aw-gray-400 hover:border-aw-gray-600"
                  }`}
                >
                  <OtherIcon color={isOtherSelected ? "var(--aw-gray-1200)" : "var(--aw-gray-600)"} />
                  <h3 className="font-heading font-medium text-sm leading-5 text-fg-primary">
                    Outro
                  </h3>
                </button>
              </div>

              {showCustomInput && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <AwInput
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="ex.: Qualificação de leads, Onboarding de clientes..."
                    autoFocus
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <AwButton
                  variant="secondary"
                  size="md"
                  iconLeft="chevron_left"
                  onClick={handleBack}
                >
                  Voltar
                </AwButton>
                <AwButton
                  variant="primary"
                  size="md"
                  onClick={handleAdvance}
                  disabled={!canAdvanceStep1}
                >
                  Avançar
                </AwButton>
              </div>
            </>
          )}

          {/* Step 2: Agent Name & Knowledge Base Selection */}
          {currentStep === 2 && (
            <>
              <div className="text-left">
                <h1 className="font-heading text-2xl md:text-3xl font-medium text-fg-primary tracking-[-0.5px] mb-2">
                  Configure seu agente
                </h1>
                <p className="text-base text-fg-tertiary font-sans">
                  Defina o nome e a base de conhecimento do seu agente
                </p>
              </div>

              {/* Label manual em text-sm pra casar com o tamanho do título
                  "Base de conhecimento" abaixo (review cmt-55957). */}
              <div className="space-y-1.5">
                <label
                  htmlFor="agent-name"
                  className="block text-sm font-medium text-fg-primary"
                >
                  Nome do agente
                </label>
                <AwInput
                  id="agent-name"
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Ex: Assistente de Vendas"
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-fg-primary">
                    Base de conhecimento
                  </label>
                  <button
                    onClick={handleCreateNewBase}
                    className="text-sm font-medium text-fg-primary hover:underline flex items-center gap-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Criar nova base
                  </button>
                </div>
                <p className="text-sm text-fg-tertiary">
                  Selecione qual base de conhecimento o agente vai utilizar
                </p>
                
                {knowledgeBases.length === 0 ? (
                  <div className="p-6 border border-dashed border-border rounded-xl text-center">
                    <p className="text-sm text-fg-tertiary mb-3">
                      Nenhuma base de conhecimento encontrada
                    </p>
                    <button
                      onClick={handleCreateNewBase}
                      className="text-sm font-medium text-fg-primary underline hover:no-underline"
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
                                ? "bg-aw-gray-1200 border-aw-gray-1200"
                                : selectedBaseId
                                  ? "bg-white border-border opacity-50 hover:opacity-100 hover:border-aw-gray-400"
                                  : "bg-white border-border hover:border-aw-gray-400"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "bg-white/10" : "bg-bg-muted"
                            }`}>
                              {/* Ícone "library" (prédio de colunas) p/ base de conhecimento — review cmt-091c */}
                              <Icon
                                name="account_balance"
                                fill={1}
                                size={20}
                                style={{ color: isSelected ? "var(--aw-white)" : "var(--aw-gray-600)" }}
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              {/* Hover no título → tooltip: avatar group + nº de agentes + resumo.
                                  O resumo real é gerado por IA no backend — aqui fica o placeholder. (review cmt-d477) */}
                              <div className="group/base relative inline-block max-w-full">
                                <h4 className={`font-heading font-medium text-sm truncate ${
                                  isSelected ? "text-white" : "text-fg-primary"
                                }`}>
                                  {base.name}
                                </h4>
                                <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-64 rounded-xl border border-border bg-bg-raised p-3 text-left shadow-lg group-hover/base:block">
                                  <div className="flex items-center gap-2">
                                    <div className="flex -space-x-1.5">
                                      {["sales", "customer-support"].map((id) => (
                                        <img
                                          key={id}
                                          src={getOrbForAgent(id)}
                                          alt=""
                                          className="h-5 w-5 rounded-full ring-2 ring-bg-raised"
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs font-medium text-fg-secondary">
                                      Utilizado por 2 agentes
                                    </span>
                                  </div>
                                  <p className="mt-2 text-xs leading-relaxed text-fg-tertiary">
                                    Resumo gerado por IA a partir das fontes desta base aparece aqui.
                                  </p>
                                </div>
                              </div>
                              {/* Ícones Material Symbols nos counts — stacks (layers) + file_copy (fontes). (review cmt-3017 / cmt-cd14) */}
                              <div className={`flex items-center gap-3 mt-1 text-xs ${
                                isSelected ? "text-white/70" : "text-fg-tertiary"
                              }`}>
                                <span className="inline-flex items-center gap-1">
                                  <Icon name="stacks" fill={1} size={13} />
                                  {layers} Knowledge Layer{layers !== 1 ? "s" : ""}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Icon name="file_copy" fill={1} size={13} />
                                  {sources} Fonte{sources !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>

                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "bg-white" : "border-2 border-aw-gray-400"
                            }`}>
                              {isSelected && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6L5 9L10 3" stroke="var(--aw-gray-1200)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {hasMoreBases && (
                      <button
                        onClick={() => setBasesModalOpen(true)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-fg-primary hover:underline mt-2"
                      >
                        <Icon name="grid_view" size={15} />
                        Ver todas as bases ({knowledgeBases.length})
                      </button>
                    )}
                  </>
                )}
              </div>

              <AwModal
                open={basesModalOpen}
                onClose={() => setBasesModalOpen(false)}
                title="Bases de conhecimento"
              >
                <p className="text-sm text-fg-tertiary mb-4">
                  Todas as suas bases. Selecione qual o agente vai utilizar.
                </p>
                <div className="flex flex-col gap-2 max-h-[60vh] overflow-auto pr-1">
                  {knowledgeBases.map((base) => {
                    const isSelected = selectedBaseId === base.id;
                    const layers = base.knowledgeLayersCount ?? 0;
                    const sources = base.documentCount ?? 0;
                    return (
                      <button
                        key={base.id}
                        onClick={() => {
                          setSelectedBaseId(base.id);
                          setBasesModalOpen(false);
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                          isSelected
                            ? "border-aw-gray-1200 bg-bg-muted"
                            : "border-border hover:border-aw-gray-400"
                        }`}
                      >
                        <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-bg-muted">
                          <Icon name="account_balance" fill={1} size={18} style={{ color: "var(--aw-gray-600)" }} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-heading font-medium text-sm text-fg-primary truncate">
                            {base.name}
                          </span>
                          <span className="flex items-center gap-3 mt-0.5 text-xs text-fg-tertiary">
                            <span className="inline-flex items-center gap-1">
                              <Icon name="stacks" fill={1} size={12} />
                              {layers} Knowledge Layer{layers !== 1 ? "s" : ""}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Icon name="file_copy" fill={1} size={12} />
                              {sources} Fonte{sources !== 1 ? "s" : ""}
                            </span>
                          </span>
                        </span>
                        {isSelected && (
                          <Icon name="check_circle" fill={1} size={18} style={{ color: "var(--aw-gray-1200)" }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </AwModal>

              <div className="flex items-center justify-between pt-4">
                <AwButton
                  variant="secondary"
                  size="md"
                  iconLeft="chevron_left"
                  onClick={handleBack}
                >
                  Voltar
                </AwButton>
                <AwButton
                  variant="primary"
                  size="md"
                  onClick={handleAdvance}
                  disabled={!canAdvanceStep2}
                >
                  Avançar
                </AwButton>
              </div>
            </>
          )}

          {/* Step 3: Habilidades e AOPs */}
          {currentStep === 3 && (
            <>
              <div className="text-left">
                <h1 className="font-heading text-2xl md:text-3xl font-medium text-fg-primary tracking-[-0.5px] mb-2">
                  Habilidades e AOPs
                </h1>
                <p className="text-base text-fg-tertiary font-sans">
                  Dê ao agente acesso ao que ele precisa. Tudo aqui já existe na
                  sua conta — aqui você só concede a permissão.
                </p>
              </div>

              {/* Habilidades */}
              <section className="flex flex-col gap-3">
                <div>
                  <h2 className="font-heading text-lg font-medium text-fg-primary">
                    Habilidades
                  </h2>
                  <p className="text-sm text-fg-tertiary">
                    Integrações de terceiro que o agente usa como ferramenta.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {HABILIDADES.map((h) => (
                    <AwCapabilityTile
                      key={h.id}
                      icon={
                        <span
                          className="flex h-full w-full items-center justify-center rounded-lg text-[13px] font-semibold text-white"
                          style={{ backgroundColor: h.color }}
                        >
                          {h.letter}
                        </span>
                      }
                      name={h.name}
                      description={h.domain}
                      selected={selectedSkills.has(h.id)}
                      onToggle={() =>
                        setSelectedSkills((prev) => {
                          const next = new Set(prev);
                          if (next.has(h.id)) next.delete(h.id);
                          else next.add(h.id);
                          return next;
                        })
                      }
                      onPreview={() => setPreview({ kind: "skill", item: h })}
                    />
                  ))}
                  <VerTodasTile label="Ver todas as integrações" />
                </div>
              </section>

              {/* AOPs */}
              <section className="flex flex-col gap-3">
                <div>
                  <h2 className="font-heading text-lg font-medium text-fg-primary">
                    AOPs
                  </h2>
                  <p className="text-sm text-fg-tertiary">
                    Processos operacionais padrão que o agente pode executar.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AOPS.map((a) => (
                    <AwCapabilityTile
                      key={a.id}
                      icon={<Icon name={a.icon} size={20} fill={1} />}
                      name={a.name}
                      description={a.summary.split(".")[0]}
                      selected={selectedAops.has(a.id)}
                      onToggle={() =>
                        setSelectedAops((prev) => {
                          const next = new Set(prev);
                          if (next.has(a.id)) next.delete(a.id);
                          else next.add(a.id);
                          return next;
                        })
                      }
                      onPreview={() => setPreview({ kind: "aop", item: a })}
                    />
                  ))}
                  <VerTodasTile label="Ver todos os AOPs" />
                </div>
              </section>

              <div className="flex items-center justify-between pt-4">
                <AwButton
                  variant="secondary"
                  size="md"
                  iconLeft="chevron_left"
                  onClick={handleBack}
                >
                  Voltar
                </AwButton>
                <AwButton variant="primary" size="md" onClick={handleAdvance}>
                  Avançar
                </AwButton>
              </div>
            </>
          )}

          {/* Step 4: Seleção de Canal (canal → número → 1ª mensagem) */}
          {currentStep === 4 && (
            <>
              {/* Sub-etapa: Canal */}
              {channelStep === "canal" && (
                <>
                  <div className="text-left">
                    <h1 className="font-heading text-2xl md:text-3xl font-medium text-fg-primary tracking-[-0.5px] mb-2">
                      Canal de atendimento
                    </h1>
                    <p className="text-base text-fg-tertiary font-sans">
                      Onde esse agente vai atender? Comece pelo canal — depois você
                      escolhe o número e a primeira mensagem.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CANAIS.map((c) => {
                      const sel = selectedChannel === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedChannel(c.id)}
                          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors duration-aw-fast ${
                            sel
                              ? "border-fg-primary bg-bg-raised"
                              : "border-border bg-white hover:border-aw-gray-400 hover:bg-bg-surface"
                          }`}
                        >
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-bg-muted">
                            <IntegrationIcon type={c.icon} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate font-heading text-sm font-medium text-fg-primary">
                              {c.name}
                            </h4>
                            <p className="truncate text-xs text-fg-tertiary">
                              {c.description}
                            </p>
                          </div>
                          <span
                            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                              sel ? "border-fg-primary bg-fg-primary text-white" : "border-aw-gray-400"
                            }`}
                          >
                            {sel && <Icon name="check" size={12} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Sub-etapa: Número do WhatsApp */}
              {channelStep === "numero" && (
                <>
                  <div className="text-left">
                    <h1 className="font-heading text-2xl md:text-3xl font-medium text-fg-primary tracking-[-0.5px] mb-2">
                      Número do WhatsApp
                    </h1>
                    <p className="text-base text-fg-tertiary font-sans">
                      Qual número da sua conta esse agente vai usar pra atender?
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {WHATS_NUMBERS.map((n) => {
                      const sel = selectedNumber === n.id;
                      const initials = n.name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((p) => p[0]?.toUpperCase() ?? "")
                        .join("");
                      return (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => setSelectedNumber(n.id)}
                          className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors duration-aw-fast ${
                            sel
                              ? "border-fg-primary bg-bg-raised"
                              : "border-border bg-white hover:border-aw-gray-400 hover:bg-bg-surface"
                          }`}
                        >
                          <AwAvatar
                            src={n.avatar}
                            initials={initials}
                            alt={n.name}
                            style={{ width: 40, height: 40, fontSize: 14 }}
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-medium text-fg-primary">
                              {n.name}
                            </h4>
                            <p className="truncate text-xs text-fg-tertiary">{n.phone}</p>
                          </div>
                          <span
                            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                              sel ? "border-fg-primary bg-fg-primary text-white" : "border-aw-gray-400"
                            }`}
                          >
                            {sel && <Icon name="check" size={12} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Sub-etapa: Primeira mensagem */}
              {channelStep === "mensagem" && (
                <>
                  <div className="text-left">
                    <h1 className="font-heading text-2xl md:text-3xl font-medium text-fg-primary tracking-[-0.5px] mb-2">
                      Primeira mensagem
                    </h1>
                    <p className="text-base text-fg-tertiary font-sans">
                      O template aprovado que abre a conversa. As variáveis{" "}
                      <code className="font-mono text-sm">{"{{1}}"}</code> são
                      preenchidas na hora do disparo.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {WHATS_TEMPLATES.map((t) => {
                      const sel = selectedTemplate === t.id;
                      const pending = t.status === "pendente";
                      return (
                        <button
                          key={t.id}
                          type="button"
                          disabled={pending}
                          onClick={() => setSelectedTemplate(t.id)}
                          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors duration-aw-fast ${
                            pending
                              ? "cursor-not-allowed border-border bg-white opacity-60"
                              : sel
                                ? "border-fg-primary bg-bg-raised"
                                : "border-border bg-white hover:border-aw-gray-400 hover:bg-bg-surface"
                          }`}
                        >
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-bg-muted text-fg-secondary">
                            <Icon name="chat_bubble" size={18} fill={1} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="truncate text-sm font-medium text-fg-primary">
                                {t.name}
                              </h4>
                              <span
                                className={`inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  pending
                                    ? "bg-aw-amber-100 text-aw-amber-800"
                                    : "bg-aw-emerald-100 text-aw-emerald-800"
                                }`}
                              >
                                {pending ? "Em revisão" : "Aprovado"}
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-tertiary">
                              {t.preview}
                            </p>
                          </div>
                          <span
                            className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                              sel ? "border-fg-primary bg-fg-primary text-white" : "border-aw-gray-400"
                            }`}
                          >
                            {sel && <Icon name="check" size={12} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="flex items-center justify-between pt-4">
                <AwButton
                  variant="secondary"
                  size="md"
                  iconLeft="chevron_left"
                  onClick={channelBack}
                >
                  Voltar
                </AwButton>
                <AwButton
                  variant="primary"
                  size="md"
                  disabled={!canAdvanceChannel}
                  onClick={channelAdvance}
                >
                  Avançar
                </AwButton>
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
            <h2 className="font-heading text-xl font-medium text-fg-primary mb-2">
              Você está prestes a sair
            </h2>
            <p className="text-sm text-fg-tertiary mb-6">
              Você será redirecionado para a Memory Base para criar uma nova base de conhecimento. O progresso atual não será perdido.
            </p>
            <div className="flex items-center justify-end gap-3">
              <AwButton
                variant="secondary"
                size="md"
                onClick={() => setShowExitModal(false)}
              >
                Cancelar
              </AwButton>
              <AwButton
                variant="primary"
                size="md"
                onClick={handleConfirmExit}
              >
                Ir para Memory Base
              </AwButton>
            </div>
          </div>
        </div>
      )}

      {/* Preview de Habilidade / AOP (step 3) */}
      <AwModal
        open={preview !== null}
        onClose={() => setPreview(null)}
        title={preview?.item.name}
        footer={
          preview ? (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-secondary transition-colors hover:text-fg-primary"
              >
                <Icon name="open_in_new" size={14} />
                {preview.kind === "skill" ? "Ver em Integrações" : "Ver em AOPs"}
              </button>
              {(() => {
                const granted =
                  preview.kind === "skill"
                    ? selectedSkills.has(preview.item.id)
                    : selectedAops.has(preview.item.id);
                const toggle = () => {
                  const id = preview.item.id;
                  const set =
                    preview.kind === "skill" ? setSelectedSkills : setSelectedAops;
                  set((prev) => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  });
                };
                return (
                  <AwButton
                    variant={granted ? "secondary" : "primary"}
                    size="md"
                    iconLeft={granted ? "check" : "add"}
                    onClick={toggle}
                  >
                    {granted ? "Habilitado" : "Habilitar"}
                  </AwButton>
                );
              })()}
            </div>
          ) : undefined
        }
      >
        {preview && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-bg-muted text-fg-secondary">
                {preview.kind === "skill" ? (
                  <span
                    className="flex h-full w-full items-center justify-center text-base font-semibold text-white"
                    style={{ backgroundColor: preview.item.color }}
                  >
                    {preview.item.letter}
                  </span>
                ) : (
                  <Icon name={preview.item.icon} size={24} fill={1} />
                )}
              </div>
              <div className="min-w-0">
                <div className="body-sm font-medium text-fg-primary">
                  {preview.item.name}
                </div>
                <div className="body-xs text-fg-tertiary">
                  {preview.kind === "skill"
                    ? preview.item.domain
                    : "Processo operacional padrão"}
                </div>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-fg-secondary">
              {preview.item.summary}
            </p>

            <div className="flex items-start gap-2 rounded-lg bg-bg-surface px-3 py-2.5 text-xs text-fg-tertiary">
              <Icon name="lock" size={14} className="mt-px flex-shrink-0" />
              <span>
                Já configurado a nível de conta — aqui você só dá permissão pra
                este agente acessar.
              </span>
            </div>
          </div>
        )}
      </AwModal>
    </AwDashboardLayout>
  );
}
