"use client";

import * as React from "react";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwFileIcon } from "@/components/ui/AwFileIcon";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwProgress } from "@/components/ui/AwProgress";
import { AwSheet } from "@/components/ui/AwSheet";
import { AwStatusDot } from "@/components/ui/AwStatusDot";
import { AwTabs } from "@/components/ui/AwTabs";
import { useToast } from "@/components/ui/AwToast";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading, SettingsPageHeader } from "../../_components/shared";

/* ===================================================================== *
 * Mock data — tudo local a esta página. Trocar por dados reais quando o
 * backend expor os eventos da organização e os pedidos de dados.
 * ===================================================================== */

/** Quem recebe os arquivos exportados desta página. */
const EXPORT_RECIPIENT = "greg@awsales.io";

/* ---------- categorias do histórico ---------- */

type EventCategory =
  | "Membros"
  | "Funções"
  | "Integrações"
  | "Agentes"
  | "Segurança"
  | "Dados";

const ALL_CATEGORIES: EventCategory[] = [
  "Membros",
  "Funções",
  "Integrações",
  "Agentes",
  "Segurança",
  "Dados",
];

/** Ícone + badge neutro por categoria. Segurança e Dados ganham um leve
 *  destaque de cor porque são os eventos que mais importam num histórico. */
const TYPE_META: Record<
  EventCategory,
  { icon: string; badgeClass: string; accentClass?: string }
> = {
  Membros: {
    icon: "group",
    badgeClass:
      "border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)",
  },
  Funções: {
    icon: "badge",
    badgeClass:
      "border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)",
  },
  Integrações: {
    icon: "cable",
    badgeClass:
      "border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)",
  },
  Agentes: {
    icon: "agent",
    badgeClass:
      "border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)",
  },
  Segurança: {
    icon: "shield_lock",
    badgeClass:
      "border-(--aw-amber-300) bg-(--aw-amber-100) text-(--aw-amber-800)",
    accentClass: "text-(--aw-amber-700)",
  },
  Dados: {
    icon: "database",
    badgeClass:
      "border-(--aw-purple-300) bg-(--aw-purple-150) text-(--aw-purple-800)",
    accentClass: "text-(--aw-purple-700)",
  },
};

/* ---------- tipo de quem agiu ---------- */

/** Origem da ação. Num histórico de compliance importa distinguir se algo foi
 *  feito por uma pessoa, pelo próprio sistema, pela equipe da AwSales, por uma
 *  chave de API ou por um webhook externo — não só "quem", mas "o quê". */
type ActorKind =
  | "Pessoa"
  | "Sistema"
  | "Encarregado"
  | "AwSales"
  | "Webhook"
  | "Chave de API";

const ACTOR_KIND_META: Record<
  ActorKind,
  { icon: string; label: string; badgeClass: string; humanFace: boolean }
> = {
  Pessoa: {
    icon: "person",
    label: "Pessoa",
    badgeClass:
      "border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)",
    humanFace: true,
  },
  Sistema: {
    icon: "dns",
    label: "Sistema",
    badgeClass:
      "border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)",
    humanFace: false,
  },
  Encarregado: {
    // DPO traduzido: "encarregado de dados" é o termo da LGPD em português.
    icon: "shield_person",
    label: "Encarregado de dados",
    badgeClass:
      "border-(--aw-purple-300) bg-(--aw-purple-150) text-(--aw-purple-800)",
    humanFace: true,
  },
  AwSales: {
    icon: "corporate_fare",
    label: "Equipe AwSales",
    badgeClass:
      "border-(--aw-blue-300) bg-(--aw-blue-100) text-(--aw-blue-800)",
    humanFace: false,
  },
  Webhook: {
    icon: "webhook",
    label: "Webhook externo",
    badgeClass:
      "border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)",
    humanFace: false,
  },
  "Chave de API": {
    icon: "key",
    label: "Chave de API",
    badgeClass:
      "border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)",
    humanFace: false,
  },
};

const ALL_ACTOR_KINDS: ActorKind[] = [
  "Pessoa",
  "Sistema",
  "Encarregado",
  "AwSales",
  "Webhook",
  "Chave de API",
];

/* ---------- eventos do histórico ---------- */

type OrgEvent = {
  id: string;
  date: string; // dd/mm/aaaa
  time: string; // HH:mm
  actor: string;
  actorAvatar?: string;
  actorKind: ActorKind;
  role: string;
  type: EventCategory;
  action: string;
  /** Identificador técnico do evento — o que o backend registra. Aparece só
   *  no detalhe, em mono, para quem precisa investigar. */
  code: string;
  meta?: string;
};

const ORG_EVENTS: OrgEvent[] = [
  {
    id: "e-1",
    date: "14/06/2026",
    time: "16:48",
    actor: "Rafael Lima",
    actorAvatar: "/assets/ui-faces/male-3.jpg",
    actorKind: "Pessoa",
    role: "Administrador",
    type: "Membros",
    action: "convidou Mariana Castro",
    code: "membro.convidado",
    meta: "Convite enviado para mariana.castro@fyntra.com.br",
  },
  {
    id: "e-2",
    date: "14/06/2026",
    time: "15:20",
    actor: "Rafael Lima",
    actorAvatar: "/assets/ui-faces/male-3.jpg",
    actorKind: "Pessoa",
    role: "Administrador",
    type: "Funções",
    action: "alterou a função de Carlos Lima para Editor",
    code: "funcao.alterada",
    meta: "Antes: Visualizador",
  },
  {
    id: "e-3",
    date: "14/06/2026",
    time: "11:05",
    actor: "Bruno Costa",
    actorAvatar: "/assets/ui-faces/male-1.jpg",
    actorKind: "Pessoa",
    role: "Administrador",
    type: "Integrações",
    action: "conectou a integração do WhatsApp",
    code: "integracao.conectada",
    meta: "Número +55 11 4002-8922",
  },
  {
    id: "e-4",
    date: "13/06/2026",
    time: "18:32",
    actor: "Felipe Rezende",
    actorAvatar: "/assets/ui-faces/male-2.jpg",
    actorKind: "Pessoa",
    role: "Editor",
    type: "Agentes",
    action: "publicou o agente Atlas",
    code: "agente.publicado",
    meta: "Versão 4 · disponível para a equipe",
  },
  {
    id: "e-5",
    date: "13/06/2026",
    time: "14:10",
    actor: "Bruno Costa",
    actorAvatar: "/assets/ui-faces/male-1.jpg",
    actorKind: "Pessoa",
    role: "Administrador",
    type: "Segurança",
    action: "ativou a verificação em duas etapas para a organização",
    code: "seguranca.2fa_obrigatorio",
    meta: "Obrigatória para todos os membros a partir de hoje",
  },
  {
    id: "e-6",
    date: "12/06/2026",
    time: "09:54",
    actor: "Maria Resende",
    actorAvatar: "/assets/ui-faces/female-2.jpg",
    actorKind: "Encarregado",
    role: "Encarregada de dados",
    type: "Dados",
    action: "exportou o histórico de atividade",
    code: "dados.exportados",
    meta: "Arquivo enviado por e-mail para greg@awsales.io",
  },
  {
    id: "e-7",
    date: "11/06/2026",
    time: "17:21",
    actor: "Rafael Lima",
    actorAvatar: "/assets/ui-faces/male-3.jpg",
    actorKind: "Pessoa",
    role: "Administrador",
    type: "Membros",
    action: "removeu o acesso de João Pereira",
    code: "membro.removido",
    meta: "Saída registrada · sessões encerradas",
  },
  {
    id: "e-8",
    date: "11/06/2026",
    time: "10:08",
    actor: "Integração HubSpot",
    actorKind: "Webhook",
    role: "Webhook externo",
    type: "Integrações",
    action: "sincronizou 312 contatos do CRM",
    code: "webhook.sincronizacao",
    meta: "Origem: hubspot.com · evento contact.updated",
  },
  {
    id: "e-9",
    date: "10/06/2026",
    time: "13:47",
    actor: "Sistema AwSales",
    actorKind: "Sistema",
    role: "Automático",
    type: "Segurança",
    action: "encerrou sessões inativas há mais de 30 dias",
    code: "sistema.sessoes_expiradas",
    meta: "4 sessões encerradas automaticamente",
  },
  {
    id: "e-10",
    date: "09/06/2026",
    time: "08:35",
    actor: "chave · backend de produção",
    actorKind: "Chave de API",
    role: "aws_live_8f3a…",
    type: "Dados",
    action: "consultou registros de conversas via API",
    code: "api.leitura_conversas",
    meta: "Chave aws_live_8f3a… · 1.204 registros lidos",
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  return (first + last).toUpperCase();
}

/** Avatar do ator: foto/iniciais para pessoas, ícone para sistemas, webhooks,
 *  chaves de API e equipe AwSales — assim a origem da ação fica óbvia mesmo
 *  num relance, sem precisar ler o badge. */
function ActorAvatar({
  name,
  avatar,
  kind,
  size = "md",
}: {
  name: string;
  avatar?: string;
  kind: ActorKind;
  size?: "sm" | "md";
}) {
  const meta = ACTOR_KIND_META[kind];
  if (meta.humanFace) {
    return (
      <AwAvatar
        size={size}
        src={avatar}
        alt={name}
        initials={getInitials(name)}
      />
    );
  }
  const box = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <span
      aria-hidden="true"
      className={`flex ${box} shrink-0 items-center justify-center rounded-full bg-(--bg-muted) text-(--fg-secondary)`}
    >
      <Icon name={meta.icon} size={size === "sm" ? 15 : 18} animated={false} />
    </span>
  );
}

/** Badge discreto do tipo de ator, ao lado do nome. */
function ActorKindBadge({ kind }: { kind: ActorKind }) {
  const meta = ACTOR_KIND_META[kind];
  return (
    <span
      className={
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 body-xs font-medium " +
        meta.badgeClass
      }
    >
      <Icon name={meta.icon} size={12} animated={false} />
      {meta.label}
    </span>
  );
}

type Person = {
  actor: string;
  avatar?: string;
  kind: ActorKind;
};

