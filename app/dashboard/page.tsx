"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import DeflectionRateChart from "@/components/DeflectionRateChart";
import OverviewConversationsCard from "@/components/OverviewConversationsCard";
import MetricCard from "@/components/MetricCard";
import { useToastContext } from "@/lib/contexts/ToastContext";

const PERIOD_OPTIONS = [
  { value: "today", label: "Hoje" },
  { value: "yesterday", label: "Ontem" },
  { value: "week", label: "Últimos 7 dias" },
  { value: "month", label: "Últimos 30 dias" },
  { value: "quarter", label: "Este trimestre" },
  { value: "custom", label: "Personalizado" },
];

const MOCK_AGENTS = [
  { id: "1", name: "Agente Vendas" },
  { id: "2", name: "Agente Suporte" },
  { id: "3", name: "Agente Financeiro" },
  { id: "4", name: "Agente Pós-venda" },
];

const CHANNEL_OPTIONS = [
  { id: "chat", name: "Chat" },
  { id: "email", name: "E-mail" },
  { id: "whatsapp", name: "WhatsApp" },
  { id: "voice", name: "Voz" },
];

export default function Dashboard() {
  const { success } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState("month");
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const periodRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (periodRef.current && !periodRef.current.contains(target)) setIsPeriodOpen(false);
      if (filterRef.current && !filterRef.current.contains(target)) setIsFilterOpen(false);
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewDetails = (metric: string) => {
    success(`Visualizando detalhes de ${metric}`);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    success("Dados atualizados com sucesso!");
  };

  const toggleAgent = (id: string) => {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };
  const toggleChannel = (id: string) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const activeFiltersCount =
    selectedAgents.length + selectedChannels.length;

  const breadcrumbs = [
    {
      label: "Dashboard",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3.125" y="3.125" width="5.625" height="5.625" fill="currentColor"/>
          <rect x="11.25" y="3.125" width="5.625" height="5.625" fill="currentColor"/>
          <rect x="3.125" y="11.25" width="5.625" height="5.625" fill="currentColor"/>
          <rect x="11.25" y="11.25" width="5.625" height="5.625" fill="currentColor"/>
        </svg>
      ),
    },
  ];

  return (
    <DashboardLayout title="Dashboard" breadcrumbs={breadcrumbs} showDateSelector={true}>
      <div className="min-h-full bg-white -m-8 p-8">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="space-y-6">
            {/* Controle de período + Filtro (canto superior esquerdo) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Controle de período */}
                <div className="relative" ref={periodRef}>
                  <button
                    type="button"
                    onClick={() => setIsPeriodOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-2 body-sm border border-aw-gray-300 rounded-lg bg-white text-text-primary hover:border-aw-gray-400 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-secondary">
                      <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 6h12M5 2v4M11 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? "Período"}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={isPeriodOpen ? "rotate-180" : ""}>
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {isPeriodOpen && (
                    <div className="absolute left-0 top-full mt-1 z-20 min-w-[200px] py-1 bg-white border border-aw-gray-300 rounded-lg shadow-lg">
                      {PERIOD_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setPeriod(opt.value);
                            setIsPeriodOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 body-sm hover:bg-aw-gray-150 ${period === opt.value ? "bg-aw-gray-150 text-text-primary font-medium" : "text-text-secondary"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botão Filtro personalizado */}
                <div className="relative" ref={filterRef}>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-2 body-sm border border-aw-gray-300 rounded-lg bg-white text-text-primary hover:border-aw-gray-400 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 3h12M4 6h8M6 9h4M8 12h0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Filtros
                    {activeFiltersCount > 0 && (
                      <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 body-xs font-medium rounded-full bg-primary text-white">
                        {activeFiltersCount}
                      </span>
                    )}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={isFilterOpen ? "rotate-180" : ""}>
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {isFilterOpen && (
                    <div className="absolute left-0 top-full mt-1 z-20 w-[320px] py-3 px-4 bg-white border border-aw-gray-300 rounded-xl shadow-lg">
                      <div className="body-sm font-medium text-text-primary mb-3">Filtros personalizados</div>
                      <div className="space-y-4">
                        <div>
                          <div className="body-xs font-medium text-text-secondary mb-2">Agentes</div>
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {MOCK_AGENTS.map((a) => (
                              <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedAgents.includes(a.id)}
                                  onChange={() => toggleAgent(a.id)}
                                  className="rounded border-aw-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="body-sm text-text-primary">{a.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="body-xs font-medium text-text-secondary mb-2">Canal</div>
                          <div className="space-y-1.5">
                            {CHANNEL_OPTIONS.map((c) => (
                              <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedChannels.includes(c.id)}
                                  onChange={() => toggleChannel(c.id)}
                                  className="rounded border-aw-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="body-sm text-text-primary">{c.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 pt-3 border-t border-aw-gray-300">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAgents([]);
                            setSelectedChannels([]);
                          }}
                          className="flex-1 py-2 body-sm text-text-secondary hover:text-text-primary border border-aw-gray-300 rounded-lg"
                        >
                          Limpar
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsFilterOpen(false)}
                          className="flex-1 py-2 body-sm bg-primary text-white rounded-lg hover:opacity-90"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 body-sm text-text-primary hover:text-primary-dark transition-colors disabled:opacity-50"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={isLoading ? "animate-spin" : ""}
                >
                  <path
                    d="M8 2V6M8 14V10M2 8H6M14 8H10M2.34315 2.34315L5.17158 5.17158M10.8284 10.8284L13.6569 13.6569M2.34315 13.6569L5.17158 10.8284M10.8284 5.17158L13.6569 2.34315"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Atualizar
              </button>
            </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div onClick={() => handleViewDetails("Total de Conversas")} className="cursor-pointer">
            <KPICard
              value="542.541"
              label="Total de Conversas"
              change="+12.01%"
              changePositive={true}
            />
          </div>
          <div onClick={() => handleViewDetails("Custos Salvos")} className="cursor-pointer">
            <KPICard
              value="R$ 4.549,21"
              label="Custos Salvos"
              change="+4.01%"
              changePositive={true}
            />
          </div>
          <div onClick={() => handleViewDetails("Deflection Rate")} className="cursor-pointer">
            <KPICard
              value="77%"
              label="Deflection Rate"
              change="+12.01%"
              changePositive={true}
            />
          </div>
          <div onClick={() => handleViewDetails("CSAT")} className="cursor-pointer">
            <KPICard
              value="4.5"
              label="CSAT"
              change="+12.01%"
              changePositive={true}
            />
          </div>
        </div>

        {/* Deflection Rate Chart */}
        <DeflectionRateChart />

        {/* Overview - Como você está tratando as conversas (Sankey) */}
        <OverviewConversationsCard />

        {/* Bottom Metric Cards */}
        <div className="grid grid-cols-3 gap-6">
          {/* Average Resolution Time */}
          <MetricCard title="Tempo Médio de Resolução">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32 mb-4">
                <svg className="transform -rotate-90" width="128" height="128" viewBox="0 0 128 128">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="var(--aw-gray-300)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="var(--aw-blue-500)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56 * 0.75} ${2 * Math.PI * 56}`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="text-4xl font-bold text-text-primary mb-1">4.58</div>
              <div className="body-sm text-text-secondary">minutos</div>
            </div>
          </MetricCard>

          {/* Customer Satisfaction */}
          <MetricCard title="Satisfação dos Clientes">
            <div className="space-y-3">
              <p className="body-xs text-text-secondary mb-4">Successful outcomes / total AI interactions</p>
              {[
                { label: "Muito útil", value: 338, max: 365 },
                { label: "Útil", value: 365, max: 365 },
                { label: "Um pouco útil", value: 191, max: 365 },
                { label: "Nada útil", value: 38, max: 365 },
                { label: "Muito nada útil", value: 28, max: 365 },
              ].map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between body-sm">
                    <span className="text-text-primary">{item.label}</span>
                    <span className="text-text-secondary">{item.value}</span>
                  </div>
                  <div className="w-full bg-aw-gray-200 rounded-full h-2">
                    <div
                      className="bg-aw-gray-400 h-2 rounded-full"
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </MetricCard>

          {/* AI Success Rate */}
          <MetricCard title="AI Success Rate">
            <div className="space-y-3">
              <p className="body-xs text-text-secondary mb-4">Successful outcomes / total AI interactions</p>
              <div className="h-32 flex items-end justify-between gap-1 mb-4">
                {[65, 75, 80, 70, 85, 90, 88, 82, 78, 72, 68, 75].map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-chart-blue rounded-t"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="text-4xl font-bold text-text-primary mb-1">87.3%</div>
              <div className="body-sm text-text-secondary">40,064 successful of 45,892 total</div>
            </div>
          </MetricCard>
        </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
