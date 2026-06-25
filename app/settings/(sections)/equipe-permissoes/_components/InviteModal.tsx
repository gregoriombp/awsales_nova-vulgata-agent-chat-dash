"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwToggle } from "@/components/ui/AwToggle";
import { Icon } from "@/components/ui/Icon";
import { ROLE_DEFINITIONS, type Role } from "./data";

const MAX_EMAILS_PER_BLOCK = 20;

/** Um grupo de convites: uma função + os e-mails que entram com ela. */
type InviteBlock = {
  id: string;
  role: Role | null;
  emails: string[];
  draft: string;
};

function emptyBlock(): InviteBlock {
  return { id: `block-${Date.now()}-${Math.random()}`, role: null, emails: [], draft: "" };
}

export function InviteModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [blocks, setBlocks] = useState<InviteBlock[]>([emptyBlock()]);
  const [cargo, setCargo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [receivesInvoices, setReceivesInvoices] = useState(false);
  const [mode, setMode] = useState<"form" | "success">("form");

  /* Reset modal state every time it (re)opens so the user never sees stale
   * input from a previous invite flow. */
  useEffect(() => {
    if (open) {
      setBlocks([emptyBlock()]);
      setCargo("");
      setTelefone("");
      setReceivesInvoices(false);
      setMode("form");
    }
  }, [open]);

  const patchBlock = (id: string, patch: Partial<InviteBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const commitDraft = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const value = b.draft.trim().replace(/,$/, "").trim();
        if (!value || b.emails.includes(value) || b.emails.length >= MAX_EMAILS_PER_BLOCK) {
          return { ...b, draft: "" };
        }
        return { ...b, emails: [...b.emails, value], draft: "" };
      })
    );
  };

  const removeEmail = (id: string, target: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, emails: b.emails.filter((e) => e !== target) } : b
      )
    );
  };

  const addBlock = () => setBlocks((prev) => [...prev, emptyBlock()]);
  const removeBlock = (id: string) =>
    setBlocks((prev) => (prev.length === 1 ? prev : prev.filter((b) => b.id !== id)));

  const totalEmails = blocks.reduce((acc, b) => acc + b.emails.length, 0);
  const usedRoles = blocks.filter((b) => b.role !== null).length;
  const multiBlock = blocks.length > 1;
  // Cada bloco preenchido precisa de função + ao menos um e-mail.
  const canSubmit =
    blocks.length > 0 &&
    blocks.every((b) => b.emails.length > 0 && b.role !== null) &&
    totalEmails > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setMode("success");
  };

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title={mode === "form" ? "Convidar membros" : undefined}
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
            Convide por e-mail. Digite e pressione{" "}
            <kbd className="rounded-xs border border-(--border-subtle) bg-(--bg-muted) px-1.5 font-sans font-medium text-(--fg-primary)">
              Enter
            </kbd>{" "}
            entre cada um. Para misturar funções no mesmo envio, adicione outro
            grupo abaixo.
          </p>

          <div className="flex flex-col gap-4">
            {blocks.map((block, i) => (
              <InviteBlockFields
                key={block.id}
                block={block}
                index={i}
                showHeader={multiBlock}
                removable={multiBlock}
                onPatch={(patch) => patchBlock(block.id, patch)}
                onCommitDraft={() => commitDraft(block.id)}
                onRemoveEmail={(email) => removeEmail(block.id, email)}
                onRemove={() => removeBlock(block.id)}
              />
            ))}
          </div>

          <AwButton
            size="sm"
            variant="ghost"
            iconLeft="add"
            className="self-start"
            onClick={addBlock}
          >
            Adicionar outra função
          </AwButton>

          {multiBlock && (
            <AwAlert variant="info">
              Total: {totalEmails} convite{totalEmails === 1 ? "" : "s"} em{" "}
              {usedRoles} {usedRoles === 1 ? "função" : "funções"}. Os convites
              expiram em 7 dias.
            </AwAlert>
          )}

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

          {/* Faturamento — recebimento de faturas/NF por pessoa (default off) */}
          <div className="flex items-start justify-between gap-4 rounded-lg border border-(--border-subtle) bg-(--bg-muted) px-4 py-3">
            <label
              htmlFor="invite-invoices"
              className="min-w-0 flex-1 cursor-pointer"
            >
              <span className="block body-xs font-medium text-(--fg-primary)">
                Recebe faturas e notas fiscais (NF)
              </span>
              <span className="mt-0.5 block body-xs text-(--fg-secondary) text-pretty">
                Os convidados recebem faturas e NF por e-mail. Pode ajustar
                depois no perfil.
              </span>
            </label>
            <AwToggle
              id="invite-invoices"
              checked={receivesInvoices}
              onChange={setReceivesInvoices}
              label="Recebe faturas e notas fiscais"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <span className="aw-success-pop flex h-12 w-12 items-center justify-center rounded-full bg-(--accent-success) text-(--fg-on-inverse)">
            <Icon name="check" size={26} weight={600} />
          </span>
          <h6 className="m-0 text-(--fg-primary)">
            Convite{totalEmails === 1 ? " foi" : "s foram"} enviado
            {totalEmails === 1 ? "" : "s"}
          </h6>
          <p className="m-0 max-w-[360px] body-xs text-(--fg-secondary) text-pretty">
            {totalEmails === 1
              ? "O convite foi enviado para o e-mail informado. Expira em 7 dias."
              : `Enviamos ${totalEmails} convites${
                  usedRoles > 1 ? ` em ${usedRoles} funções` : ""
                }. Os destinatários recebem o link por e-mail e os convites expiram em 7 dias.`}
          </p>
        </div>
      )}
    </AwModal>
  );
}

