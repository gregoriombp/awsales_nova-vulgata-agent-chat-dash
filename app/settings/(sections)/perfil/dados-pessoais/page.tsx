"use client";

import { useRef, useState } from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwSelect } from "@/components/ui/AwSelect";
import { SettingsPageHeader } from "../../_components/shared";

const INITIAL = {
  fullName: "Gregório Pinheiro",
  email: "greg@awsales.io",
  phone: "+55 (11) 98765-4321",
  role: "Super Administrador",
  timezone: "America/Sao_Paulo",
  memberSince: "12 jan. 2026",
};

const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "(GMT−3) Brasília — São Paulo" },
  { value: "America/Fortaleza", label: "(GMT−3) Fortaleza" },
  { value: "America/Recife", label: "(GMT−3) Recife" },
  { value: "America/Manaus", label: "(GMT−4) Manaus" },
  { value: "America/Cuiaba", label: "(GMT−4) Cuiabá" },
  { value: "America/Porto_Velho", label: "(GMT−4) Porto Velho" },
  { value: "America/Rio_Branco", label: "(GMT−5) Rio Branco" },
  { value: "America/Noronha", label: "(GMT−2) Fernando de Noronha" },
  { value: "UTC", label: "(GMT+0) UTC" },
];

function tzLabel(value: string) {
  return TIMEZONES.find((t) => t.value === value)?.label ?? value;
}

export default function DadosPessoaisPage() {
  const [fullName, setFullName] = useState(INITIAL.fullName);
  const [phone, setPhone] = useState(INITIAL.phone);
  const [timezone, setTimezone] = useState(INITIAL.timezone);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const dirty =
    fullName.trim() !== INITIAL.fullName ||
    phone !== INITIAL.phone ||
    timezone !== INITIAL.timezone;

  function handleSave() {
    // TODO: submit via API
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleCancel() {
    setFullName(INITIAL.fullName);
    setPhone(INITIAL.phone);
    setTimezone(INITIAL.timezone);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="mx-auto w-full max-w-[820px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Dados pessoais"
        description="Suas informações de perfil — visíveis para membros da organização."
      />

      {/* Foto de perfil */}
      <div className="mb-8 flex items-center gap-5">
        <AwAvatar
          size="lg"
          src={previewSrc ?? "/assets/users/greg.jpg"}
          alt={fullName}
          initials={initials(fullName)}
          className="h-16! w-16!"
        />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <AwButton
              size="sm"
              variant="secondary"
              iconLeft="photo_camera"
              onClick={() => setPhotoOpen(true)}
            >
              Trocar foto
            </AwButton>
            <AwButton
              size="sm"
              variant="ghost"
              onClick={() => setPreviewSrc(null)}
            >
              Remover
            </AwButton>
          </div>
          <p className="m-0 body-xs text-(--fg-tertiary)">
            PNG ou JPG, até 2 MB. Aparece no topo e nas conversas.
          </p>
        </div>
      </div>

      {/* Form */}
      <AwCard className="p-6!">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <AwField label="Nome completo" htmlFor="full-name">
            <AwInput
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </AwField>

          <AwField
            label="E-mail"
            htmlFor="email"
            helper="Gerenciado pela organização."
          >
            <AwInput id="email" value={INITIAL.email} disabled />
          </AwField>

          <AwField
            label="Telefone"
            htmlFor="phone"
            helper="Usado para notificações por WhatsApp e contato de cobrança."
          >
            <AwInput
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              autoComplete="tel"
              placeholder="+55 (11) 00000-0000"
            />
          </AwField>

          <AwField
            label="Função na organização"
            htmlFor="role"
            helper="Definida pela organização."
          >
            <AwInput id="role" value={INITIAL.role} disabled />
          </AwField>

          <AwField label="Fuso horário">
            <AwDropdownMenu
              trigger={<AwSelect className="w-full">{tzLabel(timezone)}</AwSelect>}
              items={TIMEZONES.map((tz) => ({
                id: tz.value,
                label: tz.label,
                onSelect: () => setTimezone(tz.value),
              }))}
            />
          </AwField>

          <AwField label="Membro desde" htmlFor="member-since">
            <AwInput id="member-since" value={INITIAL.memberSince} disabled />
          </AwField>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-(--border-subtle) pt-5">
          <AwButton
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={!dirty}
          >
            Cancelar
          </AwButton>
          <AwButton
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!dirty}
          >
            {saved ? "Salvo" : "Salvar alterações"}
          </AwButton>
        </div>
      </AwCard>

      {/* Modal — trocar foto */}
      <AwModal
        open={photoOpen}
        onClose={() => setPhotoOpen(false)}
        title="Foto de perfil"
        footer={
          <>
            <AwButton
              size="sm"
              variant="ghost"
              onClick={() => setPhotoOpen(false)}
            >
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              onClick={() => setPhotoOpen(false)}
            >
              Salvar
            </AwButton>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <AwAvatar
            size="lg"
            src={previewSrc ?? "/assets/users/greg.jpg"}
            alt={fullName}
            initials={initials(fullName)}
            className="h-24! w-24!"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg"
            className="sr-only"
            onChange={handleFileChange}
          />
          <AwButton
            size="sm"
            variant="secondary"
            iconLeft="upload"
            onClick={() => fileRef.current?.click()}
          >
            Fazer upload
          </AwButton>
          <p className="m-0 body-xs text-(--fg-tertiary) text-center">
            PNG ou JPG · mínimo 200×200 px · até 2 MB.
          </p>
        </div>
      </AwModal>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
