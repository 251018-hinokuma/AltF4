"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGame } from '../context/GameContext'; 
import styles from './page.module.css';

export default function GenrePercentagePage() {
  const { game } = useGame();
  const [genres, setGenres] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 通常ジャンルのステージ構成
  const defaultStages = ['ステージ1', 'ステージ2', 'ステージ3', 'ステージ4', 'ステージ5', 'ボス'];

  useEffect(() => {
    async function loadData() {
      try {
        // 1. ジャンル一覧取得
        const genreRes = await fetch("/api/genres");
        const genreData = await genreRes.json();
        setGenres(genreData.genres || []);

        // 2. ユーザー情報取得
        const userId = game?.user?.userId || 1;
        const userRes = await fetch(`/api/userpage?userId=${userId}`);
        
        if (userRes.ok) {
          const fetchedUser = await userRes.json();
          if (fetchedUser.singleItem) {
            setUserData(fetchedUser.singleItem);
          }
        }
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [game?.user?.userId]);

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

  // ジャンル全体の正答率（％）と集計
  const calculateGenreAccuracy = (genreArray, currentStages) => {
    let totalCorrect = 0;
    let totalQuestions = 0;

    if (Array.isArray(genreArray)) {
      currentStages.forEach((_, index) => {
        const stage = genreArray[index];
        if (stage) {
          totalCorrect += Number(stage.correct || 0);
          totalQuestions += Number(stage.total || 0);
        }
      });
    }

    const percentage = totalQuestions > 0 
      ? Math.round((totalCorrect / totalQuestions) * 100) 
      : 0;

    return { percentage, totalCorrect, totalQuestions };
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        データを読み込み中...
      </div>
    );
  }

  const userStagesObj = userData?.stages || {};

  return (
    <div className={styles.container}>
      {/* 🌟 タブナビゲーション */}
      <nav className={styles.tabs}>
        <Link href="/" className={styles.tabLink}>
          戻る
        </Link>
        <Link href="/star_correct" className={styles.tabLink}>
          スター獲得状況
        </Link>
        <div className={styles.tabActive}>
          ジャンル別正答率
        </div>
      </nav>

      {/* 🌟 メインコンテンツ */}
      <main className={styles.main}>
        {genres.map((genre, genreIdx) => {
          const genreName = genre.genreName || genre.name || `ジャンル ${genreIdx + 1}`;
          
          // 🌟 最後のジャンル（ラストステージ）判定
          const isLastGenre = genreIdx === genres.length - 1 || genreName.includes('ラスト');
          const currentStages = isLastGenre ? ['ボス'] : defaultStages;

          const genreArray = getGenreStages(userStagesObj, genre, genreIdx);
          const accuracy = calculateGenreAccuracy(genreArray, currentStages);

          return (
            <div key={genreName + genreIdx} className={styles.genreCard}>
              {/* ジャンルヘッダー */}
              <div className={styles.genreHeader}>
                <h2 className={styles.genreTitle}>
                  {genreName}
                </h2>
                <div className={styles.genreScore}>
                  正答率: {accuracy.percentage}%
                </div>
              </div>

              {/* ステージグリッド（ラストステージ時は専用CSSクラスへ自動切替） */}
              <div className={isLastGenre ? styles.stageGridBossOnly : styles.stageGrid}>
                {currentStages.map((stageName, index) => {
                  const stageDetail = genreArray[index];
                  const stageCorrect = Number(stageDetail?.correct || 0);
                  const stageTotal = Number(stageDetail?.total || 0);
                  const stagePercent = stageTotal > 0 
                    ? Math.round((stageCorrect / stageTotal) * 100) 
                    : null;

                  return (
                    <div key={stageName} className={styles.stageCard}>
                      <div className={styles.stageTitle}>
                        {stageName}
                      </div>
                      <div className={styles.stagePercent}>
                        {stagePercent !== null ? `${stagePercent}%` : '- %'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}