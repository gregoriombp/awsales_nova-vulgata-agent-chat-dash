"use client";

import { useEffect, useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwField } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwSelect } from "@/components/ui/AwSelect";
import { Icon } from "@/components/ui/Icon";
import { ROLE_DEFINITIONS, type Role } from "./data";

export function InviteModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [mode, setMode] = useState<"form" | "success">("form");

  /* Reset modal state every time it (re)opens so the user never sees stale
   * input from a previous invite flow. */
  useEffect(() => {
    if (open) {
      setEmails([]);
      setDraft("");
      setRole(null);
      setMode("form");
    }
  }, [open]);

  const commitDraft = () => {
    const value = draft.trim().replace(/,$/, "").trim();
    if (!value) return;
    if (emails.includes(value)) {
      setDraft("");
      return;
    }
    setEmails([...emails, value]);
    setDraft("");
  };

  const removeEmail = (target: string) => {
    setEmails(emails.filter((e) => e !== target));
  };

  const selectedRoleDef = role
    ? ROLE_DEFINITIONS.find((r) => r.name === role) ?? null
    : null;

  const canSubmit = emails.length > 0 && role !== null;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setMode("success");
  };

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title={mode === "form" ? "Convidar membros do time" : undefined}
      footer={
        mode === "form" ? (
          <>
            <AwButton size="sm" variant="ghost" onClick={onClose}>
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              iconLeft="send"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Convidar
            </AwButton>
          </>
        ) : (
          <AwButton size="sm" variant="primary" onClick={onClose}>
            Fechar
          </AwButton>
        )
      }
    >
      {mode === "form" ? (
        <div className="flex flex-col gap-5">
          <p className="m-0 text-[13px] leading-[1.55] text-[var(--fg-secondary)]">
            Convide novos membros para sua organização através do e-mail. Pra
            adicionar várias pessoas de uma vez, digite o e-mail e aperte{" "}
            <strong className="font-medium">Enter</strong> entre cada um.
          </p>

          {/* E-mail field — chips wrap em linhas independentes */}
          <AwField label="E-mail" htmlFor="invite-emails">
            <div className="aw-input items-start">
              <Icon
                name="mail"
                size={16}
                className="mt-[7px] shrink-0 text-[var(--fg-tertiary)]"
              />
              <div className="flex flex-1 flex-wrap items-center gap-1.5 py-1">
                {emails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex max-w-full items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] px-2 py-1 text-[12.5px] text-[var(--fg-primary)]"
                  >
                    <span className="truncate">{email}</span>
                    <button
                      type="button"
                      aria-label={`Remover ${email}`}
                      onClick={() => removeEmail(email)}
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius-xs)] text-[var(--fg-tertiary)] hover:bg-[var(--bg-surface)] hover:text-[var(--fg-primary)]"
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </span>
                ))}
                <input
                  id="invite-emails"
                  type="email"
                  className="min-w-[180px] flex-1 border-0 bg-transparent p-0 text-[13.5px] text-[var(--fg-primary)] outline-none placeholder:text-[var(--fg-tertiary)]"
                  placeholder={
                    emails.length === 0
                      ? "Digite o e-mail e aperte 'Enter'."
                      : ""
                  }
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      commitDraft();
                    } else if (
                      e.key === "Backspace" &&
                      draft.length === 0 &&
                      emails.length > 0
                    ) {
                      setEmails(emails.slice(0, -1));
                    }
                  }}
                  onBlur={commitDraft}
                />
              </div>
            </div>
          </AwField>

          {/* Role picker — dropdown with role cards */}
          <AwField label="Convidar como" htmlFor="invite-role">
            <AwDropdownMenu
              align="start"
              trigger={
                <AwSelect
                  className="w-full justify-between"
                  id="invite-role"
                >
                  {role ?? (
                    <span className="text-[var(--fg-tertiary)]">
                      Selecione a função
                    </span>
                  )}
                </AwSelect>
              }
              items={[
                ...ROLE_DEFINITIONS.map((r) => ({
                  id: r.id,
                  label: (
                    <span className="flex flex-col gap-0.5 py-1">
                      <span className="flex items-center gap-2 text-[13.5px] font-medium text-[var(--fg-primary)]">
                        {r.name}
                        <span className="text-[11.5px] font-normal text-[var(--accent-success)]">
                          {r.capabilities.length} permiss
                          {r.capabilities.length === 1 ? "ão" : "ões"}
                        </span>
                      </span>
                      <span className="text-[11.5px] leading-[1.45] text-[var(--fg-secondary)]">
                        {r.description}
                      </span>
                    </span>
                  ),
                  checked: role === r.name,
                  onSelect: () => setRole(r.name as Role),
                })),
                { id: "sep", separator: true as const },
                {
                  id: "new-role",
                  label: (
                    <span className="flex items-center gap-2 text-[13px] font-medium text-[var(--fg-primary)]">
                      <Icon name="add" size={14} />
                      Criar nova função
                    </span>
                  ),
                  onSelect: () => {
                    /* Stub — wire to /funcoes editor later. */
                  },
                },
              ]}
            />
          </AwField>

          {/* Role description card */}
          {selectedRoleDef && (
            <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-4">
              <p className="m-0 text-[13.5px] font-semibold text-[var(--fg-primary)]">
                {selectedRoleDef.name}
              </p>
              <p className="m-0 mt-1 text-[12.5px] leading-[1.55] text-[var(--fg-secondary)]">
                {selectedRoleDef.description}
              </p>
              {selectedRoleDef.idealFor && (
                <p className="m-0 mt-2 text-[12.5px] leading-[1.55] text-[var(--fg-primary)]">
                  <span className="font-semibold">Função ideal para:</span>{" "}
                  <span className="text-[var(--fg-secondary)]">
                    {selectedRoleDef.idealFor}
                  </span>
                </p>
              )}
              <a
                href="/settings/equipe-permissoes/funcoes"
                className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--accent-brand)] hover:underline"
              >
                Saiba mais
                <Icon name="arrow_outward" size={12} />
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-muted)] text-[var(--accent-success)]">
            <Icon name="check" size={28} />
          </span>
          <p className="m-0 text-[18px] font-semibold text-[var(--fg-primary)]">
            Convite{emails.length === 1 ? " foi" : "s foram"} enviado
            {emails.length === 1 ? "" : "s"}!
          </p>
          <p className="m-0 max-w-[360px] text-[13px] leading-[1.55] text-[var(--fg-secondary)]">
            {emails.length === 1
              ? "O convite foi enviado para o e-mail informado."
              : `Enviamos ${emails.length} convites. Os destinatários receberão o link de acesso por e-mail.`}
          </p>
        </div>
      )}
    </AwModal>
  );
}
