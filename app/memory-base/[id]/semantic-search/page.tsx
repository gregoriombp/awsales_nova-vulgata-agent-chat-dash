"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwButton } from "@/components/ui/AwButton";
import { AwSkeleton } from "@/components/ui/AwSkeleton";
import { Icon } from "@/components/ui/Icon";
import MemoryBaseIcon from "@/components/memory-base/MemoryBaseIcon";
import { getOrbForAgent } from "@/lib/agentOrbs";
import {
  KNOWLEDGE_LAYERS,
  QUALITY_COLOR,
  type KnowledgeLayer,
} from "@/components/memory-base/knowledgeLayers";
import { MOCK_KNOWLEDGE_BASES } from "@/components/memory-base/knowledgeBases";

/**
 * Busca semântica (/memory-base/[id]/semantic-search) — playground de
 * recuperação da base: o usuário pergunta como um cliente perguntaria e vê os
 * Knowledge Layers que os agentes usariam para responder, ranqueados por
 * relevância. Era a rota morta apontada pelos tabs do detalhe e pelo popover
 * de Knowledge Layers; o ranqueamento é simulado client-side (repo é preview
 * de UX, sem backend).
 */

const RECENT_KEY_PREFIX = "memory-base-recent-searches-";

function getBaseName(id: string): string {
  if (typeof window === "undefined" || !id) return "Base de conhecimento";
  try {
    return (
      window.localStorage.getItem(`memory-base-name-${id}`) ||
      MOCK_KNOWLEDGE_BASES.find((b) => b.id === id)?.name ||
      "Base de conhecimento"
    );
  } catch {
    return "Base de conhecimento";
  }
}

/* ── Ranqueamento simulado ─────────────────────────────────────────────────
 * Sobreposição de tokens (título pesa 2x) mapeada para uma faixa de
 * "confiança". Determinístico: a mesma pergunta produz o mesmo ranking. */

