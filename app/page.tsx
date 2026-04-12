"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { useAuth } from "@/lib/auth";
import ChatPanel from "@/components/ChatPanel";

// ── DATA ──
const colorOptions: Record<
  string,
  { id: string; name: string; swatches: string[] }[]
> = {
  luxury_dark: [
    { id: "gold", name: "ゴールド", swatches: ["#0a0a0f", "#c9a84c", "#f5e6b8"] },
    { id: "purple", name: "パープル", swatches: ["#0a0a14", "#b8a0e8", "#e0d0f8"] },
    { id: "rose", name: "ローズゴールド", swatches: ["#0f0a0a", "#e8a0a8", "#f5d8dc"] },
    { id: "silver", name: "シルバー", swatches: ["#080810", "#c0c8d8", "#e8eaf0"] },
  ],
  soft_pink: [
    { id: "rose", name: "ローズピンク", swatches: ["#fff0f5", "#f4a0bc", "#e880a0"] },
    { id: "peach", name: "ピーチ", swatches: ["#fff5ee", "#f4b89a", "#e89070"] },
    { id: "lavender", name: "ラベンダー", swatches: ["#f8f0ff", "#c8a0e8", "#a880c8"] },
    { id: "coral", name: "コーラル", swatches: ["#fff3f0", "#f09080", "#e07060"] },
  ],
  natural: [
    { id: "sage", name: "セージ", swatches: ["#f5f0e8", "#8a9e7a", "#6a7e5a"] },
    { id: "terra", name: "テラコッタ", swatches: ["#f5ede8", "#c87a60", "#a85a40"] },
    { id: "sand", name: "サンド", swatches: ["#f8f4ee", "#c0a880", "#a08060"] },
    { id: "moss", name: "モスグリーン", swatches: ["#f0f5ee", "#7a9e6a", "#5a7e4a"] },
  ],
  minimal: [
    { id: "black", name: "ブラック", swatches: ["#ffffff", "#111111", "#555555"] },
    { id: "navy", name: "ネイビー", swatches: ["#ffffff", "#1a2a4a", "#3a5a8a"] },
    { id: "forest", name: "フォレスト", swatches: ["#ffffff", "#2a4a2a", "#4a7a4a"] },
    { id: "wine", name: "ワイン", swatches: ["#faf5f5", "#6a1a2a", "#aa4a5a"] },
  ],
  bold: [
    { id: "red", name: "レッド", swatches: ["#111", "#dd2222", "#ff6644"] },
    { id: "orange", name: "オレンジ", swatches: ["#111", "#ff7722", "#ffaa44"] },
    { id: "yellow", name: "イエロー", swatches: ["#111", "#ddcc00", "#ffee44"] },
    { id: "cyan", name: "シアン", swatches: ["#111", "#00aacc", "#44ddff"] },
  ],
  pastel: [
    { id: "sky", name: "スカイ", swatches: ["#e8f4ff", "#80b4e8", "#a0c8f0"] },
    { id: "mint", name: "ミント", swatches: ["#e8fff4", "#80e8b4", "#a0f0c8"] },
    { id: "lilac", name: "ライラック", swatches: ["#f4e8ff", "#b480e8", "#c8a0f0"] },
    { id: "rainbow", name: "レインボー", swatches: ["#f8f0ff", "#b0a0e8", "#e8a0d0"] },
  ],
  warm_pop: [
    { id: "tomato", name: "トマトレッド", swatches: ["#fff8f5", "#e85a3a", "#ff8a6a"] },
    { id: "sunny", name: "サニーイエロー", swatches: ["#fffef0", "#f0c830", "#ffd850"] },
    { id: "sky_pop", name: "スカイブルー", swatches: ["#f0f8ff", "#4aa0e0", "#70c0ff"] },
    { id: "spring", name: "スプリング", swatches: ["#f8fff0", "#78c840", "#a0e860"] },
  ],
  handmade: [
    { id: "kraft", name: "クラフト", swatches: ["#faf5e8", "#c09050", "#e0b870"] },
    { id: "fabric", name: "ファブリック", swatches: ["#f8f0f5", "#c090a8", "#e0b8cc"] },
    { id: "forest_h", name: "フォレスト", swatches: ["#f0f8f0", "#60a060", "#88c888"] },
    { id: "vintage", name: "ヴィンテージ", swatches: ["#faf5ee", "#a08060", "#c8a880"] },
  ],
  local: [
    { id: "orange_l", name: "オレンジ", swatches: ["#fff8f0", "#e87830", "#ffa050"] },
    { id: "green_l", name: "グリーン", swatches: ["#f5fff5", "#508050", "#70a870"] },
    { id: "blue_l", name: "ブルー", swatches: ["#f0f5ff", "#3060a8", "#5080d0"] },
    { id: "brown_l", name: "ブラウン", swatches: ["#faf5ee", "#805030", "#a87050"] },
  ],
  cheerful: [
    { id: "rainbow_c", name: "レインボー", swatches: ["#fff", "#ff6b6b", "#4ecdc4"] },
    { id: "pop", name: "ポップ", swatches: ["#fff", "#ff88cc", "#88ddff"] },
    { id: "candy", name: "キャンディ", swatches: ["#fff5ff", "#ff66aa", "#aa66ff"] },
    { id: "neon", name: "ネオン", swatches: ["#f8fff8", "#00cc66", "#ff3399"] },
  ],
  corporate: [
    { id: "navy_c", name: "ネイビー", swatches: ["#f8faff", "#1a3a6a", "#2a5a9a"] },
    { id: "gray_c", name: "グレー", swatches: ["#f8f8f8", "#2a2a2a", "#666666"] },
    { id: "blue_c", name: "ブルー", swatches: ["#f5f8ff", "#2255aa", "#4488dd"] },
    { id: "dark_c", name: "ダーク", swatches: ["#f8f5ff", "#1a1a3a", "#3a3a6a"] },
  ],
  saas: [
    { id: "indigo", name: "インディゴ", swatches: ["#f8f5ff", "#4a30c0", "#7a60e8"] },
    { id: "teal", name: "ティール", swatches: ["#f0fffe", "#008080", "#20a8a0"] },
    { id: "violet", name: "バイオレット", swatches: ["#fdf5ff", "#8030c0", "#b060e8"] },
    { id: "slate", name: "スレート", swatches: ["#f5f8fa", "#3a5a7a", "#5a7a9a"] },
  ],
  consulting: [
    { id: "navy_co", name: "ネイビー", swatches: ["#f5f8ff", "#1a2a5a", "#2a4a8a"] },
    { id: "gold_co", name: "ゴールド", swatches: ["#faf8f0", "#8a6a20", "#c0a040"] },
    { id: "green_co", name: "ダークグリーン", swatches: ["#f5faf5", "#1a4a2a", "#2a7a4a"] },
    { id: "charcoal", name: "チャコール", swatches: ["#f8f8f8", "#2a2a2a", "#5a5a5a"] },
  ],
  medical_pro: [
    { id: "med_blue", name: "メディカルブルー", swatches: ["#f0f8ff", "#1a60a8", "#3a88d0"] },
    { id: "med_green", name: "メディカルグリーン", swatches: ["#f0fff8", "#1a7850", "#3aa870"] },
    { id: "clean", name: "クリーン", swatches: ["#ffffff", "#2a3a5a", "#4a6a8a"] },
    { id: "trust", name: "トラスト", swatches: ["#f8faff", "#1a2a6a", "#c09030"] },
  ],
};

