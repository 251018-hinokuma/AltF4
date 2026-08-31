"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function StarStatusPage() {
  const [genres, setGenres] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 通常ジャンルのステージ構成
  const defaultStages = ['ステージ1', 'ステージ2', 'ステージ3', 'ステージ4', 'ステージ5', 'ボス'];

  useEffect(() => {
    async function loadData() {
      try {
        setError("");

        // 1. ジャンル一覧取得
        const genreRes = await fetch("/api/genres", { cache: "no-store" });
        if (!genreRes.ok) throw new Error("ジャンル情報の取得に失敗しました");
        const genreData = await genreRes.json();
        setGenres(genreData.genres || []);

        // 2. ユーザー情報取得
        const userRes = await fetch("/api/userpage", { cache: "no-store" });
        const userDataJson = await userRes.json();

        if (!userRes.ok) {
          throw new Error(userDataJson.message || `ユーザー情報の取得に失敗しました。ステータス: ${userRes.status}`);
        }

        if (userDataJson.singleItem) {
          setUserData(userDataJson.singleItem);
        }
      } catch (err) {
        console.error("データ取得エラー:", err);
        setError(err.message || "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // 星数計算関数
  const calculateGenreStars = (genreArray, currentStages) => {
    let earned = 0;
    const max = currentStages.length * 3;

    if (Array.isArray(genreArray)) {
      currentStages.forEach((_, index) => {
        const stage = genreArray[index];
        if (stage?.clear) earned++;
        if (stage?.perfect) earned++;
        if (stage?.speed) earned++;
      });
    }

    return { earned, max };
  };

  // DBから該当ジャンルのステージ配列を取得する関数
  const getGenreStages = (stagesObj, genre, index) => {
    if (!stagesObj) return [];

    const rawId = genre?.genreId || genre?.id || genre?._id || (index + 1);
    const num = String(rawId).replace(/[^0-9]/g, '') || String(index + 1);

    const keysToTry = [
      `genre${num}`,
      num,
      Number(num),
      genre?.genreName,
      genre?.name,
      String(rawId)
    ];

    for (const key of keysToTry) {
      if (key !== undefined && key !== null && stagesObj[key]) {
        return stagesObj[key];
      }
    }

    return [];
  };

  const userStagesObj = userData?.stages || {};

  return (
    <main className={styles.container}>
      {/* 背景演出 */}
      <div className={styles.sky}></div>
      <div className={styles.cloud1}></div>
      <div className={styles.cloud2}></div>
      <div className={styles.cloud3}></div>
      <div className={styles.mountain}></div>
      <div className={styles.forest}></div>
      <div className={styles.ground}></div>

      {/* ユーザー名表示 */}
      <div className={styles.userBox}>
        {loading
          ? "読み込み中..."
          : error
            ? "エラーが発生しました"
            : userData?.userName || "ユーザー名"
        }
      </div>

      {/* メインウィンドウ */}
      <section className={styles.menupage}>
        {/* ナビゲーションタブ */}
        <nav className={styles.starTabs}>
          {/* 戻るボタンの遷移先を /userpage に変更 */}
          <Link href="/userpage" className={styles.tabButton}>
            🔙 戻る
          </Link>
          <button className={`${styles.tabButton} ${styles.tabButtonActive}`}>
            ⭐ スター獲得状況
          </button>
          <Link href="/genre_percentage" className={styles.tabButton}>
            📊 ジャンル別正答率
          </Link>
          <Link href="/achievement" className={styles.tabButton}>
            🏆 実績
          </Link>
        </nav>

        {/* コンテンツ領域 */}
        <div className={styles.starContent}>
          {loading ? (
            <div className={styles.statusMessage}>データを読み込み中...</div>
          ) : error ? (
            <div className={styles.statusMessage}>{error}</div>
          ) : (
            genres.map((genre, genreIdx) => {
              const genreName = genre.genreName || genre.name || `ジャンル ${genreIdx + 1}`;
              const isLastGenre = genreIdx === genres.length - 1 || genreName.includes('ラスト');
              const currentStages = isLastGenre ? ['ボス'] : defaultStages;

              const genreArray = getGenreStages(userStagesObj, genre, genreIdx);
              const starScore = calculateGenreStars(genreArray, currentStages);

              return (
                <section key={genreName + genreIdx} className={styles.genreSection}>
                  <header className={styles.genreHeader}>
                    <div className={styles.genreTitle}>{genreName}</div>
                    <div className={styles.genreScore}>
                      <span className={styles.bigStar} style={{ color: starScore.earned === starScore.max && starScore.max > 0 ? '#ffe066' : '#d1d5db' }}>★</span>
                      {starScore.earned} / {starScore.max}
                    </div>
                  </header>

                  <div className={styles.stageGrid}>
                    {currentStages.map((stageName, index) => {
                      const stageId = index + 1;
                      const stageDetail =
                        genreArray[index] ||
                        genreArray.find(s => Number(s?.stageId) === stageId) ||
                        { clear: false, perfect: false, speed: false };

                      const activeColor = '#ffe066';
                      const inactiveColor = 'rgba(255, 255, 255, 0.4)';

                      return (
                        <div key={stageName} className={styles.stageCard}>
                          <div className={styles.stageTitle}>{stageName}</div>
                          <div className={styles.starList}>
                            <div className={styles.starItem}>
                              <span style={{ color: stageDetail.clear ? activeColor : inactiveColor }}>★</span>
                              <span>クリア</span>
                            </div>
                            <div className={styles.starItem}>
                              <span style={{ color: stageDetail.perfect ? activeColor : inactiveColor }}>★</span>
                              <span>全問正解</span>
                            </div>
                            <div className={styles.starItem}>
                              <span style={{ color: stageDetail.speed ? activeColor : inactiveColor }}>★</span>
                              <span>スピード</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}