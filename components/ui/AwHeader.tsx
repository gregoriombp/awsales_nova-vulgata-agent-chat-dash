"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AwNotificationsPanel } from "@/components/ui/AwNotificationsPanel";
import { AwCopilotOrb } from "@/components/ui/AwCopilotDrawer";
import { AwInput } from "@/components/ui/AwInput";
import { AwButton } from "@/components/ui/AwButton";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export function AwHeader({
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
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const openSearch = () => {
    setIsSearchOpen(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const handleSearchBlur = () => {
    if (!searchValue) setIsSearchOpen(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchValue("");
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

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
          <span className="flex-shrink-0 text-[var(--fg-primary)]">{breadcrumbItem.icon}</span>
        )}
        <span className={isLast ? 'text-[var(--fg-tertiary)]' : 'text-[var(--fg-primary)]'}>
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
              className="body-sm leading-5 hover:underline hover:text-[var(--fg-primary)] focus:outline-none focus:underline"
            >
              {content}
            </Link>
          ) : (
            <span className="body-sm leading-5">{content}</span>
          )}
        </div>
        {!isLast && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--fg-tertiary)] flex-shrink-0">
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
    <div className="relative flex items-center gap-2">
      <div
        className="relative shrink-0 overflow-hidden transition-[width] duration-300 ease-out"
        style={{ width: isSearchOpen ? 240 : 30, height: 34 }}
      >
        <AwInput
          ref={searchInputRef}
          placeholder="Buscar..."
          iconLeft="search"
          dense
          aria-label="Busca"
          className={`w-[240px] transition-colors duration-200 ${
            isSearchOpen ? "" : "!border-transparent !bg-transparent"
          }`}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onBlur={handleSearchBlur}
          onKeyDown={handleSearchKeyDown}
          tabIndex={isSearchOpen ? 0 : -1}
        />
        {!isSearchOpen && (
          <button
            type="button"
            aria-label="Abrir busca"
            onClick={openSearch}
            className="absolute inset-0 cursor-pointer rounded-full hover:bg-[var(--bg-surface)] transition-colors"
          />
        )}
      </div>

      <AwButton
        ref={notificationsButtonRef}
        variant="ghost"
        size="sm"
        iconOnly="notifications"
        aria-label="Notificações"
        aria-expanded={isNotificationsOpen}
        onClick={() => setIsNotificationsOpen((v) => !v)}
      />

      <div ref={notificationsPanelRef}>
        <AwNotificationsPanel
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
      </div>

      <button
        type="button"
        aria-label={isCopilotOpen ? "Fechar AwSales Copilot" : "Abrir AwSales Copilot"}
        className="cursor-pointer rounded-full ml-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg-primary)] focus-visible:ring-offset-2"
        onClick={() => onCopilotOpen?.(!isCopilotOpen)}
      >
        <AwCopilotOrb size={28} />
      </button>
    </div>
  );

  if (minimal) return threeItems;

  return (
    <div className="bg-[var(--bg-raised)] border-b border-[var(--border-default)] px-5 py-3">
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
