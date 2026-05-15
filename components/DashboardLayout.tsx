"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import KnowledgeOSSidebar from "./KnowledgeOSSidebar";
import Header from "./Header";
import CopilotDrawer from "./CopilotDrawer";
import { BreadcrumbsBar, type BreadcrumbItem } from "./Breadcrumbs";

export default function DashboardLayout({
  children,
  title,
  breadcrumbs,
  showDateSelector,
  mainClassName,
  floatingSidebar,
  breadcrumbInnerClassName,
}: {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: (string | BreadcrumbItem)[];
  showDateSelector?: boolean;
  mainClassName?: string;
  /** Sidebar floats over full-width content as a liquid-glass rail. */
  floatingSidebar?: boolean;
  /** Center/limit breadcrumb text to match a narrow main column (e.g. Agent Studio). */
  breadcrumbInnerClassName?: string;
}) {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const pathname = usePathname();
  const isInKnowledgeOS = pathname?.startsWith("/knowledge-os") ?? false;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-surface)] relative">
      {floatingSidebar ? (
        <div className="absolute inset-y-0 left-0 z-[32]">
          <Sidebar floating />
        </div>
      ) : (
        <Sidebar forcedCollapsed={isInKnowledgeOS} />
      )}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden relative">
        <div className="absolute right-5 top-4 z-30">
          <Header
            minimal
            isCopilotOpen={isCopilotOpen}
            onCopilotOpen={setIsCopilotOpen}
          />
        </div>
        <div className="flex flex-1 min-w-0 overflow-hidden">
          {isInKnowledgeOS && <KnowledgeOSSidebar />}
          {/* Floating content panel — mirrors the sidebar's container
              treatment so the surface tone shows around the edges. */}
          <div className="my-2 mr-2 flex flex-1 min-w-0 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <BreadcrumbsBar
                items={breadcrumbs}
                innerClassName={breadcrumbInnerClassName}
              />
            )}
            <main className={`flex-1 overflow-y-auto p-6 ${mainClassName ?? ""}`}>
              {title && (
                <h1 className=" font-heading font-bold text-text-primary mb-6">{title}</h1>
              )}
              {children}
            </main>
          </div>
        </div>
        {/* Copilot — floats over the right edge so it doesn't push the main
            content or relocate the Header icons. */}
        <div
          className="absolute right-2 top-16 bottom-2 z-20 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] transition-[width,opacity] duration-300 ease-out"
          style={{
            width: isCopilotOpen ? 405 : 0,
            opacity: isCopilotOpen ? 1 : 0,
            pointerEvents: isCopilotOpen ? "auto" : "none",
          }}
        >
          <CopilotDrawer
            isOpen={isCopilotOpen}
            onClose={() => setIsCopilotOpen(false)}
            embedded
          />
        </div>
      </div>
    </div>
  );
}
