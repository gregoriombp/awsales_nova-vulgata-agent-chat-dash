/**
 * Carregador de nós/arestas dos flows — reaproveita os `NODES`/`EDGES` que cada
 * página do styleguide já exporta. Só esta rota (`/bombardier/ux-flow/[slug]`)
 * importa daqui, então é só ela que bundla o @xyflow/react.
 */
import type { Edge, Node } from "@xyflow/react"

import { NODES as loginNodes, EDGES as loginEdges } from "../../styleguide/ux-flows/login-auth/page"
import {
  NODES as primeiroNodes,
  EDGES as primeiroEdges,
} from "../../styleguide/ux-flows/primeiro-acesso/page"
import {
  NODES as conviteNodes,
  EDGES as conviteEdges,
} from "../../styleguide/ux-flows/convite-membro/page"
import {
  NODES as orgNodes,
  EDGES as orgEdges,
} from "../../styleguide/ux-flows/organizacao-adicional/page"

export type FlowData = { nodes: Node[]; edges: Edge[] }

const FLOW_DATA: Record<string, FlowData> = {
  "login-auth": { nodes: loginNodes, edges: loginEdges },
  "primeiro-acesso": { nodes: primeiroNodes, edges: primeiroEdges },
  "convite-membro": { nodes: conviteNodes, edges: conviteEdges },
  "organizacao-adicional": { nodes: orgNodes, edges: orgEdges },
}

export function getFlowData(slug: string): FlowData | undefined {
  return FLOW_DATA[slug]
}
