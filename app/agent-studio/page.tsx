"use client";

import Link from "next/link";
import { useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Icon } from "@/components/ui/Icon";

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
      icon: <Icon name="agent_studio" size={20} />,
    },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex min-h-full w-full flex-col items-center justify-center py-10 sm:py-14">
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
                  fill="var(--fg-primary)"
                  style={{
                    animationDelay: `${dot.delay}s`,
                  }}
                />
              ))}
            </svg>
          </div>

          {/* Title, subtitle, CTA */}
          <div className="flex flex-col items-center text-center">
            <h1 className="mb-3 font-heading text-4xl font-regular tracking-tight text-[var(--fg-primary)] sm:text-5xl md:text-6xl">
              Agent Studio
            </h1>
            <p className="mb-10 max-w-md font-sans text-lg font-normal text-[var(--fg-secondary)] sm:text-xl">
              Crie seu primeiro agente em menos de 90 minutos
            </p>
            <Link
              href="/agent-studio/new"
              className="rounded-lg bg-[var(--fg-primary)] px-8 py-4 text-base font-semibold text-[var(--bg-canvas)] shadow-sm transition-all duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
            >
              Criar agente
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
