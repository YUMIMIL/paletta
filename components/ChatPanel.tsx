"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

async function streamChat(
  messages: { role: string; content: string }[],
  onChunk: (text: string) => void
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "API error");
  }
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6);
      if (payload === "[DONE]") break;
      try {
        const parsed = JSON.parse(payload);
        if (typeof parsed === "string") {
          full += parsed;
          onChunk(full);
        }
      } catch {
        // skip
      }
    }
  }
  return full;
}

async function analyzeURL(url: string): Promise<{
  comment: string;
  verdict: { score: number; good_points: string[]; weak_points: string[] };
}> {
  const res = await fetch("/api/learn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Analysis failed");
  }
  return res.json();
}

interface ChatPanelProps {
  onClose: () => void;
}

export default function ChatPanel({ onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const isURL = (text: string) => {
    try {
      const url = new URL(text.trim());
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming || isAnalyzing) return;

    setInput("");
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    if (isURL(text)) {
      setIsAnalyzing(true);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "このURL、見てみますね..." },
      ]);

      try {
        const result = await analyzeURL(text);
        const stars = "\u2605".repeat(result.verdict.score) + "\u2606".repeat(5 - result.verdict.score);
        const goodList = result.verdict.good_points.map((p: string) => `  \u2726 ${p}`).join("\n");
        const weakList = result.verdict.weak_points.map((p: string) => `  \u25B3 ${p}`).join("\n");

        const analysisMsg = `${result.comment}

\u2500\u2500\u2500 \u30C7\u30B6\u30A4\u30F3\u8A55\u4FA1 ${stars} \u2500\u2500\u2500

**\u826F\u3044\u3068\u3053\u308D**
${goodList}

**\u60DC\u3057\u3044\u3068\u3053\u308D**
${weakList}

\u899A\u3048\u307E\u3057\u305F\u3002\u6B21\u306ELP\u751F\u6210\u306B\u6D3B\u304B\u3057\u307E\u3059\u306D\u3002`;

        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: analysisMsg };
          return next;
        });
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : "\u89E3\u6790\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content: `\u3042\u3001\u3054\u3081\u3093\u306A\u3055\u3044\u2026\u3053\u306EURL\u306E\u89E3\u6790\u3067\u30A8\u30E9\u30FC\u304C\u51FA\u3061\u3083\u3044\u307E\u3057\u305F\u3002\n\n${errMsg}`,
          };
          return next;
        });
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    setIsStreaming(true);
    const chatHistory = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const final = await streamChat(chatHistory, (partial) => {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: partial };
          return next;
        });
      });
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: final };
        return next;
      });
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: "\u3042\u3001\u3054\u3081\u3093\u306A\u3055\u3044\u2026\u3061\u3087\u3063\u3068\u30A8\u30E9\u30FC\u304C\u51FA\u3061\u3083\u3044\u307E\u3057\u305F\u3002\u3082\u3046\u4E00\u5EA6\u8A66\u3057\u3066\u307F\u3066\u304F\u3060\u3055\u3044\u3002",
        };
        return next;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [input, messages, isStreaming, isAnalyzing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}>
      {/* Panel header */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(253, 251, 248, 0.92)",
        backdropFilter: "blur(12px)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 18,
            fontWeight: 400,
            letterSpacing: "0.05em",
            color: "var(--text)",
          }}>Paletta</span>
          <span style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 9,
            fontWeight: 300,
            letterSpacing: "0.2em",
            color: "var(--accent2)",
            textTransform: "uppercase" as const,
          }}>Chat</span>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: "1px solid var(--border2)",
            background: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "var(--muted)",
            transition: "all 0.18s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border2)";
            e.currentTarget.style.color = "var(--muted)";
          }}
        >
          \u00D7
        </button>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {messages.length === 0 && (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 22, color: "var(--accent)" }}>{"\u2726"}</div>
            <div style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 18,
              fontWeight: 400,
              color: "var(--text)",
            }}>Palettaです</div>
            <p style={{
              fontSize: 12,
              color: "var(--muted)",
              lineHeight: 1.7,
              fontWeight: 300,
            }}>
              デザインについて何でも聞いてください。<br />
              URLを送ると解析・学習します。
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {msg.role === "assistant" && (
              <div style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "var(--accent)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 12,
                flexShrink: 0,
              }}>P</div>
            )}
            <div style={{
              maxWidth: "80%",
              borderRadius: 14,
              padding: "10px 14px",
              fontSize: 12,
              lineHeight: 1.7,
              fontWeight: 300,
              whiteSpace: "pre-wrap" as const,
              wordBreak: "break-word" as const,
              ...(msg.role === "user" ? {
                background: "var(--text)",
                color: "var(--bg)",
                borderBottomRightRadius: 4,
              } : {
                background: "white",
                border: "1px solid var(--border)",
                borderBottomLeftRadius: 4,
              }),
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {(isStreaming || isAnalyzing) && (
          <div style={{ display: "flex", gap: 4, paddingLeft: 34 }}>
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "var(--surface)",
                  animation: "pulse 1.2s ease-in-out infinite",
                  animationDelay: `${j * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input area */}
      <div style={{
        padding: "12px 16px 16px",
        borderTop: "1px solid var(--border)",
        background: "var(--bg)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 6,
          background: "white",
          border: "1.5px solid var(--border2)",
          borderRadius: 10,
          padding: "8px 10px",
        }}>
          <textarea
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontFamily: '"Noto Sans JP", sans-serif',
              fontSize: 12,
              fontWeight: 300,
              color: "var(--text)",
              resize: "none",
              lineHeight: 1.6,
              background: "transparent",
            }}
            placeholder="デザインについて聞く or URLを貼って解析..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isStreaming || isAnalyzing}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming || isAnalyzing}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "none",
              background: "var(--text)",
              color: "var(--bg)",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              opacity: (!input.trim() || isStreaming || isAnalyzing) ? 0.2 : 1,
            }}
          >
            {"\u2192"}
          </button>
        </div>
      </div>
    </div>
  );
}
