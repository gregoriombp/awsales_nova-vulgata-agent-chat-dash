"use client";

import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import MemoryBaseIcon from "@/components/memory-base/MemoryBaseIcon";
import { Icon } from "@/components/ui/Icon";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";
import { AwToggle } from "@/components/ui/AwToggle";
import { AwDropzone } from "@/components/ui/AwDropzone";
import { AwFileIcon } from "@/components/ui/AwFileIcon";
import BaseModal from "@/components/modals/BaseModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import AddUrlFlow from "@/components/modals/AddUrlFlow";
import SendFileModal from "@/components/modals/SendFileModal";
import AddSnippetModal from "@/components/modals/AddSnippetModal";
import CreateFolderModal from "@/components/modals/CreateFolderModal";
import RenameFolderModal from "@/components/modals/RenameFolderModal";
import ActivateIntegrationsModal, { type IntegrationItem, DEFAULT_INTEGRATIONS } from "@/components/modals/ActivateIntegrationsModal";
import AddCatalogModal from "@/components/modals/AddCatalogModal";
import {
  TbPlug,
  TbSettings,
  TbX,
  TbCopy,
  TbRefresh,
  TbDownload,
  TbSearch,
  TbFilter,
  TbChevronDown,
  TbFolder,
  TbFolderPlus,
  TbChevronRight,
  TbArrowLeft,
  TbPencil,
  TbTrash,
  TbFolderOpen,
  TbTrendingUp,
} from "react-icons/tb";
import { getOrbForAgent } from "@/lib/agentOrbs";
import { useToast } from "@/components/ui/AwToast";
import { KnowledgeLayersTab } from "@/components/memory-base/KnowledgeLayersTab";
import { ProductsTab } from "@/components/memory-base/ProductsTab";

/** Gera um UUID determinístico a partir do id da linha (para exibição como ID do arquivo). */
function idToFileUuid(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  const hex = (n: number, len: number) =>
    ((n >>> 0) & 0xffffffff).toString(16).padStart(len, "0").slice(-len);
  const s0 = (h ^ 0x12345678) >>> 0;
  const s1 = (h * 7 + id.length) >>> 0;
  const s2 = (h * 13 ^ 0x9abc) >>> 0;
  const s3 = (h * 31 + 0xdef) >>> 0;
  const s4a = (h * 17 ^ 0x11223344) >>> 0;
  const s4b = (h * 11 + id.length * 0x100) >>> 0;
  return `${hex(s0, 8)}-${hex(s1, 4)}-${hex(s2, 4)}-${hex(s3, 4)}-${hex(s4a, 8)}${hex(s4b, 4)}`;
}

type SourceRow = {
  id: string;
  name: string;
  typeLabel: string;
  status: "Ativo" | "Inativo" | "Analisando" | "Erro";
  layersLabel: string;
  createdAt: string;
  folderId?: string | null; // null = pasta raiz
};

type Folder = {
  id: string;
  name: string;
  parentId: string | null; // null = pasta raiz
  createdAt: string;
};

function Checkbox({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={checked}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`h-4 w-4 rounded-[4px] border flex items-center justify-center transition-colors ${
        checked ? "bg-gray-1200 border-gray-1200" : "bg-(--bg-raised) border-(--border-default)"
      }`}
    >
      {checked ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6 9 17l-5-5"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </button>
  );
}

function DotsVertical32() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

function Plus24() {
  // Material Symbols (styleguide), tamanho contido — antes era um SVG 24px bold.
  return <Icon name="add" size={20} weight={300} />;
}

function Layers16() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3 3 8l9 5 9-5-9-5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M3 12l9 5 9-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Ellipsis16() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

function CheckboxSquare16() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 5h14v14H5V5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getFileExtension(name: string): string {
  const lastDot = name.lastIndexOf(".");
  if (lastDot === -1) return "";
  return name.slice(lastDot + 1).toLowerCase();
}

function getIntegrationIconUrl(integrationName: string): string | undefined {
  const normalized = integrationName.trim().toLowerCase();
  const found = DEFAULT_INTEGRATIONS.find(
    (i) => i.name.toLowerCase() === normalized || normalized.startsWith(i.name.toLowerCase() + " ")
  );
  return found?.icon;
}

/**
 * Tile tintado 32px para fontes que não são arquivo (URL/Snippet/Catálogo).
 * color-mix sobre transparente funciona em fundo claro e escuro.
 */
function TintTile({
  icon,
  tint,
  size = 32,
}: {
  icon: string;
  tint: string;
  size?: number;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg"
      style={{
        width: size,
        height: size,
        background: `color-mix(in srgb, ${tint} 14%, transparent)`,
        color: tint,
      }}
    >
      <Icon name={icon} size={Math.round(size * 0.53)} weight={300} />
    </div>
  );
}

// Cor no background por tipo de fonte (2026-06-10, pedido de produto — o
// grayscale anterior achatava a tabela): arquivos usam o AwFileIcon do DS
// (tile colorido por formato), URL/Snippet/Catálogo usam tiles tintados nos
// accents, integrações mantêm o feixe em gradiente com o logo da marca.
function FileTypeIcon({ name, typeLabel }: { name: string; typeLabel: string }) {
  if (typeLabel === "Catálogo") {
    return <TintTile icon="database" tint="var(--aw-amber-500)" />;
  }
  if (typeLabel === "URL") {
    return <TintTile icon="language" tint="var(--aw-teal-600)" />;
  }
  if (typeLabel === "Snippet") {
    return <TintTile icon="data_object" tint="var(--aw-purple-500)" />;
  }
  if (typeLabel === "Integração") {
    const integrationIcon = getIntegrationIconUrl(name);
    return (
      <div className="relative h-8 w-8 rounded-sm overflow-hidden shrink-0">
        {/* Só o feixe em gradiente gira no perímetro; o quadrado fica fixo */}
        <div className="absolute inset-0 rounded-sm integration-icon-gradient-border" aria-hidden />
        <div className="absolute inset-[2px] rounded-xs bg-(--bg-raised) z-1" />
        <div className="absolute inset-0 flex items-center justify-center z-2">
          {integrationIcon ? (
            <img src={integrationIcon} alt="" className="w-5 h-5 object-contain" />
          ) : (
            <TbPlug size={16} strokeWidth={1.5} className="text-(--fg-secondary)" />
          )}
        </div>
      </div>
    );
  }

  const ext = getFileExtension(name);
  return <AwFileIcon ext={ext || undefined} size="sm" alt={name} />;
}

function ActionCard({
  icon,
  label,
  right,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group bg-(--bg-raised) border border-(--border-subtle) rounded-[20px] h-[108px] p-[21px] flex flex-col justify-between w-full text-left transition-colors hover:bg-gray-1200 hover:border-gray-1200"
    >
      <div className="flex items-center justify-between">
        <div className="text-(--fg-primary) group-hover:text-aw-gray-150">
          {icon}
        </div>
        <div className="text-(--fg-primary) group-hover:text-aw-gray-150">
          {right ?? <Plus24 />}
        </div>
      </div>
      <div className="text-[14px] font-medium text-(--fg-primary) group-hover:text-aw-gray-150">
        {label}
      </div>
    </button>
  );
}

const MOCK_ROWS: SourceRow[] = [
  { id: "1", name: "Training_Manual.pdf", typeLabel: "Arquivo", status: "Ativo", layersLabel: "82 itens", createdAt: "21 de Jan. 2026 às 14:04" },
  { id: "2", name: "Design-Guidelines.docx", typeLabel: "Arquivo", status: "Ativo", layersLabel: "18 itens", createdAt: "21 de Jan. 2026 às 14:12" },
  { id: "3", name: "UserResearch-Results.xlsx", typeLabel: "Arquivo", status: "Ativo", layersLabel: "42 itens", createdAt: "21 de Jan. 2026 às 14:18" },
  { id: "4", name: "Contrato-Fornecedor_Concord.pdf", typeLabel: "Arquivo", status: "Inativo", layersLabel: "9 itens", createdAt: "20 de Jan. 2026 às 18:22" },
  { id: "5", name: "FAQ_Marca_Concord.md", typeLabel: "Snippet", status: "Ativo", layersLabel: "27 itens", createdAt: "20 de Jan. 2026 às 09:10" },
  { id: "6", name: "https://concord.com.br/historia", typeLabel: "URL", status: "Ativo", layersLabel: "13 itens", createdAt: "19 de Jan. 2026 às 11:03" },
  { id: "7", name: "BrandBook_2026_v3.pdf", typeLabel: "Arquivo", status: "Ativo", layersLabel: "64 itens", createdAt: "18 de Jan. 2026 às 16:40" },
  { id: "8", name: "Políticas_de_Privacidade.pdf", typeLabel: "Arquivo", status: "Ativo", layersLabel: "11 itens", createdAt: "18 de Jan. 2026 às 10:04" },
];

