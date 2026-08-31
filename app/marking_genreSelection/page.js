"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../context/GameContext";
import styles from "./page.module.css";

export default function MarkingGenreSelection() {
  const router = useRouter();
  const { game } = useGame();
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGenres() {
      setIsLoading(true);
      try {
        let rawList = [];

        if (game?.genres && game.genres.length > 0) {
          rawList = game.genres;
        } else {
          const res = await fetch("/api/genres");
          if (res.ok) {
            const data = await res.json();
            rawList = Array.isArray(data) ? data : (data.genres || []);
          }
        }

        const filteredGenres = rawList.filter((genre) => {
          const genreId = Number(genre.genreId ?? genre.genre_id ?? genre.id);
          const genreName = genre.genreName ?? genre.genre_name ?? genre.name ?? "";
          
          return genreId !== 6 && genreId !== 0 && !genreName.includes("ラスト");
        });

        setGenres(filteredGenres);
      } catch (error) {
        console.error("ジャンル一覧の取得に失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGenres();
  }, [game?.genres]);

  const handleBack = () => {
    router.push("/");
  };

  const handleGenreSelect = (genreId) => {
    router.push(`/marking_quizSelection?genreId=${genreId}`);
  };

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
        {/* 左上ヘッダー（枝から葉が生えて繋がったデザイン） */}
        <div className={styles.headerArea}>
          <button 
            className={styles.headerBranchButton} 
            onClick={handleBack}
          >
            <span className={styles.buttonText}>戻る</span>
          </button>
          <div className={styles.headerLeafCell}>
            <span className={styles.buttonText}>マーキング</span>
          </div>
          <div className={styles.headerLeafCell}>
            <span className={styles.buttonText}>ジャンル選択</span>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className={styles.contentArea}>
          {/* 左側：切り株の案内コーナー（立体感あり） */}
          <div className={styles.stumpContainer}>
            <div className={styles.stumpInner}>
              <div className={styles.leafDecoration}>🍃</div>
              <p className={styles.stumpText}>
                マーキングした問題の<br />
                <span className={styles.highlightText}>ジャンルを押してね</span>
              </p>
            </div>
          </div>

          {/* 右側：ジャンル一覧 */}
          <div className={styles.genreListContainer}>
            {isLoading ? (
              <div className={styles.loadingText}>読み込み中...</div>
            ) : genres.length === 0 ? (
              <div className={styles.emptyText}>ジャンルが見つかりません</div>
            ) : (
              genres.map((genre) => {
                const genreId = genre.genreId ?? genre.genre_id ?? genre.id;
                const genreName = genre.genreName ?? genre.genre_name ?? genre.name ?? `ジャンル ${genreId}`;

                return (
                  <button
                    key={genreId}
                    className={styles.genreSelectButton}
                    onClick={() => handleGenreSelect(genreId)}
                  >
                    <span className={styles.buttonText}>{genreName}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}