/** Atores únicos que aparecem no histórico — alimentam o filtro de executor
 *  com gente (e sistemas) de verdade, não categorias abstratas. */
function buildPeople(events: OrgEvent[]): Person[] {
  const seen = new Map<string, Person>();
  for (const e of events) {
    if (!seen.has(e.actor)) {
      seen.set(e.actor, {
        actor: e.actor,
        avatar: e.actorAvatar,
        kind: e.actorKind,
      });
    }
  }
  return Array.from(seen.values()).sort((a, b) =>
    a.actor.localeCompare(b.actor, "pt-BR"),
  );
}

const ALL_PEOPLE: Person[] = buildPeople(ORG_EVENTS);
const ALL_ACTOR_NAMES: string[] = ALL_PEOPLE.map((p) => p.actor);

/** "Pessoa" no filtro = gente de verdade (humanos). Sistema, Webhook, Chave
 *  de API e Equipe AwSales são atores não-humanos — eles aparecem no
 *  filtro de Origem, não no filtro de Pessoa. */
const HUMAN_ACTOR_KINDS = new Set<ActorKind>(["Pessoa", "Encarregado"]);
const HUMAN_PEOPLE: Person[] = ALL_PEOPLE.filter((p) =>
  HUMAN_ACTOR_KINDS.has(p.kind),
);
const HUMAN_ACTOR_NAMES: string[] = HUMAN_PEOPLE.map((p) => p.actor);

/* ---------- solicitações de dados ---------- */

/** Os 4 direitos que um titular pode exercer, em linguagem de produto. A base
 *  legal (Art. 18) fica como nota de rodapé, nunca como rótulo principal. */
type DataRightId = "acesso" | "correcao" | "eliminacao" | "revogacao";

type DataRightOption = {
  id: DataRightId;
  label: string;
  /** Selo de confiança opcional — referência legal leve. */
  legal: string;
  /** Eliminação aciona o aviso de que a ação é irreversível. */
  destructive?: boolean;
};

const DATA_RIGHTS: DataRightOption[] = [
  {
    id: "acesso",
    label: "Acesso aos dados",
    legal: "Art. 18, II",
  },
  {
    id: "correcao",
    label: "Correção de dados",
    legal: "Art. 18, III",
  },
  {
    id: "eliminacao",
    label: "Eliminação de dados",
    legal: "Art. 18, IV e VI",
    destructive: true,
  },
  {
    id: "revogacao",
    label: "Revogação de consentimento",
    legal: "Art. 8º, §5º",
  },
];

/** Por onde o pedido chegou, quando logado manualmente pelo encarregado. */
const REQUEST_CHANNELS = [
  "E-mail",
  "Telefone ou WhatsApp",
  "Formulário do site",
  "Portal do titular",
  "Presencial ou carta",
  "Outro",
] as const;
type RequestChannel = (typeof REQUEST_CHANNELS)[number];

type DataRequestKind = "Exportação" | "Remoção";
type DataRequestStatus =
  | "Em análise"
  | "Concluída"
  | "Recusada"
  | "Prazo vencido";

type DataRequest = {
  id: string;
  /** Protocolo legível gerado na abertura. */
  protocol: string;
  requester: string;
  requesterEmail?: string;
  requesterAvatar?: string;
  kind: DataRequestKind;
  right: DataRightId;
  channel: RequestChannel;
  status: DataRequestStatus;
  openedAt: string; // DD/MM
  dueAt: string; // DD/MM
  description?: string;
  /** Evidência registrada ao concluir o atendimento. */
  evidence?: string;
};

const DATA_REQUESTS_SEED: DataRequest[] = [
  {
    id: "dr-1",
    protocol: "SOL-2026-0142",
    requester: "Mariana Castro",
    requesterEmail: "mariana.castro@fyntra.com.br",
    requesterAvatar: "/assets/ui-faces/female-3.jpg",
    kind: "Exportação",
    right: "acesso",
    channel: "E-mail",
    status: "Em análise",
    openedAt: "12/06",
    dueAt: "27/06",
    description: "Pediu uma cópia de tudo que guardamos sobre ela.",
  },
  {
    id: "dr-2",
    protocol: "SOL-2026-0138",
    requester: "Carlos Andrade",
    requesterEmail: "carlos.andrade@gmail.com",
    requesterAvatar: "/assets/ui-faces/male-7.jpg",
    kind: "Remoção",
    right: "eliminacao",
    channel: "Portal do titular",
    status: "Em análise",
    openedAt: "30/05",
    dueAt: "14/06",
    description: "Solicitou a eliminação dos dados após encerrar o contrato.",
  },
  {
    id: "dr-3",
    protocol: "SOL-2026-0129",
    requester: "João Pereira",
    requesterEmail: "joao.pereira@outlook.com",
    requesterAvatar: "/assets/ui-faces/male-9.jpg",
    kind: "Remoção",
    right: "eliminacao",
    channel: "E-mail",
    status: "Concluída",
    openedAt: "28/05",
    dueAt: "12/06",
    evidence:
      "Dados anonimizados e cópia de confirmação enviada por e-mail em 10/06.",
  },
  {
    id: "dr-4",
    protocol: "SOL-2026-0117",
    requester: "Felipe Rezende",
    requesterEmail: "felipe.rezende@fyntra.com.br",
    requesterAvatar: "/assets/ui-faces/male-2.jpg",
    kind: "Exportação",
    right: "acesso",
    channel: "Telefone ou WhatsApp",
    status: "Recusada",
    openedAt: "20/05",
    dueAt: "04/06",
    evidence:
      "Não foi possível confirmar a identidade do titular após duas tentativas.",
  },
];

const REQUEST_KIND_META: Record<DataRequestKind, { icon: string }> = {
  Exportação: { icon: "download" },
  Remoção: { icon: "delete" },
};

const REQUEST_STATUS_META: Record<DataRequestStatus, { badgeClass: string }> = {
  "Em análise": {
    badgeClass:
      "border-(--aw-amber-300) bg-(--aw-amber-100) text-(--aw-amber-800)",
  },
  Concluída: {
    badgeClass:
      "border-(--aw-emerald-300) bg-(--aw-emerald-100) text-(--aw-emerald-800)",
  },
  Recusada: {
    badgeClass:
      "border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)",
  },
  "Prazo vencido": {
    badgeClass:
      "border-(--aw-red-300) bg-(--aw-red-100) text-(--aw-red-800)",
  },
};

/** Hoje, fixo no mock — usado para derivar atraso de prazo (dueAt vs hoje). */
const TODAY = { day: 17, month: 6 };

/** Converte "DD/MM" num número de dia-do-ano simples (ignora ano, suficiente
 *  para o mock comparar prazos no mesmo ano). */
function parseDayMonth(s: string): { day: number; month: number } | null {
  const m = s.match(/^(\d{2})\/(\d{2})/);
  if (!m) return null;
  return { day: Number(m[1]), month: Number(m[2]) };
}

/** Dias entre hoje e o prazo. Negativo = em atraso. Aproximação por mês de
 *  30 dias, suficiente para a leitura de urgência do mock. */
function daysUntil(dueAt: string): number | null {
  const due = parseDayMonth(dueAt);
  if (!due) return null;
  return (due.month - TODAY.month) * 30 + (due.day - TODAY.day);
}

/** Status efetivo: uma solicitação "Em análise" cujo prazo já passou vira
 *  "Prazo vencido" — sem precisar de outra ação. */
function effectiveStatus(req: DataRequest): DataRequestStatus {
  if (req.status === "Em análise") {
    const d = daysUntil(req.dueAt);
    if (d !== null && d < 0) return "Prazo vencido";
  }
  return req.status;
}

/* ---------- exportações geradas ---------- */

type ExportStatus = "generating" | "ready" | "expired";

type ExportFile = {
  id: string;
  name: string;
  status: ExportStatus;
  generatedAt: string; // DD/MM
  size: string;
  expiresInDays: number | null; // null quando expirado/gerando
  /** Hash de integridade do arquivo (cadeia de custódia). */
  hash?: string;
  /** Quando status = "ready", até quando o link vale (24h após gerar). */
  availableUntil?: string;
  /** Progresso 0–100 quando status = "generating". */
  progress?: number;
  /** Estimativa de conclusão quando gerando. */
  eta?: string;
};

const EXPORT_FILES_SEED: ExportFile[] = [
  {
    id: "x-0",
    name: "Dados da organização · LGPD Art. 37",
    status: "generating",
    generatedAt: "17/06",
    size: "estimado 6,2 MB",
    expiresInDays: null,
    progress: 35,
    eta: "~4 min",
  },
  {
    id: "x-1",
    name: "Histórico de atividade · junho 2026",
    status: "ready",
    generatedAt: "12/06",
    size: "1,4 MB",
    expiresInDays: 5,
    hash: "a3f1b8e9c4d7f0a25b6c8e1d4f9a2b7c0e3d6f1a8b4c7e2d9f0a3b6c1e4d7f0a2",
    availableUntil: "13/06 09:12",
  },
  {
    id: "x-2",
    name: "Solicitações de dados · 2º trimestre",
    status: "ready",
    generatedAt: "02/06",
    size: "318 KB",
    expiresInDays: 2,
    hash: "7c2e9a1f4b8d0c6e3a7f1b5d9c2e8a0f4b6d1c7e3a9f2b5d8c0e6a4f1b9d3c7e2",
    availableUntil: "03/06 14:40",
  },
  {
    id: "x-3",
    name: "Histórico de atividade · maio 2026",
    status: "expired",
    generatedAt: "10/05",
    size: "1,1 MB",
    expiresInDays: null,
    hash: "1b9d3c7e2a5f8b0d4c6e1a3f7b9d2c5e8a0f4b6d1c7e3a9f2b5d8c0e6a4f1b9d3",
  },
];

/* ===================================================================== *
 * Página
 * ===================================================================== */

type TabValue = "historico" | "solicitacoes" | "exportacoes";

