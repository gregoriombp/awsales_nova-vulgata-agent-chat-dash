"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AwNotificationsPanel } from "@/components/ui/AwNotificationsPanel";
import { AwCopilotOrb } from "@/components/ui/AwCopilotDrawer";
import { AwSidebar } from "@/components/ui/AwSidebar";

interface MemoryBaseOnboardingProps {
  onComplete: (baseName: string, baseId: string) => void;
}

type OnboardingStep = 1 | 2 | 3 | 4;

export default function MemoryBaseOnboarding({ onComplete }: MemoryBaseOnboardingProps) {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [baseName, setBaseName] = useState("");
  const [createdBaseId, setCreatedBaseId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsButtonRef = useRef<HTMLButtonElement | null>(null);
  const notificationsPanelRef = useRef<HTMLDivElement | null>(null);

  // Determine if we're on dark background (step 4)
  const isDarkBackground = step === 4;

  // Step 3: Auto-advance to step 4 after animation
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        setStep(4);
      }, 2500); // 2.5 seconds animation
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Handle notifications popover close on outside click
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

  const handleStartCreation = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(2);
      setIsAnimating(false);
    }, 300);
  }, []);

  const handleCreateBase = useCallback(() => {
    if (!baseName.trim()) return;

    // Generate ID and persist the base
    const newBaseId = Math.random().toString(36).substring(7);
    setCreatedBaseId(newBaseId);

    // Persist to localStorage (keys kept for backward compatibility)
    const MEMORY_BASES_STORAGE_KEY = "memory-bases-list";
    try {
      const existing = window.localStorage.getItem(MEMORY_BASES_STORAGE_KEY);
      const bases = existing ? JSON.parse(existing) : [];
      const newBase = {
        id: newBaseId,
        name: baseName.trim(),
        description: "",
        type: "documentos",
        documentCount: 0,
        knowledgeLayersCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
        status: "active",
      };
      bases.push(newBase);
      window.localStorage.setItem(MEMORY_BASES_STORAGE_KEY, JSON.stringify(bases));
      window.localStorage.setItem(`memory-base-name-${newBaseId}`, baseName.trim());
      window.localStorage.setItem(`memory-base-empty-${newBaseId}`, "1");
    } catch (e) {
      console.error("Error persisting base:", e);
    }

    setIsAnimating(true);
    setTimeout(() => {
      setStep(3);
      setIsAnimating(false);
    }, 300);
  }, [baseName]);

  const handleConfigure = useCallback(() => {
    if (createdBaseId) {
      onComplete(baseName, createdBaseId);
      router.push(`/memory-base/${createdBaseId}?name=${encodeURIComponent(baseName)}&new=1`);
    }
  }, [createdBaseId, baseName, onComplete, router]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Sidebar (collapsed) */}
      <AwSidebar forcedCollapsed={true} />

      {/* Main Content Area */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden relative">
        {/* Apenas os três itens: busca, notificações, Copilot (sem navbar) */}
        <div className="absolute top-3 right-5 z-20 flex items-center gap-3">
          <button className={`p-1 transition-colors duration-500 ${isDarkBackground ? "text-white/60 hover:text-white/90" : "text-gray-500 hover:text-gray-700"}`} aria-label="Busca">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          <button
            ref={notificationsButtonRef}
            className={`p-1 transition-colors duration-500 ${isDarkBackground ? "text-white/60 hover:text-white/90" : "text-gray-500 hover:text-gray-700"}`}
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
            <AwNotificationsPanel
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>

          <button
            type="button"
            aria-label="Abrir AwSales Copilot"
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1fb6ff] focus:ring-offset-2 rounded-full"
          >
            <AwCopilotOrb size={20} />
          </button>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden relative">
      {/* Step 1: Welcome Screen */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-out ${
          step === 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center text-center max-w-2xl px-8">
          {/* Memory Base Icon – dots com pulsação (opacidade + escala) e stagger */}
          <div className="mb-8 memory-base-welcome-icon" style={{ width: 122, height: 128 }}>
            <svg
              width={122}
              height={128}
              viewBox="0 0 38 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-[#0d0d0d]"
              aria-hidden
            >
              <path d="M10.8703 16.0546C10.8703 14.7645 9.82441 13.7186 8.53426 13.7186C7.24412 13.7186 6.19824 14.7645 6.19824 16.0546C6.19824 17.3448 7.24412 18.3906 8.53426 18.3906C9.82441 18.3906 10.8703 17.3448 10.8703 16.0546Z" fill="currentColor"/>
              <path d="M17.6515 30.2382C17.6515 28.9481 16.6057 27.9022 15.3155 27.9022C14.0254 27.9022 12.9795 28.9481 12.9795 30.2382C12.9795 31.5283 14.0254 32.5742 15.3155 32.5742C16.6057 32.5742 17.6515 31.5283 17.6515 30.2382Z" fill="currentColor"/>
              <path d="M24.4356 30.2395C24.4356 28.949 23.3894 27.9028 22.0989 27.9028C20.8084 27.9028 19.7622 28.949 19.7622 30.2395C19.7622 31.53 20.8084 32.5762 22.0989 32.5762C23.3894 32.5762 24.4356 31.53 24.4356 30.2395Z" fill="currentColor"/>
              <path d="M24.4356 16.0539C24.4356 14.7634 23.3894 13.7173 22.0989 13.7173C20.8084 13.7173 19.7622 14.7634 19.7622 16.0539C19.7622 17.3445 20.8084 18.3906 22.0989 18.3906C23.3894 18.3906 24.4356 17.3445 24.4356 16.0539Z" fill="currentColor"/>
              <path d="M38.0002 16.0546C38.0002 14.7645 36.9543 13.7186 35.6641 13.7186C34.374 13.7186 33.3281 14.7645 33.3281 16.0546C33.3281 17.3448 34.374 18.3906 35.6641 18.3906C36.9543 18.3906 38.0002 17.3448 38.0002 16.0546Z" fill="currentColor"/>
              <path d="M31.2185 16.0539C31.2185 14.7634 30.1724 13.7173 28.8818 13.7173C27.5913 13.7173 26.5452 14.7634 26.5452 16.0539C26.5452 17.3445 27.5913 18.3906 28.8818 18.3906C30.1724 18.3906 31.2185 17.3445 31.2185 16.0539Z" fill="currentColor"/>
              <path d="M24.4356 8.9602C24.4356 7.66969 23.3894 6.62352 22.0989 6.62352C20.8084 6.62352 19.7622 7.66969 19.7622 8.9602C19.7622 10.2507 20.8084 11.2969 22.0989 11.2969C23.3894 11.2969 24.4356 10.2507 24.4356 8.9602Z" fill="currentColor"/>
              <path d="M31.2172 23.1464C31.2172 21.8563 30.1713 20.8104 28.8812 20.8104C27.591 20.8104 26.5452 21.8563 26.5452 23.1464C26.5452 24.4366 27.591 25.4824 28.8812 25.4824C30.1713 25.4824 31.2172 24.4366 31.2172 23.1464Z" fill="currentColor"/>
              <path d="M10.8703 37.3319C10.8703 36.0418 9.82441 34.9959 8.53426 34.9959C7.24412 34.9959 6.19824 36.0418 6.19824 37.3319C6.19824 38.6221 7.24412 39.668 8.53426 39.668C9.82441 39.668 10.8703 38.6221 10.8703 37.3319Z" fill="currentColor"/>
              <path d="M17.653 37.3319C17.653 36.0418 16.6071 34.9959 15.317 34.9959C14.0268 34.9959 12.981 36.0418 12.981 37.3319C12.981 38.6221 14.0268 39.668 15.317 39.668C16.6071 39.668 17.653 38.6221 17.653 37.3319Z" fill="currentColor"/>
              <path d="M17.4194 16.0514C17.4194 14.89 16.4779 13.9485 15.3165 13.9485C14.1551 13.9485 13.2136 14.89 13.2136 16.0514C13.2136 17.2128 14.1551 18.1543 15.3165 18.1543C16.4779 18.1543 17.4194 17.2128 17.4194 16.0514Z" fill="currentColor"/>
              <path d="M24.0854 23.1446C24.0854 22.0475 23.1961 21.1582 22.0991 21.1582C21.0021 21.1582 20.1128 22.0475 20.1128 23.1446C20.1128 24.2416 21.0021 25.1309 22.0991 25.1309C23.1961 25.1309 24.0854 24.2416 24.0854 23.1446Z" fill="currentColor"/>
              <path d="M17.1859 8.95905C17.1859 7.92678 16.3491 7.08997 15.3168 7.08997C14.2846 7.08997 13.4478 7.92678 13.4478 8.95905C13.4478 9.99131 14.2846 10.8281 15.3168 10.8281C16.3491 10.8281 17.1859 9.99131 17.1859 8.95905Z" fill="currentColor"/>
              <path d="M10.4032 30.2383C10.4032 29.2061 9.56638 28.3693 8.53412 28.3693C7.50186 28.3693 6.66504 29.2061 6.66504 30.2383C6.66504 31.2706 7.50186 32.1074 8.53412 32.1074C9.56638 32.1074 10.4032 31.2706 10.4032 30.2383Z" fill="currentColor"/>
              <path d="M23.9686 1.86921C23.9686 0.836943 23.1318 0.000127427 22.0995 0.000127472C21.0673 0.000127517 20.2305 0.836943 20.2305 1.86921C20.2305 2.90147 21.0673 3.73828 22.0995 3.73828C23.1318 3.73828 23.9686 2.90147 23.9686 1.86921Z" fill="currentColor"/>
              <path d="M37.5326 23.1446C37.5326 22.1123 36.6958 21.2755 35.6635 21.2755C34.6313 21.2755 33.7944 22.1123 33.7944 23.1446C33.7944 24.1769 34.6313 25.0137 35.6635 25.0137C36.6958 25.0137 37.5326 24.1769 37.5326 23.1446Z" fill="currentColor"/>
              <path d="M10.4033 23.1453C10.4033 22.1134 9.56683 21.2768 8.53493 21.2768C7.50303 21.2768 6.66651 22.1134 6.66651 23.1453C6.66651 24.1772 7.50303 25.0137 8.53493 25.0137C9.56683 25.0137 10.4033 24.1772 10.4033 23.1453Z" fill="currentColor"/>
              <path d="M30.6795 30.2385C30.6795 29.2452 29.8742 28.4399 28.8809 28.4399C27.8875 28.4399 27.0823 29.2452 27.0823 30.2385C27.0823 31.2318 27.8875 32.0371 28.8809 32.0371C29.8742 32.0371 30.6795 31.2318 30.6795 30.2385Z" fill="currentColor"/>
              <path d="M3.5037 23.1446C3.5037 22.1771 2.71937 21.3928 1.75185 21.3928C0.784331 21.3928 1.61507e-06 22.1771 1.65736e-06 23.1446C1.69965e-06 24.1122 0.784332 24.8965 1.75185 24.8965C2.71937 24.8965 3.5037 24.1122 3.5037 23.1446Z" fill="currentColor"/>
              <path d="M16.9507 1.86668C16.9507 0.963537 16.2186 0.231397 15.3155 0.231397C14.4123 0.231397 13.6802 0.963537 13.6802 1.86668C13.6802 2.76982 14.4123 3.50195 15.3155 3.50195C16.2186 3.50195 16.9507 2.76982 16.9507 1.86668Z" fill="currentColor"/>
              <path d="M9.93758 8.96114C9.93758 8.18676 9.30982 7.55901 8.53544 7.55901C7.76106 7.55901 7.1333 8.18676 7.1333 8.96114C7.1333 9.73552 7.76106 10.3633 8.53544 10.3633C9.30982 10.3633 9.93758 9.73552 9.93758 8.96114Z" fill="currentColor"/>
              <path d="M30.1967 37.3319C30.1967 36.6059 29.6082 36.0174 28.8822 36.0174C28.1562 36.0174 27.5676 36.6059 27.5676 37.3319C27.5676 38.0579 28.1562 38.6465 28.8822 38.6465C29.6082 38.6465 30.1967 38.0579 30.1967 37.3319Z" fill="currentColor"/>
              <path d="M30.1062 8.9573C30.1062 8.28004 29.5571 7.731 28.8799 7.731C28.2026 7.731 27.6536 8.28004 27.6536 8.9573C27.6536 9.63456 28.2026 10.1836 28.8799 10.1836C29.5571 10.1836 30.1062 9.63456 30.1062 8.9573Z" fill="currentColor"/>
              <path d="M36.8318 37.3336C36.8318 36.6884 36.3087 36.1653 35.6635 36.1653C35.0182 36.1653 34.4951 36.6884 34.4951 37.3336C34.4951 37.9789 35.0182 38.502 35.6635 38.502C36.3087 38.502 36.8318 37.9789 36.8318 37.3336Z" fill="currentColor"/>
              <path d="M16.4851 23.1442C16.4851 22.4989 15.962 21.9758 15.3168 21.9758C14.6715 21.9758 14.1484 22.4989 14.1484 23.1442C14.1484 23.7894 14.6715 24.3125 15.3168 24.3125C15.962 24.3125 16.4851 23.7894 16.4851 23.1442Z" fill="currentColor"/>
              <path d="M2.91984 30.2386C2.91984 29.5937 2.39705 29.0709 1.75215 29.0709C1.10726 29.0709 0.584474 29.5937 0.584474 30.2386C0.584474 30.8835 1.10726 31.4062 1.75215 31.4062C2.39705 31.4062 2.91984 30.8835 2.91984 30.2386Z" fill="currentColor"/>
              <path d="M2.21733 16.0545C2.21733 15.7967 2.00827 15.5876 1.75039 15.5876C1.49251 15.5876 1.28345 15.7967 1.28345 16.0545C1.28345 16.3124 1.49251 16.5215 1.75039 16.5215C2.00827 16.5215 2.21733 16.3124 2.21733 16.0545Z" fill="currentColor"/>
            </svg>
          </div>

          {/* Title */}
          <h1 className=" font-heading font-regular text-text-primary mb-6 leading-tight">
            Bem-vindo à Memory Base
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-md mb-10 max-w-xl leading-relaxed">
            O Memory Base é onde você organiza todo o conhecimento dos seus agentes. 
            Crie bases de conhecimento para armazenar documentos, URLs, snippets e 
            integrações que alimentarão suas conversas inteligentes.
          </p>

          {/* Primary Button */}
          <button
            onClick={handleStartCreation}
            disabled={isAnimating}
            className="inline-flex items-center justify-center px-8 py-4 bg-[#0d0d0d] text-white rounded-xl font-medium body-md hover:bg-[#262626] active:bg-black transition-all duration-200 disabled:opacity-50"
          >
            Criar Base de Conhecimento
          </button>
        </div>
      </div>

      {/* Step 2: Creation + Branching Animation */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-out ${
          step === 2 ? "opacity-100 translate-y-0" : step > 2 ? "opacity-0 -translate-y-8 pointer-events-none" : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center w-full max-w-3xl px-8">
          {/* Branching Animation Container */}
          <div className="relative flex items-center justify-center gap-8 mb-12 h-[200px]">
            {/* Memory Base Icon (left) */}
            <div className="relative flex items-center justify-center">
              <div className="w-[110px] h-[110px] rounded-full bg-[#f5f5f5] flex items-center justify-center animate-onboarding-pulse">
                <Image
                  src="/assets/Memory-base-icon.svg"
                  alt="Memory Base"
                  width={56}
                  height={58}
                />
              </div>
            </div>

            {/* Branching Lines */}
            <svg
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[120px] pointer-events-none"
              viewBox="0 0 300 120"
              fill="none"
            >
              {/* Main branch line */}
              <path
                d="M 40 60 Q 100 60 150 60 T 260 60"
                stroke="url(#branchGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-onboarding-draw"
                style={{
                  strokeDasharray: 300,
                  strokeDashoffset: 300,
                  animation: "onboarding-draw 0.8s ease-out forwards",
                }}
              />
              {/* Secondary branch lines */}
              <path
                d="M 150 60 Q 180 40 210 30"
                stroke="url(#branchGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.5"
                style={{
                  strokeDasharray: 100,
                  strokeDashoffset: 100,
                  animation: "onboarding-draw 0.6s ease-out 0.3s forwards",
                }}
              />
              <path
                d="M 150 60 Q 180 80 210 90"
                stroke="url(#branchGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.5"
                style={{
                  strokeDasharray: 100,
                  strokeDashoffset: 100,
                  animation: "onboarding-draw 0.6s ease-out 0.4s forwards",
                }}
              />
              <defs>
                <linearGradient id="branchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0d0d0d" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#404040" />
                  <stop offset="100%" stopColor="#0d0d0d" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>

            {/* Knowledge Base Icon (right) */}
            <div
              className="relative flex items-center justify-center"
              style={{
                animation: "onboarding-fadeInRight 0.6s ease-out 0.2s forwards",
                opacity: 0,
              }}
            >
              <div className="w-[180px] h-[180px] rounded-[24px] border-2 border-[#e5e5e5] bg-white flex items-center justify-center shadow-sm">
                <Image
                  src="/assets/folder_data_24dp_1F1F1F_FILL0_wght200_GRAD0_opsz24.svg"
                  alt="Base de Conhecimento"
                  width={100}
                  height={100}
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className=" font-heading font-medium text-text-primary mb-8 text-center leading-tight">
            Escolha um nome para a<br />Base de Conhecimento
          </h2>

          {/* Input + Button Row */}
          <div className="flex items-center gap-4 w-full max-w-xl">
            <input
              type="text"
              value={baseName}
              onChange={(e) => setBaseName(e.target.value)}
              placeholder="Ex: BrandBook da Marca 2026"
              className="flex-1 h-14 px-5 body-md border border-[#e5e5e5] rounded-xl bg-white text-[#0d0d0d] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#0d0d0d] focus:border-transparent transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter" && baseName.trim()) {
                  handleCreateBase();
                }
              }}
            />
            <button
              onClick={handleCreateBase}
              disabled={!baseName.trim() || isAnimating}
              className="h-14 px-8 bg-[#0d0d0d] text-white rounded-xl font-medium body-md hover:bg-[#262626] active:bg-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Criar
            </button>
          </div>
        </div>
      </div>

      {/* Step 3: Confirmation Animation */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-out ${
          step === 3 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center">
          {/* Centered Knowledge Base Icon with name */}
          <div
            className="flex flex-col items-center"
            style={{
              animation: step === 3 ? "onboarding-centerDrop 0.8s ease-out forwards" : "none",
            }}
          >
            <div className="w-[180px] h-[180px] rounded-[24px] border-2 border-[#e5e5e5] bg-white flex items-center justify-center shadow-lg mb-6">
              <Image
                src="/assets/folder_data_24dp_1F1F1F_FILL0_wght200_GRAD0_opsz24.svg"
                alt="Base de Conhecimento"
                width={100}
                height={100}
              />
            </div>

            {/* Base Name */}
            <p
              className="body-xl font-medium text-[#0d0d0d] text-center"
              style={{
                animation: step === 3 ? "onboarding-fadeIn 0.5s ease-out 0.5s forwards" : "none",
                opacity: 0,
              }}
            >
              {baseName}
            </p>
          </div>
        </div>
      </div>

      {/* Step 4: Timeline com ramificações – eixo principal + ramos + nó inicial (grid) + card no fim do ramo */}
      <div
        className={`absolute inset-0 transition-all duration-700 ease-out ${
          step === 4 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-[#0a0e17] overflow-hidden">
          {/* Linhas fluidas e swirl (fundo) – rosa/roxo → azul/teal */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1200 700"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="step4-timeline-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.95" />
                <stop offset="40%" stopColor="#a78bfa" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="step4-branch-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            {/* Eixo principal da timeline: horizontal esquerda -> centro */}
            <path d="M 180 350 L 580 350" stroke="url(#step4-timeline-grad)" strokeWidth="3" strokeLinecap="round" fill="none" className="step4-timeline-spine" />
            {/* Ramificação principal: do eixo até o card (curva para baixo) */}
            <path d="M 580 350 Q 720 350 720 480 L 720 520" stroke="url(#step4-branch-grad)" strokeWidth="2.5" strokeLinecap="round" fill="none" className="step4-timeline-branch" />
            {/* Ramificações pequenas saindo do eixo */}
            <path d="M 380 350 L 400 260" stroke="url(#step4-timeline-grad)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.85" className="step4-timeline-ramif step4-ramif-1" />
            <path d="M 480 350 L 510 420" stroke="url(#step4-timeline-grad)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.85" className="step4-timeline-ramif step4-ramif-2" />
            <path d="M 580 350 L 640 320" stroke="url(#step4-branch-grad)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8" className="step4-timeline-ramif step4-ramif-3" />
            <circle cx="720" cy="520" r="6" fill="rgba(125,211,252,0.9)" className="step4-node-end" />
            <circle cx="280" cy="350" r="4" fill="rgba(167,139,250,0.9)" className="step4-node-dot" />
            <circle cx="430" cy="350" r="4" fill="rgba(167,139,250,0.9)" className="step4-node-dot" />
            <circle cx="580" cy="350" r="5" fill="rgba(6,182,212,0.95)" className="step4-node-junction" />
          </svg>
        </div>

        {/* Nó inicial da timeline: grid de pontos (esquerda) */}
        <div className="absolute step4-node-start" style={{ left: "15%", top: "50%", transform: "translate(-50%, -50%)" }} aria-hidden>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="step4-dotted-node">
            <circle cx="28" cy="28" r="26" fill="#0a0e17" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            {[10, 22, 34, 46].map((cx, i) =>
              [10, 22, 34, 46].map((cy, j) => (
                <circle key={`${i}-${j}`} cx={cx} cy={cy} r="2" fill="rgba(255,255,255,0.9)" className="step4-cube-dot" />
              ))
            )}
          </svg>
        </div>

        {/* Bloco central: ícone → título → descrição → botão */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-6 py-12">
          <div className="flex flex-col items-center text-center max-w-xl">
            {/* Ícone pasta + glow */}
            <div
              className="step4-icon-wrap mb-8"
              style={{ animation: "step4-content-in 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both" }}
            >
              <div
                className="w-[120px] h-[120px] rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
                style={{ boxShadow: "0 0 32px rgba(125,211,252,0.3), 0 0 64px rgba(139,92,246,0.15)" }}
              >
                <Image
                  src="/assets/folder_data_24dp_1F1F1F_FILL0_wght200_GRAD0_opsz24.svg"
                  alt="Base de Conhecimento"
                  width={64}
                  height={64}
                  className="brightness-0 invert opacity-95"
                />
              </div>
            </div>

            <h1
              className=" sm: font-heading font-bold text-white mb-4 leading-tight"
              style={{ animation: "step4-content-in 0.7s cubic-bezier(0.22,1,0.36,1) 0.25s both" }}
            >
              Sua Primeira Base de Conhecimento
            </h1>
            <p
              className="text-white/75 body-md sm:body-lg mb-10 leading-relaxed"
              style={{ animation: "step4-content-in 0.7s cubic-bezier(0.22,1,0.36,1) 0.4s both" }}
            >
              É o momento perfeito para enriquecer sua base com arquivos, sites, trechos, integrações e muito mais.
            </p>
            <button
              onClick={handleConfigure}
              className="step4-cta inline-flex items-center justify-center px-8 py-4 bg-white text-[#0a0e17] rounded-xl font-semibold body-md hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-black/20"
              style={{ animation: "step4-content-in 0.7s cubic-bezier(0.22,1,0.36,1) 0.55s both" }}
            >
              Configurar
            </button>
          </div>
        </div>
      </div>
        </main>
      </div>
    </div>
  );
}
