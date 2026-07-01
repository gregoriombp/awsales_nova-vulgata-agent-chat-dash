"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  getHelpArticle,
  searchHelpArticles,
  type HelpArticle,
  type HelpBlock,
} from "@/lib/help/articles";
import { useHelpDrawer } from "@/lib/help/store";

/** Largura da calha — casa com o Cortex (405) pra a calha direita ser coesa. */
export const HELP_DRAWER_WIDTH = 420;

function Block({ block }: { block: HelpBlock }) {
  switch (block.kind) {
    case "h":
      return (
        <h3 className="mt-6 mb-2 body-lg font-semibold text-(--fg-primary)">
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul className="my-2 flex list-none flex-col gap-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 body-sm text-(--fg-secondary)">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--fg-tertiary)" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <div className="my-3 flex items-start gap-2.5 rounded-xl bg-(--bg-surface) p-3">
          <Icon
            name={block.icon ?? "info"}
            size={18}
            className="mt-px shrink-0 text-(--fg-tertiary)"
          />
          <span className="body-sm text-(--fg-secondary)">{block.text}</span>
        </div>
      );
    case "p":
    default:
      return <p className="my-2 body-sm leading-6 text-(--fg-secondary)">{block.text}</p>;
  }
}

function ArticleView({ article }: { article: HelpArticle }) {
  const navigate = useHelpDrawer((s) => s.navigate);
  const related = (article.related ?? [])
    .map((id) => getHelpArticle(id))
    .filter((a): a is HelpArticle => a !== null);

  return (
    <div className="px-5 py-5">
      <h2 className="mb-3 font-heading text-2xl font-bold leading-tight text-(--fg-primary)">
        {article.title}
      </h2>
      {article.blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}

      {related.length > 0 && (
        <div className="mt-8 border-t border-(--border-subtle) pt-4">
          <p className="mb-2 body-xs font-semibold uppercase tracking-wide text-(--fg-tertiary)">
            Saiba mais
          </p>
          <div className="flex flex-col">
            {related.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => navigate(r.id)}
                className="group flex items-center justify-between gap-2 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-(--bg-hover)"
              >
                <span className="body-sm font-medium text-(--fg-primary)">{r.title}</span>
                <Icon
                  name="arrow_forward"
                  size={16}
                  className="shrink-0 text-(--fg-tertiary) transition-transform group-hover:translate-x-0.5"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultsView({ query }: { query: string }) {
  const navigate = useHelpDrawer((s) => s.navigate);
  const results = searchHelpArticles(query);

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <Icon name="search_off" size={32} className="mb-3 text-(--fg-tertiary)" />
        <p className="body-sm text-(--fg-secondary)">
          Nada encontrado para “{query}”.
        </p>
        <p className="mt-1 body-xs text-(--fg-tertiary)">
          Tente outras palavras ou fale com o suporte.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-3 py-3">
      {results.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => navigate(a.id)}
          className="group flex flex-col gap-0.5 rounded-lg px-3 py-3 text-left transition-colors hover:bg-(--bg-hover)"
        >
          <span className="body-sm font-semibold text-(--fg-primary)">{a.title}</span>
          <span className="body-xs text-(--fg-tertiary)">{a.summary}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Ajuda rápida — drawer de documentação in-app.
 *
 * Renderiza em modo `embedded` (padrão): um painel de largura fixa que o
 * DashboardLayout coloca numa calha in-flow, empurrando o conteúdo pro lado
 * (mesmo comportamento do Cortex). Não overlaya com z-index.
 */
export function AwHelpDrawer() {
  const open = useHelpDrawer((s) => s.open);
  const articleId = useHelpDrawer((s) => s.articleId);
  const query = useHelpDrawer((s) => s.query);
  const history = useHelpDrawer((s) => s.history);
  const setQuery = useHelpDrawer((s) => s.setQuery);
  const back = useHelpDrawer((s) => s.back);
  const close = useHelpDrawer((s) => s.close);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const article = getHelpArticle(articleId);
  const searching = query.trim().length > 0;
  const canGoBack = searching || history.length > 0;

  return (
    <aside
      className="h-full overflow-hidden bg-(--bg-raised) flex flex-col shrink-0"
      style={{ width: HELP_DRAWER_WIDTH, minWidth: HELP_DRAWER_WIDTH }}
      role="dialog"
      aria-label="Ajuda rápida"
    >
      {/* Top bar */}
      <div className="flex h-[79px] w-full shrink-0 items-center justify-between gap-2 border-b border-(--border-subtle) px-4">
        <div className="flex min-w-0 items-center gap-2">
          {canGoBack ? (
            <button
              type="button"
              onClick={back}
              className="rounded-full p-2 text-(--fg-tertiary) transition-colors hover:bg-(--bg-hover) hover:text-(--fg-primary)"
              aria-label="Voltar"
            >
              <Icon name="arrow_back" size={22} />
            </button>
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-(--bg-surface) text-(--fg-secondary)">
              <Icon name="help" size={20} weight={500} />
            </span>
          )}
          <span className="body-xl font-semibold text-(--fg-primary)">Ajuda rápida</span>
        </div>

        <button
          type="button"
          onClick={close}
          className="rounded-full p-2 text-(--fg-tertiary) transition-colors hover:bg-(--bg-hover) hover:text-(--fg-primary)"
          aria-label="Fechar"
        >
          <Icon name="close" size={24} />
        </button>
      </div>

      {/* Search */}
      <div className="shrink-0 px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--bg-surface) px-3 py-2.5 focus-within:border-(--border-default)">
          <Icon name="search" size={18} className="shrink-0 text-(--fg-tertiary)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent body-sm text-(--fg-primary) placeholder:text-(--fg-tertiary) focus:outline-hidden"
            placeholder="Pesquisar na ajuda rápida"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="shrink-0 rounded-full p-0.5 text-(--fg-tertiary) transition-colors hover:text-(--fg-primary)"
              aria-label="Limpar busca"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {searching ? (
          <ResultsView query={query} />
        ) : article ? (
          <ArticleView article={article} />
        ) : (
          <ResultsView query="" />
        )}
      </div>
    </aside>
  );
}
