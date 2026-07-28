"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from "./page.module.css";

// ==========================================
// 共通パーツ: 星アイコン
// ==========================================
const StarIcon = ({ className, isEarned = false }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill={isEarned ? "#fbbf24" : "none"} 
    stroke={isEarned ? "#fbbf24" : "currentColor"}
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ==========================================
// 【第3層: ステージの詳細情報】を受け取るコンポーネント
// ==========================================
const StageCard = ({ title, stageData }) => {
  // データが渡ってこなかった場合（未プレイ時）の初期値
  const data = stageData || { clear: false, perfect: false, speed: false };

  const starTypes = [
    { label: 'クリア', isEarned: data.clear },
    { label: '全問正解', isEarned: data.perfect },
    { label: 'スピード', isEarned: data.speed }
  ];

  return (
    <div className={styles["star-stage-card"]}>
      <div className={styles["star-stage-title"]}>{title}</div>
      <div className={styles["star-star-list"]}>
        {starTypes.map((star) => (
          <div key={star.label} className={styles["star-star-item"]}>
            <StarIcon className={styles["star-icon-small"]} isEarned={star.isEarned} />
            <span className={styles["star-star-label"]}>{star.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 【第2層: ステージ一覧】を受け取るコンポーネント
// ==========================================
const GenreSection = ({ genreName, genreData }) => {
  const stages = ['ステージ１', 'ステージ２', 'ステージ３', 'ステージ４', 'ステージ５', 'ボス'];
  
  // ジャンル内の獲得済みスター数を計算
  let earnedStars = 0;
  if (genreData) {
    Object.values(genreData).forEach(stage => {
      if (stage.clear) earnedStars++;
      if (stage.perfect) earnedStars++;
      if (stage.speed) earnedStars++;
    });
  }
  const totalStars = stages.length * 3;

  return (
    <div className={styles["star-genre-section"]}>
      <div className={styles["star-genre-header"]}>
        <div className={styles["star-genre-title"]}>{genreName}</div>
        <div className={styles["star-genre-big-star"]}>
          <StarIcon className={styles["star-icon-large"]} isEarned={earnedStars === totalStars} />
        </div>
        <div className={styles["star-genre-score"]}>
          {earnedStars}個/{totalStars}個
        </div>
      </div>
      <div className={styles["star-stage-grid"]}>
        {stages.map((stage) => (
          <StageCard 
            key={stage} 
            title={stage} 
            // 第3層（詳細情報）をStageCardに渡す
            stageData={genreData ? genreData[stage] : null} 
          />
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 【第1層: ジャンル一覧（全体データ）】を管理するページ
// ==========================================
export default function StarStatusPage() {
  const [saveData, setSaveData] = useState({});

  useEffect(() => {
    // 画面表示時にブラウザの保存領域（localStorage）からデータを取得
    const saved = localStorage.getItem("quizSaveData");
    
    if (saved) {
      setSaveData(JSON.parse(saved));
    } else {
      // ※まだセーブデータがない場合のテスト用ダミーデータ
      const dummyData = {
        "ジャンル１": {
          "ステージ１": { clear: true, perfect: false, speed: true },
          "ステージ２": { clear: true, perfect: true, speed: false },
        },
        "ジャンル２": {
          "ステージ１": { clear: true, perfect: false, speed: false }
        }
      };
      setSaveData(dummyData);
    }
  }, []);

  return (
    <div className={styles["star-container"]}>
      
      <div className={styles["star-tabs"]}>
        {/* Linkコンポーネントを使って画面遷移を実装 */}
        <Link href="/">
          <button className={styles["star-tab-button"]}>戻る</button>
        </Link>
        <Link href="/user">
          <button className={styles["star-tab-button"]}>ユーザーページ</button>
        </Link>
        <button className={`${styles["star-tab-button"]} ${styles["star-tab-button-active"]}`}>
          スター獲得状況
        </button>
      </div>

      {/* 第2層（ステージ一覧）をGenreSectionに渡す */}
      <GenreSection genreName="ジャンル１" genreData={saveData["ジャンル１"]} />
      <GenreSection genreName="ジャンル２" genreData={saveData["ジャンル２"]} />
      
    </div>
  );
}