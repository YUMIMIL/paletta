"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./chat.module.css";
import { useAuth } from "@/lib/auth";

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

export default function ChatPage() {
  const { user, loading, isAdmin, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/");
    }
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: '"DM Sans", sans-serif',
        fontSize: 13,
        color: "var(--muted)",
        letterSpacing: "0.1em",
      }}>
        Loading...
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

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

    // If URL, trigger analysis
    if (isURL(text)) {
      setIsAnalyzing(true);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "このURL、見てみますね…" },
      ]);

      try {
        const result = await analyzeURL(text);

        const stars = "★".repeat(result.verdict.score) + "☆".repeat(5 - result.verdict.score);
        const goodList = result.verdict.good_points.map((p: string) => `  ✦ ${p}`).join("\n");
        const weakList = result.verdict.weak_points.map((p: string) => `  △ ${p}`).join("\n");

        const analysisMsg = `${result.comment}

─── デザイン評価 ${stars} ───

**良いところ**
${goodList}

**惜しいところ**
${weakList}

覚えました。次のLP生成に活かしますね。`;

        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: analysisMsg };
          return next;
        });
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : "解析に失敗しました";
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content: `あ、ごめんなさい…このURLの解析でエラーが出ちゃいました。\n\n${errMsg}`,
          };
          return next;
        });
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    // Normal chat
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
          content: "あ、ごめんなさい…ちょっとエラーが出ちゃいました。もう一度試してみてください。",
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
    <>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link href="/" className={styles.logoLink}>
            <span className={styles.logoText}>Paletta</span>
            <div className={styles.logoDot}></div>
          </Link>
          <span className={styles.logoTag}>Chat</span>
        </div>
        <div className={styles.headerRight}>
          <Link href="/" className={styles.headerLink}>LP生成</Link>
          <Link href="/how-to" className={styles.headerLink}>使い方</Link>
          {user ? (
            <button className={styles.authBtn} onClick={signOut}>
              ログアウト
            </button>
          ) : (
            <button className={styles.authBtn} onClick={signInWithGoogle}>
              ログイン
            </button>
          )}
        </div>
      </header>

      <div className={styles.chatWrap}>
        <div className={styles.chatMessages} ref={scrollRef}>
          {messages.length === 0 && (
            <div className={styles.welcome}>
              <div className={styles.welcomeIcon}>✦</div>
              <h2 className={styles.welcomeTitle}>Palettaです</h2>
              <p className={styles.welcomeText}>
                デザインについて何でも聞いてください。<br />
                URLを送ると、そのサイトのデザインを解析して学習します。
              </p>
              <div className={styles.welcomeHints}>
                <button
                  className={styles.hintChip}
                  onClick={() => setInput("LPのカラーパレットの選び方を教えて")}
                >
                  カラーパレットの選び方
                </button>
                <button
                  className={styles.hintChip}
                  onClick={() => setInput("余白の使い方のコツは？")}
                >
                  余白の使い方
                </button>
                <button
                  className={styles.hintChip}
                  onClick={() => setInput("美容クリニックのLPに合うフォントは？")}
                >
                  フォント相談
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.message} ${
                msg.role === "user" ? styles.user : styles.assistant
              }`}
            >
              {msg.role === "assistant" && (
                <div className={styles.avatar}>P</div>
              )}
              <div className={styles.bubble}>
                <div className={styles.bubbleText}>{msg.content}</div>
              </div>
            </div>
          ))}

          {(isStreaming || isAnalyzing) && (
            <div className={styles.typing}>
              <div className={styles.typingDot}></div>
              <div className={styles.typingDot}></div>
              <div className={styles.typingDot}></div>
            </div>
          )}
        </div>

        <div className={styles.inputWrap}>
          <div className={styles.inputBox}>
            <textarea
              className={styles.textarea}
              placeholder="デザインについて聞く or URLを貼って解析..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isStreaming || isAnalyzing}
            />
            <button
              className={styles.btnSend}
              onClick={handleSend}
              disabled={!input.trim() || isStreaming || isAnalyzing}
            >
              →
            </button>
          </div>
          <p className={styles.inputHint}>
            URLを送るとデザインを解析・学習します
          </p>
        </div>
      </div>
    </>
  );
}
