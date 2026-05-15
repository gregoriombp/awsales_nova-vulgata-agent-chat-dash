"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import KnowledgeOSIcon from "@/components/KnowledgeOSIcon";
import Button from "@/components/Button";
import BaseModal from "@/components/modals/BaseModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import AddUrlFlow from "@/components/modals/AddUrlFlow";
import SendFileModal from "@/components/modals/SendFileModal";
import AddSnippetModal from "@/components/modals/AddSnippetModal";
import CreateFolderModal from "@/components/modals/CreateFolderModal";
import RenameFolderModal from "@/components/modals/RenameFolderModal";
import ActivateIntegrationsModal, { type IntegrationItem, DEFAULT_INTEGRATIONS } from "@/components/modals/ActivateIntegrationsModal";
import OnboardingTour, { type OnboardingStep } from "@/components/OnboardingTour";
import {
  TbFileTypePdf,
  TbFileTypeDoc,
  TbFileTypeDocx,
  TbFileTypeXls,
  TbFileTypeTxt,
  TbFileCode,
  TbFile,
  TbLink,
  TbCode,
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
} from "react-icons/tb";
import { getOrbForAgent } from "@/lib/agentOrbs";

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
        checked ? "bg-gray-1200 border-gray-1200" : "bg-white border-[#e5e5e5]"
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

