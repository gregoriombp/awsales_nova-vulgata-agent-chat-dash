"use client";

import { useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwSelect } from "@/components/ui/AwSelect";
import { SaveBar, SettingsPageHeader } from "../_components/shared";

export default function OrganizationSettingsPage() {
  const [orgName, setOrgName] = useState("Nome da organização");
  const [orgSlug, setOrgSlug] = useState("artificial-concord");

  return (
    <div className="mx-auto w-full max-w-[760px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Organização"
        description="Como sua empresa aparece nos agentes, conversas e exportações."
      />
      <AwCard className="!p-0">
        <div className="flex items-center gap-4 border-b border-[var(--border-subtle)] px-6 py-5">
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-[var(--bg-muted)]">
            <img
              src="/assets/icon_artificial_concord_organization.png"
              alt={orgName}
              width={48}
              height={48}
              style={{ objectFit: "cover" }}
            />
          </span>
          <div className="flex-1">
            <p className="m-0 text-[14px] font-medium text-[var(--fg-primary)]">
              Logo da organização
            </p>
            <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
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
    </div>
  );
}
