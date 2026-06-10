"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";
import { AwToggleRow } from "@/components/ui/AwToggle";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/AwToast";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import MemoryBaseIcon from "@/components/memory-base/MemoryBaseIcon";
import { getOrbForAgent } from "@/lib/agentOrbs";
import {
  MEMORY_BASES_STORAGE_KEY,
  updateMemoryBase,
  deleteMemoryBase,
} from "@/lib/memory-base/create";
import { MOCK_KNOWLEDGE_BASES } from "@/components/memory-base/knowledgeBases";
import { cn } from "@/lib/utils";

/**
 * Configurações da base (/memory-base/[id]/settings) — identidade, classificação,
 * agentes conectados e exclusão. Era a rota morta apontada pelo tab "Configurações"
 * do detalhe. Persistência client-side (repo é preview de UX): bases criadas
 * gravam no localStorage; bases mock aceitam edição em sessão.
 */

const OBJETIVOS = [
  { id: "Vendas", icon: "attach_money" },
  { id: "Onboarding", icon: "door_open" },
  { id: "Suporte e Atendimento", icon: "headset_mic" },
  { id: "CS / Lançamento", icon: "star" },
  { id: "Captação de Lead", icon: "ads_click" },
];

const SEGMENTOS = [
  { id: "Educação", icon: "school" },
  { id: "Produto físico", icon: "inventory_2" },
  { id: "Serviços", icon: "handshake" },
];

const TIPOS_DADOS = [
  { id: "Documentação", icon: "description" },
  { id: "Catálogo", icon: "database" },
];

/** Agentes conectados — mesmo mock do detalhe da base (placeholder até integração). */
const CONNECTED_AGENTS = [
  { id: "1", name: "Atendimento ao Cliente", objectiveBoundLayers: 12 },
  { id: "2", name: "Vendas Interno", objectiveBoundLayers: 8 },
  { id: "3", name: "Suporte Técnico", objectiveBoundLayers: 5 },
  { id: "4", name: "Onboarding", objectiveBoundLayers: 3 },
];

type BaseSnapshot = {
  name: string;
  objetivo: string;
  segmento: string;
  tipoDados: string;
  active: boolean;
};

