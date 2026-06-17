"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AwSidebar } from "@/components/ui/AwSidebar";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwCortexSynthesis } from "@/components/ui/AwCortexSynthesis";
import { AwMemoryBaseLogo } from "@/components/ui/AwMemoryBaseLogo";
import { AwPageHeader } from "@/components/ui/AwPageHeader";
import { AwButton } from "@/components/ui/AwButton";
import {
  AwEmpty,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
  AwEmptyDescription,
  AwEmptyContent,
} from "@/components/ui/AwEmpty";
import { useAwTheme } from "@/components/ui/AwThemeProvider";
import MemoryBaseIcon from "@/components/memory-base/MemoryBaseIcon";
import { KnowledgeBaseExplorer } from "@/components/memory-base/KnowledgeBaseExplorer";
import {
  MOCK_KNOWLEDGE_BASES,
  type KnowledgeBase,
} from "@/components/memory-base/knowledgeBases";

const MEMORY_BASES_STORAGE_KEY = "memory-bases-list";

const HEADER_DESCRIPTION =
  "MemoryBase é a Base de Conhecimento dos seus Agentes. Todos os seus documentos, URLs e snippets ficam organizados aqui.";

/** Paletas do shader Synthesis por aparência.
 *  Hex literais de propósito: são uniforms passados ao WebGL, não classes CSS —
 *  o shader não lê var(--token). NÃO migrar para tokens do design system. */
const SHADER = {
  dark: {
    backgroundColor: "#000000",
    color1: "#020207",
    color2: "#060709",
    color3: "#D8E5F9",
    speed: 0.06,
    scale: 2,
    complexity: 8,
    distortion: 1.35,
    glowIntensity: 0,
    flowFrequency: 1.6,
    contrast: 1.15,
  },
  light: {
    backgroundColor: "#ffffff",
    color1: "#ffffff",
    color2: "#e8f0ff",
    color3: "#9bc0ff",
    speed: 0.06,
    scale: 2.4,
    complexity: 8,
    distortion: 1.2,
    glowIntensity: 0,
    flowFrequency: 1.6,
    contrast: 1.0,
  },
} as const;

/* ─────────────────────────────────────────────────────────────────────────
 * Estados da landing — mesma lógica do Agent Studio.
 *
 *   • "welcome"   → primeiro acesso de todos: o usuário NUNCA teve uma base de
 *                   conhecimento. Visto uma única vez (cena cheia do shader).
 *   • "empty"     → usuário recorrente sem nenhuma base no momento (já passou da
 *                   boas-vindas). Mantém o chrome + card vazio.
 *   • "populated" → usuário já tem ≥ 1 base. Mostra busca, filtros e a lista
 *                   (cards ou tabela).
 *
 * Em produção o estado vem do backend (tem base? já passou da welcome?). No
 * protótipo fica fixo aqui — trocar o valor pra iterar nos três cenários.
 * ─────────────────────────────────────────────────────────────────────────── */
type MemoryBaseState = "welcome" | "empty" | "populated";

const MONTHS_PT = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/** "2026-06-07" → "07 de jun 2026" (formato das bases mock). */
function formatCreatedAt(iso: string): string {
  const [y, m, d] = (iso ?? "").split("-").map(Number);
  if (!y || !m || !d) return iso ?? "";
  return `${String(d).padStart(2, "0")} de ${MONTHS_PT[m - 1]} ${y}`;
}

/**
 * Bases que o usuário criou (persistidas em localStorage pelo fluxo de "Criar
 * base") mapeadas pro shape da lista. Objetivo/segmento ficam vazios até a base
 * ser configurada — os cards/linhas mostram um selo "Nova" nesse caso. Assim o
 * fluxo Criar → voltar pra lista fecha o ciclo (a base recém-criada aparece).
 */
function loadCreatedBases(): KnowledgeBase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MEMORY_BASES_STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((b) => b && typeof b.id === "string")
      .map((b): KnowledgeBase => ({
        id: b.id,
        name: b.name || "Base de conhecimento",
        status: b.status === "inactive" ? "inativo" : "ativo",
        objetivo: typeof b.objetivo === "string" ? b.objetivo : "",
        segmento: typeof b.segmento === "string" ? b.segmento : "",
        tipoDados: typeof b.tipoDados === "string" ? b.tipoDados : "",
        produtos: 0,
        fontes: typeof b.documentCount === "number" ? b.documentCount : 0,
        knowledgeLayers:
          typeof b.knowledgeLayersCount === "number" ? b.knowledgeLayersCount : 0,
        agents: [],
        updatedAt: formatCreatedAt(b.createdAt),
      }))
      .reverse(); // mais recentes primeiro
  } catch {
    return [];
  }
}

