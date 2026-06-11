"use client";

import { useEffect, useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwField, AwInput } from "@/components/ui/AwInput";
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
  const [cargo, setCargo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mode, setMode] = useState<"form" | "success">("form");

  /* Reset modal state every time it (re)opens so the user never sees stale
   * input from a previous invite flow. */
  useEffect(() => {
    if (open) {
      setEmails([]);
      setDraft("");
      setRole(null);
      setCargo("");
      setTelefone("");
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
          <p className="m-0 body-xs text-(--fg-secondary) text-pretty">
            Convide novos membros para sua organização através do e-mail. Para
            adicionar várias pessoas de uma vez, digite o e-mail e pressione{" "}
            <kbd className="rounded-xs border border-(--border-subtle) bg-(--bg-muted) px-1.5 font-sans font-medium text-(--fg-primary)">
              Enter
            </kbd>{" "}
            entre cada um.
          </p>

          {/* E-mail field — chips wrap em linhas independentes */}
          <AwField label="E-mail" htmlFor="invite-emails">
            <div className="aw-input h-auto! min-h-[42px] items-start py-1">
              <Icon
                name="mail"
                size={16}
                className="mt-[7px] shrink-0 text-(--fg-tertiary)"
              />
              <div className="flex flex-1 flex-wrap items-center gap-1.5 py-1">
                {emails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex max-w-full items-center gap-1 rounded-full border border-(--border-subtle) bg-(--bg-muted) py-0.5 pl-2.5 pr-1 body-xs text-(--fg-primary)"
                  >
                    <span className="truncate">{email}</span>
                    <button
                      type="button"
                      aria-label={`Remover ${email}`}
                      onClick={() => removeEmail(email)}
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-(--fg-tertiary) hover:bg-(--bg-surface) hover:text-(--fg-primary)"
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </span>
                ))}
                <input
                  id="invite-emails"
                  type="email"
                  className="min-w-[180px] flex-1 border-0 bg-transparent p-0 body-xs text-(--fg-primary) outline-hidden placeholder:text-(--fg-tertiary)"
                  placeholder={
                    emails.length === 0
                      ? "Digite o e-mail e pressione Enter"
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
                    <span className="text-(--fg-tertiary)">
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
                      <span className="flex items-center gap-2 body-xs font-medium text-(--fg-primary)">
                        {r.name}
                        <span className="body-xs font-normal text-(--accent-success)">
                          {r.capabilities.length} permiss
                          {r.capabilities.length === 1 ? "ão" : "ões"}
                        </span>
                      </span>
                      <span className="body-xs text-(--fg-secondary)">
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
                    <span className="flex items-center gap-2 body-xs font-medium text-(--fg-primary)">
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

          {/* Cargo + telefone — contexto extra do convite, opcionais */}
          <div className="grid grid-cols-2 gap-4">
            <AwField label="Cargo (opcional)" htmlFor="invite-cargo">
              <AwInput
                id="invite-cargo"
                iconLeft="badge"
                placeholder="Ex.: Analista de CRM"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              />
            </AwField>
            <AwField label="Telefone (opcional)" htmlFor="invite-telefone">
              <AwInput
                id="invite-telefone"
                iconLeft="call"
                type="tel"
                placeholder="+55 11 90000-0000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </AwField>
          </div>

          {/* Role description card */}
          {selectedRoleDef && (
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-muted) p-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)">
                  <Icon name={selectedRoleDef.icon} size={15} />
                </span>
                <p className="m-0 body-xs font-semibold text-(--fg-primary)">
                  {selectedRoleDef.name}
                </p>
                <a
                  href="/settings/equipe-permissoes/funcoes"
                  className="ml-auto inline-flex items-center gap-1 body-xs font-medium text-(--accent-brand) hover:underline"
                >
                  Saiba mais
                  <Icon name="arrow_outward" size={12} />
                </a>
              </div>
              <p className="m-0 mt-2.5 body-xs text-(--fg-secondary) text-pretty">
                {selectedRoleDef.description}
              </p>
              {selectedRoleDef.idealFor && (
                <p className="m-0 mt-2 body-xs text-(--fg-primary)">
                  <span className="font-medium">Função ideal para:</span>{" "}
                  <span className="text-(--fg-secondary)">
                    {selectedRoleDef.idealFor}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-(--border-subtle) bg-(--bg-muted) text-(--accent-success)">
            <Icon name="check" size={26} />
          </span>
          <h6 className="m-0 text-(--fg-primary)">
            Convite{emails.length === 1 ? " foi" : "s foram"} enviado
            {emails.length === 1 ? "" : "s"}!
          </h6>
          <p className="m-0 max-w-[360px] body-xs text-(--fg-secondary) text-pretty">
            {emails.length === 1
              ? "O convite foi enviado para o e-mail informado."
              : `Enviamos ${emails.length} convites. Os destinatários receberão o link de acesso por e-mail.`}
          </p>
        </div>
      )}
    </AwModal>
  );
}
