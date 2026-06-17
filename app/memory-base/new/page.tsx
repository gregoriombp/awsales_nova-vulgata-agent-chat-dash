"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AwButton } from "@/components/ui/AwButton";
import { AwMemoryBaseLogo } from "@/components/ui/AwMemoryBaseLogo";
import { Icon } from "@/components/ui/Icon";
import { createMemoryBase, updateMemoryBase } from "@/lib/memory-base/create";
import { ProdutosStep } from "@/components/memory-base/wizard/ProdutosStep";
import { CatalogoStep } from "@/components/memory-base/wizard/CatalogoStep";
import { PlaybookStep } from "@/components/memory-base/wizard/PlaybookStep";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────
 * Fluxo de criação da Memory Base — full-screen cinematográfico (/memory-base/new).
 *
 * A base nasce no passo "name" (botão Criar) e a celebração mostra que ela já
 * existe. "Configurar" então abre a classificação — objetivo → segmento → envio —
 * que faz patch na base recém-criada, e segue pras fontes (produtos/catálogo) e
 * playbook. As escolhas são decorativas (repo é preview de UX, sem backend);
 * ver docs/memory-base-creation-wizard.md.
 *
 *   name      → input do nome + Criar               (Tela 02)
 *   created   → celebração + "Configurar" em fade   (Tela 03)
 *   objetivo  → 5 cards                              (Tela 04/05)
 *   segmento  → 3 cards
 *   envio     → Padrão / Catálogo                    (Tela 06/07)
 *   fontes    → Produtos (Padrão) | Catálogo (CSV)   (Tela 06 ramo / Tela 07)
 *   playbook  → fontes do playbook + "Criar base"    (Tela 08)
 *   building  → "Construindo sua base…"              (Tela 09)
 *   → /memory-base/[id]?new=1
 * ───────────────────────────────────────────────────────────────────────── */

type Phase =
  | "name"
  | "created"
  | "objetivo"
  | "segmento"
  | "envio"
  | "fontes"
  | "playbook"
  | "building";

type Opt = { id: string; icon: string };

const OBJETIVOS: Opt[] = [
  { id: "Vendas", icon: "attach_money" },
  { id: "Onboarding", icon: "door_open" },
  { id: "Suporte e Atendimento", icon: "headset_mic" },
  { id: "CS / Lançamento", icon: "star" },
  { id: "Captação de Lead", icon: "ads_click" },
];

const SEGMENTOS: Opt[] = [
  { id: "Educação", icon: "school" },
  { id: "Produto físico", icon: "inventory_2" },
  { id: "Serviços", icon: "handshake" },
];

const ENVIOS = [
  {
    id: "Padrão",
    desc: "Indicada para quando os dados dos produtos são enviados individualmente, por meio de links e documentos específicos para cada item. Nesse formato, as informações são estruturadas produto a produto.",
  },
  {
    id: "Catálogo",
    desc: "Indicada para quando os dados dos produtos são enviados de forma estruturada, por meio de arquivo CSV ou integração. Nesse formato, as informações são organizadas em lote, seguindo uma estrutura padronizada de dados.",
  },
] as const;

