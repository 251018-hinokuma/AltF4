"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./style.module.css";

export default function QuizStageSelection() {
  const searchParams = useSearchParams();

  // ジャンル選択画面からgenreIdを受け取る
  const genreId = searchParams.get("genreId");
  const genreName = searchParams.get("genreName");

  return (
    <div className={styles.page}>
      {/* ヘッダー部分 */}
      <div className={styles.top}>
        <Link href="/quiz_genreSelection" className={styles.menu}>
          戻る
        </Link>

        <div className={styles.title}>クイズ</div>
        <div className={styles.title}>{genreName}</div>
        <div className={styles.title}>ステージ選択</div>
      </div>

      {/* メインコンテンツ */}
      <div className={styles.content}>

        {/* ステージ１ */}
        <div className={styles.stageBox}>
          <div className={styles.stage}>ステージ１</div>

          {/* ノーマル → difficulty=1 */}
          <Link
            href={`/quiz_question?genreId=${genreId}&stageId=1&difficulty=1`}
            className={styles.mode}
          >
            ノーマル
          </Link>

          {/* ハード → difficulty=2 */}
          <Link
            href={`/quiz_question?genreId=${genreId}&stageId=1&difficulty=2`}
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

          {/* ノーマル → difficulty=1 */}
          <Link
            href={`/quiz_question?genreId=${genreId}&stageId=2&difficulty=1`}
            className={styles.mode}
          >
            ノーマル
          </Link>

          {/* ハード → difficulty=2 */}
          <Link
            href={`/quiz_question?genreId=${genreId}&stageId=2&difficulty=2`}
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