const SOURCES_STORAGE_KEY_PREFIX = "memory-base-sources-";
const FOLDERS_STORAGE_KEY_PREFIX = "memory-base-folders-";

/** Qualidade/saúde de um Knowledge Layer — cores mapeadas aos accents do DS. */
type KLQuality = "Muito alta" | "Alta" | "Razoável" | "Péssimo";
const QUALITY_COLOR: Record<KLQuality, string> = {
  "Muito alta": "var(--accent-success)",
  Alta: "var(--accent-success)",
  Razoável: "var(--accent-warning)",
  Péssimo: "var(--accent-danger)",
};

function getSourcesStorageKey(id: string): string {
  return SOURCES_STORAGE_KEY_PREFIX + id;
}

function getFoldersStorageKey(id: string): string {
  return FOLDERS_STORAGE_KEY_PREFIX + id;
}

function loadRowsFromStorage(id: string): SourceRow[] | null {
  if (typeof window === "undefined" || !id) return null;
  try {
    const raw = window.localStorage.getItem(getSourcesStorageKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SourceRow[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function loadFoldersFromStorage(id: string): Folder[] {
  if (typeof window === "undefined" || !id) return [];
  try {
    const raw = window.localStorage.getItem(getFoldersStorageKey(id));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Folder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFoldersToStorage(id: string, folders: Folder[]): void {
  if (typeof window === "undefined" || !id) return;
  try {
    window.localStorage.setItem(getFoldersStorageKey(id), JSON.stringify(folders));
  } catch {}
}

function getFolderPath(folderId: string | null, folders: Folder[]): Folder[] {
  if (!folderId) return [];
  const path: Folder[] = [];
  let current = folders.find((f) => f.id === folderId);
  while (current) {
    path.unshift(current);
    current = current.parentId ? folders.find((f) => f.id === current!.parentId) : undefined;
  }
  return path;
}

const MEMORY_BASES_STORAGE_KEY = "memory-bases-list";
const MEMORY_BASE_NAME_KEY_PREFIX = "memory-base-name-";

function getBaseNameFromStorage(id: string): string {
  if (typeof window === "undefined" || !id) return "";
  try {
    const saved = window.localStorage.getItem(MEMORY_BASE_NAME_KEY_PREFIX + id);
    if (saved) return saved;
    const raw = window.localStorage.getItem(MEMORY_BASES_STORAGE_KEY);
    if (!raw) return "";
    const arr = JSON.parse(raw) as { id?: string; name?: string }[];
    if (!Array.isArray(arr)) return "";
    const base = arr.find((b) => b?.id === id);
    return base?.name ?? "";
  } catch {
    return "";
  }
}

function getFallbackNameFromId(id: string): string {
  const fromStorage = getBaseNameFromStorage(id);
  if (fromStorage) return fromStorage;
  const decoded = id ? decodeURIComponent(id) : "";
  const normalized = decoded.replace(/[-_]+/g, " ").trim();
  if (!normalized || normalized.length < 12) return "Base de Conhecimento";
  return normalized.split(" ").map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
}

type BreadcrumbItem = { label: string; href: string; icon: React.ReactNode };

export default function MemoryBaseDirectoryPage() {
  return (
    <Suspense fallback={null}>
      <MemoryBaseDirectoryContent />
    </Suspense>
  );
}

function MemoryBaseDirectoryContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { push: pushToast } = useToast();

  const nameFromUrl = searchParams.get("name");
  const isNewFromUrl = searchParams.get("new") === "1";

  const [search, setSearch] = useState("");
  // Aba ativa do detalhe da base. "documentos" = visão de Fontes (existente);
  // "playbook"/"produtos" = visões de Knowledge Layers e produtos (flow do Figma).
  const [activeTab, setActiveTab] = useState<"documentos" | "playbook" | "produtos">("documentos");
  const [isDirectoryActive, setIsDirectoryActive] = useState(true);
  const [isDirMenuOpen, setIsDirMenuOpen] = useState(false);
  const dirMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const dirMenuRef = useRef<HTMLDivElement | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rows, setRows] = useState<SourceRow[]>(() => {
    if (typeof window === "undefined") return MOCK_ROWS;
    const id = typeof params?.id === "string" ? params.id : "";
    if (id && window.localStorage.getItem("memory-base-empty-" + id)) return [];
    if (isNewFromUrl || nameFromUrl) return [];
    const stored = loadRowsFromStorage(id);
    if (stored && stored.length >= 0) return stored;
    return MOCK_ROWS;
  });

  const [rowMenuOpenId, setRowMenuOpenId] = useState<string | null>(null);
  const rowMenuRef = useRef<HTMLDivElement | null>(null);

  const [viewRow, setViewRow] = useState<SourceRow | null>(null);
  const [drawerRow, setDrawerRow] = useState<SourceRow | null>(null);
  const [drawerTab, setDrawerTab] = useState<"conteudo" | "layers" | "visualizar">("conteudo");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteDirectoryOpen, setIsDeleteDirectoryOpen] = useState(false);
  const [isAddUrlOpen, setIsAddUrlOpen] = useState(false);
  const [isSendFileOpen, setIsSendFileOpen] = useState(false);
  const [isAddSnippetOpen, setIsAddSnippetOpen] = useState(false);
  const [isActivateIntegrationsOpen, setIsActivateIntegrationsOpen] = useState(false);
  const [isAddCatalogOpen, setIsAddCatalogOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isRenameFolderOpen, setIsRenameFolderOpen] = useState(false);
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const extractionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estado de pastas
  const [folders, setFolders] = useState<Folder[]>(() => {
    if (typeof window === "undefined") return [];
    const id = typeof params?.id === "string" ? params.id : "";
    return loadFoldersFromStorage(id);
  });
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderMenuOpenId, setFolderMenuOpenId] = useState<string | null>(null);
  const folderMenuRef = useRef<HTMLDivElement | null>(null);

  const [isAgentsPopoverOpen, setIsAgentsPopoverOpen] = useState(false);
  const [isSourcesPopoverOpen, setIsSourcesPopoverOpen] = useState(false);
  const [isLayersPopoverOpen, setIsLayersPopoverOpen] = useState(false);
  const agentsPopoverRef = useRef<HTMLDivElement | null>(null);
  const sourcesPopoverRef = useRef<HTMLDivElement | null>(null);
  const layersPopoverRef = useRef<HTMLDivElement | null>(null);

  const [agentSettingsModalAgent, setAgentSettingsModalAgent] = useState<{
    id: string;
    name: string;
    objectiveBoundLayers: number;
  } | null>(null);

  // Menu de ações por linha do drawer de layers — guarda o id do item (não o
  // índice) para sobreviver à busca/filtro sem apontar pra linha errada.
  const [layersRowMenuIndex, setLayersRowMenuIndex] = useState<string | null>(null);
  const [editingQAId, setEditingQAId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ question: string; answer: string; status: "Ativo" | "Desativado" }>({ question: "", answer: "", status: "Ativo" });
  const [qaSearch, setQaSearch] = useState("");
  const [qaStatusFilter, setQaStatusFilter] = useState<"Todos" | "Ativo" | "Desativado">("Todos");

  const matchesQAFilters = useCallback(
    (item: { question: string; answer: string; status: "Ativo" | "Desativado" }) => {
      if (qaStatusFilter !== "Todos" && item.status !== qaStatusFilter) return false;
      const q = qaSearch.trim().toLowerCase();
      if (!q) return true;
      return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
    },
    [qaSearch, qaStatusFilter],
  );
  const layersRowMenuRef = useRef<HTMLDivElement | null>(null);

  const [drawerLayersQA, setDrawerLayersQA] = useState<
    { id: string; question: string; answer: string; status: "Ativo" | "Desativado"; quality: KLQuality }[]
  >(() => [
    { id: "qa-1", question: "O que é o Artificial Concord segundo o documento?", answer: "É uma iniciativa educacional focada em Inteligência Artificial, iniciada no YouTube e planejada para expansão multiplataforma.", status: "Desativado", quality: "Péssimo" },
    { id: "qa-2", question: "Qual é a missão principal do projeto?", answer: "Democratizar o uso prático, ético e criativo da IA para a comunidade lusófona, especialmente no Brasil.", status: "Ativo", quality: "Muito alta" },
    { id: "qa-3", question: "Qual é o público-alvo descrito?", answer: "Comunidade lusófona, com foco em profissionais e entusiastas no Brasil que buscam aplicar IA de forma ética e criativa.", status: "Ativo", quality: "Alta" },
    { id: "qa-4", question: "O projeto possui validação externa relevante?", answer: "Sim. O documento menciona reconhecimento e parcerias que validam a relevância da iniciativa.", status: "Ativo", quality: "Alta" },
    { id: "qa-5", question: "Qual foi o crescimento orgânico alcançado?", answer: "O documento descreve métricas de crescimento orgânico da audiência e do engajamento nas plataformas.", status: "Ativo", quality: "Muito alta" },
    { id: "qa-6", question: "O projeto possui reconhecimento institucional?", answer: "Sim. Há menção a reconhecimento institucional e possíveis parcerias com instituições.", status: "Ativo", quality: "Alta" },
    { id: "qa-7", question: "Por que a parceria com a Fasul foi recusada?", answer: "O documento indica motivos estratégicos ou de alinhamento para a decisão em relação à parceria com a Fasul.", status: "Ativo", quality: "Razoável" },
    { id: "qa-8", question: "Qual é a estratégia de conteúdo descrita?", answer: "Expansão multiplataforma, conteúdo educativo em IA e foco na comunidade lusófona.", status: "Ativo", quality: "Muito alta" },
    { id: "qa-9", question: "Como o documento descreve o posicionamento profissional do criador?", answer: "Como um educador e divulgador de IA, com foco em uso prático, ético e criativo da tecnologia.", status: "Ativo", quality: "Alta" },
  ]);

  const [storedName, setStoredName] = useState<string | null>(null);

  // Mock de agentes que usam essa base (objectiveBoundLayers = placeholder até integração)
  const connectedAgents = rows.length > 0 ? [
    { id: "1", name: "Atendimento ao Cliente", objectiveBoundLayers: 12 },
    { id: "2", name: "Vendas Interno", objectiveBoundLayers: 8 },
    { id: "3", name: "Suporte Técnico", objectiveBoundLayers: 5 },
    { id: "4", name: "Onboarding", objectiveBoundLayers: 3 },
  ] : [];

  // Contagem de knowledge layers
  const totalKnowledgeLayers = rows.length > 0 ? rows.reduce((acc, r) => {
    const match = r.layersLabel.match(/(\d+)/);
    return acc + (match ? parseInt(match[1], 10) : 0);
  }, 0) : 0;

  // Pastas e arquivos da pasta atual
  const currentFolderPath = useMemo(() => getFolderPath(currentFolderId, folders), [currentFolderId, folders]);
  const currentFolder = currentFolderId ? folders.find((f) => f.id === currentFolderId) : null;
  const subFolders = useMemo(
    () => folders.filter((f) => f.parentId === currentFolderId),
    [folders, currentFolderId]
  );
  const currentFolderRows = useMemo(
    () => rows.filter((r) => (r.folderId || null) === currentFolderId),
    [rows, currentFolderId]
  );

  // Funções para gerenciar pastas
  const handleCreateFolder = useCallback((name: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      parentId: currentFolderId,
      createdAt: new Date().toISOString(),
    };
    setFolders((prev) => [...prev, newFolder]);
    setIsCreateFolderOpen(false);
  }, [currentFolderId]);

  const handleRenameFolder = useCallback((newName: string) => {
    if (!folderToRename) return;
    setFolders((prev) =>
      prev.map((f) => (f.id === folderToRename.id ? { ...f, name: newName } : f))
    );
    setIsRenameFolderOpen(false);
    setFolderToRename(null);
  }, [folderToRename]);

  const handleDeleteFolder = useCallback(() => {
    if (!folderToDelete) return;
    // Recursivamente obter todos os IDs de pastas filhas
    const getAllChildFolderIds = (parentId: string): string[] => {
      const children = folders.filter((f) => f.parentId === parentId);
      return children.reduce<string[]>(
        (acc, child) => [...acc, child.id, ...getAllChildFolderIds(child.id)],
        []
      );
    };
    const folderIdsToDelete = [folderToDelete.id, ...getAllChildFolderIds(folderToDelete.id)];
    
    // Remover pastas
    setFolders((prev) => prev.filter((f) => !folderIdsToDelete.includes(f.id)));
    
    // Mover arquivos das pastas deletadas para a raiz
    setRows((prev) =>
      prev.map((r) =>
        r.folderId && folderIdsToDelete.includes(r.folderId)
          ? { ...r, folderId: null }
          : r
      )
    );
    
    // Se estava na pasta deletada, voltar para a raiz
    if (currentFolderId && folderIdsToDelete.includes(currentFolderId)) {
      setCurrentFolderId(null);
    }
    
    setIsDeleteFolderOpen(false);
    setFolderToDelete(null);
  }, [folderToDelete, folders, currentFolderId]);

  const navigateToFolder = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSelectedIds([]);
  }, []);

  const directoryName = useMemo(() => {
    if (nameFromUrl) return decodeURIComponent(nameFromUrl);
    if (storedName) return storedName;
    return getFallbackNameFromId(typeof params?.id === "string" ? params.id : "");
  }, [params?.id, nameFromUrl, storedName]);

  useEffect(() => {
    return () => {
      if (extractionTimeoutRef.current) clearTimeout(extractionTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const id = typeof params?.id === "string" ? params.id : "";
    if (!id) return;
    if (nameFromUrl) {
      const decoded = decodeURIComponent(nameFromUrl);
      try {
        window.localStorage.setItem("memory-base-name-" + id, decoded);
      } catch (_) {}
      setStoredName(decoded);
    } else if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("memory-base-name-" + id);
        if (saved) setStoredName(saved);
      } catch (_) {}
    }
    if (isNewFromUrl || nameFromUrl) {
      try {
        window.localStorage.setItem("memory-base-empty-" + id, "1");
      } catch (_) {}
    }
  }, [params?.id, nameFromUrl, isNewFromUrl]);

  useEffect(() => {
    const id = typeof params?.id === "string" ? params.id : "";
    if (!id) return;
    try {
      window.localStorage.setItem(getSourcesStorageKey(id), JSON.stringify(rows));
    } catch (_) {}
  }, [params?.id, rows]);

  // Persistir pastas
  useEffect(() => {
    const id = typeof params?.id === "string" ? params.id : "";
    if (!id) return;
    saveFoldersToStorage(id, folders);
  }, [params?.id, folders]);

  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const base: BreadcrumbItem[] = [
      {
        label: "Memory Base",
        href: "/memory-base",
        icon: <MemoryBaseIcon />,
      },
      {
        label: directoryName,
        href: `/memory-base/${params?.id}`,
        icon: <Icon name="account_balance" size={16} weight={300} />,
      },
    ];

    if (currentFolderId) {
      currentFolderPath.forEach((folder) => {
        base.push({
          label: folder.name,
          href: "#",
          icon: <TbFolder className="w-4 h-4" />,
        });
      });
    } else {
      base.push({ label: "Documentos", href: "#", icon: <TbFolder className="w-4 h-4" /> });
    }

    return base;
  }, [directoryName, params?.id, currentFolderId, currentFolderPath]);

  const filteredRows = currentFolderRows.filter((r) =>
    r.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const filteredFolders = subFolders.filter((f) =>
    f.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const allVisibleSelected =
    filteredRows.length > 0 &&
    filteredRows.every((r) => selectedIds.includes(r.id));

  const selectedRows = rows.filter((r) => selectedIds.includes(r.id));

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;

      // Directory menu
      if (
        isDirMenuOpen &&
        dirMenuButtonRef.current &&
        dirMenuRef.current &&
        !dirMenuButtonRef.current.contains(target) &&
        !dirMenuRef.current.contains(target)
      ) {
        setIsDirMenuOpen(false);
      }

      // Row menu
      if (rowMenuOpenId && rowMenuRef.current && !rowMenuRef.current.contains(target)) {
        setRowMenuOpenId(null);
      }

      // Folder menu
      if (folderMenuOpenId && folderMenuRef.current && !folderMenuRef.current.contains(target)) {
        setFolderMenuOpenId(null);
      }

      // Metadata popovers
      if (isAgentsPopoverOpen && agentsPopoverRef.current && !agentsPopoverRef.current.contains(target)) {
        setIsAgentsPopoverOpen(false);
      }
      if (isSourcesPopoverOpen && sourcesPopoverRef.current && !sourcesPopoverRef.current.contains(target)) {
        setIsSourcesPopoverOpen(false);
      }
      if (isLayersPopoverOpen && layersPopoverRef.current && !layersPopoverRef.current.contains(target)) {
        setIsLayersPopoverOpen(false);
      }

      // Menu da linha na aba Knowledge Layers (drawer)
      if (layersRowMenuIndex !== null && layersRowMenuRef.current && !layersRowMenuRef.current.contains(target)) {
        setLayersRowMenuIndex(null);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLayersRowMenuIndex(null);
        setDrawerRow(null);
        setIsDirMenuOpen(false);
        setRowMenuOpenId(null);
        setFolderMenuOpenId(null);
        setIsAgentsPopoverOpen(false);
        setIsSourcesPopoverOpen(false);
        setIsLayersPopoverOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isDirMenuOpen, rowMenuOpenId, folderMenuOpenId, isAgentsPopoverOpen, isSourcesPopoverOpen, isLayersPopoverOpen, layersRowMenuIndex]);

  // Drawer slide-in: start off-screen then animate in
  useEffect(() => {
    if (drawerRow) {
      setDrawerVisible(false);
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => setDrawerVisible(true));
      });
      return () => cancelAnimationFrame(t);
    } else {
      setDrawerVisible(false);
    }
  }, [drawerRow]);

  const toggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openDeleteSelected = (ids: string[]) => {
    if (ids.length === 0) return;
    setPendingDeleteIds(ids);
    setIsDeleteConfirmOpen(true);
  };

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs}>
      {/* Override DashboardLayout padding/background */}
      <div className="-m-8">
        {/* Header area — faixa escura com o glow azul da marca no canto. */}
        <div className="relative overflow-hidden bg-gray-1200 border-b border-gray-700" data-tour="kb-header">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(40% 90% at 88% 0%, color-mix(in srgb, var(--aw-blue-700) 14%, transparent) 0%, transparent 100%)",
            }}
          />
          <div className="relative mx-auto max-w-[1544px] px-12 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white">
                  <Icon name="account_balance" size={20} weight={300} />
                </div>
                <h1 className="text-[28px] font-semibold tracking-tight text-white leading-none">
                  {directoryName}
                </h1>
              </div>
              <div className="relative">
              <button
                type="button"
                className="text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
                aria-label="Mais opções"
                ref={dirMenuButtonRef}
                onClick={() => setIsDirMenuOpen((v) => !v)}
              >
                <DotsVertical32 />
              </button>
              {isDirMenuOpen && (
                <div
                  ref={dirMenuRef}
                  className="absolute right-0 top-[calc(100%+8px)] z-20 w-[220px] rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-2 shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.12),0px_8px_24px_0px_rgba(0,0,0,0.12)]"
                >
                  <button
                    type="button"
                    className="w-full rounded-sm px-3 py-2 text-left text-sm text-(--fg-primary) hover:bg-(--bg-muted)"
                    onClick={() => {
                      setIsDirectoryActive((v) => !v);
                      setIsDirMenuOpen(false);
                    }}
                  >
                    {isDirectoryActive ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-sm px-3 py-2 text-left text-sm text-(--accent-danger) hover:bg-(--aw-red-100)"
                    onClick={() => {
                      setIsDirMenuOpen(false);
                      setIsDeleteDirectoryOpen(true);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px] text-gray-400">
              {/* Status */}
              <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5">
                <span
                  className={`inline-block h-[6px] w-[6px] rounded-full ${
                    isDirectoryActive ? "bg-(--accent-success)" : "bg-(--fg-muted)"
                  }`}
                />
                <span>{isDirectoryActive ? "Ativo" : "Inativo"}</span>
              </div>

              {/* Agentes */}
              <div className="relative" ref={agentsPopoverRef} data-tour="used-by-agents">
                <button
                  type="button"
                  onClick={() => {
                    setIsAgentsPopoverOpen((v) => !v);
                    setIsSourcesPopoverOpen(false);
                    setIsLayersPopoverOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {connectedAgents.length > 0 ? (
                    <span className="flex -space-x-1.5">
                      {connectedAgents.slice(0, 3).map((agent) => (
                        <img
                          key={agent.id}
                          src={getOrbForAgent(agent.id)}
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 rounded-full object-cover ring-2 ring-gray-1200"
                        />
                      ))}
                    </span>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                    </svg>
                  )}
                  <span>Utilizado por {connectedAgents.length} Agente{connectedAgents.length !== 1 ? "s" : ""}</span>
                </button>
                {isAgentsPopoverOpen && connectedAgents.length > 0 && (
                  <div className="absolute left-0 top-full mt-2 z-30 w-[320px] rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-3 shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.12),0px_8px_24px_0px_rgba(0,0,0,0.12)]">
                    <div className="text-[11px] font-semibold text-(--fg-tertiary) uppercase tracking-wide mb-3">Agentes conectados</div>
                    <ul className="space-y-1">
                      {connectedAgents.map((agent, index) => (
                        <li key={agent.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setAgentSettingsModalAgent(agent);
                              setIsAgentsPopoverOpen(false);
                            }}
                            className="w-full flex items-center gap-3 text-[13px] text-(--fg-primary) rounded-lg px-2 py-2 text-left transition-colors hover:bg-(--bg-muted)"
                          >
                            <img
                              src={getOrbForAgent(agent.id)}
                              alt=""
                              width={36}
                              height={36}
                              className="rounded-full w-9 h-9 object-cover shrink-0"
                            />
                            <span className="truncate flex-1 min-w-0 font-medium">{agent.name}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className="flex items-center gap-1 rounded-md bg-(--bg-muted) px-2 py-0.5 text-[11px] font-medium text-(--fg-secondary)"
                                title="Objective-Bound Knowledge Layers"
                              >
                                <img
                                  src="/assets/icons/knowledge-layers_icon.svg"
                                  alt=""
                                  width={12}
                                  height={12}
                                  className="opacity-70"
                                />
                                {agent.objectiveBoundLayers}
                              </span>
                              <span
                                className="p-1 text-(--fg-secondary) rounded-lg pointer-events-none"
                                aria-hidden
                              >
                                <TbSettings className="w-4 h-4" />
                              </span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAgentsPopoverOpen(false);
                        router.push("/agent-studio");
                      }}
                      className="mt-3 w-full text-[12px] font-medium text-(--fg-secondary) hover:text-(--fg-primary) hover:underline text-left transition-colors"
                    >
                      Ver no Agent Studio →
                    </button>
                  </div>
                )}
              </div>

              {/* Fontes */}
              <div className="relative" ref={sourcesPopoverRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSourcesPopoverOpen((v) => !v);
                    setIsAgentsPopoverOpen(false);
                    setIsLayersPopoverOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                  <span>{rows.length} Fonte{rows.length !== 1 ? "s" : ""}</span>
                </button>
                {isSourcesPopoverOpen && rows.length > 0 && (
                  <div className="absolute left-0 top-full mt-2 z-30 w-[220px] rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-3 shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.12),0px_8px_24px_0px_rgba(0,0,0,0.12)]">
                    <div className="text-[11px] font-semibold text-(--fg-tertiary) uppercase tracking-wide mb-2">Resumo de Fontes</div>
                    <div className="space-y-1.5 text-[13px] text-(--fg-primary)">
                      <div className="flex items-center justify-between">
                        <span>Arquivos</span>
                        <span className="font-medium">{rows.filter((r) => r.typeLabel === "Arquivo").length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>URLs</span>
                        <span className="font-medium">{rows.filter((r) => r.typeLabel === "URL").length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Snippets</span>
                        <span className="font-medium">{rows.filter((r) => r.typeLabel === "Snippet").length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Integrações</span>
                        <span className="font-medium">{rows.filter((r) => r.typeLabel === "Integração").length}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-(--border-subtle) text-[12px] text-(--fg-secondary)">
                      Clique em uma fonte abaixo para ver detalhes
                    </div>
                  </div>
                )}
              </div>

              {/* Knowledge Layers */}
              <div className="relative" ref={layersPopoverRef} data-tour="knowledge-layers">
                <button
                  type="button"
                  onClick={() => {
                    setIsLayersPopoverOpen((v) => !v);
                    setIsAgentsPopoverOpen(false);
                    setIsSourcesPopoverOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <img
                    src="/assets/icons/knowledge-layers_icon.svg"
                    alt=""
                    width={14}
                    height={14}
                    className="shrink-0"
                  />
                  <span>{totalKnowledgeLayers} Knowledge Layers</span>
                </button>
                {isLayersPopoverOpen && (
                  <div className="absolute left-0 top-full mt-2 z-30 w-[280px] rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-3 shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.12),0px_8px_24px_0px_rgba(0,0,0,0.12)]">
                    <div className="text-[11px] font-semibold text-(--fg-tertiary) uppercase tracking-wide mb-2">Knowledge Layers</div>
                    <p className="text-[12px] text-(--fg-secondary) mb-3">
                      Camadas de conhecimento extraídas automaticamente por IA a partir das fontes desta base.
                    </p>
                    <div className="space-y-1.5 text-[13px] text-(--fg-primary)">
                      <div className="flex items-center justify-between">
                        <span>Entidades extraídas</span>
                        <span className="font-medium">{Math.floor(totalKnowledgeLayers * 0.4)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Relações mapeadas</span>
                        <span className="font-medium">{Math.floor(totalKnowledgeLayers * 0.25)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Embeddings gerados</span>
                        <span className="font-medium">{Math.floor(totalKnowledgeLayers * 0.35)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLayersPopoverOpen(false);
                        router.push(`/memory-base/${params?.id}/semantic-search`);
                      }}
                      className="mt-3 w-full text-[12px] font-medium text-(--fg-secondary) hover:text-(--fg-primary) hover:underline text-left transition-colors"
                    >
                      Explorar via Semantic Search →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs da base — Documentos (Fontes, existente) + Playbook/Produtos
                (Knowledge Layers e produtos, do flow do Figma) + rotas auxiliares. */}
            <div className="mt-6 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("documentos")}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                  activeTab === "documentos" ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon name="description" size={16} weight={300} />
                Documentos
                <span className="ml-0.5 rounded-full bg-white/15 px-1.5 text-[11px] tabular-nums text-white/80">
                  {rows.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("playbook")}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                  activeTab === "playbook" ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon name="menu_book" size={16} weight={300} />
                Playbook
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("produtos")}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                  activeTab === "produtos" ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon name="inventory_2" size={16} weight={300} />
                Produtos
              </button>
              <button
                type="button"
                onClick={() => router.push(`/memory-base/${params?.id}/semantic-search`)}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Icon name="search" size={16} weight={300} />
                Busca semântica
              </button>
              <button
                type="button"
                onClick={() => router.push(`/memory-base/${params?.id}/settings`)}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Icon name="settings" size={16} weight={300} />
                Configurações
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-(--bg-raised)">
          {activeTab === "documentos" && (
          <div className="w-full px-12 pt-10 pb-14 space-y-8">
            {/* Add sources */}
            <div className="space-y-4" data-tour="add-sources">
              <div className="text-[18px] font-bold text-(--fg-primary)">
                Adicione Fontes
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <ActionCard
                  label="Enviar arquivos"
                  icon={<TintTile icon="upload_file" tint="var(--aw-blue-600)" size={40} />}
                  onClick={() => setIsSendFileOpen(true)}
                />
                <ActionCard
                  label="Adicionar URL"
                  icon={<TintTile icon="language" tint="var(--aw-teal-600)" size={40} />}
                  onClick={() => setIsAddUrlOpen(true)}
                />
                <ActionCard
                  label="Adicionar Snippet"
                  icon={<TintTile icon="data_object" tint="var(--aw-purple-500)" size={40} />}
                  onClick={() => setIsAddSnippetOpen(true)}
                />
                <div data-tour="activate-integrations">
                  <ActionCard
                    label="Ativar integrações"
                    icon={
                      <div className="flex items-center gap-1">
                        {DEFAULT_INTEGRATIONS.slice(0, 4).map((int) => (
                          <div key={int.id} className="h-8 w-8 rounded-sm border border-(--border-subtle) bg-(--bg-raised) flex items-center justify-center overflow-hidden">
                            {int.icon ? (
                              <img src={int.icon} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-[12px] font-bold">{int.shortLabel}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    }
                    onClick={() => setIsActivateIntegrationsOpen(true)}
                  />
                </div>
                <ActionCard
                  label="Adicionar Catálogo"
                  icon={<TintTile icon="database" tint="var(--aw-amber-500)" size={40} />}
                  onClick={() => setIsAddCatalogOpen(true)}
                />
              </div>
            </div>

            {/* Lista de arquivos e pastas – full width */}
            <div className="w-full overflow-hidden bg-(--bg-raised)">
              {/* Navegação de pastas e ações */}
              <div className="px-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Botão voltar */}
                  {currentFolderId && (
                    <button
                      type="button"
                      onClick={() => navigateToFolder(currentFolder?.parentId ?? null)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-(--fg-secondary) hover:text-(--fg-primary) hover:bg-(--bg-muted) rounded-lg transition-colors"
                    >
                      <TbArrowLeft className="w-4 h-4" />
                      Voltar
                    </button>
                  )}
                  
                  {/* Breadcrumbs interno das pastas */}
                  <nav className="flex items-center gap-1 text-[13px]">
                    <button
                      type="button"
                      onClick={() => navigateToFolder(null)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                        !currentFolderId
                          ? "text-(--fg-primary) font-medium"
                          : "text-(--fg-secondary) hover:text-(--fg-primary) hover:bg-(--bg-muted)"
                      }`}
                    >
                      <TbFolder className="w-4 h-4" />
                      Raiz
                    </button>
                    {currentFolderPath.map((folder, index) => (
                      <div key={folder.id} className="flex items-center gap-1">
                        <TbChevronRight className="w-4 h-4 text-(--fg-tertiary)" />
                        <button
                          type="button"
                          onClick={() => navigateToFolder(folder.id)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                            index === currentFolderPath.length - 1
                              ? "text-(--fg-primary) font-medium"
                              : "text-(--fg-secondary) hover:text-(--fg-primary) hover:bg-(--bg-muted)"
                          }`}
                        >
                          <TbFolder className="w-4 h-4" />
                          {folder.name}
                        </button>
                      </div>
                    ))}
                  </nav>
                </div>
                
                {/* Botão criar pasta */}
                <button
                  type="button"
                  onClick={() => setIsCreateFolderOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-(--fg-primary) border border-(--border-default) rounded-lg hover:bg-(--bg-hover) transition-colors"
                >
                  <TbFolderPlus className="w-4 h-4" />
                  Nova pasta
                </button>
              </div>

              {/* selection actions */}
              {selectedIds.length > 0 && (
                <div className="px-8 pb-4 flex items-center justify-between">
                  <div className="text-sm text-(--fg-secondary)">
                    {selectedIds.length} selecionado{selectedIds.length > 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <AwButton
                      size="sm"
                      variant="secondary"
                      className="w-auto"
                      disabled={selectedIds.length !== 1}
                      onClick={() => {
                        const only = selectedRows[0];
                        if (only) setDrawerRow(only);
                      }}
                    >
                      Visualizar
                    </AwButton>
                    <AwButton
                      size="sm"
                      variant="danger"
                      className="w-auto"
                      onClick={() => openDeleteSelected(selectedIds)}
                    >
                      Excluir
                    </AwButton>
                  </div>
                </div>
              )}

              {/* header row */}
              <div className="border-b border-(--border-subtle) px-8 pb-3 flex items-center gap-x-12">
                <div className="flex flex-1 min-w-0 items-center gap-3 py-2">
                  <div className="shrink-0">
                    <Checkbox
                      checked={allVisibleSelected}
                      ariaLabel="Selecionar todos"
                      onChange={(checked) => {
                        if (checked) {
                          setSelectedIds((prev) => {
                            const merged = new Set(prev);
                            filteredRows.forEach((r) => merged.add(r.id));
                            return Array.from(merged);
                          });
                        } else {
                          setSelectedIds((prev) => prev.filter((id) => !filteredRows.some((r) => r.id === id)));
                        }
                      }}
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="text-[12px] text-(--fg-tertiary)">Nome do Arquivo</div>
                  <span className="text-(--fg-tertiary)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M8 6h10M8 10h6M8 14h10M8 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M6 8l-2 2-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.0"/>
                    </svg>
                  </span>
                  </div>
                </div>

                <div className="min-w-[88px] py-2 text-[12px] text-(--fg-tertiary)">Status</div>
                <div className="min-w-[140px] py-2 text-[12px] text-(--fg-tertiary)">Knowledge Layers</div>
                <div className="min-w-[140px] flex items-center gap-2 py-2 text-[12px] text-(--fg-tertiary)">
                  Data de adição
                  <span className="text-(--fg-tertiary)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                <div className="w-8 shrink-0" aria-hidden />
              </div>

              {/* body rows */}
              <div>
                {filteredRows.map((r) => (
                  <div
                    key={r.id}
                    className={`border-b border-(--border-subtle) px-8 py-3 flex items-center gap-x-12 transition-colors cursor-pointer ${
                      selectedIds.includes(r.id) ? "bg-(--bg-selected)" : "hover:bg-(--bg-hover)"
                    }`}
                    onClick={() => setDrawerRow(r)}
                  >
                    <div className="flex flex-1 min-w-0 items-center gap-3 py-1">
                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.includes(r.id)}
                          ariaLabel={`Selecionar ${r.name}`}
                          onChange={() => toggleRow(r.id)}
                        />
                      </div>
                      <FileTypeIcon name={r.name} typeLabel={r.typeLabel} />
                      <div className="flex min-w-0 flex-1 flex-col leading-normal">
                        <div className="text-[12px] font-medium text-(--fg-primary) truncate">
                          {r.name}
                        </div>
                        <div className="text-[10px] text-(--fg-secondary)">{r.typeLabel}</div>
                      </div>
                    </div>

                    <div className="min-w-[88px] py-1 flex items-center">
                      {r.status === "Analisando" ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-(--aw-amber-700)">
                          <span className="w-2 h-2 rounded-full bg-(--aw-amber-500) shrink-0" />
                          Analisando
                        </span>
                      ) : r.status === "Ativo" ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-aw-emerald-900">
                          <span className="w-2 h-2 rounded-full bg-(--accent-success) shrink-0" />
                          Ativo
                        </span>
                      ) : r.status === "Erro" ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-(--accent-danger)">
                          <span className="w-2 h-2 rounded-full bg-(--aw-red-500) shrink-0" />
                          Erro
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-(--fg-secondary)">
                          <span className="w-2 h-2 rounded-full bg-(--fg-muted) shrink-0" />
                          Inativo
                        </span>
                      )}
                    </div>

                    <div className="min-w-[140px] py-1 flex items-center gap-2 text-[12px] text-(--fg-secondary)">
                      {r.status === "Analisando" ? (
                        <>
                          <span className="w-4 h-4 border-2 border-(--fg-tertiary) border-t-transparent rounded-full animate-spin shrink-0" />
                          Extraindo Knowledge Layers…
                        </>
                      ) : (
                        <>
                          <Layers16 />
                          {r.layersLabel}
                        </>
                      )}
                    </div>

                    <div className="min-w-[140px] py-1 text-[12px] text-(--fg-secondary)">
                      {r.createdAt}
                    </div>

                    <div className="w-8 shrink-0 flex justify-end">
                      <button
                        type="button"
                        className="text-(--fg-secondary) hover:text-(--fg-primary)"
                        aria-label="Ações"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setRowMenuOpenId((prev) => (prev === r.id ? null : r.id));
                        }}
                      >
                        <Ellipsis16 />
                      </button>
                      {rowMenuOpenId === r.id && (
                        <div
                          ref={rowMenuRef}
                          className="absolute z-30 mt-2 translate-x-[-170px] w-[190px] rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-2 shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.12),0px_8px_24px_0px_rgba(0,0,0,0.12)]"
                        >
                          <button
                            type="button"
                            className="w-full rounded-sm px-3 py-2 text-left text-sm text-(--fg-primary) hover:bg-(--bg-muted)"
                            onClick={() => {
                              setRowMenuOpenId(null);
                              setDrawerRow(r);
                            }}
                          >
                            Visualizar
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-sm px-3 py-2 text-left text-sm text-(--accent-danger) hover:bg-(--aw-red-100)"
                            onClick={() => {
                              setRowMenuOpenId(null);
                              openDeleteSelected([r.id]);
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          )}

          {activeTab === "playbook" && (
            <div className="w-full px-12 pt-10 pb-14">
              <KnowledgeLayersTab baseId={typeof params?.id === "string" ? params.id : ""} />
            </div>
          )}

          {activeTab === "produtos" && (
            <div className="w-full px-12 pt-10 pb-14">
              <ProductsTab />
            </div>
          )}
        </div>
      </div>

      {/* Document drawer (lateral direita, conforme Figma) */}
      {drawerRow && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
            aria-hidden
            onClick={() => setDrawerRow(null)}
          />
          <div
            className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-[min(640px,66.666vw)] bg-(--bg-raised) shadow-2xl flex flex-col transition-transform duration-200 ease-out ${
                drawerVisible ? "translate-x-0" : "translate-x-full"
              }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 border-b border-(--border-subtle) shrink-0">
              <div className="flex items-start gap-3 min-w-0">
                <FileTypeIcon name={drawerRow.name} typeLabel={drawerRow.typeLabel} />
                <div className="min-w-0">
                  <h2 id="drawer-title" className="text-[18px] font-semibold text-(--fg-primary) truncate">
                    {drawerRow.name}
                  </h2>
                  <p className="text-[13px] text-(--fg-secondary) mt-0.5">{drawerRow.typeLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerRow(null)}
                className="shrink-0 p-2 text-(--fg-secondary) hover:text-(--fg-primary) hover:bg-(--bg-muted) rounded-lg transition-colors"
                aria-label="Fechar"
              >
                <TbX className="w-5 h-5" />
              </button>
            </div>

            {/* Two columns: metadata (left) + content (right) */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* Left: metadata */}
              <div className="w-[220px] shrink-0 border-r border-(--border-subtle) p-6 flex flex-col gap-5 overflow-y-auto">
                <div>
                  <p className="text-[11px] font-semibold text-(--fg-tertiary) uppercase tracking-wide mb-1.5">ID do arquivo</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-(--fg-primary) truncate" title={idToFileUuid(drawerRow.id)}>
                      {idToFileUuid(drawerRow.id)}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(idToFileUuid(drawerRow.id))}
                      className="p-1.5 text-(--fg-secondary) hover:text-(--fg-primary) hover:bg-(--bg-muted) rounded transition-colors"
                      aria-label="Copiar ID"
                    >
                      <TbCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-(--fg-tertiary) uppercase tracking-wide mb-1.5">Status</p>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md ${
                      drawerRow.status === "Ativo"
                        ? "bg-green-50 text-green-700"
                        : drawerRow.status === "Analisando"
                          ? "bg-amber-50 text-amber-700"
                          : drawerRow.status === "Erro"
                            ? "bg-red-50 text-red-700"
                            : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {drawerRow.status === "Ativo" && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                    {drawerRow.status === "Analisando" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                    {drawerRow.status === "Erro" && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                    {drawerRow.status === "Inativo" && <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                    {drawerRow.status}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-(--fg-tertiary) uppercase tracking-wide mb-1.5">Knowledge Layers</p>
                  <p className="text-[13px] text-(--fg-primary)">{drawerRow.layersLabel}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-(--fg-tertiary) uppercase tracking-wide mb-1.5">Adicionado em</p>
                  <p className="text-[13px] text-(--fg-primary)">{drawerRow.createdAt}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-(--fg-tertiary) uppercase tracking-wide mb-1.5">Atualizado em</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-(--fg-primary)">{drawerRow.createdAt}</span>
                    <span className="text-(--fg-tertiary)" title="Última atualização">
                      <TbRefresh className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: tabs + content */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="border-b border-(--border-subtle) px-6 flex gap-6 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDrawerTab("conteudo")}
                    className={`py-3 text-[13px] font-medium border-b-2 transition-colors ${
                      drawerTab === "conteudo"
                        ? "border-(--fg-primary) text-(--fg-primary)"
                        : "border-transparent text-(--fg-secondary) hover:text-(--fg-primary)"
                    }`}
                  >
                    Conteúdo do Arquivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTab("layers")}
                    className={`py-3 text-[13px] font-medium border-b-2 transition-colors ${
                      drawerTab === "layers"
                        ? "border-(--fg-primary) text-(--fg-primary)"
                        : "border-transparent text-(--fg-secondary) hover:text-(--fg-primary)"
                    }`}
                  >
                    Knowledge Layers
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTab("visualizar")}
                    className={`py-3 text-[13px] font-medium border-b-2 transition-colors ${
                      drawerTab === "visualizar"
                        ? "border-(--fg-primary) text-(--fg-primary)"
                        : "border-transparent text-(--fg-secondary) hover:text-(--fg-primary)"
                    }`}
                  >
                    Visualizar arquivo
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {drawerTab === "conteudo" && (
                    <div className="text-[14px] text-(--fg-primary) leading-relaxed space-y-4">
                      <p>
                        Este é um exemplo de conteúdo extraído e processado pela plataforma. O texto abaixo simula o que seria exibido após a ingestão do documento.
                      </p>
                      <p>
                        <strong>1. Introdução</strong><br />
                        Este material foi preparado para fins de treinamento e referência. As informações aqui contidas representam as políticas e procedimentos vigentes na organização.
                      </p>
                      <p>
                        <strong>2. Objetivos e escopo</strong><br />
                        O objetivo principal é padronizar processos e garantir que todos os colaboradores tenham acesso às mesmas diretrizes. O escopo abrange procedimentos operacionais, boas práticas e definições de papéis e responsabilidades.
                      </p>
                      <p>
                        <strong>3. Conteúdo principal</strong><br />
                        A plataforma extrai automaticamente o texto do documento, identifica seções e entidades relevantes e enriquece o conteúdo com metadados para buscas e recomendações. Este bloco ilustra como um trecho processado seria apresentado ao usuário.
                      </p>
                      <p className="text-[13px] text-(--fg-secondary)">
                        [Exemplo de demonstração — conteúdo real virá da extração automática.]
                      </p>
                    </div>
                  )}
                  {drawerTab === "layers" && (editingQAId ? (
                    <div className="flex flex-col h-full min-h-0 gap-5 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => setEditingQAId(null)}
                        className="inline-flex w-fit items-center gap-1.5 text-[13px] text-(--fg-secondary) hover:text-(--fg-primary)"
                      >
                        <TbArrowLeft className="w-4 h-4" /> Voltar para a lista
                      </button>
                      <div className="text-[15px] font-semibold text-(--fg-primary)">Editar Knowledge Layer</div>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-(--fg-primary)">Pergunta</span>
                        <AwInput
                          value={editDraft.question}
                          onChange={(e) => setEditDraft((d) => ({ ...d, question: e.target.value }))}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-(--fg-primary)">Resposta</span>
                        <textarea
                          value={editDraft.answer}
                          onChange={(e) => setEditDraft((d) => ({ ...d, answer: e.target.value }))}
                          rows={6}
                          className="w-full resize-y rounded-xl border border-(--border-default) bg-(--bg-raised) px-3 py-2 text-[13px] leading-relaxed text-(--fg-primary) outline-hidden placeholder:text-(--fg-tertiary) focus:border-(--fg-primary)"
                        />
                        <span className="text-[11px] text-(--fg-tertiary)">Digite {"{}"} para ver as variáveis disponíveis.</span>
                      </label>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[13px] font-medium text-(--fg-primary)">Status</div>
                          <div className="text-[12px] text-(--fg-tertiary)">
                            {editDraft.status === "Ativo" ? "Ativo — em uso pelos agentes" : "Desativado"}
                          </div>
                        </div>
                        <AwToggle
                          checked={editDraft.status === "Ativo"}
                          onChange={(v) => setEditDraft((d) => ({ ...d, status: v ? "Ativo" : "Desativado" }))}
                          label="Status do Knowledge Layer"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-(--fg-primary)">Anexos</span>
                        <AwDropzone variant="compact" accept=".pdf,.png,.jpg" maxSizeMb={10} />
                      </div>
                      <div className="mt-auto flex items-center justify-end gap-2 pt-2">
                        <AwButton variant="ghost" onClick={() => setEditingQAId(null)}>
                          Cancelar
                        </AwButton>
                        <AwButton
                          variant="primary"
                          iconLeft="check"
                          onClick={() => {
                            setDrawerLayersQA((prev) =>
                              prev.map((q) =>
                                q.id === editingQAId
                                  ? { ...q, question: editDraft.question, answer: editDraft.answer, status: editDraft.status }
                                  : q
                              )
                            );
                            setEditingQAId(null);
                          }}
                        >
                          Salvar alterações
                        </AwButton>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full min-h-0">
                      {/* Controles – conforme Figma node 40000350-17422 */}
                      <div className="flex items-center gap-3 mb-4 shrink-0">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Pesquisar pergunta ou resposta"
                            value={qaSearch}
                            onChange={(e) => setQaSearch(e.target.value)}
                            className="w-full rounded-lg border border-(--border-default) bg-(--bg-raised) py-2 pl-3 pr-9 text-[13px] text-(--fg-primary) placeholder:text-(--fg-tertiary) focus:border-(--fg-primary) focus:outline-hidden focus:ring-1 focus:ring-(--fg-primary)"
                            aria-label="Pesquisar pergunta ou resposta"
                          />
                          <TbSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--fg-tertiary) pointer-events-none" />
                        </div>
                        {/* Filtro de status — cicla Todos → Ativo → Desativado. */}
                        <button
                          type="button"
                          onClick={() =>
                            setQaStatusFilter((prev) =>
                              prev === "Todos" ? "Ativo" : prev === "Ativo" ? "Desativado" : "Todos"
                            )
                          }
                          aria-pressed={qaStatusFilter !== "Todos"}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] transition-colors ${
                            qaStatusFilter !== "Todos"
                              ? "border-(--fg-primary) bg-(--bg-inverse) text-(--fg-on-inverse)"
                              : "border-(--border-default) bg-(--bg-raised) text-(--fg-primary) hover:bg-(--bg-hover)"
                          }`}
                        >
                          <TbFilter className="w-4 h-4" />
                          <span>{qaStatusFilter === "Todos" ? "Status" : qaStatusFilter}</span>
                          <TbChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Cabeçalho da tabela */}
                      <div className="flex items-center gap-4 py-2 border-b border-(--border-subtle) text-[12px] text-(--fg-tertiary) shrink-0">
                        <div className="flex flex-1 min-w-0 items-center gap-1">
                          <span>Título</span>
                          <span className="text-(--fg-tertiary)" aria-hidden>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </div>
                        <div className="w-[100px] shrink-0">Qualidade</div>
                        <div className="w-[88px] shrink-0 text-right">Status</div>
                        <div className="w-8 shrink-0" aria-hidden />
                      </div>

                      {/* Lista de perguntas e respostas geradas – conforme Figma.
                          Filtrada pela busca e pelo status; ações resolvem por id. */}
                      <ul className="flex-1 overflow-y-auto min-h-0 divide-y divide-(--border-subtle) -mx-6 px-6">
                        {drawerLayersQA.filter(matchesQAFilters).map((item) => (
                          <li key={item.id} className="py-3 flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-(--fg-primary) leading-snug">{item.question}</p>
                              <p className="text-[13px] text-(--fg-secondary) leading-snug mt-0.5">{item.answer}</p>
                            </div>
                            <span
                              className="w-[100px] shrink-0 inline-flex items-center gap-1 text-[12px] font-medium"
                              style={{ color: QUALITY_COLOR[item.quality] }}
                            >
                              <TbTrendingUp size={14} strokeWidth={2} /> {item.quality}
                            </span>
                            <span
                              className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                item.status === "Ativo"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {item.status}
                            </span>
                            <div
                              className="relative shrink-0"
                              ref={layersRowMenuIndex === item.id ? layersRowMenuRef : null}
                            >
                              <button
                                type="button"
                                onClick={() => setLayersRowMenuIndex((prev) => (prev === item.id ? null : item.id))}
                                className="p-1 text-(--fg-secondary) hover:text-(--fg-primary) hover:bg-(--bg-muted) rounded transition-colors"
                                aria-label="Mais opções"
                                aria-expanded={layersRowMenuIndex === item.id}
                              >
                                <Ellipsis16 />
                              </button>
                              {layersRowMenuIndex === item.id && (
                                <div className="absolute right-0 top-full mt-1 z-20 w-[180px] rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-2 shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.12),0px_8px_24px_0px_rgba(0,0,0,0.12)]">
                                  <button
                                    type="button"
                                    className="w-full rounded-sm px-3 py-2 text-left text-[13px] text-(--fg-primary) hover:bg-(--bg-muted)"
                                    onClick={() => {
                                      setDrawerLayersQA((prev) =>
                                        prev.map((q) =>
                                          q.id === item.id
                                            ? { ...q, status: q.status === "Ativo" ? "Desativado" : "Ativo" }
                                            : q
                                        )
                                      );
                                      setLayersRowMenuIndex(null);
                                    }}
                                  >
                                    {item.status === "Ativo" ? "Desativar" : "Ativar"}
                                  </button>
                                  <button
                                    type="button"
                                    className="w-full rounded-sm px-3 py-2 text-left text-[13px] text-(--fg-primary) hover:bg-(--bg-muted)"
                                    onClick={() => {
                                      setEditDraft({ question: item.question, answer: item.answer, status: item.status });
                                      setEditingQAId(item.id);
                                      setLayersRowMenuIndex(null);
                                    }}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    className="w-full rounded-sm px-3 py-2 text-left text-[13px] text-(--fg-primary) hover:bg-(--bg-muted)"
                                    onClick={() => {
                                      setLayersRowMenuIndex(null);
                                      pushToast({
                                        variant: "ai",
                                        title: "Reanálise agendada",
                                        description: "A IA vai reprocessar este Knowledge Layer com as fontes atuais.",
                                      });
                                    }}
                                  >
                                    Reanalisar
                                  </button>
                                  <button
                                    type="button"
                                    className="w-full rounded-sm px-3 py-2 text-left text-[13px] text-(--accent-danger) hover:bg-(--aw-red-100)"
                                    onClick={() => {
                                      setDrawerLayersQA((prev) => prev.filter((q) => q.id !== item.id));
                                      setLayersRowMenuIndex(null);
                                    }}
                                  >
                                    Excluir
                                  </button>
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                        {drawerLayersQA.filter(matchesQAFilters).length === 0 && (
                          <li className="py-10 text-center text-[13px] text-(--fg-tertiary)">
                            Nenhum Knowledge Layer corresponde à busca ou ao filtro.
                          </li>
                        )}
                      </ul>

                      <p className="text-[12px] text-(--fg-tertiary) mt-3 shrink-0">
                        Exemplo de demonstração — perguntas e respostas reais virão do pipeline de Knowledge Layers.
                      </p>
                    </div>
                  ))}
                  {drawerTab === "visualizar" && (() => {
                    const isUrl = drawerRow.typeLabel === "URL";
                    if (isUrl) {
                      return (
                        <div className="flex flex-col h-full min-h-[400px]">
                          <p className="text-[13px] text-(--fg-secondary) mb-3">
                            Visualização da página em nova aba:{" "}
                            <a
                              href={drawerRow.name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-(--fg-primary) underline hover:no-underline"
                            >
                              {drawerRow.name}
                            </a>
                          </p>
                          <div className="flex-1 min-h-0 rounded-lg border border-(--border-default) overflow-hidden bg-(--bg-raised)">
                            <iframe
                              title={`Visualização: ${drawerRow.name}`}
                              src={drawerRow.name}
                              className="w-full h-full min-h-[400px]"
                              sandbox="allow-same-origin allow-scripts allow-popups"
                            />
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="text-[14px] text-(--fg-primary) leading-relaxed">
                        <p>
                          Pré-visualização indisponível para <strong>{drawerRow.typeLabel}</strong> nesta demonstração.
                        </p>
                        <p className="mt-2 text-(--fg-secondary)">
                          O conteúdo dos arquivos não é armazenado neste protótipo de UI.
                        </p>
                      </div>
                    );
                  })()}
                </div>
                <div className="p-6 border-t border-(--border-subtle) flex justify-end shrink-0">
                  <AwButton
                    size="sm"
                    variant="primary"
                    className="w-auto gap-2"
                    onClick={() => {}}
                  >
                    <TbDownload className="w-4 h-4" />
                    Download arquivos
                  </AwButton>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View modal */}
      <BaseModal
        isOpen={!!viewRow}
        onClose={() => setViewRow(null)}
        size="sm"
      >
        <div className="p-6">
          <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
            Visualizar
          </h2>
          <div className="space-y-2 text-sm text-(--fg-primary)">
            <div>
              <span className="text-(--fg-tertiary)">Nome:</span>{" "}
              <span className="font-medium">{viewRow?.name}</span>
            </div>
            <div>
              <span className="text-(--fg-tertiary)">Tipo:</span> {viewRow?.typeLabel}
            </div>
            <div>
              <span className="text-(--fg-tertiary)">Status:</span> {viewRow?.status}
            </div>
            <div>
              <span className="text-(--fg-tertiary)">Knowledge Layers:</span>{" "}
              {viewRow?.layersLabel}
            </div>
            <div>
              <span className="text-(--fg-tertiary)">Data de adição:</span>{" "}
              {viewRow?.createdAt}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <AwButton size="sm" variant="secondary" className="w-auto" onClick={() => setViewRow(null)}>
              Fechar
            </AwButton>
          </div>
        </div>
      </BaseModal>

      {/* Agent settings modal (provisório) */}
      <BaseModal
        isOpen={!!agentSettingsModalAgent}
        onClose={() => setAgentSettingsModalAgent(null)}
        size="md"
      >
        <div className="p-6">
          <h2 className="text-xl font-heading font-bold text-(--fg-primary) mb-4">
            Configurações do agente
          </h2>
          {agentSettingsModalAgent && (
            <>
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-(--border-subtle)">
                <img
                  src={getOrbForAgent(agentSettingsModalAgent.id)}
                  alt=""
                  width={56}
                  height={56}
                  className="rounded-full w-14 h-14 object-cover shrink-0"
                />
                <div>
                  <p className="font-semibold text-(--fg-primary) text-lg">{agentSettingsModalAgent.name}</p>
                  <p className="text-sm text-(--fg-secondary)">Agente conectado a esta base</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold text-(--fg-tertiary) uppercase tracking-wide mb-1">
                    Objective-Bound Knowledge Layers
                  </p>
                  <p className="text-(--fg-primary) flex items-center gap-2">
                    <img
                      src="/assets/icons/knowledge-layers_icon.svg"
                      alt=""
                      width={16}
                      height={16}
                      className="opacity-80"
                    />
                    <span className="font-medium">{agentSettingsModalAgent.objectiveBoundLayers}</span>
                    <span className="text-(--fg-secondary) text-sm">layers gerados por este agente</span>
                  </p>
                </div>
                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-(--fg-tertiary) uppercase tracking-wide mb-1">
                    Outras configurações
                  </p>
                  <p className="text-sm text-(--fg-secondary)">Em breve. Você poderá ajustar permissões e opções específicas do agente aqui.</p>
                </div>
              </div>
            </>
          )}
          <div className="mt-6 flex justify-end">
            <AwButton size="sm" variant="secondary" className="w-auto" onClick={() => setAgentSettingsModalAgent(null)}>
              Fechar
            </AwButton>
          </div>
        </div>
      </BaseModal>

      {/* Delete files confirm */}
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setPendingDeleteIds([]);
        }}
        onConfirm={() => {
          setRows((prev) => prev.filter((r) => !pendingDeleteIds.includes(r.id)));
          setSelectedIds((prev) => prev.filter((id) => !pendingDeleteIds.includes(id)));
          setIsDeleteConfirmOpen(false);
          setPendingDeleteIds([]);
        }}
        title="Excluir arquivo(s)?"
        message={
          pendingDeleteIds.length === 1
            ? "Tem certeza que deseja excluir este arquivo?"
            : "Tem certeza que deseja excluir os arquivos selecionados?"
        }
        confirmText="Excluir"
        confirmVariant="danger"
      />

      {/* Delete directory confirm */}
      <ConfirmationModal
        isOpen={isDeleteDirectoryOpen}
        onClose={() => setIsDeleteDirectoryOpen(false)}
        onConfirm={() => {
          setIsDeleteDirectoryOpen(false);
          router.push("/memory-base");
        }}
        title="Excluir diretório?"
        message={`Tem certeza que deseja excluir a base de conhecimento "${directoryName}"?`}
        confirmText="Excluir"
        confirmVariant="danger"
      />

      <AddUrlFlow
        isOpen={isAddUrlOpen}
        onClose={() => setIsAddUrlOpen(false)}
        onComplete={(url, title, pages) => {
          setIsAddUrlOpen(false);
          // Navegar para a página de resultado da URL
          const urlSlug = encodeURIComponent(url.replace(/^https?:\/\//, "").replace(/\/$/, ""));
          router.push(`/memory-base/${params.id}/url/${urlSlug}?title=${encodeURIComponent(title)}`);
        }}
      />

      <SendFileModal
        isOpen={isSendFileOpen}
        onClose={() => setIsSendFileOpen(false)}
        onComplete={(files) => {
          if (files.length === 0) return;
          const baseId = Date.now();
          const newRows: SourceRow[] = files.map((f, i) => ({
            id: `new-${baseId}-${i}`,
            name: f.name,
            typeLabel: "Arquivo",
            status: "Analisando",
            layersLabel: "Extraindo Knowledge Layers…",
            createdAt: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
            folderId: currentFolderId,
          }));
          setRows((prev) => [...newRows, ...prev]);
          // Simula conclusão da extração após alguns segundos (substituir por API real)
          const ids = newRows.map((r) => r.id);
          if (extractionTimeoutRef.current) clearTimeout(extractionTimeoutRef.current);
          extractionTimeoutRef.current = setTimeout(() => {
            setRows((prev) =>
              prev.map((row) =>
                ids.includes(row.id)
                  ? { ...row, status: "Ativo" as const, layersLabel: `${Math.floor(8 + Math.random() * 60)} itens` }
                  : row
              )
            );
            extractionTimeoutRef.current = null;
          }, 5000);
        }}
      />

      <AddSnippetModal
        isOpen={isAddSnippetOpen}
        onClose={() => setIsAddSnippetOpen(false)}
        onComplete={(name, _content) => {
          const id = `snippet-${Date.now()}`;
          const newRow: SourceRow = {
            id,
            name: name || "Snippet sem título",
            typeLabel: "Snippet",
            status: "Ativo",
            layersLabel: "—",
            createdAt: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
          };
          setRows((prev) => [newRow, ...prev]);
        }}
      />

      <ActivateIntegrationsModal
        isOpen={isActivateIntegrationsOpen}
        onClose={() => setIsActivateIntegrationsOpen(false)}
        onComplete={(integrations: IntegrationItem[]) => {
          const baseId = Date.now();
          const newRows: SourceRow[] = integrations.map((int, i) => ({
            id: `int-${baseId}-${i}`,
            name: int.name,
            typeLabel: "Integração",
            status: "Ativo",
            layersLabel: "—",
            createdAt: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
          }));
          setRows((prev) => [...newRows, ...prev]);
        }}
      />

      <AddCatalogModal
        isOpen={isAddCatalogOpen}
        onClose={() => setIsAddCatalogOpen(false)}
        onComplete={(catalog) => {
          const newRow: SourceRow = {
            id: `cat-${Date.now()}`,
            name: catalog.fileName || `${catalog.name}.csv`,
            typeLabel: "Catálogo",
            status: "Ativo",
            layersLabel: catalog.via === "csv" ? "Catálogo CSV" : "Catálogo · integração",
            createdAt: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
            folderId: currentFolderId,
          };
          setRows((prev) => [newRow, ...prev]);
        }}
      />
    </AwDashboardLayout>
  );
}

