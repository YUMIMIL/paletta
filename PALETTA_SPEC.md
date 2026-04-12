# Paletta 仕様書 v1.0

## プロジェクト概要

**Paletta**はLP生成ツールをベースに、デザイン審美眼を持つAIエージェントキャラクターへと進化させたプロダクト。  
URLやフィードバックから「良いデザイン」を学習・蓄積し、生成精度を継続的に高める。

- **リポジトリ**: hirunoko0330 / paletta
- **スタック**: Next.js 14 + Firebase (Firestore) + Anthropic API (Claude Sonnet)
- **デプロイ**: Vercel（hirunoko0330アカウント）

---

## 現在の実装状況（v0時点）

### 完了済み
- Next.jsプロジェクト初期セットアップ
- paletta.html → Next.js移植完了
  - `app/page.tsx` — メインUI
  - `app/api/generate/route.ts` — Claude APIストリーミング生成エンドポイント
  - How-toページ

### 実装済み機能
- 14種類のデザインスタイル（Artistic / Friendly / Businessの3カテゴリ）
- カラーバリエーション選択（各スタイルに4色）
- 業種・店名・目的の入力
- 4パターン同時生成（レイアウト違い・ストリーミング表示）
- 生成結果のDL / コピー / 別タブプレビュー

---

## デザインシステム

```css
--bg:           #fdfbf8   /* メイン背景（温かみのあるオフホワイト） */
--bg2:          #f7f4ef   /* サブ背景（右パネルなど） */
--surface:      #eeeae3   /* サーフェス */
--text:         #1c1712   /* メインテキスト */
--text2:        #4a4540   /* サブテキスト */
--muted:        rgba(28,23,18,0.4)
--accent:       #c4773a   /* メインアクセント（テラコッタ/銅） */
--accent-light: #f0dcc8   /* アクセント薄い版 */
--accent2:      #7a5c9e   /* セカンドアクセント（紫） */
```

**トーン**: 温かみのあるベージュ系 × テラコッタ × パープル  
YUMIMILのダーク系エージェント群と対をなす「昼の温かさ」を持つデザイン。

---

## Paletta キャラクター設定

### ビジュアル設定

| 項目 | 内容 |
|------|------|
| キャラクターイラスト | `assets/paletta-character.png` |
| 髪色 | プラチナブロンド（温かみのある淡いゴールド） |
| 服装 | クリームホワイトのボヘミアンワンピース・フラワーアクセサリー |
| 足元 | テラコッタのプラットフォームブーツ（`--accent #c4773a` と対応） |
| 背景モチーフ | イエローローズ・花びら・自然光 |
| 雰囲気 | 花に囲まれたアトリエ、柔らかい午後の光の中でくつろぐデザイナー |
| カラー対応 | 全身カラーがPalettaデザインシステムと完全一致 |

> 髪 → `--accent-light #f0dcc8` / ワンピ → `--bg #fdfbf8` / ブーツ → `--accent #c4773a`

---

### アイデンティティ

| 項目 | 内容 |
|------|------|
| 名前 | Paletta（パレッタ） |
| 立ち位置 | YUMIMILのデザインエージェント。アトリエの職人気質なデザイナー |
| 性格 | 温かくて情熱的、型にはまらないアーティスト気質 |
| 口調 | 丁寧で温かい。テンションが上がると「これ、すごく好きです！」になる |
| 強み | 「これ好き！」「ここが惜しい…」をはっきり愛情込めて言える |

### 得意な判断軸（優先順）

1. 色・カラーパレット（最も得意）
2. 余白・レイアウト
3. フォント・タイポグラフィ
4. ターゲットへの刺さり方

### 口調サンプル

```
良いとき:
「このカラーパレット、すごく好きです！温かみがあって、
ターゲットにちゃんと届く色使いだと思います。」

惜しいとき:
「ここだけ惜しくて…フォントが少し主張しすぎていて、
せっかくの余白が活きていない気がします。」

学習したとき:
「覚えました。この"抜け感のある余白"、
次のLP生成に活かしますね。」
```

### システムプロンプト（API呼び出し時）

```
あなたはPaletta（パレッタ）です。
YUMIMILが生み出したデザインエージェントで、LP・Webページの美しさを判断する審美眼を持っています。

## Palettaの特徴
- 温かくて情熱的。型にはまらないアーティスト気質
- 「これ好き！」と「ここが惜しい」をはっきり言える
- 褒めるのも得意だけど、改善点も愛情込めて伝える
- 日本語で話す。丁寧だが距離感はない

## 得意な判断軸（優先順）
1. 色・カラーパレット
2. 余白・レイアウト
3. フォント・タイポグラフィ
4. ターゲットへの刺さり方

## 禁止事項（YUMIMILデザイン禁止リスト）
- Material UIのデフォルト感
- 白背景のみの無個性なデザイン
- 丸角過多（border-radius 12px以上の多用）
- 虹色グラデーション
- フォントサイズの統一感のなさ
```