/** Carrega a base do localStorage (criadas) ou do mock, com fallback neutro. */
function loadBase(id: string): BaseSnapshot {
  const fallback: BaseSnapshot = {
    name: "Base de conhecimento",
    objetivo: "",
    segmento: "",
    tipoDados: "",
    active: true,
  };
  if (typeof window === "undefined" || !id) return fallback;
  try {
    const raw = window.localStorage.getItem(MEMORY_BASES_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const created = Array.isArray(list)
      ? list.find((b) => b && b.id === id)
      : null;
    if (created) {
      return {
        name: created.name || fallback.name,
        objetivo: created.objetivo || "",
        segmento: created.segmento || "",
        tipoDados: created.tipoDados || "",
        active: created.status !== "inactive",
      };
    }
    const mock = MOCK_KNOWLEDGE_BASES.find((b) => b.id === id);
    if (mock) {
      return {
        name: window.localStorage.getItem(`memory-base-name-${id}`) || mock.name,
        objetivo: mock.objetivo,
        segmento: mock.segmento,
        tipoDados: mock.tipoDados,
        active: mock.status === "ativo",
      };
    }
    return {
      ...fallback,
      name: window.localStorage.getItem(`memory-base-name-${id}`) || fallback.name,
    };
  } catch {
    return fallback;
  }
}

export default function MemoryBaseSettingsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();
  const baseId = typeof params?.id === "string" ? params.id : "";

  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState<BaseSnapshot | null>(null);
  const [name, setName] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [segmento, setSegmento] = useState("");
  const [tipoDados, setTipoDados] = useState("");
  const [active, setActive] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const snapshot = loadBase(baseId);
    setSaved(snapshot);
    setName(snapshot.name);
    setObjetivo(snapshot.objetivo);
    setSegmento(snapshot.segmento);
    setTipoDados(snapshot.tipoDados);
    setActive(snapshot.active);
    setLoaded(true);
  }, [baseId]);

  const dirty = useMemo(() => {
    if (!saved) return false;
    return (
      name.trim() !== saved.name ||
      objetivo !== saved.objetivo ||
      segmento !== saved.segmento ||
      tipoDados !== saved.tipoDados ||
      active !== saved.active
    );
  }, [saved, name, objetivo, segmento, tipoDados, active]);

  const handleSave = () => {
    if (!dirty || !name.trim()) return;
    updateMemoryBase(baseId, {
      name: name.trim(),
      objetivo,
      segmento,
      tipoDados,
      status: active ? "active" : "inactive",
    });
    setSaved({ name: name.trim(), objetivo, segmento, tipoDados, active });
    push({
      variant: "success",
      title: "Configurações salvas",
      description: "As alterações já valem para os agentes conectados.",
    });
  };

  const handleDelete = () => {
    deleteMemoryBase(baseId);
    setConfirmDelete(false);
    router.push("/memory-base");
  };

  return (
    <AwDashboardLayout
      breadcrumbs={[
        { label: "Memory Base", href: "/memory-base", icon: <MemoryBaseIcon /> },
        {
          label: saved?.name ?? "Base de conhecimento",
          href: `/memory-base/${baseId}`,
          icon: <Icon name="account_balance" size={16} weight={300} />,
        },
        "Configurações",
      ]}
    >
      <div className="mx-auto w-full max-w-[880px] pb-24">
        {/* Topo — voltar + título + salvar */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/memory-base/${baseId}`} className="no-underline">
              <span className="mb-2 inline-flex items-center gap-1.5 text-sm text-(--fg-secondary) transition-colors hover:text-(--fg-primary)">
                <Icon name="arrow_back" size={16} /> Voltar
              </span>
            </Link>
            <h1 className="flex items-center gap-2.5 text-3xl font-semibold tracking-tight">
              <Icon name="settings" size={28} weight={300} />
              Configurações
            </h1>
            <p className="mt-2 text-sm text-(--fg-secondary)">
              Identidade, classificação e agentes desta base de conhecimento.
            </p>
          </div>
          <AwButton
            variant="primary"
            className="w-auto"
            iconLeft="check"
            disabled={!dirty || !name.trim()}
            onClick={handleSave}
          >
            Salvar alterações
          </AwButton>
        </div>

        {loaded && (
          <div className="mt-10 flex flex-col gap-10">
            {/* Identidade */}
            <Section
              title="Identidade"
              description="Nome exibido na lista de bases, nos breadcrumbs e para os agentes."
            >
              <div className="flex max-w-[480px] flex-col gap-5">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Nome da base</span>
                  <AwInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex.: Brandbook da Marca"
                    invalid={!name.trim()}
                  />
                  {!name.trim() && (
                    <span className="text-[12px] text-(--accent-danger)">
                      A base precisa de um nome.
                    </span>
                  )}
                </label>
                <AwToggleRow
                  title={active ? "Base ativa" : "Base inativa"}
                  description="Bases inativas deixam de ser consultadas pelos agentes, sem perder o conteúdo."
                  checked={active}
                  onChange={setActive}
                />
              </div>
            </Section>

            {/* Classificação */}
            <Section
              title="Classificação"
              description="Orienta como os agentes priorizam esta base ao responder."
            >
              <div className="flex flex-col gap-6">
                <ChoiceGroup
                  label="Objetivo"
                  options={OBJETIVOS}
                  value={objetivo}
                  onChange={setObjetivo}
                />
                <ChoiceGroup
                  label="Segmento"
                  options={SEGMENTOS}
                  value={segmento}
                  onChange={setSegmento}
                />
                <ChoiceGroup
                  label="Tipo de dados"
                  options={TIPOS_DADOS}
                  value={tipoDados}
                  onChange={setTipoDados}
                />
              </div>
            </Section>

            {/* Agentes conectados */}
            <Section
              title="Agentes conectados"
              description="Agentes que consultam esta base em conversas. A conexão é gerenciada no Agent Studio."
            >
              <div className="overflow-hidden rounded-2xl border border-(--border-default)">
                {CONNECTED_AGENTS.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-3 border-b border-(--border-subtle) bg-(--bg-raised) px-4 py-3 last:border-0"
                  >
                    <img
                      src={getOrbForAgent(agent.id)}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="flex-1 truncate text-sm font-medium">{agent.name}</span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-md bg-(--bg-muted) px-2 py-0.5 text-[11px] font-medium text-(--fg-secondary)"
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
                  </div>
                ))}
              </div>
              <AwButton asChild variant="secondary" size="sm" className="mt-3 w-auto" iconRight="arrow_forward">
                <Link href="/agent-studio" className="no-underline">
                  Gerenciar no Agent Studio
                </Link>
              </AwButton>
            </Section>

            {/* Exclusão */}
            <Section
              title="Excluir base"
              description="A base, as fontes e os Knowledge Layers extraídos saem do ar para todos os agentes. Essa ação não pode ser desfeita."
              danger
            >
              <AwButton
                variant="danger"
                className="w-auto"
                iconLeft="delete"
                onClick={() => setConfirmDelete(true)}
              >
                Excluir base
              </AwButton>
            </Section>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Excluir base de conhecimento?"
        message={`“${saved?.name ?? "Esta base"}” e todo o conteúdo extraído dela deixarão de existir para os agentes conectados. Essa ação não pode ser desfeita.`}
        confirmText="Excluir base"
        cancelText="Cancelar"
        confirmVariant="danger"
      />
    </AwDashboardLayout>
  );
}

/* ── Seção de configurações ───────────────────────────────────────────────── */
function Section({
  title,
  description,
  danger,
  children,
}: {
  title: string;
  description: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-6",
        !danger && "border-(--border-subtle)",
      )}
      style={
        danger
          ? { borderColor: "color-mix(in srgb, var(--accent-danger) 40%, transparent)" }
          : undefined
      }
    >
      <h2
        className={cn(
          "text-base font-semibold tracking-tight",
          danger && "text-(--accent-danger)",
        )}
      >
        {title}
      </h2>
      <p className="mt-1 max-w-[560px] text-[13px] leading-relaxed text-(--fg-tertiary)">
        {description}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* ── Grupo de escolha única (pills com ícone) ─────────────────────────────── */
function ChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; icon: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const selected = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? "" : o.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors",
                selected
                  ? "border-(--fg-primary) bg-(--fg-primary) text-(--bg-raised)"
                  : "border-(--border-default) bg-(--bg-raised) text-(--fg-secondary) hover:border-(--border-strong) hover:text-(--fg-primary)",
              )}
            >
              <Icon name={o.icon} size={16} weight={300} />
              {o.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}
