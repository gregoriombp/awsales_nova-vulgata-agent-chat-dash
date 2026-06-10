"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwPageHeader } from "@/components/ui/AwPageHeader";
import { AwButton } from "@/components/ui/AwButton";
import { AwPill } from "@/components/ui/AwPill";
import { AwModal } from "@/components/ui/AwModal";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwAgentCore } from "@/components/ui/AwAgentCore";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { Icon } from "@/components/ui/Icon";
import { getOrbForAgent } from "@/lib/agentOrbs";
import {
  getAgentEditorData,
  type AgentEditorData,
  type EditorTabId,
} from "@/lib/agentStudio";

/**
 * Revisão e publicação — última etapa antes do agente entrar em operação.
 * Resume tudo que foi definido no editor em cards somente-leitura; cada card
 * tem um atalho de edição que volta direto à seção correspondente
 * (/agent-studio/[id]?tab=…).
 */
export default function AgentReviewPage() {
  const params = useParams<{ id: string }>();
  const data = getAgentEditorData(params.id);
  const [published, setPublished] = useState(false);

  const editorHref = `/agent-studio/${params.id}`;

  const breadcrumbs = [
    { label: "Agent Studio", href: "/agent-studio" },
    { label: data.agent.title, href: editorHref },
    "Revisão",
  ];

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs}>
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-16 pt-4 sm:px-10">
        <Link
          href={editorHref}
          className="inline-flex items-center gap-1.5 text-sm text-(--fg-secondary) transition-colors duration-aw-fast hover:text-(--fg-primary)"
        >
          <Icon name="arrow_back" size={16} />
          Voltar
        </Link>

        <AwPageHeader
          size="hero"
          icon="fact_check"
          title="Revisão"
          description="Confira os detalhes definidos antes de publicar o agente."
          actions={
            <AwButton
              variant="primary"
              size="md"
              onClick={() => setPublished(true)}
            >
              Publicar agente
            </AwButton>
          }
          divider={false}
          className="mt-4"
        />

        <div className="mt-10 grid grid-cols-2 items-start gap-6">
          <ConfiguracoesGeraisCard data={data} editorHref={editorHref} />
          <CanalComunicacaoCard data={data} editorHref={editorHref} />

          <CheckpointBanner editorHref={editorHref} />

          <div className="flex flex-col gap-6">
            <BaseConhecimentoCard data={data} editorHref={editorHref} />
            <IntegracoesCard data={data} editorHref={editorHref} />
          </div>
          <QualidadeCard data={data} />
        </div>

        <p className="mt-10 text-center text-sm text-(--fg-tertiary)">
          Ao clicar em Publicar, você aceita os{" "}
          <span className="font-medium text-(--fg-secondary)">
            Termos e Condições
          </span>{" "}
          da Aswork.
        </p>
      </div>

      <PublishedModal
        open={published}
        onClose={() => setPublished(false)}
        agentHref={editorHref}
        agentId={params.id}
        agentTitle={data.agent.title}
      />
    </AwDashboardLayout>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Blocos de apoio
 * ───────────────────────────────────────────────────────────────────────── */

