"use client";

import * as React from "react";
import { Reorder, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";
import { AddWidgetCard, type AddableWidget } from "./AddWidgetCard";

/* ----------------------------------------------------------------------------
 * Board de widgets arrastáveis.
 *
 * Sem dep nova: usa o Reorder do framer-motion (já no repo) num grid de 2
 * colunas. Cada widget tem um "handle" no header — só ele inicia o arraste, pra
 * não atrapalhar hover de gráfico, ordenação de tabela e tooltips. A ordem é
 * salva no navegador (localStorage) e tem botão de resetar na toolbar.
 * ------------------------------------------------------------------------- */

export type Span = 1 | 2;

/** Controles de chrome injetados em cada widget (arrastar + redimensionar +
 *  remover da visualização). */
export type WidgetChrome = {
  dragHandle: React.ReactNode;
  resizeButton: React.ReactNode;
  removeButton?: React.ReactNode;
};

export type BoardWidget = {
  id: string;
  /** Largura padrão no grid de 2 (1 = metade, 2 = largura toda). */
  span: Span;
  /** Nome amigável do gráfico — usado no seletor "Adicionar gráfico". */
  label?: string;
  /** Ícone do gráfico (Material Symbols) — usado no seletor "Adicionar gráfico". */
  icon?: string;
  render: (chrome: WidgetChrome) => React.ReactNode;
};

export function useBoardOrder(storageKey: string, defaultOrder: string[]) {
  const [order, setOrderState] = React.useState<string[]>(defaultOrder);
  const [hydrated, setHydrated] = React.useState(false);

  // Lê o layout salvo só depois de montar, pra não dar mismatch de hidratação.
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as string[];
        // Reconcilia com o default: mantém a ordem salva, descarta ids que não
        // existem mais e acrescenta widgets novos no fim.
        const valid = saved.filter((id) => defaultOrder.includes(id));
        const missing = defaultOrder.filter((id) => !valid.includes(id));
        setOrderState([...valid, ...missing]);
      }
    } catch {
      /* localStorage indisponível — segue com o default */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const setOrder = React.useCallback(
    (next: string[]) => {
      setOrderState(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  );

  const reset = React.useCallback(() => {
    setOrderState(defaultOrder);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const isCustomized =
    hydrated && order.join("|") !== defaultOrder.join("|");

  return { order, setOrder, reset, isCustomized, hydrated };
}

/** Largura (span) de cada widget, persistida por navegador — mesmo padrão da
 * ordem. O resize troca 1↔2 colunas; cada widget guarda sua escolha. */
export function useBoardSpans(
  storageKey: string,
  defaultSpans: Record<string, Span>,
) {
  const [spans, setSpansState] = React.useState<Record<string, Span>>(defaultSpans);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, Span>;
        // Mantém só ids conhecidos e completa o que faltar com o default.
        const next: Record<string, Span> = { ...defaultSpans };
        for (const id of Object.keys(defaultSpans)) {
          if (saved[id] === 1 || saved[id] === 2) next[id] = saved[id];
        }
        setSpansState(next);
      }
    } catch {
      /* localStorage indisponível — segue com o default */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const persist = React.useCallback(
    (next: Record<string, Span>) => {
      setSpansState(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  );

  const toggleSpan = React.useCallback(
    (id: string) => {
      setSpansState((prev) => {
        const current = prev[id] ?? defaultSpans[id] ?? 1;
        const next = { ...prev, [id]: (current === 2 ? 1 : 2) as Span };
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storageKey],
  );

  const reset = React.useCallback(() => {
    setSpansState(defaultSpans);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const isCustomized =
    hydrated &&
    Object.keys(defaultSpans).some((id) => (spans[id] ?? defaultSpans[id]) !== defaultSpans[id]);

  return { spans, toggleSpan, setSpans: persist, reset, isCustomized, hydrated };
}

export function DraggableBoard({
  widgets,
  order,
  setOrder,
  spans,
  toggleSpan,
  editing = false,
  hidden,
  onRemove,
  onAdd,
}: {
  widgets: BoardWidget[];
  order: string[];
  setOrder: (next: string[]) => void;
  spans: Record<string, Span>;
  toggleSpan: (id: string) => void;
  /** Arrastar/redimensionar só liga no modo de edição (botão "Editar"). */
  editing?: boolean;
  /** Ids removidos da visualização — não renderizam. */
  hidden?: Set<string>;
  /** Remove um widget da visualização atual (mostra o ícone no header). */
  onRemove?: (id: string) => void;
  /** Re-exibe um widget escondido — alimenta o card "Adicionar gráfico" no fim
   *  do board. Quando passado, o card-placeholder é sempre renderizado. */
  onAdd?: (id: string) => void;
}) {
  const byId = React.useMemo(
    () => new Map(widgets.map((w) => [w.id, w])),
    [widgets],
  );
  const ordered = order
    .map((id) => byId.get(id))
    .filter((w): w is BoardWidget => Boolean(w) && !(hidden?.has((w as BoardWidget).id)));
  const visibleOrder = ordered.map((w) => w.id);

  // Trava do drag: o board é um grid de 2 colunas, mas o Reorder do Framer é
  // 1D (axis="y") — sem limite, o item arrastado (ex.: "Valor atribuído ao
  // provedor") escapava pra fora da tela. Constrange o arrasto à área do board.
  const boardRef = React.useRef<HTMLDivElement>(null);

  // Gráficos disponíveis pra (re)adicionar = os widgets escondidos desta
  // visualização, na ordem do board. Alimentam o card "Adicionar gráfico", que
  // fica sempre como último item do board.
  const available: AddableWidget[] = onAdd
    ? order
        .map((id) => byId.get(id))
        .filter((w): w is BoardWidget => Boolean(w) && Boolean(hidden?.has((w as BoardWidget).id)))
        .map((w) => ({ id: w.id, label: w.label ?? w.id, icon: w.icon ?? "insert_chart" }))
    : [];

  return (
    <Reorder.Group
      as="div"
      ref={boardRef}
      axis="y"
      values={visibleOrder}
      onReorder={(next) => {
        // Recoloca os ocultos nas posições originais pra não perdê-los na ordem.
        const hiddenIds = order.filter((id) => hidden?.has(id));
        setOrder([...next, ...hiddenIds]);
      }}
      className="grid grid-cols-1 gap-5 lg:grid-cols-2"
    >
      {ordered.map((w) => (
        <BoardItem
          key={w.id}
          widget={w}
          span={spans[w.id] ?? w.span}
          onToggleSpan={() => toggleSpan(w.id)}
          editing={editing}
          onRemove={onRemove ? () => onRemove(w.id) : undefined}
          constraintsRef={boardRef}
        />
      ))}
      {/* Último item do board: placeholder tracejado pra adicionar um gráfico
          escondido de volta. Fica fora do Reorder (não é arrastável). Some
          quando todos os gráficos já estão no painel (pedido do Greg) — sem o
          estado desabilitado "Todos já estão no painel". */}
      {onAdd && available.length > 0 && <AddWidgetCard available={available} onAdd={onAdd} />}
    </Reorder.Group>
  );
}

function BoardItem({
  widget,
  span,
  onToggleSpan,
  editing,
  onRemove,
  constraintsRef,
}: {
  widget: BoardWidget;
  span: Span;
  onToggleSpan: () => void;
  editing: boolean;
  onRemove?: () => void;
  /** Área do board: limita o arrasto pra o card não escapar pra fora da tela. */
  constraintsRef: React.RefObject<HTMLDivElement | null>;
}) {
  const controls = useDragControls();
  const [dragging, setDragging] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState(false);

  const dragHandle = editing ? (
    <button
      type="button"
      aria-label="Arrastar widget"
      onPointerDown={(e) => {
        e.preventDefault();
        controls.start(e);
      }}
      className="inline-flex cursor-grab touch-none items-center text-(--fg-tertiary) transition-colors duration-aw-fast hover:text-(--fg-secondary) active:cursor-grabbing"
    >
      <Icon name="drag_indicator" size={18} />
    </button>
  ) : undefined;

  // Resize só faz sentido onde o grid tem 2 colunas (lg+); abaixo disso tudo já
  // é largura cheia, então o botão fica oculto.
  const resizeButton = editing ? (
    <button
      type="button"
      aria-label={span === 2 ? "Reduzir para meia largura" : "Expandir para largura total"}
      title={span === 2 ? "Meia largura" : "Largura total"}
      onClick={onToggleSpan}
      className="hidden h-8 w-8 items-center justify-center rounded-md text-(--fg-tertiary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary) lg:inline-flex"
    >
      <Icon name={span === 2 ? "close_fullscreen" : "open_in_full"} size={16} />
    </button>
  ) : undefined;

  // "Excluir este gráfico do painel" — terceiro ícone do chrome do header. Ícone
  // de LIXEIRA + modal de confirmação (pedido do Greg, no lugar do antigo olho).
  // Visível só no MODO DE EDIÇÃO. Não apaga nada permanente: oculta o widget desta
  // visualização (o snapshot do relatório guarda) e dá pra readicionar pelo card
  // "Adicionar gráfico".
  const removeButton = editing && onRemove ? (
    <button
      type="button"
      aria-label="Excluir gráfico do painel"
      title="Excluir do painel"
      onClick={() => setConfirmRemove(true)}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-(--fg-tertiary) transition-all duration-aw-fast hover:bg-(--bg-hover) hover:text-(--accent-danger)"
    >
      <Icon name="delete" size={16} />
    </button>
  ) : undefined;

  return (
    <Reorder.Item
      as="div"
      value={widget.id}
      dragListener={false}
      dragControls={controls}
      dragConstraints={constraintsRef}
      dragElastic={0.12}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      whileDrag={editing ? { scale: 1.01, zIndex: 30 } : undefined}
      className={cn(
        "min-w-0",
        span === 2 && "lg:col-span-2",
        dragging && "relative z-30",
      )}
    >
      <div
        className={cn(
          "group/widget h-full rounded-2xl transition-shadow duration-aw-fast",
          editing && "ring-1 ring-(--border-default) ring-offset-2 ring-offset-(--bg-canvas)",
          dragging && "shadow-lg",
        )}
      >
        {widget.render({ dragHandle, resizeButton, removeButton })}
      </div>

      <AwModal
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        title="Excluir gráfico?"
        footer={
          <>
            <AwButton size="sm" variant="ghost" onClick={() => setConfirmRemove(false)}>
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="danger"
              iconLeft="delete"
              onClick={() => {
                onRemove?.();
                setConfirmRemove(false);
              }}
            >
              Excluir
            </AwButton>
          </>
        }
      >
        <p className="m-0 body-sm text-(--fg-secondary) text-pretty">
          Tirar{" "}
          {widget.label ? (
            <strong className="font-medium text-(--fg-primary)">“{widget.label}”</strong>
          ) : (
            "este gráfico"
          )}{" "}
          do painel? Você pode adicionar de volta depois pelo card “Adicionar gráfico”.
        </p>
      </AwModal>
    </Reorder.Item>
  );
}

/* ---------- chrome compartilhado de cada widget ---------- */

export function WidgetShell({
  title,
  icon,
  description,
  actions,
  dragHandle,
  resizeButton,
  removeButton,
  children,
  contentClassName,
  variant = "default",
}: {
  title: React.ReactNode;
  icon?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  dragHandle?: React.ReactNode;
  resizeButton?: React.ReactNode;
  removeButton?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
  variant?: "default" | "ai-warm";
}) {
  return (
    <AwCard
      variant={variant}
      className="flex h-full flex-col gap-4 rounded-2xl p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          {dragHandle}
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              {icon && (
                <Icon
                  name={icon}
                  size={16}
                  className="shrink-0 text-(--fg-tertiary)"
                />
              )}
              <h6 className="m-0 truncate text-(--fg-primary)">{title}</h6>
            </div>
            {description && (
              <p className="m-0 body-xs text-(--fg-tertiary)">{description}</p>
            )}
          </div>
        </div>
        {(actions || resizeButton || removeButton) && (
          <div className="flex shrink-0 items-center gap-1.5">
            {actions}
            {resizeButton}
            {removeButton}
          </div>
        )}
      </div>
      <div className={cn("min-w-0 flex-1", contentClassName)}>{children}</div>
    </AwCard>
  );
}
