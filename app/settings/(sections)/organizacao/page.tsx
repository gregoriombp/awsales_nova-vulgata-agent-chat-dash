"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwContactChannelModal } from "@/components/ui/AwContactChannelModal";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPlanIcon } from "@/components/ui/AwPlanIcon";
import { AwSelect } from "@/components/ui/AwSelect";
import { useToast } from "@/components/ui/AwToast";
import { Icon } from "@/components/ui/Icon";
import { ONBOARDING_ORG, fmtBRL } from "@/app/primeiro-acesso/_data";
import { SectionHeading, SettingsPageHeader } from "../_components/shared";

const ORG_SETOR = "Educação e Infoprodutos";
const ORG_TEAM = "32 membros";
const AM = ONBOARDING_ORG.accountManager;

const COMPANY_ROWS = [
  { label: "Razão social", value: ONBOARDING_ORG.razaoSocial },
  { label: "CNPJ", value: ONBOARDING_ORG.cnpj, tabular: true },
  { label: "Segmento", value: ONBOARDING_ORG.segmento },
  { label: "Porte", value: ONBOARDING_ORG.porte.replace("FTE", "colaboradores") },
  {
    label: "Plano contratado",
    value: `${ONBOARDING_ORG.plan} · ${ONBOARDING_ORG.intervaloPlano} · ${fmtBRL(ONBOARDING_ORG.valorMensal).replace(",00", "")}/mês`,
  },
  { label: "Data de criação", value: "11 de mai. 2026" },
];

const INFO_ROWS: {
  icon: string;
  label: string;
  value: string;
  href?: string;
}[] = [
  { icon: "school", label: "Setor", value: ORG_SETOR },
  {
    icon: "group",
    label: "Equipe",
    value: ORG_TEAM,
    href: "/settings/equipe-permissoes",
  },
];

function InfoRowBody({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--fg-primary) text-(--bg-canvas)">
        <Icon name={icon} size={20} />
      </span>
      <div className="min-w-0">
        <p className="m-0 body-xs text-(--fg-tertiary)">{label}</p>
        <p className="m-0 body-sm font-medium text-(--fg-primary)">{value}</p>
      </div>
    </>
  );
}

/** Ícone do plano num tile escuro — o glyph é claro e sumia no fundo branco. */
function PlanIconTile() {
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-(--bg-inverse)">
      <AwPlanIcon plan="pro" variant="dark" size={15} />
    </span>
  );
}