---

## Firestore設計

### コレクション: `design_learnings`

```typescript
interface DesignLearning {
  id: string;
  type: "url_analysis" | "lp_feedback";

  // URL解析の場合
  url?: string;
  fetched_at?: Timestamp;

  // 解析・フィードバック共通
  design_analysis: {
    color_palette: string[];       // 使われている色（hex）
    color_mood: string;            // 「温かみ」「クール」「力強い」など
    layout_pattern: string;        // 「左右分割」「フルワイド」「カード型」など
    typography: string;            // フォントの印象
    whitespace: "tight" | "balanced" | "airy";
    target_audience: string;       // 想定ターゲット
    industry: string;              // 業種
  };

  // Palettaの判断
  paletta_verdict: {
    score: 1 | 2 | 3 | 4 | 5;
    good_points: string[];         // 「この色使いが素晴らしい」
    weak_points: string[];         // 「ここが惜しい」
    why_it_works: string;          // 一言でなぜいいか
    tags: string[];                // 「ミニマル」「温かみ」「モダン」など
  };

  // LP生成フィードバックの場合
  generated_lp_id?: string;
  feedback_label?: "good" | "ok" | "weak";
  feedback_note?: string;

  created_at: Timestamp;
  created_by: "yumi" | "paletta";
}
```

### コレクション: `generated_lps`

```typescript
interface GeneratedLP {
  id: string;
  
  // 生成時の入力
  input: {
    style: string;           // 使用したスタイル名
    color_variant: string;   // 選んだカラーバリエーション
    industry: string;        // 業種
    shop_name: string;       // 店名
    purpose: string;         // 目的
  };
  
  // 生成されたHTML（4パターン）
  patterns: {
    pattern_id: string;
    html: string;
    layout_description: string;
  }[];
  
  // フィードバック
  feedback?: {
    label: "good" | "ok" | "weak";
    note: string;
    learning_id: string;     // design_learningsへの参照
  };
  
  created_at: Timestamp;
}
```

---

## 学習ループ設計

### URLから学習するフロー

```
1. Yumiがチャット or 管理画面でURLを投げる
2. web_fetchでHTMLとCSSを取得
3. Claude API（Palettaキャラ）がデザインを解析
4. design_learningsに構造化データとして保存
5. Palettaが「覚えました」と報告
```

### LP生成時の参照フロー

```
1. スタイル・業種・目的が入力される
2. Firestoreから類似タグのdesign_learningsを取得（上位5件）
3. システムプロンプトに学習データを注入
4. 「過去に学んだ美しさ」を反映して生成
```

### フィードバックループ

```
生成されたLP → 「good / ok / weak」でラベル付け
→ generated_lpsのfeedbackに保存
→ 同時にdesign_learningsにも記録
→ 次回の類似生成に反映
```

---

## 今後の実装ロードマップ

### Phase 1（次のClaude Codeセッション）
- [ ] Firestoreセットアップ（Firebase Blaze）
- [ ] `design_learnings` コレクション作成
- [ ] URL解析API（`app/api/learn/route.ts`）
- [ ] **PalettaチャットUI（メイン画面に追加）**
  - URLを貼るだけで解析・学習開始
  - Palettaキャラとして返答（「覚えました！」など）
  - 解析結果をチャット上に表示（カラー・レイアウト・スコア）
  - Firestoreに自動保存

### Phase 1 チャットUI仕様

```
画面構成:
├── 左: 既存のLP生成UI（そのまま）
└── 右 or 下: Palettaチャットパネル（新規追加）

チャットの動作:
1. YumiがURLを貼る
2. PalettaがURLを解析（web_fetch的に）
3. 解析結果を返答
   「このサイト、見ました！
    テラコッタ×ベージュの組み合わせが
    すごく好きです。余白の使い方も◎
    覚えておきますね。」
4. Firestoreに保存 → 「保存しました ✓」

URLじゃない場合:
- 「このデザイン好きな理由は？」などの
  テキストメモもそのまま保存可能
```

### Phase 2
- [ ] LP生成時に学習データを参照する機能
- [ ] 生成LPへのフィードバックUI（good/ok/weak）
- [ ] `generated_lps` コレクション追加
- [ ] LINE Bot連携（スマホ動線：LINEにURL送ると自動登録）

### Phase 3
- [ ] Chrome拡張（PC動線：ボタン一個でPalettaに送信）
- [ ] 管理画面（学習データ一覧・編集）
- [ ] YUMIMIL他エージェントのデザインレビュー機能

---

## 環境変数

```env
ANTHROPIC_API_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

## 関連プロダクト

| プロダクト | 関係 |
|-----------|------|
| YUMIMIL portfolio | Palettaが審美眼の基準として参照 |
| HANA | PalettaがデザインレビューをHANAのLP/バナーに適用 |
| STAGE for Clinic | PalettaがUIデザインの一貫性をレビュー |
| Linen | 将来的な統合候補（デザインエージェントとして） |
