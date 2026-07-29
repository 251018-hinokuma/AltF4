import Link from "next/link";
import styles from "./style.module.css";

export default function QuizStageSelection() {
  return (
    <div className={styles.page}>
      {/* ヘッダー部分 */}
      <div className={styles.top}>
        <Link href="/quiz_genreSelection" className={styles.menu}>
          戻る
        </Link>
        <div className={styles.title}>クイズ</div>
        <div className={styles.title}>ジャンル名</div>
        <div className={styles.title}>ステージ選択</div>
      </div>

      {/* メインコンテンツ */}
      <div className={styles.content}>
        {/* ステージ１ */}
        <div className={styles.stageBox}>
          <div className={styles.stage}>ステージ１</div>
          
          {/* ノーマルボタン */}
          <Link 
            href="/quiz_question?stageId=1&difficulty=normal" 
            className={styles.mode}
          >
            ノーマル
          </Link>
          
          {/* ハードボタン */}
          <Link 
            href="/quiz_question?stageId=1&difficulty=hard" 
            className={styles.mode}
          >
            ハード
          </Link>

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

        {/* ステージ２ */}
        <div className={styles.stageBox}>
          <div className={styles.stage}>ステージ２</div>

          {/* ノーマルボタン */}
          <Link 
            href="/quiz_question?stageId=2&difficulty=normal" 
            className={styles.mode}
          >
            ノーマル
          </Link>

          {/* ハードボタン */}
          <Link 
            href="/quiz_question?stageId=2&difficulty=hard" 
            className={styles.mode}
          >
            ハード
          </Link>

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
      </div>
    </div>
  );
}