"use client";

import { useState } from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwSelect } from "@/components/ui/AwSelect";
import { SaveBar, SettingsPageHeader } from "../_components/shared";

export default function ProfileSettingsPage() {
  const [fullName, setFullName] = useState("Gregório Pinheiro");
  const [email] = useState("greg@awsales.io");
  const [role, setRole] = useState("Super Administrador");

  return (
    <div className="mx-auto w-full max-w-[760px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Perfil"
        description="Suas informações pessoais e como aparecem no produto."
      />
      <AwCard className="!p-0">
        <div className="flex items-center gap-4 border-b border-[var(--border-subtle)] px-6 py-5">
          <AwAvatar
            size="lg"
            src="/assets/users/greg.jpg"
            alt={fullName}
            initials="GP"
          />
          <div className="flex-1">
            <p className="m-0 text-[14px] font-medium text-[var(--fg-primary)]">
              Foto de perfil
            </p>
            <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
              PNG ou JPG, mínimo 200×200 px.
            </p>
          </div>
          <AwButton size="sm" variant="secondary" iconLeft="upload">
            Trocar foto
          </AwButton>
        </div>
        <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
          <AwField label="Nome completo" htmlFor="profile-name">
            <AwInput
              id="profile-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </AwField>
          <AwField label="Email" htmlFor="profile-email">
            <AwInput id="profile-email" value={email} readOnly />
          </AwField>
          <AwField label="Função" htmlFor="profile-role">
            <AwInput
              id="profile-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </AwField>
          <AwField label="Idioma da interface">
            <AwSelect>Português (Brasil)</AwSelect>
          </AwField>
          <AwField label="Fuso horário">
            <AwSelect>(GMT−03:00) Brasília · São Paulo</AwSelect>
          </AwField>
          <AwField
            label="Formato de data"
            helper="Aplicado em relatórios e exportações."
          >
            <AwSelect>DD/MM/AAAA</AwSelect>
          </AwField>
        </div>
        <SaveBar />
      </AwCard>
    </div>
  );
}
