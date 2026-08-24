'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGame } from '../context/GameContext'; 
import styles from './page.module.css';

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { game } = useGame(); 

  // URLパラメータからコンテキストのフォールバック値を読込
  const queryGenreId = searchParams.get("genreId");
  const queryStageId = searchParams.get("stageId");
  const queryDifficulty = searchParams.get("difficulty");

  // --- デバッグ用オーバーライド状態 ---
  const [mockHp, setMockHp] = useState(3);
  const [mockTime, setMockTime] = useState(30);
  const [mockCorrectCount, setMockCorrectCount] = useState(0);

  // 1. 【回答数・正解数の同期】 QuizAnswer 経由で記録されたデータの安全な参照
  useEffect(() => {
    if (game) {
      setMockHp(game.hp ?? 3);
      setMockTime(game.elapsedTime ?? 0);

      // QuizAnswerから追加された resultQuizIds または resultQuizIdsList を参照
      const user = game.user || {};
      const resultsArray = user.resultQuizIdsList || user.resultQuizIds || [];
      
      // 正解のみを管理する配列(correctQuizIds)があればそれを優先、なければ記録された結果数を参照
      const correctArray = user.correctQuizIds || resultsArray;
      setMockCorrectCount(Array.isArray(correctArray) ? correctArray.length : 0);
    }
  }, [game]);

  // 2. 経過時間フォーマット
  const formattedTime = useMemo(() => {
    const minute = String(Math.floor(mockTime / 60)).padStart(2, "0");
    const second = String(mockTime % 60).padStart(2, "0");
    return `${minute}:${second}`;
  }, [mockTime]);

  // 3. 総問題数の算出
  const totalQuestionsCount = useMemo(() => {
    return game?.totalQuestion || (game?.quizzes ? game.quizzes.length : 10);
  }, [game]);

  // 目標クリア時間（StageModel または デフォルト45秒）
  const TARGET_SPEED_SECONDS = game?.currentStage?.normalSpeedLimittime || 45;

  // 4. 星獲得条件判定
  const starsStatus = useMemo(() => {
    if (!game) return { clear: false, allCorrect: false, speedClear: false };

    const currentRunClear = mockHp > 0;
    const currentRunPerfect = mockCorrectCount === totalQuestionsCount && totalQuestionsCount > 0;
    const currentRunSpeed = mockHp > 0 && mockTime <= TARGET_SPEED_SECONDS;

    return {
      clear: currentRunClear,
      allCorrect: currentRunPerfect,
      speedClear: currentRunSpeed
    };
  }, [game, mockHp, mockTime, mockCorrectCount, totalQuestionsCount, TARGET_SPEED_SECONDS]);

  const handleReview = () => {
    router.push(`/quiz_review?genreId=${queryGenreId || ''}&stageId=${queryStageId || ''}`);
  };

  const handleSelectStage = () => {
    router.push('/quiz_stageSelection'); 
  };

  if (!game) {
    return <div className={styles.resultContainer}>データを読み込み中...</div>;
  }

  return (
    <div className={styles.resultContainer}>
      
      {/* 🛠️ デバッグ・テスト用コントローラー 🛠️ */}
      <div style={{ backgroundColor: '#f9f9f9', borderBottom: '3px dashed #333333', padding: '15px', fontSize: '13px', fontFamily: 'monospace' }}>
        <strong style={{ color: '#d32f2f' }}>[RESULT TESTER] QuizAnswer から送られたデータを操作・検証:</strong>
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
          <label><strong>HP (hp):</strong> <input type="range" min="0" max="10" value={mockHp} onChange={(e) => setMockHp(Number(e.target.value))} /></label>
          <label><strong>Time (elapsedTime):</strong> <input type="range" min="0" max="300" value={mockTime} onChange={(e) => setMockTime(Number(e.target.value))} /></label>
          <label><strong>Correct Count (正解数):</strong> <input type="range" min="0" max={totalQuestionsCount} value={mockCorrectCount} onChange={(e) => setMockCorrectCount(Number(e.target.value))} /></label>
        </div>
      </div>

      {/* ヘッダー情報 */}
      <header className={styles.resultHeader}>
        <div className={styles.headerSpacer}></div>
        <div className={`${styles.headerBox} ${styles.stageName}`}>結果発表</div>
        <div className={styles.headerBox}>残HP: {mockHp}</div>
        <div className={styles.timeBox}>
          <div className={styles.timeTitle}>経過時間</div>
          <div className={styles.timeValue}>{formattedTime}</div>
        </div>
      </header>

      {/* メイン表示エリア */}
      <main className={styles.resultMain}>
        {/* 星バッジ獲得状況 */}
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

        {/* 正答数表示 (QuizAnswerの実行結果を反映) */}
        <div className={styles.scoreBox}>
          {totalQuestionsCount}問中{mockCorrectCount}問正解
        </div>

        {/* マーキング問題確認ボタン */}
        <button className={styles.reviewButton} onClick={handleReview}>
          問題を復習する ({game.user?.markingQuizIdsList?.length || game.user?.markingQuizIds?.length || 0}問マーク中)
        </button>
      </main>

      {/* フッターナビゲーション */}
      <footer className={styles.resultFooter}>
        <button className={styles.stageSelectButton} onClick={handleSelectStage}>
          ステージ選択へ
        </button>
      </footer>
    </div>
  );
}