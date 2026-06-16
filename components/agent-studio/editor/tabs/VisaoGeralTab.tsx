"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AwPill } from "@/components/ui/AwPill";
import { AwAgentCore } from "@/components/ui/AwAgentCore";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwUserAgentOrb } from "@/components/ui/AwUserAgentOrb";
import {
  AGENT_STATUS_META,
  type AgentEditorData,
  type EditorTabId,
} from "@/lib/agentStudio";

/**
 * Visão geral — resumo de tudo que define o agente.
 *
 * Hero com o orb + nome, linha de metadados e um grid de cards de resumo.
 * Cada card com seção correspondente no editor leva um atalho discreto
 * (?tab=…) no canto — sem CTA morto: cards sem seção própria não ganham link.
 */
export function VisaoGeralTab({ data }: { data: AgentEditorData }) {
  const { agent } = data;
  const status = AGENT_STATUS_META[agent.status];

  return (
    <div>
      {/* Hero */}
      <section className="relative flex flex-col items-center pb-10 pt-4 text-center">
        {/* Halo suave atrás do orb — eco discreto do gradiente do studio. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-32 w-[380px] -translate-x-1/2 opacity-60 blur-2xl"
          style={{
            background:
              "radial-gradient(closest-side, var(--aw-blue-200) 0%, transparent 72%)",
          }}
        />
        <div className="relative shadow-sm" style={{ borderRadius: 9999 }}>
          <AwUserAgentOrb seed={agent.id} size={64} />
        </div>
        <h2 className="relative mt-4 font-heading text-2xl font-medium tracking-tight text-(--fg-primary)">
          {agent.title}
        </h2>
      </section>

      {/* Metadados */}
      <section className="rounded-xl border border-(--border-subtle) bg-(--bg-surface) px-6 py-5">
        <div className="grid grid-cols-5 gap-6">
          <MetaItem label="Objetivo">
            <span className="text-sm text-(--fg-primary)">{agent.objetivo}</span>
          </MetaItem>
          <MetaItem label="Agente Core">
            <span className="flex items-center gap-2">
              <AwAgentCore src={agent.coreSrc} size={20} />
              <span className="truncate text-sm text-(--fg-primary)">
                {agent.coreName}
              </span>
            </span>
          </MetaItem>
          <MetaItem label="Programação">
            <span className="text-sm text-(--fg-primary)">
              {data.programacao}
            </span>
          </MetaItem>
          <MetaItem label="Criado em">
            <span className="text-sm text-(--fg-primary)">
              {agent.createdAt}
            </span>
          </MetaItem>
          <MetaItem label="Status">
            <AwPill variant={status.variant}>{status.label}</AwPill>
          </MetaItem>
        </div>
      </section>

      {/* Cards de resumo */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <SummaryCard
          icon="account_balance"
          title="Base de conhecimento"
          agentId={agent.id}
          tab="base-conhecimento"
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-canvas) p-4">
            <p className="text-sm font-medium text-(--fg-primary)">
              {data.kb.nome}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <KbMeta icon="layers">
                {data.kb.fontes} fontes de conhecimento
              </KbMeta>
              <KbMeta icon="stacks">
                {data.kb.knowledgeLayers} Knowledge Layers
              </KbMeta>
              <KbMeta icon="agent">
                Utilizada por {data.kb.usadoPorAgentes} agentes
              </KbMeta>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard icon="extension" title="Integrações" agentId={agent.id}>
          <div className="grid grid-cols-2 gap-2">
            {data.integracoes.map((integracao) => (
              <div
                key={integracao.id}
                className="flex items-center gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-canvas) px-3 py-2.5"
              >
                <AwBrandLogo brand={integracao.id} size="sm" />

                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-(--fg-primary)">
                    {integracao.nome}
                  </span>
                  <span className="block truncate text-xs text-(--fg-tertiary)">
                    {integracao.dominio}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </SummaryCard>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <SummaryCard
          icon="badge"
          title="Dados de exibição"
          agentId={agent.id}
          tab="preferencias"
        >
          <KvRow label="Nome social" value={data.social.nomeSocial} />
          <KvRow label="Empresa" value={data.social.empresa} />
        </SummaryCard>

        <SummaryCard
          icon="conversion_path"
          title="Origem e conversão"
          agentId={agent.id}
        >
          <KvRow label="Origem" value={data.origem.plataformas.join(", ")} />
          <KvRow
            label="Evento de conversão"
            value={data.origem.eventoConversao}
          />
        </SummaryCard>

        <SummaryCard icon="forum" title="Canal" agentId={agent.id}>
          <KvRow label="Canal" value={data.canal.nome} />
          <KvRow label="Telefone" value={data.canal.telefone} />
        </SummaryCard>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <SummaryCard icon="article" title="Templates" agentId={agent.id}>
          {data.templates.map((template) => (
            <KvRow
              key={template.label}
              label={template.label}
              value={template.valor}
            />
          ))}
        </SummaryCard>

        <SummaryCard
          icon="schedule_send"
          title="Follow-up"
          agentId={agent.id}
          tab="follow-up"
        >
          {data.followUps.length === 0 ? (
            <div className="flex h-full flex-col items-start justify-center gap-2 py-2">
              <p className="text-sm text-(--fg-tertiary)">
                Nenhum follow-up configurado.
              </p>
              <Link
                href={`/agent-studio/${agent.id}?tab=follow-up`}
                className="inline-flex items-center gap-1 text-sm font-medium text-(--fg-primary) underline-offset-4 hover:underline"
              >
                Configurar follow-up
                <Icon name="arrow_forward" size={16} />
              </Link>
            </div>
          ) : (
            data.followUps.map((followUp) => (
              <div
                key={followUp.id}
                className="flex items-center justify-between gap-4 border-b border-(--border-subtle) py-2.5 last:border-b-0"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-(--fg-primary)">
                    {followUp.nome}
                  </span>
                  <span className="block truncate text-xs text-(--fg-tertiary)">
                    {followUp.gatilho} · {followUp.espera} · {followUp.canal}
                  </span>
                </span>
                <AwPill
                  variant={followUp.status === "ativo" ? "live" : "neutral"}
                >
                  {followUp.status === "ativo" ? "Ativo" : "Pausado"}
                </AwPill>
              </div>
            ))
          )}
        </SummaryCard>

        <SummaryCard icon="data_object" title="Variáveis" agentId={agent.id}>
          {data.variaveis.map((variavel) => (
            <div
              key={variavel.nome}
              className="flex items-center justify-between gap-4 border-b border-(--border-subtle) py-2.5 last:border-b-0"
            >
              <span className="inline-flex items-center rounded-md bg-(--bg-hover) px-2 py-0.5 text-xs font-medium text-(--fg-secondary)">
                {variavel.nome}
              </span>
              <span className="shrink-0 text-sm text-(--fg-tertiary)">
                {variavel.tipo}
              </span>
            </div>
          ))}
        </SummaryCard>

        <SummaryCard
          icon="description"
          title="AOPs"
          agentId={agent.id}
          tab="aops"
        >
          {data.aops.map((aop) => (
            <div
              key={aop.id}
              className="flex items-center justify-between gap-4 border-b border-(--border-subtle) py-2.5 last:border-b-0"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-(--fg-primary)">
                  {aop.nome}
                </span>
                <span className="block truncate text-xs text-(--fg-tertiary)">
                  {aop.descricao}
                </span>
              </span>
              <AwPill variant={aop.status === "ativo" ? "live" : "neutral"}>
                {aop.status === "ativo" ? "Ativo" : "Desativado"}
              </AwPill>
            </div>
          ))}
        </SummaryCard>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Blocos internos
 * ───────────────────────────────────────────────────────────────────────── */

function MetaItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-(--fg-tertiary)">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SummaryCard({
  icon,
  title,
  agentId,
  tab,
  children,
}: {
  icon: string;
  title: string;
  agentId: string;
  /** Seção do editor que o atalho do canto abre. Sem tab = sem atalho. */
  tab?: EditorTabId;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon
            name={icon}
            size={18}
            className="shrink-0 text-(--fg-secondary)"
          />
          <h3 className="truncate text-sm font-medium text-(--fg-primary)">
            {title}
          </h3>
        </div>
        {tab && (
          <Link
            href={`/agent-studio/${agentId}?tab=${tab}`}
            aria-label={`Abrir ${title}`}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-(--fg-tertiary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary)"
          >
            <Icon name="arrow_outward" size={18} />
          </Link>
        )}
      </header>
      <div className="mt-4 flex-1">{children}</div>
    </section>
  );
}

function KbMeta({
  icon,
  children,
}: {
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-(--fg-secondary)">
      <Icon name={icon} size={15} className="shrink-0 text-(--fg-tertiary)" />
      {children}
    </span>
  );
}

function KvRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-(--border-subtle) py-2.5 last:border-b-0">
      <span className="shrink-0 text-sm text-(--fg-tertiary)">{label}</span>
      <span className="truncate text-sm text-(--fg-primary)">{value}</span>
    </div>
  );
}
