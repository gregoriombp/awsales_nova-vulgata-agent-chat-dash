import { create } from "zustand";
import type { ReviewComment } from "@/components/bombardier-review/types";

interface ReviewStorage {
  subscribe?: (cb: () => void) => () => void;
  load(): ReviewComment[];
  save(comments: ReviewComment[]): void;
}

const localStorageBackend: ReviewStorage = {
  load() {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("bombardier-review-comments");
      return raw ? (JSON.parse(raw) as ReviewComment[]) : [];
    } catch {
      return [];
    }
  },
  save(comments) {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      "bombardier-review-comments",
      JSON.stringify(comments),
    );
  },
};

interface ReviewStore {
  comments: ReviewComment[];
  selectedId: string | null;
  sheetOpen: boolean;
  backend: "bridge" | "local";
  storage: ReviewStorage;

  refreshFromStorage(): Promise<void>;
  addComment(comment: ReviewComment): void;
  resolveComment(id: string): void;
  reopenComment(id: string): void;
  deleteComment(id: string): void;
  selectComment(id: string): void;
  setSheetOpen(open: boolean): void;
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  comments: [],
  selectedId: null,
  sheetOpen: false,
  backend: "local",
  storage: localStorageBackend,

  async refreshFromStorage() {
    const loaded = get().storage.load();
    set({ comments: loaded });
  },

  addComment(comment) {
    const next = [...get().comments, comment];
    get().storage.save(next);
    set({ comments: next });
  },

  resolveComment(id) {
    const next = get().comments.map((c) =>
      c.id === id ? { ...c, status: "resolved" as const } : c,
    );
    get().storage.save(next);
    set({ comments: next });
  },

  reopenComment(id) {
    const next = get().comments.map((c) =>
      c.id === id ? { ...c, status: "open" as const } : c,
    );
    get().storage.save(next);
    set({ comments: next });
  },

  deleteComment(id) {
    const next = get().comments.filter((c) => c.id !== id);
    get().storage.save(next);
    set({ comments: next });
  },

  selectComment(id) {
    set({ selectedId: id });
  },

  setSheetOpen(open) {
    set({ sheetOpen: open });
  },
}));