export default function OrganizationSettingsPage() {
  const toast = useToast();
  const [orgName, setOrgName] = useState<string>(ONBOARDING_ORG.name);
  const [logoSrc, setLogoSrc] = useState<string>(ONBOARDING_ORG.logo);
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftName, setDraftName] = useState<string>(ONBOARDING_ORG.name);
  const [draftLogo, setDraftLogo] = useState<string>(ONBOARDING_ORG.logo);
  const logoFileRef = useRef<HTMLInputElement | null>(null);

  const openEdit = () => {
    setDraftName(orgName);
    setDraftLogo(logoSrc);
    setSaving(false);
    setEditOpen(true);
  };
  const editDirty =
    draftName.trim() !== orgName || draftLogo !== logoSrc;
  const saveEdit = () => {
    if (saving) return;
    setSaving(true);
    window.setTimeout(() => {
      setOrgName(draftName.trim() || orgName);
      setLogoSrc(draftLogo);
      setSaving(false);
      setEditOpen(false);
      toast.push({
        variant: "success",
        title: "Alterações salvas",
        description: "Nome e logo da organização foram atualizados.",
      });
    }, 900);
  };

  const handleLogoFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.push({
        variant: "warning",
        title: "Arquivo muito grande",
        description: "O logo precisa ter até 2 MB. Tente um arquivo menor.",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setDraftLogo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadContract = () => {
    const lines = [
      "AwSales — Resumo contratual",
      "",
      `Razão social: ${ONBOARDING_ORG.razaoSocial}`,
      `CNPJ: ${ONBOARDING_ORG.cnpj}`,
      `Segmento: ${ONBOARDING_ORG.segmento}`,
      `Plano contratado: ${ONBOARDING_ORG.plan} · ${ONBOARDING_ORG.intervaloPlano} · ${fmtBRL(ONBOARDING_ORG.valorMensal).replace(",00", "")}/mês`,
      `Fidelidade: ${ONBOARDING_ORG.fidelidade}`,
      "Data de criação: 11 de mai. 2026",
      "",
      `Account Manager: ${AM.name} · ${AM.email}`,
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contrato-fyntra-tecnologia.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Organização"
        description="Como sua empresa aparece nos agentes, conversas e exportações."
      />

      {/* Identidade da organização + resumo */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="flex items-center gap-4">
          <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-(--bg-muted)">
            <img
              src={logoSrc}
              alt={orgName}
              width={96}
              height={96}
              style={{ objectFit: "cover" }}
            />
          </span>
          <div className="min-w-0">
            <h4 className="m-0 truncate text-(--fg-primary)">{orgName}</h4>
            <p className="m-0 mt-1 flex items-center gap-2 body-sm text-(--fg-secondary)">
              <PlanIconTile />
              Plano {ONBOARDING_ORG.plan}
            </p>
          </div>
        </div>

        <AwCard className="p-0!">
          <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
            <h6 className="m-0 text-(--fg-primary)">Informações</h6>
            <AwButton
              size="sm"
              variant="primary"
              iconLeft="edit"
              onClick={openEdit}
            >
              Editar
            </AwButton>
          </div>
          <ul className="m-0 flex list-none flex-col gap-1 px-4 pb-4">
            {INFO_ROWS.map((row) => (
              <li key={row.label}>
                {row.href ? (
                  <Link
                    href={row.href}
                    className="group/row flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-(--bg-hover)"
                  >
                    <InfoRowBody
                      icon={row.icon}
                      label={row.label}
                      value={row.value}
                    />
                    <Icon
                      name="chevron_right"
                      size={18}
                      className="ml-auto shrink-0 text-(--fg-tertiary) transition-transform group-hover/row:translate-x-0.5"
                    />
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-2 py-2">
                    <InfoRowBody
                      icon={row.icon}
                      label={row.label}
                      value={row.value}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </AwCard>
      </div>

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
                  className={
                    "m-0 body-xs font-medium text-(--fg-primary)" +
                    (row.label === "Plano contratado"
                      ? " flex items-center gap-2"
                      : "")
                  }
                  style={
                    row.tabular ? { fontVariantNumeric: "tabular-nums" } : undefined
                  }
                >
                  {row.label === "Plano contratado" && (
                    <PlanIconTile />
                  )}
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
        </AwCard>
        <p className="m-0 mt-3 inline-flex items-center gap-1.5 body-xs text-(--fg-tertiary)">
          <Icon name="lock" size={14} />
          O cadeado indica campos somente leitura, cadastrados pela equipe Aswork
          no contrato.
        </p>
        <div className="mt-1 flex items-center justify-between gap-4 py-2">
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-2 text-(--fg-secondary) hover:text-(--fg-primary)"
          >
            <Icon name="help" size={14} />
            <span className="body-xs font-medium text-(--accent-brand) underline-offset-2 hover:underline">
              Algo está errado?
            </span>
          </button>
          <AwButton
            size="sm"
            variant="secondary"
            iconLeft="download"
            onClick={handleDownloadContract}
          >
            Baixar contrato
          </AwButton>
        </div>
      </div>

      {/* Modal — editar organização */}
      <AwModal
        open={editOpen}
        onClose={() => {
          if (!saving) setEditOpen(false);
        }}
        title="Editar organização"
        footer={
          <>
            <AwButton
              size="sm"
              variant="ghost"
              disabled={saving}
              onClick={() => setEditOpen(false)}
            >
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              loading={saving}
              disabled={!editDirty || !draftName.trim()}
              onClick={saveEdit}
            >
              {saving ? "Salvando…" : "Salvar alterações"}
            </AwButton>
          </>
        }
      >
        <div className="flex items-center gap-4 pb-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-(--bg-muted)">
            <img
              src={draftLogo}
              alt={orgName}
              width={56}
              height={56}
              style={{ objectFit: "cover" }}
            />
          </span>
          <div className="flex-1">
            <p className="m-0 body-sm font-medium text-(--fg-primary)">
              Logo da organização
            </p>
            <p className="m-0 body-xs text-(--fg-secondary)">
              PNG, JPG ou SVG · até 2 MB · mínimo 200×200 px.
            </p>
          </div>
          <AwButton
            size="sm"
            variant="secondary"
            iconLeft="upload"
            onClick={() => logoFileRef.current?.click()}
          >
            Trocar logo
          </AwButton>
          <input
            ref={logoFileRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className="hidden"
            onChange={(e) => handleLogoFile(e.target.files?.[0])}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AwField label="Nome da organização" htmlFor="org-name">
            <AwInput
              id="org-name"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
            />
          </AwField>
          <AwField label="Setor">
            <AwSelect>{ORG_SETOR}</AwSelect>
          </AwField>
        </div>
      </AwModal>

      {/* Modal — algo está errado nos dados contratuais */}
      <AwModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Algo está errado nos dados?"
        footer={
          <>
            <AwButton
              size="sm"
              variant="ghost"
              onClick={() => setReportOpen(false)}
            >
              Fechar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              iconLeft="chat_bubble"
              onClick={() => {
                setReportOpen(false);
                setContactOpen(true);
              }}
            >
              Falar com o Account Manager
            </AwButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="m-0 body-sm text-(--fg-secondary)">
            Os dados contratuais são registrados pela equipe Aswork no
            fechamento do contrato e ficam bloqueados para edição direta. Para
            corrigir qualquer informação, fale com seu Account Manager — ele
            abre o chamado de atualização.
          </p>
          <div className="flex items-center gap-3 rounded-lg bg-(--bg-muted) px-4 py-3.5">
            <AwAvatar src={AM.photo} alt={AM.name} initials={AM.initials} />
            <div className="min-w-0 flex-1">
              <p className="m-0 body-sm font-medium text-(--fg-primary)">
                {AM.name}
              </p>
              <p className="m-0 body-xs text-(--fg-secondary)">{AM.role}</p>
            </div>
          </div>
        </div>
      </AwModal>

      {/* Modal — canal de contato com o Account Manager */}
      <AwContactChannelModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        managerName={AM.name}
      />
    </div>
  );
}
