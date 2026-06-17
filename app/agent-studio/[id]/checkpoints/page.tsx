"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwButton } from "@/components/ui/AwButton";
import { AwModal } from "@/components/ui/AwModal";
import { useToast } from "@/components/ui/AwToast";
import {
  CheckpointDocument,
  type ActiveEditorHandle,
} from "@/components/agent-studio/editor/document/CheckpointDocument";
import { SkillsPanel } from "@/components/agent-studio/editor/document/SkillsPanel";
import {
  ChipPropertiesModal,
  ConsistencyModal,
} from "@/components/agent-studio/editor/document/DocumentModals";
import { runConsistencyChecks } from "@/components/agent-studio/editor/document/consistency";
import type { TokenClick } from "@/components/agent-studio/editor/CheckpointRichText";
import { loadAgentDraft, saveAgentDraft } from "@/lib/agentStudioStore";
import {
  CONTEXT_VARIABLES,
  buildSkillGroups,
  getAgentEditorData,
  type AgentVariable,
  type Checkpoint,
  type SkillGroup,
} from "@/lib/agentStudio";

/**
 * Editando checkpoints — /agent-studio/[id]/checkpoints.
 *
 * Documento de instruções em linguagem natural + painel com a DSL do agente
 * (tools, integrações, AOPs e variáveis — clique ou arraste para o texto).
 * Salvar passa pela verificação de consistência; o que for confirmado fica
 * disponível na visualização modular.
 */

/* ─── Página ───────────────────────────────────────────────────────────── */

