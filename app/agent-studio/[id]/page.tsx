"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AgentEditorShell } from "@/components/agent-studio/editor/AgentEditorShell";
import { VisaoGeralTab } from "@/components/agent-studio/editor/tabs/VisaoGeralTab";
import { PromptCheckpointTab } from "@/components/agent-studio/editor/tabs/PromptCheckpointTab";
import { VisualizacaoModularTab } from "@/components/agent-studio/editor/tabs/VisualizacaoModularTab";
import { BaseConhecimentoTab } from "@/components/agent-studio/editor/tabs/BaseConhecimentoTab";
import { AopsTab } from "@/components/agent-studio/editor/tabs/AopsTab";
import { FollowUpTab } from "@/components/agent-studio/editor/tabs/FollowUpTab";
import { AtendimentoHumanoTab } from "@/components/agent-studio/editor/tabs/AtendimentoHumanoTab";
import { PlaygroundTab } from "@/components/agent-studio/editor/tabs/PlaygroundTab";
import { HistoricoTab } from "@/components/agent-studio/editor/tabs/HistoricoTab";
import { InsightsTab } from "@/components/agent-studio/editor/tabs/InsightsTab";
import { PreferenciasTab } from "@/components/agent-studio/editor/tabs/PreferenciasTab";
import {
  getAgentEditorData,
  isEditorTabId,
  type Checkpoint,
  type EditorTabId,
} from "@/lib/agentStudio";
import { loadAgentDraft, saveAgentDraft } from "@/lib/agentStudioStore";

/**
 * Editor do agente. A seção ativa vive na URL (?tab=…) — deep-link funciona,
 * o browser back anda entre seções e o Review Mode (escopado por URL) separa
 * os comentários por seção.
 *
 * Prompt e checkpoints são estado da PÁGINA (não das tabs): editar na seção
 * Prompt e Checkpoint sobrevive à troca de seção e a Visualização modular
 * deriva o diagrama do mesmo estado.
 */
export default function AgentEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const data = getAgentEditorData(params.id);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(
    data.checkpoints
  );
  const [prompt, setPrompt] = useState(data.prompt);

  // Rascunho compartilhado com o editor de documento (/checkpoints) —
  // carrega após o mount (localStorage não existe no SSR). A microtask
  // tira o setState do corpo síncrono do effect (evita cascading render).
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const draft = loadAgentDraft(params.id);
      if (draft) {
        setCheckpoints(draft.checkpoints);
        setPrompt(draft.prompt);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const persistPrompt = useCallback(
    (next: string) => {
      setPrompt(next);
      const draft = loadAgentDraft(params.id);
      saveAgentDraft(params.id, {
        prompt: next,
        checkpoints: draft?.checkpoints ?? checkpoints,
        variaveisCriadas: draft?.variaveisCriadas ?? [],
        gruposExtras: draft?.gruposExtras ?? [],
      });
    },
    [params.id, checkpoints]
  );

  const tabParam = searchParams.get("tab");
  const activeTab: EditorTabId = isEditorTabId(tabParam)
    ? tabParam
    : "prompt-checkpoint";

  const handleTabChange = useCallback(
    (tab: EditorTabId) => {
      router.push(`/agent-studio/${params.id}?tab=${tab}`, { scroll: false });
    },
    [router, params.id]
  );

  const breadcrumbs = [
    { label: "Agent Studio", href: "/agent-studio" },
    data.agent.title,
  ];

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs} mainClassName="p-0!">
      <AgentEditorShell
        data={data}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {activeTab === "visao-geral" && <VisaoGeralTab data={data} />}
        {activeTab === "prompt-checkpoint" && (
          <PromptCheckpointTab
            data={data}
            checkpoints={checkpoints}
            onCheckpointsChange={setCheckpoints}
            prompt={prompt}
            onPromptChange={persistPrompt}
          />
        )}
        {activeTab === "visualizacao-modular" && (
          <VisualizacaoModularTab data={data} checkpoints={checkpoints} />
        )}
        {activeTab === "base-conhecimento" && <BaseConhecimentoTab data={data} />}
        {activeTab === "aops" && <AopsTab data={data} />}
        {activeTab === "follow-up" && <FollowUpTab data={data} />}
        {activeTab === "atendimento-humano" && (
          <AtendimentoHumanoTab data={data} />
        )}
        {activeTab === "playground" && <PlaygroundTab data={data} />}
        {activeTab === "historico" && <HistoricoTab data={data} />}
        {activeTab === "insights" && <InsightsTab data={data} />}
        {activeTab === "preferencias" && <PreferenciasTab data={data} />}
      </AgentEditorShell>
    </AwDashboardLayout>
  );
}