const styleDesc: Record<string, string> = {
  luxury_dark: "ラグジュアリーダーク（黒・ダークネイビー背景、高級感、セリフ体フォント、金属光沢アクセント）",
  soft_pink: "ソフトピンク・ガーリー（淡いピンク〜ラベンダー、かわいい、丸みのあるUI）",
  natural: "ナチュラル・オーガニック（ベージュ・クリーム、温かみ、テクスチャ感）",
  minimal: "ミニマル・クリーン（白背景、細い線、シンプルで洗練されたグリッドレイアウト）",
  bold: "ボールド・エディトリアル（黒背景、大きなタイポグラフィ、インパクト重視）",
  pastel: "パステルグラデーション（淡い水色〜薄紫〜薄ピンク、夢のような柔らかさ）",
  warm_pop: "ウォームポップ（明るくポップ、親しみやすい配色、元気な雰囲気）",
  handmade: "ハンドメイド・温もり（手作り感、クラフト紙風テクスチャ、アナログな温かさ）",
  local: "ローカル・地域密着（親しみやすい、地元感、安心・信頼の雰囲気）",
  cheerful: "チアフル・にぎやか（カラフル、楽しい、元気いっぱい、イベント感）",
  corporate: "コーポレート（信頼感、プロフェッショナル、清潔感のあるビジネスデザイン）",
  saas: "SaaS・テック（モダン、デジタル、グラデーション、スタートアップ感）",
  consulting: "コンサルティング（権威感、洗練、高単価サービス向けの格調あるデザイン）",
  medical_pro: "メディカルプロ（清潔感、信頼、医療・専門職向けの安心感のあるデザイン）",
};

