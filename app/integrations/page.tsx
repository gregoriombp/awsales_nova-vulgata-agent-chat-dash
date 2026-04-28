"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwField, AwInput } from "@/components/ui/AwInput";
import {
  AwIntegrationCard,
  type AwIntegrationCardState,
} from "@/components/ui/AwIntegrationCard";
import { AwConnectModal } from "@/components/ui/AwConnectModal";
import { AwModal } from "@/components/ui/AwModal";
import { AwTabs } from "@/components/ui/AwTabs";
import { Icon } from "@/components/ui/Icon";

type IntegrationCategory =
  | "channels"
  | "checkouts"
  | "members"
  | "forms"
  | "meetings"
  | "crms"
  | "marketplaces";

type CategoryFilter = "all" | "connected" | IntegrationCategory;

type AuthMethod = "oauth" | "api";

interface Integration {
  id: string;
  cat: IntegrationCategory;
  name: string;
  domain: string;
  desc: string;
  state: AwIntegrationCardState;
  auth: AuthMethod;
  instances?: number;
  permissions?: string[];
}

const CATS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "connected", label: "Conectadas" },
  { id: "channels", label: "Canais" },
  { id: "checkouts", label: "Checkouts" },
  { id: "members", label: "Área de membros" },
  { id: "forms", label: "Formulários" },
  { id: "meetings", label: "Reuniões" },
  { id: "crms", label: "CRMs" },
  { id: "marketplaces", label: "Marketplaces" },
];

const ITEMS: Integration[] = [
  // CHANNELS
  { id: "whatsapp", cat: "channels", name: "WhatsApp", domain: "whatsapp.com", desc: "Atenda e recupere vendas via WhatsApp com seus agentes de IA.", state: "connected", instances: 2, auth: "oauth", permissions: ["Enviar e receber mensagens em seu nome", "Acessar contatos e conversas ativas", "Ler mídias enviadas pelos clientes"] },
  { id: "instagram", cat: "channels", name: "Instagram", domain: "instagram.com", desc: "Responda DMs do Instagram automaticamente com agentes.", state: "connected", auth: "oauth", permissions: ["Ler e responder mensagens diretas", "Acessar comentários em posts e reels", "Ver informações básicas da conta"] },
  { id: "messenger", cat: "channels", name: "Messenger", domain: "messenger.com", desc: "Atendimento automatizado pelo Messenger do Facebook.", state: "available", auth: "oauth", permissions: ["Ler e responder mensagens da página", "Acessar perfis públicos dos clientes", "Receber webhooks de novas conversas"] },
  // CHECKOUTS — quase todos via API/webhook
  { id: "hotmart", cat: "checkouts", name: "Hotmart", domain: "hotmart.com", desc: "Capture transações e eventos do checkout Hotmart.", state: "connected", auth: "api" },
  { id: "stripe", cat: "checkouts", name: "Stripe", domain: "stripe.com", desc: "Pagamentos globais — cartão, PIX, assinaturas.", state: "attention", auth: "api" },
  { id: "kiwify", cat: "checkouts", name: "Kiwify", domain: "kiwify.com.br", desc: "Sincronize vendas e abandonos do checkout Kiwify.", state: "available", auth: "api" },
  { id: "eduzz", cat: "checkouts", name: "Eduzz", domain: "eduzz.com", desc: "Capture transações do checkout Eduzz.", state: "available", auth: "api" },
  { id: "hubla", cat: "checkouts", name: "Hubla", domain: "hub.la", desc: "Sincronize vendas e clientes da Hubla.", state: "available", auth: "api" },
  { id: "ticto", cat: "checkouts", name: "Ticto", domain: "ticto.com.br", desc: "Receba eventos de venda do checkout Ticto.", state: "available", auth: "api" },
  { id: "lastlink", cat: "checkouts", name: "LastLink", domain: "lastlink.com", desc: "Capture transações e renovações da LastLink.", state: "available", auth: "api" },
  // MEMBERS
  { id: "memberkit", cat: "members", name: "MemberKit", domain: "memberkit.com.br", desc: "Sincronize alunos e progresso da área de membros.", state: "available", auth: "api" },
  { id: "cademi", cat: "members", name: "Cademi", domain: "cademi.com.br", desc: "Conecte sua área de membros Cademi para automações.", state: "available", auth: "api" },
  // FORMS
  { id: "googleforms", cat: "forms", name: "Google Forms", domain: "forms.google.com", desc: "Receba submissões do Google Forms em tempo real.", state: "available", auth: "oauth", permissions: ["Acessar a lista de formulários da conta", "Receber respostas em tempo real", "Ler metadados das perguntas"] },
  { id: "typeform", cat: "forms", name: "Typeform", domain: "typeform.com", desc: "Capture leads dos seus formulários conversacionais.", state: "available", auth: "oauth", permissions: ["Acessar formulários da workspace", "Receber novas respostas via webhook", "Ler informações do respondente"] },
  { id: "tally", cat: "forms", name: "Tally", domain: "tally.so", desc: "Formulários simples — dispare ações com cada submissão.", state: "available", auth: "api" },
  // MEETINGS
  { id: "calendly", cat: "meetings", name: "Calendly", domain: "calendly.com", desc: "Agendamentos automáticos sincronizados com agentes.", state: "available", auth: "oauth", permissions: ["Acessar tipos de evento e disponibilidade", "Criar e cancelar agendamentos", "Receber notificações de novos eventos"] },
  { id: "googlecal", cat: "meetings", name: "Google Calendar", domain: "calendar.google.com", desc: "Reuniões e disponibilidade direto do Google Agenda.", state: "available", auth: "oauth", permissions: ["Ler eventos e disponibilidade da agenda", "Criar e atualizar eventos em seu nome", "Acessar agendas compartilhadas"] },
  // CRMs
  { id: "pipedrive", cat: "crms", name: "Pipedrive", domain: "pipedrive.com", desc: "Sincronize contatos, deals e atividades do Pipedrive.", state: "available", auth: "oauth", permissions: ["Acessar contatos, organizações e deals", "Criar e atualizar atividades", "Mover deals entre etapas do pipeline"] },
  { id: "kommo", cat: "crms", name: "Kommo", domain: "kommo.com", desc: "Conecte funis, leads e tarefas do Kommo CRM.", state: "available", auth: "oauth", permissions: ["Acessar leads, contatos e empresas", "Criar e atualizar tarefas", "Mover leads entre etapas do funil"] },
  { id: "rdstation", cat: "crms", name: "RD Station", domain: "rdstation.com", desc: "Sincronize leads, oportunidades e tags do RD Station.", state: "available", auth: "oauth", permissions: ["Acessar leads e oportunidades", "Criar e atualizar tags", "Disparar eventos de conversão"] },
  { id: "hubspot", cat: "crms", name: "HubSpot", domain: "hubspot.com", desc: "Conecte contatos, empresas e pipelines do HubSpot.", state: "available", auth: "oauth", permissions: ["Acessar contatos e empresas", "Criar e atualizar deals do pipeline", "Disparar workflows quando uma oportunidade fechar"] },
  // MARKETPLACES
  { id: "shopify", cat: "marketplaces", name: "Shopify", domain: "shopify.com", desc: "Gerencie produtos, pedidos e clientes pela IA.", state: "connected", auth: "oauth", permissions: ["Acessar catálogo de produtos e estoque", "Ler pedidos e clientes", "Criar rascunhos de pedido e cupons"] },
  { id: "magalu", cat: "marketplaces", name: "Magalu", domain: "magalu.com", desc: "Sincronize produtos e pedidos do marketplace Magalu.", state: "available", auth: "api" },
];