const STOPWORDS = new Set([
  "a", "o", "as", "os", "um", "uma", "de", "do", "da", "dos", "das", "em",
  "no", "na", "nos", "nas", "que", "qual", "quais", "como", "para", "por",
  "com", "sem", "ao", "aos", "e", "ou", "se", "sua", "seu", "suas", "seus",
  "é", "são", "foi", "ser", "tem", "têm", "há", "mais", "menos", "sobre",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

/** Hash pequeno e estável — desempate e "ruído" determinístico do score. */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

type RankedLayer = {
  layer: KnowledgeLayer;
  /** 0–100 — confiança de recuperação exibida na UI. */
  score: number;
  /** Correspondência fraca (sem sobreposição real com a pergunta). */
  weak: boolean;
};

function rankLayers(query: string): RankedLayer[] {
  const qTokens = tokenize(query);
  const ranked = KNOWLEDGE_LAYERS.map((layer) => {
    const titleTokens = new Set(tokenize(layer.title + " " + layer.pergunta));
    const bodyTokens = new Set(tokenize(layer.resposta + " " + layer.desc));
    let hits = 0;
    for (const t of qTokens) {
      if (titleTokens.has(t)) hits += 2;
      else if (bodyTokens.has(t)) hits += 1;
    }
    const ratio = qTokens.length > 0 ? hits / (qTokens.length * 2) : 0;
    const noise = (hashStr(layer.id + query) % 7) - 3; // ±3 pontos, estável
    const score =
      ratio > 0
        ? Math.min(99, Math.round(58 + ratio * 40 + noise))
        : 18 + (hashStr(layer.id + query) % 17);
    return { layer, score, weak: ratio === 0 };
  });
  return ranked.sort(
    (a, b) => b.score - a.score || hashStr(a.layer.id) - hashStr(b.layer.id),
  );
}

/* ── Persistência das buscas recentes ─────────────────────────────────────── */

function loadRecent(baseId: string): string[] {
  if (typeof window === "undefined" || !baseId) return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY_PREFIX + baseId);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function saveRecent(baseId: string, query: string): string[] {
  const next = [query, ...loadRecent(baseId).filter((q) => q !== query)].slice(0, 4);
  try {
    window.localStorage.setItem(RECENT_KEY_PREFIX + baseId, JSON.stringify(next));
  } catch {
    /* preview de UX — sem fallback necessário */
  }
  return next;
}

const SUGGESTIONS = KNOWLEDGE_LAYERS.slice(0, 4).map((l) => l.pergunta);

type SearchState = "idle" | "searching" | "results";

export default function SemanticSearchPage() {
  const params = useParams<{ id: string }>();
  const baseId = typeof params?.id === "string" ? params.id : "";

  const [baseName, setBaseName] = useState("Base de conhecimento");
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>("idle");
  const [results, setResults] = useState<RankedLayer[]>([]);
  const [lastQuery, setLastQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setBaseName(getBaseName(baseId));
    setRecent(loadRecent(baseId));
  }, [baseId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const runSearch = (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    setQuery(q);
    setLastQuery(q);
    setState("searching");
    setRecent(saveRecent(baseId, q));
    if (timerRef.current) window.clearTimeout(timerRef.current);
    // Latência curta de propósito: dá peso de "recuperação" sem travar o fluxo.
    timerRef.current = window.setTimeout(() => {
      setResults(rankLayers(q));
      setState("results");
    }, 750);
  };

  const clearSearch = () => {
    setQuery("");
    setState("idle");
    setResults([]);
    inputRef.current?.focus();
  };

  const top = results[0];
  const rest = results.slice(1);
  const noStrongMatch = top !== undefined && top.score < 45;

  return (
    <AwDashboardLayout
      breadcrumbs={[
        { label: "Memory Base", href: "/memory-base", icon: <MemoryBaseIcon /> },
        {
          label: baseName,
          href: `/memory-base/${baseId}`,
          icon: <Icon name="account_balance" size={16} weight={300} />,
        },
        "Busca semântica",
      ]}
    >
      {/* Animações locais da feature — globals.css não recompila no dev server
          compartilhado do time, então o CSS novo mora junto do componente. */}
      <style>{`
        @keyframes mbss-reveal {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mbss-reveal {
          opacity: 0;
          animation: mbss-reveal var(--dur-slow) var(--ease-out) forwards;
        }
        .mbss-searchbox {
          transition: box-shadow var(--dur-base) var(--ease-out),
            border-color var(--dur-base) var(--ease-out);
        }
        .mbss-searchbox:focus-within {
          border-color: var(--aw-blue-400);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--aw-blue-400) 18%, transparent);
        }
        @media (prefers-reduced-motion: reduce) {
          .mbss-reveal { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

      <div className="relative mx-auto w-full max-w-[1100px]">
        {/* Glow azul (Arcade) — concentrado atrás do hero, some no modo resultados. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 -top-10 h-[420px] transition-opacity duration-(--dur-slow) dark:hidden ${
            state === "idle" ? "opacity-100" : "opacity-40"
          }`}
          style={{
            background:
              "radial-gradient(46% 56% at 50% 18%, color-mix(in srgb, var(--aw-blue-300) 38%, transparent) 0%, color-mix(in srgb, var(--aw-blue-150) 30%, transparent) 52%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 -top-10 hidden h-[420px] transition-opacity duration-(--dur-slow) dark:block ${
            state === "idle" ? "opacity-100" : "opacity-50"
          }`}
          style={{
            background:
              "radial-gradient(46% 56% at 50% 18%, color-mix(in srgb, var(--aw-blue-800) 36%, transparent) 0%, color-mix(in srgb, var(--aw-blue-1100) 32%, transparent) 55%, transparent 100%)",
          }}
        />

        <div className="relative">
          {/* Topo — voltar + título */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link href={`/memory-base/${baseId}`} className="no-underline">
                <span className="mb-2 inline-flex items-center gap-1.5 text-sm text-(--fg-secondary) transition-colors hover:text-(--fg-primary)">
                  <Icon name="arrow_back" size={16} /> Voltar
                </span>
              </Link>
              <h1 className="flex items-center gap-2.5 text-3xl font-semibold tracking-tight">
                <Icon name="travel_explore" size={28} weight={300} />
                Busca semântica
              </h1>
            </div>
          </div>

          {/* Hero de busca */}
          <div
            className={`mx-auto flex w-full flex-col items-center transition-all duration-(--dur-slow) ${
              state === "idle" ? "mt-20 max-w-[720px]" : "mt-8 max-w-[840px]"
            }`}
          >
            {state === "idle" && (
              <p className="mbss-reveal mb-8 max-w-[560px] text-center text-base leading-relaxed text-(--fg-secondary)">
                Pergunte como um cliente perguntaria. A busca recupera os
                Knowledge Layers que seus agentes usam para responder em
                conversas reais.
              </p>
            )}

            {/* Caixa de busca */}
            <form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                runSearch(query);
              }}
            >
              <div className="mbss-searchbox flex h-[58px] w-full items-center gap-3 rounded-2xl border border-(--border-default) bg-(--bg-raised) pl-5 pr-2.5 shadow-sm">
                <Icon
                  name="search"
                  size={22}
                  className="shrink-0 text-(--fg-tertiary)"
                />
                <input
                  ref={inputRef}
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ex.: Como funciona a política de reembolso?"
                  className="h-full flex-1 bg-transparent text-base text-(--fg-primary) outline-hidden placeholder:text-(--fg-tertiary)"
                />
                {state !== "idle" && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Limpar busca"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-(--fg-tertiary) transition-colors hover:bg-(--bg-hover) hover:text-(--fg-primary)"
                  >
                    <Icon name="close" size={18} />
                  </button>
                )}
                <AwButton
                  type="submit"
                  variant="primary"
                  className="w-auto"
                  disabled={!query.trim() || state === "searching"}
                  loading={state === "searching"}
                >
                  Buscar
                </AwButton>
              </div>
            </form>

            {/* Sugestões + recentes (só no estado inicial) */}
            {state === "idle" && (
              <div className="mbss-reveal mt-8 flex w-full flex-col items-center gap-5" style={{ animationDelay: "80ms" }}>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-(--fg-tertiary)">
                    Experimente
                  </span>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => runSearch(s)}
                      className="rounded-full border border-(--border-default) bg-(--bg-raised) px-3.5 py-1.5 text-sm text-(--fg-secondary) transition-colors hover:border-(--aw-blue-400) hover:text-(--fg-primary)"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {recent.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-(--fg-tertiary)">
                      <Icon name="history" size={14} /> Recentes
                    </span>
                    {recent.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => runSearch(r)}
                        className="rounded-full px-3 py-1.5 text-sm text-(--fg-tertiary) transition-colors hover:bg-(--bg-hover) hover:text-(--fg-primary)"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resultados */}
          <div className="mx-auto mt-10 w-full max-w-[840px] pb-20">
            {state === "searching" && (
              <div className="flex flex-col gap-4" aria-busy>
                <AwSkeleton className="h-[150px] w-full rounded-2xl" />
                <AwSkeleton className="h-[72px] w-full rounded-2xl" />
                <AwSkeleton className="h-[72px] w-full rounded-2xl" />
              </div>
            )}

            {state === "results" && top && (
              <div className="flex flex-col gap-4">
                <p className="mbss-reveal text-sm text-(--fg-tertiary)">
                  {results.length}{" "}
                  {results.length === 1 ? "correspondência" : "correspondências"} para{" "}
                  <span className="font-medium text-(--fg-secondary)">“{lastQuery}”</span>{" "}
                  · ordenadas por relevância
                </p>

                {noStrongMatch && (
                  <div className="mbss-reveal flex items-start gap-3 rounded-2xl border border-(--border-default) bg-(--bg-surface) p-4">
                    <Icon name="info" size={18} className="mt-0.5 shrink-0 text-(--fg-tertiary)" />
                    <p className="text-sm leading-relaxed text-(--fg-secondary)">
                      Nenhuma correspondência forte para essa pergunta. Adicione
                      fontes sobre o tema ou reformule — os resultados abaixo são
                      os mais próximos que a base alcança hoje.
                    </p>
                  </div>
                )}

                {/* Melhor correspondência */}
                <TopMatchCard baseId={baseId} item={top} />

                {/* Demais correspondências */}
                {rest.length > 0 && (
                  <div className="mbss-reveal overflow-hidden rounded-2xl border border-(--border-default)" style={{ animationDelay: "160ms" }}>
                    {rest.map((r, i) => (
                      <ResultRow key={r.layer.id} baseId={baseId} item={r} index={i} />
                    ))}
                  </div>
                )}

                <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-(--fg-tertiary)">
                  <Icon name="network_intelligence" size={14} />
                  A busca usa os mesmos Knowledge Layers que seus agentes
                  consultam ao responder.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AwDashboardLayout>
  );
}

/* ── Anel de confiança (melhor correspondência) ───────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative inline-flex h-12 w-12 items-center justify-center" aria-label={`Relevância ${score}%`}>
      <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" strokeWidth="4" className="stroke-(--border-subtle)" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          style={{
            stroke: "var(--aw-blue-500)",
            transition: "stroke-dashoffset var(--dur-slow) var(--ease-out)",
          }}
        />
      </svg>
      <span className="absolute text-2xs font-semibold tabular-nums text-(--fg-primary)">
        {score}%
      </span>
    </span>
  );
}

/* ── Barra de relevância (demais correspondências) ────────────────────────── */
function ScoreBar({ score, weak }: { score: number; weak: boolean }) {
  return (
    <span className="flex w-[120px] shrink-0 items-center gap-2">
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--bg-muted)">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${score}%`,
            background: weak
              ? "var(--fg-muted)"
              : "linear-gradient(90deg, var(--aw-blue-600), var(--aw-blue-400))",
          }}
        />
      </span>
      <span className="w-9 text-right text-[12px] font-medium tabular-nums text-(--fg-secondary)">
        {score}%
      </span>
    </span>
  );
}

/* ── Card da melhor correspondência ───────────────────────────────────────── */
function TopMatchCard({ baseId, item }: { baseId: string; item: RankedLayer }) {
  const { layer, score } = item;
  return (
    <div className="mbss-reveal relative overflow-hidden rounded-2xl border border-(--border-default) bg-(--bg-raised)" style={{ animationDelay: "60ms" }}>
      {/* Filete superior em gradiente azul — assinatura do "melhor resultado". */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background:
            "linear-gradient(90deg, var(--aw-blue-600), var(--aw-blue-400) 55%, transparent)",
        }}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold"
              style={{
                background: "color-mix(in srgb, var(--aw-blue-500) 12%, transparent)",
                color: "var(--aw-blue-600)",
              }}
            >
              <Icon name="award_star" size={13} />
              Melhor correspondência
            </span>
            {item.weak && (
              <span className="text-2xs font-medium text-(--fg-tertiary)">
                correspondência fraca
              </span>
            )}
          </div>
          <ScoreRing score={score} />
        </div>

        <div>
          <h3 className="text-lg font-semibold tracking-tight">{layer.pergunta}</h3>
          <p className="mt-1.5 max-w-[640px] text-sm leading-relaxed text-(--fg-secondary)">
            {layer.resposta}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--border-subtle) pt-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-(--fg-secondary)">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="picture_as_pdf" size={14} /> {layer.fonte}
            </span>
            <span className="inline-flex items-center gap-1.5" style={{ color: QUALITY_COLOR[layer.q] }}>
              <Icon name="trending_up" size={14} /> {layer.q}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="flex -space-x-1.5">
                {layer.agents.slice(0, 3).map((a) => (
                  <img
                    key={a}
                    src={getOrbForAgent(a)}
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px] rounded-full object-cover ring-2 ring-(--bg-raised)"
                  />
                ))}
              </span>
              Utilizado por {layer.agents.length}{" "}
              {layer.agents.length === 1 ? "agente" : "agentes"}
            </span>
          </div>
          <AwButton asChild variant="secondary" size="sm" className="w-auto" iconRight="arrow_forward">
            <Link href={`/memory-base/${baseId}/layers/${layer.id}`} className="no-underline">
              Abrir Knowledge Layer
            </Link>
          </AwButton>
        </div>
      </div>
    </div>
  );
}