/** Atalho discreto de edição — volta à seção do editor que origina o dado. */
function EditLink({
  editorHref,
  tab,
  label,
  className,
}: {
  editorHref: string;
  tab: EditorTabId;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={`${editorHref}?tab=${tab}`}
      aria-label={label}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-(--fg-tertiary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary) ${className ?? ""}`}
    >
      <Icon name="edit" size={16} />
    </Link>
  );
}

/** Card de revisão — header com ícone, título, subtítulo e ação de editar. */
function ReviewCard({
  icon,
  title,
  edit,
  headerExtra,
  children,
}: {
  icon: string;
  title: string;
  edit?: React.ReactNode;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-(--border-subtle) bg-(--bg-canvas) p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-medium text-(--fg-primary)">
            <Icon name={icon} size={18} className="text-(--fg-secondary)" />
            {title}
          </h2>
          <p className="mt-1 text-sm text-(--fg-tertiary)">
            Revise se as configurações estão corretas.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {headerExtra}
          {edit}
        </div>
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Linha label → valor com separador. */
function ReviewRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3.5">
      <span className="shrink-0 text-sm text-(--fg-tertiary)">{label}</span>
      <span className="flex min-w-0 items-center justify-end gap-2 text-right text-sm text-(--fg-primary)">
        {children}
      </span>
    </div>
  );
}

function RowList({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-(--border-subtle)">{children}</div>;
}

/* ─────────────────────────────────────────────────────────────────────────
 * 1 · Configurações gerais
 * ───────────────────────────────────────────────────────────────────────── */
function ConfiguracoesGeraisCard({
  data,
  editorHref,
}: {
  data: AgentEditorData;
  editorHref: string;
}) {
  return (
    <ReviewCard
      icon="tune"
      title="Configurações gerais"
      edit={
        <EditLink
          editorHref={editorHref}
          tab="preferencias"
          label="Editar configurações gerais"
        />
      }
    >
      <RowList>
        <ReviewRow label="Objetivo">{data.agent.objetivo}</ReviewRow>
        <ReviewRow label="Agente">
          <span className="truncate">{data.agent.title}</span>
        </ReviewRow>
        <ReviewRow label="Agente Core">
          <AwAgentCore src={data.agent.coreSrc} size={20} />
          {data.agent.coreName}
        </ReviewRow>
        <ReviewRow label="Empresa">{data.social.empresa}</ReviewRow>
        <ReviewRow label="Nome social">{data.social.nomeSocial}</ReviewRow>
      </RowList>
    </ReviewCard>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 2 · Canal de comunicação
 * ───────────────────────────────────────────────────────────────────────── */
function CanalComunicacaoCard({
  data,
  editorHref,
}: {
  data: AgentEditorData;
  editorHref: string;
}) {
  return (
    <ReviewCard
      icon="chat_bubble"
      title="Canal de comunicação"
      edit={
        <EditLink
          editorHref={editorHref}
          tab="follow-up"
          label="Editar canal de comunicação"
        />
      }
    >
      <RowList>
        <ReviewRow label="Origem">
          <span className="flex flex-wrap items-center justify-end gap-1.5">
            {data.origem.plataformas.map((nome) => (
              <span
                key={nome}
                className="inline-flex items-center gap-1.5 rounded-md border border-(--border-subtle) bg-(--bg-surface) py-1 pl-1.5 pr-2.5 text-sm text-(--fg-primary)"
              >
                <AwBrandLogo brand={nome.toLowerCase()} size="sm" bare />
                {nome}
              </span>
            ))}
          </span>
        </ReviewRow>
        <ReviewRow label="Evento de conversão">
          <span className="truncate">{data.origem.eventoConversao}</span>
        </ReviewRow>
        <ReviewRow label="Telefone">{data.canal.telefone}</ReviewRow>
        <ReviewRow label="Primeira mensagem">
          {data.templates[0].valor}
        </ReviewRow>
        <ReviewRow label="Follow-up">
          {data.followUps[0]?.nome ?? "Nenhum configurado"}
        </ReviewRow>
      </RowList>
    </ReviewCard>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 3 · Banner de confirmação — checkpoint e prompt prontos
 * ───────────────────────────────────────────────────────────────────────── */
function CheckpointBanner({ editorHref }: { editorHref: string }) {
  return (
    <div className="relative col-span-2">
      <AwAlert
        variant="success"
        title="Checkpoint e prompt de comando configurados."
        className="pr-16!"
      >
        Tudo pronto para execução. O agente já pode operar com base nas
        configurações definidas.
      </AwAlert>
      <EditLink
        editorHref={editorHref}
        tab="prompt-checkpoint"
        label="Editar prompt e checkpoint"
        className="absolute right-4 top-1/2 -translate-y-1/2"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 4 · Base de conhecimento
 * ───────────────────────────────────────────────────────────────────────── */
function BaseConhecimentoCard({
  data,
  editorHref,
}: {
  data: AgentEditorData;
  editorHref: string;
}) {
  return (
    <ReviewCard
      icon="account_balance"
      title="Base de conhecimento"
      headerExtra={<AwPill variant="live">Alta compatibilidade</AwPill>}
      edit={
        <EditLink
          editorHref={editorHref}
          tab="base-conhecimento"
          label="Editar base de conhecimento"
        />
      }
    >
      <div className="flex items-center gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-(--border-subtle) bg-(--bg-canvas) text-(--fg-secondary)">
          <Icon name="account_balance" size={20} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-(--fg-primary)">
            {data.kb.nome}
          </p>
          <p className="mt-0.5 flex items-center gap-3 text-sm text-(--fg-tertiary)">
            <span className="inline-flex items-center gap-1">
              <Icon name="layers" size={14} />
              {data.kb.knowledgeLayers} Knowledge Layers
            </span>
            <span className="inline-flex items-center gap-1">
              <Icon name="description" size={14} />
              {data.kb.fontes} fontes
            </span>
          </p>
        </div>
      </div>
    </ReviewCard>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 5 · Integrações, habilidades e AOPs
 * ───────────────────────────────────────────────────────────────────────── */
const VISIBLE_TILES = 6;

function IntegracoesCard({
  data,
  editorHref,
}: {
  data: AgentEditorData;
  editorHref: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const tiles = useMemo(() => {
    const integracoes = data.integracoes.map((i) => ({
      key: `int-${i.id}`,
      icon: <AwBrandLogo brand={i.id} size="sm" bare />,
      titulo: i.nome,
      detalhe: i.dominio,
    }));
    const aops = data.aops
      .filter((a) => a.status === "ativo")
      .map((a) => ({
        key: `aop-${a.id}`,
        icon: (
          <span className="flex h-[22px] w-[22px] items-center justify-center text-(--fg-secondary)">
            <Icon name="description" size={18} />
          </span>
        ),
        titulo: a.nome,
        detalhe: a.descricao,
      }));
    return [...integracoes, ...aops];
  }, [data.integracoes, data.aops]);

  const visible = expanded ? tiles : tiles.slice(0, VISIBLE_TILES);
  const hasMore = tiles.length > VISIBLE_TILES;

  return (
    <ReviewCard
      icon="build"
      title="Integrações, habilidades e AOPs"
      edit={
        <EditLink
          editorHref={editorHref}
          tab="aops"
          label="Editar integrações, habilidades e AOPs"
        />
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {visible.map((tile) => (
          <div
            key={tile.key}
            className="flex items-center gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-surface) px-3 py-2.5"
          >
            <span className="shrink-0">{tile.icon}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-(--fg-primary)">
                {tile.titulo}
              </p>
              <p className="truncate text-xs text-(--fg-tertiary)">
                {tile.detalhe}
              </p>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 flex w-full items-center justify-center gap-1 text-sm text-(--fg-secondary) transition-colors duration-aw-fast hover:text-(--fg-primary)"
        >
          <Icon name={expanded ? "expand_less" : "expand_more"} size={18} />
          {expanded ? "Ver menos" : `Ver todas (${tiles.length})`}
        </button>
      )}
    </ReviewCard>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 6 · Qualidade do agente — gauge semicircular com gradiente azul
 * ───────────────────────────────────────────────────────────────────────── */
const GAUGE_TICKS = 44;
const GAUGE_W = 280;
const GAUGE_H = 150;
const GAUGE_CX = GAUGE_W / 2;
const GAUGE_CY = 140;
const GAUGE_R_INNER = 104;
const GAUGE_R_OUTER = 130;

function QualityGauge({ value }: { value: number }) {
  const filled = Math.round((value / 100) * GAUGE_TICKS);
  const ticks = Array.from({ length: GAUGE_TICKS }, (_, i) => {
    const angle = Math.PI * (1 - i / (GAUGE_TICKS - 1));
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // Coordenadas com precisão fixa — float cru diverge entre SSR e client
    // (hydration mismatch) por causa da serialização de ponto flutuante.
    const round = (n: number) => Number(n.toFixed(2));
    return {
      x1: round(GAUGE_CX + GAUGE_R_INNER * cos),
      y1: round(GAUGE_CY - GAUGE_R_INNER * sin),
      x2: round(GAUGE_CX + GAUGE_R_OUTER * cos),
      y2: round(GAUGE_CY - GAUGE_R_OUTER * sin),
      active: i < filled,
    };
  });

  return (
    <div className="relative" style={{ width: GAUGE_W, height: GAUGE_H }}>
      <svg
        width={GAUGE_W}
        height={GAUGE_H}
        viewBox={`0 0 ${GAUGE_W} ${GAUGE_H}`}
        role="img"
        aria-label={`Qualidade do agente: ${value}%`}
      >
        <defs>
          {/* Gradiente em userSpaceOnUse: cada tick pega a cor pela posição
              no arco — azul claro à esquerda, azul profundo à direita. */}
          <linearGradient
            id="aw-quality-gauge-gradient"
            gradientUnits="userSpaceOnUse"
            x1={GAUGE_CX - GAUGE_R_OUTER}
            y1={GAUGE_CY}
            x2={GAUGE_CX + GAUGE_R_OUTER}
            y2={GAUGE_CY}
          >
            <stop offset="0%" stopColor="var(--aw-blue-400)" />
            <stop offset="100%" stopColor="var(--aw-blue-600)" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={
              t.active ? "url(#aw-quality-gauge-gradient)" : "var(--border-subtle)"
            }
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className="font-heading text-5xl font-medium leading-none text-(--fg-primary)">
          {value}%
        </span>
        <span className="mt-2 text-sm text-(--fg-tertiary)">
          Qualidade excelente
        </span>
      </div>
    </div>
  );
}

function QualidadeCard({ data }: { data: AgentEditorData }) {
  return (
    <section className="flex h-full flex-col rounded-xl border border-(--border-subtle) bg-(--bg-canvas) p-6">
      <header>
        <h2 className="flex items-center gap-2 text-base font-medium text-(--fg-primary)">
          <Icon name="speed" size={18} className="text-(--fg-secondary)" />
          Qualidade do agente
        </h2>
        <p className="mt-1 text-sm text-(--fg-tertiary)">
          Avaliação geral da configuração antes da publicação.
        </p>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-10 py-10">
        <QualityGauge value={data.qualidade} />
        <p className="max-w-[360px] text-center text-sm leading-normal text-(--fg-secondary)">
          As configurações de objetivo, instruções, checkpoint, integrações e
          base de conhecimento estão otimizadas.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Modal de sucesso da publicação — momento de celebração: banda com o
 * gradiente azul em mesh (tratamento Arcade) e o orb do agente em destaque.
 * ───────────────────────────────────────────────────────────────────────── */
function PublishedModal({
  open,
  onClose,
  agentHref,
  agentId,
  agentTitle,
}: {
  open: boolean;
  onClose: () => void;
  agentHref: string;
  agentId: string;
  agentTitle: string;
}) {
  return (
    <AwModal open={open} onClose={onClose}>
      <div className="flex flex-col items-center pb-6 text-center">
        {/* Banda de celebração */}
        <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-xl">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: [
                "radial-gradient(420px 240px at 18% 120%, var(--aw-blue-600) 0%, transparent 65%)",
                "radial-gradient(460px 260px at 85% -25%, var(--aw-blue-300) 0%, transparent 60%)",
                "radial-gradient(380px 220px at 70% 130%, var(--aw-blue-400) 0%, transparent 62%)",
                "linear-gradient(135deg, var(--aw-blue-100) 0%, var(--aw-blue-200) 100%)",
              ].join(", "),
            }}
          />
          <span className="relative inline-flex">
            <img
              src={getOrbForAgent(agentId)}
              alt=""
              className="h-20 w-20 rounded-full border-[3px] border-white object-cover shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-(--aw-emerald-600) text-white">
              <Icon name="check" size={16} />
            </span>
          </span>
        </div>

        <h2 className="mt-5 font-heading text-xl font-medium text-(--fg-primary)">
          Seu agente foi publicado
        </h2>
        <p className="mt-2 max-w-[380px] text-sm leading-normal text-(--fg-secondary)">
          {agentTitle} já está ativo e pronto para operar nos canais
          configurados. Acompanhe as conversas e o desempenho pelo Agent
          Studio.
        </p>
        <div className="mt-6 flex items-center gap-2">
          <AwButton asChild variant="secondary" size="md">
            <Link href="/agent-studio">Voltar ao Agent Studio</Link>
          </AwButton>
          <AwButton asChild variant="primary" size="md">
            <Link href={agentHref}>Ver agente</Link>
          </AwButton>
        </div>
      </div>
    </AwModal>
  );
}
