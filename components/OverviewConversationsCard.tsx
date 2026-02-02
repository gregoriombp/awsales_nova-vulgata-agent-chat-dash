"use client";

import { useState, useRef, useEffect } from "react";

// Dados baseados na imagem de referência - TRADUZIDO PARA PORTUGUÊS
const SANKEY_DATA = {
  nodes: [
    { name: "Conversas", value: 131649, pct: 100, col: 0 },
    { name: "Agente de Atendimento respondeu", value: 74547, pct: 57, col: 1 },
    { name: "Agente de Vendas respondeu", value: 31592, pct: 24, col: 1 },
    { name: "Usuário respondeu", value: 6923, pct: 5, col: 1 },
    { name: "Encerrado sem resposta", value: 9579, pct: 7, col: 1 },
    { name: "Abandonado", value: 10579, pct: 8, col: 2 },
    { name: "Resolvido pelo Agente de Atendimento", value: 34332, pct: 26, col: 2 },
    { name: "Usuário respondeu", value: 29635, pct: 23, col: 2 },
    { name: "Encerrado pelo Agente de Vendas", value: 16423, pct: 12, col: 2 },
    { name: "Usuário respondeu", value: 6104, pct: 5, col: 2 },
    { name: "Encerrado pelo Usuário", value: 15056, pct: 11, col: 2 },
    { name: "Encerrado pelo Usuário", value: 35739, pct: 28, col: 3 },
  ],
  links: [
    // Col 0 -> Col 1
    { source: 0, target: 1, value: 74547 },
    { source: 0, target: 2, value: 31592 },
    { source: 0, target: 3, value: 6923 },
    { source: 0, target: 4, value: 9579 },
    // Col 1 -> Col 2
    { source: 1, target: 5, value: 10579 },
    { source: 1, target: 6, value: 34332 },
    { source: 1, target: 7, value: 29636 },
    { source: 2, target: 8, value: 16423 },
    { source: 2, target: 9, value: 6104 },
    { source: 2, target: 10, value: 9065 },
    // Col 2 -> Col 3
    { source: 7, target: 11, value: 29635 },
    { source: 9, target: 11, value: 6104 },
  ],
};

const TOTAL = 131649;

function formatNumber(n: number) {
  return new Intl.NumberFormat("pt-BR", { useGrouping: true }).format(n);
}

// Paleta baseada na imagem: Azul Profundo -> Ciano/Teal -> Verde Vibrante -> Laranja/Coral
const NODE_COLORS: Record<number, string> = {
  0: "#2b4b8c",   // Azul escuro – Conversas
  1: "#3b82f6",   // Azul médio – Agente de Atendimento
  2: "#06b6d4",   // Ciano – Agente de Vendas
  3: "#2dd4bf",   // Teal – Usuário respondeu
  4: "#64748b",   // Slate – Encerrado sem resposta
  5: "#f97316",   // Laranja – Abandonado (destaque negativo)
  6: "#10b981",   // Verde – Resolvido pelo Agente
  7: "#34d399",   // Verde claro – Usuário respondeu
  8: "#22c55e",   // Verde – Encerrado pelo Agente de Vendas
  9: "#4ade80",   // Verde claro – Usuário respondeu
  10: "#16a34a",  // Verde – Encerrado pelo Usuário
  11: "#059669",  // Verde escuro – Encerrado pelo Usuário (final)
};

