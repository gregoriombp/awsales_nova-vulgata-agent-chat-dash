"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import MemoryBaseIcon from "@/components/memory-base/MemoryBaseIcon";

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

export default function KnowledgeOSSettingsPage() {
  const params = useParams<{ id: string }>();
  const baseId = typeof params?.id === "string" ? params.id : "";
  const baseName = useMemo(() => getBaseName(baseId), [baseId]);

  const breadcrumbs = [
    { label: "Knowledge OS", href: "/knowledge-os", icon: <MemoryBaseIcon /> },
    {
      label: baseName,
      href: `/knowledge-os/${baseId}`,
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
    "Configurações",
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8">
        <div className="bg-white border-b border-[#f2f2f2]">
          <div className="mx-auto max-w-[1544px] px-12 py-8">
            <h3 className="text-[#1a1a1a]">Configurações</h3>
            <p className="mt-2 body-sm text-[#5e5e5e]">
              Configure esta base de conhecimento. As opções desta base estarão disponíveis aqui.
            </p>
          </div>
        </div>

        <div className="bg-white">
          <div className="mx-auto max-w-[1544px] px-12 pt-8 pb-14">
            <div className="rounded-xl border border-[#f2f2f2] bg-[#fbfcfd] p-8 text-center">
              <p className="body-sm text-[#5e5e5e]">As configurações desta base de conhecimento estarão disponíveis em breve.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
