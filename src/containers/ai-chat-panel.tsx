import { useEffect, useRef, useState } from "react";
import { Send, Bot, User as UserIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  role: "ai" | "user";
  message: string;
  timestamp: number;
}

interface AiChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
}

const cleanInterviewText = (value: string) =>
  value
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```[a-z]*\n?/gi, "").replace(/```/g, ""))
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .trim();

export const AiChatPanel = ({ messages, onSendMessage, isTyping }: AiChatPanelProps) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full glass-card rounded-2xl overflow-hidden border border-border/50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 bg-black/20">
        <div className="p-1.5 rounded-lg bg-emerald-500/10">
          <Bot className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI Interviewer</h3>
          <p className="text-xs text-muted-foreground">Watching your code in real-time</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""} animate-fade-in`}
          >
            <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${msg.role === "ai" ? "bg-emerald-500/10" : "bg-blue-500/10"
              }`}>
              {msg.role === "ai" ? (
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-blue-400" />
              )}
            </div>
            <div className={`max-w-[85%] ${msg.role === "ai" ? "chat-bubble-ai" : "chat-bubble-user"
              }`}>
              <div className="text-sm leading-6 whitespace-pre-wrap prose prose-invert prose-p:leading-6 prose-pre:p-0 prose-pre:bg-transparent max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="my-2 list-disc pl-4 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="my-2 list-decimal pl-4 space-y-1">{children}</ol>,
                    strong: ({ children }) => <span className="font-semibold text-foreground">{children}</span>,
                  }}
                >
                  {cleanInterviewText(msg.message)}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-emerald-500/10">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="chat-bubble-ai">
              <div className="flex items-center gap-1.5 py-1">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/30 bg-black/20">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your response..."
            className="flex-1 bg-white/5 border-border/30 text-sm"
            disabled={isTyping}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
