"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Bot, Send, Sparkles, User as UserIcon, Wallet } from "lucide-react";
import { aiChat, ApiError, type AiChatMessage, type AiPropertyMatch } from "@/lib/api";
import { formatDH } from "@/utils/creditCalculator";

type Message = AiChatMessage & { matches?: AiPropertyMatch[]; source?: "ai" | "fallback" };

const SUGGESTIONS = [
  "Trouve-moi un appartement à Casablanca pour 800k MAD",
  "Quels biens as-tu à Oujda avec 3 chambres ?",
  "Comment optimiser ma capacité d'emprunt ?",
  "Quelle banque propose le meilleur taux ?",
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [budget, setBudget] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    setError(null);
    const history = messages.map(({ role, content }) => ({ role, content }));
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const parsedBudget = Number(budget);
      const res = await aiChat({
        message: content,
        history,
        budget: budget && parsedBudget > 0 ? parsedBudget : undefined,
      });
      setMessages([
        ...nextMessages,
        { role: "assistant", content: res.text, matches: res.matches, source: res.source },
      ]);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Une erreur est survenue. Réessayez dans un instant.",
      );
      // On retire le dernier message utilisateur non répondu pour permettre un renvoi propre
      setMessages(nextMessages);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-16rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-semibold flex items-center gap-2" style={{ fontFamily: "var(--font-serif)" }}>
          <Sparkles className="w-6 h-6 text-[color:var(--color-client-gold)]" />
          Copilote Immobilier
        </h1>
        <p className="text-sm text-[color:var(--color-client-text-muted)] mt-1">
          Posez vos questions sur les biens et le financement — réponses basées sur notre catalogue.
        </p>
      </div>

      {/* Budget optionnel */}
      <div className="client-card rounded-xl p-3 mb-4 flex items-center gap-3">
        <Wallet className="w-4 h-4 text-[color:var(--color-client-gold)] shrink-0" />
        <label className="text-sm text-[color:var(--color-client-text-muted)] shrink-0">
          Budget (MAD)
        </label>
        <input
          type="number"
          inputMode="numeric"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="ex: 800000"
          className="flex-1 bg-white/60 border border-[color:var(--color-client-border)] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[color:var(--color-client-gold)]"
        />
      </div>

      {/* Zone de messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="w-14 h-14 mx-auto rounded-full bg-[color:var(--color-client-gold)]/15 flex items-center justify-center">
              <Bot className="w-7 h-7 text-[color:var(--color-client-gold)]" />
            </div>
            <p className="text-sm text-[color:var(--color-client-text-muted)] mt-3">
              Commencez par une question ou choisissez une suggestion ci-dessous.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}

        {loading && <TypingBubble />}
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Suggestions rapides */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-[color:var(--color-client-border)] text-[color:var(--color-client-text-muted)] hover:border-[color:var(--color-client-gold)] hover:text-[color:var(--color-client-gold)] transition disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Barre de saisie */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="sticky bottom-20 flex items-center gap-2 client-card rounded-full p-1.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez votre message…"
          className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-full bg-[color:var(--color-client-gold)] text-white flex items-center justify-center hover:brightness-110 transition disabled:opacity-40"
          aria-label="Envoyer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-[color:var(--color-client-gold)] text-white"
            : "bg-[color:var(--color-client-gold)]/15 text-[color:var(--color-client-gold)]"
        }`}
      >
        {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
            isUser
              ? "bg-[color:var(--color-client-gold)] text-white rounded-tr-sm"
              : "client-card rounded-tl-sm text-[color:var(--color-client-text)]"
          }`}
        >
          {message.content}
        </div>
        {message.matches && message.matches.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.matches.slice(0, 4).map((p) => (
              <span
                key={p.id}
                className="text-[11px] px-2 py-1 rounded-lg bg-[color:var(--color-client-gold)]/10 text-[color:var(--color-client-text)] border border-[color:var(--color-client-gold)]/20"
              >
                {p.name} · {p.city} · {formatDH(p.price)}
              </span>
            ))}
          </div>
        )}
        {message.source === "fallback" && (
          <p className="mt-1 text-[10px] text-[color:var(--color-client-text-muted)] italic">
            Réponse déterministe (IA non configurée)
          </p>
        )}
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <div className="flex gap-2">
      <div className="w-8 h-8 rounded-full bg-[color:var(--color-client-gold)]/15 text-[color:var(--color-client-gold)] flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4" />
      </div>
      <div className="client-card rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-[color:var(--color-client-gold)]"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
