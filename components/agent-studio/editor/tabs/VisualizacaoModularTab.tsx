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
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Icon } from "@/components/ui/Icon";
import { AwButton } from "@/components/ui/AwButton";
import type { AgentEditorData, Checkpoint } from "@/lib/agentStudio";

/**
 * Visualização modular — o guia de execução do agente como diagrama
 * read-only. Cada checkpoint vira um nó; as arestas seguem a ordem
 * 1→2→…→N entre o início da conversa e a conversão registrada.
 *
 * Clicar em um checkpoint abre o painel de detalhes com o atalho para
 * editar a etapa na seção Prompt e Checkpoint.
 */

/* ─── Layout ───────────────────────────────────────────────────────────── */

const ROW_H = 190;
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

type CheckpointNodeData = { checkpoint: Checkpoint };

function CheckpointNode(props: NodeProps) {
  const { checkpoint } = props.data as unknown as CheckpointNodeData;
  return (
    <div
      className={`w-[280px] cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-colors duration-aw-fast ${
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

export function VisualizacaoModularTab({ data }: { data: AgentEditorData }) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const { nodes, edges } = React.useMemo(() => {
    const cps = data.checkpoints;

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
        data: { checkpoint: cp },
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
  }, [data.checkpoints]);

  const selected =
    data.checkpoints.find((cp) => cp.id === selectedId) ?? null;

  return (
    <div className="overflow-hidden rounded-xl border border-(--border-subtle) bg-(--bg-surface)">
      <div className="flex items-center justify-between gap-4 border-b border-(--border-subtle) px-6 py-4">
        <div>
          <h2 className="font-heading text-base font-medium text-(--fg-primary)">
            Fluxo de checkpoints
          </h2>
          <p className="mt-0.5 text-xs text-(--fg-tertiary)">
            Visualização somente leitura. Selecione um checkpoint para ver os
            detalhes da etapa.
          </p>
        </div>
        <span className="shrink-0 text-xs text-(--fg-tertiary)">
          {data.checkpoints.length} checkpoints
        </span>
      </div>

      <div className="h-[640px] w-full bg-(--bg-canvas)">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.4}
          maxZoom={1.5}
          nodesDraggable={false}
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
                    <dt className="text-(--fg-tertiary)">Orientações</dt>
                    <dd className="font-medium text-(--fg-primary)">
                      {selected.itens.length}
                    </dd>
                  </div>
                  {selected.marque && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-(--fg-tertiary)">Classificação</dt>
                      <dd className="truncate font-medium text-(--fg-primary)">
                        Marque {selected.marque.rotulo}
                      </dd>
                    </div>
                  )}
                  {selected.habilidades &&
                    selected.habilidades.length > 0 && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-(--fg-tertiary)">Habilidades</dt>
                        <dd className="truncate font-medium text-(--fg-primary)">
                          {selected.habilidades.join(", ")}
                        </dd>
                      </div>
                    )}
                </dl>

                <AwButton
                  asChild
                  variant="secondary"
                  size="sm"
                  block
                  iconLeft="edit"
                  className="mt-4"
                >
                  <Link
                    href={`/agent-studio/${data.agent.id}?tab=prompt-checkpoint`}
                  >
                    Editar no Prompt e Checkpoint
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
