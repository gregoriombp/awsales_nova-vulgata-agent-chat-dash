"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
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
import { MOCK_KNOWLEDGE_BASES } from "@/components/memory-base/knowledgeBases";

const MEMORY_BASES_STORAGE_KEY = "memory-bases-list";

const HEADER_DESCRIPTION =
  "MemoryBase é a Base de Conhecimento dos seus Agentes. Todos os seus documentos, URLs e snippets ficam organizados aqui.";

/** Paletas do shader Synthesis por aparência. */
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

/**
 * Cria uma base nova (id + persistência no padrão de localStorage usado pela
 * tela de detalhe) e devolve o id pra navegar com `?new=1` — assim a página
 * `/memory-base/[id]` assume o estado de base recém-criada (tour + vazia).
 */
function createMemoryBase(): string {
  const id = Math.random().toString(36).slice(2, 9);
  const name = "Base de conhecimento";
  try {
    const raw = window.localStorage.getItem(MEMORY_BASES_STORAGE_KEY);
    const bases = raw ? JSON.parse(raw) : [];
    bases.push({
      id,
      name,
      description: "",
      type: "documentos",
      documentCount: 0,
      knowledgeLayersCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      status: "active",
    });
    window.localStorage.setItem(MEMORY_BASES_STORAGE_KEY, JSON.stringify(bases));
    window.localStorage.setItem(`memory-base-name-${id}`, name);
    window.localStorage.setItem(`memory-base-empty-${id}`, "1");
  } catch (e) {
    console.error("Erro ao criar a Memory Base:", e);
  }
  return id;
}

export default function MemoryBaseIndexPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  // Protótipo: estado fixo. Trocar aqui pra iterar nos três cenários.
  const state = "populated" as MemoryBaseState;

  const handleCreate = useCallback(() => {
    if (creating) return;
    setCreating(true);
    const id = createMemoryBase();
    router.push(`/memory-base/${id}?new=1`);
  }, [creating, router]);

  // Primeiro acesso: cena cheia do shader, sem o chrome do dashboard.
  if (state === "welcome") {
    return <WelcomeState creating={creating} onCreate={handleCreate} />;
  }

  // Recorrente (vazio ou populado): chrome padrão do dashboard.
  return (
    <AwDashboardLayout mainClassName="!p-0">
      <div className="mx-auto w-full max-w-[1600px] px-6 pb-20 pt-6 sm:px-10">
        <AwPageHeader
          size="hero"
          icon={
            <MemoryBaseIcon
              width={26}
              height={28}
              className="text-[var(--fg-primary)]"
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
              disabled={creating}
            >
              Criar base
            </AwButton>
          }
          divider={false}
        />

        {state === "populated" ? (
          <KnowledgeBaseExplorer bases={MOCK_KNOWLEDGE_BASES} />
        ) : (
          <EmptyState creating={creating} onCreate={handleCreate} />
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
    <div className="flex h-screen overflow-hidden bg-[var(--bg-surface)]">
      <AwSidebar forcedCollapsed />

      {/* Mesmo container arredondado que toda página usa (espelha AwDashboardLayout):
          painel flutuante com cantos --radius-xl + borda; a surface aparece nas bordas. */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        <main className="relative my-2 mr-2 flex flex-1 min-w-0 flex-col items-center justify-center overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-white dark:bg-[#05070d]">
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
          <div className="relative z-10 flex flex-col items-center gap-[50px] px-8 text-center">
            <AwMemoryBaseLogo size={180} className="text-[#0d0d0d] dark:text-white" />

            <div className="flex w-[560px] max-w-full flex-col items-center gap-8">
              <h1 className="font-heading text-[2.5rem] leading-none text-fg-primary">
                Bem-vindo à Memory Base
              </h1>
              <p className="text-base leading-relaxed tracking-tight text-[#5e5e5e] dark:text-[#ececec]">
                O Memory Base é onde você organiza todo o conhecimento dos seus
                agentes. Crie bases de conhecimento para armazenar documentos,
                URLs, snippets e integrações que alimentarão suas conversas
                inteligentes.
              </p>

              <button
                type="button"
                onClick={onCreate}
                disabled={creating}
                className="inline-flex h-[50px] items-center justify-center gap-2 rounded-2xl bg-[#0d0d0d] pl-4 pr-6 font-heading font-medium text-white transition-colors hover:bg-[#262626] disabled:opacity-60 dark:bg-white dark:text-[#0d0d0d] dark:hover:bg-[#f2f2f2]"
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
    <div className="mt-10 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
      <AwEmpty>
        <AwEmptyHeader>
          <AwEmptyMedia variant="default">
            <AwMemoryBaseLogo size={72} className="text-[var(--fg-primary)]" />
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
