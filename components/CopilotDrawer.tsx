"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import CortexSynthesis from "@/components/CortexSynthesis";
import { Icon } from "@/components/ui/Icon";
import {
  CORTEX_STATE_PRESETS,
  type CortexState,
} from "@/lib/copilot-orb-presets";

// Flat-top regular hex inscribed in a 1:1 box (height ≈ 86.6%) with sharp
// vertices. Encoded as an SVG mask so it scales with any container size.
const CORTEX_HEX_MASK = (() => {
  const path = "M25 6.7 L75 6.7 L100 50 L75 93.3 L25 93.3 L0 50 Z";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='${path}' fill='black'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
})();

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


export function CopilotOrb({
  size = 36,
  state = "idle",
  speed,
  color1,
  color2,
  color3,
  scale,
  complexity,
  distortion,
  glowIntensity,
  flowFrequency,
  contrast,
  bg,
}: {
  size?: number;
  state?: CortexState;
  speed?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  scale?: number;
  complexity?: number;
  distortion?: number;
  glowIntensity?: number;
  flowFrequency?: number;
  contrast?: number;
  bg?: string;
}) {
  const preset = CORTEX_STATE_PRESETS[state];
  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        maskImage: CORTEX_HEX_MASK,
        WebkitMaskImage: CORTEX_HEX_MASK,
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskMode: "alpha",
      }}
      aria-hidden="true"
    >
      <CortexSynthesis
        speed={speed ?? preset.speed}
        color1={color1 ?? preset.color1}
        color2={color2 ?? preset.color2}
        color3={color3 ?? preset.color3}
        scale={scale ?? preset.scale}
        complexity={complexity ?? preset.complexity}
        distortion={distortion ?? preset.distortion}
        glowIntensity={glowIntensity ?? preset.glowIntensity}
        flowFrequency={flowFrequency ?? preset.flowFrequency}
        contrast={contrast ?? preset.contrast}
        backgroundColor={bg ?? preset.bg}
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
      className={`h-full bg-[#f9f9f9] overflow-hidden flex flex-col shrink-0 transition-[width] duration-300 ease-out ${
        isOpen ? "w-[405px]" : "w-0"
      }`}
      role="dialog"
      aria-label="Cortex"
    >
      <div className="h-full w-[405px] min-w-[405px] bg-white flex flex-col">
        {/* Top bar */}
        <div className="h-[79px] w-full border-b border-[#f3f4f6] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CopilotOrb size={46} />
            <div className="flex flex-col">
              <div className="body-xl font-semibold text-[#252b33]">
                Cortex
              </div>
              <div className="flex items-center gap-2 body-xs leading-4 text-[#00a63e]">
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
              <div className="body-xl font-semibold text-[#252b33]">
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
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 body-sm ${
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
                                <code className="bg-[#e5e5e5] px-1.5 py-0.5 rounded body-xs mono">
                                  {children}
                                </code>
                              ) : (
                                <code className="block bg-[#e5e5e5] p-2 rounded body-xs mono overflow-x-auto my-2">
                                  {children}
                                </code>
                              );
                            },
                            pre: ({ children }) => <pre className="my-2">{children}</pre>,
                            h1: ({ children }) => <h1 className="body-md font-semibold mb-2 mt-3 first:mt-0">{children}</h1>,
                            h2: ({ children }) => <h2 className="body-sm font-semibold mb-2 mt-3 first:mt-0">{children}</h2>,
                            h3: ({ children }) => <h3 className="body-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h3>,
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
        <div className="w-full border-t border-[#f3f4f6] px-4 pt-3 pb-3 flex flex-col gap-2 shrink-0">
          <div className="w-full rounded-[24px] bg-[#f4f4f4] pl-4 pr-2 py-2 flex items-center justify-between">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              className="w-full bg-transparent body-sm text-[#111827] placeholder:text-[#99a1af] focus:outline-none"
              placeholder="Pergunte qualquer coisa..."
            />

            <div className="ml-2 flex items-center gap-1">
              <button
                type="button"
                className="h-7 w-7 rounded-full grid place-items-center text-[#64748b] hover:bg-white/60"
                aria-label="Anexar"
              >
                <Icon name="attach_file" size={18} />
              </button>
              <button
                type="button"
                className="h-7 w-7 rounded-full grid place-items-center text-[#64748b] hover:bg-white/60"
                aria-label="Emoji"
              >
                <Icon name="mood" size={18} />
              </button>
              <button
                type="button"
                className="h-7 w-7 rounded-full bg-[#1e2939] text-white grid place-items-center disabled:opacity-50 ml-0.5"
                aria-label="Enviar"
                onClick={sendMessage}
                disabled={!message.trim() || isTyping}
              >
                <Icon name="arrow_upward" size={16} weight={500} />
              </button>
            </div>
          </div>

          <div className="body-xs text-[#99a1af] text-center">
            Cortex pode cometer erros. Verifique informações importantes.
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
        aria-label="Fechar Cortex"
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
        aria-label="Cortex"
      >
        <div className="h-full w-full bg-white">{/* content reused from panel */}</div>
      </aside>
    </div>
  );
}

