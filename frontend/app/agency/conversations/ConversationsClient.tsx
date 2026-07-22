"use client";

import { useEffect, useState } from "react";
import { Search, Send, Building } from "lucide-react";
import { postMessage, type Conversation, type ConversationMessage } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAI } from "@/hooks/useAI";

export default function ConversationsClient({
  initialConversations,
}: {
  initialConversations: Conversation[];
}) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0]?.id ?? "");
  const [q, setQ] = useState("");
  const [input, setInput] = useState("");
  const { send, loading } = useAI("agency");

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];
  const filtered = conversations.filter((c) =>
    c.propertyName.toLowerCase().includes(q.toLowerCase()),
  );

  // Écoute temps réel des nouveaux messages (Socket.io)
  useEffect(() => {
    const socket = getSocket();
    const handler = ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: ConversationMessage;
    }) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          // Dédoublonnage par id
          if (message.id && c.messages.some((m) => m.id === message.id)) return c;
          return {
            ...c,
            lastMessage: message.content.slice(0, 60),
            messages: [...c.messages, message],
          };
        }),
      );
    };
    socket.on("message:new", handler);
    return () => {
      socket.off("message:new", handler);
    };
  }, []);

  // Rejoint / quitte la room de la conversation active
  useEffect(() => {
    if (!activeId) return;
    const socket = getSocket();
    socket.emit("conversation:join", activeId);
    return () => {
      socket.emit("conversation:leave", activeId);
    };
  }, [activeId]);

  if (!active) {
    return (
      <div className="agency-card rounded-xl p-8 text-center text-white/60">
        Aucune conversation pour le moment.
      </div>
    );
  }

  const submit = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput("");
    const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

    try {
      // Le message s'affichera via l'écho temps réel (Socket.io)
      await postMessage(activeId, {
        role: "user",
        content: userMsg,
        timestamp: now,
      });

      const context = `Bien: ${active.propertyName} (${active.propertyType})`;
      const reply = await send(userMsg, context);

      await postMessage(activeId, {
        role: "assistant",
        content: reply,
        timestamp: now,
      });
    } catch {
      /* handled by hook */
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      <div className="w-80 agency-card rounded-xl flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left p-3 border-b border-white/5 hover:bg-white/5 transition ${
                c.id === activeId ? "bg-[color:var(--color-agency-accent)]/15" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[color:var(--color-agency-accent)]/15 flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4 text-[color:var(--color-agency-accent-light)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.propertyName}</div>
                  <div className="text-xs text-white/50 truncate">{c.lastMessage}</div>
                  <div className="text-[10px] text-white/40 mt-1">{c.timestamp}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 agency-card rounded-xl flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[color:var(--color-agency-accent)]/15 flex items-center justify-center">
            <Building className="w-5 h-5 text-[color:var(--color-agency-accent-light)]" />
          </div>
          <div>
            <div className="text-sm font-medium">{active.propertyName}</div>
            <div className="text-xs text-white/50">{active.propertyType}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {active.messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                  m.role === "user"
                    ? "bg-[color:var(--color-agency-accent)] text-white"
                    : "bg-white/10 text-white/90"
                }`}
              >
                <div>{m.content}</div>
                <div
                  className={`text-[10px] mt-1 ${m.role === "user" ? "text-white/70" : "text-white/40"}`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}
          {loading && <div className="text-xs text-white/50">L'IA écrit...</div>}
        </div>

        <div className="p-4 border-t border-white/10 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Posez votre question..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[color:var(--color-agency-accent)]"
          />
          <button
            onClick={submit}
            disabled={loading}
            className="px-4 rounded-lg bg-[color:var(--color-agency-accent)] text-white hover:brightness-110 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
