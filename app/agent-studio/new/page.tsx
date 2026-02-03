"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

// Icon components for each goal
const SalesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="#0d1013" strokeWidth="1.5" fill="none"/>
    <path d="M12 8V12L15 15" stroke="#0d1013" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="2" stroke="#0d1013" strokeWidth="1.5"/>
  </svg>
);

const RecoveryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12C3 7.02944 7.02944 3 12 3C14.8273 3 17.35 4.30367 19 6.34267V4" stroke="#0d1013" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12C21 16.9706 16.9706 21 12 21C9.17273 21 6.65 19.6963 5 17.6573V20" stroke="#0d1013" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5" cy="4" r="1" fill="#0d1013"/>
    <circle cx="19" cy="20" r="1" fill="#0d1013"/>
  </svg>
);

const OnboardingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H20M4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6M4 6L6 4H18L20 6" stroke="#0d1013" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 14L11 17L16 10" stroke="#0d1013" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LeadCaptureIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L12 22" stroke="#0d1013" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2 12L22 12" stroke="#0d1013" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="5" cy="8" r="1.5" fill="#0d1013"/>
    <circle cx="12" cy="5" r="1.5" fill="#0d1013"/>
    <circle cx="19" cy="12" r="1.5" fill="#0d1013"/>
    <circle cx="12" cy="19" r="1.5" fill="#0d1013"/>
  </svg>
);

const CSLaunchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#0d1013" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="16" cy="6" r="1.5" fill="#0d1013"/>
    <circle cx="18" cy="16" r="1.5" fill="#0d1013"/>
  </svg>
);

const SchedulingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2V6" stroke="#0d1013" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 2V6" stroke="#0d1013" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3 9H21" stroke="#0d1013" strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#0d1013" strokeWidth="1.5" fill="none"/>
    <circle cx="8" cy="14" r="1" fill="#0d1013"/>
    <circle cx="12" cy="14" r="1" fill="#0d1013"/>
    <circle cx="16" cy="14" r="1" fill="#0d1013"/>
    <circle cx="8" cy="18" r="1" fill="#0d1013"/>
    <circle cx="12" cy="18" r="1" fill="#0d1013"/>
  </svg>
);

const SupportIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" stroke="#0d1013" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M22 22L18 18" stroke="#0d1013" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M11.5 7V12L15 14" stroke="#0d1013" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: "vendas",
    title: "Vendas",
    description: "Fechar vendas diretamente na conversa.",
    icon: <SalesIcon />,
  },
  {
    id: "recuperacao",
    title: "Recuperação de Vendas",
    description: "Retomar leads que demonstraram interesse.",
    icon: <RecoveryIcon />,
  },
  {
    id: "onboarding",
    title: "Onboarding",
    description: "Ajudar novos clientes a dar os primeiros passos.",
    icon: <OnboardingIcon />,
  },
  {
    id: "captacao",
    title: "Captação de Lead",
    description: "Coletar informações e qualificar novos contatos.",
    icon: <LeadCaptureIcon />,
  },
  {
    id: "cs-lancamento",
    title: "CS / Lançamento",
    description: "Engajar inscritos e aumentar participação.",
    icon: <CSLaunchIcon />,
  },
  {
    id: "agendamento",
    title: "Agendamento",
    description: "Qualificar e conduzir o lead até o agendamento.",
    icon: <SchedulingIcon />,
  },
  {
    id: "suporte",
    title: "Suporte e Atendimento",
    description: "Resolver dúvidas e problemas de forma eficiente.",
    icon: <SupportIcon />,
  },
];