export default function CheckpointDocumentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();
  const data = getAgentEditorData(params.id);

  const [checkpoints, setCheckpoints] = React.useState<Checkpoint[]>(
    data.checkpoints,
  );
  const [prompt, setPrompt] = React.useState(data.prompt);
  const [variaveisCriadas, setVariaveisCriadas] = React.useState<
    AgentVariable[]
  >([]);
  const [gruposExtras, setGruposExtras] = React.useState<SkillGroup[]>([]);
  const [chipProps, setChipProps] = React.useState<
    Record<string, Record<string, string>>
  >({});
  const [dirty, setDirty] = React.useState(false);
  const [confirmLeave, setConfirmLeave] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [chipModal, setChipModal] = React.useState<TokenClick | null>(null);
  /* Catálogo de integrações — abre pelo painel OU pelo "+ Nova Integração"
   * do menu @ dentro do texto. */
  const [integrationsOpen, setIntegrationsOpen] = React.useState(false);

  /* Rascunho compartilhado com /agent-studio/[id] — carrega após o mount
   * (localStorage não existe no SSR). A microtask tira o setState do corpo
   * síncrono do effect. */
  React.useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const draft = loadAgentDraft(params.id);
      if (draft) {
        setCheckpoints(draft.checkpoints);
        setPrompt(draft.prompt);
        setVariaveisCriadas(draft.variaveisCriadas);
        setGruposExtras(draft.gruposExtras);
        setChipProps(draft.chipProps ?? {});
      }
      // Deep-link de um checkpoint específico (#cp-…) vindo da tab.
      const hash = window.location.hash.slice(1);
      if (hash) {
        requestAnimationFrame(() => {
          document
            .getElementById(hash)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const groups = React.useMemo(
    () => [...buildSkillGroups(data.aops), ...gruposExtras],
    [data.aops, gruposExtras],
  );
  const habilidades = React.useMemo(
    () => groups.flatMap((g) => g.skills),
    [groups],
  );
  const variaveis = React.useMemo(
    () => [...data.variaveis, ...CONTEXT_VARIABLES, ...variaveisCriadas],
    [data.variaveis, variaveisCriadas],
  );

  const createVariable = React.useCallback((nome: string) => {
    setVariaveisCriadas((prev) =>
      prev.some((v) => v.nome === `{{${nome}}}`)
        ? prev
        : [
            ...prev,
            {
              nome: `{{${nome}}}`,
              tipo: "Texto",
              descricao: "Variável criada no editor de checkpoints.",
              grupo: "Personalizadas",
            },
          ],
    );
    setDirty(true);
  }, []);

  /* Editor focado — alvo do clique no painel e da toolbar @ / {}. */
  const activeEditor = React.useRef<ActiveEditorHandle | null>(null);
  const registerActiveEditor = React.useCallback(
    (handle: ActiveEditorHandle | null) => {
      activeEditor.current = handle;
    },
    [],
  );

  const handleCheckpointsChange = (next: Checkpoint[]) => {
    setCheckpoints(next);
    setDirty(true);
  };

  const checks = React.useMemo(
    () => runConsistencyChecks({ checkpoints, habilidades, variaveis }),
    [checkpoints, habilidades, variaveis],
  );

  const confirmSave = () => {
    saveAgentDraft(params.id, {
      prompt,
      checkpoints,
      variaveisCriadas,
      gruposExtras,
      chipProps,
    });
    setDirty(false);
    setVerifying(false);
    push({
      title: "Checkpoints salvos",
      description: "O fluxo confirmado já aparece na visualização modular.",
      variant: "success",
    });
  };

  const backHref = `/agent-studio/${params.id}?tab=prompt-checkpoint`;
  const leave = () => router.push(backHref);

  const breadcrumbs = [
    { label: "Agent Studio", href: "/agent-studio" },
    { label: data.agent.title, href: backHref },
    "Edição de checkpoints",
  ];

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs} mainClassName="p-0!">
      <div className="flex min-h-full flex-col bg-(--bg-canvas)">
        {/* Header da página — ações Cancelar/Salvar moram aqui, ao lado do
            título, em vez de numa barra sticky abaixo. Ficam visualmente
            "logo acima" do primeiro checkpoint, mais próximas do conteúdo
            editável. */}
        <header className="px-10 pb-6 pt-9">
          <div className="mx-auto flex w-full max-w-[1280px] items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="font-heading text-3xl font-medium tracking-tight text-(--fg-primary)">
                Editando checkpoints
              </h1>
              <p className="mt-2 max-w-[620px] text-sm leading-relaxed text-(--fg-tertiary)">
                Escreva as instruções em linguagem natural — mencione tools,
                AOPs e variáveis no meio do texto. O agente segue exatamente o
                que estiver aqui.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-1">
              <AwButton
                variant="ghost"
                size="sm"
                onClick={() => (dirty ? setConfirmLeave(true) : leave())}
              >
                Cancelar
              </AwButton>
              <AwButton
                variant="primary"
                size="sm"
                iconLeft="auto_awesome"
                disabled={!dirty}
                onClick={() => setVerifying(true)}
              >
                Salvar checkpoints
              </AwButton>
            </div>
          </div>
        </header>

        {/* Documento + painel */}
        <div className="flex-1 px-10 pb-16 pt-8">
          <div className="mx-auto flex w-full max-w-[1280px] items-start gap-10">
            <div className="min-w-0 flex-1">
              <CheckpointDocument
                checkpoints={checkpoints}
                onChange={handleCheckpointsChange}
                habilidades={habilidades}
                variaveis={variaveis}
                grupos={groups}
                onCreateVariable={createVariable}
                onRequestNewIntegration={() => setIntegrationsOpen(true)}
                onEditorFocus={registerActiveEditor}
                onTokenClick={setChipModal}
              />
            </div>

            <aside className="sticky top-[60px] w-[316px] shrink-0">
              <div className="max-h-[calc(100vh-7.5rem)] overflow-y-auto pb-4 pr-1">
                <SkillsPanel
                  agentId={params.id}
                  groups={groups}
                  variaveis={variaveis}
                  integrationsOpen={integrationsOpen}
                  onIntegrationsOpenChange={setIntegrationsOpen}
                  onInsertSkill={(id) =>
                    activeEditor.current?.insertMention(id)
                  }
                  onInsertVariable={(nome) =>
                    activeEditor.current?.insertVariable(nome)
                  }
                  onCreateVariable={createVariable}
                  onAddIntegration={(group) => {
                    setGruposExtras((prev) =>
                      prev.some((g) => g.id === group.id)
                        ? prev
                        : [...prev, group],
                    );
                    setDirty(true);
                    push({
                      title: `${group.nome} conectado`,
                      description:
                        "As habilidades da integração já estão no painel.",
                      variant: "success",
                    });
                  }}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Propriedades do chip clicado */}
      <ChipPropertiesModal
        token={chipModal}
        habilidades={habilidades}
        variaveis={variaveis}
        values={chipProps}
        agentId={params.id}
        onSave={(chipId, values) => {
          setChipProps((prev) => ({ ...prev, [chipId]: values }));
          setDirty(true);
        }}
        onClose={() => setChipModal(null)}
      />

      {/* Verificação de consistência antes de salvar */}
      <ConsistencyModal
        open={verifying}
        agentId={params.id}
        checks={checks}
        onConfirm={confirmSave}
        onClose={() => setVerifying(false)}
      />

      {/* Confirmação ao sair com alterações não salvas */}
      <AwModal
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        title="Descartar alterações?"
        footer={
          <>
            <AwButton
              variant="ghost"
              size="md"
              onClick={() => setConfirmLeave(false)}
            >
              Continuar editando
            </AwButton>
            <AwButton variant="danger" size="md" onClick={leave}>
              Descartar e sair
            </AwButton>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-(--fg-secondary)">
          As alterações feitas neste documento ainda não foram salvas. Se você
          sair agora, elas serão perdidas.
        </p>
      </AwModal>
    </AwDashboardLayout>
  );
}
