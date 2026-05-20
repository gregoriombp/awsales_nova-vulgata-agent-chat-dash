"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import MemoryBaseOnboarding from "@/components/memory-base/MemoryBaseOnboarding";
import MemoryBaseIcon from "@/components/memory-base/MemoryBaseIcon";
import FormModal from "@/components/modals/FormModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import BaseModal from "@/components/modals/BaseModal";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Textarea from "@/components/forms/Textarea";
import FileUpload from "@/components/forms/FileUpload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToastContext } from "@/lib/contexts/ToastContext";
import { useRouter } from "next/navigation";

const createBaseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

type CreateBaseFormData = z.infer<typeof createBaseSchema>;

interface KnowledgeOSBase {
  id: string;
  name: string;
  description: string;
  type: string;
  documentCount: number;
  knowledgeLayersCount?: number;
  createdAt: string;
  status: "active" | "inactive";
}

const MEMORY_BASES_STORAGE_KEY = "memory-bases-list";
const ONBOARDING_COMPLETED_KEY = "memory-base-onboarding-completed";

function loadBasesFromStorage(): KnowledgeOSBase[] {
  if (typeof window === "undefined") return [];
  try {
    const s = window.localStorage.getItem(MEMORY_BASES_STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
}

export default function KnowledgeOSPage() {
  const router = useRouter();
  const { success, error: showError } = useToastContext();
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFilesListModalOpen, setIsFilesListModalOpen] = useState(false);
  const [isSelectBaseModalOpen, setIsSelectBaseModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedBase, setSelectedBase] = useState<KnowledgeOSBase | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [newBaseId, setNewBaseId] = useState<string | null>(null);
  const [selectedBaseForFiles, setSelectedBaseForFiles] = useState<string[]>([]);

  const [bases, setBases] = useState<KnowledgeOSBase[]>([]);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if onboarding has been completed and load bases
  useEffect(() => {
    const loadedBases = loadBasesFromStorage();
    setBases(loadedBases);
    
    // Check onboarding status
    const onboardingCompleted = window.localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    // Onboarding is considered completed if:
    // 1. The flag is set, OR
    // 2. There are already bases created (existing users)
    setHasCompletedOnboarding(onboardingCompleted === "1" || loadedBases.length > 0);
    setIsLoading(false);
  }, []);

  // Handle onboarding completion
  const handleOnboardingComplete = (baseName: string, baseId: string) => {
    // Mark onboarding as completed
    window.localStorage.setItem(ONBOARDING_COMPLETED_KEY, "1");
    setHasCompletedOnboarding(true);
    
    // Reload bases from storage (the base was created in onboarding)
    setBases(loadBasesFromStorage());
    
    success("Base de conhecimento criada com sucesso!");
  };

  // When user has no knowledge bases, always show the 4-step onboarding (empty state is not used).
  const shouldShowOnboarding = !isLoading && bases.length === 0;

  const persistBases = (nextBases: KnowledgeOSBase[]) => {
    try {
      window.localStorage.setItem(MEMORY_BASES_STORAGE_KEY, JSON.stringify(nextBases));
    } catch (_) {}
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateBaseFormData>({
    resolver: zodResolver(createBaseSchema),
  });

  const nameValue = watch("name");
  const descriptionValue = watch("description");
  const isCreateButtonEnabled = nameValue && nameValue.length > 0;

  // Step 1: Create Base → redireciona para a página da base (tela do Figma), sem modal de upload
  const onSubmitCreateBase = async (data: CreateBaseFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newBase: KnowledgeOSBase = {
        id: Math.random().toString(36).substring(7),
        name: data.name,
        description: data.description || "",
        type: "documentos",
        documentCount: 0,
        knowledgeLayersCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
        status: "active",
      };

      const nextBases = [...bases, newBase];
      setBases(nextBases);
      persistBases(nextBases);
      setIsCreateModalOpen(false);
      reset();
      success("Base de conhecimento criada com sucesso!");
      router.push(`/knowledge-os/${newBase.id}?name=${encodeURIComponent(newBase.name)}&new=1`);
    } catch (err) {
      showError("Erro ao criar base de conhecimento");
    }
  };

  // Step 2: Handle file upload
  const handleFileUpload = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      type: file.name.split(".").pop() || "unknown",
      size: file.size,
      file,
    }));

    setUploadedFiles([...uploadedFiles, ...newFiles]);
    setIsUploadModalOpen(false);
    setIsFilesListModalOpen(true);
  };

  // Step 3: Remove file from list
  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== fileId));
  };

  // Step 4: Add more files
  const handleAddMoreFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      type: file.name.split(".").pop() || "unknown",
      size: file.size,
      file,
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  // Step 5: Proceed to select base
  const handleAdvance = () => {
    if (uploadedFiles.length === 0) return;
    setIsFilesListModalOpen(false);
    setIsSelectBaseModalOpen(true);
  };

  // Step 6: Toggle base selection
  const handleToggleBaseSelection = (baseId: string) => {
    setSelectedBaseForFiles((prev) =>
      prev.includes(baseId)
        ? prev.filter((id) => id !== baseId)
        : [...prev, baseId]
    );
  };

  // Step 7: Save files
  const handleSaveFiles = async () => {
    if (selectedBaseForFiles.length === 0 && !newBaseId) {
      showError("Selecione pelo menos uma base de conhecimento");
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSelectBaseModalOpen(false);
      setUploadedFiles([]);
      setSelectedBaseForFiles([]);
      success("Arquivos salvos com sucesso!");
      
      // Redirect directly to the detail page
      if (newBaseId) {
        router.push(`/knowledge-os/${newBaseId}`);
        setNewBaseId(null);
      }
    } catch (err) {
      showError("Erro ao salvar arquivos");
    }
  };

  // Step 8: View base after success
  const handleViewBase = () => {
    if (newBaseId) {
      router.push(`/knowledge-os/${newBaseId}`);
    }
    setIsSuccessModalOpen(false);
    setNewBaseId(null);
  };

  const handleDelete = async () => {
    if (!selectedBase) return;
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const nextBases = bases.filter((base) => base.id !== selectedBase.id);
      setBases(nextBases);
      persistBases(nextBases);
      setIsDeleteModalOpen(false);
      setSelectedBase(null);
      success("Base de conhecimento excluída com sucesso!");
    } catch (err) {
      showError("Erro ao excluir base de conhecimento");
    }
  };

  const breadcrumbs = [
    {
label: "Knowledge OS",
    icon: <MemoryBaseIcon />,
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-[#0d0d0d] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // Onboarding flow (first use) - renders its own layout without MemoryBaseSidebar
  if (shouldShowOnboarding) {
    return <MemoryBaseOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Lista de bases (só exibida quando há pelo menos uma base; sem bases mostra-se o onboarding) */}
        <div className="-m-8">
            {/* Header – mesmo padrão da página de detalhe da base */}
            <div className="bg-white border-b border-[#f2f2f2]">
              <div className="mx-auto max-w-[1544px] px-12 py-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-[#1a1a1a] flex-shrink-0">
                      <img src="/assets/knowledge-os-icon.svg" alt="" width={76} height={80} />
                    </div>
                    <div>
                      <h1 className="text-[#1a1a1a]">
                        Knowledge OS
                      </h1>
                      <p className="mt-2 body-sm text-[#5e5e5e]">
                        Knowledge OS é a base de conhecimento dos seus agentes. Documentos, URLs e trechos ficam organizados aqui.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center h-10 rounded-lg border border-[#e5e5e5] bg-white overflow-hidden transition-[width] duration-200" style={{ width: searchExpanded ? 320 : 40 }}>
                      {!searchExpanded ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchExpanded(true);
                            setTimeout(() => searchInputRef.current?.focus(), 0);
                          }}
                          className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-[#5e5e5e] hover:text-[#1a1a1a] hover:bg-[#f9f9f9]"
                          aria-label="Abrir pesquisa"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                            <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      ) : (
                        <>
                          <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onBlur={() => { if (!searchQuery.trim()) setSearchExpanded(false); }}
                            placeholder="Pesquise por bases de memória"
                            className="flex-1 min-w-0 h-full pl-3 pr-1 border-0 bg-transparent body-sm text-[#1a1a1a] placeholder:text-[#737373] focus:outline-none focus:ring-0"
                          />
                          <button
                            type="button"
                            onClick={() => { setSearchExpanded(false); setSearchQuery(""); }}
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#737373] hover:text-[#1a1a1a] hover:bg-[#f2f2f2] rounded"
                            aria-label="Fechar pesquisa"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0d0d0d] text-white rounded-lg font-medium body-sm hover:bg-[#262626] active:bg-black transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3.33333V12.6667M3.33333 8H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Nova base
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white">
              <div className="mx-auto max-w-[1544px] px-12 pt-10 pb-14 space-y-10">
                {/* Seção Folders – cards de pastas (bases de conhecimento) */}
                <div className="space-y-4">
                  <h6 className="text-[#1a1a1a]">
                    Bases de conhecimento
                  </h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {bases.map((base) => {
                      const layers = base.knowledgeLayersCount ?? 0;
                      const fontes = base.documentCount;
                      return (
                        <div
                          key={base.id}
                          onClick={() => router.push(`/knowledge-os/${base.id}`)}
                          className="group relative bg-[#fbfcfd] border border-[#f9f9f9] rounded-[20px] p-[21px] min-h-[128px] flex flex-col justify-between cursor-pointer transition-colors hover:bg-[#0d0d0d] hover:border-[#0d0d0d] text-left"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-[#2f2f2f] group-hover:text-[#f9f9f9] flex-shrink-0">
                              <img
                                src="/assets/folder_data_24dp_1F1F1F_FILL0_wght200_GRAD0_opsz24.svg"
                                alt=""
                                width={24}
                                height={24}
                                className="group-hover:invert"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedBase(base);
                                setIsDeleteModalOpen(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 text-[#5e5e5e] group-hover:text-[#f9f9f9] transition-opacity"
                              aria-label="Mais opções"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                                <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
                              </svg>
                            </button>
                          </div>
                          <div>
                            <h3 className="body-sm font-medium text-[#2f2f2f] group-hover:text-[#f9f9f9] line-clamp-2">
                              {base.name}
                            </h3>
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 body-xs text-[#5e5e5e] group-hover:text-[#a3a3a3]">
                              <span className="inline-flex items-center gap-1.5">
                                <img
                                  src="/assets/icons/knowledge-layers_icon.svg"
                                  alt=""
                                  width={14}
                                  height={14}
                                  className="opacity-70 group-hover:invert"
                                />
                                <span>{layers} {layers === 1 ? "Knowledge Layer" : "Knowledge Layers"}</span>
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:invert" aria-hidden>
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                  <line x1="16" y1="13" x2="8" y2="13" />
                                  <line x1="16" y1="17" x2="8" y2="17" />
                                  <polyline points="10 9 9 9 8 9" />
                                </svg>
                                <span>{fontes} Fonte{fontes !== 1 ? "s" : ""}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Modal 1: Create Base */}
        <BaseModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            reset();
          }}
          size="md"
        >
          <form onSubmit={handleSubmit(onSubmitCreateBase)} className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="font-medium text-text-primary">
                Nova Base de Conhecimento
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <p className="body-sm text-text-secondary mb-4">
                    Crie uma nova base de conhecimento para organizar seus documentos
                  </p>
                </div>
                <Input
                  label="Nome da Base"
                  placeholder="Ex: Documentação do Produto"
                  {...register("name")}
                  error={errors.name?.message}
                />
                <Textarea
                  label="Descrição (opcional)"
                  placeholder="Descreva o conteúdo desta base..."
                  {...register("description")}
                  error={errors.description?.message}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  reset();
                }}
                className="w-auto px-6"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isCreateButtonEnabled}
                className={`w-auto px-6 ${
                  !isCreateButtonEnabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Criar base
              </Button>
            </div>
          </form>
        </BaseModal>

        {/* Modal 2: Upload Files (Drag & Drop) */}
        <BaseModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setUploadedFiles([]);
          }}
          size="lg"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-medium text-text-primary">
                Adicionar arquivos
              </h2>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadedFiles([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-gray-400">
                    <path d="M32 16V48M16 32H48" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
                  </svg>
                  <div>
                    <p className="text-text-primary font-medium mb-2">
                      Arraste e solte arquivos aqui
                    </p>
                    <p className="body-sm text-text-secondary mb-4">
                      JPG, PNG ou PDF, tamanho máximo de 10 MB
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".jpg,.jpeg,.png,.pdf";
                        input.multiple = true;
                        input.onchange = (e) => {
                          const files = Array.from((e.target as HTMLInputElement).files || []);
                          handleFileUpload(files);
                        };
                        input.click();
                      }}
                      className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-1200 text-white rounded-lg hover:bg-[#111111] active:bg-black transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Adicionar arquivos
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  if (newBaseId) {
                    router.push(`/knowledge-os/${newBaseId}`);
                    setNewBaseId(null);
                  }
                }}
                variant="secondary"
                className="w-auto px-6"
              >
                Pular
              </Button>
              <Button
                onClick={() => setIsUploadModalOpen(false)}
                variant="secondary"
                className="w-auto px-6"
                disabled={uploadedFiles.length === 0}
              >
                Avançar
              </Button>
            </div>
          </div>
        </BaseModal>

        {/* Modal 3: Files List */}
        <BaseModal
          isOpen={isFilesListModalOpen}
          onClose={() => {
            setIsFilesListModalOpen(false);
            setUploadedFiles([]);
          }}
          size="lg"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-medium text-text-primary">
                Adicionar arquivos
              </h2>
              <button
                onClick={() => {
                  setIsFilesListModalOpen(false);
                  setUploadedFiles([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 4H12L14 6H16V16H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="body-sm font-medium text-text-primary">{file.name}</p>
                      <p className="body-xs text-text-secondary">{file.type.toUpperCase()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <button
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".jpg,.jpeg,.png,.pdf";
                  input.multiple = true;
                  input.onchange = (e) => {
                    const files = Array.from((e.target as HTMLInputElement).files || []);
                    handleAddMoreFiles(files);
                  };
                  input.click();
                }}
                className="flex items-center gap-2 text-text-primary hover:text-primary-dark transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Adicionar arquivos
              </button>
              <Button
                onClick={handleAdvance}
                disabled={uploadedFiles.length === 0}
                className="w-auto px-6"
              >
                Avançar
              </Button>
            </div>
          </div>
        </BaseModal>

        {/* Modal 4: Select Base */}
        <BaseModal
          isOpen={isSelectBaseModalOpen}
          onClose={() => {
            setIsSelectBaseModalOpen(false);
            setSelectedBaseForFiles([]);
          }}
          size="xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-medium text-text-primary">
                Em qual Base de Conhecimento você quer adicionar?
              </h2>
              <button
                onClick={() => {
                  setIsSelectBaseModalOpen(false);
                  setSelectedBaseForFiles([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Nome"
                className="w-full h-10 px-4 border border-input-border bg-input-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 max-h-96 overflow-y-auto">
              {bases.map((base) => (
                <button
                  key={base.id}
                  onClick={() => handleToggleBaseSelection(base.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedBaseForFiles.includes(base.id)
                      ? "border-gray-1200 bg-gray-1200 text-white"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-0.5 flex-shrink-0">
                      <path d="M3 5H17V17H3V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 5L10 10L17 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="body-sm font-medium">{base.name}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                onClick={() => {
                  setIsSelectBaseModalOpen(false);
                  setIsCreateModalOpen(true);
                }}
                variant="secondary"
                className="w-auto px-6"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-2">
                  <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Criar nova base
              </Button>
              <Button
                onClick={handleSaveFiles}
                disabled={selectedBaseForFiles.length === 0 && !newBaseId}
                className="w-auto px-6"
              >
                Salvar arquivos
              </Button>
            </div>
          </div>
        </BaseModal>

        {/* Modal 5: Success */}
        <BaseModal
          isOpen={isSuccessModalOpen}
          onClose={() => {
            setIsSuccessModalOpen(false);
            setNewBaseId(null);
          }}
          size="sm"
        >
          <div className="p-8 text-center">
            <button
              onClick={() => {
                setIsSuccessModalOpen(false);
                setNewBaseId(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="mb-6">
              <div className="w-16 h-16 mx-auto rounded-full border-2 border-primary-dark flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M8 16L14 22L24 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <h2 className="font-medium text-text-primary mb-6">
              Concluído
            </h2>

            <Button
              onClick={handleViewBase}
              className="w-auto px-8"
            >
              Visualizar
            </Button>
          </div>
        </BaseModal>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedBase(null);
          }}
          onConfirm={handleDelete}
          title="Excluir Base de Conhecimento"
          message={`Tem certeza que deseja excluir a base "${selectedBase?.name}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          confirmVariant="primary"
        />
      </div>
    </DashboardLayout>
  );
}
