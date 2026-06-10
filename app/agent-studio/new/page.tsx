"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwCapabilityTile } from "@/components/ui/AwCapabilityTile";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwAgentCore, agentCoreSrc } from "@/components/ui/AwAgentCore";
import { AwUserAgentOrb } from "@/components/ui/AwUserAgentOrb";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwChannelIcon } from "@/components/ui/AwChannelIcon";
import { Icon } from "@/components/ui/Icon";
import { OriginsConversionsStep } from "@/components/agent-studio/OriginsConversionsStep";
import {
  WizardInterview,
  WizardInterviewBackdrop,
  INTERVIEW_TOTAL,
  type InterviewAnswer,
} from "@/components/agent-studio/WizardInterview";

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

/* ───────── Habilidades e AOPs (step 3) ─────────
 * Habilidades = integrações de terceiro que o agente usa como ferramenta.
 * AOPs = processos operacionais padrão. Ambos já existem a nível de conta/org;
 * aqui o usuário só concede permissão de acesso ao agente que está criando. */

interface Habilidade {
  id: string;
  /** id da marca no registry do AwBrandLogo (logo + cor reais). */
  brand: string;
  name: string;
  domain: string;
  summary: string;
}

const HABILIDADES: Habilidade[] = [
  { id: "stripe", brand: "stripe", name: "Stripe", domain: "stripe.com", summary: "Pagamentos, assinaturas e reembolsos. O agente consulta o status de uma cobrança e pode iniciar estornos quando autorizado." },
  { id: "calendly", brand: "calendly", name: "Calendly", domain: "calendly.com", summary: "Agendamento. O agente oferece horários livres e confirma reuniões direto na agenda conectada." },
  { id: "pipedrive", brand: "pipedrive", name: "Pipedrive", domain: "pipedrive.com", summary: "CRM de vendas. O agente lê e atualiza negócios, contatos e etapas do funil." },
  { id: "hotmart", brand: "hotmart", name: "Hotmart", domain: "hotmart.com", summary: "Produtos digitais. O agente consulta compras, acessos e status de assinatura do aluno." },
  { id: "onprofit", brand: "onprofit", name: "OnProfit", domain: "onprofit.com.br", summary: "Gestão financeira. O agente puxa indicadores de receita e despesas pra responder dúvidas comerciais." },
  { id: "typeform", brand: "typeform", name: "Typeform", domain: "typeform.com", summary: "Formulários. O agente lê respostas pra qualificar e enriquecer o lead." },
  { id: "eduzz", brand: "eduzz", name: "Eduzz", domain: "eduzz.com", summary: "Checkout e infoprodutos. O agente acompanha transações e acessos do comprador." },
  { id: "hubla", brand: "hubla", name: "Hubla", domain: "hub.la", summary: "Vendas e comunidades. O agente sincroniza assinaturas e status de membros." },
  { id: "ticto", brand: "ticto", name: "Ticto", domain: "ticto.com.br", summary: "Checkout. O agente recebe eventos de venda e renovação em tempo real." },
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
  { id: "whatsapp", name: "WhatsApp", description: "Atende e recebe leads no WhatsApp Business.", icon: "whatsapp", status: "ativo" as const },
  { id: "instagram", name: "Instagram", description: "Conversas no Instagram Direct.", icon: "instagram", status: "em-breve" as const },
  { id: "messenger", name: "Messenger", description: "Atendimento pelo Facebook Messenger.", icon: "messenger", status: "em-breve" as const },
  { id: "telegram", name: "Telegram", description: "Bot de atendimento no Telegram.", icon: "telegram", status: "em-breve" as const },
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

/* ───────── Agent Core (step 6) ─────────
 * Framework de agente da Aswork que impulsiona o agente do usuário. Visual:
 * orb diamante estático (AwAgentCore). Mostra 6 inicialmente + "ver mais". */

interface AgentCoreOption {
  id: string;
  name: string;
  description: string;
  /** Número do orb (1–20) em /assets/agent_imgs/orbs/. */
  core: number;
}

const AGENT_CORES: AgentCoreOption[] = [
  { id: "meeting-recovery", name: "Meeting Recovery", description: "Recupera reuniões perdidas e reagenda no-shows automaticamente.", core: 1 },
  { id: "sales-closer", name: "Sales Closer", description: "Conduz a negociação até o fechamento com gatilhos de urgência.", core: 2 },
  { id: "lead-qualifier", name: "Lead Qualifier", description: "Qualifica e pontua leads pelo seu ICP antes de passar pro time.", core: 3 },
  { id: "support-resolver", name: "Support Resolver", description: "Resolve dúvidas de suporte com base na sua memory base.", core: 4 },
  { id: "onboarding-guide", name: "Onboarding Guide", description: "Conduz o cliente novo pelos primeiros passos do produto.", core: 5 },
  { id: "churn-saver", name: "Churn Saver", description: "Detecta risco de cancelamento e age pra reter o cliente.", core: 6 },
  { id: "upsell-engine", name: "Upsell Engine", description: "Identifica oportunidades de upgrade e oferece no momento certo.", core: 7 },
  { id: "demo-scheduler", name: "Demo Scheduler", description: "Agenda demonstrações e confirma presença automaticamente.", core: 8 },
  { id: "reactivation", name: "Reactivation", description: "Reativa contatos frios com campanhas de retorno.", core: 9 },
  { id: "nps-collector", name: "NPS Collector", description: "Coleta e interpreta o feedback pós-atendimento.", core: 10 },
];

const CORES_VISIVEIS = 6;

const MEMORY_BASES_STORAGE_KEY = "memory-bases-list";
const MAX_VISIBLE_BASES = 4;

const LOADING_MESSAGES = [
  "Analisando base de conhecimento...",
  "Configurando integrações...",
  "Pensando na melhor estratégia...",
  "Gerando prompt otimizado...",
  "Finalizando configuração...",
];

// Bases de demonstração — usadas quando o usuário ainda não criou nenhuma base
// na conta. Sem isso o step 2 trava (não há base pra selecionar → não avança).
const MOCK_BASES: KnowledgeBase[] = [
  { id: "fyntra-geral", name: "Fyntra | Dados Gerais 2026", documentCount: 5, knowledgeLayersCount: 178 },
  { id: "catalogo-produtos", name: "Catálogo de Produtos", documentCount: 12, knowledgeLayersCount: 64 },
  { id: "faq-suporte", name: "FAQ & Políticas de Suporte", documentCount: 8, knowledgeLayersCount: 40 },
];

function loadBasesFromStorage(): KnowledgeBase[] {
  if (typeof window === "undefined") return MOCK_BASES;
  try {
    const s = window.localStorage.getItem(MEMORY_BASES_STORAGE_KEY);
    const parsed: KnowledgeBase[] = s ? JSON.parse(s) : [];
    return parsed.length > 0 ? parsed : MOCK_BASES;
  } catch {
    return MOCK_BASES;
  }
}

// useSearchParams exige um boundary de Suspense no prerender (next build) —
// mesmo padrão de /tools/new e /canais/whatsapp.
export default function AgentStudioNewPage() {
  return (
    <Suspense fallback={null}>
      <AgentStudioNewContent />
    </Suspense>
  );
}

function AgentStudioNewContent() {
  const router = useRouter();
  // A URL é a fonte de verdade do passo (?step=N). O wizard inteiro vive em
  // /agent-studio/new, mas cada etapa vira um endereço próprio — deep-link
  // funciona, o browser back anda entre passos, e o Review Mode (escopado por
  // URL) separa os comentários por etapa. Sem ?step válido, começa no 1.
  const searchParams = useSearchParams();
  const stepParam = Number(searchParams.get("step"));
  const currentStep = stepParam >= 1 && stepParam <= 8 ? stepParam : 1;

  // Passo 7 (entrevista de calibragem): a pergunta atual também vive na URL
  // (?step=7&q=1..3) — o Review Mode escopa comentários por URL, então cada
  // pergunta vira um endereço próprio. q inválido cai na pergunta 1.
  const qParam = Number(searchParams.get("q"));
  const currentQuestion = qParam >= 1 && qParam <= INTERVIEW_TOTAL ? qParam : 1;

  // Navega entre passos escrevendo na URL (push: browser back volta um passo).
  // O loader (passo 8) é o fim do wizard — ele entrega no editor real do agente
  // via router.replace, pra tela de loading não virar entrada de histórico.
  const goToStep = useCallback(
    (n: number) => {
      router.push(`/agent-studio/new?step=${n}`, { scroll: false });
    },
    [router]
  );

  // Navega entre as perguntas da entrevista (passo 7) mantendo q na URL.
  const goToQuestion = useCallback(
    (n: number) => {
      router.push(`/agent-studio/new?step=7&q=${n}`, { scroll: false });
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
  const [basesModalOpen, setBasesModalOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Step 3 state (Habilidades e AOPs) — permissões que o agente recebe
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedAops, setSelectedAops] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<
    { kind: "skill"; item: Habilidade } | { kind: "aop"; item: Aop } | null
  >(null);

  // Step 4 state (Seleção de Canal) — master-detail numa etapa só
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  // Escolher o número já traz a primeira mensagem padrão — a lista completa
  // de templates só abre quando o usuário clica em "Alterar".
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  // Step 5 (Origens e Conversões) — opcional. A etapa gerencia o próprio estado;
  // só reportamos pro wizard se há ao menos uma config concluída (habilita Avançar).
  const [step5HasConfig, setStep5HasConfig] = useState(false);

  // Step 6 state (Agent Core)
  const [selectedAgentCore, setSelectedAgentCore] = useState<string | null>(null);
  const [showAllCores, setShowAllCores] = useState(false);

  // Step 7 (Entrevista de calibragem) — respostas por pergunta (1..3).
  const [interviewAnswers, setInterviewAnswers] = useState<
    Record<number, InterviewAnswer>
  >({});

  // Step 8 (Loading) state
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Load knowledge bases on mount
  useEffect(() => {
    queueMicrotask(() => {
      setKnowledgeBases(loadBasesFromStorage());
    });
  }, []);

  // Loading message rotation
  useEffect(() => {
    if (currentStep === 8) {
      const interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 1500);

      // Após o delay, entrega o usuário no editor real do agente
      // (protótipo: agente mock "leads-recovery" em /agent-studio/[id]).
      const timeout = setTimeout(() => {
        router.replace("/agent-studio/leads-recovery");
      }, 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [currentStep, router]);

  const breadcrumbs = [
    { label: "Agent Studio", href: "/agent-studio" },
    "Novo agente",
  ];

  // Validation
  const canAdvanceStep1 = selectedGoal && (selectedGoal !== "outro" || customGoal.trim());
  const canAdvanceStep2 = agentName.trim() && selectedBaseId;

  // Visible bases
  const visibleBases = knowledgeBases.slice(0, MAX_VISIBLE_BASES);
  const hasMoreBases = knowledgeBases.length > MAX_VISIBLE_BASES;

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
      // Canal → config de conversão
      goToStep(5);
    } else if (currentStep === 5) {
      // Conversão (opcional) → Agent Core
      goToStep(6);
    } else if (currentStep === 6) {
      // Agent Core → entrevista de calibragem (3 perguntas)
      goToQuestion(1);
    }
  };

  // Step 4 só avança com canal + número + template definidos.
  const canAdvanceStep4 = !!selectedChannel && !!selectedNumber && !!selectedTemplate;

  // Step 6 (Agent Core) exige uma escolha. (Step 5/conversão é opcional.)
  const canAdvanceStep6 = !!selectedAgentCore;
  const visibleCores = showAllCores ? AGENT_CORES : AGENT_CORES.slice(0, CORES_VISIVEIS);

  const handleCreateNewBase = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    router.push("/memory-base");
  };

  const isOtherSelected = selectedGoal === "outro";

  // Step 7: Entrevista de calibragem — tela própria (sem o card largo dos
  // passos 1–6): card branco centrado sobre o gradiente animado.
  if (currentStep === 7) {
    return (
      <AwDashboardLayout breadcrumbs={breadcrumbs} mainClassName="p-0! overflow-hidden!">
        <WizardInterview
          question={currentQuestion}
          answers={interviewAnswers}
          onAnswerChange={(question, answer) =>
            setInterviewAnswers((prev) => ({ ...prev, [question]: answer }))
          }
          onBack={() =>
            currentQuestion === 1 ? goToStep(6) : goToQuestion(currentQuestion - 1)
          }
          onAdvance={() =>
            currentQuestion === INTERVIEW_TOTAL
              ? goToStep(8)
              : goToQuestion(currentQuestion + 1)
          }
        />
      </AwDashboardLayout>
    );
  }

  // Step 8: Loading Screen — herda o gradiente animado da entrevista
  // (continuidade visual entre calibragem e geração).
  if (currentStep === 8) {
    return (
      <AwDashboardLayout breadcrumbs={breadcrumbs} mainClassName="p-0! overflow-hidden!">
        <div className="flex min-h-full w-full items-center justify-center bg-white relative overflow-hidden">
          <WizardInterviewBackdrop />

          <div className="relative z-10 flex flex-col items-center gap-8">
            <SparkleIcon />
            <div className="text-center">
              <h1 className="font-heading text-2xl md:text-3xl font-medium text-fg-primary tracking-tight mb-3">
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

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs} mainClassName="p-0! overflow-hidden!">
      <div className="flex min-h-full w-full items-center justify-center bg-white p-6">
        <div className={`w-full ${currentStep === 5 ? "max-w-[1320px]" : currentStep >= 2 && currentStep <= 4 ? "max-w-[1180px]" : "max-w-[900px]"} bg-white rounded-2xl px-8 py-10 md:px-14 md:py-11`}>
          <div key={currentStep} className="aw-wizard-step flex flex-col gap-8">

          {/* Step 1: Goal Selection */}
          {currentStep === 1 && (
            <>
              <div className="text-left">
                <h1 className="font-heading text-2xl md:text-3xl font-medium text-fg-primary tracking-tight mb-2">
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
                <h1 className="font-heading text-2xl md:text-3xl font-medium text-fg-primary tracking-tight mb-2">
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
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
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
                                        <AwUserAgentOrb
                                          key={id}
                                          seed={id}
                                          size={20}
                                          className="ring-2 ring-bg-raised"
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

                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
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
                        <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-bg-muted">
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
                <h1 className="font-heading text-2xl md:text-3xl font-medium text-fg-primary tracking-tight mb-2">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {HABILIDADES.map((h) => (
                    <AwCapabilityTile
                      key={h.id}
                      icon={<AwBrandLogo brand={h.brand} size="md" />}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {AOPS.map((a) => (
                    <AwCapabilityTile
                      key={a.id}
                      icon={
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-muted text-fg-secondary">
                          <Icon name={a.icon} size={20} fill={1} />
                        </div>
                      }
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

          {/* Step 4: Seleção de Canal — master-detail numa etapa só */}
          {currentStep === 4 && (
            <>
              <div className="text-left">
                <h1 className="font-heading text-2xl md:text-3xl font-medium text-fg-primary tracking-tight mb-2">
                  Canal de atendimento
                </h1>
                <p className="text-base text-fg-tertiary font-sans">
                  Escolha o canal e configure o telefone e a primeira mensagem do
                  agente — tudo numa etapa.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                {/* Master: canais */}
                <section className="flex flex-col gap-3">
                  <div>
                    <h2 className="font-heading text-lg font-medium text-fg-primary">
                      Canais
                    </h2>
                    <p className="text-sm text-fg-tertiary">
                      Por onde o agente vai atender.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {CANAIS.map((c) => {
                      const sel = selectedChannel === c.id;
                      const soon = c.status === "em-breve";
                      return (
                        <button
                          key={c.id}
                          type="button"
                          disabled={soon}
                          onClick={() => setSelectedChannel(c.id)}
                          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors duration-aw-fast ${
                            soon
                              ? "cursor-not-allowed border-border bg-white opacity-60"
                              : sel
                                ? "border-(--bg-inverse) bg-(--bg-inverse)"
                                : "border-border bg-white hover:border-aw-gray-400 hover:bg-bg-surface"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                              sel ? "bg-white/10" : "bg-bg-muted"
                            }`}
                          >
                            <AwChannelIcon channel={c.icon} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4
                                className={`truncate font-heading text-sm font-medium ${
                                  sel ? "text-(--fg-on-inverse)" : "text-fg-primary"
                                }`}
                              >
                                {c.name}
                              </h4>
                              {soon ? (
                                <span className="inline-flex shrink-0 items-center rounded-full bg-bg-muted px-2 py-0.5 text-[10px] font-medium text-fg-tertiary">
                                  Em breve
                                </span>
                              ) : (
                                <span
                                  className={`inline-flex shrink-0 items-center gap-1 text-xs ${
                                    sel ? "text-aw-emerald-400" : "text-aw-emerald-700"
                                  }`}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-aw-emerald-500" />
                                  Ativo
                                </span>
                              )}
                            </div>
                            <p
                              className={`truncate text-xs ${
                                sel
                                  ? "text-(--fg-on-inverse) opacity-70"
                                  : "text-fg-tertiary"
                              }`}
                            >
                              {c.description}
                            </p>
                          </div>
                          {!soon && (
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                sel
                                  ? "border-white bg-white text-(--bg-inverse)"
                                  : "border-aw-gray-400"
                              }`}
                            >
                              {sel && <Icon name="check" size={12} />}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Detail: telefone e template */}
                <section className="flex flex-col gap-3">
                  <div>
                    <h2 className="font-heading text-lg font-medium text-fg-primary">
                      Telefone e template
                    </h2>
                    <p className="text-sm text-fg-tertiary">
                      Selecione o número e a mensagem que abre a conversa.
                    </p>
                  </div>

                  {!selectedChannel ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-bg-surface px-6 py-14 text-center">
                      <Icon name="arrow_back" size={20} className="text-fg-tertiary" />
                      <p className="text-sm text-fg-tertiary">
                        Escolha um canal à esquerda pra configurar o telefone e a
                        primeira mensagem.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {/* Telefone */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-fg-primary">
                          Telefone
                        </label>
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
                              onClick={() => {
                                setSelectedNumber(n.id);
                                // Primeira mensagem padrão entra na hora; o
                                // usuário só abre o picker se quiser alterar.
                                setTemplatePickerOpen(false);
                                if (!selectedTemplate) {
                                  setSelectedTemplate(
                                    WHATS_TEMPLATES.find(
                                      (t) => t.status === "aprovado",
                                    )?.id ?? null,
                                  );
                                }
                              }}
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
                                <div className="flex items-center gap-2">
                                  <h4 className="truncate text-sm font-medium text-fg-primary">
                                    {n.name}
                                  </h4>
                                  {n.avatar && (
                                    <span className="inline-flex shrink-0 items-center gap-0.5 text-xs text-aw-emerald-700">
                                      <Icon name="trending_up" size={13} />
                                      Alta
                                    </span>
                                  )}
                                </div>
                                <p className="truncate text-xs text-fg-tertiary">
                                  {n.phone}
                                </p>
                              </div>
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                  sel ? "border-fg-primary bg-fg-primary text-white" : "border-aw-gray-400"
                                }`}
                              >
                                {sel && <Icon name="check" size={12} />}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Primeira mensagem — escolher o número já traz o
                          template padrão; "Alterar" abre as outras opções */}
                      {selectedNumber && (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-3">
                            <label className="text-sm font-medium text-fg-primary">
                              Primeira mensagem
                            </label>
                            {!templatePickerOpen && (
                              <AwButton
                                variant="ghost"
                                size="sm"
                                iconLeft="swap_horiz"
                                onClick={() => setTemplatePickerOpen(true)}
                              >
                                Alterar
                              </AwButton>
                            )}
                          </div>
                          <p className="-mt-1 text-xs text-fg-tertiary">
                            {templatePickerOpen
                              ? "Escolha o template aprovado que abre a conversa."
                              : "Template aprovado que abre a conversa. As variáveis "}
                            {!templatePickerOpen && (
                              <code className="font-mono text-[11px]">
                                {"{{1}}"}
                              </code>
                            )}
                            {!templatePickerOpen && " entram na hora do disparo."}
                          </p>
                          {(templatePickerOpen
                            ? WHATS_TEMPLATES
                            : WHATS_TEMPLATES.filter(
                                (t) => t.id === selectedTemplate,
                              )
                          ).map((t) => {
                            const sel = selectedTemplate === t.id;
                            const pending = t.status === "pendente";
                            return (
                              <button
                                key={t.id}
                                type="button"
                                disabled={pending}
                                onClick={() => {
                                  if (templatePickerOpen) {
                                    setSelectedTemplate(t.id);
                                    setTemplatePickerOpen(false);
                                  } else {
                                    setTemplatePickerOpen(true);
                                  }
                                }}
                                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors duration-aw-fast ${
                                  pending
                                    ? "cursor-not-allowed border-border bg-white opacity-60"
                                    : sel
                                      ? "border-fg-primary bg-bg-raised"
                                      : "border-border bg-white hover:border-aw-gray-400 hover:bg-bg-surface"
                                }`}
                              >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-muted text-fg-secondary">
                                  <Icon name="chat_bubble" size={18} fill={1} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="truncate text-sm font-medium text-fg-primary">
                                      {t.name}
                                    </h4>
                                    <span
                                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
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
                                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                    sel ? "border-fg-primary bg-fg-primary text-white" : "border-aw-gray-400"
                                  }`}
                                >
                                  {sel && <Icon name="check" size={12} />}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>

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
                  disabled={!canAdvanceStep4}
                  onClick={handleAdvance}
                >
                  Avançar
                </AwButton>
              </div>
            </>
          )}

          {/* Step 5: Origens e Conversões (opcional) */}
          {currentStep === 5 && (
            <>
              <div className="text-left">
                <h1 className="font-heading text-2xl md:text-3xl font-medium text-fg-primary tracking-tight mb-2">
                  Origens e Conversões
                </h1>
                <p className="text-base text-fg-tertiary font-sans">
                  Configure de onde vem o seu cliente e seus eventos de conversão.
                  Etapa opcional — pode pular e o agente segue agindo quando alguém
                  entra em contato.
                </p>
              </div>

              <OriginsConversionsStep onValidityChange={setStep5HasConfig} />

              <div className="flex items-center justify-between pt-4">
                <AwButton
                  variant="secondary"
                  size="md"
                  iconLeft="chevron_left"
                  onClick={handleBack}
                >
                  Voltar
                </AwButton>
                <div className="flex items-center gap-2">
                  <AwButton variant="ghost" size="md" onClick={handleAdvance}>
                    Pular esta etapa
                  </AwButton>
                  <AwButton
                    variant="primary"
                    size="md"
                    disabled={!step5HasConfig}
                    onClick={handleAdvance}
                  >
                    Avançar
                  </AwButton>
                </div>
              </div>
            </>
          )}

          {/* Step 6: Seleção de Agent Core */}
          {currentStep === 6 && (
            <>
              <div className="text-left">
                <h1 className="font-heading text-2xl md:text-3xl font-medium text-fg-primary tracking-tight mb-2">
                  Agent Core
                </h1>
                <p className="text-base text-fg-tertiary font-sans">
                  O framework da Aswork que impulsiona seu agente. Escolha o que
                  mais combina com o objetivo dele.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visibleCores.map((c) => {
                  const sel = selectedAgentCore === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedAgentCore(c.id)}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors duration-aw-fast ${
                        sel
                          ? "border-fg-primary bg-bg-raised"
                          : "border-border bg-white hover:border-aw-gray-400 hover:bg-bg-surface"
                      }`}
                    >
                      <AwAgentCore src={agentCoreSrc(c.core)} alt={c.name} size={44} />
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-heading text-sm font-medium text-fg-primary">
                          {c.name}
                        </h4>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-fg-tertiary">
                          {c.description}
                        </p>
                      </div>
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          sel ? "border-fg-primary bg-fg-primary text-white" : "border-aw-gray-400"
                        }`}
                      >
                        {sel && <Icon name="check" size={12} />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {!showAllCores && AGENT_CORES.length > CORES_VISIVEIS && (
                <button
                  type="button"
                  onClick={() => setShowAllCores(true)}
                  className="inline-flex items-center justify-center gap-1.5 self-center rounded-md px-3 py-2 text-sm font-medium text-fg-secondary transition-colors hover:bg-bg-muted hover:text-fg-primary"
                >
                  <Icon name="expand_more" size={16} />
                  Ver mais Agent Cores
                </button>
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
                  disabled={!canAdvanceStep6}
                  onClick={handleAdvance}
                >
                  Avançar
                </AwButton>
              </div>
            </>
          )}
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowExitModal(false)} />
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
              {preview.kind === "skill" ? (
                <AwBrandLogo brand={preview.item.brand} size="lg" />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bg-muted text-fg-secondary">
                  <Icon name={preview.item.icon} size={24} fill={1} />
                </div>
              )}
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
              <Icon name="lock" size={14} className="mt-px shrink-0" />
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
