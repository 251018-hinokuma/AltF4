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
        <div className={styles.title}>ジャンル選択</div>
      </div>

      <div className={styles.content}>
        <Link href="/quiz_stageSelection?genreId=1" className={styles.genreBox}>
          <div className={styles.genreName}>ジャンル１</div>
          <div className={styles.starArea}>
            <div>☆</div>
            <div>0個/0個</div>
          </div>
        </Link>

        <Link href="/quiz_stageSelection?genreId=2" className={styles.genreBox}>
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