export default function MemoryBaseIndexPage() {
  const router = useRouter();

  // Protótipo: estado fixo. Trocar aqui pra iterar nos três cenários.
  const state = "populated" as MemoryBaseState;

  // Bases criadas pelo usuário (localStorage) + as mock. Lido só no cliente pra
  // não quebrar hidratação. Recarrega ao voltar pra aba (base recém-criada).
  const [createdBases, setCreatedBases] = useState<KnowledgeBase[]>([]);
  useEffect(() => {
    const sync = () => setCreatedBases(loadCreatedBases());
    sync();
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);
  const bases = useMemo(
    () => [...createdBases, ...MOCK_KNOWLEDGE_BASES],
    [createdBases],
  );

  // "Criar base" abre o wizard full-screen (/memory-base/new).
  const handleCreate = useCallback(() => {
    router.push("/memory-base/new");
  }, [router]);

  // Primeiro acesso: cena cheia do shader, sem o chrome do dashboard.
  if (state === "welcome") {
    return <WelcomeState creating={false} onCreate={handleCreate} />;
  }

  // Recorrente (vazio ou populado): chrome padrão do dashboard.
  return (
    <AwDashboardLayout mainClassName="p-0!">
      <div className="mx-auto w-full max-w-[1600px] px-6 pb-20 pt-6 sm:px-10">
        <AwPageHeader
          size="hero"
          icon={
            <MemoryBaseIcon
              width={26}
              height={28}
              className="text-(--fg-primary)"
            />
          }
          title="Memory Base"
          description={HEADER_DESCRIPTION}
          actions={
            <AwButton
              variant="primary"
              size="md"
              iconLeft="add"
              onClick={handleCreate}
            >
              Criar base
            </AwButton>
          }
          divider={false}
        />

        {state === "populated" ? (
          <KnowledgeBaseExplorer bases={bases} />
        ) : (
          <EmptyState creating={false} onCreate={handleCreate} />
        )}
      </div>
    </AwDashboardLayout>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Estado 1 — primeiro acesso (welcome). Cena cheia com o shader Synthesis.
 * Visto uma única vez, quando o usuário nunca teve nenhuma base.
 * ───────────────────────────────────────────────────────────────────────── */
function WelcomeState({
  creating,
  onCreate,
}: {
  creating: boolean;
  onCreate: () => void;
}) {
  const { resolvedTheme } = useAwTheme();

  // Só monta o shader (WebGL) no cliente — useSyncExternalStore é hidratação-safe
  // (false no server, true no client) sem precisar de setState dentro de effect.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const palette = resolvedTheme === "dark" ? SHADER.dark : SHADER.light;

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg-surface)">
      <AwSidebar forcedCollapsed />

      {/* Mesmo container arredondado que toda página usa (espelha AwDashboardLayout):
          painel flutuante com cantos --radius-xl + borda; a surface aparece nas bordas. */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        {/* dark:bg-[#05070d] é literal de propósito: azul-quase-preto que costura
            com a borda do shader Synthesis (color2 #060709). Não é --bg-canvas. */}
        <main className="relative my-2 mr-2 flex flex-1 min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-(--border-subtle) bg-(--bg-raised) dark:bg-[#05070d]">
          {/* Fundo animado — shader Synthesis (@react-three/fiber). Paleta clara/escura. */}
          {mounted && <AwCortexSynthesis {...palette} />}

          {/* Overlay pra escurecer/suavizar o shader e dar legibilidade ao texto.
              Light: 40% branco dá folga de contraste pro texto escuro. Dark: 40% preto. */}
          <div className="pointer-events-none absolute inset-0 bg-white/40 dark:bg-black/40" />

          {/* Vinheta — concentra o brilho ao centro e funde as bordas na cor do painel.
              Uma por aparência (toggle por CSS, sem flash). */}
          <div
            className="pointer-events-none absolute inset-0 dark:hidden"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 38%, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 55%, rgba(255,255,255,0.92) 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 hidden dark:block"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 38%, rgba(5,7,13,0) 0%, rgba(5,7,13,0.35) 55%, rgba(5,7,13,0.92) 100%)",
            }}
          />

          {/* Conteúdo */}
          <div className="relative z-10 flex flex-col items-center gap-12.5 px-8 text-center">
            <AwMemoryBaseLogo size={180} className="text-(--fg-primary)" />

            <div className="flex w-[560px] max-w-full flex-col items-center gap-8">
              <h1 className="font-heading text-[2.5rem] leading-none text-fg-primary">
                Bem-vindo à Memory Base
              </h1>
              <p className="text-base leading-relaxed tracking-tight text-(--fg-secondary)">
                O Memory Base é onde você organiza todo o conhecimento dos seus
                agentes. Crie bases de conhecimento para armazenar documentos,
                URLs, snippets e integrações que alimentarão suas conversas
                inteligentes.
              </p>

              <button
                type="button"
                onClick={onCreate}
                disabled={creating}
                className="inline-flex h-[50px] items-center justify-center gap-2 rounded-2xl bg-(--bg-inverse) pl-4 pr-6 font-heading font-medium text-(--fg-on-inverse) transition-colors hover:bg-(--aw-gray-1100) disabled:opacity-60 dark:hover:bg-(--aw-gray-200)"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M8 3.333v9.334M3.333 8h9.334"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                Criar Memory Base
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Estado 2 — empty (recorrente, sem nenhuma base). Card vazio + CTA, dentro
 * do chrome do dashboard. Diferente da welcome de primeiro acesso.
 * ───────────────────────────────────────────────────────────────────────── */
function EmptyState({
  creating,
  onCreate,
}: {
  creating: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="mt-10 rounded-xl border border-(--border-subtle) bg-(--bg-canvas)">
      <AwEmpty>
        <AwEmptyHeader>
          <AwEmptyMedia variant="default">
            <AwMemoryBaseLogo size={72} className="text-(--fg-primary)" />
          </AwEmptyMedia>
          <AwEmptyTitle>Você ainda não tem bases de conhecimento</AwEmptyTitle>
          <AwEmptyDescription>
            Crie sua primeira base para reunir documentos, URLs, snippets e
            integrações que alimentam seus agentes.
          </AwEmptyDescription>
        </AwEmptyHeader>
        <AwEmptyContent>
          <AwButton
            variant="primary"
            iconLeft="add"
            onClick={onCreate}
            disabled={creating}
          >
            Criar base
          </AwButton>
        </AwEmptyContent>
      </AwEmpty>
    </div>
  );
}
