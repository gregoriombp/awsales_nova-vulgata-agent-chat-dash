"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import MemoryBaseIcon from "@/components/MemoryBaseIcon";

const MEMORY_BASE_NAME_KEY_PREFIX = "memory-base-name-";
const MEMORY_BASES_STORAGE_KEY = "memory-bases-list";

function getBaseName(baseId: string): string {
  if (typeof window === "undefined" || !baseId) return "Base de conhecimento";
  try {
    const saved = window.localStorage.getItem(MEMORY_BASE_NAME_KEY_PREFIX + baseId);
    if (saved) return saved;
    const raw = window.localStorage.getItem(MEMORY_BASES_STORAGE_KEY);
    if (!raw) return "Base de conhecimento";
    const arr = JSON.parse(raw) as { id?: string; name?: string }[];
    if (!Array.isArray(arr)) return "Base de conhecimento";
    const base = arr.find((b) => b?.id === baseId);
    return base?.name ?? "Base de conhecimento";
  } catch {
    return "Base de conhecimento";
  }
}

interface ChunkItem {
  id: string;
  label: string;
  characterCount: number;
  snippet: string;
  sourceFile: string;
  sourceType?: "pdf" | "doc" | "url";
}

const MOCK_CHUNKS: ChunkItem[] = [
  {
    id: "1",
    label: "Chunk-01",
    characterCount: 290,
    snippet:
      "Para conectar seu e-mail, abra a aba Integrações e siga os passos para autorizar o MailAI. Após conectar, o MailAI analisará os e-mails recebidos e sugerirá respostas com base na sua base de conhecimento.",
    sourceFile: "Guia de Onboarding.pdf",
    sourceType: "pdf",
  },
  {
    id: "2",
    label: "Chunk-02",
    characterCount: 1250,
    snippet:
      "O MailAI analisa seus e-mails em tempo real e sugere respostas alinhadas à voz da sua marca e à documentação existente. Você pode aprovar, editar ou descartar as sugestões antes de enviar.",
    sourceFile: "Guia de Onboarding.pdf",
    sourceType: "pdf",
  },
  {
    id: "3",
    label: "Chunk-03",
    characterCount: 420,
    snippet:
      "O índice de busca semântica é atualizado automaticamente quando você adiciona ou remove documentos desta base de conhecimento. As configurações avançadas permitem ajustar o tamanho e a sobreposição dos trechos para melhor recuperação.",
    sourceFile: "Configuração Técnica.md",
    sourceType: "doc",
  },
];

function PdfIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-8-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 3v6h8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 13h2M8 17h2M14 13h4M14 17h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChunkListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function SemanticSearchPage() {
  const params = useParams<{ id: string }>();
  const baseId = typeof params?.id === "string" ? params.id : "";
  const baseName = useMemo(() => getBaseName(baseId), [baseId]);

  const [searchQuery, setSearchQuery] = useState("");
  const [chunks] = useState<ChunkItem[]>(MOCK_CHUNKS);

  const filteredChunks = searchQuery.trim()
    ? chunks.filter(
        (c) =>
          c.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.sourceFile.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chunks;

  const breadcrumbs = [
    { label: "Memory Base", href: "/memory-base", icon: <MemoryBaseIcon /> },
    {
      label: baseName,
      href: `/memory-base/${baseId}`,
      icon: (
        <img
          src="/assets/folder_data_24dp_1F1F1F_FILL0_wght200_GRAD0_opsz24.svg"
          alt=""
          width={16}
          height={16}
          className="flex-shrink-0"
        />
      ),
    },
    "Busca semântica",
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8">
        <div className="bg-white border-b border-[#f2f2f2]">
          <div className="mx-auto max-w-[1544px] px-12 py-8">
            <h1 className="text-[28px] font-semibold text-[#1a1a1a] leading-tight">Busca semântica</h1>
          </div>
        </div>

        <div className="bg-white">
          <div className="mx-auto max-w-[1544px] px-12 pt-8 pb-14 space-y-6">
            {/* Search input */}
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar no conteúdo dos arquivos..."
                className="w-full max-w-2xl h-11 px-4 rounded-lg border border-[#e5e5e5] bg-[#f9f9f9] text-[14px] text-[#1a1a1a] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#0d0d0d] focus:border-transparent"
              />
            </div>

            {/* Advanced Settings */}
            <div>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#e5e5e5] bg-white text-[14px] font-medium text-[#2f2f2f] hover:bg-[#f9f9f9] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Configurações avançadas
              </button>
            </div>

            {/* All Chunks section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-bold text-[#1a1a1a]">Todos os trechos</h2>
                <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-md bg-[#f2f2f2] text-[12px] font-medium text-[#525252]">
                  {filteredChunks.length}
                </span>
              </div>

              <ul className="space-y-4">
                {filteredChunks.map((chunk) => (
                  <li
                    key={chunk.id}
                    className="rounded-xl border border-[#f2f2f2] bg-[#fbfcfd] p-4 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[#5e5e5e]">
                        <ChunkListIcon />
                      </span>
                      <span className="text-[14px] font-medium text-[#1a1a1a]">{chunk.label}</span>
                      <span className="text-[12px] text-[#737373]">
                        {chunk.characterCount.toLocaleString("pt-BR")} caractere{chunk.characterCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#2f2f2f] leading-relaxed pl-6">{chunk.snippet}</p>
                    <div className="pl-6 flex items-center gap-2 text-[12px] text-[#5e5e5e]">
                      <span className="text-[#1a1a1a]">
                        <PdfIcon />
                      </span>
                      <span className="font-medium text-[#0d0d0d]">{chunk.sourceFile}</span>
                      <a
                        href="#"
                        className="p-0.5 rounded text-[#737373] hover:text-[#0d0d0d] hover:bg-[#f2f2f2]"
                        aria-label="Abrir arquivo de origem"
                      >
                        <ExternalLinkIcon />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
