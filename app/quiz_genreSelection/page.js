"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./style.module.css";

export default function QuizGenre() {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    fetch("/api/genres")
      .then((res) => res.json())
      .then((data) => {
        setGenres(data.genres);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

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
        {genres.map((genre) => (
          <Link
            key={genre.genreId}
            href={`/quiz_stageSelection?genreId=${genre.genreId}&genreName=${encodeURIComponent(genre.genreName)}`}
            className={styles.genreBox}
          >
            <div className={styles.genreName}>
              {genre.genreName}
            </div>

            <div className={styles.starArea}>
              <div>☆</div>
              <div>0個/0個</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}