"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Button from "@/components/Button";

type Message = {
  id: string;
  role: "user" | "agent" | "system";
  text?: string;
  imageTitle?: string;
  timestamp: string;
  seen?: boolean;
};

type Conversation = {
  id: string;
  contactName: string;
  contactInitial: string;
  lastSnippet: string;
  lastTime: string;
  badge?: string;
  badgeIcon?: boolean;
};

const ICON_SIZE = 20;
const ICON_SIZE_SM = 16;
const BTN_ICON = "h-8 w-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-[#f2f2f2] transition-colors flex-shrink-0";

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: "1", contactName: "Luis Easton", contactInitial: "L", lastSnippet: "I bought this product from your store, but I just missed the return date by a day. Can you please make an exception?", lastTime: "3m" },
  { id: "2", contactName: "Ivan", contactInitial: "I", lastSnippet: "Hi there, I have a question about my order.", lastTime: "5m", badge: "3min" },
  { id: "3", contactName: "Francesca", contactInitial: "F", lastSnippet: "The refund still hasn't arrived in my account.", lastTime: "9m", badgeIcon: true },
  { id: "4", contactName: "Nadia", contactInitial: "N", lastSnippet: "How do I exchange the item for a different size?", lastTime: "13m" },
];

const MOCK_MESSAGES: Message[] = [
  { id: "m1", role: "user", text: "I bought this product from your store, but I just missed the return date by a day. Can you please make an exception?", timestamp: "8min" },
  { id: "m2", role: "agent", text: "Hi Luis! Let me look into this for you.", timestamp: "5min", seen: true },
  { id: "m3", role: "user", text: "I accidentally bought the wrong item 😊", timestamp: "4min" },
  { id: "m4", role: "user", imageTitle: "Baies Scented Candle", timestamp: "4min" },
  { id: "m5", role: "agent", text: "Could you please clarify the reason for wanting to return the item?", timestamp: "4min", seen: true },
  { id: "m6", role: "agent", text: "Would you prefer exchanging this item for the correct one instead?", timestamp: "3min", seen: true },
];

const COPILOT_EXCHANGE_1 = {
  you: "What exceptions can I make to our 30 day refund policy?",
  fin: "Here are the exceptions to our 30 day refund policy:\n\n1. Product has defects or is damaged upon arrival.\n2. Customer is dissatisfied with our service.\n3. The order was a mistake or made accidentally.\n\nPlease note that all exceptions are subject to approval from a team leader.",
};

const COPILOT_EXCHANGE_2 = {
  you: "How do I process an exchange?",
  finPlaceholder: true,
};

const SOURCES_1 = [
  { title: "Refund policy", icon: "lock" as const },
  { title: "Refund for an order placed by mistake", icon: "doc" as const },
  { title: "Our 30 day refund policy", icon: "doc" as const },
];

const SOURCES_2 = [
  { title: "Exchanging an order", icon: "doc" as const },
  { title: "Dealing with refund disputes", icon: "lock" as const },
];

