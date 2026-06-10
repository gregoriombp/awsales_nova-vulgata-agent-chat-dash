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
  checkpointTexts,
  deriveHabilidades,
} from "@/components/agent-studio/editor/checkpointTokens";
import type { AgentEditorData, Checkpoint } from "@/lib/agentStudio";

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

const ROW_H = 200;
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

/* ─── Nós custom ───────────────────────────────────────────────────────── */

type CheckpointNodeData = { checkpoint: Checkpoint; habilidades: string[] };

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
          {habilidades.slice(0, NODE_MAX_CHIPS).map((nome) => (
            <span
              key={nome}
              className="inline-flex max-w-32 items-center gap-0.5 rounded bg-(--bg-hover) px-1.5 py-0.5 text-xs font-medium text-(--fg-secondary)"
            >
              <Icon name="alternate_email" size={11} className="shrink-0" />
              <span className="truncate">{nome}</span>
            </span>
          ))}
          {habilidades.length > NODE_MAX_CHIPS && (
            <span className="inline-flex items-center rounded bg-(--bg-hover) px-1.5 py-0.5 text-xs font-medium text-(--fg-tertiary)">
              +{habilidades.length - NODE_MAX_CHIPS}
            </span>
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

  /** Nomes das habilidades derivadas das menções @ de cada checkpoint. */
  const habilidadesPorCheckpoint = React.useMemo(() => {
    const map = new Map<string, string[]>();
    for (const cp of checkpoints) {
      map.set(
        cp.id,
        deriveHabilidades(
          checkpointTexts(cp),
          data.habilidadesConfiguradas,
        ).map((h) => h.nome),
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
  const selectedHabilidades = selected
    ? (habilidadesPorCheckpoint.get(selected.id) ?? [])
    : [];

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
        className={`w-full bg-(--bg-canvas) ${fullscreen ? "flex-1" : "h-[640px]"}`}
      >
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

          {selected && (
            <Panel position="top-right">
              <div className="w-[300px] rounded-xl border border-(--border-subtle) bg-(--bg-raised) p-4 shadow-md">
                <div className="flex items-center gap-1.5">
                  <Icon
                    name="flag"
                    size={14}
                    className="shrink-0 text-(--fg-tertiary)"
                  />
                  <span className="text-xs font-medium text-(--fg-tertiary)">
                    Checkpoint {pad(selected.numero)}
                  </span>
                </div>
                <h3 className="mt-1 text-sm font-medium leading-snug text-(--fg-primary)">
                  {selected.titulo}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-(--fg-secondary)">
                  {selected.objetivo}
                </p>

                <dl className="mt-3 space-y-1.5 border-t border-(--border-subtle) pt-3 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-(--fg-tertiary)">Instruções</dt>
                    <dd className="font-medium text-(--fg-primary)">
                      {selected.corpo.split("\n").filter(Boolean).length}{" "}
                      {selected.corpo.split("\n").filter(Boolean).length === 1
                        ? "linha"
                        : "linhas"}
                    </dd>
                  </div>
                  {selected.regras && selected.regras.length > 0 && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-(--fg-tertiary)">Regras</dt>
                      <dd className="font-medium text-(--fg-primary)">
                        {selected.regras.length}
                      </dd>
                    </div>
                  )}
                  {selected.marque && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-(--fg-tertiary)">Classificação</dt>
                      <dd className="truncate font-medium text-(--fg-primary)">
                        {selected.marque.verbo ?? "Marque"}{" "}
                        {selected.marque.rotulo}
                      </dd>
                    </div>
                  )}
                  {selectedHabilidades.length > 0 && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-(--fg-tertiary)">Tools</dt>
                      <dd className="truncate font-medium text-(--fg-primary)">
                        {selectedHabilidades.join(", ")}
                      </dd>
                    </div>
                  )}
                </dl>

                <AwButton
                  asChild
                  variant="secondary"
                  size="sm"
                  block
                  iconLeft="edit_note"
                  className="mt-4"
                >
                  <Link
                    href={`/agent-studio/${data.agent.id}/checkpoints#cp-${selected.id}`}
                  >
                    Editar no documento
                  </Link>
                </AwButton>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}