const patternLayouts = [
  "全画面ヒーロー（大きなキャッチコピー＋CTA）→ 強み・特徴3つ（アイコン付きカード）→ お客様の声 → CTA",
  "ヒーロー左右2カラム（左テキスト・CTA、右ビジュアル）→ 特徴カード3つ → FAQ2〜3問 → CTA",
  "縦スクロール型（大きな数字01/02/03でセクション区切り）→ 特徴 → 実績・数字 → お客様の声 → CTA",
  "洗練ワンページ（アニメーション多め、印象的なヒーロー）→ サービス概要 → 強み → シンプルで美しいCTA",
];

const samplePrompts: Record<string, string> = {
  luxury_dark: "美容クリニック「BLANC CLINIC」のLP。黒・ダークネイビー背景、パープルグラデーションアクセント。Cormorant Garamond + Noto Sans JP。全画面ヒーロー→特徴3つ→CTA。",
  soft_pink: "まつ毛サロン「Lash & Co.」のLP。淡いピンク〜ラベンダー背景。Playfair Display + Noto Sans JP。ヒーロー→メニュー→口コミ→CTA。",
  natural: "オーガニックカフェ「Mori no Cha」のLP。クリーム・ベージュ背景、グリーンアクセント。Lora + Noto Sans JP。",
  minimal: "フリーランスデザイナーのポートフォリオLP。白背景、黒テキスト、細い線。DM Serif Display + Noto Sans JP。",
  bold: "パーソナルジム「IRON MIND」のLP。黒背景、赤アクセント。Bebas Neue + Noto Sans JP。大きなタイポグラフィ。",
  pastel: "オンラインヨガ「Sora Yoga」のLP。水色〜薄紫グラデーション。Quicksand + Noto Sans JP。",
  warm_pop: "地域のパン屋「Sunny Bakery」のLP。明るいオレンジ・イエロー。Fredoka One + Noto Sans JP。楽しくポップ。",
  handmade: "ハンドメイドアクセサリーショップ「tette」のLP。クラフト紙風ベージュ背景。手書き風フォント + Noto Sans JP。",
  local: "地域の整骨院「さくら整骨院」のLP。明るく親しみやすい、地域密着感。Noto Serif JP + Noto Sans JP。",
  cheerful: "こども向けプログラミング教室「Code Kids」のLP。カラフル・にぎやか。Rounded Mplus + Noto Sans JP。",
  corporate: "株式会社テクノの企業サイトLP。ネイビー背景。信頼感・プロフェッショナル。Noto Serif JP + Noto Sans JP。",
  saas: "タスク管理SaaS「TaskFlow」のLP。インディゴグラデーション。モダン・テック感。Plus Jakarta Sans + Noto Sans JP。",
  consulting: "経営コンサル「APEX Partners」のLP。ダークネイビー＋ゴールド。格調・権威感。Cormorant Garamond + Noto Sans JP。",
  medical_pro: "内科クリニック「みなと内科」のLP。清潔感・信頼感。メディカルブルー。Noto Serif JP + Noto Sans JP。",
};

