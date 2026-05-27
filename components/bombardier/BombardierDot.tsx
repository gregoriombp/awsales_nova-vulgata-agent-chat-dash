"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AwDropdownMenu,
  type AwDropdownItem,
} from "@/components/ui/AwDropdownMenu";
import { AwLogo } from "@/components/ui/AwLogo";
import { useReviewStore } from "@/lib/bombardier-review/store";

const reviewModeEnabled =
  process.env.NEXT_PUBLIC_BOMBARDIER_REVIEW_ENABLED === "true";

export function BombardierDot() {
  const router = useRouter();
  const [visible, setVisible] = React.useState(true);
  const reviewActive = useReviewStore((s) => s.active);
  const toggleReview = useReviewStore((s) => s.toggleActive);

  if (!visible) return null;

  const go = (href: string) => router.push(href);

  const items: AwDropdownItem[] = [
    { id: "label-nav", isLabel: true, label: "Bombardier" },
    {
      id: "hub",
      label: "Hub",
      icon: "dashboard",
      onSelect: () => go("/bombardier"),
    },
    {
      id: "styleguide",
      label: "Styleguide",
      icon: "palette",
      onSelect: () => go("/bombardier/styleguide"),
    },
    {
      id: "ux-flows",
      label: "UX Flows",
      icon: "account_tree",
      onSelect: () => go("/bombardier/styleguide/ux-flows"),
    },
    {
      id: "page-builder",
      label: "Page Builder",
      icon: "draw",
      onSelect: () => go("/bombardier/page-builder"),
    },
    ...(reviewModeEnabled
      ? ([
          { id: "sep-review", separator: true as const },
          {
            id: "review",
            label: reviewActive ? "Sair do Review Mode" : "Entrar no Review Mode",
            icon: reviewActive ? "rate_review" : "comment",
            checked: reviewActive,
            onSelect: () => toggleReview(),
          },
        ] satisfies AwDropdownItem[])
      : []),
    { id: "sep-hide", separator: true },
    {
      id: "hide",
      label: "Ocultar até atualizar",
      icon: "close",
      onSelect: () => setVisible(false),
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[60] pointer-events-none">
      <AwDropdownMenu
        align="end"
        side="top"
        sideOffset={8}
        aria-label="Atalhos do Bombardier"
        trigger={
          <button
            type="button"
            aria-label="Atalhos do Bombardier"
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)] shadow-[var(--shadow-md)] outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]"
          >
            <AwLogo variant="mark" height={14} aria-label="Bombardier" />
          </button>
        }
        items={items}
      />
    </div>
  );
}
