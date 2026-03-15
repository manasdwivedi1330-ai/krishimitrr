"use client";

import React from "react";

export type MessageRole = "user" | "model";

export interface MessageProps {
  role: MessageRole;
  content: string;
  isStreaming?: boolean;
}

export function Message({ role, content, isStreaming }: MessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex w-full animate-fade-in ${isUser ? "justify-end" : "justify-start"}`}
      style={{ animationDuration: "0.3s" }}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-[#2d6a4f] text-white rounded-br-md"
            : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
        }`}
      >
        <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
          {content}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-0.5 bg-current animate-pulse align-middle" />
          )}
        </p>
      </div>
    </div>
  );
}
