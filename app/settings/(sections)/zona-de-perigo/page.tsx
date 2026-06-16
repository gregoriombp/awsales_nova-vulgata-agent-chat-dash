"use client";

import { useState } from "react";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";
import { ONBOARDING_ORG } from "@/app/primeiro-acesso/_data";
import { SettingsPageHeader } from "../_components/shared";

const AM = ONBOARDING_ORG.accountManager;

const DELETE_CONSEQUENCES = [
  "Todos os membros perdem acesso ao fim da carência de 30 dias.",
  "Agentes, canais e integrações são desativados.",
  "Os dados da organização são apagados após a carência — exceto registros que a lei obriga a manter, como notas e faturamento.",
  "Quer guardar algo? Exporte seus dados antes de seguir.",
];

export default function DangerZoneSettingsPage() {
  const [requestOpen, setRequestOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [protocol, setProtocol] = useState<string | null>(null);

  const nameMatches =
    confirmName.trim().toLowerCase() === ONBOARDING_ORG.name.toLowerCase();

  const openRequest = () => {
    setConfirmName("");
    setRequestOpen(true);
  };

  const submitRequest = () => {
    if (!nameMatches) return;
    // Protocolo gerado no clique (lado do cliente) — evita mismatch de hidratação.
    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const seq = String(now.getHours() * 4 + Math.floor(now.getMinutes() / 15) + 1).padStart(2, "0");
    setProtocol(`EXC-${stamp}-${seq}`);
    setRequestOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Zona de perigo"
        description="Ações irreversíveis. Confirmamos com você antes de aplicar qualquer uma."
      />

      <AwAlert variant="warning" title="Antes de excluir, exporte seus dados">
        Conversas, agentes, bases de conhecimento e logs de execução podem ser
        baixados em um único arquivo. Depois da exclusão, não há como recuperar.
      </AwAlert>

      <AwCard className="p-0! mt-4">
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="m-0 body-sm font-medium text-(--fg-primary)">
              Exportar todos os dados da organização
            </p>
            <p className="m-0 body-xs text-(--fg-secondary)">
              Geramos um arquivo .zip e enviamos para o seu e-mail.
            </p>
          </div>
          <AwButton size="sm" variant="secondary" iconLeft="download">
            Exportar
          </AwButton>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-(--border-subtle) px-6 py-5">
          <div className="min-w-0">
            <p className="m-0 body-sm font-medium text-(--fg-primary)">
              Excluir organização
            </p>
            <p className="m-0 body-xs text-(--fg-secondary)">
              Encerra o contrato e remove os dados após a carência de 30 dias.
              Só um administrador pode solicitar.
            </p>
          </div>
          <AwButton
            size="sm"
            variant="danger"
            iconLeft="delete_forever"
            onClick={openRequest}
          >
            Solicitar exclusão
          </AwButton>
        </div>
      </AwCard>

      <p className="mt-3 inline-flex items-center gap-2 px-1 body-xs text-(--fg-tertiary)">
        <Icon name="info" size={14} />
        A solicitação fica registrada no histórico da organização e pode ser
        cancelada durante a carência.
      </p>

      {/* Modal — solicitar exclusão (confirmação por nome) */}
      <AwModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        title="Solicitar exclusão da organização"
        footer={
          <>
            <AwButton
              size="sm"
              variant="ghost"
              onClick={() => setRequestOpen(false)}
            >
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="danger"
              iconLeft="delete_forever"
              disabled={!nameMatches}
              onClick={submitRequest}
            >
              Solicitar exclusão
            </AwButton>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <p className="m-0 body-sm text-(--fg-secondary)">
            Você está iniciando o encerramento da{" "}
            <strong className="font-medium text-(--fg-primary)">
              {ONBOARDING_ORG.name}
            </strong>{" "}
            na AwSales. Depois de confirmado com o seu Account Manager:
          </p>

          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {DELETE_CONSEQUENCES.map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <Icon
                  name="chevron_right"
                  size={16}
                  className="mt-0.5 shrink-0 text-(--fg-tertiary)"
                />
                <span className="body-xs text-(--fg-secondary)">{line}</span>
              </li>
            ))}
          </ul>

          <AwField
            label={`Digite "${ONBOARDING_ORG.name}" para confirmar`}
            htmlFor="confirm-org-name"
          >
            <AwInput
              id="confirm-org-name"
              autoComplete="off"
              placeholder={ONBOARDING_ORG.name}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
            />
          </AwField>
        </div>
      </AwModal>

      {/* Modal — protocolo registrado */}
      <AwModal
        open={protocol !== null}
        onClose={() => setProtocol(null)}
        title="Solicitação registrada"
        footer={
          <AwButton size="sm" variant="primary" onClick={() => setProtocol(null)}>
            Entendi
          </AwButton>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-(--bg-muted) px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-(--bg-raised) text-(--fg-primary)">
              <Icon name="task_alt" size={18} />
            </span>
            <div className="min-w-0">
              <p className="m-0 body-xs text-(--fg-tertiary)">Protocolo</p>
              <p className="m-0 mono body-sm font-medium text-(--fg-primary)">
                {protocol}
              </p>
            </div>
          </div>
          <p className="m-0 body-sm text-(--fg-secondary)">
            <strong className="font-medium text-(--fg-primary)">{AM.name}</strong>
            , seu Account Manager, entra em contato em até 2 dias úteis para
            confirmar a exclusão. A carência de 30 dias começa só depois dessa
            confirmação — e você pode cancelar a solicitação a qualquer momento
            durante esse período.
          </p>
        </div>
      </AwModal>
    </div>
  );
}
