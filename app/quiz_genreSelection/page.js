"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./style.module.css";

export default function QuizGenre() {
  const [genres, setGenres] = useState([]);
  const [starCounts, setStarCounts] = useState({});
  const [bossClearedMap, setBossClearedMap] = useState({});
  const [lastStageStars, setLastStageStars] = useState(0);

  // ジャンルを取得
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

  // ステージデータの取得・ボス判定・ラストステージ情報取得
  useEffect(() => {
    if (genres.length === 0) return;

    const userId = 1;

    const getStars = async () => {
      const counts = {};
      const bossMap = {};

      const normalGenres = genres.filter((g) => Number(g.genreId) !== 6);

      for (const genre of normalGenres) {
        try {
          const response = await fetch(
            `/api/user/stages?userId=${userId}&genreId=${genre.genreId}`
          );

          const data = await response.json();
          const stages = data.stages || [];

          let totalStars = 0;
          if (Array.isArray(stages)) {
            stages.forEach((stage) => {
              if (stage.clear) totalStars++;
              if (stage.perfect) totalStars++;
              if (stage.speed) totalStars++;
            });
          }
          counts[genre.genreId] = totalStars;

          const bossStage = stages[5];
          bossMap[genre.genreId] = !!(bossStage && bossStage.clear);

        } catch (error) {
          console.error(`ジャンル${genre.genreId}のスター取得エラー:`, error);
          counts[genre.genreId] = 0;
          bossMap[genre.genreId] = false;
        }
      }

      setStarCounts(counts);
      setBossClearedMap(bossMap);

      try {
        const lastResponse = await fetch(
          `/api/user/stages?userId=${userId}&genreId=6`
        );
        const lastData = await lastResponse.json();
        const lastStages = lastData.stages || [];

        let lastStars = 0;
        if (Array.isArray(lastStages) && lastStages.length > 0) {
          const stage = lastStages[0];
          if (stage.clear) lastStars++;
          if (stage.perfect) lastStars++;
          if (stage.speed) lastStars++;
        }
        setLastStageStars(lastStars);
      } catch (error) {
        console.error("ラストステージのスター取得エラー:", error);
        setLastStageStars(0);
      }
    };

    getStars();
  }, [genres]);

  const normalGenres = genres.filter((g) => Number(g.genreId) !== 6);

  const isLastStageUnlocked =
    normalGenres.length > 0 &&
    normalGenres.every((g) => bossClearedMap[g.genreId] === true);

  return (
    <main className={styles.container}>
      {/* 背景オブジェクト */}
      <div className={styles.sky}></div>
      <div className={styles.cloud1}></div>
      <div className={styles.cloud2}></div>
      <div className={styles.mountain}></div>
      <div className={styles.forest}></div>
      <div className={styles.ground}></div>

      {/* メインカード */}
      <div className={styles.mainCard}>
        {/* 左上ヘッダー */}
        <div className={styles.headerArea}>
          <Link href="/" className={styles.headerBranchButton}>
            <span className={styles.buttonText}>戻る</span>
          </Link>
          <div className={styles.headerLeafCell}>
            <span className={styles.buttonText}>クイズ</span>
          </div>
          <div className={styles.headerLeafCell}>
            <span className={styles.buttonText}>ジャンル選択</span>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className={styles.contentArea}>
          {/* 左側：切り株案内コーナー */}
          <div className={styles.stumpContainer}>
            <div className={styles.stumpInner}>
              <div className={styles.leafDecoration}>🍃</div>
              <p className={styles.stumpText}>
                クイズするジャンルを<br />
                <span className={styles.highlightText}>選んでね</span>
              </p>
            </div>
          </div>

          {/* 右側：ジャンル一覧 */}
          <div className={styles.genreListWrapper}>
            <div className={styles.treeTrunk}></div>

            <div className={styles.genreListContainer}>
              {normalGenres.map((genre) => {
                const starCount = starCounts[genre.genreId] || 0;

                return (
                  <Link
                    key={genre.genreId}
                    href={`/quiz_stageSelection?genreId=${genre.genreId}&genreName=${encodeURIComponent(
                      genre.genreName
                    )}`}
                    className={styles.genreCard}
                  >
                    <span className={styles.genreName}>{genre.genreName}</span>
                    <div className={styles.starBadge}>
                      <span className={styles.starIcon}>{starCount > 0 ? "★" : "☆"}</span>
                      <span className={styles.starText}>{starCount} / 18</span>
                    </div>
                  </Link>
                );
              })}

              {isLastStageUnlocked && (
                <Link
                  href={`/quiz_stageSelection?genreId=6&genreName=${encodeURIComponent(
                    "ラストステージ"
                  )}`}
                  className={styles.lastStageCard}
                >
                  <span className={styles.genreName}>🔥 ラストステージ</span>
                  <div className={styles.starBadgeGold}>
                    <span className={styles.starIcon}>{lastStageStars > 0 ? "★" : "☆"}</span>
                    <span className={styles.starText}>{lastStageStars} / 3</span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}