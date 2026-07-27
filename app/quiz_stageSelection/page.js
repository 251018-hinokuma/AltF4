import Link from "next/link";
import styles from "./style.module.css";

// ★ export default function にすることが一番重要です！
export default function QuizStageSelection() {
  return (
    <div className={styles.page}>
      {/* ヘッダー部分 */}
      <div className={styles.top}>
        <Link href="/quiz_genre" className={styles.menu}>
          戻る
        </Link>
        <div className={styles.title}>クイズ</div>
        <div className={styles.title}>ジャンル名</div>
        <div className={styles.title}>ステージ選択</div>
      </div>

      {/* メインコンテンツ */}
      <div className={styles.content}>
        {/* ステージ１ */}
        <Link href="/quiz_question?stageId=1" className={styles.link}>
          <div className={styles.stageBox}>
            <div className={styles.stage}>ステージ１</div>
            <div className={styles.mode}>ノーマル</div>
            <div className={styles.mode}>ハード</div>
            <div className={styles.result}>
              <div className={styles.starArea}>
                <span>☆</span>
                <span>☆</span>
                <span>☆</span>
              </div>
              <div className={styles.labelArea}>
                <span>クリア</span>
                <span>全問正解</span>
                <span>スピード</span>
              </div>
            </div>
          </div>
        </Link>

        {/* ステージ２ */}
        <Link href="/quiz_question?stageId=2" className={styles.link}>
          <div className={styles.stageBox}>
            <div className={styles.stage}>ステージ２</div>
            <div className={styles.mode}>ノーマル</div>
            <div className={styles.mode}>ハード</div>
            <div className={styles.result}>
              <div className={styles.starArea}>
                <span>☆</span>
                <span>☆</span>
                <span>☆</span>
              </div>
              <div className={styles.labelArea}>
                <span>クリア</span>
                <span>全問正解</span>
                <span>スピード</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}