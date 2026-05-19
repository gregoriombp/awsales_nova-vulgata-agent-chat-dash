"use client";

import { useEffect, useState } from "react";
import type { AuthScreen } from "./AuthFlow";

type Locale = "pt" | "en";

interface BrandPaneProps {
  screen: AuthScreen;
  locale: Locale;
}

// Cada etapa do fluxo mostra uma imagem diferente — mantém a variedade
// visual conforme o usuário avança. O login é a exceção: sorteia sempre
// uma imagem aleatória do banco (ver `randomBackground`).
const STEP_IMAGE: Record<Exclude<AuthScreen, "login">, string> = {
  email: "/assets/group-backgrounds/group-bg-11.jpg",
  forgot: "/assets/group-backgrounds/group-bg-09.jpg",
  reset: "/assets/group-backgrounds/group-bg-13.jpg",
  verify: "/assets/group-backgrounds/group-bg-07.jpg",
  workspace: "/assets/group-backgrounds/group-bg-17.jpg",
  success: "/assets/group-backgrounds/group-bg-20.jpg",
};

// Banco de imagens em /public/assets/group-backgrounds (group-bg-01..40).
const TOTAL_BACKGROUNDS = 40;
const randomBackground = () => {
  const n = Math.floor(Math.random() * TOTAL_BACKGROUNDS) + 1;
  return `/assets/group-backgrounds/group-bg-${String(n).padStart(2, "0")}.jpg`;
};

export default function BrandPane({ screen }: BrandPaneProps) {
  // O login sempre exibe uma imagem aleatória do banco. O sorteio roda só
  // no cliente, após montar, para não divergir do HTML renderizado no
  // servidor (evita hydration mismatch).
  const [loginImage, setLoginImage] = useState<string | null>(null);
  useEffect(() => {
    setLoginImage(randomBackground());
  }, []);

  const target = screen === "login" ? loginImage : STEP_IMAGE[screen];

  const [currentSrc, setCurrentSrc] = useState<string | null>(target);
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!target || target === currentSrc) return;
    setPrevSrc(currentSrc);
    setCurrentSrc(target);
    setTick((t) => t + 1);
  }, [target, currentSrc]);

  useEffect(() => {
    if (!prevSrc) return;
    const t = setTimeout(() => setPrevSrc(null), 850);
    return () => clearTimeout(t);
  }, [prevSrc, tick]);

  return (
    <section className="relative hidden lg:flex items-center justify-center min-h-screen bg-white p-2 xl:p-3">
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-aw-gray-200">
        {prevSrc && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${prevSrc})`,
              filter: "grayscale(100%) contrast(1.05)",
            }}
          />
        )}
        {currentSrc && (
          <div
            key={tick}
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${currentSrc})`,
              filter: "grayscale(100%) contrast(1.05)",
              animation: "brandPaneFadeIn 800ms ease-out both",
            }}
          />
        )}
      </div>
    </section>
  );
}
