import Link from "next/link";
import styles from "./page.module.css";

export default function HowTo() {
  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Paletta</span>
          <div className={styles.logoDot}></div>
          <span className={styles.logoTag}>LP Generator</span>
        </Link>
        <div className={styles.headerRight}>
          <Link href="/" className={styles.headerLink}>← ジェネレーターに戻る</Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>使い方ガイド</h1>
          <p className={styles.subtitle}>
            3ステップで、プロ品質のランディングページを自動生成
          </p>
        </div>

        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>01</div>
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>スタイルとカラーを選ぶ</h2>
              <p className={styles.stepDesc}>
                Artistic / Friendly / Business の3カテゴリから、
                お好みのデザインスタイルを選択します。
                スタイルに応じたカラーバリエーションも選べるので、
                ブランドイメージにぴったりのデザインが見つかります。
              </p>
              <div className={styles.stepTip}>
                <span className={styles.tipLabel}>TIP</span>
                業種に合ったスタイルを選ぶと、より効果的なLPが生成されます。
                美容系なら Soft Pink や Luxury Dark、飲食店なら Natural や Warm Pop がおすすめ。
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>02</div>
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>基本情報を入力する</h2>
              <p className={styles.stepDesc}>
                業種・サービスの種類と、店名・サービス名を入力します。
                AIがこの情報をもとに、業種に合った自然な日本語コピーを自動で作成します。
              </p>
              <div className={styles.stepTip}>
                <span className={styles.tipLabel}>TIP</span>
                具体的に入力するほど、生成されるLPの精度が上がります。
                「カフェ」よりも「オーガニック専門カフェ」のように詳しく書くのがコツ。
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>03</div>
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>目的を選んで生成する</h2>
              <p className={styles.stepDesc}>
                LPの目的（集客・採用・イベント告知など）を選択し、
                「4パターン生成する」ボタンをクリック。
                AIが4つの異なるレイアウトでLPを自動生成します。
              </p>
              <div className={styles.stepTip}>
                <span className={styles.tipLabel}>TIP</span>
                複数の目的を選択できます。
                生成されたLPはHTMLファイルとしてダウンロードしたり、コードをコピーしてそのまま使えます。
              </div>
            </div>
          </div>
        </div>

        <div className={styles.faq}>
          <h2 className={styles.faqTitle}>よくある質問</h2>

          <div className={styles.faqItem}>
            <h3 className={styles.faqQ}>生成されたLPはそのまま公開できますか？</h3>
            <p className={styles.faqA}>
              はい。生成されたHTMLは完全な単一ファイルで、
              Google Fontsやレスポンシブ対応も含まれています。
              ダウンロードしてそのままサーバーにアップロードするだけで公開できます。
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3 className={styles.faqQ}>生成後にカスタマイズできますか？</h3>
            <p className={styles.faqA}>
              HTMLをコピーまたはダウンロードして、お好みのエディタで自由に編集できます。
              画像の差し替えやテキストの修正も簡単です。
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3 className={styles.faqQ}>4つのパターンの違いは？</h3>
            <p className={styles.faqA}>
              同じ入力情報から、異なるレイアウト構成（全画面ヒーロー型、2カラム型、
              縦スクロール型、アニメーション型）で4パターンを同時生成します。
              比較して最適なものを選べます。
            </p>
          </div>
        </div>

        <div className={styles.cta}>
          <Link href="/" className={styles.ctaBtn}>
            ✦ さっそくLPを作る
          </Link>
        </div>
      </main>
    </>
  );
}
