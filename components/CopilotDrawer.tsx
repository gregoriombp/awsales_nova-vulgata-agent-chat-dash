"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

function Close24() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Paperclip18() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l10.6-10.6a4 4 0 1 1 5.66 5.66l-10.6 10.6a2 2 0 0 1-2.83-2.83l9.9-9.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Smile18() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 14c1 1.333 2.333 2 4 2s3-.667 4-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

function Send20() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
      <path
        d="M19 8L1 1L5 8L1 15L19 8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CopilotOrb({ size = 36 }: { size?: number }) {
  return (
    <div
      className="relative copilot-orb"
      style={{ width: size, height: size, borderRadius: 9999 }}
    >
      <div
        className="absolute inset-0 rounded-full orb-inner bg-[radial-gradient(120%_120%_at_20%_25%,#1fb6ff_0%,#bfefff_45%,#f3e6ff_75%,#ffd6e7_100%)]"
      />
      <div
        className="absolute left-[22%] top-[18%] h-[45%] w-[45%] rounded-full blur-[6px] orb-shine"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)",
        }}
      />
    </div>
  );
}

const FALLBACK_REPLIES = [
  "Olá! Recebi sua mensagem. Em que posso ajudar você hoje?",
  "A API do Gemini não está configurada. Adicione GEMINI_API_KEY no .env.local para usar o assistente com IA.",
  "Estou online. Configure GEMINI_API_KEY em .env.local para respostas inteligentes.",
];

function getFallbackReply(error?: boolean) {
  return error
    ? "Não consegui responder agora. Verifique se GEMINI_API_KEY está em .env.local e tente novamente."
    : FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
}

async function fetchGeminiReply(
  messages: { role: "user" | "bot"; text: string }[]
): Promise<{ text: string } | { error: string }> {
  const res = await fetch("/api/copilot/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data?.error === "string" ? data.error : `Erro ao conectar (${res.status}).`;
    return { error: message };
  }
  if (typeof data?.text === "string") {
    return { text: data.text };
  }
  return { error: "Resposta inválida da API." };
}

export default function CopilotDrawer({
  isOpen,
  onClose,
  embedded = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const text = message.trim();
    if (!text) return;

    setMessage("");
    const newMessages = [...messages, { role: "user" as const, text }];
    setMessages(newMessages);
    setIsTyping(true);

    const result = await fetchGeminiReply(newMessages);
    if ("error" in result) {
      setMessages((prev) => [...prev, { role: "bot", text: result.error }]);
    } else {
      setMessages((prev) => [...prev, { role: "bot", text: result.text }]);
    }
    setIsTyping(false);
  };

  const hasMessages = messages.length > 0;

  const panel = (
    <aside
      ref={panelRef}
      className={`h-full border-l border-[#e5e5e5] bg-[#f9f9f9] overflow-hidden flex flex-col shrink-0 transition-[width] duration-300 ease-out ${
        isOpen ? "w-[405px]" : "w-0"
      }`}
      role="dialog"
      aria-label="AwSales Copilot"
    >
      <div className="h-full w-[405px] min-w-[405px] bg-white flex flex-col">
        {/* Top bar */}
        <div className="h-[79px] w-full border-b border-[#f3f4f6] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CopilotOrb size={46} />
            <div className="flex flex-col">
              <div className="text-[20px] leading-[30px] font-semibold tracking-[-0.4492px] text-[#252b33]">
                AwSales Copilot
              </div>
              <div className="flex items-center gap-2 text-[12px] leading-4 text-[#00a63e]">
                <span className="h-[6px] w-[6px] rounded-full bg-[#00c950] opacity-50" />
                <span>Online</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="rounded-full p-2 text-[#64748b] hover:bg-[#f2f2f2] hover:text-[#0d0d0d] transition-colors"
            onClick={onClose}
            aria-label="Fechar"
          >
            <Close24 />
          </button>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
          {!hasMessages ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center py-8">
              <div className="mb-10">
                <CopilotOrb size={119} />
              </div>
              <div className="text-[20px] leading-[30px] font-semibold tracking-[-0.4492px] text-[#252b33]">
                Olá! Como posso te ajudar?
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-[20px] ${
                      m.role === "user"
                        ? "bg-[#1e2939] text-white rounded-br-md"
                        : "bg-[#f4f4f4] text-[#252b33] rounded-bl-md"
                    }`}
                  >
                    {m.role === "bot" ? (
                      <div className="copilot-markdown">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li>{children}</li>,
                            code: ({ children, className }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-[#e5e5e5] px-1.5 py-0.5 rounded text-[13px] font-mono">
                                  {children}
                                </code>
                              ) : (
                                <code className="block bg-[#e5e5e5] p-2 rounded text-[13px] font-mono overflow-x-auto my-2">
                                  {children}
                                </code>
                              );
                            },
                            pre: ({ children }) => <pre className="my-2">{children}</pre>,
                            h1: ({ children }) => <h1 className="text-[16px] font-semibold mb-2 mt-3 first:mt-0">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-[15px] font-semibold mb-2 mt-3 first:mt-0">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-[14px] font-semibold mb-1 mt-2 first:mt-0">{children}</h3>,
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-[#99a1af] pl-3 my-2 italic text-[#64748b]">
                                {children}
                              </blockquote>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#1fb6ff] underline hover:text-[#0d8fd9]"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {m.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      m.text
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-[#f4f4f4] px-4 py-2.5 flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#99a1af] animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-[#99a1af] animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-[#99a1af] animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="h-[117px] w-full border-t border-[#f3f4f6] px-4 pt-[17px] flex flex-col gap-2 shrink-0">
          <div className="w-full rounded-[32px] bg-[#f4f4f4] p-[17px] flex items-center justify-between">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              className="w-full bg-transparent text-[14px] tracking-[-0.1504px] text-[#111827] placeholder:text-[#99a1af] focus:outline-none"
              placeholder="Pergunte qualquer coisa..."
            />

            <div className="ml-3 flex items-center gap-2">
              <button
                type="button"
                className="h-[26px] w-[26px] rounded-full grid place-items-center text-[#64748b] hover:bg-white/60"
                aria-label="Anexar"
              >
                <Paperclip18 />
              </button>
              <button
                type="button"
                className="h-[26px] w-[26px] rounded-full grid place-items-center text-[#64748b] hover:bg-white/60"
                aria-label="Emoji"
              >
                <Smile18 />
              </button>
              <button
                type="button"
                className="h-8 w-8 rounded-full bg-[#1e2939] text-white grid place-items-center disabled:opacity-50"
                aria-label="Enviar"
                onClick={sendMessage}
                disabled={!message.trim() || isTyping}
              >
                <Send20 />
              </button>
            </div>
          </div>

          <div className="text-[10px] leading-[15px] tracking-[0.1172px] text-[#99a1af] text-center">
            Ai Copilot pode cometer erros. Verifique informações importantes.
          </div>
        </div>
      </div>
    </aside>
  );

  if (embedded) {
    return panel;
  }

  return (
    <div
      className={`fixed inset-0 z-[60] ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Fechar Copilot"
        className={`absolute inset-0 h-full w-full bg-black/0 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        className={`fixed right-0 top-0 h-screen w-[405px] max-w-[100vw] border-l border-[#e5e5e5] bg-[#f9f9f9] transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="AwSales Copilot"
      >
        <div className="h-full w-full bg-white">{/* content reused from panel */}</div>
      </aside>
    </div>
  );
}

