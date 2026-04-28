"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

interface KnowledgeBase {
  id: string;
  name: string;
  knowledgeLayers: number;
  sources: number;
}

const KNOWLEDGE_BASES: KnowledgeBase[] = [
  {
    id: "fyntra-2026",
    name: "Fyntra | Dados Gerais 2026",
    knowledgeLayers: 178,
    sources: 5,
  },
  {
    id: "awsales-foundations",
    name: "AwSales | Foundations da Marca 2024",
    knowledgeLayers: 0,
    sources: 0,
  },
  {
    id: "info-pessoais-greg",
    name: "Informações Pessoas (Greg)",
    knowledgeLayers: 0,
    sources: 0,
  },
];

export default function AgentSettingsPage() {
  const router = useRouter();
  const [agentName, setAgentName] = useState("");
  const [selectedBase, setSelectedBase] = useState<string | null>(null);

  const canAdvance = agentName.trim().length > 0 && selectedBase !== null;

  const breadcrumbs = [
    {
      label: "Agent Studio",
      href: "/agent-studio",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.75 15.625C3.75 16.3125 4.0625 16.5625 4.6875 16.875L10 18.75L15.3125 16.875C15.9375 16.5625 16.25 16.3125 16.25 15.625V7.1875C16.25 6.5 15.9375 6.25 15.3125 5.9375L10 4.0625L4.6875 5.9375C4.0625 6.25 3.75 6.5 3.75 7.1875V15.625Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M10 4.0625V18.75"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M16.25 7.1875L10 10L3.75 7.1875"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
    },
    { label: "Novo Agente", href: "/agent-studio/new" },
    { label: "Ajustes" },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col items-center justify-center w-full min-h-full bg-white">
        <div className="flex flex-col gap-8 w-full max-w-[796px] py-12">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <h3 className="font-heading font-medium text-[28px] leading-none text-gray-1200">
              Ajustes
            </h3>
            <p className="text-base leading-[1.6] tracking-[-0.32px] text-[#999]">
              Defina o nome e a base de conhecimento do seu agente
            </p>
          </div>

          {/* Agent Name Input */}
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2">
              <label className="text-sm leading-[1.2] text-gray-1200">
                Nome do agente
              </label>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#999]"
              >
                <circle
                  cx="6"
                  cy="6"
                  r="5.25"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <path
                  d="M6 5.5V8.5"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <circle cx="6" cy="4" r="0.5" fill="currentColor" />
              </svg>
            </div>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Ex.: Assistente de vendas"
              className="w-full h-10 bg-white border border-[#d1d1d1] rounded-lg px-4 text-xs font-heading placeholder:text-[#b8b8b8] focus:outline-none focus:ring-2 focus:ring-gray-1200/20 focus:border-gray-1200 transition-all"
            />
          </div>

          {/* Knowledge Base Selection */}
          <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-2">
              <h6 className="font-heading font-medium text-lg leading-none text-gray-1200">
                Base de Conhecimento
              </h6>
              <p className="text-sm leading-[1.2] text-[#999]">
                Selecione de qual base de dados da Memory Base seu agente vai
                buscar informações para responder
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {KNOWLEDGE_BASES.map((base) => (
                <button
                  key={base.id}
                  type="button"
                  onClick={() => setSelectedBase(base.id)}
                  className={`flex items-center gap-3 p-6 rounded-2xl border transition-all text-left ${
                    selectedBase === base.id
                      ? "border-gray-1200 bg-white ring-1 ring-gray-1200"
                      : "border-[#f2f2f2] bg-white hover:border-[#d1d1d1]"
                  }`}
                >
                  {/* Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Folder Icon */}
                    <div className="flex items-center justify-center w-10 h-10 bg-[#f2f2f2] rounded-xl shrink-0">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#5e5e5e]"
                      >
                        <path
                          d="M2.5 5.833V14.167C2.5 15.087 3.246 15.833 4.167 15.833H15.833C16.754 15.833 17.5 15.087 17.5 14.167V7.5C17.5 6.58 16.754 5.833 15.833 5.833H10L8.333 4.167H4.167C3.246 4.167 2.5 4.913 2.5 5.833Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {/* Text Info */}
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-semibold text-base leading-[1.2] text-[#1a1a1a] truncate">
                        {base.name}
                      </span>
                      <div className="flex items-center gap-4 opacity-80">
                        <div className="flex items-center gap-1.5">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-[#5e5e5e] shrink-0"
                          >
                            <path
                              d="M2 4H10M2 6H10M2 8H10"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="text-xs leading-[1.4] text-[#5e5e5e] font-heading whitespace-nowrap">
                            {base.knowledgeLayers} Knowledge Layers
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-[#5e5e5e] shrink-0"
                          >
                            <path
                              d="M3.5 1.5V3M8.5 1.5V3M1.5 5H10.5M2.5 2H9.5C10.052 2 10.5 2.448 10.5 3V10C10.5 10.552 10.048 11 9.5 11H2.5C1.948 11 1.5 10.552 1.5 10V3C1.5 2.448 1.948 2 2.5 2Z"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="text-xs leading-[1.4] text-[#5e5e5e] font-heading whitespace-nowrap">
                            {base.sources} Fontes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Radio Button */}
                  <div className="shrink-0">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedBase === base.id
                          ? "border-gray-1200"
                          : "border-[#d1d1d1]"
                      }`}
                    >
                      {selectedBase === base.id && (
                        <div className="w-2 h-2 rounded-full bg-gray-1200" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 h-10 pl-4 pr-6 border border-[#d1d1d1] rounded-xl font-heading font-medium text-base leading-none tracking-[-0.1px] text-gray-1200 hover:bg-[#f5f5f5] transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 12L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Voltar
            </button>

            <button
              type="button"
              disabled={!canAdvance}
              onClick={() => {
                if (canAdvance) {
                  router.push("/agent-studio/new");
                }
              }}
              className={`flex items-center gap-2 h-10 px-6 rounded-xl font-heading font-medium text-base leading-none tracking-[-0.1px] transition-colors ${
                canAdvance
                  ? "bg-gray-1200 text-white hover:bg-[#111111]"
                  : "bg-[#e5e5e5] text-[#d1d1d1] cursor-not-allowed"
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