export default function OrgAuditoriaPage() {
  const [tab, setTab] = React.useState<TabValue>("historico");
  // Estado vivo: solicitações e exportações mudam conforme o encarregado age.
  const [requests, setRequests] =
    React.useState<DataRequest[]>(DATA_REQUESTS_SEED);
  const [exports, setExports] =
    React.useState<ExportFile[]>(EXPORT_FILES_SEED);

  // Pendências de prazo — alimentam o banner de urgência no topo.
  const openRequests = requests.filter(
    (r) => effectiveStatus(r) === "Em análise",
  );
  const overdueRequests = requests.filter(
    (r) => effectiveStatus(r) === "Prazo vencido",
  );
  const pendingCount = openRequests.length + overdueRequests.length;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Privacidade & auditoria"
        description="O que aconteceu na organização e os pedidos de dados dos membros."
      />

      {pendingCount > 0 && (
        <DsarPendingBanner
          openCount={openRequests.length}
          overdueCount={overdueRequests.length}
          onAttend={() => setTab("solicitacoes")}
        />
      )}

      <AwTabs
        variant="underline"
        aria-label="Privacidade e auditoria"
        value={tab}
        onChange={(v) => setTab(v as TabValue)}
        items={[
          { value: "historico", label: "Histórico" },
          {
            value: "solicitacoes",
            label: "Solicitações de dados",
            count: pendingCount > 0 ? pendingCount : undefined,
          },
          { value: "exportacoes", label: "Exportações" },
        ]}
      />

      <div className="mt-8">
        {tab === "historico" && <HistoricoTab />}
        {tab === "solicitacoes" && (
          <SolicitacoesTab requests={requests} onChange={setRequests} />
        )}
        {tab === "exportacoes" && (
          <ExportacoesTab exports={exports} onChange={setExports} />
        )}
      </div>
    </div>
  );
}

/* ---------- banner de pendência (prazo legal de 15 dias) ---------- */

function DsarPendingBanner({
  openCount,
  overdueCount,
  onAttend,
}: {
  openCount: number;
  overdueCount: number;
  onAttend: () => void;
}) {
  const total = openCount + overdueCount;
  const variant = overdueCount > 0 ? "danger" : "warning";
  return (
    <AwAlert
      variant={variant}
      icon="gavel"
      className="mb-6 items-center"
    >
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <strong className="aw-alert__title">
            {total} {total === 1 ? "solicitação de dados" : "solicitações de dados"}{" "}
            {total === 1 ? "aberta" : "abertas"}
            {overdueCount > 0 && (
              <>
                {" · "}
                <span className="text-(--accent-danger)">
                  {overdueCount} em atraso
                </span>
              </>
            )}
          </strong>
          <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
            Por lei, o titular tem direito a uma resposta em até 15 dias{" "}
            <span className="text-(--fg-tertiary)">(LGPD Art. 19).</span>
          </p>
        </div>
        <AwButton
          size="sm"
          variant="ghost"
          iconRight="arrow_forward"
          onClick={onAttend}
        >
          Atender
        </AwButton>
      </div>
    </AwAlert>
  );
}

/* ===================================================================== *
 * Tab — Histórico
 * ===================================================================== */

type DateGroup = { date: string; rows: OrgEvent[] };

/** Agrupa eventos por dia preservando a ordem (já vem em data desc) — mesma
 *  lógica de agrupamento do histórico de faturas (lá é por mês). */
function groupByDate(events: OrgEvent[]): DateGroup[] {
  const groups: DateGroup[] = [];
  for (const ev of events) {
    const last = groups[groups.length - 1];
    if (last && last.date === ev.date) last.rows.push(ev);
    else groups.push({ date: ev.date, rows: [ev] });
  }
  return groups;
}

/* ---------- filtro de período ---------- */

type PeriodPreset = "hoje" | "7d" | "30d" | "90d" | "todo" | "custom";

const PERIOD_LABELS: Record<PeriodPreset, string> = {
  hoje: "Hoje",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
  todo: "Todo o período",
  custom: "Personalizado",
};

/** Converte "dd/mm/aaaa" num número ordenável aaaammdd. */
function eventDateNumber(date: string): number {
  const m = date.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return 0;
  return Number(m[3]) * 10000 + Number(m[2]) * 100 + Number(m[1]);
}

/** Converte "aaaa-mm-dd" (input date) no mesmo número aaaammdd. */
function isoDateNumber(iso: string): number | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return Number(m[1]) * 10000 + Number(m[2]) * 100 + Number(m[3]);
}

/** "Hoje" no mock = 17/06/2026, em número aaaammdd. */
const TODAY_NUM = 20260617;

/** Janela [de, até] em número aaaammdd para cada preset. null = sem limite. */
function periodRange(
  preset: PeriodPreset,
  customFrom: string,
  customTo: string,
): { from: number | null; to: number | null } {
  if (preset === "todo") return { from: null, to: null };
  if (preset === "custom") {
    return {
      from: customFrom ? isoDateNumber(customFrom) : null,
      to: customTo ? isoDateNumber(customTo) : null,
    };
  }
  const days = preset === "hoje" ? 0 : preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  // Aproximação por mês de 30 dias — coerente com o resto do mock.
  const day = TODAY_NUM % 100;
  const month = Math.floor(TODAY_NUM / 100) % 100;
  const year = Math.floor(TODAY_NUM / 10000);
  const totalDays = year * 360 + (month - 1) * 30 + day - days;
  const fromYear = Math.floor(totalDays / 360);
  const fromMonth = Math.floor((totalDays % 360) / 30) + 1;
  const fromDay = (totalDays % 30) + 1;
  return {
    from: fromYear * 10000 + fromMonth * 100 + fromDay,
    to: TODAY_NUM,
  };
}