/* ── Linha de correspondência ─────────────────────────────────────────────── */
function ResultRow({
  baseId,
  item,
  index,
}: {
  baseId: string;
  item: RankedLayer;
  index: number;
}) {
  const { layer, score, weak } = item;
  return (
    <Link href={`/memory-base/${baseId}/layers/${layer.id}`} className="no-underline">
      <div
        className={`flex items-center gap-5 border-b border-(--border-subtle) bg-(--bg-raised) px-5 py-4 transition-colors last:border-0 hover:bg-(--bg-hover) ${
          weak ? "opacity-70" : ""
        }`}
      >
        <ScoreBar score={score} weak={weak} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-(--fg-primary)">{layer.pergunta}</p>
          <p className="mt-0.5 truncate text-[12px] text-(--fg-tertiary)">{layer.desc}</p>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 text-xs text-(--fg-secondary) lg:inline-flex">
          <Icon name="picture_as_pdf" size={14} /> {layer.fonte}
        </span>
        <span
          className="hidden shrink-0 text-[12px] font-medium xl:inline"
          style={{ color: QUALITY_COLOR[layer.q] }}
        >
          {layer.q}
        </span>
        <Icon name="chevron_right" size={18} className="shrink-0 text-(--fg-muted)" />
      </div>
    </Link>
  );
}
