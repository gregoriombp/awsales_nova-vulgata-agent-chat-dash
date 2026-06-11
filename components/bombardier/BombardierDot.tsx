"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AwDropdownMenu,
  type AwDropdownItem,
} from "@/components/ui/AwDropdownMenu";
import { AwLogo } from "@/components/ui/AwLogo";
import { useReviewStore } from "@/lib/bombardier-review/store";

export function BombardierDot() {
  const router = useRouter();
  const [visible, setVisible] = React.useState(true);
  const reviewActive = useReviewStore((s) => s.active);
  const toggleReview = useReviewStore((s) => s.toggleActive);
  const backend = useReviewStore((s) => s.backend);

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
      onSelect: () => go("/bombardier/styleguide/ux-flows/primeiro-acesso"),
    },
    { id: "sep-review", separator: true },
    {
      id: "review-status",
      isLabel: true,
      label:
        backend === "bridge"
          ? "Review · bridge local"
          : "Review · local (este navegador)",
    },
    {
      id: "review",
      label: reviewActive ? "Sair do Review Mode" : "Entrar no Review Mode",
      icon: reviewActive ? "rate_review" : "comment",
      checked: reviewActive,
      onSelect: () => toggleReview(),
    },
    { id: "sep-hide", separator: true },
    {
      id: "hide",
      label: "Ocultar até atualizar",
      icon: "close",
      onSelect: () => setVisible(false),
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-60 pointer-events-none">
      <AwDropdownMenu
        align="end"
        side="top"
        sideOffset={8}
        aria-label="Atalhos do Bombardier"
        trigger={
          <button
            type="button"
            aria-label="Atalhos do Bombardier"
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-(--bg-inverse) text-(--fg-on-inverse) shadow-(--shadow-md) outline-hidden transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-(--ring-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-canvas)"
          >
            <AwLogo variant="mark" height={14} aria-label="Bombardier" />
          </button>
        }
        items={items}
      />
    </div>
  );
}