// Links indexados por linkIdx (ordem em SANKEY_DATA.links)
// Link 0: Conversas → Agente Atendimento
// Link 1: Conversas → Agente Vendas
// Link 2: Conversas → Usuário respondeu
// Link 3: Conversas → Encerrado sem resposta
// Link 4: Agente Atendimento → Abandonado
// Link 5: Agente Atendimento → Resolvido
// Link 6: Agente Atendimento → Usuário respondeu
// Link 7: Agente Vendas → Encerrado
// Link 8: Agente Vendas → Usuário respondeu
// Link 9: Agente Vendas → Encerrado pelo Usuário
// Link 10: Usuário → Encerrado final
// Link 11: Usuário → Encerrado final
const LINK_COLORS: Record<number, { start: string; end: string }> = {
  0: { start: "#2b4b8c", end: "#3b82f6" },   // Azul -> Azul médio
  1: { start: "#2b4b8c", end: "#06b6d4" },   // Azul -> Ciano
  2: { start: "#2b4b8c", end: "#2dd4bf" },   // Azul -> Teal
  3: { start: "#2b4b8c", end: "#64748b" },   // Azul -> Slate
  4: { start: "#3b82f6", end: "#f97316" },   // Azul -> Laranja (Abandonado)
  5: { start: "#3b82f6", end: "#10b981" },   // Azul -> Verde
  6: { start: "#3b82f6", end: "#34d399" },   // Azul -> Verde claro
  7: { start: "#06b6d4", end: "#22c55e" },   // Ciano -> Verde
  8: { start: "#06b6d4", end: "#4ade80" },   // Ciano -> Verde claro
  9: { start: "#06b6d4", end: "#16a34a" },   // Ciano -> Verde
  10: { start: "#34d399", end: "#059669" },  // Verde claro -> Verde escuro
  11: { start: "#4ade80", end: "#059669" },  // Verde claro -> Verde escuro
};

