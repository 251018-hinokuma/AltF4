'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../context/GameContext'; 
import styles from './page.module.css';

export default function ResultPage() {
  const router = useRouter();
  const { game } = useGame(); 

  // --- Debug Overrides (Keep these for testing changes instantly) ---
  const [mockHp, setMockHp] = useState(3);
  const [mockTime, setMockTime] = useState(30);
  const [mockCorrectCount, setMockCorrectCount] = useState(0);

  useEffect(() => {
    if (game) {
      setMockHp(game.hp ?? 3);
      setMockTime(game.elapsedTime ?? 0);
      // Read current stage run answers from resultQuizIdsList
      setMockCorrectCount(game.user?.resultQuizIdsList?.length || 0);
    }
  }, [game]);

  const formattedTime = useMemo(() => {
    const minute = String(Math.floor(mockTime / 60)).padStart(2, "0");
    const second = String(mockTime % 60).padStart(2, "0");
    return `${minute}:${second}`;
  }, [mockTime]);

  // Target speed pulled from your StageModel properties
  const TARGET_SPEED_SECONDS = game?.currentStage?.normalSpeedLimittime || 45;

  // ⭐ LEADER'S STAR CONDITIONS LOGIC ⭐
  const starsStatus = useMemo(() => {
    if (!game || !game.user) {
      return { clear: false, allCorrect: false, speedClear: false };
    }

    const user = game.user;
    const totalQuestion = game.totalQuestion || 10;

    // Check current run status
    const currentRunClear = mockHp > 0;
    const currentRunPerfect = mockCorrectCount === totalQuestion && totalQuestion > 0;
    const currentRunSpeed = mockHp > 0 && mockTime <= TARGET_SPEED_SECONDS;

    // Check past history in the triple-nested stagesList structure to see if they've earned the stars before
    let hasPastClear = false;
    let hasPastPerfect = false;
    let hasPastSpeed = false;

    // Scan through all genres in the user model
    const genres = Object.keys(user.stagesList || {});
    genres.forEach((genreKey) => {
      if (Array.isArray(user.stagesList[genreKey])) {
        user.stagesList[genreKey].forEach((stage) => {
          // If the stage matches our active stage, check historical flags
          if (stage.stageId === game.currentStageId) {
            if (stage.clear) hasPastClear = true;
            if (stage.perfect) hasPastPerfect = true;
            if (stage.speed) hasPastSpeed = true;
          }
        });
      }
    });

    return {
      // Star 1 turns solid if cleared now OR if already cleared historically
      clear: currentRunClear || hasPastClear, 
      
      // Star 2 turns solid if perfect score now OR achieved previously
      allCorrect: currentRunPerfect || hasPastPerfect, 
      
      // Star 3 turns solid if speed challenge beaten now OR previously
      speedClear: currentRunSpeed || hasPastSpeed 
    };
  }, [game, mockHp, mockTime, mockCorrectCount, TARGET_SPEED_SECONDS]);

  const handleReview = () => {
    router.push('/quiz_review');
  };

  const handleSelectStage = () => {
    router.push('/quiz_stageSelection'); 
  };

  if (!game) {
    return <div className={styles.resultContainer}>データを読み込み中...</div>;
  }

  return (
    <div className={styles.resultContainer}>
      
      {/* Debugger Tool */}
      <div style={{ backgroundColor: '#f9f9f9', borderBottom: '3px dashed #333333', padding: '15px', fontSize: '13px', fontFamily: 'monospace' }}>
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
          <label><strong>HP:</strong> <input type="range" min="0" max="3" value={mockHp} onChange={(e) => setMockHp(Number(e.target.value))} /></label>
          <label><strong>Time:</strong> <input type="range" min="0" max="120" value={mockTime} onChange={(e) => setMockTime(Number(e.target.value))} /></label>
          <label><strong>Correct Counter:</strong> <input type="range" min="0" max={game.totalQuestion || 10} value={mockCorrectCount} onChange={(e) => setMockCorrectCount(Number(e.target.value))} /></label>
        </div>
      </div>

      <header className={styles.resultHeader}>
        <div className={styles.headerSpacer}></div>
        <div className={`${styles.headerBox} ${styles.stageName}`}>結果発表</div>
        <div className={styles.headerBox}>残HP: {mockHp}</div>
        <div className={styles.timeBox}>
          <div className={styles.timeTitle}>経過時間</div>
          <div className={styles.timeValue}>{formattedTime}</div>
        </div>
      </header>

      <main className={styles.resultMain}>
        {/* Render Star items with dynamic activation classes */}
        <div className={styles.starsContainer}>
          <div className={`${styles.starItem} ${starsStatus.clear ? styles.achieved : ''}`}>
            <span className={styles.starIcon}>★</span>
            <span className={styles.starLabel}>クリア</span>
          </div>
          <div className={`${styles.starItem} ${starsStatus.allCorrect ? styles.achieved : ''}`}>
            <span className={styles.starIcon}>★</span>
            <span className={styles.starLabel}>全問正解</span>
          </div>
          <div className={`${styles.starItem} ${starsStatus.speedClear ? styles.achieved : ''}`}>
            <span className={styles.starIcon}>★</span>
            <span className={styles.starLabel}>{TARGET_SPEED_SECONDS}秒以内<br />スピード</span>
          </div>
        </div>

        <div className={styles.scoreBox}>
          {game.totalQuestion || 10}問中{mockCorrectCount}問正解
        </div>

        {/* Reads marked quizzes using exact key: markingQuizIdsList */}
        <button className={styles.reviewButton} onClick={handleReview}>
          問題を復習する ({game.user?.markingQuizIdsList?.length || 0}問マーク中)
        </button>
      </main>

      <footer className={styles.resultFooter}>
        <button className={styles.stageSelectButton} onClick={handleSelectStage}>ステージ選択へ</button>
      </footer>
    </div>
  );
}