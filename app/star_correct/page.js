"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function StarStatusPage() {
  const stages = ['ステージ1', 'ステージ2', 'ステージ3', 'ステージ4', 'ステージ5', 'ボス'];

  // 三重構造（配列）のデータ
  const [starData, setStarData] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("quizSaveData");

    if (saved) {
      setStarData(JSON.parse(saved));
    } else {
      // ダミーデータ
      const dummyData = {
        "ジャンル1": [
          { clear: true, perfect: true, speed: false, correct: 5, total: 5 },
          { clear: true, perfect: false, speed: true, correct: 3, total: 5 },
          { clear: false, perfect: false, speed: false, correct: 0, total: 0 },
        ],
        "ジャンル2": [
          { clear: true, perfect: true, speed: true, correct: 5, total: 5 }
        ]
      };
      setStarData(dummyData);
    }
  }, []);

  const genres = [
    { id: 1, name: "ジャンル1" },
    { id: 2, name: "ジャンル2" },
  ];

  // ジャンル内の獲得星数を計算する関数
  const calculateGenreStars = (genreArray) => {
    let earned = 0;
    const max = stages.length * 3; // 1ステージにつき最大3つの星
    
    genreArray.forEach(stage => {
      if (stage.clear) earned++;
      if (stage.perfect) earned++;
      if (stage.speed) earned++;
    });
    
    return { earned, max };
  };

  return (
    <div className={styles['star-container']}>
      {/* タブナビゲーション */}
      <nav className={styles['star-tabs']}>
        <Link href="/">
          <button className={styles['star-tab-button']}>戻る</button>
        </Link>
        <button className={`${styles['star-tab-button']} ${styles['star-tab-button-active']}`}>
          スター獲得状況
        </button>
        <Link href="/genre-accuracy">
          <button className={styles['star-tab-button']}>ジャンル別正答率</button>
        </Link>
      </nav>

      <main>
        {genres.map((genre) => {
          const genreArray = starData[genre.name] || [];
          const starScore = calculateGenreStars(genreArray);

          return (
            <section key={genre.id} className={styles['star-genre-section']}>
              {/* ジャンルヘッダー（タイトル、大きな星、スコア） */}
              <header className={styles['star-genre-header']}>
                <div className={styles['star-genre-title']}>{genre.name}</div>
                <div className={styles['star-genre-big-star']}>
                  <span style={{ fontSize: '2rem', color: starScore.earned === starScore.max ? '#fbbf24' : '#e5e7eb' }}>★</span>
                </div>
                <div className={styles['star-genre-score']}>
                  {starScore.earned} / {starScore.max}
                </div>
              </header>

              {/* ステージグリッド（6列） */}
              <div className={styles['star-stage-grid']}>
                {stages.map((stageName, index) => {
                  const stageDetail = genreArray[index] || { clear: false, perfect: false, speed: false };
                  const activeColor = '#fbbf24'; // 獲得時の色（ゴールド）
                  const inactiveColor = '#e5e7eb'; // 未獲得時の色（薄いグレー）

                  return (
                    <div key={stageName} className={styles['star-stage-card']}>
                      <div className={styles['star-stage-title']}>{stageName}</div>
                      
                      {/* 星とラベルのリスト */}
                      <div className={styles['star-star-list']}>
                        {/* 星1: クリア */}
                        <div className={styles['star-star-item']}>
                          <span className={styles['star-icon-small']} style={{ color: stageDetail.clear ? activeColor : inactiveColor, fontSize: '1.25rem' }}>★</span>
                          <span className={styles['star-star-label']}>クリア</span>
                        </div>
                        
                        {/* 星2: パーフェクト */}
                        <div className={styles['star-star-item']}>
                          <span className={styles['star-icon-small']} style={{ color: stageDetail.perfect ? activeColor : inactiveColor, fontSize: '1.25rem' }}>★</span>
                          <span className={styles['star-star-label']}>全問正解</span>
                        </div>
                        
                        {/* 星3: スピード */}
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