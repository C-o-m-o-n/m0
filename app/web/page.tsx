"use client";
import { useState, useRef, useEffect } from "react";
import { message } from "@/lib/types";
import { nanoid } from "nanoid";

export default function Playground() {
  const [messages, setMessages] = useState<message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    const userMsg = { id: nanoid(), content: input, role: "user" } as message;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const response = await fetch("/api/gemini-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMsg] }),
    });

    if (!response.ok) {
      setIsLoading(false);
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let aiText = "";

    while (reader && !done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        chunk.split("\n\n").forEach((line) => {
          if (line.startsWith("data: ")) {
            const data = line.replace("data: ", "");
            if (data === "[DONE]") return;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                aiText += parsed.text;
                // Show partial AI message as streaming
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "assistant") {
                    return [
                      ...prev.slice(0, -1),
                      { ...last, content: aiText, id: last.id },
                    ];
                  } else {
                    return [
                      ...prev,
                      { id: nanoid(), content: aiText, role: "assistant" },
                    ];
                  }
                });
              }
            } catch {}
          }
        });
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#343541]">
      {/* Header */}
      <header className="p-4 border-b border-[#202123] bg-[#343541] flex items-center justify-center">
        <h1 className="text-2xl font-bold text-white">m0: AI Mobile UI Generator</h1>
      </header>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto px-0 sm:px-0 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`rounded-lg px-4 py-3 max-w-[80%] whitespace-pre-wrap break-words shadow
          ${
            msg.role === "user"
              ? "bg-[#2b2c2f] text-white"
              : "bg-[#444654] text-[#ececf1]"
          }
            `}
          >
            {msg.content}
          </div>
        </div>
          ))}
          {isLoading && (
        <div className="flex justify-start">
          <div className="rounded-lg px-4 py-3 max-w-[80%] bg-[#444654] text-[#ececf1] shadow animate-pulse">
            ...
          </div>
        </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input area */}
      <form
        className="w-full max-w-2xl mx-auto p-4 flex gap-2 bg-[#343541] border-t border-[#202123]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!isLoading) handleGenerate();
        }}
      >
        <input
          className="flex-1 rounded-md px-4 py-3 bg-[#40414f] text-white border-none outline-none"
          placeholder="Send a message..."
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-[#19c37d] hover:bg-[#15a06a] text-white font-bold px-4 py-2 rounded-md disabled:opacity-50"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}