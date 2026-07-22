// app/genre-accuracy/page.js
import Link from 'next/link';
import styles from './page.module.css';

export default function GenreAccuracyPage() {
  const genres = [
    { id: 1, name: "ジャンル1" },
    { id: 2, name: "ジャンル2" },
  ];

  return (
    <div className={styles.container}>
      {/* 🌟ヘッダー（タブ）を3枚構成に修正 */}
      <header className={styles.header}>
        <Link href="/">
          <button className={styles.tab}>戻る</button>
        </Link>
        <Link href="/userpage">
          <button className={styles.tab}>ユーザーページ</button>
        </Link>
        {/* 2つのクラスを当てる（スケッチに合わせて白背景に） */}
        <button className={`${styles.tab} ${styles.tabActive}`}>ジャンル別正答率</button>
      </header>

      <main className={styles.content}>
        {genres.map((genre) => (
          <table key={genre.id} className={styles.genreTable}>
            <tbody>
              {/* 🌟表の構造（colSpan）を修正 */}
              {/* 1行目：ジャンル名（5列結合）と全体の正答率（1列） */}
              <tr>
                {/* styles.genreTitle クラスを適用 */}
                <th colSpan="5" className={styles.genreTitle}>{genre.name}</th>
                <th>正答率</th>
              </tr>
              
              {/* 2行目：ステージ名（6列） */}
              <tr>
                <th>ステージ1</th>
                <th>ステージ2</th>
                <th>ステージ3</th>
                <th>ステージ4</th>
                <th>ステージ5</th>
                <th>ボス</th>
              </tr>
              
              {/* 3行目：正答率の値（6列） */}
              <tr>
                {/* mapを使って6回繰り返すとコードがすっきりします */}
                {[...Array(6)].map((_, index) => (
                  <td key={index}>正答率</td>
                ))}
              </tr>
            </tbody>
          </table>
        ))}
      </main>
    </div>
  );
}