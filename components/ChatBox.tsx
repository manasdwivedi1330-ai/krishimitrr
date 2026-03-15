"use client";

import React from "react";
import { Message, type MessageRole } from "./Message";

export interface ChatMessage {
  role: MessageRole;
  content: string;
  isStreaming?: boolean;
}

export interface ChatBoxProps {
  messages: ChatMessage[];
  showTyping?: boolean;
}

export function ChatBox({ messages, showTyping }: ChatBoxProps) {
  const showEmptyStreamingAsTyping = showTyping && messages.length > 0 && messages[messages.length - 1]?.role === "model" && messages[messages.length - 1]?.content === "";
  const displayMessages = showEmptyStreamingAsTyping ? messages.slice(0, -1) : messages;

  return (
    <div className="flex flex-col gap-4 py-4 px-2 sm:px-4">
      {displayMessages.map((msg, i) => (
        <Message
          key={i}
          role={msg.role}
          content={msg.content}
          isStreaming={msg.isStreaming}
        />
      ))}
      {showTyping && (
        <div className="flex justify-start animate-fade-in">
          <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
