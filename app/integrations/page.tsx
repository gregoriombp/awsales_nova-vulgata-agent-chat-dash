"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface Integration {
  id: string;
  name: string;
  description: string;
  iconLetter: string;
  iconBg: string;
  connected: boolean;
}

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "Integre assistentes de IA para respostas automáticas e suporte inteligente nas conversas.",
    iconLetter: "C",
    iconBg: "bg-[#0d0d0d]",
    connected: true,
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Marketing, automação e email marketing em uma única plataforma para crescer seu negócio.",
    iconLetter: "M",
    iconBg: "bg-[#ffe01b]",
    connected: false,
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Conecte milhares de apps e automatize fluxos de trabalho sem código.",
    iconLetter: "Z",
    iconBg: "bg-[#ff4a00]",
    connected: false,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Mantenha sua equipe alinhada com mensagens, canais e integrações em um só lugar.",
    iconLetter: "S",
    iconBg: "bg-[#4a154b]",
    connected: false,
  },
  {
    id: "square",
    name: "Square",
    description: "Comece a vender com processamento de pagamentos e soluções de ponto de venda.",
    iconLetter: "Sq",
    iconBg: "bg-[#0d0d0d]",
    connected: true,
  },
  {
    id: "webflow",
    name: "Webflow",
    description: "Crie sites profissionais e personalizados em um canvas visual, sem código.",
    iconLetter: "W",
    iconBg: "bg-[#4353ff]",
    connected: true,
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Conecte os arquivos e o armazenamento em nuvem da sua equipe aos projetos atuais.",
    iconLetter: "D",
    iconBg: "bg-[#0061ff]",
    connected: false,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "APIs para processamento de pagamentos online e soluções de comércio.",
    iconLetter: "S",
    iconBg: "bg-[#635bff]",
    connected: false,
  },
  {
    id: "asana",
    name: "Asana",
    description: "Rastreie, gerencie e conecte seus projetos em qualquer equipe, direto do painel.",
    iconLetter: "A",
    iconBg: "bg-[#f06a6a]",
    connected: false,
  },
  {
    id: "linear",
    name: "Linear",
    description: "Gestão de issues e ciclos para times de produto que valorizam velocidade.",
    iconLetter: "L",
    iconBg: "bg-[#5e6ad2]",
    connected: false,
  },
];

export default function IntegrationsPage() {
  const [search, setSearch] = useState("");
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);

  const filtered = integrations.filter(
    (i) =>
      i.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      i.description.toLowerCase().includes(search.trim().toLowerCase())
  );

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i))
    );
  };

  const breadcrumbs = [
    {
      label: "Integrações",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M7.5 5C7.5 4.375 7.8125 3.75 8.4375 3.4375L9.375 3.125C9.75 2.96875 10.25 2.96875 10.625 3.125L11.5625 3.4375C12.1875 3.75 12.5 4.375 12.5 5V6.5625C12.5 7.1875 12.1875 7.8125 11.5625 8.125L10.625 8.4375C10.25 8.59375 9.75 8.59375 9.375 8.4375L8.4375 8.125C7.8125 7.8125 7.5 7.1875 7.5 6.5625V5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M3.75 12.5C3.75 11.875 4.0625 11.25 4.6875 10.9375L5.625 10.625C6 10.4688 6.5 10.4688 6.875 10.625L7.8125 10.9375C8.4375 11.25 8.75 11.875 8.75 12.5V14.0625C8.75 14.6875 8.4375 15.3125 7.8125 15.625L6.875 15.9375C6.5 16.0938 6 16.0938 5.625 15.9375L4.6875 15.625C4.0625 15.3125 3.75 14.6875 3.75 14.0625V12.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M11.25 12.5C11.25 11.875 11.5625 11.25 12.1875 10.9375L13.125 10.625C13.5 10.4688 14 10.4688 14.375 10.625L15.3125 10.9375C15.9375 11.25 16.25 11.875 16.25 12.5V14.0625C16.25 14.6875 15.9375 15.3125 15.3125 15.625L14.375 15.9375C14 16.0938 13.5 16.0938 13.125 15.9375L12.1875 15.625C11.5625 15.3125 11.25 14.6875 11.25 14.0625V12.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      ),
    },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8">
        {/* Header – padrão do design system */}
        <div className="bg-white border-b border-[#f2f2f2]">
          <div className="mx-auto max-w-[1544px] px-12 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-[#1a1a1a]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-[40px] font-medium text-[#1a1a1a] leading-none">
                    Integrações e workflows
                  </h1>
                  <p className="mt-2 text-[14px] text-[#5e5e5e]">
                    Potencialize seu fluxo e conecte as ferramentas que você e sua equipe usam no dia a dia.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Buscar integrações"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-[280px] h-10 px-4 border border-[#e5e5e5] rounded-lg bg-white text-[14px] text-[#1a1a1a] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#0d0d0d] focus:border-transparent"
                />
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#e5e5e5] rounded-lg bg-white text-[14px] font-medium text-[#1a1a1a] hover:bg-[#fbfcfd] hover:border-[#d4d4d4] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 12.6667V3.33333M8 3.33333L4 7.33333M8 3.33333L12 7.33333"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Exportar integrações
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content – grid de cards */}
        <div className="bg-white">
          <div className="mx-auto max-w-[1544px] px-12 pt-10 pb-14">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((integration) => (
                <div
                  key={integration.id}
                  className="bg-[#fbfcfd] border border-[#f2f2f2] rounded-[20px] p-6 flex flex-col min-h-[220px] transition-colors hover:border-[#e5e5e5]"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-semibold flex-shrink-0 ${integration.iconBg}`}
                    >
                      {integration.iconLetter}
                    </div>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-[#5e5e5e] hover:text-[#1a1a1a] hover:bg-[#f2f2f2] transition-colors"
                      aria-label="Abrir em nova aba"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-2">
                    {integration.name}
                  </h3>
                  <p className="text-[13px] text-[#5e5e5e] leading-snug flex-1 mb-5 line-clamp-3">
                    {integration.description}
                  </p>
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#f2f2f2]">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium border border-[#e5e5e5] bg-white text-[#1a1a1a] hover:bg-[#fbfcfd] hover:border-[#d4d4d4] transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 12h14M12 5l7 7-7 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {integration.connected ? "Conexões" : "Conectar"}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-[#5e5e5e] hover:text-[#1a1a1a] hover:bg-[#f2f2f2] transition-colors"
                        aria-label="Configurações"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                          <path
                            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={integration.connected}
                        onClick={() => toggleIntegration(integration.id)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#0d0d0d] focus:ring-offset-2 ${
                          integration.connected ? "bg-[#00c650]" : "bg-[#e5e5e5]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                            integration.connected ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[14px] text-[#5e5e5e]">
                  Nenhuma integração encontrada para &quot;{search}&quot;.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
