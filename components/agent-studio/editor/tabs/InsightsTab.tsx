"use client";

import * as React from "react";
import Link from "next/link";
import { AwButton } from "@/components/ui/AwButton";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/AwToast";
import {
  AwEmpty,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
  AwEmptyDescription,
} from "@/components/ui/AwEmpty";
import type { AgentEditorData, EditorTabId } from "@/lib/agentStudio";

/**
 * Insights — desempenho recente + recomendações do Cortex.
 *
 * Estrutura lean: um card de desempenho (4 números grandes, sem grid denso
 * de KPIs) e a fila de recomendações. A primeira recomendação ganha o
 * tratamento de destaque com lavagem em gradiente azul; cada uma leva um
 * CTA real para a seção do editor onde a ação acontece. Dispensar tira da
 * fila com Desfazer no toast.
 */

type Metrica = {
  label: string;
  valor: string;
  delta: string;
  direcao: "up" | "down";
  /** Se a variação é boa para o agente (cor do delta). */
  positivo: boolean;
};

const METRICAS: Metrica[] = [
  {
    label: "Conversas iniciadas",
    valor: "412",
    delta: "+18%",
    direcao: "up",
    positivo: true,
  },
  {
    label: "Conversões",
    valor: "57",
    delta: "+12%",
    direcao: "up",
    positivo: true,
  },
  {
    label: "Taxa de resposta",
    valor: "92%",
    delta: "+4 p.p.",
    direcao: "up",
    positivo: true,
  },
  {
    label: "Sem resposta após a 1ª mensagem",
    valor: "38%",
    delta: "+6 p.p.",
    direcao: "up",
    positivo: false,
  },
];

type Insight = {
  id: string;
  icon: string;
  impacto: "alto" | "medio";
  titulo: string;
  descricao: string;
  cta: { label: string; tab: EditorTabId };
};

function buildInsights(data: AgentEditorData): Insight[] {
  return [
    {
      id: "follow-up-24h",
      icon: "schedule_send",
      impacto: "alto",
      titulo: "Adicione um follow-up de 24 horas",
      descricao:
        "38% das conversas param depois da primeira mensagem sem resposta do lead. Um lembrete automático em 24 horas costuma recuperar boa parte delas.",
      cta: { label: "Criar follow-up", tab: "follow-up" },
    },
    {
      id: "checkpoint-objecoes",
      icon: "fork_right",
      impacto: "alto",
      titulo: "Revise o checkpoint de objeções",
      descricao:
        "22% das conversas que chegam à etapa de objeções terminam sem avanço. Vale reforçar as instruções de contorno antes da proposta.",
      cta: { label: "Revisar checkpoints", tab: "prompt-checkpoint" },
    },
    {
      id: "kb-desatualizada",
      icon: "account_balance",
      impacto: "medio",
      titulo: "Atualize a base de conhecimento",
      descricao: `“${data.kb.nome}” não recebe fontes novas há 32 dias. Conteúdo recente melhora a precisão das respostas do agente.`,
      cta: { label: "Ver base", tab: "base-conhecimento" },
    },
    {
      id: "transferencia-automatica",
      icon: "support_agent",
      impacto: "medio",
      titulo: "Ative a transferência automática",
      descricao:
        "9 conversas pediram atendimento humano fora do fluxo na última semana. Regras de transferência automática reduzem o tempo de espera.",
      cta: { label: "Configurar transferência", tab: "atendimento-humano" },
    },
  ];
}

const IMPACTO_META: Record<Insight["impacto"], { label: string }> = {
  alto: { label: "Impacto alto" },
  medio: { label: "Impacto médio" },
};

