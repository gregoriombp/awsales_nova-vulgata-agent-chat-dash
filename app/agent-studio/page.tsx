"use client";

import Link from "next/link";
import { useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";

/** Same horizontal bounds as hero (breadcrumb + column stay aligned). */
const AGENT_STUDIO_COLUMN = "mx-auto w-full max-w-lg px-5 sm:px-6";

const TUNNEL_CX = 100;
const TUNNEL_CY = 100;
const TUNNEL_MIN_R = 8;
const TUNNEL_MAX_R = 92;
const NUM_RAYS = 28;
const DOTS_PER_RAY = 14;
const MIN_DOT_R = 0.35;
const MAX_DOT_R = 2.2;

function useTunnelDots() {
  return useMemo(() => {
    const dots: { cx: number; cy: number; r: number; delay: number }[] = [];
    for (let ray = 0; ray < NUM_RAYS; ray++) {
      const angle = (ray / NUM_RAYS) * 2 * Math.PI;
      for (let i = 0; i < DOTS_PER_RAY; i++) {
        const t = (i + 0.5) / DOTS_PER_RAY;
        const r = TUNNEL_MIN_R + t * (TUNNEL_MAX_R - TUNNEL_MIN_R);
        const dotR = MIN_DOT_R + (r / TUNNEL_MAX_R) * (MAX_DOT_R - MIN_DOT_R);
        const cx = TUNNEL_CX + r * Math.cos(angle);
        const cy = TUNNEL_CY + r * Math.sin(angle);
        const delay = (ray / NUM_RAYS) * 0.8 + (i / DOTS_PER_RAY) * 0.6;
        dots.push({ cx, cy, r: dotR, delay });
      }
    }
    return dots;
  }, []);
}

export default function AgentStudioEntrancePage() {
  const tunnelDots = useTunnelDots();
  const breadcrumbs = [
    { label: "Início", href: "/inicio" },
    {
      label: "Agent Studio",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.75 15.625C3.75 16.3125 4.0625 16.5625 4.6875 16.875L10 18.75L15.3125 16.875C15.9375 16.5625 16.25 16.3125 16.25 15.625V7.1875C16.25 6.5 15.9375 6.25 15.3125 5.9375L10 4.0625L4.6875 5.9375C4.0625 6.25 3.75 6.5 3.75 7.1875V15.625Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M10 4.0625V18.75" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16.25 7.1875L10 10L3.75 7.1875" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
    },
  ];

  return (
    <DashboardLayout
      breadcrumbs={breadcrumbs}
      breadcrumbInnerClassName={AGENT_STUDIO_COLUMN}
      mainClassName="!p-0 !overflow-hidden"
      floatingSidebar
    >
      {/* Full-bleed canvas inside main; only the hero stack is width-limited (readable column). */}
      <div className="flex min-h-full w-full flex-col items-center justify-center bg-[var(--aw-black)] py-10 sm:py-14">
        <div className={`flex flex-col items-center justify-center gap-10 ${AGENT_STUDIO_COLUMN}`}>
          {/* Dot tunnel (perspective + motion) */}
          <div className="relative aspect-square w-full max-w-[320px] flex-shrink-0 agent-studio-tunnel-wrap">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {tunnelDots.map((dot, i) => (
                <circle
                  key={i}
                  className="agent-studio-tunnel-dot"
                  cx={dot.cx}
                  cy={dot.cy}
                  r={dot.r}
                  fill="white"
                  style={{
                    animationDelay: `${dot.delay}s`,
                  }}
                />
              ))}
            </svg>
          </div>

          {/* Title, subtitle, CTA */}
          <div className="flex flex-col items-center text-center">
            <h1 className="mb-3 font-heading text-4xl font-regular tracking-tight text-white sm:text-5xl md:text-6xl">
              Agent Studio
            </h1>
            <p className="mb-10 max-w-md font-sans text-lg font-normal text-white/80 sm:text-xl">
              Crie seu primeiro agente em menos de 90 minutos
            </p>
            <Link
              href="/agent-studio/new"
              className="rounded-lg bg-white px-8 py-4 text-base font-semibold text-black shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-white/95 hover:shadow-xl hover:shadow-white/10 active:scale-[0.98]"
            >
              Criar agente
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
