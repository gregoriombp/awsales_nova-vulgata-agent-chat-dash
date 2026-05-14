"use client";

import { useEffect, useState } from "react";
import type { AuthScreen } from "./AuthFlow";

type Locale = "pt" | "en";

interface BrandPaneProps {
  screen: AuthScreen;
  locale: Locale;
}

// Each step shows a different image — keeps the visual variety as the user
// progresses through the auth flow.
const SCREEN_IMAGE: Record<AuthScreen, string> = {
  login: "/assets/group-backgrounds/group-bg-04.jpg",
  forgot: "/assets/group-backgrounds/group-bg-09.jpg",
  reset: "/assets/group-backgrounds/group-bg-13.jpg",
  verify: "/assets/group-backgrounds/group-bg-07.jpg",
  workspace: "/assets/group-backgrounds/group-bg-17.jpg",
  success: "/assets/group-backgrounds/group-bg-20.jpg",
};

export default function BrandPane({ screen }: BrandPaneProps) {
  const target = SCREEN_IMAGE[screen];
  const [currentSrc, setCurrentSrc] = useState(target);
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (target === currentSrc) return;
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
    <section className="relative hidden lg:flex items-center justify-center min-h-screen bg-white p-6 xl:p-8">
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
      </div>
    </section>
  );
}
