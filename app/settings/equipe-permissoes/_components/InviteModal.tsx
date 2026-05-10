"use client";

import { useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwField } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwSelect } from "@/components/ui/AwSelect";
import { Icon } from "@/components/ui/Icon";
import { PROJECT_OPTIONS, ROLE_OPTIONS, type Role } from "./data";

export function InviteModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [emails, setEmails] = useState<string[]>([
    "alexsmith.mobbin@gmail.com",
  ]);
  const [draft, setDraft] = useState("");
  const [role, setRole] = useState<Role>("Owner");
  const [projects, setProjects] = useState<string[]>([...PROJECT_OPTIONS]);

  const allProjectsSelected = projects.length === PROJECT_OPTIONS.length;
  const projectsLabel = allProjectsSelected
    ? "Todos selecionados"
    : projects.length === 0
      ? "Selecionar projetos"
      : `${projects.length} projeto${projects.length === 1 ? "" : "s"}`;

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

  const toggleProject = (name: string) => {
    setProjects((curr) =>
      curr.includes(name) ? curr.filter((p) => p !== name) : [...curr, name]
    );
  };

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Convidar membros do time"
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton
            size="sm"
            variant="primary"
            iconLeft="send"
            disabled={emails.length === 0}
            onClick={onClose}
          >
            Enviar convites
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_180px]">
          <AwField
            label="Emails"
            helper="Pressione Enter ou vírgula para adicionar."
            htmlFor="invite-emails"
          >
            <div className="aw-input">
              <Icon name="mail" size={16} />
              <div className="flex flex-1 flex-wrap items-center gap-1.5">
                {emails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] px-2 py-0.5 text-[12px] text-[var(--fg-primary)]"
                  >
                    {email}
                    <button
                      type="button"
                      aria-label={`Remover ${email}`}
                      onClick={() => removeEmail(email)}
                      className="flex h-4 w-4 items-center justify-center rounded-[var(--radius-xs)] text-[var(--fg-tertiary)] hover:bg-[var(--bg-surface)] hover:text-[var(--fg-primary)]"
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </span>
                ))}
                <input
                  id="invite-emails"
                  type="email"
                  className="min-w-[140px] flex-1 border-0 bg-transparent p-0 text-[13.5px] text-[var(--fg-primary)] outline-none placeholder:text-[var(--fg-tertiary)]"
                  placeholder={emails.length === 0 ? "nome@empresa.com" : ""}
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

          <AwField label="Função">
            <AwDropdownMenu
              align="end"
              trigger={<AwSelect>{role}</AwSelect>}
              items={ROLE_OPTIONS.map((r) => ({
                id: r,
                label: r,
                checked: r === role,
                onSelect: () => setRole(r),
              }))}
            />
          </AwField>
        </div>

        <AwField
          label="Convidar para projetos"
          helper="Membros podem ser adicionados a outros projetos depois."
        >
          <AwDropdownMenu
            align="start"
            trigger={
              <AwSelect className="w-full justify-between">
                {projectsLabel}
              </AwSelect>
            }
            items={PROJECT_OPTIONS.map((p) => ({
              id: p,
              label: p,
              checked: projects.includes(p),
              onSelect: () => toggleProject(p),
            }))}
          />
        </AwField>
      </div>
    </AwModal>
  );
}