function FolderIconBase({ width = 32, height = 32, className }: { width?: number; height?: number; className?: string }) {
  return (
    <img
      src="/assets/folder_data_24dp_1F1F1F_FILL0_wght200_GRAD0_opsz24.svg"
      alt=""
      width={width}
      height={height}
      className={className}
    />
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
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5V19M5 12H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
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

function FileIcon16() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-8-6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v6h8"
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

const FILE_TYPE_STYLES = {
  pdf: { bg: "bg-red-50", icon: "text-red-600" },
  word: { bg: "bg-blue-50", icon: "text-blue-600" },
  excel: { bg: "bg-emerald-50", icon: "text-emerald-600" },
  text: { bg: "bg-slate-100", icon: "text-slate-600" },
  code: { bg: "bg-violet-50", icon: "text-violet-600" },
  url: { bg: "bg-sky-50", icon: "text-sky-600" },
  snippet: { bg: "bg-amber-50", icon: "text-amber-600" },
  integration: { bg: "bg-teal-50", icon: "text-teal-600" },
  default: { bg: "bg-gray-100", icon: "text-gray-600" },
} as const;

function FileTypeIcon({ name, typeLabel }: { name: string; typeLabel: string }) {
  const size = 16;

  if (typeLabel === "URL") {
    const s = FILE_TYPE_STYLES.url;
    return (
      <div className={`h-8 w-8 rounded-[8px] border border-[#f2f2f2] flex items-center justify-center ${s.bg} ${s.icon}`}>
        <TbLink size={size} strokeWidth={1.5} />
      </div>
    );
  }
  if (typeLabel === "Snippet") {
    const s = FILE_TYPE_STYLES.snippet;
    return (
      <div className={`h-8 w-8 rounded-[8px] border border-[#f2f2f2] flex items-center justify-center ${s.bg} ${s.icon}`}>
        <TbCode size={size} strokeWidth={1.5} />
      </div>
    );
  }
  if (typeLabel === "Integração") {
    const s = FILE_TYPE_STYLES.integration;
    const integrationIcon = getIntegrationIconUrl(name);
    return (
      <div className="relative h-8 w-8 rounded-[8px] overflow-hidden flex-shrink-0">
        {/* Só o feixe em gradiente gira no perímetro; o quadrado fica fixo */}
        <div className="absolute inset-0 rounded-[8px] integration-icon-gradient-border" aria-hidden />
        <div className={`absolute inset-[2px] rounded-[6px] ${s.bg} z-[1]`} />
        <div className="absolute inset-0 flex items-center justify-center z-[2]">
          {integrationIcon ? (
            <img src={integrationIcon} alt="" className="w-5 h-5 object-contain" />
          ) : (
            <TbPlug size={size} strokeWidth={1.5} className={s.icon} />
          )}
        </div>
      </div>
    );
  }

  const ext = getFileExtension(name);
  let Icon = TbFile;
  let style: (typeof FILE_TYPE_STYLES)[keyof typeof FILE_TYPE_STYLES] = FILE_TYPE_STYLES.default;

  switch (ext) {
    case "pdf":
      Icon = TbFileTypePdf;
      style = FILE_TYPE_STYLES.pdf;
      break;
    case "doc":
      Icon = TbFileTypeDoc;
      style = FILE_TYPE_STYLES.word;
      break;
    case "docx":
      Icon = TbFileTypeDocx;
      style = FILE_TYPE_STYLES.word;
      break;
    case "xls":
    case "xlsx":
      Icon = TbFileTypeXls;
      style = FILE_TYPE_STYLES.excel;
      break;
    case "txt":
      Icon = TbFileTypeTxt;
      style = FILE_TYPE_STYLES.text;
      break;
    case "md":
    case "json":
    case "xml":
    case "html":
    case "css":
    case "js":
    case "ts":
      Icon = TbFileCode;
      style = FILE_TYPE_STYLES.code;
      break;
    default:
      style = FILE_TYPE_STYLES.default;
  }

  return (
    <div className={`h-8 w-8 rounded-[8px] border border-[#f2f2f2] flex items-center justify-center ${style.bg} ${style.icon}`}>
      <Icon size={size} strokeWidth={1.5} />
    </div>
  );
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
      className="group bg-[#fbfcfd] border border-[#f9f9f9] rounded-[20px] h-[108px] p-[21px] flex flex-col justify-between w-full text-left transition-colors hover:bg-gray-1200 hover:border-gray-1200"
    >
      <div className="flex items-center justify-between">
        <div className="text-[#2f2f2f] group-hover:text-[#f9f9f9]">
          {icon}
        </div>
        <div className="text-[#0d0d0d] group-hover:text-[#f9f9f9]">
          {right ?? <Plus24 />}
        </div>
      </div>
      <div className="body-sm font-medium text-[#2f2f2f] group-hover:text-[#f9f9f9]">
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
const KB_TOUR_COMPLETED_KEY_PREFIX = "kb-tour-completed-";

const KB_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    target: "kb-header",
    title: "Visão geral da Base",
    description: "Esta é a sua Base de Conhecimento. Tudo que seus agentes sabem vem daqui.",
  },
  {
    target: "add-sources",
    title: "Adicionar Fontes",
    description: "Comece adicionando conhecimento. Você pode enviar arquivos, URLs ou snippets de texto.",
  },
  {
    target: "activate-integrations",
    title: "Integrações",
    description: "Conecte ferramentas externas para manter sua base sempre atualizada.",
  },
  {
    target: "knowledge-layers",
    title: "Knowledge Layers",
    description: "As Knowledge Layers organizam e refinam como o conhecimento é usado pelos agentes.",
  },
  {
    target: "used-by-agents",
    title: "Uso por Agentes",
    description: "Depois de configurada, esta base pode ser usada por um ou vários agentes.",
  },
  {
    target: "kb-sidebar",
    title: "Navegação lateral",
    description: "Aqui você gerencia documentos, faz buscas semânticas e ajusta configurações.",
  },
  {
    target: "final",
    title: "Pronto para começar",
    description: "Sua base está pronta para crescer. Comece adicionando fontes.",
    primaryButtonLabel: "Adicionar fontes",
  },
];

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

export default function KnowledgeOSDirectoryPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const nameFromUrl = searchParams.get("name");
  const isNewFromUrl = searchParams.get("new") === "1";

  const [search, setSearch] = useState("");
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

  const [layersRowMenuIndex, setLayersRowMenuIndex] = useState<number | null>(null);
  const layersRowMenuRef = useRef<HTMLDivElement | null>(null);

  const [drawerLayersQA, setDrawerLayersQA] = useState<
    { id: string; question: string; answer: string; status: "Ativo" | "Desativado" }[]
  >(() => [
    { id: "qa-1", question: "O que é o Artificial Concord segundo o documento?", answer: "É uma iniciativa educacional focada em Inteligência Artificial, iniciada no YouTube e planejada para expansão multiplataforma.", status: "Desativado" },
    { id: "qa-2", question: "Qual é a missão principal do projeto?", answer: "Democratizar o uso prático, ético e criativo da IA para a comunidade lusófona, especialmente no Brasil.", status: "Ativo" },
    { id: "qa-3", question: "Qual é o público-alvo descrito?", answer: "Comunidade lusófona, com foco em profissionais e entusiastas no Brasil que buscam aplicar IA de forma ética e criativa.", status: "Ativo" },
    { id: "qa-4", question: "O projeto possui validação externa relevante?", answer: "Sim. O documento menciona reconhecimento e parcerias que validam a relevância da iniciativa.", status: "Ativo" },
    { id: "qa-5", question: "Qual foi o crescimento orgânico alcançado?", answer: "O documento descreve métricas de crescimento orgânico da audiência e do engajamento nas plataformas.", status: "Ativo" },
    { id: "qa-6", question: "O projeto possui reconhecimento institucional?", answer: "Sim. Há menção a reconhecimento institucional e possíveis parcerias com instituições.", status: "Ativo" },
    { id: "qa-7", question: "Por que a parceria com a Fasul foi recusada?", answer: "O documento indica motivos estratégicos ou de alinhamento para a decisão em relação à parceria com a Fasul.", status: "Ativo" },
    { id: "qa-8", question: "Qual é a estratégia de conteúdo descrita?", answer: "Expansão multiplataforma, conteúdo educativo em IA e foco na comunidade lusófona.", status: "Ativo" },
    { id: "qa-9", question: "Como o documento descreve o posicionamento profissional do criador?", answer: "Como um educador e divulgador de IA, com foco em uso prático, ético e criativo da tecnologia.", status: "Ativo" },
  ]);

  const [storedName, setStoredName] = useState<string | null>(null);
  const [hasCompletedTour, setHasCompletedTour] = useState<boolean | null>(null);

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

  // Tour: só exibe na primeira vez ou até ser concluído (persistido por base)
  useEffect(() => {
    const id = typeof params?.id === "string" ? params.id : "";
    if (!id) {
      setHasCompletedTour(true);
      return;
    }
    try {
      const completed = window.localStorage.getItem(KB_TOUR_COMPLETED_KEY_PREFIX + id) === "1";
      setHasCompletedTour(completed);
    } catch {
      setHasCompletedTour(false);
    }
  }, [params?.id]);

  const isNewKnowledgeBase = isNewFromUrl || nameFromUrl != null;
  const showTour = Boolean(isNewKnowledgeBase && hasCompletedTour === false && typeof params?.id === "string");

  const handleTourComplete = () => {
    const id = typeof params?.id === "string" ? params.id : "";
    if (id) {
      try {
        window.localStorage.setItem(KB_TOUR_COMPLETED_KEY_PREFIX + id, "1");
      } catch (_) {}
    }
    setHasCompletedTour(true);
  };

  const breadcrumbs = useMemo(() => {
    const base = [
      {
        label: "Knowledge OS",
        href: "/knowledge-os",
        icon: <KnowledgeOSIcon />,
      },
      {
        label: directoryName,
        href: `/knowledge-os/${params?.id}`,
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
    ];
    
    if (currentFolderId) {
      // Adicionar pastas no caminho
      currentFolderPath.forEach((folder) => {
        base.push({
          label: folder.name,
          href: "#",
          icon: <TbFolder className="w-4 h-4" />,
        });
      });
    } else {
      base.push({ label: "Documentos", href: "#", icon: <TbFolder className="w-4 h-4" /> } as any);
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
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <OnboardingTour
        steps={KB_ONBOARDING_STEPS}
        isActive={showTour}
        onComplete={handleTourComplete}
        onSkip={handleTourComplete}
        onPrimaryAction={() => setIsSendFileOpen(true)}
      />
      {/* Override DashboardLayout padding/background */}
      <div className="-m-8">
        {/* Header area */}
        <div className="bg-gray-1200 border-b border-gray-700" data-tour="kb-header">
          <div className="mx-auto max-w-[1544px] px-12 py-8">
            <nav className="flex items-center gap-2 body-sm text-gray-400 mb-4" aria-label="Breadcrumb">
              <Link href="/knowledge-os" className="hover:text-white transition-colors">
                Knowledge OS
              </Link>
              <span aria-hidden="true">|</span>
              <span className="text-white">{directoryName}</span>
            </nav>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-white">
                  <FolderIconBase width={64} height={64} className="invert" />
                </div>
                <h1 className="font-normal text-white">
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
                  className="absolute right-0 top-[calc(100%+8px)] z-20 w-[220px] rounded-[12px] border border-[#f2f2f2] bg-white p-2 shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.12),0px_8px_24px_0px_rgba(0,0,0,0.12)]"
                >
                  <button
                    type="button"
                    className="w-full rounded-[8px] px-3 py-2 text-left body-sm text-[#2f2f2f] hover:bg-[#f2f2f2]"
                    onClick={() => {
                      setIsDirectoryActive((v) => !v);
                      setIsDirMenuOpen(false);
                    }}
                  >
                    {isDirectoryActive ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-[8px] px-3 py-2 text-left body-sm text-[#ff3e4c] hover:bg-[#fff1f2]"
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

            <div className="mt-4 flex items-start gap-3 body-sm text-gray-400">
              {/* Status */}
              <div className="flex items-center gap-2 pr-3 border-r border-gray-600">
                <span
                  className={`inline-block h-[6px] w-[6px] rounded-full ${
                    isDirectoryActive ? "bg-[#00c650]" : "bg-gray-500"
                  }`}
                />
                <span>{isDirectoryActive ? "Ativo" : "Inativo"}</span>
              </div>

              {/* Agentes */}
              <div className="relative pr-3 border-r border-gray-600" ref={agentsPopoverRef} data-tour="used-by-agents">
                <button
                  type="button"
                  onClick={() => {
                    setIsAgentsPopoverOpen((v) => !v);
                    setIsSourcesPopoverOpen(false);
                    setIsLayersPopoverOpen(false);
                  }}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                  </svg>
                  <span>Utilizado por {connectedAgents.length} Agente{connectedAgents.length !== 1 ? "s" : ""}</span>
                </button>
                {isAgentsPopoverOpen && connectedAgents.length > 0 && (
                  <div className="absolute left-0 top-full mt-2 z-30 w-[320px] rounded-[12px] border border-[#f2f2f2] bg-white p-3 shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.12),0px_8px_24px_0px_rgba(0,0,0,0.12)]">
                    <div className="body-xs font-semibold text-[#999] uppercase tracking-wide mb-3">Agentes conectados</div>
                    <ul className="space-y-1">
                      {connectedAgents.map((agent, index) => (
                        <li key={agent.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setAgentSettingsModalAgent(agent);
                              setIsAgentsPopoverOpen(false);
                            }}
                            className="w-full flex items-center gap-3 body-xs text-[#2f2f2f] rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#f2f2f2]"
                          >
                            <img
                              src={getOrbForAgent(agent.id)}
                              alt=""
                              width={36}
                              height={36}
                              className="rounded-full w-9 h-9 object-cover flex-shrink-0"
                            />
                            <span className="truncate flex-1 min-w-0 font-medium">{agent.name}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span
                                className="flex items-center gap-1 rounded-md bg-[#f2f2f2] px-2 py-0.5 body-xs font-medium text-[#5e5e5e]"
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
                                className="p-1 text-[#5e5e5e] rounded-lg pointer-events-none"
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
                      className="mt-3 w-full body-xs text-[#0066cc] hover:underline text-left"
                    >
                      Ver no Agent Studio →
                    </button>
                  </div>
                )}
              </div>

              {/* Fontes */}
              <div className="relative pr-3 border-r border-gray-600" ref={sourcesPopoverRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSourcesPopoverOpen((v) => !v);
                    setIsAgentsPopoverOpen(false);
                    setIsLayersPopoverOpen(false);
                  }}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                  <span>{rows.length} Fonte{rows.length !== 1 ? "s" : ""}</span>
                </button>
                {isSourcesPopoverOpen && rows.length > 0 && (
                  <div className="absolute left-0 top-full mt-2 z-30 w-[220px] rounded-[12px] border border-[#f2f2f2] bg-white p-3 shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.12),0px_8px_24px_0px_rgba(0,0,0,0.12)]">
                    <div className="body-xs font-semibold text-[#999] uppercase tracking-wide mb-2">Resumo de Fontes</div>
                    <div className="space-y-1.5 body-xs text-[#2f2f2f]">
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
                    <div className="mt-3 pt-2 border-t border-[#f2f2f2] body-xs text-[#5e5e5e]">
                      Clique em uma fonte abaixo para ver detalhes
                    </div>
                  </div>
                )}
              </div>

              {/* Knowledge Layers */}
              <div className="relative pr-3" ref={layersPopoverRef} data-tour="knowledge-layers">
                <button
                  type="button"
                  onClick={() => {
                    setIsLayersPopoverOpen((v) => !v);
                    setIsAgentsPopoverOpen(false);
                    setIsSourcesPopoverOpen(false);
                  }}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <img
                    src="/assets/icons/knowledge-layers_icon.svg"
                    alt=""
                    width={14}
                    height={14}
                    className="flex-shrink-0"
                  />
                  <span>{totalKnowledgeLayers} Knowledge Layers</span>
                </button>
                {isLayersPopoverOpen && (
                  <div
                    className="absolute left-0 top-full mt-2 z-30 w-[300px] rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.12),0px_8px_24px_0px_rgba(0,0,0,0.12)]"
                    role="dialog"
                    aria-labelledby="knowledge-layers-popover-title"
                    aria-describedby="knowledge-layers-popover-desc"
                  >
                    <h3 id="knowledge-layers-popover-title" className="body-xs font-semibold text-[#737373] uppercase tracking-wide mb-2">
                      Knowledge Layers
                    </h3>
                    <p id="knowledge-layers-popover-desc" className="body-xs text-[#525252] leading-relaxed mb-4">
                      Camadas de conhecimento extraídas automaticamente por IA a partir das fontes desta base.
                    </p>
                    <div className="space-y-2 body-xs text-[#262626]">
                      <div className="flex items-center justify-between">
                        <span>Entidades extraídas</span>
                        <span className="font-medium tabular-nums">{Math.floor(totalKnowledgeLayers * 0.4)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Relações mapeadas</span>
                        <span className="font-medium tabular-nums">{Math.floor(totalKnowledgeLayers * 0.25)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Embeddings gerados</span>
                        <span className="font-medium tabular-nums">{Math.floor(totalKnowledgeLayers * 0.35)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLayersPopoverOpen(false);
                        router.push(`/knowledge-os/${params?.id}/semantic-search`);
                      }}
                      className="mt-4 w-full text-left body-xs font-medium text-[#0066cc] hover:underline focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:ring-offset-1 rounded cursor-pointer"
                    >
                      Explorar via Semantic Search →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white">
          <div className="w-full px-12 pt-10 pb-14 space-y-8">
            {/* Add sources */}
            <div className="space-y-4" data-tour="add-sources">
              <h6 className="text-[#1a1a1a]">
                Adicione Fontes
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <ActionCard
                  label="Enviar arquivos"
                  icon={<FileIcon16 />}
                  onClick={() => setIsSendFileOpen(true)}
                />
                <ActionCard
                  label="Adicionar URL"
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M3.5 12h17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 3c3 3 3 15 0 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 3c-3 3-3 15 0 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  }
                  onClick={() => setIsAddUrlOpen(true)}
                />
                <ActionCard
                  label="Adicionar Snippet"
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 4h10v16H7V4Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 8h6M9 12h6M9 16h4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  }
                  onClick={() => setIsAddSnippetOpen(true)}
                />
                <div data-tour="activate-integrations">
                  <ActionCard
                    label="Ativar integrações"
                    icon={
                      <div className="flex items-center gap-1">
                        {DEFAULT_INTEGRATIONS.slice(0, 4).map((int) => (
                          <div key={int.id} className="h-8 w-8 rounded-[8px] border border-[#f2f2f2] bg-white flex items-center justify-center overflow-hidden">
                            {int.icon ? (
                              <img src={int.icon} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <span className="body-xs font-bold">{int.shortLabel}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    }
                    onClick={() => setIsActivateIntegrationsOpen(true)}
                  />
                </div>
              </div>
            </div>

            {/* Lista de arquivos e pastas – full width */}
            <div className="w-full overflow-hidden bg-white">
              {/* Navegação de pastas e ações */}
              <div className="px-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Botão voltar */}
                  {currentFolderId && (
                    <button
                      type="button"
                      onClick={() => navigateToFolder(currentFolder?.parentId ?? null)}
                      className="flex items-center gap-1.5 px-3 py-1.5 body-xs text-[#5e5e5e] hover:text-[#1a1a1a] hover:bg-[#f2f2f2] rounded-lg transition-colors"
                    >
                      <TbArrowLeft className="w-4 h-4" />
                      Voltar
                    </button>
                  )}
                  
                  {/* Breadcrumbs interno das pastas */}
                  <nav className="flex items-center gap-1 body-xs">
                    <button
                      type="button"
                      onClick={() => navigateToFolder(null)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                        !currentFolderId
                          ? "text-[#1a1a1a] font-medium"
                          : "text-[#5e5e5e] hover:text-[#1a1a1a] hover:bg-[#f2f2f2]"
                      }`}
                    >
                      <TbFolder className="w-4 h-4" />
                      Raiz
                    </button>
                    {currentFolderPath.map((folder, index) => (
                      <div key={folder.id} className="flex items-center gap-1">
                        <TbChevronRight className="w-4 h-4 text-[#999]" />
                        <button
                          type="button"
                          onClick={() => navigateToFolder(folder.id)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                            index === currentFolderPath.length - 1
                              ? "text-[#1a1a1a] font-medium"
                              : "text-[#5e5e5e] hover:text-[#1a1a1a] hover:bg-[#f2f2f2]"
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
                  className="flex items-center gap-2 px-3 py-2 body-xs font-medium text-[#2f2f2f] border border-[#e5e5e5] rounded-lg hover:bg-[#f9f9f9] transition-colors"
                >
                  <TbFolderPlus className="w-4 h-4" />
                  Nova pasta
                </button>
              </div>

              {/* selection actions */}
              {selectedIds.length > 0 && (
                <div className="px-8 pb-4 flex items-center justify-between">
                  <div className="body-sm text-[#5e5e5e]">
                    {selectedIds.length} selecionado{selectedIds.length > 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
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
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="w-auto"
                      onClick={() => openDeleteSelected(selectedIds)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              )}

              {/* header row */}
              <div className="border-b border-[#f2f2f2] px-8 pb-3 flex items-center gap-x-12">
                <div className="flex flex-1 min-w-0 items-center gap-3 py-2">
                  <div className="flex-shrink-0">
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
                  <div className="body-xs text-[#999999]">Nome do Arquivo</div>
                  <span className="text-[#999999]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M8 6h10M8 10h6M8 14h10M8 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M6 8l-2 2-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.0"/>
                    </svg>
                  </span>
                  </div>
                </div>

                <div className="min-w-[88px] py-2 body-xs text-[#999999]">Status</div>
                <div className="min-w-[140px] py-2 body-xs text-[#999999]">Knowledge Layers</div>
                <div className="min-w-[140px] flex items-center gap-2 py-2 body-xs text-[#999999]">
                  Data de adição
                  <span className="text-[#999999]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                <div className="w-8 flex-shrink-0" aria-hidden />
              </div>

              {/* body rows: folders + files */}
              <div>
                {/* Estado vazio */}
                {filteredFolders.length === 0 && filteredRows.length === 0 && (
                  <div className="px-8 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#f2f2f2] mb-4">
                      <TbFolder className="w-8 h-8 text-[#999]" />
                    </div>
                    <h3 className="body-md font-medium text-[#1a1a1a] mb-2">
                      {currentFolderId ? "Pasta vazia" : "Nenhum arquivo ainda"}
                    </h3>
                    <p className="body-sm text-[#5e5e5e] mb-6 max-w-md mx-auto">
                      {currentFolderId
                        ? "Esta pasta ainda não possui arquivos ou subpastas. Adicione fontes usando os botões acima."
                        : "Comece adicionando arquivos, URLs, snippets ou criando pastas para organizar sua base de conhecimento."}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsCreateFolderOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 body-xs font-medium text-[#2f2f2f] border border-[#e5e5e5] rounded-lg hover:bg-[#f9f9f9] transition-colors"
                      >
                        <TbFolderPlus className="w-4 h-4" />
                        Nova pasta
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSendFileOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 body-xs font-medium text-white bg-[#0d0d0d] rounded-lg hover:bg-[#262626] transition-colors"
                      >
                        <TbFile className="w-4 h-4" />
                        Adicionar arquivo
                      </button>
                    </div>
                  </div>
                )}

                {/* Pastas */}
                {filteredFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className="border-b border-[#f2f2f2] px-8 py-3 flex items-center gap-x-12 transition-colors cursor-pointer hover:bg-[#fbfcfd]"
                    onClick={() => navigateToFolder(folder.id)}
                  >
                    <div className="flex flex-1 min-w-0 items-center gap-3 py-1">
                      <div className="flex-shrink-0 w-4" />
                      <div className="h-8 w-8 rounded-[8px] border border-[#f2f2f2] bg-amber-50 flex items-center justify-center text-amber-600">
                        <TbFolder className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col leading-normal">
                        <div className="body-xs font-medium text-[#0d0d0d] truncate flex items-center gap-2">
                          {folder.name}
                        </div>
                        <div className="body-xs text-[#38404a]">Pasta</div>
                      </div>
                    </div>

                    <div className="min-w-[88px] py-1 flex items-center">
                      <span className="inline-flex items-center gap-1.5 aw-eyebrow text-[#5e5e5e]">
                        —
                      </span>
                    </div>

                    <div className="min-w-[140px] py-1 flex items-center gap-2 body-xs text-[#5e5e5e]">
                      {/* Soma de Knowledge Layers dos itens na pasta */}
                      {(() => {
                        // Função recursiva para obter todos os IDs de pastas filhas
                        const getAllChildFolderIds = (parentId: string): string[] => {
                          const children = folders.filter((f) => f.parentId === parentId);
                          return children.reduce<string[]>(
                            (acc, child) => [...acc, child.id, ...getAllChildFolderIds(child.id)],
                            []
                          );
                        };
                        const allFolderIds = [folder.id, ...getAllChildFolderIds(folder.id)];
                        
                        // Somar knowledge layers de todos os arquivos nas pastas
                        const totalLayers = rows
                          .filter((r) => r.folderId && allFolderIds.includes(r.folderId))
                          .reduce((acc, r) => {
                            const match = r.layersLabel.match(/(\d+)/);
                            return acc + (match ? parseInt(match[1], 10) : 0);
                          }, 0);
                        
                        if (totalLayers === 0) {
                          return "—";
                        }
                        return (
                          <>
                            <Layers16 />
                            {totalLayers} itens
                          </>
                        );
                      })()}
                    </div>

                    <div className="min-w-[140px] py-1 body-xs text-[#5e5e5e]">
                      {new Date(folder.createdAt).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </div>

                    <div className="w-8 flex-shrink-0 flex justify-end relative">
                      <button
                        type="button"
                        className="text-[#5e5e5e] hover:text-[#0d0d0d]"
                        aria-label="Ações da pasta"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFolderMenuOpenId((prev) => (prev === folder.id ? null : folder.id));
                        }}
                      >
                        <Ellipsis16 />
                      </button>
                      {folderMenuOpenId === folder.id && (
                        <div
                          ref={folderMenuRef}
                          className="absolute z-30 mt-2 right-0 top-full w-[190px] rounded-[12px] border border-[#f2f2f2] bg-white p-2 shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.12),0px_8px_24px_0px_rgba(0,0,0,0.12)]"
                        >
                          <button
                            type="button"
                            className="w-full rounded-[8px] px-3 py-2 text-left body-sm text-[#2f2f2f] hover:bg-[#f2f2f2] flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFolderMenuOpenId(null);
                              navigateToFolder(folder.id);
                            }}
                          >
                            <TbFolderOpen className="w-4 h-4" />
                            Abrir
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-[8px] px-3 py-2 text-left body-sm text-[#2f2f2f] hover:bg-[#f2f2f2] flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFolderMenuOpenId(null);
                              setFolderToRename(folder);
                              setIsRenameFolderOpen(true);
                            }}
                          >
                            <TbPencil className="w-4 h-4" />
                            Renomear
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-[8px] px-3 py-2 text-left body-sm text-[#ff3e4c] hover:bg-[#fff1f2] flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFolderMenuOpenId(null);
                              setFolderToDelete(folder);
                              setIsDeleteFolderOpen(true);
                            }}
                          >
                            <TbTrash className="w-4 h-4" />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Arquivos */}
                {filteredRows.map((r) => (
                  <div
                    key={r.id}
                    className={`border-b border-[#f2f2f2] px-8 py-3 flex items-center gap-x-12 transition-colors cursor-pointer ${
                      selectedIds.includes(r.id) ? "bg-[#f2f2f2]" : "hover:bg-[#fbfcfd]"
                    }`}
                    onClick={() => setDrawerRow(r)}
                  >
                    <div className="flex flex-1 min-w-0 items-center gap-3 py-1">
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.includes(r.id)}
                          ariaLabel={`Selecionar ${r.name}`}
                          onChange={() => toggleRow(r.id)}
                        />
                      </div>
                      <FileTypeIcon name={r.name} typeLabel={r.typeLabel} />
                      <div className="flex min-w-0 flex-1 flex-col leading-normal">
                        <div className="body-xs font-medium text-[#0d0d0d] truncate">
                          {r.name}
                        </div>
                        <div className="body-xs text-[#38404a]">{r.typeLabel}</div>
                      </div>
                    </div>

                    <div className="min-w-[88px] py-1 flex items-center">
                      {r.status === "Analisando" ? (
                        <span className="inline-flex items-center gap-1.5 aw-eyebrow text-[#b45309]">
                          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                          Analisando
                        </span>
                      ) : r.status === "Ativo" ? (
                        <span className="inline-flex items-center gap-1.5 aw-eyebrow text-[#105e45]">
                          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                          Ativo
                        </span>
                      ) : r.status === "Erro" ? (
                        <span className="inline-flex items-center gap-1.5 aw-eyebrow text-[#b91c1c]">
                          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                          Erro
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 aw-eyebrow text-[#5e5e5e]">
                          <span className="w-2 h-2 rounded-full bg-[#9ca3af] flex-shrink-0" />
                          Inativo
                        </span>
                      )}
                    </div>

                    <div className="min-w-[140px] py-1 flex items-center gap-2 body-xs text-[#5e5e5e]">
                      {r.status === "Analisando" ? (
                        <>
                          <span className="w-4 h-4 border-2 border-[#999999] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          Extraindo Knowledge Layers…
                        </>
                      ) : (
                        <>
                          <Layers16 />
                          {r.layersLabel}
                        </>
                      )}
                    </div>

                    <div className="min-w-[140px] py-1 body-xs text-[#5e5e5e]">
                      {r.createdAt}
                    </div>

                    <div className="w-8 flex-shrink-0 flex justify-end">
                      <button
                        type="button"
                        className="text-[#5e5e5e] hover:text-[#0d0d0d]"
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
                          className="absolute z-30 mt-2 -translate-x-[170px] w-[190px] rounded-[12px] border border-[#f2f2f2] bg-white p-2 shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.12),0px_8px_24px_0px_rgba(0,0,0,0.12)]"
                        >
                          <button
                            type="button"
                            className="w-full rounded-[8px] px-3 py-2 text-left body-sm text-[#2f2f2f] hover:bg-[#f2f2f2]"
                            onClick={() => {
                              setRowMenuOpenId(null);
                              setDrawerRow(r);
                            }}
                          >
                            Visualizar
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-[8px] px-3 py-2 text-left body-sm text-[#ff3e4c] hover:bg-[#fff1f2]"
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
        </div>
      </div>

      {/* Document drawer (lateral direita, conforme Figma) */}
      {drawerRow && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            aria-hidden
            onClick={() => setDrawerRow(null)}
          />
          <div
            className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-[min(640px,66.666vw)] bg-white shadow-2xl flex flex-col transition-transform duration-200 ease-out ${
                drawerVisible ? "translate-x-0" : "translate-x-full"
              }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 border-b border-[#f2f2f2] flex-shrink-0">
              <div className="flex items-start gap-3 min-w-0">
                <FileTypeIcon name={drawerRow.name} typeLabel={drawerRow.typeLabel} />
                <div className="min-w-0">
                  <h6 id="drawer-title" className="text-[#1a1a1a] truncate">
                    {drawerRow.name}
                  </h6>
                  <p className="body-xs text-[#5e5e5e] mt-0.5">{drawerRow.typeLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerRow(null)}
                className="flex-shrink-0 p-2 text-[#5e5e5e] hover:text-[#1a1a1a] hover:bg-[#f2f2f2] rounded-lg transition-colors"
                aria-label="Fechar"
              >
                <TbX className="w-5 h-5" />
              </button>
            </div>

            {/* Two columns: metadata (left) + content (right) */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* Left: metadata */}
              <div className="w-[220px] flex-shrink-0 border-r border-[#f2f2f2] p-6 flex flex-col gap-5 overflow-y-auto">
                <div>
                  <p className="body-xs font-semibold text-[#999] uppercase tracking-wide mb-1.5">ID do arquivo</p>
                  <div className="flex items-center gap-2">
                    <span className="mono text-[#2f2f2f] truncate" title={idToFileUuid(drawerRow.id)}>
                      {idToFileUuid(drawerRow.id)}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(idToFileUuid(drawerRow.id))}
                      className="p-1.5 text-[#5e5e5e] hover:text-[#1a1a1a] hover:bg-[#f2f2f2] rounded transition-colors"
                      aria-label="Copiar ID"
                    >
                      <TbCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="body-xs font-semibold text-[#999] uppercase tracking-wide mb-1.5">Status</p>
                  <span
                    className={`inline-flex items-center gap-1.5 body-xs font-medium px-2 py-1 rounded-md ${
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
                  <p className="body-xs font-semibold text-[#999] uppercase tracking-wide mb-1.5">Knowledge Layers</p>
                  <p className="body-xs text-[#2f2f2f]">{drawerRow.layersLabel}</p>
                </div>
                <div>
                  <p className="body-xs font-semibold text-[#999] uppercase tracking-wide mb-1.5">Adicionado em</p>
                  <p className="body-xs text-[#2f2f2f]">{drawerRow.createdAt}</p>
                </div>
                <div>
                  <p className="body-xs font-semibold text-[#999] uppercase tracking-wide mb-1.5">Atualizado em</p>
                  <div className="flex items-center gap-2">
                    <span className="body-xs text-[#2f2f2f]">{drawerRow.createdAt}</span>
                    <span className="text-[#999]" title="Última atualização">
                      <TbRefresh className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: tabs + content */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="border-b border-[#f2f2f2] px-6 flex gap-6 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setDrawerTab("conteudo")}
                    className={`py-3 body-xs font-medium border-b-2 transition-colors ${
                      drawerTab === "conteudo"
                        ? "border-[#1a1a1a] text-[#1a1a1a]"
                        : "border-transparent text-[#5e5e5e] hover:text-[#1a1a1a]"
                    }`}
                  >
                    Conteúdo do Arquivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTab("layers")}
                    className={`py-3 body-xs font-medium border-b-2 transition-colors ${
                      drawerTab === "layers"
                        ? "border-[#1a1a1a] text-[#1a1a1a]"
                        : "border-transparent text-[#5e5e5e] hover:text-[#1a1a1a]"
                    }`}
                  >
                    Knowledge Layers
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTab("visualizar")}
                    className={`py-3 body-xs font-medium border-b-2 transition-colors ${
                      drawerTab === "visualizar"
                        ? "border-[#1a1a1a] text-[#1a1a1a]"
                        : "border-transparent text-[#5e5e5e] hover:text-[#1a1a1a]"
                    }`}
                  >
                    Visualizar arquivo
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {drawerTab === "conteudo" && (
                    <div className="body-sm text-[#2f2f2f] leading-relaxed space-y-4">
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
                      <p className="body-xs text-[#5e5e5e]">
                        [Exemplo de demonstração — conteúdo real virá da extração automática.]
                      </p>
                    </div>
                  )}
                  {drawerTab === "layers" && (
                    <div className="flex flex-col h-full min-h-0">
                      {/* Controles – conforme Figma node 40000350-17422 */}
                      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Pesquisar arquivo"
                            className="w-full rounded-lg border border-[#e5e5e5] bg-white py-2 pl-3 pr-9 body-xs text-[#2f2f2f] placeholder:text-[#999] focus:border-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#1a1a1a]"
                            readOnly
                            aria-label="Pesquisar arquivo"
                          />
                          <TbSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999] pointer-events-none" />
                        </div>
                        <button
                          type="button"
                          className="flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 body-xs text-[#2f2f2f] hover:bg-[#f9f9f9] transition-colors"
                        >
                          <TbFilter className="w-4 h-4 text-[#5e5e5e]" />
                          <span>Status</span>
                          <TbChevronDown className="w-4 h-4 text-[#5e5e5e]" />
                        </button>
                      </div>

                      {/* Cabeçalho da tabela */}
                      <div className="flex items-center gap-4 py-2 border-b border-[#f2f2f2] body-xs text-[#999] flex-shrink-0">
                        <div className="flex flex-1 min-w-0 items-center gap-1">
                          <span>Título</span>
                          <span className="text-[#999]" aria-hidden>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </div>
                        <div className="w-[88px] flex-shrink-0 text-right">Status</div>
                        <div className="w-8 flex-shrink-0" aria-hidden />
                      </div>

                      {/* Lista de perguntas e respostas geradas – conforme Figma */}
                      <ul className="flex-1 overflow-y-auto min-h-0 divide-y divide-[#f2f2f2] -mx-6 px-6">
                        {drawerLayersQA.map((item, index) => (
                          <li key={item.id} className="py-3 flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="body-xs font-semibold text-[#1a1a1a] leading-snug">{item.question}</p>
                              <p className="body-xs text-[#5e5e5e] leading-snug mt-0.5">{item.answer}</p>
                            </div>
                            <span
                              className={`flex-shrink-0 px-2 py-0.5 rounded-full body-xs font-medium ${
                                item.status === "Ativo"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {item.status}
                            </span>
                            <div
                              className="relative flex-shrink-0"
                              ref={layersRowMenuIndex === index ? layersRowMenuRef : null}
                            >
                              <button
                                type="button"
                                onClick={() => setLayersRowMenuIndex((prev) => (prev === index ? null : index))}
                                className="p-1 text-[#5e5e5e] hover:text-[#1a1a1a] hover:bg-[#f2f2f2] rounded transition-colors"
                                aria-label="Mais opções"
                                aria-expanded={layersRowMenuIndex === index}
                              >
                                <Ellipsis16 />
                              </button>
                              {layersRowMenuIndex === index && (
                                <div className="absolute right-0 top-full mt-1 z-20 w-[180px] rounded-[12px] border border-[#f2f2f2] bg-white p-2 shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.12),0px_8px_24px_0px_rgba(0,0,0,0.12)]">
                                  <button
                                    type="button"
                                    className="w-full rounded-[8px] px-3 py-2 text-left body-xs text-[#2f2f2f] hover:bg-[#f2f2f2]"
                                    onClick={() => {
                                      setDrawerLayersQA((prev) =>
                                        prev.map((q, i) =>
                                          i === index
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
                                    className="w-full rounded-[8px] px-3 py-2 text-left body-xs text-[#2f2f2f] hover:bg-[#f2f2f2]"
                                    onClick={() => setLayersRowMenuIndex(null)}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    className="w-full rounded-[8px] px-3 py-2 text-left body-xs text-[#2f2f2f] hover:bg-[#f2f2f2]"
                                    onClick={() => {
                                      setLayersRowMenuIndex(null);
                                      // Reanalisar: a IA fará uma análise nova (integração futura)
                                    }}
                                  >
                                    Reanalisar
                                  </button>
                                  <button
                                    type="button"
                                    className="w-full rounded-[8px] px-3 py-2 text-left body-xs text-[#ff3e4c] hover:bg-[#fff1f2]"
                                    onClick={() => {
                                      setDrawerLayersQA((prev) => prev.filter((_, i) => i !== index));
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
                      </ul>

                      <p className="body-xs text-[#999] mt-3 flex-shrink-0">
                        Exemplo de demonstração — perguntas e respostas reais virão do pipeline de Knowledge Layers.
                      </p>
                    </div>
                  )}
                  {drawerTab === "visualizar" && (() => {
                    const ext = getFileExtension(drawerRow.name);
                    const isPdf = ext === "pdf";
                    const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext);
                    const isUrl = drawerRow.typeLabel === "URL";
                    const previewUrl = isUrl
                      ? drawerRow.name
                      : `/api/knowledge-os/bases/${params?.id ?? ""}/files/${drawerRow.id}/preview`;
                    if (isUrl) {
                      return (
                        <div className="flex flex-col h-full min-h-[400px]">
                          <p className="body-xs text-[#5e5e5e] mb-3">
                            Visualização da página em nova aba:{" "}
                            <a
                              href={drawerRow.name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#1a1a1a] underline hover:no-underline"
                            >
                              {drawerRow.name}
                            </a>
                          </p>
                          <div className="flex-1 min-h-0 rounded-lg border border-[#e5e5e5] overflow-hidden bg-white">
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
                    if (isPdf) {
                      return (
                        <div className="flex flex-col h-full min-h-[400px]">
                          <div className="flex-1 min-h-0 rounded-lg border border-[#e5e5e5] overflow-hidden bg-[#525659]">
                            <iframe
                              title={`Visualização: ${drawerRow.name}`}
                              src={previewUrl}
                              className="w-full h-full min-h-[400px]"
                            />
                          </div>
                          <p className="body-xs text-[#999] mt-2">
                            Se o PDF não carregar, use o botão &quot;Download arquivos&quot; abaixo.
                          </p>
                        </div>
                      );
                    }
                    if (isImage) {
                      return (
                        <div className="flex flex-col h-full min-h-[200px]">
                          <div className="flex-1 min-h-0 rounded-lg border border-[#e5e5e5] overflow-hidden bg-[#f9f9f9] flex items-center justify-center">
                            <img
                              src={previewUrl}
                              alt={drawerRow.name}
                              className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
                            />
                          </div>
                          <p className="body-xs text-[#999] mt-2">
                            Se a imagem não carregar, use o botão &quot;Download arquivos&quot; abaixo.
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div className="body-sm text-[#2f2f2f] leading-relaxed">
                        <p>
                          Este tipo de arquivo (<strong>{drawerRow.typeLabel}</strong>) não pode ser visualizado no navegador.
                        </p>
                        <p className="mt-2 text-[#5e5e5e]">
                          Use o botão &quot;Download arquivos&quot; abaixo para abrir o arquivo no seu computador.
                        </p>
                      </div>
                    );
                  })()}
                </div>
                <div className="p-6 border-t border-[#f2f2f2] flex justify-end flex-shrink-0">
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-auto gap-2"
                    onClick={() => {}}
                  >
                    <TbDownload className="w-4 h-4" />
                    Download arquivos
                  </Button>
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
          <h2 className="body-xl font-heading font-bold text-text-primary mb-4">
            Visualizar
          </h2>
          <div className="space-y-2 body-sm text-[#2f2f2f]">
            <div>
              <span className="text-[#7a7a7a]">Nome:</span>{" "}
              <span className="font-medium">{viewRow?.name}</span>
            </div>
            <div>
              <span className="text-[#7a7a7a]">Tipo:</span> {viewRow?.typeLabel}
            </div>
            <div>
              <span className="text-[#7a7a7a]">Status:</span> {viewRow?.status}
            </div>
            <div>
              <span className="text-[#7a7a7a]">Knowledge Layers:</span>{" "}
              {viewRow?.layersLabel}
            </div>
            <div>
              <span className="text-[#7a7a7a]">Data de adição:</span>{" "}
              {viewRow?.createdAt}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button size="sm" variant="secondary" className="w-auto" onClick={() => setViewRow(null)}>
              Fechar
            </Button>
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
          <h2 className="body-xl font-heading font-bold text-[#1a1a1a] mb-4">
            Configurações do agente
          </h2>
          {agentSettingsModalAgent && (
            <>
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#f2f2f2]">
                <img
                  src={getOrbForAgent(agentSettingsModalAgent.id)}
                  alt=""
                  width={56}
                  height={56}
                  className="rounded-full w-14 h-14 object-cover flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-[#1a1a1a] body-lg">{agentSettingsModalAgent.name}</p>
                  <p className="body-sm text-[#5e5e5e]">Agente conectado a esta base</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="body-xs font-semibold text-[#999] uppercase tracking-wide mb-1">
                    Objective-Bound Knowledge Layers
                  </p>
                  <p className="text-[#2f2f2f] flex items-center gap-2">
                    <img
                      src="/assets/icons/knowledge-layers_icon.svg"
                      alt=""
                      width={16}
                      height={16}
                      className="opacity-80"
                    />
                    <span className="font-medium">{agentSettingsModalAgent.objectiveBoundLayers}</span>
                    <span className="text-[#5e5e5e] body-sm">layers gerados por este agente</span>
                  </p>
                </div>
                <div className="pt-2">
                  <p className="body-xs font-semibold text-[#999] uppercase tracking-wide mb-1">
                    Outras configurações
                  </p>
                  <p className="body-sm text-[#5e5e5e]">Em breve. Você poderá ajustar permissões e opções específicas do agente aqui.</p>
                </div>
              </div>
            </>
          )}
          <div className="mt-6 flex justify-end">
            <Button size="sm" variant="secondary" className="w-auto" onClick={() => setAgentSettingsModalAgent(null)}>
              Fechar
            </Button>
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
          router.push("/knowledge-os");
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
          router.push(`/knowledge-os/${params.id}/url/${urlSlug}?title=${encodeURIComponent(title)}`);
        }}
      />

      <SendFileModal
        isOpen={isSendFileOpen}
        onClose={() => setIsSendFileOpen(false)}
        baseId={params?.id}
        onComplete={(files) => {
          if (files.length === 0) return;
          const newRows: SourceRow[] = files.map((f) => ({
            id: f.serverId ?? f.id,
            name: f.name,
            typeLabel: "Arquivo",
            status: "Analisando",
            layersLabel: "Extraindo Knowledge Layers…",
            createdAt: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
            folderId: currentFolderId,
          }));
          setRows((prev) => [...newRows, ...prev]);
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
            folderId: currentFolderId,
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
            folderId: currentFolderId,
          }));
          setRows((prev) => [...newRows, ...prev]);
        }}
      />

      {/* Modal criar pasta */}
      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onComplete={handleCreateFolder}
        parentFolderName={currentFolder?.name}
      />

      {/* Modal renomear pasta */}
      <RenameFolderModal
        isOpen={isRenameFolderOpen}
        onClose={() => {
          setIsRenameFolderOpen(false);
          setFolderToRename(null);
        }}
        onComplete={handleRenameFolder}
        currentName={folderToRename?.name || ""}
      />

      {/* Modal confirmar exclusão de pasta */}
      <ConfirmationModal
        isOpen={isDeleteFolderOpen}
        onClose={() => {
          setIsDeleteFolderOpen(false);
          setFolderToDelete(null);
        }}
        onConfirm={handleDeleteFolder}
        title="Excluir pasta?"
        message={
          folderToDelete
            ? `Tem certeza que deseja excluir a pasta "${folderToDelete.name}"? Os arquivos dentro dela serão movidos para a raiz.`
            : ""
        }
        confirmText="Excluir"
        confirmVariant="danger"
      />
    </DashboardLayout>
  );
}

