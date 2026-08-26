"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGame } from '../context/GameContext'; 
import styles from './page.module.css';

export default function StarStatusPage() {
  const { game } = useGame();
  const [genres, setGenres] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const stages = ['ステージ1', 'ステージ2', 'ステージ3', 'ステージ4', 'ステージ5', 'ボス'];

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

  // 星数計算関数
  const calculateGenreStars = (genreArray) => {
    let earned = 0;
    const max = stages.length * 3;
    
    if (Array.isArray(genreArray)) {
      genreArray.forEach(stage => {
        if (stage?.clear) earned++;
        if (stage?.perfect) earned++;
        if (stage?.speed) earned++;
      });
    }
    
    return { earned, max };
  };

  // 🌟 DBから該当ジャンルのステージ配列を確実に拾い出す万能関数
  const getGenreStages = (stagesObj, genre, index) => {
    if (!stagesObj) return [];

    // ID候補を取得（プロパティがない場合は配列インデックス+1を使用）
    const rawId = genre?.genreId || genre?.id || genre?._id || (index + 1);
    
    // 数字だけを抽出（例: "genre2" -> "2", 2 -> "2"）
    const num = String(rawId).replace(/[^0-9]/g, '') || String(index + 1);

    // 試行するキーのパターン一覧
    const keysToTry = [
      `genre${num}`,         // 'genre2'
      num,                  // '2'
      Number(num),          // 2
      genre?.genreName,     // 'ビジネスマナー'
      genre?.name,
      String(rawId)         // そのままの文字列
    ];

    for (const key of keysToTry) {
      if (key !== undefined && key !== null && stagesObj[key]) {
        return stagesObj[key];
      }
    }

    return [];
  };

  if (loading) {
    return <div className={styles['star-container']}>データを読み込み中...</div>;
  }

  const userStagesObj = userData?.stages || {};

  return (
    <div className={styles['star-container']}>
      <nav className={styles['star-tabs']}>
        <Link href="/">
          <button className={styles['star-tab-button']}>戻る</button>
        </Link>
        <button className={`${styles['star-tab-button']} ${styles['star-tab-button-active']}`}>
          スター獲得状況
        </button>
        <Link href="/genre_percentage">
          <button className={styles['star-tab-button']}>ジャンル別正答率</button>
        </Link>
      </nav>

      <main>
        {genres.map((genre, genreIdx) => {
          const genreName = genre.genreName || genre.name || `ジャンル ${genreIdx + 1}`;
          
          // 万能関数でDBから配列を取得
          const genreArray = getGenreStages(userStagesObj, genre, genreIdx);
          const starScore = calculateGenreStars(genreArray);

          return (
            <section key={genreName + genreIdx} className={styles['star-genre-section']}>
              <header className={styles['star-genre-header']}>
                <div className={styles['star-genre-title']}>{genreName}</div>
                <div className={styles['star-genre-big-star']}>
                  <span style={{ fontSize: '2rem', color: starScore.earned === starScore.max && starScore.max > 0 ? '#fbbf24' : '#e5e7eb' }}>★</span>
                </div>
                <div className={styles['star-genre-score']}>
                  {starScore.earned} / {starScore.max}
                </div>
              </header>

              <div className={styles['star-stage-grid']}>
                {stages.map((stageName, index) => {
                  const stageId = index + 1;
                  
                  // 配列のインデックス（0番目＝ステージ1）から直接取得
                  const stageDetail = 
                    genreArray[index] || 
                    genreArray.find(s => Number(s?.stageId) === stageId) || 
                    { clear: false, perfect: false, speed: false };
                  
                  const activeColor = '#fbbf24';
                  const inactiveColor = '#e5e7eb';

                  return (
                    <div key={stageName} className={styles['star-stage-card']}>
                      <div className={styles['star-stage-title']}>{stageName}</div>
                      
                      <div className={styles['star-star-list']}>
                        <div className={styles['star-star-item']}>
                          <span className={styles['star-icon-small']} style={{ color: stageDetail.clear ? activeColor : inactiveColor, fontSize: '1.25rem' }}>★</span>
                          <span className={styles['star-star-label']}>クリア</span>
                        </div>
                        <div className={styles['star-star-item']}>
                          <span className={styles['star-icon-small']} style={{ color: stageDetail.perfect ? activeColor : inactiveColor, fontSize: '1.25rem' }}>★</span>
                          <span className={styles['star-star-label']}>全問正解</span>
                        </div>
                        <div className={styles['star-star-item']}>
                          <span className={styles['star-icon-small']} style={{ color: stageDetail.speed ? activeColor : inactiveColor, fontSize: '1.25rem' }}>★</span>
                          <span className={styles['star-star-label']}>スピード</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}