function HistoricoTab() {
  const [selectedTypes, setSelectedTypes] =
    React.useState<EventCategory[]>(ALL_CATEGORIES);
  const [selectedActors, setSelectedActors] =
    React.useState<string[]>(ALL_ACTOR_NAMES);
  const [selectedKinds, setSelectedKinds] =
    React.useState<ActorKind[]>(ALL_ACTOR_KINDS);
  const [query, setQuery] = React.useState("");
  const [period, setPeriod] = React.useState<PeriodPreset>("todo");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [detail, setDetail] = React.useState<OrgEvent | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const { from, to } = periodRange(period, customFrom, customTo);
    return ORG_EVENTS.filter((e) => {
      if (!selectedTypes.includes(e.type)) return false;
      if (!selectedActors.includes(e.actor)) return false;
      if (!selectedKinds.includes(e.actorKind)) return false;
      const n = eventDateNumber(e.date);
      if (from !== null && n < from) return false;
      if (to !== null && n > to) return false;
      if (
        q &&
        !`${e.actor} ${e.action} ${e.type} ${e.meta ?? ""}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [selectedTypes, selectedActors, selectedKinds, query, period, customFrom, customTo]);

  // Paginação: 50 por página (a escala real é dezenas de milhares de eventos).
  const PAGE_SIZE = 50;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // Voltar para a página 1 sempre que o filtro mudar o conjunto.
  React.useEffect(() => {
    setPage(1);
  }, [selectedTypes, selectedActors, selectedKinds, query, period, customFrom, customTo]);

  const clearAll = () => {
    setSelectedTypes(ALL_CATEGORIES);
    setSelectedActors(ALL_ACTOR_NAMES);
    setSelectedKinds(ALL_ACTOR_KINDS);
    setQuery("");
    setPeriod("todo");
    setCustomFrom("");
    setCustomTo("");
  };

  const hasFilters =
    selectedTypes.length !== ALL_CATEGORIES.length ||
    selectedActors.length !== ALL_ACTOR_NAMES.length ||
    selectedKinds.length !== ALL_ACTOR_KINDS.length ||
    period !== "todo" ||
    query.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h6 className="m-0 mb-1 text-(--fg-primary)">Histórico de atividade</h6>
        <p className="m-0 max-w-[520px] body-xs text-(--fg-secondary)">
          Cada ação de membros e administradores na organização — quem fez, o
          quê, quando.
        </p>
      </section>

      <GovernanceNote />

      <Toolbar
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        selectedActors={selectedActors}
        onActorsChange={setSelectedActors}
        selectedKinds={selectedKinds}
        onKindsChange={setSelectedKinds}
        query={query}
        onQueryChange={setQuery}
        period={period}
        onPeriodChange={setPeriod}
        customFrom={customFrom}
        onCustomFromChange={setCustomFrom}
        customTo={customTo}
        onCustomToChange={setCustomTo}
        onClearAll={clearAll}
        hasFilters={hasFilters}
      />

      {filtered.length === 0 ? (
        <AwCard className="p-0!">
          <div className="px-6 py-10">
            <AwEmpty>
              <AwEmptyHeader>
                <AwEmptyMedia variant="icon">
                  <Icon name="search_off" size={20} />
                </AwEmptyMedia>
                <AwEmptyTitle>Nenhum evento encontrado</AwEmptyTitle>
                <AwEmptyDescription>
                  Ajuste os filtros ou tente outro termo.
                </AwEmptyDescription>
              </AwEmptyHeader>
            </AwEmpty>
          </div>
        </AwCard>
      ) : (
        <>
          <div className="flex flex-col gap-8">
            {groupByDate(pageRows).map((group) => (
              <DateSection
                key={group.date}
                group={group}
                onOpen={setDetail}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          )}
        </>
      )}

      <EventDetailSheet event={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

/* ---------- nota de governança da área (papéis + retenção) ---------- */

function GovernanceNote() {
  return (
    <div className="flex items-start gap-3 rounded-md border border-(--border-subtle) bg-(--bg-muted) px-4 py-3">
      <span className="mt-0.5 text-(--fg-tertiary)">
        <Icon name="verified_user" size={16} />
      </span>
      <p className="m-0 body-xs text-(--fg-secondary)">
        Encarregados atendem solicitações e consultam o histórico; auditores
        externos têm acesso só de leitura. Toda ação aqui fica registrada por 5
        anos{" "}
        <span className="text-(--fg-tertiary)">(LGPD Art. 37).</span>
      </p>
    </div>
  );
}

/* ---------- paginação ---------- */

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-(--border-subtle) pt-4">
      <AwButton
        size="sm"
        variant="ghost"
        iconLeft="chevron_left"
        onClick={onPrev}
        disabled={page <= 1}
      >
        Anterior
      </AwButton>
      <span className="body-xs text-(--fg-tertiary)">
        Página {page} de {totalPages}
      </span>
      <AwButton
        size="sm"
        variant="ghost"
        iconRight="chevron_right"
        onClick={onNext}
        disabled={page >= totalPages}
      >
        Próxima
      </AwButton>
    </div>
  );
}

/* ---------- toolbar ---------- */

function Toolbar({
  selectedTypes,
  onTypesChange,
  selectedActors,
  onActorsChange,
  selectedKinds,
  onKindsChange,
  query,
  onQueryChange,
  period,
  onPeriodChange,
  customFrom,
  onCustomFromChange,
  customTo,
  onCustomToChange,
  onClearAll,
  hasFilters,
}: {
  selectedTypes: EventCategory[];
  onTypesChange: (v: EventCategory[]) => void;
  selectedActors: string[];
  onActorsChange: (v: string[]) => void;
  selectedKinds: ActorKind[];
  onKindsChange: (v: ActorKind[]) => void;
  query: string;
  onQueryChange: (v: string) => void;
  period: PeriodPreset;
  onPeriodChange: (v: PeriodPreset) => void;
  customFrom: string;
  onCustomFromChange: (v: string) => void;
  customTo: string;
  onCustomToChange: (v: string) => void;
  onClearAll: () => void;
  hasFilters: boolean;
}) {
  const toggleType = (t: EventCategory) => {
    onTypesChange(
      selectedTypes.includes(t)
        ? selectedTypes.filter((x) => x !== t)
        : [...selectedTypes, t],
    );
  };

  const toggleActor = (a: string) => {
    onActorsChange(
      selectedActors.includes(a)
        ? selectedActors.filter((x) => x !== a)
        : [...selectedActors, a],
    );
  };

  const toggleKind = (k: ActorKind) => {
    onKindsChange(
      selectedKinds.includes(k)
        ? selectedKinds.filter((x) => x !== k)
        : [...selectedKinds, k],
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-[240px] flex-1">
        <AwInput
          iconLeft="search"
          placeholder="Buscar pessoa, ação ou área…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
      <PeriodFilterMenu
        period={period}
        onPeriodChange={onPeriodChange}
        customFrom={customFrom}
        onCustomFromChange={onCustomFromChange}
        customTo={customTo}
        onCustomToChange={onCustomToChange}
      />
      <ActorFilterMenu
        people={HUMAN_PEOPLE}
        selected={selectedActors.filter((a) => HUMAN_ACTOR_NAMES.includes(a))}
        onToggle={toggleActor}
      />
      <OriginFilterMenu selected={selectedKinds} onToggle={toggleKind} />
      <TypeFilterMenu
        options={ALL_CATEGORIES}
        selected={selectedTypes}
        onToggle={toggleType}
      />
      {hasFilters && (
        <AwButton
          size="sm"
          variant="ghost"
          iconLeft="close"
          onClick={onClearAll}
        >
          Limpar
        </AwButton>
      )}
      <ExportCsvButton />
    </div>
  );
}

/* ---------- gatilho compartilhado dos filtros (mesma identidade visual) ---------- */

const FILTER_TRIGGER_CLASS =
  "inline-flex h-10 items-center gap-2 rounded-md border border-(--border-subtle) bg-(--bg-raised) px-3 body-xs font-medium text-(--fg-secondary) transition-colors duration-aw-fast hover:border-(--border-default) hover:text-(--fg-primary)";

/** Estilo de textarea reaproveitado dos formulários de settings (mesma
 *  identidade do <textarea> em CreateGroupModal). */
const TEXTAREA_CLASS =
  "w-full resize-y rounded-md border border-(--border-default) bg-(--bg-raised) px-3 py-2 body-sm leading-relaxed text-(--fg-primary) outline-hidden placeholder:text-(--fg-tertiary) focus:border-(--fg-primary)";

const DATE_INPUT_CLASS =
  "h-10 rounded-md border border-(--border-subtle) bg-(--bg-raised) px-2.5 body-xs text-(--fg-primary) outline-hidden focus:border-(--fg-primary)";

function PeriodFilterMenu({
  period,
  onPeriodChange,
  customFrom,
  onCustomFromChange,
  customTo,
  onCustomToChange,
}: {
  period: PeriodPreset;
  onPeriodChange: (v: PeriodPreset) => void;
  customFrom: string;
  onCustomFromChange: (v: string) => void;
  customTo: string;
  onCustomToChange: (v: string) => void;
}) {
  const presets: PeriodPreset[] = ["hoje", "7d", "30d", "90d", "todo"];
  return (
    <div className="flex items-center gap-2">
      <AwDropdownMenu
        align="start"
        aria-label="Filtrar por período"
        trigger={
          <button type="button" className={FILTER_TRIGGER_CLASS}>
            <Icon name="calendar_today" size={16} />
            <span>{PERIOD_LABELS[period]}</span>
            <Icon name="expand_more" size={16} />
          </button>
        }
        items={[
          ...presets.map((p) => ({
            id: p,
            label: PERIOD_LABELS[p],
            checked: period === p,
            onSelect: () => onPeriodChange(p),
          })),
          { id: "sep", separator: true as const },
          {
            id: "custom",
            label: (
              <span className="inline-flex items-center gap-2">
                <Icon name="date_range" size={15} />
                Personalizado
              </span>
            ),
            checked: period === "custom",
            onSelect: () => onPeriodChange("custom"),
          },
        ]}
      />
      {/* Os date inputs vivem fora do menu — focar/digitar dentro de um
       *  DropdownMenu.Item briga com a navegação por teclado do Radix. */}
      {period === "custom" && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            aria-label="Data inicial"
            value={customFrom}
            onChange={(e) => onCustomFromChange(e.target.value)}
            className={DATE_INPUT_CLASS}
          />
          <span className="body-xs text-(--fg-tertiary)">até</span>
          <input
            type="date"
            aria-label="Data final"
            value={customTo}
            onChange={(e) => onCustomToChange(e.target.value)}
            className={DATE_INPUT_CLASS}
          />
        </div>
      )}
    </div>
  );
}

function OriginFilterMenu({
  selected,
  onToggle,
}: {
  selected: ActorKind[];
  onToggle: (k: ActorKind) => void;
}) {
  const count = selected.length;
  return (
    <AwDropdownMenu
      align="start"
      aria-label="Filtrar por origem"
      trigger={
        <button type="button" className={FILTER_TRIGGER_CLASS}>
          <Icon name="alt_route" size={16} />
          <span>Origem{count !== ALL_ACTOR_KINDS.length ? ` · ${count}` : ""}</span>
          <Icon name="expand_more" size={16} />
        </button>
      }
      items={ALL_ACTOR_KINDS.map((k) => {
        const meta = ACTOR_KIND_META[k];
        return {
          id: k,
          label: (
            <span className="inline-flex items-center gap-2">
              <Icon name={meta.icon} size={15} animated={false} />
              <span>{meta.label}</span>
            </span>
          ),
          checked: selected.includes(k),
          closeOnSelect: false,
          onSelect: () => onToggle(k),
        };
      })}
    />
  );
}

function TypeFilterMenu({
  options,
  selected,
  onToggle,
}: {
  options: EventCategory[];
  selected: EventCategory[];
  onToggle: (t: EventCategory) => void;
}) {
  const count = selected.length;
  return (
    <AwDropdownMenu
      align="start"
      aria-label="Filtrar por área"
      trigger={
        <button type="button" className={FILTER_TRIGGER_CLASS}>
          <Icon name="sell" size={16} />
          <span>Área{count !== options.length ? ` · ${count}` : ""}</span>
          <Icon name="expand_more" size={16} />
        </button>
      }
      items={options.map((t) => {
        const meta = TYPE_META[t];
        return {
          id: t,
          label: (
            <span className="inline-flex items-center gap-2">
              <Icon name={meta.icon} size={15} className={meta.accentClass} animated={false} />
              <span>{t}</span>
            </span>
          ),
          checked: selected.includes(t),
          closeOnSelect: false,
          onSelect: () => onToggle(t),
        };
      })}
    />
  );
}

function ActorFilterMenu({
  people,
  selected,
  onToggle,
}: {
  people: Person[];
  selected: string[];
  onToggle: (a: string) => void;
}) {
  const count = selected.length;
  return (
    <AwDropdownMenu
      align="start"
      aria-label="Filtrar por pessoa"
      trigger={
        <button type="button" className={FILTER_TRIGGER_CLASS}>
          <Icon name="person" size={16} />
          <span>Pessoa{count !== people.length ? ` · ${count}` : ""}</span>
          <Icon name="expand_more" size={16} />
        </button>
      }
      items={people.map((p) => ({
        id: p.actor,
        label: (
          <span className="inline-flex items-center gap-2">
            <ActorAvatar
              size="sm"
              name={p.actor}
              avatar={p.avatar}
              kind={p.kind}
            />
            <span>{p.actor}</span>
          </span>
        ),
        checked: selected.includes(p.actor),
        closeOnSelect: false,
        onSelect: () => onToggle(p.actor),
      }))}
    />
  );
}

/* ---------- exportar CSV — aviso de dados pessoais + entrega por e-mail ---------- */

function ExportCsvButton() {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"confirm" | "done">("confirm");
  const [accepted, setAccepted] = React.useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <AwButton
        size="md"
        variant="ghost"
        iconLeft="download"
        onClick={() => {
          setMode("confirm");
          setAccepted(false);
          setOpen(true);
        }}
      >
        Exportar CSV
      </AwButton>

      <AwModal
        open={open}
        onClose={close}
        title={mode === "confirm" ? "Exportar histórico" : undefined}
        footer={
          mode === "confirm" ? (
            <>
              <AwButton size="sm" variant="ghost" onClick={close}>
                Cancelar
              </AwButton>
              <AwButton
                size="sm"
                variant="primary"
                iconLeft="outgoing_mail"
                disabled={!accepted}
                onClick={() => setMode("done")}
              >
                Gerar relatório
              </AwButton>
            </>
          ) : (
            <AwButton size="sm" variant="primary" onClick={close}>
              Fechar
            </AwButton>
          )
        }
      >
        {mode === "confirm" ? (
          <div className="flex flex-col gap-4">
            <p className="m-0 body-xs text-(--fg-secondary)">
              O relatório reúne todos os eventos do histórico em um CSV,
              respeitando os filtros aplicados.
            </p>

            <div className="flex items-start gap-3 rounded-md border border-(--border-subtle) bg-(--bg-muted) px-4 py-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-(--bg-raised) text-(--fg-primary)">
                <Icon name="shield_lock" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 body-xs font-medium text-(--fg-primary)">
                  Este arquivo contém dados pessoais
                </p>
                <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                  Nomes e ações dos membros aparecem no relatório. Ao exportar,
                  você assume a responsabilidade por:
                </p>
                <ul className="m-0 mt-2 flex list-none flex-col gap-1 p-0">
                  {[
                    "Guardar o arquivo com segurança",
                    "Compartilhar com controle",
                    "Descartar quando não for mais necessário",
                  ].map((item) => (
                    <li
                      key={item}
                      className="inline-flex items-center gap-2 body-xs text-(--fg-secondary)"
                    >
                      <Icon
                        name="check"
                        size={13}
                        className="text-(--fg-tertiary)"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-(--border-subtle) px-4 py-3">
              <span className="mt-0.5">
                <AwCheckbox
                  checked={accepted}
                  onChange={setAccepted}
                  label="Estou ciente e autorizo a exportação"
                />
              </span>
              <span className="body-xs text-(--fg-secondary)">
                Estou ciente de que este arquivo contém dados pessoais e
                autorizo a exportação. Esta ação fica registrada no histórico.
              </span>
            </label>

            <p className="m-0 inline-flex items-center gap-2 body-xs text-(--fg-secondary)">
              <Icon name="mail" size={14} className="text-(--fg-tertiary)" />
              <span>
                O CSV é gerado em segundo plano e enviado para{" "}
                <strong className="font-medium text-(--fg-primary)">
                  {EXPORT_RECIPIENT}
                </strong>
                {" "}— nada é baixado agora.
              </span>
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--accent-success) text-(--bg-canvas)">
              <Icon name="mark_email_read" size={32} />
            </span>
            <h6 className="m-0 text-(--fg-primary)">Relatório em geração</h6>
            <p className="m-0 max-w-[360px] body-xs text-(--fg-secondary)">
              Em alguns minutos você recebe o CSV em{" "}
              <strong className="font-medium text-(--fg-primary)">
                {EXPORT_RECIPIENT}
              </strong>
              . Pode fechar esta janela — o processo segue sozinho.
            </p>
          </div>
        )}
      </AwModal>
    </>
  );
}

/* ---------- seção por data + linha (mesmo padrão do histórico de faturas) ---------- */

function DateSection({
  group,
  onOpen,
}: {
  group: DateGroup;
  onOpen: (e: OrgEvent) => void;
}) {
  const [open, setOpen] = React.useState(true);
  return (
    <section>
      {/* Menu suspenso por data — seta indica que recolhe. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group mb-3 flex w-full items-baseline justify-between gap-4 border-b border-(--border-subtle) pb-2 text-left"
      >
        <div className="flex items-baseline gap-3">
          <h6 className="m-0 text-(--fg-primary)">{group.date}</h6>
          <span className="body-xs text-(--fg-tertiary)">
            {group.rows.length} {group.rows.length === 1 ? "evento" : "eventos"}
          </span>
        </div>
        <span
          className={`self-center text-(--fg-tertiary) transition-transform duration-aw-fast group-hover:text-(--fg-secondary) ${open ? "rotate-180" : ""}`}
        >
          <Icon name="expand_more" size={18} />
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-aw-fast ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <ul className="m-0 flex flex-col gap-1 p-0">
            {group.rows.map((event) => (
              <EventRow key={event.id} event={event} onOpen={onOpen} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function EventRow({
  event,
  onOpen,
}: {
  event: OrgEvent;
  onOpen: (e: OrgEvent) => void;
}) {
  const showKindBadge = event.actorKind !== "Pessoa";
  return (
    <li className="m-0 list-none">
      {/* Linha clicável — abre o detalhe completo do evento. */}
      <button
        type="button"
        onClick={() => onOpen(event)}
        aria-label={`Ver detalhe: ${event.actor} ${event.action}`}
        className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-start gap-4 rounded-md px-3 py-3 text-left transition-colors duration-aw-fast hover:bg-(--bg-muted) focus-visible:outline-2 focus-visible:outline-(--fg-primary)"
      >
        <span className="flex min-w-0 items-start gap-3">
          <ActorAvatar
            size="md"
            name={event.actor}
            avatar={event.actorAvatar}
            kind={event.actorKind}
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 body-sm text-(--fg-secondary)">
              <span>
                <span className="font-medium text-(--fg-primary)">
                  {event.actor}
                </span>{" "}
                {event.action}
              </span>
              {showKindBadge && <ActorKindBadge kind={event.actorKind} />}
            </span>
            {event.meta && (
              <p className="m-0 body-xs text-(--fg-tertiary)">{event.meta}</p>
            )}
          </span>
        </span>
        <div className="flex flex-col items-end">
          <span className="body-xs tabular-nums text-(--fg-secondary)">
            {event.time}
          </span>
          <span className="body-xs text-(--fg-tertiary)">{event.role}</span>
        </div>
      </button>
    </li>
  );
}

/* ---------- detalhe do evento (sheet lateral) ---------- */

function EventDetailSheet({
  event,
  onClose,
}: {
  event: OrgEvent | null;
  onClose: () => void;
}) {
  // Mantém o último evento durante a animação de saída do sheet.
  const [last, setLast] = React.useState<OrgEvent | null>(event);
  React.useEffect(() => {
    if (event) setLast(event);
  }, [event]);
  const e = event ?? last;
  if (!e) return null;

  return (
    <AwSheet
      open={Boolean(event)}
      onClose={onClose}
      title="Detalhe do evento"
      meta={
        <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-tertiary)">
          <Icon name="schedule" size={13} />
          {e.date} · {e.time}
        </span>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <ActorAvatar
            size="md"
            name={e.actor}
            avatar={e.actorAvatar}
            kind={e.actorKind}
          />
          <div className="min-w-0">
            <p className="m-0 body-sm font-medium text-(--fg-primary)">
              {e.actor}
            </p>
            <p className="m-0 body-xs text-(--fg-tertiary)">{e.role}</p>
          </div>
          <span className="ml-auto">
            <ActorKindBadge kind={e.actorKind} />
          </span>
        </div>

        <DetailRow label="Ação">
          <span className="text-(--fg-primary)">{e.action}</span>
        </DetailRow>
        <DetailRow label="Área">
          <span className="inline-flex items-center gap-1.5">
            <Icon
              name={TYPE_META[e.type].icon}
              size={14}
              className={TYPE_META[e.type].accentClass}
              animated={false}
            />
            {e.type}
          </span>
        </DetailRow>
        {e.meta && (
          <DetailRow label="Detalhes">
            <span className="text-(--fg-secondary)">{e.meta}</span>
          </DetailRow>
        )}
        <DetailRow label="Identificador">
          <code className="rounded-sm bg-(--bg-muted) px-1.5 py-0.5 font-mono text-(--fg-secondary)">
            {e.code}
          </code>
        </DetailRow>
      </div>
    </AwSheet>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-(--border-subtle) pb-4 last:border-b-0 last:pb-0">
      <span className="body-xs font-medium text-(--fg-tertiary)">{label}</span>
      <span className="body-sm">{children}</span>
    </div>
  );
}

/* ===================================================================== *
 * Tab — Solicitações de dados
 * ===================================================================== */

function SolicitacoesTab({
  requests,
  onChange,
}: {
  requests: DataRequest[];
  onChange: React.Dispatch<React.SetStateAction<DataRequest[]>>;
}) {
  const [registerOpen, setRegisterOpen] = React.useState(false);
  const [processing, setProcessing] = React.useState<DataRequest | null>(null);

  const handleRegister = (req: DataRequest) => {
    onChange((prev) => [req, ...prev]);
  };

  const handleResolve = (
    id: string,
    next: "Concluída" | "Recusada",
    evidence: string,
  ) => {
    onChange((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: next, evidence } : r,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="Solicitações de dados"
        description="Pedidos de acesso, correção ou eliminação feitos por titulares. Resposta em até 15 dias."
        action={
          <AwButton
            size="sm"
            variant="primary"
            iconLeft="add"
            onClick={() => setRegisterOpen(true)}
          >
            Registrar solicitação
          </AwButton>
        }
      />

      {requests.length === 0 ? (
        <AwCard className="p-0!">
          <div className="px-6 py-10">
            <AwEmpty>
              <AwEmptyHeader>
                <AwEmptyMedia variant="icon">
                  <Icon name="inbox" size={20} />
                </AwEmptyMedia>
                <AwEmptyTitle>Nenhuma solicitação por aqui</AwEmptyTitle>
                <AwEmptyDescription>
                  Quando um titular pedir acesso, correção ou eliminação dos
                  dados, registre aqui para entrar na fila com prazo.
                </AwEmptyDescription>
              </AwEmptyHeader>
            </AwEmpty>
          </div>
        </AwCard>
      ) : (
        <ul className="m-0 flex list-none flex-col border-t border-(--border-subtle)">
          {requests.map((req, i) => (
            <RequestRow
              key={req.id}
              req={req}
              isLast={i === requests.length - 1}
              onProcess={() => setProcessing(req)}
            />
          ))}
        </ul>
      )}

      <RegisterRequestSheet
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={handleRegister}
      />
      <ProcessRequestModal
        request={processing}
        onClose={() => setProcessing(null)}
        onResolve={handleResolve}
      />
    </div>
  );
}

/* ---------- linha de solicitação + leitura de prazo ---------- */

function RequestRow({
  req,
  isLast,
  onProcess,
}: {
  req: DataRequest;
  isLast: boolean;
  onProcess: () => void;
}) {
  const status = effectiveStatus(req);
  const open = status === "Em análise" || status === "Prazo vencido";
  return (
    <li
      className={
        "flex items-center gap-4 py-4" +
        (isLast ? "" : " border-b border-(--border-subtle)")
      }
    >
      <AwAvatar
        size="md"
        src={req.requesterAvatar}
        alt={req.requester}
        initials={getInitials(req.requester)}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="m-0 body-sm font-medium text-(--fg-primary)">
            {req.requester}
          </p>
          <RequestKindBadge kind={req.kind} />
          <span className="font-mono body-xs text-(--fg-tertiary)">
            {req.protocol}
          </span>
        </div>
        <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
          Aberta em {req.openedAt} · prazo até {req.dueAt}
        </p>
        {open && <DeadlineCountdown dueAt={req.dueAt} />}
      </div>
      <RequestStatusBadge status={status} />
      {open && (
        <AwButton
          size="sm"
          variant="secondary"
          iconRight="arrow_forward"
          onClick={onProcess}
        >
          Processar
        </AwButton>
      )}
    </li>
  );
}

/** Contagem de dias até o prazo, colorida por urgência. */
function DeadlineCountdown({ dueAt }: { dueAt: string }) {
  const d = daysUntil(dueAt);
  if (d === null) return null;

  let cls = "text-(--fg-tertiary)";
  let icon = "schedule";
  let text: string;
  if (d < 0) {
    cls = "text-(--accent-danger)";
    icon = "warning";
    const late = Math.abs(d);
    text = `${late} ${late === 1 ? "dia" : "dias"} em atraso`;
  } else if (d === 0) {
    cls = "text-(--aw-amber-700)";
    icon = "schedule";
    text = "Vence hoje";
  } else if (d <= 7) {
    cls = "text-(--aw-amber-700)";
    icon = "schedule";
    text = `${d} ${d === 1 ? "dia restante" : "dias restantes"} · urgente`;
  } else {
    text = `${d} dias restantes`;
  }

  return (
    <span className={`mt-1 inline-flex items-center gap-1.5 body-xs font-medium ${cls}`}>
      <Icon name={icon} size={13} />
      {text}
    </span>
  );
}

function RequestKindBadge({ kind }: { kind: DataRequestKind }) {
  const meta = REQUEST_KIND_META[kind];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-(--border-subtle) bg-(--bg-muted) px-2.5 py-0.5 body-xs font-medium text-(--fg-secondary)">
      <Icon name={meta.icon} size={13} />
      {kind}
    </span>
  );
}

function RequestStatusBadge({ status }: { status: DataRequestStatus }) {
  const meta = REQUEST_STATUS_META[status];
  return (
    <span
      className={
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 body-xs font-medium " +
        meta.badgeClass
      }
    >
      {status === "Prazo vencido" && <Icon name="warning" size={12} />}
      {status}
    </span>
  );
}

/* ---------- registrar nova solicitação (sheet com formulário) ---------- */

function emailIsValid(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

function RegisterRequestSheet({
  open,
  onClose,
  onRegister,
}: {
  open: boolean;
  onClose: () => void;
  onRegister: (req: DataRequest) => void;
}) {
  const toast = useToast();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [right, setRight] = React.useState<DataRightId>("acesso");
  const [channel, setChannel] = React.useState<RequestChannel>("E-mail");
  const [description, setDescription] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [createdProtocol, setCreatedProtocol] = React.useState<string | null>(
    null,
  );

  const reset = () => {
    setName("");
    setEmail("");
    setRight("acesso");
    setChannel("E-mail");
    setDescription("");
    setSubmitted(false);
    setCreatedProtocol(null);
  };

  const close = () => {
    onClose();
    // Limpa após a animação de saída para não piscar o estado.
    window.setTimeout(reset, 200);
  };

  const rightOption = DATA_RIGHTS.find((r) => r.id === right)!;
  const nameError = submitted && !name.trim() ? "Informe o nome do titular." : undefined;
  const emailError =
    submitted && !emailIsValid(email)
      ? "Informe um e-mail válido para enviar a confirmação."
      : undefined;

  const handleSubmit = () => {
    setSubmitted(true);
    if (!name.trim() || !emailIsValid(email)) return;

    const protocol = `SOL-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const kind: DataRequestKind =
      right === "eliminacao" || right === "revogacao" ? "Remoção" : "Exportação";
    onRegister({
      id: `dr-${Date.now()}`,
      protocol,
      requester: name.trim(),
      requesterEmail: email.trim(),
      kind,
      right,
      channel,
      status: "Em análise",
      openedAt: "17/06",
      dueAt: "02/07", // hoje + 15 dias
      description: description.trim() || undefined,
    });
    setCreatedProtocol(protocol);
    toast.push({
      title: "Solicitação registrada",
      description: `Protocolo ${protocol}`,
      variant: "success",
    });
  };

  return (
    <AwSheet
      open={open}
      onClose={close}
      title={createdProtocol ? "Solicitação registrada" : "Registrar solicitação"}
      meta={
        !createdProtocol && (
          <span className="body-xs text-(--fg-tertiary)">
            Registre um pedido que chegou por outro canal — ele entra na fila
            com prazo de 15 dias.
          </span>
        )
      }
      footer={
        createdProtocol ? (
          <AwButton size="sm" variant="primary" onClick={close}>
            Fechar
          </AwButton>
        ) : (
          <>
            <AwButton size="sm" variant="ghost" onClick={close}>
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              iconLeft="check"
              onClick={handleSubmit}
            >
              Registrar solicitação
            </AwButton>
          </>
        )
      }
    >
      {createdProtocol ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="aw-wizard-step flex h-14 w-14 items-center justify-center rounded-full bg-(--accent-success) text-(--bg-canvas)">
            <Icon name="check" size={32} weight={700} />
          </span>
          <h6 className="m-0 text-(--fg-primary)">Protocolo aberto</h6>
          <code className="rounded-sm bg-(--bg-muted) px-2 py-1 font-mono body-sm text-(--fg-primary)">
            {createdProtocol}
          </code>
          <p className="m-0 max-w-[360px] body-xs text-(--fg-secondary)">
            A solicitação entrou na fila com prazo de 15 dias e o titular
            recebeu a confirmação por e-mail. Próxima etapa: confirmar a
            identidade do titular antes de atender.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <AwField label="Nome do titular" htmlFor="req-name" error={nameError}>
            <AwInput
              id="req-name"
              placeholder="Quem fez o pedido"
              value={name}
              invalid={Boolean(nameError)}
              onChange={(e) => setName(e.target.value)}
            />
          </AwField>

          <AwField
            label="E-mail do titular"
            htmlFor="req-email"
            error={emailError}
            helper={
              emailError
                ? undefined
                : "Para onde enviamos a confirmação de recebimento."
            }
          >
            <AwInput
              id="req-email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              invalid={Boolean(emailError)}
              onChange={(e) => setEmail(e.target.value)}
            />
          </AwField>

          <AwField label="Tipo de direito" htmlFor="req-right">
            <RightSelect value={right} onChange={setRight} />
            <p className="mt-1.5 inline-flex items-center gap-1.5 body-xs text-(--fg-tertiary)">
              <Icon name="balance" size={13} />
              {rightOption.legal}
            </p>
          </AwField>

          {rightOption.destructive && (
            <AwAlert variant="warning" icon="delete_forever">
              <strong className="aw-alert__title">
                Eliminação é irreversível
              </strong>
              <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                Ao atender, os dados do titular são anonimizados e não podem ser
                recuperados. Confirme a identidade antes de prosseguir.
              </p>
            </AwAlert>
          )}

          <AwField label="Canal de origem" htmlFor="req-channel">
            <ChannelSelect value={channel} onChange={setChannel} />
          </AwField>

          <AwField
            label="Descrição"
            htmlFor="req-desc"
            helper="Opcional. O que o titular pediu, em poucas palavras."
          >
            <textarea
              id="req-desc"
              rows={3}
              placeholder="Detalhes do pedido…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${TEXTAREA_CLASS} min-h-[88px]`}
            />
          </AwField>
        </div>
      )}
    </AwSheet>
  );
}

/** Seletor do tipo de direito — dropdown sobre o gatilho AwSelect. */
function RightSelect({
  value,
  onChange,
}: {
  value: DataRightId;
  onChange: (v: DataRightId) => void;
}) {
  const current = DATA_RIGHTS.find((r) => r.id === value)!;
  return (
    <AwDropdownMenu
      align="start"
      aria-label="Tipo de direito"
      trigger={
        <button type="button" id="req-right" className={`${FILTER_TRIGGER_CLASS} w-full justify-between`}>
          <span className="inline-flex items-center gap-2">
            <Icon name="gavel" size={15} />
            {current.label}
          </span>
          <Icon name="expand_more" size={16} />
        </button>
      }
      items={DATA_RIGHTS.map((r) => ({
        id: r.id,
        label: (
          <span className="inline-flex items-center gap-2">
            <span>{r.label}</span>
            <span className="body-xs text-(--fg-tertiary)">{r.legal}</span>
          </span>
        ),
        checked: r.id === value,
        onSelect: () => onChange(r.id),
      }))}
    />
  );
}

function ChannelSelect({
  value,
  onChange,
}: {
  value: RequestChannel;
  onChange: (v: RequestChannel) => void;
}) {
  return (
    <AwDropdownMenu
      align="start"
      aria-label="Canal de origem"
      trigger={
        <button type="button" id="req-channel" className={`${FILTER_TRIGGER_CLASS} w-full justify-between`}>
          <span className="inline-flex items-center gap-2">
            <Icon name="forum" size={15} />
            {value}
          </span>
          <Icon name="expand_more" size={16} />
        </button>
      }
      items={REQUEST_CHANNELS.map((c) => ({
        id: c,
        label: c,
        checked: c === value,
        onSelect: () => onChange(c),
      }))}
    />
  );
}

/* ---------- processar/atender uma solicitação (modal com evidência) ---------- */

function ProcessRequestModal({
  request,
  onClose,
  onResolve,
}: {
  request: DataRequest | null;
  onClose: () => void;
  onResolve: (
    id: string,
    next: "Concluída" | "Recusada",
    evidence: string,
  ) => void;
}) {
  const toast = useToast();
  const [evidence, setEvidence] = React.useState("");
  const [last, setLast] = React.useState<DataRequest | null>(request);

  React.useEffect(() => {
    if (request) {
      setLast(request);
      setEvidence("");
    }
  }, [request]);

  const req = request ?? last;
  if (!req) return null;

  const rightOption = DATA_RIGHTS.find((r) => r.id === req.right);
  const isErasure = req.kind === "Remoção";
  const canConclude = evidence.trim().length > 0;

  const conclude = (next: "Concluída" | "Recusada") => {
    if (next === "Concluída" && !canConclude) return;
    onResolve(req.id, next, evidence.trim());
    toast.push({
      title:
        next === "Concluída"
          ? "Atendimento concluído"
          : "Solicitação recusada",
      description:
        next === "Concluída"
          ? `O titular recebeu a confirmação · ${req.protocol}`
          : req.protocol,
      variant: next === "Concluída" ? "success" : "info",
    });
    onClose();
  };

  return (
    <AwModal
      open={Boolean(request)}
      onClose={onClose}
      title="Processar solicitação"
      footer={
        <>
          <AwButton
            size="sm"
            variant="ghost"
            onClick={() => conclude("Recusada")}
          >
            Recusar
          </AwButton>
          <AwButton
            size="sm"
            variant="primary"
            iconLeft="check"
            disabled={!canConclude}
            onClick={() => conclude("Concluída")}
          >
            Concluir atendimento
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-md border border-(--border-subtle) bg-(--bg-muted) px-4 py-3">
          <AwAvatar
            size="md"
            src={req.requesterAvatar}
            alt={req.requester}
            initials={getInitials(req.requester)}
          />
          <div className="min-w-0">
            <p className="m-0 body-sm font-medium text-(--fg-primary)">
              {req.requester}
            </p>
            <p className="m-0 body-xs text-(--fg-tertiary)">
              {rightOption?.label ?? req.kind} · {req.channel} · aberta em{" "}
              {req.openedAt}
            </p>
          </div>
          <span className="ml-auto font-mono body-xs text-(--fg-tertiary)">
            {req.protocol}
          </span>
        </div>

        {isErasure && (
          <AwAlert variant="warning" icon="delete_forever">
            <strong className="aw-alert__title">Ação irreversível</strong>
            <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
              Ao concluir, os dados do titular são anonimizados e não podem ser
              recuperados. Confirme que a identidade foi verificada.
            </p>
          </AwAlert>
        )}

        <AwField
          label="Evidência do atendimento"
          htmlFor="proc-evidence"
          helper="O que foi entregue, por qual canal e quando. Fica registrado no histórico."
        >
          <textarea
            id="proc-evidence"
            rows={4}
            placeholder="Ex.: Cópia dos dados enviada por e-mail em 17/06, com confirmação de leitura."
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            className={`${TEXTAREA_CLASS} min-h-[104px]`}
          />
        </AwField>

        <p className="m-0 inline-flex items-center gap-2 body-xs text-(--fg-secondary)">
          <Icon name="mail" size={14} className="text-(--fg-tertiary)" />
          Ao concluir, o titular recebe a confirmação por e-mail e a ação fica
          registrada no histórico.
        </p>
      </div>
    </AwModal>
  );
}

/* ===================================================================== *
 * Tab — Exportações
 * ===================================================================== */

function ExportacoesTab({
  exports,
  onChange,
}: {
  exports: ExportFile[];
  onChange: React.Dispatch<React.SetStateAction<ExportFile[]>>;
}) {
  const [orgExportOpen, setOrgExportOpen] = React.useState(false);

  const cancelGenerating = (id: string) => {
    onChange((prev) => prev.filter((f) => f.id !== id));
  };

  const handleOrgExport = (file: ExportFile) => {
    onChange((prev) => [file, ...prev]);
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="Exportações"
        description="Arquivos gerados a partir desta página. Os links expiram por segurança."
        action={
          <AwButton
            size="sm"
            variant="primary"
            iconLeft="download"
            onClick={() => setOrgExportOpen(true)}
          >
            Exportar dados da organização
          </AwButton>
        }
      />

      {exports.length === 0 ? (
        <AwCard className="p-0!">
          <div className="px-6 py-10">
            <AwEmpty>
              <AwEmptyHeader>
                <AwEmptyMedia variant="icon">
                  <Icon name="folder_open" size={20} />
                </AwEmptyMedia>
                <AwEmptyTitle>Nenhuma exportação ainda</AwEmptyTitle>
                <AwEmptyDescription>
                  Quando você exportar o histórico, o arquivo gerado aparece
                  aqui com o link para baixar.
                </AwEmptyDescription>
              </AwEmptyHeader>
            </AwEmpty>
          </div>
        </AwCard>
      ) : (
        <AwCard className="p-0!">
          <ul className="m-0 flex list-none flex-col">
            {exports.map((file, i) => (
              <ExportRow
                key={file.id}
                file={file}
                isLast={i === exports.length - 1}
                onCancel={() => cancelGenerating(file.id)}
              />
            ))}
          </ul>
        </AwCard>
      )}

      <p className="m-0 inline-flex items-center gap-2 px-1 body-xs text-(--fg-tertiary)">
        <Icon name="info" size={14} />
        Os arquivos são enviados por e-mail para {EXPORT_RECIPIENT} no momento
        em que são gerados.
      </p>

      <OrgExportSheet
        open={orgExportOpen}
        onClose={() => setOrgExportOpen(false)}
        onExport={handleOrgExport}
      />
    </div>
  );
}

/* ---------- linha de exportação (gerando / pronta / expirada) ---------- */

function ExportRow({
  file,
  isLast,
  onCancel,
}: {
  file: ExportFile;
  isLast: boolean;
  onCancel: () => void;
}) {
  const rowClass =
    "flex items-center gap-4 px-6 py-4" +
    (isLast ? "" : " border-b border-(--border-subtle)");

  if (file.status === "generating") {
    return (
      <li className={rowClass}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--aw-amber-100) text-(--aw-amber-700)">
          <Icon name="hourglass_top" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="m-0 truncate body-sm font-medium text-(--fg-primary)">
              {file.name}
            </p>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-(--aw-amber-300) bg-(--aw-amber-100) px-2 py-0.5 body-xs font-medium text-(--aw-amber-800)">
              <AwStatusDot variant="attention" size="xs" pulse />
              Gerando
            </span>
          </div>
          <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
            Estimativa {file.eta} · {file.size}
          </p>
        </div>
        {/* Progresso compacto à direita: a barra fica inline com a ação, em
            vez de empilhar e esticar a altura da linha. */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden w-28 sm:block">
            <AwProgress value={file.progress ?? 0} variant="warning" />
          </div>
          <span className="w-9 shrink-0 text-right tabular-nums body-xs text-(--fg-secondary)">
            {file.progress ?? 0}%
          </span>
          <AwButton size="sm" variant="ghost" onClick={onCancel}>
            Cancelar
          </AwButton>
        </div>
      </li>
    );
  }

  const expired = file.status === "expired";
  return (
    <li className={rowClass}>
      <AwFileIcon type="spreadsheet" size="md" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate body-sm font-medium text-(--fg-primary)">
          {file.name}
        </p>
        <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
          Gerado em {file.generatedAt} · {file.size}
        </p>
        {file.hash && <HashLine hash={file.hash} />}
      </div>
      {expired ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 body-xs text-(--fg-tertiary)">
          <Icon name="link_off" size={14} />
          Link expirado
        </span>
      ) : (
        <div className="flex shrink-0 items-center gap-3">
          <span className="inline-flex flex-col items-end gap-0.5 text-right">
            <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-secondary)">
              <Icon
                name="schedule"
                size={14}
                className="text-(--fg-tertiary)"
              />
              Link expira em {file.expiresInDays}{" "}
              {file.expiresInDays === 1 ? "dia" : "dias"}
            </span>
            {file.availableUntil && (
              <span className="body-xs text-(--fg-tertiary)">
                Disponível até {file.availableUntil}
              </span>
            )}
          </span>
          <AwButton size="sm" variant="ghost" iconLeft="download">
            Baixar
          </AwButton>
        </div>
      )}
    </li>
  );
}

