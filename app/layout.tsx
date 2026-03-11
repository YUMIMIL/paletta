import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paletta — AIでLPを、一瞬で。",
  description:
    "スタイルを選んで情報を入力するだけ。AIが4パターンのランディングページを自動生成します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