export default function IntegrationsPage() {
  const [activeCat, setActiveCat] = useState<CategoryFilter>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const countFor = (id: CategoryFilter) => {
    if (id === "all") return ITEMS.length;
    if (id === "connected")
      return ITEMS.filter(
        (i) => i.state === "connected" || i.state === "attention"
      ).length;
    return ITEMS.filter((i) => i.cat === id).length;
  };

  const filtered = ITEMS.filter((i) => {
    if (activeCat === "connected") {
      if (i.state !== "connected" && i.state !== "attention") return false;
    } else if (activeCat !== "all" && i.cat !== activeCat) {
      return false;
    }
    if (q) {
      const t = q.toLowerCase();
      return (
        i.name.toLowerCase().includes(t) ||
        i.desc.toLowerCase().includes(t) ||
        i.domain.toLowerCase().includes(t)
      );
    }
    return true;
  });

  const opened = openId ? ITEMS.find((i) => i.id === openId) ?? null : null;
  const isConnected =
    opened?.state === "connected" || opened?.state === "attention";
  const showOAuthModal = !!opened && !isConnected && opened.auth === "oauth";
  const showFormModal = !!opened && (isConnected || opened.auth === "api");

  const breadcrumbs = [
    { label: "Integrações", icon: <Icon name="extension" size={20} /> },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8 min-h-full bg-[var(--bg-surface)]">
        <div className="w-full px-10 pt-12 pb-24">
          {/* Header */}
          <header className="mb-7 flex items-end justify-between gap-6 border-b border-[var(--border-subtle)] pb-6">
            <div>
              <h1 className="m-0 mb-1.5 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--fg-primary)]">
                Integrações
              </h1>
              <p className="m-0 max-w-[560px] text-sm leading-[1.5] text-[var(--fg-secondary)]">
                Conecte canais, plataformas e ferramentas para que seus agentes coletem contexto, executem ações e mantenham seus sistemas sincronizados.
              </p>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <AwButton variant="secondary" size="md" iconLeft="link">
                Solicitar
              </AwButton>
              <AwButton variant="primary" size="md" iconLeft="add">
                Nova integração
              </AwButton>
            </div>
          </header>

          {/* Categorias */}
          <AwTabs
            variant="standalone"
            value={activeCat}
            onChange={(v) => setActiveCat(v as CategoryFilter)}
            className="mb-5"
            aria-label="Categorias de integração"
            items={CATS.map((c) => ({
              value: c.id,
              label: c.label,
              count: countFor(c.id),
            }))}
          />

          {/* Toolbar */}
          <div className="mb-5 flex items-center gap-2.5">
            <AwInput
              dense
              iconLeft="search"
              placeholder="Buscar integração…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="max-w-[380px] flex-1"
              aria-label="Buscar integração"
            />
            <span className="ml-auto text-[12.5px] tabular-nums text-[var(--fg-tertiary)]">
              {filtered.length}{" "}
              {filtered.length === 1 ? "integração" : "integrações"}
            </span>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <AwEmpty>
              <AwEmptyHeader>
                <AwEmptyMedia variant="icon">
                  <Icon name="search_off" size={28} />
                </AwEmptyMedia>
                <AwEmptyTitle>Nenhuma integração encontrada</AwEmptyTitle>
                <AwEmptyDescription>
                  Tente outro termo ou troque a categoria.
                </AwEmptyDescription>
              </AwEmptyHeader>
            </AwEmpty>
          ) : (
            <div
              className="grid gap-3.5"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              }}
            >
              {filtered.map((it) => (
                <AwIntegrationCard
                  key={it.id}
                  brand={it.id}
                  name={it.name}
                  domain={it.domain}
                  description={it.desc}
                  state={it.state}
                  instances={it.instances}
                  onClick={() => setOpenId(it.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OAuth permission dialog — para integrações via OAuth ainda não conectadas */}
      <AwConnectModal
        open={showOAuthModal}
        onClose={() => setOpenId(null)}
        targetBrand={opened?.id ?? ""}
        targetName={opened?.name ?? ""}
        productName="AwSales"
        description={opened?.desc}
        permissionsTitle={opened ? `O AwSales precisa` : undefined}
        permissions={opened?.permissions ?? []}
        redirectUrl={
          opened
            ? `https://app.awsales.io/integrations/${opened.id}/callback`
            : undefined
        }
        onAllow={() => setOpenId(null)}
      />

      {/* Manage / API key modal — para integrações conectadas ou via chave de API */}
      <AwModal
        open={showFormModal}
        onClose={() => setOpenId(null)}
        title={
          opened
            ? `${isConnected ? "Gerenciar" : "Conectar"} ${opened.name}`
            : undefined
        }
        footer={
          <>
            <AwButton variant="secondary" onClick={() => setOpenId(null)}>
              Cancelar
            </AwButton>
            <AwButton variant="primary" onClick={() => setOpenId(null)}>
              {isConnected ? "Salvar" : "Conectar"}
            </AwButton>
          </>
        }
      >
        {opened && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <AwBrandLogo brand={opened.id} size="md" />
              <p className="m-0 text-xs text-[var(--fg-tertiary)]">
                {opened.domain}
              </p>
            </div>
            {isConnected ? (
              <>
                <p className="mb-3.5 text-[13.5px] leading-[1.5] text-[var(--fg-secondary)]">
                  {opened.state === "attention" ? (
                    <>
                      Sua conta está{" "}
                      <strong className="text-[var(--aw-amber-700)]">
                        com atenção
                      </strong>{" "}
                      — renove o token para continuar.
                    </>
                  ) : (
                    <>
                      Sua conta está{" "}
                      <strong className="text-[var(--aw-emerald-700)]">
                        ativa
                      </strong>
                      . Ajuste o apelido ou desconecte abaixo.
                    </>
                  )}
                </p>
                <AwField label="Apelido" htmlFor={`alias-${opened.id}`}>
                  <AwInput
                    id={`alias-${opened.id}`}
                    defaultValue={`${opened.name} — Loja BR`}
                  />
                </AwField>
                <AwField label="Webhook URL" htmlFor={`hook-${opened.id}`}>
                  <AwInput
                    id={`hook-${opened.id}`}
                    readOnly
                    defaultValue={`https://hooks.awsales.io/v1/${opened.id}/c1f8a92e`}
                  />
                </AwField>
              </>
            ) : (
              <>
                <p className="mb-3.5 text-[13.5px] leading-[1.5] text-[var(--fg-secondary)]">
                  Cole sua chave de API do <strong>{opened.name}</strong> para começar a sincronizar transações e eventos.
                </p>
                <AwField label="API Key" htmlFor={`key-${opened.id}`}>
                  <AwInput
                    id={`key-${opened.id}`}
                    placeholder="sk_live_••••••••••••"
                  />
                </AwField>
                <AwField
                  label="Webhook secret"
                  htmlFor={`secret-${opened.id}`}
                >
                  <AwInput
                    id={`secret-${opened.id}`}
                    placeholder="whsec_••••••••"
                  />
                </AwField>
              </>
            )}
          </>
        )}
      </AwModal>
    </DashboardLayout>
  );
}
