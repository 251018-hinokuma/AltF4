'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// Import the CSS Module
import styles from './page.module.css';

export default function ResultPage() {
  const router = useRouter();

  // Mock data representing the stage results
  const [gameResult, setGameResult] = useState({
    stageName: 'Stage 1',
    currentHp: 3,
    maxHp: 5,
    elapsedTime: '02:45',
    totalQuestions: 10,
    correctAnswers: 8,
    // Star achievements (true: unlocked, false: locked)
    stars: {
      clear: true,          // Cleared the stage
      allCorrect: false,    // Perfect score
      speedClear: true,     // Beat the time limit
    },
    targetSpeedTime: '03:00', // Target time for speed run
  });

  // Button click handlers
  const handleReview = () => {
    router.push('/review');
  };

  const handleSelectStage = () => {
    router.push('/stage-selection');
  };

  return (
    <div className={styles.resultContainer}>
      {/* Top Status Bar */}
      <header className={styles.resultHeader}>
        <div className={styles.headerSpacer}></div>
        <div className={`${styles.headerBox} ${styles.stageName}`}>{gameResult.stageName}</div>
        <div className={styles.headerBox}>
          HP {gameResult.currentHp} / {gameResult.maxHp}
        </div>
        <div className={styles.timeBox}>
          <div className={styles.timeTitle}>Elapsed Time</div>
          <div className={styles.timeValue}>{gameResult.elapsedTime}</div>
        </div>
      </header>

      {/* Main Results Content */}
      <main className={styles.resultMain}>
        {/* Stars Container */}
        <div className={styles.starsContainer}>
          {/* Star 1: Clear */}
          <div className={`${styles.starItem} ${gameResult.stars.clear ? styles.achieved : ''}`}>
            <span className={styles.starIcon}>★</span>
            <span className={styles.starLabel}>Cleared</span>
          </div>

          {/* Star 2: All Correct */}
          <div className={`${styles.starItem} ${gameResult.stars.allCorrect ? styles.achieved : ''}`}>
            <span className={styles.starIcon}>★</span>
            <span className={styles.starLabel}>All Correct</span>
          </div>

          {/* Star 3: Speed */}
          <div className={`${styles.starItem} ${gameResult.stars.speedClear ? styles.achieved : ''}`}>
            <span className={styles.starIcon}>★</span>
            <span className={styles.starLabel}>
              Under {gameResult.targetSpeedTime}<br />Speed
            </span>
          </div>
        </div>

        {/* Score Box */}
        <div className={styles.scoreBox}>
          {gameResult.correctAnswers} / {gameResult.totalQuestions} Correct
        </div>

        {/* Review Button */}
        <button className={styles.reviewButton} onClick={handleReview}>
          Review Questions
        </button>
      </main>

      {/* Footer Navigation */}
      <footer className={styles.resultFooter}>
        <button className={styles.stageSelectButton} onClick={handleSelectStage}>
          To Stage Select
        </button>
      </footer>
    </div>
  );
}