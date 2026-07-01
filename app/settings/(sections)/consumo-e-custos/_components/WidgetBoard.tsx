"use client";

import * as React from "react";
import { Reorder, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";
import { AwCard } from "@/components/ui/AwCard";
import { AwDropdownMenu, type AwDropdownItem } from "@/components/ui/AwDropdownMenu";
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

/** Controles de chrome injetados em cada widget: a alça de arraste (só no modo
 *  de reorganização) e o menu de opções (⋮) sempre visível no header. */
export type WidgetChrome = {
  dragHandle?: React.ReactNode;
  menu?: React.ReactNode;
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
  onEdit,
}: {
  widgets: BoardWidget[];
  order: string[];
  setOrder: (next: string[]) => void;
  spans: Record<string, Span>;
  toggleSpan: (id: string) => void;
  /** O arraste (reordenar) só liga no modo de reorganização. */
  editing?: boolean;
  /** Ids removidos da visualização — não renderizam. */
  hidden?: Set<string>;
  /** Remove um widget da visualização atual (item "Remover" do menu do card). */
  onRemove?: (id: string) => void;
  /** Re-exibe um widget escondido — alimenta o card "Adicionar gráfico" no fim
   *  do board. Quando passado, o card-placeholder é sempre renderizado. */
  onAdd?: (id: string) => void;
  /** Entra no modo de reorganização (arraste) — item "Reorganizar painel". */
  onEdit?: () => void;
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

  const items = ordered.map((w) => (
    <BoardItem
      key={w.id}
      widget={w}
      span={spans[w.id] ?? w.span}
      onToggleSpan={() => toggleSpan(w.id)}
      editing={editing}
      onRemove={onRemove ? () => onRemove(w.id) : undefined}
      onEdit={onEdit}
      constraintsRef={boardRef}
    />
  ));
  // Último item do board: placeholder tracejado pra readicionar um gráfico
  // escondido. Some quando todos já estão no painel (pedido do Greg).
  const addCard =
    onAdd && available.length > 0 ? (
      <AddWidgetCard available={available} onAdd={onAdd} />
    ) : null;

  // Fora do modo de reorganização o board é um grid CSS puro — sem o Reorder do
  // framer-motion. O Reorder é 1D e, num grid de 2 colunas, dispara animação de
  // layout (FLIP com transform + z-index) sempre que um card muda de altura (ex.:
  // expandir uma linha da tabela de Detalhamento): os cards vizinhos ganham
  // transform + z-index e um "sobe por cima" do outro. Sem arraste, o grid reflui
  // sozinho. O Reorder só entra no modo de edição, quando de fato há arraste.
  if (!editing) {
    return (
      <div ref={boardRef} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {items}
        {addCard}
      </div>
    );
  }

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
      {items}
      {addCard}
    </Reorder.Group>
  );
}

