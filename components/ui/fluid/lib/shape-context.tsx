"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

type ShapeVariant = "pill" | "rounded";

const shapeOrder: ShapeVariant[] = ["rounded", "pill"];

interface ShapeClasses {
  item: string;
  bg: string;
  focusRing: string;
  mergedBg: string;
  container: string;
  button: string;
  input: string;
  // Numeric counterparts of `bg` / `mergedBg`, in px. Needed where individual
  // corners are animated (e.g. the selected-background merge/split animation),
  // which requires per-corner numeric border-radii rather than a class.
  bgRadius: number;
  mergedRadius: number;
}

// Adapted from upstream: both variants map onto this repo's --radius-* scale
// (xs 6 · sm 8 · md 10 · lg 12 · xl 16 · 2xl 24 · full) instead of arbitrary
// rounded-[Npx] values. The numeric fields mirror the class values so the
// per-corner animations stay in sync with the token scale.
const shapeMap: Record<ShapeVariant, ShapeClasses> = {
  pill: {
    item: "rounded-2xl",
    bg: "rounded-2xl",
    focusRing: "rounded-full",
    mergedBg: "rounded-xl",
    container: "rounded-2xl",
    button: "rounded-2xl",
    input: "rounded-2xl",
    bgRadius: 24,
    mergedRadius: 16,
  },
  rounded: {
    item: "rounded-md",
    bg: "rounded-md",
    focusRing: "rounded-lg",
    mergedBg: "rounded-md",
    container: "rounded-xl",
    button: "rounded-md",
    input: "rounded-md",
    bgRadius: 10,
    mergedRadius: 10,
  },
};

interface ShapeContextValue {
  shape: ShapeVariant;
  setShape: (shape: ShapeVariant) => void;
  classes: ShapeClasses;
}

const ShapeContext = createContext<ShapeContextValue | null>(null);

// Without a provider the kit follows the product default: rounded.
function useShape(): ShapeClasses {
  const ctx = useContext(ShapeContext);
  if (!ctx) return shapeMap.rounded;
  return ctx.classes;
}

function useShapeContext() {
  const ctx = useContext(ShapeContext);
  if (!ctx) throw new Error("useShapeContext must be used within a ShapeProvider");
  return ctx;
}

function transitionShape(callback: () => void) {
  const root = document.documentElement;
  root.classList.add("transitioning");
  void root.offsetHeight;
  callback();
  setTimeout(() => root.classList.remove("transitioning"), 200);
}

function ShapeProvider({
  children,
  defaultShape = "rounded",
}: {
  children: ReactNode;
  defaultShape?: ShapeVariant;
}) {
  const [shape, setShapeState] = useState<ShapeVariant>(defaultShape);

  const setShape = useCallback((next: ShapeVariant) => {
    transitionShape(() => setShapeState(next));
  }, []);

  // Global keyboard shortcut: R cycles the radius variant. Only active when a
  // ShapeProvider is mounted (i.e. styleguide showcases), never product-wide.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "r" && e.key !== "R") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      e.preventDefault();
      transitionShape(() => {
        setShapeState((prev) => {
          const idx = shapeOrder.indexOf(prev);
          return shapeOrder[(idx + 1) % shapeOrder.length];
        });
      });
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <ShapeContext.Provider value={{ shape, setShape, classes: shapeMap[shape] }}>
      {children}
    </ShapeContext.Provider>
  );
}

export { ShapeProvider, useShape, useShapeContext, shapeMap };
export type { ShapeVariant, ShapeClasses };
