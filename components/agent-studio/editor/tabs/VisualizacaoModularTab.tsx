"use client";

import * as React from "react";
import Link from "next/link";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Panel,
  Position,
  ReactFlow,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Icon } from "@/components/ui/Icon";
import { AwButton } from "@/components/ui/AwButton";
import {
  AwCheckpointChip,
  GOOGLE_CALENDAR_BRAND,
} from "@/components/ui/AwCheckpointChip";
import {
  checkpointTexts,
  deriveHabilidades,
} from "@/components/agent-studio/editor/checkpointTokens";
import { TokenText } from "@/components/agent-studio/editor/CheckpointRichText";
import {
  skillTone,
  type AgentEditorData,
  type Checkpoint,
  type HabilidadeConfigurada,
} from "@/lib/agentStudio";

/**
 * Visualização modular — o fluxo confirmado no editor de checkpoints como
 * diagrama. Cada checkpoint vira um card arrastável; as arestas seguem a
 * ordem 1→2→…→N entre o início da conversa e a conversão registrada.
 *
 * Os checkpoints chegam por props do estado da página — o que for salvo no
 * editor de documento aparece aqui. As habilidades de cada nó são derivadas
 * das menções @ presentes no texto. Há modo tela cheia para trabalhar o
 * fluxo com mais espaço; a edição do conteúdo vive no documento.
 */

/* ─── Layout ───────────────────────────────────────────────────────────── */

const ROW_H = 128;
/** Zigue-zague suave: alterna o x dos checkpoints entre duas colunas. */
const ZIG_X = [40, 200] as const;
/** Pills de início/fim centralizadas em relação às duas colunas. */
const PILL_X = 185;

