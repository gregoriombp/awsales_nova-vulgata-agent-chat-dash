"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import MemoryBaseSidebar from "./MemoryBaseSidebar";
import Header from "./Header";
import CopilotDrawer from "./CopilotDrawer";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export default function DashboardLayout({
  children,
  title,
  breadcrumbs,
  showDateSelector,
  mainClassName,
}: {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: (string | BreadcrumbItem)[];
  showDateSelector?: boolean;
  mainClassName?: string;
}) {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const pathname = usePathname();
  const isInMemoryBase = pathname?.startsWith("/memory-base") ?? false;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar forcedCollapsed={isInMemoryBase} />
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden relative">
        {/* Ícones ficam abaixo do Copilot quando ele está aberto */}
        <div
          className={`absolute right-8 z-20 transition-[top] duration-300 ease-out ${
            isCopilotOpen ? "top-[calc(70vh+12px)]" : "top-3"
          }`}
        >
          <Header
            minimal
            isCopilotOpen={isCopilotOpen}
            onCopilotOpen={setIsCopilotOpen}
          />
        </div>
        <div className="flex flex-1 min-w-0 overflow-hidden">
          {isInMemoryBase && <MemoryBaseSidebar />}
          <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
            <main className={`flex-1 overflow-y-auto p-8 ${mainClassName ?? ""}`}>
              {title && (
                <h1 className="text-3xl font-heading font-bold text-text-primary mb-6">{title}</h1>
              )}
              {children}
            </main>
          </div>
          {/* Copilot acima dos ícones: altura 70vh quando aberto */}
          <div
            className="flex shrink-0 overflow-hidden transition-[width] duration-300 ease-out"
            style={isCopilotOpen ? { width: 405, height: "70vh" } : { width: 0 }}
          >
            <CopilotDrawer
              isOpen={isCopilotOpen}
              onClose={() => setIsCopilotOpen(false)}
              embedded
            />
          </div>
        </div>
      </div>
    </div>
  );
}
