'use client';

import React, { useMemo, useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGame } from '../context/GameContext'; 
import styles from './page.module.css';

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { game } = useGame(); 

  //=========================================
  // URLパラメータの取得 & 難易度・ステージ特定
  //=========================================
  const queryGenreId = searchParams.get("genreId");
  const queryStageId = searchParams.get("stageId");
  const queryDifficulty = searchParams.get("difficulty") || searchParams.get("Difficulty");

  const currentGenreId = Number(queryGenreId || game?.genreId || 1);
  const currentStageNum = Number(queryStageId || game?.stageId || 1);

  // 難易度判定 (1: Normal, 2: Hard)
  const parsedDiff = Number(queryDifficulty);
  const currentDifficulty = !isNaN(parsedDiff) && parsedDiff > 0 ? parsedDiff : Number(game?.difficulty || 1);
  const isHardMode = currentDifficulty === 2 || game?.difficulty === "hard" || game?.mode === "hard" || !!game?.isHard;

  const [stageInfo, setStageInfo] = useState(null);
  const isBossStage = stageInfo?.isBoss || currentStageNum === 6;

  // ゲームデータの取得
  const hp = game?.hp ?? 0;
  const elapsedTime = game?.elapsedTime ?? 0;

  //=========================================
  // 【QuizAnswer側のコード変更なしで正答数を安全計算】
  //=========================================
  const calculatedCorrectCount = useMemo(() => {
    if (!game || !game.quizzes || game.quizzes.length === 0) return 0;

    let count = 0;
    const userAnswers = game.userAnswers || {};

    game.quizzes.forEach((quiz) => {
      // ユーザーが選択した回答テキストを取得 (キーの数値/文字列双方に対応)
      let userSelected = userAnswers[quiz.quizId] ?? userAnswers[String(quiz.quizId)];
      
      if ((userSelected === undefined || userSelected === null) && game.currentQuiz?.quizId === quiz.quizId) {
        userSelected = game.selectedAnswer;
      }

      if (userSelected !== undefined && userSelected !== null && userSelected !== "") {
        // QuizModel構造: answer はインデックス(Number)として保持
        let correctAnswerText = "";
        if (Array.isArray(quiz.choices) && typeof quiz.answer === "number") {
          correctAnswerText = quiz.choices[quiz.answer];
        } else {
          correctAnswerText = quiz.answer;
        }

        if (String(userSelected).trim() === String(correctAnswerText).trim()) {
          count += 1;
        }
      }
    });

    return count;
  }, [game]);

  // 総問題数
  const totalQuestionsCount = useMemo(() => {
    return game?.totalQuestion || (game?.quizzes ? game.quizzes.length : 10);
  }, [game]);

  // Stage情報の取得 API
  useEffect(() => {
    if (!currentGenreId || !currentStageNum) return;

    async function loadStageInfo() {
      try {
        const res = await fetch(`/api/stages?genreId=${currentGenreId}&stageId=${currentStageNum}`);
        if (res.ok) {
          const data = await res.json();
          const stagesList = data.stages || [];
          const currentStage = stagesList.find((s) => Number(s.stageId) === currentStageNum);
          if (currentStage) {
            setStageInfo(currentStage);
          }
        }
      } catch (e) {
        console.error("Stageデータの取得に失敗しました:", e);
      }
    }
    loadStageInfo();
  }, [currentGenreId, currentStageNum]);

  // スピード目標秒数
  const targetSpeedLimit = useMemo(() => {
    if (isHardMode) {
      return stageInfo?.hardSpeedLimit || (isBossStage ? 250 : 100);
    }
    return stageInfo?.normalSpeedLimit || (isBossStage ? 500 : 200);
  }, [stageInfo, isHardMode, isBossStage]);

  // mm:ss フォーマット
  const formattedTime = useMemo(() => {
    const minute = String(Math.floor(elapsedTime / 60)).padStart(2, "0");
    const second = String(Math.floor(elapsedTime % 60)).padStart(2, "0");
    return `${minute}:${second}`;
  }, [elapsedTime]);

  //=========================================
  // 【スター判定処理】
  //=========================================
  const starsStatus = useMemo(() => {
    if (!game) return { clear: false, allCorrect: false, speedClear: false };

    const currentRunClear = hp > 0;
    const currentRunPerfect = calculatedCorrectCount === totalQuestionsCount && totalQuestionsCount > 0;
    const currentRunSpeed = hp > 0 && elapsedTime <= targetSpeedLimit;

    return {
      clear: currentRunClear,
      allCorrect: currentRunPerfect,
      speedClear: currentRunSpeed
    };
  }, [game, hp, elapsedTime, calculatedCorrectCount, totalQuestionsCount, targetSpeedLimit]);

  //=========================================
  // 【★ UserModel へのスター獲得保存処理】
  //=========================================
  const lastSavedRef = useRef("");

  useEffect(() => {
    if (!currentGenreId || !currentStageNum) return;

    // 現在のステータスキーを生成（重複保存防止）
    const statusKey = `${currentGenreId}_${currentStageNum}_${starsStatus.clear}_${starsStatus.allCorrect}_${starsStatus.speedClear}_${calculatedCorrectCount}_${totalQuestionsCount}`;
    if (lastSavedRef.current === statusKey) return;

    async function saveStageResultToUser() {
      try {
        const userId = game?.user?.userId || 1; // ログインユーザーID（デフォルト: 1）

        const res = await fetch("/api/users/stage-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            genreId: currentGenreId,
            stageId: currentStageNum,
            clear: starsStatus.clear,
            perfect: starsStatus.allCorrect,
            speed: starsStatus.speedClear,
            correct: calculatedCorrectCount,
            total: totalQuestionsCount,
          }),
        });

        if (res.ok) {
          lastSavedRef.current = statusKey;
          console.log("UserModel のステージ獲得スター情報を更新しました。");
        }
      } catch (e) {
        console.error("UserModel の保存に失敗しました:", e);
      }
    }

    saveStageResultToUser();
  }, [currentGenreId, currentStageNum, starsStatus, calculatedCorrectCount, totalQuestionsCount, game?.user?.userId]);

  const handleReview = () => {
    router.push(`/quiz_review?genreId=${currentGenreId}&stageId=${currentStageNum}&difficulty=${currentDifficulty}`);
  };

  const handleSelectStage = () => {
    router.push(`/quiz_stageSelection?genreId=${currentGenreId}`); 
  };

  if (!game) {
    return (
      <div className={styles.loadingWrapper}>
        <h2>データを読み込み中...</h2>
      </div>
    );
  }

  return (
    <div className={styles.mainCard}>
      {/* ヘッダー情報 */}
      <header className={styles.resultHeader}>
        <div className={styles.headerSpacer}></div>
        <div className={`${styles.headerBox} ${styles.stageName}`}>結果発表</div>
        <div className={styles.headerBox}>残HP: {hp}</div>
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
            <span className={styles.starLabel}>{targetSpeedLimit}秒以内<br />スピード</span>
          </div>
        </div>

        {/* 正答数表示 */}
        <div className={styles.scoreBox}>
          {totalQuestionsCount}問中{calculatedCorrectCount}問正解
        </div>

        {/* マーキング問題確認ボタン */}
        <button className={styles.reviewButton} onClick={handleReview}>
          問題を復習する
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

export default function ResultPage() {
  return (
    <main className={styles.container}>
      {/* 背景要素 */}
      <div className={styles.sky}></div>
      <div className={styles.cloud1}></div>
      <div className={styles.cloud2}></div>
      <div className={styles.cloud3}></div>
      <div className={styles.mountain}></div>
      <div className={styles.forest}></div>
      <div className={styles.ground}></div>

      <Suspense fallback={
        <div className={styles.loadingWrapper}>
          <h2>データを読み込み中...</h2>
        </div>
      }>
        <ResultContent />
      </Suspense>
    </main>
  );
}