/** Hash de integridade (SHA-256) com botão de copiar — cadeia de custódia. */
function HashLine({ hash }: { hash: string }) {
  const toast = useToast();
  const truncated = `${hash.slice(0, 12)}…`;

  const copy = () => {
    void navigator.clipboard?.writeText(hash);
    toast.push({ title: "Hash copiado", variant: "success" });
  };

  return (
    <span className="mt-1 inline-flex items-center gap-1.5 body-xs text-(--fg-tertiary)">
      <Icon name="fingerprint" size={13} />
      <span>SHA-256</span>
      <code className="font-mono text-(--fg-secondary)">{truncated}</code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copiar hash SHA-256"
        className="inline-flex items-center gap-1 rounded-sm px-1 py-0.5 text-(--fg-tertiary) transition-colors duration-aw-fast hover:bg-(--bg-muted) hover:text-(--fg-primary)"
      >
        <Icon name="content_copy" size={13} />
        Copiar
      </button>
    </span>
  );
}

/* ---------- exportar dados da organização (LGPD Art. 37) — sheet multi-etapa ---------- */

type OrgExportCategory = {
  id: string;
  label: string;
  hint: string;
  sensitive?: boolean;
};

const ORG_EXPORT_CATEGORIES: OrgExportCategory[] = [
  {
    id: "membros",
    label: "Membros e funções",
    hint: "Quem tem acesso e com qual papel.",
  },
  {
    id: "agentes",
    label: "Agentes e configurações",
    hint: "Objetivos, checkpoints e publicações.",
  },
  {
    id: "conversas",
    label: "Conversas e atendimentos",
    hint: "Histórico de interações com titulares.",
    sensitive: true,
  },
  {
    id: "integracoes",
    label: "Integrações conectadas",
    hint: "Canais e serviços vinculados.",
  },
  {
    id: "auditoria",
    label: "Histórico de auditoria",
    hint: "Eventos registrados da organização.",
  },
  {
    id: "faturamento",
    label: "Faturamento e uso",
    hint: "Planos, faturas e consumo.",
  },
];