const HANDLE_STYLE: React.CSSProperties = {
  width: 7,
  height: 7,
  border: 0,
  background: "var(--border-strong)",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function skillBrand(hab: HabilidadeConfigurada): string | undefined {
  if (hab.grupo === "google-calendar" || hab.id.startsWith("googlecal.")) {
    return GOOGLE_CALENDAR_BRAND;
  }
  return undefined;
}

/* ─── Nós custom ───────────────────────────────────────────────────────── */

type CheckpointNodeData = {
  checkpoint: Checkpoint;
  habilidades: HabilidadeConfigurada[];
};

/** Máximo de chips de habilidade visíveis por nó — o resto vira "+N". */
const NODE_MAX_CHIPS = 3;

function CheckpointNode(props: NodeProps) {
  const { checkpoint, habilidades } =
    props.data as unknown as CheckpointNodeData;
  return (
    <div
      className={`w-[280px] cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-[border-color,box-shadow] duration-aw-fast ${
        props.selected
          ? "border-(--border-strong) ring-2 ring-(--accent-brand)"
          : "border-(--border-subtle) hover:border-(--border-default)"
      }`}
    >
      <Handle type="target" position={Position.Top} style={HANDLE_STYLE} />
      <div className="flex items-center gap-1.5">
        <Icon name="flag" size={14} className="shrink-0 text-(--fg-tertiary)" />
        <span className="text-xs font-medium text-(--fg-tertiary)">
          Checkpoint {pad(checkpoint.numero)}
        </span>
      </div>
      <p className="mt-1.5 text-sm font-medium leading-snug text-(--fg-primary)">
        {checkpoint.titulo}
      </p>
      <p className="mt-1 truncate text-xs text-(--fg-tertiary)">
        {checkpoint.objetivo}
      </p>
      {habilidades.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {habilidades.slice(0, NODE_MAX_CHIPS).map((hab) => (
            <AwCheckpointChip
              key={hab.id}
              tone={skillTone(hab)}
              brand={skillBrand(hab)}
              icon={hab.icon ?? "alternate_email"}
              className="max-w-32"
            >
              <span className="truncate">{hab.nome}</span>
            </AwCheckpointChip>
          ))}
          {habilidades.length > NODE_MAX_CHIPS && (
            <AwCheckpointChip tone="neutral">
              +{habilidades.length - NODE_MAX_CHIPS}
            </AwCheckpointChip>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} />
    </div>
  );
}

type EndpointNodeData = { label: string; icon: string; role: "start" | "end" };

function EndpointNode(props: NodeProps) {
  const { label, icon, role } = props.data as unknown as EndpointNodeData;
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-(--bg-inverse) px-4 py-2 text-xs font-medium text-(--fg-on-inverse) shadow-sm">
      {role === "end" && (
        <Handle type="target" position={Position.Top} style={HANDLE_STYLE} />
      )}
      <Icon name={icon} size={14} />
      {label}
      {role === "start" && (
        <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} />
      )}
    </div>
  );
}

const nodeTypes = { checkpoint: CheckpointNode, endpoint: EndpointNode };

function CheckpointInspector({
  checkpoint,
  habilidades,
  allHabilidades,
  editorHref,
}: {
  checkpoint: Checkpoint | null;
  habilidades: HabilidadeConfigurada[];
  allHabilidades: HabilidadeConfigurada[];
  editorHref: string;
}) {
  if (!checkpoint) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <Icon
          name="conversion_path"
          size={28}
          className="text-(--fg-tertiary)"
        />
        <p className="mt-3 text-sm text-(--fg-secondary)">
          Selecione um checkpoint no canvas para ver instruções e tools.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-(--border-subtle) px-5 py-4">
        <div className="flex items-center gap-2">
          <Icon name="flag" size={15} className="text-(--fg-tertiary)" />
          <span className="text-xs font-medium text-(--fg-tertiary)">
            Checkpoint {pad(checkpoint.numero)}
          </span>
        </div>
        <h3 className="mt-2 font-heading text-lg font-medium leading-tight text-(--fg-primary)">
          {checkpoint.titulo}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-(--fg-secondary)">
          <TokenText text={checkpoint.objetivo} habilidades={allHabilidades} />
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {habilidades.length > 0 && (
          <section>
            <p className="mb-2 text-xs font-medium text-(--fg-tertiary)">
              Tools neste checkpoint
            </p>
            <div className="flex flex-wrap gap-1.5">
              {habilidades.map((hab) => (
                <AwCheckpointChip
                  key={hab.id}
                  tone={skillTone(hab)}
                  brand={skillBrand(hab)}
                  icon={hab.icon ?? "alternate_email"}
                >
                  {hab.nome}
                </AwCheckpointChip>
              ))}
            </div>
          </section>
        )}

        {checkpoint.corpo && (
          <section>
            <p className="mb-2 text-xs font-medium text-(--fg-tertiary)">
              Instruções
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-(--fg-secondary)">
              <TokenText text={checkpoint.corpo} habilidades={allHabilidades} />
            </p>
          </section>
        )}

        {checkpoint.marque && (
          <section className="rounded-xl border border-(--border-subtle) p-4">
            <div className="flex items-center gap-2">
              <AwCheckpointChip tone="amber" icon="checklist">
                {checkpoint.marque.verbo ?? "Marque"}
              </AwCheckpointChip>
              <span className="text-sm font-medium text-(--fg-primary)">
                <TokenText
                  text={checkpoint.marque.rotulo}
                  habilidades={allHabilidades}
                />
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-(--fg-secondary)">
              {checkpoint.marque.opcoes.map((opcao, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Icon
                    name="radio_button_unchecked"
                    size={15}
                    className="mt-px shrink-0 text-(--border-strong)"
                  />
                  <span className="min-w-0">
                    <TokenText
                      text={opcao.texto}
                      habilidades={allHabilidades}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {checkpoint.regras && checkpoint.regras.length > 0 && (
          <section>
            <p className="mb-2 text-xs font-medium text-(--fg-tertiary)">
              Regras
            </p>
            <div className="space-y-2">
              {checkpoint.regras.map((regra) => (
                <p
                  key={regra.id}
                  className="flex flex-wrap items-center gap-1.5 text-sm leading-relaxed text-(--fg-secondary)"
                >
                  <AwCheckpointChip tone="purple" icon="alt_route">
                    Se
                  </AwCheckpointChip>
                  <TokenText text={regra.se} habilidades={allHabilidades} />
                  <span className="text-(--fg-tertiary)">então</span>
                  <TokenText text={regra.entao} habilidades={allHabilidades} />
                </p>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="border-t border-(--border-subtle) px-5 py-4">
        <AwButton asChild variant="secondary" size="sm" iconLeft="edit_note">
          <Link href={`${editorHref}#cp-${checkpoint.id}`}>
            Editar checkpoint
          </Link>
        </AwButton>
      </div>
    </div>
  );
}

/* ─── Tab ──────────────────────────────────────────────────────────────── */

export function VisualizacaoModularTab({
  data,
  checkpoints,
}: {
  data: AgentEditorData;
  checkpoints: Checkpoint[];
}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [fullscreen, setFullscreen] = React.useState(false);

  // Esc sai da tela cheia.
  React.useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  /** Habilidades derivadas das menções @ de cada checkpoint. */
  const habilidadesPorCheckpoint = React.useMemo(() => {
    const map = new Map<string, HabilidadeConfigurada[]>();
    for (const cp of checkpoints) {
      map.set(
        cp.id,
        deriveHabilidades(
          checkpointTexts(cp),
          data.habilidadesConfiguradas,
        ),
      );
    }
    return map;
  }, [checkpoints, data.habilidadesConfiguradas]);

  const { nodes: computedNodes, edges } = React.useMemo(() => {
    const cps = checkpoints;

    const nodes: Node[] = [
      {
        id: "inicio",
        type: "endpoint",
        position: { x: PILL_X, y: 0 },
        data: {
          label: "Início da conversa",
          icon: "play_arrow",
          role: "start",
        },
        selectable: false,
      },
      ...cps.map((cp, i) => ({
        id: cp.id,
        type: "checkpoint",
        position: { x: ZIG_X[i % 2], y: 110 + i * ROW_H },
        data: {
          checkpoint: cp,
          habilidades: habilidadesPorCheckpoint.get(cp.id) ?? [],
        },
      })),
      {
        id: "conversao",
        type: "endpoint",
        position: { x: PILL_X, y: 110 + cps.length * ROW_H },
        data: {
          label: "Conversão registrada",
          icon: "check_circle",
          role: "end",
        },
        selectable: false,
      },
    ];

    const chain = ["inicio", ...cps.map((cp) => cp.id), "conversao"];
    const edges: Edge[] = chain.slice(0, -1).map((source, i) => ({
      id: `e-${source}-${chain[i + 1]}`,
      source,
      target: chain[i + 1],
      type: "smoothstep",
      animated: true,
      style: { stroke: "var(--border-strong)", strokeWidth: 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: "var(--border-strong)",
      },
    }));

    return { nodes, edges };
  }, [checkpoints, habilidadesPorCheckpoint]);

  /* Nós em estado próprio — os cards são arrastáveis e a posição persiste
   * enquanto a tab está aberta; mudanças nos checkpoints recalculam o layout. */
  const [nodes, setNodes, onNodesChange] = useNodesState(computedNodes);
  React.useEffect(() => {
    setNodes(computedNodes);
  }, [computedNodes, setNodes]);

  const selected = checkpoints.find((cp) => cp.id === selectedId) ?? null;
  const inspectorCheckpoint = fullscreen
    ? (selected ?? checkpoints[0] ?? null)
    : selected;
  const inspectorHabilidades = inspectorCheckpoint
    ? (habilidadesPorCheckpoint.get(inspectorCheckpoint.id) ?? [])
    : [];
  const editorHref = `/agent-studio/${data.agent.id}/checkpoints`;

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-(--bg-surface)"
          : "overflow-hidden rounded-xl border border-(--border-subtle) bg-(--bg-surface)"
      }
    >
      <div className="flex items-center justify-between gap-4 border-b border-(--border-subtle) px-6 py-4">
        <div>
          <h2 className="font-heading text-base font-medium text-(--fg-primary)">
            Fluxo de checkpoints
          </h2>
          <p className="mt-0.5 text-xs text-(--fg-tertiary)">
            Arraste os cards para organizar o fluxo. O conteúdo das etapas é
            editado no documento de checkpoints.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-(--fg-tertiary)">
            {checkpoints.length} checkpoints
          </span>
          <AwButton
            asChild
            variant="secondary"
            size="sm"
            iconLeft="edit_note"
          >
            <Link href={`/agent-studio/${data.agent.id}/checkpoints`}>
              Editar checkpoints
            </Link>
          </AwButton>
          <AwButton
            variant="ghost"
            size="sm"
            iconOnly={fullscreen ? "close_fullscreen" : "open_in_full"}
            aria-label={
              fullscreen ? "Sair da tela cheia" : "Abrir em tela cheia"
            }
            onClick={() => setFullscreen((v) => !v)}
          />
        </div>
      </div>

      <div
        className={`w-full bg-(--bg-canvas) ${
          fullscreen ? "flex min-h-0 flex-1" : "h-[640px]"
        }`}
      >
        <div className="min-w-0 flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.4}
          maxZoom={1.5}
          nodesDraggable
          nodesConnectable={false}
          edgesFocusable={false}
          proOptions={{ hideAttribution: true }}
          onNodeClick={(_, node) =>
            setSelectedId(node.type === "checkpoint" ? node.id : null)
          }
          onPaneClick={() => setSelectedId(null)}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="var(--border-default)"
          />
          <Controls showInteractive={false} />

          {selected && !fullscreen && (
            <Panel position="top-right">
              <div className="h-96 w-96 overflow-hidden rounded-xl border border-(--border-subtle) bg-(--bg-raised) shadow-md">
                <CheckpointInspector
                  checkpoint={selected}
                  habilidades={inspectorHabilidades}
                  allHabilidades={data.habilidadesConfiguradas}
                  editorHref={editorHref}
                />
              </div>
            </Panel>
          )}
        </ReactFlow>
        </div>

        {fullscreen && (
          <aside className="w-96 shrink-0 border-l border-(--border-subtle) bg-(--bg-raised)">
            <CheckpointInspector
              checkpoint={inspectorCheckpoint}
              habilidades={inspectorHabilidades}
              allHabilidades={data.habilidadesConfiguradas}
              editorHref={editorHref}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