export default function OverviewConversationsCard() {
  const [isLearnOpen, setIsLearnOpen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const learnRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (learnRef.current && !learnRef.current.contains(target)) setIsLearnOpen(false);
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Layout manual do Sankey - usando viewBox para responsividade
  const viewBoxWidth = 1600;
  const viewBoxHeight = 520;
  const nodeWidth = 10;
  const marginLeft = 140;
  const marginRight = 160;
  const marginTop = 30;
  const chartWidth = viewBoxWidth - marginLeft - marginRight;
  const chartHeight = viewBoxHeight - marginTop - 30;
  
  // Posições X das 4 colunas
  const colPositions = [
    marginLeft,
    marginLeft + chartWidth * 0.28,
    marginLeft + chartWidth * 0.58,
    marginLeft + chartWidth * 0.88,
  ];

  // Calcular posições dos nós por coluna
  const nodesByCol: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [] };
  SANKEY_DATA.nodes.forEach((n, i) => {
    nodesByCol[n.col].push(i);
  });

  // Altura de cada nó proporcional ao valor
  const getNodeHeight = (value: number) => Math.max(20, (value / TOTAL) * chartHeight * 0.85);

  // Posições Y dos nós
  const nodePositions: { x: number; y: number; h: number }[] = [];
  Object.entries(nodesByCol).forEach(([col, indices]) => {
    const colNum = Number(col);
    const x = colPositions[colNum];
    let currentY = marginTop;
    const totalHeight = indices.reduce((acc, i) => acc + getNodeHeight(SANKEY_DATA.nodes[i].value), 0);
    const gap = Math.max(6, (chartHeight - totalHeight) / Math.max(1, indices.length - 1));
    
    indices.forEach((nodeIdx) => {
      const h = getNodeHeight(SANKEY_DATA.nodes[nodeIdx].value);
      nodePositions[nodeIdx] = { x, y: currentY, h };
      currentY += h + gap;
    });
  });

  // Calcular totais de saída e entrada de cada nó para proporção correta dos links
  const nodeOutTotals: number[] = SANKEY_DATA.nodes.map(() => 0);
  const nodeInTotals: number[] = SANKEY_DATA.nodes.map(() => 0);
  SANKEY_DATA.links.forEach((link) => {
    nodeOutTotals[link.source] += link.value;
    nodeInTotals[link.target] += link.value;
  });

  // Track link connection points
  const nodeOutOffsets: number[] = SANKEY_DATA.nodes.map(() => 0);
  const nodeInOffsets: number[] = SANKEY_DATA.nodes.map(() => 0);

  // Gerar paths dos links com altura proporcional à barra
  const linkPaths = SANKEY_DATA.links.map((link, linkIdx) => {
    const sourceNode = nodePositions[link.source];
    const targetNode = nodePositions[link.target];
    if (!sourceNode || !targetNode) return null;

    // Altura do link proporcional ao total de saída do nó de origem (preenche a barra)
    const sourceTotal = nodeOutTotals[link.source] || 1;
    const targetTotal = nodeInTotals[link.target] || 1;
    const sourceLinkHeight = (link.value / sourceTotal) * sourceNode.h;
    const targetLinkHeight = (link.value / targetTotal) * targetNode.h;
    
    const sourceY = sourceNode.y + nodeOutOffsets[link.source] + sourceLinkHeight / 2;
    const targetY = targetNode.y + nodeInOffsets[link.target] + targetLinkHeight / 2;
    
    nodeOutOffsets[link.source] += sourceLinkHeight;
    nodeInOffsets[link.target] += targetLinkHeight;

    const x1 = sourceNode.x + nodeWidth;
    const x2 = targetNode.x;
    const cx1 = x1 + (x2 - x1) * 0.4;
    const cx2 = x1 + (x2 - x1) * 0.8;

    // Path com área preenchida (polygon-like) para melhor visual
    const avgHeight = (sourceLinkHeight + targetLinkHeight) / 2;

    return {
      d: `M${x1},${sourceY} C${cx1},${sourceY} ${cx2},${targetY} ${x2},${targetY}`,
      strokeWidth: avgHeight,
      sourceLinkHeight,
      targetLinkHeight,
      source: link.source,
      target: link.target,
      value: link.value,
      linkIdx,
      x1,
      x2,
    };
  }).filter(Boolean);

  const handleNodeHover = (idx: number | null, e?: React.MouseEvent) => {
    setHoveredNode(idx);
    if (idx !== null && e && svgRef.current) {
      const node = SANKEY_DATA.nodes[idx];
      const rect = svgRef.current.getBoundingClientRect();
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 10,
        content: `${node.name}: ${formatNumber(node.value)} (${node.pct}%)`,
      });
    } else {
      setTooltip(null);
    }
  };

  const handleLinkHover = (linkIdx: number | null, e?: React.MouseEvent) => {
    setHoveredLink(linkIdx);
    if (linkIdx !== null && e && svgRef.current) {
      const link = SANKEY_DATA.links[linkIdx];
      const source = SANKEY_DATA.nodes[link.source];
      const target = SANKEY_DATA.nodes[link.target];
      const rect = svgRef.current.getBoundingClientRect();
      const pct = ((link.value / TOTAL) * 100).toFixed(1);
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 10,
        content: `${source.name} → ${target.name}: ${formatNumber(link.value)} (${pct}%)`,
      });
    } else {
      setTooltip(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] p-6">
      {/* Cabeçalho */}
    

      {/* Título do gráfico */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          className="text-[#5e5e5e] hover:text-[#1a1a1a] p-0.5 rounded"
          aria-label="Informação"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </button>
        <h3 className="text-base font-semibold text-[#1a1a1a]">
          Como você está tratando as conversas
        </h3>
      </div>

      {/* Gráfico Sankey customizado */}
      <div className="w-full">
        <div className="relative w-full" style={{ aspectRatio: `${viewBoxWidth} / ${viewBoxHeight}` }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full"
          >
            {/* Definições de gradientes */}
            <defs>
              {linkPaths.map((link) => {
                if (!link) return null;
                const colors = LINK_COLORS[link.linkIdx] || { start: "#e5e7eb", end: "#e5e7eb" };
                return (
                  <linearGradient
                    key={`gradient-${link.linkIdx}`}
                    id={`link-gradient-${link.linkIdx}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor={colors.start} stopOpacity={0.85} />
                    <stop offset="50%" stopColor={colors.end} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={colors.end} stopOpacity={0.85} />
                  </linearGradient>
                );
              })}
            </defs>

            {/* Links com degradê */}
            {linkPaths.map((link) => {
              if (!link) return null;
              
              // Efeito de destaque: quando hover em uma faixa, as outras diminuem opacidade
              const isHoveredLink = hoveredLink === link.linkIdx;
              const isConnectedToHoveredNode = hoveredNode === link.source || hoveredNode === link.target;
              
              let opacity = 1;
              if (hoveredLink !== null) {
                // Hover em um link: destaca esse, diminui os outros
                opacity = isHoveredLink ? 1 : 0.15;
              } else if (hoveredNode !== null) {
                // Hover em um nó: destaca links conectados, diminui os outros
                opacity = isConnectedToHoveredNode ? 1 : 0.15;
              }
              
              return (
                <path
                  key={`link-${link.linkIdx}`}
                  d={link.d}
                  fill="none"
                  stroke={`url(#link-gradient-${link.linkIdx})`}
                  strokeWidth={link.strokeWidth}
                  opacity={opacity}
                  style={{ cursor: "pointer", transition: "opacity 0.25s ease-in-out" }}
                  onMouseEnter={(e) => handleLinkHover(link.linkIdx, e)}
                  onMouseMove={(e) => handleLinkHover(link.linkIdx, e)}
                  onMouseLeave={() => handleLinkHover(null)}
                />
              );
            })}

            {/* Nós (barras) */}
            {SANKEY_DATA.nodes.map((node, idx) => {
              const pos = nodePositions[idx];
              if (!pos) return null;
              const fill = NODE_COLORS[idx] ?? "#e5e7eb";

              // Posição do label (primeira coluna à esquerda, demais à direita)
              const isFirstCol = node.col === 0;
              const labelX = isFirstCol ? pos.x - 8 : pos.x + nodeWidth + 8;
              const textAnchor = isFirstCol ? "end" : "start";

              // Verificar se este nó está conectado ao link em hover
              const isConnectedToHoveredLink = hoveredLink !== null && 
                (SANKEY_DATA.links[hoveredLink]?.source === idx || SANKEY_DATA.links[hoveredLink]?.target === idx);
              
              // Calcular opacidade
              let opacity = 1;
              if (hoveredNode !== null) {
                opacity = hoveredNode === idx ? 1 : 0.25;
              } else if (hoveredLink !== null) {
                opacity = isConnectedToHoveredLink ? 1 : 0.25;
              }

              return (
                <g key={`node-${idx}`}>
                  {/* Barra do nó */}
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={nodeWidth}
                    height={pos.h}
                    fill={fill}
                    rx={3}
                    ry={3}
                    opacity={opacity}
                    style={{ cursor: "pointer", transition: "opacity 0.25s ease-in-out" }}
                    onMouseEnter={(e) => handleNodeHover(idx, e)}
                    onMouseMove={(e) => handleNodeHover(idx, e)}
                    onMouseLeave={() => handleNodeHover(null)}
                  />
                  {/* Label com valor e nome */}
                  <text
                    x={labelX}
                    y={pos.y + pos.h / 2 - 8}
                    textAnchor={textAnchor}
                    fill="#1a1a1a"
                    fontSize={13}
                    fontWeight={600}
                    opacity={opacity}
                    style={{ transition: "opacity 0.25s ease-in-out" }}
                  >
                    {formatNumber(node.value)} ({node.pct}%)
                  </text>
                  <text
                    x={labelX}
                    y={pos.y + pos.h / 2 + 10}
                    textAnchor={textAnchor}
                    fill="#5e5e5e"
                    fontSize={12}
                    fontWeight={400}
                    opacity={opacity}
                    style={{ transition: "opacity 0.25s ease-in-out" }}
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute pointer-events-none z-30 px-3 py-2 bg-[#1a1a1a] text-white text-sm rounded-lg shadow-lg whitespace-nowrap"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: "translate(-50%, -100%)",
              }}
            >
              {tooltip.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