export default function CreateMemoryBasePage() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("name");
  const [baseId, setBaseId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [segmento, setSegmento] = useState("");
  const [envio, setEnvio] = useState("");

  const nameOk = name.trim().length > 0;

  // Passo "name" → cria a base e cai na celebração.
  const handleCriar = () => {
    if (!nameOk || baseId) return;
    const id = createMemoryBase({
      name: name.trim(),
      objetivo: "",
      segmento: "",
      tipoDados: "",
    });
    setBaseId(id);
    setPhase("created");
  };

  // Playbook concluído → fase de construção; o redirect acontece quando a
  // sequência de mensagens termina (BuildingStep → onDone).
  const finish = () => {
    if (!baseId) return;
    updateMemoryBase(baseId, {
      objetivo,
      segmento,
      tipoDados: envio === "Catálogo" ? "Catálogo" : "Documentação",
    });
    router.prefetch(`/memory-base/${baseId}`);
    setPhase("building");
  };

  const openBase = () => {
    if (!baseId) return;
    // replace: voltar da base não deve cair de novo na tela de construção.
    router.replace(`/memory-base/${baseId}?new=1&name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-(--bg-raised)">
      {/* Fechar — volta pra lista. A base criada (se houver) já está salva.
          Some durante a construção: a saída é o redirect pra própria base. */}
      {phase !== "building" && (
        <button
          type="button"
          onClick={() => router.push("/memory-base")}
          aria-label="Fechar"
          className="absolute right-6 top-6 z-10 flex h-9 w-9 items-center justify-center rounded-full text-(--fg-tertiary) transition-colors hover:bg-(--bg-hover) hover:text-(--fg-secondary)"
        >
          <Icon name="close" size={20} />
        </button>
      )}

      {/* key={phase} re-dispara a entrada suave (.aw-wizard-step) a cada troca. */}
      <main key={phase} className="aw-wizard-step flex flex-1 flex-col items-center justify-center overflow-y-auto px-8 py-16">
        {phase === "name" && (
          <NameStep name={name} setName={setName} canCreate={nameOk} onCreate={handleCriar} />
        )}

        {phase === "created" && (
          <CreatedStep name={name.trim()} onConfigure={() => setPhase("objetivo")} />
        )}

        {phase === "objetivo" && (
          <ChoiceStep
            title="Qual o objetivo da sua base de conhecimento?"
            subtitle="Defina o objetivo principal para começar a configurar a base de conhecimento."
            options={OBJETIVOS}
            value={objetivo}
            onChange={setObjetivo}
            onBack={() => setPhase("created")}
            onNext={() => setPhase("segmento")}
          />
        )}

        {phase === "segmento" && (
          <ChoiceStep
            title="Qual o tipo de segmento?"
            subtitle="Escolha o segmento de negócio que melhor descreve a sua base de conhecimento."
            options={SEGMENTOS}
            value={segmento}
            onChange={setSegmento}
            onBack={() => setPhase("objetivo")}
            onNext={() => setPhase("envio")}
          />
        )}

        {phase === "envio" && (
          <EnvioStep
            value={envio}
            onChange={setEnvio}
            onBack={() => setPhase("segmento")}
            onNext={() => setPhase("fontes")}
          />
        )}

        {/* Etapa 5 — ramificada pela escolha de envio: Catálogo (CSV) ou Produtos. */}
        {phase === "fontes" &&
          (envio === "Catálogo" ? (
            <CatalogoStep onBack={() => setPhase("envio")} onNext={() => setPhase("playbook")} />
          ) : (
            <ProdutosStep onBack={() => setPhase("envio")} onNext={() => setPhase("playbook")} />
          ))}

        {/* Etapa 6 — Playbook; "Criar base" dispara a construção. */}
        {phase === "playbook" && (
          <PlaybookStep onBack={() => setPhase("fontes")} onNext={finish} />
        )}

        {/* Tela 09 — construção da base; ao terminar, abre a base recém-criada. */}
        {phase === "building" && <BuildingStep onDone={openBase} />}
      </main>
    </div>
  );
}

/* ── Tela 09 — Construindo a base ─────────────────────────────────────────────
 * Momento de "processamento" entre o wizard e a base: logo animado sobre um
 * glow azul + mensagens que avançam em sequência. Sem barra de progresso —
 * a sequência é curta e o tempo é fixo. */

const BUILDING_MESSAGES = [
  "Organizando as fontes enviadas…",
  "Extraindo Knowledge Layers…",
  "Conectando integrações e agentes…",
  "Preparando a base para conversas…",
];

const BUILDING_MESSAGE_MS = 1050;

function BuildingStep({ onDone }: { onDone: () => void }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (msgIndex >= BUILDING_MESSAGES.length - 1) {
      // Última mensagem respira um pouco mais antes do redirect.
      const t = window.setTimeout(onDone, BUILDING_MESSAGE_MS + 450);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setMsgIndex((i) => i + 1), BUILDING_MESSAGE_MS);
    return () => window.clearTimeout(t);
  }, [msgIndex, onDone]);

  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center">
      {/* CSS local da feature — globals.css não recompila no dev server do time. */}
      <style>{`
        @keyframes mbnew-msg-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mbnew-msg {
          animation: mbnew-msg-in var(--dur-slow) var(--ease-out) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .mbnew-msg { animation: none; }
        }
      `}</style>

      {/* Glow azul — mesmo tratamento da busca semântica, centrado no logo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{
          background:
            "radial-gradient(34% 42% at 50% 44%, color-mix(in srgb, var(--aw-blue-300) 34%, transparent) 0%, color-mix(in srgb, var(--aw-blue-150) 26%, transparent) 55%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(34% 42% at 50% 44%, color-mix(in srgb, var(--aw-blue-800) 30%, transparent) 0%, color-mix(in srgb, var(--aw-blue-1100) 26%, transparent) 58%, transparent 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <AwMemoryBaseLogo size={140} className="text-(--fg-primary)" />
        <h1 className="mt-10 font-heading text-[28px] font-medium tracking-heading text-(--fg-primary)">
          Construindo sua base de conhecimento
        </h1>
        {/* Altura fixa: a troca de mensagem não move o layout. */}
        <div className="mt-3 flex h-6 items-center justify-center">
          <p key={msgIndex} className="mbnew-msg text-base text-(--fg-secondary)">
            {BUILDING_MESSAGES[msgIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Ícone-marca da base (quadrado preto + colunas) ───────────────────────── */
function BaseGlyph({ size = 112 }: { size?: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-[28px] bg-(--fg-primary) text-(--bg-raised) shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]"
      style={{ width: size, height: size }}
    >
      <Icon name="account_balance" size={size * 0.46} weight={300} />
    </span>
  );
}

/* ── Passo 1 — Nome ───────────────────────────────────────────────────────── */
function NameStep({
  name,
  setName,
  canCreate,
  onCreate,
}: {
  name: string;
  setName: (v: string) => void;
  canCreate: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="flex w-full max-w-[640px] flex-col items-center text-center">
      <BaseGlyph />
      <h1 className="mt-10 font-heading text-[34px] font-medium leading-tight tracking-heading text-(--fg-primary)">
        Sua primeira Base de Conhecimento
      </h1>
      <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-(--fg-secondary)">
        É o momento perfeito para enriquecer sua base com arquivos, sites,
        trechos, integrações e muito mais.
      </p>

      <div className="mt-10 flex w-full max-w-[600px] items-center gap-3">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canCreate) {
              e.preventDefault();
              onCreate();
            }
          }}
          placeholder="Ex: Brandbook da Marca"
          className="h-[46px] flex-1 rounded-xl border border-(--border-default) bg-(--bg-raised) px-4 text-base text-(--fg-primary) outline-hidden transition-colors placeholder:text-(--fg-tertiary) focus:border-(--fg-primary)"
        />
        <AwButton variant="primary" size="lg" className="w-auto" onClick={onCreate} disabled={!canCreate}>
          Criar
        </AwButton>
      </div>
    </div>
  );
}

/* ── Passo 2 — Base criada (celebração) ───────────────────────────────────── */
function CreatedStep({ name, onConfigure }: { name: string; onConfigure: () => void }) {
  const [showCta, setShowCta] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setShowCta(true), 1300);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center text-center">
      <BaseGlyph />
      <p className="mt-8 text-[20px] font-medium tracking-heading text-(--fg-primary)">{name}</p>

      {/* Reservar a altura do botão evita o "pulo" do layout quando ele aparece. */}
      <div className="mt-10 flex h-[46px] items-center">
        {showCta && (
          <AwButton variant="primary" size="lg" className="mb-reveal-up w-auto" onClick={onConfigure}>
            Configurar
          </AwButton>
        )}
      </div>
    </div>
  );
}

/* ── Passos de escolha (objetivo / segmento) ──────────────────────────────── */
function ChoiceStep({
  title,
  subtitle,
  options,
  value,
  onChange,
  onBack,
  onNext,
}: {
  title: string;
  subtitle: string;
  options: Opt[];
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex w-full max-w-[1080px] flex-col">
      <h1 className="font-heading text-[30px] font-medium tracking-heading text-(--fg-primary)">{title}</h1>
      <p className="mt-2 text-base text-(--fg-tertiary)">{subtitle}</p>

      <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((o) => {
          const selected = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={cn(
                "flex h-[150px] flex-col items-center justify-center gap-4 rounded-2xl border text-center transition-colors",
                selected
                  ? "border-(--fg-primary) bg-(--fg-primary) text-(--bg-raised)"
                  : "border-(--border-subtle) bg-(--bg-canvas) text-(--fg-primary) hover:border-(--border-default) hover:bg-(--bg-hover)",
              )}
            >
              <Icon name={o.icon} size={26} weight={300} />
              <span className="text-[16px] font-medium">{o.id}</span>
            </button>
          );
        })}
      </div>

      <StepFooter onBack={onBack} onNext={onNext} canNext={!!value} />
    </div>
  );
}

/* ── Passo de envio (Padrão / Catálogo) ───────────────────────────────────── */
function EnvioStep({
  value,
  onChange,
  onBack,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex w-full max-w-[1080px] flex-col">
      <h1 className="font-heading text-[30px] font-medium tracking-heading text-(--fg-primary)">
        Como os dados dos seus produtos serão enviados?
      </h1>
      <p className="mt-2 text-base text-(--fg-tertiary)">
        Escolha como os dados dos seus produtos serão enviados para a base de conhecimento.
      </p>

      <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2">
        {ENVIOS.map((o) => {
          const selected = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={cn(
                "flex h-[380px] flex-col rounded-2xl border p-8 text-left transition-colors",
                selected
                  ? "border-(--fg-primary) bg-(--fg-primary) text-(--bg-raised)"
                  : "border-(--border-subtle) bg-(--bg-canvas) text-(--fg-primary) hover:border-(--border-default)",
              )}
            >
              <div className="flex flex-1 items-center justify-center">
                {o.id === "Padrão" ? <PadraoGlyph /> : <CatalogoGlyph />}
              </div>
              <div>
                <h2 className="text-[22px] font-medium tracking-heading">{o.id}</h2>
                <p className={cn("mt-2 text-[13.5px] leading-relaxed", selected ? "opacity-80" : "text-(--fg-tertiary)")}>
                  {o.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <StepFooter onBack={onBack} onNext={onNext} canNext={!!value} />
    </div>
  );
}

/* ── Rodapé Voltar / Avançar ──────────────────────────────────────────────── */
function StepFooter({
  onBack,
  onNext,
  canNext,
}: {
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
}) {
  return (
    <div className="mt-10 flex items-center justify-between">
      <AwButton variant="secondary" iconLeft="chevron_left" className="w-auto" onClick={onBack}>
        Voltar
      </AwButton>
      <AwButton variant="primary" className="w-auto" onClick={onNext} disabled={!canNext}>
        Avançar
      </AwButton>
    </div>
  );
}

/* ── Glyph "Padrão" — estrela de 8 raios com gradiente de fade ────────────── */
function PadraoGlyph() {
  const rays = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden>
      <g className="mb-glyph-spin" style={{ transformOrigin: "60px 60px" }}>
        {rays.map((deg, i) => (
          <line
            key={deg}
            x1="60"
            y1="14"
            x2="60"
            y2="50"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            transform={`rotate(${deg} 60 60)`}
            style={{ opacity: 1 - i * 0.1 }}
          />
        ))}
      </g>
    </svg>
  );
}

/* ── Glyph "Catálogo" — funil de elipses empilhadas em perspectiva ────────── */
function CatalogoGlyph() {
  const n = 16;
  const ellipses = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return {
      cx: 36 + t * 64,
      cy: 30 + t * 56,
      rx: 46 * (1 - 0.82 * t),
      ry: 28 * (1 - 0.82 * t),
      opacity: 0.9 - 0.6 * t,
    };
  });
  return (
    <svg width="150" height="120" viewBox="0 0 150 120" fill="none" aria-hidden>
      <g className="mb-glyph-spin-rev" style={{ transformOrigin: "75px 60px" }}>
        {ellipses.map((e, i) => (
          <ellipse
            key={i}
            cx={e.cx}
            cy={e.cy}
            rx={e.rx}
            ry={e.ry}
            stroke="currentColor"
            strokeWidth="1"
            transform={`rotate(-32 ${e.cx} ${e.cy})`}
            style={{ opacity: e.opacity }}
          />
        ))}
      </g>
    </svg>
  );
}
