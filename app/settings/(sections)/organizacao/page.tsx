"use client";

import { useEffect, useMemo, useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwSelect } from "@/components/ui/AwSelect";
import { Icon } from "@/components/ui/Icon";
import { ONBOARDING_ORG, fmtBRL } from "@/app/primeiro-acesso/_data";
import { ADDITIONAL_ORG } from "@/app/organizacao-adicional/_data";
import { SaveBar, SectionHeading, SettingsPageHeader } from "../_components/shared";

const ORGS = [
  { id: "fyntra", slug: "artificial-concord", data: ONBOARDING_ORG },
  { id: "nucleo", slug: "nucleo-performance", data: ADDITIONAL_ORG },
] as const;

type OrgId = (typeof ORGS)[number]["id"];

function buildCompanyRows(data: (typeof ORGS)[number]["data"]) {
  return [
    { label: "Razão social", value: data.razaoSocial },
    { label: "CNPJ", value: data.cnpj, tabular: true },
    { label: "Segmento", value: data.segmento },
    { label: "Porte", value: data.porte },
    {
      label: "Plano contratado",
      value: `${data.plan} · ${data.intervaloPlano} · ${fmtBRL(data.valorMensal).replace(",00", "")}/mês`,
    },
    { label: "Data de criação", value: "11 de mai. 2026" },
  ];
}

export default function OrganizationSettingsPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<OrgId>("fyntra");
  const currentOrg = useMemo(
    () => ORGS.find((o) => o.id === selectedOrgId) ?? ORGS[0],
    [selectedOrgId],
  );

  const [orgName, setOrgName] = useState(currentOrg.data.name);
  const [orgSlug, setOrgSlug] = useState(currentOrg.slug);

  useEffect(() => {
    setOrgName(currentOrg.data.name);
    setOrgSlug(currentOrg.slug);
  }, [currentOrg]);

  const companyRows = useMemo(
    () => buildCompanyRows(currentOrg.data),
    [currentOrg],
  );

  return (
    <div className="mx-auto w-full max-w-[1440px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Organização"
        description="Como sua empresa aparece nos agentes, conversas e exportações."
      />

      <AwDropdownMenu
        align="start"
        trigger={
          <button
            type="button"
            className="mb-6 inline-flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] py-2 pl-2 pr-3 text-left transition-colors duration-aw-fast hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)]"
          >
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-[var(--bg-muted)]">
              <img
                src={currentOrg.data.logo}
                alt=""
                width={32}
                height={32}
                style={{ objectFit: "cover" }}
              />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="aw-eyebrow text-[var(--fg-tertiary)]">
                Organização
              </span>
              <span className="body-sm font-medium text-[var(--fg-primary)]">
                {currentOrg.data.name}
              </span>
            </span>
            <Icon
              name="expand_more"
              size={18}
              className="text-[var(--fg-tertiary)]"
            />
          </button>
        }
        items={ORGS.map((o) => ({
          id: o.id,
          label: o.data.name,
          checked: o.id === selectedOrgId,
          onSelect: () => setSelectedOrgId(o.id),
        }))}
      />

      <AwCard className="!p-0">
        <div className="flex items-center gap-4 border-b border-[var(--border-subtle)] px-6 py-5">
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-[var(--bg-muted)]">
            <img
              src={currentOrg.data.logo}
              alt={orgName}
              width={48}
              height={48}
              style={{ objectFit: "cover" }}
            />
          </span>
          <div className="flex-1">
            <p className="m-0 body-sm font-medium text-[var(--fg-primary)]">
              Logo da organização
            </p>
            <p className="m-0 body-xs text-[var(--fg-secondary)]">
              Usada na navegação e nos canais conectados.
            </p>
          </div>
          <AwButton size="sm" variant="secondary" iconLeft="upload">
            Trocar logo
          </AwButton>
        </div>
        <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
          <AwField label="Nome da organização" htmlFor="org-name">
            <AwInput
              id="org-name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </AwField>
          <AwField
            label="Identificador (URL)"
            htmlFor="org-slug"
            helper={`app.awsales.io/${orgSlug}`}
          >
            <AwInput
              id="org-slug"
              value={orgSlug}
              onChange={(e) =>
                setOrgSlug(
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                )
              }
            />
          </AwField>
          <AwField label="Indústria">
            <AwSelect>Educação / Infoprodutos</AwSelect>
          </AwField>
          <AwField label="Tamanho do time">
            <AwSelect>11 — 50 pessoas</AwSelect>
          </AwField>
          <AwField label="Fuso padrão" className="md:col-span-2">
            <AwSelect>(GMT−03:00) Brasília · São Paulo</AwSelect>
          </AwField>
        </div>
        <SaveBar />
      </AwCard>

      <div className="mt-10">
        <SectionHeading
          title="Dados contratuais"
          description="Cadastrados pela equipe AwSales no fechamento do contrato. Para alterar, abra um chamado com seu Account Manager."
        />
        <AwCard className="!p-0">
          <dl className="m-0">
            {companyRows.map((row, i) => (
              <div
                key={row.label}
                className={
                  "grid grid-cols-[200px_1fr_auto] items-center gap-4 px-6 py-3.5" +
                  (i < companyRows.length - 1
                    ? " border-b border-[var(--border-subtle)]"
                    : "")
                }
              >
                <dt className="m-0 body-xs text-[var(--fg-tertiary)]">
                  {row.label}
                </dt>
                <dd
                  className="m-0 body-xs font-medium text-[var(--fg-primary)]"
                  style={
                    row.tabular ? { fontVariantNumeric: "tabular-nums" } : undefined
                  }
                >
                  {row.value}
                </dd>
                <span
                  className="text-[var(--fg-tertiary)]"
                  title="Campo somente leitura — definido em contrato"
                >
                  <Icon name="lock" size={14} />
                </span>
              </div>
            ))}
          </dl>
          <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] px-6 py-3 text-[var(--fg-secondary)]">
            <Icon name="warning" size={14} />
            <a
              href="#"
              className="body-xs font-medium text-[var(--accent-primary)] underline-offset-2 hover:underline"
            >
              Algo está errado?
            </a>
          </div>
        </AwCard>
      </div>
    </div>
  );
}
