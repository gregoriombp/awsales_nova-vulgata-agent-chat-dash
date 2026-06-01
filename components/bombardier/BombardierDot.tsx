"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AwDropdownMenu,
  type AwDropdownItem,
} from "@/components/ui/AwDropdownMenu";
import { AwLogo } from "@/components/ui/AwLogo";
import { useReviewStore } from "@/lib/bombardier-review/store";
import { useToast } from "@/components/ui/AwToast";

// Inlined at build time (NEXT_PUBLIC_*). When the review-bridge skill wrote a
// LAN address here, "Copiar link pra LAN" rebuilds the current page URL on that
// host so the team can open the exact screen you're reviewing.
const reviewBridgeUrl = process.env.NEXT_PUBLIC_BOMBARDIER_REVIEW_BRIDGE_URL;

export function BombardierDot() {
  const router = useRouter();
  const [visible, setVisible] = React.useState(true);
  const reviewActive = useReviewStore((s) => s.active);
  const toggleReview = useReviewStore((s) => s.toggleActive);
  const backend = useReviewStore((s) => s.backend);
  const { push } = useToast();

  const copyLanLink = React.useCallback(() => {
    if (typeof window === "undefined") return;
    let host = window.location.hostname;
    if (reviewBridgeUrl) {
      try {
        host = new URL(reviewBridgeUrl).hostname;
      } catch {
        /* fall back to the window host */
      }
    }
    const port = window.location.port || "3000";
    const url = `${window.location.protocol}//${host}:${port}${window.location.pathname}${window.location.search}`;
    const done = (ok: boolean) =>
      push({
        title: ok ? "Link copiado" : "Não consegui copiar",
        description: url,
        variant: ok ? "success" : "error",
      });
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(
        () => done(true),
        () => done(false)
      );
    } else {
      done(false);
    }
  }, [push]);

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
          ? "Review · sincronizando na LAN"
          : "Review · local (este navegador)",
    },
    {
      id: "review",
      label: reviewActive ? "Sair do Review Mode" : "Entrar no Review Mode",
      icon: reviewActive ? "rate_review" : "comment",
      checked: reviewActive,
      onSelect: () => toggleReview(),
    },
    {
      id: "review-copy-link",
      label: "Copiar link pra LAN",
      icon: "link",
      onSelect: () => copyLanLink(),
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
