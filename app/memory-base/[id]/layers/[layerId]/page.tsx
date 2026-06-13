"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";
import { AwToggle } from "@/components/ui/AwToggle";
import { AwDropzone } from "@/components/ui/AwDropzone";
import MemoryBaseIcon from "@/components/memory-base/MemoryBaseIcon";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/AwToast";
import { getKnowledgeLayer } from "@/components/memory-base/knowledgeLayers";
import { MOCK_KNOWLEDGE_BASES } from "@/components/memory-base/knowledgeBases";

/**
 * Edição de Knowledge Layer (Tela 10 · seção "Editar Knowledge Layer" do flow do
 * Figma) — página irmã do detalhe da base, acessada pela aba Playbook → Visualizar
 * → Editar. Pergunta + Resposta + Status + dropzone de fontes. As mudanças são
 * decorativas (repo é preview de UX, sem backend).
 */

function getBaseName(id: string): string {
  if (typeof window === "undefined" || !id) return "Base de conhecimento";
  try {
    return (
      window.localStorage.getItem(`memory-base-name-${id}`) ||
      MOCK_KNOWLEDGE_BASES.find((b) => b.id === id)?.name ||
      "Base de conhecimento"
    );
  } catch {
    return "Base de conhecimento";
  }
}

export default function EditKnowledgeLayerPage() {
  const params = useParams<{ id: string; layerId: string }>();
  const { push } = useToast();
  const baseId = typeof params?.id === "string" ? params.id : "";
  const layerId = typeof params?.layerId === "string" ? params.layerId : "";

  const layer = useMemo(() => getKnowledgeLayer(layerId), [layerId]);

  const [pergunta, setPergunta] = useState(layer?.pergunta ?? "");
  const [resposta, setResposta] = useState(layer?.resposta ?? "");
  const [ativo, setAtivo] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [baseName, setBaseName] = useState("Base de conhecimento");

  useEffect(() => {
    setBaseName(getBaseName(baseId));
  }, [baseId]);

  // Reidrata os campos quando a layer resolve (caso o param mude no cliente).
  useEffect(() => {
    if (layer) {
      setPergunta(layer.pergunta);
      setResposta(layer.resposta);
    }
  }, [layer]);

  const markDirty = () => setDirty(true);

  return (
    <AwDashboardLayout
      breadcrumbs={[
        { label: "Memory Base", href: "/memory-base", icon: <MemoryBaseIcon /> },
        {
          label: baseName,
          href: `/memory-base/${baseId}`,
          icon: <Icon name="account_balance" size={16} weight={300} />,
        },
        "Edição de Knowledge Layer",
      ]}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/memory-base/${baseId}`} className="no-underline">
              <span className="mb-2 inline-flex items-center gap-1.5 text-sm text-(--fg-secondary) hover:text-(--fg-primary)">
                <Icon name="arrow_back" size={16} /> Voltar
              </span>
            </Link>
            <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
              <Icon name="layers" size={26} /> Edição de Knowledge Layer
            </h1>
          </div>
          <AwButton
            variant="primary"
            className="w-auto"
            disabled={!dirty}
            iconLeft="check"
            onClick={() => {
              setDirty(false);
              push({
                variant: "success",
                title: "Knowledge Layer atualizado",
                description: "As alterações já valem para os agentes que usam esta base.",
              });
            }}
          >
            Salvar alterações
          </AwButton>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Coluna esquerda: form */}
          <div className="flex flex-col gap-6">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Pergunta</span>
              <AwInput
                value={pergunta}
                onChange={(e) => {
                  setPergunta(e.target.value);
                  markDirty();
                }}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Resposta</span>
              <textarea
                value={resposta}
                onChange={(e) => {
                  setResposta(e.target.value);
                  markDirty();
                }}
                rows={6}
                className="w-full resize-y rounded-xl border border-(--border-default) bg-(--bg-raised) px-3 py-2 text-sm leading-relaxed text-(--fg-primary) outline-none placeholder:text-(--fg-tertiary) focus:border-(--border-strong)"
              />
              <span className="text-2xs text-(--fg-tertiary)">
                Digite {"{}"} para ver as variáveis disponíveis.
              </span>
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Status</span>
              <AwToggle
                checked={ativo}
                onChange={(next) => {
                  setAtivo(next);
                  markDirty();
                }}
                label={ativo ? "Ativo" : "Inativo"}
              />
            </div>
          </div>

          {/* Coluna direita: dropzone */}
          <div className="flex flex-col gap-3">
            <AwDropzone
              accept=".jpg,.jpeg,.png,.pdf"
              title="Arraste e solte arquivos aqui"
              hint="JPG, PNG ou PDF · até 10 MB"
              onChange={markDirty}
            />
          </div>
        </div>
      </div>
    </AwDashboardLayout>
  );
}
