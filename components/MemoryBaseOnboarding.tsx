"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NotificationsPopover from "@/components/NotificationsPopover";
import { CopilotOrb } from "@/components/CopilotDrawer";
import Sidebar from "@/components/Sidebar";

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

    // Persist to localStorage
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
      <Sidebar forcedCollapsed={true} />

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
            <NotificationsPopover
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>

          <button
            type="button"
            aria-label="Abrir AwSales Copilot"
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1fb6ff] focus:ring-offset-2 rounded-full"
          >
            <CopilotOrb size={20} />
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
          {/* Memory Base Icon */}
          <div className="mb-8 transition-transform duration-500 ease-out">
            <Image
              src="/assets/Memory-base-icon.svg"
              alt="Memory Base"
              width={122}
              height={128}
              priority
            />
          </div>

          {/* Title */}
          <h1 className="text-[40px] font-heading font-bold text-text-primary mb-6 leading-tight">
            Bem-vindo à Memory Base
          </h1>

          {/* Description */}
          <p className="text-text-secondary text-lg mb-10 max-w-xl leading-relaxed">
            A Memory Base é onde você organiza todo o conhecimento dos seus agentes. 
            Crie bases de conhecimento para armazenar documentos, URLs, snippets e 
            integrações que alimentarão suas conversas inteligentes.
          </p>

          {/* Primary Button */}
          <button
            onClick={handleStartCreation}
            disabled={isAnimating}
            className="inline-flex items-center justify-center px-8 py-4 bg-[#0d0d0d] text-white rounded-xl font-medium text-base hover:bg-[#262626] active:bg-black transition-all duration-200 disabled:opacity-50"
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
          <h2 className="text-[32px] font-heading font-medium text-text-primary mb-8 text-center leading-tight">
            Escolha um nome para a<br />Base de Conhecimento
          </h2>

          {/* Input + Button Row */}
          <div className="flex items-center gap-4 w-full max-w-xl">
            <input
              type="text"
              value={baseName}
              onChange={(e) => setBaseName(e.target.value)}
              placeholder="Ex: BrandBook da Marca 2026"
              className="flex-1 h-14 px-5 text-base border border-[#e5e5e5] rounded-xl bg-white text-[#0d0d0d] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#0d0d0d] focus:border-transparent transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter" && baseName.trim()) {
                  handleCreateBase();
                }
              }}
            />
            <button
              onClick={handleCreateBase}
              disabled={!baseName.trim() || isAnimating}
              className="h-14 px-8 bg-[#0d0d0d] text-white rounded-xl font-medium text-base hover:bg-[#262626] active:bg-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="text-[24px] font-medium text-[#0d0d0d] text-center"
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

      {/* Step 4: First Base Created (Dark Background) – conforme desenho: círculo com grid de pontos + linhas onduladas que emanam até a pasta */}
      <div
        className={`absolute inset-0 transition-all duration-700 ease-out ${
          step === 4 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Dark background */}
        <div className="absolute inset-0 bg-[#0c1421] overflow-hidden">
          {/* Linhas onduladas que EMANAM do círculo (esquerda) → centro (pasta) → direita; roxo/rosa → azul; espessuras variadas */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1200 800"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="onb-lineGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.85" />
                <stop offset="20%" stopColor="#a78bfa" stopOpacity="0.8" />
                <stop offset="45%" stopColor="#8b5cf6" stopOpacity="0.7" />
                <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="onb-lineGradSoft" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            {/* Múltiplas linhas onduladas: origem ~x 200 (círculo), passam pelo centro ~600 (pasta), seguem à direita */}
            <path d="M 200 380 Q 350 320 500 380 Q 650 440 800 380 Q 950 320 1100 380" stroke="url(#onb-lineGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" className="onboarding-waveLine" style={{ animationDelay: "0s" }} />
            <path d="M 200 400 Q 380 360 560 400 Q 740 440 920 400 Q 1050 370 1150 400" stroke="url(#onb-lineGrad)" strokeWidth="2" strokeLinecap="round" fill="none" opacity={0.95} className="onboarding-waveLine" style={{ animationDelay: "0.15s" }} />
            <path d="M 200 420 Q 350 480 500 420 Q 650 360 800 420 Q 950 480 1100 420" stroke="url(#onb-lineGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" className="onboarding-waveLine" style={{ animationDelay: "0.3s" }} />
            <path d="M 180 360 Q 320 300 520 360 T 900 360 T 1100 400" stroke="url(#onb-lineGradSoft)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.8} className="onboarding-waveLine" style={{ animationDelay: "0.05s" }} />
            <path d="M 180 440 Q 320 500 520 440 T 900 440 T 1100 400" stroke="url(#onb-lineGradSoft)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.8} className="onboarding-waveLine" style={{ animationDelay: "0.2s" }} />
            <path d="M 220 370 Q 400 340 600 370 Q 800 400 1000 370" stroke="url(#onb-lineGrad)" strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.7} className="onboarding-waveLine" style={{ animationDelay: "0.1s" }} />
            <path d="M 220 430 Q 400 460 600 430 Q 800 400 1000 430" stroke="url(#onb-lineGrad)" strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.7} className="onboarding-waveLine" style={{ animationDelay: "0.25s" }} />
          </svg>
        </div>

        {/* Conteúdo em cima das linhas – círculo e pasta alinhados às origens das linhas do SVG (~17% e 50%) */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
          <div className="relative w-full max-w-5xl mx-auto mb-8" style={{ minHeight: 160 }}>
            {/* Círculo com grid de pontos (5x5) – origem das linhas onduladas; posicionado ~17% para alinhar ao SVG */}
            <div className="absolute left-[17%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-[68px] h-[68px]">
              <svg width="68" height="68" viewBox="0 0 68 68" fill="none" className="drop-shadow-[0_0_12px_rgba(139,92,246,0.2)]">
                <circle cx="34" cy="34" r="32" fill="#0c1421" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                {[11, 23, 34, 45, 57].map((cx, i) =>
                  [11, 23, 34, 45, 57].map((cy, j) => (
                    <circle key={`${i}-${j}`} cx={cx} cy={cy} r="2.25" fill="rgba(255,255,255,0.92)" />
                  ))
                )}
              </svg>
            </div>
            {/* Pasta com glow no centro (50%) – destino das linhas */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ animation: "onboarding-fadeInUp 0.6s ease-out forwards" }}
            >
              <div
                className="w-[140px] h-[140px] rounded-[20px] bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                style={{ boxShadow: "0 0 24px rgba(125, 211, 252, 0.25), 0 0 48px rgba(125, 211, 252, 0.1)" }}
              >
                <Image
                  src="/assets/folder_data_24dp_1F1F1F_FILL0_wght200_GRAD0_opsz24.svg"
                  alt="Base de Conhecimento"
                  width={80}
                  height={80}
                  className="brightness-0 invert opacity-90"
                />
              </div>
            </div>
          </div>

          <h1
            className="text-[36px] font-heading font-bold text-white mb-4 text-center leading-tight"
            style={{ animation: "onboarding-fadeInUp 0.6s ease-out 0.1s forwards", opacity: 0 }}
          >
            Sua Primeira Base de Conhecimento
          </h1>
          <p
            className="text-white/70 text-lg text-center max-w-xl mb-10 leading-relaxed"
            style={{ animation: "onboarding-fadeInUp 0.6s ease-out 0.2s forwards", opacity: 0 }}
          >
            É o momento perfeito para enriquecer sua base com arquivos, sites, trechos, integrações e muito mais.
          </p>
          <button
            onClick={handleConfigure}
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#0c1421] rounded-xl font-medium text-base hover:bg-gray-100 active:bg-gray-200 transition-all duration-200"
            style={{ animation: "onboarding-fadeInUp 0.6s ease-out 0.3s forwards", opacity: 0 }}
          >
            Configurar
          </button>
        </div>
      </div>
        </main>
      </div>
    </div>
  );
}
