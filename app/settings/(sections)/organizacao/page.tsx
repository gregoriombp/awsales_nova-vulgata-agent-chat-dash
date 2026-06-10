"use client";

import { useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwSelect } from "@/components/ui/AwSelect";
import { Icon } from "@/components/ui/Icon";
import { ONBOARDING_ORG, fmtBRL } from "@/app/primeiro-acesso/_data";
import { SaveBar, SectionHeading, SettingsPageHeader } from "../_components/shared";

const COMPANY_ROWS = [
  { label: "Razão social", value: ONBOARDING_ORG.razaoSocial },
  { label: "CNPJ", value: ONBOARDING_ORG.cnpj, tabular: true },
  { label: "Segmento", value: ONBOARDING_ORG.segmento },
  {
    label: "Plano contratado",
    value: `${ONBOARDING_ORG.plan} · ${ONBOARDING_ORG.intervaloPlano} · ${fmtBRL(ONBOARDING_ORG.valorMensal).replace(",00", "")}/mês`,
  },
  { label: "Data de criação", value: "11 de mai. 2026" },
];

export default function OrganizationSettingsPage() {
  const [orgName, setOrgName] = useState<string>(ONBOARDING_ORG.name);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Organização"
        description="Como sua empresa aparece nos agentes, conversas e exportações."
      />

      <AwCard className="p-0!">
        <div className="flex items-center gap-4 border-b border-(--border-subtle) px-6 py-5">
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-(--bg-muted)">
            <img
              src={ONBOARDING_ORG.logo}
              alt={orgName}
              width={48}
              height={48}
              style={{ objectFit: "cover" }}
            />
          </span>
          <div className="flex-1">
            <p className="m-0 body-sm font-medium text-(--fg-primary)">
              Logo da organização
            </p>
            <p className="m-0 body-xs text-(--fg-secondary)">
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
          <AwField label="Indústria">
            <AwSelect>Educação / Infoprodutos</AwSelect>
          </AwField>
          <AwField label="Tamanho do time">
            <AwSelect>11 — 50 pessoas</AwSelect>
          </AwField>
        </div>
        <SaveBar />
      </AwCard>

      <div className="mt-10">
        <SectionHeading
          title="Dados contratuais"
          description="Cadastrados pela equipe Aswork no fechamento do contrato. Para alterar, abra um chamado com seu Account Manager."
        />
        <AwCard className="p-0!">
          <dl className="m-0">
            {COMPANY_ROWS.map((row, i) => (
              <div
                key={row.label}
                className={
                  "grid grid-cols-[200px_1fr_auto] items-center gap-4 px-6 py-3.5" +
                  (i < COMPANY_ROWS.length - 1
                    ? " border-b border-(--border-subtle)"
                    : "")
                }
              >
                <dt className="m-0 body-xs text-(--fg-tertiary)">
                  {row.label}
                </dt>
                <dd
                  className="m-0 body-xs font-medium text-(--fg-primary)"
                  style={
                    row.tabular ? { fontVariantNumeric: "tabular-nums" } : undefined
                  }
                >
                  {row.value}
                </dd>
                <span
                  className="text-(--fg-tertiary)"
                  title="Campo somente leitura — definido em contrato"
                >
                  <Icon name="lock" size={14} />
                </span>
              </div>
            ))}
          </dl>
          <div className="flex items-center justify-between gap-4 border-t border-(--border-subtle) px-6 py-3">
            <span className="flex items-center gap-2 text-(--fg-secondary)">
              <Icon name="warning" size={14} />
              <a
                href="#"
                className="body-xs font-medium text-(--accent-brand) underline-offset-2 hover:underline"
              >
                Algo está errado?
              </a>
            </span>
            <AwButton size="sm" variant="secondary" iconLeft="download">
              Baixar contrato
            </AwButton>
          </div>
        </AwCard>
      </div>
    </div>
  );
}
