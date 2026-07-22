"use client";

import React from 'react';

// 星型のアイコン（SVG）をコンポーネント化
const StarIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ---------------------------------------------------
// 1. 各ステージのマスを表現するコンポーネント
// ---------------------------------------------------
const StageCard = ({ title }) => {
  const starTypes = ['クリア', '全問正解', 'スピード'];

  return (
    <div className="star-stage-card">
      {/* ステージ名 */}
      <div className="star-stage-title">
        {title}
      </div>
      {/* 獲得スター一覧 */}
      <div className="star-star-list">
        {starTypes.map((label) => (
          <div key={label} className="star-star-item">
            <StarIcon className="star-icon-small" />
            <span className="star-star-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------
// 2. ジャンルごとのまとまりを表現するコンポーネント
// ---------------------------------------------------
const GenreSection = ({ genreName, currentStars, totalStars }) => {
  const stages = ['ステージ１', 'ステージ２', 'ステージ３', 'ステージ４', 'ステージ５', 'ボス'];

  return (
    <div className="star-genre-section">
      {/* ジャンルヘッダー部分 */}
      <div className="star-genre-header">
        {/* ジャンル名 (中央配置) */}
        <div className="star-genre-title">
          {genreName}
        </div>
        {/* 大きな星アイコン */}
        <div className="star-genre-big-star">
          <StarIcon className="star-icon-large" />
        </div>
        {/* 獲得数 */}
        <div className="star-genre-score">
          {currentStars}個/{totalStars}個
        </div>
      </div>

      {/* ステージのグリッド (6列) */}
      <div className="star-stage-grid">
        {stages.map((stage) => (
          <StageCard key={stage} title={stage} />
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------
// 3. メインページ
// ---------------------------------------------------
export default function StarStatusPage() {
  return (
    <div className="star-container">
      
      {/* トップナビゲーション（タブ） */}
      <div className="star-tabs">
        <button className="star-tab-button">
          戻る
        </button>
        <button className="star-tab-button">
          ユーザーページ
        </button>
        <button className="star-tab-button star-tab-button-active">
          スター獲得状況
        </button>
      </div>

      {/* メインコンテンツ（ジャンルごとの一覧） */}
      <GenreSection genreName="ジャンル１" currentStars="３０" totalStars="○" />
      <GenreSection genreName="ジャンル２" currentStars="３０" totalStars="○" />
      
    </div>
  );
}