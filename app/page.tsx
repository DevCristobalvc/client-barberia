"use client";

import { createClient } from "@/lib/supabase/client";
import { Scissors, Send, RotateCcw, User, LogIn, LogOut, Home, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SHOP_ID = process.env.NEXT_PUBLIC_SHOP_ID || "00000000-0000-0000-0000-000000000001";

const INITIAL = "¡Hola! 👋 Soy SofIA. ¿En qué te puedo ayudar hoy?";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Acciones que requieren login
const REQUIRES_AUTH = ["reservar", "cancelar", "cita", "turno", "agendar", "reprogramar", "modificar"];

function needsAuth(text: string): boolean {
  return REQUIRES_AUTH.some((w) => text.toLowerCase().includes(w));
}

export default function ClientPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", role: "assistant", content: INITIAL },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Usuario",
          email: data.user.email || "",
        });
      }
    });
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Si la acción requiere auth y no está logueado
    if (!user && needsAuth(text)) {
      setShowAuthPrompt(true);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "user", content: text },
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Para reservar o gestionar citas necesito que inicies sesión primero. ¿Te registras o ya tienes cuenta? 🔐",
        },
      ]);
      setInput("");
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(`${API}/api/v1/webhook/message/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API.includes("ngrok") ? { "ngrok-skip-browser-warning": "true" } : {}),
        },
        body: JSON.stringify({
          shop_id: SHOP_ID,
          phone: user ? `+57${user.email.split("@")[0]}` : "+57000000000",
          message: text,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: data.response || "" } : m)
        );
      } else {
        throw new Error("Error del servidor");
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Lo siento, no pude conectarme. Intenta de nuevo en un momento." }
            : m
        )
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const reset = () => {
    setMessages([{ id: "0", role: "assistant", content: INITIAL }]);
    setShowAuthPrompt(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[#1A1A1A] bg-[#0A0A0A] safe-top">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">SofIA</p>
              <p className="text-xs text-emerald-400 mt-0.5">● En línea</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Volver a la landing */}
            <a href="https://bia-landing.vercel.app" target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-[#1A1A1A] text-[#888888] hover:text-[#F5F5F5] transition-colors" title="Inicio">
              <Home className="w-4 h-4" />
            </a>

            {user ? (
              <>
                <Link href="/perfil"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] text-xs text-[#F5F5F5] hover:bg-[#2A2A2A] transition-colors">
                  <User className="w-3.5 h-3.5 text-gold" />
                  {user.name.split(" ")[0]}
                </Link>
                <button
                  onClick={async () => { await supabase.auth.signOut(); setUser(null); router.refresh(); }}
                  className="p-1.5 rounded-lg hover:bg-red-900/20 text-[#888888] hover:text-red-400 transition-colors" title="Cerrar sesión">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link href="/login"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gold/30 text-gold text-xs hover:bg-gold/10 transition-colors">
                <LogIn className="w-3.5 h-3.5" />
                Ingresar
              </Link>
            )}

            <button onClick={reset}
              className="p-1.5 rounded-lg hover:bg-[#1A1A1A] text-[#888888] hover:text-[#F5F5F5] transition-colors" title="Nueva conversación">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      {/* Messages — scrollable, scrollbar oculta */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" ref={scrollRef as React.RefObject<HTMLDivElement>}>
        <div className="px-4 py-4 space-y-3">
          <div className="text-center py-1">
            <span className="text-xs text-[#555555] bg-[#111111] border border-[#2A2A2A] rounded-full px-3 py-1">
              BarberIA Demo · Bogotá
            </span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <Scissors className="w-2.5 h-2.5 text-gold" />
                </div>
              )}
              <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-gold/20 border border-gold/25 rounded-tr-md"
                  : "bg-[#1A1A1A] rounded-tl-md"
              }`}>
                {msg.content || (
                  <span className="flex gap-1 items-center py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#888888] animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#888888] animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#888888] animate-bounce [animation-delay:300ms]" />
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Auth prompt */}
          {showAuthPrompt && !user && (
            <div className="flex gap-2 justify-center pt-1">
              <Link href="/login" className="flex-1 py-2.5 text-sm text-center font-medium bg-gold text-[#0A0A0A] rounded-xl hover:bg-gold-light transition-colors">
                Iniciar sesión
              </Link>
              <Link href="/register" className="flex-1 py-2.5 text-sm text-center font-medium border border-[#2A2A2A] text-[#F5F5F5] rounded-xl hover:bg-[#1A1A1A] transition-colors">
                Registrarse
              </Link>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      {/* Scroll nav buttons */}
      <div className="flex-shrink-0 flex justify-end gap-1.5 px-4 py-1 bg-[#0A0A0A]">
        <button
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          className="p-1 rounded-lg bg-[#1A1A1A] text-[#555555] hover:text-[#F5F5F5] transition-colors"
          title="Ir al inicio">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="p-1 rounded-lg bg-[#1A1A1A] text-[#555555] hover:text-[#F5F5F5] transition-colors"
          title="Ir al final">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-shrink-0 border-t border-[#1A1A1A] bg-[#0A0A0A] safe-bottom">
        <div className="px-4 py-3">
          <div className="flex items-end gap-2 bg-[#111111] border border-[#2A2A2A] rounded-2xl px-3 py-2 focus-within:border-gold/40 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 100) + "px";
              }}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-[#F5F5F5] placeholder:text-[#444444] resize-none focus:outline-none leading-relaxed py-1 max-h-24"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-gold text-[#0A0A0A] hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-xs text-[#333333] mt-1.5">
            Powered by SofIA · BarberIA
          </p>
        </div>
      </div>
    </div>
  );
}
