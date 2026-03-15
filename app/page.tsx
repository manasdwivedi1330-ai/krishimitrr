"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChatBox, type ChatMessage } from "@/components/ChatBox";
import { InputBar } from "@/components/InputBar";

const WELCOME_MESSAGE: ChatMessage = {
  role: "model",
  content:
    "Jai Kisan! 🌾 Main hoon KrishiMitrr — aapka personal kheti advisor! Fasal, paani, keede, khad — sab mein madad karunga! Batao kya sawaal hai? 😊",
};

const ERROR_MESSAGE = "Kuch error aa gaya! Thodi der baad try karo. 🙏";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    const userMessage: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const historyForApi = [
      ...messages.filter((m) => m.role !== "model" || !m.isStreaming),
      userMessage,
    ].map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const placeholder: ChatMessage = {
      role: "model",
      content: "",
      isStreaming: true,
    };
    setMessages((prev) => [...prev, placeholder]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyForApi.slice(0, -1),
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === "model" && last.isStreaming) {
              next[next.length - 1] = {
                ...last,
                content: fullText,
                isStreaming: true,
              };
            }
            return next;
          });
        }
      } else {
        fullText = await res.text();
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "model" && last.isStreaming) {
            next[next.length - 1] = { ...last, content: fullText || ERROR_MESSAGE, isStreaming: false };
          }
          return next;
        });
      }

      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "model" && last.isStreaming) {
          next[next.length - 1] = {
            ...last,
            content: fullText || ERROR_MESSAGE,
            isStreaming: false,
          };
        }
        return next;
      });
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "model" && last.isStreaming) {
          next[next.length - 1] = { ...last, content: ERROR_MESSAGE, isStreaming: false };
        }
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  return (
    <div className="flex flex-col h-dvh max-h-dvh bg-[#f0f7e6]">
      <header className="flex-shrink-0 bg-[#2d6a4f] text-white shadow-md">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <span aria-hidden>🌾</span> KrishiMitrr
          </h1>
          <p className="text-sm sm:text-base text-white/90 mt-0.5 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            Online — Kisan Ka AI Dost
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto max-w-3xl min-h-full">
          <ChatBox messages={messages} showTyping={isLoading && messages[messages.length - 1]?.role === "model" && messages[messages.length - 1]?.content === ""} />
          <div ref={bottomRef} />
        </div>
      </main>

      <div className="flex-shrink-0 mx-auto w-full max-w-3xl">
        <InputBar
          value={input}
          onChange={setInput}
          onSend={sendMessage}
          disabled={isLoading}
          placeholder="Kheti sawaal poochho..."
        />
      </div>
    </div>
  );
}
