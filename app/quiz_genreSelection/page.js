"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./style.module.css";

export default function QuizGenre() {
  const [genres, setGenres] = useState([]);

  // ジャンルごとのスター数 ({ [genreId]: count })
  const [starCounts, setStarCounts] = useState({});

  // =========================================
  // ジャンルを取得
  // =========================================
  useEffect(() => {
    fetch("/api/genres")
      .then((res) => res.json())
      .then((data) => {
        setGenres(data.genres || []);
      })
      .catch((error) => {
        console.error("ジャンル取得エラー:", error);
      });
  }, []);

  // =========================================
  // 各ジャンルのステージデータからスター数を計算して取得
  // =========================================
  useEffect(() => {
    if (genres.length === 0) return;

    // テスト用ユーザーID
    const userId = 1;

    const getStars = async () => {
      const counts = {};

      for (const genre of genres) {
        try {
          // ステージ情報を取得
          const response = await fetch(
            `/api/user/stages?userId=${userId}&genreId=${genre.genreId}`
          );

          const data = await response.json();
          const stages = data.stages || [];

          // 各ステージの clear, perfect, speed (trueの数) を合算
          let totalStars = 0;
          if (Array.isArray(stages)) {
            stages.forEach((stage) => {
              if (stage.clear) totalStars++;
              if (stage.perfect) totalStars++;
              if (stage.speed) totalStars++;
            });
          }

          counts[genre.genreId] = totalStars;
        } catch (error) {
          console.error(
            `ジャンル${genre.genreId}のスター取得エラー:`,
            error
          );
          counts[genre.genreId] = 0;
        }
      }

      setStarCounts(counts);
    };

    getStars();
  }, [genres]);

  return (
    <div className={styles.page}>
      {/* =========================================
          ヘッダー
      ========================================= */}
      <div className={styles.top}>
        <Link href="/" className={styles.menu}>
          戻る
        </Link>

        <div className={styles.title}>クイズ</div>

        <Link href="/quiz_genreSelection" className={styles.menu}>
          ジャンル選択
        </Link>
      </div>

      {/* =========================================
          ジャンル一覧
      ========================================= */}
      <div className={styles.content}>
        {genres.map((genre) => {
          // このジャンルの獲得スター数
          const starCount = starCounts[genre.genreId] || 0;

          return (
            <Link
              key={genre.genreId}
              href={`/quiz_stageSelection?genreId=${genre.genreId}&genreName=${encodeURIComponent(
                genre.genreName
              )}`}
              className={styles.genreBox}
            >
              {/* ジャンル名 */}
              <div className={styles.genreName}>
                {genre.genreName}
              </div>

              {/* スター表示 */}
              <div className={styles.starArea}>
                <div>{starCount > 0 ? "★" : "☆"}</div>
                <div>{starCount}個 / 30個</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}