type OrgExportFormat = "json" | "csv" | "ambos";

function OrgExportSheet({
  open,
  onClose,
  onExport,
}: {
  open: boolean;
  onClose: () => void;
  onExport: (file: ExportFile) => void;
}) {
  const toast = useToast();
  const [justification, setJustification] = React.useState("");
  const [requester, setRequester] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [sensitiveReason, setSensitiveReason] = React.useState("");
  const [format, setFormat] = React.useState<OrgExportFormat>("json");
  const [accepted, setAccepted] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [createdId, setCreatedId] = React.useState<string | null>(null);

  const reset = () => {
    setJustification("");
    setRequester("");
    setSelected([]);
    setSensitiveReason("");
    setFormat("json");
    setAccepted(false);
    setSubmitted(false);
    setCreatedId(null);
  };

  const close = () => {
    onClose();
    window.setTimeout(reset, 200);
  };

  const toggleCategory = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const hasSensitive = selected.some(
    (id) => ORG_EXPORT_CATEGORIES.find((c) => c.id === id)?.sensitive,
  );

  const justificationOk = justification.trim().length >= 20;
  const scopeOk = selected.length > 0;
  const sensitiveOk = !hasSensitive || sensitiveReason.trim().length >= 20;
  const canSubmit = justificationOk && scopeOk && sensitiveOk && accepted;

  const handleSubmit = () => {
    setSubmitted(true);
    if (!canSubmit) return;
    const id = `EXP-${String(Math.floor(Math.random() * 90000) + 10000)}`;
    onExport({
      id: `x-${Date.now()}`,
      name: `Dados da organização · ${id}`,
      status: "generating",
      generatedAt: "17/06",
      size: "estimado…",
      expiresInDays: null,
      progress: 5,
      eta: "~8 min",
    });
    setCreatedId(id);
    toast.push({
      title: "Exportação registrada",
      description: id,
      variant: "success",
    });
  };

  return (
    <AwSheet
      open={open}
      onClose={close}
      size="default"
      title={
        createdId
          ? "Exportação registrada"
          : "Exportar dados da organização"
      }
      meta={
        !createdId && (
          <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-tertiary)">
            <Icon name="balance" size={13} />
            A justificativa fica registrada por 5 anos (LGPD Art. 37)
          </span>
        )
      }
      footer={
        createdId ? (
          <AwButton size="sm" variant="primary" onClick={close}>
            Fechar
          </AwButton>
        ) : (
          <>
            <AwButton size="sm" variant="ghost" onClick={close}>
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              iconLeft="lock"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Gerar exportação
            </AwButton>
          </>
        )
      }
    >
      {createdId ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--accent-success) text-(--bg-canvas)">
            <Icon name="lock" size={28} />
          </span>
          <h6 className="m-0 text-(--fg-primary)">Solicitação registrada</h6>
          <code className="rounded-sm bg-(--bg-muted) px-2 py-1 font-mono body-sm text-(--fg-primary)">
            {createdId}
          </code>
          <p className="m-0 max-w-[380px] body-xs text-(--fg-secondary)">
            A exportação roda em segundo plano com criptografia e hash de
            integridade. Você recebe um aviso quando o arquivo estiver pronto —
            o link fica disponível por 24 horas.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          {/* Passo 1 — justificativa + requisitante */}
          <ExportStep
            number={1}
            title="Por que esta exportação?"
            hint="A AwSales é operadora dos dados. A justificativa fica registrada por 5 anos."
          >
            <AwField
              label="Justificativa"
              htmlFor="exp-just"
              error={
                submitted && !justificationOk
                  ? "Escreva ao menos 20 caracteres."
                  : undefined
              }
              helper={
                submitted && !justificationOk
                  ? undefined
                  : `${justification.trim().length}/20 caracteres mínimos`
              }
            >
              <textarea
                id="exp-just"
                rows={3}
                placeholder="Ex.: Atender pedido de auditoria do cliente referente ao contrato vigente."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className={`${TEXTAREA_CLASS} min-h-[88px]`}
              />
            </AwField>
            <AwField
              label="Requisitante"
              htmlFor="exp-req"
              helper="Quem pediu a exportação (pessoa ou área externa)."
            >
              <AwInput
                id="exp-req"
                placeholder="Ex.: Auditoria — Fyntra"
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
              />
            </AwField>
          </ExportStep>

          {/* Passo 2 — escopo */}
          <ExportStep
            number={2}
            title="O que entra na exportação?"
            hint="Selecione as categorias de dados a incluir."
          >
            <div className="flex flex-col gap-2">
              {ORG_EXPORT_CATEGORIES.map((cat) => {
                const checked = selected.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className={
                      "flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 transition-colors duration-aw-fast " +
                      (checked
                        ? "border-(--border-default) bg-(--bg-muted)"
                        : "border-(--border-subtle) hover:border-(--border-default)")
                    }
                  >
                    <span className="mt-0.5">
                      <AwCheckbox
                        checked={checked}
                        onChange={() => toggleCategory(cat.id)}
                        label={cat.label}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="body-sm font-medium text-(--fg-primary)">
                          {cat.label}
                        </span>
                        {cat.sensitive && (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-(--aw-amber-300) bg-(--aw-amber-100) px-2 py-0.5 body-xs font-medium text-(--aw-amber-800)">
                            <Icon name="warning" size={11} />
                            Atenção
                          </span>
                        )}
                      </span>
                      <span className="m-0 mt-0.5 block body-xs text-(--fg-tertiary)">
                        {cat.hint}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            {submitted && !scopeOk && (
              <p className="m-0 mt-2 inline-flex items-center gap-1.5 body-xs text-(--accent-danger)">
                <Icon name="error" size={13} />
                Selecione ao menos uma categoria.
              </p>
            )}

            {hasSensitive && (
              <div className="mt-3">
                <AwAlert variant="warning" icon="shield_lock">
                  <strong className="aw-alert__title">
                    Você incluiu dados sensíveis
                  </strong>
                  <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                    Conversas com titulares pedem uma justificativa específica.
                  </p>
                </AwAlert>
                <div className="mt-3">
                  <AwField
                    label="Por que incluir dados sensíveis?"
                    htmlFor="exp-sensitive"
                    error={
                      submitted && !sensitiveOk
                        ? "Escreva ao menos 20 caracteres."
                        : undefined
                    }
                  >
                    <textarea
                      id="exp-sensitive"
                      rows={2}
                      placeholder="Justifique a inclusão das conversas."
                      value={sensitiveReason}
                      onChange={(e) => setSensitiveReason(e.target.value)}
                      className={`${TEXTAREA_CLASS} min-h-[64px]`}
                    />
                  </AwField>
                </div>
              </div>
            )}
          </ExportStep>

          {/* Passo 3 — formato */}
          <ExportStep number={3} title="Em qual formato?">
            <div className="flex flex-col gap-2">
              {(
                [
                  {
                    id: "json" as const,
                    icon: "data_object",
                    label: "JSON estruturado",
                    hint: "Um arquivo único, pronto para processar.",
                  },
                  {
                    id: "csv" as const,
                    icon: "table_chart",
                    label: "CSV por categoria",
                    hint: "Uma planilha por tipo de dado.",
                  },
                  {
                    id: "ambos" as const,
                    icon: "folder_zip",
                    label: "Ambos",
                    hint: "JSON e CSV no mesmo pacote.",
                  },
                ]
              ).map((opt) => {
                const active = format === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={
                      "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors duration-aw-fast " +
                      (active
                        ? "border-(--border-default) bg-(--bg-muted)"
                        : "border-(--border-subtle) hover:border-(--border-default)")
                    }
                  >
                    <input
                      type="radio"
                      name="exp-format"
                      checked={active}
                      onChange={() => setFormat(opt.id)}
                      className="sr-only"
                    />
                    {/* Ícone distinto por formato — substitui o radio como
                        marcador visual; o estado ativo vai no tile + check. */}
                    <span
                      aria-hidden="true"
                      className={
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors duration-aw-fast " +
                        (active
                          ? "bg-(--bg-inverse) text-(--fg-on-inverse)"
                          : "bg-(--bg-muted) text-(--fg-secondary)")
                      }
                    >
                      <Icon name={opt.icon} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block body-sm font-medium text-(--fg-primary)">
                        {opt.label}
                      </span>
                      <span className="block body-xs text-(--fg-tertiary)">
                        {opt.hint}
                      </span>
                    </span>
                    {active && (
                      <Icon
                        name="check_circle"
                        size={18}
                        fill={1}
                        className="shrink-0 text-(--fg-primary)"
                      />
                    )}
                  </label>
                );
              })}
            </div>
          </ExportStep>

          {/* Passo 4 — aceite legal */}
          <ExportStep number={4} title="Confirmação">
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-(--border-subtle) px-4 py-3">
              <span className="mt-0.5">
                <AwCheckbox
                  checked={accepted}
                  onChange={setAccepted}
                  label="Confirmo a base legal e assumo a cadeia de custódia"
                />
              </span>
              <span className="body-xs text-(--fg-secondary)">
                Confirmo que esta exportação atende a uma base legal válida e
                assumo a responsabilidade por guardar e tratar os dados com
                segurança.
              </span>
            </label>
          </ExportStep>
        </div>
      )}
    </AwSheet>
  );
}

function ExportStep({
  number,
  title,
  hint,
  children,
}: {
  number: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--bg-muted) body-xs font-medium text-(--fg-secondary)">
          {number}
        </span>
        <div className="min-w-0">
          <h6 className="m-0 text-(--fg-primary)">{title}</h6>
          {hint && (
            <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">{hint}</p>
          )}
        </div>
      </div>
      <div className="pl-9">{children}</div>
    </section>
  );
}