/* -----------------------------------------------------------------
 * Um bloco do convite — função + chips de e-mail + contador.
 * ----------------------------------------------------------------- */

function InviteBlockFields({
  block,
  index,
  showHeader,
  removable,
  onPatch,
  onCommitDraft,
  onRemoveEmail,
  onRemove,
}: {
  block: InviteBlock;
  index: number;
  showHeader: boolean;
  removable: boolean;
  onPatch: (patch: Partial<InviteBlock>) => void;
  onCommitDraft: () => void;
  onRemoveEmail: (email: string) => void;
  onRemove: () => void;
}) {
  const router = useRouter();
  const selectedRoleDef = block.role
    ? ROLE_DEFINITIONS.find((r) => r.name === block.role) ?? null
    : null;
  const emailsId = `invite-emails-${block.id}`;
  const roleId = `invite-role-${block.id}`;
  const atLimit = block.emails.length >= MAX_EMAILS_PER_BLOCK;

  const body = (
    <div className="flex flex-col gap-4">
      {/* E-mail field — chips wrap em linhas independentes */}
      <AwField label="E-mail" htmlFor={emailsId}>
        <div className="aw-input h-auto! min-h-[42px] items-start py-1">
          <Icon
            name="mail"
            size={16}
            className="mt-[7px] shrink-0 text-(--fg-tertiary)"
          />
          <div className="flex flex-1 flex-wrap items-center gap-1.5 py-1">
            {block.emails.map((email) => (
              <span
                key={email}
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-(--border-subtle) bg-(--bg-muted) py-0.5 pl-2.5 pr-1 body-xs text-(--fg-primary)"
              >
                <span className="truncate">{email}</span>
                <button
                  type="button"
                  aria-label={`Remover ${email}`}
                  onClick={() => onRemoveEmail(email)}
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-(--fg-tertiary) hover:bg-(--bg-surface) hover:text-(--fg-primary)"
                >
                  <Icon name="close" size={12} />
                </button>
              </span>
            ))}
            <input
              id={emailsId}
              type="email"
              disabled={atLimit}
              className="min-w-[180px] flex-1 border-0 bg-transparent p-0 body-xs text-(--fg-primary) outline-hidden placeholder:text-(--fg-tertiary) disabled:cursor-not-allowed"
              placeholder={
                atLimit
                  ? "Limite de 20 e-mails neste grupo"
                  : block.emails.length === 0
                  ? "Digite o e-mail e pressione Enter"
                  : ""
              }
              value={block.draft}
              onChange={(e) => onPatch({ draft: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  onCommitDraft();
                } else if (
                  e.key === "Backspace" &&
                  block.draft.length === 0 &&
                  block.emails.length > 0
                ) {
                  onPatch({ emails: block.emails.slice(0, -1) });
                }
              }}
              onBlur={onCommitDraft}
            />
          </div>
        </div>
        <p className="mt-1.5 m-0 body-xs text-(--fg-tertiary)">
          {block.emails.length}/{MAX_EMAILS_PER_BLOCK} e-mails
        </p>
      </AwField>

      {/* Role picker — dropdown with role cards */}
      <AwField
        label={showHeader ? "Função do grupo" : "Convidar como"}
        htmlFor={roleId}
      >
        <AwDropdownMenu
          align="start"
          trigger={
            <AwSelect className="w-full justify-between" id={roleId}>
              {block.role ?? (
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
              checked: block.role === r.name,
              onSelect: () => onPatch({ role: r.name as Role }),
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
              onSelect: () =>
                router.push("/settings/equipe-permissoes/funcoes"),
            },
          ]}
        />
      </AwField>

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
  );

  // Bloco único: campos soltos (visual idêntico ao original). Vários blocos:
  // cada um vira um cartão com cabeçalho e botão de remover.
  if (!showHeader) return body;

  return (
    <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="m-0 aw-eyebrow text-(--fg-tertiary)">
          Grupo {index + 1}
        </p>
        {removable && (
          <AwButton
            size="sm"
            variant="ghost"
            iconLeft="delete"
            onClick={onRemove}
          >
            Remover
          </AwButton>
        )}
      </div>
      {body}
    </div>
  );
}