export default function AgentStudioNewPage() {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState("www.artificialconcord.com");
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState("");
  const [isUrlValid, setIsUrlValid] = useState(true);

  const breadcrumbs = [
    {
      label: "Agent Studio",
      href: "/agent-studio",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.75 15.625C3.75 16.3125 4.0625 16.5625 4.6875 16.875L10 18.75L15.3125 16.875C15.9375 16.5625 16.25 16.3125 16.25 15.625V7.1875C16.25 6.5 15.9375 6.25 15.3125 5.9375L10 4.0625L4.6875 5.9375C4.0625 6.25 3.75 6.5 3.75 7.1875V15.625Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M10 4.0625V18.75" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16.25 7.1875L10 10L3.75 7.1875" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
    },
    "Configurar",
  ];

  const canAdvance = (selectedGoal || customGoal.trim()) && websiteUrl.trim();

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    setCustomGoal("");
  };

  const handleCustomGoalChange = (value: string) => {
    setCustomGoal(value);
    if (value.trim()) {
      setSelectedGoal(null);
    }
  };

  const handleBack = () => {
    router.push("/agent-studio");
  };

  const handleAdvance = () => {
    if (canAdvance) {
      // TODO: Save the configuration and navigate to next step
      const goal = selectedGoal || customGoal;
      console.log("Advancing with:", { websiteUrl, goal });
      // For now, navigate to agent detail page
      router.push("/agent-studio/new-agent");
    }
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} mainClassName="!p-0 !overflow-hidden">
      <div className="flex min-h-full w-full items-center justify-center bg-white p-6">
        {/* Main dialog container */}
        <div className="w-full max-w-[1100px] bg-white rounded-[18px] px-8 py-10 md:px-14 md:py-11 flex flex-col gap-8">
          {/* Header: Title and description */}
          <div className="text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-medium text-[#0d1013] tracking-[-1px] mb-2">
              Qual o seu objetivo?
            </h1>
            <p className="text-base text-[#9d9d9d] font-sans">
              Vendas, atendimento, SDR.. como a AwSales pode te ajudar?
            </p>
          </div>

          {/* Website URL input */}
          <div className="w-full">
            <div className={`flex items-center justify-between h-12 px-4 bg-white border rounded-[14px] transition-colors ${
              isUrlValid ? "border-[#989b9f]" : "border-red-500"
            }`}>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="www.seusite.com"
                className="flex-1 text-base text-[#555] bg-transparent outline-none font-sans"
              />
              {websiteUrl && isUrlValid && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8.5L6.5 12L13 4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>

          {/* Goal options grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GOAL_OPTIONS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => handleGoalSelect(goal.id)}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl border transition-all duration-200 text-left ${
                  selectedGoal === goal.id
                    ? "bg-white border-[#3848ff] ring-1 ring-[#3848ff]"
                    : "bg-[#f9fafb] border-transparent hover:border-[#e9e9ea] hover:bg-[#f5f5f5]"
                }`}
              >
                {/* Icon container */}
                <div className="w-[42px] h-[42px] flex items-center justify-center bg-white border border-[#e9e9ea] rounded-[10px] shrink-0">
                  {goal.icon}
                </div>
                
                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-medium text-base text-[#0d1013] leading-5">
                    {goal.title}
                  </h3>
                  <p className="font-sans text-sm text-[#6b7280] leading-tight mt-1 truncate">
                    {goal.description}
                  </p>
                </div>

                {/* Checkbox */}
                <div className={`w-6 h-6 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                  selectedGoal === goal.id
                    ? "bg-[#3848ff] border-[#3848ff]"
                    : "border-[#d1d5db] bg-white"
                }`}>
                  {selectedGoal === goal.id && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </button>
            ))}

            {/* Custom goal input */}
            <button
              onClick={() => document.getElementById("custom-goal-input")?.focus()}
              className={`flex items-center px-4 py-4 rounded-xl border transition-all duration-200 col-span-1 ${
                customGoal.trim()
                  ? "bg-white border-[#3848ff] ring-1 ring-[#3848ff]"
                  : "bg-white border-[#3848ff]"
              }`}
            >
              <input
                id="custom-goal-input"
                type="text"
                value={customGoal}
                onChange={(e) => handleCustomGoalChange(e.target.value)}
                placeholder="Ou digite o seu objetivo aqui..."
                className="flex-1 text-base font-heading font-medium text-[#0d1013] placeholder:text-[#0d1013]/20 bg-transparent outline-none"
              />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              onClick={handleBack}
              className="h-12 px-4 flex items-center justify-center border border-[#e9e9ea] rounded-xl font-heading font-medium text-base text-[#161a21] hover:bg-[#f5f5f5] transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleAdvance}
              disabled={!canAdvance}
              className={`h-10 px-4 flex items-center justify-center rounded-xl font-heading font-medium text-base transition-colors ${
                canAdvance
                  ? "bg-[#0d0d0d] text-white hover:bg-[#111111]"
                  : "bg-[#f5f5f5] text-[#d9d9d9] cursor-not-allowed"
              }`}
            >
              Avançar
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
