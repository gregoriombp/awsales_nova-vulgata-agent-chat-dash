import { create } from "zustand";
import { useCopilotDrawer } from "@/lib/copilot/store";

/**
 * Estado da Ajuda rápida (AwHelpDrawer).
 *
 * Espelha o padrão do Copilot (Cortex): o drawer mora no DashboardLayout, mas
 * o gatilho precisa ser alcançável de qualquer lugar — qualquer "entender" /
 * "saiba mais" no produto —, então o estado é içado pra este store.
 *
 * O drawer empurra o conteúdo pro lado, igual ao Cortex. Como os dois ocupam
 * a mesma calha à direita, abrir a Ajuda fecha o Cortex (e vice-versa fica a
 * cargo de quem abre o Cortex) pra nunca haver dois empurrões simultâneos.
 */
type HelpDrawerState = {
  open: boolean;
  /** Artigo em foco. */
  articleId: string | null;
  /** Texto da busca no topo. */
  query: string;
  /** Pilha de navegação pra o botão "voltar". */
  history: string[];
  /** Abre a ajuda já num artigo específico. */
  openHelp: (articleId: string) => void;
  /** Navega pra outro artigo mantendo o histórico. */
  navigate: (articleId: string) => void;
  setQuery: (query: string) => void;
  /** Volta: primeiro limpa a busca, depois desempilha o histórico. */
  back: () => void;
  close: () => void;
};

export const useHelpDrawer = create<HelpDrawerState>((set, get) => ({
  open: false,
  articleId: null,
  query: "",
  history: [],
  openHelp: (articleId) => {
    // Nunca dois painéis empurrando ao mesmo tempo.
    useCopilotDrawer.getState().setOpen(false);
    set({ open: true, articleId, query: "", history: [] });
  },
  navigate: (articleId) => {
    const { articleId: current, history } = get();
    set({
      articleId,
      query: "",
      history: current ? [...history, current] : history,
    });
  },
  setQuery: (query) => set({ query }),
  back: () => {
    const { query, history } = get();
    if (query) {
      set({ query: "" });
      return;
    }
    if (history.length > 0) {
      const prev = history[history.length - 1];
      set({ articleId: prev, history: history.slice(0, -1) });
    }
  },
  close: () => set({ open: false }),
}));