function IconChevronDown({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconDoc() {
  return (
    <svg width={ICON_SIZE_SM} height={ICON_SIZE_SM} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width={ICON_SIZE_SM} height={ICON_SIZE_SM} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconArrowUp() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

export default function ConversationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_CONVERSATIONS[0]?.id ?? null);
  const [copilotTab, setCopilotTab] = useState<"details" | "copilot">("copilot");
  const [copilotQuestion, setCopilotQuestion] = useState("");

  const selected = MOCK_CONVERSATIONS.find((c) => c.id === selectedId);

  const breadcrumbs = [
    {
      label: "Conversas",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M16.25 3.75C17.1875 3.75 17.9375 4.5 17.9375 5.4375V11.5625C17.9375 12.5 17.1875 13.25 16.25 13.25H11.875L8.125 16.25V13.25H3.75C2.8125 13.25 2.0625 12.5 2.0625 11.5625V5.4375C2.0625 4.5 2.8125 3.75 3.75 3.75H16.25Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      ),
    },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex h-screen min-h-[520px] -m-8 bg-white border-t border-[#f2f2f2]">
        {/* Coluna 1: Inbox */}
        <aside className="w-[300px] flex-shrink-0 border-r border-[#f2f2f2] flex flex-col bg-white">
          <div className="p-4 border-b border-[#f2f2f2]">
            <h2 className="text-base font-heading font-semibold text-text-primary mb-3">Sua caixa de entrada</h2>
            <div className="flex gap-2">
              <div className="relative">
                <select className="h-9 min-w-[110px] pl-3 pr-9 rounded-lg border border-input-border bg-input-bg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-gray-1200/20 appearance-none">
                  <option>4 Abertas</option>
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary">
                  <IconChevronDown size={14} />
                </span>
              </div>
              <div className="relative">
                <select className="h-9 min-w-[110px] pl-3 pr-9 rounded-lg border border-input-border bg-input-bg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-gray-1200/20 appearance-none">
                  <option>Mais recentes</option>
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary">
                  <IconChevronDown size={14} />
                </span>
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto">
            {MOCK_CONVERSATIONS.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => setSelectedId(conv.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[#f2f2f2] transition-colors ${
                  selectedId === conv.id ? "bg-[#f2f2f2]" : "hover:bg-[#fbfcfd]"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-1200 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {conv.contactInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-text-primary truncate">{conv.contactName}</span>
                    <span className="flex items-center gap-1.5 flex-shrink-0">
                      {conv.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-[#f2f2f2] text-[10px] font-medium text-text-primary">
                          {conv.badge}
                        </span>
                      )}
                      {conv.badgeIcon && (
                        <span className="w-5 h-5 rounded-full bg-gray-1200 text-white flex items-center justify-center text-[10px] font-medium">
                          9
                        </span>
                      )}
                      <span className="text-xs text-text-secondary">{conv.lastTime}</span>
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary truncate mt-0.5">{conv.lastSnippet}</p>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Coluna 2: Chat ativo */}
        <section className="flex-1 flex flex-col min-w-0 bg-white border-r border-[#f2f2f2]">
          {selected ? (
            <>
              <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 border-b border-[#f2f2f2]">
                <span className="text-base font-heading font-semibold text-text-primary">{selected.contactName}</span>
                <div className="flex items-center gap-0.5">
                  <button type="button" className={BTN_ICON} aria-label="Favoritar">
                    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                  <button type="button" className={BTN_ICON} aria-label="Mais opções">
                    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                    </svg>
                  </button>
                  <button type="button" className={BTN_ICON} aria-label="Informações">
                    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    </svg>
                  </button>
                  <Button variant="tertiary" size="sm" className="w-auto flex-shrink-0">
                    Ligar
                  </Button>
                  <Button variant="tertiary" size="sm" className="w-auto flex-shrink-0">
                    Adiar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedId(null)}
                    className="w-auto flex items-center gap-1.5 flex-shrink-0"
                  >
                    <IconCheck />
                    Fechar
                  </Button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {MOCK_MESSAGES.map((msg) => {
                  if (msg.role === "user") {
                    return (
                      <div key={msg.id} className="flex items-end gap-2 max-w-[80%]">
                        <div className="w-8 h-8 rounded-full bg-gray-1200 text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
                          {selected.contactInitial}
                        </div>
                        <div className="rounded-2xl rounded-bl-md bg-[#f2f2f2] px-4 py-2.5">
                          {msg.imageTitle ? (
                            <div className="rounded-lg overflow-hidden bg-[#eaeaea] w-36 h-28 flex flex-col items-center justify-center text-xs text-text-secondary">
                              <span className="font-medium text-text-primary mt-1">[Imagem]</span>
                              <span>{msg.imageTitle}</span>
                            </div>
                          ) : (
                            <p className="text-sm text-text-primary">{msg.text}</p>
                          )}
                          <span className="text-[10px] text-text-secondary block mt-1.5">{msg.timestamp}</span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={msg.id} className="flex items-end gap-2 max-w-[80%] ml-auto flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-gray-1200 text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
                        A
                      </div>
                      <div className="rounded-2xl rounded-br-md bg-gray-1200 text-white px-4 py-2.5">
                        <p className="text-sm">{msg.text}</p>
                        <span className="text-[10px] text-white/80 block mt-1.5">
                          {msg.seen ? `Visto · ${msg.timestamp}` : msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Composer: label Chat + hint, depois área de input */}
              <div className="flex-shrink-0 p-4 pt-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary">Chat</span>
                  <button type="button" className="p-1 -m-1 rounded text-text-secondary hover:text-text-primary hover:bg-[#f2f2f2]">
                    <IconChevronDown size={16} />
                  </button>
                </div>
                <p className="text-xs text-text-secondary mb-2">Use ⌘K para atalhos</p>
                <div className="rounded-xl border border-input-border bg-input-bg focus-within:ring-2 focus-within:ring-gray-1200/20 focus-within:border-gray-1200 transition-shadow">
                  <textarea
                    placeholder="Digite sua mensagem..."
                    rows={3}
                    className="w-full px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary resize-none border-0 rounded-t-xl focus:outline-none focus:ring-0 bg-transparent"
                  />
                  <div className="flex items-center justify-between px-2 py-2 border-t border-[#f2f2f2]">
                    <div className="flex items-center gap-0.5">
                      <button type="button" className="h-8 w-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-[#f2f2f2]" aria-label="Anexar">
                        <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l10.6-10.6a4 4 0 1 1 5.66 5.66l-10.6 10.6a2 2 0 0 1-2.83-2.83l9.9-9.9" />
                        </svg>
                      </button>
                      <button type="button" className="h-8 w-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-[#f2f2f2]" aria-label="Imagem">
                        <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </button>
                      <button type="button" className="h-8 w-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-[#f2f2f2]" aria-label="Emoji">
                        <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M8 14c1 1.333 2.333 2 4 2s3-.667 4-2" />
                          <circle cx="9" cy="10" r="1" fill="currentColor" />
                          <circle cx="15" cy="10" r="1" fill="currentColor" />
                        </svg>
                      </button>
                    </div>
                    <Button size="sm" className="w-auto gap-1.5">
                      <svg width={ICON_SIZE} height={ICON_SIZE - 2} viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                        <path d="M19 8L1 1L5 8L1 15L19 8Z" />
                      </svg>
                      Enviar
                      <IconChevronDown size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
              Selecione uma conversa
            </div>
          )}
        </section>

        {/* Coluna 3: AI Copilot */}
        <aside className="w-[340px] flex-shrink-0 flex flex-col bg-[#fbfcfd] border-l border-[#f2f2f2]">
          <div className="border-b border-[#f2f2f2] flex">
            <button
              type="button"
              onClick={() => setCopilotTab("details")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                copilotTab === "details" ? "text-text-primary border-b-2 border-gray-1200 -mb-px" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Detalhes
            </button>
            <button
              type="button"
              onClick={() => setCopilotTab("copilot")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                copilotTab === "copilot" ? "text-text-primary border-b-2 border-gray-1200 -mb-px" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              AI Copilot
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {copilotTab === "copilot" && (
              <>
                {/* Exchange 1: You + Fin */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#f2f2f2] flex items-center justify-center text-xs font-medium text-text-primary flex-shrink-0">
                      Você
                    </div>
                    <p className="text-sm text-text-primary pt-1">{COPILOT_EXCHANGE_1.you}</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-1200 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      Fin
                    </div>
                    <div className="flex-1 min-w-0 rounded-xl border border-input-border bg-input-bg px-4 py-3">
                      <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{COPILOT_EXCHANGE_1.fin}</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full gap-1.5">
                    <svg width={ICON_SIZE_SM} height={ICON_SIZE_SM} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Adicionar ao editor
                    <IconChevronDown size={14} />
                  </Button>
                </div>

                <p className="text-xs font-medium text-text-secondary">3 fontes relevantes</p>
                <ul className="space-y-2">
                  {SOURCES_1.map((s) => (
                    <li key={s.title} className="flex items-center gap-2 text-sm text-text-primary">
                      <span className="w-7 h-7 rounded-md bg-white border border-input-border flex items-center justify-center text-text-secondary flex-shrink-0">
                        {s.icon === "lock" ? <IconLock /> : <IconDoc />}
                      </span>
                      {s.title}
                    </li>
                  ))}
                </ul>

                {/* Exchange 2: You + Fin (placeholder) */}
                <div className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#f2f2f2] flex items-center justify-center text-xs font-medium text-text-primary flex-shrink-0">
                      Você
                    </div>
                    <p className="text-sm text-text-primary pt-1">{COPILOT_EXCHANGE_2.you}</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-1200 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      Fin
                    </div>
                    <div className="flex-1 min-w-0 rounded-xl border border-input-border bg-input-bg px-4 py-3 min-h-[60px] flex items-center">
                      <span className="text-sm text-text-secondary animate-pulse">Gerando resposta...</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs font-medium text-text-secondary">2 fontes relevantes</p>
                <ul className="space-y-2">
                  {SOURCES_2.map((s) => (
                    <li key={s.title} className="flex items-center gap-2 text-sm text-text-primary">
                      <span className="w-7 h-7 rounded-md bg-white border border-input-border flex items-center justify-center text-text-secondary flex-shrink-0">
                        {s.icon === "lock" ? <IconLock /> : <IconDoc />}
                      </span>
                      {s.title}
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={copilotQuestion}
                      onChange={(e) => setCopilotQuestion(e.target.value)}
                      placeholder="Faça uma pergunta de acompanhamento..."
                      className="flex-1 h-9 px-3 rounded-lg border border-input-border bg-input-bg text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-gray-1200/20"
                    />
                    <button
                      type="button"
                      className="h-9 w-9 rounded-lg bg-gray-1200 text-white flex items-center justify-center hover:bg-[#111111] flex-shrink-0 transition-colors"
                      aria-label="Enviar"
                    >
                      <IconArrowUp />
                    </button>
                  </div>
                </div>
              </>
            )}
            {copilotTab === "details" && (
              <div className="text-sm text-text-secondary">
                <p>Informações do contato e do ticket aparecem aqui.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
