"use client";

import * as React from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwTabs } from "@/components/ui/AwTabs";
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
    icon: "smart_toy",
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

function TypeBadge({ type }: { type: EventCategory }) {
  const meta = TYPE_META[type];
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 body-xs font-medium " +
        meta.badgeClass
      }
    >
      <Icon name={meta.icon} size={13} />
      {type}
    </span>
  );
}

/* ---------- eventos do histórico ---------- */

type OrgEvent = {
  id: string;
  date: string; // dd/mm/aaaa
  time: string; // HH:mm
  actor: string;
  actorAvatar?: string;
  role: string;
  type: EventCategory;
  action: string;
  meta?: string;
};

const ORG_EVENTS: OrgEvent[] = [
  {
    id: "e-1",
    date: "14/06/2026",
    time: "16:48",
    actor: "Rafael Lima",
    actorAvatar: "/assets/ui-faces/male-3.jpg",
    role: "Administrador",
    type: "Membros",
    action: "convidou Mariana Castro",
    meta: "Convite enviado para mariana.castro@fyntra.com.br",
  },
  {
    id: "e-2",
    date: "14/06/2026",
    time: "15:20",
    actor: "Rafael Lima",
    actorAvatar: "/assets/ui-faces/male-3.jpg",
    role: "Administrador",
    type: "Funções",
    action: "alterou a função de Carlos Lima para Editor",
    meta: "Antes: Visualizador",
  },
  {
    id: "e-3",
    date: "14/06/2026",
    time: "11:05",
    actor: "Bruno Costa",
    actorAvatar: "/assets/ui-faces/male-1.jpg",
    role: "Administrador",
    type: "Integrações",
    action: "conectou a integração do WhatsApp",
    meta: "Número +55 11 4002-8922",
  },
  {
    id: "e-4",
    date: "13/06/2026",
    time: "18:32",
    actor: "Felipe Rezende",
    actorAvatar: "/assets/ui-faces/male-2.jpg",
    role: "Editor",
    type: "Agentes",
    action: "publicou o agente Atlas",
    meta: "Versão 4 · disponível para a equipe",
  },
  {
    id: "e-5",
    date: "13/06/2026",
    time: "14:10",
    actor: "Bruno Costa",
    actorAvatar: "/assets/ui-faces/male-1.jpg",
    role: "Administrador",
    type: "Segurança",
    action: "ativou a verificação em duas etapas para a organização",
    meta: "Obrigatória para todos os membros a partir de hoje",
  },
  {
    id: "e-6",
    date: "12/06/2026",
    time: "09:54",
    actor: "Maria Resende",
    actorAvatar: "/assets/ui-faces/female-2.jpg",
    role: "Administrador",
    type: "Dados",
    action: "exportou o histórico de atividade",
    meta: "Arquivo enviado por e-mail para greg@awsales.io",
  },
  {
    id: "e-7",
    date: "11/06/2026",
    time: "17:21",
    actor: "Rafael Lima",
    actorAvatar: "/assets/ui-faces/male-3.jpg",
    role: "Administrador",
    type: "Membros",
    action: "removeu o acesso de João Pereira",
    meta: "Saída registrada · sessões encerradas",
  },
  {
    id: "e-8",
    date: "11/06/2026",
    time: "10:08",
    actor: "Ana Azevedo",
    actorAvatar: "/assets/ui-faces/female-1.jpg",
    role: "Editor",
    type: "Agentes",
    action: "pausou o agente Nova",
    meta: "Motivo: ajuste de base de conhecimento",
  },
  {
    id: "e-9",
    date: "10/06/2026",
    time: "13:47",
    actor: "Bruno Costa",
    actorAvatar: "/assets/ui-faces/male-1.jpg",
    role: "Administrador",
    type: "Integrações",
    action: "desconectou a integração do Google Calendar",
  },
  {
    id: "e-10",
    date: "09/06/2026",
    time: "08:35",
    actor: "Carlos Lima",
    actorAvatar: "/assets/ui-faces/male-7.jpg",
    role: "Editor",
    type: "Segurança",
    action: "entrou de um novo dispositivo",
    meta: "Windows · Curitiba, BR",
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  return (first + last).toUpperCase();
}

type Person = {
  actor: string;
  avatar?: string;
};

/** Pessoas únicas que aparecem como autores no histórico — alimentam o
 *  filtro de executor com gente de verdade, não categorias abstratas. */
function buildPeople(events: OrgEvent[]): Person[] {
  const seen = new Map<string, Person>();
  for (const e of events) {
    if (!seen.has(e.actor)) {
      seen.set(e.actor, { actor: e.actor, avatar: e.actorAvatar });
    }
  }
  return Array.from(seen.values()).sort((a, b) =>
    a.actor.localeCompare(b.actor, "pt-BR"),
  );
}

const ALL_PEOPLE: Person[] = buildPeople(ORG_EVENTS);
const ALL_ACTOR_NAMES: string[] = ALL_PEOPLE.map((p) => p.actor);

/* ---------- solicitações de dados ---------- */

type DataRequestKind = "Exportação" | "Remoção";
type DataRequestStatus = "Em análise" | "Concluída" | "Recusada";

type DataRequest = {
  id: string;
  requester: string;
  requesterAvatar?: string;
  kind: DataRequestKind;
  status: DataRequestStatus;
  openedAt: string; // DD/MM
  dueAt: string; // DD/MM
};

const DATA_REQUESTS: DataRequest[] = [
  {
    id: "dr-1",
    requester: "Mariana Castro",
    requesterAvatar: "/assets/ui-faces/female-3.jpg",
    kind: "Exportação",
    status: "Em análise",
    openedAt: "12/06",
    dueAt: "27/06",
  },
  {
    id: "dr-2",
    requester: "João Pereira",
    requesterAvatar: "/assets/ui-faces/male-9.jpg",
    kind: "Remoção",
    status: "Concluída",
    openedAt: "28/05",
    dueAt: "12/06",
  },
  {
    id: "dr-3",
    requester: "Felipe Rezende",
    requesterAvatar: "/assets/ui-faces/male-2.jpg",
    kind: "Exportação",
    status: "Recusada",
    openedAt: "20/05",
    dueAt: "04/06",
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
};

/* ---------- exportações geradas ---------- */

type ExportFile = {
  id: string;
  name: string;
  generatedAt: string; // DD/MM
  size: string;
  expiresInDays: number | null; // null = expirado
};

const EXPORT_FILES: ExportFile[] = [
  {
    id: "x-1",
    name: "Histórico de atividade · junho 2026",
    generatedAt: "12/06",
    size: "1,4 MB",
    expiresInDays: 5,
  },
  {
    id: "x-2",
    name: "Solicitações de dados · 2º trimestre",
    generatedAt: "02/06",
    size: "318 KB",
    expiresInDays: 2,
  },
  {
    id: "x-3",
    name: "Histórico de atividade · maio 2026",
    generatedAt: "10/05",
    size: "1,1 MB",
    expiresInDays: null,
  },
];

/* ===================================================================== *
 * Página
 * ===================================================================== */

type TabValue = "historico" | "solicitacoes" | "exportacoes";

export default function OrgAuditoriaPage() {
  const [tab, setTab] = React.useState<TabValue>("historico");

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Privacidade & auditoria"
        description="Tudo o que aconteceu na organização e os pedidos de dados dos membros — em um só lugar."
      />

      <AwTabs
        variant="underline"
        aria-label="Privacidade e auditoria"
        value={tab}
        onChange={(v) => setTab(v as TabValue)}
        items={[
          { value: "historico", label: "Histórico" },
          { value: "solicitacoes", label: "Solicitações de dados" },
          { value: "exportacoes", label: "Exportações" },
        ]}
      />

      <div className="mt-8">
        {tab === "historico" && <HistoricoTab />}
        {tab === "solicitacoes" && <SolicitacoesTab />}
        {tab === "exportacoes" && <ExportacoesTab />}
      </div>
    </div>
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

function HistoricoTab() {
  const [selectedTypes, setSelectedTypes] =
    React.useState<EventCategory[]>(ALL_CATEGORIES);
  const [selectedActors, setSelectedActors] =
    React.useState<string[]>(ALL_ACTOR_NAMES);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return ORG_EVENTS.filter((e) => {
      if (!selectedTypes.includes(e.type)) return false;
      if (!selectedActors.includes(e.actor)) return false;
      if (
        q &&
        !`${e.actor} ${e.action} ${e.type} ${e.meta ?? ""}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [selectedTypes, selectedActors, query]);

  const clearAll = () => {
    setSelectedTypes(ALL_CATEGORIES);
    setSelectedActors(ALL_ACTOR_NAMES);
    setQuery("");
  };

  const hasFilters =
    selectedTypes.length !== ALL_CATEGORIES.length ||
    selectedActors.length !== ALL_ACTOR_NAMES.length ||
    query.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h6 className="m-0 mb-1 text-(--fg-primary)">Histórico de atividade</h6>
        <p className="m-0 max-w-[520px] body-xs text-(--fg-secondary)">
          Cada ação feita por membros e administradores na organização — quem
          fez, o quê e quando.
        </p>
      </section>

      <Toolbar
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        selectedActors={selectedActors}
        onActorsChange={setSelectedActors}
        query={query}
        onQueryChange={setQuery}
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
        <div className="flex flex-col gap-8">
          {groupByDate(filtered).map((group) => (
            <DateSection key={group.date} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- toolbar ---------- */

function Toolbar({
  selectedTypes,
  onTypesChange,
  selectedActors,
  onActorsChange,
  query,
  onQueryChange,
  onClearAll,
  hasFilters,
}: {
  selectedTypes: EventCategory[];
  onTypesChange: (v: EventCategory[]) => void;
  selectedActors: string[];
  onActorsChange: (v: string[]) => void;
  query: string;
  onQueryChange: (v: string) => void;
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
      <ActorFilterMenu
        people={ALL_PEOPLE}
        selected={selectedActors}
        onToggle={toggleActor}
      />
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
      trigger={
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-(--border-subtle) bg-(--bg-raised) px-3 body-xs font-medium text-(--fg-secondary) transition-colors duration-aw-fast hover:border-(--border-default) hover:text-(--fg-primary)"
        >
          <Icon name="sell" size={16} />
          <span>Área{count > 0 ? ` · ${count}` : ""}</span>
          <Icon name="expand_more" size={16} />
        </button>
      }
      items={options.map((t) => {
        const meta = TYPE_META[t];
        return {
          id: t,
          label: (
            <span className="inline-flex items-center gap-2">
              <Icon name={meta.icon} size={15} className={meta.accentClass} />
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
      trigger={
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-(--border-subtle) bg-(--bg-raised) px-3 body-xs font-medium text-(--fg-secondary) transition-colors duration-aw-fast hover:border-(--border-default) hover:text-(--fg-primary)"
        >
          <Icon name="person" size={16} />
          <span>Pessoa{count > 0 ? ` · ${count}` : ""}</span>
          <Icon name="expand_more" size={16} />
        </button>
      }
      items={people.map((p) => ({
        id: p.actor,
        label: (
          <span className="inline-flex items-center gap-2">
            <AwAvatar
              size="sm"
              src={p.avatar}
              alt={p.actor}
              initials={getInitials(p.actor)}
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

  const close = () => setOpen(false);

  return (
    <>
      <AwButton
        size="md"
        variant="ghost"
        iconLeft="download"
        onClick={() => {
          setMode("confirm");
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
                  você se responsabiliza por guardar e tratar esses dados com
                  cuidado, conforme a política de privacidade da sua
                  organização.
                </p>
              </div>
            </div>

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
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--bg-muted) text-(--accent-success)">
              <Icon name="mark_email_read" size={26} />
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

function DateSection({ group }: { group: DateGroup }) {
  return (
    <section>
      <header className="mb-3 flex items-baseline justify-between gap-4 border-b border-(--border-subtle) pb-2">
        <div className="flex items-baseline gap-3">
          <h6 className="m-0 text-(--fg-primary)">{group.date}</h6>
          <span className="body-xs text-(--fg-tertiary)">
            {group.rows.length} {group.rows.length === 1 ? "evento" : "eventos"}
          </span>
        </div>
      </header>
      <ul className="m-0 flex flex-col gap-1 p-0">
        {group.rows.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </ul>
    </section>
  );
}

function EventRow({ event }: { event: OrgEvent }) {
  return (
    <li className="m-0 list-none">
      <div className="grid w-full grid-cols-[1fr_auto_auto] items-start gap-4 rounded-md px-3 py-3">
        <span className="flex min-w-0 items-start gap-3">
          <AwAvatar
            size="md"
            src={event.actorAvatar}
            alt={event.actor}
            initials={getInitials(event.actor)}
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="body-sm text-(--fg-secondary)">
              <span className="font-medium text-(--fg-primary)">
                {event.actor}
              </span>{" "}
              {event.action}
            </span>
            {event.meta && (
              <p className="m-0 body-xs text-(--fg-tertiary)">{event.meta}</p>
            )}
          </span>
        </span>
        <TypeBadge type={event.type} />
        <div className="flex flex-col items-end">
          <span className="body-xs tabular-nums text-(--fg-secondary)">
            {event.time}
          </span>
          <span className="body-xs text-(--fg-tertiary)">{event.role}</span>
        </div>
      </div>
    </li>
  );
}

/* ===================================================================== *
 * Tab — Solicitações de dados
 * ===================================================================== */

function SolicitacoesTab() {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="Solicitações de dados"
        description="Pedidos de exportação ou remoção de dados pessoais feitos por membros. Atendemos em até 15 dias."
      />

      {DATA_REQUESTS.length === 0 ? (
        <AwCard className="p-0!">
          <div className="px-6 py-10">
            <AwEmpty>
              <AwEmptyHeader>
                <AwEmptyMedia variant="icon">
                  <Icon name="inbox" size={20} />
                </AwEmptyMedia>
                <AwEmptyTitle>Nenhuma solicitação por aqui</AwEmptyTitle>
                <AwEmptyDescription>
                  Quando um membro pedir exportação ou remoção de dados, o
                  pedido aparece aqui.
                </AwEmptyDescription>
              </AwEmptyHeader>
            </AwEmpty>
          </div>
        </AwCard>
      ) : (
        <AwCard className="p-0!">
          <ul className="m-0 flex list-none flex-col">
            {DATA_REQUESTS.map((req, i) => (
              <li
                key={req.id}
                className={
                  "flex items-center gap-4 px-6 py-4" +
                  (i < DATA_REQUESTS.length - 1
                    ? " border-b border-(--border-subtle)"
                    : "")
                }
              >
                <AwAvatar
                  size="md"
                  src={req.requesterAvatar}
                  alt={req.requester}
                  initials={getInitials(req.requester)}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="m-0 body-sm font-medium text-(--fg-primary)">
                      {req.requester}
                    </p>
                    <RequestKindBadge kind={req.kind} />
                  </div>
                  <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
                    Aberta em {req.openedAt} · prazo até {req.dueAt}
                  </p>
                </div>
                <RequestStatusBadge status={req.status} />
              </li>
            ))}
          </ul>
        </AwCard>
      )}
    </div>
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
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 body-xs font-medium " +
        meta.badgeClass
      }
    >
      {status}
    </span>
  );
}

/* ===================================================================== *
 * Tab — Exportações
 * ===================================================================== */

function ExportacoesTab() {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="Exportações"
        description="Arquivos gerados a partir desta página. Os links expiram por segurança."
      />

      {EXPORT_FILES.length === 0 ? (
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
            {EXPORT_FILES.map((file, i) => {
              const expired = file.expiresInDays === null;
              return (
                <li
                  key={file.id}
                  className={
                    "flex items-center gap-4 px-6 py-4" +
                    (i < EXPORT_FILES.length - 1
                      ? " border-b border-(--border-subtle)"
                      : "")
                  }
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary)">
                    <Icon name="csv" size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate body-sm font-medium text-(--fg-primary)">
                      {file.name}
                    </p>
                    <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
                      Gerado em {file.generatedAt} · {file.size}
                    </p>
                  </div>
                  {expired ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 body-xs text-(--fg-tertiary)">
                      <Icon name="link_off" size={14} />
                      Link expirado
                    </span>
                  ) : (
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-secondary)">
                        <Icon
                          name="schedule"
                          size={14}
                          className="text-(--fg-tertiary)"
                        />
                        Link expira em {file.expiresInDays}{" "}
                        {file.expiresInDays === 1 ? "dia" : "dias"}
                      </span>
                      <AwButton size="sm" variant="ghost" iconLeft="download">
                        Baixar
                      </AwButton>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </AwCard>
      )}

      <p className="m-0 inline-flex items-center gap-2 px-1 body-xs text-(--fg-tertiary)">
        <Icon name="info" size={14} />
        Os arquivos são enviados por e-mail para {EXPORT_RECIPIENT} no momento
        em que são gerados.
      </p>
    </div>
  );
}
