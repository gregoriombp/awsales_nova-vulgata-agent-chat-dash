"use client";

import * as React from "react";
import { Reorder, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";
import { AwCard } from "@/components/ui/AwCard";
import { Icon } from "@/components/ui/Icon";

/* ----------------------------------------------------------------------------
 * Board de widgets arrastáveis.
 *
 * Sem dep nova: usa o Reorder do framer-motion (já no repo) num grid de 2
 * colunas. Cada widget tem um "handle" no header — só ele inicia o arraste, pra
 * não atrapalhar hover de gráfico, ordenação de tabela e tooltips. A ordem é
 * salva no navegador (localStorage) e tem botão de resetar na toolbar.
 * ------------------------------------------------------------------------- */

export type Span = 1 | 2;

/** Controles de chrome injetados em cada widget (arrastar + redimensionar). */
export type WidgetChrome = {
  dragHandle: React.ReactNode;
  resizeButton: React.ReactNode;
};

export type BoardWidget = {
  id: string;
  /** Largura padrão no grid de 2 (1 = metade, 2 = largura toda). */
  span: Span;
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
}: {
  widgets: BoardWidget[];
  order: string[];
  setOrder: (next: string[]) => void;
  spans: Record<string, Span>;
  toggleSpan: (id: string) => void;
}) {
  const byId = React.useMemo(
    () => new Map(widgets.map((w) => [w.id, w])),
    [widgets],
  );
  const ordered = order.map((id) => byId.get(id)).filter(Boolean) as BoardWidget[];

  return (
    <Reorder.Group
      as="div"
      axis="y"
      values={order}
      onReorder={setOrder}
      className="grid grid-cols-1 gap-5 lg:grid-cols-2"
    >
      {ordered.map((w) => (
        <BoardItem
          key={w.id}
          widget={w}
          span={spans[w.id] ?? w.span}
          onToggleSpan={() => toggleSpan(w.id)}
        />
      ))}
    </Reorder.Group>
  );
}

function BoardItem({
  widget,
  span,
  onToggleSpan,
}: {
  widget: BoardWidget;
  span: Span;
  onToggleSpan: () => void;
}) {
  const controls = useDragControls();
  const [dragging, setDragging] = React.useState(false);

  const dragHandle = (
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
  );

  // Resize só faz sentido onde o grid tem 2 colunas (lg+); abaixo disso tudo já
  // é largura cheia, então o botão fica oculto.
  const resizeButton = (
    <button
      type="button"
      aria-label={span === 2 ? "Reduzir para meia largura" : "Expandir para largura total"}
      title={span === 2 ? "Meia largura" : "Largura total"}
      onClick={onToggleSpan}
      className="hidden h-8 w-8 items-center justify-center rounded-md text-(--fg-tertiary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary) lg:inline-flex"
    >
      <Icon name={span === 2 ? "close_fullscreen" : "open_in_full"} size={16} />
    </button>
  );

  return (
    <Reorder.Item
      as="div"
      value={widget.id}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      whileDrag={{ scale: 1.01, zIndex: 30 }}
      className={cn(
        "min-w-0",
        span === 2 && "lg:col-span-2",
        dragging && "relative z-30",
      )}
    >
      <div
        className={cn(
          "h-full transition-shadow duration-aw-fast",
          dragging && "shadow-lg",
        )}
      >
        {widget.render({ dragHandle, resizeButton })}
      </div>
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
        {(actions || resizeButton) && (
          <div className="flex shrink-0 items-center gap-1.5">
            {actions}
            {resizeButton}
          </div>
        )}
      </div>
      <div className={cn("min-w-0 flex-1", contentClassName)}>{children}</div>
    </AwCard>
  );
}
