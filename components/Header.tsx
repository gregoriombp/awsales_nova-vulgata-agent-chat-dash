"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import NotificationsPopover from "@/components/NotificationsPopover";
import { CopilotOrb } from "@/components/CopilotDrawer";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export default function Header({
  breadcrumbs,
  showDateSelector,
  isCopilotOpen,
  onCopilotOpen,
  minimal = false,
}: {
  breadcrumbs?: (string | BreadcrumbItem)[];
  showDateSelector?: boolean;
  isCopilotOpen?: boolean;
  onCopilotOpen?: (open: boolean) => void;
  minimal?: boolean;
}) {
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsButtonRef = useRef<HTMLButtonElement | null>(null);
  const notificationsPanelRef = useRef<HTMLDivElement | null>(null);

  const dateOptions = [
    { value: "today", label: "Hoje" },
    { value: "yesterday", label: "Ontem" },
    { value: "week", label: "Últimos 7 dias" },
    { value: "month", label: "Últimos 30 dias" },
    { value: "custom", label: "Personalizado" },
  ];

  const renderBreadcrumb = (item: string | BreadcrumbItem, index: number, array: (string | BreadcrumbItem)[]) => {
    const isLast = index === array.length - 1;
    const breadcrumbItem = typeof item === 'string' ? { label: item } : item;
    const hasLink = !isLast && breadcrumbItem.href;

    const content = (
      <span className="inline-flex items-center gap-2">
        {breadcrumbItem.icon && (
          <span className="flex-shrink-0 text-[#0a0a0a]">{breadcrumbItem.icon}</span>
        )}
        <span className={isLast ? 'text-[#737373]' : 'text-[#0a0a0a]'}>
          {breadcrumbItem.label}
        </span>
      </span>
    );

    return (
      <div key={index} className="flex items-center gap-1.5">
        <div className="flex items-center gap-2.5">
          {hasLink ? (
            <Link
              href={breadcrumbItem.href!}
              className="body-sm leading-5 hover:underline hover:text-[#0a0a0a] focus:outline-none focus:underline"
            >
              {content}
            </Link>
          ) : (
            <span className="body-sm leading-5">{content}</span>
          )}
        </div>
        {!isLast && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400 flex-shrink-0">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (!isNotificationsOpen) return;

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const btn = notificationsButtonRef.current;
      const panel = notificationsPanelRef.current;
      if (btn && btn.contains(target)) return;
      if (panel && panel.contains(target)) return;
      setIsNotificationsOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsNotificationsOpen(false);
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isNotificationsOpen]);

  const threeItems = (
    <div className="relative flex items-center gap-3">
      <button className="text-gray-500 hover:text-gray-700 p-1" aria-label="Busca">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      <button
        ref={notificationsButtonRef}
        className="text-gray-500 hover:text-gray-700 p-1"
        aria-label="Notificações"
        aria-expanded={isNotificationsOpen}
        onClick={() => setIsNotificationsOpen((v) => !v)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 2C6.34315 2 5 3.34315 5 5V8.5L3.5 10V11H12.5V10L11 8.5V5C11 3.34315 9.65685 2 8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6.5 11V11.5C6.5 12.3284 7.17157 13 8 13C8.82843 13 9.5 12.3284 9.5 11.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div ref={notificationsPanelRef}>
        <NotificationsPopover
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
      </div>

      <button
        type="button"
        aria-label={isCopilotOpen ? "Fechar AwSales Copilot" : "Abrir AwSales Copilot"}
        className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1fb6ff] focus:ring-offset-2 rounded-full"
        onClick={() => onCopilotOpen?.(!isCopilotOpen)}
      >
        <CopilotOrb size={20} />
      </button>
    </div>
  );

  if (minimal) return threeItems;

  return (
    <div className="bg-white border-b border-[#e5e5e5] px-5 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {breadcrumbs && breadcrumbs.length > 0 && breadcrumbs.map((item, index) =>
            renderBreadcrumb(item, index, breadcrumbs)
          )}
        </div>
        {threeItems}
      </div>
    </div>
  );
}
