import Link from "next/link";
import styles from "./style.module.css";

export default function QuizGenre() {
  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <Link href="/" className={styles.menu}>
          戻る
        </Link>
        <div className={styles.title}>クイズ</div>
        <Link href="/quiz_genre" className={styles.menu}>
          ジャンル選択
        </Link>
      </div>

      <div className={styles.content}>
        {/* ★ genreName=ジャンル１ を追加 */}
        <Link href="/quiz_stageSelection?genreId=1&genreName=ジャンル１" className={styles.genreBox}>
          <div className={styles.genreName}>ジャンル１</div>
          <div className={styles.starArea}>
            <div>☆</div>
            <div>0個/0個</div>
          </div>
        </Link>

        {/* ★ genreName=ジャンル２ を追加 */}
        <Link href="/quiz_stageSelection?genreId=2&genreName=ジャンル２" className={styles.genreBox}>
          <div className={styles.genreName}>ジャンル２</div>
          <div className={styles.starArea}>
            <div>☆</div>
            <div>0個/0個</div>
          </div>
        </Link>
      </div>
    </div>
  );
}