export function InsightsTab({ data }: { data: AgentEditorData }) {
  const { push } = useToast();
  const insights = React.useMemo(() => buildInsights(data), [data]);
  const [dispensados, setDispensados] = React.useState<string[]>([]);

  const fila = insights.filter((i) => !dispensados.includes(i.id));
  const [destaque, ...demais] = fila;

  function dispensar(insight: Insight) {
    setDispensados((prev) => [...prev, insight.id]);
    push({
      title: "Recomendação dispensada",
      action: {
        label: "Desfazer",
        onClick: () =>
          setDispensados((prev) => prev.filter((id) => id !== insight.id)),
      },
    });
  }

  return (
    <div>
      {/* Desempenho — 4 números grandes, sem grid de KPI cards */}
      <section className="rounded-xl border border-(--border-subtle) bg-(--bg-surface) px-6 py-5">
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Icon
              name="monitoring"
              size={18}
              className="shrink-0 text-(--fg-secondary)"
            />
            <h3 className="truncate text-sm font-medium text-(--fg-primary)">
              Desempenho
            </h3>
          </div>
          <span className="shrink-0 text-xs text-(--fg-tertiary)">
            Últimos 7 dias
          </span>
        </header>

        <div className="mt-5 grid grid-cols-4 divide-x divide-(--border-subtle)">
          {METRICAS.map((metrica) => (
            <div key={metrica.label} className="min-w-0 px-6 first:pl-0 last:pr-0">
              <p className="text-xs font-medium uppercase tracking-wide text-(--fg-tertiary)">
                {metrica.label}
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading text-3xl font-light tracking-tight text-(--fg-primary)">
                  {metrica.valor}
                </span>
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    metrica.positivo
                      ? "text-(--accent-success)"
                      : "text-(--accent-danger)"
                  }`}
                >
                  <Icon
                    name={
                      metrica.direcao === "up" ? "trending_up" : "trending_down"
                    }
                    size={14}
                  />
                  {metrica.delta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recomendações */}
      <h3 className="mt-8 text-base font-medium text-(--fg-primary)">
        Recomendações
      </h3>

      {fila.length === 0 ? (
        <div className="mt-4 rounded-xl border border-(--border-subtle) bg-(--bg-canvas) py-10">
          <AwEmpty>
            <AwEmptyHeader>
              <AwEmptyMedia variant="icon">
                <Icon name="check_circle" size={24} />
              </AwEmptyMedia>
              <AwEmptyTitle>Tudo em dia</AwEmptyTitle>
              <AwEmptyDescription>
                Nenhuma recomendação pendente. O Cortex gera sugestões novas
                conforme o agente conversa.
              </AwEmptyDescription>
            </AwEmptyHeader>
          </AwEmpty>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Destaque — lavagem em gradiente azul (origem-IA), uso pontual */}
          {destaque && (
            <section className="relative overflow-hidden rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-6">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-80 dark:opacity-20"
                style={{
                  background:
                    "linear-gradient(120deg, var(--aw-blue-150) 0%, transparent 48%), radial-gradient(440px circle at 90% -30%, var(--aw-blue-200) 0%, transparent 62%)",
                }}
              />
              <div className="relative flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--bg-canvas) shadow-sm">
                  <Icon
                    name={destaque.icon}
                    size={20}
                    className="text-(--aw-blue-700)"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <AwPill variant="ai" dot={false}>
                      Recomendação do Cortex
                    </AwPill>
                    <AwPill variant="neutral" dot={false}>
                      {IMPACTO_META[destaque.impacto].label}
                    </AwPill>
                  </div>
                  <h4 className="mt-3 font-heading text-lg font-medium tracking-tight text-(--fg-primary)">
                    {destaque.titulo}
                  </h4>
                  <p className="mt-1.5 max-w-[640px] text-sm leading-relaxed text-(--fg-secondary)">
                    {destaque.descricao}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <AwButton asChild variant="primary" size="sm">
                      <Link
                        href={`/agent-studio/${data.agent.id}?tab=${destaque.cta.tab}`}
                      >
                        {destaque.cta.label}
                      </Link>
                    </AwButton>
                    <AwButton
                      variant="ghost"
                      size="sm"
                      onClick={() => dispensar(destaque)}
                    >
                      Dispensar
                    </AwButton>
                  </div>
                </div>
              </div>
            </section>
          )}

          {demais.map((insight) => (
            <section
              key={insight.id}
              className="flex items-start gap-4 rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--bg-hover)">
                <Icon
                  name={insight.icon}
                  size={20}
                  className="text-(--fg-secondary)"
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-sm font-medium text-(--fg-primary)">
                    {insight.titulo}
                  </h4>
                  <AwPill variant="neutral" dot={false}>
                    {IMPACTO_META[insight.impacto].label}
                  </AwPill>
                </div>
                <p className="mt-1 max-w-[640px] text-sm leading-relaxed text-(--fg-tertiary)">
                  {insight.descricao}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <AwButton asChild variant="secondary" size="sm">
                  <Link
                    href={`/agent-studio/${data.agent.id}?tab=${insight.cta.tab}`}
                  >
                    {insight.cta.label}
                  </Link>
                </AwButton>
                <button
                  type="button"
                  onClick={() => dispensar(insight)}
                  aria-label={`Dispensar recomendação “${insight.titulo}”`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-(--fg-tertiary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary)"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="mt-6 flex items-center gap-1.5 text-xs text-(--fg-tertiary)">
        <Icon name="auto_awesome" size={14} className="shrink-0" />
        Gerado pelo Cortex a partir das conversas dos últimos 7 dias.
      </p>
    </div>
  );
}
