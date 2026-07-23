'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// Import the CSS Module
import styles from './page.module.css';

export default function ResultPage() {
  const router = useRouter();

  // 画面に表示するデータ（〇や時間が書かれている部分）
  const [gameResult, setGameResult] = useState({
    stageName: 'ステージ〇',
    currentHp: 3,
    maxHp: 5,
    elapsedTime: '00:00',
    totalQuestions: 5,
    correctAnswers: 3,
    // 星の獲得状況（true: 獲得, false: 未獲得）
    stars: {
      clear: true,          // クリア
      allCorrect: false,    // 全問正解
      speedClear: true,     // 時間内スピードクリア
    },
    targetSpeedTime: '00:00', // スピードクリアの目標時間
  });

  // 各ボタンのクリック処理
  const handleReview = () => {
    router.push('/quiz_review'); // 問題を復習する画面への遷移（仮）
  };

  const handleSelectStage = () => {
    router.push('/quiz_stageSelection'); // ステージ選択画面への遷移（仮）
  };

  return (
    <div className={styles.resultContainer}>
      {/* 上部ステータスバー */}
      <header className={styles.resultHeader}>
        <div className={styles.headerSpacer}></div>
        <div className={`${styles.headerBox} ${styles.stageName}`}>{gameResult.stageName}</div>
        <div className={styles.headerBox}>
          HP {gameResult.currentHp} / {gameResult.maxHp}
        </div>
        <div className={styles.timeBox}>
          <div className={styles.timeTitle}>経過時間</div>
          <div className={styles.timeValue}>{gameResult.elapsedTime}</div>
        </div>
      </header>

      {/* メイン結果エリア */}
      <main className={styles.resultMain}>
        {/* 星評価エリア */}
        <div className={styles.starsContainer}>
          {/* 星1: クリア */}
          <div className={`${styles.starItem} ${gameResult.stars.clear ? styles.achieved : ''}`}>
            <span className={styles.starIcon}>★</span>
            <span className={styles.starLabel}>クリア</span>
          </div>

          {/* 星2: 全問正解 */}
          <div className={`${styles.starItem} ${gameResult.stars.allCorrect ? styles.achieved : ''}`}>
            <span className={styles.starIcon}>★</span>
            <span className={styles.starLabel}>全問正解</span>
          </div>

          {/* 星3: スピード */}
          <div className={`${styles.starItem} ${gameResult.stars.speedClear ? styles.achieved : ''}`}>
            <span className={styles.starIcon}>★</span>
            <span className={styles.starLabel}>
              {gameResult.targetSpeedTime}以内<br />スピード
            </span>
          </div>
        </div>

        {/* 正解数表示エリア */}
        <div className={styles.scoreBox}>
          {gameResult.totalQuestions}問中{gameResult.correctAnswers}問正解
        </div>

        {/* 問題を復習するボタン */}
        <button className={styles.reviewButton} onClick={handleReview}>
          問題を復習する
        </button>
      </main>

      {/* 下部ナビゲーション */}
      <footer className={styles.resultFooter}>
        <button className={styles.stageSelectButton} onClick={handleSelectStage}>
          ステージ選択へ
        </button>
      </footer>
    </div>
  );
}