const categories: { id: string; label: string; styleIds: string[] }[] = [
  { id: "artistic", label: "Artistic", styleIds: ["luxury_dark", "soft_pink", "natural", "minimal", "bold", "pastel"] },
  { id: "friendly", label: "Friendly", styleIds: ["warm_pop", "handmade", "local", "cheerful"] },
  { id: "business", label: "Business", styleIds: ["corporate", "saas", "consulting", "medical_pro"] },
];

const styleNames: Record<string, string> = {
  luxury_dark: "Luxury Dark", soft_pink: "Soft Pink", natural: "Natural", minimal: "Minimal",
  bold: "Bold", pastel: "Pastel", warm_pop: "Warm Pop", handmade: "Handmade",
  local: "Local", cheerful: "Cheerful", corporate: "Corporate", saas: "SaaS",
  consulting: "Consulting", medical_pro: "Medical Pro",
};

const purposeOptions = [
  "新規顧客の集客", "求人・採用", "新商品・新メニューの認知", "予約・問い合わせ促進",
  "イベント・セミナー告知", "ブランド認知", "資料請求・リード獲得", "商品・サービス販売",
];

// ── API helper (streaming) ──
async function callAPIStream(
  prompt: string,
  onChunk: (text: string) => void
): Promise<string> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
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
        } else if (parsed.error) {
          throw new Error(parsed.error);
        }
      } catch {
        // skip parse errors
      }
    }
  }

  const html = full
    .replace(/```html\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return html;
}

export default function Home() {
  const { user, isAdmin, signInWithGoogle, signOut } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [activeCat, setActiveCat] = useState("artistic");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [industry, setIndustry] = useState("");
  const [shopName, setShopName] = useState("");
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [generatedHTMLs, setGeneratedHTMLs] = useState<(string | null)[]>([null, null, null, null]);
  const [activeTab, setActiveTab] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [tabStates, setTabStates] = useState<("idle" | "generating" | "done")[]>(["idle", "idle", "idle", "idle"]);
  const [showResults, setShowResults] = useState(false);
  const isReady = selectedStyle && industry.trim() && shopName.trim() && selectedPurposes.length > 0;

  const handleSelectStyle = useCallback((id: string) => {
    setSelectedStyle(id);
    const colors = colorOptions[id] || [];
    setSelectedColor(colors[0]?.id || null);
  }, []);

  const handleSwitchCat = (catId: string) => {
    setActiveCat(catId);
    const cat = categories.find((c) => c.id === catId);
    if (selectedStyle && cat && !cat.styleIds.includes(selectedStyle)) {
      setSelectedStyle(null);
      setSelectedColor(null);
    }
  };

  const togglePurpose = (p: string) => {
    setSelectedPurposes((prev) =>
      prev.includes(p) ? prev.filter((v) => v !== p) : [...prev, p]
    );
  };

  const generate = async () => {
    if (!selectedStyle || !isReady) return;
    setShowResults(true);
    setGenerating(true);
    setGeneratedHTMLs([null, null, null, null]);
    setTabStates(["idle", "idle", "idle", "idle"]);
    setActiveTab(0);

    const purposes = selectedPurposes.join("・");
    const colorName = (colorOptions[selectedStyle] || []).find((c) => c.id === selectedColor)?.name || "";

    // Generate one at a time sequentially
    for (let i = 0; i < 4; i++) {
      setActiveTab(i);
      setTabStates((prev) => {
        const next = [...prev];
        next[i] = "generating";
        return next;
      });

      const prompt = `以下の条件で完全なランディングページのHTMLを生成してください。

【基本情報】
- 業種: ${industry}
- 名前: ${shopName}
- 目的: ${purposes}

【デザイン】
- スタイル: ${styleDesc[selectedStyle]}
- アクセントカラー: ${colorName}
- レイアウト: ${patternLayouts[i]}

【要件】
- Google Fonts使用（スタイルに合った美しいフォント）
- CSSアニメーション・トランジション含む
- モバイルレスポンシブ
- 業種に合った自然な日本語コピー（薬機法・景品表示法に配慮）
- 完全なHTMLのみ返すこと`;

      try {
        const html = await callAPIStream(prompt, (partial) => {
          // Update preview with partial HTML during streaming
          const cleaned = partial
            .replace(/```html\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
          setGeneratedHTMLs((prev) => {
            const next = [...prev];
            next[i] = cleaned;
            return next;
          });
        });
        setGeneratedHTMLs((prev) => {
          const next = [...prev];
          next[i] = html;
          return next;
        });
        setTabStates((prev) => {
          const next = [...prev];
          next[i] = "done";
          return next;
        });
      } catch {
        const errHtml = `<!DOCTYPE html><html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#999;background:#f8f8f8;"><p>生成エラーが発生しました</p></body></html>`;
        setGeneratedHTMLs((prev) => {
          const next = [...prev];
          next[i] = errHtml;
          return next;
        });
        setTabStates((prev) => {
          const next = [...prev];
          next[i] = "done";
          return next;
        });
      }
    }

    setGenerating(false);
  };

  const downloadLP = (i: number) => {
    const html = generatedHTMLs[i];
    if (!html) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = `paletta-lp-pattern${i + 1}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const openLP = (i: number) => {
    const html = generatedHTMLs[i];
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const copyLP = (i: number) => {
    const html = generatedHTMLs[i];
    if (!html) return;
    navigator.clipboard.writeText(html).then(() => alert(`Pattern ${i + 1} をコピーしました！`));
  };

  const resetAll = () => {
    setShowResults(false);
    setSelectedStyle(null);
    setSelectedColor(null);
    setIndustry("");
    setShopName("");
    setSelectedPurposes([]);
    setGeneratedHTMLs([null, null, null, null]);
    setTabStates(["idle", "idle", "idle", "idle"]);
    setGenerating(false);
  };

  const hasColorSection = selectedStyle && colorOptions[selectedStyle];
  const stepInfoNum = hasColorSection ? "03" : "02";
  const stepPurposeNum = hasColorSection ? "04" : "03";

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Paletta</span>
          <div className={styles.logoDot}></div>
          <span className={styles.logoTag}>LP Generator</span>
        </div>
        <div className={styles.headerRight}>
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

      <div className={styles.app}>
        {/* LEFT PANEL */}
        <div className={styles.left}>
          {/* STEP 1: STYLE */}
          <div className={styles.stepBlock}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNum}>01</span>
              <span className={styles.stepTitle}>スタイルを選ぶ</span>
            </div>

            <div className={styles.catTabs}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.catTab} ${activeCat === cat.id ? styles.active : ""}`}
                  onClick={() => handleSwitchCat(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {categories.map((cat) => (
              <div
                key={cat.id}
                className={styles.styleGrid}
                style={{ display: activeCat === cat.id ? "grid" : "none" }}
              >
                {cat.styleIds.map((sid) => (
                  <div
                    key={sid}
                    className={`${styles.styleCard} ${selectedStyle === sid ? styles.selected : ""}`}
                    onClick={() => handleSelectStyle(sid)}
                  >
                    <div className={styles.styleThumb}>
                      <div className={styles.thumbPreview}>
                        {(colorOptions[sid] || []).slice(0, 1).map((c) => (
                          <div key={c.id} className={styles.thumbSwatches}>
                            {c.swatches.map((s, j) => (
                              <div key={j} style={{ background: s, flex: 1, height: "100%" }}></div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={styles.styleInfo}>
                      <div className={styles.styleName}>{styleNames[sid]}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* STEP 2: COLOR */}
          {hasColorSection && (
            <div className={styles.stepBlock}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNum}>02</span>
                <span className={styles.stepTitle}>カラーを選ぶ</span>
              </div>
              <div className={styles.colorGrid}>
                {(colorOptions[selectedStyle] || []).map((c) => (
                  <div
                    key={c.id}
                    className={`${styles.colorCard} ${selectedColor === c.id ? styles.selected : ""}`}
                    onClick={() => setSelectedColor(c.id)}
                  >
                    <div className={styles.colorSwatches}>
                      {c.swatches.map((s, j) => (
                        <div key={j} className={styles.swatch} style={{ background: s }}></div>
                      ))}
                    </div>
                    <span className={styles.colorName}>{c.name}</span>
                    <span className={styles.colorCheck}>✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: INFO */}
          <div className={styles.stepBlock}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNum}>{stepInfoNum}</span>
              <span className={styles.stepTitle}>基本情報</span>
            </div>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>業種・サービスの種類</label>
                <input
                  className={styles.input}
                  placeholder="例：美容クリニック、カフェ、ITコンサル"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>店名・サービス名</label>
                <input
                  className={styles.input}
                  placeholder="例：LORE CLINIC"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* STEP 4: PURPOSE */}
          <div className={styles.stepBlock}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNum}>{stepPurposeNum}</span>
              <span className={styles.stepTitle}>LPの目的</span>
            </div>
            <div className={styles.chips}>
              {purposeOptions.map((p) => (
                <div
                  key={p}
                  className={`${styles.chip} ${selectedPurposes.includes(p) ? styles.selected : ""}`}
                  onClick={() => togglePurpose(p)}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.generateWrap}>
            <button
              className={styles.btnGenerate}
              onClick={generate}
              disabled={!isReady || generating}
            >
              <span className={styles.sparkle}>✦</span>
              4パターン生成する
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.right}>
          {!showResults && (
            <div className={styles.placeholder}>
              <div className={styles.placeholderArt}>
                {[32, 48, 40, 56, 36].map((h, i) => (
                  <div
                    key={i}
                    className={styles.placeholderBar}
                    style={{ height: h, animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>
              <p>スタイルを選んでスタート</p>
            </div>
          )}

          {showResults && (
            <div className={styles.results}>
              <div className={styles.resultsBar}>
                <div className={styles.resultsLabel}>
                  Generated
                  <span className={styles.resultsBadge}>4 patterns</span>
                </div>
                <button className={styles.btnRedo} onClick={resetAll}>← 最初から</button>
              </div>

              <div className={styles.tabs}>
                {[0, 1, 2, 3].map((i) => (
                  <button
                    key={i}
                    className={`${styles.tab} ${activeTab === i ? styles.active : ""} ${
                      tabStates[i] === "generating" ? styles.generating : ""
                    } ${tabStates[i] === "done" ? styles.done : ""}`}
                    onClick={() => setActiveTab(i)}
                  >
                    Pattern {i + 1} <span className={styles.dot}></span>
                  </button>
                ))}
              </div>

              <div className={styles.panels}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`${styles.panel} ${activeTab === i ? styles.active : ""}`}>
                    {!generatedHTMLs[i] ? (
                      <div className={styles.panelLoading}>
                        <div className={styles.panelSpinner}></div>
                        <p className={styles.panelLoadingText}>Generating...</p>
                      </div>
                    ) : (
                      <iframe
                        className={styles.lpFrame}
                        srcDoc={generatedHTMLs[i] || ""}
                        title={`LP Pattern ${i + 1}`}
                      />
                    )}
                    <div className={styles.panelFooter}>
                      <button className={`${styles.btnAction} ${styles.secondary}`} onClick={() => downloadLP(i)}>
                        DL
                      </button>
                      <button className={`${styles.btnAction} ${styles.secondary}`} onClick={() => copyLP(i)}>
                        コピー
                      </button>
                      <button className={`${styles.btnAction} ${styles.primary}`} onClick={() => openLP(i)} disabled={!generatedHTMLs[i]}>
                        別タブで開く
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating chat button - admin only */}
      {isAdmin && !chatOpen && (
        <button
          className={styles.fab}
          onClick={() => setChatOpen(true)}
          aria-label="Open chat"
        >
          P
        </button>
      )}

      {/* Slide-out chat panel overlay */}
      {isAdmin && chatOpen && (
        <>
          <div
            className={styles.panelOverlay}
            onClick={() => setChatOpen(false)}
          />
          <div className={styles.slidePanel}>
            <ChatPanel onClose={() => setChatOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
