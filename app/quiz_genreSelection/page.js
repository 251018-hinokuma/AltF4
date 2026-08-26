"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./style.module.css";

export default function QuizGenre() {
  const [genres, setGenres] = useState([]);

  // ジャンルごとのスター数 ({ [genreId]: count })
  const [starCounts, setStarCounts] = useState({});

  // 各ジャンルのボスステージ（ステージ6）のクリア状況
  const [bossClearedMap, setBossClearedMap] = useState({});

  // ラストステージ（ジャンルID: 6）のスター数（最大3個）
  const [lastStageStars, setLastStageStars] = useState(0);

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
  // ステージデータの取得・ボス判定・ラストステージ情報取得
  // =========================================
  useEffect(() => {
    if (genres.length === 0) return;

    const userId = 1;

    const getStars = async () => {
      const counts = {};
      const bossMap = {};

      // 通常ジャンル（ジャンルID: 6 以外）を抽出
      const normalGenres = genres.filter((g) => Number(g.genreId) !== 6);

      for (const genre of normalGenres) {
        try {
          const response = await fetch(
            `/api/user/stages?userId=${userId}&genreId=${genre.genreId}`
          );

          const data = await response.json();
          const stages = data.stages || [];

          // 各ステージのスター数を計算
          let totalStars = 0;
          if (Array.isArray(stages)) {
            stages.forEach((stage) => {
              if (stage.clear) totalStars++;
              if (stage.perfect) totalStars++;
              if (stage.speed) totalStars++;
            });
          }
          counts[genre.genreId] = totalStars;

          // ボスステージ（ステージ6 / インデックス5）のクリア判定
          const bossStage = stages[5]; // 6番目のステージ
          bossMap[genre.genreId] = !!(bossStage && bossStage.clear);

        } catch (error) {
          console.error(`ジャンル${genre.genreId}のスター取得エラー:`, error);
          counts[genre.genreId] = 0;
          bossMap[genre.genreId] = false;
        }
      }

      setStarCounts(counts);
      setBossClearedMap(bossMap);

      // =========================================
      // ラストステージ（genreId = 6）のスター情報取得
      // =========================================
      try {
        const lastResponse = await fetch(
          `/api/user/stages?userId=${userId}&genreId=6`
        );
        const lastData = await lastResponse.json();
        const lastStages = lastData.stages || [];

        let lastStars = 0;
        if (Array.isArray(lastStages) && lastStages.length > 0) {
          // 最初のステージのクリア判定（最大3個）
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

  // 通常ジャンル一覧
  const normalGenres = genres.filter((g) => Number(g.genreId) !== 6);

  // すべての通常ジャンルでボスステージ（ステージ6）がクリアされたか判定
  const isLastStageUnlocked =
    normalGenres.length > 0 &&
    normalGenres.every((g) => bossClearedMap[g.genreId] === true);

  // =========================================
  // 【デバッグ用】全ボスステージをクリア済みに変更する処理
  // =========================================
  const handleDebugClearAllBosses = () => {
    const updatedMap = {};
    normalGenres.forEach((genre) => {
      updatedMap[genre.genreId] = true;
    });
    setBossClearedMap(updatedMap);
  };

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
          デバッグ用操作エリア
      ========================================= */}
      <div style={{ margin: "10px 0", textAlign: "center" }}>
        <button
          onClick={handleDebugClearAllBosses}
          style={{
            padding: "8px 16px",
            backgroundColor: "#e74c3c",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.85rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
        >
          🛠️ 【デバッグ】全ボスステージクリア
        </button>
      </div>

      {/* =========================================
          ジャンル一覧
      ========================================= */}
      <div className={styles.content}>
        {normalGenres.map((genre) => {
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
              <div className={styles.genreName}>{genre.genreName}</div>

              {/* スター表示 */}
              <div className={styles.starArea}>
                <div>{starCount > 0 ? "★" : "☆"}</div>
                <div>{starCount}個 / 18個</div>
              </div>
            </Link>
          );
        })}

        {/* =========================================
            ラストステージ（全ジャンルのボス撃破時に解放）
        ========================================= */}
        {isLastStageUnlocked && (
          <Link
            href={`/quiz_stageSelection?genreId=6&genreName=${encodeURIComponent(
              "ラストステージ"
            )}`}
            className={styles.genreBox}
          >
            {/* ジャンル名 */}
            <div className={styles.genreName}>🔥 ラストステージ</div>

            {/* スター表示 */}
            <div className={styles.starArea}>
              <div>{lastStageStars > 0 ? "★" : "☆"}</div>
              <div>{lastStageStars}個 / 3個</div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}