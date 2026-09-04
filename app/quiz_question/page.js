"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "../context/GameContext";
import styles from "./page.module.css";

function QuizQuestionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryGenreId = searchParams.get("genreId");
  const queryStageId = searchParams.get("stageId");
  const queryDifficulty = searchParams.get("difficulty") || searchParams.get("Difficulty");

  const { 
    game, 
    fetchQuizzes,
    updateElapsedTime, 
    setCurrentQuiz, 
    setSelectedAnswer,
    setHp
  } = useGame();

  const [genres, setGenres] = useState([]);
  const [stageInfo, setStageInfo] = useState(null);

  const rawGenreId = queryGenreId ?? game.genreId;
  const currentGenreId = rawGenreId !== undefined && rawGenreId !== null ? Number(rawGenreId) : 1;
  const currentStageNum = Number(queryStageId || game.stageId || 1);

  const isLastStage = currentGenreId === 0 || currentStageNum === 7;

  const currentDifficulty = Number(queryDifficulty || game.difficulty || 1);
  const isHardMode = currentDifficulty === 2 || game.difficulty === "hard" || game.mode === "hard" || !!game.isHard;
  const difficultyLabel = isHardMode ? "ハード" : "ノーマル";

  const isBossStage = stageInfo?.isBoss || currentStageNum === 6;

  const maxHp = isHardMode
    ? (stageInfo?.hardHp || (isBossStage ? 7 : 3))
    : (stageInfo?.normalHp || (isBossStage ? 10 : 5));

  useEffect(() => {
    if (currentGenreId === undefined || currentGenreId === null || Number.isNaN(currentGenreId) || !currentStageNum) return;

    const isNoQuizzes = !game.quizzes || game.quizzes.length === 0;
    const isGameOverOrFinished = game.hp <= 0 || game.isFinished;
    const isStageChanged =
      (game.genreId !== undefined && Number(game.genreId) !== currentGenreId) ||
      (game.stageId !== undefined && Number(game.stageId) !== currentStageNum);

    if (isNoQuizzes || isGameOverOrFinished || isStageChanged) {
      fetchQuizzes(currentGenreId, currentStageNum, maxHp);
    }
  }, [
    currentGenreId,
    currentStageNum,
    game.quizzes,
    game.hp,
    game.isFinished,
    game.genreId,
    game.stageId,
    maxHp,
    fetchQuizzes,
  ]);

  useEffect(() => {
    if (stageInfo && game.currentQuestion === 1 && !game.isFinished && game.hp > 0) {
      if (game.hp !== maxHp && typeof setHp === "function") {
        setHp(maxHp);
      }
    }
  }, [stageInfo, maxHp, game.currentQuestion, game.isFinished, game.hp, setHp]);

  useEffect(() => {
    async function loadGenres() {
      if (game.genres && game.genres.length > 0) {
        setGenres(game.genres);
      } else {
        try {
          const res = await fetch("/api/genres");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.genres || []);
            setGenres(list);
          }
        } catch (e) {
          console.error("Genreデータの取得に失敗しました:", e);
        }
      }
    }
    loadGenres();
  }, [game.genres]);

  useEffect(() => {
    if (currentGenreId === undefined || currentGenreId === null || Number.isNaN(currentGenreId) || !currentStageNum) return;

    async function loadStageInfo() {
      try {
        const res = await fetch(`/api/stages?genreId=${currentGenreId}&stageId=${currentStageNum}`);
        if (res.ok) {
          const data = await res.json();
          const stagesList = data.stages || [];
          const currentStage = stagesList.find((s) => s.stageId === currentStageNum);
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

  useEffect(() => {
    const timer = setInterval(() => {
      updateElapsedTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [updateElapsedTime]);

  const quizIndex = game.currentQuestion > 0 ? game.currentQuestion - 1 : 0;
  const currentQuizData = game.quizzes && game.quizzes.length > 0 ? game.quizzes[quizIndex] : null;

  const [choices, setChoices] = useState([]);

  const formattedTime = useMemo(() => {
    const minute = String(Math.floor(game.elapsedTime / 60)).padStart(2, "0");
    const second = String(game.elapsedTime % 60).padStart(2, "0");
    return `${minute}:${second}`;
  }, [game.elapsedTime]);

  const formattedSpeedLimit = useMemo(() => {
    const limitSec = isHardMode
      ? (stageInfo?.hardSpeedLimit || (isBossStage ? 250 : 100))
      : (stageInfo?.normalSpeedLimit || (isBossStage ? 500 : 200));

    if (!limitSec) return null;
    const minute = String(Math.floor(limitSec / 60)).padStart(2, "0");
    const second = String(limitSec % 60).padStart(2, "0");
    return `${minute}:${second}`;
  }, [stageInfo, isBossStage, isHardMode]);

  useEffect(() => {
    if (currentQuizData) {
      const copy = currentQuizData.choices.map((text, index) => ({ text, originalIndex: index }));
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      setChoices(copy);
    }
  }, [currentQuizData]);

  const explanations = useMemo(() => {
    if (!currentQuizData || choices.length === 0) return [];
    
    return choices.map((choice) => ({
      choice: choice.text,
      explanation: currentQuizData.explanation[choice.originalIndex]
    }));
  }, [choices, currentQuizData]);

  const choiceClick = (choice) => {
    if (!currentQuizData) return;

    setCurrentQuiz({
      quizId: currentQuizData.quizId,
      genreId: currentGenreId,
      stageId: currentStageNum,
      question: currentQuizData.quizText,
      answer: currentQuizData.choices[currentQuizData.answer], 
      explanations 
    }, choices.map(c => c.text));

    setSelectedAnswer(choice.text);
    
    router.push(`/quiz_answer?genreId=${currentGenreId}&stageId=${currentStageNum}&difficulty=${currentDifficulty}`);
  };

  if (!currentQuizData) {
    return (
      <div className={styles.loadingWrapper}>
        <h2>問題を読み込み中...</h2>
      </div>
    );
  }

  const displayHp = game.hp <= 0 ? maxHp : game.hp;

  const allGenres = genres.length > 0 ? genres : (game.genres || []);
  const foundGenreObj = allGenres.find(
    (g) => Number(g.genreId ?? g.id) === Number(currentGenreId)
  );
  const genreName = isLastStage 
    ? "全ジャンル" 
    : (foundGenreObj?.genreName || foundGenreObj?.name || "");

  return (
    <div className={styles.mainCard}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <div className={styles.blankArea}></div>
        <div className={styles.blankArea}></div>

        <div className={styles.quiz_now}>
          {genreName && (
            <div style={{ fontSize: "0.8rem", opacity: 0.85 }}>
              {genreName}
            </div>
          )}
          {currentStageNum && (
            <div style={{ fontSize: "0.8rem", fontWeight: "bold", opacity: 0.85, marginBottom: "2px", color: isBossStage ? "#d63031" : "inherit" }}>
              {isLastStage ? "ラストステージ" : (isBossStage ? "ボスステージ" : `ステージ ${currentStageNum}`)}
            </div>
          )}
          <div>
            {game.currentQuestion}問 / {game.totalQuestion || game.quizzes.length}問
          </div>
        </div>

        <div className={styles.quiz_HP}>
          <div style={{ 
            fontSize: "0.75rem", 
            fontWeight: "bold", 
            color: isHardMode ? "#d63031" : "#00b894",
            marginBottom: "1px"
          }}>
            {difficultyLabel}
          </div>
          <div style={{ color: displayHp <= 1 ? "#ff4757" : "#000" }}>
            HP {displayHp} / {maxHp}
          </div>
        </div>

        <div className={styles.quiz_Time}>
          <div className={styles.timerTitle}>経過時間</div>
          <div className={styles.timer}>
            {formattedTime}
            {formattedSpeedLimit && (
              <span style={{ fontSize: "0.75rem", opacity: 0.7, marginLeft: "4px" }}>
                / {formattedSpeedLimit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 問題文 */}
      <div className={styles.quiz_text}>
        {currentQuizData.quizText}
      </div>

      {/* 選択肢ボタン */}
      <div className={styles.choiceArea}>
        {choices.map((choice, index) => (
          <button
            key={index}
            className={styles.choiceButton}
            onClick={() => choiceClick(choice)}
          >
            <div className={styles.choiceNumber}>
              {index + 1}
            </div>
            
            <div className={styles.quiz_choices}>
              {choice.text}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function QuizQuestion() {
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
          <h2>問題を読み込み中...</h2>
        </div>
      }>
        <QuizQuestionContent />
      </Suspense>
    </main>
  );
}