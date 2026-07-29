"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./style.module.css";

export default function QuizGenre() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        // ★ URLを /api/genres に変更（フォルダ名の genres に合わせました）
        const res = await fetch("/api/genres");

        if (!res.ok) {
          throw new Error(`APIエラー: status ${res.status}`);
        }

        const data = await res.json();
        setGenres(data.genres || []);
      } catch (err) {
        console.error("ジャンルデータの取得に失敗しました:", err);
        setError("ジャンルの読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  if (loading) {
    return <div className={styles.page}>読み込み中...</div>;
  }

  if (error) {
    return (
      <div className={styles.page}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <Link href="/" className={styles.menu}>
          戻る
        </Link>
        <div className={styles.title}>クイズ</div>
        <Link href="/quiz_genreSelection" className={styles.menu}>
          ジャンル選択
        </Link>
      </div>

      <div className={styles.content}>
        {genres.length === 0 ? (
          <div>ジャンルが見つかりません</div>
        ) : (
          genres.map((genre) => (
            <Link
              key={genre.genreId || genre._id}
              href={`/quiz_stageSelection?genreId=${genre.genreId}&genreName=${encodeURIComponent(genre.genreName || "")}`}
              className={styles.genreBox}
            >
              <div className={styles.genreName}>{genre.genreName}</div>
              <div className={styles.starArea}>
                <div>☆</div>
                <div>0個/0個</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}