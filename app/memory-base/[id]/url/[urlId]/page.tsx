"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import MemoryBaseIcon from "@/components/MemoryBaseIcon";
import { TbRefresh, TbFile, TbCircleCheck, TbCircleX, TbCloudDataConnection } from "react-icons/tb";

type UrlPageRow = {
  id: string;
  title: string;
  link: string;
  status: "Sincronizando" | "Ativo" | "Inativo";
  knowledgeLayers: number;
  lastUpdate: string;
};

function GlobeIcon20() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M3.5 12h17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 3c3 3 3 15 0 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 3c-3 3-3 15 0 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function GlobeIcon48() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.25" />
      <path d="M3.5 12h17" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M12 3c3 3 3 15 0 18" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M12 3c-3 3-3 15 0 18" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
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

function ExternalLink16() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function UrlResultsPage() {
  const params = useParams<{ id: string; urlId: string }>();
  const searchParams = useSearchParams();
  const title = searchParams.get("title") || "";

  const [rows, setRows] = useState<UrlPageRow[]>(() => {
    // Mock data - initially all "Sincronizando"
    return [
      {
        id: "1",
        title: "Artificial Concord - Projetos Práticos e Criativos com Inteligência Artificial",
        link: "https://artificialconcord.com",
        status: "Sincronizando",
        knowledgeLayers: 0,
        lastUpdate: "—",
      },
      {
        id: "2",
        title: "Blog - Futuro da IA",
        link: "https://artificialconcord.com/blog/2024/future-of-ai",
        status: "Sincronizando",
        knowledgeLayers: 0,
        lastUpdate: "—",
      },
      {
        id: "3",
        title: "Sobre nós",
        link: "https://artificialconcord.com/about",
        status: "Sincronizando",
        knowledgeLayers: 0,
        lastUpdate: "—",
      },
      {
        id: "4",
        title: "Consultoria em IA",
        link: "https://artificialconcord.com/ai-consulting",
        status: "Sincronizando",
        knowledgeLayers: 0,
        lastUpdate: "—",
      },
      {
        id: "5",
        title: "Ética e responsabilidade em IA",
        link: "https://artificialconcord.com/ai-ethics",
        status: "Sincronizando",
        knowledgeLayers: 0,
        lastUpdate: "—",
      },
      {
        id: "6",
        title: "Pesquisa e desenvolvimento em IA",
        link: "https://artificialconcord.com/ai-research",
        status: "Sincronizando",
        knowledgeLayers: 0,
        lastUpdate: "—",
      },
      {
        id: "7",
        title: "Soluções em nuvem com IA",
        link: "https://artificialconcord.com/ai-cloud",
        status: "Sincronizando",
        knowledgeLayers: 0,
        lastUpdate: "—",
      },
      {
        id: "8",
        title: "Robótica com IA",
        link: "https://artificialconcord.com/ai-robots",
        status: "Sincronizando",
        knowledgeLayers: 0,
        lastUpdate: "—",
      },
      {
        id: "9",
        title: "Algoritmos de IA",
        link: "https://artificialconcord.com/ai-algorithms",
        status: "Sincronizando",
        knowledgeLayers: 0,
        lastUpdate: "—",
      },
      {
        id: "10",
        title: "Laboratório de inovação em IA",
        link: "https://artificialconcord.com/ai-innovation",
        status: "Sincronizando",
        knowledgeLayers: 0,
        lastUpdate: "—",
      },
    ];
  });

  // Simulate gradual status transitions
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    const initialRowIds = rows.map((r) => r.id);

    initialRowIds.forEach((rowId) => {
      // Each row transitions at a different time (between 2-8 seconds)
      const delay = 2000 + Math.random() * 6000;
      const timer = setTimeout(() => {
        setRows((prev) =>
          prev.map((r) => {
            if (r.id === rowId && r.status === "Sincronizando") {
              // Randomly assign "Ativo" or "Inativo" after sync
              const shouldBeActive = Math.random() > 0.3; // 70% chance of being active
              const layers = Math.floor(8 + Math.random() * 50);
              const now = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
              return {
                ...r,
                status: shouldBeActive ? "Ativo" : "Inativo",
                knowledgeLayers: shouldBeActive ? layers : 0,
                lastUpdate: now,
              };
            }
            return r;
          })
        );
      }, delay);

      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []); // Only run once on mount

  const directoryName = useMemo(() => {
    const raw = typeof params?.id === "string" ? params.id : "";
    const decoded = raw ? decodeURIComponent(raw) : "";
    const normalized = decoded.replace(/[-_]+/g, " ").trim();
    if (!normalized || normalized.length < 12) return "História da Marca Artificial Concord";
    return normalized
      .split(" ")
      .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
  }, [params?.id]);

  const websiteUrl = useMemo(() => {
    const raw = typeof params?.urlId === "string" ? params.urlId : "";
    return raw ? decodeURIComponent(raw) : "";
  }, [params?.urlId]);

  const breadcrumbs = useMemo(() => {
    const id = typeof params?.id === "string" ? params.id : "";
    return [
      {
        label: "Memory Base",
        href: "/memory-base",
        icon: <MemoryBaseIcon />,
      },
      {
        label: directoryName,
        href: id ? `/memory-base/${id}` : undefined,
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
      {
        label: websiteUrl || "URL",
        icon: <GlobeIcon20 />,
      },
    ];
  }, [params?.id, directoryName, websiteUrl]);

  const getStatusBadge = (status: UrlPageRow["status"]) => {
    if (status === "Sincronizando") {
      return (
        <span className="inline-flex items-center justify-center px-6 py-1 rounded-[32px] bg-[#e5e5e5] text-[10px] font-medium text-[#5e5e5e]">
          {status}
        </span>
      );
    }
    if (status === "Ativo") {
      return (
        <span className="inline-flex items-center justify-center px-6 py-1 rounded-[32px] bg-[#ddf7e5] text-[10px] font-medium text-[#105e45]">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-6 py-1 rounded-[32px] bg-[#ffe5e5] text-[10px] font-medium text-[#8b1a1a]">
        {status}
      </span>
    );
  };

  const activeCount = rows.filter((r) => r.status === "Ativo").length;
  const inactiveCount = rows.filter((r) => r.status === "Inativo").length;
  const syncingCount = rows.filter((r) => r.status === "Sincronizando").length;

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      {/* Override DashboardLayout padding/background */}
      <div className="-m-8">
        {/* Header area */}
        <div className="bg-white border-b border-[#f2f2f2]">
          <div className="mx-auto max-w-[1544px] px-12 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-[#1a1a1a]">
                  <GlobeIcon48 />
                </div>
                <div className="text-[40px] font-medium text-[#1a1a1a] leading-none">
                  {title || websiteUrl}
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#e5e5e5] text-[#5e5e5e] hover:text-[#1a1a1a] hover:bg-[#f9f9f9] transition-colors"
                aria-label="Atualizar"
                title="Atualizar"
              >
                <TbRefresh className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3 text-[14px] text-[#5e5e5e]">
              <div className="flex items-center gap-1.5 pr-3 border-r border-[#d1d1d1]">
                <TbFile className="w-4 h-4 text-[#999]" />
                <span>{rows.length} Página{rows.length !== 1 ? "s" : ""}</span>
              </div>
              {activeCount > 0 && (
                <div className="flex items-center gap-1.5 pr-3 border-r border-[#d1d1d1]">
                  <TbCircleCheck className="w-4 h-4 text-[#22c55e]" />
                  <span>{activeCount} Ativo{activeCount !== 1 ? "s" : ""}</span>
                </div>
              )}
              {inactiveCount > 0 && (
                <div className="flex items-center gap-1.5 pr-3 border-r border-[#d1d1d1]">
                  <TbCircleX className="w-4 h-4 text-[#ef4444]" />
                  <span>{inactiveCount} Inativo{inactiveCount !== 1 ? "s" : ""}</span>
                </div>
              )}
              {syncingCount > 0 && (
                <div className="flex items-center gap-1.5 pr-3 border-r border-[#d1d1d1]">
                  <span className="w-3 h-3 border-2 border-[#999] border-t-transparent rounded-full animate-spin" />
                  <span>{syncingCount} Sincronizando</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <TbCloudDataConnection className="w-4 h-4 text-[#0066cc]" />
                <span className="text-[#0066cc]">Sincronização em tempo real</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white">
          <div className="mx-auto max-w-[1544px] px-12 pt-10 pb-14">
            {/* Table */}
            <div className="border border-[#f2f2f2] rounded-[20px] pt-4 overflow-hidden bg-white">
              {/* Header row */}
              <div className="border-b border-[#f2f2f2] pb-2 px-6 flex items-center">
                <div className="flex-1 min-w-0 py-2 text-[12px] text-[#999999] font-medium">
                  Título
                </div>
                <div className="w-[140px] py-2 text-[12px] text-[#999999] font-medium">
                  Knowledge Layers
                </div>
                <div className="w-[140px] py-2 text-[12px] text-[#999999] font-medium">
                  Última atualização
                </div>
                <div className="w-[100px] py-2 text-[12px] text-[#999999] font-medium text-right">
                  Status
                </div>
              </div>

              {/* Body rows */}
              <div>
                {rows.map((row) => (
                  <div
                    key={row.id}
                    className="border-b border-[#f2f2f2] px-6 py-3 flex items-center transition-colors hover:bg-[#fbfcfd] last:border-b-0"
                  >
                    <div className="flex-1 min-w-0 py-1">
                      <div className="text-[12px] font-medium text-[#0d0d0d] leading-normal">
                        {row.title}
                      </div>
                      <a
                        href={row.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#0066cc] hover:text-[#0052a3] hover:underline flex items-center gap-1 mt-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="truncate">{row.link}</span>
                        <ExternalLink16 />
                      </a>
                    </div>
                    <div className="w-[140px] py-1 flex items-center gap-2 text-[12px] text-[#5e5e5e]">
                      {row.status === "Sincronizando" ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-[#999] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          <span className="text-[#999]">Extraindo...</span>
                        </>
                      ) : row.knowledgeLayers > 0 ? (
                        <>
                          <Layers16 />
                          <span>{row.knowledgeLayers} itens</span>
                        </>
                      ) : (
                        <span className="text-[#999]">—</span>
                      )}
                    </div>
                    <div className="w-[140px] py-1 text-[12px] text-[#5e5e5e]">
                      {row.lastUpdate}
                    </div>
                    <div className="w-[100px] py-1 flex items-center justify-end">
                      {getStatusBadge(row.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