function BoardItem({
  widget,
  span,
  onToggleSpan,
  editing,
  onRemove,
  onEdit,
  constraintsRef,
}: {
  widget: BoardWidget;
  span: Span;
  onToggleSpan: () => void;
  editing: boolean;
  onRemove?: () => void;
  /** Entra no modo de reorganização (arraste) a partir do menu do card. */
  onEdit?: () => void;
  /** Área do board: limita o arrasto pra o card não escapar pra fora da tela. */
  constraintsRef: React.RefObject<HTMLDivElement | null>;
}) {
  const controls = useDragControls();
  const [dragging, setDragging] = React.useState(false);

  // Alça de arraste — só no modo de reorganização (arrastar é um modo, não um
  // item de menu). Fora dele, reordenar entra pelo item "Reorganizar painel".
  const dragHandle = editing ? (
    <button
      type="button"
      aria-label="Arrastar gráfico"
      onPointerDown={(e) => {
        e.preventDefault();
        controls.start(e);
      }}
      className="inline-flex cursor-grab touch-none items-center text-(--fg-tertiary) transition-colors duration-aw-fast hover:text-(--fg-secondary) active:cursor-grabbing"
    >
      <Icon name="drag_indicator" size={18} />
    </button>
  ) : undefined;

  // Menu de opções (⋮) SEMPRE visível no header: largura, reorganizar e remover.
  // É o caminho pra tirar/ajustar um gráfico sem entrar num modo — remover é
  // imediato (reversível pelo banner "Restaurar") e já deixa o relatório "editado".
  const menu = (
    <WidgetMenu
      widgetLabel={widget.label}
      span={span}
      onToggleSpan={onToggleSpan}
      onReorganize={editing ? undefined : onEdit}
      onRemove={onRemove}
    />
  );

  const inner = (
    <div
      className={cn(
        "group/widget h-full rounded-2xl transition-shadow duration-aw-fast",
        editing && "ring-1 ring-(--border-default) ring-offset-2 ring-offset-(--bg-canvas)",
        dragging && "shadow-lg",
      )}
    >
      {widget.render({ dragHandle, menu })}
    </div>
  );

  // Fora do modo de reorganização: div simples no grid (sem Reorder), pra o grid
  // refluir sem transform/FLIP quando um card muda de altura (ex.: tabela expande).
  if (!editing) {
    return <div className={cn("min-w-0", span === 2 && "lg:col-span-2")}>{inner}</div>;
  }

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
      whileDrag={{ scale: 1.01, zIndex: 30 }}
      className={cn(
        "min-w-0",
        span === 2 && "lg:col-span-2",
        dragging && "relative z-30",
      )}
    >
      {inner}
    </Reorder.Item>
  );
}

/* ---------- menu de opções (⋮) do card ---------- */

/**
 * Menu de opções sempre visível no header de cada gráfico. Reúne largura,
 * reorganizar e remover — o caminho pra tirar/ajustar um card SEM entrar no modo
 * de edição. A remoção é imediata (não destrói nada: o snapshot guarda e o banner
 * "Restaurar" desfaz), e já marca o relatório como editado.
 *
 * Passe só os handlers que fazem sentido: um card fixo (ex.: "Uso total no
 * período") recebe apenas `onRemove`, então o menu vira uma ação única.
 */
export function WidgetMenu({
  widgetLabel,
  span,
  onToggleSpan,
  onReorganize,
  onRemove,
}: {
  widgetLabel?: string;
  span?: Span;
  onToggleSpan?: () => void;
  onReorganize?: () => void;
  onRemove?: () => void;
}) {
  const items: AwDropdownItem[] = [];
  if (onToggleSpan) {
    items.push({
      id: "span",
      label: span === 2 ? "Meia largura" : "Largura total",
      icon: span === 2 ? "close_fullscreen" : "open_in_full",
      onSelect: onToggleSpan,
    });
  }
  if (onReorganize) {
    items.push({
      id: "reorg",
      label: "Reorganizar painel",
      icon: "drag_indicator",
      onSelect: onReorganize,
    });
  }
  if (onRemove) {
    if (items.length > 0) items.push({ id: "sep", separator: true });
    items.push({
      id: "remove",
      label: "Remover do painel",
      icon: "delete",
      danger: true,
      onSelect: onRemove,
    });
  }
  if (items.length === 0) return null;

  const label = widgetLabel ? `Opções de “${widgetLabel}”` : "Opções do gráfico";
  return (
    <AwDropdownMenu
      align="end"
      aria-label={label}
      trigger={
        <button
          type="button"
          aria-label={label}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-(--fg-tertiary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary)"
        >
          <Icon name="more_vert" size={18} />
        </button>
      }
      items={items}
    />
  );
}

/* ---------- chrome compartilhado de cada widget ---------- */

export function WidgetShell({
  title,
  icon,
  description,
  actions,
  dragHandle,
  menu,
  children,
  contentClassName,
  variant = "default",
}: {
  title: React.ReactNode;
  icon?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  dragHandle?: React.ReactNode;
  menu?: React.ReactNode;
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
        {(actions || menu) && (
          <div className="flex shrink-0 items-center gap-1.5">
            {actions}
            {menu}
          </div>
        )}
      </div>
      <div className={cn("min-w-0 flex-1", contentClassName)}>{children}</div>
    </AwCard>
  );
}
