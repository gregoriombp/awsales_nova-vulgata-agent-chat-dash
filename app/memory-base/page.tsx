"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AwSidebar } from "@/components/ui/AwSidebar";
import { AwCortexSynthesis } from "@/components/ui/AwCortexSynthesis";
import { AwMemoryBaseLogo } from "@/components/ui/AwMemoryBaseLogo";

const MEMORY_BASES_STORAGE_KEY = "memory-bases-list";

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

export default function MemoryBaseWelcomePage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleCreate = useCallback(() => {
    if (creating) return;
    setCreating(true);
    const id = createMemoryBase();
    router.push(`/memory-base/${id}?new=1`);
  }, [creating, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#05070d]">
      <AwSidebar forcedCollapsed />

      <main className="relative flex flex-1 min-w-0 flex-col items-center justify-center overflow-hidden">
        {/* Fundo azul animado — shader Synthesis (@react-three/fiber) */}
        <AwCortexSynthesis
          backgroundColor="#000000"
          color1="#020207"
          color2="#060709"
          color3="#D8E5F9"
          speed={0.06}
          scale={2}
          complexity={8}
          distortion={1.35}
          glowIntensity={0.0}
          flowFrequency={1.6}
          contrast={1.15}
        />
        {/* Vinheta: escurece as bordas e concentra o brilho ao centro,
            aproximando do gradiente radial da referência. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 38%, rgba(5,7,13,0) 0%, rgba(5,7,13,0.35) 55%, rgba(5,7,13,0.92) 100%)",
          }}
        />

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col items-center gap-[50px] px-8 text-center">
          <AwMemoryBaseLogo size={180} />

          <div className="flex w-[560px] max-w-full flex-col items-center gap-8">
            <h1 className="font-heading text-[2.5rem] leading-none text-white">
              Bem-vindo à Memory Base
            </h1>
            <p className="text-base leading-relaxed tracking-tight text-[#ececec]">
              O Memory Base é onde você organiza todo o conhecimento dos seus
              agentes. Crie bases de conhecimento para armazenar documentos,
              URLs, snippets e integrações que alimentarão suas conversas
              inteligentes.
            </p>

            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="inline-flex h-[50px] items-center justify-center gap-2 rounded-2xl bg-white pl-4 pr-6 font-heading font-medium text-[#0d0d0d] transition-colors hover:bg-[#f2f2f2] disabled:opacity-60"
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
  );
}
