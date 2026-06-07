"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";

const MEMORY_BASES_STORAGE_KEY = "memory-bases-list";
const MEMORY_BASE_SOURCES_KEY_PREFIX = "memory-base-sources-";
const MEMORY_BASE_NAME_KEY_PREFIX = "memory-base-name-";

interface MemoryBaseItem {
  id: string;
  name: string;
  documentCount?: number;
}

function loadBasesFromStorage(): MemoryBaseItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MEMORY_BASES_STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as { id?: string; name?: string; documentCount?: number }[];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((b): b is { id: string; name: string; documentCount?: number } => typeof b?.id === "string" && typeof b?.name === "string")
      .map((b) => ({ id: b.id, name: b.name, documentCount: b?.documentCount ?? 0 }));
  } catch {
    return [];
  }
}

function getSourceCount(baseId: string): number {
  if (typeof window === "undefined" || !baseId) return 0;
  try {
    const raw = window.localStorage.getItem(MEMORY_BASE_SOURCES_KEY_PREFIX + baseId);
    if (!raw) return 0;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

function getBaseName(baseId: string): string {
  if (typeof window === "undefined" || !baseId) return "Base de conhecimento";
  try {
    const saved = window.localStorage.getItem(MEMORY_BASE_NAME_KEY_PREFIX + baseId);
    if (saved) return saved;
    const bases = loadBasesFromStorage();
    const base = bases.find((b) => b.id === baseId);
    return base?.name ?? "Base de conhecimento";
  } catch {
    return "Base de conhecimento";
  }
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <img
      src="/assets/folder_data_24dp_1F1F1F_FILL0_wght200_GRAD0_opsz24.svg"
      alt=""
      width={24}
      height={24}
      className={className}
    />
  );
}

function DocumentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-8-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 3v6h8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function MemoryBaseSidebar() {
  const pathname = usePathname();
  const params = useParams<{ id: string }>();

  const isFolderView = pathname === "/memory-base";
  const baseId = typeof params?.id === "string" ? params.id : null;
  const isDocumentsActive = baseId && pathname === `/memory-base/${baseId}` && !pathname.includes("/semantic-search") && !pathname.includes("/settings");
  const isSemanticSearchActive = baseId && pathname?.includes("/semantic-search");
  const isSettingsActive = baseId && pathname?.includes("/settings");

  const currentBaseName = baseId ? getBaseName(baseId) : "";
  const currentBaseDocCount = baseId ? getSourceCount(baseId) : 0;

  // A index (/memory-base) tem sua própria UI de listagem em largura cheia —
  // não mostramos o rail de pastas aqui. Ele só aparece dentro de uma base.
  if (isFolderView) return null;

  return (
    <aside
      className="w-[280px] h-full bg-[var(--bg-raised)] border-r border-[var(--border-subtle)] flex flex-col flex-shrink-0 overflow-hidden"
      data-tour="kb-sidebar"
    >
      <div className="flex-1 min-h-0 overflow-y-auto py-4">
        {baseId ? (
          /* Menu contextual da Base de Conhecimento */
          <div className="px-3 space-y-4">
            {/* Card da base selecionada */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-4">
              <div className="flex items-start gap-3">
                <div className="text-[var(--fg-primary)] flex-shrink-0">
                  <FolderIcon className="w-10 h-10" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="body-sm font-medium text-[var(--fg-primary)] truncate">{currentBaseName}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex gap-1 items-center">
                      <span className="w-5 h-5 rounded bg-[var(--bg-muted)]" title="Notion" />
                      <span className="w-5 h-5 rounded overflow-hidden flex items-center justify-center" title="Google Drive">
                        <img src="/assets/integrations/Logotipo/Tool/Tamanho=104px.png" alt="" className="w-full h-full object-contain" />
                      </span>
                      <span className="w-5 h-5 rounded overflow-hidden flex items-center justify-center" title="Slack">
                        <img src="/assets/integrations/Tipo=Canais, Tamanho=Slack.png" alt="" className="w-full h-full object-contain" />
                      </span>
                    </span>
                    <span className="body-xs text-[var(--fg-secondary)]">{currentBaseDocCount} {currentBaseDocCount === 1 ? "fonte" : "fontes"}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-1 rounded-lg text-[var(--fg-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg-primary)]"
                  aria-label="Opções da base"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-8-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Menu: Documents, Semantic Search, Settings */}
            <nav className="space-y-0.5">
              <Link
                href={`/memory-base/${baseId}`}
                className={`flex items-center gap-2 py-2.5 px-3 rounded-lg body-sm font-medium transition-colors ${
                  isDocumentsActive ? "bg-[var(--bg-selected)] text-[var(--fg-primary)]" : "text-[var(--fg-primary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                <DocumentIcon />
                <span className="flex-1">Documentos</span>
                <span className="body-xs text-[var(--fg-tertiary)] font-normal">{currentBaseDocCount}</span>
              </Link>
              <Link
                href={`/memory-base/${baseId}/semantic-search`}
                className={`flex items-center gap-2 py-2.5 px-3 rounded-lg body-sm font-medium transition-colors ${
                  isSemanticSearchActive ? "bg-[var(--bg-selected)] text-[var(--fg-primary)]" : "text-[var(--fg-primary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                <SearchIcon />
                <span>Busca semântica</span>
              </Link>
              <Link
                href={`/memory-base/${baseId}/settings`}
                className={`flex items-center gap-2 py-2.5 px-3 rounded-lg body-sm font-medium transition-colors ${
                  isSettingsActive ? "bg-[var(--bg-selected)] text-[var(--fg-primary)]" : "text-[var(--fg-primary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                <SettingsIcon />
                <span>Configurações</span>
              </Link>
            </nav>

          
          </div>
        ) : null}
      </div>
    </aside>
  );
}
